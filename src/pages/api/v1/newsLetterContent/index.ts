import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import DOMPurify from 'isomorphic-dompurify';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'newsletter content creation';
    try {
        const { body } = req;
        let { title, content } = body;
        let result = {};
        switch (req.method) {
            case 'POST': {
                try {
                    logger.info(`creating newsletter content`);

                    content = DOMPurify.sanitize(content);

                    result = await prisma.newsLetterContent.create({
                        data: {
                            title,
                            content,
                        },
                    });
                    res.status(200).json(baseResponse('newsletter created', result));
                } catch (e) {
                    logger.error(`Error creating newsletter content ${e}`);
                    res.status(500).json(errorResponse('Error creating newsletter'));
                }
                break;
            }
            case 'GET': {
                try {
                    logger.info('fetching all newsletter contents');
                    const newsletters = await prisma.newsLetterContent.findMany({
                        where: {
                            deleted: false,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    });
                    if (newsletters.length > 0) {
                        res.status(200).json(baseResponse('Newsletters fetched successfully', { newsletters }));
                    } else {
                        logger.info('No newsletters found');
                        res.status(404).json(errorResponse('No newsletters found'));
                    }
                } catch (e) {
                    logger.error('Error fetching newsletters');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error fetching newsletters'));
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
