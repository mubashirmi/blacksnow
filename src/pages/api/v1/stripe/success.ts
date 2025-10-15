import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import logger from '../../../../lib/logger';

const stripe = require('stripe')(process.env.NEXT_PRIVATE_STRIPE_SECRET);

const api = async (req: NextApiRequest, res: NextApiResponse) => {
    logger.defaultMeta.service = 'stripe-payment-confirmation';

    try {
        if (req.method !== 'POST') {
            logger.error(`Method not allowed: ${req.method}`);
            return res.status(405).json(errorResponse('Method Not Allowed'));
        }

        const { sessionId } = req.query;

        logger.info(`Received sessionId: ${sessionId}`);

        if (!sessionId) {
            logger.error('Missing required field: sessionId');
            return res.status(400).json(errorResponse('Session ID is required'));
        }

        // Ensure sessionId is a string
        const processedSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;
        logger.info(`Processed sessionId: ${processedSessionId}`);

        const session = await stripe.checkout.sessions.retrieve(processedSessionId);
        logger.info(`Stripe session details: ${JSON.stringify(session, null, 2)}`);

        if (session.payment_status === 'paid') {
            const paymentType = session.metadata?.paymentType || (session.mode === 'subscription' ? 'subscription' : 'one-time');
            logger.info(`Payment type determined: ${paymentType}`);

            let updateResult;
            if (paymentType === 'subscription') {
                // Check if record exists before updating
                const subscriptionRecord = await prisma.subscription.findFirst({
                    where: {
                        transactionId: processedSessionId,
                        deleted: false,
                    },
                });
                logger.info(`Subscription record before update: ${JSON.stringify(subscriptionRecord, null, 2)}`);

                updateResult = await prisma.subscription.updateMany({
                    where: {
                        transactionId: processedSessionId,
                        deleted: false,
                    },
                    data: {
                        paid: true,
                        updatedAt: new Date(),
                    },
                });
                logger.info(`Subscription update result: ${JSON.stringify(updateResult, null, 2)}`);
            } else {
                // Check if record exists before updating
                const checkoutRecord = await prisma.checkout.findFirst({
                    where: {
                        transactionId: processedSessionId,
                        deleted: false,
                    },
                });
                logger.info(`Checkout record before update: ${JSON.stringify(checkoutRecord, null, 2)}`);

                updateResult = await prisma.checkout.updateMany({
                    where: {
                        transactionId: processedSessionId,
                        deleted: false,
                    },
                    data: {
                        paid: true,
                        updatedAt: new Date(),
                    },
                });

                await prisma.auth.findFirst({
                    where: { id: checkoutRecord?.id },
                });
                // if(findAuth)
                //     await prisma.referralProducts.updateMany({
                //         where: {
                //             authId: Number(findAuth.referredById),
                //             productLink: String(productLink),
                //         },
                //         data: {
                //             conversions: { increment: 1 },
                //         },
                //     });
                // }
                logger.info(`Checkout update result: ${JSON.stringify(updateResult, null, 2)}`);
            }

            if (updateResult.count > 0) {
                logger.info(`Payment confirmed for sessionId: ${processedSessionId}, type: ${paymentType}`);
                return res.status(200).json(
                    baseResponse('Payment confirmed and database updated', {
                        success: true,
                        type: paymentType,
                        updated: updateResult.count,
                    })
                );
            } else {
                logger.error(`Transaction not found in database for sessionId: ${processedSessionId}`);
                return res.status(404).json(errorResponse('Transaction not found in database'));
            }
        } else {
            logger.warn(`Payment not completed for sessionId: ${processedSessionId}, status: ${session.payment_status}`);
            return res.status(400).json(
                baseResponse('Payment not completed', {
                    success: false,
                    payment_status: session.payment_status,
                })
            );
        }
    } catch (e: any) {
        logger.error(`Error confirming payment for sessionId: ${req.query.sessionId}, error: ${e.message}, stack: ${e.stack}`);
        return res.status(500).json(errorResponse('Internal Server Error', e.message));
    }
};
export default api;
