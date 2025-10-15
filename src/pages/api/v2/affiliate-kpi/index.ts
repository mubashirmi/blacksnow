import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id } = req.query;

    try {
        if (method === 'GET') {
            const affiliateData = await prisma.referralProducts.findMany({
                where: { authId: Number(id) },
            });
            const totalClicks = await prisma.referralProducts.aggregate({
                _sum: {
                    clicks: true,
                },
                where: {
                    authId: Number(id),
                },
            });
            const totalConversions = await prisma.referralProducts.aggregate({
                _sum: {
                    conversion: true,
                },
                where: {
                    authId: Number(id),
                },
            });
            const totalCommision = await prisma.referralProducts.aggregate({
                _sum: {
                    comission: true,
                },
                where: {
                    authId: Number(id),
                },
            });

            const totalTop5Affiliate = await prisma.auth.findMany({
                where: {
                    referredById: Number(id),
                },
                orderBy: {
                    createdAt: 'desc', // 👈 adjust field if different
                },
                // take: 5,
            });

            // --- NEW: monthly breakdown (ALL months in your data) ---
            // We fetch minimal fields and aggregate in JS to stay DB-agnostic.
            const monthlySource = await prisma.referralProducts.findMany({
                where: {
                    authId: Number(id),
                },
                select: {
                    clicks: true,
                    conversion: true,
                    comission: true,
                    createdAt: true,
                },
            });

            // Helper to format YYYY-MM from createdAt
            const toMonthKey = (d: Date) => {
                const year = d.getUTCFullYear();
                const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
                return `${year}-${month}`;
            };

            // Aggregate by month
            const monthlyMap: Record<string, { clicks: number; conversion: number; comission: number }> = {};
            for (const row of monthlySource) {
                const key = toMonthKey(new Date(row.createdAt));
                if (!monthlyMap[key]) {
                    monthlyMap[key] = { clicks: 0, conversion: 0, comission: 0 };
                }
                monthlyMap[key].clicks += Number(row.clicks ?? 0);
                monthlyMap[key].conversion += Number(row.conversion ?? 0);
                monthlyMap[key].comission += Number(row.comission ?? 0);
            }

            // Turn map into a sorted array (ascending by month)
            const monthlyStats = Object.entries(monthlyMap)
                .map(([month, vals]) => ({ month, ...vals }))
                .sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0));

            // --- END NEW ---

            return res.status(200).json({
                totalClicks,
                totalConversions,
                totalCommision,
                totalTop5Affiliate,
                monthlyStats, // 👈 { month: 'YYYY-MM', clicks, conversion, comission }[]
                affiliateData,
            });
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
