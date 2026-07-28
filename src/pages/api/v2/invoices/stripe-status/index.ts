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

function parseBoolean(value: unknown, fallback: boolean): boolean {
    if (value === undefined || value === null) return fallback;

    const normalized = String(value).trim().toLowerCase();

    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;

    return fallback;
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

async function syncCheckoutSession(params: { stripe: Stripe; invoice: InvoiceWithRelations }): Promise<InvoiceWithRelations> {
    const { stripe, invoice } = params;

    if (!invoice.stripeCheckoutSessionId) {
        return invoice;
    }

    const session = await stripe.checkout.sessions.retrieve(invoice.stripeCheckoutSessionId, {
        expand: ['payment_intent', 'payment_intent.latest_charge', 'subscription', 'invoice.payment_intent'],
    });

    const paymentIntentId = getId(session.payment_intent);
    const chargeId = getLatestChargeId(session.payment_intent);
    const customerId = getId(session.customer);

    if (session.mode === 'subscription') {
        const subscriptionId = getId(session.subscription);

        if (!subscriptionId) {
            return invoice;
        }

        return syncSubscription({
            stripe,
            invoice,
            subscriptionId,
        });
    }

    return prisma.invoice.update({
        where: { id: invoice.id },
        data: {
            paymentType: 'one_time',
            paid: session.payment_status === 'paid' ? true : invoice.paid,
            stripePaymentIntentId: paymentIntentId || invoice.stripePaymentIntentId,
            stripeChargeId: chargeId || invoice.stripeChargeId,
            stripeCustomerId: customerId || invoice.stripeCustomerId,
            transactionId: invoice.transactionId || paymentIntentId || session.id,
        },
        include: invoiceInclude,
    });
}

async function syncSubscription(params: { stripe: Stripe; invoice: InvoiceWithRelations; subscriptionId: string }): Promise<InvoiceWithRelations> {
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
            paymentType: 'subscription',
            paid: paidLike,
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

        const invoiceIdParam = getStringValue(req.query.invoiceId);
        const sessionId = getStringValue(req.query.session_id);
        const syncStripe = parseBoolean(req.query.syncStripe, false);

        if (!invoiceIdParam && !sessionId) {
            return res.status(400).json({
                message: 'invoiceId or session_id is required',
            });
        }

        const stripe = syncStripe || sessionId ? getStripeClient() : null;

        if (sessionId) {
            const session = await stripe!.checkout.sessions.retrieve(sessionId, {
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

            const updatedInvoice = await syncCheckoutSession({
                stripe: stripe!,
                invoice,
            });

            return res.status(200).json({
                message: 'Stripe session status synced',
                invoiceId: updatedInvoice.id,
                paid: updatedInvoice.paid,
                paymentType: updatedInvoice.paymentType,
                refunded: updatedInvoice.refunded,
                refundedAmount: updatedInvoice.refundedAmount,
                transactionId: updatedInvoice.transactionId,
                invoice: updatedInvoice,
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

        let finalInvoice: InvoiceWithRelations = invoice;

        if (syncStripe) {
            if (invoice.stripeSubscriptionId) {
                finalInvoice = await syncSubscription({
                    stripe: stripe!,
                    invoice,
                    subscriptionId: invoice.stripeSubscriptionId,
                });
            } else if (invoice.stripeCheckoutSessionId) {
                finalInvoice = await syncCheckoutSession({
                    stripe: stripe!,
                    invoice,
                });
            }
        }

        return res.status(200).json({
            message: syncStripe ? 'Invoice payment status synced from Stripe' : 'Invoice payment status retrieved',
            invoiceId: finalInvoice.id,
            paid: finalInvoice.paid,
            paymentType: finalInvoice.paymentType,
            refunded: finalInvoice.refunded,
            refundedAmount: finalInvoice.refundedAmount,
            transactionId: finalInvoice.transactionId,
            invoice: finalInvoice,
        });
    } catch (error: any) {
        console.error('Error in /api/invoices/stripe-status:', error);

        return res.status(500).json({
            message: 'Internal server error',
            error: error?.message,
        });
    }
}
