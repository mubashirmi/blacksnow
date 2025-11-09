// /pages/api/email-users.ts
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    // tiny helper to read a positive integer from query and validate it
    const getNumberFromQuery = (key: string) => {
        const raw = Array.isArray((req.query as any)[key]) ? (req.query as any)[key][0] : (req.query as any)[key];
        const n = Number(raw);
        if (!raw || Number.isNaN(n) || !Number.isInteger(n) || n <= 0) return null;
        return n;
    };

    try {
        if (method === 'POST') {
            const { email, fullName, authId } = req.body;

            if (!email || !fullName || !authId) {
                return res.status(400).json({ message: 'email, fullName and authId are required' });
            }

            const findEmail = await prisma.emailUser.findFirst({ where: { email, authId } });
            if (findEmail) {
                return res.status(200).json({ message: 'Email already exist.' });
            }

            const created = await prisma.emailUser.create({
                data: { email, fullName, authId: Number(authId) }, // ensure number
            });

            return res.status(201).json({ message: 'Created successfully', emailUser: created });
        }

        if (method === 'GET') {
            const id = getNumberFromQuery('id');
            const authId = getNumberFromQuery('authId');

            // GET by id
            if (id) {
                const emailUser = await prisma.emailUser.findUnique({ where: { id } });
                if (!emailUser) return res.status(404).json({ message: 'Email user not found' });
                return res.status(200).json({ emailUser });
            }

            // GET by authId
            if (authId) {
                // Use findFirst if authId is expected to be unique; switch to findMany if not.
                const emailUser = await prisma.emailUser.findMany({ where: { authId }, include: { emailUserCSV: true } });
                if (!emailUser) return res.status(404).json({ message: 'Email user not found' });
                return res.status(200).json({ emailUser });
            }

            // GET all
            const emailUsers = await prisma.emailUser.findMany({
                orderBy: { id: 'desc' },
            });
            return res.status(200).json({ emailUsers });
        }

        if (method === 'PUT' || method === 'PATCH') {
            const id = getNumberFromQuery('id');
            if (!id) return res.status(400).json({ message: 'Valid id is required in query (?id=)' });

            const { email, fullName, authId } = req.body ?? {};
            const data: Record<string, any> = {};
            if (email !== undefined) data.email = email;
            if (fullName !== undefined) data.fullName = fullName;
            if (authId !== undefined) data.authId = Number(authId);

            if (Object.keys(data).length === 0) {
                return res.status(400).json({ message: 'Nothing to update' });
            }

            // optional: prevent duplicate email on update
            if (email) {
                const existing = await prisma.emailUser.findFirst({
                    where: { email, id: { not: id } },
                });
                if (existing) return res.status(409).json({ message: 'Email already exist.' });
            }

            const updated = await prisma.emailUser.update({
                where: { id },
                data,
            });

            return res.status(200).json({ message: 'Updated successfully', emailUser: updated });
        }

        if (method === 'DELETE') {
            const id = getNumberFromQuery('id');
            if (!id) return res.status(400).json({ message: 'Valid id is required in query (?id=)' });

            await prisma.emailUser.delete({ where: { id } });
            return res.status(200).json({ message: 'Deleted successfully' });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error: any) {
        // Prisma "record not found" safe handling
        if (error?.code === 'P2025') {
            return res.status(404).json({ message: 'Email user not found' });
        }
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
