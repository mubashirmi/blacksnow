'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type User = {
    id: number;
    createdAt: string;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: 'Sales' | 'Affiliate';
    roles?: string[];
};

type Note = {
    id: number;
    createdAt: string;
    updatedAt: string;
    title: string;
    content: string;
    authorName: string;
};

type Job = {
    id: number;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
    title: string;
    description: string;
    location: string;
    salary: number;
    image: string;
    type: string;
};

type JobApplicant = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    resume: string;
    createdAt: string;
};

type Blog = {
    id: number;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
    title: string;
    slug: string;
    postContent: string;
    category: string;
    views: number;
    headerImage: string;
    featured: boolean;
};

type Billboard = {
    id: number;
    createdAt: string;
    updatedAt: string;
    fullName: string;
    website: string | null;
    podcast: string | null;
    twitter: string | null;
    youTube: string | null;
    facebook: string | null;
    image: string | null;
    companyName: string | null;
    description: string | null;
    status: 'Rejected' | 'NotApproved' | 'Approved' | string;
    authId: number;
};

type RsvpEvent = {
    id: number;
    createdAt: string;
    updatedAt: string;
    date: string;
    time: string;
    limit: number;
    compareDate: string;
    userBroughtProduct: any[];
};

type Checkout = {
    id: number;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
    transactionId: string;
    AuthId: number;
    amount: number;
    paid: boolean;
    product: string;
    cancelSubscripton: boolean;
};

type CheckoutRevenue = {
    _sum: {
        amount: number | null;
    };
    product: string;
};

type ProductUser = User & {
    roles?: string[];
    Checkouts?: Checkout[];
};

type KPIResponse = {
    message: string;
    salesUsers: User[];
    affiliateUsers: User[];
    latestThreeNotes: Note[];
    latestJob: Job | null;
    latestJobApplicants: JobApplicant[];
    latestBlog: Blog | null;
    latestBillboard: Billboard | null;
    latestBillBoardApprovels: Billboard[];
    totalProfit?: { _sum: { amount: number | null } };
    rsvpEvents?: RsvpEvent[];
    checkoutRevenues?: CheckoutRevenue[];
    userProducts?: ProductUser[];
};

type KPIChartMetricResponse = {
    message: string;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    weeklySubscribers: number;
    monthlySubscribers: number;
    yearlySubscribers: number;
    weeklyChurnRate: number;
    monthlyChurnRate: number;
    yearlyChurnRate: number;
    type?: 'Sales' | 'Affiliate' | string;
    product?: string;
};

type TotalKPIResponse = {
    countsByRole: Record<string, number>;
};

// ─── NEW: v4 API types ────────────────────────────────────────────────────────

type ProductRevenueEntry = {
    product: string;
    monthly: number;
    yearly: number;
};

type ProductRevenueChartResponse = {
    message: string;
    revenueData: Record<string, ProductRevenueEntry>;
};

type LightningMembershipEntry = {
    product: string;
    monthly: number;
    yearly: number;
};

type LightningMembershipResponse = {
    message: string;
    revenueData: Record<string, LightningMembershipEntry>;
};

type BillingCycleEntry = {
    id: number;
    amount: number;
    period: string;
    product: string;
    startDate: string | null;
    nextBillingDate: string | null;
};

type LightningBillingCycleResponse = {
    message: string;
    data: BillingCycleEntry[];
};

// ─── NEW: v5 API types ────────────────────────────────────────────────────────

type EmailSentRecord = {
    id: string;
    createdAt: string;
    sentAt: string;
    subject: string;
    status: string;
    messageId: string;
    errorMessage: string | null;
    authId: number;
    emailUserId: number;
    newsletterAuthId: number | null;
    credentialsId: number;
    jobResultId: string | null;
};

type EmailSentWeeklyDay = {
    date: string;
    day: string;
    count: number;
    records: EmailSentRecord[];
};

type EmailSentMonthlyMonth = {
    month: number;
    label: string;
    count: number;
    records: EmailSentRecord[];
};

type EmailSentYearlyYear = {
    year: number;
    count: number;
    records: EmailSentRecord[];
};

type EmailSentHistoryResponse = {
    type: string;
    timezone: string;
    weekly: {
        type: string;
        timezone: string;
        range: { startDate: string; endDate: string; startUtc: string; endUtcExclusive: string };
        total: number;
        data: EmailSentWeeklyDay[];
    };
    monthly: {
        type: string;
        timezone: string;
        year: number;
        range: { startDate: string; endDateExclusive: string; startUtc: string; endUtcExclusive: string };
        total: number;
        data: EmailSentMonthlyMonth[];
    };
    yearly: {
        type: string;
        timezone: string;
        range: { startYear: number; endYear: number; startDate: string; endDateExclusive: string; startUtc: string; endUtcExclusive: string };
        total: number;
        data: EmailSentYearlyYear[];
    };
};

// ─────────────────────────────────────────────────────────────────────────────

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const METRIC_PRODUCTS = [
    { label: 'Email Marketing', value: 'EmailMarketing' },
    { label: 'Invoice Tool', value: 'InvoiceTool' },
    { label: 'Digital Billboard', value: 'DigitalBillboard' },
    { label: 'Newsletter', value: 'NewsLetter' },
] as const;

type MetricType = 'Revenue' | 'Subscribers' | 'ChurnRate';
type MetricPeriod = 'Week' | 'Month' | 'Year';
type EmailSentPeriod = 'Weekly' | 'Monthly' | 'Yearly';

function safeNumber(n: any, fallback = 0) {
    const x = typeof n === 'number' ? n : Number(n);
    return Number.isFinite(x) ? x : fallback;
}

