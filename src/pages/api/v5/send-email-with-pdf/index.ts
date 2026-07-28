// /pages/api/email/send-with-pdf.ts

import formidable, { type Fields, type Files, type File as FormidableFile } from 'formidable';
import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export const config = {
    api: {
        bodyParser: false,
    },
};

const MAX_FILE_SIZE = Number(process.env.EMAIL_PDF_MAX_SIZE_MB || 10) * 1024 * 1024;

function parseForm(req: NextApiRequest): Promise<{
    fields: Fields;
    files: Files;
}> {
    const form = formidable({
        multiples: false,
        keepExtensions: true,
        maxFileSize: MAX_FILE_SIZE,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (error, fields, files) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({ fields, files });
        });
    });
}

function getField(fields: Fields, key: string): string | undefined {
    const value = fields[key];

    if (Array.isArray(value)) {
        return value[0] !== undefined ? String(value[0]) : undefined;
    }

    return value !== undefined && value !== null ? String(value) : undefined;
}

function getFile(files: Files, key: string): FormidableFile | undefined {
    const value = files[key];

    return Array.isArray(value) ? value[0] : value;
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^\w.\-() ]+/g, '_').trim() || 'attachment.pdf';
}

function isPdf(buffer: Buffer): boolean {
    return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

function getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';

    const port = Number(process.env.SMTP_PORT || 465);

    const user = 'malikmubashir.3175709877@gmail.com';
    const pass = 'fhwd vueu fbnl agao';

    if (!user || !pass) {
        throw new Error('SMTP_USER and SMTP_PASS are required');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);

        return res.status(405).json({
            error: 'Method not allowed',
        });
    }

    let pdfFile: FormidableFile | undefined;

    try {
        const { fields, files } = await parseForm(req);

        const to = getField(fields, 'to');
        const subject = getField(fields, 'subject');
        const text = getField(fields, 'text');

        pdfFile = getFile(files, 'pdf');

        if (!to || !isValidEmail(to)) {
            return res.status(400).json({
                error: 'Valid recipient email is required',
            });
        }

        if (!subject?.trim()) {
            return res.status(400).json({
                error: 'Subject is required',
            });
        }

        if (!text?.trim()) {
            return res.status(400).json({
                error: 'Text is required',
            });
        }

        if (!pdfFile) {
            return res.status(400).json({
                error: 'PDF file is required',
            });
        }

        const pdfBuffer = await fs.readFile(pdfFile.filepath);

        if (!isPdf(pdfBuffer)) {
            return res.status(400).json({
                error: 'Uploaded file is not a valid PDF',
            });
        }

        const fileName = sanitizeFileName(pdfFile.originalFilename || 'attachment.pdf');

        const transporter = getTransporter();

        const result = await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to,
            subject: subject.trim(),
            text: text.trim(),
            attachments: [
                {
                    filename: fileName,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            messageId: result.messageId,
        });
    } catch (error: unknown) {
        console.error('Send email error:', error);

        return res.status(500).json({
            error: 'Failed to send email',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    } finally {
        if (pdfFile?.filepath) {
            await fs.unlink(pdfFile.filepath).catch(() => undefined);
        }
    }
}
