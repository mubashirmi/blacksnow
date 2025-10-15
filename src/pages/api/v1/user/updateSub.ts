import { baseResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import logger from '../../../../lib/logger';

const api = async (req: NextApiRequest, res: NextApiResponse) => {
    logger.defaultMeta.service = 'update_sub';
    try {
        const { body } = req;
        const { email, sub } = body;
        switch (req.method) {
            case 'PUT': {
                const dbUser = await prisma.user.update({
                    where: {
                        email,
                    },
                    data: {
                        cognitoId: sub,
                    },
                });
                res.status(200).json(baseResponse('', dbUser));
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
