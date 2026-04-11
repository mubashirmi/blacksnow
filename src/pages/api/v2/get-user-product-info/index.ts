import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

type ProductKey =
    | 'NewsLetter'
    | 'DigitalBillboard'
    | 'RSVP'
    | 'Affiliate'
    | 'Sales'
    | 'Admin'
    | 'EmailMarketing'
    | 'InvoiceTool'
    | 'SuperAffiliate'
    | 'LightningSilver'
    | 'LightningGold';

type ProductsStatus = Record<ProductKey, 'Purchased' | 'NotPurchased'>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    // read id from body or query
    const raw = (req.body?.authId ?? req.query?.authId ?? req.query?.id) as string | string[] | undefined;

    const id = Array.isArray(raw) ? Number(raw[0]) : Number(raw);

    if (!Number.isFinite(id)) {
        return res.status(400).json({ message: 'Invalid or missing authId' });
    }

    try {
        if (method !== 'GET') {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        // Option A: filter out null product values at DB level
        const userProducts = await prisma.checkout.findMany({
            where: {
                AuthId: id,
                cancelSubscripton: false,
                product: { not: null },
            },
            select: {
                id: true,
                product: true, // still typed by prisma, but runtime is safe now
            },
        });

        const products: ProductsStatus = {
            NewsLetter: 'NotPurchased',
            DigitalBillboard: 'NotPurchased',
            RSVP: 'NotPurchased',
            Affiliate: 'NotPurchased',
            Sales: 'NotPurchased',
            Admin: 'NotPurchased',
            EmailMarketing: 'NotPurchased',
            InvoiceTool: 'NotPurchased',
            SuperAffiliate: 'NotPurchased',
            LightningSilver: 'NotPurchased',
            LightningGold: 'NotPurchased',
        };

        // Mark purchased products
        for (const row of userProducts) {
            const product = row.product; // could be string | null in types, but query excludes null

            // double-guard keeps TS + runtime happy even if prisma types stay nullable
            if (!product) continue;

            if (Object.prototype.hasOwnProperty.call(products, product)) {
                products[product as ProductKey] = 'Purchased';
            }
        }

        return res.status(200).json({
            message: 'Fetched by id successfully',
            data: products,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
