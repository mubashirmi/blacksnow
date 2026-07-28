// /pages/api/subscription-invoices/stripe-success.ts

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const subscriptionInvInclude = {
    auth: {
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            adminStripeConnectId: true,
            adminStripeConnectIdStatus: true,
        },
    },
    Contract: true,
} as const;

type SubscriptionInvWithRelations = Prisma.SubscriptionInvGetPayload<{
    include: typeof subscriptionInvInclude;
}>;

function getStripeClient(): Stripe {
    const stripeSecret = process.env.NEXT_PRIVATE_STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
        throw new Error('Stripe secret key is missing');
    }

    return new Stripe(stripeSecret);
}

function getStringValue(value: unknown): string | undefined {
    if (Array.isArray(value)) {
        const first = value[0];

        return first === undefined || first === null ? undefined : String(first);
    }

    if (value === undefined || value === null) {
        return undefined;
    }

    return String(value);
}

function getId(value: unknown): string | undefined {
    if (!value) {
        return undefined;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string') {
        return value.id;
    }

    return undefined;
}

function unixToDate(value: unknown): Date | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return undefined;
    }

    return new Date(value * 1000);
}

function subscriptionIsPaidLike(status?: string | null): boolean {
    return status === 'active' || status === 'trialing';
}

function getLatestChargeId(paymentIntent: unknown): string | undefined {
    if (!paymentIntent || typeof paymentIntent === 'string') {
        return undefined;
    }

    if (typeof paymentIntent === 'object' && paymentIntent !== null && 'latest_charge' in paymentIntent) {
        return getId(paymentIntent.latest_charge);
    }

    return undefined;
}

