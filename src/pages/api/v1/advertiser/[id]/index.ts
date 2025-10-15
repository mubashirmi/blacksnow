import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'advertiser';
    try {
        const { query, body } = req;
        const { id } = query;
        const { website, podcast, twitter, youtube, facebook, companyName, companyBlurb, businessImage, approved } = body;
        switch (req.method) {
            case 'POST': {
                try {
                    logger.info(`Toggling Advertiser`);
                    const advertiser = await prisma.advertiser.findUnique({
                        where: {
                            id: parseInt(id),
                        },
                    });
                    if (advertiser) {
                        const result = await prisma.advertiser.update({
                            where: {
                                id: parseInt(id),
                            },
                            data: { approved },
                            include: {
                                User: true,
                            },
                        });
                        res.status(200).json(baseResponse('User is Toggled', result));
                    } else {
                        logger.error('Error Toggling Advertiser');
                    }
                } catch (e) {
                    logger.error('Error Toggling Advertiser');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error Toggling Advertiser'));
                }
                break;
            }
            case 'PUT': {
                try {
                    logger.info('Updating Advertiser');
                    const advertiser = await prisma.advertiser.findUnique({
                        where: {
                            id: parseInt(id),
                        },
                    });
                    if (advertiser) {
                        const result = await prisma.advertiser.update({
                            where: {
                                id: parseInt(id),
                            },
                            data: {
                                website,
                                podcast,
                                twitter,
                                youtube,
                                facebook,
                                companyName,
                                companyBlurb,
                                businessImage,
                            },
                            include: {
                                User: true,
                            },
                        });
                        res.status(200).json(baseResponse('User has been updated with new link(s)', result));
                    } else {
                        logger.error('Error Updating Advertiser');
                    }
                } catch (e) {
                    logger.error('Error Updating Advertiser');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error Updating Advertiser'));
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
