import prisma from '@/lib/prisma';

import fs from 'fs';

import path from 'path';

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * ---------------------------------------------------------
 * STRIPE CONFIGURATION
 * ---------------------------------------------------------
 */

const stripeSecretKey = process.env.NEXT_PRIVATE_STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;

/**
 * ---------------------------------------------------------
 * SENDGRID CONFIGURATION
 * ---------------------------------------------------------
 */

const sgMail = require('@sendgrid/mail');

const sendGridApiKey = process.env.SENDGRID_API_KEY;

const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL;

const sendGridFromName = process.env.SENDGRID_FROM_NAME || 'Black Snow Holdings';

/**
 * Do NOT throw if SendGrid is not configured.
 *
 * Stripe Connect status should continue working even if
 * email configuration is missing.
 */
if (sendGridApiKey) {
    sgMail.setApiKey(sendGridApiKey);
}

/**
 * ---------------------------------------------------------
 * EMAIL BRANDING
 * ---------------------------------------------------------
 */

const BRAND_NAME = 'Black Snow Holdings';

const BRAND_BLUE = '#1557FF';

const BRAND_DARK = '#000000';

const BRAND_WHITE = '#FFFFFF';

const BRAND_BACKGROUND = '#f4f6fb';

const BRAND_TEXT = '#111827';

const BRAND_SECONDARY_TEXT = '#4b5563';

const BRAND_MUTED_TEXT = '#6b7280';

const BRAND_BORDER = '#e5e7eb';

const SUCCESS_GREEN = '#16a34a';

const SUCCESS_BACKGROUND = '#ecfdf5';

const SUCCESS_BORDER = '#bbf7d0';

const LOGO_CONTENT_ID = 'blacksnow-logo';

/**
 * ---------------------------------------------------------
 * TYPES
 * ---------------------------------------------------------
 */

type StripeConnectEmailUser = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
};

type StripeConnectAccount = {
    id: string;
    type?: string | null;
    country?: string | null;
    email?: string | null;
    details_submitted?: boolean;
    charges_enabled?: boolean;
    payouts_enabled?: boolean;

    capabilities?: {
        transfers?: string | null;
        card_payments?: string | null;
    };
};

/**
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

function getQueryValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
}

/**
 * Safely get a request header.
 */
function getHeaderValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
}

/**
 * Generate application origin.
 *
 * Existing behavior is preserved.
 */
function getOrigin(req: NextApiRequest): string {
    const origin = getHeaderValue(req.headers.origin);

    if (origin) {
        return origin;
    }

    const forwardedProtocol = getHeaderValue(req.headers['x-forwarded-proto'])?.split(',')[0]?.trim();

    const forwardedHost = getHeaderValue(req.headers['x-forwarded-host'])?.split(',')[0]?.trim();

    const host = forwardedHost || getHeaderValue(req.headers.host) || 'localhost:3000';

    const protocol = forwardedProtocol || (process.env.NODE_ENV === 'production' ? 'https' : 'http');

    return `${protocol}://${host}`;
}

/**
 * Escape user/database/Stripe values before putting them
 * inside HTML email.
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
 * Get MIME type for inline email logo.
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
 * Get Black Snow Holdings logo.
 *
 * Expected location:
 *
 * public/email/blacksnow-logo.png
 *
 * Unlike the other email API, this safely returns null
 * if the logo does not exist. Stripe functionality and
 * email delivery should not fail just because the logo
 * is missing.
 */
function getLogoAttachment() {
    const logoPath = path.join(process.cwd(), 'public', 'email', 'blacksnow-logo.png');

    if (!fs.existsSync(logoPath)) {
        console.error(`Stripe Connect email logo not found at: ${logoPath}`);

        return null;
    }

    return {
        content: fs.readFileSync(logoPath).toString('base64'),

        filename: 'blacksnow-logo.png',

        type: getMimeType(logoPath),

        disposition: 'inline',

        content_id: LOGO_CONTENT_ID,
    };
}

