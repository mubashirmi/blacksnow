import type { NextPage } from 'next';

import { AlertCircle, CheckCircle2, CreditCard, DollarSign, RefreshCw, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ReferralEarningsData = {
    user?: {
        authId?: number | null;
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        lightningTiers?: string[] | null;
        stripeConnected?: boolean | null;
    } | null;
    currency?: string | null;
    timezone?: string | null;
    currentMonth?: {
        startDate?: string | null;
        endDate?: string | null;
    } | null;
    availableBalance?: number | null;
    withdrawnThisMonth?: number | null;
    totalWithdrawn?: number | null;
    totalEarned?: number | null;
};

type ReferralEarningsResponse = {
    success?: boolean;
    data?: ReferralEarningsData | null;
    message?: string;
    error?: string;
};

type LightningSubscription = {
    id?: number | string | null;
    product?: string | null;
    amount?: number | null;
    period?: string | null;
    paid?: boolean | null;
    paused?: boolean | null;
    canceled?: boolean | null;
    startDate?: string | null;
    storedNextBillingDate?: string | null;
    stripeCheckoutSessionId?: string | null;
    stripeSubscriptionId?: string | null;
    stripeStatus?: string | null;
    cancelAtPeriodEnd?: boolean | null;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
};

type SubscriptionTransaction = {
    id?: string | null;
    subscriptionId?: string | null;
    paymentIntentId?: string | null;
    status?: string | null;
    paid?: boolean | null;
    amountDue?: number | null;
    amountPaid?: number | null;
    amountRemaining?: number | null;
    currency?: string | null;
    transactionDate?: string | null;
    hostedInvoiceUrl?: string | null;
    invoicePdf?: string | null;
};

type LightningSubscriptionData = {
    user?: {
        authId?: number | null;
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    } | null;
    subscription?: LightningSubscription | null;
    transactions?: SubscriptionTransaction[] | null;
    nextBillingDate?: string | null;
};

type LightningSubscriptionResponse = {
    success?: boolean;
    data?: LightningSubscriptionData | null;
    message?: string;
    error?: string;
};

const safeNumber = (value: number | null | undefined, fallback = 0): number => {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const formatCurrency = (amount: number | null | undefined, currency = 'USD'): string => {
    const numericAmount = safeNumber(amount);

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: (currency || 'USD').toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    } catch {
        return `$${numericAmount.toFixed(2)}`;
    }
};

const formatMinorCurrency = (amountMinor: number | null | undefined, currency = 'USD'): string => {
    return formatCurrency(safeNumber(amountMinor) / 100, currency);
};

const formatDate = (value: string | null | undefined, timezone?: string | null): string => {
    if (!value) return '—';

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
        }).format(date);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    try {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: timezone || undefined,
        }).format(date);
    } catch {
        return date.toLocaleDateString();
    }
};

const formatDateTime = (value: string | null | undefined, timezone?: string | null): string => {
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
            timeZone: timezone || undefined,
            timeZoneName: timezone ? 'short' : undefined,
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
};

const humanize = (value: string | null | undefined): string => {
    if (!value) return '—';

    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatProductName = (value: string | null | undefined): string => {
    if (!value) return 'Lightning Affiliate';

    if (value === 'LightningGold') return 'Lightning Gold';
    if (value === 'LightningSilver') return 'Lightning Silver';

    return humanize(value);
};

const getStatusClasses = (status: string | null | undefined): string => {
    const normalized = (status || '').toLowerCase();

    if (normalized === 'paid' || normalized === 'active' || normalized === 'succeeded') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    }

    if (normalized === 'failed' || normalized === 'canceled' || normalized === 'cancelled') {
        return 'bg-red-50 text-red-700 ring-red-200';
    }

    if (normalized === 'pending' || normalized === 'processing' || normalized === 'requires_action') {
        return 'bg-amber-50 text-amber-700 ring-amber-200';
    }

    return 'bg-slate-100 text-slate-700 ring-slate-200';
};

