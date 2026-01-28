import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    const role = req.query.type as Role;
    if (!role) return res.status(400).json({ message: 'Missing `type` query param (Role)' });

    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1); // Jan 1, current year
        const end = new Date(now.getFullYear() + 1, 0, 1); // Jan 1, next year

        const [rows, churnRate] = await Promise.all([
            prisma.auth.findMany({
                where: {
                    roles: { has: role },
                    createdAt: { gte: start, lt: end },
                },
                select: { createdAt: true },
            }),

            prisma.auth.count({
                where: {
                    createdAt: { gte: start, lt: end },
                    roles: { has: role },
                    Checkouts: { some: { deleted: false, paid: false } }, // or paid: true/false
                },
            }),
        ]);

        const counts = Array(12).fill(0);
        for (const r of rows) {
            const m = new Date(r.createdAt).getMonth(); // 0..11
            counts[m] += 1;
        }

        return res.status(200).json(MONTHS.map((month, i) => ({ month, count: counts[i], churnRate })));
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
