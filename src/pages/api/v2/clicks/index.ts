import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const authId = Number(idParam);
    if (!Number.isFinite(authId)) {
        return res.status(400).json({ message: 'Invalid id' });
    }

    const { productLink } = req.body as { productLink?: string };
    if (typeof productLink !== 'string' || !productLink) {
        return res.status(400).json({ message: 'Invalid productLink' });
    }

    try {
        const updated = await prisma.referralProducts.update({
            where: { authId_productLink: { authId, productLink } },
            data: { clicks: { increment: 1 } },
            select: { id: true, authId: true, productLink: true, clicks: true },
        });

        return res.status(200).json({ message: 'Incremented', updated });
    } catch (e: any) {
        // Record not found
        if (e.code === 'P2025') {
            return res.status(404).json({ message: 'No matching referral product' });
        }
        return res.status(500).json({ message: 'Internal server error', error: e.message });
    }
}
