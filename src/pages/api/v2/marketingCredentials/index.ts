import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { adminId } = req.query;

    const Id = Number(adminId);
    try {
        if (method === 'GET') {
            const policy = await prisma.emailMarketingCredentials.findFirst({
                where: { authId: Id },
            });
            return policy
                ? res.status(200).json({ message: 'credentials fetched successfully', policy })
                : res.status(404).json({ message: 'credentials not found' });
        } else if (method === 'POST') {
            const { email, appPassword, id } = req.body;
            console.log(email, appPassword, id);
            const find = await prisma.emailMarketingCredentials.findFirst({
                where: { authId: id },
            });
            if (find) {
                return res.status(200).json('Credentials already exists.');
            }
            const created = await prisma.emailMarketingCredentials.create({
                data: {
                    email,
                    appPassword,
                    authId: id,
                },
            });
            return res.status(201).json({ message: 'Created successfully', created });
        } else if (method === 'PUT') {
            const { id, privacyPolicy } = req.body;
            const updated = await prisma.privacyPolicy.update({
                where: { id },
                data: { id, privacyPolicy },
            });
            return res.status(200).json({ message: 'Updated successfully', updated });
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
