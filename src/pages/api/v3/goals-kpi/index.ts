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
            const [totalClicks, totalSendEmails, totalSubscribers] = await Promise.all([
                await prisma.referralProductsClicks.aggregate({
                    where: { createdAt: { gte: fromMonth, lte: toDate } },
                    _sum: { clicks: true },
                }),
                await prisma.emailSentHistory.count({ where: { createdAt: { gte: fromMonth, lte: toDate } } }),
                await prisma.auth.count({
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
            ]);
            return res.status(200).json({ totalClicks, totalSendEmails, totalSubscribers, fromMonth, toDate });
        }

        const authIdNum = Number(authId);
        if (!Number.isFinite(authIdNum)) throw new Error('Invalid authId');

        const [clickAgg, totalSendEmails, totalSubscribers] = await Promise.all([
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
        ]);

        const totalClicks = clickAgg?._sum?.clicks ?? 0;

        return res.status(200).json({ totalClicks, totalSendEmails, totalSubscribers, fromMonth, toDate });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
