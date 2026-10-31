import { ApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { isStripeResourceMissing } from '@/lib/stripeErrorUtils';
import Stripe from 'stripe';

const DIGITAL_BILLBOARD_PRODUCTS = ['DigitalBillboard', 'digitalBillboard', 'digitalbillboard'];

function getStripeId(value: string | { id: string } | null | undefined): string | null {
    if (!value) return null;
    return typeof value === 'string' ? value : value.id;
}

function getStripeClient() {
    const secret = process.env.NEXT_PRIVATE_STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;

    if (!secret) {
        throw new ApiError(500, 'INVALID_CONFIGURATION', 'Stripe secret key is not configured');
    }

    return new Stripe(secret);
}

async function resolveSubscriptionId(stripe: Stripe, transactionId: string | null): Promise<string | null> {
    if (!transactionId) return null;
    if (transactionId.startsWith('sub_')) return transactionId;
    if (!transactionId.startsWith('cs_')) return null;

    try {
        const session = await stripe.checkout.sessions.retrieve(transactionId);
        return getStripeId(session.subscription as string | Stripe.Subscription | null);
    } catch (error) {
        if (isStripeResourceMissing(error)) return null;
        throw error;
    }
}

async function listSubscriptionInvoices(stripe: Stripe, subscriptionId: string) {
    const invoices: Stripe.Invoice[] = [];
    let startingAfter: string | undefined;

    try {
        do {
            const page = await stripe.invoices.list({
                subscription: subscriptionId,
                limit: 100,
                ...(startingAfter ? { starting_after: startingAfter } : {}),
            });

            invoices.push(...page.data);

            if (!page.has_more || page.data.length === 0) break;
            startingAfter = page.data[page.data.length - 1].id;
        } while (startingAfter);
    } catch (error) {
        if (!isStripeResourceMissing(error)) throw error;
    }

    return invoices;
}

async function retrieveSubscription(stripe: Stripe, subscriptionId: string | null): Promise<Stripe.Subscription | null> {
    if (!subscriptionId) return null;

    try {
        return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
        if (isStripeResourceMissing(error)) return null;
        throw error;
    }
}

export async function getDigitalBillboardSubscription(authId: number) {
    if (!Number.isInteger(authId) || authId <= 0) {
        throw new ApiError(400, 'INVALID_AUTH_ID', 'A valid authId is required');
    }

    const [user, checkouts] = await prisma.$transaction([
        prisma.auth.findUnique({
            where: { id: authId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roles: true,
            },
        }),
        prisma.checkout.findMany({
            where: {
                AuthId: authId,
                product: { in: DIGITAL_BILLBOARD_PRODUCTS },
            },
            orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                transactionId: true,
                amount: true,
                period: true,
                product: true,
                paid: true,
                deleted: true,
                pause: true,
                cancelSubscripton: true,
                startDate: true,
                nextBillingDate: true,
            },
        }),
    ]);

    if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const userDetails = {
        authId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    };

    if (checkouts.length === 0) {
        return {
            user: userDetails,
            subscription: null,
            transactions: [],
            nextBillingDate: null,
        };
    }

    const currentCheckout = checkouts.find((checkout) => checkout.paid && !checkout.deleted && !checkout.pause && !checkout.cancelSubscripton) ?? null;
    const stripe = getStripeClient();

    try {
        const subscriptionIdByCheckoutId = new Map<number, string>();

        for (const checkout of checkouts) {
            const subscriptionId = await resolveSubscriptionId(stripe, checkout.transactionId);
            if (subscriptionId) subscriptionIdByCheckoutId.set(checkout.id, subscriptionId);
        }

        const uniqueSubscriptionIds = Array.from(new Set(subscriptionIdByCheckoutId.values()));
        const invoiceGroups = await Promise.all(uniqueSubscriptionIds.map((subscriptionId) => listSubscriptionInvoices(stripe, subscriptionId)));
        const invoiceById = new Map<string, Stripe.Invoice>();

        for (const invoice of invoiceGroups.flat()) invoiceById.set(invoice.id, invoice);

        const transactions = Array.from(invoiceById.values())
            .map((invoice) => ({
                id: invoice.id,
                subscriptionId: getStripeId(invoice.subscription as string | Stripe.Subscription | null),
                paymentIntentId: getStripeId(invoice.payment_intent as string | Stripe.PaymentIntent | null),
                status: invoice.status,
                paid: invoice.paid,
                amountDue: invoice.amount_due,
                amountPaid: invoice.amount_paid,
                amountRemaining: invoice.amount_remaining,
                currency: invoice.currency.toUpperCase(),
                transactionDate: new Date((invoice.status_transitions.paid_at ?? invoice.created) * 1000),
                hostedInvoiceUrl: invoice.hosted_invoice_url,
                invoicePdf: invoice.invoice_pdf,
            }))
            .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());

        const currentSubscriptionId = currentCheckout ? subscriptionIdByCheckoutId.get(currentCheckout.id) ?? null : null;
        const stripeSubscription = await retrieveSubscription(stripe, currentSubscriptionId);
        const nextBillingDate = stripeSubscription?.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000)
            : currentCheckout?.nextBillingDate ?? null;

        return {
            user: userDetails,
            subscription: currentCheckout
                ? {
                      id: currentCheckout.id,
                      product: 'DigitalBillboard' as const,
                      amount: currentCheckout.amount,
                      period: currentCheckout.period,
                      paid: currentCheckout.paid,
                      paused: currentCheckout.pause,
                      canceled: currentCheckout.cancelSubscripton,
                      startDate: currentCheckout.startDate,
                      storedNextBillingDate: currentCheckout.nextBillingDate,
                      stripeCheckoutSessionId: currentCheckout.transactionId,
                      stripeSubscriptionId: currentSubscriptionId,
                      stripeStatus: stripeSubscription?.status ?? null,
                      cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end ?? null,
                      currentPeriodStart: stripeSubscription?.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : null,
                      currentPeriodEnd: stripeSubscription?.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : null,
                  }
                : null,
            transactions,
            nextBillingDate,
        };
    } catch (error) {
        console.error('Failed to retrieve Digital Billboard subscription data from Stripe:', error);
        throw new ApiError(502, 'STRIPE_SUBSCRIPTION_LOOKUP_FAILED', 'Unable to retrieve Digital Billboard subscription data from Stripe');
    }
}
