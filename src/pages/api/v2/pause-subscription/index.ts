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

        if (!Number.isFinite(authId)) {
            return res.status(400).json({
                message: 'Invalid or missing authId',
            });
        }

        if (!product || typeof product !== 'string') {
            return res.status(400).json({
                message: 'Missing product',
            });
        }

        const checkout = await prisma.checkout.findFirst({
            where: {
                AuthId: authId,
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

        // PATCH: toggle pause status
        const updated = await prisma.checkout.update({
            where: {
                id: checkout.id,
            },
            data: {
                pause: !checkout.pause,
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

        return res.status(200).json({
            message: updated.pause ? 'Subscription paused' : 'Subscription resumed',
            isPaused: updated.pause,
            data: updated,
        });
    } catch (err) {
        console.error('Failed to process subscription pause request:', err);

        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}
