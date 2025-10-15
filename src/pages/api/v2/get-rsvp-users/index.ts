import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'user-brought-products';
    const { method } = req;

    // Robust id parsing (id can be string | string[] | undefined)
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const eventId = idParam ? Number(idParam) : null;

    try {
        switch (method) {
            case 'GET': {
                try {
                    if (!eventId || Number.isNaN(eventId)) {
                        const items = await prisma.calendar.findMany({
                            select: {
                                id: true,
                                date: true,
                                time: true,
                                limit: true,
                                userBroughtProduct: true,
                            },
                        });

                        return res.status(200).json(baseResponse('UserBroughtProducts Retrieved', items));
                    }
                    const item = await prisma.calendar.findUnique({
                        where: { id: eventId },
                        select: {
                            id: true,
                            date: true,
                            time: true,
                            limit: true,
                            userBroughtProduct: true,
                        },
                    });
                    return res.status(200).json(baseResponse('UserBroughtProducts Retrieved', item));
                } catch (e) {
                    logger.error('Error fetching UserBroughtProducts', e);
                    return res.status(500).json(errorResponse('Error fetching UserBroughtProducts'));
                }
            }

            default:
                return res.status(404).end();
        }
    } catch (e) {
        logger.error('Unhandled error', e);
        return res.status(500).json(errorResponse('Internal server error'));
    }
};

export default api;
