import { MAX_SENDS, OTP_TTL_MS, RESEND_COOLDOWN_SECONDS, assertChallengeSecret } from '@/lib/actionVerification';
import { ApiError, sendApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail';
import { buildOtpHtml, buildOtpText, getLogoAttachment } from '@/pages/api/auth/auth-email';
import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const challengeId = String(req.body?.challengeId ?? '');
        const challengeToken = req.body?.challengeToken;
        if (!challengeId || !challengeToken) throw new ApiError(400, 'INVALID_REQUEST', 'challengeId and challengeToken are required');

        const challenge = await prisma.actionVerification.findUnique({
            where: { id: challengeId },
            include: { auth: { select: { email: true, firstName: true, lastName: true } } },
        });
        if (!challenge || challenge.verifiedAt || challenge.consumedAt) throw new ApiError(404, 'CHALLENGE_NOT_FOUND', 'Verification challenge was not found');
        assertChallengeSecret(challenge.challengeSecretHash, challengeToken);
        if (challenge.sendCount >= MAX_SENDS) throw new ApiError(429, 'RESEND_LIMIT_REACHED', 'Maximum verification-code sends reached');

        const retryAfter = RESEND_COOLDOWN_SECONDS - Math.floor((Date.now() - challenge.lastSentAt.getTime()) / 1000);
        if (retryAfter > 0) {
            res.setHeader('Retry-After', String(retryAfter));
            throw new ApiError(429, 'RESEND_COOLDOWN', `Please wait ${retryAfter} seconds before requesting another code`);
        }

        const reserved = await prisma.actionVerification.updateMany({
            where: { id: challenge.id, sendCount: challenge.sendCount, lastSentAt: challenge.lastSentAt, verifiedAt: null, consumedAt: null },
            data: { sendCount: { increment: 1 }, lastSentAt: new Date() },
        });
        if (reserved.count !== 1) throw new ApiError(409, 'CHALLENGE_CHANGED', 'The verification challenge changed. Please try again');

        const otp = String(randomInt(100000, 1000000));
        const otpHash = await bcrypt.hash(otp, 12);
        const expiresAt = new Date(Date.now() + OTP_TTL_MS);
        const fullName = `${challenge.auth.firstName || ''} ${challenge.auth.lastName || ''}`.trim();

        try {
            await sendEmail({
                to: challenge.auth.email,
                subject: 'Black Snow Holdings - Your verification code',
                text: buildOtpText(fullName, Number(otp)),
                html: buildOtpHtml(fullName, Number(otp)),
                attachments: [getLogoAttachment()],
            });
        } catch {
            await prisma.actionVerification.deleteMany({ where: { id: challenge.id } });
            throw new ApiError(502, 'OTP_DELIVERY_FAILED', 'We could not resend the verification email. Please restart verification');
        }

        await prisma.actionVerification.update({ where: { id: challenge.id }, data: { otpHash, expiresAt, attempts: 0 } });
        return res.status(200).json({
            message: 'A new verification code was sent',
            expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
            resendCooldownSeconds: RESEND_COOLDOWN_SECONDS,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
