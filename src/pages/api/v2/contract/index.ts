import prisma from '@/lib/prisma';
import sgMail from '@sendgrid/mail';
import formidable, { Fields, Files } from 'formidable';
import { readFile } from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFileUrl, uploadFileToS3 } from '../../../../../bucket/bucketConfig';

export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * Configure SendGrid only when email sending is required.
 * GET / PUT / DELETE remain independent of SendGrid configuration.
 */
let sendGridConfigured = false;

function getSendGridClient() {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
        throw new Error('SENDGRID_API_KEY is not configured');
    }

    if (!sendGridConfigured) {
        sgMail.setApiKey(apiKey);
        sendGridConfigured = true;
    }

    return sgMail;
}

function parseForm(req: NextApiRequest): Promise<{
    fields: Fields;
    files: Files;
}> {
    const form = formidable({
        multiples: false,
        keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }

            resolve({
                fields,
                files,
            });
        });
    });
}

function getField(fields: Fields, key: string): string | undefined {
    const value = fields[key];

    if (Array.isArray(value)) {
        const first = value[0];

        return first === undefined || first === null ? undefined : String(first);
    }

    if (value === undefined || value === null) {
        return undefined;
    }

    return String(value);
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Escape user/database supplied values before inserting
 * them into HTML.
 */
function escapeHtml(value?: string | null): string {
    if (!value) {
        return '';
    }

    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/**
 * Removes CR/LF from values used in email headers/subjects.
 */
function sanitizeHeader(value?: string | null): string {
    if (!value) {
        return '';
    }

    return value.replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Create a safe PDF attachment filename.
 */
function makeSafePdfFilename(value?: string | null): string {
    const filename = (value || 'contract')
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .replace(/\s+/g, '-')
        .trim();

    return `${filename || 'contract'}.pdf`;
}

interface SendContractEmailParams {
    to: string;
    recipientName?: string;
    senderName: string;
    senderEmail?: string;
    businessName?: string;
    contractName?: string;
    pdfPath?: string;

    /**
     * Prisma Contract.id
     */
    contractId: number;
}

/**
 * Send newly-created contract email using SendGrid.
 */
async function sendContractEmail({ to, recipientName, senderName, senderEmail, businessName, contractName, pdfPath, contractId }: SendContractEmailParams) {
    const sendGrid = getSendGridClient();

    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    const fromName = process.env.SENDGRID_FROM_NAME || 'Black Snow Holdings';

    if (!fromEmail) {
        throw new Error('SENDGRID_FROM_EMAIL is not configured');
    }

    if (!isValidEmail(fromEmail)) {
        throw new Error('SENDGRID_FROM_EMAIL is invalid');
    }

    /**
     * This link points to the contract signature page
     * using the newly created Prisma contract ID.
     */
    const signatureUrl = `https://www.blacksnowholdings.com/contractsignature` + `?id=${encodeURIComponent(String(contractId))}`;

    const safeSignatureUrl = escapeHtml(signatureUrl);

    const safeRecipientName = escapeHtml(recipientName?.trim() || 'there');

    const safeSenderName = escapeHtml(senderName);

    const safeBusinessName = escapeHtml(businessName);

    const safeContractName = escapeHtml(contractName);

    const subjectContractName = sanitizeHeader(contractName);

    const subjectSenderName = sanitizeHeader(senderName) || 'Black Snow Holdings';

    const subject = subjectContractName ? `${subjectSenderName} sent you a contract - ${subjectContractName}` : `${subjectSenderName} sent you a contract`;

    /**
     * Contract detail rows.
     */
    const contractInformationHtml = `
        ${
            contractName
                ? `
                    <tr>
                        <td
                            style="
                                padding: 8px 0;
                                color: #64748b;
                                font-size: 14px;
                                width: 120px;
                                vertical-align: top;
                            "
                        >
                            Contract
                        </td>

                        <td
                            style="
                                padding: 8px 0;
                                color: #111827;
                                font-size: 14px;
                                font-weight: 600;
                                vertical-align: top;
                            "
                        >
                            ${safeContractName}
                        </td>
                    </tr>
                `
                : ''
        }

        <tr>
            <td
                style="
                    padding: 8px 0;
                    color: #64748b;
                    font-size: 14px;
                    width: 120px;
                    vertical-align: top;
                "
            >
                Sent by
            </td>

            <td
                style="
                    padding: 8px 0;
                    color: #111827;
                    font-size: 14px;
                    font-weight: 600;
                    vertical-align: top;
                "
            >
                ${safeSenderName}
            </td>
        </tr>

        ${
            businessName
                ? `
                    <tr>
                        <td
                            style="
                                padding: 8px 0;
                                color: #64748b;
                                font-size: 14px;
                                width: 120px;
                                vertical-align: top;
                            "
                        >
                            Business
                        </td>

                        <td
                            style="
                                padding: 8px 0;
                                color: #111827;
                                font-size: 14px;
                                font-weight: 600;
                                vertical-align: top;
                            "
                        >
                            ${safeBusinessName}
                        </td>
                    </tr>
                `
                : ''
        }
    `;

    /**
     * Email HTML.
     */
    const html = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />

                <title>${escapeHtml(subject)}</title>
            </head>

            <body
                style="
                    margin: 0;
                    padding: 0;
                    background-color: #f1f5f9;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #172033;
                "
            >
                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background-color: #f1f5f9;
                    "
                >
                    <tr>
                        <td
                            align="center"
                            style="padding: 32px 12px;"
                        >
                            <!-- MAIN EMAIL CONTAINER -->
                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="
                                    width: 100%;
                                    max-width: 560px;
                                    background-color: #ffffff;
                                    border-radius: 16px;
                                    overflow: hidden;
                                    border-collapse: separate;
                                "
                            >
                                <!-- HEADER -->
                                <tr>
                                    <td
                                        align="center"
                                        bgcolor="#000000"
                                        style="
                                            background-color: #000000;
                                            padding: 34px 25px 30px 25px;
                                            border-radius: 16px 16px 0 0;
                                        "
                                    >
                                        <!-- BRAND MARK -->
                                        <table
                                            role="presentation"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="
                                                margin: 0 auto 15px auto;
                                            "
                                        >
                                            <tr>
                                                <td
                                                    align="center"
                                                    valign="middle"
                                                    style="
                                                        width: 54px;
                                                        height: 54px;
                                                        border: 2px solid #2563eb;
                                                        border-radius: 14px;
                                                        color: #2563eb;
                                                        font-size: 17px;
                                                        line-height: 54px;
                                                        font-weight: 800;
                                                        background-color: #ffffff;
                                                    "
                                                >
                                                    BS
                                                </td>
                                            </tr>
                                        </table>

                                        <div
                                            style="
                                                color: #ffffff;
                                                font-size: 21px;
                                                line-height: 28px;
                                                font-weight: 700;
                                            "
                                        >
                                            Black Snow Holdings
                                        </div>

                                        <div
                                            style="
                                                padding-top: 7px;
                                                color: #c7d2fe;
                                                font-size: 12px;
                                                line-height: 18px;
                                            "
                                        >
                                            Secure Contract Notification
                                        </div>
                                    </td>
                                </tr>

                                <!-- BODY -->
                                <tr>
                                    <td
                                        style="
                                            padding: 35px 28px 30px 28px;
                                        "
                                    >
                                        <div
                                            style="
                                                color: #172033;
                                                font-size: 25px;
                                                line-height: 34px;
                                                font-weight: 800;
                                                letter-spacing: -0.2px;
                                                margin-bottom: 16px;
                                            "
                                        >
                                            You've received a contract
                                        </div>

                                        <div
                                            style="
                                                color: #334155;
                                                font-size: 14px;
                                                line-height: 22px;
                                                margin-bottom: 20px;
                                            "
                                        >
                                            Hi ${safeRecipientName},
                                        </div>

                                        <div
                                            style="
                                                color: #334155;
                                                font-size: 14px;
                                                line-height: 23px;
                                                margin-bottom: 25px;
                                            "
                                        >
                                            <strong>
                                                ${safeSenderName}
                                            </strong>

                                            has sent you a contract through

                                            <strong>
                                                Black Snow Holdings
                                            </strong>.

                                            Please review the contract and
                                            complete your signature using the
                                            secure button below.
                                        </div>

                                        <!-- CONTRACT DETAILS -->
                                        <table
                                            role="presentation"
                                            width="100%"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="
                                                width: 100%;
                                                background-color: #f8faff;
                                                border: 1px solid #2563eb;
                                                border-radius: 12px;
                                                margin-bottom: 26px;
                                            "
                                        >
                                            <tr>
                                                <td
                                                    style="
                                                        padding: 18px 20px;
                                                    "
                                                >
                                                    <div
                                                        style="
                                                            color: #2563eb;
                                                            font-size: 12px;
                                                            line-height: 18px;
                                                            font-weight: 700;
                                                            text-transform: uppercase;
                                                            letter-spacing: 0.6px;
                                                            margin-bottom: 8px;
                                                        "
                                                    >
                                                        Contract Details
                                                    </div>

                                                    <table
                                                        role="presentation"
                                                        width="100%"
                                                        cellspacing="0"
                                                        cellpadding="0"
                                                        border="0"
                                                    >
                                                        ${contractInformationHtml}
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- SIGN CONTRACT TEXT -->
                                        <div
                                            style="
                                                color: #172033;
                                                font-size: 16px;
                                                line-height: 24px;
                                                font-weight: 700;
                                                text-align: center;
                                                margin-bottom: 8px;
                                            "
                                        >
                                            Ready to review and sign?
                                        </div>

                                        <div
                                            style="
                                                color: #64748b;
                                                font-size: 13px;
                                                line-height: 20px;
                                                text-align: center;
                                                margin-bottom: 20px;
                                            "
                                        >
                                            Click the button below to securely
                                            open your contract and add your
                                            signature.
                                        </div>

                                        <!-- SIGN BUTTON -->
                                        <table
                                            role="presentation"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            align="center"
                                            style="
                                                margin: 0 auto 20px auto;
                                            "
                                        >
                                            <tr>
                                                <td
                                                    align="center"
                                                    bgcolor="#2563eb"
                                                    style="
                                                        background-color: #2563eb;
                                                        border-radius: 10px;
                                                    "
                                                >
                                                    <a
                                                        href="${safeSignatureUrl}"
                                                        target="_blank"
                                                        style="
                                                            display: inline-block;
                                                            padding: 14px 28px;
                                                            color: #ffffff;
                                                            text-decoration: none;
                                                            font-size: 15px;
                                                            line-height: 20px;
                                                            font-weight: 700;
                                                            border-radius: 10px;
                                                        "
                                                    >
                                                        Review &amp; Sign Contract
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- FALLBACK LINK -->
                                        <div
                                            style="
                                                color: #64748b;
                                                font-size: 11px;
                                                line-height: 18px;
                                                text-align: center;
                                                margin-bottom: 27px;
                                            "
                                        >
                                            If the button doesn't work, copy
                                            and paste this link into your
                                            browser:

                                            <br />

                                            <a
                                                href="${safeSignatureUrl}"
                                                target="_blank"
                                                style="
                                                    color: #2563eb;
                                                    text-decoration: underline;
                                                    word-break: break-all;
                                                "
                                            >
                                                ${safeSignatureUrl}
                                            </a>
                                        </div>

                                        ${
                                            pdfPath
                                                ? `
                                                    <!-- PDF ATTACHMENT NOTICE -->
                                                    <table
                                                        role="presentation"
                                                        width="100%"
                                                        cellspacing="0"
                                                        cellpadding="0"
                                                        border="0"
                                                        style="
                                                            margin-bottom: 25px;
                                                        "
                                                    >
                                                        <tr>
                                                            <td
                                                                style="
                                                                    background-color: #f8fafc;
                                                                    border-radius: 10px;
                                                                    padding: 14px 16px;
                                                                    color: #475569;
                                                                    font-size: 13px;
                                                                    line-height: 20px;
                                                                "
                                                            >
                                                                <strong
                                                                    style="
                                                                        color: #172033;
                                                                    "
                                                                >
                                                                    PDF Attached
                                                                </strong>

                                                                <br />

                                                                A PDF copy of
                                                                your contract
                                                                is also attached
                                                                to this email
                                                                for your records.
                                                            </td>
                                                        </tr>
                                                    </table>
                                                `
                                                : ''
                                        }

                                        <div
                                            style="
                                                color: #64748b;
                                                font-size: 12px;
                                                line-height: 20px;
                                                margin-top: 4px;
                                            "
                                        >
                                            If you were not expecting this
                                            contract, please contact the sender
                                            before taking any action.
                                        </div>

                                        <!-- DIVIDER -->
                                        <div
                                            style="
                                                height: 1px;
                                                background-color: #e2e8f0;
                                                margin: 30px 0 20px 0;
                                            "
                                        ></div>

                                        <div
                                            style="
                                                text-align: center;
                                                color: #64748b;
                                                font-size: 11px;
                                                line-height: 18px;
                                            "
                                        >
                                            This is an automated contract
                                            notification from

                                            <strong
                                                style="color: #172033;"
                                            >
                                                Black Snow Holdings
                                            </strong>.
                                        </div>

                                        <div
                                            style="
                                                text-align: center;
                                                color: #94a3b8;
                                                font-size: 10px;
                                                line-height: 18px;
                                                margin-top: 8px;
                                            "
                                        >
                                            Please do not reply to this
                                            automated email unless a reply
                                            address has been provided by the
                                            sender.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `;

    /**
     * Plain text fallback.
     */
    const textLines = [
        'Black Snow Holdings',
        'Secure Contract Notification',
        '',
        "You've received a contract",
        '',
        `Hi ${recipientName?.trim() || 'there'},`,
        '',
        `${senderName} has sent you a contract through Black Snow Holdings.`,
        '',
        contractName ? `Contract: ${contractName}` : '',
        `Sent by: ${senderName}`,
        businessName ? `Business: ${businessName}` : '',
        '',
        'Please review and sign your contract using the secure link below:',
        '',
        signatureUrl,
        '',
        pdfPath ? 'A PDF copy of the contract is also attached to this email.' : '',
        '',
        'If you were not expecting this contract, please contact the sender before taking any action.',
        '',
        'This is an automated contract notification from Black Snow Holdings.',
    ].filter(Boolean);

    /**
     * SendGrid attachments must be Base64.
     */
    let attachments:
        | {
              content: string;
              filename: string;
              type: string;
              disposition: 'attachment';
          }[]
        | undefined;

    if (pdfPath) {
        const pdfBuffer = await readFile(pdfPath);

        attachments = [
            {
                content: pdfBuffer.toString('base64'),
                filename: makeSafePdfFilename(contractName || 'contract'),
                type: 'application/pdf',
                disposition: 'attachment',
            },
        ];
    }

    /**
     * Send email through SendGrid.
     */
    await sendGrid.send({
        to,

        from: {
            email: fromEmail,
            name: fromName,
        },

        /**
         * Recipient replies go to the actual contract sender
         * from the Auth record.
         */
        ...(senderEmail && isValidEmail(senderEmail)
            ? {
                  replyTo: {
                      email: senderEmail,
                      name: sanitizeHeader(senderName),
                  },
              }
            : {}),

        subject,
        text: textLines.join('\n'),
        html,

        ...(attachments
            ? {
                  attachments,
              }
            : {}),
    });
}

/**
 * ---------------------------------------------------------
 * SIGNED CONTRACT EMAILS
 * ---------------------------------------------------------
 */

interface ContractSignedNotificationParams {
    contract: {
        id: number;
        name: string;
        email: string;
        businessName: string;
        contractName: string;
        signed: string;
        authId: number | null;
    };

    authUser: {
        firstName: string;
        lastName: string;
        email: string;
    } | null;
}

/**
 * Shared HTML template for signed-contract notifications.
 */
function buildSignedContractEmailHtml({
    recipientName,
    heading,
    messageHtml,
    contractName,
    businessName,
    signerName,
    signerEmail,
}: {
    recipientName: string;
    heading: string;
    messageHtml: string;
    contractName?: string | null;
    businessName?: string | null;
    signerName?: string | null;
    signerEmail?: string | null;
}) {
    const safeRecipientName = escapeHtml(recipientName.trim() || 'there');

    const safeHeading = escapeHtml(heading);

    const safeContractName = escapeHtml(contractName);

    const safeBusinessName = escapeHtml(businessName);

    const safeSignerName = escapeHtml(signerName);

    const safeSignerEmail = escapeHtml(signerEmail);

    const detailRows = `
        ${
            contractName
                ? `
                    <tr>
                        <td
                            style="
                                padding: 8px 0;
                                color: #64748b;
                                font-size: 14px;
                                width: 120px;
                                vertical-align: top;
                            "
                        >
                            Contract
                        </td>

                        <td
                            style="
                                padding: 8px 0;
                                color: #111827;
                                font-size: 14px;
                                font-weight: 600;
                                vertical-align: top;
                            "
                        >
                            ${safeContractName}
                        </td>
                    </tr>
                `
                : ''
        }

        ${
            businessName
                ? `
                    <tr>
                        <td
                            style="
                                padding: 8px 0;
                                color: #64748b;
                                font-size: 14px;
                                width: 120px;
                                vertical-align: top;
                            "
                        >
                            Business
                        </td>

                        <td
                            style="
                                padding: 8px 0;
                                color: #111827;
                                font-size: 14px;
                                font-weight: 600;
                                vertical-align: top;
                            "
                        >
                            ${safeBusinessName}
                        </td>
                    </tr>
                `
                : ''
        }

        ${
            signerName
                ? `
                    <tr>
                        <td
                            style="
                                padding: 8px 0;
                                color: #64748b;
                                font-size: 14px;
                                width: 120px;
                                vertical-align: top;
                            "
                        >
                            Signed by
                        </td>

                        <td
                            style="
                                padding: 8px 0;
                                color: #111827;
                                font-size: 14px;
                                font-weight: 600;
                                vertical-align: top;
                            "
                        >
                            ${safeSignerName}
                        </td>
                    </tr>
                `
                : ''
        }

        ${
            signerEmail
                ? `
                    <tr>
                        <td
                            style="
                                padding: 8px 0;
                                color: #64748b;
                                font-size: 14px;
                                width: 120px;
                                vertical-align: top;
                            "
                        >
                            Email
                        </td>

                        <td
                            style="
                                padding: 8px 0;
                                color: #111827;
                                font-size: 14px;
                                font-weight: 600;
                                vertical-align: top;
                                word-break: break-word;
                            "
                        >
                            ${safeSignerEmail}
                        </td>
                    </tr>
                `
                : ''
        }

        <tr>
            <td
                style="
                    padding: 8px 0;
                    color: #64748b;
                    font-size: 14px;
                    width: 120px;
                    vertical-align: top;
                "
            >
                Status
            </td>

            <td
                style="
                    padding: 8px 0;
                    color: #16a34a;
                    font-size: 14px;
                    font-weight: 700;
                    vertical-align: top;
                "
            >
                Signed
            </td>
        </tr>
    `;

    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />

                <title>${safeHeading}</title>
            </head>

            <body
                style="
                    margin: 0;
                    padding: 0;
                    background-color: #f1f5f9;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #172033;
                "
            >
                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background-color: #f1f5f9;
                    "
                >
                    <tr>
                        <td
                            align="center"
                            style="
                                padding: 32px 12px;
                            "
                        >
                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="
                                    width: 100%;
                                    max-width: 560px;
                                    background-color: #ffffff;
                                    border-radius: 16px;
                                    overflow: hidden;
                                    border-collapse: separate;
                                "
                            >
                                <!-- HEADER -->
                                <tr>
                                    <td
                                        align="center"
                                        bgcolor="#000000"
                                        style="
                                            background-color: #000000;
                                            padding: 34px 25px 30px 25px;
                                            border-radius: 16px 16px 0 0;
                                        "
                                    >
                                        <table
                                            role="presentation"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="
                                                margin: 0 auto 15px auto;
                                            "
                                        >
                                            <tr>
                                                <td
                                                    align="center"
                                                    valign="middle"
                                                    style="
                                                        width: 54px;
                                                        height: 54px;
                                                        border: 2px solid #22c55e;
                                                        border-radius: 14px;
                                                        color: #22c55e;
                                                        font-size: 17px;
                                                        line-height: 54px;
                                                        font-weight: 800;
                                                        background-color: #ffffff;
                                                    "
                                                >
                                                    BS
                                                </td>
                                            </tr>
                                        </table>

                                        <div
                                            style="
                                                color: #ffffff;
                                                font-size: 21px;
                                                line-height: 28px;
                                                font-weight: 700;
                                            "
                                        >
                                            Black Snow Holdings
                                        </div>

                                        <div
                                            style="
                                                padding-top: 7px;
                                                color: #bbf7d0;
                                                font-size: 12px;
                                                line-height: 18px;
                                            "
                                        >
                                            Contract Signed Notification
                                        </div>
                                    </td>
                                </tr>

                                <!-- BODY -->
                                <tr>
                                    <td
                                        style="
                                            padding: 35px 28px 30px 28px;
                                        "
                                    >
                                        <!-- SUCCESS ICON -->
                                        <table
                                            role="presentation"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            align="center"
                                            style="
                                                margin: 0 auto 20px auto;
                                            "
                                        >
                                            <tr>
                                                <td
                                                    align="center"
                                                    valign="middle"
                                                    style="
                                                        width: 58px;
                                                        height: 58px;
                                                        border-radius: 50%;
                                                        background-color: #dcfce7;
                                                        color: #16a34a;
                                                        font-size: 28px;
                                                        line-height: 58px;
                                                        font-weight: 800;
                                                    "
                                                >
                                                    ✓
                                                </td>
                                            </tr>
                                        </table>

                                        <div
                                            style="
                                                color: #172033;
                                                font-size: 25px;
                                                line-height: 34px;
                                                font-weight: 800;
                                                letter-spacing: -0.2px;
                                                text-align: center;
                                                margin-bottom: 22px;
                                            "
                                        >
                                            ${safeHeading}
                                        </div>

                                        <div
                                            style="
                                                color: #334155;
                                                font-size: 14px;
                                                line-height: 22px;
                                                margin-bottom: 18px;
                                            "
                                        >
                                            Hi ${safeRecipientName},
                                        </div>

                                        <div
                                            style="
                                                color: #334155;
                                                font-size: 14px;
                                                line-height: 23px;
                                                margin-bottom: 25px;
                                            "
                                        >
                                            ${messageHtml}
                                        </div>

                                        <!-- CONTRACT DETAILS -->
                                        <table
                                            role="presentation"
                                            width="100%"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="
                                                width: 100%;
                                                background-color: #f0fdf4;
                                                border: 1px solid #22c55e;
                                                border-radius: 12px;
                                                margin-bottom: 26px;
                                            "
                                        >
                                            <tr>
                                                <td
                                                    style="
                                                        padding: 18px 20px;
                                                    "
                                                >
                                                    <div
                                                        style="
                                                            color: #16a34a;
                                                            font-size: 12px;
                                                            line-height: 18px;
                                                            font-weight: 700;
                                                            text-transform: uppercase;
                                                            letter-spacing: 0.6px;
                                                            margin-bottom: 8px;
                                                        "
                                                    >
                                                        Contract Details
                                                    </div>

                                                    <table
                                                        role="presentation"
                                                        width="100%"
                                                        cellspacing="0"
                                                        cellpadding="0"
                                                        border="0"
                                                    >
                                                        ${detailRows}
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <div
                                            style="
                                                color: #64748b;
                                                font-size: 12px;
                                                line-height: 20px;
                                            "
                                        >
                                            This notification was sent
                                            automatically because the contract
                                            status was updated to signed.
                                        </div>

                                        <div
                                            style="
                                                height: 1px;
                                                background-color: #e2e8f0;
                                                margin: 30px 0 20px 0;
                                            "
                                        ></div>

                                        <div
                                            style="
                                                text-align: center;
                                                color: #64748b;
                                                font-size: 11px;
                                                line-height: 18px;
                                            "
                                        >
                                            This is an automated contract
                                            notification from

                                            <strong
                                                style="
                                                    color: #172033;
                                                "
                                            >
                                                Black Snow Holdings
                                            </strong>.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `;
}

/**
 * Send notifications after a contract is successfully marked as signed.
 *
 * Two independent emails are attempted:
 *
 * 1. Auth user:
 *    "Your contract has been signed"
 *
 * 2. Contract recipient:
 *    "Your contract was signed successfully"
 *
 * Failure of either email does not fail the contract update.
 */
async function sendContractSignedNotifications({ contract, authUser }: ContractSignedNotificationParams) {
    const sendGrid = getSendGridClient();

    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    const fromName = process.env.SENDGRID_FROM_NAME || 'Black Snow Holdings';

    if (!fromEmail) {
        throw new Error('SENDGRID_FROM_EMAIL is not configured');
    }

    if (!isValidEmail(fromEmail)) {
        throw new Error('SENDGRID_FROM_EMAIL is invalid');
    }

    const contractEmail = contract.email?.trim();

    const contractRecipientName = contract.name?.trim() || 'there';

    const contractName = contract.contractName?.trim() || `Contract #${contract.id}`;

    const businessName = contract.businessName?.trim();

    const authFullName = authUser ? [authUser.firstName, authUser.lastName].filter(Boolean).join(' ').trim() : '';

    const authEmail = authUser?.email?.trim();

    const safeSignerName = escapeHtml(contract.name?.trim() || contractEmail || 'The recipient');

    const safeContractName = escapeHtml(contractName);

    const notificationPromises: Promise<void>[] = [];

    /**
     * ---------------------------------------------------------
     * EMAIL 1
     * Notify the Auth user / contract creator.
     * ---------------------------------------------------------
     */
    if (authEmail && isValidEmail(authEmail)) {
        const authSubject = sanitizeHeader(contract.contractName)
            ? `Contract signed - ${sanitizeHeader(contract.contractName)}`
            : `Contract #${contract.id} has been signed`;

        const authMessageHtml = `
            <strong>${safeSignerName}</strong>
            has successfully signed

            <strong>${safeContractName}</strong>.

            The contract status is now marked as

            <strong style="color: #16a34a;">
                Signed
            </strong>.
        `;

        const authHtml = buildSignedContractEmailHtml({
            recipientName: authFullName || 'there',

            heading: 'Your contract has been signed',

            messageHtml: authMessageHtml,

            contractName,
            businessName,

            signerName: contract.name?.trim() || contractEmail || 'Contract recipient',

            signerEmail: contractEmail && isValidEmail(contractEmail) ? contractEmail : undefined,
        });

        const authText = [
            'Black Snow Holdings',
            'Contract Signed Notification',
            '',
            `Hi ${authFullName || 'there'},`,
            '',
            `${contract.name?.trim() || contractEmail || 'The contract recipient'} has successfully signed ${contractName}.`,
            '',
            `Contract: ${contractName}`,
            businessName ? `Business: ${businessName}` : '',
            contract.name?.trim() ? `Signed by: ${contract.name.trim()}` : '',
            contractEmail ? `Signer email: ${contractEmail}` : '',
            'Status: Signed',
            '',
            'This is an automated contract notification from Black Snow Holdings.',
        ]
            .filter(Boolean)
            .join('\n');

        notificationPromises.push(
            (async () => {
                try {
                    await sendGrid.send({
                        to: authEmail,

                        from: {
                            email: fromEmail,
                            name: fromName,
                        },

                        /**
                         * If the contract email is valid,
                         * the Auth user can reply directly to
                         * the person who signed the contract.
                         */
                        ...(contractEmail && isValidEmail(contractEmail)
                            ? {
                                  replyTo: {
                                      email: contractEmail,
                                      name: sanitizeHeader(contract.name) || 'Contract Recipient',
                                  },
                              }
                            : {}),

                        subject: authSubject,

                        text: authText,

                        html: authHtml,
                    });

                    console.log(`Signed contract notification sent to Auth user ${authEmail} for contract ${contract.id}`);
                } catch (error: any) {
                    console.error(`Failed sending signed contract notification to Auth user ${authEmail}:`, error?.response?.body || error?.message || error);
                }
            })()
        );
    } else {
        if (contract.authId) {
            console.warn(`Unable to send signed contract notification to Auth user for contract ${contract.id}. Auth email is missing or invalid.`);
        } else {
            console.warn(`Contract ${contract.id} has no authId. Auth user signed notification was skipped.`);
        }
    }

    /**
     * ---------------------------------------------------------
     * EMAIL 2
     * Notify the contract recipient/signer.
     * ---------------------------------------------------------
     */
    if (contractEmail && isValidEmail(contractEmail)) {
        const recipientSubject = sanitizeHeader(contract.contractName)
            ? `Your contract was signed successfully - ${sanitizeHeader(contract.contractName)}`
            : 'Your contract was signed successfully';

        const recipientMessageHtml = `
            Your contract

            <strong>${safeContractName}</strong>

            has been signed successfully.

            The contract status is now

            <strong style="color: #16a34a;">
                Signed
            </strong>.

            Thank you for completing the signing process.
        `;

        const recipientHtml = buildSignedContractEmailHtml({
            recipientName: contractRecipientName,

            heading: 'Your contract was signed successfully',

            messageHtml: recipientMessageHtml,

            contractName,

            businessName,

            signerName: contract.name?.trim() || contractEmail,

            signerEmail: contractEmail,
        });

        const recipientText = [
            'Black Snow Holdings',
            'Contract Signed Successfully',
            '',
            `Hi ${contractRecipientName},`,
            '',
            `Your contract ${contractName} has been signed successfully.`,
            '',
            `Contract: ${contractName}`,
            businessName ? `Business: ${businessName}` : '',
            'Status: Signed',
            '',
            'Thank you for completing the signing process.',
            '',
            'This is an automated contract notification from Black Snow Holdings.',
        ]
            .filter(Boolean)
            .join('\n');

        notificationPromises.push(
            (async () => {
                try {
                    await sendGrid.send({
                        to: contractEmail,

                        from: {
                            email: fromEmail,
                            name: fromName,
                        },

                        /**
                         * Reply to the Auth user / contract sender
                         * when that email is available.
                         */
                        ...(authEmail && isValidEmail(authEmail)
                            ? {
                                  replyTo: {
                                      email: authEmail,

                                      name: sanitizeHeader(authFullName) || 'Black Snow Holdings',
                                  },
                              }
                            : {}),

                        subject: recipientSubject,

                        text: recipientText,

                        html: recipientHtml,
                    });

                    console.log(`Signed contract confirmation sent to contract email ${contractEmail} for contract ${contract.id}`);
                } catch (error: any) {
                    console.error(`Failed sending signed contract confirmation to ${contractEmail}:`, error?.response?.body || error?.message || error);
                }
            })()
        );
    } else {
        console.warn(`Contract ${contract.id} has no valid contract email. Signed confirmation email was skipped.`);
    }

    /**
     * Both emails are executed independently.
     *
     * Each email handles its own failure so one failed
     * SendGrid request does not prevent the other email.
     */
    await Promise.all(notificationPromises);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    const authIdParam = Array.isArray(req.query.authId) ? req.query.authId[0] : req.query.authId;

    try {
        switch (req.method) {
            /**
             * GET /api/contract?id=8
             * GET /api/contract?authId=1
             */
            case 'GET': {
                /**
                 * GET ONE CONTRACT
                 */
                if (idParam) {
                    const id = Number(idParam);

                    if (!Number.isFinite(id)) {
                        return res.status(400).json({
                            message: 'Invalid id',
                        });
                    }

                    const data = await prisma.contract.findUnique({
                        where: {
                            id,
                        },
                    });

                    if (!data) {
                        return res.status(404).json({
                            message: 'contract not found',
                        });
                    }

                    const pdf = data.pdf ? await getFileUrl(data.pdf) : null;

                    const contract = {
                        ...data,
                        pdf,
                    };

                    return res.status(200).json({
                        contract,
                    });
                }

                /**
                 * GET CONTRACTS BY AUTH ID
                 */
                if (authIdParam) {
                    const authId = Number(authIdParam);

                    if (!Number.isFinite(authId)) {
                        return res.status(400).json({
                            message: 'Invalid authId',
                        });
                    }

                    const contract = await prisma.contract.findMany({
                        where: {
                            authId,
                        },

                        orderBy: {
                            createdAt: 'desc',
                        },
                    });

                    const contracts = await Promise.all(
                        contract.map(async (data) => {
                            const pdf = data.pdf ? await getFileUrl(data.pdf) : null;

                            return {
                                ...data,
                                pdf,
                            };
                        })
                    );

                    return res.status(200).json({
                        contracts,
                    });
                }

                const contracts = await prisma.contract.findMany({
                    include: {
                        Auth: true,
                    },
                });
                return res.status(200).json({
                    contracts,
                });
            }

            /**
             * POST /api/contract
             */
            case 'POST': {
                const { fields, files } = await parseForm(req);

                // eslint-disable-next-line
                const pdf = files['pdf'];

                const pdfFile = Array.isArray(pdf) ? pdf[0] : pdf;

                const name = getField(fields, 'name');

                const email = getField(fields, 'email');

                const businessName = getField(fields, 'businessName');

                const contractName = getField(fields, 'contractName');

                const signed = getField(fields, 'signed');

                const authId = getField(fields, 'authId');

                if (!pdfFile) {
                    return res.status(400).json({
                        message: 'Invalid pdf',
                    });
                }

                if (!email || !isValidEmail(email)) {
                    return res.status(400).json({
                        message: 'Valid email is required',
                    });
                }

                /**
                 * Upload PDF to S3.
                 */
                const s3Key = await uploadFileToS3(pdfFile, 'uploads');

                let authIdNumber: number | null = null;

                if (authId !== undefined && authId !== null) {
                    const parsed = Number(authId);

                    if (!Number.isFinite(parsed)) {
                        return res.status(400).json({
                            message: 'Invalid authId',
                        });
                    }

                    authIdNumber = parsed;
                }

                /**
                 * Create contract.
                 */
                const contract = await prisma.contract.create({
                    data: {
                        pdf: s3Key,
                        signed,
                        name,
                        email,
                        businessName,
                        contractName,
                        authId: authIdNumber ?? undefined,
                    },
                });

                /**
                 * ------------------------------------------------
                 * SEND EMAIL AFTER SUCCESSFUL CONTRACT CREATION
                 * ------------------------------------------------
                 *
                 * SendGrid failures do not undo successful
                 * contract creation.
                 */
                try {
                    let senderName = 'Black Snow Holdings';

                    let senderEmail: string | undefined;

                    /**
                     * Contract.authId -> Auth.id
                     */
                    if (authIdNumber !== null) {
                        const senderAuth = await prisma.auth.findUnique({
                            where: {
                                id: authIdNumber,
                            },

                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        });

                        if (senderAuth) {
                            const fullName = [senderAuth.firstName, senderAuth.lastName].filter(Boolean).join(' ').trim();

                            if (fullName) {
                                senderName = fullName;
                            }

                            senderEmail = senderAuth.email;
                        } else {
                            console.warn(`Auth user not found for contract authId ${authIdNumber}`);

                            if (businessName?.trim()) {
                                senderName = businessName.trim();
                            }
                        }
                    } else if (businessName?.trim()) {
                        senderName = businessName.trim();
                    }

                    /**
                     * contract.id is passed here.
                     *
                     * This generates:
                     *
                     * https://www.blacksnowholdings.com/contractsignature?id=123
                     */
                    await sendContractEmail({
                        to: email,

                        recipientName: name,

                        senderName,

                        senderEmail,

                        businessName,

                        contractName,

                        pdfPath: pdfFile.filepath,

                        contractId: contract.id,
                    });

                    console.log(`Contract email successfully sent through SendGrid to ${email}`);
                } catch (emailError: any) {
                    /**
                     * Do not fail contract creation because
                     * SendGrid failed.
                     */
                    console.error('Contract created, but SendGrid email failed:', emailError?.response?.body || emailError?.message || emailError);
                }

                /**
                 * Keep existing API response unchanged.
                 */
                return res.status(201).json({
                    message: 'Created',
                    contract,
                });
            }

            /**
             * PUT /api/contract?id=8
             */
            case 'PUT': {
                if (!idParam) {
                    return res.status(400).json({
                        message: 'id query param is required',
                    });
                }

                const id = Number(idParam);

                if (!Number.isFinite(id)) {
                    return res.status(400).json({
                        message: 'Invalid id',
                    });
                }

                const { fields, files } = await parseForm(req);

                // eslint-disable-next-line
                const pdf = files['pdf'];

                const pdfFile = Array.isArray(pdf) ? pdf[0] : pdf;

                const name = getField(fields, 'name');

                const email = getField(fields, 'email');

                const businessName = getField(fields, 'businessName');

                const contractName = getField(fields, 'contractName');

                const signed = getField(fields, 'signed');

                const authId = getField(fields, 'authId');

                const data: any = {};

                if (pdfFile) {
                    const s3Key = await uploadFileToS3(pdfFile, 'uploads');

                    data.pdf = s3Key;
                }

                if (signed !== undefined) {
                    data.signed = signed;
                }

                if (name !== undefined) {
                    data.name = name;
                }

                if (email !== undefined) {
                    if (!isValidEmail(email)) {
                        return res.status(400).json({
                            message: 'Invalid email',
                        });
                    }

                    data.email = email;
                }

                if (businessName !== undefined) {
                    data.businessName = businessName;
                }

                if (contractName !== undefined) {
                    data.contractName = contractName;
                }

                if (authId !== undefined) {
                    const parsed = Number(authId);

                    if (!Number.isFinite(parsed)) {
                        return res.status(400).json({
                            message: 'Invalid authId',
                        });
                    }

                    data.authId = parsed;
                }

                try {
                    /**
                     * ------------------------------------------------
                     * UPDATE CONTRACT FIRST
                     * ------------------------------------------------
                     */
                    const updated = await prisma.contract.update({
                        where: {
                            id,
                        },

                        data,
                    });

                    /**
                     * ------------------------------------------------
                     * SEND SIGNED NOTIFICATIONS
                     * ------------------------------------------------
                     *
                     * Only run when the incoming PUT request
                     * contains:
                     *
                     * signed = "signed"
                     *
                     * We use trim/toLowerCase so:
                     *
                     * "signed"
                     * "Signed"
                     * " SIGNED "
                     *
                     * all trigger the notification.
                     *
                     * The actual database value is NOT modified
                     * by this comparison. Existing PUT behavior
                     * remains unchanged.
                     */
                    const shouldSendSignedEmail = signed !== undefined && signed.trim().toLowerCase() === 'signed';

                    if (shouldSendSignedEmail) {
                        /**
                         * Email failures must NOT cause a
                         * successfully updated contract to fail.
                         */
                        try {
                            let authUser: {
                                firstName: string;
                                lastName: string;
                                email: string;
                            } | null = null;

                            /**
                             * Use the UPDATED authId.
                             *
                             * This is important in case authId
                             * and signed are changed in the same
                             * PUT request.
                             */
                            if (updated.authId !== null) {
                                authUser = await prisma.auth.findUnique({
                                    where: {
                                        id: updated.authId,
                                    },

                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                });

                                if (!authUser) {
                                    console.warn(`Auth user not found for signed contract authId ${updated.authId}`);
                                }
                            }

                            /**
                             * Send both:
                             *
                             * 1. Notification to Auth user.
                             * 2. Confirmation to contract email.
                             */
                            await sendContractSignedNotifications({
                                contract: {
                                    id: updated.id,

                                    name: updated.name,

                                    email: updated.email,

                                    businessName: updated.businessName,

                                    contractName: updated.contractName,

                                    signed: updated.signed,

                                    authId: updated.authId,
                                },

                                authUser,
                            });
                        } catch (emailError: any) {
                            /**
                             * IMPORTANT:
                             *
                             * Contract update already succeeded.
                             *
                             * Do not return an error just because
                             * SendGrid configuration or email
                             * sending failed.
                             */
                            console.error(
                                'Contract updated successfully, but signed contract email notification failed:',
                                emailError?.response?.body || emailError?.message || emailError
                            );
                        }
                    }

                    /**
                     * Existing response remains unchanged.
                     */
                    return res.status(200).json({
                        message: 'Updated',
                        contract: updated,
                    });
                } catch (e: any) {
                    if (e.code === 'P2025') {
                        return res.status(404).json({
                            message: 'contract not found',
                        });
                    }

                    throw e;
                }
            }

            /**
             * DELETE /api/contract?id=8
             */
            case 'DELETE': {
                if (!idParam) {
                    return res.status(400).json({
                        message: 'id query param is required',
                    });
                }

                const id = Number(idParam);

                if (!Number.isFinite(id)) {
                    return res.status(400).json({
                        message: 'Invalid id',
                    });
                }

                try {
                    const deleted = await prisma.contract.delete({
                        where: {
                            id,
                        },
                    });

                    return res.status(200).json({
                        message: 'Deleted',
                        contract: deleted,
                    });
                } catch (e: any) {
                    if (e.code === 'P2025') {
                        return res.status(404).json({
                            message: 'contract not found',
                        });
                    }

                    throw e;
                }
            }

            default: {
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);

                return res.status(405).json({
                    message: 'Method not allowed',
                });
            }
        }
    } catch (e: any) {
        console.error('Error in /api/contract:', e);

        return res.status(500).json({
            message: 'Internal server error',
            error: e?.message,
        });
    }
}
