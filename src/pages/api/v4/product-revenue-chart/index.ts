import prisma from '@/lib/prisma';
import { buildProductRevenueMap, getProductRevenueDateRange } from '@/lib/productRevenueChart';
import type { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const now = new Date();
        const { queryStart, queryEndExclusive } = getProductRevenueDateRange(now);
        const checkoutFilter: Prisma.CheckoutWhereInput = {
            deleted: false,
            paid: true,
            product: {
                not: null,
            },
            period: {
                in: ['monthly', 'yearly'],
            },
        };

        const [products, transactions] = await Promise.all([
            prisma.checkout.findMany({
                where: {
                    ...checkoutFilter,
                },
                distinct: ['product'],
                select: {
                    product: true,
                },
                orderBy: {
                    product: 'asc',
                },
            }),
            prisma.checkout.findMany({
                where: {
                    ...checkoutFilter,
                    createdAt: {
                        gte: queryStart,
                        lt: queryEndExclusive,
                    },
                },
                select: {
                    product: true,
                    amount: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            }),
        ]);

        const productNames = products.flatMap(({ product }) => (product ? [product] : []));
        const revenueMap = buildProductRevenueMap(productNames, transactions, now);

        return res.status(200).json({ message: 'Affiliate Data', revenueData: revenueMap });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
