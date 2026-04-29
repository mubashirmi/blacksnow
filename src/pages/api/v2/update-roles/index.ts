import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

const AllowedRoles = new Set([
    'Affiliate',
    'Sales',
    'Admin',
    'NewsLetter',
    'InvoiceTool',
    'DigitalBillboard',
    'EmailMarketing',
    'SuperAffiliate',
    'LightningSilver',
    'LightningGold',
]);

function normalizeRoles(input: unknown): string[] {
    if (Array.isArray(input))
        return input
            .map(String)
            .map((s) => s.trim())
            .filter(Boolean);
    if (typeof input === 'string') return [input.trim()].filter(Boolean);
    return [];
}

function validateRoles(roles: string[]) {
    const invalid = roles.filter((r) => !AllowedRoles.has(r));
    if (invalid.length) {
        throw new Error(`Invalid role(s): ${invalid.join(', ')}. Allowed: ${Array.from(AllowedRoles).join(', ')}`);
    }
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const userId = id ? Number(Array.isArray(id) ? id[0] : id) : undefined;

    if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid or missing user id in URL.' });
    }

    try {
        if (req.method === 'PATCH') {
            // Support multiple field names for convenience
            const rolesToAdd = normalizeRoles((req.body && (req.body.rolesToAdd ?? req.body.add)) ?? []);
            const rolesToRemove = normalizeRoles((req.body && (req.body.rolesToRemove ?? req.body.remove)) ?? []);

            if (rolesToAdd.length === 0 && rolesToRemove.length === 0) {
                return res.status(400).json({
                    message: 'Provide rolesToAdd/add and/or rolesToRemove/remove to update roles.',
                });
            }

            // Validate incoming roles
            try {
                if (rolesToAdd.length) validateRoles(rolesToAdd);
                if (rolesToRemove.length) validateRoles(rolesToRemove);
            } catch (e: any) {
                return res.status(400).json({ message: e.message });
            }

            // Fetch existing user & roles
            const existing = await prisma.auth.findUnique({
                where: { id: userId },
                select: { id: true, roles: true, email: true },
            });

            if (!existing) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Current roles as a Set for easy add/remove
            const current = new Set<string>((existing.roles as unknown as string[]) ?? []);

            // Apply removals first
            for (const r of rolesToRemove) current.delete(r);

            // Then apply additions
            for (const r of rolesToAdd) current.add(r);

            const nextRoles = Array.from(current);

            // If no changes, return early
            const prevSorted = ((existing.roles as unknown as string[]) ?? []).slice().sort();
            const nextSorted = nextRoles.slice().sort();
            const noChange = prevSorted.length === nextSorted.length && prevSorted.every((v, i) => v === nextSorted[i]);

            if (noChange) {
                return res.status(200).json({
                    message: 'No changes to roles.',
                    user: { id: existing.id, email: existing.email, roles: nextRoles },
                });
            }

            // Persist changes
            const updated = await prisma.auth.update({
                where: { id: userId },
                data: { roles: nextRoles as any }, // Prisma Role[] enum
                select: { id: true, email: true, roles: true },
            });

            return res.status(200).json({
                message: 'Roles updated successfully',
                user: updated,
            });
        }

        if (req.method === 'GET') {
            // Optional: quick info endpoint for this route
            return res.status(200).json({ message: 'Update roles API. Use PATCH to add/remove roles.' });
        }

        res.setHeader('Allow', ['PATCH', 'GET']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
