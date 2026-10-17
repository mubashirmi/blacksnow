import { ApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import {
    getAdminRevenueRanges,
    getConfiguredAdminRevenueTimeZone,
    getNetRevenueBaseAmount,
    paymentStatusIsSuccessful,
} from '@/lib/subscriptionPlatformRevenue';
import Stripe from 'stripe';

const ZERO_DECIMAL_CURRENCIES = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);

const refundSelect = {
    amount: true,
    status: true,
    refundApplicationFee: true,
} as const;

const paymentSelect = {
    createdAt: true,
    paidAt: true,
    paymentStatus: true,
    currency: true,
    baseAmount: true,
    refunded: true,
    refundedAmount: true,
    refunds: { select: refundSelect },
} as const;

const invoiceSelect = {
    createdAt: true,
    paid: true,
    subscriptionStartedAt: true,
    currency: true,
    baseAmount: true,
    refunded: true,
    refundedAmount: true,
} as const;

type EarningsRecord = {
    amountMinor: number;
    earnedAt: Date;
};

type InvoiceSource = {
    createdAt: Date;
    paid: boolean;
    subscriptionStartedAt: Date | null;
    currency: string;
    baseAmount: number;
    refunded: boolean;
    refundedAmount: number;
    refunds: Array<{ amount: number; status: string | null; refundApplicationFee: boolean }>;
    payments: Array<{
        createdAt: Date;
        paidAt: Date | null;
        paymentStatus: string | null;
        currency: string;
        baseAmount: number;
        refunded: boolean;
        refundedAmount: number;
        refunds: Array<{ amount: number; status: string | null; refundApplicationFee: boolean }>;
    }>;
};

function money(amountMinor: number, currency: string) {
    const divisor = ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;

    return {
        amount: Number((amountMinor / divisor).toFixed(divisor === 1 ? 0 : 2)),
        amountMinor,
        currency: currency.toUpperCase(),
    };
}

function collectEarnings(sources: InvoiceSource[], currency: string): EarningsRecord[] {
    const records: EarningsRecord[] = [];

    for (const source of sources) {
        if (source.payments.length > 0) {
            for (const payment of source.payments) {
                if (payment.currency.toLowerCase() !== currency || !paymentStatusIsSuccessful(payment.paymentStatus, payment.paidAt)) continue;

                const amountMinor = getNetRevenueBaseAmount({
                    baseAmount: payment.baseAmount,
                    refunds: payment.refunds,
                    legacyRefunded: payment.refunded,
                    legacyRefundedAmount: payment.refundedAmount,
                });

                if (amountMinor > 0) {
                    records.push({ amountMinor, earnedAt: payment.paidAt ?? payment.createdAt });
                }
            }

            continue;
        }

        if (source.currency.toLowerCase() !== currency || (!source.paid && !source.subscriptionStartedAt)) continue;

        const amountMinor = getNetRevenueBaseAmount({
            baseAmount: source.baseAmount,
            refunds: source.refunds,
            legacyRefunded: source.refunded,
            legacyRefundedAmount: source.refundedAmount,
        });

        if (amountMinor > 0) {
            records.push({ amountMinor, earnedAt: source.subscriptionStartedAt ?? source.createdAt });
        }
    }

    return records;
}

async function getPaidPayouts(accountId: string): Promise<Stripe.Payout[]> {
    const secret = process.env.NEXT_PRIVATE_STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;

    if (!secret) {
        throw new ApiError(500, 'INVALID_CONFIGURATION', 'Stripe secret key is not configured');
    }

    const stripe = new Stripe(secret);
    const payouts: Stripe.Payout[] = [];
    let startingAfter: string | undefined;

    try {
        do {
            const page = await stripe.payouts.list(
                {
                    limit: 100,
                    status: 'paid',
                    ...(startingAfter ? { starting_after: startingAfter } : {}),
                },
                { stripeAccount: accountId }
            );

            payouts.push(...page.data);

            if (!page.has_more || page.data.length === 0) break;
            startingAfter = page.data[page.data.length - 1].id;
        } while (startingAfter);
    } catch (error) {
        console.error('Failed to retrieve Stripe Connect payouts:', error);
        throw new ApiError(502, 'STRIPE_PAYOUT_LOOKUP_FAILED', 'Unable to retrieve withdrawal totals from Stripe');
    }

    return payouts;
}

