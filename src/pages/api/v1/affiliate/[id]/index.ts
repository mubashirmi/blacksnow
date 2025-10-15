import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'affiliate';
    try {
        const { query } = req;
        const { id } = query;
        switch (req.method) {
            case 'POST': {
                try {
                    logger.info(`Toggling Affiliate`);
                    const affiliate = await prisma.affiliate.findUnique({
                        where: {
                            id: parseInt(id),
                        },
                    });
                    if (affiliate) {
                        const result = await prisma.affiliate.update({
                            where: {
                                id: parseInt(id),
                            },
                            data: { approved: !affiliate.approved },
                            include: {
                                User: true,
                            },
                        });
                        res.status(200).json(baseResponse('User is Toggled', result));
                    } else {
                        logger.error('Error Toggling Affiliate');
                    }
                } catch (e) {
                    logger.error('Error Toggling Affiliate');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error Toggling Affiliate'));
                }
                break;
            }
            case 'GET': {
                try {
                    if (id) {
                        logger.info(`Fetching Affiliate by ID: ${id}`);
                        const affiliate = await prisma.affiliate.findUnique({
                            where: {
                                id: parseInt(id),
                            },
                            include: {
                                User: true, // Include User related data if needed
                            },
                        });
                        if (affiliate) {
                            res.status(200).json(baseResponse('Affiliate fetched successfully', affiliate));
                        } else {
                            logger.error('Affiliate not found');
                            res.status(404).json(errorResponse('Affiliate not found'));
                        }
                    } else {
                        logger.info('Fetching all Affiliates');
                        const affiliates = await prisma.affiliate.findMany({
                            include: {
                                User: true, // Include User related data if needed
                            },
                        });
                        if (affiliates.length > 0) {
                            res.status(200).json(baseResponse('Affiliates fetched successfully', affiliates));
                        } else {
                            logger.error('No Affiliates found');
                            res.status(404).json(errorResponse('No Affiliates found'));
                        }
                    }
                } catch (e) {
                    logger.error('Error fetching Affiliate');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error fetching Affiliate'));
                }
                break;
            }

            default:
                res.status(404).end();
        }
    } catch (e) {
        res.status(500).json({ e });
    }
};

export default api;
