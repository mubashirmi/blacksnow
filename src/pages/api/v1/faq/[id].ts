import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'faq';
    try {
        const { query } = req;
        const { id } = query;
        switch (req.method) {
            case 'DELETE': {
                try {
                    logger.info(`deleting faq`);
                    await prisma.frequentQuestions.update({
                        where: {
                            id: parseInt(id),
                        },
                        data: { deleted: true },
                    });
                    logger.info('deleted the faq');
                    res.status(200).json(baseResponse('faq deleted', {}));
                } catch (e) {
                    logger.error('Error deleting faq');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error deleting faq'));
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
