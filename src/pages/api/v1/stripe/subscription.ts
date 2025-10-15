import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const stripe = require('stripe')(process.env.NEXT_PRIVATE_STRIPE_SECRET);

const api = async (req, res) => {
    logger.defaultMeta.service = 'stripe-subscription';

    try {
        const { id, email, productType } = req.body;

        if (!id || !email || !productType) {
            logger.error('Missing required fields: id, email, or productType');
            return res.status(400).json(errorResponse('Missing required fields: id, email, or productType'));
        }

        const productConfig = {
            rsvp_monthly: {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_RSVP_MONTHLY,
                amount: 10.0, // $10.00
            },
            rsvp_yearly: {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_RSVP_YEARLY,
                amount: 80.0, // $80.00
            },
            digitalbillboard_monthly: {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_DIGITALBILLBOARD_MONTHLY,
                amount: 150.0, // $150.00
            },
            digitalbillboard_yearly: {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_DIGITALBILLBOARD_YEARLY,
                amount: 600.0, // $600.00
            },
        };

        if (!productConfig[productType]) {
            logger.error(`Invalid productType: ${productType}`);
            return res.status(400).json(errorResponse(`Invalid productType: ${productType}`));
        }

        const { priceId, amount } = productConfig[productType];

        if (!priceId) {
            logger.error(`Stripe price ID missing for productType: ${productType}`);
            return res.status(500).json(errorResponse(`Stripe price ID not configured for ${productType}`));
        }

        const authRecord = await prisma.auth.findUnique({
            where: { id: parseInt(id) },
        });

        if (!authRecord) {
            logger.error(`Auth record not found for AuthId: ${id}`);
            return res.status(400).json(errorResponse(`Auth record not found for AuthId: ${id}`));
        }

        if (req.method === 'POST') {
            const origin = req.headers.origin || 'http://localhost:3000';
            const successUrl = `${origin}/subscriptionConfirmation?session_id={CHECKOUT_SESSION_ID}&product=${productType}&email=${encodeURIComponent(email)}`;
            const cancelUrl = `${origin}/cancel`;

            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: email,
                metadata: {
                    authId: id.toString(),
                    productType,
                    paymentType: 'subscription',
                },
            });

            await prisma.subscription.create({
                data: {
                    transactionId: session.id,
                    amount,
                    AuthId: parseInt(id),
                    paid: false,
                    deleted: false,
                },
            });

            logger.info(`Subscription session created for AuthId: ${id}, ProductType: ${productType}`);
            return res.status(200).json(baseResponse('Subscription Created', session.url));
        }

        return res.status(405).json(errorResponse('Method Not Allowed'));
    } catch (e: any) {
        logger.error(`Error processing subscription request: ${e.message}`);
        return res.status(500).json(errorResponse('Internal Server Error', e.message));
    }
};

export default api;
