import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const raw = (req.body?.authId ?? req.query?.authId ?? req.query?.id) as string | string[] | undefined;
    const id = Array.isArray(raw) ? Number(raw[0]) : Number(raw);

    if (!Number.isFinite(id)) {
        return res.status(400).json({ message: 'Invalid or missing authId' });
    }
    try {
        if (method === 'GET') {
            const userProducts = await prisma.checkout.findMany({
                where: { AuthId: id, cancelSubscripton: false },
                select: {
                    id: true,
                    product: true,
                },
            });

            if (!userProducts) {
                return res.status(200).json({
                    message: 'No product found',
                });
            }

            const products = {
                NewsLetter: 'NotPurchased',
                DigitalBillboard: 'NotPurchased',
                RSVP: 'NotPurchased',
            };

            for (let i = 0; i < userProducts.length; i++) {
                if (Object.prototype.hasOwnProperty.call(products, userProducts[i].product)) {
                    products[userProducts[i].product] = 'Purchased';
                }
            }

            return res.status(200).json({
                message: 'Fetched by id successfully',
                data: products,
            });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
