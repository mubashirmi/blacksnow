import { ApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { createHash, timingSafeEqual } from 'crypto';
import type { NextApiRequest } from 'next';

export const SENSITIVE_ACTIONS = ['unsubscribe', 'feedback', 'pause_subscription', 'resume_subscription'] as const;
export type SensitiveAction = (typeof SENSITIVE_ACTIONS)[number];

export const OTP_TTL_MS = 10 * 60 * 1000;
export const TOKEN_TTL_MS = 5 * 60 * 1000;
export const RESEND_COOLDOWN_SECONDS = 60;
export const MAX_OTP_ATTEMPTS = 5;
export const MAX_SENDS = 3;

export function isSensitiveAction(value: unknown): value is SensitiveAction {
    return typeof value === 'string' && SENSITIVE_ACTIONS.includes(value as SensitiveAction);
}

function stableValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(stableValue);
    if (value && typeof value === 'object') {
        return Object.keys(value as Record<string, unknown>)
            .sort()
            .reduce<Record<string, unknown>>((result, key) => {
                result[key] = stableValue((value as Record<string, unknown>)[key]);
                return result;
            }, {});
    }
    return value;
}

export function hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

export function hashActionContext(context: unknown): string {
    return hashValue(JSON.stringify(stableValue(context ?? {})));
}

export function getClientIp(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
    return String(firstForwarded || req.socket.remoteAddress || 'unknown').trim();
}

export function assertChallengeSecret(challengeSecretHash: string, providedSecret: unknown) {
    const providedHash = typeof providedSecret === 'string' && providedSecret ? hashValue(providedSecret) : '';
    const matches =
        providedHash.length === challengeSecretHash.length && timingSafeEqual(Buffer.from(providedHash, 'hex'), Buffer.from(challengeSecretHash, 'hex'));

    if (!matches) {
        throw new ApiError(404, 'CHALLENGE_NOT_FOUND', 'Verification challenge was not found');
    }
}

export async function requireActionVerification(req: NextApiRequest, action: SensitiveAction, context: unknown) {
    const rawToken = req.headers['x-action-verification-token'];
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

    if (!token || typeof token !== 'string') {
        throw new ApiError(403, 'ACTION_VERIFICATION_REQUIRED', 'OTP verification is required for this action');
    }

    const verification = await prisma.actionVerification.findUnique({
        where: { verificationTokenHash: hashValue(token) },
        select: {
            id: true,
            authId: true,
            action: true,
            contextHash: true,
            verifiedAt: true,
            tokenExpiresAt: true,
            consumedAt: true,
        },
    });

    const invalid =
        !verification ||
        verification.action !== action ||
        verification.contextHash !== hashActionContext(context) ||
        !verification.verifiedAt ||
        !verification.tokenExpiresAt ||
        verification.tokenExpiresAt <= new Date() ||
        Boolean(verification.consumedAt);

    if (invalid) throw new ApiError(403, 'INVALID_ACTION_VERIFICATION', 'Action verification is invalid, expired, or already used');

    return { authId: verification.authId, verificationId: verification.id };
}

export async function consumeActionVerification(verificationId: string, transaction: any) {
    const result = await transaction.actionVerification.updateMany({
        where: { id: verificationId, consumedAt: null, tokenExpiresAt: { gt: new Date() } },
        data: { consumedAt: new Date() },
    });

    if (result.count !== 1) throw new ApiError(403, 'INVALID_ACTION_VERIFICATION', 'Action verification was already used or has expired');
}
