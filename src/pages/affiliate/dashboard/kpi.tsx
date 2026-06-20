import { Activity, DollarSign, MousePointer, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function KPI() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiData, setApiData] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('revenue'); // Default to revenue

    useEffect(() => {
        fetchKPIData();
    }, []);

    const fetchKPIData = async () => {
        const id = Number(localStorage.getItem('userId'));
        try {
            setLoading(true);
            const response = await fetch(`/api/v2/affiliate-kpi/?id=${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch KPI data');
            }
            const data = await response.json();
            setApiData(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching KPI data:', err);
        } finally {
            setLoading(false);
        }
    };

    const normalizeText = (value) => {
        return String(value || '')
            .toLowerCase()
            .replace(/[\s_-]/g, '');
    };

    const isNewsletterProduct = (product) => {
        const productName = normalizeText(product?.productName || product?.name);
        const productLink = normalizeText(product?.productLink || product?.link);

        return productName.includes('newsletter') || productLink.includes('newsletter');
    };

    const toNumber = (value) => {
        const numberValue = Number(value);
        return Number.isFinite(numberValue) ? numberValue : 0;
    };

    const hasProductMetricValue = (products, key) => {
        return products.some((product) => product?.[key] !== undefined && product?.[key] !== null && product?.[key] !== '');
    };

    const getVisibleAffiliateData = () => {
        if (!Array.isArray(apiData?.affiliateData)) return [];

        return apiData.affiliateData.filter((product) => !isNewsletterProduct(product));
    };

    const formatProductName = (productName) => {
        return String(productName || '')
            .replace(/([A-Z])/g, ' $1')
            .trim();
    };

    const calculateMetrics = () => {
        if (!apiData) return null;

        const visibleAffiliateData = getVisibleAffiliateData();

        const hasProductClicks = hasProductMetricValue(visibleAffiliateData, 'clicks');
        const hasProductConversions = hasProductMetricValue(visibleAffiliateData, 'conversion');
        const hasProductCommission = hasProductMetricValue(visibleAffiliateData, 'comission');

        const totalClicks = hasProductClicks
            ? visibleAffiliateData.reduce((sum, product) => sum + toNumber(product.clicks), 0)
            : toNumber(apiData.totalClicks?._sum?.clicks);

        const totalConversions = hasProductConversions
            ? visibleAffiliateData.reduce((sum, product) => sum + toNumber(product.conversion), 0)
            : toNumber(apiData.totalConversions?._sum?.conversion);

        const totalCommission = hasProductCommission
            ? visibleAffiliateData.reduce((sum, product) => sum + toNumber(product.comission), 0)
            : toNumber(apiData.totalCommision?._sum?.comission);

        const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0;
        const avgOrderValue = totalConversions > 0 ? (totalCommission / totalConversions).toFixed(2) : 0;

        return {
            conversionRate,
            totalRevenue: totalCommission,
            totalClicks,
            avgOrderValue,
            totalConversions,
        };
    };

    const formatMonthlyData = () => {
        if (!apiData?.monthlyStats) return [];

        return apiData.monthlyStats
            .filter((stat) => !isNewsletterProduct(stat))
            .map((stat) => {
                const monthName = String(stat.month || '').substring(0, 7);
                return {
                    month: monthName,
                    revenue: toNumber(stat.comission),
                    clicks: toNumber(stat.clicks),
                    conversions: toNumber(stat.conversion),
                };
            });
    };

    const getTopProducts = () => {
        const visibleAffiliateData = getVisibleAffiliateData();

        return [...visibleAffiliateData].sort((a, b) => toNumber(b.comission) - toNumber(a.comission)).slice(0, 5);
    };

    const getProductPerformanceData = () => {
        const visibleAffiliateData = getVisibleAffiliateData();

        return visibleAffiliateData.map((product) => ({
            name: formatProductName(product.productName),
            revenue: toNumber(product.comission),
            clicks: toNumber(product.clicks),
            conversions: toNumber(product.conversion),
        }));
    };

    const getTrafficDistribution = () => {
        const visibleAffiliateData = getVisibleAffiliateData();

        const totalClicks = visibleAffiliateData.reduce((sum, product) => sum + toNumber(product.clicks), 0);

        return visibleAffiliateData
            .filter((product) => toNumber(product.clicks) > 0)
            .map((product) => ({
                name: formatProductName(product.productName),
                value: toNumber(product.clicks),
                percentage: totalClicks > 0 ? ((toNumber(product.clicks) / totalClicks) * 100).toFixed(1) : 0,
            }));
    };

    // Get chart configuration based on selected metric
    const getChartConfig = () => {
        const configs = {
            revenue: {
                dataKey: 'revenue',
                stroke: '#10B981',
                name: 'Revenue ($)',
                label: 'Monthly Revenue',
            },
            clicks: {
                dataKey: 'clicks',
                stroke: '#3B82F6',
                name: 'Clicks',
                label: 'Monthly Clicks',
            },
            conversions: {
                dataKey: 'conversions',
                stroke: '#8B5CF6',
                name: 'Conversions',
                label: 'Monthly Conversions',
            },
        };
        return configs[selectedMetric];
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='dot-spinner'>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center h-96'>
                <div className='text-center'>
                    <div className='text-red-500 mb-4'>
                        <svg className='w-12 h-12 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                    <p className='text-gray-900 font-semibold mb-2'>Error Loading Data</p>
                    <p className='text-gray-600 mb-4'>{error}</p>
                    <button onClick={fetchKPIData} className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const metrics = calculateMetrics();
    const monthlyData = formatMonthlyData();
    const topProducts = getTopProducts();
    const productPerformance = getProductPerformanceData();
    const trafficDistribution = getTrafficDistribution();
    const chartConfig = getChartConfig();

    const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

    const kpiCards = [
        {
            id: 1,
            metric: 'Total Revenue',
            value: `$${metrics.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            change: '+12.5%',
            trend: 'up',
            description: 'Total commission earned',
        },
        {
            id: 2,
            metric: 'Total Clicks',
            value: metrics.totalClicks.toLocaleString(),
            icon: MousePointer,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            change: '+8.2%',
            trend: 'up',
            description: 'Affiliate link clicks',
        },
        {
            id: 3,
            metric: 'Conversions',
            value: metrics.totalConversions.toLocaleString(),
            icon: Target,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            change: '+15.3%',
            trend: 'up',
            description: 'Successful conversions',
        },
        {
            id: 4,
            metric: 'Conversion Rate',
            value: `${metrics.conversionRate}%`,
            icon: Activity,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            change: '+2.1%',
            trend: 'up',
            description: 'Click to conversion ratio',
        },
    ];

    return (
        <div className='space-y-6 p-6 bg-gray-50 min-h-screen'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-3xl font-bold text-gray-900'>Lightning Silver Dashboard</h2>
                    <p className='text-gray-600 mt-1'>Track your performance and earnings</p>
                </div>
                <button
                    onClick={fetchKPIData}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm'
                >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                        />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {kpiCards.map((kpi) => (
                    <div key={kpi.id} className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300'>
                        <div className='flex items-start justify-between mb-4'>
                            <div className={`p-3 rounded-lg ${kpi.iconBg}`}>
                                <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
                            </div>
                            <div
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {kpi.trend === 'up' ? <TrendingUp className='w-3 h-3' /> : <TrendingDown className='w-3 h-3' />}
                                {kpi.change}
                            </div>
                        </div>
                        <div>
                            <h3 className='text-sm font-medium text-gray-600 mb-1'>{kpi.metric}</h3>
                            <div className='text-3xl font-bold text-gray-900 mb-1'>{kpi.value}</div>
                            <p className='text-xs text-gray-500'>{kpi.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly Performance Line Chart */}
            {monthlyData.length > 0 && (
                <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
                        <div>
                            <h3 className='text-xl font-bold text-gray-900 mb-1'>Monthly Performance Trends</h3>
                            <p className='text-sm text-gray-600'>Track your performance metrics over time</p>
                        </div>

                        {/* Metric Selection Dropdown */}
                        <div className='flex items-center gap-2'>
                            <label htmlFor='metric-select' className='text-sm font-medium text-gray-700 whitespace-nowrap'>
                                Show:
                            </label>
                            <select
                                id='metric-select'
                                value={selectedMetric}
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[140px]'
                            >
                                <option value='revenue'>Revenue</option>
                                <option value='clicks'>Clicks</option>
                                <option value='conversions'>Conversions</option>
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
                                formatter={(value) => {
                                    if (selectedMetric === 'revenue') {
                                        return [`$${value.toLocaleString()}`, chartConfig.name];
                                    }
                                    return [value.toLocaleString(), chartConfig.name];
                                }}
                            />
                            <Legend />
                            <Line
                                type='monotone'
                                dataKey={chartConfig.dataKey}
                                stroke={chartConfig.stroke}
                                strokeWidth={3}
                                name={chartConfig.name}
                                dot={{ fill: chartConfig.stroke, r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Charts Row */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Product Performance Bar Chart */}
                {productPerformance.length > 0 && (
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
                        <div className='mb-6'>
                            <h3 className='text-xl font-bold text-gray-900 mb-1'>Product Revenue</h3>
                            <p className='text-sm text-gray-600'>Compare earnings across products</p>
                        </div>

                        <ResponsiveContainer width='100%' height={300}>
                            <BarChart data={productPerformance}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                <XAxis dataKey='name' stroke='#6B7280' style={{ fontSize: '11px' }} angle={-15} textAnchor='end' height={80} />
                                <YAxis stroke='#6B7280' style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFF',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Bar dataKey='revenue' fill='#10B981' radius={[8, 8, 0, 0]} name='Revenue ($)' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Traffic Distribution Pie Chart */}
                {trafficDistribution.length > 0 && (
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
                        <div className='mb-6'>
                            <h3 className='text-xl font-bold text-gray-900 mb-1'>Traffic Distribution</h3>
                            <p className='text-sm text-gray-600'>Click distribution by product</p>
                        </div>

                        <ResponsiveContainer width='100%' height={300}>
                            <PieChart>
                                <Pie
                                    data={trafficDistribution}
                                    cx='50%'
                                    cy='50%'
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    outerRadius={100}
                                    fill='#8884d8'
                                    dataKey='value'
                                >
                                    {trafficDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFF',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value, name) => [value, 'Clicks']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Top Performing Products */}
            {topProducts.length > 0 && (
                <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
                    <div className='mb-6'>
                        <h3 className='text-xl font-bold text-gray-900 mb-1'>Top Performing Products</h3>
                        <p className='text-sm text-gray-600'>Your highest earning products</p>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {topProducts.map((product, index) => (
                            <div
                                key={product.id}
                                className='p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all'
                            >
                                <div className='flex items-start justify-between mb-3'>
                                    <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg'>
                                        {index + 1}
                                    </div>
                                    <div className='text-right'>
                                        <div className='text-2xl font-bold text-green-600'>${toNumber(product.comission)}</div>
                                        <div className='text-xs text-gray-500'>Revenue</div>
                                    </div>
                                </div>
                                <h4 className='font-semibold text-gray-900 mb-2 capitalize'>{formatProductName(product.productName)}</h4>
                                <div className='flex items-center justify-between text-sm text-gray-600'>
                                    <div className='flex items-center gap-1'>
                                        <MousePointer className='w-4 h-4' />
                                        <span>{toNumber(product.clicks)} clicks</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Target className='w-4 h-4' />
                                        <span>{toNumber(product.conversion)} conv.</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Goals */}
            <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
                <div className='mb-6'>
                    <h3 className='text-xl font-bold text-gray-900 mb-1'>Weekly Goals & Targets</h3>
                    <p className='text-sm text-gray-600'>Track your progress towards weekly objectives</p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='p-6 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='p-2 bg-green-100 rounded-lg'>
                                <DollarSign className='w-6 h-6 text-green-600' />
                            </div>
                            <span className='font-semibold text-gray-900'>Revenue Goal</span>
                        </div>
                        <div className='text-3xl font-bold text-gray-900 mb-2'>$1,250</div>
                        <div className='text-sm text-gray-600 mb-3'>
                            Current: ${metrics.totalRevenue} ({Math.min((metrics.totalRevenue / 1250) * 100, 100).toFixed(0)}%)
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-3'>
                            <div
                                className='bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500'
                                style={{ width: `${Math.min((metrics.totalRevenue / 1250) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className='p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='p-2 bg-blue-100 rounded-lg'>
                                <MousePointer className='w-6 h-6 text-blue-600' />
                            </div>
                            <span className='font-semibold text-gray-900'>Click Goal</span>
                        </div>
                        <div className='text-3xl font-bold text-gray-900 mb-2'>250</div>
                        <div className='text-sm text-gray-600 mb-3'>
                            Current: {metrics.totalClicks} ({Math.min((metrics.totalClicks / 250) * 100, 100).toFixed(0)}%)
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-3'>
                            <div
                                className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500'
                                style={{ width: `${Math.min((metrics.totalClicks / 250) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className='p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='p-2 bg-purple-100 rounded-lg'>
                                <Target className='w-6 h-6 text-purple-600' />
                            </div>
                            <span className='font-semibold text-gray-900'>Conversion Goal</span>
                        </div>
                        <div className='text-3xl font-bold text-gray-900 mb-2'>50</div>
                        <div className='text-sm text-gray-600 mb-3'>
                            Current: {metrics.totalConversions} ({Math.min((metrics.totalConversions / 50) * 100, 100).toFixed(0)}%)
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-3'>
                            <div
                                className='bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500'
                                style={{ width: `${Math.min((metrics.totalConversions / 50) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Referred Affiliates */}
            {apiData?.totalTop5Affiliate?.length > 0 && (
                <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
                    <div className='mb-6'>
                        <h3 className='text-xl font-bold text-gray-900 mb-1'>Top Referred Affiliates</h3>
                        <p className='text-sm text-gray-600'>Your most successful referrals</p>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {apiData.totalTop5Affiliate.map((affiliate, index) => (
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
                                            {affiliate.firstName} {affiliate.lastName}
                                        </div>
                                        <div className='text-xs text-gray-500'>{affiliate.email}</div>
                                    </div>
                                </div>
                                <div className='text-xs text-gray-600 flex items-center gap-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                        />
                                    </svg>
                                    Joined {new Date(affiliate.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