function currency(n?: number | null) {
    const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
    return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function normalizePercent(rate: number) {
    if (!Number.isFinite(rate)) return 0;
    if (rate <= 1) return rate * 100;
    return rate;
}

function percent(rate: number) {
    const p = normalizePercent(rate);
    return `${p.toFixed(2)}%`;
}

function formatProductName(product?: string) {
    if (!product) return 'Unknown';
    switch (product) {
        case 'DigitalBillboard':
            return 'Digital Billboard';
        case 'NewsLetter':
            return 'Newsletter';
        case 'EmailMarketing':
            return 'Email Marketing';
        case 'InvoiceTool':
            return 'Invoice Tool';
        case 'LightningGold':
            return 'Lightning Gold';
        case 'LightningSilver':
            return 'Lightning Silver';
        case 'lightningSilver':
            return 'Lightning Silver';
        case 'lightningGold':
            return 'Lightning Gold';
        case 'RSVP':
            return 'RSVP';
        default:
            return product;
    }
}

function HorizontalCursor(props: any) {
    const { points, width } = props || {};
    if (!points || !points.length || typeof width !== 'number') return null;
    const y = points[0]?.y;
    if (typeof y !== 'number') return null;
    return <line x1={0} x2={width} y1={y} y2={y} stroke='rgba(17, 24, 39, 0.35)' strokeDasharray='4 4' />;
}

async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(`Failed to fetch (${res.status}) ${url}`);
    return (await res.json()) as T;
}

function getMetricValue(metricData: KPIChartMetricResponse | null, metricType: MetricType, metricPeriod: MetricPeriod) {
    if (!metricData) return 0;

    if (metricPeriod === 'Week') {
        if (metricType === 'Revenue') return safeNumber(metricData.weeklyRevenue);
        if (metricType === 'Subscribers') return safeNumber(metricData.weeklySubscribers);
        return safeNumber(metricData.weeklyChurnRate);
    }

    if (metricPeriod === 'Month') {
        if (metricType === 'Revenue') return safeNumber(metricData.monthlyRevenue);
        if (metricType === 'Subscribers') return safeNumber(metricData.monthlySubscribers);
        return safeNumber(metricData.monthlyChurnRate);
    }

    if (metricType === 'Revenue') return safeNumber(metricData.yearlyRevenue);
    if (metricType === 'Subscribers') return safeNumber(metricData.yearlySubscribers);
    return safeNumber(metricData.yearlyChurnRate);
}

function getMetricPeriodLabels(metricPeriod: MetricPeriod) {
    if (metricPeriod === 'Week') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (metricPeriod === 'Month') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => String(currentYear - 4 + index));
}

function buildMetricSeries(metricData: KPIChartMetricResponse | null, metricType: MetricType, metricPeriod: MetricPeriod) {
    if (!metricData) return [];

    const selectedValue = getMetricValue(metricData, metricType, metricPeriod);
    const labels = getMetricPeriodLabels(metricPeriod);

    return labels.map((period, index) => ({
        period,
        value: selectedValue,
        active: index === labels.length - 1,
    }));
}

function formatMetricValue(metricType: MetricType, value: number) {
    if (metricType === 'Revenue') return currency(value);
    if (metricType === 'Subscribers') return `${safeNumber(value)} subscribers`;
    return percent(safeNumber(value));
}

// ─── Stat pill used in v4 chart headers ──────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${color}`}>
            <span className='text-xs font-medium uppercase tracking-wide opacity-70'>{label}</span>
            <span className='text-base font-bold mt-0.5'>{value}</span>
        </div>
    );
}

