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

type ProductStatus = 'Purchased' | 'Paused' | 'NotPurchased';

type ProductsStatus = Record<ProductKey, ProductStatus>;

const initialProducts: ProductsStatus = {
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

function isProductKey(product: string): product is ProductKey {
    return Object.prototype.hasOwnProperty.call(initialProducts, product);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const raw = req.body?.authId ?? req.query.authId ?? req.query.id;
    const id = Number(Array.isArray(raw) ? raw[0] : raw);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Invalid or missing authId',
        });
    }

    try {
        const userProducts = await prisma.checkout.findMany({
            where: {
                AuthId: id,
                cancelSubscripton: false,
                product: {
                    not: null,
                },
            },
            select: {
                product: true,
                pause: true,
            },
        });

        const products: ProductsStatus = { ...initialProducts };

        for (const row of userProducts) {
            if (!row.product || !isProductKey(row.product)) {
                continue;
            }

            products[row.product] = row.pause ? 'Paused' : 'Purchased';
        }

        return res.status(200).json({
            message: 'Products fetched successfully',
            data: products,
        });
    } catch (error) {
        console.error('Failed to fetch products:', error);

        return res.status(500).json({
            message: 'Internal server error',
        });
    }
}
