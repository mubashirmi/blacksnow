'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

/** NEW (Correct) API response */
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/** EXACT products your client listed for this metric endpoint */
const METRIC_PRODUCTS = [
    { label: 'Email Marketing', value: 'EmailMarketing' },
    { label: 'Invoice Tool', value: 'InvoiceTool' },
    { label: 'Digital Billboard', value: 'DigitalBillboard' },
    { label: 'Newsletter', value: 'NewsLetter' },
] as const;

type MetricType = 'Revenue' | 'Subscribers' | 'ChurnRate';
type MetricPeriod = 'Week' | 'Month' | 'Year';

function safeNumber(n: any, fallback = 0) {
    const x = typeof n === 'number' ? n : Number(n);
    return Number.isFinite(x) ? x : fallback;
}

function currency(n?: number | null) {
    const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
    return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function normalizePercent(rate: number) {
    // handles 0..1 or 0..100
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
        case 'RSVP':
            return 'RSVP';
        default:
            return product;
    }
}

/** Recharts custom cursor: horizontal line */
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

/** Builds the (Week/Month/Year) series data from API */
function buildMetricSeries(metricData: KPIChartMetricResponse | null, metricType: MetricType) {
    if (!metricData) return [];

    const weekly =
        metricType === 'Revenue'
            ? safeNumber(metricData.weeklyRevenue)
            : metricType === 'Subscribers'
            ? safeNumber(metricData.weeklySubscribers)
            : safeNumber(metricData.weeklyChurnRate);

    const monthly =
        metricType === 'Revenue'
            ? safeNumber(metricData.monthlyRevenue)
            : metricType === 'Subscribers'
            ? safeNumber(metricData.monthlySubscribers)
            : safeNumber(metricData.monthlyChurnRate);

    const yearly =
        metricType === 'Revenue'
            ? safeNumber(metricData.yearlyRevenue)
            : metricType === 'Subscribers'
            ? safeNumber(metricData.yearlySubscribers)
            : safeNumber(metricData.yearlyChurnRate);

    return [
        { period: 'Week', value: weekly },
        { period: 'Month', value: monthly },
        { period: 'Year', value: yearly },
    ] as const;
}

function getSelectedMetricValue(series: { period: string; value: number }[], period: MetricPeriod) {
    return series.find((d) => d.period === period)?.value ?? 0;
}

function formatMetricValue(metricType: MetricType, value: number) {
    if (metricType === 'Revenue') return currency(value);
    if (metricType === 'Subscribers') return `${safeNumber(value)} subscribers`;
    return percent(safeNumber(value));
}

