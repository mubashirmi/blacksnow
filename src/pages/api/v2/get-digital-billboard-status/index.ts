import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    // Accept authId from body or query
    const raw = req.query?.id as string | string[] | undefined;
    const id = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
    try {
        if (method === 'GET') {
            const billboardData = await prisma.digitalBillboard.findMany({
                where: { authId: id },
            });

            if (!billboardData) {
                return res.status(200).json({ message: 'No digital billboard exist', status: false });
            }

            return res.status(200).json({ message: 'Digital billboard exist', status: true, billboardData });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
