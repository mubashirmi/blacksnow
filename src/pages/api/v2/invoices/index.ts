import prisma from '@/lib/prisma';
import sgMail from '@sendgrid/mail';
import type { File as FormidableFile } from 'formidable';
import formidable, { Fields, Files } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFileUrl, uploadFileToS3 } from '../../../../../bucket/bucketConfig';

export const config = {
    api: {
        bodyParser: false,
    },
};

type PaymentType = 'one_time' | 'subscription';
type SubscriptionInterval = 'month';

const DEFAULT_SERVICE_FEE_PERCENT = Number(process.env.INVOICE_SERVICE_FEE_PERCENT || 0);

const DEFAULT_PLATFORM_FEE_PERCENT = Number(process.env.INVOICE_PLATFORM_FEE_PERCENT || 8);

/**
 * ---------------------------------------------------------
 * SENDGRID CONFIGURATION
 * ---------------------------------------------------------
 *
 * SendGrid is configured lazily.
 *
 * This means GET / PUT / DELETE do not depend on SendGrid
 * configuration.
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
        form.parse(req, (error, fields, files) => {
            if (error) {
                reject(error);
                return;
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

function getFile(files: Files, key: string): FormidableFile | undefined {
    const value = files[key];

    return Array.isArray(value) ? value[0] : value;
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }

    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'paid'].includes(normalized)) {
        return true;
    }

    if (['false', '0', 'no', 'unpaid'].includes(normalized)) {
        return false;
    }

    return undefined;
}

function parsePaymentType(value: string | undefined): PaymentType | undefined {
    if (value === undefined) {
        return undefined;
    }

    const normalized = value.trim().toLowerCase();

    if (['one_time', 'one-time', 'onetime', 'single', 'once', 'payment'].includes(normalized)) {
        return 'one_time';
    }

    if (['subscription', 'monthly', 'recurring'].includes(normalized)) {
        return 'subscription';
    }

    return undefined;
}

function parseSubscriptionInterval(value: string | undefined): SubscriptionInterval | undefined {
    if (value === undefined) {
        return undefined;
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === 'month' || normalized === 'monthly') {
        return 'month';
    }

    return undefined;
}

function parsePercent(value: string | undefined, fallback: number): number | undefined {
    if (value === undefined) {
        return fallback;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        return undefined;
    }

    return parsed;
}

function parseRequiredId(value: string | undefined): number | undefined {
    if (!value) {
        return undefined;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return undefined;
    }

    return parsed;
}

/**
 * Escapes user/database supplied values before putting
 * them inside email HTML.
 */
