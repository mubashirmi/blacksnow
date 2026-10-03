import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

type DigitalBillboardBillingProps = {
    authId: string;
};

type SubscriptionUser = {
    authId: number;
    email: string;
    firstName: string;
    lastName: string;
};

type DigitalBillboardSubscription = {
    id: number;
    product: string;
    amount: number;
    period: string;
    paid: boolean;
    paused: boolean;
    canceled: boolean;
    startDate: string;
    storedNextBillingDate: string | null;
    stripeCheckoutSessionId: string | null;
    stripeSubscriptionId: string | null;
    stripeStatus: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
};

type DigitalBillboardTransaction = {
    id: string;
    subscriptionId: string | null;
    paymentIntentId: string | null;
    status: string;
    paid: boolean;
    amountDue: number;
    amountPaid: number;
    amountRemaining: number;
    currency: string;
    transactionDate: string;
    hostedInvoiceUrl: string | null;
    invoicePdf: string | null;
};

type DigitalBillboardBillingData = {
    user: SubscriptionUser;
    subscription: DigitalBillboardSubscription | null;
    transactions: DigitalBillboardTransaction[];
    nextBillingDate: string | null;
};

type DigitalBillboardSubscriptionResponse = {
    success: boolean;
    data?: DigitalBillboardBillingData;
    message?: string;
    error?: string;
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

const formatStripeAmount = (amount: number, currency = 'USD'): string => {
    return formatCurrency(amount / 100, currency);
};

const formatDate = (value: string | null | undefined): string => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const capitalize = (value: string | null | undefined): string => {
    if (!value) return '—';

    return value.charAt(0).toUpperCase() + value.slice(1);
};

export function DigitalBillboardBilling({ authId }: DigitalBillboardBillingProps) {
    const [billingData, setBillingData] = useState<DigitalBillboardBillingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBillingData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/v5/digital-billboard/subscription?authId=${encodeURIComponent(authId)}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });

            const responseData = (await response.json().catch(() => null)) as DigitalBillboardSubscriptionResponse | null;

            if (!response.ok) {
                throw new Error(responseData?.error || responseData?.message || 'Failed to load billing information.');
            }

            if (!responseData?.success || !responseData.data) {
                throw new Error(responseData?.error || responseData?.message || 'Billing information is unavailable.');
            }

            setBillingData(responseData.data);
        } catch (fetchError) {
            setBillingData(null);
            setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong while loading billing information.');
        } finally {
            setIsLoading(false);
        }
    }, [authId]);

    useEffect(() => {
        // eslint-disable-next-line
        void fetchBillingData();
    }, [fetchBillingData]);

    const subscription = billingData?.subscription ?? null;

    const transactions = useMemo(() => {
        return [...(billingData?.transactions ?? [])].sort((first, second) => {
            const firstTime = new Date(first.transactionDate).getTime();
            const secondTime = new Date(second.transactionDate).getTime();

            return (Number.isFinite(secondTime) ? secondTime : 0) - (Number.isFinite(firstTime) ? firstTime : 0);
        });
    }, [billingData?.transactions]);

    const currency = transactions.find((transaction) => transaction.currency)?.currency || 'USD';

    const nextBillingDate = billingData?.nextBillingDate || subscription?.currentPeriodEnd || subscription?.storedNextBillingDate || null;

    const subscriptionStatus = useMemo(() => {
        if (!subscription) {
            return {
                label: 'Unavailable',
                className: 'bg-gray-100 text-gray-700 ring-gray-200',
            };
        }

        if (subscription.canceled) {
            return {
                label: 'Canceled',
                className: 'bg-red-50 text-red-700 ring-red-200',
            };
        }

        if (subscription.paused) {
            return {
                label: 'Paused',
                className: 'bg-amber-50 text-amber-700 ring-amber-200',
            };
        }

        if (subscription.cancelAtPeriodEnd) {
            return {
                label: 'Cancels at period end',
                className: 'bg-amber-50 text-amber-700 ring-amber-200',
            };
        }

        if (subscription.paid && subscription.stripeStatus?.toLowerCase() === 'active') {
            return {
                label: 'Active',
                className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
            };
        }

        return {
            label: capitalize(subscription.stripeStatus),
            className: 'bg-gray-100 text-gray-700 ring-gray-200',
        };
    }, [subscription]);

    if (isLoading) {
        return (
            <div>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Billing</h1>
                    <p className='mt-1 text-sm text-gray-500'>Manage your Digital Billboard subscription and invoices.</p>
                </div>

                <div className='overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]'>
                    <div className='animate-pulse lg:grid lg:grid-cols-2'>
                        <div className='min-h-[520px] bg-slate-100' />
                        <div className='min-h-[520px] bg-white p-8'>
                            <div className='h-14 w-14 rounded-full bg-slate-100' />
                            <div className='mt-6 h-7 w-48 rounded bg-slate-100' />
                            <div className='mt-4 h-4 w-64 rounded bg-slate-100' />
                            <div className='mt-14 h-4 w-36 rounded bg-slate-100' />
                            <div className='mt-4 h-12 w-60 rounded bg-slate-100' />
                        </div>
                    </div>
                </div>

                <div className='mt-6 rounded-[20px] border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'>
                    <div className='h-6 w-40 animate-pulse rounded bg-slate-100' />
                    <div className='mt-5 h-36 animate-pulse rounded-xl bg-slate-100' />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Billing</h1>
                    <p className='mt-1 text-sm text-gray-500'>Manage your Digital Billboard subscription and invoices.</p>
                </div>

                <div className='rounded-[20px] border border-red-200 bg-red-50 px-6 py-5'>
                    <h2 className='text-lg font-semibold text-red-900'>Unable to load billing information</h2>
                    <p className='mt-1 text-sm text-red-700'>{error}</p>

                    <button
                        type='button'
                        // eslint-disable-next-line
                        onClick={() => void fetchBillingData()}
                        className='mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700'
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!billingData || !subscription) {
        return (
            <div>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Billing</h1>
                    <p className='mt-1 text-sm text-gray-500'>Manage your Digital Billboard subscription and invoices.</p>
                </div>

                <div className='rounded-[20px] border border-gray-200 bg-white px-6 py-12 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]'>
                    <h2 className='text-xl font-semibold text-slate-900'>No subscription found</h2>
                    <p className='mt-2 text-sm text-gray-500'>No Digital Billboard subscription is currently associated with this account.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold text-gray-900'>Billing</h1>
                <p className='mt-1 text-sm text-gray-500'>Manage your Digital Billboard subscription and invoices.</p>
            </div>

            <section className='overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_65px_rgba(15,23,42,0.12)]'>
                <div className='lg:grid lg:grid-cols-[1fr_1.03fr]'>
                    <div className='relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8f8ff_48%,#efedff_100%)] px-6 py-7 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r'>
                        <div
                            aria-hidden='true'
                            className='pointer-events-none absolute -right-20 top-12 h-72 w-72 rotate-45 rounded-[60px] bg-[linear-gradient(135deg,rgba(99,102,241,0.03),rgba(79,70,229,0.18))]'
                        />

                        <div
                            aria-hidden='true'
                            className='pointer-events-none absolute -right-36 top-16 h-72 w-72 rotate-45 rounded-[60px] border-[20px] border-indigo-400/5'
                        />

                        <div className='relative z-10'>
                            <div className='flex flex-wrap items-center gap-5'>
                                <div className='text-[44px] font-extrabold tracking-[-3px] text-[#635bff] sm:text-[52px]'>stripe</div>

                                <span className='inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm'>
                                    Connected
                                    <span className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[12px] text-white'>✓</span>
                                </span>
                            </div>

                            <p className='mt-2 text-[16px] text-slate-600 sm:text-[18px]'>Secure payments powered by Stripe</p>

                            <div className='relative mt-10 overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#222442_0%,#171936_52%,#2a1765_100%)] px-7 py-8 text-white shadow-[0_24px_45px_rgba(30,28,88,0.28)] sm:px-9 sm:py-10'>
                                <div aria-hidden='true' className='absolute -bottom-20 -right-12 h-48 w-48 rounded-full bg-violet-600/25 blur-2xl' />

                                <div className='relative z-10'>
                                    <div className='flex items-start justify-between gap-4'>
                                        <Image
                                            src='/logocolored.png'
                                            alt='BlackSnow'
                                            width={160}
                                            height={50}
                                            className='h-[40px] w-auto object-contain sm:h-[44px]'
                                        />
                                        <span className='pt-2 text-[15px] font-medium tracking-wide text-white/90'>SUBSCRIPTION</span>
                                    </div>

                                    <div className='mt-8 h-[48px] w-[62px] rounded-[9px] border border-slate-200/70 bg-[linear-gradient(135deg,#e5e7eb,#9ca3af,#f8fafc)] p-[5px]'>
                                        <div className='h-full w-full rounded-[6px] border border-slate-500/60'>
                                            <div className='h-1/2 border-b border-slate-500/60' />
                                            <div className='mx-auto -mt-[19px] h-[38px] w-[16px] border-x border-slate-500/60' />
                                        </div>
                                    </div>

                                    <div className='mt-8 text-[21px] tracking-[0.22em] text-white/95 sm:text-[24px]'>•••• •••• •••• ••••</div>

                                    <div className='mt-7 flex items-end justify-between gap-6'>
                                        <div>
                                            <div className='text-[10px] uppercase tracking-[0.16em] text-white/55'>Billing</div>
                                            <div className='mt-1 text-[15px] font-medium uppercase tracking-wide'>{subscription.period}</div>
                                        </div>

                                        <div className='text-right'>
                                            <div className='text-[10px] uppercase tracking-[0.16em] text-white/55'>Product</div>
                                            <div className='mt-1 text-[15px] font-medium uppercase tracking-wide'>Digital Billboard</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-9 grid grid-cols-3 divide-x divide-slate-200'>
                                <div className='px-2 text-center sm:px-5'>
                                    <div className='mx-auto flex h-11 w-11 items-center justify-center text-[#5147df]'>
                                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.7' className='h-9 w-9' aria-hidden='true'>
                                            <path d='M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Z' />
                                            <rect x='9' y='10' width='6' height='5' rx='1' />
                                            <path d='M10.5 10V8.8a1.5 1.5 0 0 1 3 0V10' />
                                        </svg>
                                    </div>

                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Secure
                                        <br />
                                        Payments
                                    </div>
                                </div>

                                <div className='px-2 text-center sm:px-5'>
                                    <div className='mx-auto flex h-11 w-11 items-center justify-center text-[#5147df]'>
                                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.7' className='h-9 w-9' aria-hidden='true'>
                                            <path d='m13 2-7 11h5l-1 9 8-12h-5V2Z' />
                                        </svg>
                                    </div>

                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Fast
                                        <br />
                                        Processing
                                    </div>
                                </div>

                                <div className='px-2 text-center sm:px-5'>
                                    <div className='mx-auto flex h-11 w-11 items-center justify-center text-[#5147df]'>
                                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.7' className='h-9 w-9' aria-hidden='true'>
                                            <circle cx='12' cy='12' r='9' />
                                            <path d='m8 12 2.5 2.5L16.5 8.5' />
                                        </svg>
                                    </div>

                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Trusted
                                        <br />
                                        Billing
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
                                <h2 className='text-[24px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[28px]'>Digital Billboard</h2>
                                <p className='mt-1 text-sm text-slate-500 sm:text-[16px]'>Your subscription at a glance</p>
                            </div>
                        </div>

                        <div className='px-6 py-8 sm:px-10 sm:py-10'>
                            <div className='flex items-start justify-between gap-5'>
                                <div>
                                    <p className='text-[17px] font-medium text-slate-500 sm:text-[18px]'>Upcoming Subscription</p>

                                    <div className='mt-3 text-[38px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[48px]'>
                                        {formatCurrency(subscription.amount, currency)}
                                    </div>

                                    <div className='mt-2 text-sm font-medium uppercase tracking-[0.08em] text-slate-500'>
                                        {currency.toUpperCase()} / {subscription.period}
                                    </div>
                                </div>

                                <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5e50ed,#4c3dd8)] text-[26px] font-medium text-white shadow-[0_10px_25px_rgba(79,70,229,0.24)]'>
                                    $
                                </div>
                            </div>

                            <div className='my-8 border-t border-slate-200' />

                            <div>
                                <div className='text-sm font-medium text-slate-500'>Upcoming transaction date</div>
                                <div className='mt-2 text-[23px] font-semibold text-slate-950'>{formatDate(nextBillingDate)}</div>
                            </div>

                            <div className='my-8 border-t border-slate-200' />

                            <div className='space-y-5'>
                                <div className='flex items-center justify-between gap-5'>
                                    <span className='text-sm text-slate-500 sm:text-[15px]'>Subscription status</span>
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${subscriptionStatus.className}`}
                                    >
                                        {subscriptionStatus.label}
                                    </span>
                                </div>

                                <div className='flex items-center justify-between gap-5'>
                                    <span className='text-sm text-slate-500 sm:text-[15px]'>Billing period</span>
                                    <span className='text-sm font-semibold capitalize text-slate-900 sm:text-[15px]'>{subscription.period}</span>
                                </div>

                                <div className='flex items-center justify-between gap-5'>
                                    <span className='text-sm text-slate-500 sm:text-[15px]'>Subscription started</span>
                                    <span className='text-right text-sm font-semibold text-slate-900 sm:text-[15px]'>{formatDate(subscription.startDate)}</span>
                                </div>

                                <div className='flex items-center justify-between gap-5'>
                                    <span className='text-sm text-slate-500 sm:text-[15px]'>Current billing period</span>
                                    <span className='text-right text-sm font-semibold text-slate-900 sm:text-[15px]'>
                                        {formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center gap-2 border-t border-slate-200 bg-slate-50/70 px-6 py-4 text-center text-[12px] text-slate-500 sm:flex-row sm:gap-3 sm:text-[13px]'>
                    <span className='inline-flex items-center gap-2'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' className='h-4 w-4' aria-hidden='true'>
                            <rect x='5' y='10' width='14' height='10' rx='2' />
                            <path d='M8 10V7a4 4 0 0 1 8 0v3' />
                        </svg>
                        Your billing information is securely processed by Stripe
                    </span>

                    <span className='hidden text-slate-300 sm:inline'>|</span>
                    <span>Digital Billboard Subscription</span>
                </div>
            </section>

            <section className='mt-6 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]'>
                <div className='border-b border-slate-200 px-5 py-5 sm:px-6'>
                    <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <h2 className='text-xl font-semibold text-slate-950'>Transaction History</h2>
                            <p className='mt-1 text-sm text-slate-500'>View and download your Digital Billboard subscription invoices.</p>
                        </div>

                        <div className='mt-2 text-sm text-slate-500 sm:mt-0'>
                            {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
                        </div>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className='px-6 py-14 text-center'>
                        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
                            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.7' className='h-6 w-6' aria-hidden='true'>
                                <path d='M6 3h12v18l-3-2-3 2-3-2-3 2V3Z' />
                                <path d='M9 8h6M9 12h6' />
                            </svg>
                        </div>

                        <h3 className='mt-4 font-semibold text-slate-900'>No transactions yet</h3>
                        <p className='mt-1 text-sm text-slate-500'>Subscription transactions will appear here after payment is processed.</p>
                    </div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full min-w-[820px] border-collapse'>
                            <thead>
                                <tr className='bg-slate-50/80'>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500 sm:px-6'>
                                        Date
                                    </th>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500'>
                                        Amount
                                    </th>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500'>
                                        Currency
                                    </th>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500'>
                                        Status
                                    </th>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500 sm:px-6'>
                                        Invoice
                                    </th>
                                </tr>
                            </thead>

                            <tbody className='divide-y divide-slate-100'>
                                {transactions.map((transaction) => {
                                    const isPaid = transaction.paid || transaction.status.toLowerCase() === 'paid';
                                    const displayAmount = isPaid ? transaction.amountPaid : transaction.amountDue;

                                    return (
                                        <tr key={transaction.id} className='bg-white transition hover:bg-slate-50/60'>
                                            <td className='whitespace-nowrap px-5 py-4 text-sm text-slate-700 sm:px-6'>
                                                {formatDateTime(transaction.transactionDate)}
                                            </td>

                                            <td className='whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950'>
                                                {formatStripeAmount(displayAmount, transaction.currency)}
                                            </td>

                                            <td className='px-5 py-4 text-sm font-medium uppercase text-slate-600'>{transaction.currency || '—'}</td>

                                            <td className='px-5 py-4'>
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        isPaid
                                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                                                    }`}
                                                >
                                                    {capitalize(transaction.status)}
                                                </span>
                                            </td>

                                            <td className='px-5 py-4 sm:px-6'>
                                                <div className='flex items-center justify-end gap-2'>
                                                    {transaction.hostedInvoiceUrl ? (
                                                        <a
                                                            href={transaction.hostedInvoiceUrl}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 no-underline transition hover:border-indigo-300 hover:bg-indigo-100'
                                                        >
                                                            View Invoice
                                                        </a>
                                                    ) : (
                                                        <span className='rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-400'>View unavailable</span>
                                                    )}

                                                    {transaction.invoicePdf ? (
                                                        <a
                                                            href={transaction.invoicePdf}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5147df] px-3 py-2 text-xs font-semibold text-white no-underline shadow-sm transition hover:bg-[#4338ca]'
                                                        >
                                                            <svg
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                stroke='currentColor'
                                                                strokeWidth='2'
                                                                className='h-3.5 w-3.5'
                                                                aria-hidden='true'
                                                            >
                                                                <path d='M12 3v12' />
                                                                <path d='m7 10 5 5 5-5' />
                                                                <path d='M5 21h14' />
                                                            </svg>
                                                            Download
                                                        </a>
                                                    ) : (
                                                        <span className='rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-400'>PDF unavailable</span>
                                                    )}
                                                </div>
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
}
