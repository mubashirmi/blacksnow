import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

function getStripeClient() {
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

    if (value === undefined || value === null) return undefined;

    return String(value);
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
    if (value === undefined || value === null) return fallback;

    const normalized = String(value).trim().toLowerCase();

    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;

    return fallback;
}

function unixToDate(value: unknown): Date | undefined {
    if (typeof value !== 'number') return undefined;
    return new Date(value * 1000);
}

function subscriptionIsPaidLike(status?: string | null): boolean {
    return status === 'active' || status === 'trialing';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const stripe = getStripeClient();

        const invoiceIdRaw = getStringValue(req.body?.invoiceId ?? req.query.invoiceId);
        const cancelAtPeriodEnd = parseBoolean(req.body?.cancelAtPeriodEnd ?? req.query.cancelAtPeriodEnd, true);

        if (!invoiceIdRaw) {
            return res.status(400).json({
                message: 'invoiceId is required',
            });
        }

        const invoiceId = Number(invoiceIdRaw);

        if (!Number.isFinite(invoiceId)) {
            return res.status(400).json({
                message: 'Invalid invoiceId',
            });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
        });

        if (!invoice) {
            return res.status(404).json({
                message: 'Invoice not found',
            });
        }

        if (!invoice.stripeSubscriptionId) {
            return res.status(400).json({
                message: 'Invoice does not have a Stripe subscription',
            });
        }

        let subscription: Stripe.Subscription;

        if (cancelAtPeriodEnd) {
            subscription = await stripe.subscriptions.update(invoice.stripeSubscriptionId, {
                cancel_at_period_end: true,
                metadata: {
                    invoiceId: String(invoice.id),
                    type: 'invoice_subscription_cancel_at_period_end',
                },
            });
        } else {
            subscription = await stripe.subscriptions.cancel(invoice.stripeSubscriptionId);
        }

        const subscriptionStatus = subscription.status;
        const paidLike = subscriptionIsPaidLike(subscriptionStatus);

        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                stripeSubscriptionStatus: subscriptionStatus,
                stripeCancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
                stripeCurrentPeriodEnd: unixToDate((subscription as any).current_period_end) || invoice.stripeCurrentPeriodEnd,
                subscriptionCanceledAt: subscriptionStatus === 'canceled' ? new Date() : invoice.subscriptionCanceledAt,

                /**
                 * If canceled immediately, mark unpaid.
                 * If cancel_at_period_end=true, keep paid while subscription remains active.
                 */
                paid: subscriptionStatus === 'canceled' ? false : paidLike,
            },
        });

        return res.status(200).json({
            message: cancelAtPeriodEnd ? 'Subscription will cancel at period end' : 'Subscription canceled immediately',
            invoiceId: invoice.id,
            invoice: updatedInvoice,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                cancel_at_period_end: subscription.cancel_at_period_end,
                current_period_end: (subscription as any).current_period_end,
            },
        });
    } catch (error: any) {
        console.error('Error in /api/invoices/cancel-subscription:', error);

        return res.status(500).json({
            message: 'Internal server error',
            error: error?.message,
        });
    }
}
