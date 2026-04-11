import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            const revenueData = await prisma.checkout.groupBy({
                by: ['product', 'period'],
                where: {
                    deleted: false,
                    paid: true,
                    product: {
                        not: null,
                    },
                    period: {
                        in: ['monthly', 'yearly'],
                    },
                },
                _sum: {
                    amount: true,
                },
                orderBy: [{ product: 'asc' }, { period: 'asc' }],
            });

            const revenueMap = revenueData.reduce((resultSoFar, currentRow) => {
                const productName = currentRow.product ?? 'Unknown';

                if (!resultSoFar[productName]) {
                    resultSoFar[productName] = {
                        product: productName,
                        monthly: 0,
                        yearly: 0,
                    };
                }

                if (currentRow.period === 'monthly') {
                    resultSoFar[productName].monthly = currentRow._sum.amount ?? 0;
                }

                if (currentRow.period === 'yearly') {
                    resultSoFar[productName].yearly = currentRow._sum.amount ?? 0;
                }

                return resultSoFar;
            }, {});

            return res.status(200).json({ message: 'Affiliate Data', revenueData: revenueMap });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
