// /pages/api/v2/check-subscription.ts

import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);

        return res.status(405).json({
            valid: false,
            reason: 'INVALID_REQUEST',
            message: 'Method Not Allowed',
        });
    }

    try {
        const rawAuthId = req.query.authId ?? req.query.id;
        const rawProduct = req.query.product;

        const authId = Number(Array.isArray(rawAuthId) ? rawAuthId[0] : rawAuthId);

        const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;

        if (!Number.isInteger(authId) || authId <= 0) {
            return res.status(400).json({
                valid: false,
                reason: 'INVALID_REQUEST',
                message: 'Invalid or missing authId',
            });
        }

        if (!product?.trim()) {
            return res.status(400).json({
                valid: false,
                reason: 'INVALID_REQUEST',
                message: 'Missing product',
            });
        }

        const subscription = await prisma.checkout.findFirst({
            where: {
                AuthId: authId,
                product: product.trim(),
            },
            orderBy: {
                updatedAt: 'desc',
            },
            select: {
                id: true,
                AuthId: true,
                product: true,
                paid: true,
                cancelSubscripton: true,
                updatedAt: true,
            },
        });

        if (!subscription) {
            return res.status(200).json({
                valid: false,
                reason: 'NOT_FOUND',
                message: 'Subscription not found',
            });
        }

        if (!subscription.paid) {
            return res.status(200).json({
                valid: false,
                reason: 'NOT_PAID',
                message: 'Subscription has not been paid',
                data: subscription,
            });
        }

        if (subscription.cancelSubscripton) {
            return res.status(200).json({
                valid: false,
                reason: 'CANCELLED',
                message: 'Subscription has been cancelled',
                data: subscription,
            });
        }

        return res.status(200).json({
            valid: true,
            reason: 'ACTIVE',
            message: 'Subscription is active',
            data: subscription,
        });
    } catch (error) {
        console.error('Check subscription error:', error);

        return res.status(500).json({
            valid: false,
            reason: 'SERVER_ERROR',
            message: 'Internal Server Error',
        });
    }
}
