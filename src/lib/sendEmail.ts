// src/lib/sendEmail.ts

import type { MailDataRequired } from '@sendgrid/mail';
import sgMail from '@sendgrid/mail';

export type SendEmailAttachment = {
    content: string;
    filename: string;
    type?: string;
    disposition?: 'attachment' | 'inline';
    content_id?: string;
};

type SendEmailParams = {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
    attachments?: SendEmailAttachment[];
};

export async function sendEmail({ to, subject, text, html, replyTo, attachments }: SendEmailParams) {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const fromName = process.env.SENDGRID_FROM_NAME || 'Black Snow Holdings';

    if (!apiKey) {
        throw new Error('SENDGRID_API_KEY is missing');
    }

    if (!fromEmail) {
        throw new Error('SENDGRID_FROM_EMAIL is missing');
    }

    if (!text && !html) {
        throw new Error('Email requires either text or html content');
    }

    sgMail.setApiKey(apiKey);

    const baseMsg = {
        to,
        from: {
            email: fromEmail,
            name: fromName,
        },
        subject,
        ...(replyTo ? { replyTo } : {}),
        ...(attachments?.length ? { attachments } : {}),
    };

    let msg: MailDataRequired;

    if (html) {
        msg = {
            ...baseMsg,
            html,
            ...(text ? { text } : {}),
        } as MailDataRequired;
    } else {
        msg = {
            ...baseMsg,
            text: text as string,
        } as MailDataRequired;
    }

    try {
        const [response] = await sgMail.send(msg);

        return {
            statusCode: response.statusCode,
            messageId: response.headers['x-message-id'],
        };
    } catch (error: any) {
        console.error('SendGrid safe error:', {
            message: error?.message,
            code: error?.code,
            statusCode: error?.response?.statusCode,
            responseBody: error?.response?.body,
        });

        throw error;
    }
}
