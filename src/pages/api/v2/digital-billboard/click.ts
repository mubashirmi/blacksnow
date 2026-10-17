import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const billboardId = Number(rawId);

    if (!Number.isInteger(billboardId) || billboardId <= 0) {
        return res.status(400).json({ message: 'A valid billboard id is required' });
    }

    try {
        const clickRecorded = await prisma.$transaction(async (transaction) => {
            const updatedRows = await transaction.$executeRaw`
                UPDATE "DigitalBillboard"
                SET "clickCount" = "clickCount" + 1
                WHERE "id" = ${billboardId}
            `;

            if (updatedRows === 0) return false;

            await transaction.digitalBillboardClick.create({
                data: { billboardId },
            });

            return true;
        });

        if (!clickRecorded) {
            return res.status(404).json({ message: 'Billboard not found' });
        }

        return res.status(200).json({ message: 'Click recorded' });
    } catch (error) {
        console.error('Failed to record billboard click:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
