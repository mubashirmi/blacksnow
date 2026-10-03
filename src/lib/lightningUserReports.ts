import { ApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { getAdminRevenueRanges, getConfiguredAdminRevenueTimeZone } from '@/lib/subscriptionPlatformRevenue';
import Stripe from 'stripe';

export type LightningSubscriptionType = 'LightningSilver' | 'LightningGold';

const LIGHTNING_PRODUCTS_BY_TYPE: Record<LightningSubscriptionType, string[]> = {
    LightningSilver: ['LightningSilver', 'lightningSilver'],
    LightningGold: ['LightningGold', 'lightningGold'],
};

function normalizeLightningProduct(product: string | null) {
    const normalized = product?.trim().toLowerCase();

    if (normalized === 'lightningsilver') return 'LightningSilver' as const;
    if (normalized === 'lightninggold') return 'LightningGold' as const;
    return null;
}

function getStripeId(value: string | { id: string } | null | undefined): string | null {
    if (!value) return null;
    return typeof value === 'string' ? value : value.id;
}

function parsePayoutAmount(value: string): number {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function getStripeClient() {
    const secret = process.env.NEXT_PRIVATE_STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;

    if (!secret) {
        throw new ApiError(500, 'INVALID_CONFIGURATION', 'Stripe secret key is not configured');
    }

    return new Stripe(secret);
}

export async function getLightningReferralEarnings(authId: number, subscriptionType: LightningSubscriptionType, now = new Date()) {
    if (!Number.isInteger(authId) || authId <= 0) {
        throw new ApiError(400, 'INVALID_AUTH_ID', 'A valid authId is required');
    }

    const [user, referralEarnings, availableRevenue, withdrawals] = await prisma.$transaction([
        prisma.auth.findUnique({
            where: { id: authId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roles: true,
                adminStripeConnectId: true,
            },
        }),
        prisma.referralProducts.aggregate({
            where: { authId },
            _sum: { comission: true },
        }),
        prisma.adminRevenue.findUnique({
            where: { authId },
            select: { revenue: true },
        }),
        prisma.adminPayouts.findMany({
            where: { authId },
            select: {
                amount: true,
                createdAt: true,
            },
        }),
    ]);

    if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const timeZone = getConfiguredAdminRevenueTimeZone();
    const month = getAdminRevenueRanges(now, timeZone).monthly;
    const totalWithdrawn = withdrawals.reduce((total, payout) => total + parsePayoutAmount(payout.amount), 0);
    const withdrawnThisMonth = withdrawals
        .filter((payout) => payout.createdAt >= month.start && payout.createdAt < month.endExclusive)
        .reduce((total, payout) => total + parsePayoutAmount(payout.amount), 0);

    return {
        user: {
            authId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            lightningTiers: user.roles.filter((role) => role === subscriptionType),
            stripeConnected: Boolean(user.adminStripeConnectId),
        },
        currency: 'USD',
        timezone: timeZone,
        currentMonth: {
            startDate: month.startDate,
            endDate: month.endDate,
        },
        availableBalance: Number(availableRevenue?.revenue ?? 0),
        withdrawnThisMonth,
        totalWithdrawn,
        totalEarned: Number(referralEarnings._sum.comission ?? 0),
    };
}

async function resolveSubscriptionId(stripe: Stripe, transactionId: string | null): Promise<string | null> {
    if (!transactionId) return null;
    if (transactionId.startsWith('sub_')) return transactionId;
    if (!transactionId.startsWith('cs_')) return null;

    const session = await stripe.checkout.sessions.retrieve(transactionId);
    return getStripeId(session.subscription as string | Stripe.Subscription | null);
}

async function listSubscriptionInvoices(stripe: Stripe, subscriptionId: string) {
    const invoices: Stripe.Invoice[] = [];
    let startingAfter: string | undefined;

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

    return invoices;
}

export async function getLightningSubscription(authId: number, subscriptionType: LightningSubscriptionType) {
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
                product: { in: LIGHTNING_PRODUCTS_BY_TYPE[subscriptionType] },
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

    const currentCheckout = checkouts.find((checkout) => checkout.paid && !checkout.deleted && !checkout.pause && !checkout.cancelSubscripton) ?? null;

    if (checkouts.length === 0) {
        return {
            user: {
                authId: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            subscription: null,
            transactions: [],
            nextBillingDate: null,
        };
    }

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
        const stripeSubscription = currentSubscriptionId ? await stripe.subscriptions.retrieve(currentSubscriptionId) : null;
        const nextBillingDate = stripeSubscription?.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000)
            : currentCheckout?.nextBillingDate ?? null;

        return {
            user: {
                authId: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            subscription: currentCheckout
                ? {
                      id: currentCheckout.id,
                      product: normalizeLightningProduct(currentCheckout.product),
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
        console.error('Failed to retrieve Lightning subscription data from Stripe:', error);
        throw new ApiError(502, 'STRIPE_SUBSCRIPTION_LOOKUP_FAILED', 'Unable to retrieve Lightning subscription data from Stripe');
    }
}
