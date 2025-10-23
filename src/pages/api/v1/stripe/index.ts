import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import logger from '../../../../lib/logger';

const stripe = require('stripe')(process.env.NEXT_PRIVATE_STRIPE_SECRET);
type ProductType = 'NewsLetter' | 'RSVP' | 'DigitalBillboard' | 'Affiliate' | 'Sales';

function getProductPriceKey(productType: ProductType) {
    switch (productType) {
        case 'NewsLetter':
            return { priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_NEWSLETTER, price: 100.0 };
        case 'RSVP':
            return { priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_RSVP, price: 10.0 };
        case 'DigitalBillboard':
            return { priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_DIGITALBILLBOARD, price: 100.0 };
        case 'Affiliate':
            return { priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_AFFILIATE, price: 30.0 };
        case 'Sales':
            return { priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_SALES, price: 40.0 };
        default:
            return undefined;
    }
}

const api = async (req, res) => {
    logger.defaultMeta.service = 'stripe-checkout';

    try {
        const { id, email, productType, referredBy } = req.body as {
            id: string | number;
            email: string;
            productType: ProductType;
            referredBy?: number | string | null; // Auth.id of the referrer (Affiliate)
        };

        if (!id || !email) {
            logger.error('Missing required fields: id or email');
            return res.status(400).json(errorResponse('Missing required fields: id or email'));
        }

        const productPriceInfo = getProductPriceKey(productType);
        if (!productPriceInfo) {
            throw new Error('Unknown product type');
        }

        const { priceId, price } = productPriceInfo;
        if (!priceId) {
            logger.error('Stripe price ID not found for newsletter');
            return res.status(500).json(errorResponse('Stripe price ID not configured for newsletter'));
        }

        const authRecord = await prisma.auth.findUnique({
            where: { id: Number(id) },
        });
        if (!authRecord) {
            logger.error(`Auth record not found for AuthId: ${id}`);
            return res.status(400).json(errorResponse(`Auth record not found for AuthId: ${id}`));
        }
        const role = authRecord.roles[0];

        // Find the REFERRER (Affiliate) by their Auth.id and get their Connect account
        const affiliate = referredBy
            ? await prisma.auth.findFirst({
                  where: { id: Number(referredBy) },
                  select: { adminStripeConnectId: true },
              })
            : null;

        const affiliateConnectId = affiliate?.adminStripeConnectId || null;

        if (req.method === 'POST') {
            const origin = req.headers.origin || 'http://localhost:3000';
            const successUrl = `${origin}/subscriptionConfirmation?session_id={CHECKOUT_SESSION_ID}&product=newsletter&email=${encodeURIComponent(email)}`;
            const cancelUrl = `${origin}/cancel`;

            const sessionParams: Stripe.Checkout.SessionCreateParams = {
                mode: 'subscription',
                line_items: [{ price: priceId, quantity: 1 }], // MUST be a Price ID
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: email,
                allow_promotion_codes: false,
                metadata: {
                    authId: String(id),
                    productType, // keep it consistent with your enum
                    paymentType: 'recurring',
                    referredBy: referredBy ? String(referredBy) : '',
                },
            };
            // Route 40% to the referrer, keep 60% as platform fee
            if (affiliateConnectId && role !== 'Sales') {
                sessionParams.subscription_data = {
                    transfer_data: { destination: affiliateConnectId },
                    application_fee_percent: 60, // platform keeps 60%, destination gets 40%
                };
            }

            const session = await stripe.checkout.sessions.create(sessionParams);

            let filterProduct;
            if (productType === 'Affiliate' || productType === 'Sales') {
                filterProduct = null;
            } else {
                filterProduct = productType;
            }

            await prisma.checkout.create({
                data: {
                    transactionId: session.id,
                    amount: price, // store your display price; consider storing currency + unit_amount too
                    AuthId: Number(id),
                    paid: false,
                    deleted: false,
                    product: filterProduct,
                    cancelSubscripton: false,
                },
            });
            logger.info(`Checkout session created for Newsletter - AuthId: ${id}`);
            return res.status(200).json(baseResponse('Checkout Created', session.url));
        }

        return res.status(405).json(errorResponse('Method Not Allowed'));
    } catch (e: any) {
        logger.error(`Error processing checkout request: ${e.message}`);
        console.log(e);
        return res.status(500).json(errorResponse('Internal Server Error', e.message));
    }
};

export default api;
