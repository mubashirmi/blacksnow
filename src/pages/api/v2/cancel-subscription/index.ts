// /pages/api/subscription/cancel.ts
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Accept authId from body or query
        const raw = (req.body?.authId ?? req.query?.authId ?? req.query?.id) as string | string[] | undefined;
        const authId = Array.isArray(raw) ? Number(raw[0]) : Number(raw);

        // You had: const product = req.body;  <-- this was wrong
        const product = (req.body?.product ?? req.query?.product) as string | undefined;

        if (!Number.isFinite(authId)) {
            return res.status(400).json({ message: 'Invalid or missing authId' });
        }
        if (!product) {
            return res.status(400).json({ message: 'Missing product' });
        }

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
            return res.status(200).json({ message: 'Subscription cancelled', data: existing });
        }

        const updated = await prisma.checkout.update({
            where: { id: existing.id }, // <- unique
            data: { cancelSubscripton: true },
            select: {
                id: true,
                AuthId: true,
                product: true,
                paid: true,
                cancelSubscripton: true,
                updatedAt: true,
            },
        });

        return res.status(200).json({ message: 'Subscription cancelled', data: updated });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
