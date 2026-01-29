import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const DAY = 24 * 60 * 60 * 1000;

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const now = Date.now();
    const fromWeekly = new Date(now - 7 * DAY);
    const fromMonth = new Date(now - 30 * DAY);
    const fromYear = new Date(now - 365 * DAY);

    const rawType = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
    const rawProduct = Array.isArray(req.query.product) ? req.query.product[0] : req.query.product;
    const typeParam = rawType ?? 'all';
    const typeProduct = rawProduct ?? 'all';

    // Convert "all" => no filter, otherwise validate enum
    const role: Role | null = typeParam === 'all' ? null : Object.values(Role).includes(typeParam as Role) ? (typeParam as Role) : null;
    const product: string | null = typeProduct === 'all' ? null : String(typeProduct);
    if (typeParam !== 'all' && role === null) {
        return res.status(400).json({
            message: 'Invalid type. Must be one of Role enum values or "all".',
            allowed: ['all', ...Object.values(Role)],
            received: typeParam,
        });
    }

    const revenueFrom = (from: Date, role: Role | null, product: string | null) =>
        prisma.checkout.aggregate({
            where: {
                createdAt: { gte: from },
                deleted: false,
                paid: true,
                ...(role ? { auth: { roles: { has: role } } } : {}),
            },
            _sum: { amount: true },
        });

    const authCountWithCheckoutPaid = (from: Date, paid: boolean, role: Role | null, product: string | null) =>
        prisma.auth.count({
            where: {
                createdAt: { gte: from },
                ...(role ? { roles: { has: role } } : {}),
                ...(product ? { Checkouts: { some: { deleted: false, paid, product } } } : {}),
            },
        });

    try {
        const [wRev, mRev, yRev, wSubs, mSubs, ySubs, wChurn, mChurn, yChurn] = await prisma.$transaction([
            revenueFrom(fromWeekly, role, product),
            revenueFrom(fromMonth, role, product),
            revenueFrom(fromYear, role, product),

            authCountWithCheckoutPaid(fromWeekly, true, role, product),
            authCountWithCheckoutPaid(fromMonth, true, role, product),
            authCountWithCheckoutPaid(fromYear, true, role, product),

            authCountWithCheckoutPaid(fromWeekly, false, role, product),
            authCountWithCheckoutPaid(fromMonth, false, role, product),
            authCountWithCheckoutPaid(fromYear, false, role, product),
        ]);

        return res.status(200).json({
            message: 'Data fetched successfully',
            weeklyRevenue: Number(wRev._sum.amount ?? 0),
            monthlyRevenue: Number(mRev._sum.amount ?? 0),
            yearlyRevenue: Number(yRev._sum.amount ?? 0),

            weeklySubscribers: wSubs,
            monthlySubscribers: mSubs,
            yearlySubscribers: ySubs,

            weeklyChurnRate: wChurn, // these are counts (not %)
            monthlyChurnRate: mChurn,
            yearlyChurnRate: yChurn,

            type: typeParam,
            product: typeProduct,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
