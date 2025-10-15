import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'delete job';
    try {
        const { query } = req;
        const { id } = query;
        switch (req.method) {
            case 'DELETE': {
                try {
                    logger.info(`Deleting job`);
                    await prisma.careers.delete({
                        where: {
                            id: parseInt(id),
                        },
                    });
                    logger.info('Deleted the job');
                    res.status(200).json(baseResponse('Job Deleted', {}));
                } catch (e) {
                    logger.error('Error deleting job');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error deleting job'));
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
