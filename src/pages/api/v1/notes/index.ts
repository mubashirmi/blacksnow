import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'notes';
    try {
        const { body, query } = req;
        const { title, content, authorName } = body;
        const { id } = query;

        switch (req.method) {
            case 'GET': {
                try {
                    logger.info('Saving a note');

                    const result = await prisma.notes.findMany();
                    res.status(200).json(baseResponse('', result));
                } catch (e) {
                    logger.error(`Error adding note: ${e}`);
                    res.status(500).json(errorResponse(`Error adding note ${e}`));
                }
                break;
            }
            case 'POST': {
                try {
                    logger.info('Saving a note');

                    const result = await prisma.notes.create({
                        data: {
                            title,
                            content,
                            authorName,
                        },
                    });
                    res.status(200).json(baseResponse('', result));
                } catch (e) {
                    logger.error(`Error adding note: ${e}`);
                    res.status(500).json(errorResponse(`Error adding note ${e}`));
                }
                break;
            }
            case 'PUT': {
                try {
                    logger.info('Updating Note');
                    const dbNote = await prisma.notes.update({
                        data: {
                            ...body,
                        },
                        where: {
                            id: parseInt(body.id),
                        },
                    });
                    res.status(200).json(baseResponse('', dbNote));
                } catch (e) {
                    logger.error(`Error updating note: ${e}`);
                    res.status(500).json(errorResponse(`Error updating note ${e}`));
                }
                break;
            }
            case 'DELETE':
                try {
                    logger.info('Deleting note');
                    logger.info(id);

                    const result = await prisma.notes.delete({
                        where: {
                            id: Number(id),
                        },
                    });
                    res.status(200).json(baseResponse('note deleted', result));
                } catch (e) {
                    logger.error(`Error deleting note: ${e}`);
                    res.status(500).json(errorResponse(`Error deleting note ${e}`));
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
