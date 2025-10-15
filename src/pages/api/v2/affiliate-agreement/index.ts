import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            const agreement = await prisma.affiliateAgreement.findFirst();
            return agreement
                ? res.status(200).json({ message: 'Affiliate agreement fetched', agreement })
                : res.status(404).json({ message: 'Affiliate agreement not found' });
        } else if (method === 'POST') {
            const { affiliateAgreement } = req.body;
            const created = await prisma.affiliateAgreement.create({ data: { affiliateAgreement } });
            return res.status(201).json({ message: 'Created successfully', created });
        } else if (method === 'PUT') {
            const { id, affiliateAgreement } = req.body;
            const updated = await prisma.affiliateAgreement.update({
                where: { id },
                data: { affiliateAgreement },
            });
            return res.status(200).json({ message: 'Updated successfully', updated });
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
