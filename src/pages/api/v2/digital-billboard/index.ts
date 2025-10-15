import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id } = req.query;

    const billboardId = Number(id);

    try {
        if (method === 'POST') {
            const { fullName, website, podcast, twitter, youTube, facebook, image, companyName, description } = req.body;

            const created = await prisma.digitalBillboard.create({
                data: {
                    fullName,
                    website,
                    podcast,
                    twitter,
                    youTube,
                    facebook,
                    image,
                    companyName,
                    description,
                    status: 'NotApproved', // default explicitly here too
                    authId: Number(Array.isArray(id) ? id[0] : id),
                },
            });

            return res.status(201).json({ message: 'Created', data: created });
        }
        if (method === 'GET') {
            let item;
            if (id) {
                item = await prisma.digitalBillboard.findUnique({ where: { id: billboardId } });
                return item ? res.status(200).json({ message: 'Fetched by ID', data: item }) : res.status(404).json({ message: 'Not found' });
            } else {
                item = await prisma.digitalBillboard.findMany();
                return item ? res.status(200).json({ message: 'Fetched all', data: item }) : res.status(404).json({ message: 'Not found' });
            }
        }

        if (method === 'PUT') {
            const { fullName, website, podcast, twitter, youTube, facebook, image, companyName, description, status } = req.body;

            const updated = await prisma.digitalBillboard.update({
                where: { id: billboardId },
                data: {
                    fullName,
                    website,
                    podcast,
                    twitter,
                    youTube,
                    facebook,
                    image,
                    companyName,
                    description,
                    status,
                },
            });

            return res.status(200).json({ message: 'Updated', data: updated });
        }

        if (method === 'DELETE') {
            await prisma.digitalBillboard.delete({ where: { id: billboardId } });
            return res.status(200).json({ message: 'Deleted successfully' });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
