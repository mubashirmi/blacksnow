import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    CreditCard,
    Download,
    FileText,
    LayoutDashboard,
    Mail,
    Receipt,
    RefreshCw,
    Search,
    ShieldCheck,
    Users,
    Wallet,
} from 'lucide-react';
import type { NextPage } from 'next';
import type { ChangeEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Read-only, Next.js Pages Router admin billing dashboard.
 * Mount this component inside your existing authenticated ADMIN layout.
 * IMPORTANT: API endpoints themselves must enforce admin authorization.
 *
 * Performance strategy:
 * - Only 3 simultaneous network requests across the 9 heavy endpoints.
 * - Independent loading/success/error states; slow endpoints never block other data.
 * - 75-second per-request ceiling (29-second responses are supported).
 * - Tab-prioritized queue, no automatic retry storm, manual per-source retry.
 * - Short-lived in-memory cache to prevent duplicate requests on navigation.
 * - Only 15/20 rows render at a time, even if the APIs return thousands.
 */

type ApiKey =
    | 'emailUsage'
    | 'goldSubscription'
    | 'goldReferral'
    | 'emailBilling'
    | 'invoiceBilling'
    | 'invoiceEarnings'
    | 'silverSubscription'
    | 'silverReferral'
    | 'billboardSubscription';

type Tab = 'overview' | 'transactions' | 'subscriptions' | 'affiliate' | 'email' | 'invoices' | 'sources';
type Phase = 'queued' | 'loading' | 'success' | 'error';

type UserRef = {
    id?: number | null;
    authId?: number | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    stripeConnected?: boolean | null;
};
type Money = { amount?: number | null; amountMinor?: number | null; currency?: string | null };
type TierEmailUsage = {
    billingMonth?: string | null;
    timezone?: string | null;
    emailsSentThisMonth?: number | null;
    includedEmails?: number | null;
    billableEmails?: number | null;
    pricePerEmail?: Money | null;
    emailCharges?: Money | null;
};
type Subscription = {
    id?: number | string | null;
    product?: string | null;
    amount?: number | null;
    period?: string | null;
    paid?: boolean | null;
    paused?: boolean | null;
    pause?: boolean | null;
    canceled?: boolean | null;
    cancelSubscripton?: boolean | null; // spelling in Email CRM / invoice API
    stripeStatus?: string | null;
    cancelAtPeriodEnd?: boolean | null;
    startDate?: string | null;
    nextBillingDate?: string | null;
    storedNextBillingDate?: string | null;
    currentPeriodEnd?: string | null;
};
type StripeTransaction = {
    id?: string | number | null;
    transactionDate?: string | null;
    status?: string | null;
    paid?: boolean | null;
    amountDue?: number | null; // minor units / cents
    amountPaid?: number | null; // minor units / cents
    currency?: string | null;
    hostedInvoiceUrl?: string | null;
    invoicePdf?: string | null;
};
type SubscriptionRecord = {
    user?: UserRef | null;
    subscription?: Subscription | null;
    transactions?: StripeTransaction[] | null;
    nextBillingDate?: string | null;
    emailUsage?: TierEmailUsage | null;
};
type AffiliateRecord = {
    user?: UserRef | null;
    currency?: string | null;
    availableBalance?: number | null; // dollars
    withdrawnThisMonth?: number | null;
    totalWithdrawn?: number | null;
    totalEarned?: number | null;
    emailUsage?: TierEmailUsage | null;
};
type EmailUsageRecord = {
    user?: UserRef | null;
    billingMonth?: string | null;
    includedEmailQuota?: number | null;
    availableEmailQuota?: number | null;
    emailsSentWithinQuota?: number | null;
    emailsSentAfterQuota?: number | null;
    totalEmailsSentThisMonth?: number | null;
    totalMoneySpentOnEmailOverages?: Money | null;
    successfulOverageChargeCount?: number | null;
};
type EmailBillingTransaction = {
    id?: string | number | null;
    transactionDate?: string | null;
    createdAt?: string | null;
    status?: string | null;
    paid?: boolean | null;
    amountPaid?: number | null; // if supplied, Stripe minor units
    totalAmountCharged?: Money | null;
    currency?: string | null;
    invoicePdf?: string | null;
    hostedInvoiceUrl?: string | null;
};
type EmailBillingRecord = {
    transactionCount?: number | null;
    successfulTransactionCount?: number | null;
    totalAmountCharged?: Money | null; // dollars (API supplies amount)
    transactions?: EmailBillingTransaction[] | null;
    pagination?: { page?: number | null; limit?: number | null; totalPages?: number | null } | null;
    nextBillingDate?: string | null;
    subscription?: Subscription | null;
    // The provided API does NOT include a user/account field; do not infer one by index.
};
type InvoiceTransaction = {
    id?: string | number | null;
    type?: string | null;
    amount?: number | null; // cents
    currency?: string | null;
    status?: string | null;
    transactionDate?: string | null;
    refunded?: boolean | null;
    refundedAmount?: number | null; // cents
    stripeInvoiceId?: string | null;
    reference?: { product?: string | null } | null;
};
type InvoiceRefund = {
    id?: string | number | null;
    type?: string | null;
    amount?: number | null; // cents
    currency?: string | null;
    status?: string | null;
    refundDate?: string | null;
    stripeRefundId?: string | null;
};
type InvoiceBillingRecord = {
    user?: UserRef | null;
    transactions?: InvoiceTransaction[] | null;
    refunds?: InvoiceRefund[] | null;
    nextSubscriptionBillingDate?: string | null;
    activeSubscription?: Subscription | null;
};
type InvoiceEarningsRecord = {
    user?: UserRef | null;
    totalEarnedThisMonth?: Money | null;
    totalInvoiceEarnedThisMonth?: Money | null;
    totalSubscriptionInvEarnedThisMonth?: Money | null;
    successfullyWithdrawnThisMonth?: Money | null;
    totalWithdrawn?: Money | null;
    totalEarned?: Money | null;
    totalInvoiceEarned?: Money | null;
    totalSubscriptionInvEarned?: Money | null;
};
type Entry = {
    phase: Phase;
    data: unknown[] | null;
    error: string | null;
    updatedAt: number | null;
};
type FeedState = Record<ApiKey, Entry>;
type Runtime = {
    cancelled: boolean;
    active: number;
    queue: ApiKey[];
    controllers: Map<ApiKey, AbortController>;
};
type LedgerRow = {
    key: string;
    source: string;
    account: string;
    id: string;
    type: string;
    date: string | null;
    status: string;
    amount: number | null; // dollars, never incorrectly display ambiguous raw amounts
    currency: string;
    refund: boolean;
    invoiceUrl?: string | null;
    invoicePdf?: string | null;
};
type SubscriptionRow = {
    key: string;
    source: string;
    account: string;
    id: string;
    plan: string;
    amount: number | null; // plan-price API field is dollars, unlike invoice transaction fields
    period: string;
    status: string;
    nextBilling: string | null;
};

type FeedInfo = { key: ApiKey; label: string; endpoint: string; tab: Tab };
const FEEDS: FeedInfo[] = [
    { key: 'emailUsage', label: 'Email CRM Usage', endpoint: '/api/v5/admin/email-crm/usage', tab: 'email' },
    { key: 'silverSubscription', label: 'Lightning Silver Subscriptions', endpoint: '/api/v5/admin/lightning/silver/subscription', tab: 'subscriptions' },
    { key: 'goldSubscription', label: 'Lightning Gold Subscriptions', endpoint: '/api/v5/admin/lightning/gold/subscription', tab: 'subscriptions' },
    { key: 'billboardSubscription', label: 'Digital Billboard Subscriptions', endpoint: '/api/v5/admin/digital-billboard/subscription', tab: 'subscriptions' },
    { key: 'invoiceBilling', label: 'Business Invoice Billing', endpoint: '/api/v5/admin/business-invoice/user/billing', tab: 'invoices' },
    { key: 'emailBilling', label: 'Email CRM Billing', endpoint: '/api/v5/admin/email-crm/billing', tab: 'email' },
    { key: 'silverReferral', label: 'Lightning Silver Earnings', endpoint: '/api/v5/admin/lightning/silver/referral-earnings', tab: 'affiliate' },
    { key: 'goldReferral', label: 'Lightning Gold Earnings', endpoint: '/api/v5/admin/lightning/gold/referral-earnings', tab: 'affiliate' },
    { key: 'invoiceEarnings', label: 'Business Invoice Earnings', endpoint: '/api/v5/admin/business-invoice/user/earnings', tab: 'invoices' },
];
const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'affiliate', label: 'Affiliate Earnings' },
    { id: 'email', label: 'Email CRM Lite' },
    { id: 'invoices', label: 'Business Invoices' },
    { id: 'sources', label: 'API Health' },
];
const CONCURRENCY = 3;
const FETCH_TIMEOUT_MS = 75000;
const CACHE_TTL_MS = 2 * 60 * 1000;
// Cache is module-local: avoids unnecessary refetch on component remount, not persistent storage.
const feedCache = new Map<ApiKey, { data: unknown[]; updatedAt: number }>();

