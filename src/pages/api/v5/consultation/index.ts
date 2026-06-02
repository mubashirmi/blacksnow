import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

function getQueryValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const idValue = getQueryValue(req.query.id);

        if (idValue) {
            const id = Number(idValue);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    message: 'Invalid consultation id.',
                });
            }

            const consultation = await prisma.consultation.findFirst({
                where: {
                    id,
                    deleted: false,
                },
            });

            if (!consultation) {
                return res.status(404).json({
                    message: 'Consultation not found.',
                });
            }

            return res.status(200).json({
                message: 'Consultation fetched successfully.',
                consultation,
            });
        }

        const consultations = await prisma.consultation.findMany({
            where: {
                deleted: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.status(200).json({
            message: 'Consultations fetched successfully.',
            consultations,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
