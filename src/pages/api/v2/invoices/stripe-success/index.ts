import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const invoiceInclude = {
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

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
    include: typeof invoiceInclude;
}>;

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

function getId(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value.id;
}

function unixToDate(value: unknown): Date | undefined {
    if (typeof value !== 'number') return undefined;
    return new Date(value * 1000);
}

function subscriptionIsPaidLike(status?: string | null): boolean {
    return status === 'active' || status === 'trialing';
}

function getLatestChargeId(paymentIntent: any): string | undefined {
    if (!paymentIntent || typeof paymentIntent === 'string') return undefined;
    return getId(paymentIntent.latest_charge);
}

async function syncSubscriptionFromStripe(params: { stripe: Stripe; invoice: InvoiceWithRelations; subscriptionId: string }): Promise<InvoiceWithRelations> {
    const { stripe, invoice, subscriptionId } = params;

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

    return prisma.invoice.update({
        where: { id: invoice.id },
        data: {
            paid: paidLike,
            paymentType: 'subscription',
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: getId(subscription.customer) || invoice.stripeCustomerId,
            stripePaymentIntentId: paymentIntentId || invoice.stripePaymentIntentId,
            stripeChargeId: chargeId || invoice.stripeChargeId,
            stripeLatestInvoiceId: latestInvoiceId || invoice.stripeLatestInvoiceId,
            stripeSubscriptionStatus: status,
            stripeCurrentPeriodEnd: unixToDate(subscription.current_period_end) || invoice.stripeCurrentPeriodEnd,
            stripeCancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
            subscriptionStartedAt: paidLike && !invoice.subscriptionStartedAt ? new Date() : invoice.subscriptionStartedAt,
            subscriptionCanceledAt: status === 'canceled' ? new Date() : invoice.subscriptionCanceledAt,
            transactionId: invoice.transactionId || paymentIntentId || subscription.id,
        },
        include: invoiceInclude,
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const stripe = getStripeClient();

        const invoiceIdParam = getStringValue(req.query.invoiceId);
        const sessionId = getStringValue(req.query.session_id);

        if (!invoiceIdParam && !sessionId) {
            return res.status(400).json({
                message: 'invoiceId or session_id is required',
            });
        }

        if (sessionId) {
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent', 'payment_intent.latest_charge', 'subscription', 'invoice.payment_intent'],
            });

            const invoiceIdFromStripe = session.metadata?.invoiceId;

            if (!invoiceIdFromStripe) {
                return res.status(400).json({
                    message: 'invoiceId missing from Stripe session metadata',
                    stripePaymentStatus: session.payment_status,
                    stripeSessionId: session.id,
                });
            }

            const invoiceId = Number(invoiceIdFromStripe);

            if (!Number.isFinite(invoiceId)) {
                return res.status(400).json({
                    message: 'Invalid invoiceId in Stripe session metadata',
                });
            }

            const invoice = await prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: invoiceInclude,
            });

            if (!invoice) {
                return res.status(404).json({
                    message: 'Invoice not found',
                });
            }

            const isSubscription = session.mode === 'subscription';
            const paymentIntentId = getId(session.payment_intent);
            const chargeId = getLatestChargeId(session.payment_intent);
            const subscriptionId = getId(session.subscription);
            const customerId = getId(session.customer);

            if (isSubscription && subscriptionId) {
                const syncedInvoice = await syncSubscriptionFromStripe({
                    stripe,
                    invoice,
                    subscriptionId,
                });

                return res.status(200).json({
                    message: 'Stripe subscription payment status synced',
                    invoiceId: syncedInvoice.id,
                    paid: syncedInvoice.paid,
                    paymentType: syncedInvoice.paymentType,
                    invoice: syncedInvoice,
                    stripeSessionId: session.id,
                    stripePaymentStatus: session.payment_status,
                    stripeSubscriptionId: subscriptionId,
                    stripeSubscriptionStatus: syncedInvoice.stripeSubscriptionStatus,
                });
            }

            const shouldMarkPaid = session.payment_status === 'paid';

            const updatedInvoice = await prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    paymentType: 'one_time',
                    stripeCheckoutSessionId: session.id,
                    stripePaymentIntentId: paymentIntentId || invoice.stripePaymentIntentId,
                    stripeChargeId: chargeId || invoice.stripeChargeId,
                    stripeCustomerId: customerId || invoice.stripeCustomerId,
                    paid: shouldMarkPaid ? true : invoice.paid,
                    transactionId: invoice.transactionId || paymentIntentId || session.id,
                },
                include: invoiceInclude,
            });

            return res.status(200).json({
                message: 'Stripe one-time payment status retrieved',
                invoiceId,
                paid: updatedInvoice.paid,
                paymentType: updatedInvoice.paymentType,
                invoice: updatedInvoice,
                stripeSessionId: session.id,
                stripePaymentStatus: session.payment_status,
                stripePaymentIntentId: paymentIntentId,
                stripeChargeId: chargeId,
            });
        }

        const invoiceId = Number(invoiceIdParam);

        if (!Number.isFinite(invoiceId)) {
            return res.status(400).json({
                message: 'Invalid invoiceId',
            });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: invoiceInclude,
        });

        if (!invoice) {
            return res.status(404).json({
                message: 'Invoice not found',
            });
        }

        return res.status(200).json({
            message: 'Invoice payment status retrieved',
            invoiceId: invoice.id,
            paid: invoice.paid,
            paymentType: invoice.paymentType,
            refunded: invoice.refunded,
            refundedAmount: invoice.refundedAmount,
            transactionId: invoice.transactionId,
            invoice,
        });
    } catch (error: any) {
        console.error('Error in /api/invoices/stripe-success:', error);

        return res.status(500).json({
            message: 'Internal server error',
            error: error?.message,
        });
    }
}
