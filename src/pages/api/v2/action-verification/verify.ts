import { TOKEN_TTL_MS, assertChallengeSecret, hashValue } from '@/lib/actionVerification';
import { ApiError, sendApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const challengeId = String(req.body?.challengeId ?? '');
        const challengeToken = req.body?.challengeToken;
        const otp = String(req.body?.otp ?? '').trim();
        if (!challengeId || !challengeToken || !/^\d{6}$/.test(otp)) {
            throw new ApiError(400, 'INVALID_REQUEST', 'A valid challengeId, challengeToken, and 6-digit code are required');
        }

        const challenge = await prisma.actionVerification.findUnique({ where: { id: challengeId } });
        if (!challenge || challenge.consumedAt) throw new ApiError(404, 'CHALLENGE_NOT_FOUND', 'Verification challenge was not found');
        assertChallengeSecret(challenge.challengeSecretHash, challengeToken);
        if (challenge.verifiedAt) throw new ApiError(409, 'ALREADY_VERIFIED', 'This verification challenge has already been used');
        if (challenge.expiresAt <= new Date()) throw new ApiError(410, 'OTP_EXPIRED', 'The verification code has expired');
        if (challenge.attempts >= challenge.maxAttempts) throw new ApiError(429, 'TOO_MANY_ATTEMPTS', 'Maximum verification attempts reached');

        const valid = await bcrypt.compare(otp, challenge.otpHash);
        if (!valid) {
            const result = await prisma.actionVerification.updateMany({
                where: { id: challenge.id, verifiedAt: null, attempts: { lt: challenge.maxAttempts } },
                data: { attempts: { increment: 1 } },
            });
            const remainingAttempts = Math.max(0, challenge.maxAttempts - challenge.attempts - (result.count ? 1 : 0));
            throw new ApiError(
                401,
                'INVALID_OTP',
                remainingAttempts ? `Invalid verification code. ${remainingAttempts} attempts remaining` : 'Maximum verification attempts reached'
            );
        }

        const verificationToken = randomBytes(32).toString('base64url');
        const tokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MS);
        const updated = await prisma.actionVerification.updateMany({
            where: { id: challenge.id, verifiedAt: null, attempts: { lt: challenge.maxAttempts }, expiresAt: { gt: new Date() } },
            data: { verifiedAt: new Date(), verificationTokenHash: hashValue(verificationToken), tokenExpiresAt },
        });
        if (updated.count !== 1) throw new ApiError(409, 'CHALLENGE_CHANGED', 'The verification challenge is no longer valid');

        return res.status(200).json({ message: 'Verification successful', verificationToken, expiresInSeconds: Math.floor(TOKEN_TTL_MS / 1000) });
    } catch (error) {
        return sendApiError(res, error);
    }
}
