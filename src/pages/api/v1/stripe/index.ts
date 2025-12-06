import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import logger from '../../../../lib/logger';

const stripe = require('stripe')(process.env.NEXT_PRIVATE_STRIPE_SECRET);

type ProductType = 'NewsLetter' | 'RSVP' | 'DigitalBillboard' | 'Affiliate' | 'Sales' | 'EmailMarketing';

const NEWSLETTER_MONTHLY_PRICE = 10.0;
const NEWSLETTER_YEARLY_PRICE = 50.0;

const DIGITAL_BILLBOARD_MONTHLY_PRICE = 150.0;
const DIGITAL_BILLBOARD_YEARLY_PRICE = 600.0;

const RSVP_PRICE = 250.0;
const AFFILIATE_PRICE = 30.0;
const SALES_PRICE = 40.0;

const EMAIL_MARKETING_MONTHLY_PRICE = 500.0;
const EMAIL_MARKETING_YEARLY_PRICE = 4000.0;

function normalizePeriod(raw?: string): 'monthly' | 'yearly' {
    const value = (raw || 'monthly').toLowerCase();
    if (['yearly', 'annual', 'annually', 'year'].includes(value)) {
        return 'yearly';
    }
    return 'monthly';
}

function getProductPriceKey(productType: ProductType, periodInput?: string) {
    const period = normalizePeriod(periodInput);

    switch (productType) {
        case 'NewsLetter': {
            const isYearly = period === 'yearly';
            const priceId = isYearly
                ? process.env.NEXT_PRIVATE_STRIPE_PRICE_NEWSLETTER_YEARLY
                : process.env.NEXT_PRIVATE_STRIPE_PRICE_NEWSLETTER_MONTHLY || process.env.NEXT_PRIVATE_STRIPE_PRICE_NEWSLETTER;

            // Use explicit monthly / yearly values instead of 12x
            const price = isYearly ? NEWSLETTER_YEARLY_PRICE : NEWSLETTER_MONTHLY_PRICE;

            return { priceId, price };
        }
        case 'RSVP':
            return { priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_RSVP, price: RSVP_PRICE };
        case 'DigitalBillboard': {
            const isYearly = period === 'yearly';
            const priceId = isYearly
                ? process.env.NEXT_PRIVATE_STRIPE_PRICE_DIGITALBILLBOARD_YEARLY
                : process.env.NEXT_PRIVATE_STRIPE_PRICE_DIGITALBILLBOARD_MONTHLY || process.env.NEXT_PRIVATE_STRIPE_PRICE_DIGITALBILLBOARD;

            const price = isYearly ? DIGITAL_BILLBOARD_YEARLY_PRICE : DIGITAL_BILLBOARD_MONTHLY_PRICE;

            return { priceId, price };
        }
        case 'Affiliate':
            return { priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_AFFILIATE, price: AFFILIATE_PRICE };
        case 'Sales':
            return { priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_SALES, price: SALES_PRICE };
        case 'EmailMarketing': {
            const isYearly = period === 'yearly';
            const priceId = isYearly
                ? process.env.NEXT_PRIVATE_STRIPE_PRICE_EMAILMARKETING_YEARLY
                : process.env.NEXT_PRIVATE_STRIPE_PRICE_EMAILMARKETING_MONTHLY;

            const price = isYearly ? EMAIL_MARKETING_YEARLY_PRICE : EMAIL_MARKETING_MONTHLY_PRICE;

            return { priceId, price };
        }
        default:
            return undefined;
    }
}

const api = async (req, res) => {
    logger.defaultMeta.service = 'stripe-checkout';

    try {
        const { id, email, productType, referredBy, period } = req.body as {
            id: string | number;
            email: string;
            productType: ProductType;
            referredBy?: number | string | null; // Auth.id of the referrer (Affiliate)
            period?: string; // 'monthly' | 'yearly'
        };

        if (!id || !email) {
            logger.error('Missing required fields: id or email');
            return res.status(400).json(errorResponse('Missing required fields: id or email'));
        }

        const normalizedPeriod = normalizePeriod(period);
        const productPriceInfo = getProductPriceKey(productType, normalizedPeriod);
        if (!productPriceInfo) {
            throw new Error('Unknown product type');
        }

        const { priceId, price } = productPriceInfo;
        if (!priceId) {
            logger.error(`Stripe price ID not configured for productType=${productType}, period=${normalizedPeriod}`);
            return res.status(500).json(errorResponse('Stripe price ID not configured for this product/period'));
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

            // Keep existing "product=newsletter" behavior, just add period
            const successUrl = `${origin}/subscriptionConfirmation?session_id={CHECKOUT_SESSION_ID}&product=newsletter&period=${encodeURIComponent(
                normalizedPeriod
            )}&email=${encodeURIComponent(email)}`;
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
                    period: normalizedPeriod,
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

            let filterProduct: ProductType | null;
            if (productType === 'Affiliate' || productType === 'Sales') {
                filterProduct = null;
            } else {
                filterProduct = productType;
            }

            await prisma.checkout.create({
                data: {
                    transactionId: session.id,
                    amount: price, // this now reflects monthly or yearly based on `period`
                    AuthId: Number(id),
                    paid: false,
                    deleted: false,
                    product: filterProduct,
                    cancelSubscripton: false,
                    period:period
                },
            });

            logger.info(`Checkout session created for Newsletter - AuthId: ${id}, productType=${productType}, period=${normalizedPeriod}`);
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