const blankEntry = (): Entry => ({ phase: 'queued', data: null, error: null, updatedAt: null });
const blankFeeds = (): FeedState => Object.fromEntries(FEEDS.map((x) => [x.key, blankEntry()])) as FeedState;
const n = (value: number | null | undefined): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
const money = (amount: number | null | undefined, currency = 'USD') => {
    if (amount == null || !Number.isFinite(amount)) return '—';
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
const integer = (value: number | null | undefined) => new Intl.NumberFormat('en-US').format(n(value));
const accountOf = (user: UserRef | null | undefined): string => {
    const email = user?.email?.trim();
    if (email) return email;
    const id = user?.authId ?? user?.id;
    return id != null ? `Account #${id}` : 'Unidentified account';
};
const dateLabel = (iso?: string | null) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
};
const dateTimeLabel = (iso?: string | null) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC', timeZoneName: 'short' }).format(date);
};
const isPaid = (status: string | null | undefined) => ['paid', 'succeeded', 'success', 'complete', 'completed'].includes((status || '').toLowerCase());
const labelStatus = (subscription: Subscription | null | undefined) => {
    if (!subscription) return 'No subscription';
    if (subscription.canceled || subscription.cancelSubscripton) return 'Canceled';
    if (subscription.paused || subscription.pause) return 'Paused';
    if (subscription.cancelAtPeriodEnd) return 'Ends at period end';
    if (subscription.stripeStatus?.toLowerCase() === 'active') return 'Active';
    if (subscription.stripeStatus) return subscription.stripeStatus;
    return subscription.paid ? 'Paid (API flag)' : 'Unpaid';
};
const statusClasses = (status: string) => {
    const s = status.toLowerCase();
    if (['paid', 'succeeded', 'active'].includes(s)) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    if (s.includes('cancel') || s.includes('fail') || s.includes('refund')) return 'bg-rose-50 text-rose-700 ring-rose-200';
    if (s.includes('pending') || s.includes('pause') || s.includes('due') || s.includes('unpaid')) return 'bg-amber-50 text-amber-700 ring-amber-200';
    return 'bg-slate-100 text-slate-700 ring-slate-200';
};
const uniqueLedger = (rows: LedgerRow[]) => {
    const seen = new Set<string>();
    return rows
        .filter((row) => {
            if (seen.has(row.key)) return false;
            seen.add(row.key);
            return true;
        })
        .sort((a, b) => (Date.parse(b.date || '') || 0) - (Date.parse(a.date || '') || 0));
};
const safeLink = (url?: string | null) => {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' ? parsed.href : null;
    } catch {
        return null;
    }
};
const moneyAmount = (value?: Money | null) => (value?.amount != null ? n(value.amount) : value?.amountMinor != null ? n(value.amountMinor) / 100 : 0);

