import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id } = req.query;

    const Id = Number(id);
    try {
        if (method === 'GET') {
            const affiliateData = await prisma.referralProducts.findMany({
                where: { authId: Id },
            });
            return res.status(200).json({ message: 'Affiliate Data', affiliateData });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
