import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'sales users';
    try {
        switch (req.method) {
            case 'GET': {
                try {
                    let sales: any[] = [];
                    sales = await prisma.user.findMany({
                        where: {
                            AND: [
                                {
                                    deleted: false,
                                },
                                {
                                    roleId: 2,
                                },
                                {
                                    NOT: {
                                        cognitoId: null,
                                    },
                                },
                            ],
                        },
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    });
                    res.status(200).json(baseResponse('Sales users', sales));
                } catch (e) {
                    logger.error(`Error getting sales users: ${e}`);
                    res.status(500).json(errorResponse('Error getting sales users'));
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
