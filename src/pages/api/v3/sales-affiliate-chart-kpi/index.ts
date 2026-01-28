import prisma from '@/lib/prisma';
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

    const revenueFrom = (from: Date) =>
        prisma.auth.aggregate({
            where: { createdAt: { gte: from } },
        });

    const authCountWithCheckoutPaid = (from: Date, paid: boolean) =>
        prisma.auth.count({
            where: {
                createdAt: { gte: from },
                Checkouts: { some: { deleted: false, paid } },
            },
        });

    try {
        // eslint-disable-next-line
        const [wRev, mRev, yRev, wSubs, mSubs, ySubs, wChurn, mChurn, yChurn] = await prisma.$transaction([
            revenueFrom(fromWeekly),
            revenueFrom(fromMonth),
            revenueFrom(fromYear),

            authCountWithCheckoutPaid(fromWeekly, true),
            authCountWithCheckoutPaid(fromMonth, true),
            authCountWithCheckoutPaid(fromYear, true),

            authCountWithCheckoutPaid(fromWeekly, false),
            authCountWithCheckoutPaid(fromMonth, false),
            authCountWithCheckoutPaid(fromYear, false),
        ]);

        // return res.status(200).json({
        //     message: 'Data fetched successfully',
        //     weeklyRevenue: Number(wRev._sum.amount ?? 0),
        //     monthlyRevenue: Number(mRev._sum.amount ?? 0),
        //     yearlyRevenue: Number(yRev._sum.amount ?? 0),

        //     weeklySubscribers: wSubs,
        //     monthlySubscribers: mSubs,
        //     yearlySubscribers: ySubs,

        //     weeklyChurnRate: wChurn, // (these are counts — rename if you want)
        //     monthlyChurnRate: mChurn,
        //     yearlyChurnRate: yChurn,
        // });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
