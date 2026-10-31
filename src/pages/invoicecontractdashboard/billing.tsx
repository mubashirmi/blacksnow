import type { NextPage } from 'next';

import { PricingBillingCard } from '@/components/billing/PricingBillingCard';
import { ArrowDownLeft, ArrowUpRight, BadgeDollarSign, CheckCircle2, CreditCard, ReceiptText, RefreshCw, RotateCcw, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Money = {
    amount: number;
    amountMinor: number;
    currency: string;
};

type EarningsData = {
    user: {
        authId: number;
        email: string;
        firstName: string;
        lastName: string;
        stripeConnected: boolean;
    };
    timezone: string;
    currentMonth: {
        startDate: string;
        endDate: string;
    };
    totalEarnedThisMonth: Money;
    totalInvoiceEarnedThisMonth: Money;
    totalSubscriptionInvEarnedThisMonth: Money;
    successfullyWithdrawnThisMonth: Money;
    totalWithdrawn: Money;
    totalEarned: Money;
    totalInvoiceEarned: Money;
    totalSubscriptionInvEarned: Money;
};

type PaymentSource = 'all' | 'invoice' | 'subscription';
type TransactionStatusFilter = 'all' | 'paid' | 'pending';

const PAYMENT_SOURCE_OPTIONS: { value: PaymentSource; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'invoice', label: 'Invoices' },
    { value: 'subscription', label: 'Subscriptions' },
];

type EarningsResponse = {
    success: boolean;
    data?: EarningsData;
    message?: string;
    error?: string;
};

type TransactionReference = {
    id?: number;
    name?: string;
    email?: string;
    businessName?: string;
    paid?: boolean;
    paymentType?: string;
    subscriptionInterval?: string | null;
    currency?: string;
    totalAmount?: number;
    stripeSubscriptionStatus?: string | null;
    stripeCurrentPeriodEnd?: string | null;
    refunded?: boolean;
    refundedAmount?: number;
    product?: string;
    period?: string;
    paused?: boolean;
    canceled?: boolean;
    deleted?: boolean;
    nextBillingDate?: string | null;
};

type BillingTransaction = {
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    transactionDate: string;
    createdAt: string;
    updatedAt: string;
    paymentType: string;
    baseAmount: number;
    serviceFeeAmount: number;
    platformFeeAmount: number;
    applicationFeeAmount: number;
    paymentMethod: {
        provider: string;
        stripeCustomerId: string | null;
        stripePaymentIntentId: string | null;
        stripeChargeId: string | null;
    } | null;
    stripeCheckoutSessionId: string | null;
    stripeInvoiceId: string | null;
    stripeSubscriptionId: string | null;
    refunded: boolean;
    refundedAmount: number;
    reference: TransactionReference | null;
};

type BillingRefund = {
    id: number;
    type: string;
    amount: number;
    currency: string;
    status: string;
    refundDate: string;
    updatedAt: string;
    reason: string | null;
    paymentId: string | null;
    stripeRefundId: string | null;
    stripePaymentIntentId: string | null;
    stripeChargeId: string | null;
    stripeSubscriptionId: string | null;
    reference: TransactionReference | null;
};

type BillingData = {
    user: {
        authId: number;
        email: string;
        firstName: string;
        lastName: string;
    };
    transactions: BillingTransaction[];
    refunds: BillingRefund[];
    nextSubscriptionBillingDate: string | null;
    activeSubscription: {
        id: number;
        product: string;
        period: string;
        amount: number;
        paid: boolean;
        pause: boolean;
        cancelSubscripton: boolean;
        startDate: string;
        nextBillingDate: string | null;
        transactionId: string | null;
    } | null;
};

type BillingResponse = {
    success: boolean;
    data?: BillingData;
    message?: string;
    error?: string;
};

type ActivityKind = 'invoicePayment' | 'subscriptionPayment' | 'toolSubscription' | 'refund';

type BillingActivity = {
    key: string;
    kind: ActivityKind;
    title: string;
    description: string;
    secondaryText: string | null;
    date: string;
    amountMinor: number;
    currency: string;
    status: string;
    earningsMinor: number | null;
    platformFeeMinor: number | null;
    refundedAmountMinor: number | null;
};

const formatCurrency = (amount: number, currency = 'USD'): string => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `$${amount.toFixed(2)}`;
    }
};

const formatMinorCurrency = (amountMinor: number, currency = 'USD'): string => formatCurrency(amountMinor / 100, currency);

