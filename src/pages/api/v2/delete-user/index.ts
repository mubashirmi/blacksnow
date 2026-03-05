import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const authIdParam = req.query.authId;
    const authId = Array.isArray(authIdParam) ? authIdParam[0] : authIdParam;
    const AuthId = Number(authId);

    if (!authId || Number.isNaN(AuthId) || AuthId <= 0) {
        return res.status(400).json({ message: 'Invalid authId' });
    }

    try {
        const user = await prisma.auth.findUnique({ where: { id: AuthId } });
        if (!user) return res.status(404).json({ message: 'User Not Found' });

        await prisma.$transaction([
            // 1) Break self-relation first (other users referring to this user)
            prisma.auth.updateMany({
                where: { referredById: AuthId },
                data: { referredById: null },
            }),

            // 2) Delete all related rows from the Auth side (no FK field guessing needed)
            prisma.auth.update({
                where: { id: AuthId },
                data: {
                    referralProducts: { deleteMany: {} },
                    Checkouts: { deleteMany: {} },
                    Subscription: { deleteMany: {} },

                    digitalBillboards: { deleteMany: {} },

                    emailMarketingCredentials: { deleteMany: {} },
                    emailUsers: { deleteMany: {} },

                    EmailJobResult: { deleteMany: {} },
                    newsletterJobResults: { deleteMany: {} },

                    emailSentHistories: { deleteMany: {} },
                    newsletterHistories: { deleteMany: {} },

                    AdminPayouts: { deleteMany: {} },
                    AdminRevenue: { deleteMany: {} },

                    Notes: { deleteMany: {} },

                    googleMicrosoftAccountTokens: { deleteMany: {} },

                    contracts: { deleteMany: {} },
                    invoices: { deleteMany: {} },
                },
                select: { id: true },
            }),

            // 3) Delete user
            prisma.auth.delete({ where: { id: AuthId } }),
        ]);

        return res.status(200).json({ message: 'User Deleted Successfully' });
    } catch (error) {
        console.error(error);

        // Helpful FK debugging if another table still references Auth
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return res.status(409).json({
                message: 'Foreign key constraint violated (user still referenced somewhere)',
                meta: error.meta,
            });
        }

        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
