import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const roleName = 'Sale';

            const auths = await prisma.auth.findMany({
                where: {
                    role: {
                        name: roleName,
                    },
                },
                include: {
                    role: true,
                },
            });

            if (auths.length > 0) {
                return res.status(200).json({ message: 'Auth users fetched successfully', auths });
            } else {
                return res.status(404).json({ message: 'No Auth users found for Sale role' });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
