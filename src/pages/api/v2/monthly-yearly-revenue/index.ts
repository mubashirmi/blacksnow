import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the type of the result from sendEmail
interface SendEmailResult {
    success: boolean;
    email: string;
    error?: unknown; // Optional error field
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { role, id } = req.query as { role?: string; id?: string };

    try {
        if (method === 'GET') {
            // Fetch users with 'NewsLetter' role
            if (role === 'Admin') {
                const revenue = await prisma.checkout.groupBy({
                    by: ['period'],
                    _sum: {
                        amount: true,
                    },
                    where: {
                        paid: true,
                        deleted: false,
                    },
                });
                return res.status(400).json(revenue);
            }

            if (role === 'Affiliate') {
                const findAffiliate = await prisma.auth.findUnique({
                    where: {
                        id: Number(id),
                        roles: {
                            has: 'Affiliate',
                        },
                    },
                });

                if (!findAffiliate) {
                    return res.status(404).json({ message: 'Affiliate not found.' });
                }

                const findAllAffiliates = await prisma.auth.findMany({
                    where: {
                        referredById: Number(findAffiliate.id),
                    },
                });
                if (!findAllAffiliates) {
                    return res.status(404).json({ message: 'Referred affiliate not found.' });
                }

                const affiliateIds = findAllAffiliates.map((item) => item.id);

                const revenue = await prisma.checkout.groupBy({
                    by: ['period'],
                    _sum: {
                        amount: true,
                    },
                    where: {
                        AuthId: {
                            in: affiliateIds,
                        },
                        paid: true,
                        deleted: false,
                    },
                });
                return res.status(405).json(revenue);
            }
            if (role === 'Sales') {
                const findAffiliate = await prisma.auth.findUnique({
                    where: {
                        id: Number(id),
                        roles: {
                            has: 'Sales',
                        },
                    },
                });

                if (!findAffiliate) {
                    return res.status(404).json({ message: 'Sale user not found.' });
                }

                const findAllAffiliates = await prisma.auth.findMany({
                    where: {
                        referredById: Number(findAffiliate.id),
                    },
                });
                if (!findAllAffiliates) {
                    return res.status(404).json({ message: 'Sale user affiliate not found.' });
                }

                const affiliateIds = findAllAffiliates.map((item) => item.id);

                const revenue = await prisma.checkout.groupBy({
                    by: ['period'],
                    _sum: {
                        amount: true,
                    },
                    where: {
                        AuthId: {
                            in: affiliateIds,
                        },
                        paid: true,
                        deleted: false,
                    },
                });
                return res.status(405).json(revenue);
            }
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error occurred during processing:', error);
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
