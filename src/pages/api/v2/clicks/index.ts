import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id } = req.query;

    const Id = Number(id);

    try {
        if (method === 'PUT') {
            const { productLink } = req.body;

            await prisma.referralProducts.updateMany({
                where: {
                    authId: Id,
                    productLink,
                },
                data: {
                    clicks: { increment: 1 },
                },
            });

            return res.status(200).json({ message: 'Incremented' });
        }
        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