export default function KPIPage() {
    const [data, setData] = useState<KPIResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'revenue' | 'date'>('revenue');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 10;

    // Chart #1 Sales
    const [salesProduct, setSalesProduct] = useState<(typeof METRIC_PRODUCTS)[number]['value']>('DigitalBillboard');
    const [salesMetricType, setSalesMetricType] = useState<MetricType>('Revenue');
    const [salesMetricPeriod, setSalesMetricPeriod] = useState<MetricPeriod>('Week');
    const [salesMetricData, setSalesMetricData] = useState<KPIChartMetricResponse | null>(null);
    const [salesMetricLoading, setSalesMetricLoading] = useState(false);
    const [salesMetricError, setSalesMetricError] = useState<string | null>(null);

    // Chart #2 Affiliate
    const [affiliateProduct, setAffiliateProduct] = useState<(typeof METRIC_PRODUCTS)[number]['value']>('NewsLetter');
    const [affiliateMetricType, setAffiliateMetricType] = useState<MetricType>('Revenue');
    const [affiliateMetricPeriod, setAffiliateMetricPeriod] = useState<MetricPeriod>('Week');
    const [affiliateMetricData, setAffiliateMetricData] = useState<KPIChartMetricResponse | null>(null);
    const [affiliateMetricLoading, setAffiliateMetricLoading] = useState(false);
    const [affiliateMetricError, setAffiliateMetricError] = useState<string | null>(null);

    // Chart #3 Total KPI
    const [totalKpi, setTotalKpi] = useState<TotalKPIResponse | null>(null);
    const [totalKpiLoading, setTotalKpiLoading] = useState(false);
    const [totalKpiError, setTotalKpiError] = useState<string | null>(null);

    // ─── NEW v4 state ─────────────────────────────────────────────────────────

    // Chart A: Product Revenue (MRR/ARR)
    const [productRevenue, setProductRevenue] = useState<ProductRevenueChartResponse | null>(null);
    const [productRevenueLoading, setProductRevenueLoading] = useState(false);
    const [productRevenueError, setProductRevenueError] = useState<string | null>(null);
    const [selectedRevenueProduct, setSelectedRevenueProduct] = useState<string>('All');

    // Chart B: Lightning Membership Revenue
    const [lightningMembership, setLightningMembership] = useState<LightningMembershipResponse | null>(null);
    const [lightningMembershipLoading, setLightningMembershipLoading] = useState(false);
    const [lightningMembershipError, setLightningMembershipError] = useState<string | null>(null);
    const [lightningFilter, setLightningFilter] = useState<'All' | 'LightningGold' | 'LightningSilver'>('All');

    // Chart C: Lightning Billing Cycle
    // eslint-disable-next-line
    const [billingCycle, setBillingCycle] = useState<LightningBillingCycleResponse | null>(null);
    // eslint-disable-next-line
    const [billingCycleLoading, setBillingCycleLoading] = useState(false);
    // eslint-disable-next-line
    const [billingCycleError, setBillingCycleError] = useState<string | null>(null);
    // eslint-disable-next-line
    const [billingPeriodFilter, setBillingPeriodFilter] = useState<'all' | 'monthly' | 'yearly'>('all');

    // ─── NEW v5 state ─────────────────────────────────────────────────────────

    // Chart D: Emails Sent History
    const [emailSentHistory, setEmailSentHistory] = useState<EmailSentHistoryResponse | null>(null);
    const [emailSentLoading, setEmailSentLoading] = useState(false);
    const [emailSentError, setEmailSentError] = useState<string | null>(null);
    const [emailSentPeriod, setEmailSentPeriod] = useState<EmailSentPeriod>('Weekly');

    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        const fetchKPI = async () => {
            try {
                setIsLoading(true);
                setErrorMsg(null);
                const json = await fetchJSON<KPIResponse>('/api/v2/kpi');
                setData(json);
            } catch (e: any) {
                setErrorMsg(e?.message || 'Failed to load KPI data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchKPI();
    }, []);

    async function fetchMetric(type: 'Sales' | 'Affiliate', product: string) {
        const qs = new URLSearchParams();
        qs.set('type', type);
        qs.set('product', product);
        return await fetchJSON<KPIChartMetricResponse>(`/api/v3/kpi-chart-metric?${qs.toString()}`);
    }

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setSalesMetricLoading(true);
                setSalesMetricError(null);
                const json = await fetchMetric('Sales', salesProduct);
                if (cancelled) return;
                setSalesMetricData(json);
            } catch (e: any) {
                if (cancelled) return;
                setSalesMetricError(e?.message || 'Failed to load Sales metric chart');
                setSalesMetricData(null);
            } finally {
                if (!cancelled) setSalesMetricLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [salesProduct]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setAffiliateMetricLoading(true);
                setAffiliateMetricError(null);
                const json = await fetchMetric('Affiliate', affiliateProduct);
                if (cancelled) return;
                setAffiliateMetricData(json);
            } catch (e: any) {
                if (cancelled) return;
                setAffiliateMetricError(e?.message || 'Failed to load Affiliate metric chart');
                setAffiliateMetricData(null);
            } finally {
                if (!cancelled) setAffiliateMetricLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [affiliateProduct]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setTotalKpiLoading(true);
                setTotalKpiError(null);
                const json = await fetchJSON<TotalKPIResponse>('/api/v3/total-kpi');
                if (cancelled) return;
                setTotalKpi(json);
            } catch (e: any) {
                if (cancelled) return;
                setTotalKpiError(e?.message || 'Failed to load total KPI chart');
                setTotalKpi(null);
            } finally {
                if (!cancelled) setTotalKpiLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, []);

    // ─── NEW v4 fetches ───────────────────────────────────────────────────────

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setProductRevenueLoading(true);
                setProductRevenueError(null);
                const json = await fetchJSON<ProductRevenueChartResponse>('/api/v4/product-revenue-chart');
                if (cancelled) return;
                setProductRevenue(json);
            } catch (e: any) {
                if (cancelled) return;
                setProductRevenueError(e?.message || 'Failed to load product revenue chart');
                setProductRevenue(null);
            } finally {
                if (!cancelled) setProductRevenueLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setLightningMembershipLoading(true);
                setLightningMembershipError(null);
                const json = await fetchJSON<LightningMembershipResponse>('/api/v4/lightning-membership-revenue');
                if (cancelled) return;
                setLightningMembership(json);
            } catch (e: any) {
                if (cancelled) return;
                setLightningMembershipError(e?.message || 'Failed to load lightning membership chart');
                setLightningMembership(null);
            } finally {
                if (!cancelled) setLightningMembershipLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setBillingCycleLoading(true);
                setBillingCycleError(null);
                const json = await fetchJSON<LightningBillingCycleResponse>('/api/v4/lightning-billing-cycle');
                if (cancelled) return;
                setBillingCycle(json);
            } catch (e: any) {
                if (cancelled) return;
                setBillingCycleError(e?.message || 'Failed to load billing cycle data');
                setBillingCycle(null);
            } finally {
                if (!cancelled) setBillingCycleLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, []);

    // ─── NEW v5 fetch ─────────────────────────────────────────────────────────

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setEmailSentLoading(true);
                setEmailSentError(null);
                const json = await fetchJSON<EmailSentHistoryResponse>('/api/v5/email-sent-history');
                if (cancelled) return;
                setEmailSentHistory(json);
            } catch (e: any) {
                if (cancelled) return;
                setEmailSentError(e?.message || 'Failed to load email sent history');
                setEmailSentHistory(null);
            } finally {
                if (!cancelled) setEmailSentLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, []);

    // ─────────────────────────────────────────────────────────────────────────

    // ─── v4 derived data ──────────────────────────────────────────────────────

    /** Product Revenue: build line chart data from /api/v4/product-revenue-chart */
    const productRevenueChartData = useMemo(() => {
        const entries = Object.values(productRevenue?.revenueData ?? {});
        const filtered = selectedRevenueProduct === 'All' ? entries : entries.filter((e) => e.product === selectedRevenueProduct);
        return filtered.map((e) => ({
            product: formatProductName(e.product),
            productKey: e.product,
            MRR: safeNumber(e.monthly),
            ARR: safeNumber(e.yearly),
        }));
    }, [productRevenue, selectedRevenueProduct]);

    const productRevenueOptions = useMemo(() => {
        const keys = Object.keys(productRevenue?.revenueData ?? {});
        return ['All', ...keys];
    }, [productRevenue]);

    const productRevenueTotals = useMemo(() => {
        const all = Object.values(productRevenue?.revenueData ?? {});
        return {
            totalMRR: all.reduce((s, e) => s + safeNumber(e.monthly), 0),
            totalARR: all.reduce((s, e) => s + safeNumber(e.yearly), 0),
        };
    }, [productRevenue]);

    /** Lightning Membership: filter + chart data */
    const lightningChartData = useMemo(() => {
        const entries = Object.values(lightningMembership?.revenueData ?? {});
        const filtered = lightningFilter === 'All' ? entries : entries.filter((e) => e.product === lightningFilter);
        return filtered.map((e) => ({
            product: formatProductName(e.product),
            productKey: e.product,
            Monthly: safeNumber(e.monthly),
            Yearly: safeNumber(e.yearly),
        }));
    }, [lightningMembership, lightningFilter]);

    const lightningTotals = useMemo(() => {
        const all = Object.values(lightningMembership?.revenueData ?? {});
        return {
            totalMonthly: all.reduce((s, e) => s + safeNumber(e.monthly), 0),
            totalYearly: all.reduce((s, e) => s + safeNumber(e.yearly), 0),
        };
    }, [lightningMembership]);

    /** Billing Cycle: filter + stats */
    // const filteredBillingData = useMemo(() => {
    //     const rows = billingCycle?.data ?? [];
    //     return billingPeriodFilter === 'all' ? rows : rows.filter((r) => r.period.toLowerCase() === billingPeriodFilter);
    // }, [billingCycle, billingPeriodFilter]);

    // const billingStats = useMemo(() => {
    //     const rows = billingCycle?.data ?? [];
    //     const totalRevenue = rows.reduce((s, r) => s + safeNumber(r.amount), 0);
    //     const monthly = rows.filter((r) => r.period.toLowerCase() === 'monthly');
    //     const yearly = rows.filter((r) => r.period.toLowerCase() === 'yearly');
    //     const monthlyRevenue = monthly.reduce((s, r) => s + safeNumber(r.amount), 0);
    //     const yearlyRevenue = yearly.reduce((s, r) => s + safeNumber(r.amount), 0);
    //     return { total: rows.length, totalRevenue, monthlyRevenue, yearlyRevenue, monthlyCount: monthly.length, yearlyCount: yearly.length };
    // }, [billingCycle]);

    /** Billing Cycle bar chart: group by product+period */
    // const billingBarData = useMemo(() => {
    //     const rows = billingCycle?.data ?? [];
    //     const map: Record<string, { product: string; monthly: number; yearly: number }> = {};
    //     rows.forEach((r) => {
    //         const key = r.product;
    //         if (!map[key]) map[key] = { product: formatProductName(r.product), monthly: 0, yearly: 0 };
    //         if (r.period.toLowerCase() === 'monthly') map[key].monthly += safeNumber(r.amount);
    //         else map[key].yearly += safeNumber(r.amount);
    //     });
    //     return Object.values(map);
    // }, [billingCycle]);

    // ─── NEW v5 derived data ──────────────────────────────────────────────────

    /** Email Sent: build chart series based on selected period */
    const emailSentChartData = useMemo(() => {
        if (!emailSentHistory) return [];
        if (emailSentPeriod === 'Weekly') {
            return (emailSentHistory.weekly?.data ?? []).map((d) => ({
                period: d.day,
                count: safeNumber(d.count),
            }));
        }
        if (emailSentPeriod === 'Monthly') {
            return (emailSentHistory.monthly?.data ?? []).map((d) => ({
                period: d.label,
                count: safeNumber(d.count),
            }));
        }
        // Yearly
        return (emailSentHistory.yearly?.data ?? []).map((d) => ({
            period: String(d.year),
            count: safeNumber(d.count),
        }));
    }, [emailSentHistory, emailSentPeriod]);

    const emailSentTotals = useMemo(() => {
        if (!emailSentHistory) return { weekly: 0, monthly: 0, yearly: 0 };
        return {
            weekly: safeNumber(emailSentHistory.weekly?.total),
            monthly: safeNumber(emailSentHistory.monthly?.total),
            yearly: safeNumber(emailSentHistory.yearly?.total),
        };
    }, [emailSentHistory]);

    const emailSentActivePeriodTotal = useMemo(() => {
        if (emailSentPeriod === 'Weekly') return emailSentTotals.weekly;
        if (emailSentPeriod === 'Monthly') return emailSentTotals.monthly;
        return emailSentTotals.yearly;
    }, [emailSentPeriod, emailSentTotals]);

    // ─────────────────────────────────────────────────────────────────────────

    const affiliates = data?.affiliateUsers ?? [];
    const sales = data?.salesUsers ?? [];
    // const latestNotes = data?.latestThreeNotes ?? [];
    const billboardApprovals = data?.latestBillBoardApprovels ?? [];
    const latestApplicants = data?.latestJobApplicants ?? [];
    // const rsvpEvents = data?.rsvpEvents ?? [];
    // const checkoutRevenues = (data?.checkoutRevenues ?? []) as CheckoutRevenue[];
    const userProducts = (data?.userProducts ?? []) as ProductUser[];

    const timeAgo = (iso?: string) => {
        if (!iso) return '-';
        const ts = new Date(iso).getTime();
        if (Number.isNaN(ts)) return '-';
        const diff = Date.now() - ts;
        const s = Math.floor(diff / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);
        if (d > 0) return `${d}d ago`;
        if (h > 0) return `${h}h ago`;
        if (m > 0) return `${m}m ago`;
        return 'Just now';
    };

    const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-');

    const getRecentActivity = () => {
        const allActivity = [
            ...affiliates.map((u) => ({ type: 'Affiliate Signup', date: u.createdAt, name: `${u.firstName} ${u.lastName}` })),
            ...sales.map((u) => ({ type: 'Sales Signup', date: u.createdAt, name: `${u.firstName} ${u.lastName}` })),
            ...latestApplicants.map((a) => ({ type: 'Job Application', date: a.createdAt, name: `${a.firstName} ${a.lastName}` })),
            ...billboardApprovals.map((b) => ({ type: 'Billboard Request', date: b.createdAt, name: b.fullName })),
        ];
        return allActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    };

    // function getRevenueBreakdownFromUsers(users: ProductUser[]) {
    //     const productMap: Record<string, { revenue: number; transactions: number; customers: Set<number> }> = {};
    //     users.forEach((user) => {
    //         const checkouts = Array.isArray(user.Checkouts) ? user.Checkouts : [];
    //         checkouts.forEach((checkout) => {
    //             if (!checkout || checkout.deleted || !checkout.paid) return;
    //             const key = checkout.product || 'Unknown';
    //             if (!productMap[key]) productMap[key] = { revenue: 0, transactions: 0, customers: new Set<number>() };
    //             productMap[key].revenue += checkout.amount || 0;
    //             productMap[key].transactions += 1;
    //             productMap[key].customers.add(user.id);
    //         });
    //     });
    //     return Object.entries(productMap)
    //         .map(([product, info]) => ({
    //             product: formatProductName(product),
    //             revenue: info.revenue,
    //             transactions: info.transactions,
    //             customers: info.customers.size,
    //         }))
    //         .sort((a, b) => b.revenue - a.revenue);
    // }

    function getAllPayingCustomers(users: ProductUser[]) {
        const rows: { id: number; name: string; email: string; totalRevenue: number; productsBought: string[]; lastPurchaseDate: string | null }[] = [];
        users.forEach((user) => {
            const checkouts = Array.isArray(user.Checkouts) ? user.Checkouts : [];
            let total = 0;
            const products = new Set<string>();
            let lastPurchase: string | null = null;
            checkouts.forEach((checkout) => {
                if (!checkout || checkout.deleted || !checkout.paid) return;
                total += checkout.amount || 0;
                products.add(formatProductName(checkout.product));
                if (!lastPurchase || new Date(checkout.createdAt) > new Date(lastPurchase)) lastPurchase = checkout.createdAt;
            });
            if (total > 0)
                rows.push({
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    email: user.email,
                    totalRevenue: total,
                    productsBought: Array.from(products),
                    lastPurchaseDate: lastPurchase,
                });
        });
        return rows;
    }

    function sortCustomers(customers: ReturnType<typeof getAllPayingCustomers>) {
        return customers.sort((a, b) => {
            if (sortBy === 'revenue') return sortOrder === 'desc' ? b.totalRevenue - a.totalRevenue : a.totalRevenue - b.totalRevenue;
            const dateA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
            const dateB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }

    const recentActivity = getRecentActivity();
    const allPayingCustomersRaw = getAllPayingCustomers(userProducts);
    const sortedCustomers = sortCustomers(allPayingCustomersRaw);
    const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / itemsPerPage));
    const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // const derivedTotalRevenue = (data?.checkoutRevenues ?? []).reduce((s, r) => s + safeNumber(r._sum?.amount), 0);
    // const apiTotalProfit = data?.totalProfit?._sum?.amount;
    // const totalProfit = typeof apiTotalProfit === 'number' && Number.isFinite(apiTotalProfit) ? apiTotalProfit : derivedTotalRevenue;
    // const totalPayingCustomers = userProducts.filter((u) => Array.isArray(u.Checkouts) && u.Checkouts.some((c) => c && c.paid && !c.deleted)).length;

    const handleSort = (column: 'revenue' | 'date') => {
        if (sortBy === column) setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        else {
            setSortBy(column);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    const salesSeries = useMemo(
        () => buildMetricSeries(salesMetricData, salesMetricType, salesMetricPeriod),
        [salesMetricData, salesMetricType, salesMetricPeriod]
    );
    const salesSelectedValue = useMemo(
        () => getMetricValue(salesMetricData, salesMetricType, salesMetricPeriod),
        [salesMetricData, salesMetricType, salesMetricPeriod]
    );
    const salesSelectedLabel = useMemo(() => formatMetricValue(salesMetricType, safeNumber(salesSelectedValue, 0)), [salesMetricType, salesSelectedValue]);

    const affiliateSeries = useMemo(
        () => buildMetricSeries(affiliateMetricData, affiliateMetricType, affiliateMetricPeriod),
        [affiliateMetricData, affiliateMetricType, affiliateMetricPeriod]
    );
    const affiliateSelectedValue = useMemo(
        () => getMetricValue(affiliateMetricData, affiliateMetricType, affiliateMetricPeriod),
        [affiliateMetricData, affiliateMetricType, affiliateMetricPeriod]
    );
    const affiliateSelectedLabel = useMemo(
        () => formatMetricValue(affiliateMetricType, safeNumber(affiliateSelectedValue, 0)),
        [affiliateMetricType, affiliateSelectedValue]
    );

    const totalKpiChartData = useMemo(() => {
        const counts = totalKpi?.countsByRole ?? {};
        const entries = Object.entries(counts).map(([key, val]) => ({ name: formatProductName(key), key, value: safeNumber(val, 0) }));
        const priority = ['Sales', 'Affiliate', 'SuperiorAffiliate', 'WebsiteSales', 'Website Sales', 'Superior Affiliate'];
        const sorted = [...entries.filter((e) => priority.includes(e.key)), ...entries.filter((e) => !priority.includes(e.key))];
        const seen = new Set<string>();
        return sorted.filter((e) => {
            if (seen.has(e.key)) return false;
            seen.add(e.key);
            return true;
        });
    }, [totalKpi]);

    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className='max-w-7xl mx-auto space-y-8'>
                {/* Header */}
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg shadow-lg p-8 text-white'>
                    <h1 className='text-4xl font-bold mb-2'>Analytics Dashboard</h1>
                    <p className='text-blue-100'>Comprehensive KPI metrics and insights</p>
                    {isLoading && <div className='mt-4 text-sm'>Loading data...</div>}
                </div>

                {errorMsg && (
                    <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
                        <h3 className='text-lg font-semibold text-red-800 mb-2'>KPI API Error</h3>
                        <p className='text-red-600'>{errorMsg}</p>
                        <button onClick={() => window.location.reload()} className='mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'>
                            Retry
                        </button>
                    </div>
                )}

                {/* ============================================================ */}
                {/* ✅ NEW CHART A: Product Revenue — MRR & ARR                  */}
                {/* GET /api/v4/product-revenue-chart                            */}
                {/* ============================================================ */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Product Revenue — MRR &amp; ARR</h3>
                            <p className='text-sm text-gray-500 mt-0.5'>Monthly and annual recurring revenue per product</p>
                        </div>
                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                            {/* Product filter */}
                            <select
                                value={selectedRevenueProduct}
                                onChange={(e) => setSelectedRevenueProduct(e.target.value)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                {productRevenueOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt === 'All' ? 'All Products' : formatProductName(opt)}
                                    </option>
                                ))}
                            </select>
                            {/* Summary pills */}
                            <div className='flex gap-2'>
                                <StatPill label='Total MRR' value={currency(productRevenueTotals.totalMRR)} color='border-blue-200 bg-blue-50 text-blue-800' />
                                <StatPill
                                    label='Total ARR'
                                    value={currency(productRevenueTotals.totalARR)}
                                    color='border-indigo-200 bg-indigo-50 text-indigo-800'
                                />
                            </div>
                        </div>
                    </div>

                    {productRevenueError && <div className='mb-4 text-sm text-red-600'>{productRevenueError}</div>}

                    {productRevenueLoading ? (
                        <div className='h-64 flex items-center justify-center text-gray-400'>Loading product revenue...</div>
                    ) : productRevenueChartData.length > 0 ? (
                        <>
                            <ResponsiveContainer width='100%' height={280}>
                                <LineChart data={productRevenueChartData}>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                                    <XAxis dataKey='product' tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        cursor={<HorizontalCursor />}
                                        formatter={(value: any) => currency(safeNumber(value))}
                                        labelFormatter={(label) => `Product: ${label}`}
                                    />
                                    <Legend />
                                    <Line
                                        type='monotone'
                                        dataKey='MRR'
                                        name='MRR (Monthly)'
                                        stroke='#3b82f6'
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#3b82f6', stroke: '#3b82f6', strokeWidth: 2 }}
                                        activeDot={{ r: 7 }}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='ARR'
                                        name='ARR (Yearly)'
                                        stroke='#6366f1'
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#6366f1', stroke: '#6366f1', strokeWidth: 2 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                            {/* Breakdown table */}
                            <div className='mt-4 overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead>
                                        <tr className='border-b border-gray-100'>
                                            <th className='py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide'>Product</th>
                                            <th className='py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wide'>MRR</th>
                                            <th className='py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wide'>ARR</th>
                                            <th className='py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wide'>Combined</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-50'>
                                        {productRevenueChartData.map((row) => (
                                            <tr key={row.productKey} className='hover:bg-gray-50'>
                                                <td className='py-2 font-medium text-gray-800'>{row.product}</td>
                                                <td className='py-2 text-right text-blue-700'>{currency(row.MRR)}</td>
                                                <td className='py-2 text-right text-indigo-700'>{currency(row.ARR)}</td>
                                                <td className='py-2 text-right font-semibold text-gray-900'>{currency(row.MRR + row.ARR)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className='h-64 flex items-center justify-center text-gray-400'>No product revenue data</div>
                    )}
                </div>

                {/* ============================================================ */}
                {/* ✅ NEW CHART B: Lightning Membership Revenue                  */}
                {/* GET /api/v4/lightning-membership-revenue                      */}
                {/* ============================================================ */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Lightning Membership Revenue</h3>
                            <p className='text-sm text-gray-500 mt-0.5'>Monthly &amp; annual revenue by membership tier</p>
                        </div>
                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                            {/* Tier filter toggle */}
                            <div className='flex rounded-lg border border-gray-200 overflow-hidden text-sm'>
                                {(['All', 'LightningGold', 'LightningSilver'] as const).map((tier) => (
                                    <button
                                        key={tier}
                                        onClick={() => setLightningFilter(tier)}
                                        className={`px-3 py-2 transition-colors ${
                                            lightningFilter === tier ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {tier === 'All' ? 'All Tiers' : tier === 'LightningGold' ? '⚡ Gold' : '⚡ Silver'}
                                    </button>
                                ))}
                            </div>
                            <div className='flex gap-2'>
                                <StatPill
                                    label='Total Monthly'
                                    value={currency(lightningTotals.totalMonthly)}
                                    color='border-amber-200 bg-amber-50 text-amber-800'
                                />
                                <StatPill
                                    label='Total Yearly'
                                    value={currency(lightningTotals.totalYearly)}
                                    color='border-slate-200 bg-slate-50 text-slate-700'
                                />
                            </div>
                        </div>
                    </div>

                    {lightningMembershipError && <div className='mb-4 text-sm text-red-600'>{lightningMembershipError}</div>}

                    {lightningMembershipLoading ? (
                        <div className='h-64 flex items-center justify-center text-gray-400'>Loading membership revenue...</div>
                    ) : lightningChartData.length > 0 ? (
                        <>
                            <ResponsiveContainer width='100%' height={260}>
                                <LineChart data={lightningChartData}>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                                    <XAxis dataKey='product' tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
                                    <Tooltip cursor={<HorizontalCursor />} formatter={(value: any) => currency(safeNumber(value))} />
                                    <Legend />
                                    <Line
                                        type='monotone'
                                        dataKey='Monthly'
                                        name='Monthly'
                                        stroke='#f59e0b'
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#f59e0b', stroke: '#f59e0b', strokeWidth: 2 }}
                                        activeDot={{ r: 7 }}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='Yearly'
                                        name='Yearly'
                                        stroke='#78716c'
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#78716c', stroke: '#78716c', strokeWidth: 2 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                            <div className='mt-4 flex flex-wrap gap-4'>
                                {lightningChartData.map((row, i) => (
                                    <div
                                        key={row.productKey}
                                        className={`flex-1 min-w-[200px] rounded-xl p-4 border ${
                                            i === 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'
                                        }`}
                                    >
                                        <div className={`text-sm font-semibold mb-2 ${i === 0 ? 'text-amber-800' : 'text-slate-700'}`}>⚡ {row.product}</div>
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-gray-500'>Monthly</span>
                                            <span className='font-semibold text-gray-900'>{currency(row.Monthly)}</span>
                                        </div>
                                        <div className='flex justify-between text-sm mt-1'>
                                            <span className='text-gray-500'>Yearly</span>
                                            <span className='font-semibold text-gray-900'>{currency(row.Yearly)}</span>
                                        </div>
                                        <div className='flex justify-between text-sm mt-2 pt-2 border-t border-gray-200'>
                                            <span className='text-gray-500 font-medium'>Combined</span>
                                            <span className='font-bold text-gray-900'>{currency(row.Monthly + row.Yearly)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className='h-64 flex items-center justify-center text-gray-400'>No membership revenue data</div>
                    )}
                </div>

                {/* ============================================================ */}
                {/* ✅ NEW CHART D: Emails Sent History                           */}
                {/* GET /api/v5/email-sent-history                               */}
                {/* ============================================================ */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Emails Sent</h3>
                            <p className='text-sm text-gray-500 mt-0.5'>Weekly, monthly, and yearly email send volume</p>
                        </div>
                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                            {/* Period toggle */}
                            <div className='flex rounded-lg border border-gray-200 overflow-hidden text-sm'>
                                {(['Weekly', 'Monthly', 'Yearly'] as const).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setEmailSentPeriod(period)}
                                        className={`px-3 py-2 transition-colors ${
                                            emailSentPeriod === period ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                            {/* Summary pills */}
                            <div className='flex gap-2'>
                                <StatPill label='This Week' value={String(emailSentTotals.weekly)} color='border-cyan-200 bg-cyan-50 text-cyan-800' />
                                <StatPill label='This Year' value={String(emailSentTotals.yearly)} color='border-teal-200 bg-teal-50 text-teal-800' />
                            </div>
                        </div>
                    </div>

                    {emailSentError && <div className='mb-4 text-sm text-red-600'>{emailSentError}</div>}

                    {emailSentLoading ? (
                        <div className='h-64 flex items-center justify-center text-gray-400'>Loading email sent history...</div>
                    ) : emailSentChartData.length > 0 ? (
                        <>
                            {/* Active period total badge */}
                            <div className='mb-4 flex items-center gap-2'>
                                <span className='text-sm text-gray-500'>
                                    {emailSentPeriod === 'Weekly'
                                        ? 'Emails sent this week:'
                                        : emailSentPeriod === 'Monthly'
                                        ? 'Emails sent this year (by month):'
                                        : 'Emails sent across all years:'}
                                </span>
                                <span className='px-3 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-sm font-semibold'>
                                    {emailSentActivePeriodTotal} emails
                                </span>
                            </div>

                            <ResponsiveContainer width='100%' height={260}>
                                <LineChart data={emailSentChartData}>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                                    <XAxis dataKey='period' tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} tickFormatter={(v) => String(v)} />
                                    <Tooltip
                                        cursor={<HorizontalCursor />}
                                        formatter={(value: any) => [`${safeNumber(value)} emails`, 'Emails Sent']}
                                        labelFormatter={(label) =>
                                            emailSentPeriod === 'Weekly'
                                                ? `Day: ${label}`
                                                : emailSentPeriod === 'Monthly'
                                                ? `Month: ${label}`
                                                : `Year: ${label}`
                                        }
                                    />
                                    <Legend />
                                    <Line
                                        type='monotone'
                                        dataKey='count'
                                        name='Emails Sent'
                                        stroke='#06b6d4'
                                        strokeWidth={3}
                                        dot={(props: any) => {
                                            const { cx, cy, payload } = props || {};
                                            if (typeof cx !== 'number' || typeof cy !== 'number') return null;
                                            const hasData = safeNumber(payload?.count) > 0;
                                            return (
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={hasData ? 5 : 3}
                                                    fill={hasData ? '#06b6d4' : 'rgba(6,182,212,0.3)'}
                                                    stroke='#06b6d4'
                                                    strokeWidth={hasData ? 2 : 1}
                                                />
                                            );
                                        }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                            {/* Breakdown summary row */}
                            <div className='mt-4 grid grid-cols-3 gap-3'>
                                {[
                                    { label: 'Weekly Total', value: emailSentTotals.weekly, color: 'border-cyan-200 bg-cyan-50 text-cyan-800' },
                                    { label: 'Monthly Total', value: emailSentTotals.monthly, color: 'border-sky-200 bg-sky-50 text-sky-800' },
                                    { label: 'Yearly Total', value: emailSentTotals.yearly, color: 'border-teal-200 bg-teal-50 text-teal-800' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className={`rounded-xl p-4 border ${color} text-center`}>
                                        <div className='text-xs font-medium uppercase tracking-wide opacity-70 mb-1'>{label}</div>
                                        <div className='text-2xl font-bold'>{value}</div>
                                        <div className='text-xs mt-0.5 opacity-60'>emails</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className='h-64 flex items-center justify-center text-gray-400'>No email sent data</div>
                    )}
                </div>

                {/* ──────────────────── Existing v3 Charts ──────────────────── */}

                {/* LINE CHART #1: Total Sales */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Total Sales (Sales Team)</h3>
                            <p className='text-sm text-gray-500'>Choose product + metric + timeframe (Week/Month/Year)</p>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-3'>
                            <select
                                value={salesProduct}
                                onChange={(e) => setSalesProduct(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                {METRIC_PRODUCTS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={salesMetricType}
                                onChange={(e) => setSalesMetricType(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Revenue'>Revenue</option>
                                <option value='Subscribers'>Subscribers</option>
                                <option value='ChurnRate'>Churn Rate</option>
                            </select>
                            <select
                                value={salesMetricPeriod}
                                onChange={(e) => setSalesMetricPeriod(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Week'>Week</option>
                                <option value='Month'>Month</option>
                                <option value='Year'>Year</option>
                            </select>
                            <div className='px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm'>
                                <span className='text-gray-500 mr-2'>Selected:</span>
                                <span className='font-semibold text-gray-900'>{salesSelectedLabel}</span>
                            </div>
                        </div>
                    </div>
                    {salesMetricError && <div className='mb-4 text-sm text-red-600'>{salesMetricError}</div>}
                    {salesMetricLoading ? (
                        <div className='h-56 flex items-center justify-center text-gray-400'>Loading sales chart...</div>
                    ) : salesSeries.length > 0 ? (
                        <ResponsiveContainer width='100%' height={240}>
                            <LineChart data={salesSeries as any}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='period' />
                                <YAxis />
                                <Tooltip
                                    cursor={<HorizontalCursor />}
                                    formatter={(value: any) => {
                                        const v = safeNumber(value, 0);
                                        if (salesMetricType === 'Revenue') return currency(v);
                                        if (salesMetricType === 'Subscribers') return `${v}`;
                                        return percent(v);
                                    }}
                                />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='value'
                                    name={salesMetricType === 'ChurnRate' ? 'Churn Rate' : salesMetricType}
                                    stroke='#2c7bbe'
                                    strokeWidth={3}
                                    dot={(props: any) => {
                                        const { cx, cy, payload } = props || {};
                                        if (typeof cx !== 'number' || typeof cy !== 'number') return null;
                                        const active = Boolean(payload?.active);
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={active ? 6 : 4}
                                                fill={active ? '#2c7bbe' : 'rgba(44,123,190,0.35)'}
                                                stroke='#2c7bbe'
                                                strokeWidth={active ? 2 : 1}
                                            />
                                        );
                                    }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='h-56 flex items-center justify-center text-gray-400'>No sales data</div>
                    )}
                </div>

                {/* LINE CHART #2: Total Affiliate */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Total Affiliate (Basic Affiliate)</h3>
                            <p className='text-sm text-gray-500'>Choose product + metric + timeframe (Week/Month/Year)</p>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-3'>
                            <select
                                value={affiliateProduct}
                                onChange={(e) => setAffiliateProduct(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                {METRIC_PRODUCTS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={affiliateMetricType}
                                onChange={(e) => setAffiliateMetricType(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Revenue'>Revenue</option>
                                <option value='Subscribers'>Subscribers</option>
                                <option value='ChurnRate'>Churn Rate</option>
                            </select>
                            <select
                                value={affiliateMetricPeriod}
                                onChange={(e) => setAffiliateMetricPeriod(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Week'>Week</option>
                                <option value='Month'>Month</option>
                                <option value='Year'>Year</option>
                            </select>
                            <div className='px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm'>
                                <span className='text-gray-500 mr-2'>Selected:</span>
                                <span className='font-semibold text-gray-900'>{affiliateSelectedLabel}</span>
                            </div>
                        </div>
                    </div>
                    {affiliateMetricError && <div className='mb-4 text-sm text-red-600'>{affiliateMetricError}</div>}
                    {affiliateMetricLoading ? (
                        <div className='h-56 flex items-center justify-center text-gray-400'>Loading affiliate chart...</div>
                    ) : affiliateSeries.length > 0 ? (
                        <ResponsiveContainer width='100%' height={240}>
                            <LineChart data={affiliateSeries as any}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='period' />
                                <YAxis />
                                <Tooltip
                                    cursor={<HorizontalCursor />}
                                    formatter={(value: any) => {
                                        const v = safeNumber(value, 0);
                                        if (affiliateMetricType === 'Revenue') return currency(v);
                                        if (affiliateMetricType === 'Subscribers') return `${v}`;
                                        return percent(v);
                                    }}
                                />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='value'
                                    name={affiliateMetricType === 'ChurnRate' ? 'Churn Rate' : affiliateMetricType}
                                    stroke='#10b981'
                                    strokeWidth={3}
                                    dot={(props: any) => {
                                        const { cx, cy, payload } = props || {};
                                        if (typeof cx !== 'number' || typeof cy !== 'number') return null;
                                        const active = Boolean(payload?.active);
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={active ? 6 : 4}
                                                fill={active ? '#10b981' : 'rgba(16,185,129,0.35)'}
                                                stroke='#10b981'
                                                strokeWidth={active ? 2 : 1}
                                            />
                                        );
                                    }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='h-56 flex items-center justify-center text-gray-400'>No affiliate data</div>
                    )}
                </div>

                {/* LINE CHART #3: Total KPI */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex items-center justify-between gap-4 mb-4'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Total Subscribers</h3>
                            <p className='text-sm text-gray-500'>Sales + Affiliate + other channels</p>
                        </div>
                    </div>
                    {totalKpiError && <div className='mb-4 text-sm text-red-600'>{totalKpiError}</div>}
                    {totalKpiLoading ? (
                        <div className='h-56 flex items-center justify-center text-gray-400'>Loading total KPI...</div>
                    ) : totalKpiChartData.length > 0 ? (
                        <ResponsiveContainer width='100%' height={260}>
                            <LineChart data={totalKpiChartData}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='name' />
                                <YAxis />
                                <Tooltip cursor={<HorizontalCursor />} />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='value'
                                    name='Total'
                                    stroke='#6366f1'
                                    strokeWidth={3}
                                    dot={(props: any) => {
                                        const { cx, cy, index } = props || {};
                                        if (typeof cx !== 'number' || typeof cy !== 'number') return null;
                                        const color = COLORS[(index ?? 0) % COLORS.length];
                                        return <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} strokeWidth={2} />;
                                    }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='h-56 flex items-center justify-center text-gray-400'>No KPI totals available</div>
                    )}
                </div>

                {/* All Paying Customers */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex justify-between items-center mb-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>
                            All Paying Customers (Sorted by {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)})
                        </h3>
                        <div className='space-x-2'>
                            <button onClick={() => handleSort('revenue')} className='px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300'>
                                Sort by Revenue {sortBy === 'revenue' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                            </button>
                            <button onClick={() => handleSort('date')} className='px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300'>
                                Sort by Date {sortBy === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                            </button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className='h-64 flex items-center justify-center text-gray-400'>Loading customers...</div>
                    ) : paginatedCustomers.length > 0 ? (
                        <>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead className='bg-gray-50'>
                                        <tr>
                                            <th className='px-4 py-2 text-left font-medium text-gray-500'>Customer</th>
                                            <th className='px-4 py-2 text-left font-medium text-gray-500'>Email</th>
                                            <th className='px-4 py-2 text-left font-medium text-gray-500'>Products</th>
                                            <th className='px-4 py-2 text-right font-medium text-gray-500'>Revenue</th>
                                            <th className='px-4 py-2 text-right font-medium text-gray-500'>Last purchase</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y'>
                                        {paginatedCustomers.map((customer) => (
                                            <tr key={customer.id} className='hover:bg-gray-50'>
                                                <td className='px-4 py-2 font-medium text-gray-900'>{customer.name}</td>
                                                <td className='px-4 py-2 text-gray-600'>{customer.email}</td>
                                                <td className='px-4 py-2 text-gray-600'>{customer.productsBought.join(', ')}</td>
                                                <td className='px-4 py-2 text-right text-gray-900'>{currency(customer.totalRevenue)}</td>
                                                <td className='px-4 py-2 text-right text-gray-500'>
                                                    {customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className='mt-4 flex justify-between items-center'>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className='px-4 py-2 bg-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-300'
                                >
                                    Previous
                                </button>
                                <span className='text-sm text-gray-600'>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className='px-4 py-2 bg-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-300'
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className='h-64 flex items-center justify-center text-gray-400'>No paying customers yet</div>
                    )}
                </div>

                {/* Recent Activity Table */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Recent Activity</h3>
                    {isLoading ? (
                        <div className='text-center py-8 text-gray-400'>Loading activities...</div>
                    ) : recentActivity.length > 0 ? (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Type</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Name</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Date</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Time Ago</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {recentActivity.map((activity, idx) => (
                                        <tr key={idx} className='hover:bg-gray-50'>
                                            <td className='px-4 py-3 text-sm'>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        activity.type === 'Affiliate Signup'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : activity.type === 'Sales Signup'
                                                            ? 'bg-green-100 text-green-800'
                                                            : activity.type === 'Job Application'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}
                                                >
                                                    {activity.type}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3 text-sm font-medium text-gray-900'>{activity.name}</td>
                                            <td className='px-4 py-3 text-sm text-gray-500'>{formatDate(activity.date)}</td>
                                            <td className='px-4 py-3 text-sm text-gray-500'>{timeAgo(activity.date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className='text-center py-8 text-gray-400'>No recent activity</div>
                    )}
                </div>
            </div>
        </div>
    );
}
