import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    // Prevent stale/cached API responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    try {
        switch (req.method) {
            // =========================
            // GET AFFILIATE AGREEMENT
            // =========================
            case 'GET': {
                const agreement = await prisma.affiliateAgreement.findFirst({
                    orderBy: {
                        updatedAt: 'desc',
                    },
                });

                if (!agreement) {
                    return res.status(404).json({
                        message: 'Affiliate agreement not found',
                    });
                }

                return res.status(200).json({
                    message: 'Affiliate agreement fetched successfully',
                    agreement,
                });
            }

            // =========================
            // CREATE AFFILIATE AGREEMENT
            // =========================
            case 'POST': {
                const { affiliateAgreement } = req.body;

                if (!affiliateAgreement || typeof affiliateAgreement !== 'string') {
                    return res.status(400).json({
                        message: 'Affiliate agreement is required',
                    });
                }

                // Check if an agreement already exists
                const existingAgreement = await prisma.affiliateAgreement.findFirst({
                    orderBy: {
                        updatedAt: 'desc',
                    },
                });

                // Since we only want ONE agreement,
                // update the existing one instead of creating duplicates.
                if (existingAgreement) {
                    const updated = await prisma.affiliateAgreement.update({
                        where: {
                            id: existingAgreement.id,
                        },
                        data: {
                            affiliateAgreement,
                            content: affiliateAgreement,
                        },
                    });

                    return res.status(200).json({
                        message: 'Affiliate agreement updated successfully',
                        agreement: updated,
                    });
                }

                const created = await prisma.affiliateAgreement.create({
                    data: {
                        affiliateAgreement,
                        content: affiliateAgreement,
                    },
                });

                return res.status(201).json({
                    message: 'Affiliate agreement created successfully',
                    agreement: created,
                });
            }

            // =========================
            // UPDATE AFFILIATE AGREEMENT
            // =========================
            case 'PUT': {
                const { id, affiliateAgreement } = req.body;

                if (!affiliateAgreement || typeof affiliateAgreement !== 'string') {
                    return res.status(400).json({
                        message: 'Affiliate agreement is required',
                    });
                }

                /*
                 * If ID is provided, update that exact record.
                 * Otherwise update the latest/current agreement.
                 */
                let agreementId: number;

                if (id !== undefined && id !== null) {
                    agreementId = Number(id);

                    if (Number.isNaN(agreementId)) {
                        return res.status(400).json({
                            message: 'Invalid affiliate agreement ID',
                        });
                    }
                } else {
                    const existingAgreement = await prisma.affiliateAgreement.findFirst({
                        orderBy: {
                            updatedAt: 'desc',
                        },
                    });

                    if (!existingAgreement) {
                        return res.status(404).json({
                            message: 'Affiliate agreement not found',
                        });
                    }

                    agreementId = existingAgreement.id;
                }

                const updated = await prisma.affiliateAgreement.update({
                    where: {
                        id: agreementId,
                    },
                    data: {
                        affiliateAgreement,
                        content: affiliateAgreement,
                    },
                });

                return res.status(200).json({
                    message: 'Affiliate agreement updated successfully',
                    agreement: updated,
                });
            }

            default: {
                res.setHeader('Allow', ['GET', 'POST', 'PUT']);

                return res.status(405).json({
                    message: `Method ${req.method} not allowed`,
                });
            }
        }
    } catch (error) {
        console.error('Affiliate Agreement API Error:', error);

        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
    }
}
