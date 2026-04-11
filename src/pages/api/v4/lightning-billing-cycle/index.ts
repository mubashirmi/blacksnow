import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { authId } = req.query;

    try {
        if (method === 'GET') {
            if (authId) {
                const billingCycleData = await prisma.checkout.findMany({
                    where: {
                        AuthId: Number(authId),
                        product: {
                            in: ['lightningSilver', 'lightningGold'],
                        },
                        paid: true,
                        deleted: false,
                        cancelSubscripton: false,
                    },
                    select: {
                        id: true,
                        amount: true,
                        period: true,
                        product: true,
                        startDate: true,
                        nextBillingDate: true,
                        AuthId: true,
                    },
                });
                return res.status(200).json({ message: 'User Lightning Billing Cycle Data', data: billingCycleData });
            }
            const billingCycleData = await prisma.checkout.findMany({
                where: {
                    product: {
                        in: ['lightningSilver', 'lightningGold'],
                    },
                    paid: true,
                    deleted: false,
                    cancelSubscripton: false,
                },
                select: {
                    id: true,
                    amount: true,
                    period: true,
                    product: true,
                    startDate: true,
                    nextBillingDate: true,
                    AuthId: true,
                },
            });

            return res.status(200).json({ message: 'Users Lightning Billing Cycle Data', data: billingCycleData });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
