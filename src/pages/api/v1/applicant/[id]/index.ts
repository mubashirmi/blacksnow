import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'delete applicant';
    try {
        const { query } = req;
        const { id } = query;
        switch (req.method) {
            case 'DELETE': {
                try {
                    logger.info(`Deleting applicant`);
                    await prisma.applicants.delete({
                        where: {
                            id: parseInt(id),
                        },
                    });
                    logger.info('Deleted the applicant');
                    res.status(200).json(baseResponse('Applicant Deleted', {}));
                } catch (e) {
                    logger.error('Error deleting job');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error deleting applicant'));
                }
                break;
            }
            case 'GET': {
                // if the request method is GET, fetch the applicant details
                try {
                    logger.info('Fetching applicant');
                    const applicant = await prisma.applicants.findUnique({
                        where: { id: parseInt(id), deleted: false }, // Only fetch non-deleted applicants
                    });

                    if (!applicant) {
                        logger.warn(`Applicant with id ${id} not found`);
                        return res.status(404).json(errorResponse('Applicant not found'));
                    }

                    logger.info(`Fetched applicant with id ${id}`);
                    res.status(200).json(baseResponse('Applicant fetched successfully', { applicant }));
                } catch (e) {
                    // If an error occurs while fetching the applicant
                    logger.error('Error fetching applicant');
                    logger.error(e);

                    res.status(500).json(errorResponse('Error fetching applicant')); // Respond with an error
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
