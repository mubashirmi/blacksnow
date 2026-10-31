import { MAX_OTP_ATTEMPTS, OTP_TTL_MS, RESEND_COOLDOWN_SECONDS, getClientIp, hashActionContext, hashValue, isSensitiveAction } from '@/lib/actionVerification';
import { ApiError, sendApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail';
import { buildOtpHtml, buildOtpText, getLogoAttachment } from '@/pages/api/auth/auth-email';
import bcrypt from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_USER_ATTEMPTS = 5;
const MAX_IP_ATTEMPTS = 10;

function maskEmail(email: string) {
    const [localPart, domain = ''] = email.split('@');
    const visible = localPart.slice(0, Math.min(2, localPart.length));
    return `${visible}${'*'.repeat(Math.max(3, localPart.length - visible.length))}@${domain}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const userId = Number(req.body?.userId);
        const action = req.body?.action;
        const context = req.body?.context ?? {};
        const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            throw new ApiError(400, 'INVALID_USER_ID', 'A valid userId URL parameter is required');
        }
        if (!isSensitiveAction(action)) {
            throw new ApiError(400, 'INVALID_REQUEST', 'A valid action is required');
        }
        if (!email || !password) {
            throw new ApiError(400, 'INVALID_REQUEST', 'Email and password are required');
        }

        const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
        const userIdentifier = hashValue(`user:${userId}`);
        const ipIdentifier = hashValue(`ip:${getClientIp(req)}`);
        const [userAttempts, ipAttempts] = await Promise.all([
            prisma.actionVerificationAttempt.count({ where: { identifierHash: userIdentifier, createdAt: { gte: windowStart } } }),
            prisma.actionVerificationAttempt.count({ where: { identifierHash: ipIdentifier, createdAt: { gte: windowStart } } }),
        ]);

        if (userAttempts >= MAX_USER_ATTEMPTS || ipAttempts >= MAX_IP_ATTEMPTS) {
            res.setHeader('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
            throw new ApiError(429, 'RATE_LIMITED', 'Too many verification requests. Please try again later');
        }

        await prisma.actionVerificationAttempt.createMany({ data: [{ identifierHash: userIdentifier }, { identifierHash: ipIdentifier }] });

        const user = await prisma.auth.findUnique({
            where: { id: userId },
            select: { id: true, email: true, firstName: true, lastName: true, password: true, status: true },
        });
        if (!user || user.status !== 'active') throw new ApiError(404, 'USER_NOT_FOUND', 'No active user was found for the provided userId');

        const emailMatches = user.email.trim().toLowerCase() === email.toLowerCase();
        const passwordMatches = emailMatches ? await bcrypt.compare(password, user.password) : false;
        if (!passwordMatches) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

        const otp = String(randomInt(100000, 1000000));
        const otpHash = await bcrypt.hash(otp, 12);
        const challengeSecret = randomBytes(32).toString('base64url');
        const challenge = await prisma.actionVerification.create({
            data: {
                authId: user.id,
                action,
                contextHash: hashActionContext(context),
                challengeSecretHash: hashValue(challengeSecret),
                otpHash,
                expiresAt: new Date(Date.now() + OTP_TTL_MS),
                maxAttempts: MAX_OTP_ATTEMPTS,
                otpSentAt: new Date(),
            },
            select: { id: true },
        });

        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        try {
            await sendEmail({
                to: user.email,
                subject: 'Black Snow Holdings - Your verification code',
                text: buildOtpText(fullName, Number(otp)),
                html: buildOtpHtml(fullName, Number(otp)),
                attachments: [getLogoAttachment()],
            });
        } catch {
            await prisma.actionVerification.deleteMany({ where: { id: challenge.id } });
            throw new ApiError(502, 'OTP_DELIVERY_FAILED', 'We could not send the verification email. Please try again');
        }

        return res.status(200).json({
            message: 'Verification code sent',
            challengeId: challenge.id,
            challengeToken: challengeSecret,
            maskedEmail: maskEmail(user.email),
            expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
            resendCooldownSeconds: RESEND_COOLDOWN_SECONDS,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
