import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'consultation';
    try {
        const { body } = req;
        switch (req.method) {
            case 'POST': {
                try {
                    logger.info(`Saving consultation`);
                    const consultation = await prisma.consultation.create({
                        data: body,
                    });
                    logger.info('Created the consultation');
                    res.status(200).json(baseResponse('consultation Created', { consultation }));
                } catch (e) {
                    logger.error('Error creating consultation');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error creating consultation'));
                }
                break;
            }
            case 'GET': {
                try {
                    logger.info('Fetching all consultations');
                    const consultations = await prisma.consultation.findMany();
                    if (consultations.length > 0) {
                        res.status(200).json(baseResponse('Consultations fetched successfully', { consultations }));
                    } else {
                        logger.info('No consultations found');
                        res.status(404).json(errorResponse('No consultations found'));
                    }
                } catch (e) {
                    logger.error('Error fetching consultations');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error fetching consultations'));
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
