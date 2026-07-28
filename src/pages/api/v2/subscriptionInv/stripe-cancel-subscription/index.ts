// /pages/api/subscription-invoices/cancel-subscription.ts

import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

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

function unixToDate(value: unknown): Date | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return undefined;
    }

    return new Date(value * 1000);
}

function subscriptionIsPaidLike(status?: string | null): boolean {
    return status === 'active' || status === 'trialing';
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription): number | undefined {
    const currentPeriodEnd = (
        subscription as Stripe.Subscription & {
            current_period_end?: number;
        }
    ).current_period_end;

    return typeof currentPeriodEnd === 'number' ? currentPeriodEnd : undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);

        return res.status(405).json({
            message: 'Method not allowed',
        });
    }

    try {
        const stripe = getStripeClient();

        /*
         * subscriptionInvId is the preferred parameter.
         * invoiceId remains supported for backward compatibility.
         */
        const subscriptionInvIdRaw = getStringValue(req.body?.subscriptionInvId ?? req.query.subscriptionInvId ?? req.body?.invoiceId ?? req.query.invoiceId);

        const cancelAtPeriodEnd = parseBoolean(req.body?.cancelAtPeriodEnd ?? req.query.cancelAtPeriodEnd, true);

        if (!subscriptionInvIdRaw) {
            return res.status(400).json({
                message: 'subscriptionInvId is required',
            });
        }

        const subscriptionInvId = Number(subscriptionInvIdRaw);

        if (!Number.isInteger(subscriptionInvId) || subscriptionInvId <= 0) {
            return res.status(400).json({
                message: 'Invalid subscriptionInvId',
            });
        }

        const subscriptionInv = await prisma.subscriptionInv.findUnique({
            where: {
                id: subscriptionInvId,
            },
        });

        if (!subscriptionInv) {
            return res.status(404).json({
                message: 'Subscription invoice not found',
            });
        }

        if (!subscriptionInv.stripeSubscriptionId) {
            return res.status(400).json({
                message: 'Subscription invoice does not have a Stripe subscription',
            });
        }

        let subscription: Stripe.Subscription;

        if (cancelAtPeriodEnd) {
            subscription = await stripe.subscriptions.update(subscriptionInv.stripeSubscriptionId, {
                cancel_at_period_end: true,
                metadata: {
                    subscriptionInvId: String(subscriptionInv.id),
                    type: 'subscription_inv_cancel_at_period_end',
                },
            });
        } else {
            subscription = await stripe.subscriptions.cancel(subscriptionInv.stripeSubscriptionId);
        }

        const subscriptionStatus = subscription.status;
        const paidLike = subscriptionIsPaidLike(subscriptionStatus);

        const currentPeriodEnd = getCurrentPeriodEnd(subscription);

        const updatedSubscriptionInv = await prisma.subscriptionInv.update({
            where: {
                id: subscriptionInv.id,
            },
            data: {
                stripeSubscriptionStatus: subscriptionStatus,

                stripeCancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),

                stripeCurrentPeriodEnd: unixToDate(currentPeriodEnd) ?? subscriptionInv.stripeCurrentPeriodEnd,

                subscriptionCanceledAt: subscriptionStatus === 'canceled' ? new Date() : subscriptionInv.subscriptionCanceledAt,

                /*
                 * Immediate cancellation makes the subscription unpaid.
                 * Period-end cancellation keeps it paid while Stripe
                 * continues reporting it as active or trialing.
                 */
                paid: subscriptionStatus === 'canceled' ? false : paidLike,
            },
        });

        return res.status(200).json({
            message: cancelAtPeriodEnd ? 'Subscription will cancel at period end' : 'Subscription canceled immediately',

            subscriptionInvId: subscriptionInv.id,

            subscriptionInv: updatedSubscriptionInv,

            subscription: {
                id: subscription.id,
                status: subscription.status,
                cancel_at_period_end: subscription.cancel_at_period_end,
                current_period_end: currentPeriodEnd ?? null,
            },
        });
    } catch (error: unknown) {
        console.error('Error in /api/subscription-invoices/cancel-subscription:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return res.status(500).json({
            message: 'Internal server error',
            error: errorMessage,
        });
    }
}
