import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { id, authId } = req.query;

        // ---- Validation ----
        if (!id && !authId) {
            return res.status(400).json({ message: 'Provide either "id" or "authId" in query params.' });
        }

        // ---- Fetch single record ----
        if (id) {
            const history = await prisma.emailSentHistory.findUnique({
                where: { id: String(id) },
                include: {
                    auth: { select: { id: true, email: true, firstName: true, lastName: true } },
                    emailUser: { select: { id: true, email: true, fullName: true } },
                    credentials: { select: { id: true, email: true } },
                    jobResult: { select: { id: true, runAt: true, status: true } },
                },
            });

            if (!history) return res.status(404).json({ message: 'History record not found.' });
            return res.status(200).json(history);
        }

        // ---- Fetch all for an authId ----
        const histories = await prisma.emailSentHistory.findMany({
            where: { authId: Number(authId) },
            include: {
                emailUser: { select: { id: true, email: true, fullName: true } },
                credentials: { select: { id: true, email: true } },
            },
            orderBy: { sentAt: 'desc' },
        });

        return res.status(200).json({
            count: histories.length,
            histories,
        });
    } catch (error: any) {
        console.error('Error fetching email history:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
