import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { query } = req;
    const { id } = query;

    if (req.method === 'GET') {
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: 'Valid id is required' });
        }

        const userEmail = await prisma.auth.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!userEmail) {
            return res.status(404).json({ message: 'User not found' });
        }

        const response = {
            id: userEmail.id,
            email: userEmail.email,
        };

        return res.status(200).json(response);
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
