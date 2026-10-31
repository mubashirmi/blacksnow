import { ApiError, sendApiError } from '@/lib/apiErrors';
import { parseEmailServiceRole } from '@/lib/emailServiceRole';
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

function parseAuthId(value: unknown) {
    const authId = Number(value);
    if (!Number.isInteger(authId) || authId <= 0) {
        throw new ApiError(400, 'INVALID_AUTH_ID', 'A valid adminId/id is required');
    }
    return authId;
}

function validateCredentials(email: unknown, appPassword: unknown) {
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        throw new ApiError(400, 'INVALID_EMAIL', 'A valid sender email is required');
    }
    if (typeof appPassword !== 'string' || !appPassword.replace(/\s/g, '')) {
        throw new ApiError(400, 'INVALID_APP_PASSWORD', 'appPassword is required');
    }

    return { email: email.trim(), appPassword: appPassword.replace(/\s/g, '') };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!['GET', 'POST', 'PUT'].includes(req.method ?? '')) {
        res.setHeader('Allow', 'GET, POST, PUT');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const role = parseEmailServiceRole(req.method === 'GET' ? req.query.role : req.body?.role);
        const authId = parseAuthId(req.method === 'GET' ? req.query.adminId : req.body?.id);
        if (req.method === 'GET') {
            const policy = await prisma.emailMarketingCredentials.findUnique({
                where: { authId_role: { authId, role } },
            });

            return policy
                ? res.status(200).json({ message: 'Credentials fetched successfully', policy })
                : res.status(404).json({ message: `Credentials not found for ${role}` });
        }

        const credentials = validateCredentials(req.body?.email, req.body?.appPassword);

        if (req.method === 'POST') {
            const existing = await prisma.emailMarketingCredentials.findUnique({
                where: { authId_role: { authId, role } },
                select: { id: true },
            });
            if (existing) return res.status(409).json({ message: `Credentials already exist for ${role}` });

            const created = await prisma.emailMarketingCredentials.create({
                data: { ...credentials, authId, role },
            });
            return res.status(201).json({ message: 'Created successfully', created });
        }

        const updated = await prisma.emailMarketingCredentials.update({
            where: { authId_role: { authId, role } },
            data: credentials,
        });
        return res.status(200).json({ message: 'Updated successfully', updated });
    } catch (error) {
        return sendApiError(res, error);
    }
}