async function readEndpoint(feed: FeedInfo, signal: AbortSignal): Promise<unknown[]> {
    const response = await fetch(feed.endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}${response.status === 401 || response.status === 403 ? ': Admin access required' : ''}`);
    const body: unknown = await response.json();
    if (
        !body ||
        typeof body !== 'object' ||
        !('success' in body) ||
        (body as { success: unknown }).success !== true ||
        !('data' in body) ||
        !Array.isArray((body as { data: unknown }).data)
    ) {
        throw new Error('Unexpected API response. Expected { success: true, data: [] }.');
    }
    return (body as { data: unknown[] }).data;
}

function useAdminFeeds(activeTab: Tab) {
    const [feeds, setFeeds] = useState<FeedState>(blankFeeds);
    const runtimeRef = useRef<Runtime | null>(null);
    const mounted = useRef(false);

    const pump = useCallback(function startNext(runtime: Runtime) {
        while (!runtime.cancelled && runtime.active < CONCURRENCY && runtime.queue.length > 0) {
            const key = runtime.queue.shift()!;
            const descriptor = FEEDS.find((x) => x.key === key)!;
            const controller = new AbortController();
            runtime.controllers.set(key, controller);
            runtime.active++;
            if (mounted.current && runtimeRef.current === runtime) {
                setFeeds((prior) => ({ ...prior, [key]: { ...prior[key], phase: 'loading', error: null } }));
            }
            const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
            // eslint-disable-next-line
            void readEndpoint(descriptor, controller.signal)
                .then((data) => {
                    if (runtime.cancelled || runtimeRef.current !== runtime) return;
                    const updatedAt = Date.now();
                    feedCache.set(key, { data, updatedAt });
                    setFeeds((prior) => ({ ...prior, [key]: { phase: 'success', data, error: null, updatedAt } }));
                })
                .catch((error: unknown) => {
                    if (runtime.cancelled || runtimeRef.current !== runtime) return;
                    const message = controller.signal.aborted
                        ? 'Request exceeded 75 seconds. Retry this feed when ready.'
                        : error instanceof Error
                        ? error.message
                        : 'Unable to retrieve data.';
                    // Keep last successful data visible as stale data if a reload fails.
                    setFeeds((prior) => ({ ...prior, [key]: { ...prior[key], phase: 'error', error: message } }));
                })
                .finally(() => {
                    clearTimeout(timeout);
                    runtime.controllers.delete(key);
                    runtime.active--;
                    if (!runtime.cancelled && runtimeRef.current === runtime) startNext(runtime);
                });
        }
    }, []);

    const reloadAll = useCallback(
        (force = false) => {
            const previous = runtimeRef.current;
            if (previous) {
                previous.cancelled = true;
                previous.controllers.forEach((controller) => controller.abort());
            }
            const now = Date.now();
            const next = blankFeeds();
            const runtime: Runtime = { cancelled: false, active: 0, queue: [], controllers: new Map() };
            for (const feed of FEEDS) {
                const cached = feedCache.get(feed.key);
                if (!force && cached && now - cached.updatedAt < CACHE_TTL_MS) {
                    next[feed.key] = { phase: 'success', data: cached.data, error: null, updatedAt: cached.updatedAt };
                } else {
                    // Explicit refresh retains available data while fresh data is loading.
                    next[feed.key] = { phase: 'queued', data: cached?.data || null, error: null, updatedAt: cached?.updatedAt || null };
                    runtime.queue.push(feed.key);
                }
            }
            runtimeRef.current = runtime;
            setFeeds(next);
            pump(runtime);
        },
        [pump]
    );

    const retry = useCallback(
        (key: ApiKey) => {
            const runtime = runtimeRef.current;
            if (!runtime || runtime.cancelled) return;
            if (runtime.queue.includes(key) || runtime.controllers.has(key)) return;
            feedCache.delete(key);
            runtime.queue.unshift(key);
            setFeeds((prior) => ({ ...prior, [key]: { ...prior[key], phase: 'queued', error: null } }));
            pump(runtime);
        },
        [pump]
    );

    useEffect(() => {
        mounted.current = true;
        reloadAll(false);
        return () => {
            mounted.current = false;
            const runtime = runtimeRef.current;
            if (runtime) {
                runtime.cancelled = true;
                runtime.controllers.forEach((controller) => controller.abort());
            }
            runtimeRef.current = null;
        };
    }, [reloadAll]);

    useEffect(() => {
        const runtime = runtimeRef.current;
        if (!runtime || activeTab === 'overview' || activeTab === 'sources') return;
        const needed =
            activeTab === 'transactions'
                ? ['invoiceBilling', 'silverSubscription', 'goldSubscription', 'billboardSubscription', 'emailBilling']
                : FEEDS.filter((feed) => feed.tab === activeTab).map((feed) => feed.key);
        runtime.queue.sort((a, b) => Number(needed.includes(b)) - Number(needed.includes(a)));
        pump(runtime);
    }, [activeTab, pump]);

    return { feeds, reloadAll, retry };
}

const asRows = <T,>(entry: Entry): T[] => (Array.isArray(entry.data) ? (entry.data as T[]) : []);

function Pill({ label }: { label: string }) {
    return (
        <span className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusClasses(label)}`}>
            {label}
        </span>
    );
}
function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail?: string; icon: typeof Wallet }) {
    return (
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between gap-2'>
                <p className='text-[13px] font-medium text-slate-500'>{label}</p>
                <span className='rounded-xl bg-slate-100 p-2 text-slate-700'>
                    <Icon className='h-4 w-4' />
                </span>
            </div>
            <div className='mt-3 break-words text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[30px]'>{value}</div>
            {detail && <p className='mt-1 text-xs leading-5 text-slate-500'>{detail}</p>}
        </div>
    );
}
function SectionTitle({ title, note, trailing }: { title: string; note?: string; trailing?: ReactNode }) {
    return (
        <div className='flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6'>
            <div>
                <h2 className='text-base font-semibold text-slate-900 sm:text-lg'>{title}</h2>
                {note && <p className='mt-1 text-sm text-slate-500'>{note}</p>}
            </div>
            {trailing}
        </div>
    );
}
function PageControls({ page, pages, onPage, total, perPage }: { page: number; pages: number; onPage: (p: number) => void; total: number; perPage: number }) {
    if (!total) return null;
    return (
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:px-6'>
            <span>
                Showing {integer((page - 1) * perPage + 1)}–{integer(Math.min(total, page * perPage))} of {integer(total)}
            </span>
            <div className='flex items-center gap-2'>
                <button
                    type='button'
                    onClick={() => onPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className='rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30'
                    aria-label='Previous page'
                >
                    <ChevronLeft className='h-4 w-4' />
                </button>
                <span className='px-2 font-medium text-slate-700'>
                    {page} / {pages}
                </span>
                <button
                    type='button'
                    onClick={() => onPage(Math.min(pages, page + 1))}
                    disabled={page >= pages}
                    className='rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30'
                    aria-label='Next page'
                >
                    <ChevronRight className='h-4 w-4' />
                </button>
            </div>
        </div>
    );
}
function Empty({ text = 'No records were returned by the loaded APIs.' }: { text?: string }) {
    return <div className='px-6 py-14 text-center text-sm text-slate-500'>{text}</div>;
}
const th = 'whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const td = 'whitespace-nowrap px-5 py-3.5 text-sm text-slate-700';

function exportCsv(filename: string, columns: string[], rows: (string | number | null | undefined)[][]) {
    const encode = (input: string | number | null | undefined) => {
        const str = String(input ?? '');
        if (typeof input === 'number' && Number.isFinite(input)) return `"${input}"`;
        // CSV formula-injection prevention for spreadsheet applications.
        const safe = /^[\s]*[=+@\-\t\r]/.test(str) ? `'${str}` : str;
        return `"${safe.replace(/"/g, '""')}"`;
    };
    const csv = [columns, ...rows].map((row) => row.map(encode).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

const AdminBillingDashboard: NextPage = () => {
    const [tab, setTab] = useState<Tab>('overview');
    const { feeds, reloadAll, retry } = useAdminFeeds(tab);
    const [search, setSearch] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [subscriptionPage, setSubscriptionPage] = useState(1);
    const [affiliatePage, setAffiliatePage] = useState(1);
    const [emailPage, setEmailPage] = useState(1);
    const [emailBillingPage, setEmailBillingPage] = useState(1);
    const [businessPage, setBusinessPage] = useState(1);
    // eslint-disable-next-line
    const silverSubs = useMemo(() => asRows<SubscriptionRecord>(feeds.silverSubscription), [feeds.silverSubscription.data]);
    // eslint-disable-next-line
    const goldSubs = useMemo(() => asRows<SubscriptionRecord>(feeds.goldSubscription), [feeds.goldSubscription.data]);
    // eslint-disable-next-line
    const billboardSubs = useMemo(() => asRows<SubscriptionRecord>(feeds.billboardSubscription), [feeds.billboardSubscription.data]);
    // eslint-disable-next-line
    const silverAffiliates = useMemo(() => asRows<AffiliateRecord>(feeds.silverReferral), [feeds.silverReferral.data]);
    // eslint-disable-next-line
    const goldAffiliates = useMemo(() => asRows<AffiliateRecord>(feeds.goldReferral), [feeds.goldReferral.data]);
    // eslint-disable-next-line
    const crmUsage = useMemo(() => asRows<EmailUsageRecord>(feeds.emailUsage), [feeds.emailUsage.data]);
    // eslint-disable-next-line
    const crmBilling = useMemo(() => asRows<EmailBillingRecord>(feeds.emailBilling), [feeds.emailBilling.data]);
    // eslint-disable-next-line
    const invoiceBilling = useMemo(() => asRows<InvoiceBillingRecord>(feeds.invoiceBilling), [feeds.invoiceBilling.data]);
    // eslint-disable-next-line
    const invoiceEarnings = useMemo(() => asRows<InvoiceEarningsRecord>(feeds.invoiceEarnings), [feeds.invoiceEarnings.data]);

    const subscriptions = useMemo<SubscriptionRow[]>(() => {
        const result: SubscriptionRow[] = [];
        const push = (rows: SubscriptionRecord[], source: string) =>
            rows.forEach((record, index) => {
                const sub = record.subscription;
                if (!sub) return;
                result.push({
                    key: `${source}-${record.user?.authId ?? index}-${sub.id ?? index}`,
                    source,
                    account: accountOf(record.user),
                    id: String(sub.id ?? '—'),
                    plan: sub.product || source,
                    amount: sub.amount ?? null,
                    period: sub.period || '—',
                    status: labelStatus(sub),
                    nextBilling: record.nextBillingDate || sub.currentPeriodEnd || sub.storedNextBillingDate || sub.nextBillingDate || null,
                });
            });
        push(silverSubs, 'Lightning Silver');
        push(goldSubs, 'Lightning Gold');
        push(billboardSubs, 'Digital Billboard');
        crmBilling.forEach((record, index) => {
            const sub = record.subscription;
            if (!sub) return;
            result.push({
                key: `crm-${sub.id ?? index}`,
                source: 'Email CRM Lite',
                account: 'Not provided by API',
                id: String(sub.id ?? '—'),
                plan: 'Email CRM Lite',
                amount: sub.amount ?? null,
                period: sub.period || '—',
                status: labelStatus(sub),
                nextBilling: record.nextBillingDate || sub.nextBillingDate || null,
            });
        });
        invoiceBilling.forEach((record, index) => {
            const sub = record.activeSubscription;
            if (!sub) return;
            result.push({
                key: `invoice-${record.user?.authId ?? index}-${sub.id ?? index}`,
                source: 'Business Invoice',
                account: accountOf(record.user),
                id: String(sub.id ?? '—'),
                plan: sub.product || 'InvoiceTool',
                amount: sub.amount ?? null,
                period: sub.period || '—',
                status: labelStatus(sub),
                nextBilling: record.nextSubscriptionBillingDate || sub.nextBillingDate || null,
            });
        });
        return result;
    }, [silverSubs, goldSubs, billboardSubs, crmBilling, invoiceBilling]);

    const transactions = useMemo<LedgerRow[]>(() => {
        const result: LedgerRow[] = [];
        const addSubscriptionTx = (rows: SubscriptionRecord[], source: string) =>
            rows.forEach((record, index) =>
                (record.transactions || []).forEach((tx, idx) => {
                    const status = tx.status || (tx.paid ? 'paid' : 'unknown');
                    result.push({
                        key: `${source}-${record.user?.authId ?? index}-${tx.id ?? idx}`,
                        source,
                        account: accountOf(record.user),
                        id: String(tx.id ?? '—'),
                        type: 'Subscription payment',
                        date: tx.transactionDate || null,
                        status,
                        amount:
                            (tx.amountPaid ?? tx.amountDue) == null
                                ? null
                                : n(isPaid(status) ? tx.amountPaid ?? tx.amountDue : tx.amountDue ?? tx.amountPaid) / 100,
                        currency: tx.currency || 'USD',
                        refund: false,
                        invoiceUrl: tx.hostedInvoiceUrl,
                        invoicePdf: tx.invoicePdf,
                    });
                })
            );
        addSubscriptionTx(silverSubs, 'Lightning Silver');
        addSubscriptionTx(goldSubs, 'Lightning Gold');
        addSubscriptionTx(billboardSubs, 'Digital Billboard');
        invoiceBilling.forEach((record, index) => {
            const account = accountOf(record.user);
            (record.transactions || []).forEach((tx, idx) => {
                result.push({
                    key: `invoice-payment-${record.user?.authId ?? index}-${tx.id ?? idx}`,
                    source: 'Business Invoice',
                    account,
                    id: String(tx.id ?? '—'),
                    type: tx.type || 'Invoice payment',
                    date: tx.transactionDate || null,
                    status: tx.status || 'unknown',
                    amount: tx.amount == null ? null : n(tx.amount) / 100,
                    currency: tx.currency || 'USD',
                    refund: false,
                });
            });
            (record.refunds || []).forEach((refund, idx) => {
                result.push({
                    key: `invoice-refund-${record.user?.authId ?? index}-${refund.stripeRefundId ?? refund.id ?? idx}`,
                    source: 'Business Invoice',
                    account,
                    id: String(refund.stripeRefundId || refund.id || '—'),
                    type: `${refund.type || 'Invoice'} refund`,
                    date: refund.refundDate || null,
                    status: refund.status || 'refunded',
                    amount: refund.amount == null ? null : -n(refund.amount) / 100,
                    currency: refund.currency || 'USD',
                    refund: true,
                });
            });
        });
        crmBilling.forEach((record, index) =>
            (record.transactions || []).forEach((tx, idx) => {
                // No owner provided. Do not associate records to /email-crm/usage by array order.
                // No assumption about an ambiguous `amount` property: only known amountPaid (minor) or Money.amount (major).
                const amount = tx.totalAmountCharged?.amount != null ? n(tx.totalAmountCharged.amount) : tx.amountPaid != null ? n(tx.amountPaid) / 100 : null;
                result.push({
                    key: `email-${index}-${tx.id ?? idx}`,
                    source: 'Email CRM Lite',
                    account: 'Not provided by API',
                    id: String(tx.id ?? '—'),
                    type: 'Email billing',
                    date: tx.transactionDate || tx.createdAt || null,
                    status: tx.status || (tx.paid ? 'paid' : 'unknown'),
                    amount,
                    currency: tx.totalAmountCharged?.currency || tx.currency || 'USD',
                    refund: false,
                    invoiceUrl: tx.hostedInvoiceUrl,
                    invoicePdf: tx.invoicePdf,
                });
            })
        );
        return uniqueLedger(result);
    }, [silverSubs, goldSubs, billboardSubs, invoiceBilling, crmBilling]);

    const affiliateRows = useMemo(
        () => [
            ...silverAffiliates.map((r, i) => ({ ...r, label: 'Lightning Silver', key: `s-${r.user?.authId ?? i}` })),
            ...goldAffiliates.map((r, i) => ({ ...r, label: 'Lightning Gold', key: `g-${r.user?.authId ?? i}` })),
        ],
        [silverAffiliates, goldAffiliates]
    );

    const sourcesDone = FEEDS.filter((f) => feeds[f.key].phase === 'success').length;
    const sourcesErrors = FEEDS.filter((f) => feeds[f.key].phase === 'error').length;
    const sourcesRemaining = FEEDS.filter((f) => feeds[f.key].phase === 'queued' || feeds[f.key].phase === 'loading').length;
    const metrics = useMemo(() => {
        const grossPayments = transactions
            .filter((row) => !row.refund && isPaid(row.status) && row.amount != null)
            .reduce((sum, row) => sum + n(row.amount), 0);
        const refunds = transactions
            .filter((row) => row.refund && row.amount != null && isPaid(row.status))
            .reduce((sum, row) => sum + Math.abs(n(row.amount)), 0);
        const totalEmails = crmUsage.reduce((sum, row) => sum + n(row.totalEmailsSentThisMonth), 0);
        const overageEmails = crmUsage.reduce((sum, row) => sum + n(row.emailsSentAfterQuota), 0);
        const emailOverageCharges = crmUsage.reduce((sum, row) => sum + moneyAmount(row.totalMoneySpentOnEmailOverages), 0);
        const crmRecordedCharges = crmBilling.reduce((sum, row) => sum + moneyAmount(row.totalAmountCharged), 0);
        const silverEarned = silverAffiliates.reduce((sum, row) => sum + n(row.totalEarned), 0);
        const goldEarned = goldAffiliates.reduce((sum, row) => sum + n(row.totalEarned), 0);
        const invoiceUserEarned = invoiceEarnings.reduce((sum, row) => sum + moneyAmount(row.totalEarned), 0);
        return {
            grossPayments,
            refunds,
            totalEmails,
            overageEmails,
            emailOverageCharges,
            crmRecordedCharges,
            silverEarned,
            goldEarned,
            invoiceUserEarned,
            paidCount: transactions.filter((row) => !row.refund && isPaid(row.status)).length,
        };
    }, [transactions, crmUsage, crmBilling, silverAffiliates, goldAffiliates, invoiceEarnings]);

    const filteredTransactions = useMemo(
        () =>
            transactions.filter((row) => {
                const q = search.trim().toLowerCase();
                return (
                    (sourceFilter === 'all' || row.source === sourceFilter) &&
                    (statusFilter === 'all' ||
                        (statusFilter === 'paid'
                            ? isPaid(row.status) && !row.refund
                            : statusFilter === 'refund'
                            ? row.refund
                            : !isPaid(row.status) && !row.refund)) &&
                    (!q || [row.account, row.id, row.source, row.type, row.status].some((value) => value.toLowerCase().includes(q)))
                );
            }),
        [transactions, search, sourceFilter, statusFilter]
    );
    const filterOptions = useMemo(() => Array.from(new Set(transactions.map((t) => t.source))), [transactions]);
    const pageSize = 20;
    const pages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
    const selectedPage = Math.min(page, pages);
    const visibleTransactions = filteredTransactions.slice((selectedPage - 1) * pageSize, selectedPage * pageSize);
    const subPages = Math.max(1, Math.ceil(subscriptions.length / 15));
    const affPages = Math.max(1, Math.ceil(affiliateRows.length / 15));
    const emailPages = Math.max(1, Math.ceil(crmUsage.length / 15));
    const emailBillingPages = Math.max(1, Math.ceil(crmBilling.length / 15));
    const businessPages = Math.max(1, Math.ceil(invoiceEarnings.length / 15));
    useEffect(() => {
        setPage(1);
    }, [search, sourceFilter, statusFilter]);
    const noLoaded = sourcesDone === 0 && sourcesErrors === 0;

    return (
        <div className='mx-auto w-full max-w-[1500px] space-y-6 pb-12 font-sans text-slate-900'>
            <header className='rounded-[24px] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-7'>
                <div className='flex flex-col justify-between gap-5 lg:flex-row lg:items-center'>
                    <div className='flex min-w-0 items-start gap-4'>
                        <span className='mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#27374D] text-white'>
                            <LayoutDashboard className='h-6 w-6' />
                        </span>
                        <div>
                            <div className='flex flex-wrap items-center gap-2'>
                                <h1 className='text-2xl font-bold tracking-tight sm:text-[30px]'>Admin Billing Dashboard</h1>
                                <span className='rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600'>
                                    Read-only
                                </span>
                            </div>
                            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
                                Unified billing, subscription payments, refunds, affiliate earnings and Email CRM Lite usage across nine admin feeds.
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-wrap items-center gap-3'>
                        <div className='flex items-center gap-2 text-xs text-slate-500'>
                            <ShieldCheck className='h-4 w-4 text-slate-600' />
                            Admin reporting only
                        </div>
                        <button
                            type='button'
                            onClick={() => reloadAll(true)}
                            disabled={sourcesRemaining > 0}
                            className='inline-flex items-center gap-2 rounded-xl bg-[#27374D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#384e69] disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <RefreshCw className={`h-4 w-4 ${sourcesRemaining ? 'animate-spin' : ''}`} />
                            Refresh all
                        </button>
                    </div>
                </div>
                <div className='mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                    <p className='text-xs font-medium text-slate-600'>
                        {sourcesDone} of 9 feeds loaded{sourcesRemaining ? ` · ${sourcesRemaining} in progress` : ''}
                        {sourcesErrors ? ` · ${sourcesErrors} failed` : ''}
                    </p>
                    <p className='text-xs text-slate-500'>Heavy requests run at most 3 at a time. Sections update as data arrives.</p>
                </div>
                <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100'>
                    <div
                        className='h-full rounded-full bg-[#526D82] transition-[width] duration-500'
                        style={{ width: `${(sourcesDone / FEEDS.length) * 100}%` }}
                    />
                </div>
                {sourcesErrors > 0 && (
                    <div className='mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
                        <AlertCircle className='h-4 w-4 shrink-0' />
                        {sourcesErrors} source{sourcesErrors > 1 ? 's' : ''} failed. Other datasets remain available. Open API Health to retry individually.
                    </div>
                )}
            </header>

            <nav className='flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm' aria-label='Billing dashboard sections'>
                {TABS.map((item) => (
                    <button
                        key={item.id}
                        type='button'
                        onClick={() => setTab(item.id)}
                        className={`shrink-0 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition ${
                            tab === item.id ? 'bg-[#27374D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            {tab === 'overview' && (
                <>
                    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                        <Metric
                            icon={CreditCard}
                            label='Gross paid transactions'
                            value={sourcesDone ? money(metrics.grossPayments) : '—'}
                            detail='Sum of returned paid transaction rows; all-time / API scope'
                        />
                        <Metric
                            icon={ArrowDownRight}
                            label='Completed invoice refunds'
                            value={feeds.invoiceBilling.data ? money(metrics.refunds) : '—'}
                            detail='Separate refund records from Business Invoice API'
                        />
                        <Metric
                            icon={Mail}
                            label='Email CRM emails sent'
                            value={feeds.emailUsage.data ? integer(metrics.totalEmails) : '—'}
                            detail='Current billing month · from Email CRM usage only'
                        />
                        <Metric
                            icon={Receipt}
                            label='Email CRM overage charges'
                            value={feeds.emailUsage.data ? money(metrics.emailOverageCharges) : '—'}
                            detail={`${integer(metrics.overageEmails)} over-quota emails · from usage API`}
                        />
                    </div>
                    <div className='grid gap-4 lg:grid-cols-3'>
                        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                            <p className='text-xs font-medium text-slate-500'>Lightning Silver member earnings</p>
                            <p className='mt-2 text-2xl font-semibold'>{feeds.silverReferral.data ? money(metrics.silverEarned) : '—'}</p>
                            <p className='mt-2 text-xs text-slate-500'>Member lifetime earnings, not company revenue</p>
                        </div>
                        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                            <p className='text-xs font-medium text-slate-500'>Lightning Gold member earnings</p>
                            <p className='mt-2 text-2xl font-semibold'>{feeds.goldReferral.data ? money(metrics.goldEarned) : '—'}</p>
                            <p className='mt-2 text-xs text-slate-500'>Separate tier; do not merge with Silver balances</p>
                        </div>
                        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                            <p className='text-xs font-medium text-slate-500'>Business Invoice member earnings</p>
                            <p className='mt-2 text-2xl font-semibold'>{feeds.invoiceEarnings.data ? money(metrics.invoiceUserEarned) : '—'}</p>
                            <p className='mt-2 text-xs text-slate-500'>Reported earnings of invoice users</p>
                        </div>
                    </div>
                    <div className='grid gap-4 lg:grid-cols-2'>
                        <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                            <SectionTitle title='Billing by product' note='Gross paid transaction amounts from each loaded source' />
                            <div className='divide-y divide-slate-100'>
                                {(['Lightning Silver', 'Lightning Gold', 'Digital Billboard', 'Business Invoice', 'Email CRM Lite'] as const).map((source) => {
                                    const rows = transactions.filter((tx) => tx.source === source && !tx.refund && isPaid(tx.status));
                                    const amount = rows.filter((tx) => tx.amount != null).reduce((sum, tx) => sum + n(tx.amount), 0);
                                    const feedKey: ApiKey =
                                        source === 'Lightning Silver'
                                            ? 'silverSubscription'
                                            : source === 'Lightning Gold'
                                            ? 'goldSubscription'
                                            : source === 'Digital Billboard'
                                            ? 'billboardSubscription'
                                            : source === 'Business Invoice'
                                            ? 'invoiceBilling'
                                            : 'emailBilling';
                                    return (
                                        <div key={source} className='flex items-center justify-between gap-3 px-5 py-4 sm:px-6'>
                                            <div>
                                                <p className='text-sm font-semibold text-slate-800'>{source}</p>
                                                <p className='mt-0.5 text-xs text-slate-500'>
                                                    {feeds[feedKey].phase === 'loading' || feeds[feedKey].phase === 'queued'
                                                        ? 'Loading…'
                                                        : `${rows.length} paid transactions`}
                                                </p>
                                            </div>
                                            <span className='text-sm font-bold text-slate-900'>{feeds[feedKey].data ? money(amount) : '—'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                        <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                            <SectionTitle title='Data coverage' note='View data as soon as its own endpoint responds' />
                            <div className='grid grid-cols-1 gap-2 p-5 sm:grid-cols-2'>
                                {FEEDS.map((source) => (
                                    <div
                                        key={source.key}
                                        className='flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3'
                                    >
                                        <p className='min-w-0 truncate text-xs font-medium text-slate-700'>{source.label}</p>
                                        <span
                                            className={`text-[11px] font-semibold ${
                                                feeds[source.key].phase === 'success'
                                                    ? 'text-emerald-700'
                                                    : feeds[source.key].phase === 'error'
                                                    ? 'text-rose-700'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            {feeds[source.key].phase === 'success'
                                                ? 'Ready'
                                                : feeds[source.key].phase === 'error'
                                                ? 'Failed'
                                                : feeds[source.key].phase === 'loading'
                                                ? 'Loading'
                                                : 'Queued'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className='px-5 pb-5 text-xs leading-5 text-slate-500'>
                                Totals reflect only loaded feeds and the records those APIs return. They are not a reconciled accounting statement.
                            </p>
                        </section>
                    </div>
                    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <SectionTitle
                            title='Recent transaction activity'
                            note='Latest returned payment and refund records'
                            trailing={
                                <button type='button' onClick={() => setTab('transactions')} className='text-sm font-semibold text-[#27374D] hover:underline'>
                                    View all transactions
                                </button>
                            }
                        />
                        <LedgerTable rows={transactions.slice(0, 10)} compact />
                        {!transactions.length && noLoaded && <p className='pb-5 text-center text-xs text-slate-500'>Waiting for transaction endpoints…</p>}
                    </section>
                    <p className='text-xs leading-5 text-slate-500'>
                        Email CRM billing totals and per-user overage usage are shown separately to avoid double counting. Invoice and Stripe charge rows use
                        cents; earnings and email usage money objects use dollar amounts. No missing payment records are synthesized.
                    </p>
                </>
            )}

            {tab === 'transactions' && (
                <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                    <SectionTitle
                        title='All Billing Transactions'
                        note='Paid, unpaid, and refund records supplied by the five billing/transaction feeds'
                        trailing={
                            <button
                                type='button'
                                onClick={() =>
                                    exportCsv(
                                        'admin-billing-transactions.csv',
                                        ['Source', 'Account', 'Transaction ID', 'Type', 'Date', 'Status', 'Amount USD'],
                                        filteredTransactions.map((r) => [r.source, r.account, r.id, r.type, r.date, r.status, r.amount])
                                    )
                                }
                                className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50'
                            >
                                <Download className='h-4 w-4' />
                                Export filtered CSV
                            </button>
                        }
                    />
                    <div className='grid gap-3 border-b border-slate-100 px-5 py-4 sm:grid-cols-[1fr_200px_150px] sm:px-6'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-3 h-4 w-4 text-slate-400' />
                            <input
                                value={search}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                placeholder='Search email, invoice, transaction ID…'
                                className='w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400'
                            />
                        </div>
                        <select
                            value={sourceFilter}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSourceFilter(e.target.value)}
                            className='rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400'
                        >
                            <option value='all'>All products</option>
                            {filterOptions.map((source) => (
                                <option key={source} value={source}>
                                    {source}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                            className='rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400'
                        >
                            <option value='all'>All statuses</option>
                            <option value='paid'>Paid</option>
                            <option value='pending'>Not paid</option>
                            <option value='refund'>Refunds</option>
                        </select>
                    </div>
                    <LedgerTable rows={visibleTransactions} />
                    <PageControls page={selectedPage} pages={pages} total={filteredTransactions.length} perPage={pageSize} onPage={setPage} />
                    <p className='border-t border-slate-100 px-5 py-3 text-xs text-slate-500'>
                        Records without an identifiable email retain “Not provided by API”. Invoice refunds are separate negative rows; no artificial email-send
                        transactions are added.
                    </p>
                </section>
            )}

            {tab === 'subscriptions' && (
                <>
                    <div className='grid gap-4 sm:grid-cols-3'>
                        <Metric
                            icon={Users}
                            label='Subscription records'
                            value={integer(subscriptions.length)}
                            detail='Records with subscription objects across products'
                        />
                        <Metric
                            icon={CheckCircle2}
                            label='Stripe-active subscriptions'
                            value={integer(subscriptions.filter((x) => x.status === 'Active').length)}
                            detail='Only subscriptions explicitly marked Stripe active'
                        />
                        <Metric
                            icon={Clock3}
                            label='Subscriptions with next billing date'
                            value={integer(subscriptions.filter((x) => Boolean(x.nextBilling)).length)}
                            detail='Recorded upcoming/previous billing dates, not necessarily in the future'
                        />
                    </div>
                    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <SectionTitle title='Subscriptions by product' note='Read-only inventory; recurring plan amounts are displayed as dollars' />
                        <div className='overflow-x-auto'>
                            <table className='min-w-[900px] w-full'>
                                <thead className='bg-slate-50'>
                                    <tr>
                                        {['Product', 'Account', 'Subscription ID', 'Plan amount', 'Period', 'Status', 'Next billing'].map((h) => (
                                            <th key={h} className={th}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100'>
                                    {subscriptions
                                        .slice((Math.min(subscriptionPage, subPages) - 1) * 15, Math.min(subscriptionPage, subPages) * 15)
                                        .map((r) => (
                                            <tr key={r.key} className='hover:bg-slate-50/70'>
                                                <td className={`${td} font-semibold text-slate-900`}>{r.source}</td>
                                                <td className={`${td} max-w-[270px] truncate`} title={r.account}>
                                                    {r.account}
                                                </td>
                                                <td className={td}>{r.id}</td>
                                                <td className={`${td} font-semibold`}>{money(r.amount)}</td>
                                                <td className={td}>{r.period}</td>
                                                <td className={td}>
                                                    <Pill label={r.status} />
                                                </td>
                                                <td className={td}>{dateLabel(r.nextBilling)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        {!subscriptions.length && <Empty text='Subscription records will appear here as those feeds load.' />}
                        <PageControls
                            page={Math.min(subscriptionPage, subPages)}
                            pages={subPages}
                            onPage={setSubscriptionPage}
                            total={subscriptions.length}
                            perPage={15}
                        />
                    </section>
                    <p className='text-xs text-slate-500'>
                        A “Paid (API flag)” subscription is not automatically considered Stripe-active. Plan amounts are not counted as collected revenue until
                        a paid transaction is returned.
                    </p>
                </>
            )}

            {tab === 'affiliate' && (
                <>
                    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                        <Metric icon={Users} label='Silver referrals' value={feeds.silverReferral.data ? integer(silverAffiliates.length) : '—'} />
                        <Metric icon={Wallet} label='Silver total earned' value={feeds.silverReferral.data ? money(metrics.silverEarned) : '—'} />
                        <Metric icon={Users} label='Gold referrals' value={feeds.goldReferral.data ? integer(goldAffiliates.length) : '—'} />
                        <Metric icon={Wallet} label='Gold total earned' value={feeds.goldReferral.data ? money(metrics.goldEarned) : '—'} />
                    </div>
                    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <SectionTitle
                            title='Affiliate balances and earnings'
                            note='Users’ referral figures, by tier; admin view only, no withdrawals or Stripe connection controls'
                        />
                        <div className='overflow-x-auto'>
                            <table className='min-w-[1020px] w-full'>
                                <thead className='bg-slate-50'>
                                    <tr>
                                        {['Tier', 'Account', 'Available balance', 'Earned lifetime', 'Withdrawn this month', 'Total withdrawn', 'Stripe'].map(
                                            (h) => (
                                                <th key={h} className={th}>
                                                    {h}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100'>
                                    {affiliateRows.slice((Math.min(affiliatePage, affPages) - 1) * 15, Math.min(affiliatePage, affPages) * 15).map((r) => (
                                        <tr key={r.key} className='hover:bg-slate-50/70'>
                                            <td className={`${td} font-semibold`}>{r.label}</td>
                                            <td className={`${td} max-w-[270px] truncate`} title={accountOf(r.user)}>
                                                {accountOf(r.user)}
                                            </td>
                                            <td className={`${td} font-semibold`}>{money(r.availableBalance, r.currency || 'USD')}</td>
                                            <td className={td}>{money(r.totalEarned, r.currency || 'USD')}</td>
                                            <td className={td}>{money(r.withdrawnThisMonth, r.currency || 'USD')}</td>
                                            <td className={td}>{money(r.totalWithdrawn, r.currency || 'USD')}</td>
                                            <td className={td}>
                                                <Pill label={r.user?.stripeConnected ? 'Connected' : 'Not connected'} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!affiliateRows.length && <Empty text='Affiliate records will appear after Silver or Gold referral feeds respond.' />}
                        <PageControls
                            page={Math.min(affiliatePage, affPages)}
                            pages={affPages}
                            onPage={setAffiliatePage}
                            total={affiliateRows.length}
                            perPage={15}
                        />
                    </section>
                </>
            )}

            {tab === 'email' && (
                <>
                    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                        <Metric
                            icon={Mail}
                            label='Email sends this month'
                            value={feeds.emailUsage.data ? integer(metrics.totalEmails) : '—'}
                            detail='Authoritative Email CRM usage endpoint'
                        />
                        <Metric
                            icon={Activity}
                            label='Over-quota emails'
                            value={feeds.emailUsage.data ? integer(metrics.overageEmails) : '—'}
                            detail='Within quota is tracked separately'
                        />
                        <Metric
                            icon={CreditCard}
                            label='Overage charges (usage)'
                            value={feeds.emailUsage.data ? money(metrics.emailOverageCharges) : '—'}
                            detail='As reported per account by usage API'
                        />
                        <Metric
                            icon={Receipt}
                            label='CRM billing charged'
                            value={feeds.emailBilling.data ? money(metrics.crmRecordedCharges) : '—'}
                            detail='Separate charge totals from billing endpoint'
                        />
                    </div>
                    <div className='flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600'>
                        <Mail className='mt-0.5 h-5 w-5 shrink-0 text-[#526D82]' />
                        <p>
                            Email overage rate from Lightning API responses: <strong className='text-slate-900'>$0.005 per billable email</strong>. The Email
                            CRM usage endpoint has included quotas, so included emails are not treated as charged. Usage and billing charges are not added
                            together.
                        </p>
                    </div>
                    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <SectionTitle
                            title='Email CRM quota and overage usage'
                            note='Per-account usage for the billing month, directly from /email-crm/usage'
                        />
                        <div className='overflow-x-auto'>
                            <table className='min-w-[990px] w-full'>
                                <thead className='bg-slate-50'>
                                    <tr>
                                        {[
                                            'Account',
                                            'Billing month',
                                            'Included quota',
                                            'Remaining',
                                            'Within quota',
                                            'Over quota',
                                            'Sends total',
                                            'Overage charges',
                                            'Successful charges',
                                        ].map((h) => (
                                            <th key={h} className={th}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100'>
                                    {crmUsage.slice((Math.min(emailPage, emailPages) - 1) * 15, Math.min(emailPage, emailPages) * 15).map((r, i) => (
                                        <tr key={`${r.user?.id ?? i}-${r.billingMonth ?? ''}`} className='hover:bg-slate-50/70'>
                                            <td className={`${td} max-w-[270px] truncate font-semibold text-slate-900`} title={accountOf(r.user)}>
                                                {accountOf(r.user)}
                                            </td>
                                            <td className={td}>{r.billingMonth || '—'}</td>
                                            <td className={td}>{integer(r.includedEmailQuota)}</td>
                                            <td className={td}>{integer(r.availableEmailQuota)}</td>
                                            <td className={td}>{integer(r.emailsSentWithinQuota)}</td>
                                            <td className={td}>{integer(r.emailsSentAfterQuota)}</td>
                                            <td className={td}>{integer(r.totalEmailsSentThisMonth)}</td>
                                            <td className={`${td} font-semibold`}>{money(moneyAmount(r.totalMoneySpentOnEmailOverages))}</td>
                                            <td className={td}>{integer(r.successfulOverageChargeCount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!crmUsage.length && <Empty text='Email CRM usage is loading or the endpoint returned no accounts.' />}
                        <PageControls page={Math.min(emailPage, emailPages)} pages={emailPages} onPage={setEmailPage} total={crmUsage.length} perPage={15} />
                    </section>
                    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <SectionTitle
                            title='Email CRM Billing Records'
                            note='This endpoint omits account identities; records are labeled by subscription ID instead of inferred users'
                        />
                        <div className='overflow-x-auto'>
                            <table className='min-w-[800px] w-full'>
                                <thead className='bg-slate-50'>
                                    <tr>
                                        {['Billing record', 'Plan', 'Status', 'Transactions reported', 'Successful', 'Total charged', 'Next billing'].map(
                                            (h) => (
                                                <th key={h} className={th}>
                                                    {h}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100'>
                                    {crmBilling
                                        .slice((Math.min(emailBillingPage, emailBillingPages) - 1) * 15, Math.min(emailBillingPage, emailBillingPages) * 15)
                                        .map((r, i) => (
                                            <tr
                                                key={`crm-billing-${r.subscription?.id ?? (Math.min(emailBillingPage, emailBillingPages) - 1) * 15 + i}`}
                                                className='hover:bg-slate-50/70'
                                            >
                                                <td className={td}>
                                                    {r.subscription?.id != null
                                                        ? `Subscription #${r.subscription.id}`
                                                        : `Record #${(Math.min(emailBillingPage, emailBillingPages) - 1) * 15 + i + 1}`}
                                                </td>
                                                <td className={td}>{r.subscription ? 'Email CRM Lite' : '—'}</td>
                                                <td className={td}>
                                                    <Pill label={labelStatus(r.subscription)} />
                                                </td>
                                                <td className={td}>{integer(r.transactionCount)}</td>
                                                <td className={td}>{integer(r.successfulTransactionCount)}</td>
                                                <td className={`${td} font-semibold`}>{money(moneyAmount(r.totalAmountCharged))}</td>
                                                <td className={td}>{dateLabel(r.nextBillingDate)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        {!crmBilling.length && <Empty text='Email CRM billing records will appear after the billing endpoint responds.' />}
                        <PageControls
                            page={Math.min(emailBillingPage, emailBillingPages)}
                            pages={emailBillingPages}
                            onPage={setEmailBillingPage}
                            total={crmBilling.length}
                            perPage={15}
                        />
                    </section>
                    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <SectionTitle
                            title='Lightning email usage by tier'
                            note='Supporting usage information from Lightning Silver and Gold; not summed with Email CRM totals'
                        />
                        <div className='grid gap-3 p-5 sm:grid-cols-2'>
                            {[
                                { label: 'Lightning Silver', records: silverSubs, feed: feeds.silverSubscription },
                                { label: 'Lightning Gold', records: goldSubs, feed: feeds.goldSubscription },
                            ].map(({ label, records, feed }) => {
                                const usage = records.map((r) => r.emailUsage).filter((r): r is TierEmailUsage => Boolean(r));
                                const sent = usage.reduce((sum, x) => sum + n(x.emailsSentThisMonth), 0);
                                const charges = usage.reduce((sum, x) => sum + moneyAmount(x.emailCharges), 0);
                                return (
                                    <div key={label} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                                        <p className='text-sm font-semibold text-slate-800'>{label}</p>
                                        <p className='mt-2 text-xl font-semibold'>
                                            {feed.data ? integer(sent) : '—'} <span className='text-xs font-medium text-slate-500'>emails sent</span>
                                        </p>
                                        <p className='mt-2 text-xs text-slate-600'>
                                            {feed.data ? money(charges) : '—'} email charges · {feed.data ? usage.length : '—'} account records
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </>
            )}

            {tab === 'invoices' && (
                <>
                    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                        <Metric icon={Users} label='Business invoice accounts' value={feeds.invoiceEarnings.data ? integer(invoiceEarnings.length) : '—'} />
                        <Metric
                            icon={Wallet}
                            label='Total member earnings'
                            value={feeds.invoiceEarnings.data ? money(metrics.invoiceUserEarned) : '—'}
                            detail='All-time user earnings, not platform income'
                        />
                        <Metric
                            icon={Receipt}
                            label='Invoice transaction rows'
                            value={feeds.invoiceBilling.data ? integer(invoiceBilling.reduce((sum, r) => sum + (r.transactions?.length || 0), 0)) : '—'}
                        />
                        <Metric icon={ArrowDownRight} label='Completed refunds' value={feeds.invoiceBilling.data ? money(metrics.refunds) : '—'} />
                    </div>
                    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <SectionTitle title='Invoice member earnings' note='Per-user earnings and withdrawals returned by the Business Invoice Earnings API' />
                        <div className='overflow-x-auto'>
                            <table className='min-w-[920px] w-full'>
                                <thead className='bg-slate-50'>
                                    <tr>
                                        {[
                                            'Account',
                                            'Earned this month',
                                            'Earned total',
                                            'Invoice earnings',
                                            'Subscription invoice earnings',
                                            'Withdrawn this month',
                                            'Withdrawn total',
                                        ].map((h) => (
                                            <th key={h} className={th}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100'>
                                    {invoiceEarnings
                                        .slice((Math.min(businessPage, businessPages) - 1) * 15, Math.min(businessPage, businessPages) * 15)
                                        .map((r, i) => (
                                            <tr key={`${r.user?.authId ?? i}`} className='hover:bg-slate-50/70'>
                                                <td className={`${td} max-w-[270px] truncate font-semibold text-slate-900`} title={accountOf(r.user)}>
                                                    {accountOf(r.user)}
                                                </td>
                                                <td className={td}>{money(moneyAmount(r.totalEarnedThisMonth))}</td>
                                                <td className={td}>{money(moneyAmount(r.totalEarned))}</td>
                                                <td className={td}>{money(moneyAmount(r.totalInvoiceEarned))}</td>
                                                <td className={td}>{money(moneyAmount(r.totalSubscriptionInvEarned))}</td>
                                                <td className={td}>{money(moneyAmount(r.successfullyWithdrawnThisMonth))}</td>
                                                <td className={td}>{money(moneyAmount(r.totalWithdrawn))}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        {!invoiceEarnings.length && <Empty text='Business Invoice earnings will appear once that feed responds.' />}
                        <PageControls
                            page={Math.min(businessPage, businessPages)}
                            pages={businessPages}
                            onPage={setBusinessPage}
                            total={invoiceEarnings.length}
                            perPage={15}
                        />
                    </section>
                    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <SectionTitle
                            title='Business Invoice payment and refund activity'
                            note='Separate settled transactions from returned refund rows'
                            trailing={
                                <button
                                    type='button'
                                    className='text-sm font-semibold text-[#27374D] hover:underline'
                                    onClick={() => {
                                        setSourceFilter('Business Invoice');
                                        setSearch('');
                                        setStatusFilter('all');
                                        setPage(1);
                                        setTab('transactions');
                                    }}
                                >
                                    View all
                                </button>
                            }
                        />
                        <LedgerTable rows={transactions.filter((r) => r.source === 'Business Invoice').slice(0, 10)} compact />
                    </section>
                </>
            )}

            {tab === 'sources' && (
                <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                    <SectionTitle
                        title='API health and retry controls'
                        note='Individual request states make slow or failed endpoints safe to retry without losing other results'
                    />
                    <div className='divide-y divide-slate-100'>
                        {FEEDS.map((source) => {
                            const feed = feeds[source.key];
                            return (
                                <div key={source.key} className='flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
                                    <div className='min-w-0'>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            <h3 className='text-sm font-semibold text-slate-800'>{source.label}</h3>
                                            <Pill
                                                label={
                                                    feed.phase === 'success'
                                                        ? 'Active'
                                                        : feed.phase === 'error'
                                                        ? 'Failed'
                                                        : feed.phase === 'loading'
                                                        ? 'Loading'
                                                        : 'Queued'
                                                }
                                            />
                                        </div>
                                        <p className='mt-1 break-all font-mono text-xs text-slate-500'>{source.endpoint}</p>
                                        <p className='mt-1 text-xs text-slate-500'>
                                            {feed.data ? `${integer(feed.data.length)} records loaded` : 'No data loaded'}
                                            {feed.updatedAt ? ` · Updated ${dateTimeLabel(new Date(feed.updatedAt).toISOString())}` : ''}
                                            {feed.error ? ` · ${feed.error}` : ''}
                                        </p>
                                    </div>
                                    <button
                                        type='button'
                                        disabled={feed.phase === 'loading' || feed.phase === 'queued'}
                                        onClick={() => retry(source.key)}
                                        className='inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                                    >
                                        <RefreshCw className='h-3.5 w-3.5' />
                                        Retry
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className='border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs leading-5 text-slate-500'>
                        <p>
                            Requests are capped at 3 concurrent operations and allow up to 75 seconds each. A failed API never cancels the other feeds. Cached
                            results stay visible on refresh failure. Backend authorization and server-side pagination must be enforced at the API layer.
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
};

function LedgerTable({ rows, compact = false }: { rows: LedgerRow[]; compact?: boolean }) {
    if (!rows.length) return <Empty text='No transaction records available for this view yet.' />;
    return (
        <div className='overflow-x-auto'>
            <table className='w-full min-w-[920px]'>
                <thead className='bg-slate-50'>
                    <tr>
                        {['Product / Type', 'Account', 'Transaction ID', 'Date (UTC)', 'Status', 'Amount', 'Invoice'].map((h) => (
                            <th key={h} className={th}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                    {rows.slice(0, compact ? 10 : rows.length).map((row) => (
                        <tr key={row.key} className='hover:bg-slate-50/70'>
                            <td className={td}>
                                <p className='font-semibold text-slate-900'>{row.source}</p>
                                <p className='mt-0.5 text-xs text-slate-500'>{row.type}</p>
                            </td>
                            <td className={`${td} max-w-[240px] truncate`} title={row.account}>
                                {row.account}
                            </td>
                            <td className={`${td} max-w-[160px] truncate font-mono text-xs`} title={row.id}>
                                {row.id}
                            </td>
                            <td className={td}>{dateTimeLabel(row.date)}</td>
                            <td className={td}>
                                <Pill label={row.refund ? 'Refund' : row.status} />
                            </td>
                            <td className={`${td} font-semibold ${row.refund ? 'text-rose-700' : 'text-slate-900'}`}>
                                {row.amount != null ? money(row.amount, row.currency) : '—'}
                            </td>
                            <td className={td}>
                                <div className='flex gap-2'>
                                    {safeLink(row.invoiceUrl) && (
                                        <a
                                            href={safeLink(row.invoiceUrl)!}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-flex items-center gap-1 text-xs font-semibold text-[#27374D] hover:underline'
                                        >
                                            <FileText className='h-3.5 w-3.5' />
                                            View
                                        </a>
                                    )}
                                    {safeLink(row.invoicePdf) && (
                                        <a
                                            href={safeLink(row.invoicePdf)!}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-flex items-center gap-1 text-xs font-semibold text-[#27374D] hover:underline'
                                        >
                                            <Download className='h-3.5 w-3.5' />
                                            PDF
                                        </a>
                                    )}
                                    {!safeLink(row.invoiceUrl) && !safeLink(row.invoicePdf) && '—'}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminBillingDashboard;
