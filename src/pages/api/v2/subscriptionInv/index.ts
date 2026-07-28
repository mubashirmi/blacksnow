import prisma from '@/lib/prisma';
import type { File as FormidableFile } from 'formidable';
import formidable, { Fields, Files } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { getFileUrl, uploadFileToS3 } from '../../../../../bucket/bucketConfig';

export const config = {
    api: {
        bodyParser: false,
    },
};

type PaymentType = 'one_time' | 'subscription';
type SubscriptionInterval = 'month';

const DEFAULT_SERVICE_FEE_PERCENT = Number(process.env.INVOICE_SERVICE_FEE_PERCENT || 3);

const DEFAULT_PLATFORM_FEE_PERCENT = Number(process.env.INVOICE_PLATFORM_FEE_PERCENT || 7);

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

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function getSmtpTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';

    const port = Number(process.env.SMTP_PORT || 465);

    const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : port === 465;

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        throw new Error('SMTP_USER or SMTP_PASS is missing');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
    });
}

async function sendSubscriptionInvCreatedMail(params: {
    to: string;
    name?: string;
    businessName?: string;
    price?: string;
    transactionId?: string;
    paid?: boolean;
}) {
    const { to, name, businessName, price, transactionId, paid } = params;

    const transporter = getSmtpTransporter();

    await transporter.verify();

    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';

    const displayName = name || 'there';
    const safeDisplayName = escapeHtml(displayName);

    const safeBusinessName = businessName ? escapeHtml(businessName) : '';

    const safePrice = price ? escapeHtml(price) : '';

    const safeTransactionId = transactionId ? escapeHtml(transactionId) : '';

    await transporter.sendMail({
        from,
        to,
        subject: 'Subscription invoice created successfully',

        text: `Hi ${displayName},

Your subscription invoice has been created successfully.

${businessName ? `Business Name: ${businessName}` : ''}
${price ? `Price: ${price}` : ''}
${transactionId ? `Transaction ID: ${transactionId}` : ''}
Payment Status: ${paid ? 'Paid' : 'Unpaid'}

Thank you.`,

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>Hi ${safeDisplayName},</p>

                <p>
                    Your subscription invoice has been
                    created successfully.
                </p>

                ${businessName ? `<p><strong>Business Name:</strong> ${safeBusinessName}</p>` : ''}

                ${price ? `<p><strong>Price:</strong> ${safePrice}</p>` : ''}

                ${transactionId ? `<p><strong>Transaction ID:</strong> ${safeTransactionId}</p>` : ''}

                <p>
                    <strong>Payment Status:</strong>
                    ${paid ? 'Paid' : 'Unpaid'}
                </p>

                <p>Thank you.</p>
            </div>
        `,
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

async function serializeSubscriptionInv(subscriptionInv: any) {
    const [paidImageUrl, unpaidImageUrl] = await Promise.all([
        subscriptionInv.paidImage ? getFileUrl(subscriptionInv.paidImage) : Promise.resolve(null),

        subscriptionInv.unpaidImage ? getFileUrl(subscriptionInv.unpaidImage) : Promise.resolve(null),
    ]);

    return {
        ...subscriptionInv,
        paidImage: paidImageUrl,
        unpaidImage: unpaidImageUrl,
        Contract: removeContractPdf(subscriptionInv.Contract),
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    const contractIdParam = Array.isArray(req.query.contractId) ? req.query.contractId[0] : req.query.contractId;

    const authIdParam = Array.isArray(req.query.authId) ? req.query.authId[0] : req.query.authId;

    try {
        switch (req.method) {
            case 'GET': {
                const providedFilters = [idParam, contractIdParam, authIdParam].filter(
                    (value): value is string => typeof value === 'string' && value.trim() !== ''
                );

                if (providedFilters.length > 1) {
                    return res.status(400).json({
                        message: 'Provide only one of id, contractId, or authId',
                    });
                }

                if (idParam) {
                    const id = parseRequiredId(idParam);

                    if (id === undefined) {
                        return res.status(400).json({
                            message: 'Invalid id',
                        });
                    }

                    const subscriptionInv = await prisma.subscriptionInv.findUnique({
                        where: {
                            id,
                        },
                        include: {
                            Contract: true,
                        },
                    });

                    if (!subscriptionInv) {
                        return res.status(404).json({
                            message: 'Subscription invoice not found',
                        });
                    }

                    const result = await serializeSubscriptionInv(subscriptionInv);

                    return res.status(200).json({
                        subscriptionInv: result,
                        invoice: result,
                    });
                }

                if (contractIdParam) {
                    const contractId = parseRequiredId(contractIdParam);

                    if (contractId === undefined) {
                        return res.status(400).json({
                            message: 'Invalid contractId',
                        });
                    }

                    const subscriptionInvs = await prisma.subscriptionInv.findMany({
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

                    const results = await Promise.all(subscriptionInvs.map(serializeSubscriptionInv));

                    return res.status(200).json({
                        subscriptionInvs: results,
                        invoices: results,
                    });
                }

                if (authIdParam) {
                    const authId = parseRequiredId(authIdParam);

                    if (authId === undefined) {
                        return res.status(400).json({
                            message: 'Invalid authId',
                        });
                    }

                    const subscriptionInvs = await prisma.subscriptionInv.findMany({
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

                    const results = await Promise.all(subscriptionInvs.map(serializeSubscriptionInv));

                    return res.status(200).json({
                        subscriptionInvs: results,
                        invoices: results,
                    });
                }

                return res.status(400).json({
                    message: 'id, contractId, or authId query param is required',
                });
            }

            case 'POST': {
                const { fields, files } = await parseForm(req);

                const paidImageFile = getFile(files, 'paidImage');

                const unpaidImageFile = getFile(files, 'unpaidImage');

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

                const uploadedImages = await uploadImagePair({
                    paidImageFile: finalPaidImageFile,
                    unpaidImageFile: finalUnpaidImageFile,
                });

                const subscriptionInv = await prisma.subscriptionInv.create({
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

                        paymentType: parsedPaymentType || 'subscription',

                        subscriptionInterval: parsedSubscriptionInterval || 'month',

                        serviceFeePercent,
                        platformFeePercent,
                    },
                });

                try {
                    await sendSubscriptionInvCreatedMail({
                        to: email,
                        name,
                        businessName,
                        price,
                        transactionId,
                        paid: subscriptionInv.paid,
                    });
                } catch (mailError: unknown) {
                    console.error('Subscription invoice created but email failed:', mailError);

                    const mailErrorMessage = mailError instanceof Error ? mailError.message : 'Unknown mail error';

                    return res.status(201).json({
                        message: 'Created, but email failed to send',
                        mailSent: false,
                        mailError: mailErrorMessage,
                        subscriptionInv,
                        invoice: subscriptionInv,
                    });
                }

                return res.status(201).json({
                    message: 'Created and email sent',
                    mailSent: true,
                    subscriptionInv,
                    invoice: subscriptionInv,
                });
            }

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
                    const updated = await prisma.subscriptionInv.update({
                        where: {
                            id,
                        },
                        data,
                    });

                    return res.status(200).json({
                        message: 'Updated',
                        subscriptionInv: updated,
                        invoice: updated,
                    });
                } catch (error: unknown) {
                    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
                        return res.status(404).json({
                            message: 'Subscription invoice not found',
                        });
                    }

                    throw error;
                }
            }

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
                    const deleted = await prisma.subscriptionInv.delete({
                        where: {
                            id,
                        },
                    });

                    return res.status(200).json({
                        message: 'Deleted',
                        subscriptionInv: deleted,
                        invoice: deleted,
                    });
                } catch (error: unknown) {
                    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
                        return res.status(404).json({
                            message: 'Subscription invoice not found',
                        });
                    }

                    throw error;
                }
            }

            default: {
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);

                return res.status(405).json({
                    message: 'Method not allowed',
                });
            }
        }
    } catch (error: unknown) {
        console.error('Error in /api/subscription-invoices:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return res.status(500).json({
            message: 'Internal server error',
            error: errorMessage,
        });
    }
}
