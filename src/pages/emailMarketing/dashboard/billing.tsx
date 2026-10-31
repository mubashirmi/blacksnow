import type { NextPage } from 'next';

import { PricingBillingCard } from '@/components/billing/PricingBillingCard';
import { AlertCircle, CalendarDays, CheckCircle2, CreditCard, DollarSign, Mail, RefreshCw, ShieldCheck, WalletCards } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

const OVERAGE_RATE = 0.005;
const FALLBACK_INCLUDED_EMAIL_QUOTA = 50_000;

type Money = {
    amount?: number | null;
    amountMinor?: number | null;
    currency?: string | null;
};

type EmailUsageData = {
    user?: {
        id?: number | string | null;
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    } | null;
    billingMonth?: string | null;
    timezone?: string | null;
    includedEmailQuota?: number | null;
    availableEmailQuota?: number | null;
    emailsSentWithinQuota?: number | null;
    emailsSentAfterQuota?: number | null;
    totalEmailsSentThisMonth?: number | null;
    totalMoneySpentOnEmailOverages?: Money | null;
    successfulOverageChargeCount?: number | null;
};

type EmailUsageResponse = {
    success?: boolean;
    data?: EmailUsageData | null;
    message?: string;
    error?: string;
};

type BillingTransaction = {
    id?: number | string | null;
    type?: string | null;
    product?: string | null;
    description?: string | null;
    user?: {
        id?: number | string | null;
        email?: string | null;
    } | null;
    billingDate?: string | null;
    billingMonth?: string | null;
    amount?: Money | null;
    status?: string | null;
    chargedAt?: string | null;
    createdAt?: string | null;
    stripePaymentIntentId?: string | null;
    failure?: {
        code?: string | null;
        message?: string | null;
    } | null;
};

type EmailSubscription = {
    id?: number | string | null;
    product?: string | null;
    amount?: number | null;
    period?: string | null;
    paid?: boolean | null;
    pause?: boolean | null;
    cancelSubscripton?: boolean | null;
    startDate?: string | null;
    nextBillingDate?: string | null;
    transactionId?: string | null;
};

type EmailBillingData = {
    transactionCount?: number | null;
    successfulTransactionCount?: number | null;
    totalAmountCharged?: Money | null;
    transactions?: BillingTransaction[] | null;
    pagination?: {
        page?: number | null;
        limit?: number | null;
        totalPages?: number | null;
    } | null;
    nextBillingDate?: string | null;
    subscription?: EmailSubscription | null;
};

type EmailBillingResponse = {
    success?: boolean;
    data?: EmailBillingData | null;
    message?: string;
    error?: string;
};

const safeNumber = (value: number | null | undefined, fallback = 0): number => {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const formatNumber = (value: number | null | undefined): string => {
    return new Intl.NumberFormat('en-US').format(safeNumber(value));
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

const formatOptionalCurrency = (amount: number | null | undefined, currency = 'USD'): string => {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) return '—';
    return formatCurrency(amount, currency);
};

const humanize = (value: string | null | undefined): string => {
    if (!value) return '—';

    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatBillingMonth = (billingMonth: string | null | undefined): string => {
    if (!billingMonth || !/^\d{4}-\d{2}$/.test(billingMonth)) {
        return 'Current billing month';
    }

    const [year, month] = billingMonth.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, 1));

    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
};

const getMonthRange = (billingMonth: string | null | undefined): string => {
    if (!billingMonth || !/^\d{4}-\d{2}$/.test(billingMonth)) {
        return 'Current billing cycle';
    }

    const [year, month] = billingMonth.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });

    return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
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

const getStatusClasses = (status: string | null | undefined): string => {
    const normalized = (status || '').toUpperCase();

    if (normalized === 'SUCCEEDED' || normalized === 'PAID' || normalized === 'ACTIVE') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    }

    if (normalized === 'FAILED' || normalized === 'CANCELED' || normalized === 'CANCELLED') {
        return 'bg-red-50 text-red-700 ring-red-200';
    }

    if (normalized === 'REQUIRES_ACTION' || normalized === 'PENDING' || normalized === 'PROCESSING') {
        return 'bg-amber-50 text-amber-700 ring-amber-200';
    }

    return 'bg-slate-100 text-slate-700 ring-slate-200';
};