/**
 * ---------------------------------------------------------
 * RESPONSIVE EMAIL CSS
 * ---------------------------------------------------------
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

                .email-content {
                    padding-left: 22px !important;
                    padding-right: 22px !important;
                }

                .email-header {
                    padding-left: 22px !important;
                    padding-right: 22px !important;
                }
            }
        </style>
    `;
}

/**
 * ---------------------------------------------------------
 * EMAIL HEADER
 * ---------------------------------------------------------
 */

function buildEmailHeader(subtitle: string, hasLogo: boolean): string {
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
                ${
                    hasLogo
                        ? `
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
                        `
                        : `
                            <div
                                style="
                                    width:58px;
                                    height:58px;
                                    line-height:58px;
                                    margin:0 auto 18px auto;
                                    background-color:${BRAND_WHITE};
                                    color:${BRAND_BLUE};
                                    border-radius:14px;
                                    font-size:18px;
                                    font-weight:800;
                                "
                            >
                                BS
                            </div>
                        `
                }

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

/**
 * ---------------------------------------------------------
 * EMAIL FOOTER
 * ---------------------------------------------------------
 */

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

/**
 * ---------------------------------------------------------
 * BUILD STRIPE CONNECT SUCCESS EMAIL
 * ---------------------------------------------------------
 */

function buildStripeConnectSuccessHtml({ user, account, hasLogo }: { user: StripeConnectEmailUser; account: StripeConnectAccount; hasLogo: boolean }): string {
    const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

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
            ${BRAND_NAME} Stripe Connect Successfully Connected
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
        <!-- Preview text -->
        <div
            style="
                display:none;
                max-height:0;
                overflow:hidden;
                opacity:0;
            "
        >
            Your Stripe Connect account has been successfully connected to ${BRAND_NAME}.
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
                        ${buildEmailHeader('Stripe Connect Confirmation', hasLogo)}

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
                                    Stripe Connect is successfully connected
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
                                    Your Stripe Connect account has been
                                    successfully connected to

                                    <strong
                                        style="
                                            color:${BRAND_TEXT};
                                        "
                                    >
                                        ${BRAND_NAME}
                                    </strong>.

                                    Your account is now ready to process
                                    payments and receive payouts.
                                </p>

                                <!-- SUCCESS BADGE -->

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
                                                background-color:${SUCCESS_BACKGROUND};
                                                border:1px solid ${SUCCESS_BORDER};
                                                border-radius:999px;
                                                padding:9px 15px;
                                                color:${SUCCESS_GREEN};
                                                font-size:13px;
                                                font-weight:700;
                                            "
                                        >
                                            ✓ Stripe Connect Active
                                        </td>
                                    </tr>
                                </table>

                                <!-- USER DETAILS -->

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
                                                            vertical-align:top;
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
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- STRIPE DETAILS -->

                                <h2
                                    style="
                                        margin:0 0 14px 0;
                                        color:${BRAND_TEXT};
                                        font-size:20px;
                                        line-height:1.4;
                                        font-weight:700;
                                    "
                                >
                                    Stripe Connect Details
                                </h2>

                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="
                                        margin:0 0 28px 0;
                                        background-color:#f8faff;
                                        border:1px solid #dbe5ff;
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
                                                <tr>
                                                    <td
                                                        style="
                                                            padding:7px 0;
                                                            color:${BRAND_MUTED_TEXT};
                                                            font-size:14px;
                                                        "
                                                    >
                                                        Account ID
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
                                                        ${escapeHtml(account.id)}
                                                    </td>
                                                </tr>

                                                ${
                                                    account.country
                                                        ? `
                                                            <tr>
                                                                <td
                                                                    style="
                                                                        padding:7px 0;
                                                                        color:${BRAND_MUTED_TEXT};
                                                                        font-size:14px;
                                                                    "
                                                                >
                                                                    Country
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
                                                                    ${escapeHtml(account.country)}
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
                                                        Account Status
                                                    </td>

                                                    <td
                                                        style="
                                                            padding:7px 0;
                                                            color:${SUCCESS_GREEN};
                                                            font-size:14px;
                                                            font-weight:700;
                                                            text-align:right;
                                                        "
                                                    >
                                                        Connected
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
                                                        Payments
                                                    </td>

                                                    <td
                                                        style="
                                                            padding:7px 0;
                                                            color:${SUCCESS_GREEN};
                                                            font-size:14px;
                                                            font-weight:700;
                                                            text-align:right;
                                                        "
                                                    >
                                                        Enabled
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
                                                        Payouts
                                                    </td>

                                                    <td
                                                        style="
                                                            padding:7px 0;
                                                            color:${SUCCESS_GREEN};
                                                            font-size:14px;
                                                            font-weight:700;
                                                            text-align:right;
                                                        "
                                                    >
                                                        Enabled
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <p
                                    style="
                                        margin:26px 0 0 0;
                                        color:${BRAND_SECONDARY_TEXT};
                                        font-size:15px;
                                        line-height:1.7;
                                    "
                                >
                                    Your Stripe Connect setup is complete.
                                    You can now continue using the payment
                                    features available through

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
                                        margin:22px 0 0 0;
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

/**
 * ---------------------------------------------------------
 * SEND STRIPE CONNECT SUCCESS EMAIL
 * ---------------------------------------------------------
 */

async function sendStripeConnectSuccessEmail({ user, account }: { user: StripeConnectEmailUser; account: StripeConnectAccount }): Promise<void> {
    /**
     * Email is optional functionality.
     *
     * Do not break Stripe Connect if SendGrid is missing.
     */
    if (!sendGridApiKey) {
        console.error('Stripe Connect success email not sent: SENDGRID_API_KEY is not configured');

        return;
    }

    if (!sendGridFromEmail) {
        console.error('Stripe Connect success email not sent: SENDGRID_FROM_EMAIL is not configured');

        return;
    }

    if (!user.email) {
        console.error(`Stripe Connect success email not sent: Auth ${user.id} has no email`);

        return;
    }

    const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    const logoAttachment = getLogoAttachment();

    const mail = {
        /**
         * IMPORTANT:
         *
         * Email is sent to Auth.email.
         */
        to: user.email,

        from: {
            email: sendGridFromEmail,
            name: sendGridFromName,
        },

        subject: `${BRAND_NAME} - Stripe Connect successfully connected`,

        text: `
Hi ${customerName},

Your Stripe Connect account has been successfully connected to ${BRAND_NAME}.

Your account is now ready to process payments and receive payouts.

Stripe Connect Details

Account ID: ${account.id}
${account.country ? `Country: ${account.country}\n` : ''}
Account Status: Connected
Payments: Enabled
Payouts: Enabled

Your Stripe Connect setup is complete.

Thank you for choosing ${BRAND_NAME}.

${BRAND_NAME}

This is an automated email. Please do not reply.
        `.trim(),

        html: buildStripeConnectSuccessHtml({
            user,
            account,
            hasLogo: Boolean(logoAttachment),
        }),

        /**
         * Do not send an empty attachments array unnecessarily.
         */
        ...(logoAttachment
            ? {
                  attachments: [logoAttachment],
              }
            : {}),
    };

    console.log(`Attempting Stripe Connect success email to Auth ${user.id}: ${user.email}`);

    await sgMail.send(mail);

    console.log(`Stripe Connect success email sent successfully to: ${user.email}`);
}

/**
 * ---------------------------------------------------------
 * API
 * ---------------------------------------------------------
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        /**
         * ---------------------------------------------------------
         * STRIPE CONFIG CHECK
         * ---------------------------------------------------------
         */

        if (!stripeSecretKey || !stripe) {
            return res.status(500).json({
                message: 'Stripe secret key is missing',
            });
        }

        /**
         * ---------------------------------------------------------
         * GET ONLY
         * ---------------------------------------------------------
         */

        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);

            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        /**
         * Supported:
         *
         * GET /api/stripe-connect/status?id=1
         *
         * GET /api/stripe-connect/status?authId=1
         *
         * GET /api/stripe-connect/status?connectId=acct_xxx
         *
         *
         * Optional:
         *
         * &createOnboardingLink=true
         */

        const idParam = getQueryValue(req.query.id);

        const authIdParam = getQueryValue(req.query.authId);

        const connectIdParam = getQueryValue(req.query.connectId);

        const createOnboardingLinkParam = getQueryValue(req.query.createOnboardingLink);

        const createOnboardingLink = createOnboardingLinkParam === 'true';

        let authId: number | undefined;

        let connectId: string | undefined = connectIdParam;

        /**
         * ---------------------------------------------------------
         * AUTH ID VALIDATION
         * ---------------------------------------------------------
         */

        if (idParam || authIdParam) {
            const rawId = idParam || authIdParam;

            const parsedId = Number(rawId);

            if (!Number.isInteger(parsedId) || parsedId <= 0) {
                return res.status(400).json({
                    message: 'Invalid id/authId parameter',
                });
            }

            authId = parsedId;
        }

        if (!authId && !connectId) {
            return res.status(400).json({
                message: 'id, authId, or connectId is required',
            });
        }

        /**
         * ---------------------------------------------------------
         * GET AUTH USER
         * ---------------------------------------------------------
         *
         * adminStripeConnectIdStatus is intentionally selected.
         *
         * It helps determine whether the account has transitioned
         * from not-ready to ready.
         */

        const user = authId
            ? await prisma.auth.findUnique({
                  where: {
                      id: authId,
                  },

                  select: {
                      id: true,

                      email: true,

                      firstName: true,

                      lastName: true,

                      adminStripeConnectId: true,

                      adminStripeConnectIdStatus: true,
                  },
              })
            : await prisma.auth.findFirst({
                  where: {
                      adminStripeConnectId: connectId,
                  },

                  select: {
                      id: true,

                      email: true,

                      firstName: true,

                      lastName: true,

                      adminStripeConnectId: true,

                      adminStripeConnectIdStatus: true,
                  },
              });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        /**
         * Use the account stored on Auth when connectId was
         * not supplied directly.
         */
        if (!connectId) {
            connectId = user.adminStripeConnectId || undefined;
        }

        /**
         * ---------------------------------------------------------
         * NO STRIPE ACCOUNT
         * ---------------------------------------------------------
         */

        if (!connectId) {
            await prisma.auth.update({
                where: {
                    id: user.id,
                },

                data: {
                    adminStripeConnectIdStatus: false,
                },
            });

            return res.status(200).json({
                message: 'Stripe Connect account does not exist',

                connected: false,

                ready: false,

                onboardingRequired: true,

                data: {
                    authId: user.id,

                    email: user.email,

                    adminStripeConnectId: null,

                    adminStripeConnectIdStatus: false,
                },
            });
        }

        /**
         * ---------------------------------------------------------
         * GET STRIPE ACCOUNT
         * ---------------------------------------------------------
         */

        const account = await stripe.accounts.retrieve(connectId);

        /**
         * ---------------------------------------------------------
         * CHECK STRIPE STATUS
         * ---------------------------------------------------------
         */

        const transfersActive = account.capabilities?.transfers === 'active';

        const cardPaymentsActive = account.capabilities?.card_payments === 'active';

        const currentlyDue = account.requirements?.currently_due || [];

        const eventuallyDue = account.requirements?.eventually_due || [];

        const pastDue = account.requirements?.past_due || [];

        const disabledReason = account.requirements?.disabled_reason || null;

        /**
         * Account is considered fully ready only when:
         *
         * 1. Details submitted
         * 2. Charges enabled
         * 3. Payouts enabled
         * 4. Transfers capability active
         * 5. Card payments capability active
         * 6. No disabled reason
         * 7. Nothing currently due
         * 8. Nothing past due
         */

        const ready =
            Boolean(account.details_submitted) &&
            Boolean(account.charges_enabled) &&
            Boolean(account.payouts_enabled) &&
            transfersActive &&
            cardPaymentsActive &&
            !disabledReason &&
            currentlyDue.length === 0 &&
            pastDue.length === 0;

        /**
         * ---------------------------------------------------------
         * ONBOARDING URL
         * ---------------------------------------------------------
         */

        let onboardingUrl: string | null = null;

        if (!ready && createOnboardingLink) {
            const origin = getOrigin(req);

            const accountLink = await stripe.accountLinks.create({
                account: connectId,

                refresh_url: `${origin}/onboarding/refresh`,

                return_url: `${origin}/onboarding/success?connectId=${encodeURIComponent(connectId)}`,

                type: 'account_onboarding',
            });

            onboardingUrl = accountLink.url;
        }

        /**
         * ---------------------------------------------------------
         * DETECT STATUS TRANSITION
         * ---------------------------------------------------------
         *
         * IMPORTANT:
         *
         * We do NOT simply use:
         *
         *     if (ready) sendEmail()
         *
         * because this endpoint may be called many times.
         *
         * Instead, updateMany atomically changes only an Auth
         * whose previous status is false or null.
         *
         * count === 1
         *
         * means:
         *
         *     false/null -> true
         *
         * This prevents normal repeated status polling from
         * repeatedly sending the success email.
         */

        let becameReady = false;

        if (ready) {
            const transitionResult = await prisma.auth.updateMany({
                where: {
                    id: user.id,

                    OR: [
                        {
                            adminStripeConnectIdStatus: false,
                        },

                        {
                            adminStripeConnectIdStatus: null,
                        },
                    ],
                },

                data: {
                    adminStripeConnectId: connectId,

                    adminStripeConnectIdStatus: true,
                },
            });

            becameReady = transitionResult.count > 0;
        }

        /**
         * ---------------------------------------------------------
         * PRESERVE EXISTING STATUS UPDATE
         * ---------------------------------------------------------
         *
         * We still perform the same Prisma update that your
         * original API performed.
         */

        const updatedUser = await prisma.auth.update({
            where: {
                id: user.id,
            },

            data: {
                adminStripeConnectId: connectId,

                adminStripeConnectIdStatus: ready,
            },

            select: {
                id: true,

                email: true,

                firstName: true,

                lastName: true,

                adminStripeConnectId: true,

                adminStripeConnectIdStatus: true,
            },
        });

        /**
         * ---------------------------------------------------------
         * SEND SUCCESS EMAIL
         * ---------------------------------------------------------
         *
         * Only when:
         *
         *     old status = false/null
         *
         *           ↓
         *
         *     new status = true
         *
         *
         * SendGrid failure does NOT break Stripe Connect.
         */

        let connectEmailSent = false;

        if (ready && becameReady) {
            try {
                await sendStripeConnectSuccessEmail({
                    user: {
                        id: updatedUser.id,

                        email: updatedUser.email,

                        firstName: updatedUser.firstName,

                        lastName: updatedUser.lastName,
                    },

                    account,
                });

                connectEmailSent = true;
            } catch (emailError: unknown) {
                console.error(`Stripe Connect succeeded for Auth ${updatedUser.id}, but success email failed:`, emailError);

                /**
                 * IMPORTANT:
                 *
                 * Do not throw.
                 *
                 * Stripe Connect has already been successfully
                 * updated in the database.
                 */
            }
        }

        /**
         * ---------------------------------------------------------
         * RESPONSE
         * ---------------------------------------------------------
         */

        return res.status(200).json({
            message: ready ? 'Stripe Connect account is ready' : 'Stripe Connect account is not ready',

            connected: true,

            ready,

            onboardingRequired: !ready,

            onboardingUrl,

            /**
             * Useful for debugging/frontend.
             *
             * true only when this request was the request
             * that detected false/null -> true.
             */
            becameReady,

            /**
             * true only when SendGrid successfully returned.
             *
             * Repeated status GET requests normally return false
             * because no new email should be sent.
             */
            connectEmailSent,

            data: updatedUser,

            stripeAccount: {
                id: account.id,

                type: account.type,

                country: account.country,

                email: account.email,

                detailsSubmitted: account.details_submitted,

                chargesEnabled: account.charges_enabled,

                payoutsEnabled: account.payouts_enabled,

                capabilities: {
                    transfers: account.capabilities?.transfers || null,

                    cardPayments: account.capabilities?.card_payments || null,
                },

                requirements: {
                    currentlyDue,

                    eventuallyDue,

                    pastDue,

                    disabledReason,
                },
            },
        });
    } catch (error: any) {
        console.error('Error in /api/stripe-connect/status:', error);

        return res.status(500).json({
            message: 'Internal server error',

            error: error?.message,
        });
    }
}
