import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const ROLE_LIST = [Role.Sales, Role.Affiliate, Role.NewsLetter, Role.Rsvp, Role.DigitalBillboard, Role.EmailMarketing, Role.InvoiceTool] as const;

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const rows = await prisma.auth.findMany({
            where: {
                roles: { hasSome: [Role.Sales, Role.Affiliate] },
            },
        });

        // example: count users by role
        const countsByRole = ROLE_LIST.reduce((acc, role) => {
            acc[role] = rows.filter((u) => u.roles.includes(role)).length;
            return acc;
        }, {} as Record<Role, number>);

        return res.status(200).json({ countsByRole });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
