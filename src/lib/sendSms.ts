// lib/sendSms.ts
import twilio from 'twilio';

type SendSmsParams = {
    to: string;
    message: string;
};

type SendSmsResult = {
    success: boolean;
    sid?: string;
    status?: string;
    error?: string;
};

export async function sendSms({ to, message }: SendSmsParams): Promise<SendSmsResult> {
    try {
        if (!to || !message) {
            return {
                success: false,
                error: 'Phone number and message are required.',
            };
        }

        // Example valid numbers:
        // +923001234567
        // +14155552671
        const phoneRegex = /^\+[1-9]\d{7,14}$/;

        if (!phoneRegex.test(to)) {
            return {
                success: false,
                error: 'Phone number must be in E.164 format, e.g. +923001234567.',
            };
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            return {
                success: false,
                error: 'Twilio credentials are missing in environment variables.',
            };
        }

        const client = twilio(accountSid, authToken);

        const sms = await client.messages.create({
            body: message,
            from: fromNumber,
            to,
        });

        return {
            success: true,
            sid: sms.sid,
            status: sms.status,
        };
    } catch (error: any) {
        console.error('Send SMS error:', error);

        return {
            success: false,
            error: error.message || 'Failed to send SMS.',
        };
    }
}
