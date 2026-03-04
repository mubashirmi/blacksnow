import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

function safeISO(d: Date | null) {
    if (!d) return null;
    const t = d.getTime();
    if (Number.isNaN(t)) return null; // handles invalid DB dates
    return d.toISOString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const checkouts = await prisma.checkout.findMany({
            where: {
                deleted: false,
                cancelSubscripton: false,
                paid: true,
            },
            select: {
                id: true,
                transactionId: true,
                AuthId: true,
                amount: true,
                period: true,
                product: true,
                nextBillingDate: true,
                startDate: true,
                auth: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { id: 'desc' },
        });

        // ✅ Always return clean JSON strings for dates
        const serialized = checkouts.map((c) => ({
            ...c,
            startDate: safeISO(c.startDate),
            nextBillingDate: safeISO(c.nextBillingDate),
        }));

        return res.status(200).json({ checkouts: serialized });
    } catch (error: any) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error?.message,
        });
    }
}