const formatDateOnly = (value?: string | null): string => {
    if (!value) return '—';

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) return value;

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
};

const formatDateTime = (value?: string | null, timeZone?: string): string => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    try {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timeZone || undefined,
            timeZoneName: timeZone ? 'short' : undefined,
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
};

const humanize = (value: string): string =>
    value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (character) => character.toUpperCase());

const getStatusClasses = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'paid':
        case 'succeeded':
        case 'active':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
        case 'failed':
        case 'canceled':
        case 'cancelled':
            return 'bg-red-50 text-red-700 ring-red-200';
        case 'pending':
        case 'processing':
            return 'bg-amber-50 text-amber-700 ring-amber-200';
        default:
            return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
};

const getActivityIcon = (kind: ActivityKind) => {
    switch (kind) {
        case 'invoicePayment':
            return ReceiptText;
        case 'subscriptionPayment':
            return RefreshCw;
        case 'toolSubscription':
            return CreditCard;
        case 'refund':
            return RotateCcw;
    }
};

const getActivityIconClasses = (kind: ActivityKind): string => {
    switch (kind) {
        case 'invoicePayment':
            return 'bg-blue-50 text-blue-700 ring-blue-100';
        case 'subscriptionPayment':
            return 'bg-violet-50 text-violet-700 ring-violet-100';
        case 'toolSubscription':
            return 'bg-amber-50 text-amber-700 ring-amber-100';
        case 'refund':
            return 'bg-red-50 text-red-700 ring-red-100';
    }
};

const transactionPresentation = (
    transaction: BillingTransaction
): {
    kind: ActivityKind;
    title: string;
    description: string;
    secondaryText: string | null;
} => {
    const reference = transaction.reference;

    if (transaction.type === 'toolSubscription') {
        return {
            kind: 'toolSubscription',
            title: 'Invoice Tool Subscription',
            description: `${humanize(reference?.period || 'monthly')} plan`,
            secondaryText: reference?.nextBillingDate ? `Next billing: ${formatDateTime(reference.nextBillingDate)}` : null,
        };
    }

    const name = reference?.name?.trim();
    const businessName = reference?.businessName?.trim();
    const email = reference?.email?.trim();

    if (transaction.type === 'subscriptionInvoice') {
        return {
            kind: 'subscriptionPayment',
            title: 'Subscription Payment',
            description: name || businessName || 'Customer subscription payment',
            secondaryText: businessName && businessName !== name ? businessName : email || null,
        };
    }

    return {
        kind: 'invoicePayment',
        title: 'Invoice Payment',
        description: name || businessName || 'Customer invoice payment',
        secondaryText: businessName && businessName !== name ? businessName : email || null,
    };
};

const buildActivities = (billing: BillingData | null): BillingActivity[] => {
    if (!billing) return [];

    const payments: BillingActivity[] = billing.transactions.map((transaction) => {
        const presentation = transactionPresentation(transaction);
        const isToolCharge = presentation.kind === 'toolSubscription';

        return {
            key: `transaction-${transaction.id}`,
            kind: presentation.kind,
            title: presentation.title,
            description: presentation.description,
            secondaryText: presentation.secondaryText,
            date: transaction.transactionDate,
            amountMinor: isToolCharge ? -Math.abs(transaction.amount) : Math.abs(transaction.amount),
            currency: transaction.currency,
            status: transaction.status,
            earningsMinor: isToolCharge ? null : transaction.baseAmount,
            platformFeeMinor: isToolCharge ? null : transaction.platformFeeAmount,
            refundedAmountMinor: transaction.refundedAmount > 0 ? transaction.refundedAmount : null,
        };
    });

    const refunds: BillingActivity[] = billing.refunds.map((refund) => {
        const reference = refund.reference;
        const name = reference?.name?.trim();
        const businessName = reference?.businessName?.trim();
        const email = reference?.email?.trim();

        return {
            key: `refund-${refund.id}`,
            kind: 'refund',
            title: refund.type === 'subscriptionInvoice' || refund.type === 'subscription' ? 'Subscription Refund' : 'Invoice Refund',
            description: name || businessName || 'Customer refund',
            secondaryText: businessName && businessName !== name ? businessName : email || null,
            date: refund.refundDate,
            amountMinor: -Math.abs(refund.amount),
            currency: refund.currency,
            status: refund.status,
            earningsMinor: null,
            platformFeeMinor: null,
            refundedAmountMinor: null,
        };
    });

    return [...payments, ...refunds].sort((first, second) => {
        const firstTime = new Date(first.date).getTime();
        const secondTime = new Date(second.date).getTime();

        return (Number.isFinite(secondTime) ? secondTime : 0) - (Number.isFinite(firstTime) ? firstTime : 0);
    });
};

