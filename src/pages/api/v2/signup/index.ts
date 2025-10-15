import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

// Use Next.js API route handler for page routing
// pages/api/auth/[id].ts (or wherever your route is)

// mirror the Prisma enum to validate incoming payloads
const AllowedRoles = new Set(['Affiliate', 'Sales', 'Admin', 'NewsLetter', 'Rsvp', 'DigitalBillboard']);

function normalizeRoles(input: unknown): string[] {
    // accept: roles: string[], or role: string (back-compat)
    if (Array.isArray(input)) {
        return input.map(String);
    }
    if (typeof input === 'string' && input.trim()) {
        return [input.trim()];
    }
    return [];
}

function validateRoles(roles: string[]) {
    const invalid = roles.filter((r) => !AllowedRoles.has(r));
    if (invalid.length) {
        throw new Error(`Invalid role(s): ${invalid.join(', ')}. Allowed: ${Array.from(AllowedRoles).join(', ')}`);
    }
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { id, referredBy } = req.query;
    const userId = id ? Number(Array.isArray(id) ? id[0] : id) : undefined;

    try {
        if (req.method === 'POST') {
            const { email, firstName, lastName, password } = req.body;

            // accept both `roles` and legacy `role`
            const rolesInput = 'roles' in req.body ? req.body.roles : req.body.role;
            const roles = normalizeRoles(rolesInput);

            // basic required fields
            if (!email || !firstName || !lastName || !password) {
                return res.status(400).json({ message: 'Missing required fields (email, firstName, lastName, password, roles).' });
            }

            // validate roles
            try {
                validateRoles(roles);
            } catch (e: any) {
                return res.status(400).json({ message: e.message });
            }

            // check existing
            const existing = await prisma.auth.findUnique({ where: { email: String(email) } });
            if (existing) {
                return res.status(409).json({ message: 'Email already exists.' });
            }

            const hashedPassword = await bcrypt.hash(String(password), 10);

            const user = await prisma.auth.create({
                data: {
                    email: String(email),
                    firstName: String(firstName),
                    lastName: String(lastName),
                    password: hashedPassword,
                    roles: roles as any, // Prisma accepts Role[]; strings must match enum
                    ...(referredBy
                        ? {
                              referredById: parseInt(Array.isArray(referredBy) ? referredBy[0] : (referredBy as string), 10),
                          }
                        : {}),
                },
            });

            return res.status(201).json({ message: 'User created successfully', user });
        }

        if (req.method === 'GET') {
            return res.status(200).json({ message: 'yes this is signup api' });
        }

        if (req.method === 'PUT') {
            if (!userId || Number.isNaN(userId)) {
                return res.status(400).json({ message: 'Invalid or missing user id in URL.' });
            }

            // accept both `roles` and legacy `role`
            const rolesInput = 'roles' in req.body ? req.body.roles : req.body.role;
            const roles = normalizeRoles(rolesInput);

            if (roles.length === 0) {
                return res.status(400).json({ message: 'Provide at least one role to update.' });
            }

            try {
                validateRoles(roles);
            } catch (e: any) {
                return res.status(400).json({ message: e.message });
            }

            const user = await prisma.auth.update({
                where: { id: userId },
                data: { roles: roles as any }, // replace full roles array
            });

            return res.status(200).json({ message: 'Roles updated successfully', user });
        }

        res.setHeader('Allow', ['POST', 'GET', 'PUT']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
