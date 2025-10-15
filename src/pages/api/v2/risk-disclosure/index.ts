// pages/api/risk-disclosure.ts
import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            const disclosure = await prisma.riskDisclosure.findFirst();
            if (disclosure) {
                return res.status(200).json({ message: 'Risk disclosure fetched', disclosure });
            } else {
                return res.status(404).json({ message: 'Risk disclosure not found' });
            }
        } else if (method === 'POST') {
            const { riskDisclosure } = req.body;
            const created = await prisma.riskDisclosure.create({ data: { riskDisclosure } });
            return res.status(201).json({ message: 'Created successfully', created });
        } else if (method === 'PUT') {
            const { id, riskDisclosure } = req.body;
            const updated = await prisma.riskDisclosure.update({
                where: { id },
                data: { riskDisclosure },
            });
            return res.status(200).json({ message: 'Updated successfully', updated });
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
