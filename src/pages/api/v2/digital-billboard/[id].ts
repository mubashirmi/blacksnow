import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const billboardId = Number(rawId);

    if (!Number.isInteger(billboardId) || billboardId <= 0) {
        return res.status(400).json({ message: 'A valid billboard id is required' });
    }

    try {
        const billboard = await prisma.digitalBillboard.findUnique({
            where: { id: billboardId },
            select: {
                id: true,
                clickCount: true,
            },
        });

        if (!billboard) {
            return res.status(404).json({ message: 'Billboard not found' });
        }

        return res.status(200).json({
            message: 'Total clicks fetched',
            data: {
                billboardId: billboard.id,
                totalClicks: billboard.clickCount,
            },
        });
    } catch (error) {
        console.error('Failed to fetch billboard clicks:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
