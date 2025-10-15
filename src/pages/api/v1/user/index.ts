import { baseResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import sgMail from '@sendgrid/mail';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'user';
    try {
        const { body, query } = req;
        const { email, firstName, lastName, roleId } = body;
        let { userEmail } = query;

        if (userEmail) {
            userEmail = decodeURIComponent(userEmail);
        }

        switch (req.method) {
            case 'GET': {
                try {
                    logger.info('Getting a single user');
                    const user = await prisma.user.findFirst({
                        where: {
                            email: userEmail,
                        },
                        select: {
                            roleId: true,
                        },
                    });
                    logger.info(user);

                    const returnVal = JSON.parse(JSON.stringify(user));

                    res.status(200).json(baseResponse('User Info', returnVal));
                } catch (e) {
                    logger.error(`Error getting user: ${e}`);
                    res.status(500).json({ e });
                }
                break;
            }
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
                        },
                    });

                    const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
                    const host = req.headers.host;
                    const baseUrl = `${protocol}://${host}`;

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
                    logger.error('Error creating user');
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