const LightningSilverBillingPage: NextPage = () => {
    const [earnings, setEarnings] = useState<ReferralEarningsData | null>(null);

    const [subscriptionData, setSubscriptionData] = useState<LightningSubscriptionData | null>(null);

    const [earningsError, setEarningsError] = useState<string | null>(null);

    const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const fetchApi = useCallback(
        async <
            T extends {
                success?: boolean;
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

            if (!response.ok) {
                throw new Error(body?.error || body?.message || 'The request could not be completed.');
            }

            if (!body?.success) {
                throw new Error(body?.error || body?.message || 'The server returned an unsuccessful response.');
            }

            return body;
        },
        []
    );

    const loadData = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const userId = window.localStorage.getItem('userId');

        if (!userId) {
            setEarnings(null);
            setSubscriptionData(null);

            setEarningsError('User information was not found. Please sign in again.');

            setSubscriptionError('User information was not found. Please sign in again.');

            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setEarningsError(null);
        setSubscriptionError(null);

        const encodedUserId = encodeURIComponent(userId);

        const [earningsResult, subscriptionResult] = await Promise.allSettled([
            fetchApi<ReferralEarningsResponse>(`/api/v5/lightning/silver/referral-earnings?authId=${encodedUserId}`),
            fetchApi<LightningSubscriptionResponse>(`/api/v5/lightning/silver/subscription?authId=${encodedUserId}`),
        ]);

        if (earningsResult.status === 'fulfilled') {
            if (earningsResult.value.data) {
                setEarnings(earningsResult.value.data);
            } else {
                setEarnings(null);
                setEarningsError('Referral earnings information is unavailable.');
            }
        } else {
            setEarnings(null);
            setEarningsError(earningsResult.reason instanceof Error ? earningsResult.reason.message : 'Failed to load referral earnings.');
        }

        if (subscriptionResult.status === 'fulfilled') {
            if (subscriptionResult.value.data) {
                setSubscriptionData(subscriptionResult.value.data);
            } else {
                setSubscriptionData(null);
                setSubscriptionError('Subscription billing information is unavailable.');
            }
        } else {
            setSubscriptionData(null);
            setSubscriptionError(subscriptionResult.reason instanceof Error ? subscriptionResult.reason.message : 'Failed to load subscription billing.');
        }

        setIsLoading(false);
    }, [fetchApi]);

    useEffect(() => {
        // eslint-disable-next-line
        void loadData();
    }, [loadData]);

    const subscription = subscriptionData?.subscription ?? null;

    const transactions = useMemo(() => {
        const source = Array.isArray(subscriptionData?.transactions) ? [...subscriptionData.transactions] : [];

        return source.sort((first, second) => {
            const firstTime = new Date(first.transactionDate || '').getTime();

            const secondTime = new Date(second.transactionDate || '').getTime();

            return (Number.isFinite(secondTime) ? secondTime : 0) - (Number.isFinite(firstTime) ? firstTime : 0);
        });
    }, [subscriptionData?.transactions]);

    const currency = earnings?.currency || transactions.find((transaction) => transaction.currency)?.currency || 'USD';

    const availableBalance = safeNumber(earnings?.availableBalance);

    const withdrawnThisMonth = safeNumber(earnings?.withdrawnThisMonth);

    const totalWithdrawn = safeNumber(earnings?.totalWithdrawn);

    const totalEarned = safeNumber(earnings?.totalEarned);

    const productName = formatProductName(subscription?.product);

    const nextBillingDate = subscriptionData?.nextBillingDate || subscription?.currentPeriodEnd || subscription?.storedNextBillingDate || null;

    const subscriptionStatus = useMemo(() => {
        if (!subscription) {
            return {
                label: 'Unavailable',
                classes: 'bg-slate-100 text-slate-700 ring-slate-200',
            };
        }

        if (subscription.canceled) {
            return {
                label: 'Canceled',
                classes: 'bg-red-50 text-red-700 ring-red-200',
            };
        }

        if (subscription.paused) {
            return {
                label: 'Paused',
                classes: 'bg-amber-50 text-amber-700 ring-amber-200',
            };
        }

        if (subscription.cancelAtPeriodEnd) {
            return {
                label: 'Cancels at period end',
                classes: 'bg-amber-50 text-amber-700 ring-amber-200',
            };
        }

        if (subscription.paid && subscription.stripeStatus?.toLowerCase() === 'active') {
            return {
                label: 'Active',
                classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
            };
        }

        return {
            label: humanize(subscription.stripeStatus) || 'Inactive',
            classes: 'bg-slate-100 text-slate-700 ring-slate-200',
        };
    }, [subscription]);

    if (isLoading && !earnings && !subscriptionData) {
        return (
            <div className='mx-auto w-full max-w-7xl'>
                <div className='animate-pulse space-y-6'>
                    <div className='h-[560px] rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]' />
                    <div className='h-52 rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]' />
                    <div className='h-64 rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]' />
                </div>
            </div>
        );
    }

    return (
        <div className='mx-auto w-full max-w-7xl'>
            {/* Affiliate balance */}
            <section className='overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_65px_rgba(15,23,42,0.10)]'>
                <div className='lg:grid lg:grid-cols-[1fr_1.03fr]'>
                    {/* Left */}
                    <div className='relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8f8ff_48%,#efedff_100%)] px-6 py-7 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r'>
                        <div
                            aria-hidden='true'
                            className='pointer-events-none absolute -right-20 top-12 h-72 w-72 rotate-45 rounded-[60px] bg-[linear-gradient(135deg,rgba(99,102,241,0.03),rgba(79,70,229,0.18))]'
                        />

                        <div className='relative z-10'>
                            <div className='flex flex-wrap items-center gap-5'>
                                <div className='text-[44px] font-extrabold tracking-[-3px] text-[#635bff] sm:text-[52px]'>stripe</div>

                                <span
                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
                                        earnings?.user?.stripeConnected
                                            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700'
                                            : 'border-amber-200 bg-amber-50/80 text-amber-700'
                                    }`}
                                >
                                    {earnings?.user?.stripeConnected ? 'Connected' : 'Not Connected'}

                                    {earnings?.user?.stripeConnected && (
                                        <span className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[12px] text-white'>✓</span>
                                    )}
                                </span>
                            </div>

                            <p className='mt-2 text-[16px] text-slate-600 sm:text-[18px]'>Secure payments powered by Stripe</p>

                            <div className='relative mx-auto mt-10 h-[255px] w-full max-w-[350px] rounded-[28px] border border-[#4cc7e8]/35 bg-[#090d12] sm:h-[310px] sm:max-w-[470px] lg:aspect-[530/335] lg:h-auto lg:max-w-[530px]'>
                                {/* Center the logo against the entire card, not the space below the chip. */}
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <div className='relative h-[72%] w-[82%] sm:h-[76%] sm:w-[84%]'>
                                        <Image
                                            src='/logocolored.png'
                                            alt='Black Snow Holdings logo'
                                            fill
                                            priority
                                            sizes='(max-width: 640px) 350px, 500px'
                                            className='object-contain'
                                        />
                                    </div>
                                </div>

                                {/* Gold EMV-style card chip with etched metallic contacts. */}
                                <div className='pointer-events-none absolute left-6 top-7 z-10 sm:left-9 sm:top-9'>
                                    <svg
                                        className='h-[42px] w-[56px] sm:h-[48px] sm:w-[64px]'
                                        viewBox='0 0 64 48'
                                        role='img'
                                        aria-label='Gold payment card chip'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <defs>
                                            <linearGradient id='pricing-gold-chip' x1='0%' y1='0%' x2='100%' y2='100%'>
                                                <stop offset='0%' stopColor='#FFF1BB' />
                                                <stop offset='34%' stopColor='#E8C46E' />
                                                <stop offset='70%' stopColor='#C99742' />
                                                <stop offset='100%' stopColor='#F6D88B' />
                                            </linearGradient>
                                        </defs>
                                        <rect x='1' y='1' width='62' height='46' rx='8' fill='url(#pricing-gold-chip)' stroke='#FFE1A0' strokeWidth='1.2' />
                                        <g fill='none' stroke='#9C7137' strokeWidth='1.5' strokeLinejoin='round' opacity='0.88'>
                                            <path d='M1 15 H18 M1 33 H18 M46 15 H63 M46 33 H63' />
                                            <path d='M18 1 V15 M46 1 V15 M18 33 V47 M46 33 V47' />
                                            <path d='M32 1 V14 M32 34 V47 M1 24 H18 M46 24 H63' />
                                            <rect x='18' y='14' width='28' height='20' rx='5' />
                                        </g>
                                        <rect x='21.5' y='17.5' width='21' height='13' rx='3.5' fill='none' stroke='#FFF1BA' strokeWidth='0.9' opacity='0.75' />
                                    </svg>
                                </div>
                            </div>

                            <div className='mt-9 grid grid-cols-3 divide-x divide-slate-200'>
                                <div className='px-2 text-center sm:px-5'>
                                    <div className='mx-auto flex h-11 w-11 items-center justify-center text-[#5147df]'>
                                        <ShieldCheck className='h-9 w-9' strokeWidth={1.7} />
                                    </div>

                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Secure
                                        <br />
                                        Payments
                                    </div>
                                </div>

                                <div className='px-2 text-center sm:px-5'>
                                    <div className='mx-auto flex h-11 w-11 items-center justify-center text-[#5147df]'>
                                        <DollarSign className='h-9 w-9' strokeWidth={1.7} />
                                    </div>

                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Referral
                                        <br />
                                        Earnings
                                    </div>
                                </div>

                                <div className='px-2 text-center sm:px-5'>
                                    <div className='mx-auto flex h-11 w-11 items-center justify-center text-[#5147df]'>
                                        <CheckCircle2 className='h-9 w-9' strokeWidth={1.7} />
                                    </div>

                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Stripe
                                        <br />
                                        Connected
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div className='bg-white'>
                        <div className='flex items-center gap-4 border-b border-slate-200 px-6 py-7 sm:px-10 sm:py-8'>
                            <div className='relative flex h-[62px] w-[62px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50 shadow-sm'>
                                <Image src='/logocolored.png' alt='BlackSnow' width={46} height={46} className='h-[46px] w-[46px] object-contain' />
                            </div>

                            <div className='min-w-0'>
                                <h1 className='text-[24px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[28px]'>Affiliate Balance</h1>

                                <p className='mt-1 text-sm text-slate-500 sm:text-[16px]'>Your referral earnings at a glance</p>
                            </div>
                        </div>

                        {earningsError && !earnings ? (
                            <div className='px-6 py-10 sm:px-10'>
                                <div className='rounded-2xl border border-red-200 bg-red-50 px-5 py-4'>
                                    <p className='font-semibold text-red-900'>Unable to load referral earnings</p>

                                    <p className='mt-1 text-sm text-red-700'>{earningsError}</p>

                                    <button
                                        type='button'
                                        // eslint-disable-next-line
                                        onClick={() => void loadData()}
                                        className='mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700'
                                    >
                                        <RefreshCw className='h-4 w-4' />
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className='px-6 py-8 sm:px-10 sm:py-10'>
                                <div className='flex items-start justify-between gap-5'>
                                    <div>
                                        <p className='text-[17px] font-medium text-slate-500 sm:text-[18px]'>Available Balance</p>

                                        <div className='mt-3 text-[38px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[48px]'>
                                            {formatCurrency(availableBalance, currency)}
                                        </div>

                                        <div className='mt-2 text-sm font-medium uppercase tracking-[0.08em] text-slate-500'>{currency}</div>
                                    </div>

                                    <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5e50ed,#4c3dd8)] text-[26px] font-medium text-white shadow-[0_10px_25px_rgba(79,70,229,0.24)]'>
                                        $
                                    </div>
                                </div>

                                <div className='my-8 border-t border-slate-200' />

                                <div className='space-y-5'>
                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Withdrawn This Month</span>

                                        <span className='text-sm font-semibold text-slate-950 sm:text-[16px]'>
                                            {formatCurrency(withdrawnThisMonth, currency)}
                                        </span>
                                    </div>

                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Total Withdrawn</span>

                                        <span className='text-sm font-semibold text-slate-950 sm:text-[16px]'>{formatCurrency(totalWithdrawn, currency)}</span>
                                    </div>

                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Total Earned</span>

                                        <span className='text-sm font-semibold text-slate-950 sm:text-[16px]'>{formatCurrency(totalEarned, currency)}</span>
                                    </div>
                                </div>

                                <div className='mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4'>
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                        <span className='text-sm font-medium text-slate-600'>Current earnings period</span>

                                        <span className='text-sm font-semibold text-slate-900'>
                                            {formatDate(earnings?.currentMonth?.startDate)} – {formatDate(earnings?.currentMonth?.endDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center gap-2 border-t border-slate-200 bg-slate-50/70 px-6 py-4 text-center text-[12px] text-slate-500 sm:flex-row sm:gap-3 sm:text-[13px]'>
                    <span className='inline-flex items-center gap-2'>
                        <ShieldCheck className='h-4 w-4' />
                        Affiliate payments are securely processed through Stripe
                    </span>

                    <span className='hidden text-slate-300 sm:inline'>|</span>

                    <span>{productName}</span>
                </div>
            </section>

            {/* Subscription summary */}
            <section className='mt-6 rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.07)] sm:p-6'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700'>
                            <CreditCard className='h-5 w-5' />
                        </div>

                        <div>
                            <h2 className='text-lg font-semibold text-slate-950'>{productName} Subscription</h2>

                            <p className='mt-1 text-sm text-slate-500'>Tool subscription and upcoming billing information.</p>
                        </div>
                    </div>

                    <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${subscriptionStatus.classes}`}>
                        {subscriptionStatus.label}
                    </span>
                </div>

                {subscriptionError && !subscriptionData ? (
                    <div className='mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4'>
                        <div className='flex items-start gap-3'>
                            <AlertCircle className='mt-0.5 h-5 w-5 shrink-0 text-red-600' />

                            <div>
                                <p className='font-semibold text-red-900'>Unable to load subscription billing</p>

                                <p className='mt-1 text-sm text-red-700'>{subscriptionError}</p>
                            </div>
                        </div>
                    </div>
                ) : subscription ? (
                    <div className='mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4'>
                        <div>
                            <div className='text-xs text-slate-500'>Subscription Amount</div>

                            <div className='mt-1 text-base font-semibold text-slate-900'>{formatMinorCurrency(subscription.amount, currency)}</div>
                        </div>

                        <div>
                            <div className='text-xs text-slate-500'>Billing Period</div>

                            <div className='mt-1 text-sm font-semibold text-slate-900'>{humanize(subscription.period)}</div>
                        </div>

                        <div>
                            <div className='text-xs text-slate-500'>Subscription Started</div>

                            <div className='mt-1 text-sm font-semibold text-slate-900'>{formatDate(subscription.startDate, earnings?.timezone)}</div>
                        </div>

                        <div>
                            <div className='text-xs text-slate-500'>Next Billing</div>

                            <div className='mt-1 text-sm font-semibold text-slate-900'>{formatDate(nextBillingDate, earnings?.timezone)}</div>
                        </div>
                    </div>
                ) : (
                    <div className='mt-5 text-sm text-slate-500'>No active subscription information is available.</div>
                )}
            </section>

            {/* Tool subscription transactions only */}
            <section className='mt-6 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]'>
                <div className='border-b border-slate-200 px-5 py-5 sm:px-6'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <h2 className='text-xl font-semibold text-slate-950'>Subscription Transactions</h2>

                            <p className='mt-1 text-sm text-slate-500'>{productName} tool subscription payment history.</p>
                        </div>

                        <div className='text-sm text-slate-500'>
                            {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
                        </div>
                    </div>
                </div>

                {subscriptionError && !subscriptionData ? (
                    <div className='px-6 py-10'>
                        <div className='rounded-2xl border border-red-200 bg-red-50 px-5 py-4'>
                            <div className='flex items-start gap-3'>
                                <AlertCircle className='mt-0.5 h-5 w-5 shrink-0 text-red-600' />

                                <div>
                                    <p className='font-semibold text-red-900'>Unable to load subscription transactions</p>

                                    <p className='mt-1 text-sm text-red-700'>{subscriptionError}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className='px-6 py-14 text-center'>
                        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
                            <CreditCard className='h-6 w-6' />
                        </div>

                        <h3 className='mt-4 font-semibold text-slate-900'>No subscription transactions yet</h3>

                        <p className='mt-1 text-sm text-slate-500'>Tool subscription charges will appear here when available.</p>
                    </div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full min-w-[900px] border-collapse'>
                            <thead>
                                <tr className='bg-slate-50/80'>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500 sm:px-6'>
                                        Type
                                    </th>

                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500'>
                                        Date
                                    </th>

                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500'>
                                        Amount
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
                                {transactions.map((transaction, index) => {
                                    const transactionCurrency = transaction.currency || currency;

                                    const amount = safeNumber(transaction.amountPaid) > 0 ? transaction.amountPaid : transaction.amountDue;

                                    const status = transaction.status || (transaction.paid ? 'paid' : 'unknown');

                                    return (
                                        <tr
                                            key={transaction.id || `${transaction.transactionDate}-${index}`}
                                            className='bg-white transition hover:bg-slate-50/60'
                                        >
                                            <td className='px-5 py-4 sm:px-6'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700'>
                                                        <CreditCard className='h-4 w-4' />
                                                    </div>

                                                    <div>
                                                        <div className='text-sm font-semibold text-slate-900'>Tool Subscription</div>

                                                        <div className='mt-0.5 text-xs text-slate-500'>{productName}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className='whitespace-nowrap px-5 py-4 text-sm text-slate-600'>
                                                {formatDateTime(transaction.transactionDate, earnings?.timezone)}
                                            </td>

                                            <td className='whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950'>
                                                {formatMinorCurrency(amount, transactionCurrency)}
                                            </td>

                                            <td className='px-5 py-4'>
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                                                        status
                                                    )}`}
                                                >
                                                    {humanize(status)}
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
                                                            className='inline-flex items-center justify-center rounded-lg bg-[#5147df] px-3 py-2 text-xs font-semibold text-white no-underline shadow-sm transition hover:bg-[#4338ca]'
                                                        >
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
};

export default LightningSilverBillingPage;
