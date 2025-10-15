import { baseResponse } from '@/lib/baseResponse';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'Affiliate';
    try {
        // const { body } = req;
        // const { email, firstName, lastName, phone } = body;
        switch (req.method) {
            case 'POST': {
                try {
                    logger.info('Creating Affiliate');
                    // const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
                    // const host = req.headers.host;
                    // const baseUrl = `${protocol}://${host}`;
                    // const uuid = crypto.randomUUID();
                    // const link = `${baseUrl}/rsvp?al=${uuid}`;
                    // const dbUser = await prisma.affiliate.create({
                    //     data: {
                    //         approved: true,
                    //         link,
                    //         uuid,
                    //     },
                    // });
                    res.status(200).json(baseResponse('', {}));
                } catch (e) {
                    logger.error('Error Creating Affiliate');
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
