import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

import { baseResponse, errorResponse } from '@/lib/baseResponse';
import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

type ProductType =
    | 'NewsLetter'
    | 'RSVP'
    | 'DigitalBillboard'
    | 'Affiliate'
    | 'Sales'
    | 'EmailMarketing'
    | 'InvoiceTool'
    | 'SuperAffiliate'
    | 'LightningSilver'
    | 'LightningGold';

const NEWSLETTER_MONTHLY_PRICE = 10.0;
const NEWSLETTER_YEARLY_PRICE = 50.0;

const DIGITAL_BILLBOARD_MONTHLY_PRICE = 150.0;
const DIGITAL_BILLBOARD_YEARLY_PRICE = 600.0;

const RSVP_PRICE = 250.0;
const AFFILIATE_PRICE = 30.0;
const SUPER_AFFILIATE_PRICE = 250.0;
const SALES_PRICE = 40.0;

const EMAIL_MARKETING_MONTHLY_PRICE = 500.0;
const EMAIL_MARKETING_YEARLY_PRICE = 4000.0;

const LIGHTNING_SILVER_MONTHLY_PRICE = 5.0;
const LIGHTNING_GOLD_MONTHLY_PRICE = 250.0;

const INVOICETOOL_MONTHLY_PRICE = 20.0;
const INVOICETOOL_YEARLY_PRICE = 200.0;

function normalizePeriod(raw?: string): 'monthly' | 'yearly' {
    const value = (raw || 'monthly').toLowerCase().trim();

    if (['yearly', 'annual', 'annually', 'year'].includes(value)) {
        return 'yearly';
    }

    return 'monthly';
}

function isValidDate(d: unknown): d is Date {
    return d instanceof Date && !Number.isNaN(d.getTime());
}

function addMonthsEOMSafe(date: Date, months: number): Date {
    const d = new Date(date);
    const day = d.getDate();

    d.setDate(1);
    d.setMonth(d.getMonth() + months);

    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    d.setDate(Math.min(day, lastDay));

    return d;
}

function addYearsEOMSafe(date: Date, years: number): Date {
    const d = new Date(date);
    const day = d.getDate();

    d.setDate(1);
    d.setFullYear(d.getFullYear() + years);

    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    d.setDate(Math.min(day, lastDay));

    return d;
}

function getNextBillingDate(startDate: Date, period: 'monthly' | 'yearly'): Date {
    if (period === 'yearly') {
        return addYearsEOMSafe(startDate, 1);
    }

    return addMonthsEOMSafe(startDate, 1);
}

