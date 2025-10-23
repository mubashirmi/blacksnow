// pages/api/seed/admin.ts
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'newBlackSnow@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASS ?? 'admin@1122';
const ADMIN_FIRST = process.env.ADMIN_FIRST ?? 'Admin';
const ADMIN_LAST = process.env.ADMIN_LAST ?? 'User';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        // Simple guard so you don’t accidentally run this in prod:
        const isProd = process.env.NODE_ENV === 'production';
        const seedKey = req.headers['x-seed-key'];
        if (isProd) {
            if (!process.env.SEED_KEY) {
                return res.status(500).json({ message: 'Missing SEED_KEY env in production.' });
            }
            if (seedKey !== process.env.SEED_KEY) {
                return res.status(401).json({ message: 'Unauthorized: bad or missing x-seed-key.' });
            }
        }

        if (!ADMIN_EMAIL || !ADMIN_PASS) {
            return res.status(400).json({ message: 'ADMIN_EMAIL/ADMIN_PASS not configured.' });
        }

        const adminSelector = {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            roles: true,
            createdAt: true,
            updatedAt: true,
        } as const;

        const existing = await prisma.auth.findUnique({
            where: { email: ADMIN_EMAIL },
            select: { id: true, roles: true },
        });

        const hashedPassword = await bcrypt.hash(String(ADMIN_PASS), 10);

        if (existing) {
            // Ensure "Admin" role is present (union it), and reset password to known seed pass
            const currentRoles = Array.isArray(existing.roles) ? existing.roles : [];
            const newRoles = Array.from(new Set([...currentRoles, 'Admin']));

            const updated = await prisma.auth.update({
                where: { id: existing.id },
                data: {
                    roles: newRoles as any, // Role[] enum; strings must match your Prisma enum
                    password: hashedPassword,
                    firstName: ADMIN_FIRST,
                    lastName: ADMIN_LAST,
                },
                select: adminSelector,
            });

            return res.status(200).json({ message: 'Admin user updated (idempotent)', user: updated });
        }

        // Create fresh admin
        const created = await prisma.auth.create({
            data: {
                email: ADMIN_EMAIL,
                firstName: ADMIN_FIRST,
                lastName: ADMIN_LAST,
                password: hashedPassword,
                roles: ['Admin'] as any,
            },
            select: adminSelector,
        });

        return res.status(201).json({ message: 'Admin user created', user: created });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
