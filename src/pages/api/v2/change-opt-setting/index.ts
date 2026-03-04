// pages/api/change-opt-setting.ts
import { verifyOptToken } from '@/lib/optToken';
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { token } = req.body ?? {};
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: '"token" is required' });
        }

        const payload = verifyOptToken(token);
        if (!payload) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const optType = payload.action === 'optin' ? 'true' : 'false';

        // Update the EmailUser optType
        const updated = await prisma.emailUser.update({
            where: { id: payload.emailUserId },
            data: { optType },
            select: { id: true, email: true, optType: true },
        });

        return res.status(200).json({ message: 'Updated', user: updated });
    } catch (error: any) {
        return res.status(500).json({ message: 'Internal server error', error: error?.message ?? 'Unknown error' });
    }
}
