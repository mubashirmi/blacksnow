import {
    Activity,
    AlertCircle,
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    DollarSign,
    Info,
    Loader2,
    Lock,
    Mail,
    MousePointer,
    PieChart as PieChartIcon,
    ShieldCheck,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
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

export default function UnifiedSalesKPI() {
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({
        affiliate: null,
        marketing: null,
        credentials: null,
        general: null,
    });

    const [affiliateData, setAffiliateData] = useState(null);
    const [marketingData, setMarketingData] = useState(null);

    // Unified trends metric selector (UPDATED)
    const [selectedMetric, setSelectedMetric] = useState('revenue'); // revenue | subscribers | conversionRate | churnRate
    const [retryCount, setRetryCount] = useState({ affiliate: 0, marketing: 0 });

    // Credentials state
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [checkingCredentials, setCheckingCredentials] = useState(false);
    const [credsSubmitting, setCredsSubmitting] = useState(false);
    const [credentialsData, setCredentialsData] = useState({ email: '', appPassword: '' });
    const [credentialsErrors, setCredentialsErrors] = useState({});

    // ✅ NEW: Goals KPI state (/v3/goals-kpi)
    const [goalsKpi, setGoalsKpi] = useState(null);
    const [goalsError, setGoalsError] = useState(null);

    // ✅ NEW: Product KPI state (/v3/kpi-chart-metric)
    const PRODUCTS = ['DigitalBillboard', 'NewsLetter', 'InvoiceTool', 'EmailMarketing'];
    const [selectedProduct, setSelectedProduct] = useState('all'); // all | productName
    const [productView, setProductView] = useState('weekly'); // weekly | monthly
    const [productKpiMap, setProductKpiMap] = useState({}); // { [productName]: kpi }
    const [productKpiError, setProductKpiError] = useState(null);

    // -------------------------
    // Helpers (safe, no-crash)
    // -------------------------
    const toNumber = (v, fallback = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    };

    const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

    const formatCurrency = (n) => `$${toNumber(n, 0).toLocaleString()}`;

    const formatPercent = (n) => `${toNumber(n, 0).toFixed(1)}%`;

    const getAuthId = () => {
        const id = Number(localStorage.getItem('userId') || localStorage.getItem('adminId'));
        return !id || isNaN(id) ? null : id;
    };

    const safeJson = async (resp) => {
        try {
            return await resp.json();
        } catch {
            return null;
        }
    };

    // -------------------------
    // Init / Fetch
    // -------------------------
    useEffect(() => {
        initializeDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initializeDashboard = async () => {
        console.log(retryCount);
        try {
            setLoading(true);
            setErrors({ affiliate: null, marketing: null, credentials: null, general: null });
            setGoalsError(null);
            setProductKpiError(null);

            const credentialsOk = await checkMarketingCredentials();

            // run all in parallel (but never break page if one fails)
            await Promise.allSettled([fetchAllData(credentialsOk), fetchGoalsKpi(), fetchAllProductKpis()]);
        } catch (err) {
            console.error('Initialization error:', err);
            setErrors((prev) => ({ ...prev, general: err?.message || 'Failed to initialize dashboard' }));
        } finally {
            setLoading(false);
        }
    };

    const checkMarketingCredentials = async () => {
        try {
            setCheckingCredentials(true);
            const id = getAuthId();

            if (!id) {
                setErrors((prev) => ({ ...prev, credentials: 'Invalid user ID. Please login again.' }));
                return false;
            }

            const res = await fetch(`/api/v2/marketingCredentials?adminId=${id}`);

            if (!res.ok) {
                if (res.status === 404) {
                    setShowCredentialsModal(true);
                    return false;
                }
                throw new Error(`Credentials check failed: ${res.status}`);
            }

            const json = await safeJson(res);
            const ok = json?.policy?.email?.trim() && json?.policy?.appPassword?.trim();
            setShowCredentialsModal(!ok);
            return !!ok;
        } catch (e) {
            console.error('Credentials check failed:', e);
            setErrors((prev) => ({ ...prev, credentials: e?.message || 'Credentials check failed' }));
            return false;
        } finally {
            setCheckingCredentials(false);
        }
    };

    const fetchAllData = async (hasMarketingCreds = false) => {
        const id = getAuthId();
        if (!id) {
            setErrors((prev) => ({ ...prev, general: 'User ID not found. Please login again.' }));
            return;
        }

        // Fetch affiliate data
        try {
            const affiliateRes = await fetch(`/api/v2/affiliate-kpi/?id=${id}`);
            if (!affiliateRes.ok) throw new Error(`Failed to fetch affiliate data: ${affiliateRes.statusText}`);
            const affiliateJson = await safeJson(affiliateRes);

            if (!affiliateJson || typeof affiliateJson !== 'object') throw new Error('Invalid affiliate data format received');

            setAffiliateData(affiliateJson);
            setErrors((prev) => ({ ...prev, affiliate: null }));
            setRetryCount((prev) => ({ ...prev, affiliate: 0 }));
        } catch (err) {
            console.error('Affiliate data fetch failed:', err);
            setErrors((prev) => ({ ...prev, affiliate: err?.message || 'Affiliate fetch failed' }));
            setAffiliateData(null);
        }

        // Fetch marketing data only if credentials exist
        if (hasMarketingCreds) {
            try {
                const marketingRes = await fetch(`/api/v2/marketing-kpi/?authId=${id}`);
                if (!marketingRes.ok) throw new Error(`Failed to fetch marketing data: ${marketingRes.statusText}`);
                const marketingJson = await safeJson(marketingRes);

                if (!marketingJson || typeof marketingJson !== 'object') throw new Error('Invalid marketing data format received');

                setMarketingData(marketingJson);
                setErrors((prev) => ({ ...prev, marketing: null }));
                setRetryCount((prev) => ({ ...prev, marketing: 0 }));
            } catch (err) {
                console.error('Marketing data fetch failed:', err);
                setErrors((prev) => ({ ...prev, marketing: err?.message || 'Marketing fetch failed' }));
                setMarketingData(null);
            }
        }
    };

    // ✅ NEW: Goals KPI fetch
    const fetchGoalsKpi = async () => {
        const id = getAuthId();
        if (!id) return;

        try {
            const res = await fetch(`/api/v3/goals-kpi?authId=${id}`);
            if (!res.ok) throw new Error(`Goals KPI failed: ${res.statusText}`);
            const json = await safeJson(res);

            if (!json || typeof json !== 'object') throw new Error('Invalid goals KPI response');

            setGoalsKpi(json);
            setGoalsError(null);
        } catch (e) {
            console.error('Goals KPI fetch failed:', e);
            setGoalsKpi(null);
            setGoalsError(e?.message || 'Goals KPI fetch failed');
        }
    };

    // ✅ NEW: Product KPI fetch (4 products)
    const fetchAllProductKpis = async () => {
        const id = getAuthId();
        if (!id) return;

        try {
            const results = await Promise.allSettled(
                PRODUCTS.map((p) =>
                    fetch(`/api/v3/kpi-chart-metric?type=Sales&product=${encodeURIComponent(p)}&authId=${id}`).then(async (r) => {
                        if (!r.ok) throw new Error(`${p}: ${r.statusText}`);
                        const j = await safeJson(r);
                        if (!j || typeof j !== 'object') throw new Error(`${p}: invalid response`);
                        return { product: p, data: j };
                    })
                )
            );

            const map = {};
            const failed = [];

            results.forEach((r) => {
                if (r.status === 'fulfilled') {
                    map[r.value.product] = r.value.data;
                } else {
                    failed.push(r.reason?.message || 'unknown error');
                }
            });

            setProductKpiMap(map);

            if (failed.length) {
                setProductKpiError(`Some product KPI requests failed (${failed.length}). Showing available data.`);
            } else {
                setProductKpiError(null);
            }
        } catch (e) {
            console.error('Product KPI fetch failed:', e);
            setProductKpiMap({});
            setProductKpiError(e?.message || 'Product KPI fetch failed');
        }
    };

    const validateCredentialsForm = () => {
        const errs = {};
        const email = credentialsData.email.trim();
        const appPassword = credentialsData.appPassword.trim();

        if (!email) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';

        const noSpacePattern = /^[a-zA-Z0-9]{16,}$/;
        const groupedPattern = /^[a-zA-Z0-9]{4}(?:\s[a-zA-Z0-9]{4}){3}$/;
        if (!appPassword) errs.appPassword = 'App password is required';
        else if (!(noSpacePattern.test(appPassword) || groupedPattern.test(appPassword))) {
            errs.appPassword = 'Use a valid app password format (16+ chars or 4×4 groups)';
        }

        setCredentialsErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCredentialsInputChange = (e) => {
        const { name, value } = e.target;
        setCredentialsData((prev) => ({ ...prev, [name]: value }));
        if (credentialsErrors[name]) {
            setCredentialsErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCredentialsSubmit = async () => {
        if (!validateCredentialsForm()) return;

        try {
            setErrors((prev) => ({ ...prev, credentials: null }));
            setCredsSubmitting(true);
            const id = getAuthId();
            if (!id) throw new Error('User ID not found');

            const resp = await fetch('/api/v2/marketingCredentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    email: credentialsData.email.trim(),
                    appPassword: credentialsData.appPassword.trim(),
                }),
            });

            if (!resp.ok) {
                const j = await safeJson(resp).catch(() => ({}));
                throw new Error(j?.message || `Failed to save credentials: ${resp.statusText}`);
            }

            setShowCredentialsModal(false);
            setCredentialsData({ email: '', appPassword: '' });
            await Promise.allSettled([fetchAllData(true), fetchGoalsKpi(), fetchAllProductKpis()]);
        } catch (e) {
            setErrors((prev) => ({ ...prev, credentials: e?.message || 'Failed to save credentials' }));
        } finally {
            setCredsSubmitting(false);
        }
    };

    const handleRetry = async (type) => {
        if (type === 'affiliate') {
            setRetryCount((prev) => ({ ...prev, affiliate: prev.affiliate + 1 }));
            setErrors((prev) => ({ ...prev, affiliate: null }));
            await fetchAllData(!!marketingData);
        } else if (type === 'marketing') {
            setRetryCount((prev) => ({ ...prev, marketing: prev.marketing + 1 }));
            setErrors((prev) => ({ ...prev, marketing: null }));
            await fetchAllData(true);
        } else {
            setRetryCount({ affiliate: 0, marketing: 0 });
            await initializeDashboard();
        }
    };

    // -------------------------
    // Metrics (existing)
    // -------------------------
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
                          ? marketingData.totalEmailSent.filter((e) => e?.status === 'sent').length
                          : 0,
                      failedEmails: Array.isArray(marketingData.latestSchedules)
                          ? marketingData.latestSchedules.filter((s) => s?.status === 'failed').length
                          : 0,
                      pendingEmails: Array.isArray(marketingData.latestSchedules)
                          ? marketingData.latestSchedules.filter((s) => s?.status === 'pending').length
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

    const formatCombinedMonthlyData = () => {
        try {
            const monthlyMap = {};

            if (affiliateData?.monthlyStats && Array.isArray(affiliateData.monthlyStats)) {
                affiliateData.monthlyStats.forEach((stat) => {
                    if (stat?.month) {
                        const monthKey = stat.month.substring(0, 7);
                        monthlyMap[monthKey] = {
                            month: monthKey,
                            revenue: stat.comission ?? 0,
                            clicks: stat.clicks ?? 0,
                            conversions: stat.conversion ?? 0,
                            emailsSent: 0,
                            newSubscribers: 0,
                        };
                    }
                });
            }

            if (marketingData?.totalEmailSent && Array.isArray(marketingData.totalEmailSent)) {
                marketingData.totalEmailSent.forEach((email) => {
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
                                    };
                                }
                                monthlyMap[monthKey].emailsSent++;
                            }
                        } catch {}
                    }
                });
            }

            if (marketingData?.latestUsers && Array.isArray(marketingData.latestUsers)) {
                marketingData.latestUsers.forEach((user) => {
                    if (user?.createdAt) {
                        try {
                            const date = new Date(user.createdAt);
                            if (!isNaN(date.getTime())) {
                                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                if (monthlyMap[monthKey]) monthlyMap[monthKey].newSubscribers++;
                            }
                        } catch {}
                    }
                });
            }

            return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
        } catch (error) {
            console.error('Error formatting monthly data:', error);
            return [];
        }
    };

    const getTopProducts = () => {
        try {
            if (!affiliateData?.affiliateData || !Array.isArray(affiliateData.affiliateData)) return [];
            return affiliateData.affiliateData
                .filter((p) => p && typeof p.comission === 'number')
                .sort((a, b) => b.comission - a.comission)
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
                .filter((p) => p && p.productName)
                .map((product) => ({
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
            const metrics = calculateUnifiedMetrics();
            if (!metrics) return [];
            return [
                { stage: 'Clicks', value: metrics.affiliate.totalClicks, fill: '#3B82F6' },
                { stage: 'Conversions', value: metrics.affiliate.totalConversions, fill: '#10B981' },
                { stage: 'Revenue', value: metrics.totalRevenue, fill: '#8B5CF6' },
            ].filter((item) => item.value > 0);
        } catch (error) {
            console.error('Error getting funnel data:', error);
            return [];
        }
    };

    const getEmailStatusDistribution = () => {
        try {
            const metrics = calculateUnifiedMetrics();
            if (!metrics) return [];
            return [
                { name: 'Delivered', value: metrics.marketing.deliveredEmails, color: '#10B981' },
                { name: 'Failed', value: metrics.marketing.failedEmails, color: '#EF4444' },
                { name: 'Pending', value: metrics.marketing.pendingEmails, color: '#F59E0B' },
            ].filter((item) => item.value > 0);
        } catch (error) {
            console.error('Error getting email distribution:', error);
            return [];
        }
    };

    const getPerformanceGaugeData = () => {
        try {
            const metrics = calculateUnifiedMetrics();
            if (!metrics) return [];
            return [
                { name: 'Conversion Rate', value: parseFloat(metrics.conversionRate), fill: '#8B5CF6' },
                { name: 'Delivery Rate', value: parseFloat(metrics.deliveryRate), fill: '#10B981' },
            ];
        } catch (error) {
            console.error('Error getting gauge data:', error);
            return [];
        }
    };

    // -------------------------
    // ✅ NEW: Product KPI derived data
    // -------------------------
    const computeAllProductKpi = () => {
        const rows = PRODUCTS.map((p) => productKpiMap?.[p]).filter(Boolean);

        if (!rows.length) return null;

        const sum = (key) => rows.reduce((acc, r) => acc + toNumber(r?.[key], 0), 0);
        const avg = (key) => {
            const vals = rows.map((r) => toNumber(r?.[key], 0));
            if (!vals.length) return 0;
            return vals.reduce((a, b) => a + b, 0) / vals.length;
        };

        // NOTE: conversionRate fields may not exist in backend response yet.
        return {
            weeklyRevenue: sum('weeklyRevenue'),
            monthlyRevenue: sum('monthlyRevenue'),
            yearlyRevenue: sum('yearlyRevenue'),

            weeklySubscribers: sum('weeklySubscribers'),
            monthlySubscribers: sum('monthlySubscribers'),
            yearlySubscribers: sum('yearlySubscribers'),

            weeklyChurnRate: avg('weeklyChurnRate'),
            monthlyChurnRate: avg('monthlyChurnRate'),
            yearlyChurnRate: avg('yearlyChurnRate'),

            weeklyConversionRate: avg('weeklyConversionRate'),
            monthlyConversionRate: avg('monthlyConversionRate'),
            yearlyConversionRate: avg('yearlyConversionRate'),

            type: 'Sales',
            product: 'all',
        };
    };

    const allProductKpi = computeAllProductKpi();
    const currentProductKpi = selectedProduct === 'all' ? allProductKpi : productKpiMap?.[selectedProduct];

    const trendData = currentProductKpi
        ? [
              {
                  period: 'Weekly',
                  revenue: toNumber(currentProductKpi.weeklyRevenue, 0),
                  subscribers: toNumber(currentProductKpi.weeklySubscribers, 0),
                  conversionRate: toNumber(currentProductKpi.weeklyConversionRate ?? currentProductKpi.weeklyConversionRatePercent ?? 0, 0),
                  churnRate: toNumber(currentProductKpi.weeklyChurnRate, 0),
              },
              {
                  period: 'Monthly',
                  revenue: toNumber(currentProductKpi.monthlyRevenue, 0),
                  subscribers: toNumber(currentProductKpi.monthlySubscribers, 0),
                  conversionRate: toNumber(currentProductKpi.monthlyConversionRate ?? currentProductKpi.monthlyConversionRatePercent ?? 0, 0),
                  churnRate: toNumber(currentProductKpi.monthlyChurnRate, 0),
              },
              {
                  period: 'Annual',
                  revenue: toNumber(currentProductKpi.yearlyRevenue, 0),
                  subscribers: toNumber(currentProductKpi.yearlySubscribers, 0),
                  conversionRate: toNumber(currentProductKpi.yearlyConversionRate ?? currentProductKpi.yearlyConversionRatePercent ?? 0, 0),
                  churnRate: toNumber(currentProductKpi.yearlyChurnRate, 0),
              },
          ]
        : [];

    const chartConfigs = {
        revenue: { dataKey: 'revenue', name: 'Revenue ($)' },
        subscribers: { dataKey: 'subscribers', name: 'Subscribers' },
        conversionRate: { dataKey: 'conversionRate', name: 'Conversion Rate (%)' },
        churnRate: { dataKey: 'churnRate', name: 'Churn Rate (%)' },
    };
    const chartConfig = chartConfigs[selectedMetric] || chartConfigs.revenue;

    const weeklyProductSeries = currentProductKpi
        ? [
              {
                  label: 'Start',
                  subscribers: toNumber(currentProductKpi.weeklySubscribers, 0),
                  revenue: toNumber(currentProductKpi.weeklyRevenue, 0),
                  conversionRate: toNumber(currentProductKpi.weeklyConversionRate ?? currentProductKpi.weeklyConversionRatePercent ?? 0, 0),
                  churnRate: toNumber(currentProductKpi.weeklyChurnRate, 0),
              },
              {
                  label: 'End',
                  subscribers: toNumber(currentProductKpi.weeklySubscribers, 0),
                  revenue: toNumber(currentProductKpi.weeklyRevenue, 0),
                  conversionRate: toNumber(currentProductKpi.weeklyConversionRate ?? currentProductKpi.weeklyConversionRatePercent ?? 0, 0),
                  churnRate: toNumber(currentProductKpi.weeklyChurnRate, 0),
              },
          ]
        : [];

    const monthlyProductSeries = currentProductKpi
        ? [
              {
                  label: 'Start',
                  subscribers: toNumber(currentProductKpi.monthlySubscribers, 0),
                  revenue: toNumber(currentProductKpi.monthlyRevenue, 0),
                  conversionRate: toNumber(currentProductKpi.monthlyConversionRate ?? currentProductKpi.monthlyConversionRatePercent ?? 0, 0),
                  churnRate: toNumber(currentProductKpi.monthlyChurnRate, 0),
              },
              {
                  label: 'End',
                  subscribers: toNumber(currentProductKpi.monthlySubscribers, 0),
                  revenue: toNumber(currentProductKpi.monthlyRevenue, 0),
                  conversionRate: toNumber(currentProductKpi.monthlyConversionRate ?? currentProductKpi.monthlyConversionRatePercent ?? 0, 0),
                  churnRate: toNumber(currentProductKpi.monthlyChurnRate, 0),
              },
          ]
        : [];

    // -------------------------
    // Loading / Critical Error
    // -------------------------
    if (loading || checkingCredentials) {
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

    if (errors.general && !affiliateData && !marketingData && !goalsKpi && !Object.keys(productKpiMap || {}).length) {
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
    // eslint-disable-next-line
    const monthlyData = formatCombinedMonthlyData();
    // eslint-disable-next-line
    const topProducts = getTopProducts();
    const productComparison = getProductPerformanceComparison();
    const funnelData = getConversionFunnelData();
    const emailDistribution = getEmailStatusDistribution();
    const performanceGauge = getPerformanceGaugeData();

    // -------------------------
    // Goals KPI values (fallback safe)
    // -------------------------
    const goals = goalsKpi || {};
    const emailsDelivered = toNumber(goals.totalEmailDeliverd, toNumber(metrics?.marketing?.deliveredEmails, 0));
    const totalClicks = toNumber(goals.totalClicks, toNumber(metrics?.affiliate?.totalClicks, 0));
    const totalConversions = toNumber(goals.totalConversion, toNumber(metrics?.affiliate?.totalConversions, 0));
    const conversionRatePercent = toNumber(goals.conversionRatePercent, toNumber(metrics?.conversionRate, 0));
    const totalSubscribers = toNumber(goals.totalSubscribers, toNumber(metrics?.marketing?.totalSubscribers, 0));
    const totalEmailForCampaign = toNumber(goals.TotalEmailForCampaign, toNumber(metrics?.marketing?.totalEmailsSent, 0));
    const totalEmailForAutomation = toNumber(goals.TotalEmailForAutomation, toNumber(metrics?.marketing?.activeAutomations, 0));
    const churnRate = toNumber(goals.ChurnRate, 0);
    const averageRevenue = toNumber(goals.averageRevenue, 0);

    // Weekly goals (client request)
    const EMAIL_GOAL = 100000;
    const CLICK_GOAL = 1000;
    const SUBSCRIBER_GOAL = 100;

    // -------------------------
    // UI Components
    // -------------------------
    const CredentialsModal = () =>
        showCredentialsModal ? (
            <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn'>
                <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slideUp'>
                    <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl'>
                        <div className='flex items-center gap-3'>
                            <ShieldCheck className='w-8 h-8 text-white' />
                            <div>
                                <h2 className='text-2xl font-bold text-white'>Email Credentials Setup</h2>
                                <p className='text-blue-100 text-sm'>Required for email marketing analytics</p>
                            </div>
                        </div>
                    </div>

                    <div className='p-6 space-y-5'>
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                            <div className='flex items-start gap-3'>
                                <Info className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                                <div>
                                    <p className='text-blue-900 font-medium mb-1'>Why we need this</p>
                                    <p className='text-blue-800 text-sm'>
                                        Your email app password enables us to fetch marketing data for comprehensive KPI reporting.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {errors.credentials && (
                            <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake'>
                                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                                <p className='text-red-800 text-sm'>{errors.credentials}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor='cred-email' className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                <Mail className='w-4 h-4' />
                                Email Address
                            </label>
                            <input
                                type='email'
                                id='cred-email'
                                name='email'
                                value={credentialsData.email}
                                onChange={handleCredentialsInputChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    credentialsErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                placeholder='your.email@gmail.com'
                                disabled={credsSubmitting}
                            />
                            {credentialsErrors.email && <p className='text-red-600 text-sm mt-1'>{credentialsErrors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor='appPassword' className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                <Lock className='w-4 h-4' />
                                App Password
                            </label>
                            <input
                                type='text'
                                id='appPassword'
                                name='appPassword'
                                value={credentialsData.appPassword}
                                onChange={handleCredentialsInputChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    credentialsErrors.appPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono`}
                                placeholder='xbsr gbiv sizp twwe'
                                disabled={credsSubmitting}
                            />
                            {credentialsErrors.appPassword && <p className='text-red-600 text-sm mt-1'>{credentialsErrors.appPassword}</p>}
                        </div>

                        <button
                            type='button'
                            onClick={handleCredentialsSubmit}
                            disabled={credsSubmitting}
                            className='w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg'
                        >
                            {credsSubmitting ? (
                                <>
                                    <Loader2 className='w-5 h-5 animate-spin' />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className='w-5 h-5' />
                                    Save & Continue
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setShowCredentialsModal(false)}
                            disabled={credsSubmitting}
                            className='w-full px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50'
                        >
                            Skip for now (Affiliate data only)
                        </button>
                    </div>
                </div>
            </div>
        ) : null;

    const ErrorAlert = ({ type, message, onRetry }) => (
        <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg shadow-sm animate-slideDown'>
            <div className='flex items-start'>
                <AlertTriangle className='w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0' />
                <div className='ml-3 flex-1'>
                    <h3 className='text-sm font-semibold text-yellow-800'>{type === 'affiliate' ? 'Affiliate Data Error' : 'Marketing Data Error'}</h3>
                    <p className='text-sm text-yellow-700 mt-1'>{message}</p>
                    <button onClick={onRetry} className='mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline'>
                        Retry Loading {type === 'affiliate' ? 'Affiliate' : 'Marketing'} Data
                    </button>
                </div>
            </div>
        </div>
    );

    const kpiCards = [
        {
            id: 1,
            metric: 'Total Revenue',
            value: formatCurrency(metrics?.totalRevenue ?? 0),
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
            value: toNumber(metrics?.affiliate?.totalClicks ?? 0).toLocaleString(),
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
            value: toNumber(metrics?.marketing?.totalSubscribers ?? 0).toLocaleString(),
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
            value: toNumber(metrics?.marketing?.totalEmailsSent ?? 0).toLocaleString(),
            icon: Mail,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            change: '+18.7%',
            trend: 'up',
            description: 'Total campaigns sent',
            hasData: !!marketingData,
        },
    ];

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            <CredentialsModal />

            <div className='p-6 space-y-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-4xl font-bold text-gray-900 bg-clip-text'>Sales Dashboard</h1>
                        <p className='text-gray-600 mt-2'>Unified Affiliate & Email Marketing Analytics</p>
                    </div>
                </div>

                {/* Error Alerts */}
                {errors.affiliate && <ErrorAlert type='affiliate' message={errors.affiliate} onRetry={() => handleRetry('affiliate')} />}
                {errors.marketing && <ErrorAlert type='marketing' message={errors.marketing} onRetry={() => handleRetry('marketing')} />}

                {/* Non-breaking warnings */}
                {(goalsError || productKpiError) && (
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800'>
                        <div className='flex items-start gap-2'>
                            <AlertTriangle className='w-5 h-5 mt-0.5' />
                            <div className='space-y-1'>
                                {goalsError && <div>Goals KPI issue: {goalsError}</div>}
                                {productKpiError && <div>Product KPI issue: {productKpiError}</div>}
                                <div className='text-yellow-700'>Showing available data without breaking the page.</div>
                            </div>
                        </div>
                    </div>
                )}

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
                                <p className='text-2xl font-bold text-gray-900'>{toNumber(metrics?.conversionRate ?? 0).toFixed(1)}%</p>
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
                                <p className='text-2xl font-bold text-gray-900'>{toNumber(metrics?.affiliate?.totalConversions ?? 0)}</p>
                            </div>
                        </div>
                        <p className='text-xs text-gray-500'>Successful conversions</p>
                    </div>

                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <div className='flex items-center gap-3 mb-3'>
                            <CheckCircle className='w-8 h-8 text-green-600' />
                            <div>
                                <p className='text-sm text-gray-600'>Email Delivery</p>
                                <p className='text-2xl font-bold text-gray-900'>{toNumber(metrics?.deliveryRate ?? 0).toFixed(1)}%</p>
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
                                    data={[{ name: 'Conversion', value: toNumber(metrics?.conversionRate ?? 0), fill: '#8B5CF6' }]}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <RadialBar background dataKey='value' cornerRadius={10} />
                                    <text x='50%' y='50%' textAnchor='middle' dominantBaseline='middle' className='text-3xl font-bold fill-gray-900'>
                                        {toNumber(metrics?.conversionRate ?? 0).toFixed(1)}%
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
                                    data={[{ name: 'Delivery', value: toNumber(metrics?.deliveryRate ?? 0), fill: '#10B981' }]}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <RadialBar background dataKey='value' cornerRadius={10} />
                                    <text x='50%' y='50%' textAnchor='middle' dominantBaseline='middle' className='text-3xl font-bold fill-gray-900'>
                                        {toNumber(metrics?.deliveryRate ?? 0).toFixed(1)}%
                                    </text>
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ✅ UPDATED: Unified Performance Trends (Line chart + Annual + Churn) */}
                <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
                        <div>
                            <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                <TrendingUp className='w-6 h-6 text-blue-600' />
                                Unified Performance Trends
                            </h3>
                            <p className='text-sm text-gray-600'>Weekly / Monthly / Annual view (includes Churn Rate)</p>
                        </div>

                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                            <div className='flex items-center gap-2'>
                                <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>Product:</label>
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white'
                                >
                                    <option value='all'>All Products</option>
                                    {PRODUCTS.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='flex items-center gap-2'>
                                <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>Metric:</label>
                                <select
                                    value={selectedMetric}
                                    onChange={(e) => setSelectedMetric(e.target.value)}
                                    className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white'
                                >
                                    <option value='revenue'>Revenue</option>
                                    <option value='subscribers'>Subscribers</option>
                                    <option value='conversionRate'>Conversion Rate</option>
                                    <option value='churnRate'>Churn Rate</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {trendData.length > 0 ? (
                        <ResponsiveContainer width='100%' height={320}>
                            <LineChart data={trendData}>
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
                                    formatter={(value) => {
                                        if (selectedMetric === 'revenue') return [formatCurrency(value), chartConfig.name];
                                        if (selectedMetric === 'conversionRate' || selectedMetric === 'churnRate')
                                            return [formatPercent(value), chartConfig.name];
                                        return [toNumber(value).toLocaleString(), chartConfig.name];
                                    }}
                                />
                                <Legend />
                                <Line type='monotone' dataKey={chartConfig.dataKey} stroke='#2563EB' strokeWidth={3} dot />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-sm'>
                            <BarChart3 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                            <h3 className='text-lg font-semibold text-gray-700 mb-2'>No KPI Trend Data Available</h3>
                            <p className='text-gray-500 text-sm'>Product KPI data will appear here once available</p>
                        </div>
                    )}
                </div>

                {/* ✅ NEW: Product Revenue Section (Weekly + Monthly with dropdown) */}
                <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                        <div>
                            <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                <BarChart3 className='w-6 h-6 text-green-600' />
                                Product Revenue Section
                            </h3>
                            <p className='text-sm text-gray-600'>Switch products and view Weekly / Monthly performance</p>
                        </div>

                        <div className='flex items-center gap-2'>
                            <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>Product:</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white'
                            >
                                <option value='all'>All Products</option>
                                {PRODUCTS.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className='flex gap-2 mb-4'>
                        <button
                            onClick={() => setProductView('weekly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                                productView === 'weekly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                            }`}
                        >
                            Weekly Performance
                        </button>
                        <button
                            onClick={() => setProductView('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                                productView === 'monthly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                            }`}
                        >
                            Monthly Performance
                        </button>
                    </div>

                    {currentProductKpi ? (
                        <ResponsiveContainer width='100%' height={360}>
                            <LineChart data={productView === 'weekly' ? weeklyProductSeries : monthlyProductSeries}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                <XAxis dataKey='label' stroke='#6B7280' style={{ fontSize: '12px' }} />
                                <YAxis yAxisId='left' stroke='#6B7280' style={{ fontSize: '12px' }} />
                                <YAxis yAxisId='right' orientation='right' stroke='#6B7280' style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFF',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value, name) => {
                                        if (name === 'Revenue') return [formatCurrency(value), name];
                                        if (name === 'Conversion Rate' || name === 'Churn Rate') return [formatPercent(value), name];
                                        return [toNumber(value).toLocaleString(), name];
                                    }}
                                />
                                <Legend />
                                <Line yAxisId='left' type='monotone' dataKey='subscribers' name='Subscribers' stroke='#7C3AED' strokeWidth={3} dot />
                                <Line yAxisId='left' type='monotone' dataKey='revenue' name='Revenue' stroke='#16A34A' strokeWidth={3} dot />
                                <Line yAxisId='right' type='monotone' dataKey='conversionRate' name='Conversion Rate' stroke='#2563EB' strokeWidth={3} dot />
                                <Line yAxisId='right' type='monotone' dataKey='churnRate' name='Churn Rate' stroke='#DC2626' strokeWidth={3} dot />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-sm'>
                            <BarChart3 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                            <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Product KPI Data</h3>
                            <p className='text-gray-500 text-sm'>Product charts will appear once KPI data is available</p>
                        </div>
                    )}
                </div>

                {/* Conversion Funnel & Email Distribution */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {funnelData.length > 0 ? (
                        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                            <div className='mb-6'>
                                <h3 className='text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
                                    <Activity className='w-6 h-6 text-blue-600' />
                                    Conversion Funnel
                                </h3>
                                <p className='text-sm text-gray-600'>Track the conversion journey</p>
                            </div>
                            <ResponsiveContainer width='100%' height={300}>
                                <BarChart data={funnelData} layout='vertical'>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                    <XAxis type='number' stroke='#6B7280' style={{ fontSize: '12px' }} />
                                    <YAxis dataKey='stage' type='category' width={100} stroke='#6B7280' style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#FFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value) => [toNumber(value).toLocaleString(), 'Count']}
                                    />
                                    <Bar dataKey='value' radius={[0, 8, 8, 0]}>
                                        {funnelData.map((entry, index) => (
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
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#FFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
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

                {/* ✅ UPDATED: Weekly Goals & Targets (client request) */}
                <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
                    <div className='mb-6'>
                        <h3 className='text-xl font-bold text-gray-900 mb-1'>Weekly Goals & Targets</h3>
                        <p className='text-sm text-gray-600'>Track progress towards weekly goals</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        {/* Email Goal */}
                        <div className='p-6 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl hover:shadow-md transition-all'>
                            <div className='flex items-center gap-3 mb-3'>
                                <div className='p-2 bg-green-100 rounded-lg'>
                                    <Mail className='w-6 h-6 text-green-600' />
                                </div>
                                <span className='font-semibold text-gray-900'>Email Goal</span>
                            </div>

                            <div className='text-3xl font-bold text-gray-900 mb-2'>{EMAIL_GOAL.toLocaleString()}</div>
                            <div className='text-sm text-gray-600 mb-3'>
                                Current: {emailsDelivered.toLocaleString()} ({clamp((emailsDelivered / EMAIL_GOAL) * 100).toFixed(0)}%)
                            </div>

                            <div className='w-full bg-gray-200 rounded-full h-3'>
                                <div
                                    className='bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500'
                                    style={{ width: `${clamp((emailsDelivered / EMAIL_GOAL) * 100)}%` }}
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

                            <div className='text-3xl font-bold text-gray-900 mb-2'>{CLICK_GOAL.toLocaleString()}</div>
                            <div className='text-sm text-gray-600 mb-3'>
                                Current: {totalClicks.toLocaleString()} ({clamp((totalClicks / CLICK_GOAL) * 100).toFixed(0)}%)
                            </div>

                            <div className='w-full bg-gray-200 rounded-full h-3'>
                                <div
                                    className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500'
                                    style={{ width: `${clamp((totalClicks / CLICK_GOAL) * 100)}%` }}
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

                            <div className='text-3xl font-bold text-gray-900 mb-2'>{SUBSCRIBER_GOAL.toLocaleString()}</div>
                            <div className='text-sm text-gray-600 mb-3'>
                                Current: {totalSubscribers.toLocaleString()} ({clamp((totalSubscribers / SUBSCRIBER_GOAL) * 100).toFixed(0)}%)
                            </div>

                            <div className='w-full bg-gray-200 rounded-full h-3'>
                                <div
                                    className='bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500'
                                    style={{ width: `${clamp((totalSubscribers / SUBSCRIBER_GOAL) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ UPDATED: Summary Stats (client order) */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {/* Success Metrics */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                            <CheckCircle className='w-5 h-5 text-green-600' />
                            Success Metrics
                        </h3>
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Emails Delivered</span>
                                <span className='font-bold text-green-600'>{emailsDelivered.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Email Campaigns</span>
                                <span className='font-bold text-green-600'>{totalEmailForCampaign.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Email Automations</span>
                                <span className='font-bold text-green-600'>{totalEmailForAutomation.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                            <Activity className='w-5 h-5 text-blue-600' />
                            Engagement Metrics
                        </h3>
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Conversions</span>
                                <span className='font-bold text-blue-600'>{totalConversions.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Total Clicks</span>
                                <span className='font-bold text-blue-600'>{totalClicks.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Conversion Rate</span>
                                <span className='font-bold text-blue-600'>{conversionRatePercent.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Overview */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                            <Clock className='w-5 h-5 text-purple-600' />
                            Activity Overview
                        </h3>
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Total Subscribers</span>
                                <span className='font-bold text-purple-600'>{totalSubscribers.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Average Revenue</span>
                                <span className='font-bold text-purple-600'>{formatCurrency(averageRevenue)}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Churn Rate</span>
                                <span className='font-bold text-purple-600'>{churnRate.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* No Data Message */}
                {!affiliateData && !marketingData && !goalsKpi && !Object.keys(productKpiMap || {}).length && (
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
                                {!marketingData && (
                                    <button
                                        onClick={() => setShowCredentialsModal(true)}
                                        className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md'
                                    >
                                        Setup Email Marketing
                                    </button>
                                )}
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
