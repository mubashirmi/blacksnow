import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { authId } = req.query;
    const AuthId = Number(authId);

    if (req.method === 'DELETE') {
        try {
            const findUser = await prisma.auth.findFirst({
                where: {
                    id: AuthId,
                },
            });

            if (findUser) {
                await prisma.auth.delete({
                    where: {
                        id: AuthId,
                    },
                });
            } else {
                return res.status(404).json({ message: 'User Not Found' });
            }

            return res.status(200).json({ message: 'User Deleted Succesfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        // Handle method not allowed
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
