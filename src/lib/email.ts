import logger from '@/lib/logger';
import emailjs, { EmailJSResponseStatus } from '@emailjs/nodejs';

export const sendEmail = async (templateParams: Record<string, unknown> | undefined) => {
    logger.defaultMeta.service = 'email_service';
    try {
        await emailjs.send(process.env.NEXT_PRIVATE_EMAIL_SERVICE_ID || '', process.env.NEXT_PRIVATE_EMAIL_TEMPLATE_ID || '', templateParams, {
            publicKey: process.env.NEXT_PRIVATE_EMAIL_PUBLIC_KEY || '',
            privateKey: process.env.NEXT_PRIVATE_EMAIL_PUBLIC_KEY || '',
        });
    } catch (err) {
        if (err instanceof EmailJSResponseStatus) {
            logger.error('EmailJS Error...', err);
            return;
        }
        logger.error('General email error', err);
    }
};
