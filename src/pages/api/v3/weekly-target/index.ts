import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const DAY = 24 * 60 * 60 * 1000;

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const now = Date.now();
    const fromWeekly = new Date(now - 7 * DAY);

    try {
        const weeklyClicks = await prisma.referralProducts.aggregate({
            where: {
                createdAt: { gte: fromWeekly },
            },
            // _sum: {
            //     clicks: true,
            // },
        });
        return res.status(200).json({ weeklyClicks });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