export default function KPIPage() {
    /** Existing KPI data */
    const [data, setData] = useState<KPIResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    /** Existing table state */
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'revenue' | 'date'>('revenue');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 10;

    /** Chart #1 (Correct): Total Sales (Sales Team) */
    const [salesProduct, setSalesProduct] = useState<(typeof METRIC_PRODUCTS)[number]['value']>('DigitalBillboard');
    const [salesMetricType, setSalesMetricType] = useState<MetricType>('Revenue');
    const [salesMetricPeriod, setSalesMetricPeriod] = useState<MetricPeriod>('Week');
    const [salesMetricData, setSalesMetricData] = useState<KPIChartMetricResponse | null>(null);
    const [salesMetricLoading, setSalesMetricLoading] = useState(false);
    const [salesMetricError, setSalesMetricError] = useState<string | null>(null);

    /** Chart #2 (Correct): Total Affiliate (Basic Affiliate) */
    const [affiliateProduct, setAffiliateProduct] = useState<(typeof METRIC_PRODUCTS)[number]['value']>('NewsLetter');
    const [affiliateMetricType, setAffiliateMetricType] = useState<MetricType>('Revenue');
    const [affiliateMetricPeriod, setAffiliateMetricPeriod] = useState<MetricPeriod>('Week');
    const [affiliateMetricData, setAffiliateMetricData] = useState<KPIChartMetricResponse | null>(null);
    const [affiliateMetricLoading, setAffiliateMetricLoading] = useState(false);
    const [affiliateMetricError, setAffiliateMetricError] = useState<string | null>(null);

    /** Chart #3 (Already fixed): Total KPI */
    const [totalKpi, setTotalKpi] = useState<TotalKPIResponse | null>(null);
    const [totalKpiLoading, setTotalKpiLoading] = useState(false);
    const [totalKpiError, setTotalKpiError] = useState<string | null>(null);

    /** Fetch existing KPI */
    useEffect(() => {
        const fetchKPI = async () => {
            try {
                setIsLoading(true);
                setErrorMsg(null);
                const json = await fetchJSON<KPIResponse>('/api/v2/kpi');
                setData(json);
            } catch (e: any) {
                setErrorMsg(e?.message || 'Failed to load KPI data');
                console.error('KPI fetch error:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchKPI();
    }, []);

    /** Fetch metric by (type + product) */
    async function fetchMetric(type: 'Sales' | 'Affiliate', product: string) {
        const qs = new URLSearchParams();
        qs.set('type', type);
        qs.set('product', product);
        return await fetchJSON<KPIChartMetricResponse>(`/api/v3/kpi-chart-metric?${qs.toString()}`);
    }

    /** Fetch Chart #1 data (Sales) when product changes */
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
                console.error('Sales metric error:', e);
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

    /** Fetch Chart #2 data (Affiliate) when product changes */
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
                console.error('Affiliate metric error:', e);
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

    /** Fetch Chart #3 (Total KPI) */
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
                console.error('Total KPI error:', e);
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

    /** Existing derived KPI */
    const affiliates = data?.affiliateUsers ?? [];
    const sales = data?.salesUsers ?? [];
    const latestNotes = data?.latestThreeNotes ?? [];
    const billboardApprovals = data?.latestBillBoardApprovels ?? [];
    const latestApplicants = data?.latestJobApplicants ?? [];
    const rsvpEvents = data?.rsvpEvents ?? [];
    const checkoutRevenues = (data?.checkoutRevenues ?? []) as CheckoutRevenue[];
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

    function getRevenueBreakdownFromUsers(users: ProductUser[]) {
        const productMap: Record<string, { revenue: number; transactions: number; customers: Set<number> }> = {};

        users.forEach((user) => {
            const checkouts = Array.isArray(user.Checkouts) ? user.Checkouts : [];
            checkouts.forEach((checkout) => {
                if (!checkout || checkout.deleted || !checkout.paid) return;
                const key = checkout.product || 'Unknown';
                if (!productMap[key]) {
                    productMap[key] = { revenue: 0, transactions: 0, customers: new Set<number>() };
                }
                productMap[key].revenue += checkout.amount || 0;
                productMap[key].transactions += 1;
                productMap[key].customers.add(user.id);
            });
        });

        return Object.entries(productMap)
            .map(([product, info]) => ({
                product: formatProductName(product),
                revenue: info.revenue,
                transactions: info.transactions,
                customers: info.customers.size,
            }))
            .sort((a, b) => b.revenue - a.revenue);
    }

    function getAllPayingCustomers(users: ProductUser[]) {
        const rows: {
            id: number;
            name: string;
            email: string;
            totalRevenue: number;
            productsBought: string[];
            lastPurchaseDate: string | null;
        }[] = [];

        users.forEach((user) => {
            const checkouts = Array.isArray(user.Checkouts) ? user.Checkouts : [];
            let total = 0;
            const products = new Set<string>();
            let lastPurchase: string | null = null;

            checkouts.forEach((checkout) => {
                if (!checkout || checkout.deleted || !checkout.paid) return;
                total += checkout.amount || 0;
                products.add(formatProductName(checkout.product));
                if (!lastPurchase || new Date(checkout.createdAt) > new Date(lastPurchase)) {
                    lastPurchase = checkout.createdAt;
                }
            });

            if (total > 0) {
                rows.push({
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    email: user.email,
                    totalRevenue: total,
                    productsBought: Array.from(products),
                    lastPurchaseDate: lastPurchase,
                });
            }
        });

        return rows;
    }

    function sortCustomers(customers: ReturnType<typeof getAllPayingCustomers>) {
        return customers.sort((a, b) => {
            if (sortBy === 'revenue') {
                return sortOrder === 'desc' ? b.totalRevenue - a.totalRevenue : a.totalRevenue - b.totalRevenue;
            } else {
                const dateA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
                const dateB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            }
        });
    }

    function getRevenuePieData(revenues: CheckoutRevenue[]) {
        return revenues
            .filter((item) => item?._sum?.amount && safeNumber(item._sum.amount) > 0)
            .map((item) => ({
                name: formatProductName(item.product),
                value: safeNumber(item._sum.amount, 0),
            }));
    }

    function getProductComparisons(revenues: CheckoutRevenue[]) {
        const products = revenues.map((r) => ({ product: formatProductName(r.product), revenue: safeNumber(r._sum?.amount, 0) }));
        if (products.length < 2) return null;
        const sorted = [...products].sort((a, b) => b.revenue - a.revenue);
        const highest = sorted[0];
        const lowest = sorted[sorted.length - 1];
        const avg = products.reduce((sum, p) => sum + p.revenue, 0) / products.length;
        return { highest, lowest, average: avg };
    }

    const recentActivity = getRecentActivity();

    const revenueBreakdown = getRevenueBreakdownFromUsers(userProducts);
    const allPayingCustomersRaw = getAllPayingCustomers(userProducts);
    const sortedCustomers = sortCustomers(allPayingCustomersRaw);
    const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / itemsPerPage));
    const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const productRevenueChartData = checkoutRevenues
        .filter((item) => item && typeof item.product === 'string')
        .map((item) => {
            const rawProduct = item.product;
            const amount = item._sum?.amount ?? 0;
            return {
                productKey: rawProduct,
                product: formatProductName(rawProduct),
                revenue: safeNumber(amount, 0),
            };
        })
        .filter((item) => item.revenue > 0);

    const revenuePieData = getRevenuePieData(checkoutRevenues);
    const productComparisons = getProductComparisons(checkoutRevenues);

    const derivedTotalRevenue = productRevenueChartData.reduce((sum, item) => sum + item.revenue, 0);
    const apiTotalProfit = data?.totalProfit?._sum?.amount;
    const totalProfit = typeof apiTotalProfit === 'number' && Number.isFinite(apiTotalProfit) ? apiTotalProfit : derivedTotalRevenue;

    const totalPayingCustomers = userProducts.filter(
        (user) => Array.isArray(user.Checkouts) && user.Checkouts.some((checkout) => checkout && checkout.paid && !checkout.deleted)
    ).length;

    const totalPaidTransactions = userProducts.reduce((sum, user) => {
        if (!Array.isArray(user.Checkouts)) return sum;
        const paidCount = user.Checkouts.filter((checkout) => checkout && checkout.paid && !checkout.deleted).length;
        return sum + paidCount;
    }, 0);

    const avgRevenuePerCustomer = totalPayingCustomers > 0 ? totalProfit / totalPayingCustomers : 0;

    const handleSort = (column: 'revenue' | 'date') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    /** Chart #1 (Sales) derived */
    const salesSeries = useMemo(() => buildMetricSeries(salesMetricData, salesMetricType), [salesMetricData, salesMetricType]);
    const salesSelectedValue = useMemo(() => getSelectedMetricValue(salesSeries as any, salesMetricPeriod), [salesSeries, salesMetricPeriod]);
    const salesSelectedLabel = useMemo(() => formatMetricValue(salesMetricType, safeNumber(salesSelectedValue, 0)), [salesMetricType, salesSelectedValue]);

    /** Chart #2 (Affiliate) derived */
    const affiliateSeries = useMemo(() => buildMetricSeries(affiliateMetricData, affiliateMetricType), [affiliateMetricData, affiliateMetricType]);
    const affiliateSelectedValue = useMemo(
        () => getSelectedMetricValue(affiliateSeries as any, affiliateMetricPeriod),
        [affiliateSeries, affiliateMetricPeriod]
    );
    const affiliateSelectedLabel = useMemo(
        () => formatMetricValue(affiliateMetricType, safeNumber(affiliateSelectedValue, 0)),
        [affiliateMetricType, affiliateSelectedValue]
    );

    /** Chart #3 (Total KPI) derived */
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
                    {isLoading && <div className='mt-4 text-sm'>Loading data...</div>}
                </div>

                {/* Non-blocking error banner */}
                {errorMsg && (
                    <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
                        <h3 className='text-lg font-semibold text-red-800 mb-2'>KPI API Error</h3>
                        <p className='text-red-600'>{errorMsg}</p>
                        <button onClick={() => window.location.reload()} className='mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'>
                            Retry
                        </button>
                    </div>
                )}

                {/* ===================================================== */}
                {/* ✅ LINE CHART #1: Total Sales (Sales Team)            */}
                {/* Uses: /api/v3/kpi-chart-metric?type=Sales&product=... */}
                {/* ===================================================== */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Total Sales (Sales Team)</h3>
                            <p className='text-sm text-gray-500'>Choose product + metric + timeframe (Week/Month/Year)</p>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-3'>
                            {/* Product dropdown */}
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

                            {/* Metric dropdown */}
                            <select
                                value={salesMetricType}
                                onChange={(e) => setSalesMetricType(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Revenue'>Revenue</option>
                                <option value='Subscribers'>Subscribers</option>
                                <option value='ChurnRate'>Churn Rate</option>
                            </select>

                            {/* Period dropdown */}
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
                        <div className='w-full'>
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
                                            const active = payload?.period === salesMetricPeriod;
                                            return (
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={active ? 6 : 4}
                                                    fill={active ? '#2c7bbe' : 'rgba(44, 123, 190, 0.35)'}
                                                    stroke='#2c7bbe'
                                                    strokeWidth={active ? 2 : 1}
                                                />
                                            );
                                        }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className='h-56 flex items-center justify-center text-gray-400'>No sales data</div>
                    )}
                </div>

                {/* ===================================================== */}
                {/* ✅ LINE CHART #2: Total Affiliate (Basic Affiliate)   */}
                {/* Uses: /api/v3/kpi-chart-metric?type=Affiliate&product */}
                {/* ===================================================== */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Total Affiliate (Basic Affiliate)</h3>
                            <p className='text-sm text-gray-500'>Choose product + metric + timeframe (Week/Month/Year)</p>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-3'>
                            {/* Product dropdown */}
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

                            {/* Metric dropdown */}
                            <select
                                value={affiliateMetricType}
                                onChange={(e) => setAffiliateMetricType(e.target.value as any)}
                                className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white'
                            >
                                <option value='Revenue'>Revenue</option>
                                <option value='Subscribers'>Subscribers</option>
                                <option value='ChurnRate'>Churn Rate</option>
                            </select>

                            {/* Period dropdown */}
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
                        <div className='w-full'>
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
                                            const active = payload?.period === affiliateMetricPeriod;
                                            return (
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={active ? 6 : 4}
                                                    fill={active ? '#10b981' : 'rgba(16, 185, 129, 0.35)'}
                                                    stroke='#10b981'
                                                    strokeWidth={active ? 2 : 1}
                                                />
                                            );
                                        }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className='h-56 flex items-center justify-center text-gray-400'>No affiliate data</div>
                    )}
                </div>

                {/* ===================================== */}
                {/* ✅ LINE CHART #3: Total KPI           */}
                {/* ===================================== */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <div className='flex items-center justify-between gap-4 mb-4'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800'>Total KPI</h3>
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

                {/* ========================= */}
                {/* Existing Revenue Analytics */}
                {/* ========================= */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-lg font-semibold text-gray-800'>Revenue by Product</h3>
                            {!isLoading && (
                                <div className='text-right text-sm text-gray-500'>
                                    <div className='font-semibold text-gray-900'>{currency(totalProfit)}</div>
                                    <div className='text-xs'>Total checkout revenue</div>
                                </div>
                            )}
                        </div>

                        {isLoading ? (
                            <div className='h-64 flex items-center justify-center text-gray-400'>Loading revenue...</div>
                        ) : productRevenueChartData.length > 0 ? (
                            <>
                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm'>
                                    <div>
                                        <div className='text-xs text-gray-500 uppercase tracking-wide'>Paying customers</div>
                                        <div className='text-lg font-semibold text-gray-900'>{totalPayingCustomers}</div>
                                    </div>
                                    <div>
                                        <div className='text-xs text-gray-500 uppercase tracking-wide'>Paid checkouts</div>
                                        <div className='text-lg font-semibold text-gray-900'>{totalPaidTransactions}</div>
                                    </div>
                                    <div>
                                        <div className='text-xs text-gray-500 uppercase tracking-wide'>Avg / customer</div>
                                        <div className='text-lg font-semibold text-gray-900'>{currency(avgRevenuePerCustomer)}</div>
                                    </div>
                                </div>

                                <ResponsiveContainer width='100%' height={260}>
                                    <BarChart data={productRevenueChartData}>
                                        <CartesianGrid strokeDasharray='3 3' />
                                        <XAxis dataKey='product' />
                                        <YAxis />
                                        <Tooltip
                                            cursor={<HorizontalCursor />}
                                            formatter={(value) => currency(value as number)}
                                            labelFormatter={(label) => `Product: ${label}`}
                                        />
                                        <Legend />
                                        <Bar dataKey='revenue' name='Revenue' fill='#6366f1' />
                                    </BarChart>
                                </ResponsiveContainer>

                                {revenueBreakdown.length > 0 && (
                                    <div className='mt-4 space-y-1 text-xs text-gray-600'>
                                        {revenueBreakdown.map((row) => (
                                            <div key={row.product} className='flex items-center justify-between'>
                                                <span className='font-medium text-gray-700'>{row.product}</span>
                                                <span>
                                                    {currency(row.revenue)} · {row.customers} customers · {row.transactions} tx
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className='h-64 flex items-center justify-center text-gray-400'>No revenue data</div>
                        )}
                    </div>

                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Revenue Breakdown Pie</h3>
                        {isLoading ? (
                            <div className='h-64 flex items-center justify-center text-gray-400'>Loading chart...</div>
                        ) : revenuePieData.length > 0 ? (
                            <ResponsiveContainer width='100%' height={300}>
                                <PieChart>
                                    <Pie
                                        data={revenuePieData}
                                        cx='50%'
                                        cy='50%'
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill='#8884d8'
                                        dataKey='value'
                                    >
                                        {revenuePieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip cursor={<HorizontalCursor />} formatter={(value) => currency(value as number)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='h-64 flex items-center justify-center text-gray-400'>No revenue data</div>
                        )}

                        {productComparisons && (
                            <div className='mt-4 space-y-2 text-sm text-gray-600'>
                                <div className='flex justify-between'>
                                    <span>Highest Revenue Product:</span>
                                    <span className='font-medium'>
                                        {productComparisons.highest.product} ({currency(productComparisons.highest.revenue)})
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span>Lowest Revenue Product:</span>
                                    <span className='font-medium'>
                                        {productComparisons.lowest.product} ({currency(productComparisons.lowest.revenue)})
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span>Average Revenue per Product:</span>
                                    <span className='font-medium'>{currency(productComparisons.average)}</span>
                                </div>
                            </div>
                        )}
                    </div>
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

                {/* Summary Statistics Grid */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-6'>Summary Statistics</h3>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                        <div className='text-center p-4 bg-blue-50 rounded-lg'>
                            <div className='text-2xl font-bold text-blue-600'>{affiliates.length}</div>
                            <div className='text-xs text-gray-600 mt-1'>Total Affiliates</div>
                        </div>
                        <div className='text-center p-4 bg-green-50 rounded-lg'>
                            <div className='text-2xl font-bold text-green-600'>{sales.length}</div>
                            <div className='text-xs text-gray-600 mt-1'>Sales Team</div>
                        </div>
                        <div className='text-center p-4 bg-orange-50 rounded-lg'>
                            <div className='text-2xl font-bold text-orange-600'>{latestApplicants.length}</div>
                            <div className='text-xs text-gray-600 mt-1'>Applicants</div>
                        </div>
                        <div className='text-center p-4 bg-purple-50 rounded-lg'>
                            <div className='text-2xl font-bold text-purple-600'>{billboardApprovals.length}</div>
                            <div className='text-xs text-gray-600 mt-1'>Billboards</div>
                        </div>
                        <div className='text-center p-4 bg-pink-50 rounded-lg'>
                            <div className='text-2xl font-bold text-pink-600'>{rsvpEvents.length}</div>
                            <div className='text-xs text-gray-600 mt-1'>Events</div>
                        </div>
                        <div className='text-center p-4 bg-indigo-50 rounded-lg'>
                            <div className='text-2xl font-bold text-indigo-600'>{latestNotes.length}</div>
                            <div className='text-xs text-gray-600 mt-1'>Notes</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='text-center text-sm text-gray-500 py-4'>Last updated: {new Date().toLocaleString()}</div>
            </div>
        </div>
    );
}
