// /pages/api/subscription-invoices/stripe-status.ts

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

function parseBoolean(value: unknown, fallback: boolean): boolean {
    if (value === undefined || value === null) {
        return fallback;
    }

    const normalized = String(value).trim().toLowerCase();

    if (['true', '1', 'yes'].includes(normalized)) {
        return true;
    }

    if (['false', '0', 'no'].includes(normalized)) {
        return false;
    }

    return fallback;
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

function getCurrentPeriodEnd(subscription: Stripe.Subscription): number | undefined {
    const currentPeriodEnd = (
        subscription as Stripe.Subscription & {
            current_period_end?: number;
        }
    ).current_period_end;

    return typeof currentPeriodEnd === 'number' ? currentPeriodEnd : undefined;
}

async function syncCheckoutSession(params: { stripe: Stripe; subscriptionInv: SubscriptionInvWithRelations }): Promise<SubscriptionInvWithRelations> {
    const { stripe, subscriptionInv } = params;

    if (!subscriptionInv.stripeCheckoutSessionId) {
        return subscriptionInv;
    }

    const session = await stripe.checkout.sessions.retrieve(subscriptionInv.stripeCheckoutSessionId, {
        expand: ['payment_intent', 'payment_intent.latest_charge', 'subscription', 'invoice.payment_intent'],
    });

    const paymentIntentId = getId(session.payment_intent);

    const chargeId = getLatestChargeId(session.payment_intent);

    const customerId = getId(session.customer);

    if (session.mode === 'subscription') {
        const subscriptionId = getId(session.subscription);

        if (!subscriptionId) {
            return subscriptionInv;
        }

        return syncSubscription({
            stripe,
            subscriptionInv,
            subscriptionId,
        });
    }

    return prisma.subscriptionInv.update({
        where: {
            id: subscriptionInv.id,
        },
        data: {
            paymentType: 'one_time',

            paid: session.payment_status === 'paid' ? true : subscriptionInv.paid,

            stripePaymentIntentId: paymentIntentId || subscriptionInv.stripePaymentIntentId,

            stripeChargeId: chargeId || subscriptionInv.stripeChargeId,

            stripeCustomerId: customerId || subscriptionInv.stripeCustomerId,

            transactionId: subscriptionInv.transactionId || paymentIntentId || session.id,
        },
        include: subscriptionInvInclude,
    });
}

async function syncSubscription(params: {
    stripe: Stripe;
    subscriptionInv: SubscriptionInvWithRelations;
    subscriptionId: string;
}): Promise<SubscriptionInvWithRelations> {
    const { stripe, subscriptionInv, subscriptionId } = params;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent', 'latest_invoice.payment_intent.latest_charge'],
    });

    const latestInvoice = typeof subscription.latest_invoice === 'object' && subscription.latest_invoice !== null ? subscription.latest_invoice : null;

    const paymentIntent = latestInvoice && 'payment_intent' in latestInvoice ? latestInvoice.payment_intent : null;

    const paymentIntentId = getId(paymentIntent);

    const chargeId = getLatestChargeId(paymentIntent);

    const latestInvoiceId = getId(subscription.latest_invoice);

    const status = subscription.status;

    const paidLike = subscriptionIsPaidLike(status);

    const currentPeriodEnd = getCurrentPeriodEnd(subscription);

    return prisma.subscriptionInv.update({
        where: {
            id: subscriptionInv.id,
        },
        data: {
            paymentType: 'subscription',

            paid: paidLike,

            stripeSubscriptionId: subscription.id,

            stripeCustomerId: getId(subscription.customer) || subscriptionInv.stripeCustomerId,

            stripePaymentIntentId: paymentIntentId || subscriptionInv.stripePaymentIntentId,

            stripeChargeId: chargeId || subscriptionInv.stripeChargeId,

            stripeLatestInvoiceId: latestInvoiceId || subscriptionInv.stripeLatestInvoiceId,

            stripeSubscriptionStatus: status,

            stripeCurrentPeriodEnd: unixToDate(currentPeriodEnd) || subscriptionInv.stripeCurrentPeriodEnd,

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
        /*
         * subscriptionInvId is preferred.
         * invoiceId remains supported for backward compatibility.
         */
        const subscriptionInvIdParam = getStringValue(req.query.subscriptionInvId ?? req.query.invoiceId);

        const sessionId = getStringValue(req.query.session_id);

        const syncStripe = parseBoolean(req.query.syncStripe, false);

        if (!subscriptionInvIdParam && !sessionId) {
            return res.status(400).json({
                message: 'subscriptionInvId or session_id is required',
            });
        }

        /*
         * Stripe is only initialized when synchronization
         * or session lookup is requested.
         */
        const stripe = syncStripe || sessionId ? getStripeClient() : null;

        /*
         * Find and synchronize the record through a
         * Stripe Checkout Session.
         */
        if (sessionId) {
            const session = await stripe!.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent', 'payment_intent.latest_charge', 'subscription', 'invoice.payment_intent'],
            });

            /*
             * New metadata uses subscriptionInvId.
             * invoiceId is accepted for sessions created
             * by the previous API.
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

            if (!Number.isFinite(subscriptionInvId)) {
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

            const updatedSubscriptionInv = await syncCheckoutSession({
                stripe: stripe!,
                subscriptionInv,
            });

            return res.status(200).json({
                message: 'Stripe session status synced',

                subscriptionInvId: updatedSubscriptionInv.id,

                paid: updatedSubscriptionInv.paid,

                paymentType: updatedSubscriptionInv.paymentType,

                refunded: updatedSubscriptionInv.refunded,

                refundedAmount: updatedSubscriptionInv.refundedAmount,

                transactionId: updatedSubscriptionInv.transactionId,

                subscriptionInv: updatedSubscriptionInv,

                /*
                 * Backward-compatible response aliases.
                 * These can be removed after old clients
                 * switch to subscriptionInv fields.
                 */
                invoiceId: updatedSubscriptionInv.id,

                invoice: updatedSubscriptionInv,
            });
        }

        const subscriptionInvId = Number(subscriptionInvIdParam);

        if (!Number.isFinite(subscriptionInvId)) {
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

        let finalSubscriptionInv: SubscriptionInvWithRelations = subscriptionInv;

        if (syncStripe) {
            if (subscriptionInv.stripeSubscriptionId) {
                finalSubscriptionInv = await syncSubscription({
                    stripe: stripe!,
                    subscriptionInv,
                    subscriptionId: subscriptionInv.stripeSubscriptionId,
                });
            } else if (subscriptionInv.stripeCheckoutSessionId) {
                finalSubscriptionInv = await syncCheckoutSession({
                    stripe: stripe!,
                    subscriptionInv,
                });
            }
        }

        return res.status(200).json({
            message: syncStripe ? 'Subscription invoice payment status synced from Stripe' : 'Subscription invoice payment status retrieved',

            subscriptionInvId: finalSubscriptionInv.id,

            paid: finalSubscriptionInv.paid,

            paymentType: finalSubscriptionInv.paymentType,

            refunded: finalSubscriptionInv.refunded,

            refundedAmount: finalSubscriptionInv.refundedAmount,

            transactionId: finalSubscriptionInv.transactionId,

            subscriptionInv: finalSubscriptionInv,

            /*
             * Backward-compatible response aliases.
             */
            invoiceId: finalSubscriptionInv.id,

            invoice: finalSubscriptionInv,
        });
    } catch (error: unknown) {
        console.error('Error in /api/subscription-invoices/stripe-status:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return res.status(500).json({
            message: 'Internal server error',
            error: errorMessage,
        });
    }
}
