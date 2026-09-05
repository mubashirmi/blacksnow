import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import logger from '../../../../lib/logger';

const stripeSecretKey = process.env.NEXT_PRIVATE_STRIPE_SECRET;

if (!stripeSecretKey) {
    throw new Error('NEXT_PRIVATE_STRIPE_SECRET is not configured');
}

const stripe = require('stripe')(stripeSecretKey);
const sgMail = require('@sendgrid/mail');

const sendGridApiKey = process.env.SENDGRID_API_KEY;
const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL;
const sendGridFromName = process.env.SENDGRID_FROM_NAME || 'Black Snow Holdings';

const ADMIN_NOTIFICATION_EMAIL = 'muhammad2133730@gmail.com';

const BRAND_NAME = 'Black Snow Holdings';
const BRAND_BLUE = '#1557FF';
const BRAND_DARK = '#000000';
const BRAND_WHITE = '#FFFFFF';
const BRAND_BACKGROUND = '#f4f6fb';
const BRAND_TEXT = '#111827';
const BRAND_SECONDARY_TEXT = '#4b5563';
const BRAND_MUTED_TEXT = '#6b7280';
const BRAND_BORDER = '#e5e7eb';

const LOGO_CONTENT_ID = 'blacksnow-logo';

if (sendGridApiKey) {
    sgMail.setApiKey(sendGridApiKey);
}

type SubscriptionUser = {
    id: number;
    email: string;
    phone: string | null;
    firstName: string;
    lastName: string;
};

type ProductInfo = {
    name: string;
    description: string | null;
    quantity: number;
    amount: string | null;
    billingInterval: string | null;
};

function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg') {
        return 'image/jpeg';
    }

    if (ext === '.webp') {
        return 'image/webp';
    }

    if (ext === '.svg') {
        return 'image/svg+xml';
    }

    return 'image/png';
}

function getLogoAttachment() {
    const logoPath = path.join(process.cwd(), 'public', 'email', 'blacksnow-logo.png');

    if (!fs.existsSync(logoPath)) {
        throw new Error(`Logo file not found at: ${logoPath}`);
    }

    return {
        content: fs.readFileSync(logoPath).toString('base64'),
        filename: 'blacksnow-logo.png',
        type: getMimeType(logoPath),
        disposition: 'inline',
        content_id: LOGO_CONTENT_ID,
    };
}

function formatStripeAmount(amount: unknown, currency: unknown): string | null {
    if (typeof amount !== 'number' || typeof currency !== 'string' || !currency) {
        return null;
    }

    try {
        const currencyCode = currency.toUpperCase();

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
        });

        const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;

        const divisor = Math.pow(10, fractionDigits);

        return formatter.format(amount / divisor);
    } catch {
        return `${amount} ${String(currency).toUpperCase()}`;
    }
}

function getProductInfo(session: any): ProductInfo[] {
    const lineItems = session?.line_items?.data;

    if (Array.isArray(lineItems) && lineItems.length > 0) {
        return lineItems.map((lineItem: any) => {
            const price = lineItem?.price;

            const stripeProduct = price?.product;

            const expandedProduct = stripeProduct && typeof stripeProduct === 'object' && !Array.isArray(stripeProduct) ? stripeProduct : null;

            const productName =
                expandedProduct?.name ||
                lineItem?.description ||
                session?.metadata?.productName ||
                session?.metadata?.product ||
                session?.metadata?.productType ||
                session?.metadata?.planName ||
                'Subscription';

            const productDescription = expandedProduct?.description || session?.metadata?.productDescription || null;

            const quantity = typeof lineItem?.quantity === 'number' ? lineItem.quantity : 1;

            const currency = lineItem?.currency || price?.currency || session?.currency;

            const amount = formatStripeAmount(lineItem?.amount_total, currency) || formatStripeAmount(price?.unit_amount, currency);

            let billingInterval: string | null = null;

            if (price?.recurring?.interval) {
                const interval = String(price.recurring.interval);

                const intervalCount = typeof price.recurring.interval_count === 'number' ? price.recurring.interval_count : 1;

                billingInterval = intervalCount > 1 ? `Every ${intervalCount} ${interval}s` : `Every ${interval}`;
            }

            return {
                name: String(productName),

                description: productDescription ? String(productDescription) : null,

                quantity,
                amount,
                billingInterval,
            };
        });
    }

    const fallbackName =
        session?.metadata?.productName || session?.metadata?.product || session?.metadata?.productType || session?.metadata?.planName || 'Subscription';

    return [
        {
            name: String(fallbackName),

            description: session?.metadata?.productDescription ? String(session.metadata.productDescription) : null,

            quantity: 1,

            amount: formatStripeAmount(session?.amount_total, session?.currency),

            billingInterval:
                typeof session?.metadata?.billingInterval === 'string'
                    ? session.metadata.billingInterval
                    : typeof session?.metadata?.period === 'string'
                    ? session.metadata.period
                    : null,
        },
    ];
}

