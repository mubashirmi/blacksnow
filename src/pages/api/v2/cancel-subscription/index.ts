// /pages/api/subscription/cancel.ts
import { consumeActionVerification, requireActionVerification } from '@/lib/actionVerification';
import { sendApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const product = (req.body?.product ?? req.query?.product) as string | undefined;
        if (!product) {
            return res.status(400).json({ message: 'Missing product' });
        }

        const { authId, verificationId } = await requireActionVerification(req, 'unsubscribe', { product });

        // Find the matching checkout first (non-unique predicate allowed)
        const existing = await prisma.checkout.findFirst({
            where: { AuthId: authId, product },
            select: {
                id: true,
                AuthId: true,
                product: true,
                paid: true,
                cancelSubscripton: true,
                updatedAt: true,
            },
        });

        if (!existing) {
            return res.status(404).json({ message: 'Checkout not found for given authId/product' });
        }

        // Idempotent response
        if (existing.cancelSubscripton) {
            await prisma.$transaction(async (transaction) => consumeActionVerification(verificationId, transaction));
            return res.status(200).json({ message: 'Subscription cancelled', data: existing });
        }

        const updated = await prisma.$transaction(async (transaction) => {
            await consumeActionVerification(verificationId, transaction);
            return transaction.checkout.update({
                where: { id: existing.id },
                data: { cancelSubscripton: true },
                select: { id: true, AuthId: true, product: true, paid: true, cancelSubscripton: true, updatedAt: true },
            });
        });

        return res.status(200).json({ message: 'Subscription cancelled', data: updated });
    } catch (err) {
        return sendApiError(res, err);
    }
}