const getTransactionType = (transaction: BillingTransaction): string => {
    const explicitType = transaction.type?.trim() || transaction.product?.trim() || transaction.description?.trim();

    if (!explicitType) {
        return 'Email Overage Charge';
    }

    const normalized = explicitType.toLowerCase();

    if (normalized.includes('subscription') || normalized.includes('emailmarketing') || normalized.includes('email marketing')) {
        return 'Email Marketing Subscription';
    }

    return humanize(explicitType);
};

const EmailMarketingBillingPage: NextPage = () => {
    const [usage, setUsage] = useState<EmailUsageData | null>(null);
    const [billing, setBilling] = useState<EmailBillingData | null>(null);
    const [usageError, setUsageError] = useState<string | null>(null);
    const [billingError, setBillingError] = useState<string | null>(null);
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
            setUsage(null);
            setBilling(null);
            setUsageError('User information was not found. Please sign in again.');
            setBillingError('User information was not found. Please sign in again.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setUsageError(null);
        setBillingError(null);

        const encodedUserId = encodeURIComponent(userId);

        const [usageResult, billingResult] = await Promise.allSettled([
            fetchApi<EmailUsageResponse>(`/api/v5/email-crm/usage?authId=${encodedUserId}`),
            fetchApi<EmailBillingResponse>(`/api/v5/email-crm/billing?authId=${encodedUserId}`),
        ]);

        if (usageResult.status === 'fulfilled') {
            if (usageResult.value.data) {
                setUsage(usageResult.value.data);
            } else {
                setUsage(null);
                setUsageError('Email usage information is unavailable.');
            }
        } else {
            setUsage(null);
            setUsageError(usageResult.reason instanceof Error ? usageResult.reason.message : 'Failed to load email usage.');
        }

        if (billingResult.status === 'fulfilled') {
            if (billingResult.value.data) {
                setBilling(billingResult.value.data);
            } else {
                setBilling(null);
                setBillingError('Billing information is unavailable.');
            }
        } else {
            setBilling(null);
            setBillingError(billingResult.reason instanceof Error ? billingResult.reason.message : 'Failed to load billing history.');
        }

        setIsLoading(false);
    }, [fetchApi]);

    useEffect(() => {
        // eslint-disable-next-line
        void loadData();
    }, [loadData]);

    const includedQuota = Math.max(0, safeNumber(usage?.includedEmailQuota, FALLBACK_INCLUDED_EMAIL_QUOTA));

    const totalEmailsSent = Math.max(0, safeNumber(usage?.totalEmailsSentThisMonth));
    const withinQuota = Math.max(0, safeNumber(usage?.emailsSentWithinQuota));
    const overQuota = Math.max(0, safeNumber(usage?.emailsSentAfterQuota));

    const remainingQuota = Math.max(0, safeNumber(usage?.availableEmailQuota, Math.max(includedQuota - withinQuota, 0)));

    const usagePercentage = includedQuota > 0 ? (totalEmailsSent / includedQuota) * 100 : 0;
    const progressPercentage = Math.min(Math.max(usagePercentage, 0), 100);

    // Prefer the amount actually reported by the API, even if it is zero.
    // Only estimate overage cost when the API omits the charge amount.
    const apiOverageCost = usage?.totalMoneySpentOnEmailOverages?.amount;
    const overageCost = typeof apiOverageCost === 'number' && Number.isFinite(apiOverageCost) ? apiOverageCost : overQuota * OVERAGE_RATE;

    const currency = usage?.totalMoneySpentOnEmailOverages?.currency || billing?.totalAmountCharged?.currency || 'USD';

    const transactions = useMemo(() => {
        const source = Array.isArray(billing?.transactions) ? [...billing.transactions] : [];

        return source.sort((first, second) => {
            const firstDate = first.chargedAt || first.createdAt || first.billingDate || '';
            const secondDate = second.chargedAt || second.createdAt || second.billingDate || '';

            const firstTime = new Date(firstDate).getTime();
            const secondTime = new Date(secondDate).getTime();

            return (Number.isFinite(secondTime) ? secondTime : 0) - (Number.isFinite(firstTime) ? firstTime : 0);
        });
    }, [billing?.transactions]);

    const subscription = billing?.subscription ?? null;

    const nextBillingDate = billing?.nextBillingDate || subscription?.nextBillingDate || null;

    const subscriptionStatus = useMemo(() => {
        if (!subscription) {
            return {
                label: 'Unavailable',
                classes: 'bg-slate-100 text-slate-700 ring-slate-200',
            };
        }

        if (subscription.cancelSubscripton) {
            return {
                label: 'Canceled',
                classes: 'bg-red-50 text-red-700 ring-red-200',
            };
        }

        if (subscription.pause) {
            return {
                label: 'Paused',
                classes: 'bg-amber-50 text-amber-700 ring-amber-200',
            };
        }

        if (subscription.paid) {
            return {
                label: 'Active',
                classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
            };
        }

        return {
            label: 'Inactive',
            classes: 'bg-slate-100 text-slate-700 ring-slate-200',
        };
    }, [subscription]);

    if (isLoading && !usage && !billing) {
        return (
            <div className='mx-auto w-full max-w-7xl'>
                <div className='animate-pulse space-y-6'>
                    <div className='h-[520px] rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]' />
                    <div className='h-[620px] rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]' />
                    <div className='h-64 rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]' />
                </div>
            </div>
        );
    }

    return (
        <div className='mx-auto w-full max-w-7xl'>
            {/* =========================================================
                FIRST SECTION - SAME STRIPE STYLE CARD AS OTHER BILLING PAGES
               ========================================================= */}
            <section className='overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_65px_rgba(15,23,42,0.10)]'>
                <div className='lg:grid lg:grid-cols-[1fr_1.03fr]'>
                    {/* Left */}
                    <div className='relative overflow-hidden border-b border-slate-200 bg-slate-50 px-6 py-7 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r'>
                        <div className='relative z-10'>
                            <div className='flex flex-wrap items-center gap-5'>
                                <div className='text-[44px] font-extrabold tracking-[-3px] text-[#635bff] sm:text-[52px]'>stripe</div>

                                <span className='inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm'>
                                    Connected
                                    <span className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[12px] text-white'>✓</span>
                                </span>
                            </div>

                            <p className='mt-2 text-[16px] text-slate-600 sm:text-[18px]'>Secure payments powered by Stripe</p>

                            <PricingBillingCard />

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
                                        <Mail className='h-9 w-9' strokeWidth={1.7} />
                                    </div>
                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Email
                                        <br />
                                        Usage
                                    </div>
                                </div>

                                <div className='px-2 text-center sm:px-5'>
                                    <div className='mx-auto flex h-11 w-11 items-center justify-center text-[#5147df]'>
                                        <DollarSign className='h-9 w-9' strokeWidth={1.7} />
                                    </div>
                                    <div className='mt-2 text-[13px] font-medium leading-5 text-slate-800 sm:text-[16px]'>
                                        Usage
                                        <br />
                                        Billing
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
                                <h1 className='text-[24px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[28px]'>Email Marketing</h1>

                                <p className='mt-1 text-sm text-slate-500 sm:text-[16px]'>Monthly usage at a glance</p>
                            </div>
                        </div>

                        {usageError && !usage ? (
                            <div className='px-6 py-10 sm:px-10'>
                                <div className='rounded-2xl border border-red-200 bg-red-50 px-5 py-4'>
                                    <p className='font-semibold text-red-900'>Unable to load email usage</p>
                                    <p className='mt-1 text-sm text-red-700'>{usageError}</p>
                                </div>
                            </div>
                        ) : (
                            <div className='px-6 py-8 sm:px-10 sm:py-10'>
                                <div className='flex items-start justify-between gap-5'>
                                    <div>
                                        <p className='text-[17px] font-medium text-slate-500 sm:text-[18px]'>Emails Sent This Month</p>

                                        <div className='mt-3 text-[38px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[48px]'>
                                            {formatNumber(totalEmailsSent)}
                                        </div>

                                        <div className='mt-2 text-sm font-medium text-slate-500'>{formatBillingMonth(usage?.billingMonth)}</div>
                                    </div>

                                    <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5e50ed,#4c3dd8)] text-white shadow-[0_10px_25px_rgba(79,70,229,0.24)]'>
                                        <Mail className='h-7 w-7' />
                                    </div>
                                </div>

                                <div className='my-8 border-t border-slate-200' />

                                <div className='space-y-5'>
                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Included Email Limit</span>
                                        <span className='text-sm font-semibold text-slate-950 sm:text-[16px]'>{formatNumber(includedQuota)}</span>
                                    </div>

                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Remaining Emails</span>
                                        <span className='text-sm font-semibold text-slate-950 sm:text-[16px]'>{formatNumber(remainingQuota)}</span>
                                    </div>

                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Emails Over Limit</span>
                                        <span className='text-sm font-semibold text-slate-950 sm:text-[16px]'>{formatNumber(overQuota)}</span>
                                    </div>

                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Overage Charges</span>
                                        <span className='text-sm font-semibold text-emerald-700 sm:text-[16px]'>{formatCurrency(overageCost, currency)}</span>
                                    </div>

                                    <div className='flex items-center justify-between gap-5'>
                                        <span className='text-sm text-slate-500 sm:text-[15px]'>Overage Rate</span>
                                        <span className='text-sm font-semibold text-slate-950 sm:text-[16px]'>$0.005 / email</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center gap-2 border-t border-slate-200 bg-slate-50/70 px-6 py-4 text-center text-[12px] text-slate-500 sm:flex-row sm:gap-3 sm:text-[13px]'>
                    <span className='inline-flex items-center gap-2'>
                        <ShieldCheck className='h-4 w-4' />
                        Billing is securely processed through Stripe
                    </span>
                    <span className='hidden text-slate-300 sm:inline'>|</span>
                    <span>Email Marketing Billing</span>
                </div>
            </section>

            {/* =========================================================
                SECOND SECTION - ATTACHED EMAIL USAGE DESIGN
               ========================================================= */}
            <section className='mt-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] sm:p-6'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-4'>
                        <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] text-white shadow-[0_10px_24px_rgba(124,58,237,0.28)]'>
                            <Mail className='h-7 w-7' />
                        </div>

                        <div>
                            <h2 className='text-[22px] font-semibold tracking-[-0.02em] text-slate-950'>Email Usage</h2>
                            <p className='mt-1 text-sm text-slate-500'>Track your email usage, limits, and overage charges.</p>
                        </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                        <div className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700'>
                            <CalendarDays className='h-4 w-4 text-slate-500' />
                            {getMonthRange(usage?.billingMonth)}
                        </div>

                        <button
                            type='button'
                            // eslint-disable-next-line
                            onClick={() => void loadData()}
                            disabled={isLoading}
                            className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className='mt-7 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]'>
                    {/* Usage Overview */}
                    <div className='rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'>
                        <h3 className='text-base font-semibold text-slate-950'>Usage Overview</h3>

                        <div className='mt-7 text-center'>
                            <p className='text-sm font-medium text-slate-500'>Included Limit</p>

                            <div className='mt-1 text-[44px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[56px]'>{formatNumber(includedQuota)}</div>

                            <p className='text-sm text-slate-500'>emails / month</p>
                        </div>

                        <div className='mt-7'>
                            <div className='relative h-4 overflow-hidden rounded-full bg-slate-200'>
                                <div
                                    className='absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#6d28d9)] transition-[width] duration-500'
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>

                            <div className='mt-3 flex items-start justify-between gap-4'>
                                <div>
                                    <div className='text-[22px] font-semibold text-violet-700'>{formatNumber(totalEmailsSent)}</div>
                                    <div className='text-xs text-violet-600'>Emails Used</div>
                                </div>

                                <div className='text-right'>
                                    <div className='text-[22px] font-semibold text-slate-600'>{formatNumber(remainingQuota)}</div>
                                    <div className='text-xs text-slate-500'>Emails Remaining</div>
                                </div>
                            </div>
                        </div>

                        <div className='mt-6 grid gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:grid-cols-2'>
                            <div className='flex items-center gap-4 sm:border-r sm:border-emerald-200 sm:pr-5'>
                                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700'>
                                    <DollarSign className='h-5 w-5' />
                                </div>

                                <div>
                                    <div className='text-xs font-medium text-slate-500'>Over Limit</div>
                                    <div className='text-xl font-semibold text-emerald-700'>{formatNumber(overQuota)}</div>
                                    <div className='text-xs text-slate-600'>emails</div>
                                </div>
                            </div>

                            <div className='sm:pl-2'>
                                <div className='text-xs font-medium text-slate-500'>Overage Rate</div>
                                <div className='mt-1 text-xl font-semibold text-emerald-700'>$0.005</div>
                                <div className='text-xs text-slate-600'>per email</div>
                            </div>
                        </div>

                        <div className='mt-5 rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-4'>
                            <div className='flex items-start gap-3'>
                                <div className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white'>
                                    i
                                </div>

                                <div className='text-sm leading-6 text-slate-700'>
                                    You have used <span className='font-semibold text-slate-950'>{usagePercentage.toFixed(1)}%</span> of your included email
                                    limit.
                                    {overQuota > 0 ? (
                                        <>
                                            {' '}
                                            Emails beyond your included quota are billed at{' '}
                                            <span className='font-semibold text-slate-950'>$0.005 per extra email</span>.
                                        </>
                                    ) : (
                                        <> You are charged $0.005 per email only after your included quota is used.</>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary / Plan */}
                    <div className='space-y-5'>
                        <div className='rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'>
                            <h3 className='text-base font-semibold text-slate-950'>Billing Summary</h3>

                            <div className='mt-5 divide-y divide-slate-100'>
                                <div className='flex items-center justify-between gap-4 py-3 first:pt-0'>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700'>
                                            <Mail className='h-4 w-4' />
                                        </div>
                                        <span className='text-sm text-slate-700'>Included Limit</span>
                                    </div>

                                    <span className='text-sm font-semibold text-slate-950'>{formatNumber(includedQuota)} emails</span>
                                </div>

                                <div className='flex items-center justify-between gap-4 py-3'>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700'>
                                            <WalletCards className='h-4 w-4' />
                                        </div>
                                        <span className='text-sm text-slate-700'>Billed Usage</span>
                                    </div>

                                    <span className='text-sm font-semibold text-slate-950'>{formatNumber(overQuota)} emails</span>
                                </div>

                                <div className='flex items-center justify-between gap-4 py-3'>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700'>
                                            <DollarSign className='h-4 w-4' />
                                        </div>
                                        <span className='text-sm text-slate-700'>Overage Charges</span>
                                    </div>

                                    <span className='text-sm font-semibold text-emerald-700'>{formatCurrency(overageCost, currency)}</span>
                                </div>
                            </div>

                            <div className='mt-2 flex items-center justify-between border-t border-slate-200 pt-4'>
                                <div>
                                    <div className='font-semibold text-slate-950'>Total</div>
                                    <div className='mt-1 text-xs text-slate-500'>Overage rate: $0.005 per email</div>
                                </div>

                                <div className='text-lg font-semibold text-slate-950'>{formatCurrency(overageCost, currency)}</div>
                            </div>
                        </div>

                        <div className='rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'>
                            <h3 className='text-base font-semibold text-slate-950'>Plan & Limits</h3>

                            <div className='mt-5 space-y-4'>
                                <div className='flex items-center justify-between gap-4'>
                                    <span className='text-sm text-slate-500'>Plan</span>
                                    <span className='rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700'>Email Marketing</span>
                                </div>

                                <div className='flex items-center justify-between gap-4'>
                                    <span className='text-sm text-slate-500'>Included Limit</span>
                                    <span className='text-sm font-semibold text-slate-900'>{formatNumber(includedQuota)} emails / month</span>
                                </div>

                                <div className='flex items-center justify-between gap-4'>
                                    <span className='text-sm text-slate-500'>Overage Rate</span>
                                    <span className='text-sm font-semibold text-slate-900'>$0.005 per email</span>
                                </div>

                                <div className='flex items-center justify-between gap-4'>
                                    <span className='text-sm text-slate-500'>Billing Month</span>
                                    <span className='text-sm font-semibold text-slate-900'>{formatBillingMonth(usage?.billingMonth)}</span>
                                </div>

                                <div className='flex items-center justify-between gap-4'>
                                    <span className='text-sm text-slate-500'>Successful Overage Charges</span>
                                    <span className='text-sm font-semibold text-slate-900'>{formatNumber(usage?.successfulOverageChargeCount)}</span>
                                </div>

                                <div className='flex items-center justify-between gap-4'>
                                    <span className='text-sm text-slate-500'>Next Subscription Billing</span>
                                    <span className='text-right text-sm font-semibold text-slate-900'>{formatDate(nextBillingDate, usage?.timezone)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {subscription && (
                    <div className='mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'>
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='flex items-center gap-3'>
                                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700'>
                                    <CreditCard className='h-5 w-5' />
                                </div>

                                <div>
                                    <h3 className='font-semibold text-slate-950'>Email Marketing Subscription</h3>
                                    <p className='mt-1 text-sm text-slate-500'>{humanize(subscription.period || 'monthly')} billing plan</p>
                                </div>
                            </div>

                            <span
                                className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${subscriptionStatus.classes}`}
                            >
                                {subscriptionStatus.label}
                            </span>
                        </div>

                        <div className='mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3'>
                            <div>
                                <div className='text-xs text-slate-500'>Subscription Amount</div>
                                <div className='mt-1 text-base font-semibold text-slate-900'>{formatOptionalCurrency(subscription.amount, currency)}</div>
                            </div>

                            <div>
                                <div className='text-xs text-slate-500'>Started</div>
                                <div className='mt-1 text-sm font-semibold text-slate-900'>{formatDate(subscription.startDate, usage?.timezone)}</div>
                            </div>

                            <div>
                                <div className='text-xs text-slate-500'>Next Billing</div>
                                <div className='mt-1 text-sm font-semibold text-slate-900'>{formatDate(nextBillingDate, usage?.timezone)}</div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Transactions */}
            <section className='mt-6 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]'>
                <div className='border-b border-slate-200 px-5 py-5 sm:px-6'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <h2 className='text-xl font-semibold text-slate-950'>Billing Transactions</h2>
                            <p className='mt-1 text-sm text-slate-500'>Email overage charges and Email Marketing subscription transactions.</p>
                        </div>

                        <div className='flex flex-wrap items-center gap-3 text-sm'>
                            <span className='text-slate-500'>{safeNumber(billing?.transactionCount, transactions.length)} transactions</span>

                            <span className='hidden h-4 w-px bg-slate-200 sm:block' />

                            <span className='font-semibold text-slate-900'>
                                {formatCurrency(billing?.totalAmountCharged?.amount, billing?.totalAmountCharged?.currency || currency)} charged
                            </span>
                        </div>
                    </div>
                </div>

                {billingError && !billing ? (
                    <div className='px-6 py-10'>
                        <div className='rounded-2xl border border-red-200 bg-red-50 px-5 py-4'>
                            <div className='flex items-start gap-3'>
                                <AlertCircle className='mt-0.5 h-5 w-5 shrink-0 text-red-600' />
                                <div>
                                    <div className='font-semibold text-red-900'>Unable to load billing history</div>
                                    <p className='mt-1 text-sm text-red-700'>{billingError}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className='px-6 py-14 text-center'>
                        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
                            <CreditCard className='h-6 w-6' />
                        </div>

                        <h3 className='mt-4 font-semibold text-slate-900'>No billing transactions yet</h3>

                        <p className='mt-1 text-sm text-slate-500'>Overage and subscription charges will appear here when available.</p>
                    </div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full min-w-[980px] border-collapse'>
                            <thead>
                                <tr className='bg-slate-50/80'>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500 sm:px-6'>
                                        Type
                                    </th>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500'>
                                        Billing Date
                                    </th>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500'>
                                        Amount
                                    </th>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500'>
                                        Status
                                    </th>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500'>
                                        Charged At
                                    </th>
                                    <th className='border-b border-slate-200 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-slate-500 sm:px-6'>
                                        Details
                                    </th>
                                </tr>
                            </thead>

                            <tbody className='divide-y divide-slate-100'>
                                {transactions.map((transaction, index) => {
                                    const status = transaction.status || 'UNKNOWN';
                                    const transactionType = getTransactionType(transaction);

                                    const isSubscription = transactionType.toLowerCase().includes('subscription');

                                    const failureMessage = transaction.failure?.message?.trim();

                                    return (
                                        <tr key={transaction.id ?? `${transaction.billingDate}-${index}`} className='bg-white transition hover:bg-slate-50/60'>
                                            <td className='px-5 py-4 sm:px-6'>
                                                <div className='flex items-center gap-3'>
                                                    <div
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                            isSubscription ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'
                                                        }`}
                                                    >
                                                        {isSubscription ? <CreditCard className='h-4 w-4' /> : <DollarSign className='h-4 w-4' />}
                                                    </div>

                                                    <span className='text-sm font-semibold text-slate-900'>{transactionType}</span>
                                                </div>
                                            </td>

                                            <td className='whitespace-nowrap px-5 py-4 text-sm text-slate-600'>
                                                {formatDate(transaction.billingDate, usage?.timezone)}
                                            </td>

                                            <td className='whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950'>
                                                {formatOptionalCurrency(transaction.amount?.amount, transaction.amount?.currency || currency)}
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

                                            <td className='whitespace-nowrap px-5 py-4 text-sm text-slate-600'>
                                                {formatDateTime(transaction.chargedAt || transaction.createdAt, usage?.timezone)}
                                            </td>

                                            <td className='px-5 py-4 sm:px-6'>
                                                {failureMessage ? (
                                                    <div className='max-w-[300px]'>
                                                        <div className='text-sm font-medium text-red-700'>{failureMessage}</div>

                                                        {transaction.failure?.code && (
                                                            <div className='mt-0.5 text-xs text-slate-500'>{humanize(transaction.failure.code)}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className='flex items-center gap-2 text-sm text-slate-600'>
                                                        <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                                                        No issues reported
                                                    </div>
                                                )}
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

export default EmailMarketingBillingPage;
