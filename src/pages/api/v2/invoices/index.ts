import prisma from '@/lib/prisma';
import type { File as FormidableFile } from 'formidable';
import formidable, { Fields, Files } from 'formidable';
import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { getFileUrl, uploadFileToS3 } from '../../../../../bucket/bucketConfig';

export const config = {
    api: {
        bodyParser: false,
    },
};

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
    const form = formidable({
        multiples: false,
        keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
}

function getField(fields: Fields, key: string): string | undefined {
    const value = fields[key];

    if (Array.isArray(value)) {
        const first = value[0];
        return first === undefined || first === null ? undefined : String(first);
    }

    if (value === undefined || value === null) return undefined;

    return String(value);
}

function getFile(files: Files, key: string): FormidableFile | undefined {
    const value = files[key];
    return Array.isArray(value) ? value[0] : value;
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^\w.\-() ]+/g, '_');
}

function getUploadedFileName(pdfFile: FormidableFile, invoiceName?: string): string {
    const originalName = pdfFile.originalFilename;

    if (originalName) {
        return sanitizeFileName(originalName);
    }

    if (invoiceName) {
        return `${sanitizeFileName(invoiceName)}.pdf`;
    }

    return 'invoice.pdf';
}

function parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined) return undefined;

    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'paid'].includes(normalized)) {
        return true;
    }

    if (['false', '0', 'no', 'unpaid'].includes(normalized)) {
        return false;
    }

    return undefined;
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

