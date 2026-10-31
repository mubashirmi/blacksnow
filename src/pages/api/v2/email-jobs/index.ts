import { ApiError, sendApiError } from '@/lib/apiErrors';
import { parseEmailServiceRole } from '@/lib/emailServiceRole';
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { id, authId } = req.query;
        const role = parseEmailServiceRole(req.query.role);

        // ---- Validation ----
        if (!id && !authId) {
            return res.status(400).json({ message: 'Provide either "id" or "authId" in query params.' });
        }

        // ---- Fetch single record ----
        if (id) {
            const history = await prisma.emailJobResult.findUnique({
                where: { id: String(id) },
                include: {
                    auth: { select: { id: true, email: true, firstName: true, lastName: true } },
                    emailUser: { select: { id: true, email: true, fullName: true } },
                },
            });

            if (!history) return res.status(404).json({ message: 'History record not found.' });
            if (history.role !== role) return res.status(404).json({ message: 'History record not found for this role.' });
            return res.status(200).json(history);
        }

        // ---- Fetch all for an authId ----
        const parsedAuthId = Number(authId);
        if (!Number.isInteger(parsedAuthId) || parsedAuthId <= 0) throw new ApiError(400, 'INVALID_AUTH_ID', 'A valid authId is required');
        const histories = await prisma.emailJobResult.findMany({
            where: { authId: parsedAuthId, role },
            include: {
                emailUser: { select: { id: true, email: true, fullName: true } },
            },
            // orderBy: { sentAt: 'desc' },
        });

        return res.status(200).json({
            count: histories.length,
            histories,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
