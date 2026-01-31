import {
    Activity,
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Loader2,
    Mail,
    MousePointer,
    PieChart as PieChartIcon,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type MonthlyTrendPoint = {
    month: string;
    revenue: number;
    clicks: number;
    conversions: number;
    emailsSent: number;
    newSubscribers: number;
    annualRevenue: number;
    churnRate: number; // percent (0-100)
};

type ProductPerfPoint = {
    period: string;
    subscribers: number;
    revenue: number;
    conversionRate: number; // percent (0-100)
    churnRate: number; // percent (0-100)
};

const PRODUCT_LIST = ['DigitalBillboard', 'NewsLetter', 'InvoiceTool', 'EmailMarketing'] as const;
type ProductName = (typeof PRODUCT_LIST)[number] | 'all';

export default function UnifiedSalesKPI() {
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({
        affiliate: null as string | null,
        marketing: null as string | null,
        goals: null as string | null,
        charts: null as string | null,
        general: null as string | null,
    });

    const [affiliateData, setAffiliateData] = useState<any>(null);
    const [marketingData, setMarketingData] = useState<any>(null);

    // NEW: goals-kpi
    const [goalsData, setGoalsData] = useState<any>(null);

    // NEW: product revenue section
    const [selectedProduct, setSelectedProduct] = useState<ProductName>('all');
    const [productKpiMap, setProductKpiMap] = useState<Record<string, any>>({});

    // Unified trends (default = annualRevenue as per client)
    const [selectedMetric, setSelectedMetric] = useState<'annualRevenue' | 'revenue' | 'clicks' | 'conversions' | 'emails' | 'churnRate'>('annualRevenue');

    const [retryCount, setRetryCount] = useState({ affiliate: 0, marketing: 0 });

    const router = useRouter();
    const { id, name } = router.query;
    console.log(retryCount);

    useEffect(() => {
        initializeDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const initializeDashboard = async () => {
        try {
            setLoading(true);
            setErrors({ affiliate: null, marketing: null, goals: null, charts: null, general: null });
            await fetchAllData();
        } catch (err: any) {
            console.error('Initialization error:', err);
            setErrors((prev) => ({ ...prev, general: err?.message || 'Failed to initialize dashboard' }));
        } finally {
            setLoading(false);
        }
    };

    const normalizePercentNumber = (value: any) => {
        const n = Number(value ?? 0);
        if (!isFinite(n) || isNaN(n)) return 0;
        // If backend ever sends 0-1 decimals, convert to 0-100
        if (n > 0 && n <= 1) return n * 100;
        return n;
    };

    const formatCurrency = (value: any) => {
        const n = Number(value ?? 0);
        return `$${(isFinite(n) ? n : 0).toLocaleString()}`;
    };

    const fetchAllData = async () => {
        if (!id) {
            setErrors((prev) => ({ ...prev, general: 'User ID not found. Please login again.' }));
            return;
        }

        // Affiliate
        try {
            const affiliateRes = await fetch(`/api/v2/affiliate-kpi/?id=${Number(id)}`);
            if (!affiliateRes.ok) throw new Error(`Failed to fetch affiliate data: ${affiliateRes.statusText}`);
            const affiliateJson = await affiliateRes.json();
            if (!affiliateJson || typeof affiliateJson !== 'object') throw new Error('Invalid affiliate data format received');
            setAffiliateData(affiliateJson);
            setErrors((prev) => ({ ...prev, affiliate: null }));
            setRetryCount((prev) => ({ ...prev, affiliate: 0 }));
        } catch (err: any) {
            console.error('Affiliate data fetch failed:', err);
            setErrors((prev) => ({ ...prev, affiliate: err?.message || 'Affiliate fetch failed' }));
            setAffiliateData(null);
        }

        // Marketing (no credentials gate)
        try {
            const marketingRes = await fetch(`/api/v2/marketing-kpi/?authId=${Number(id)}`);
            if (!marketingRes.ok) throw new Error(`Failed to fetch marketing data: ${marketingRes.statusText}`);
            const marketingJson = await marketingRes.json();
            if (!marketingJson || typeof marketingJson !== 'object') throw new Error('Invalid marketing data format received');
            setMarketingData(marketingJson);
            setErrors((prev) => ({ ...prev, marketing: null }));
            setRetryCount((prev) => ({ ...prev, marketing: 0 }));
        } catch (err: any) {
            console.error('Marketing data fetch failed:', err);
            setErrors((prev) => ({ ...prev, marketing: err?.message || 'Marketing fetch failed' }));
            setMarketingData(null);
        }

        // NEW: Goals KPI (v3)
        try {
            const goalsRes = await fetch(`/api/v3/goals-kpi?authId=${Number(id)}`);
            if (!goalsRes.ok) throw new Error(`Failed to fetch goals data: ${goalsRes.statusText}`);
            const goalsJson = await goalsRes.json();
            if (!goalsJson || typeof goalsJson !== 'object') throw new Error('Invalid goals data format received');
            setGoalsData(goalsJson);
            setErrors((prev) => ({ ...prev, goals: null }));
        } catch (err: any) {
            console.error('Goals data fetch failed:', err);
            setErrors((prev) => ({ ...prev, goals: err?.message || 'Goals KPI fetch failed' }));
            setGoalsData(null);
        }

        // NEW: Product Revenue section KPI (hit 4 products, then aggregate to "all")
        try {
            const results = await Promise.all(
                PRODUCT_LIST.map(async (product) => {
                    const res = await fetch(`/api/v3/kpi-chart-metric?type=Sales&product=${encodeURIComponent(product)}&authId=${Number(id)}`);
                    if (!res.ok) throw new Error(`Failed product KPI: ${product} (${res.statusText})`);
                    const json = await res.json();
                    if (!json || typeof json !== 'object') throw new Error(`Invalid product KPI format for ${product}`);
                    return [product, json] as const;
                })
            );

            const map: Record<string, any> = {};
            results.forEach(([p, j]) => (map[p] = j));

            // Aggregate to "all" (client wants dropdown switch between all products)
            const keysToSum = [
                'weeklyRevenue',
                'monthlyRevenue',
                'yearlyRevenue',
                'weeklySubscribers',
                'monthlySubscribers',
                'yearlySubscribers',
                'weeklyChurnRate',
                'monthlyChurnRate',
                'yearlyChurnRate',
                // Optional fields if backend adds later:
                'weeklyConversionRate',
                'monthlyConversionRate',
                'yearlyConversionRate',
            ];

            const aggregated: any = {
                message: 'Data fetched successfully',
                type: 'Sales',
                product: 'all',
            };

            keysToSum.forEach((k) => (aggregated[k] = 0));

            PRODUCT_LIST.forEach((p) => {
                const d = map[p];
                if (!d) return;
                keysToSum.forEach((k) => {
                    aggregated[k] += Number(d?.[k] ?? 0);
                });
            });

            map.all = aggregated;

            setProductKpiMap(map);
            setErrors((prev) => ({ ...prev, charts: null }));
        } catch (err: any) {
            console.error('Product KPI charts fetch failed:', err);
            setErrors((prev) => ({ ...prev, charts: err?.message || 'Product KPI chart fetch failed' }));
            setProductKpiMap({});
        }
    };

    const handleRetry = async (type: 'affiliate' | 'marketing' | 'general') => {
        if (type === 'affiliate') {
            setRetryCount((prev) => ({ ...prev, affiliate: prev.affiliate + 1 }));
            setErrors((prev) => ({ ...prev, affiliate: null }));
            await fetchAllData();
        } else if (type === 'marketing') {
            setRetryCount((prev) => ({ ...prev, marketing: prev.marketing + 1 }));
            setErrors((prev) => ({ ...prev, marketing: null }));
            await fetchAllData();
        } else {
            setRetryCount({ affiliate: 0, marketing: 0 });
            await initializeDashboard();
        }
    };

    // Metrics helpers
    const calculateUnifiedMetrics = () => {
        try {
            const affiliate = {
                totalClicks: affiliateData?.totalClicks?._sum?.clicks ?? 0,
                totalConversions: affiliateData?.totalConversions?._sum?.conversion ?? 0,
                totalRevenue: affiliateData?.totalCommision?._sum?.comission ?? 0,
            };

            const marketing = marketingData
                ? {
                      totalSubscribers: marketingData.userCounts ?? 0,
                      totalEmailsSent: marketingData.sentEmailNumbers ?? 0,
                      activeAutomations: Array.isArray(marketingData.latestSchedules) ? marketingData.latestSchedules.length : 0,
                      deliveredEmails: Array.isArray(marketingData.totalEmailSent)
                          ? marketingData.totalEmailSent.filter((e: any) => e?.status === 'sent').length
                          : 0,
                      failedEmails: Array.isArray(marketingData.latestSchedules)
                          ? marketingData.latestSchedules.filter((s: any) => s?.status === 'failed').length
                          : 0,
                      pendingEmails: Array.isArray(marketingData.latestSchedules)
                          ? marketingData.latestSchedules.filter((s: any) => s?.status === 'pending').length
                          : 0,
                  }
                : {
                      totalSubscribers: 0,
                      totalEmailsSent: 0,
                      activeAutomations: 0,
                      deliveredEmails: 0,
                      failedEmails: 0,
                      pendingEmails: 0,
                  };

            const conversionRate = affiliate.totalClicks > 0 ? ((affiliate.totalConversions / affiliate.totalClicks) * 100).toFixed(1) : '0.0';

            const deliveryRate = marketing.totalEmailsSent > 0 ? ((marketing.deliveredEmails / marketing.totalEmailsSent) * 100).toFixed(1) : '0.0';

            const avgOrderValue = affiliate.totalConversions > 0 ? (affiliate.totalRevenue / affiliate.totalConversions).toFixed(2) : '0.00';

            return {
                affiliate,
                marketing,
                conversionRate,
                deliveryRate,
                avgOrderValue,
                totalRevenue: affiliate.totalRevenue,
                totalEngagement: affiliate.totalClicks + marketing.totalEmailsSent,
            };
        } catch (error) {
            console.error('Error calculating metrics:', error);
            return null;
        }
    };

    const formatCombinedMonthlyData = (): MonthlyTrendPoint[] => {
        try {
            const monthlyMap: Record<string, MonthlyTrendPoint> = {};

            if (affiliateData?.monthlyStats && Array.isArray(affiliateData.monthlyStats)) {
                affiliateData.monthlyStats.forEach((stat: any) => {
                    if (stat?.month) {
                        const monthKey = stat.month.substring(0, 7);
                        monthlyMap[monthKey] = {
                            month: monthKey,
                            revenue: stat.comission ?? 0,
                            clicks: stat.clicks ?? 0,
                            conversions: stat.conversion ?? 0,
                            emailsSent: 0,
                            newSubscribers: 0,
                            annualRevenue: 0,
                            churnRate: 0,
                        };
                    }
                });
            }

            if (marketingData?.totalEmailSent && Array.isArray(marketingData.totalEmailSent)) {
                marketingData.totalEmailSent.forEach((email: any) => {
                    if (email?.createdAt) {
                        try {
                            const date = new Date(email.createdAt);
                            if (!isNaN(date.getTime())) {
                                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                if (!monthlyMap[monthKey]) {
                                    monthlyMap[monthKey] = {
                                        month: monthKey,
                                        revenue: 0,
                                        clicks: 0,
                                        conversions: 0,
                                        emailsSent: 0,
                                        newSubscribers: 0,
                                        annualRevenue: 0,
                                        churnRate: 0,
                                    };
                                }
                                monthlyMap[monthKey].emailsSent++;
                            }
                        } catch {
                            /* ignore bad date */
                        }
                    }
                });
            }

            if (marketingData?.latestUsers && Array.isArray(marketingData.latestUsers)) {
                marketingData.latestUsers.forEach((user: any) => {
                    if (user?.createdAt) {
                        try {
                            const date = new Date(user.createdAt);
                            if (!isNaN(date.getTime())) {
                                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                if (monthlyMap[monthKey]) monthlyMap[monthKey].newSubscribers++;
                            }
                        } catch {
                            /* ignore bad date */
                        }
                    }
                });
            }

            const sorted = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

            // NEW: Annual Revenue (sum revenue per year) + Churn Rate on trend chart
            const yearTotals: Record<string, number> = {};
            sorted.forEach((row) => {
                const year = row.month.substring(0, 4);
                yearTotals[year] = (yearTotals[year] ?? 0) + (row.revenue ?? 0);
            });

            const churnRatePct = normalizePercentNumber(goalsData?.ChurnRate ?? 0);

            return sorted.map((row) => {
                const year = row.month.substring(0, 4);
                return {
                    ...row,
                    annualRevenue: yearTotals[year] ?? 0,
                    churnRate: churnRatePct,
                };
            });
        } catch (error) {
            console.error('Error formatting monthly data:', error);
            return [];
        }
    };

    const getTopProducts = () => {
        try {
            if (!affiliateData?.affiliateData || !Array.isArray(affiliateData.affiliateData)) return [];
            return affiliateData.affiliateData
                .filter((p: any) => p && typeof p.comission === 'number')
                .sort((a: any, b: any) => b.comission - a.comission)
                .slice(0, 5);
        } catch (error) {
            console.error('Error getting top products:', error);
            return [];
        }
    };

    const getProductPerformanceComparison = () => {
        try {
            if (!affiliateData?.affiliateData || !Array.isArray(affiliateData.affiliateData)) return [];
            return affiliateData.affiliateData
                .filter((p: any) => p && p.productName)
                .map((product: any) => ({
                    name: product.productName
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                        .substring(0, 15),
                    clicks: product.clicks ?? 0,
                    conversions: product.conversion ?? 0,
                    revenue: product.comission ?? 0,
                }));
        } catch (error) {
            console.error('Error getting product performance:', error);
            return [];
        }
    };

    const getConversionFunnelData = () => {
        try {
            const m = calculateUnifiedMetrics();
            if (!m) return [];
            return [
                { stage: 'Clicks', value: m.affiliate.totalClicks, fill: '#3B82F6' },
                { stage: 'Conversions', value: m.affiliate.totalConversions, fill: '#10B981' },
                { stage: 'Revenue', value: m.totalRevenue, fill: '#8B5CF6' },
            ].filter((i) => i.value > 0);
        } catch (error) {
            console.error('Error getting funnel data:', error);
            return [];
        }
    };

    const getEmailStatusDistribution = () => {
        try {
            const m = calculateUnifiedMetrics();
            if (!m) return [];
            return [
                { name: 'Delivered', value: m.marketing.deliveredEmails, color: '#10B981' },
                { name: 'Failed', value: m.marketing.failedEmails, color: '#EF4444' },
                { name: 'Pending', value: m.marketing.pendingEmails, color: '#F59E0B' },
            ].filter((i) => i.value > 0);
        } catch (error) {
            console.error('Error getting email distribution:', error);
            return [];
        }
    };

    const getPerformanceGaugeData = () => {
        try {
            const m = calculateUnifiedMetrics();
            if (!m) return [];
            return [
                { name: 'Conversion Rate', value: parseFloat(m.conversionRate), fill: '#8B5CF6' },
                { name: 'Delivery Rate', value: parseFloat(m.deliveryRate), fill: '#10B981' },
            ];
        } catch (error) {
            console.error('Error getting gauge data:', error);
            return [];
        }
    };

    const getChartConfig = () => {
        const configs: Record<string, { dataKey: keyof MonthlyTrendPoint; stroke: string; name: string; valueType: 'currency' | 'number' | 'percent' }> = {
            annualRevenue: { dataKey: 'annualRevenue', stroke: '#10B981', name: 'Annual Revenue ($)', valueType: 'currency' },
            revenue: { dataKey: 'revenue', stroke: '#10B981', name: 'Revenue ($)', valueType: 'currency' },
            clicks: { dataKey: 'clicks', stroke: '#3B82F6', name: 'Clicks', valueType: 'number' },
            conversions: { dataKey: 'conversions', stroke: '#8B5CF6', name: 'Conversions', valueType: 'number' },
            emails: { dataKey: 'emailsSent', stroke: '#F59E0B', name: 'Emails Sent', valueType: 'number' },
            churnRate: { dataKey: 'churnRate', stroke: '#EF4444', name: 'Churn Rate (%)', valueType: 'percent' },
        };

        return configs[selectedMetric] || configs.annualRevenue;
    };

    // Loading
    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
                <div className='text-center'>
                    <Loader2 className='w-16 h-16 animate-spin text-blue-600 mx-auto mb-4' />
                    <p className='text-gray-700 font-semibold text-lg'>Loading dashboard data...</p>
                    <p className='text-gray-500 text-sm mt-2'>Please wait while we fetch your analytics</p>
                </div>
            </div>
        );
    }

    // Critical error (no data)
    if (errors.general && !affiliateData && !marketingData && !goalsData) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4'>
                <div className='bg-white rounded-2xl border-2 border-red-200 p-8 max-w-md shadow-xl'>
                    <div className='text-center'>
                        <XCircle className='w-20 h-20 text-red-500 mx-auto mb-4' />
                        <h3 className='text-2xl font-bold text-gray-900 mb-2'>Dashboard Error</h3>
                        <p className='text-gray-600 mb-6'>{errors.general}</p>
                        <button
                            onClick={() => handleRetry('general')}
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg'
                        >
                            Retry Loading
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const metrics = calculateUnifiedMetrics();
    const monthlyData = formatCombinedMonthlyData();
    const topProducts = getTopProducts();
    const productComparison = getProductPerformanceComparison();
    const emailDistribution = getEmailStatusDistribution();
    const performanceGauge = getPerformanceGaugeData();
    const chartConfig = getChartConfig();

    const ErrorAlert = ({ type, message, onRetry }: { type: 'affiliate' | 'marketing' | 'goals' | 'charts'; message: string; onRetry: () => void }) => (
        <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg shadow-sm animate-slideDown'>
            <div className='flex items-start'>
                <AlertTriangle className='w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0' />
                <div className='ml-3 flex-1'>
                    <h3 className='text-sm font-semibold text-yellow-800'>
                        {type === 'affiliate'
                            ? 'Affiliate Data Error'
                            : type === 'marketing'
                            ? 'Marketing Data Error'
                            : type === 'goals'
                            ? 'Goals KPI Error'
                            : 'Product KPI Error'}
                    </h3>
                    <p className='text-sm text-yellow-700 mt-1'>{message}</p>
                    <button onClick={onRetry} className='mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline'>
                        Retry Loading
                    </button>
                </div>
            </div>
        </div>
    );

    const kpiCards = [
        {
            id: 1,
            metric: 'Total Revenue',
            value: `$${(metrics?.totalRevenue ?? 0).toLocaleString()}`,
            icon: DollarSign,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            change: '+12.5%',
            trend: 'up',
            description: 'Affiliate commission earned',
            hasData: !!affiliateData,
        },
        {
            id: 2,
            metric: 'Total Clicks',
            value: (metrics?.affiliate?.totalClicks ?? 0).toLocaleString(),
            icon: MousePointer,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            change: '+8.2%',
            trend: 'up',
            description: 'Affiliate link clicks',
            hasData: !!affiliateData,
        },
        {
            id: 3,
            metric: 'Email Subscribers',
            value: (metrics?.marketing?.totalSubscribers ?? 0).toLocaleString(),
            icon: Users,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            change: '+15.3%',
            trend: 'up',
            description: 'Total email subscribers',
            hasData: !!marketingData,
        },
        {
            id: 4,
            metric: 'Emails Sent',
            value: (metrics?.marketing?.totalEmailsSent ?? 0).toLocaleString(),
            icon: Mail,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            change: '+18.7%',
            trend: 'up',
            description: 'Total campaigns sent',
            hasData: !!marketingData,
        },
    ] as const;

    // Product KPI (dropdown + weekly/monthly charts)
    const currentProductKpi = productKpiMap?.[selectedProduct] ?? null;

    const weeklyProductSeries: ProductPerfPoint[] = currentProductKpi
        ? [
              {
                  period: 'This Week',
                  subscribers: Number(currentProductKpi.weeklySubscribers ?? 0),
                  revenue: Number(currentProductKpi.weeklyRevenue ?? 0),
                  conversionRate: normalizePercentNumber(currentProductKpi.weeklyConversionRate ?? 0),
                  churnRate: normalizePercentNumber(currentProductKpi.weeklyChurnRate ?? 0),
              },
          ]
        : [];

    const monthlyProductSeries: ProductPerfPoint[] = currentProductKpi
        ? [
              {
                  period: 'This Month',
                  subscribers: Number(currentProductKpi.monthlySubscribers ?? 0),
                  revenue: Number(currentProductKpi.monthlyRevenue ?? 0),
                  conversionRate: normalizePercentNumber(currentProductKpi.monthlyConversionRate ?? 0),
                  churnRate: normalizePercentNumber(currentProductKpi.monthlyChurnRate ?? 0),
              },
          ]
        : [];

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            <div className='p-6 space-y-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-4xl font-bold text-gray-900 bg-clip-text'>{name ? `${name} Sales Dashboard` : 'Sales Dashboard'}</h1>
                        <p className='text-gray-600 mt-2'>Unified Affiliate & Email Marketing Analytics</p>
                    </div>
                </div>

                {/* Error Alerts */}
                {errors.affiliate && <ErrorAlert type='affiliate' message={errors.affiliate} onRetry={() => handleRetry('affiliate')} />}
                {errors.marketing && <ErrorAlert type='marketing' message={errors.marketing} onRetry={() => handleRetry('marketing')} />}
                {errors.goals && <ErrorAlert type='goals' message={errors.goals} onRetry={() => initializeDashboard()} />}
                {errors.charts && <ErrorAlert type='charts' message={errors.charts} onRetry={() => initializeDashboard()} />}

                {/* KPI Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {kpiCards.map((kpi) => (
                        <div
                            key={kpi.id}
                            className={`bg-white rounded-xl border p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                                !kpi.hasData ? 'border-gray-300 opacity-60' : 'border-gray-200'
                            }`}
                        >
                            <div className='flex items-start justify-between mb-4'>
                                <div className={`p-3 rounded-lg ${kpi.iconBg}`}>
                                    <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
                                </div>
                                {kpi.hasData ? (
                                    <div
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                            kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {kpi.trend === 'up' ? <TrendingUp className='w-3 h-3' /> : <TrendingDown className='w-3 h-3' />}
                                        {kpi.change}
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500'>
                                        <AlertCircle className='w-3 h-3' />
                                        No Data
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className='text-sm font-medium text-gray-600 mb-1'>{kpi.metric}</h3>
                                <div className='text-3xl font-bold text-gray-900 mb-1'>{kpi.value}</div>
                                <p className='text-xs text-gray-500'>{kpi.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Performance Metrics Cards */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <div className='flex items-center gap-3 mb-3'>
                            <Target className='w-8 h-8 text-purple-600' />
                            <div>
                                <p className='text-sm text-gray-600'>Conversion Rate</p>
                                <p className='text-2xl font-bold text-gray-900'>{metrics?.conversionRate ?? '0.0'}%</p>
                            </div>
                        </div>
                        <p className='text-xs text-gray-500'>Click to conversion ratio</p>
                        {!affiliateData && (
                            <div className='mt-2 text-xs text-orange-600 flex items-center gap-1'>
                                <AlertCircle className='w-3 h-3' />
                                Affiliate data unavailable
                            </div>
                        )}
                    </div>

                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <div className='flex items-center gap-3 mb-3'>
                            <Activity className='w-8 h-8 text-blue-600' />
                            <div>
                                <p className='text-sm text-gray-600'>Conversions</p>
                                <p className='text-2xl font-bold text-gray-900'>{metrics?.affiliate?.totalConversions ?? 0}</p>
                            </div>
                        </div>
                        <p className='text-xs text-gray-500'>Successful conversions</p>
                    </div>

                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <div className='flex items-center gap-3 mb-3'>
                            <CheckCircle className='w-8 h-8 text-green-600' />
                            <div>
                                <p className='text-sm text-gray-600'>Email Delivery</p>
                                <p className='text-2xl font-bold text-gray-900'>{metrics?.deliveryRate ?? '0.0'}%</p>
                            </div>
                        </div>
                        <p className='text-xs text-gray-500'>Email delivery success rate</p>
                        {!marketingData && (
                            <div className='mt-2 text-xs text-orange-600 flex items-center gap-1'>
                                <AlertCircle className='w-3 h-3' />
                                Marketing data unavailable
                            </div>
                        )}
                    </div>

                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <div className='flex items-center gap-3 mb-3'>
                            <DollarSign className='w-8 h-8 text-green-600' />
                            <div>
                                <p className='text-sm text-gray-600'>Avg Order Value</p>
                                <p className='text-2xl font-bold text-gray-900'>${metrics?.avgOrderValue ?? '0.00'}</p>
                            </div>
                        </div>
                        <p className='text-xs text-gray-500'>Average commission per conversion</p>
                    </div>
                </div>

                {/* Performance Gauge Charts */}
                {performanceGauge.length > 0 && (
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                            <div className='mb-4'>
                                <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                    <Target className='w-6 h-6 text-purple-600' />
                                    Conversion Performance
                                </h3>
                                <p className='text-sm text-gray-600'>Current conversion rate vs target</p>
                            </div>
                            <ResponsiveContainer width='100%' height={250}>
                                <RadialBarChart
                                    cx='50%'
                                    cy='50%'
                                    innerRadius='60%'
                                    outerRadius='100%'
                                    barSize={20}
                                    data={[{ name: 'Conversion', value: parseFloat(metrics?.conversionRate ?? 0), fill: '#8B5CF6' }]}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <RadialBar background dataKey='value' cornerRadius={10} />
                                    <text x='50%' y='50%' textAnchor='middle' dominantBaseline='middle' className='text-3xl font-bold fill-gray-900'>
                                        {metrics?.conversionRate ?? '0.0'}%
                                    </text>
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                            <div className='mb-4'>
                                <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                    <CheckCircle className='w-6 h-6 text-green-600' />
                                    Email Delivery Performance
                                </h3>
                                <p className='text-sm text-gray-600'>Current delivery rate vs target</p>
                            </div>
                            <ResponsiveContainer width='100%' height={250}>
                                <RadialBarChart
                                    cx='50%'
                                    cy='50%'
                                    innerRadius='60%'
                                    outerRadius='100%'
                                    barSize={20}
                                    data={[{ name: 'Delivery', value: parseFloat(metrics?.deliveryRate ?? 0), fill: '#10B981' }]}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <RadialBar background dataKey='value' cornerRadius={10} />
                                    <text x='50%' y='50%' textAnchor='middle' dominantBaseline='middle' className='text-3xl font-bold fill-gray-900'>
                                        {metrics?.deliveryRate ?? '0.0'}%
                                    </text>
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Unified Performance Trends (UPDATED: line chart + default Annual Revenue + Churn Rate option) */}
                {monthlyData.length > 0 ? (
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
                            <div>
                                <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                    <TrendingUp className='w-6 h-6 text-blue-600' />
                                    Unified Performance Trends
                                </h3>
                                <p className='text-sm text-gray-600'>Track all metrics over time</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <label htmlFor='metric-select' className='text-sm font-medium text-gray-700 whitespace-nowrap'>
                                    Show:
                                </label>
                                <select
                                    id='metric-select'
                                    value={selectedMetric}
                                    onChange={(e) => setSelectedMetric(e.target.value as any)}
                                    className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[180px] bg-white'
                                >
                                    <option value='annualRevenue'>Annual Revenue</option>
                                    <option value='revenue'>Revenue</option>
                                    <option value='clicks'>Clicks</option>
                                    <option value='conversions'>Conversions</option>
                                    <option value='emails'>Emails Sent</option>
                                    <option value='churnRate'>Churn Rate</option>
                                </select>
                            </div>
                        </div>

                        <ResponsiveContainer width='100%' height={400}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                <XAxis dataKey='month' stroke='#6B7280' style={{ fontSize: '12px' }} />
                                <YAxis stroke='#6B7280' style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFF',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    }}
                                    formatter={(value: any) => {
                                        const v = Number(value ?? 0);
                                        if (chartConfig.valueType === 'currency') return [`$${v.toLocaleString()}`, chartConfig.name];
                                        if (chartConfig.valueType === 'percent') return [`${v.toFixed(1)}%`, chartConfig.name];
                                        return [v.toLocaleString(), chartConfig.name];
                                    }}
                                />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey={chartConfig.dataKey as any}
                                    stroke={chartConfig.stroke}
                                    strokeWidth={3}
                                    name={chartConfig.name}
                                    dot
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-sm'>
                        <BarChart3 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                        <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Trend Data Available</h3>
                        <p className='text-gray-500 text-sm'>Historical performance data will appear here once available</p>
                    </div>
                )}

                {/* NEW: Product Revenue Section (Weekly + Monthly charts with dropdown) */}
                <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
                        <div>
                            <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                <BarChart3 className='w-6 h-6 text-green-600' />
                                Product Revenue Section
                            </h3>
                            <p className='text-sm text-gray-600'>Weekly Performance & Monthly Performance (switch products from dropdown)</p>
                        </div>

                        <div className='flex items-center gap-2'>
                            <label htmlFor='product-select' className='text-sm font-medium text-gray-700 whitespace-nowrap'>
                                Product:
                            </label>
                            <select
                                id='product-select'
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value as ProductName)}
                                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[200px] bg-white'
                            >
                                <option value='all'>All Products</option>
                                {PRODUCT_LIST.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Weekly Performance */}
                    <div className='mb-8'>
                        <h4 className='text-lg font-bold text-gray-900 mb-2'>Weekly Performance</h4>
                        <p className='text-sm text-gray-600 mb-4'>Subscribers, Revenue, Conversion Rate, Churn Rate</p>

                        {weeklyProductSeries.length > 0 ? (
                            <ResponsiveContainer width='100%' height={300}>
                                <LineChart data={weeklyProductSeries}>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                    <XAxis dataKey='period' stroke='#6B7280' style={{ fontSize: '12px' }} />
                                    <YAxis stroke='#6B7280' style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#FFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                        formatter={(value: any, nameKey: any) => {
                                            const n = Number(value ?? 0);
                                            if (nameKey === 'revenue') return [`$${n.toLocaleString()}`, 'Revenue'];
                                            if (nameKey === 'conversionRate') return [`${n.toFixed(1)}%`, 'Conversion Rate'];
                                            if (nameKey === 'churnRate') return [`${n.toFixed(1)}%`, 'Churn Rate'];
                                            return [n.toLocaleString(), 'Subscribers'];
                                        }}
                                    />
                                    <Legend />
                                    <Line type='monotone' dataKey='subscribers' stroke='#3B82F6' strokeWidth={3} name='Subscribers' dot />
                                    <Line type='monotone' dataKey='revenue' stroke='#10B981' strokeWidth={3} name='Revenue' dot />
                                    <Line type='monotone' dataKey='conversionRate' stroke='#8B5CF6' strokeWidth={3} name='Conversion Rate' dot />
                                    <Line type='monotone' dataKey='churnRate' stroke='#EF4444' strokeWidth={3} name='Churn Rate' dot />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='bg-white rounded-xl border-2 border-dashed border-gray-300 p-10 text-center shadow-sm'>
                                <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                                <h3 className='text-base font-semibold text-gray-700 mb-1'>No Weekly Product Data</h3>
                                <p className='text-gray-500 text-sm'>Weekly product KPI will appear once available</p>
                            </div>
                        )}
                    </div>

                    {/* Monthly Performance */}
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 mb-2'>Monthly Performance</h4>
                        <p className='text-sm text-gray-600 mb-4'>Same format as weekly chart (monthly values)</p>

                        {monthlyProductSeries.length > 0 ? (
                            <ResponsiveContainer width='100%' height={300}>
                                <LineChart data={monthlyProductSeries}>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                    <XAxis dataKey='period' stroke='#6B7280' style={{ fontSize: '12px' }} />
                                    <YAxis stroke='#6B7280' style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#FFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                        formatter={(value: any, nameKey: any) => {
                                            const n = Number(value ?? 0);
                                            if (nameKey === 'revenue') return [`$${n.toLocaleString()}`, 'Revenue'];
                                            if (nameKey === 'conversionRate') return [`${n.toFixed(1)}%`, 'Conversion Rate'];
                                            if (nameKey === 'churnRate') return [`${n.toFixed(1)}%`, 'Churn Rate'];
                                            return [n.toLocaleString(), 'Subscribers'];
                                        }}
                                    />
                                    <Legend />
                                    <Line type='monotone' dataKey='subscribers' stroke='#3B82F6' strokeWidth={3} name='Subscribers' dot />
                                    <Line type='monotone' dataKey='revenue' stroke='#10B981' strokeWidth={3} name='Revenue' dot />
                                    <Line type='monotone' dataKey='conversionRate' stroke='#8B5CF6' strokeWidth={3} name='Conversion Rate' dot />
                                    <Line type='monotone' dataKey='churnRate' stroke='#EF4444' strokeWidth={3} name='Churn Rate' dot />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='bg-white rounded-xl border-2 border-dashed border-gray-300 p-10 text-center shadow-sm'>
                                <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                                <h3 className='text-base font-semibold text-gray-700 mb-1'>No Monthly Product Data</h3>
                                <p className='text-gray-500 text-sm'>Monthly product KPI will appear once available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversion Funnel & Email Distribution */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {getConversionFunnelData().length > 0 ? (
                        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                            <div className='mb-6'>
                                <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                    <Activity className='w-6 h-6 text-blue-600' />
                                    Conversion Funnel
                                </h3>
                                <p className='text-sm text-gray-600'>Track the conversion journey</p>
                            </div>
                            <ResponsiveContainer width='100%' height={300}>
                                <BarChart data={getConversionFunnelData()} layout='vertical'>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                    <XAxis type='number' stroke='#6B7280' style={{ fontSize: '12px' }} />
                                    <YAxis dataKey='stage' type='category' width={100} stroke='#6B7280' style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                                        formatter={(value: any) => [Number(value).toLocaleString(), 'Count']}
                                    />
                                    <Bar dataKey='value' radius={[0, 8, 8, 0]}>
                                        {getConversionFunnelData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className='bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-sm'>
                            <Activity className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                            <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Funnel Data</h3>
                            <p className='text-gray-500 text-sm'>Conversion funnel will appear once you have affiliate activity</p>
                        </div>
                    )}

                    {emailDistribution.length > 0 ? (
                        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                            <div className='mb-6'>
                                <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                    <PieChartIcon className='w-6 h-6 text-purple-600' />
                                    Email Status Distribution
                                </h3>
                                <p className='text-sm text-gray-600'>Breakdown of email campaign statuses</p>
                            </div>
                            <ResponsiveContainer width='100%' height={300}>
                                <PieChart>
                                    <Pie
                                        data={emailDistribution}
                                        cx='50%'
                                        cy='50%'
                                        labelLine={false}
                                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={100}
                                        fill='#8884d8'
                                        dataKey='value'
                                    >
                                        {emailDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className='mt-4 flex justify-center gap-4 flex-wrap'>
                                {emailDistribution.map((item, i) => (
                                    <div key={i} className='flex items-center gap-2'>
                                        <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }}></div>
                                        <span className='text-sm text-gray-600'>
                                            {item.name}: {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className='bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-sm'>
                            <PieChartIcon className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                            <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Email Data</h3>
                            <p className='text-gray-500 text-sm'>Email status distribution will appear once you have campaigns</p>
                        </div>
                    )}
                </div>

                {/* Product Performance Comparison */}
                {productComparison.length > 0 && (
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                        <div className='mb-6'>
                            <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                <BarChart3 className='w-6 h-6 text-green-600' />
                                Product Performance Comparison
                            </h3>
                            <p className='text-sm text-gray-600'>Compare clicks, conversions, and revenue across products</p>
                        </div>
                        <ResponsiveContainer width='100%' height={350}>
                            <BarChart data={productComparison}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                <XAxis dataKey='name' stroke='#6B7280' style={{ fontSize: '11px' }} angle={-15} textAnchor='end' height={80} />
                                <YAxis stroke='#6B7280' style={{ fontSize: '12px' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey='clicks' fill='#3B82F6' name='Clicks' radius={[8, 8, 0, 0]} />
                                <Bar dataKey='conversions' fill='#8B5CF6' name='Conversions' radius={[8, 8, 0, 0]} />
                                <Bar dataKey='revenue' fill='#10B981' name='Revenue ($)' radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Top Products */}
                {topProducts.length > 0 ? (
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                        <div className='mb-6'>
                            <h3 className='text-xl font-bold text-gray-900 mb-1'>Top Performing Products</h3>
                            <p className='text-sm text-gray-600'>Your highest earning affiliate products</p>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {topProducts.map((product: any, index: number) => (
                                <div
                                    key={product.id}
                                    className='p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all'
                                >
                                    <div className='flex items-start justify-between mb-3'>
                                        <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm'>
                                            {index + 1}
                                        </div>
                                        <div className='text-right'>
                                            <div className='text-2xl font-bold text-green-600'>${product.comission ?? 0}</div>
                                            <div className='text-xs text-gray-500'>Revenue</div>
                                        </div>
                                    </div>
                                    <h4 className='font-semibold text-gray-900 mb-2 capitalize'>
                                        {(product.productName || 'Unknown').replace(/([A-Z])/g, ' $1').trim()}
                                    </h4>
                                    <div className='flex items-center justify-between text-sm text-gray-600'>
                                        <div className='flex items-center gap-1'>
                                            <MousePointer className='w-4 h-4' />
                                            <span>{product.clicks ?? 0} clicks</span>
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <Target className='w-4 h-4' />
                                            <span>{product.conversion ?? 0} conv.</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-sm'>
                        <Target className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                        <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Product Data</h3>
                        <p className='text-gray-500 text-sm'>Top performing products will appear here once you have sales</p>
                    </div>
                )}

                {/* Latest Email Subscribers */}
                {marketingData?.latestUsers?.length > 0 && (
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                        <div className='mb-6'>
                            <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                <Users className='w-6 h-6 text-blue-600' />
                                Latest Email Subscribers
                            </h3>
                            <p className='text-sm text-gray-600'>Recent additions to your mailing list</p>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b border-gray-200'>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Name</th>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Email</th>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Joined Date</th>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marketingData.latestUsers.map((user: any) => (
                                        <tr key={user.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                                            <td className='py-3 px-4 font-medium text-gray-900'>{user.fullName || 'N/A'}</td>
                                            <td className='py-3 px-4 text-gray-600'>{user.email || 'N/A'}</td>
                                            <td className='py-3 px-4 text-gray-600'>
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className='py-3 px-4'>
                                                <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'>Active</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Latest Sent Emails */}
                {marketingData?.latestSentEmail?.length > 0 && (
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                        <div className='mb-6'>
                            <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                <Mail className='w-6 h-6 text-purple-600' />
                                Recent Email Campaigns
                            </h3>
                            <p className='text-sm text-gray-600'>Latest email campaigns sent</p>
                        </div>
                        <div className='space-y-3'>
                            {marketingData.latestSentEmail.map((email: any) => (
                                <div key={email.id} className='p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <h4 className='font-semibold text-gray-900 mb-1'>{email.subject || 'No Subject'}</h4>
                                            <p className='text-sm text-gray-600 mb-2 line-clamp-2'>{email.text || 'No content'}</p>
                                            <div className='flex items-center gap-4 text-xs text-gray-500'>
                                                <span className='flex items-center gap-1'>
                                                    <Clock className='w-3 h-3' />
                                                    {email.runAt ? new Date(email.runAt).toLocaleString() : 'N/A'}
                                                </span>
                                                {email.repeated && (
                                                    <span className='px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium'>Recurring</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className='ml-4'>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    email.status === 'sent'
                                                        ? 'bg-green-100 text-green-800'
                                                        : email.status === 'failed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {email.status || 'unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* UPDATED: Weekly Goals & Targets (client changes + v3 goals-kpi integration) */}
                <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                    <div className='mb-6'>
                        <h3 className='text-xl font-bold text-gray-900 mb-1'>Weekly Goals & Targets</h3>
                        <p className='text-sm text-gray-600'>Updated goals: Email 100,000 / Clicks 1,000 / Subscribers 100</p>
                    </div>

                    {(() => {
                        const emailGoal = 100000;
                        const clickGoal = 1000;
                        const subscriberGoal = 100;

                        const currentEmails = Number((goalsData?.TotalEmailForCampaign ?? 0) + (goalsData?.TotalEmailForAutomation ?? 0));
                        const currentClicks = Number(goalsData?.totalClicks ?? 0);
                        const currentSubscribers = Number(goalsData?.totalSubscribers ?? 0);

                        const emailPct = Math.min((currentEmails / emailGoal) * 100, 100);
                        const clickPct = Math.min((currentClicks / clickGoal) * 100, 100);
                        const subPct = Math.min((currentSubscribers / subscriberGoal) * 100, 100);

                        return (
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                {/* Email Goals */}
                                <div className='p-6 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl hover:shadow-md transition-all'>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className='p-2 bg-green-100 rounded-lg'>
                                            <Mail className='w-6 h-6 text-green-600' />
                                        </div>
                                        <span className='font-semibold text-gray-900'>Email Goals</span>
                                    </div>
                                    <div className='text-3xl font-bold text-gray-900 mb-2'>{emailGoal.toLocaleString()}</div>
                                    <div className='text-sm text-gray-600 mb-3'>
                                        Current: {currentEmails.toLocaleString()} ({emailPct.toFixed(0)}%)
                                    </div>
                                    <div className='w-full bg-gray-200 rounded-full h-3'>
                                        <div
                                            className='bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500'
                                            style={{ width: `${emailPct}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Click Goal */}
                                <div className='p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl hover:shadow-md transition-all'>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className='p-2 bg-blue-100 rounded-lg'>
                                            <MousePointer className='w-6 h-6 text-blue-600' />
                                        </div>
                                        <span className='font-semibold text-gray-900'>Click Goal</span>
                                    </div>
                                    <div className='text-3xl font-bold text-gray-900 mb-2'>{clickGoal.toLocaleString()}</div>
                                    <div className='text-sm text-gray-600 mb-3'>
                                        Current: {currentClicks.toLocaleString()} ({clickPct.toFixed(0)}%)
                                    </div>
                                    <div className='w-full bg-gray-200 rounded-full h-3'>
                                        <div
                                            className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500'
                                            style={{ width: `${clickPct}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Subscriber Goal */}
                                <div className='p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl hover:shadow-md transition-all'>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className='p-2 bg-purple-100 rounded-lg'>
                                            <Users className='w-6 h-6 text-purple-600' />
                                        </div>
                                        <span className='font-semibold text-gray-900'>Subscriber Goal</span>
                                    </div>
                                    <div className='text-3xl font-bold text-gray-900 mb-2'>{subscriberGoal.toLocaleString()}</div>
                                    <div className='text-sm text-gray-600 mb-3'>
                                        Current: {currentSubscribers.toLocaleString()} ({subPct.toFixed(0)}%)
                                    </div>
                                    <div className='w-full bg-gray-200 rounded-full h-3'>
                                        <div
                                            className='bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500'
                                            style={{ width: `${subPct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Top Referred Affiliates */}
                {affiliateData?.totalTop5Affiliate?.length > 0 && (
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                        <div className='mb-6'>
                            <h3 className='text-xl font-bold text-gray-900 mb-1'>Top Referred Affiliates</h3>
                            <p className='text-sm text-gray-600'>Your most successful referrals</p>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {affiliateData.totalTop5Affiliate.map((affiliate: any, index: number) => (
                                <div
                                    key={affiliate.id}
                                    className='p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl hover:shadow-md transition-all'
                                >
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md'>
                                            {index + 1}
                                        </div>
                                        <div className='flex-1'>
                                            <div className='font-semibold text-gray-900'>
                                                {affiliate.firstName || ''} {affiliate.lastName || ''}
                                            </div>
                                            <div className='text-xs text-gray-500 truncate'>{affiliate.email || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className='text-xs text-gray-600 flex items-center gap-1'>
                                        <Calendar className='w-4 h-4' />
                                        Joined{' '}
                                        {affiliate.createdAt
                                            ? new Date(affiliate.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* UPDATED: Summary Stats (client required order + v3 goals-kpi fields) */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {/* Success Metrics - New Order:
                        Emails Delivered
                        Email Campaigns
                        Email Automations
                    */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                            <CheckCircle className='w-5 h-5 text-green-600' />
                            Success Metrics
                        </h3>
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Emails Delivered</span>
                                <span className='font-bold text-green-600'>{Number(goalsData?.totalEmailDeliverd ?? 0).toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Email Campaigns</span>
                                <span className='font-bold text-green-600'>{Number(goalsData?.TotalEmailForCampaign ?? 0).toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Email Automations</span>
                                <span className='font-bold text-green-600'>{Number(goalsData?.TotalEmailForAutomation ?? 0).toLocaleString()}</span>
                            </div>
                            {!goalsData && (
                                <div className='text-xs text-orange-600 flex items-center gap-1 pt-2 border-t'>
                                    <AlertCircle className='w-3 h-3' />
                                    Goals KPI unavailable
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Engagement Metrics - Order:
                        Conversions
                        Total Clicks
                        Conversion Rate
                    */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                            <Activity className='w-5 h-5 text-blue-600' />
                            Engagement Metrics
                        </h3>
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Conversions</span>
                                <span className='font-bold text-blue-600'>{Number(goalsData?.totalConversion ?? 0).toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Total Clicks</span>
                                <span className='font-bold text-blue-600'>{Number(goalsData?.totalClicks ?? 0).toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Conversion Rate</span>
                                <span className='font-bold text-blue-600'>{normalizePercentNumber(goalsData?.conversionRatePercent ?? 0).toFixed(1)}%</span>
                            </div>
                            {!goalsData && (
                                <div className='text-xs text-orange-600 flex items-center gap-1 pt-2 border-t'>
                                    <AlertCircle className='w-3 h-3' />
                                    Goals KPI unavailable
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Overview:
                        Total Subscribers
                        Average Revenue
                        Churn Rate
                    */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                            <Clock className='w-5 h-5 text-purple-600' />
                            Activity Overview
                        </h3>
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Total Subscribers</span>
                                <span className='font-bold text-purple-600'>{Number(goalsData?.totalSubscribers ?? 0).toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Average Revenue</span>
                                <span className='font-bold text-purple-600'>{formatCurrency(goalsData?.averageRevenue ?? 0)}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Churn Rate</span>
                                <span className='font-bold text-purple-600'>{normalizePercentNumber(goalsData?.ChurnRate ?? 0).toFixed(1)}%</span>
                            </div>
                            {!goalsData && (
                                <div className='text-xs text-orange-600 flex items-center gap-1 pt-2 border-t'>
                                    <AlertCircle className='w-3 h-3' />
                                    Goals KPI unavailable
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* No Data Message */}
                {!affiliateData && !marketingData && !goalsData && (
                    <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-12 text-center shadow-lg'>
                        <div className='max-w-md mx-auto'>
                            <AlertCircle className='w-20 h-20 text-blue-500 mx-auto mb-6' />
                            <h2 className='text-2xl font-bold text-gray-900 mb-3'>No Data Available</h2>
                            <p className='text-gray-600 mb-6'>
                                We couldn&apos;t load any dashboard data. This could be due to network issues or missing configuration.
                            </p>
                            <div className='flex gap-3 justify-center'>
                                <button
                                    onClick={() => handleRetry('general')}
                                    className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md'
                                >
                                    Retry Loading
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shake {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    75% {
                        transform: translateX(5px);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }

                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