async function sendInvoiceCreatedMail(params: {
    to: string;
    name?: string;
    businessName?: string;
    price?: string;
    transactionId?: string;
    paid?: boolean;
    pdfFile: FormidableFile;
    pdfBuffer: Buffer;
}) {
    const { to, name, businessName, price, transactionId, paid, pdfFile, pdfBuffer } = params;

    const transporter = getSmtpTransporter();

    await transporter.verify();

    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';
    const fileName = getUploadedFileName(pdfFile, businessName || name);

    const displayName = name || 'there';
    const safeDisplayName = escapeHtml(displayName);
    const safeBusinessName = businessName ? escapeHtml(businessName) : '';
    const safePrice = price ? escapeHtml(price) : '';
    const safeTransactionId = transactionId ? escapeHtml(transactionId) : '';

    await transporter.sendMail({
        from,
        to,
        subject: 'Invoice created successfully',
        text: `Hi ${displayName},

Your invoice has been created successfully.

${businessName ? `Business Name: ${businessName}` : ''}
${price ? `Price: ${price}` : ''}
${transactionId ? `Transaction ID: ${transactionId}` : ''}
Payment Status: ${paid ? 'Paid' : 'Unpaid'}

Please find the attached PDF copy of your invoice.

Thank you.`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>Hi ${safeDisplayName},</p>

                <p>Your invoice has been created successfully.</p>

                ${businessName ? `<p><strong>Business Name:</strong> ${safeBusinessName}</p>` : ''}

                ${price ? `<p><strong>Price:</strong> ${safePrice}</p>` : ''}

                ${transactionId ? `<p><strong>Transaction ID:</strong> ${safeTransactionId}</p>` : ''}

                <p><strong>Payment Status:</strong> ${paid ? 'Paid' : 'Unpaid'}</p>

                <p>Please find the attached PDF copy of your invoice.</p>

                <p>Thank you.</p>
            </div>
        `,
        attachments: [
            {
                filename: fileName,
                content: pdfBuffer,
                contentType: pdfFile.mimetype || 'application/pdf',
            },
        ],
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const contractIdParam = Array.isArray(req.query.contractId) ? req.query.contractId[0] : req.query.contractId;
    const authIdParam = Array.isArray(req.query.authId) ? req.query.authId[0] : req.query.authId;

    try {
        switch (req.method) {
            case 'GET': {
                const providedFilters = [idParam, contractIdParam, authIdParam].filter(Boolean);

                if (providedFilters.length > 1) {
                    return res.status(400).json({
                        message: 'Provide only one of id, contractId, or authId',
                    });
                }

                if (idParam) {
                    const id = Number(idParam);

                    if (!Number.isFinite(id)) {
                        return res.status(400).json({ message: 'Invalid id' });
                    }

                    const invoice = await prisma.invoice.findUnique({
                        where: { id },
                        include: { Contract: true },
                    });

                    if (!invoice) {
                        return res.status(404).json({ message: 'Invoice not found' });
                    }

                    const signedPdfUrl = invoice.Contract?.pdf ? await getFileUrl(invoice.Contract.pdf) : null;
                    const imageUrl = invoice.image ? await getFileUrl(invoice.image) : null;

                    const modified = {
                        ...invoice,
                        image: imageUrl,
                        Contract: invoice.Contract ? { ...invoice.Contract, pdf: signedPdfUrl } : null,
                    };

                    return res.status(200).json({ invoice: modified });
                }

                if (contractIdParam) {
                    const contractId = Number(contractIdParam);

                    if (!Number.isFinite(contractId)) {
                        return res.status(400).json({ message: 'Invalid contractId' });
                    }

                    const invoices = await prisma.invoice.findMany({
                        where: { contractId },
                        orderBy: { createdAt: 'desc' },
                        include: {
                            Contract: true,
                        },
                    });

                    const modified = await Promise.all(
                        invoices.map(async (data) => {
                            const signedPdfUrl = data.Contract?.pdf ? await getFileUrl(data.Contract.pdf) : null;
                            const imageUrl = data.image ? await getFileUrl(data.image) : null;

                            return {
                                ...data,
                                image: imageUrl,
                                Contract: data.Contract ? { ...data.Contract, pdf: signedPdfUrl } : null,
                            };
                        })
                    );

                    return res.status(200).json({ invoices: modified });
                }

                if (authIdParam) {
                    const authId = Number(authIdParam);

                    if (!Number.isFinite(authId)) {
                        return res.status(400).json({ message: 'Invalid authId' });
                    }

                    const invoices = await prisma.invoice.findMany({
                        where: { authId },
                        orderBy: { createdAt: 'desc' },
                        include: {
                            Contract: true,
                        },
                    });

                    const modified = await Promise.all(
                        invoices.map(async (data) => {
                            const signedPdfUrl = data.Contract?.pdf ? await getFileUrl(data.Contract.pdf) : null;
                            const imageUrl = data.image ? await getFileUrl(data.image) : null;

                            return {
                                ...data,
                                image: imageUrl,
                                Contract: data.Contract ? { ...data.Contract, pdf: signedPdfUrl } : null,
                            };
                        })
                    );

                    return res.status(200).json({ invoices: modified });
                }

                return res.status(400).json({
                    message: 'id, contractId, or authId query param is required',
                });
            }

            case 'POST': {
                const { fields, files } = await parseForm(req);

                const imageFile = getFile(files, 'image');
                const pdfFile = getFile(files, 'pdf');

                const contractId = getField(fields, 'contractId');
                const name = getField(fields, 'name');
                const email = getField(fields, 'email');
                const businessName = getField(fields, 'businessName');
                const price = getField(fields, 'price');
                const authId = getField(fields, 'authId');
                const transactionId = getField(fields, 'transactionId');
                const paid = getField(fields, 'paid');

                if (!imageFile) {
                    return res.status(400).json({ message: 'Invalid image' });
                }

                if (!pdfFile) {
                    return res.status(400).json({ message: 'Invalid pdf' });
                }

                if (!email || !isValidEmail(email)) {
                    return res.status(400).json({
                        message: 'Valid email is required',
                    });
                }

                let contractIdNumber: number | null = null;

                if (contractId !== undefined && contractId !== null) {
                    const parsed = Number(contractId);

                    if (!Number.isFinite(parsed)) {
                        return res.status(400).json({ message: 'Invalid contractId' });
                    }

                    contractIdNumber = parsed;
                }

                let authIdNumber: number | null = null;

                if (authId !== undefined && authId !== null) {
                    const parsed = Number(authId);

                    if (!Number.isFinite(parsed)) {
                        return res.status(400).json({ message: 'Invalid authId' });
                    }

                    authIdNumber = parsed;
                }

                const paidBoolean = parseBoolean(paid);

                if (paid !== undefined && paidBoolean === undefined) {
                    return res.status(400).json({
                        message: 'Invalid paid value',
                    });
                }

                const pdfBuffer = await fs.readFile(pdfFile.filepath);
                const s3Key = await uploadFileToS3(imageFile, 'uploads');

                const invoice = await prisma.invoice.create({
                    data: {
                        name,
                        email,
                        businessName,
                        price,
                        authId: authIdNumber ?? undefined,
                        image: s3Key,
                        contractId: contractIdNumber ?? undefined,
                        transactionId,
                        paid: paidBoolean ?? false,
                    },
                });

                try {
                    await sendInvoiceCreatedMail({
                        to: email,
                        name,
                        businessName,
                        price,
                        transactionId,
                        paid: invoice.paid,
                        pdfFile,
                        pdfBuffer,
                    });
                } catch (mailError: any) {
                    console.error('Invoice created but email failed:', mailError);

                    return res.status(201).json({
                        message: 'Created, but email failed to send',
                        mailSent: false,
                        mailError: mailError?.message,
                        invoice,
                    });
                }

                return res.status(201).json({
                    message: 'Created and email sent',
                    mailSent: true,
                    invoice,
                });
            }

            case 'PUT': {
                if (!idParam) {
                    return res.status(400).json({ message: 'id query param is required' });
                }

                const id = Number(idParam);

                if (!Number.isFinite(id)) {
                    return res.status(400).json({ message: 'Invalid id' });
                }

                const { fields, files } = await parseForm(req);

                const imageFile = getFile(files, 'image');

                const name = getField(fields, 'name');
                const email = getField(fields, 'email');
                const businessName = getField(fields, 'businessName');
                const price = getField(fields, 'price');
                const contractId = getField(fields, 'contractId');
                const authId = getField(fields, 'authId');
                const transactionId = getField(fields, 'transactionId');
                const paid = getField(fields, 'paid');

                const data: any = {};

                if (imageFile) {
                    const s3Key = await uploadFileToS3(imageFile, 'uploads');
                    data.image = s3Key;
                }

                if (name !== undefined) {
                    data.name = name;
                }

                if (email !== undefined) {
                    if (!isValidEmail(email)) {
                        return res.status(400).json({ message: 'Invalid email' });
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
                    const parsed = Number(contractId);

                    if (!Number.isFinite(parsed)) {
                        return res.status(400).json({ message: 'Invalid contractId' });
                    }

                    data.contractId = parsed;
                }

                if (authId !== undefined) {
                    const parsed = Number(authId);

                    if (!Number.isFinite(parsed)) {
                        return res.status(400).json({ message: 'Invalid authId' });
                    }

                    data.authId = parsed;
                }

                if (transactionId !== undefined) {
                    data.transactionId = transactionId;
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

                try {
                    const updated = await prisma.invoice.update({
                        where: { id },
                        data,
                    });

                    return res.status(200).json({
                        message: 'Updated',
                        invoice: updated,
                    });
                } catch (e: any) {
                    if (e.code === 'P2025') {
                        return res.status(404).json({ message: 'Invoice not found' });
                    }

                    throw e;
                }
            }

            case 'DELETE': {
                if (!idParam) {
                    return res.status(400).json({ message: 'id query param is required' });
                }

                const id = Number(idParam);

                if (!Number.isFinite(id)) {
                    return res.status(400).json({ message: 'Invalid id' });
                }

                try {
                    const deleted = await prisma.invoice.delete({
                        where: { id },
                    });

                    return res.status(200).json({
                        message: 'Deleted',
                        invoice: deleted,
                    });
                } catch (e: any) {
                    if (e.code === 'P2025') {
                        return res.status(404).json({ message: 'Invoice not found' });
                    }

                    throw e;
                }
            }

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (e: any) {
        console.error('Error in /api/invoices:', e);

        return res.status(500).json({
            message: 'Internal server error',
            error: e?.message,
        });
    }
}
