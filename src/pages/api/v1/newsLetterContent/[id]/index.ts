import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import DOMPurify from 'isomorphic-dompurify';
import logger from '../../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'newsletter content';
    try {
        const { body, query } = req;
        const { id } = query;
        let { title, published, content } = body;
        let result = {};
        switch (req.method) {
            case 'PUT': {
                try {
                    logger.info(`editing newsletter content`);

                    content = DOMPurify.sanitize(content);

                    const newsletter = await prisma.newsLetterContent.findUnique({ where: { id } });

                    if (newsletter) {
                        result = await prisma.newsLetterContent.update({
                            where: {
                                id: parseInt(id),
                            },
                            data: {
                                title,
                                content,
                                published,
                            },
                        });
                    } else {
                        res.status(500).json(errorResponse('Error editing newsletter'));
                        result = await prisma.newsLetterContent.create({
                            data: {
                                title,
                                content,
                            },
                        });
                    }
                    res.status(200).json(baseResponse('newsletter created', result));
                } catch (e) {
                    logger.error(`Error editing newsletter content ${e}`);
                    res.status(500).json(errorResponse('Error editing newsletter'));
                }
                break;
            }
            case 'GET': {
                try {
                    logger.info(`fetching newsletter content by ID: ${id}`);
                    const newsletter = await prisma.newsLetterContent.findUnique({
                        where: {
                            id: parseInt(id),
                        },
                    });
                    if (newsletter) {
                        res.status(200).json(baseResponse('Newsletter fetched successfully', newsletter));
                    } else {
                        logger.error('Newsletter not found');
                        res.status(404).json(errorResponse('Newsletter not found'));
                    }
                } catch (e) {
                    logger.error(`Error fetching newsletter content by ID: ${id}`);
                    logger.error(e);
                    res.status(500).json(errorResponse('Error fetching newsletter content'));
                }
                break;
            }

            case 'DELETE':
                try {
                    logger.info('deleting newsletter content');

                    result = await prisma.newsLetterContent.update({
                        where: {
                            id: parseInt(id),
                        },
                        data: {
                            deleted: true,
                        },
                    });
                    res.status(200).json(baseResponse('blog deleted', result));
                } catch (e) {
                    logger.error(`Error deleting newsletter content ${e}`);
                    res.status(500).json(errorResponse(`Error deleting newsletter content ${e}`));
                }
                break;
            default:
                res.status(404).end();
        }
    } catch (e) {
        res.status(500).json({ e });
    }
};

export default api;
