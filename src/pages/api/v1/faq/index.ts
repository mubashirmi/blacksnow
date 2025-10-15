import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'faq';
    try {
        const { query, body } = req;
        const { title, text } = body;

        const { id } = query;

        switch (req.method) {
            case 'POST': {
                try {
                    logger.info(`Saving faq`);
                    const faq = await prisma.frequentQuestions.create({
                        data: {
                            title,
                            text,
                        },
                    });
                    logger.info('Created the faq');
                    res.status(200).json(baseResponse('FAQ Created', { faq }));
                } catch (e) {
                    logger.error('Error creating faq');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error creating faq'));
                }
                break;
            }
            case 'GET': {
                try {
                    if (id) {
                        // Fetch a specific FAQ by ID
                        logger.info(`Fetching FAQ with id: ${id}`);
                        const faq = await prisma.frequentQuestions.findUnique({
                            where: { id: parseInt(id, 10) },
                        });

                        if (faq) {
                            logger.info('Fetched the faq');
                            res.status(200).json(baseResponse('FAQ Found', { faq }));
                        } else {
                            logger.info('FAQ not found');
                            res.status(404).json(errorResponse('FAQ not found'));
                        }
                    } else {
                        // Fetch all FAQs if no ID is provided
                        logger.info('Fetching all FAQs');
                        const faqs = await prisma.frequentQuestions.findMany();
                        logger.info('Fetched all faqs');
                        res.status(200).json(baseResponse('FAQs Found', { faqs }));
                    }
                } catch (e) {
                    logger.error('Error fetching faq');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error fetching faq'));
                }
                break;
            }
            case 'DELETE': {
                try {
                    logger.info(`deleting faq`);
                    await prisma.frequentQuestions.delete({
                        where: {
                            id: parseInt(id),
                        },
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
        logger.error('Internal Server Error');
        res.status(500).json({ e });
    }
};

export default api;
