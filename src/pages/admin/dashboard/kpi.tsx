'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

// type LightningMembershipEntry = {
//     product: string;
//     monthly: number;
//     yearly: number;
// };

// type LightningMembershipResponse = {
//     message: string;
//     revenueData: Record<string, LightningMembershipEntry>;
// };

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
        range: {
            startDate: string;
            endDate: string;
            startUtc: string;
            endUtcExclusive: string;
        };
        total: number;
        data: EmailSentWeeklyDay[];
    };
    monthly: {
        type: string;
        timezone: string;
        year: number;
        range: {
            startDate: string;
            endDateExclusive: string;
            startUtc: string;
            endUtcExclusive: string;
        };
        total: number;
        data: EmailSentMonthlyMonth[];
    };
    yearly: {
        type: string;
        timezone: string;
        range: {
            startYear: number;
            endYear: number;
            startDate: string;
            endDateExclusive: string;
            startUtc: string;
            endUtcExclusive: string;
        };
        total: number;
        data: EmailSentYearlyYear[];
    };
};

type FeedbackApiItem = {
    id: number | string;
    authId?: number | string;
    review?: string | null;
    stars?: string | number | null;
    toolName?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    Auth?: {
        id?: number | string;
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    } | null;
};

// ─────────────────────────────────────────────────────────────────────────────

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const METRIC_PRODUCTS = [
    { label: 'Email Marketing', value: 'EmailMarketing' },
    { label: 'Invoice Tool', value: 'InvoiceTool' },
    { label: 'Digital Billboard', value: 'DigitalBillboard' },
    { label: 'Newsletter', value: 'NewsLetter' },
] as const;

type ProductMetricValue = (typeof METRIC_PRODUCTS)[number]['value'];
type AffiliateMetricProduct = ProductMetricValue | 'LightningGold' | 'LightningSilver';

const LIGHTNING_GOLD_PRODUCT_OPTIONS: { label: string; value: AffiliateMetricProduct }[] = [
    { label: 'Lightning Gold', value: 'LightningGold' },
    ...METRIC_PRODUCTS,
];

const LIGHTNING_SILVER_PRODUCT_OPTIONS: { label: string; value: AffiliateMetricProduct }[] = [
    { label: 'Lightning Silver', value: 'LightningSilver' },
    ...METRIC_PRODUCTS,
];

type MetricType = 'Revenue' | 'Subscribers' | 'ChurnRate';
type MetricPeriod = 'Week' | 'Month' | 'Year';
type EmailSentPeriod = 'Weekly' | 'Monthly' | 'Yearly';
type ToolFeedbackMetricType = 'FeedbackCount' | 'AverageStars';

function safeNumber(n: any, fallback = 0) {
    const x = typeof n === 'number' ? n : Number(n);
    return Number.isFinite(x) ? x : fallback;
}

