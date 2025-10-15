import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            const gdpr = await prisma.gdpr.findFirst();
            return gdpr ? res.status(200).json({ message: 'GDPR fetched', gdpr }) : res.status(404).json({ message: 'GDPR not found' });
        } else if (method === 'POST') {
            const { gdpr: gdprText } = req.body;
            const created = await prisma.gdpr.create({ data: { gdpr: gdprText } });
            return res.status(201).json({ message: 'Created', created });
        } else if (method === 'PUT') {
            const { id, gdpr: gdprText } = req.body;
            const updated = await prisma.gdpr.update({ where: { id }, data: { gdpr: gdprText } });
            return res.status(200).json({ message: 'Updated', updated });
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
