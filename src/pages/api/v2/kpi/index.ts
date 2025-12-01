import prisma from '@/lib/prisma';
import { Role } from '@prisma/client'; // 👈 import your enum
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            const [
                salesUsers,
                affiliateUsers,
                latestThreeNotes,
                latestJob,
                latestBlog,
                latestBillboard,
                latestBillBoardApprovels,
                totalProfit,
                rsvpEvents,
                checkoutRevenues,
                userProducts,
            ] = await Promise.all([
                prisma.auth.findMany({
                    where: {
                        roles: { has: Role.Sales },
                    },
                }),
                prisma.auth.findMany({
                    where: {
                        roles: { has: Role.Affiliate },
                    },
                }),
                prisma.notes.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                }),
                prisma.careers.findFirst({
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.blogpost.findFirst({
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.digitalBillboard.findFirst({
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.digitalBillboard.findMany({
                    where: { status: 'NotApproved' },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                }),

                prisma.checkout.aggregate({
                    _sum: { amount: true },
                }),
                prisma.calendar.findMany({
                    include: {
                        userBroughtProduct: true,
                    },
                }),

                prisma.checkout.groupBy({
                    by: ['product'],
                    _sum: { amount: true },
                }),

                prisma.auth.findMany({
                    where: {
                        Checkouts: {
                            some: {},
                        },
                    },
                    include: {
                        Checkouts: true,
                    },
                }),
            ]);

            let latestJobApplicants: any[] = [];
            if (latestJob) {
                latestJobApplicants = await prisma.applicants.findMany({
                    where: { careersId: latestJob.id },
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        resume: true,
                        createdAt: true,
                    },
                });
            }

            return res.status(200).json({
                message: 'Data fetched successfully',
                salesUsers,
                affiliateUsers,
                latestThreeNotes,
                latestJob,
                latestJobApplicants,
                latestBlog,
                latestBillboard,
                latestBillBoardApprovels,
                totalProfit,
                rsvpEvents,
                checkoutRevenues,
                userProducts,
            });
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
