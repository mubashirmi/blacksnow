import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import sgMail from '@sendgrid/mail';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'form';
    try {
        const { body } = req;
        switch (req.method) {
            case 'POST': {
                try {
                    logger.info(`Saving form for user`);
                    const { firstName, lastName, email, phone, sales, date, affiliateId } = body;
                    const result = await prisma.rSVP.create({
                        data: {
                            firstName,
                            lastName,
                            email,
                            phone,
                        },
                    });
                    let signUp;
                    if (affiliateId === 0) {
                        signUp = await prisma.signUp.create({
                            data: {
                                rSVPId: result.id,
                                userId: parseInt(sales),
                                calendarId: parseInt(date),
                            },
                        });
                    } else {
                        signUp = await prisma.signUp.create({
                            data: {
                                rSVPId: result.id,
                                userId: parseInt(sales),
                                calendarId: parseInt(date),
                                affiliateId: parseInt(affiliateId),
                            },
                        });
                    }

                    sgMail.setApiKey(process.env.NEXT_PRIVATE_SENDGRID_API_KEY || '');

                    if (result) {
                        const msg = {
                            to: email,
                            from: {
                                email: 'hello@liferootz.com',
                                name: 'GT',
                            },
                            dynamic_template_data: {
                                userEmail: email,
                            },
                            template_id: process.env.NEXT_PRIVATE_USER_EMAIL_RSVP_SIGN_UP_SENDGRID_TEMPLATE_ID,
                        };

                        // @ts-ignore
                        await sgMail.send(msg);
                    }
                    if (signUp) {
                        const msg = {
                            to: 'gazleym@greaktech.com',
                            from: {
                                email: 'hello@liferootz.com',
                                name: 'GT',
                            },
                            dynamic_template_data: {
                                userEmail: email,
                            },
                            template_id: process.env.NEXT_PRIVATE_SALES_EMAIL_SENDGRID_TEMPLATE_ID,
                        };

                        // @ts-ignore
                        await sgMail.send(msg);
                    }
                    logger.info('Created the form');
                    res.status(200).json(baseResponse('form Created', { rsvp: result, signUp }));
                } catch (e) {
                    logger.error('Error creating form');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error creating form'));
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