async function syncSubscriptionFromStripe(params: {
    stripe: Stripe;
    subscriptionInv: SubscriptionInvWithRelations;
    subscriptionId: string;
}): Promise<SubscriptionInvWithRelations> {
    const { stripe, subscriptionInv, subscriptionId } = params;

    const subscription: any = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent', 'latest_invoice.payment_intent.latest_charge'],
    });

    const latestInvoice = typeof subscription.latest_invoice === 'object' ? subscription.latest_invoice : null;

    const paymentIntent = latestInvoice?.payment_intent;

    const paymentIntentId = getId(paymentIntent);

    const chargeId = getLatestChargeId(paymentIntent);

    const latestInvoiceId = getId(subscription.latest_invoice);

    const status = subscription.status;

    const paidLike = subscriptionIsPaidLike(status);

    return prisma.subscriptionInv.update({
        where: {
            id: subscriptionInv.id,
        },
        data: {
            paid: paidLike,
            paymentType: 'subscription',

            stripeSubscriptionId: subscription.id,

            stripeCustomerId: getId(subscription.customer) || subscriptionInv.stripeCustomerId,

            stripePaymentIntentId: paymentIntentId || subscriptionInv.stripePaymentIntentId,

            stripeChargeId: chargeId || subscriptionInv.stripeChargeId,

            stripeLatestInvoiceId: latestInvoiceId || subscriptionInv.stripeLatestInvoiceId,

            stripeSubscriptionStatus: status,

            stripeCurrentPeriodEnd: unixToDate(subscription.current_period_end) || subscriptionInv.stripeCurrentPeriodEnd,

            stripeCancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),

            subscriptionStartedAt: paidLike && !subscriptionInv.subscriptionStartedAt ? new Date() : subscriptionInv.subscriptionStartedAt,

            subscriptionCanceledAt: status === 'canceled' ? new Date() : subscriptionInv.subscriptionCanceledAt,

            transactionId: subscriptionInv.transactionId || paymentIntentId || subscription.id,
        },
        include: subscriptionInvInclude,
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);

        return res.status(405).json({
            message: 'Method not allowed',
        });
    }

    try {
        const stripe = getStripeClient();

        /*
         * subscriptionInvId is the preferred query parameter.
         * invoiceId is still accepted for backward compatibility.
         */
        const subscriptionInvIdParam = getStringValue(req.query.subscriptionInvId ?? req.query.invoiceId);

        const sessionId = getStringValue(req.query.session_id);

        if (!subscriptionInvIdParam && !sessionId) {
            return res.status(400).json({
                message: 'subscriptionInvId or session_id is required',
            });
        }

        /*
         * Synchronize the payment using the Stripe
         * Checkout Session.
         */
        if (sessionId) {
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent', 'payment_intent.latest_charge', 'subscription', 'invoice.payment_intent'],
            });

            /*
             * New Checkout Sessions use subscriptionInvId.
             * invoiceId remains supported for older sessions.
             */
            const subscriptionInvIdFromStripe = session.metadata?.subscriptionInvId || session.metadata?.invoiceId;

            if (!subscriptionInvIdFromStripe) {
                return res.status(400).json({
                    message: 'subscriptionInvId missing from Stripe session metadata',
                    stripePaymentStatus: session.payment_status,
                    stripeSessionId: session.id,
                });
            }

            const subscriptionInvId = Number(subscriptionInvIdFromStripe);

            if (!Number.isInteger(subscriptionInvId) || subscriptionInvId <= 0) {
                return res.status(400).json({
                    message: 'Invalid subscriptionInvId in Stripe session metadata',
                });
            }

            const subscriptionInv = await prisma.subscriptionInv.findUnique({
                where: {
                    id: subscriptionInvId,
                },
                include: subscriptionInvInclude,
            });

            if (!subscriptionInv) {
                return res.status(404).json({
                    message: 'Subscription invoice not found',
                });
            }

            const isSubscription = session.mode === 'subscription';

            const paymentIntentId = getId(session.payment_intent);

            const chargeId = getLatestChargeId(session.payment_intent);

            const subscriptionId = getId(session.subscription);

            const customerId = getId(session.customer);

            /*
             * Handle recurring subscription payment.
             */
            if (isSubscription && subscriptionId) {
                const syncedSubscriptionInv = await syncSubscriptionFromStripe({
                    stripe,
                    subscriptionInv,
                    subscriptionId,
                });

                return res.status(200).json({
                    message: 'Stripe subscription payment status synced',

                    subscriptionInvId: syncedSubscriptionInv.id,

                    paid: syncedSubscriptionInv.paid,

                    paymentType: syncedSubscriptionInv.paymentType,

                    subscriptionInv: syncedSubscriptionInv,

                    stripeSessionId: session.id,

                    stripePaymentStatus: session.payment_status,

                    stripeSubscriptionId: subscriptionId,

                    stripeSubscriptionStatus: syncedSubscriptionInv.stripeSubscriptionStatus,

                    /*
                     * Backward-compatible response aliases.
                     */
                    invoiceId: syncedSubscriptionInv.id,

                    invoice: syncedSubscriptionInv,
                });
            }

            /*
             * Handle one-time Stripe payment.
             */
            const shouldMarkPaid = session.payment_status === 'paid';

            const updatedSubscriptionInv = await prisma.subscriptionInv.update({
                where: {
                    id: subscriptionInvId,
                },
                data: {
                    paymentType: 'one_time',

                    stripeCheckoutSessionId: session.id,

                    stripePaymentIntentId: paymentIntentId || subscriptionInv.stripePaymentIntentId,

                    stripeChargeId: chargeId || subscriptionInv.stripeChargeId,

                    stripeCustomerId: customerId || subscriptionInv.stripeCustomerId,

                    paid: shouldMarkPaid ? true : subscriptionInv.paid,

                    transactionId: subscriptionInv.transactionId || paymentIntentId || session.id,
                },
                include: subscriptionInvInclude,
            });

            return res.status(200).json({
                message: 'Stripe one-time payment status retrieved',

                subscriptionInvId: updatedSubscriptionInv.id,

                paid: updatedSubscriptionInv.paid,

                paymentType: updatedSubscriptionInv.paymentType,

                subscriptionInv: updatedSubscriptionInv,

                stripeSessionId: session.id,

                stripePaymentStatus: session.payment_status,

                stripePaymentIntentId: paymentIntentId,

                stripeChargeId: chargeId,

                /*
                 * Backward-compatible response aliases.
                 */
                invoiceId: updatedSubscriptionInv.id,

                invoice: updatedSubscriptionInv,
            });
        }

        /*
         * Retrieve the stored payment status without
         * synchronizing a Checkout Session.
         */
        const subscriptionInvId = Number(subscriptionInvIdParam);

        if (!Number.isInteger(subscriptionInvId) || subscriptionInvId <= 0) {
            return res.status(400).json({
                message: 'Invalid subscriptionInvId',
            });
        }

        const subscriptionInv = await prisma.subscriptionInv.findUnique({
            where: {
                id: subscriptionInvId,
            },
            include: subscriptionInvInclude,
        });

        if (!subscriptionInv) {
            return res.status(404).json({
                message: 'Subscription invoice not found',
            });
        }

        return res.status(200).json({
            message: 'Subscription invoice payment status retrieved',

            subscriptionInvId: subscriptionInv.id,

            paid: subscriptionInv.paid,

            paymentType: subscriptionInv.paymentType,

            refunded: subscriptionInv.refunded,

            refundedAmount: subscriptionInv.refundedAmount,

            transactionId: subscriptionInv.transactionId,

            subscriptionInv,

            /*
             * Backward-compatible response aliases.
             */
            invoiceId: subscriptionInv.id,

            invoice: subscriptionInv,
        });
    } catch (error: unknown) {
        console.error('Error in /api/subscription-invoices/stripe-success:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return res.status(500).json({
            message: 'Internal server error',
            error: errorMessage,
        });
    }
}
