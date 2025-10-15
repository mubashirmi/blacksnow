import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'calendar';
    try {
        const { query } = req;
        const { id } = query;
        switch (req.method) {
            case 'GET': {
                try {
                    logger.info('Getting calendar users by ID');
                    const result = await prisma.calendar.findUnique({
                        where: {
                            id: parseInt(id),
                        },
                        include: {
                            SignUp: true,
                        },
                    });
                    res.status(200).json(baseResponse('Users retrieved', result));
                } catch (e) {
                    logger.error('Error getting users');
                    logger.error(e);
                    res.status(500).json({ e });
                }
                break;
            }
            case 'DELETE': {
                try {
                    logger.info(`Deleting calendar`);
                    await prisma.calendar.delete({
                        where: {
                            id: parseInt(id),
                        },
                    });
                    logger.info('Deleted the calendar');
                    res.status(200).json(baseResponse('Calendar Deleted', {}));
                } catch (e) {
                    logger.error('Error deleting calendar');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error deleting calendar'));
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