const BillingPage: NextPage = () => {
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [billing, setBilling] = useState<BillingData | null>(null);
    const [earningsError, setEarningsError] = useState<string | null>(null);
    const [billingError, setBillingError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentSource, setPaymentSource] = useState<PaymentSource>('all');
    const [transactionStatusFilter, setTransactionStatusFilter] = useState<TransactionStatusFilter>('all');

    const fetchJson = useCallback(
        async <
            T extends {
                success: boolean;
                message?: string;
                error?: string;
            }
        >(
            url: string
        ): Promise<T> => {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });

            const body = (await response.json().catch(() => null)) as T | null;

            if (!response.ok || !body?.success) {
                throw new Error(body?.error || body?.message || 'The request could not be completed.');
            }

            return body;
        },
        []
    );

    const loadBilling = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const userId = window.localStorage.getItem('userId');

        if (!userId) {
            const message = 'User information was not found. Please sign in again.';

            setEarnings(null);
            setBilling(null);
            setEarningsError(message);
            setBillingError(message);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setEarningsError(null);
        setBillingError(null);

        const authId = encodeURIComponent(userId);

        const [earningsResult, billingResult] = await Promise.allSettled([
            fetchJson<EarningsResponse>(`/api/v5/business-invoice/user/earnings?authId=${authId}`),
            fetchJson<BillingResponse>(`/api/v5/business-invoice/user/billing?authId=${authId}`),
        ]);

        if (earningsResult.status === 'fulfilled' && earningsResult.value.data) {
            setEarnings(earningsResult.value.data);
        } else {
            setEarnings(null);
            setEarningsError(
                earningsResult.status === 'rejected' && earningsResult.reason instanceof Error
                    ? earningsResult.reason.message
                    : 'Earnings information is unavailable.'
            );
        }

        if (billingResult.status === 'fulfilled' && billingResult.value.data) {
            setBilling(billingResult.value.data);
        } else {
            setBilling(null);
            setBillingError(
                billingResult.status === 'rejected' && billingResult.reason instanceof Error
                    ? billingResult.reason.message
                    : 'Transaction history is unavailable.'
            );
        }

        setIsLoading(false);
    }, [fetchJson]);

    useEffect(() => {
        // eslint-disable-next-line
        void loadBilling();
    }, [loadBilling]);

    const activities = useMemo(() => buildActivities(billing), [billing]);

    // Paid/Pending is scoped to incoming customer payments. Refunds and tool
    // subscription charges are still available under All statuses.
    const filteredActivities = useMemo(() => {
        if (transactionStatusFilter === 'all') return activities;

        const paidStatuses = new Set(['paid', 'succeeded', 'complete', 'completed']);
        const pendingStatuses = new Set(['pending', 'processing', 'requires_action', 'unpaid', 'open', 'past_due']);

        return activities.filter((activity) => {
            if (activity.kind !== 'invoicePayment' && activity.kind !== 'subscriptionPayment') return false;
            const status = activity.status.trim().toLowerCase();
            return transactionStatusFilter === 'paid' ? paidStatuses.has(status) : pendingStatuses.has(status);
        });
    }, [activities, transactionStatusFilter]);

    // The source filter applies only to the two received-payment totals.
    // Withdrawals and transaction history remain unchanged.
    const receivedThisMonth = earnings
        ? paymentSource === 'invoice'
            ? earnings.totalInvoiceEarnedThisMonth
            : paymentSource === 'subscription'
            ? earnings.totalSubscriptionInvEarnedThisMonth
            : earnings.totalEarnedThisMonth
        : null;

    const receivedTotal = earnings
        ? paymentSource === 'invoice'
            ? earnings.totalInvoiceEarned
            : paymentSource === 'subscription'
            ? earnings.totalSubscriptionInvEarned
            : earnings.totalEarned
        : null;

    const receivedMonthLabel =
        paymentSource === 'invoice'
            ? 'Received Invoice Payments This Month'
            : paymentSource === 'subscription'
            ? 'Received Subscription Payments This Month'
            : 'Received Payments This Month';

    const receivedTotalLabel =
        paymentSource === 'invoice'
            ? 'Total Received Invoice Payments'
            : paymentSource === 'subscription'
            ? 'Total Received Subscription Payments'
            : 'Total Received Payments';

    if (isLoading && !earnings && !billing) {
        return (
            <div className='mx-auto w-full max-w-7xl'>
                <div className='overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_65px_rgba(15,23,42,0.10)]'>
                    <div className='animate-pulse lg:grid lg:grid-cols-[1fr_1.03fr]'>
                        <div className='min-h-[560px] bg-slate-100' />
                        <div className='min-h-[560px] bg-white p-8'>
                            <div className='h-14 w-14 rounded-full bg-slate-100' />
                            <div className='mt-6 h-8 w-48 rounded bg-slate-100' />
                            <div className='mt-4 h-4 w-64 rounded bg-slate-100' />
                            <div className='mt-14 h-4 w-48 rounded bg-slate-100' />
                            <div className='mt-4 h-12 w-56 rounded bg-slate-100' />
                        </div>
                    </div>
                </div>

                <div className='mt-6 rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.07)]'>
                    <div className='h-6 w-44 animate-pulse rounded bg-slate-100' />
                    <div className='mt-5 h-40 animate-pulse rounded-xl bg-slate-100' />
                </div>
            </div>
        );
    }

    return (
        <div className='mx-auto w-full max-w-7xl'>
            <section className='overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_65px_rgba(15,23,42,0.10)]'>
                <div className='lg:grid lg:grid-cols-[1fr_1.03fr]'>
                    <div className='relative overflow-hidden border-b border-slate-200 bg-slate-50 px-6 py-7 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r'>
                        <div className='relative z-10'>
                            <div className='flex flex-wrap items-center gap-5'>
                                <div className='text-[44px] font-extrabold tracking-[-3px] text-[#635bff] sm:text-[52px]'>stripe</div>

                                <span
                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
                                        earnings?.user.stripeConnected
                                            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700'
                                            : 'border-amber-200 bg-amber-50/80 text-amber-700'
                                    }`}
                                >
                                    {earnings?.user.stripeConnected ? 'Connected' : 'Not Connected'}

                                    {earnings?.user.stripeConnected && (
                                        <span className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[12px] text-white'>✓</span>
                                    )}
                                </span>
                            </div>

                            <p className='mt-2 text-[16px] text-slate-600 sm:text-[18px]'>Secure payments powered by Stripe</p>

                            <PricingBillingCard />

                            <div className='mt-9 grid grid-cols-3 divide-x divide-slate-200'>
                                <div className='px-2 text-center sm:px-5'>
                                    <ShieldCheck className='mx-auto h-9 w-9 text-[#5147df]' strokeWidth={1.7} />
                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Secure
                                        <br />
                                        Payments
                                    </div>
                                </div>

                                <div className='px-2 text-center sm:px-5'>
                                    <BadgeDollarSign className='mx-auto h-9 w-9 text-[#5147df]' strokeWidth={1.7} />
                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Track
                                        <br />
                                        Earnings
                                    </div>
                                </div>

                                <div className='px-2 text-center sm:px-5'>
                                    <CheckCircle2 className='mx-auto h-9 w-9 text-[#5147df]' strokeWidth={1.7} />
                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Stripe
                                        <br />
                                        Connected
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white'>
                        <div className='flex items-center gap-4 border-b border-slate-200 px-6 py-7 sm:px-10 sm:py-8'>
                            <div className='relative flex h-[62px] w-[62px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50 shadow-sm'>
                                <Image src='/logocolored.png' alt='BlackSnow' width={46} height={46} className='h-[46px] w-[46px] object-contain' />
                            </div>

                            <div className='min-w-0'>
                                <h1 className='text-[24px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[28px]'>Invoice Tool</h1>

                                <p className='mt-1 text-sm text-slate-500 sm:text-[16px]'>Your earnings at a glance</p>
                            </div>
                        </div>

                        {earningsError && !earnings ? (
                            <div className='px-6 py-10 sm:px-10'>
                                <div className='rounded-2xl border border-red-200 bg-red-50 px-5 py-4'>
                                    <p className='font-semibold text-red-900'>Unable to load earnings</p>
                                    <p className='mt-1 text-sm text-red-700'>{earningsError}</p>
                                    <button
                                        type='button'
                                        // eslint-disable-next-line
                                        onClick={() => void loadBilling()}
                                        className='mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700'
                                    >
                                        <RefreshCw className='h-4 w-4' />
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : earnings ? (
                            <div className='px-6 py-8 sm:px-10 sm:py-10'>
                                <div className='mb-8'>
                                    <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                                        <span className='text-xs font-semibold uppercase tracking-[0.06em] text-slate-600'>Payment source</span>
                                        <span className='text-xs text-slate-500'>Received payments only</span>
                                    </div>

                                    <div
                                        className='grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1'
                                        role='group'
                                        aria-label='Filter received payments by source'
                                    >
                                        {PAYMENT_SOURCE_OPTIONS.map((option) => {
                                            const selected = paymentSource === option.value;

                                            return (
                                                <button
                                                    key={option.value}
                                                    type='button'
                                                    aria-pressed={selected}
                                                    onClick={() => setPaymentSource(option.value)}
                                                    className={`min-w-0 rounded-lg px-2 py-2.5 text-center text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:px-3 sm:text-sm ${
                                                        selected
                                                            ? 'bg-white text-[#5147df] shadow-sm ring-1 ring-slate-200'
                                                            : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className='flex items-start justify-between gap-5'>
                                    <div className='min-w-0'>
                                        <p className='text-[17px] font-medium text-slate-500 sm:text-[18px]'>{receivedMonthLabel}</p>

                                        <div className='mt-3 break-words text-[38px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[48px]'>
                                            {receivedThisMonth && formatCurrency(receivedThisMonth.amount, receivedThisMonth.currency)}
                                        </div>

                                        <div className='mt-2 text-sm font-medium text-slate-500'>
                                            {formatDateOnly(earnings.currentMonth.startDate)} – {formatDateOnly(earnings.currentMonth.endDate)}
                                        </div>
                                    </div>

                                    <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5e50ed,#4c3dd8)] text-white shadow-[0_10px_25px_rgba(79,70,229,0.24)]'>
                                        <ArrowUpRight className='h-7 w-7' />
                                    </div>
                                </div>

                                <div className='my-8 border-t border-slate-200' />

                                <div className='space-y-5'>
                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Successfully Withdrawn This Month</span>
                                        <span className='text-right text-sm font-semibold text-slate-950 sm:text-[16px]'>
                                            {formatCurrency(earnings.successfullyWithdrawnThisMonth.amount, earnings.successfullyWithdrawnThisMonth.currency)}
                                        </span>
                                    </div>

                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Total Withdrawn</span>
                                        <span className='text-right text-sm font-semibold text-slate-950 sm:text-[16px]'>
                                            {formatCurrency(earnings.totalWithdrawn.amount, earnings.totalWithdrawn.currency)}
                                        </span>
                                    </div>

                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>{receivedTotalLabel}</span>
                                        <span className='text-right text-sm font-semibold text-slate-950 sm:text-[16px]'>
                                            {receivedTotal && formatCurrency(receivedTotal.amount, receivedTotal.currency)}
                                        </span>
                                    </div>
                                </div>

                                <div className='mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4'>
                                    <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                                        <span className='text-sm font-medium text-slate-600'>Reporting timezone</span>
                                        <span className='text-sm font-semibold text-slate-900'>{earnings.timezone}</span>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center gap-2 border-t border-slate-200 bg-slate-50/70 px-6 py-4 text-center text-[12px] text-slate-500 sm:flex-row sm:gap-3 sm:text-[13px]'>
                    <span className='inline-flex items-center gap-2'>
                        <ShieldCheck className='h-4 w-4' />
                        Payments and payouts are securely processed through Stripe
                    </span>
                    <span className='hidden text-slate-300 sm:inline'>|</span>
                    <span>Invoice Tool Billing</span>
                </div>
            </section>

            <section className='mt-6 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]'>
                <div className='border-b border-slate-200 px-5 py-5 sm:px-6'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <h2 className='text-xl font-semibold text-slate-950'>Transaction History</h2>
                            <p className='mt-1 text-sm text-slate-500'>Invoice payments, subscription payments, Invoice Tool charges, and refunds.</p>
                        </div>

                        <div className='flex flex-wrap items-center gap-3'>
                            <label htmlFor='invoice-transaction-status' className='text-sm font-medium text-slate-600'>
                                Payment status
                            </label>
                            <select
                                id='invoice-transaction-status'
                                value={transactionStatusFilter}
                                onChange={(event) => setTransactionStatusFilter(event.target.value as TransactionStatusFilter)}
                                className='min-w-[150px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                            >
                                <option value='all'>All statuses</option>
                                <option value='paid'>Paid</option>
                                <option value='pending'>Pending</option>
                            </select>
                            <div className='flex items-center gap-2 text-sm text-slate-500'>
                                <ReceiptText className='h-4 w-4' />
                                {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
                            </div>
                        </div>
                    </div>
                </div>

                {billingError && !billing ? (
                    <div className='px-6 py-10'>
                        <div className='rounded-2xl border border-red-200 bg-red-50 px-5 py-4'>
                            <p className='font-semibold text-red-900'>Unable to load transactions</p>
                            <p className='mt-1 text-sm text-red-700'>{billingError}</p>
                            <button
                                type='button'
                                // eslint-disable-next-line
                                onClick={() => void loadBilling()}
                                className='mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700'
                            >
                                <RefreshCw className='h-4 w-4' />
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : activities.length === 0 ? (
                    <div className='px-6 py-14 text-center'>
                        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
                            <ReceiptText className='h-6 w-6' />
                        </div>
                        <h3 className='mt-4 font-semibold text-slate-900'>No billing activity yet</h3>
                        <p className='mt-1 text-sm text-slate-500'>Payments, subscription charges, and refunds will appear here.</p>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className='px-6 py-14 text-center'>
                        <h3 className='font-semibold text-slate-900'>No {transactionStatusFilter} payments found</h3>
                        <p className='mt-1 text-sm text-slate-500'>Try All statuses to view the full transaction history.</p>
                    </div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full min-w-[1120px] border-collapse'>
                            <thead>
                                <tr className='bg-slate-50/80'>
                                    {['Activity', 'Details', 'Amount', 'Your Earnings', 'Platform Fee', 'Status', 'Date'].map((header) => (
                                        <th
                                            key={header}
                                            className={`border-b border-slate-200 px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500 ${
                                                header === 'Date' ? 'text-right sm:px-6' : 'text-left'
                                            }`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className='divide-y divide-slate-100'>
                                {filteredActivities.map((activity) => {
                                    const Icon = getActivityIcon(activity.kind);
                                    const outgoing = activity.amountMinor < 0;

                                    return (
                                        <tr key={activity.key} className='bg-white transition hover:bg-slate-50/60'>
                                            <td className='px-5 py-4 sm:px-6'>
                                                <div className='flex items-center gap-3'>
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${getActivityIconClasses(
                                                            activity.kind
                                                        )}`}
                                                    >
                                                        <Icon className='h-5 w-5' />
                                                    </div>

                                                    <div>
                                                        <div className='text-sm font-semibold text-slate-900'>{activity.title}</div>
                                                        <div className='mt-0.5 inline-flex items-center gap-1 text-[12px] text-slate-500'>
                                                            {outgoing ? <ArrowDownLeft className='h-3.5 w-3.5' /> : <ArrowUpRight className='h-3.5 w-3.5' />}
                                                            {outgoing ? 'Outgoing' : 'Incoming'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className='px-5 py-4'>
                                                <div className='max-w-[260px]'>
                                                    <div className='truncate text-sm font-medium text-slate-800'>{activity.description}</div>

                                                    {activity.secondaryText && (
                                                        <div className='mt-0.5 truncate text-[12px] text-slate-500'>{activity.secondaryText}</div>
                                                    )}

                                                    {activity.refundedAmountMinor !== null && activity.refundedAmountMinor > 0 && (
                                                        <div className='mt-1 text-[12px] font-medium text-red-600'>
                                                            Refunded: {formatMinorCurrency(activity.refundedAmountMinor, activity.currency)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className={`whitespace-nowrap px-5 py-4 text-sm font-semibold ${outgoing ? 'text-red-700' : 'text-slate-950'}`}>
                                                {formatMinorCurrency(activity.amountMinor, activity.currency)}
                                            </td>

                                            <td className='whitespace-nowrap px-5 py-4 text-sm font-semibold text-emerald-700'>
                                                {activity.earningsMinor === null ? '—' : formatMinorCurrency(activity.earningsMinor, activity.currency)}
                                            </td>

                                            <td className='whitespace-nowrap px-5 py-4 text-sm text-slate-600'>
                                                {activity.platformFeeMinor === null ? '—' : formatMinorCurrency(activity.platformFeeMinor, activity.currency)}
                                            </td>

                                            <td className='px-5 py-4'>
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                                                        activity.status
                                                    )}`}
                                                >
                                                    {humanize(activity.status)}
                                                </span>
                                            </td>

                                            <td className='whitespace-nowrap px-5 py-4 text-right text-sm text-slate-600 sm:px-6'>
                                                {formatDateTime(activity.date, earnings?.timezone)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default BillingPage;
