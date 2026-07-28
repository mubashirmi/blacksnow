// pages/api/auth/status/[id].ts

import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

const AllowedStatuses = new Set(['active', 'inactive', 'suspended']);

function normalizeStatus(input: unknown): string | undefined {
    if (input === undefined || input === null) return undefined;

    const value = String(input).trim().toLowerCase();
    return value || undefined;
}

function validateStatus(status: string) {
    if (!AllowedStatuses.has(status)) {
        throw new Error(`Invalid status: ${status}. Allowed: ${Array.from(AllowedStatuses).join(', ')}`);
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const userId = Number(Array.isArray(id) ? id[0] : id);

    if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({
            message: 'Invalid or missing user id.',
        });
    }

    try {
        if (req.method !== 'PUT' && req.method !== 'PATCH') {
            res.setHeader('Allow', ['PUT', 'PATCH']);
            return res.status(405).json({
                message: 'Method Not Allowed',
            });
        }

        const status = normalizeStatus(req.body.status);

        if (!status) {
            return res.status(400).json({
                message: 'Status is required.',
            });
        }

        try {
            validateStatus(status);
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
            });
        }

        const existingUser = await prisma.auth.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!existingUser) {
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        const updatedUser = await prisma.auth.update({
            where: { id: userId },
            data: {
                status,
            },
        });

        return res.status(200).json({
            message: 'Status updated successfully.',
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}