function getProductPriceKey(productType: ProductType, periodInput?: string) {
    const period = normalizePeriod(periodInput);

    switch (productType) {
        case 'NewsLetter': {
            const isYearly = period === 'yearly';

            const priceId = isYearly
                ? process.env.NEXT_PRIVATE_STRIPE_PRICE_NEWSLETTER_YEARLY
                : process.env.NEXT_PRIVATE_STRIPE_PRICE_NEWSLETTER_MONTHLY || process.env.NEXT_PRIVATE_STRIPE_PRICE_NEWSLETTER;

            return {
                priceId,
                price: isYearly ? NEWSLETTER_YEARLY_PRICE : NEWSLETTER_MONTHLY_PRICE,
            };
        }

        case 'RSVP':
            return {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_RSVP,
                price: RSVP_PRICE,
            };

        case 'DigitalBillboard': {
            const isYearly = period === 'yearly';

            const priceId = isYearly
                ? process.env.NEXT_PRIVATE_STRIPE_PRICE_DIGITALBILLBOARD_YEARLY
                : process.env.NEXT_PRIVATE_STRIPE_PRICE_DIGITALBILLBOARD_MONTHLY || process.env.NEXT_PRIVATE_STRIPE_PRICE_DIGITALBILLBOARD;

            return {
                priceId,
                price: isYearly ? DIGITAL_BILLBOARD_YEARLY_PRICE : DIGITAL_BILLBOARD_MONTHLY_PRICE,
            };
        }

        case 'SuperAffiliate':
            return {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_SUPER_AFFILIATE,
                price: SUPER_AFFILIATE_PRICE,
            };

        case 'Affiliate':
            return {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_AFFILIATE,
                price: AFFILIATE_PRICE,
            };

        case 'Sales':
            return {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_SALES,
                price: SALES_PRICE,
            };

        case 'LightningSilver':
            return {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_LIGHTNING_SILVER_MONTHLY,
                price: LIGHTNING_SILVER_MONTHLY_PRICE,
            };

        case 'LightningGold':
            return {
                priceId: process.env.NEXT_PRIVATE_STRIPE_PRICE_LIGHTNING_GOLD_MONTHLY,
                price: LIGHTNING_GOLD_MONTHLY_PRICE,
            };

        case 'EmailMarketing': {
            const isYearly = period === 'yearly';

            const priceId = isYearly
                ? process.env.NEXT_PRIVATE_STRIPE_PRICE_EMAILMARKETING_YEARLY
                : process.env.NEXT_PRIVATE_STRIPE_PRICE_EMAILMARKETING_MONTHLY;

            return {
                priceId,
                price: isYearly ? EMAIL_MARKETING_YEARLY_PRICE : EMAIL_MARKETING_MONTHLY_PRICE,
            };
        }

        case 'InvoiceTool': {
            const isYearly = period === 'yearly';

            const priceId = isYearly ? process.env.NEXT_PRIVATE_STRIPE_PRICE_INVOICETOOLS_YEARLY : process.env.NEXT_PRIVATE_STRIPE_PRICE_INVOICETOOLS_MONTHLY;

            return {
                priceId,
                price: isYearly ? INVOICETOOL_YEARLY_PRICE : INVOICETOOL_MONTHLY_PRICE,
            };
        }

        default:
            return undefined;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    logger.defaultMeta.service = 'stripe-checkout';

    if (req.method !== 'POST') {
        return res.status(405).json(errorResponse('Method Not Allowed'));
    }

    try {
        const { id, email, productType, referredBy, period } = req.body as {
            id: string | number;
            email: string;
            productType: ProductType;
            referredBy?: number | string | null;
            period?: string;
        };

        if (!id || !email) {
            return res.status(400).json(errorResponse('Missing required fields: id or email'));
        }

        if (!productType) {
            return res.status(400).json(errorResponse('Missing productType'));
        }

        const authId = Number(id);

        if (!Number.isInteger(authId) || authId <= 0) {
            return res.status(400).json(errorResponse('Invalid Auth ID'));
        }

        const normalizedPeriod = normalizePeriod(period);

        const productPriceInfo = getProductPriceKey(productType, normalizedPeriod);

        if (!productPriceInfo) {
            return res.status(400).json(errorResponse('Unknown product type'));
        }

        const { priceId, price } = productPriceInfo;

        if (!priceId) {
            return res.status(500).json(errorResponse(`Stripe price ID not configured for ${productType} (${normalizedPeriod})`));
        }

        const authRecord = await prisma.auth.findUnique({
            where: {
                id: authId,
            },
            select: {
                id: true,
                email: true,
                roles: true,
                stripeCustomerId: true,
            },
        });

        if (!authRecord) {
            return res.status(400).json(errorResponse(`Auth record not found for AuthId: ${id}`));
        }

        /*
         * Make sure every paying user has a
         * persistent Stripe Customer.
         */
        let customerId = authRecord.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email,
                metadata: {
                    authId: String(authId),
                },
            });

            customerId = customer.id;

            await prisma.auth.update({
                where: {
                    id: authId,
                },
                data: {
                    stripeCustomerId: customerId,
                },
            });
        } else {
            /*
             * Keep Stripe metadata/email synchronized.
             */
            await stripe.customers.update(customerId, {
                email,
                metadata: {
                    authId: String(authId),
                },
            });
        }

        /*
         * Affiliate Stripe Connect account.
         */
        const affiliate = referredBy
            ? await prisma.auth.findFirst({
                  where: {
                      id: Number(referredBy),
                  },
                  select: {
                      adminStripeConnectId: true,
                  },
              })
            : null;

        const affiliateConnectId = affiliate?.adminStripeConnectId || null;

        /*
         * Fix:
         * Your original fallback contained Markdown.
         */
        const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const successUrl =
            `${origin}/subscriptionConfirmation` +
            `?session_id={CHECKOUT_SESSION_ID}` +
            `&product=${encodeURIComponent(productType)}` +
            `&period=${encodeURIComponent(normalizedPeriod)}` +
            `&email=${encodeURIComponent(email)}`;

        const cancelUrl = `${origin}/cancel`;

        const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
            metadata: {
                authId: String(authId),

                productType,

                paymentType: 'recurring',

                referredBy: referredBy ? String(referredBy) : '',

                period: normalizedPeriod,
            },
        };

        /*
         * Route 40% to referrer.
         *
         * Your old code checked only roles[0].
         * includes() is safer because Sales might not
         * be the first role.
         */
        if (affiliateConnectId && !authRecord.roles.includes('Sales')) {
            subscriptionData.transfer_data = {
                destination: affiliateConnectId,
            };

            subscriptionData.application_fee_percent = 60;
        }

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: 'subscription',

            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],

            success_url: successUrl,

            cancel_url: cancelUrl,

            customer: customerId,

            allow_promotion_codes: false,

            /*
             * Always collect a payment method.
             */
            payment_method_collection: 'always',

            payment_method_types: ['card'],

            /*
             * IMPORTANT:
             *
             * No payment_intent_data here.
             * This is subscription mode.
             */
            metadata: {
                authId: String(authId),

                productType,

                paymentType: 'recurring',

                referredBy: referredBy ? String(referredBy) : '',

                period: normalizedPeriod,
            },

            subscription_data: subscriptionData,
        };

        const session = await stripe.checkout.sessions.create(sessionParams);

        const filterProduct: ProductType | null = productType === 'Affiliate' || productType === 'Sales' ? null : productType;

        const startDate = new Date();

        const nextBillingDate = getNextBillingDate(startDate, normalizedPeriod);

        if (!isValidDate(startDate) || !isValidDate(nextBillingDate)) {
            throw new Error('Invalid startDate/nextBillingDate computed');
        }

        await prisma.checkout.create({
            data: {
                transactionId: session.id,

                amount: price,

                AuthId: authId,

                paid: false,

                deleted: false,

                product: filterProduct,

                cancelSubscripton: false,

                period: normalizedPeriod,

                startDate,

                nextBillingDate,
            },
        });

        return res.status(200).json(baseResponse('Checkout Created', session.url));
    } catch (error: any) {
        logger.error(`Error processing checkout request: ${error?.message}`);

        return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
}
