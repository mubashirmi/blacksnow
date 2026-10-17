import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            const policy = await prisma.privacyPolicy.findFirst();
            return policy ? res.status(200).json({ message: 'Privacy policy fetched', policy }) : res.status(404).json({ message: 'Privacy policy not found' });
        } else if (method === 'POST') {
            const { privacyPolicy } = req.body;
            const created = await prisma.privacyPolicy.create({ data: { privacyPolicy, content: privacyPolicy } });
            return res.status(201).json({ message: 'Created successfully', created });
        } else if (method === 'PUT') {
            const { id, privacyPolicy } = req.body;
            const updated = await prisma.privacyPolicy.update({
                where: { id },
                data: { privacyPolicy, content: privacyPolicy },
            });
            return res.status(200).json({ message: 'Updated successfully', updated });
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
