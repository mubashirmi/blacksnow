// pages/api/auth/[id].ts

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

// mirror the Prisma enum to validate incoming payloads
const AllowedRoles = new Set([
    'Affiliate',
    'SuperAffiliate',
    'Sales',
    'Admin',
    'NewsLetter',
    'Rsvp',
    'DigitalBillboard',
    'EmailMarketing',
    'InvoiceTool',
    'LightningSilver',
    'LightningGold',
]);

// allowed status values
const AllowedStatuses = new Set(['active', 'inactive', 'suspended']);

function normalizeRoles(input: unknown): string[] {
    // accept: roles: string[], or role: string (back-compat)
    if (Array.isArray(input))
        return input
            .map(String)
            .map((r) => r.trim())
            .filter(Boolean);
    if (typeof input === 'string' && input.trim()) return [input.trim()];
    return [];
}

function validateRoles(roles: string[]) {
    const invalid = roles.filter((r) => !AllowedRoles.has(r));

    if (invalid.length) {
        throw new Error(`Invalid role(s): ${invalid.join(', ')}. Allowed: ${Array.from(AllowedRoles).join(', ')}`);
    }
}

function normalizeOptionalString(input: unknown): string | undefined {
    if (input === undefined || input === null) return undefined;

    const value = String(input).trim();
    // eslint-disable-next-line
    return value ? value : undefined;
}

function normalizeStatus(input: unknown): string | undefined {
    if (input === undefined || input === null) return undefined;
    // eslint-disable-next-line
    const value = String(input).trim().toLowerCase();
    // eslint-disable-next-line
    return value ? value : undefined;
}

function validateStatus(status: string) {
    if (!AllowedStatuses.has(status)) {
        throw new Error(`Invalid status: ${status}. Allowed: ${Array.from(AllowedStatuses).join(', ')}`);
    }
}
// eslint-disable-next-line
function escapeHtml(input: string) {
    return input.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { id, referredBy } = req.query;
    const userId = id ? Number(Array.isArray(id) ? id[0] : id) : undefined;

    try {
        if (req.method === 'POST') {
            const { email, firstName, lastName, password, phone, status } = req.body;

            // accept both `roles` and legacy `role`
            const rolesInput = 'roles' in req.body ? req.body.roles : req.body.role;
            const roles = normalizeRoles(rolesInput);

            const phoneNumber = normalizeOptionalString(phone);
            const userStatus = normalizeStatus(status);

            if (!email || !firstName || !lastName || !password) {
                return res.status(400).json({
                    message: 'Missing required fields: email, firstName, lastName, password.',
                });
            }

            try {
                validateRoles(roles);

                if (userStatus) {
                    validateStatus(userStatus);
                }
            } catch (e: any) {
                return res.status(400).json({ message: e.message });
            }

            const existing = await prisma.auth.findUnique({
                where: { email: String(email) },
            });

            if (existing) {
                return res.status(409).json({ message: 'Email already exists.' });
            }

            if (phoneNumber) {
                const existingPhone = await prisma.auth.findUnique({
                    where: { phone: phoneNumber },
                });

                if (existingPhone) {
                    return res.status(409).json({ message: 'Phone number already exists.' });
                }
            }

            const hashedPassword = await bcrypt.hash(String(password), 10);

            const user = await prisma.auth.create({
                data: {
                    email: String(email),
                    phone: phoneNumber,
                    firstName: String(firstName),
                    lastName: String(lastName),
                    password: hashedPassword,
                    roles: roles as any,

                    // if not provided, Prisma default "active" will be used
                    ...(userStatus ? { status: userStatus } : {}),

                    ...(referredBy
                        ? {
                              referredById: parseInt(Array.isArray(referredBy) ? referredBy[0] : referredBy, 10),
                          }
                        : {}),
                },
            });

            return res.status(201).json({
                message: 'User created successfully',
                user,
            });
        }

        if (req.method === 'GET') {
            return res.status(200).json({
                message: 'yes this is signup api',
            });
        }

        if (req.method === 'PUT') {
            if (!userId || Number.isNaN(userId)) {
                return res.status(400).json({
                    message: 'Invalid or missing user id in URL.',
                });
            }

            const updateData: any = {};

            const hasRolesPayload = 'roles' in req.body || 'role' in req.body;
            const hasStatusPayload = 'status' in req.body;

            if (hasRolesPayload) {
                const rolesInput = 'roles' in req.body ? req.body.roles : req.body.role;
                const roles = normalizeRoles(rolesInput);

                if (roles.length === 0) {
                    return res.status(400).json({
                        message: 'Provide at least one role to update.',
                    });
                }

                try {
                    validateRoles(roles);
                } catch (e: any) {
                    return res.status(400).json({ message: e.message });
                }

                updateData.roles = roles as any;
            }

            if (hasStatusPayload) {
                const userStatus = normalizeStatus(req.body.status);

                if (!userStatus) {
                    return res.status(400).json({
                        message: 'Provide a valid status to update.',
                    });
                }

                try {
                    validateStatus(userStatus);
                } catch (e: any) {
                    return res.status(400).json({ message: e.message });
                }

                updateData.status = userStatus;
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    message: 'Provide at least one field to update: roles or status.',
                });
            }

            const user = await prisma.auth.update({
                where: { id: userId },
                data: updateData,
            });

            return res.status(200).json({
                message: 'User updated successfully',
                user,
            });
        }

        res.setHeader('Allow', ['POST', 'GET', 'PUT']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