function escapeHtml(value?: string | null): string {
    if (!value) {
        return '';
    }

    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/**
 * ---------------------------------------------------------
 * SEND INVOICE CREATED EMAIL
 * ---------------------------------------------------------
 *
 * This is executed only after the invoice has successfully
 * been inserted into the database.
 *
 * Failure to send this email DOES NOT undo invoice creation.
 */
async function sendInvoiceCreatedMail(params: {
    to: string;
    name?: string;
    businessName?: string;
    price?: string;
    transactionId?: string;
    paid?: boolean;
    invoiceId?: number;
}) {
    const { to, name, businessName, price, transactionId, paid, invoiceId } = params;

    const sendGrid = getSendGridClient();

    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    const fromName = process.env.SENDGRID_FROM_NAME || 'Black Snow Holdings';

    if (!fromEmail) {
        throw new Error('SENDGRID_FROM_EMAIL is not configured');
    }

    if (!isValidEmail(fromEmail)) {
        throw new Error('SENDGRID_FROM_EMAIL is invalid');
    }

    if (!isValidEmail(to)) {
        throw new Error('Invoice recipient email is invalid');
    }

    const displayName = name?.trim() || 'there';

    const safeDisplayName = escapeHtml(displayName);

    const safeBusinessName = escapeHtml(businessName);

    const safePrice = escapeHtml(price);

    const safeTransactionId = escapeHtml(transactionId);

    const safeInvoiceId = invoiceId !== undefined ? escapeHtml(String(invoiceId)) : '';

    const paymentStatus = paid ? 'Paid' : 'Unpaid';

    /**
     * Plain-text fallback.
     */
    const textLines = [
        'Black Snow Holdings',
        'Invoice Notification',
        '',
        `Hi ${displayName},`,
        '',
        'Your invoice has been created successfully.',
        '',
        invoiceId !== undefined ? `Invoice ID: ${invoiceId}` : '',
        businessName ? `Business Name: ${businessName}` : '',
        price ? `Price: ${price}` : '',
        transactionId ? `Transaction ID: ${transactionId}` : '',
        `Payment Status: ${paymentStatus}`,
        '',
        'Thank you.',
        '',
        'This is an automated invoice notification from Black Snow Holdings.',
    ]
        .filter(Boolean)
        .join('\n');

    /**
     * SendGrid-safe HTML email.
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

                <title>
                    Invoice created successfully
                </title>
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
                                            Invoice Notification
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
                                                margin-bottom: 20px;
                                            "
                                        >
                                            Your invoice has been created
                                        </div>

                                        <div
                                            style="
                                                color: #334155;
                                                font-size: 14px;
                                                line-height: 22px;
                                                margin-bottom: 18px;
                                            "
                                        >
                                            Hi ${safeDisplayName},
                                        </div>

                                        <div
                                            style="
                                                color: #334155;
                                                font-size: 14px;
                                                line-height: 23px;
                                                margin-bottom: 25px;
                                            "
                                        >
                                            Your invoice has been created
                                            successfully through

                                            <strong>
                                                Black Snow Holdings
                                            </strong>.
                                        </div>

                                        <!-- INVOICE DETAILS -->
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
                                                            margin-bottom: 10px;
                                                        "
                                                    >
                                                        Invoice Details
                                                    </div>

                                                    <table
                                                        role="presentation"
                                                        width="100%"
                                                        cellspacing="0"
                                                        cellpadding="0"
                                                        border="0"
                                                    >
                                                        ${
                                                            invoiceId !== undefined
                                                                ? `
                                                                    <tr>
                                                                        <td
                                                                            style="
                                                                                padding: 8px 0;
                                                                                color: #64748b;
                                                                                font-size: 14px;
                                                                                width: 130px;
                                                                                vertical-align: top;
                                                                            "
                                                                        >
                                                                            Invoice ID
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
                                                                            ${safeInvoiceId}
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
                                                                                width: 130px;
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
                                                            price
                                                                ? `
                                                                    <tr>
                                                                        <td
                                                                            style="
                                                                                padding: 8px 0;
                                                                                color: #64748b;
                                                                                font-size: 14px;
                                                                                width: 130px;
                                                                                vertical-align: top;
                                                                            "
                                                                        >
                                                                            Price
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
                                                                            ${safePrice}
                                                                        </td>
                                                                    </tr>
                                                                `
                                                                : ''
                                                        }

                                                        ${
                                                            transactionId
                                                                ? `
                                                                    <tr>
                                                                        <td
                                                                            style="
                                                                                padding: 8px 0;
                                                                                color: #64748b;
                                                                                font-size: 14px;
                                                                                width: 130px;
                                                                                vertical-align: top;
                                                                            "
                                                                        >
                                                                            Transaction ID
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
                                                                            ${safeTransactionId}
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
                                                                    width: 130px;
                                                                    vertical-align: top;
                                                                "
                                                            >
                                                                Payment Status
                                                            </td>

                                                            <td
                                                                style="
                                                                    padding: 8px 0;
                                                                    color: ${paid ? '#16a34a' : '#dc2626'};
                                                                    font-size: 14px;
                                                                    font-weight: 700;
                                                                    vertical-align: top;
                                                                "
                                                            >
                                                                ${paymentStatus}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <div
                                            style="
                                                color: #334155;
                                                font-size: 14px;
                                                line-height: 22px;
                                            "
                                        >
                                            Thank you.
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
                                            This is an automated invoice
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

    await sendGrid.send({
        to,

        from: {
            email: fromEmail,
            name: fromName,
        },

        subject: 'Invoice created successfully',

        text: textLines,

        html,
    });
}

async function uploadImagePair(params: { paidImageFile: FormidableFile; unpaidImageFile: FormidableFile }): Promise<{
    paidImage: string;
    unpaidImage: string;
}> {
    const { paidImageFile, unpaidImageFile } = params;

    if (paidImageFile === unpaidImageFile) {
        const imageKey = await uploadFileToS3(paidImageFile, 'uploads');

        return {
            paidImage: imageKey,
            unpaidImage: imageKey,
        };
    }

    const [paidImage, unpaidImage] = await Promise.all([uploadFileToS3(paidImageFile, 'uploads'), uploadFileToS3(unpaidImageFile, 'uploads')]);

    return {
        paidImage,
        unpaidImage,
    };
}

function removeContractPdf(contract: any) {
    if (!contract) {
        return null;
    }

    const { pdf: _pdf, ...contractWithoutPdf } = contract;

    return contractWithoutPdf;
}

async function serializeInvoice(invoice: any) {
    const [paidImageUrl, unpaidImageUrl] = await Promise.all([
        invoice.paidImage ? getFileUrl(invoice.paidImage) : Promise.resolve(null),

        invoice.unpaidImage ? getFileUrl(invoice.unpaidImage) : Promise.resolve(null),
    ]);

    return {
        ...invoice,

        paidImage: paidImageUrl,

        unpaidImage: unpaidImageUrl,

        Contract: removeContractPdf(invoice.Contract),
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    const contractIdParam = Array.isArray(req.query.contractId) ? req.query.contractId[0] : req.query.contractId;

    const authIdParam = Array.isArray(req.query.authId) ? req.query.authId[0] : req.query.authId;

    try {
        switch (req.method) {
            /**
             * ---------------------------------------------------------
             * GET
             * ---------------------------------------------------------
             */
            case 'GET': {
                /**
                 * GET ONE INVOICE
                 *
                 * /api/invoices?id=1
                 */
                if (idParam) {
                    const id = parseRequiredId(idParam);

                    if (id === undefined) {
                        return res.status(400).json({
                            message: 'Invalid id',
                        });
                    }

                    const invoice = await prisma.invoice.findUnique({
                        where: {
                            id,
                        },

                        include: {
                            Contract: true,
                        },
                    });

                    if (!invoice) {
                        return res.status(404).json({
                            message: 'Invoice not found',
                        });
                    }

                    const result = await serializeInvoice(invoice);

                    return res.status(200).json({
                        invoice: result,
                    });
                }

                /**
                 * GET INVOICES BY CONTRACT
                 *
                 * /api/invoices?contractId=1
                 */
                if (contractIdParam) {
                    const contractId = parseRequiredId(contractIdParam);

                    if (contractId === undefined) {
                        return res.status(400).json({
                            message: 'Invalid contractId',
                        });
                    }

                    const invoices = await prisma.invoice.findMany({
                        where: {
                            contractId,
                        },

                        orderBy: {
                            createdAt: 'desc',
                        },

                        include: {
                            Contract: true,
                        },
                    });

                    const results = await Promise.all(invoices.map(serializeInvoice));

                    return res.status(200).json({
                        invoices: results,
                    });
                }

                /**
                 * GET INVOICES BY AUTH USER
                 *
                 * /api/invoices?authId=1
                 */
                if (authIdParam) {
                    const authId = parseRequiredId(authIdParam);

                    if (authId === undefined) {
                        return res.status(400).json({
                            message: 'Invalid authId',
                        });
                    }

                    const invoices = await prisma.invoice.findMany({
                        where: {
                            authId,
                        },

                        orderBy: {
                            createdAt: 'desc',
                        },

                        include: {
                            Contract: true,
                        },
                    });

                    const results = await Promise.all(invoices.map(serializeInvoice));

                    return res.status(200).json({
                        invoices: results,
                    });
                }

                /**
                 * GET ALL INVOICES
                 */
                const invoice = await prisma.invoice.findMany({
                    include: {
                        Contract: true,
                        auth: true,
                    },
                });

                return res.status(200).json({
                    invoices: invoice,
                });
            }

            /**
             * ---------------------------------------------------------
             * POST
             * ---------------------------------------------------------
             *
             * CREATE INVOICE
             */
            case 'POST': {
                const { fields, files } = await parseForm(req);

                const paidImageFile = getFile(files, 'paidImage');

                const unpaidImageFile = getFile(files, 'unpaidImage');

                /*
                 * Backward compatibility for clients
                 * still sending one "image" file.
                 */
                const legacyImageFile = getFile(files, 'image');

                const finalPaidImageFile = paidImageFile || legacyImageFile;

                const finalUnpaidImageFile = unpaidImageFile || legacyImageFile;

                const contractId = getField(fields, 'contractId');

                const name = getField(fields, 'name');

                const email = getField(fields, 'email');

                const businessName = getField(fields, 'businessName');

                const price = getField(fields, 'price');

                const authId = getField(fields, 'authId');

                const transactionId = getField(fields, 'transactionId');

                const paid = getField(fields, 'paid');

                const paymentTypeRaw = getField(fields, 'paymentType');

                const subscriptionIntervalRaw = getField(fields, 'subscriptionInterval');

                const serviceFeePercentRaw = getField(fields, 'serviceFeePercent');

                const platformFeePercentRaw = getField(fields, 'platformFeePercent');

                if (!finalPaidImageFile) {
                    return res.status(400).json({
                        message: 'Valid paidImage is required',
                    });
                }

                if (!finalUnpaidImageFile) {
                    return res.status(400).json({
                        message: 'Valid unpaidImage is required',
                    });
                }

                if (!email || !isValidEmail(email)) {
                    return res.status(400).json({
                        message: 'Valid email is required',
                    });
                }

                let contractIdNumber: number | null = null;

                if (contractId !== undefined) {
                    const parsed = Number(contractId);

                    if (!Number.isInteger(parsed) || parsed <= 0) {
                        return res.status(400).json({
                            message: 'Invalid contractId',
                        });
                    }

                    contractIdNumber = parsed;
                }

                let authIdNumber: number | null = null;

                if (authId !== undefined) {
                    const parsed = Number(authId);

                    if (!Number.isInteger(parsed) || parsed <= 0) {
                        return res.status(400).json({
                            message: 'Invalid authId',
                        });
                    }

                    authIdNumber = parsed;
                }

                const paidBoolean = parseBoolean(paid);

                if (paid !== undefined && paidBoolean === undefined) {
                    return res.status(400).json({
                        message: 'Invalid paid value',
                    });
                }

                const parsedPaymentType = parsePaymentType(paymentTypeRaw);

                if (paymentTypeRaw !== undefined && parsedPaymentType === undefined) {
                    return res.status(400).json({
                        message: 'Invalid paymentType. Use one_time or subscription',
                    });
                }

                const parsedSubscriptionInterval = parseSubscriptionInterval(subscriptionIntervalRaw);

                if (subscriptionIntervalRaw !== undefined && parsedSubscriptionInterval === undefined) {
                    return res.status(400).json({
                        message: 'Invalid subscriptionInterval. For now use month',
                    });
                }

                const serviceFeePercent = parsePercent(serviceFeePercentRaw, DEFAULT_SERVICE_FEE_PERCENT);

                if (serviceFeePercent === undefined) {
                    return res.status(400).json({
                        message: 'Invalid serviceFeePercent',
                    });
                }

                const platformFeePercent = parsePercent(platformFeePercentRaw, DEFAULT_PLATFORM_FEE_PERCENT);

                if (platformFeePercent === undefined) {
                    return res.status(400).json({
                        message: 'Invalid platformFeePercent',
                    });
                }

                /**
                 * Upload invoice images.
                 */
                const uploadedImages = await uploadImagePair({
                    paidImageFile: finalPaidImageFile,

                    unpaidImageFile: finalUnpaidImageFile,
                });

                /**
                 * ------------------------------------------------
                 * CREATE INVOICE
                 * ------------------------------------------------
                 */
                const invoice = await prisma.invoice.create({
                    data: {
                        name,
                        email,
                        businessName,
                        price,

                        paidImage: uploadedImages.paidImage,

                        unpaidImage: uploadedImages.unpaidImage,

                        authId: authIdNumber ?? undefined,

                        contractId: contractIdNumber ?? undefined,

                        transactionId,

                        paid: paidBoolean ?? false,

                        paymentType: parsedPaymentType || 'one_time',

                        subscriptionInterval: parsedSubscriptionInterval || 'month',

                        serviceFeePercent,

                        platformFeePercent,
                    },
                });

                /**
                 * ------------------------------------------------
                 * SEND SENDGRID EMAIL
                 * ------------------------------------------------
                 *
                 * Invoice creation already succeeded.
                 *
                 * Therefore a SendGrid failure does NOT delete
                 * or rollback the invoice.
                 */
                try {
                    await sendInvoiceCreatedMail({
                        /**
                         * Email directly from POST body.
                         */
                        to: email,

                        name,

                        businessName,

                        price,

                        transactionId,

                        paid: invoice.paid,

                        invoiceId: invoice.id,
                    });

                    console.log(`Invoice created email successfully sent through SendGrid to ${email} for invoice ${invoice.id}`);
                } catch (mailError: unknown) {
                    console.error('Invoice created successfully, but SendGrid email failed:', mailError);

                    const mailErrorMessage = mailError instanceof Error ? mailError.message : 'Unknown mail error';

                    /**
                     * Preserve existing behavior:
                     *
                     * Invoice exists, therefore still return 201.
                     */
                    return res.status(201).json({
                        message: 'Created, but email failed to send',

                        mailSent: false,

                        mailError: mailErrorMessage,

                        invoice,
                    });
                }

                return res.status(201).json({
                    message: 'Created and email sent',

                    mailSent: true,

                    invoice,
                });
            }

            /**
             * ---------------------------------------------------------
             * PUT
             * ---------------------------------------------------------
             */
            case 'PUT': {
                if (!idParam) {
                    return res.status(400).json({
                        message: 'id query param is required',
                    });
                }

                const id = parseRequiredId(idParam);

                if (id === undefined) {
                    return res.status(400).json({
                        message: 'Invalid id',
                    });
                }

                const { fields, files } = await parseForm(req);

                const paidImageFile = getFile(files, 'paidImage');

                const unpaidImageFile = getFile(files, 'unpaidImage');

                const legacyImageFile = getFile(files, 'image');

                const finalPaidImageFile = paidImageFile || legacyImageFile;

                const finalUnpaidImageFile = unpaidImageFile || legacyImageFile;

                const name = getField(fields, 'name');

                const email = getField(fields, 'email');

                const businessName = getField(fields, 'businessName');

                const price = getField(fields, 'price');

                const contractId = getField(fields, 'contractId');

                const authId = getField(fields, 'authId');

                const transactionId = getField(fields, 'transactionId');

                const paid = getField(fields, 'paid');

                const paymentTypeRaw = getField(fields, 'paymentType');

                const subscriptionIntervalRaw = getField(fields, 'subscriptionInterval');

                const serviceFeePercentRaw = getField(fields, 'serviceFeePercent');

                const platformFeePercentRaw = getField(fields, 'platformFeePercent');

                const data: any = {};

                /**
                 * Image update behavior remains unchanged.
                 */
                if (finalPaidImageFile && finalUnpaidImageFile && finalPaidImageFile === finalUnpaidImageFile) {
                    const imageKey = await uploadFileToS3(finalPaidImageFile, 'uploads');

                    data.paidImage = imageKey;

                    data.unpaidImage = imageKey;
                } else {
                    if (finalPaidImageFile) {
                        data.paidImage = await uploadFileToS3(finalPaidImageFile, 'uploads');
                    }

                    if (finalUnpaidImageFile) {
                        data.unpaidImage = await uploadFileToS3(finalUnpaidImageFile, 'uploads');
                    }
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

                if (price !== undefined) {
                    data.price = price;
                }

                if (contractId !== undefined) {
                    if (contractId.trim() === '') {
                        data.contractId = null;
                    } else {
                        const parsed = Number(contractId);

                        if (!Number.isInteger(parsed) || parsed <= 0) {
                            return res.status(400).json({
                                message: 'Invalid contractId',
                            });
                        }

                        data.contractId = parsed;
                    }
                }

                if (authId !== undefined) {
                    if (authId.trim() === '') {
                        data.authId = null;
                    } else {
                        const parsed = Number(authId);

                        if (!Number.isInteger(parsed) || parsed <= 0) {
                            return res.status(400).json({
                                message: 'Invalid authId',
                            });
                        }

                        data.authId = parsed;
                    }
                }

                if (transactionId !== undefined) {
                    data.transactionId = transactionId || null;
                }

                if (paid !== undefined) {
                    const paidBoolean = parseBoolean(paid);

                    if (paidBoolean === undefined) {
                        return res.status(400).json({
                            message: 'Invalid paid value',
                        });
                    }

                    data.paid = paidBoolean;
                }

                if (paymentTypeRaw !== undefined) {
                    const parsedPaymentType = parsePaymentType(paymentTypeRaw);

                    if (parsedPaymentType === undefined) {
                        return res.status(400).json({
                            message: 'Invalid paymentType. Use one_time or subscription',
                        });
                    }

                    data.paymentType = parsedPaymentType;
                }

                if (subscriptionIntervalRaw !== undefined) {
                    const parsedSubscriptionInterval = parseSubscriptionInterval(subscriptionIntervalRaw);

                    if (parsedSubscriptionInterval === undefined) {
                        return res.status(400).json({
                            message: 'Invalid subscriptionInterval. For now use month',
                        });
                    }

                    data.subscriptionInterval = parsedSubscriptionInterval;
                }

                if (serviceFeePercentRaw !== undefined) {
                    const serviceFeePercent = parsePercent(serviceFeePercentRaw, DEFAULT_SERVICE_FEE_PERCENT);

                    if (serviceFeePercent === undefined) {
                        return res.status(400).json({
                            message: 'Invalid serviceFeePercent',
                        });
                    }

                    data.serviceFeePercent = serviceFeePercent;
                }

                if (platformFeePercentRaw !== undefined) {
                    const platformFeePercent = parsePercent(platformFeePercentRaw, DEFAULT_PLATFORM_FEE_PERCENT);

                    if (platformFeePercent === undefined) {
                        return res.status(400).json({
                            message: 'Invalid platformFeePercent',
                        });
                    }

                    data.platformFeePercent = platformFeePercent;
                }

                try {
                    const updated = await prisma.invoice.update({
                        where: {
                            id,
                        },

                        data,
                    });

                    return res.status(200).json({
                        message: 'Updated',

                        invoice: updated,
                    });
                } catch (error: unknown) {
                    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
                        return res.status(404).json({
                            message: 'Invoice not found',
                        });
                    }

                    throw error;
                }
            }

            /**
             * ---------------------------------------------------------
             * DELETE
             * ---------------------------------------------------------
             */
            case 'DELETE': {
                if (!idParam) {
                    return res.status(400).json({
                        message: 'id query param is required',
                    });
                }

                const id = parseRequiredId(idParam);

                if (id === undefined) {
                    return res.status(400).json({
                        message: 'Invalid id',
                    });
                }

                try {
                    const deleted = await prisma.invoice.delete({
                        where: {
                            id,
                        },
                    });

                    return res.status(200).json({
                        message: 'Deleted',

                        invoice: deleted,
                    });
                } catch (error: unknown) {
                    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
                        return res.status(404).json({
                            message: 'Invoice not found',
                        });
                    }

                    throw error;
                }
            }

            /**
             * ---------------------------------------------------------
             * UNSUPPORTED METHOD
             * ---------------------------------------------------------
             */
            default: {
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);

                return res.status(405).json({
                    message: 'Method not allowed',
                });
            }
        }
    } catch (error: unknown) {
        console.error('Error in /api/invoices:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return res.status(500).json({
            message: 'Internal server error',

            error: errorMessage,
        });
    }
}
