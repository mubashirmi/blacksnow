import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'notes';
    try {
        const { body, query } = req;
        const { title, content, authorName, authId } = body;
        const { id } = query;

        switch (req.method) {
            case 'GET': {
                try {
                    logger.info('Fetching notes');
                    const { id } = req.query as { id?: string | string[] };

                    // no id → return all notes
                    if (id == null) {
                        const result = await prisma.notes.findMany();
                        return res.status(200).json(baseResponse('', result));
                    }

                    // coerce to number (handle string[])
                    const authIdStr = Array.isArray(id) ? id[0] : id;
                    const authId = Number(authIdStr);

                    if (!Number.isInteger(authId)) {
                        return res.status(400).json(errorResponse('id must be an integer'));
                    }

                    const result = await prisma.notes.findMany({
                        where: { authId }, // Int, not string
                    });

                    return res.status(200).json(baseResponse('', result));
                } catch (e) {
                    logger.error(`Error fetching notes: ${e}`);
                    return res.status(500).json(errorResponse(`Error fetching notes ${e}`));
                }
            }

            case 'POST': {
                try {
                    logger.info('Saving a note');
                    if (!authId) {
                        return res.status(400).json('AuthId is required');
                    }
                    const Auth = await prisma.auth.findFirst({
                        where: {
                            id: authId,
                        },
                    });
                    if (!Auth) {
                        return res.status(400).json('Admin not found.');
                    }
                    console.log('authid:::::::::::', authId);

                    const result = await prisma.notes.create({
                        data: {
                            title,
                            content,
                            authorName,
                            authId: Auth.id,
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
