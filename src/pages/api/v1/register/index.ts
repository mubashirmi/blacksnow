import { baseResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import sgMail from '@sendgrid/mail';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'user';
    try {
        const { body } = req;
        const { email, firstName, lastName, roleId, sub } = body;
        switch (req.method) {
            case 'POST': {
                try {
                    logger.info('Creating User');
                    const dbUser = await prisma.user.create({
                        data: {
                            roleId: parseInt(roleId),
                            disabled: false,
                            email,
                            firstName,
                            lastName,
                            cognitoId: sub,
                        },
                    });

                    const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
                    const host = req.headers.host;
                    const baseUrl = `${protocol}://${host}`;

                    if (roleId === '3') {
                        const affiliateUuid = uuidv4();
                        logger.info(`Affiliate UUID: ${affiliateUuid}`);

                        await prisma.affiliate.create({
                            data: {
                                approved: false,
                                link: `${baseUrl}/affiliate/${affiliateUuid}`,
                                uuid: affiliateUuid,
                                userId: dbUser.id,
                            },
                        });
                        logger.info(`Affiliate created for user ID: ${dbUser.id}`);
                    }

                    if (roleId === '4') {
                        await prisma.advertiser.create({
                            data: {
                                approved: null,
                                userId: dbUser.id,
                                website: '',
                                twitter: '',
                                youtube: '',
                                facebook: '',
                                businessImage: '',
                            },
                        });
                        logger.info(`Advertiser created for user ID: ${dbUser.id}`);
                    }

                    const signUpUrl = `${baseUrl}/register/${dbUser.id}`;

                    sgMail.setApiKey(process.env.NEXT_PRIVATE_SENDGRID_API_KEY || '');

                    if (dbUser) {
                        const msg = {
                            to: email,
                            from: {
                                email: 'hello@liferootz.com',
                                name: 'GT',
                            },
                            dynamic_template_data: {
                                signUpUrl,
                            },
                            template_id: process.env.NEXT_PRIVATE_ADMIN_CREATE_USER_EMAIL_SENDGRID_TEMPLATE_ID,
                        };

                        // @ts-ignore
                        await sgMail.send(msg);
                    }
                    res.status(200).json(baseResponse('', dbUser));
                } catch (e) {
                    logger.error('Error getting user');
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
