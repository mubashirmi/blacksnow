import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            const terms = await prisma.terms.findFirst();
            return terms ? res.status(200).json({ message: 'Terms fetched', terms }) : res.status(404).json({ message: 'Terms not found' });
        } else if (method === 'POST') {
            const { terms } = req.body;
            const created = await prisma.terms.create({ data: { terms } });
            return res.status(201).json({ message: 'Created successfully', created });
        } else if (method === 'PUT') {
            const { id, terms } = req.body;
            const updated = await prisma.terms.update({
                where: { id },
                data: { terms },
            });
            return res.status(200).json({ message: 'Updated successfully', updated });
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
