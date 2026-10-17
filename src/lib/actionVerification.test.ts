import prisma from '@/lib/prisma';
import type { NextApiRequest } from 'next';
import { SENSITIVE_ACTIONS, consumeActionVerification, hashActionContext, requireActionVerification } from './actionVerification';

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        actionVerification: {
            findUnique: jest.fn(),
            updateMany: jest.fn(),
        },
    },
}));

const actionVerification = (prisma as any).actionVerification;

function requestWithToken(token = 'verification-token') {
    return { headers: { 'x-action-verification-token': token } } as NextApiRequest;
}

describe('action verification', () => {
    test('recognizes pause and resume as separate sensitive actions', () => {
        expect(SENSITIVE_ACTIONS).toEqual(['unsubscribe', 'feedback', 'pause_subscription', 'resume_subscription']);
    });

    test('accepts a live token only for its user-bound action and context', async () => {
        actionVerification.findUnique.mockResolvedValue({
            id: 'challenge-id',
            authId: 42,
            action: 'resume_subscription',
            contextHash: hashActionContext({ product: 'InvoiceTool' }),
            verifiedAt: new Date(),
            tokenExpiresAt: new Date(Date.now() + 60_000),
            consumedAt: null,
        });

        await expect(requireActionVerification(requestWithToken(), 'resume_subscription', { product: 'InvoiceTool' })).resolves.toEqual({
            authId: 42,
            verificationId: 'challenge-id',
        });
        await expect(requireActionVerification(requestWithToken(), 'pause_subscription', { product: 'InvoiceTool' })).rejects.toMatchObject({
            code: 'INVALID_ACTION_VERIFICATION',
        });
        await expect(requireActionVerification(requestWithToken(), 'resume_subscription', { product: 'DigitalBillboard' })).rejects.toMatchObject({
            code: 'INVALID_ACTION_VERIFICATION',
        });
    });

    test('consumes a verification token exactly once', async () => {
        actionVerification.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

        await expect(consumeActionVerification('challenge-id', prisma)).resolves.toBeUndefined();
        await expect(consumeActionVerification('challenge-id', prisma)).rejects.toMatchObject({ code: 'INVALID_ACTION_VERIFICATION' });
    });
});
