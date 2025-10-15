import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'user';
    try {
        const { query, body } = req;
        const { id } = query;
        switch (req.method) {
            case 'DELETE': {
                try {
                    logger.info(`Deleting user`);
                    const result = await prisma.user.update({
                        where: {
                            id: parseInt(id),
                        },
                        data: { deleted: true },
                    });
                    logger.info('Deleted User');
                    res.status(200).json(baseResponse('User is Deleted', result));
                } catch (e) {
                    logger.error('Error Deleting user');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error Deleting user'));
                }
                break;
            }
            case 'PUT': {
                try {
                    logger.info('Updating User');
                    delete body.id;
                    delete body.email;
                    if (body.roleId) {
                        body.roleId = parseInt(body.roleId);
                    }
                    const dbUser = await prisma.user.update({
                        data: {
                            ...body,
                        },
                        where: {
                            id: parseInt(id),
                        },
                    });
                    res.status(200).json(baseResponse('', dbUser));
                } catch (e) {
                    logger.error('Error updating user');
                    logger.error(e);
                    res.status(500).json({ e });
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
