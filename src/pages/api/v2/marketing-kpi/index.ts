import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { authId } = req.query;

    const Id = Number(authId);

    try {
        if (method === 'GET') {
            // Run all queries in parallel
            const [latestUsers, userCounts, latestSentEmail, latestSchedules, totalEmailSent, sentEmailNumbers] = await Promise.all([
                prisma.emailUser.findMany({
                    where: { authId: Id },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.emailUser.count({
                    where: { authId: Id },
                }),
                prisma.emailJobResult.findMany({
                    where: { authId: Id, status: 'sent' },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.emailJobResult.findMany({
                    where: {
                        authId: Id,
                        timeInterval: { not: null },
                        repeated: true,
                    },
                }),

                prisma.emailJobResult.findMany({
                    where: { authId: Id, status: 'sent' },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.emailJobResult.count({
                    where: { authId: Id, status: 'sent' },
                }),
            ]);

            return res.status(200).json({
                message: 'Affiliate Data',
                latestUsers,
                userCounts,
                latestSentEmail,
                latestSchedules,
                totalEmailSent,
                sentEmailNumbers,
            });
        }

        return res.status(405).json({ message: `Method ${method} not allowed` });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