function currency(n?: number | null) {
    const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
    return v.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });
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
    const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to fetch (${res.status}) ${url}`);
    return (await res.json()) as T;
}

function buildZeroMetricResponse(type: 'Sales' | 'Affiliate', product: string): KPIChartMetricResponse {
    return {
        message: 'Metric data unavailable yet. Showing zero values.',
        weeklyRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        weeklySubscribers: 0,
        monthlySubscribers: 0,
        yearlySubscribers: 0,
        weeklyChurnRate: 0,
        monthlyChurnRate: 0,
        yearlyChurnRate: 0,
        type,
        product,
    };
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
    // All Paying Customers table moved to Billing Cycles page.

    // Chart #1 Sales
    const [salesProduct, setSalesProduct] = useState<(typeof METRIC_PRODUCTS)[number]['value']>('DigitalBillboard');
    const [salesMetricType, setSalesMetricType] = useState<MetricType>('Revenue');
    const [salesMetricPeriod, setSalesMetricPeriod] = useState<MetricPeriod>('Week');
    const [salesMetricData, setSalesMetricData] = useState<KPIChartMetricResponse | null>(null);
    const [salesMetricLoading, setSalesMetricLoading] = useState(false);
    const [salesMetricError, setSalesMetricError] = useState<string | null>(null);

    // Chart #2 / #3 Membership Affiliate tiers
    const [lightningGoldProduct, setLightningGoldProduct] = useState<AffiliateMetricProduct>('LightningGold');
    const [lightningGoldMetricType, setLightningGoldMetricType] = useState<MetricType>('Revenue');
    const [lightningGoldMetricPeriod, setLightningGoldMetricPeriod] = useState<MetricPeriod>('Week');
    const [lightningGoldMetricData, setLightningGoldMetricData] = useState<KPIChartMetricResponse | null>(null);
    const [lightningGoldMetricLoading, setLightningGoldMetricLoading] = useState(false);
    const [lightningGoldMetricError, setLightningGoldMetricError] = useState<string | null>(null);

    const [lightningSilverProduct, setLightningSilverProduct] = useState<AffiliateMetricProduct>('LightningSilver');
    const [lightningSilverMetricType, setLightningSilverMetricType] = useState<MetricType>('Revenue');
    const [lightningSilverMetricPeriod, setLightningSilverMetricPeriod] = useState<MetricPeriod>('Week');
    const [lightningSilverMetricData, setLightningSilverMetricData] = useState<KPIChartMetricResponse | null>(null);
    const [lightningSilverMetricLoading, setLightningSilverMetricLoading] = useState(false);
    const [lightningSilverMetricError, setLightningSilverMetricError] = useState<string | null>(null);

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

    // Chart E: Tool Feedback
    const [toolFeedback, setToolFeedback] = useState<FeedbackApiItem[]>([]);
    const [toolFeedbackLoading, setToolFeedbackLoading] = useState(false);
    const [toolFeedbackError, setToolFeedbackError] = useState<string | null>(null);
    const [toolFeedbackTool, setToolFeedbackTool] = useState<string>('All');
    const [toolFeedbackMetricType, setToolFeedbackMetricType] = useState<ToolFeedbackMetricType>('FeedbackCount');
    const [toolFeedbackMetricPeriod, setToolFeedbackMetricPeriod] = useState<MetricPeriod>('Week');

    // ─────────────────────────────────────────────────────────────────────────

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
                setLightningGoldMetricLoading(true);
                setLightningGoldMetricError(null);
                const json = await fetchMetric('Affiliate', lightningGoldProduct);
                if (cancelled) return;
                setLightningGoldMetricData(json);
            } catch {
                if (cancelled) return;
                setLightningGoldMetricError(null);
                setLightningGoldMetricData(buildZeroMetricResponse('Affiliate', lightningGoldProduct));
            } finally {
                if (!cancelled) setLightningGoldMetricLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [lightningGoldProduct]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setLightningSilverMetricLoading(true);
                setLightningSilverMetricError(null);
                const json = await fetchMetric('Affiliate', lightningSilverProduct);
                if (cancelled) return;
                setLightningSilverMetricData(json);
            } catch {
                if (cancelled) return;
                setLightningSilverMetricError(null);
                setLightningSilverMetricData(buildZeroMetricResponse('Affiliate', lightningSilverProduct));
            } finally {
                if (!cancelled) setLightningSilverMetricLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [lightningSilverProduct]);

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

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setToolFeedbackLoading(true);
                setToolFeedbackError(null);

                const json = await fetchJSON<FeedbackApiItem[] | { data?: FeedbackApiItem[] }>('/api/v5/tool-feedback');
                const payload = json as any;
                const list: FeedbackApiItem[] = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

                if (cancelled) return;
                setToolFeedback(list);
            } catch (e: any) {
                if (cancelled) return;
                setToolFeedbackError(e?.message || 'Failed to load tool feedback chart');
                setToolFeedback([]);
            } finally {
                if (!cancelled) setToolFeedbackLoading(false);
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

    const toolFeedbackToolOptions = useMemo(() => {
        const tools = Array.from(new Set(toolFeedback.map((item) => item.toolName?.trim()).filter(Boolean) as string[]));
        return ['All', ...tools.sort((a, b) => formatProductName(a).localeCompare(formatProductName(b)))];
    }, [toolFeedback]);

    const filteredToolFeedback = useMemo(() => {
        if (toolFeedbackTool === 'All') return toolFeedback;
        return toolFeedback.filter((item) => (item.toolName?.trim() || 'Unknown') === toolFeedbackTool);
    }, [toolFeedback, toolFeedbackTool]);

    const toolFeedbackChartData = useMemo(() => {
        const buildBucket = (period: string, active = false) => ({
            period,
            feedbacks: 0,
            starSum: 0,
            starCount: 0,
            value: 0,
            active,
        });

        const now = new Date();
        let buckets: ReturnType<typeof buildBucket>[] = [];

        if (toolFeedbackMetricPeriod === 'Week') {
            const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const currentDayIndex = (now.getDay() + 6) % 7;
            buckets = labels.map((label, index) => buildBucket(label, index === currentDayIndex));

            const weekStart = new Date(now);
            weekStart.setHours(0, 0, 0, 0);
            weekStart.setDate(weekStart.getDate() - currentDayIndex);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            filteredToolFeedback.forEach((item) => {
                const date = item.createdAt ? new Date(item.createdAt) : null;
                if (!date || Number.isNaN(date.getTime())) return;
                if (date < weekStart || date >= weekEnd) return;

                const bucketIndex = (date.getDay() + 6) % 7;
                const bucket = buckets[bucketIndex];
                bucket.feedbacks += 1;

                const starValue = item.stars != null ? Number(item.stars) : Number.NaN;
                if (Number.isFinite(starValue)) {
                    bucket.starSum += starValue;
                    bucket.starCount += 1;
                }
            });
        }

        if (toolFeedbackMetricPeriod === 'Month') {
            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentMonthIndex = now.getMonth();
            const currentYear = now.getFullYear();
            buckets = labels.map((label, index) => buildBucket(label, index === currentMonthIndex));

            filteredToolFeedback.forEach((item) => {
                const date = item.createdAt ? new Date(item.createdAt) : null;
                if (!date || Number.isNaN(date.getTime())) return;
                if (date.getFullYear() !== currentYear) return;

                const bucket = buckets[date.getMonth()];
                bucket.feedbacks += 1;

                const starValue = item.stars != null ? Number(item.stars) : Number.NaN;
                if (Number.isFinite(starValue)) {
                    bucket.starSum += starValue;
                    bucket.starCount += 1;
                }
            });
        }

        if (toolFeedbackMetricPeriod === 'Year') {
            const labels = getMetricPeriodLabels('Year');
            const currentYear = now.getFullYear();
            buckets = labels.map((label) => buildBucket(label, Number(label) === currentYear));

            filteredToolFeedback.forEach((item) => {
                const date = item.createdAt ? new Date(item.createdAt) : null;
                if (!date || Number.isNaN(date.getTime())) return;

                const yearLabel = String(date.getFullYear());
                const bucket = buckets.find((row) => row.period === yearLabel);
                if (!bucket) return;

                bucket.feedbacks += 1;

                const starValue = item.stars != null ? Number(item.stars) : Number.NaN;
                if (Number.isFinite(starValue)) {
                    bucket.starSum += starValue;
                    bucket.starCount += 1;
                }
            });
        }

        return buckets.map((bucket) => {
            const averageStars = bucket.starCount ? Number((bucket.starSum / bucket.starCount).toFixed(1)) : 0;
            return {
                period: bucket.period,
                feedbacks: bucket.feedbacks,
                averageStars,
                value: toolFeedbackMetricType === 'FeedbackCount' ? bucket.feedbacks : averageStars,
                active: bucket.active,
            };
        });
    }, [filteredToolFeedback, toolFeedbackMetricType, toolFeedbackMetricPeriod]);

    const toolFeedbackStats = useMemo(() => {
        const validStars = filteredToolFeedback.map((item) => (item.stars != null ? Number(item.stars) : Number.NaN)).filter((value) => Number.isFinite(value));

        const averageStars = validStars.length ? (validStars.reduce((sum, value) => sum + value, 0) / validStars.length).toFixed(1) : '-';

        const toolCountMap: Record<string, number> = {};
        toolFeedback.forEach((item) => {
            const toolKey = item.toolName?.trim() || 'Unknown';
            toolCountMap[toolKey] = (toolCountMap[toolKey] || 0) + 1;
        });

        const topToolKey = Object.entries(toolCountMap).sort((a, b) => b[1] - a[1])[0]?.[0];

        return {
            total: filteredToolFeedback.length,
            averageStars,
            topTool: topToolKey ? formatProductName(topToolKey) : '-',
        };
    }, [filteredToolFeedback, toolFeedback]);

    const toolFeedbackSelectedValue = useMemo(() => {
        const activeRow = toolFeedbackChartData.find((item) => item.active) || toolFeedbackChartData[toolFeedbackChartData.length - 1];
        return safeNumber(activeRow?.value, 0);
    }, [toolFeedbackChartData]);

    const toolFeedbackSelectedLabel = useMemo(() => {
        if (toolFeedbackMetricType === 'AverageStars') return `${toolFeedbackSelectedValue.toFixed(1)} ★`;
        return `${toolFeedbackSelectedValue} feedbacks`;
    }, [toolFeedbackMetricType, toolFeedbackSelectedValue]);

    // ─────────────────────────────────────────────────────────────────────────

    const salesSeries = useMemo(
        () => buildMetricSeries(salesMetricData, salesMetricType, salesMetricPeriod),
        [salesMetricData, salesMetricType, salesMetricPeriod]
    );
    const salesSelectedValue = useMemo(
        () => getMetricValue(salesMetricData, salesMetricType, salesMetricPeriod),
        [salesMetricData, salesMetricType, salesMetricPeriod]
    );
    const salesSelectedLabel = useMemo(() => formatMetricValue(salesMetricType, safeNumber(salesSelectedValue, 0)), [salesMetricType, salesSelectedValue]);

    const lightningGoldSeries = useMemo(
        () => buildMetricSeries(lightningGoldMetricData, lightningGoldMetricType, lightningGoldMetricPeriod),
        [lightningGoldMetricData, lightningGoldMetricType, lightningGoldMetricPeriod]
    );
    const lightningGoldSelectedValue = useMemo(
        () => getMetricValue(lightningGoldMetricData, lightningGoldMetricType, lightningGoldMetricPeriod),
        [lightningGoldMetricData, lightningGoldMetricType, lightningGoldMetricPeriod]
    );
    const lightningGoldSelectedLabel = useMemo(
        () => formatMetricValue(lightningGoldMetricType, safeNumber(lightningGoldSelectedValue, 0)),
        [lightningGoldMetricType, lightningGoldSelectedValue]
    );

    const lightningSilverSeries = useMemo(
        () => buildMetricSeries(lightningSilverMetricData, lightningSilverMetricType, lightningSilverMetricPeriod),
        [lightningSilverMetricData, lightningSilverMetricType, lightningSilverMetricPeriod]
    );
    const lightningSilverSelectedValue = useMemo(
        () => getMetricValue(lightningSilverMetricData, lightningSilverMetricType, lightningSilverMetricPeriod),
        [lightningSilverMetricData, lightningSilverMetricType, lightningSilverMetricPeriod]
    );
    const lightningSilverSelectedLabel = useMemo(
        () => formatMetricValue(lightningSilverMetricType, safeNumber(lightningSilverSelectedValue, 0)),
        [lightningSilverMetricType, lightningSilverSelectedValue]
    );

    const totalKpiChartData = useMemo(() => {
        const counts = totalKpi?.countsByRole ?? {};
        const entries = Object.entries(counts).map(([key, val]) => ({
            name: formatProductName(key),
            key,
            value: safeNumber(val, 0),
        }));
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
                </div>

                {/* ============================================================ */}
                {/* ✅ NEW CHART: Tool Feedback Analytics                         */}
                {/* GET /api/v5/tool-feedback                                    */}
                {/* ============================================================ */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Tool Feedback</h3>
                            <p className='text-sm text-gray-500'>Choose tool + metric + timeframe (Week/Month/Year)</p>

                            <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500'>
                                <span>
                                    Total: <span className='font-semibold text-gray-800'>{toolFeedbackStats.total}</span>
                                </span>
                                <span className='hidden h-3 w-px bg-gray-200 sm:inline-block'></span>
                                <span>
                                    Avg Stars: <span className='font-semibold text-gray-800'>{toolFeedbackStats.averageStars}</span>
                                </span>
                                <span className='hidden h-3 w-px bg-gray-200 sm:inline-block'></span>
                                <span>
                                    Top Tool: <span className='font-semibold text-gray-800'>{toolFeedbackStats.topTool}</span>
                                </span>
                            </div>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-3'>
                            <select
                                value={toolFeedbackTool}
                                onChange={(e) => setToolFeedbackTool(e.target.value)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                {toolFeedbackToolOptions.map((tool) => (
                                    <option key={tool} value={tool}>
                                        {tool === 'All' ? 'All Tools' : formatProductName(tool)}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={toolFeedbackMetricType}
                                onChange={(e) => setToolFeedbackMetricType(e.target.value as ToolFeedbackMetricType)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='FeedbackCount'>Feedback Count</option>
                                <option value='AverageStars'>Average Stars</option>
                            </select>

                            <select
                                value={toolFeedbackMetricPeriod}
                                onChange={(e) => setToolFeedbackMetricPeriod(e.target.value as MetricPeriod)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Week'>Week</option>
                                <option value='Month'>Month</option>
                                <option value='Year'>Year</option>
                            </select>

                            <div className='px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm'>
                                <span className='text-gray-500 mr-2'>Selected:</span>
                                <span className='font-semibold text-gray-900'>{toolFeedbackSelectedLabel}</span>
                            </div>
                        </div>
                    </div>

                    {toolFeedbackError && <div className='mb-4 text-sm text-red-600'>{toolFeedbackError}</div>}

                    {toolFeedbackLoading ? (
                        <div className='h-56 flex items-center justify-center text-gray-400'>Loading feedback chart...</div>
                    ) : toolFeedback.length > 0 ? (
                        <ResponsiveContainer width='100%' height={240}>
                            <LineChart data={toolFeedbackChartData as any}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='period' />
                                <YAxis
                                    domain={toolFeedbackMetricType === 'AverageStars' ? [0, 5] : undefined}
                                    allowDecimals={toolFeedbackMetricType === 'AverageStars'}
                                />
                                <Tooltip
                                    cursor={<HorizontalCursor />}
                                    formatter={(value: any) => {
                                        const v = safeNumber(value, 0);
                                        if (toolFeedbackMetricType === 'AverageStars') return `${v.toFixed(1)} ★`;
                                        return `${v}`;
                                    }}
                                />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='value'
                                    name={toolFeedbackMetricType === 'AverageStars' ? 'Average Stars' : 'Feedback Count'}
                                    stroke='#8b5cf6'
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
                                                fill={active ? '#8b5cf6' : 'rgba(139,92,246,0.35)'}
                                                stroke='#8b5cf6'
                                                strokeWidth={active ? 2 : 1}
                                            />
                                        );
                                    }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='h-56 flex items-center justify-center text-gray-400'>No feedback data available</div>
                    )}
                </div>

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
                                        dot={{
                                            r: 4,
                                            fill: '#3b82f6',
                                            stroke: '#3b82f6',
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{ r: 7 }}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='ARR'
                                        name='ARR (Yearly)'
                                        stroke='#6366f1'
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                            fill: '#6366f1',
                                            stroke: '#6366f1',
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                            {/* Breakdown table */}
                            {/* <div className='mt-4 overflow-x-auto'>
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
                            </div> */}
                        </>
                    ) : (
                        <div className='h-64 flex items-center justify-center text-gray-400'>No product revenue data</div>
                    )}
                </div>

                {/* ============================================================ */}
                {/* ✅ NEW CHART B: Lightning Gold Membership                     */}
                {/* Basic affiliate chart removed; membership tier chart added     */}
                {/* ============================================================ */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
                        <div>
                            {/* <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                                    Membership
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                    Product: Lightning Gold
                                </span>
                            </div> */}
                            <h3 className='text-lg font-semibold text-gray-800'>Lightning Gold</h3>
                            <p className='text-sm text-gray-500'>Choose program/product, revenue, subscribers, or churn by Week/Month/Year</p>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-3'>
                            <select
                                value={lightningGoldProduct}
                                onChange={(e) => setLightningGoldProduct(e.target.value as AffiliateMetricProduct)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                {LIGHTNING_GOLD_PRODUCT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={lightningGoldMetricType}
                                onChange={(e) => setLightningGoldMetricType(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Revenue'>Revenue</option>
                                <option value='Subscribers'>Subscribers</option>
                                <option value='ChurnRate'>Churn (Unsubscribed)</option>
                            </select>
                            <select
                                value={lightningGoldMetricPeriod}
                                onChange={(e) => setLightningGoldMetricPeriod(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Week'>Week</option>
                                <option value='Month'>Month</option>
                                <option value='Year'>Year</option>
                            </select>
                            <div className='px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm'>
                                <span className='text-gray-500 mr-2'>Selected:</span>
                                <span className='font-semibold text-gray-900'>{lightningGoldSelectedLabel}</span>
                            </div>
                        </div>
                    </div>
                    {lightningGoldMetricError && <div className='mb-4 text-sm text-red-600'>{lightningGoldMetricError}</div>}
                    {lightningGoldMetricLoading ? (
                        <div className='h-56 flex items-center justify-center text-gray-400'>Loading Lightning Gold chart...</div>
                    ) : lightningGoldSeries.length > 0 ? (
                        <ResponsiveContainer width='100%' height={240}>
                            <LineChart data={lightningGoldSeries as any}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='period' />
                                <YAxis />
                                <Tooltip
                                    cursor={<HorizontalCursor />}
                                    formatter={(value: any) => {
                                        const v = safeNumber(value, 0);
                                        if (lightningGoldMetricType === 'Revenue') return currency(v);
                                        if (lightningGoldMetricType === 'Subscribers') return `${v}`;
                                        return percent(v);
                                    }}
                                />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='value'
                                    name={lightningGoldMetricType === 'ChurnRate' ? 'Churn (Unsubscribed)' : lightningGoldMetricType}
                                    stroke='#f59e0b'
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
                                                fill={active ? '#f59e0b' : 'rgba(245,158,11,0.35)'}
                                                stroke='#f59e0b'
                                                strokeWidth={active ? 2 : 1}
                                            />
                                        );
                                    }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='h-56 flex items-center justify-center text-gray-400'>No Lightning Gold data</div>
                    )}
                </div>

                {/* ============================================================ */}
                {/* ✅ NEW CHART C: Lightning Silver Membership                   */}
                {/* Basic affiliate chart removed; membership tier chart added     */}
                {/* ============================================================ */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
                        <div>
                            {/* <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                                    Membership
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                    Product: Lightning Silver
                                </span>
                            </div> */}
                            <h3 className='text-lg font-semibold text-gray-800'>Lightning Silver</h3>
                            <p className='text-sm text-gray-500'>Choose program/product, revenue, subscribers, or churn by Week/Month/Year</p>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-3'>
                            <select
                                value={lightningSilverProduct}
                                onChange={(e) => setLightningSilverProduct(e.target.value as AffiliateMetricProduct)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                {LIGHTNING_SILVER_PRODUCT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={lightningSilverMetricType}
                                onChange={(e) => setLightningSilverMetricType(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Revenue'>Revenue</option>
                                <option value='Subscribers'>Subscribers</option>
                                <option value='ChurnRate'>Churn (Unsubscribed)</option>
                            </select>
                            <select
                                value={lightningSilverMetricPeriod}
                                onChange={(e) => setLightningSilverMetricPeriod(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Week'>Week</option>
                                <option value='Month'>Month</option>
                                <option value='Year'>Year</option>
                            </select>
                            <div className='px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm'>
                                <span className='text-gray-500 mr-2'>Selected:</span>
                                <span className='font-semibold text-gray-900'>{lightningSilverSelectedLabel}</span>
                            </div>
                        </div>
                    </div>
                    {lightningSilverMetricError && <div className='mb-4 text-sm text-red-600'>{lightningSilverMetricError}</div>}
                    {lightningSilverMetricLoading ? (
                        <div className='h-56 flex items-center justify-center text-gray-400'>Loading Lightning Silver chart...</div>
                    ) : lightningSilverSeries.length > 0 ? (
                        <ResponsiveContainer width='100%' height={240}>
                            <LineChart data={lightningSilverSeries as any}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='period' />
                                <YAxis />
                                <Tooltip
                                    cursor={<HorizontalCursor />}
                                    formatter={(value: any) => {
                                        const v = safeNumber(value, 0);
                                        if (lightningSilverMetricType === 'Revenue') return currency(v);
                                        if (lightningSilverMetricType === 'Subscribers') return `${v}`;
                                        return percent(v);
                                    }}
                                />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='value'
                                    name={lightningSilverMetricType === 'ChurnRate' ? 'Churn (Unsubscribed)' : lightningSilverMetricType}
                                    stroke='#64748b'
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
                                                fill={active ? '#64748b' : 'rgba(100,116,139,0.35)'}
                                                stroke='#64748b'
                                                strokeWidth={active ? 2 : 1}
                                            />
                                        );
                                    }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='h-56 flex items-center justify-center text-gray-400'>No Lightning Silver data</div>
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
                            {/* Period filter */}
                            <select
                                value={emailSentPeriod}
                                onChange={(e) => setEmailSentPeriod(e.target.value as EmailSentPeriod)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Weekly'>Weekly</option>
                                <option value='Monthly'>Monthly</option>
                                <option value='Yearly'>Yearly</option>
                            </select>
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
                            {/* <div className='mt-4 grid grid-cols-3 gap-3'>
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
                            </div> */}
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
            </div>
        </div>
    );
}
