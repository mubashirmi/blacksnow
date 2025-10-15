import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id } = req.query;

    const Id = Number(id);

    try {
        if (method === 'GET') {
            let item;
            if (id) {
                item = await prisma.referralProducts.findMany({ where: { authId: Id } });
                return item ? res.status(200).json({ message: 'Fetched by ID', data: item }) : res.status(404).json({ message: 'Not found' });
            }
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