function getProductText(products: ProductInfo[]): string {
    return products
        .map((product, index) => {
            const lines = [`${index + 1}. ${product.name}`, `Quantity: ${product.quantity}`];

            if (product.description) {
                lines.push(`Description: ${product.description}`);
            }

            if (product.amount) {
                lines.push(`Amount: ${product.amount}`);
            }

            if (product.billingInterval) {
                lines.push(`Billing: ${product.billingInterval}`);
            }

            return lines.join('\n');
        })
        .join('\n\n');
}

function getProductHtml(products: ProductInfo[]): string {
    return products
        .map((product) => {
            return `
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        margin:0 0 16px 0;
                        background-color:#f8faff;
                        border:1px solid #dbe5ff;
                        border-radius:14px;
                    "
                >
                    <tr>
                        <td style="padding:20px;">
                            <div
                                style="
                                    margin:0 0 14px 0;
                                    color:${BRAND_BLUE};
                                    font-size:18px;
                                    line-height:1.4;
                                    font-weight:700;
                                "
                            >
                                ${escapeHtml(product.name)}
                            </div>

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                            >
                                <tr>
                                    <td
                                        style="
                                            padding:7px 0;
                                            color:${BRAND_MUTED_TEXT};
                                            font-size:14px;
                                        "
                                    >
                                        Quantity
                                    </td>

                                    <td
                                        style="
                                            padding:7px 0;
                                            color:${BRAND_TEXT};
                                            font-size:14px;
                                            font-weight:600;
                                            text-align:right;
                                        "
                                    >
                                        ${escapeHtml(product.quantity)}
                                    </td>
                                </tr>

                                ${
                                    product.description
                                        ? `
                                            <tr>
                                                <td
                                                    style="
                                                        padding:7px 0;
                                                        color:${BRAND_MUTED_TEXT};
                                                        font-size:14px;
                                                        vertical-align:top;
                                                    "
                                                >
                                                    Description
                                                </td>

                                                <td
                                                    style="
                                                        padding:7px 0;
                                                        color:${BRAND_TEXT};
                                                        font-size:14px;
                                                        text-align:right;
                                                        vertical-align:top;
                                                    "
                                                >
                                                    ${escapeHtml(product.description)}
                                                </td>
                                            </tr>
                                        `
                                        : ''
                                }

                                ${
                                    product.amount
                                        ? `
                                            <tr>
                                                <td
                                                    style="
                                                        padding:7px 0;
                                                        color:${BRAND_MUTED_TEXT};
                                                        font-size:14px;
                                                    "
                                                >
                                                    Amount
                                                </td>

                                                <td
                                                    style="
                                                        padding:7px 0;
                                                        color:${BRAND_TEXT};
                                                        font-size:15px;
                                                        font-weight:700;
                                                        text-align:right;
                                                    "
                                                >
                                                    ${escapeHtml(product.amount)}
                                                </td>
                                            </tr>
                                        `
                                        : ''
                                }

                                ${
                                    product.billingInterval
                                        ? `
                                            <tr>
                                                <td
                                                    style="
                                                        padding:7px 0;
                                                        color:${BRAND_MUTED_TEXT};
                                                        font-size:14px;
                                                    "
                                                >
                                                    Billing
                                                </td>

                                                <td
                                                    style="
                                                        padding:7px 0;
                                                        color:${BRAND_TEXT};
                                                        font-size:14px;
                                                        font-weight:600;
                                                        text-align:right;
                                                    "
                                                >
                                                    ${escapeHtml(product.billingInterval)}
                                                </td>
                                            </tr>
                                        `
                                        : ''
                                }
                            </table>
                        </td>
                    </tr>
                </table>
            `;
        })
        .join('');
}

function buildEmailHeader(subtitle: string): string {
    return `
        <tr>
            <td
                class="email-header"
                style="
                    background-color:${BRAND_DARK};
                    padding:34px 28px;
                    text-align:center;
                "
            >
                <img
                    src="cid:${LOGO_CONTENT_ID}"
                    alt="${BRAND_NAME}"
                    width="120"
                    style="
                        display:block;
                        margin:0 auto 18px auto;
                        max-width:120px;
                        height:auto;
                    "
                />

                <div
                    style="
                        color:${BRAND_WHITE};
                        font-size:24px;
                        font-weight:700;
                        letter-spacing:0.3px;
                    "
                >
                    ${BRAND_NAME}
                </div>

                <div
                    style="
                        color:#b9c7ff;
                        font-size:14px;
                        margin-top:8px;
                    "
                >
                    ${escapeHtml(subtitle)}
                </div>
            </td>
        </tr>
    `;
}