export async function getBusinessInvoiceUserEarnings(authId: number, currency: string, now = new Date()) {
    if (!Number.isInteger(authId) || authId <= 0) {
        throw new ApiError(400, 'INVALID_AUTH_ID', 'A valid authId is required');
    }

    const normalizedCurrency = currency.toLowerCase();

    const [user, invoices, subscriptionInvoices] = await prisma.$transaction([
        prisma.auth.findUnique({
            where: { id: authId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                adminStripeConnectId: true,
            },
        }),
        prisma.invoice.findMany({
            where: { authId },
            select: {
                ...invoiceSelect,
                invoiceRefunds: {
                    select: refundSelect,
                },
                invoicePayments: {
                    select: paymentSelect,
                },
            },
        }),
        prisma.subscriptionInv.findMany({
            where: { authId },
            select: {
                ...invoiceSelect,
                subscriptionInvRefunds: {
                    select: refundSelect,
                },
                subscriptionInvPayments: {
                    select: paymentSelect,
                },
            },
        }),
    ]);

    if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const invoiceSources: InvoiceSource[] = invoices.map((invoice) => ({
        ...invoice,
        refunds: invoice.invoiceRefunds,
        payments: invoice.invoicePayments,
    }));

    const subscriptionInvoiceSources: InvoiceSource[] = subscriptionInvoices.map((invoice) => ({
        ...invoice,
        refunds: invoice.subscriptionInvRefunds,
        payments: invoice.subscriptionInvPayments,
    }));

    /*
     * Keep invoice and subscription invoice earnings separate so we can
     * expose individual totals, while still preserving the existing
     * combined earnings calculations.
     */
    const invoiceEarnings = collectEarnings(invoiceSources, normalizedCurrency);

    const subscriptionInvoiceEarnings = collectEarnings(subscriptionInvoiceSources, normalizedCurrency);

    const earnings = [...invoiceEarnings, ...subscriptionInvoiceEarnings];

    const timeZone = getConfiguredAdminRevenueTimeZone();
    const month = getAdminRevenueRanges(now, timeZone).monthly;

    /*
     * Invoice earnings
     */
    const invoiceEarnedThisMonthMinor = invoiceEarnings
        .filter((record) => record.earnedAt >= month.start && record.earnedAt < month.endExclusive)
        .reduce((total, record) => total + record.amountMinor, 0);

    const totalInvoiceEarnedMinor = invoiceEarnings.reduce((total, record) => total + record.amountMinor, 0);

    /*
     * Subscription invoice earnings
     */
    const subscriptionInvEarnedThisMonthMinor = subscriptionInvoiceEarnings
        .filter((record) => record.earnedAt >= month.start && record.earnedAt < month.endExclusive)
        .reduce((total, record) => total + record.amountMinor, 0);

    const totalSubscriptionInvEarnedMinor = subscriptionInvoiceEarnings.reduce((total, record) => total + record.amountMinor, 0);

    /*
     * Existing combined earnings
     */
    const earnedThisMonthMinor = earnings
        .filter((record) => record.earnedAt >= month.start && record.earnedAt < month.endExclusive)
        .reduce((total, record) => total + record.amountMinor, 0);

    const totalEarnedMinor = earnings.reduce((total, record) => total + record.amountMinor, 0);

    /*
     * Existing Stripe payout calculations
     */
    const payouts = user.adminStripeConnectId ? await getPaidPayouts(user.adminStripeConnectId) : [];

    const currencyPayouts = payouts.filter((payout) => payout.currency.toLowerCase() === normalizedCurrency);

    const withdrawnThisMonthMinor = currencyPayouts
        .filter((payout) => {
            const arrivalDate = new Date(payout.arrival_date * 1000);

            return arrivalDate >= month.start && arrivalDate < month.endExclusive;
        })
        .reduce((total, payout) => total + payout.amount, 0);

    const totalWithdrawnMinor = currencyPayouts.reduce((total, payout) => total + payout.amount, 0);

    return {
        user: {
            authId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            stripeConnected: Boolean(user.adminStripeConnectId),
        },

        timezone: timeZone,

        currentMonth: {
            startDate: month.startDate,
            endDate: month.endDate,
        },

        /*
         * Existing combined monthly earning
         */
        totalEarnedThisMonth: money(earnedThisMonthMinor, normalizedCurrency),

        /*
         * New monthly breakdown
         */
        totalInvoiceEarnedThisMonth: money(invoiceEarnedThisMonthMinor, normalizedCurrency),

        totalSubscriptionInvEarnedThisMonth: money(subscriptionInvEarnedThisMonthMinor, normalizedCurrency),

        /*
         * Existing withdrawals
         */
        successfullyWithdrawnThisMonth: money(withdrawnThisMonthMinor, normalizedCurrency),

        totalWithdrawn: money(totalWithdrawnMinor, normalizedCurrency),

        /*
         * Existing combined lifetime earnings
         */
        totalEarned: money(totalEarnedMinor, normalizedCurrency),

        /*
         * New lifetime breakdown
         */
        totalInvoiceEarned: money(totalInvoiceEarnedMinor, normalizedCurrency),

        totalSubscriptionInvEarned: money(totalSubscriptionInvEarnedMinor, normalizedCurrency),
    };
}
