import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'newsletter sign up';
    try {
        const { body } = req;
        switch (req.method) {
            case 'GET': {
                try {
                    logger.info(`Saving user info for newsletter`);
                    const result = await prisma.newsLetter.findMany();
                    logger.info('Get a newsletter user');
                    res.status(200).json(baseResponse('Newsletter ', result));
                } catch (e) {
                    logger.error('Error creating newsletters');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error creating newsletter user'));
                }
                break;
            }
            case 'POST': {
                try {
                    logger.info(`Saving user info for newsletter`);
                    const result = await prisma.newsLetter.create({
                        data: body,
                    });
                    logger.info('Created a newsletter user');
                    res.status(200).json(baseResponse('Newsletter User Added', result));
                } catch (e) {
                    logger.error('Error creating newsletters');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error creating newsletter user'));
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
