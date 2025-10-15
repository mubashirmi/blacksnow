import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'legal';
    try {
        const { body } = req;
        const { content, id } = body;
        let legalDocs;
        switch (req.method) {
            case 'PUT': {
                try {
                    logger.info(`Editing Legal doc`);
                    const doc = await prisma.legal.findUnique({
                        where: {
                            id: parseInt(id),
                        },
                    });
                    if (doc) {
                        const result = await prisma.legal.update({
                            where: {
                                id: parseInt(id),
                            },
                            data: {
                                content,
                            },
                        });
                        if (result) {
                            legalDocs = await prisma.legal.findMany({
                                where: {
                                    deleted: false,
                                },
                            });
                        }
                        res.status(200).json(baseResponse('Legal Doc has been updated', legalDocs));
                    } else {
                        logger.error(`Error Updating Legal Doc: ${id}`);
                    }
                } catch (e) {
                    logger.error(`Error creating Legal Doc: ${e}`);
                    res.status(500).json(errorResponse('Error creating Legal Doc'));
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
