import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import { sendEmail, type SendEmailAttachment } from '@/lib/sendEmail';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import logger from '../../../../lib/logger';

const stripeSecretKey = process.env.NEXT_PRIVATE_STRIPE_SECRET;

if (!stripeSecretKey) {
    throw new Error('NEXT_PRIVATE_STRIPE_SECRET is not configured');
}

const stripe = require('stripe')(stripeSecretKey);

/**
 * Email / brand configuration.
 */
const BRAND_NAME = 'Black Snow Holdings';
const BRAND_BLUE = '#1557FF';
const BRAND_DARK = '#000000';
const BRAND_WHITE = '#FFFFFF';

const LOGO_CONTENT_ID = 'blacksnow-logo';

const ADMIN_NOTIFICATION_EMAIL = 'newBlackSnow@gmail.com';

type SubscriptionUser = {
    id: number;
    email: string;
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

/**
 * Escape values before inserting them into HTML.
 */
function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Determine MIME type for the inline email logo.
 */
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

/**
 * Load the Black Snow logo as an inline SendGrid attachment.
 *
 * Expected path:
 *
 * public/email/blacksnow-logo.png
 */
function getLogoAttachment(): SendEmailAttachment {
    const logoPath = path.join(process.cwd(), 'public', 'email', 'blacksnow-logo.png');

    if (!fs.existsSync(logoPath)) {
        throw new Error(`Logo file not found at: ${logoPath}`);
    }

    const logoBase64 = fs.readFileSync(logoPath).toString('base64');

    return {
        content: logoBase64,
        filename: 'blacksnow-logo.png',
        type: getMimeType(logoPath),
        disposition: 'inline',
        content_id: LOGO_CONTENT_ID,
    };
}

/**
 * Format a Stripe amount.
 *
 * Example:
 * 15000 USD => $150.00
 */
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

/**
 * Extract purchased product information from Stripe Checkout.
 */
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

    /**
     * Fallback if expanded line items are not available.
     */
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

/**
 * Plain-text product information.
 */
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

/**
 * Branded product cards used inside the email.
 */
function getProductHtml(products: ProductInfo[]): string {
    return products
        .map((product) => {
            const description = product.description
                ? `
                        <tr>
                            <td style="
                                padding:8px 0;
                                color:#6b7280;
                                font-size:14px;
                                vertical-align:top;
                            ">
                                Description
                            </td>

                            <td style="
                                padding:8px 0;
                                color:#111827;
                                font-size:14px;
                                text-align:right;
                                vertical-align:top;
                            ">
                                ${escapeHtml(product.description)}
                            </td>
                        </tr>
                    `
                : '';

            const amount = product.amount
                ? `
                        <tr>
                            <td style="
                                padding:8px 0;
                                color:#6b7280;
                                font-size:14px;
                            ">
                                Amount
                            </td>

                            <td style="
                                padding:8px 0;
                                color:#111827;
                                font-size:14px;
                                font-weight:700;
                                text-align:right;
                            ">
                                ${escapeHtml(product.amount)}
                            </td>
                        </tr>
                    `
                : '';

            const billingInterval = product.billingInterval
                ? `
                        <tr>
                            <td style="
                                padding:8px 0;
                                color:#6b7280;
                                font-size:14px;
                            ">
                                Billing
                            </td>

                            <td style="
                                padding:8px 0;
                                color:#111827;
                                font-size:14px;
                                text-align:right;
                            ">
                                ${escapeHtml(product.billingInterval)}
                            </td>
                        </tr>
                    `
                : '';

            return `
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        margin-bottom:16px;
                        background-color:#f8faff;
                        border:1px solid #dbe5ff;
                        border-radius:14px;
                    "
                >
                    <tr>
                        <td style="padding:20px;">
                            <div style="
                                color:${BRAND_BLUE};
                                font-size:18px;
                                font-weight:700;
                                margin-bottom:12px;
                            ">
                                ${escapeHtml(product.name)}
                            </div>

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                            >
                                <tr>
                                    <td style="
                                        padding:8px 0;
                                        color:#6b7280;
                                        font-size:14px;
                                    ">
                                        Quantity
                                    </td>

                                    <td style="
                                        padding:8px 0;
                                        color:#111827;
                                        font-size:14px;
                                        text-align:right;
                                    ">
                                        ${escapeHtml(product.quantity)}
                                    </td>
                                </tr>

                                ${description}
                                ${amount}
                                ${billingInterval}
                            </table>
                        </td>
                    </tr>
                </table>
            `;
        })
        .join('');
}

/**
 * Shared branded email header.
 */
function buildEmailHeader(subtitle: string): string {
    return `
        <tr>
            <td style="
                background-color:${BRAND_DARK};
                padding:34px 28px;
                text-align:center;
            ">
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

                <div style="
                    color:${BRAND_WHITE};
                    font-size:24px;
                    font-weight:700;
                    letter-spacing:0.3px;
                ">
                    ${BRAND_NAME}
                </div>

                <div style="
                    color:#b9c7ff;
                    font-size:14px;
                    margin-top:8px;
                ">
                    ${escapeHtml(subtitle)}
                </div>
            </td>
        </tr>
    `;
}

/**
 * Shared branded footer.
 */
function buildEmailFooter(): string {
    return `
        <tr>
            <td style="
                padding:26px 32px 34px 32px;
            ">
                <div style="
                    height:1px;
                    background-color:#e5e7eb;
                    margin-bottom:22px;
                "></div>

                <p style="
                    margin:0;
                    color:#6b7280;
                    font-size:13px;
                    line-height:1.7;
                    text-align:center;
                ">
                    This is an automated email from
                    <strong style="color:#111827;">
                        ${BRAND_NAME}
                    </strong>.
                </p>

                <p style="
                    margin:10px 0 0 0;
                    color:#9ca3af;
                    font-size:12px;
                    line-height:1.6;
                    text-align:center;
                ">
                    Please do not reply to this email.
                </p>
            </td>
        </tr>
    `;
}

/**
 * Customer plain-text subscription confirmation.
 */
function buildCustomerSubscriptionText({
    customerName,
    products,
    paymentPeriod,
    paymentTotal,
    sessionId,
}: {
    customerName: string;
    products: ProductInfo[];
    paymentPeriod: string | null;
    paymentTotal: string | null;
    sessionId: string;
}): string {
    const productText = getProductText(products);

    return `
Hi ${customerName || 'there'},

Your Black Snow Holdings subscription payment has been successfully confirmed.

Subscription Details

${productText}

${paymentPeriod ? `Plan period: ${paymentPeriod}\n` : ''}
${paymentTotal ? `Total payment: ${paymentTotal}\n` : ''}

Transaction reference:
${sessionId}

Thank you for choosing Black Snow Holdings.

Black Snow Holdings
    `.trim();
}

/**
 * Customer branded HTML subscription confirmation.
 */
function buildCustomerSubscriptionHtml({
    customerName,
    products,
    paymentPeriod,
    paymentTotal,
    sessionId,
}: {
    customerName: string;
    products: ProductInfo[];
    paymentPeriod: string | null;
    paymentTotal: string | null;
    sessionId: string;
}): string {
    const safeName = escapeHtml(customerName || 'there');

    const productHtml = getProductHtml(products);

    return `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>${BRAND_NAME} Subscription Confirmation</title>
    </head>

    <body style="
        margin:0;
        padding:0;
        background-color:#f4f6fb;
        font-family:Arial, Helvetica, sans-serif;
    ">
        <div style="
            display:none;
            max-height:0;
            overflow:hidden;
            opacity:0;
        ">
            Your Black Snow Holdings subscription payment has been successfully confirmed.
        </div>

        <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
                background-color:#f4f6fb;
                padding:32px 16px;
            "
        >
            <tr>
                <td align="center">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            max-width:620px;
                            background-color:${BRAND_WHITE};
                            border-radius:18px;
                            overflow:hidden;
                            box-shadow:0 12px 40px rgba(0,0,0,0.12);
                        "
                    >
                        ${buildEmailHeader('Subscription Confirmation')}

                        <tr>
                            <td style="
                                padding:38px 32px 18px 32px;
                            ">
                                <h1 style="
                                    margin:0 0 14px 0;
                                    color:#111827;
                                    font-size:26px;
                                    line-height:1.3;
                                    font-weight:700;
                                ">
                                    Your subscription is confirmed
                                </h1>

                                <p style="
                                    margin:0 0 20px 0;
                                    color:#4b5563;
                                    font-size:16px;
                                    line-height:1.7;
                                ">
                                    Hi ${safeName},
                                </p>

                                <p style="
                                    margin:0 0 26px 0;
                                    color:#4b5563;
                                    font-size:16px;
                                    line-height:1.7;
                                ">
                                    Your payment has been successfully confirmed and your
                                    <strong style="color:#111827;">
                                        ${BRAND_NAME}
                                    </strong>
                                    subscription is now active.
                                </p>

                                <div style="
                                    display:inline-block;
                                    background-color:#edf3ff;
                                    color:${BRAND_BLUE};
                                    border-radius:999px;
                                    padding:8px 14px;
                                    font-size:13px;
                                    font-weight:700;
                                    margin-bottom:24px;
                                ">
                                    Payment Successful
                                </div>

                                <h2 style="
                                    margin:0 0 16px 0;
                                    color:#111827;
                                    font-size:20px;
                                    font-weight:700;
                                ">
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
                                                    margin-top:20px;
                                                    background-color:#f9fafb;
                                                    border-radius:12px;
                                                "
                                            >
                                                <tr>
                                                    <td style="padding:18px;">
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
                                                                            <td style="
                                                                                padding:6px 0;
                                                                                color:#6b7280;
                                                                                font-size:14px;
                                                                            ">
                                                                                Plan period
                                                                            </td>

                                                                            <td style="
                                                                                padding:6px 0;
                                                                                color:#111827;
                                                                                font-size:14px;
                                                                                font-weight:600;
                                                                                text-align:right;
                                                                            ">
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
                                                                            <td style="
                                                                                padding:6px 0;
                                                                                color:#6b7280;
                                                                                font-size:14px;
                                                                            ">
                                                                                Total payment
                                                                            </td>

                                                                            <td style="
                                                                                padding:6px 0;
                                                                                color:#111827;
                                                                                font-size:16px;
                                                                                font-weight:700;
                                                                                text-align:right;
                                                                            ">
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

                                <p style="
                                    margin:28px 0 0 0;
                                    color:#6b7280;
                                    font-size:13px;
                                    line-height:1.7;
                                    word-break:break-all;
                                ">
                                    Transaction reference:
                                    <strong style="color:#111827;">
                                        ${escapeHtml(sessionId)}
                                    </strong>
                                </p>

                                <p style="
                                    margin:24px 0 0 0;
                                    color:#4b5563;
                                    font-size:15px;
                                    line-height:1.7;
                                ">
                                    Thank you for choosing
                                    <strong style="color:#111827;">
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

/**
 * Admin plain-text notification.
 */
function buildAdminSubscriptionText({
    user,
    customerName,
    products,
    paymentPeriod,
    paymentTotal,
    sessionId,
    subscriptionId,
    paymentStatus,
}: {
    user: SubscriptionUser;
    customerName: string;
    products: ProductInfo[];
    paymentPeriod: string | null;
    paymentTotal: string | null;
    sessionId: string;
    subscriptionId: string | null;
    paymentStatus: string;
}): string {
    const productText = getProductText(products);

    return `
A new subscription payment has been confirmed.

User Information

Name: ${customerName}
Email: ${user.email}
User ID: ${user.id}

Subscription Products

${productText}

${paymentPeriod ? `Plan period: ${paymentPeriod}\n` : ''}
${paymentTotal ? `Total payment: ${paymentTotal}\n` : ''}

Stripe Information

Checkout Session: ${sessionId}
${subscriptionId ? `Subscription ID: ${subscriptionId}\n` : ''}
Payment Status: ${paymentStatus}

Black Snow Holdings
    `.trim();
}

/**
 * Admin branded HTML notification.
 */
function buildAdminSubscriptionHtml({
    user,
    customerName,
    products,
    paymentPeriod,
    paymentTotal,
    sessionId,
    subscriptionId,
    paymentStatus,
}: {
    user: SubscriptionUser;
    customerName: string;
    products: ProductInfo[];
    paymentPeriod: string | null;
    paymentTotal: string | null;
    sessionId: string;
    subscriptionId: string | null;
    paymentStatus: string;
}): string {
    const productHtml = getProductHtml(products);

    return `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>${BRAND_NAME} New Subscription</title>
    </head>

    <body style="
        margin:0;
        padding:0;
        background-color:#f4f6fb;
        font-family:Arial, Helvetica, sans-serif;
    ">
        <div style="
            display:none;
            max-height:0;
            overflow:hidden;
            opacity:0;
        ">
            A new Black Snow Holdings subscription payment has been confirmed.
        </div>

        <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
                background-color:#f4f6fb;
                padding:32px 16px;
            "
        >
            <tr>
                <td align="center">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            max-width:620px;
                            background-color:${BRAND_WHITE};
                            border-radius:18px;
                            overflow:hidden;
                            box-shadow:0 12px 40px rgba(0,0,0,0.12);
                        "
                    >
                        ${buildEmailHeader('New Subscription Notification')}

                        <tr>
                            <td style="
                                padding:38px 32px 18px 32px;
                            ">
                                <h1 style="
                                    margin:0 0 14px 0;
                                    color:#111827;
                                    font-size:26px;
                                    line-height:1.3;
                                    font-weight:700;
                                ">
                                    New subscription received
                                </h1>

                                <p style="
                                    margin:0 0 24px 0;
                                    color:#4b5563;
                                    font-size:16px;
                                    line-height:1.7;
                                ">
                                    A user has successfully completed a subscription payment.
                                </p>

                                <div style="
                                    display:inline-block;
                                    background-color:#edf3ff;
                                    color:${BRAND_BLUE};
                                    border-radius:999px;
                                    padding:8px 14px;
                                    font-size:13px;
                                    font-weight:700;
                                    margin-bottom:28px;
                                ">
                                    Payment Confirmed
                                </div>

                                <h2 style="
                                    margin:0 0 14px 0;
                                    color:#111827;
                                    font-size:20px;
                                    font-weight:700;
                                ">
                                    User Information
                                </h2>

                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="
                                        background-color:#f9fafb;
                                        border-radius:12px;
                                        margin-bottom:28px;
                                    "
                                >
                                    <tr>
                                        <td style="padding:18px;">
                                            <table
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                            >
                                                <tr>
                                                    <td style="
                                                        padding:7px 0;
                                                        color:#6b7280;
                                                        font-size:14px;
                                                    ">
                                                        Name
                                                    </td>

                                                    <td style="
                                                        padding:7px 0;
                                                        color:#111827;
                                                        font-size:14px;
                                                        font-weight:600;
                                                        text-align:right;
                                                    ">
                                                        ${escapeHtml(customerName)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="
                                                        padding:7px 0;
                                                        color:#6b7280;
                                                        font-size:14px;
                                                    ">
                                                        Email
                                                    </td>

                                                    <td style="
                                                        padding:7px 0;
                                                        color:#111827;
                                                        font-size:14px;
                                                        font-weight:600;
                                                        text-align:right;
                                                    ">
                                                        ${escapeHtml(user.email)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="
                                                        padding:7px 0;
                                                        color:#6b7280;
                                                        font-size:14px;
                                                    ">
                                                        User ID
                                                    </td>

                                                    <td style="
                                                        padding:7px 0;
                                                        color:#111827;
                                                        font-size:14px;
                                                        font-weight:600;
                                                        text-align:right;
                                                    ">
                                                        ${escapeHtml(user.id)}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <h2 style="
                                    margin:0 0 14px 0;
                                    color:#111827;
                                    font-size:20px;
                                    font-weight:700;
                                ">
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
                                                    background-color:#f9fafb;
                                                    border-radius:12px;
                                                    margin:20px 0 28px 0;
                                                "
                                            >
                                                <tr>
                                                    <td style="padding:18px;">
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
                                                                            <td style="
                                                                                padding:7px 0;
                                                                                color:#6b7280;
                                                                                font-size:14px;
                                                                            ">
                                                                                Plan period
                                                                            </td>

                                                                            <td style="
                                                                                padding:7px 0;
                                                                                color:#111827;
                                                                                font-size:14px;
                                                                                font-weight:600;
                                                                                text-align:right;
                                                                            ">
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
                                                                            <td style="
                                                                                padding:7px 0;
                                                                                color:#6b7280;
                                                                                font-size:14px;
                                                                            ">
                                                                                Total payment
                                                                            </td>

                                                                            <td style="
                                                                                padding:7px 0;
                                                                                color:#111827;
                                                                                font-size:16px;
                                                                                font-weight:700;
                                                                                text-align:right;
                                                                            ">
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

                                <h2 style="
                                    margin:0 0 14px 0;
                                    color:#111827;
                                    font-size:20px;
                                    font-weight:700;
                                ">
                                    Stripe Information
                                </h2>

                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="
                                        background-color:#f9fafb;
                                        border-radius:12px;
                                    "
                                >
                                    <tr>
                                        <td style="padding:18px;">
                                            <table
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                            >
                                                <tr>
                                                    <td style="
                                                        padding:7px 0;
                                                        color:#6b7280;
                                                        font-size:14px;
                                                        vertical-align:top;
                                                    ">
                                                        Checkout Session
                                                    </td>

                                                    <td style="
                                                        padding:7px 0;
                                                        color:#111827;
                                                        font-size:13px;
                                                        text-align:right;
                                                        word-break:break-all;
                                                    ">
                                                        ${escapeHtml(sessionId)}
                                                    </td>
                                                </tr>

                                                ${
                                                    subscriptionId
                                                        ? `
                                                            <tr>
                                                                <td style="
                                                                    padding:7px 0;
                                                                    color:#6b7280;
                                                                    font-size:14px;
                                                                    vertical-align:top;
                                                                ">
                                                                    Subscription ID
                                                                </td>

                                                                <td style="
                                                                    padding:7px 0;
                                                                    color:#111827;
                                                                    font-size:13px;
                                                                    text-align:right;
                                                                    word-break:break-all;
                                                                ">
                                                                    ${escapeHtml(subscriptionId)}
                                                                </td>
                                                            </tr>
                                                        `
                                                        : ''
                                                }

                                                <tr>
                                                    <td style="
                                                        padding:7px 0;
                                                        color:#6b7280;
                                                        font-size:14px;
                                                    ">
                                                        Payment Status
                                                    </td>

                                                    <td style="
                                                        padding:7px 0;
                                                        color:${BRAND_BLUE};
                                                        font-size:14px;
                                                        font-weight:700;
                                                        text-align:right;
                                                    ">
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

/**
 * Send customer and admin subscription confirmation emails.
 *
 * Email failures are logged and do NOT invalidate a successful
 * Stripe payment/database update.
 */
async function sendSubscriptionConfirmationEmails({ user, session }: { user: SubscriptionUser; session: any }): Promise<void> {
    if (!user.email) {
        logger.error(`Subscription email not sent: Auth ${user.id} has no email`);

        return;
    }

    const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    const products = getProductInfo(session);

    const sessionId = String(session.id || '');

    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;

    const paymentTotal = formatStripeAmount(session.amount_total, session.currency);

    const paymentPeriod = session?.metadata?.period ? String(session.metadata.period) : null;

    const paymentStatus = String(session.payment_status || 'paid');

    /**
     * Generate logo attachment separately for each email.
     *
     * This avoids any chance of an email library mutating/reusing
     * the same attachment object between sends.
     */
    const customerLogoAttachment = getLogoAttachment();

    const adminLogoAttachment = getLogoAttachment();

    /**
     * Customer email.
     */
    const customerEmailPromise = sendEmail({
        to: user.email,

        subject: `${BRAND_NAME} - Your subscription is confirmed`,

        text: buildCustomerSubscriptionText({
            customerName,
            products,
            paymentPeriod,
            paymentTotal,
            sessionId,
        }),

        html: buildCustomerSubscriptionHtml({
            customerName,
            products,
            paymentPeriod,
            paymentTotal,
            sessionId,
        }),

        attachments: [customerLogoAttachment],
    });

    /**
     * Admin notification.
     */
    const adminEmailPromise = sendEmail({
        to: ADMIN_NOTIFICATION_EMAIL,

        subject: `${BRAND_NAME} - New subscription from ${customerName}`,

        text: buildAdminSubscriptionText({
            user,
            customerName,
            products,
            paymentPeriod,
            paymentTotal,
            sessionId,
            subscriptionId,
            paymentStatus,
        }),

        html: buildAdminSubscriptionHtml({
            user,
            customerName,
            products,
            paymentPeriod,
            paymentTotal,
            sessionId,
            subscriptionId,
            paymentStatus,
        }),

        attachments: [adminLogoAttachment],
    });

    logger.info(`Attempting customer subscription email to: ${user.email}`);

    logger.info(`Attempting admin subscription email to: ${ADMIN_NOTIFICATION_EMAIL}`);

    /**
     * Run both independently.
     *
     * One email failing should not prevent the other from being sent.
     */
    const results = await Promise.allSettled([customerEmailPromise, adminEmailPromise]);

    const customerResult = results[0];

    const adminResult = results[1];

    if (customerResult.status === 'fulfilled') {
        logger.info(`Subscription confirmation email sent to customer: ${user.email}`);
    } else {
        logger.error(
            `Failed to send subscription confirmation email to customer ${user.email}: ${customerResult.reason?.message || String(customerResult.reason)}`
        );
    }

    if (adminResult.status === 'fulfilled') {
        logger.info(`Subscription notification email sent to admin: ${ADMIN_NOTIFICATION_EMAIL}`);
    } else {
        logger.error(
            `Failed to send subscription notification email to admin ${ADMIN_NOTIFICATION_EMAIL}: ${adminResult.reason?.message || String(adminResult.reason)}`
        );
    }
}

/**
 * Stripe payment confirmation API.
 */
const api = async (req: NextApiRequest, res: NextApiResponse) => {
    logger.defaultMeta.service = 'stripe-payment-confirmation';

    try {
        /**
         * Only POST is supported.
         */
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

        /**
         * Normalize query parameter.
         */
        const processedSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;

        if (!processedSessionId) {
            logger.error('Processed sessionId is empty');

            return res.status(400).json(errorResponse('Session ID is required'));
        }

        logger.info(`Processed sessionId: ${processedSessionId}`);

        /**
         * Retrieve Stripe Checkout Session.
         *
         * Expand line item products so the email contains the
         * actual Stripe product information.
         */
        const session = await stripe.checkout.sessions.retrieve(processedSessionId, {
            expand: ['line_items.data.price.product'],
        });

        logger.info(`Stripe session retrieved successfully: ${session.id}`);

        /**
         * Payment must be completed before updating Prisma.
         */
        if (session.payment_status !== 'paid') {
            logger.warn(`Payment not completed for sessionId: ${processedSessionId}, status: ${session.payment_status}`);

            return res.status(400).json(
                baseResponse('Payment not completed', {
                    success: false,
                    payment_status: session.payment_status,
                })
            );
        }

        /**
         * IMPORTANT:
         *
         * Existing behavior is preserved.
         *
         * Your Stripe metadata can contain:
         *
         * paymentType = "recurring"
         *
         * while Stripe itself returns:
         *
         * mode = "subscription"
         *
         * "recurring" currently belongs to your Checkout table,
         * so paymentType is NOT rewritten here.
         */
        const paymentType = session.metadata?.paymentType || (session.mode === 'subscription' ? 'subscription' : 'one-time');

        /**
         * Separately identify whether this is a subscription for
         * email notification purposes.
         */
        const isSubscriptionPayment = session.mode === 'subscription' || paymentType === 'subscription' || paymentType === 'recurring';

        logger.info(`Payment type determined: ${paymentType}`);

        logger.info(`Stripe mode: ${session.mode}`);

        logger.info(`Is subscription payment: ${isSubscriptionPayment}`);

        let updateResult:
            | {
                  count: number;
              }
            | undefined;

        /**
         * Existing Subscription-table flow.
         */
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

            /**
             * Send emails only after successful database update.
             */
            if (updateResult.count > 0 && subscriptionRecord && isSubscriptionPayment) {
                logger.info(`Preparing subscription emails for Auth ID: ${subscriptionRecord.auth.id}, email: ${subscriptionRecord.auth.email}`);

                try {
                    await sendSubscriptionConfirmationEmails({
                        user: subscriptionRecord.auth,
                        session,
                    });
                } catch (emailError: any) {
                    /**
                     * Email failure must not turn a valid payment
                     * into an API failure.
                     */
                    logger.error(`Unexpected subscription email error for sessionId ${processedSessionId}: ${emailError?.message || String(emailError)}`);
                }
            }
        } else {
            /**
             * Existing Checkout-table flow.
             *
             * Your paymentType = "recurring" transactions enter here.
             */
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

            /**
             * Recurring Checkout payments are Stripe subscriptions,
             * so send the subscription confirmation email here too.
             */
            if (updateResult.count > 0 && checkoutRecord && isSubscriptionPayment) {
                logger.info('Recurring subscription detected in Checkout table');

                logger.info(`Preparing subscription emails for user: ${checkoutRecord.auth.email}`);

                try {
                    await sendSubscriptionConfirmationEmails({
                        user: checkoutRecord.auth,
                        session,
                    });
                } catch (emailError: any) {
                    /**
                     * Do not fail the payment API because email failed.
                     */
                    logger.error(`Unexpected subscription email error for sessionId ${processedSessionId}: ${emailError?.message || String(emailError)}`);
                }
            } else if (updateResult.count > 0 && !isSubscriptionPayment) {
                logger.info('One-time Checkout payment detected; subscription email not required');
            }
        }

        /**
         * Defensive TypeScript/runtime guard.
         */
        if (!updateResult) {
            logger.error(`No database update result generated for sessionId: ${processedSessionId}`);

            return res.status(500).json(errorResponse('Internal Server Error'));
        }

        /**
         * Preserve your existing successful response.
         */
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

        /**
         * Preserve transaction-not-found behavior.
         */
        logger.error(`Transaction not found in database for sessionId: ${processedSessionId}`);

        return res.status(404).json(errorResponse('Transaction not found in database'));
    } catch (e: any) {
        logger.error(`Error confirming payment for sessionId: ${req.query.sessionId}, error: ${e?.message || 'Unknown error'}, stack: ${e?.stack || ''}`);

        return res.status(500).json(errorResponse('Internal Server Error', e?.message));
    }
};

export default api;
