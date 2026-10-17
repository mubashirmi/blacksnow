import { consumeActionVerification, requireActionVerification } from '@/lib/actionVerification';
import { sendApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!['GET', 'PATCH'].includes(req.method ?? '')) {
        res.setHeader('Allow', ['GET', 'PATCH']);

        return res.status(405).json({
            message: 'Method Not Allowed',
        });
    }

    try {
        const rawAuthId = req.method === 'PATCH' ? req.body?.authId ?? req.query.authId ?? req.query.id : req.query.authId ?? req.query.id;

        const authId = Array.isArray(rawAuthId) ? Number(rawAuthId[0]) : Number(rawAuthId);

        const rawProduct = req.method === 'PATCH' ? req.body?.product ?? req.query.product : req.query.product;

        const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;

        const rawOperation = req.method === 'PATCH' ? req.body?.operation ?? req.query.operation : undefined;
        const operation = Array.isArray(rawOperation) ? rawOperation[0] : rawOperation;

        if (req.method === 'GET' && !Number.isFinite(authId)) {
            return res.status(400).json({
                message: 'Invalid or missing authId',
            });
        }

        if (!product || typeof product !== 'string') {
            return res.status(400).json({
                message: 'Missing product',
            });
        }

        if (req.method === 'PATCH' && operation !== 'pause' && operation !== 'resume') {
            return res.status(400).json({ message: 'Operation must be either pause or resume' });
        }

        const verification =
            req.method === 'PATCH'
                ? await requireActionVerification(req, operation === 'pause' ? 'pause_subscription' : 'resume_subscription', { product })
                : null;
        const effectiveAuthId = verification?.authId ?? authId;

        const checkout = await prisma.checkout.findFirst({
            where: {
                AuthId: effectiveAuthId,
                product,
            },
            select: {
                id: true,
                AuthId: true,
                product: true,
                paid: true,
                pause: true,
                cancelSubscripton: true,
                nextBillingDate: true,
                startDate: true,
                updatedAt: true,
            },
        });

        if (!checkout) {
            return res.status(404).json({
                message: 'Checkout not found for given authId/product',
            });
        }

        // GET: return current pause status
        if (req.method === 'GET') {
            return res.status(200).json({
                message: checkout.pause ? 'Subscription is paused' : 'Subscription is active',
                isPaused: checkout.pause,
                data: checkout,
            });
        }

        // PATCH: set the explicitly requested status (never toggle based on stale client state)
        const updated = await prisma.$transaction(async (transaction) => {
            await consumeActionVerification(verification!.verificationId, transaction);
            return transaction.checkout.update({
                where: { id: checkout.id },
                data: { pause: operation === 'pause' },
                select: {
                    id: true,
                    AuthId: true,
                    product: true,
                    paid: true,
                    pause: true,
                    cancelSubscripton: true,
                    nextBillingDate: true,
                    startDate: true,
                    updatedAt: true,
                },
            });
        });

        return res.status(200).json({
            message: updated.pause ? 'Subscription paused' : 'Subscription resumed',
            isPaused: updated.pause,
            data: updated,
        });
    } catch (err) {
        return sendApiError(res, err);
    }
}
