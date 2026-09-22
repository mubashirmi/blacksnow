// /pages/api/email/send-with-pdf.ts

import formidable, { type Fields, type Files, type File as FormidableFile } from 'formidable';

import sgMail from '@sendgrid/mail';
import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

const MAX_FILE_SIZE = Number(process.env.EMAIL_PDF_MAX_SIZE_MB || 10) * 1024 * 1024;

/**
 * Parse multipart/form-data request
 */
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

            resolve({
                fields,
                files,
            });
        });
    });
}

/**
 * Get a string field safely from Formidable fields
 */
function getField(fields: Fields, key: string): string | undefined {
    const value = fields[key];

    if (Array.isArray(value)) {
        return value[0] !== undefined ? String(value[0]) : undefined;
    }

    return value !== undefined && value !== null ? String(value) : undefined;
}

/**
 * Get uploaded file safely
 */
function getFile(files: Files, key: string): FormidableFile | undefined {
    const value = files[key];

    return Array.isArray(value) ? value[0] : value;
}

/**
 * Basic email validation
 */
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Prevent unsafe attachment filenames
 */
function sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^\w.\-() ]+/g, '_').trim() || 'attachment.pdf';
}

/**
 * Verify that uploaded file actually starts with PDF signature
 */
function isPdf(buffer: Buffer): boolean {
    return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

/**
 * Configure SendGrid
 */
function configureSendGrid(): void {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
        throw new Error('SENDGRID_API_KEY is required');
    }

    sgMail.setApiKey(apiKey);
}

/**
 * API handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);

        return res.status(405).json({
            error: 'Method not allowed',
        });
    }

    let pdfFile: FormidableFile | undefined;

    try {
        /**
         * Parse multipart request
         */
        const { fields, files } = await parseForm(req);

        const to = getField(fields, 'to');
        const subject = getField(fields, 'subject');
        const text = getField(fields, 'text');

        pdfFile = getFile(files, 'pdf');

        /**
         * Validate recipient
         */
        if (!to || !isValidEmail(to)) {
            return res.status(400).json({
                error: 'Valid recipient email is required',
            });
        }

        /**
         * Validate subject
         */
        if (!subject?.trim()) {
            return res.status(400).json({
                error: 'Subject is required',
            });
        }

        /**
         * Validate email text
         */
        if (!text?.trim()) {
            return res.status(400).json({
                error: 'Text is required',
            });
        }

        /**
         * Validate PDF existence
         */
        if (!pdfFile) {
            return res.status(400).json({
                error: 'PDF file is required',
            });
        }

        /**
         * Read uploaded PDF
         */
        const pdfBuffer = await fs.readFile(pdfFile.filepath);

        /**
         * Validate actual PDF signature
         */
        if (!isPdf(pdfBuffer)) {
            return res.status(400).json({
                error: 'Uploaded file is not a valid PDF',
            });
        }

        /**
         * Sanitize attachment filename
         */
        const fileName = sanitizeFileName(pdfFile.originalFilename || 'attachment.pdf');

        /**
         * Get SendGrid configuration
         */
        const fromEmail = process.env.SENDGRID_FROM_EMAIL;
        const fromName = process.env.SENDGRID_FROM_NAME || 'Black Snow Holdings';

        if (!fromEmail) {
            throw new Error('SENDGRID_FROM_EMAIL is required');
        }

        /**
         * Configure SendGrid
         */
        configureSendGrid();

        /**
         * Send email
         *
         * SendGrid requires attachment content to be Base64 encoded.
         */
        const [result] = await sgMail.send({
            from: {
                email: fromEmail,
                name: fromName,
            },

            // Keep existing functionality:
            // recipient comes from multipart form field "to"
            to,

            subject: subject.trim(),

            text: text.trim(),

            attachments: [
                {
                    filename: fileName,
                    content: pdfBuffer.toString('base64'),
                    type: 'application/pdf',
                    disposition: 'attachment',
                },
            ],
        });

        /**
         * SendGrid normally returns the message ID in the headers.
         */
        const messageId = result?.headers?.['x-message-id'] || result?.headers?.['X-Message-Id'] || null;

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            messageId,
        });
    } catch (error: unknown) {
        console.error('Send email error:', error);

        /**
         * Return more useful SendGrid error details when available
         */
        if (typeof error === 'object' && error !== null && 'response' in error) {
            const sendGridError = error as {
                response?: {
                    body?: unknown;
                };
            };

            console.error('SendGrid error response:', sendGridError.response?.body);
        }

        return res.status(500).json({
            error: 'Failed to send email',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    } finally {
        /**
         * Always remove Formidable temporary upload
         */
        if (pdfFile?.filepath) {
            await fs.unlink(pdfFile.filepath).catch(() => undefined);
        }
    }
}
