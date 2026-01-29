import prisma from '@/lib/prisma';
// import { Role } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

// const ROLE_LIST = [Role.Sales, Role.Affiliate, Role.NewsLetter, Role.Rsvp, Role.DigitalBillboard, Role.EmailMarketing, Role.InvoiceTool] as const;

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const { authId } = req.query;
    const now = new Date();

    const fromMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    try {
        if (!authId) {
            const [clickAgg, totalEmailDeliverd, totalSubscribers, TotalEmailForCampaign, TotalEmailForAutomation, totalConversion, ChurnRate, checkoutAgg] =
                await Promise.all([
                    prisma.referralProductsClicks.aggregate({
                        where: {
                            createdAt: { gte: fromMonth, lte: toDate },
                        },
                        _sum: { clicks: true },
                    }),

                    prisma.emailSentHistory.count({
                        where: { createdAt: { gte: fromMonth, lte: toDate } },
                    }),

                    prisma.auth.count({
                        where: {
                            createdAt: { gte: fromMonth, lte: toDate },

                            Checkouts: {
                                some: {
                                    paid: true,
                                    deleted: false,
                                },
                            },
                        },
                    }),

                    prisma.emailJobResult.count({
                        where: {
                            createdAt: { gte: fromMonth, lte: toDate },

                            repeated: false,
                        },
                    }),
                    prisma.emailJobResult.count({
                        where: {
                            createdAt: { gte: fromMonth, lte: toDate },

                            repeated: true,
                        },
                    }),

                    prisma.auth.count({
                        where: {
                            createdAt: { gte: fromMonth, lte: toDate },
                            NOT: {
                                referredById: null,
                            },
                        },
                    }),

                    prisma.checkout.count({
                        where: {
                            createdAt: { gte: fromMonth, lte: toDate },
                            paid: false,
                            deleted: false,
                        },
                    }),

                    prisma.checkout.aggregate({
                        where: {
                            paid: true,
                            deleted: false,
                            createdAt: { gte: fromMonth, lte: toDate },
                        },
                        _sum: { amount: true },
                        _count: { _all: true },
                    }),
                ]);
            const totalClicks = clickAgg?._sum?.clicks ?? 0;
            const conversionRate = totalClicks > 0 ? totalConversion / totalClicks : 0;

            const conversionRatePercent = +(conversionRate * 100).toFixed(2);
            const totalRevenue = Number(checkoutAgg._sum.amount ?? 0);
            const paidOrders = checkoutAgg._count._all ?? 0;

            const averageRevenue = paidOrders > 0 ? totalRevenue / paidOrders : 0;
            return res.status(200).json({
                totalClicks,
                totalConversion,
                conversionRate, // e.g. 0.0345
                conversionRatePercent, // e.g. 3.45
                totalEmailDeliverd,
                totalSubscribers,
                TotalEmailForCampaign,
                TotalEmailForAutomation,
                ChurnRate,
                averageRevenue,
                fromMonth,
                toDate,
            });
        }

        const authIdNum = Number(authId);
        if (!Number.isFinite(authIdNum)) throw new Error('Invalid authId');

        const [clickAgg, totalEmailDeliverd, totalSubscribers, TotalEmailForCampaign, TotalEmailForAutomation, totalConversion, ChurnRate, checkoutAgg] =
            await Promise.all([
                prisma.referralProductsClicks.aggregate({
                    where: {
                        createdAt: { gte: fromMonth, lte: toDate },
                        ReferralProducts: {
                            authId: authIdNum,
                        },
                    },
                    _sum: { clicks: true },
                }),

                prisma.emailSentHistory.count({
                    where: { createdAt: { gte: fromMonth, lte: toDate }, authId: authIdNum },
                }),

                prisma.auth.count({
                    where: {
                        createdAt: { gte: fromMonth, lte: toDate },
                        id: authIdNum,
                        Checkouts: {
                            some: {
                                paid: true,
                                deleted: false,
                            },
                        },
                    },
                }),

                prisma.emailJobResult.count({
                    where: {
                        createdAt: { gte: fromMonth, lte: toDate },

                        authId: authIdNum,
                        repeated: false,
                    },
                }),
                prisma.emailJobResult.count({
                    where: {
                        createdAt: { gte: fromMonth, lte: toDate },

                        authId: authIdNum,
                        repeated: true,
                    },
                }),

                prisma.auth.count({
                    where: {
                        createdAt: { gte: fromMonth, lte: toDate },
                        referredById: authIdNum,
                    },
                }),

                prisma.checkout.count({
                    where: {
                        createdAt: { gte: fromMonth, lte: toDate },
                        paid: false,
                        deleted: false,
                        AuthId: authIdNum,
                    },
                }),

                prisma.checkout.aggregate({
                    where: {
                        AuthId: authIdNum,
                        paid: true,
                        deleted: false,
                        createdAt: { gte: fromMonth, lte: toDate },
                    },
                    _sum: { amount: true },
                    _count: { _all: true },
                }),
            ]);

        const totalClicks = clickAgg?._sum?.clicks ?? 0;
        const conversionRate = totalClicks > 0 ? totalConversion / totalClicks : 0;

        const conversionRatePercent = +(conversionRate * 100).toFixed(2);
        const totalRevenue = Number(checkoutAgg._sum.amount ?? 0);
        const paidOrders = checkoutAgg._count._all ?? 0;

        const averageRevenue = paidOrders > 0 ? totalRevenue / paidOrders : 0;

        return res.status(200).json({
            totalClicks,
            totalConversion,
            conversionRate, // e.g. 0.0345
            conversionRatePercent, // e.g. 3.45
            totalEmailDeliverd,
            totalSubscribers,
            TotalEmailForCampaign,
            TotalEmailForAutomation,
            ChurnRate,
            averageRevenue,
            fromMonth,
            toDate,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