function buildEmailFooter(): string {
    return `
        <tr>
            <td
                class="email-footer"
                style="
                    padding:26px 32px 34px 32px;
                "
            >
                <div
                    style="
                        height:1px;
                        background-color:${BRAND_BORDER};
                        margin-bottom:22px;
                    "
                ></div>

                <p
                    style="
                        margin:0;
                        color:${BRAND_MUTED_TEXT};
                        font-size:13px;
                        line-height:1.7;
                        text-align:center;
                    "
                >
                    This is an automated email from
                    <strong
                        style="
                            color:${BRAND_TEXT};
                        "
                    >
                        ${BRAND_NAME}
                    </strong>.
                </p>

                <p
                    style="
                        margin:10px 0 0 0;
                        color:#9ca3af;
                        font-size:12px;
                        line-height:1.6;
                        text-align:center;
                    "
                >
                    Please do not reply to this email.
                </p>
            </td>
        </tr>
    `;
}

function buildUserDetailsHtml(user: SubscriptionUser): string {
    const phone = user.phone?.trim() || 'Not provided';

    return `
        <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
                margin:0 0 28px 0;
                background-color:#f9fafb;
                border:1px solid ${BRAND_BORDER};
                border-radius:14px;
            "
        >
            <tr>
                <td style="padding:18px 20px;">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tr>
                            <td
                                style="
                                    padding:7px 0;
                                    color:${BRAND_MUTED_TEXT};
                                    font-size:14px;
                                "
                            >
                                First Name
                            </td>

                            <td
                                style="
                                    padding:7px 0;
                                    color:${BRAND_TEXT};
                                    font-size:14px;
                                    font-weight:600;
                                    text-align:right;
                                "
                            >
                                ${escapeHtml(user.firstName)}
                            </td>
                        </tr>

                        <tr>
                            <td
                                style="
                                    padding:7px 0;
                                    color:${BRAND_MUTED_TEXT};
                                    font-size:14px;
                                "
                            >
                                Last Name
                            </td>

                            <td
                                style="
                                    padding:7px 0;
                                    color:${BRAND_TEXT};
                                    font-size:14px;
                                    font-weight:600;
                                    text-align:right;
                                "
                            >
                                ${escapeHtml(user.lastName)}
                            </td>
                        </tr>

                        <tr>
                            <td
                                style="
                                    padding:7px 0;
                                    color:${BRAND_MUTED_TEXT};
                                    font-size:14px;
                                "
                            >
                                Email
                            </td>

                            <td
                                style="
                                    padding:7px 0;
                                    color:${BRAND_TEXT};
                                    font-size:14px;
                                    font-weight:600;
                                    text-align:right;
                                    word-break:break-all;
                                "
                            >
                                ${escapeHtml(user.email)}
                            </td>
                        </tr>

                        <tr>
                            <td
                                style="
                                    padding:7px 0;
                                    color:${BRAND_MUTED_TEXT};
                                    font-size:14px;
                                "
                            >
                                Phone
                            </td>

                            <td
                                style="
                                    padding:7px 0;
                                    color:${BRAND_TEXT};
                                    font-size:14px;
                                    font-weight:600;
                                    text-align:right;
                                "
                            >
                                ${escapeHtml(phone)}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;
}

/**
 * Responsive CSS shared by customer/admin email.
 *
 * Mobile:
 * - removes OUTER page padding
 * - makes card edge-to-edge
 * - removes outer radius
 * - removes outer shadow
 *
 * Inner email content padding remains intact.
 */
function getResponsiveEmailCss(): string {
    return `
        <style type="text/css">
            body {
                margin: 0 !important;
                padding: 0 !important;
            }

            @media only screen and (max-width: 640px) {
                .email-shell {
                    padding: 0 !important;
                }

                .email-card {
                    width: 100% !important;
                    max-width: 100% !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                }
            }
        </style>
    `;
}

function buildCustomerEmailHtml({
    user,
    customerName,
    productHtml,
    paymentPeriod,
    paymentTotal,
}: {
    user: SubscriptionUser;
    customerName: string;
    productHtml: string;
    paymentPeriod: string | null;
    paymentTotal: string | null;
}): string {
    const userDetailsHtml = buildUserDetailsHtml(user);

    return `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />

        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        />

        <title>
            ${BRAND_NAME} Subscription Confirmation
        </title>

        ${getResponsiveEmailCss()}
    </head>

    <body
        style="
            margin:0;
            padding:0;
            background-color:${BRAND_BACKGROUND};
            font-family:Arial, Helvetica, sans-serif;
        "
    >
        <div
            style="
                display:none;
                max-height:0;
                overflow:hidden;
                opacity:0;
            "
        >
            Your Black Snow Holdings subscription payment has been successfully confirmed.
        </div>

        <table
            class="email-shell"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
                width:100%;
                background-color:${BRAND_BACKGROUND};
                padding:32px 16px;
            "
        >
            <tr>
                <td align="center">
                    <table
                        class="email-card"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            width:100%;
                            max-width:620px;
                            background-color:${BRAND_WHITE};
                            border-radius:18px;
                            overflow:hidden;
                            box-shadow:0 12px 40px rgba(0,0,0,0.12);
                        "
                    >
                        ${buildEmailHeader('Subscription Confirmation')}

                        <tr>
                            <td
                                class="email-content"
                                style="
                                    padding:38px 32px 18px 32px;
                                "
                            >
                                <h1
                                    style="
                                        margin:0 0 14px 0;
                                        color:${BRAND_TEXT};
                                        font-size:26px;
                                        line-height:1.3;
                                        font-weight:700;
                                    "
                                >
                                    Your subscription is confirmed
                                </h1>

                                <p
                                    style="
                                        margin:0 0 20px 0;
                                        color:${BRAND_SECONDARY_TEXT};
                                        font-size:16px;
                                        line-height:1.7;
                                    "
                                >
                                    Hi ${escapeHtml(customerName)},
                                </p>

                                <p
                                    style="
                                        margin:0 0 24px 0;
                                        color:${BRAND_SECONDARY_TEXT};
                                        font-size:16px;
                                        line-height:1.7;
                                    "
                                >
                                    Your payment has been successfully confirmed and your
                                    <strong
                                        style="
                                            color:${BRAND_TEXT};
                                        "
                                    >
                                        ${BRAND_NAME}
                                    </strong>
                                    subscription is now active.
                                </p>

                                <table
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="
                                        margin:0 0 28px 0;
                                    "
                                >
                                    <tr>
                                        <td
                                            style="
                                                background-color:#edf3ff;
                                                border:1px solid #d7e3ff;
                                                border-radius:999px;
                                                padding:8px 14px;
                                                color:${BRAND_BLUE};
                                                font-size:13px;
                                                font-weight:700;
                                            "
                                        >
                                            Payment Successful
                                        </td>
                                    </tr>
                                </table>

                                <h2
                                    style="
                                        margin:0 0 14px 0;
                                        color:${BRAND_TEXT};
                                        font-size:20px;
                                        line-height:1.4;
                                        font-weight:700;
                                    "
                                >
                                    Your Details
                                </h2>

                                ${userDetailsHtml}

                                <h2
                                    style="
                                        margin:0 0 16px 0;
                                        color:${BRAND_TEXT};
                                        font-size:20px;
                                        line-height:1.4;
                                        font-weight:700;
                                    "
                                >
                                    Subscription Details
                                </h2>

                                ${productHtml}

                                ${
                                    paymentPeriod || paymentTotal
                                        ? `
                                            <table
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                                style="
                                                    margin:22px 0 0 0;
                                                    background-color:#f9fafb;
                                                    border:1px solid ${BRAND_BORDER};
                                                    border-radius:14px;
                                                "
                                            >
                                                <tr>
                                                    <td
                                                        style="
                                                            padding:18px 20px;
                                                        "
                                                    >
                                                        <table
                                                            width="100%"
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                            border="0"
                                                        >
                                                            ${
                                                                paymentPeriod
                                                                    ? `
                                                                        <tr>
                                                                            <td
                                                                                style="
                                                                                    padding:7px 0;
                                                                                    color:${BRAND_MUTED_TEXT};
                                                                                    font-size:14px;
                                                                                "
                                                                            >
                                                                                Plan period
                                                                            </td>

                                                                            <td
                                                                                style="
                                                                                    padding:7px 0;
                                                                                    color:${BRAND_TEXT};
                                                                                    font-size:14px;
                                                                                    font-weight:600;
                                                                                    text-align:right;
                                                                                "
                                                                            >
                                                                                ${escapeHtml(paymentPeriod)}
                                                                            </td>
                                                                        </tr>
                                                                    `
                                                                    : ''
                                                            }

                                                            ${
                                                                paymentTotal
                                                                    ? `
                                                                        <tr>
                                                                            <td
                                                                                style="
                                                                                    padding:7px 0;
                                                                                    color:${BRAND_MUTED_TEXT};
                                                                                    font-size:14px;
                                                                                "
                                                                            >
                                                                                Total payment
                                                                            </td>

                                                                            <td
                                                                                style="
                                                                                    padding:7px 0;
                                                                                    color:${BRAND_TEXT};
                                                                                    font-size:16px;
                                                                                    font-weight:700;
                                                                                    text-align:right;
                                                                                "
                                                                            >
                                                                                ${escapeHtml(paymentTotal)}
                                                                            </td>
                                                                        </tr>
                                                                    `
                                                                    : ''
                                                            }
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        `
                                        : ''
                                }

                                <p
                                    style="
                                        margin:26px 0 0 0;
                                        color:${BRAND_SECONDARY_TEXT};
                                        font-size:15px;
                                        line-height:1.7;
                                    "
                                >
                                    Thank you for choosing
                                    <strong
                                        style="
                                            color:${BRAND_TEXT};
                                        "
                                    >
                                        ${BRAND_NAME}
                                    </strong>.
                                </p>
                            </td>
                        </tr>

                        ${buildEmailFooter()}
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>
    `;
}

function buildAdminEmailHtml({
    user,
    customerName,
    productHtml,
    paymentPeriod,
    paymentTotal,
    subscriptionId,
    paymentStatus,
}: {
    user: SubscriptionUser;
    customerName: string;
    productHtml: string;
    paymentPeriod: string | null;
    paymentTotal: string | null;
    subscriptionId: string | null;
    paymentStatus: string;
}): string {
    const userDetailsHtml = buildUserDetailsHtml(user);

    return `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />

        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        />

        <title>
            ${BRAND_NAME} New Subscription
        </title>

        ${getResponsiveEmailCss()}
    </head>

    <body
        style="
            margin:0;
            padding:0;
            background-color:${BRAND_BACKGROUND};
            font-family:Arial, Helvetica, sans-serif;
        "
    >
        <div
            style="
                display:none;
                max-height:0;
                overflow:hidden;
                opacity:0;
            "
        >
            A new Black Snow Holdings subscription payment has been confirmed.
        </div>

        <table
            class="email-shell"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
                width:100%;
                background-color:${BRAND_BACKGROUND};
                padding:32px 16px;
            "
        >
            <tr>
                <td align="center">
                    <table
                        class="email-card"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            width:100%;
                            max-width:620px;
                            background-color:${BRAND_WHITE};
                            border-radius:18px;
                            overflow:hidden;
                            box-shadow:0 12px 40px rgba(0,0,0,0.12);
                        "
                    >
                        ${buildEmailHeader('New Subscription Notification')}

                        <tr>
                            <td
                                class="email-content"
                                style="
                                    padding:38px 32px 18px 32px;
                                "
                            >
                                <h1
                                    style="
                                        margin:0 0 14px 0;
                                        color:${BRAND_TEXT};
                                        font-size:26px;
                                        line-height:1.3;
                                        font-weight:700;
                                    "
                                >
                                    New subscription received
                                </h1>

                                <p
                                    style="
                                        margin:0 0 24px 0;
                                        color:${BRAND_SECONDARY_TEXT};
                                        font-size:16px;
                                        line-height:1.7;
                                    "
                                >
                                    ${escapeHtml(customerName)}
                                    has successfully completed a subscription payment.
                                </p>

                                <table
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="
                                        margin:0 0 28px 0;
                                    "
                                >
                                    <tr>
                                        <td
                                            style="
                                                background-color:#edf3ff;
                                                border:1px solid #d7e3ff;
                                                border-radius:999px;
                                                padding:8px 14px;
                                                color:${BRAND_BLUE};
                                                font-size:13px;
                                                font-weight:700;
                                            "
                                        >
                                            Payment Confirmed
                                        </td>
                                    </tr>
                                </table>

                                <h2
                                    style="
                                        margin:0 0 14px 0;
                                        color:${BRAND_TEXT};
                                        font-size:20px;
                                        line-height:1.4;
                                        font-weight:700;
                                    "
                                >
                                    User Information
                                </h2>

                                ${userDetailsHtml}

                                <h2
                                    style="
                                        margin:0 0 14px 0;
                                        color:${BRAND_TEXT};
                                        font-size:20px;
                                        line-height:1.4;
                                        font-weight:700;
                                    "
                                >
                                    Subscription Details
                                </h2>

                                ${productHtml}

                                ${
                                    paymentPeriod || paymentTotal
                                        ? `
                                            <table
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                                style="
                                                    margin:22px 0 28px 0;
                                                    background-color:#f9fafb;
                                                    border:1px solid ${BRAND_BORDER};
                                                    border-radius:14px;
                                                "
                                            >
                                                <tr>
                                                    <td
                                                        style="
                                                            padding:18px 20px;
                                                        "
                                                    >
                                                        <table
                                                            width="100%"
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                            border="0"
                                                        >
                                                            ${
                                                                paymentPeriod
                                                                    ? `
                                                                        <tr>
                                                                            <td
                                                                                style="
                                                                                    padding:7px 0;
                                                                                    color:${BRAND_MUTED_TEXT};
                                                                                    font-size:14px;
                                                                                "
                                                                            >
                                                                                Plan period
                                                                            </td>

                                                                            <td
                                                                                style="
                                                                                    padding:7px 0;
                                                                                    color:${BRAND_TEXT};
                                                                                    font-size:14px;
                                                                                    font-weight:600;
                                                                                    text-align:right;
                                                                                "
                                                                            >
                                                                                ${escapeHtml(paymentPeriod)}
                                                                            </td>
                                                                        </tr>
                                                                    `
                                                                    : ''
                                                            }

                                                            ${
                                                                paymentTotal
                                                                    ? `
                                                                        <tr>
                                                                            <td
                                                                                style="
                                                                                    padding:7px 0;
                                                                                    color:${BRAND_MUTED_TEXT};
                                                                                    font-size:14px;
                                                                                "
                                                                            >
                                                                                Total payment
                                                                            </td>

                                                                            <td
                                                                                style="
                                                                                    padding:7px 0;
                                                                                    color:${BRAND_TEXT};
                                                                                    font-size:16px;
                                                                                    font-weight:700;
                                                                                    text-align:right;
                                                                                "
                                                                            >
                                                                                ${escapeHtml(paymentTotal)}
                                                                            </td>
                                                                        </tr>
                                                                    `
                                                                    : ''
                                                            }
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        `
                                        : ''
                                }

                                <h2
                                    style="
                                        margin:0 0 14px 0;
                                        color:${BRAND_TEXT};
                                        font-size:20px;
                                        line-height:1.4;
                                        font-weight:700;
                                    "
                                >
                                    Subscription Information
                                </h2>

                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="
                                        background-color:#f9fafb;
                                        border:1px solid ${BRAND_BORDER};
                                        border-radius:14px;
                                    "
                                >
                                    <tr>
                                        <td
                                            style="
                                                padding:18px 20px;
                                            "
                                        >
                                            <table
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                            >
                                                ${
                                                    subscriptionId
                                                        ? `
                                                            <tr>
                                                                <td
                                                                    style="
                                                                        padding:7px 0;
                                                                        color:${BRAND_MUTED_TEXT};
                                                                        font-size:14px;
                                                                    "
                                                                >
                                                                    Subscription ID
                                                                </td>

                                                                <td
                                                                    style="
                                                                        padding:7px 0;
                                                                        color:${BRAND_TEXT};
                                                                        font-size:12px;
                                                                        font-weight:600;
                                                                        text-align:right;
                                                                        word-break:break-all;
                                                                    "
                                                                >
                                                                    ${escapeHtml(subscriptionId)}
                                                                </td>
                                                            </tr>
                                                        `
                                                        : ''
                                                }

                                                <tr>
                                                    <td
                                                        style="
                                                            padding:7px 0;
                                                            color:${BRAND_MUTED_TEXT};
                                                            font-size:14px;
                                                        "
                                                    >
                                                        Payment Status
                                                    </td>

                                                    <td
                                                        style="
                                                            padding:7px 0;
                                                            color:${BRAND_BLUE};
                                                            font-size:14px;
                                                            font-weight:700;
                                                            text-align:right;
                                                            text-transform:capitalize;
                                                        "
                                                    >
                                                        ${escapeHtml(paymentStatus)}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        ${buildEmailFooter()}
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>
    `;
}

function getSendGridErrorMessage(error: any): string {
    if (error?.response?.body) {
        try {
            return JSON.stringify(error.response.body);
        } catch {
            return String(error.response.body);
        }
    }

    if (error?.message) {
        return error.message;
    }

    return String(error);
}

async function sendSubscriptionConfirmationEmails({ user, session }: { user: SubscriptionUser; session: any }): Promise<void> {
    if (!sendGridApiKey) {
        logger.error('Subscription email not sent: SENDGRID_API_KEY is not configured');

        return;
    }

    if (!sendGridFromEmail) {
        logger.error('Subscription email not sent: SENDGRID_FROM_EMAIL is not configured');

        return;
    }

    if (!user.email) {
        logger.error(`Subscription email not sent: Auth ${user.id} has no email`);

        return;
    }

    const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    const products = getProductInfo(session);

    const productText = getProductText(products);

    const productHtml = getProductHtml(products);

    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;

    const paymentTotal = formatStripeAmount(session.amount_total, session.currency);

    const paymentPeriod = session?.metadata?.period ? String(session.metadata.period) : null;

    const paymentStatus = String(session.payment_status || 'paid');

    const phoneText = user.phone?.trim() || 'Not provided';

    const customerEmail = {
        to: user.email,

        from: {
            email: sendGridFromEmail,
            name: sendGridFromName,
        },

        subject: `${BRAND_NAME} - Your subscription is confirmed`,

        text: `
Hi ${customerName},

Thank you for your subscription to ${BRAND_NAME}.

Your payment has been successfully confirmed and your subscription is now active.

Your Details

First Name: ${user.firstName}
Last Name: ${user.lastName}
Email: ${user.email}
Phone: ${phoneText}

Subscription Details

${productText}

${paymentPeriod ? `Plan period: ${paymentPeriod}\n` : ''}
${paymentTotal ? `Total payment: ${paymentTotal}\n` : ''}

Thank you for choosing ${BRAND_NAME}.

${BRAND_NAME}
        `.trim(),

        html: buildCustomerEmailHtml({
            user,
            customerName,
            productHtml,
            paymentPeriod,
            paymentTotal,
        }),

        attachments: [getLogoAttachment()],
    };

    const adminEmail = {
        to: ADMIN_NOTIFICATION_EMAIL,

        from: {
            email: sendGridFromEmail,
            name: sendGridFromName,
        },

        subject: `${BRAND_NAME} - New subscription - ${customerName}`,

        text: `
A user has successfully purchased a subscription.

User Information

First Name: ${user.firstName}
Last Name: ${user.lastName}
Email: ${user.email}
Phone: ${phoneText}

Subscription Products

${productText}

${paymentPeriod ? `Plan period: ${paymentPeriod}\n` : ''}
${paymentTotal ? `Total payment: ${paymentTotal}\n` : ''}

${subscriptionId ? `Stripe Subscription ID: ${subscriptionId}\n` : ''}
Payment Status: ${paymentStatus}

${BRAND_NAME}
        `.trim(),

        html: buildAdminEmailHtml({
            user,
            customerName,
            productHtml,
            paymentPeriod,
            paymentTotal,
            subscriptionId,
            paymentStatus,
        }),

        attachments: [getLogoAttachment()],
    };

    logger.info(`Attempting SendGrid customer email to: ${user.email}`);

    logger.info(`Attempting SendGrid admin email to: ${ADMIN_NOTIFICATION_EMAIL}`);

    const results = await Promise.allSettled([sgMail.send(customerEmail), sgMail.send(adminEmail)]);

    const customerResult = results[0];

    const adminResult = results[1];

    if (customerResult.status === 'fulfilled') {
        logger.info(`Subscription confirmation email sent to customer: ${user.email}`);
    } else {
        logger.error(`Failed to send subscription confirmation email to customer ${user.email}: ${getSendGridErrorMessage(customerResult.reason)}`);
    }

    if (adminResult.status === 'fulfilled') {
        logger.info(`Subscription notification email sent to admin: ${ADMIN_NOTIFICATION_EMAIL}`);
    } else {
        logger.error(`Failed to send subscription notification email to admin ${ADMIN_NOTIFICATION_EMAIL}: ${getSendGridErrorMessage(adminResult.reason)}`);
    }
}

const api = async (req: NextApiRequest, res: NextApiResponse) => {
    logger.defaultMeta.service = 'stripe-payment-confirmation';

    try {
        if (req.method !== 'POST') {
            logger.error(`Method not allowed: ${req.method}`);

            return res.status(405).json(errorResponse('Method Not Allowed'));
        }

        const { sessionId } = req.query;

        logger.info(`Received sessionId: ${sessionId}`);

        if (!sessionId) {
            logger.error('Missing required field: sessionId');

            return res.status(400).json(errorResponse('Session ID is required'));
        }

        const processedSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;

        if (!processedSessionId) {
            logger.error('Processed sessionId is empty');

            return res.status(400).json(errorResponse('Session ID is required'));
        }

        logger.info(`Processed sessionId: ${processedSessionId}`);

        const session = await stripe.checkout.sessions.retrieve(processedSessionId, {
            expand: ['line_items.data.price.product'],
        });

        logger.info(`Stripe session retrieved successfully: ${session.id}`);

        if (session.payment_status !== 'paid') {
            logger.warn(`Payment not completed for sessionId: ${processedSessionId}, status: ${session.payment_status}`);

            return res.status(400).json(
                baseResponse('Payment not completed', {
                    success: false,
                    payment_status: session.payment_status,
                })
            );
        }

        const paymentType = session.metadata?.paymentType || (session.mode === 'subscription' ? 'subscription' : 'one-time');

        const isSubscriptionPayment = session.mode === 'subscription' || paymentType === 'subscription' || paymentType === 'recurring';

        logger.info(`Payment type determined: ${paymentType}`);

        logger.info(`Stripe mode: ${session.mode}`);

        logger.info(`Is subscription payment: ${isSubscriptionPayment}`);

        let updateResult:
            | {
                  count: number;
              }
            | undefined;

        if (paymentType === 'subscription') {
            const subscriptionRecord = await prisma.subscription.findFirst({
                where: {
                    transactionId: processedSessionId,
                    deleted: false,
                },

                include: {
                    auth: {
                        select: {
                            id: true,
                            email: true,
                            phone: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            logger.info(`Subscription record before update: ${JSON.stringify(subscriptionRecord, null, 2)}`);

            updateResult = await prisma.subscription.updateMany({
                where: {
                    transactionId: processedSessionId,
                    deleted: false,
                },

                data: {
                    paid: true,
                    updatedAt: new Date(),
                },
            });

            logger.info(`Subscription update result: ${JSON.stringify(updateResult, null, 2)}`);

            if (updateResult.count > 0 && subscriptionRecord && isSubscriptionPayment) {
                logger.info(`Preparing subscription email for Auth ID: ${subscriptionRecord.auth.id}, email: ${subscriptionRecord.auth.email}`);

                try {
                    await sendSubscriptionConfirmationEmails({
                        user: subscriptionRecord.auth,
                        session,
                    });
                } catch (emailError: any) {
                    logger.error(`Unexpected subscription email error for sessionId ${processedSessionId}: ${getSendGridErrorMessage(emailError)}`);
                }
            }
        } else {
            const checkoutRecord = await prisma.checkout.findFirst({
                where: {
                    transactionId: processedSessionId,
                    deleted: false,
                },

                include: {
                    auth: {
                        select: {
                            id: true,
                            email: true,
                            phone: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            logger.info(`Checkout record before update: ${JSON.stringify(checkoutRecord, null, 2)}`);

            updateResult = await prisma.checkout.updateMany({
                where: {
                    transactionId: processedSessionId,
                    deleted: false,
                },

                data: {
                    paid: true,
                    updatedAt: new Date(),
                },
            });

            logger.info(`Checkout update result: ${JSON.stringify(updateResult, null, 2)}`);

            if (updateResult.count > 0 && checkoutRecord && isSubscriptionPayment) {
                logger.info('Recurring subscription detected in Checkout table');

                logger.info(`Preparing subscription emails for user: ${checkoutRecord.auth.email}`);

                try {
                    await sendSubscriptionConfirmationEmails({
                        user: checkoutRecord.auth,
                        session,
                    });
                } catch (emailError: any) {
                    logger.error(`Unexpected subscription email error for sessionId ${processedSessionId}: ${getSendGridErrorMessage(emailError)}`);
                }
            } else if (updateResult.count > 0 && !isSubscriptionPayment) {
                logger.info('One-time Checkout payment detected; subscription email not required');
            }
        }

        if (!updateResult) {
            logger.error(`No database update result generated for sessionId: ${processedSessionId}`);

            return res.status(500).json(errorResponse('Internal Server Error'));
        }

        if (updateResult.count > 0) {
            logger.info(`Payment confirmed for sessionId: ${processedSessionId}, type: ${paymentType}`);

            return res.status(200).json(
                baseResponse('Payment confirmed and database updated', {
                    success: true,
                    type: paymentType,
                    updated: updateResult.count,
                })
            );
        }

        logger.error(`Transaction not found in database for sessionId: ${processedSessionId}`);

        return res.status(404).json(errorResponse('Transaction not found in database'));
    } catch (e: any) {
        logger.error(`Error confirming payment for sessionId: ${req.query.sessionId}, error: ${e?.message || 'Unknown error'}, stack: ${e?.stack || ''}`);

        return res.status(500).json(errorResponse('Internal Server Error', e?.message));
    }
};

export default api;
