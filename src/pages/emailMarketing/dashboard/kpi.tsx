import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Calendar, CheckCircle, Clock, Mail, TrendingUp, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

function EmailUsageHorizontalCursor(props) {
    const { points, width } = props || {};
    if (!points || !points.length || typeof width !== 'number') return null;

    const y = points[0]?.y;
    if (typeof y !== 'number') return null;

    return <line x1={0} x2={width} y1={y} y2={y} stroke='rgba(17, 24, 39, 0.35)' strokeDasharray='4 4' />;
}

export default function SalesKPIPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [emailUsage, setEmailUsage] = useState({ weekly: null, monthly: null });
    const [emailUsageLoading, setEmailUsageLoading] = useState(true);
    const [emailUsageError, setEmailUsageError] = useState(null);
    const [emailUsagePeriod, setEmailUsagePeriod] = useState('Weekly');

    useEffect(() => {
        fetchKPIData();
        fetchEmailUsageData();
    }, []);

    const fetchKPIData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v2/marketing-kpi/?authId=${Number(localStorage.getItem('userId'))}`);

            if (!response.ok) {
                throw new Error('Failed to fetch KPI data');
            }

            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching KPI data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmailUsageData = async () => {
        setEmailUsageLoading(true);
        setEmailUsageError(null);

        const authId = Number(localStorage.getItem('userId'));

        if (!Number.isFinite(authId) || authId <= 0) {
            setEmailUsage({ weekly: null, monthly: null });
            setEmailUsageError('Email usage is unavailable because the user ID is missing.');
            setEmailUsageLoading(false);
            return;
        }

        const fetchUsageByPeriod = async (period) => {
            try {
                const response = await fetch(`/api/v5/email-billing/usage/${period}?authId=${encodeURIComponent(authId)}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch ${period} email usage`);
                }

                const result = await response.json();
                const totalEmailsSent = Number(result?.data?.totalEmailsSent);

                if (result?.success !== true || !Number.isFinite(totalEmailsSent) || totalEmailsSent < 0) {
                    throw new Error(`Invalid ${period} email usage response`);
                }

                return { period, totalEmailsSent, error: null };
            } catch (err) {
                console.error(`Error fetching ${period} email usage:`, err);
                return {
                    period,
                    totalEmailsSent: null,
                    error: err instanceof Error ? err.message : `Failed to fetch ${period} email usage`,
                };
            }
        };

        try {
            const [weeklyResult, monthlyResult] = await Promise.all([fetchUsageByPeriod('weekly'), fetchUsageByPeriod('monthly')]);

            setEmailUsage({
                weekly: weeklyResult.totalEmailsSent,
                monthly: monthlyResult.totalEmailsSent,
            });

            const failedPeriods = [weeklyResult, monthlyResult].filter((result) => result.error).map((result) => result.period);

            if (failedPeriods.length > 0) {
                setEmailUsageError(`Could not load ${failedPeriods.join(' and ')} email usage.`);
            }
        } catch (err) {
            console.error('Unexpected error fetching email usage:', err);
            setEmailUsage({ weekly: null, monthly: null });
            setEmailUsageError('Email usage is temporarily unavailable.');
        } finally {
            setEmailUsageLoading(false);
        }
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
            <div className='flex items-center justify-center min-h-screen'>
                <Card className='border-red-200 bg-red-50 max-w-md'>
                    <CardContent className='p-6'>
                        <div className='flex items-center gap-3'>
                            <XCircle className='h-6 w-6 text-red-600' />
                            <div>
                                <h3 className='text-lg font-semibold text-red-800'>Error Loading Data</h3>
                                <p className='text-red-700'>{error}</p>
                                <button onClick={fetchKPIData} className='mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'>
                                    Retry
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Safe data extraction with defaults
    const latestUsers = data?.latestUsers || [];
    const userCounts = data?.userCounts || 0;
    // const latestSentEmail = data?.latestSentEmail || [];
    const latestSchedules = data?.latestSchedules || [];
    const totalEmailSent = data?.totalEmailSent || [];
    const sentEmailNumbers = data?.sentEmailNumbers || 0;

    // Calculate email metrics safely
    const pendingEmails = latestSchedules.filter((s) => s.status === 'pending').length;
    const failedEmails = latestSchedules.filter((s) => s.status === 'failed').length;
    const sentEmails = totalEmailSent.filter((e) => e.status === 'sent').length;

    const emailMetrics = {
        totalSent: sentEmailNumbers,
        delivered: sentEmails,
        failed: failedEmails,
        pending: pendingEmails,
        activeAutomations: latestSchedules.length,
    };

    // Calculate rates safely
    const deliveryRate = emailMetrics.totalSent > 0 ? ((emailMetrics.delivered / emailMetrics.totalSent) * 100).toFixed(1) : '0.0';
    const failureRate =
        emailMetrics.failed + emailMetrics.delivered > 0 ? ((emailMetrics.failed / (emailMetrics.failed + emailMetrics.delivered)) * 100).toFixed(1) : '0.0';

    // Process monthly data from actual emails
    const processMonthlyData = () => {
        const monthCounts = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${months[date.getMonth()]}`;
            monthCounts[monthKey] = { sent: 0, users: 0, automations: 0 };
        }

        // Count sent emails by month
        totalEmailSent.forEach((email) => {
            if (email.createdAt) {
                const date = new Date(email.createdAt);
                const monthKey = months[date.getMonth()];
                if (monthCounts[monthKey]) {
                    monthCounts[monthKey].sent++;
                }
            }
        });

        // Count users by month
        latestUsers.forEach((user) => {
            if (user.createdAt) {
                const date = new Date(user.createdAt);
                const monthKey = months[date.getMonth()];
                if (monthCounts[monthKey]) {
                    monthCounts[monthKey].users++;
                }
            }
        });

        return Object.entries(monthCounts).map(([month, data]) => ({
            month,
            ...data,
        }));
    };

    const monthlyData = processMonthlyData();

    const emailUsageChartData = [
        { period: 'Weekly', emails: emailUsage.weekly, active: emailUsagePeriod === 'Weekly' },
        { period: 'Monthly', emails: emailUsage.monthly, active: emailUsagePeriod === 'Monthly' },
    ];

    const hasEmailUsageData = emailUsage.weekly !== null || emailUsage.monthly !== null;
    const formatEmailUsageValue = (value) => (value === null ? '—' : String(value));
    const selectedEmailUsageValue = emailUsagePeriod === 'Weekly' ? emailUsage.weekly : emailUsage.monthly;

    const renderEmailUsageChart = () => (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
                <div>
                    <h3 className='text-lg font-semibold text-gray-800'>Email Billing Usage</h3>
                    <p className='text-sm text-gray-500'>Weekly and monthly email send volume for the current user</p>
                </div>

                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                    <select
                        value={emailUsagePeriod}
                        onChange={(event) => setEmailUsagePeriod(event.target.value)}
                        className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300'
                    >
                        <option value='Weekly'>Weekly</option>
                        <option value='Monthly'>Monthly</option>
                    </select>

                    <div className='px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm whitespace-nowrap'>
                        <span className='text-gray-500 mr-2'>Selected:</span>
                        <span className='font-semibold text-gray-900'>{formatEmailUsageValue(selectedEmailUsageValue)} emails</span>
                    </div>
                </div>
            </div>

            <div className='flex flex-wrap gap-2 mb-5'>
                <div className='flex flex-col items-center min-w-[120px] px-4 py-2 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-800'>
                    <span className='text-xs font-medium uppercase tracking-wide opacity-70'>This Week</span>
                    <span className='text-base font-bold mt-0.5'>{formatEmailUsageValue(emailUsage.weekly)}</span>
                </div>
                <div className='flex flex-col items-center min-w-[120px] px-4 py-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-800'>
                    <span className='text-xs font-medium uppercase tracking-wide opacity-70'>This Month</span>
                    <span className='text-base font-bold mt-0.5'>{formatEmailUsageValue(emailUsage.monthly)}</span>
                </div>
            </div>

            {emailUsageError && (
                <div className='mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-red-600'>
                    <div className='flex items-center gap-2'>
                        <AlertCircle className='h-4 w-4 shrink-0' />
                        <span>{emailUsageError} Other dashboard data is unaffected.</span>
                    </div>
                    <button type='button' onClick={fetchEmailUsageData} className='font-medium text-red-600 underline underline-offset-2 hover:text-red-700'>
                        Retry
                    </button>
                </div>
            )}

            {emailUsageLoading ? (
                <div className='h-64 flex items-center justify-center text-gray-400'>Loading email usage...</div>
            ) : hasEmailUsageData ? (
                <ResponsiveContainer width='100%' height={260}>
                    <LineChart data={emailUsageChartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                        <XAxis dataKey='period' tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                            tickFormatter={(value) => String(value)}
                        />
                        <Tooltip
                            cursor={<EmailUsageHorizontalCursor />}
                            formatter={(value) => [`${Number.isFinite(Number(value)) ? Number(value) : 0} emails`, 'Emails Sent']}
                            labelFormatter={(label) => `${label} usage`}
                            contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                        <Line
                            type='monotone'
                            dataKey='emails'
                            name='Emails Sent'
                            stroke='#06b6d4'
                            strokeWidth={3}
                            connectNulls={false}
                            dot={(props) => {
                                const { cx, cy, payload } = props || {};
                                if (typeof cx !== 'number' || typeof cy !== 'number') return null;

                                const value = Number(payload?.emails);
                                const hasValue = Number.isFinite(value) && payload?.emails !== null;
                                const active = Boolean(payload?.active);

                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={active ? 6 : hasValue && value > 0 ? 5 : 3}
                                        fill={active ? '#06b6d4' : hasValue && value > 0 ? '#67e8f9' : 'rgba(6,182,212,0.25)'}
                                        stroke='#06b6d4'
                                        strokeWidth={active ? 2 : 1.5}
                                    />
                                );
                            }}
                            activeDot={{ r: 7 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className='h-64 flex items-center justify-center text-gray-400'>No email usage data</div>
            )}
        </div>
    );

    // Email status distribution
    const statusData = [
        { name: 'Sent', value: emailMetrics.delivered, color: '#10b981' },
        { name: 'Failed', value: emailMetrics.failed, color: '#ef4444' },
        { name: 'Pending', value: emailMetrics.pending, color: '#f59e0b' },
    ].filter((item) => item.value > 0); // Only show non-zero values

    // Weekly activity data (sample - you can enhance this based on actual data)
    const weeklyData = [
        { day: 'Mon', emails: 0, opens: 0 },
        { day: 'Tue', emails: 0, opens: 0 },
        { day: 'Wed', emails: 0, opens: 0 },
        { day: 'Thu', emails: 0, opens: 0 },
        { day: 'Fri', emails: 0, opens: 0 },
        { day: 'Sat', emails: 0, opens: 0 },
        { day: 'Sun', emails: 0, opens: 0 },
    ];

    // Distribute recent emails across week
    totalEmailSent.slice(0, 7).forEach((email, index) => {
        if (weeklyData[index]) {
            weeklyData[index].emails++;
        }
    });

    // Performance comparison
    const performanceData = [
        { metric: 'Campaigns', current: emailMetrics.totalSent, target: Math.max(10, emailMetrics.totalSent + 3) },
        { metric: 'Subscribers', current: userCounts, target: Math.max(20, userCounts + 5) },
        { metric: 'Automations', current: emailMetrics.activeAutomations, target: Math.max(5, emailMetrics.activeAutomations + 2) },
        { metric: 'Delivery Rate', current: parseFloat(deliveryRate), target: 95 },
    ];

    // Growth metrics
    const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current / previous) * 100 - 100).toFixed(0);
    };

    const growthRate = userCounts > 0 ? calculateGrowth(userCounts, Math.max(1, userCounts - 2)) : 0;
    const campaignGrowth = emailMetrics.totalSent > 0 ? calculateGrowth(emailMetrics.totalSent, Math.max(1, emailMetrics.totalSent - 3)) : 0;

    // Handle no data scenarios
    if (userCounts === 0 && emailMetrics.totalSent === 0) {
        return (
            <div className='space-y-6 p-6 bg-gray-50'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-semibold text-gray-900'>Email Marketing KPI </h1>
                    <p className='text-gray-600 mt-2'>Real-time performance metrics and analytics</p>
                </div>
                <Card className='border-blue-200 bg-blue-50'>
                    <CardContent className='p-6'>
                        <div className='flex items-center gap-3'>
                            <AlertCircle className='h-6 w-6 text-blue-600' />
                            <div>
                                <h3 className='text-lg font-semibold text-blue-800'>No Data Available</h3>
                                <p className='text-blue-700'>Start by adding subscribers and sending your first email campaign to see analytics here.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {renderEmailUsageChart()}
            </div>
        );
    }

    return (
        <div className='space-y-6 p-6 bg-gray-50'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900'>Email Marketing KPI Dashboard</h1>
                <p className='text-gray-600 mt-2'>Real-time performance metrics and analytics</p>
            </div>

            {/* Key Metrics Row */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <Card className='border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow'>
                    <CardContent className='p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-gray-600'>Total Campaigns</p>
                                <p className='text-3xl font-bold text-gray-900 mt-2'>{emailMetrics.totalSent}</p>
                                {campaignGrowth > 0 && (
                                    <p className='text-sm text-green-600 mt-2 flex items-center gap-1'>
                                        <TrendingUp className='h-4 w-4' />+{campaignGrowth}% growth
                                    </p>
                                )}
                            </div>
                            <Mail className='h-12 w-12 text-blue-500 opacity-20' />
                        </div>
                    </CardContent>
                </Card>

                <Card className='border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow'>
                    <CardContent className='p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-gray-600'>Total Subscribers</p>
                                <p className='text-3xl font-bold text-gray-900 mt-2'>{userCounts}</p>
                                {growthRate > 0 && (
                                    <p className='text-sm text-green-600 mt-2 flex items-center gap-1'>
                                        <TrendingUp className='h-4 w-4' />+{growthRate}% growth
                                    </p>
                                )}
                            </div>
                            <Users className='h-12 w-12 text-green-500 opacity-20' />
                        </div>
                    </CardContent>
                </Card>

                <Card className='border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow'>
                    <CardContent className='p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-gray-600'>Active Automations</p>
                                <p className='text-3xl font-bold text-gray-900 mt-2'>{emailMetrics.activeAutomations}</p>
                                <p className='text-sm text-blue-600 mt-2 flex items-center gap-1'>
                                    <Clock className='h-4 w-4' />
                                    {emailMetrics.pending} pending
                                </p>
                            </div>
                            <Calendar className='h-12 w-12 text-purple-500 opacity-20' />
                        </div>
                    </CardContent>
                </Card>

                <Card className='border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow'>
                    <CardContent className='p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-gray-600'>Delivery Rate</p>
                                <p className='text-3xl font-bold text-gray-900 mt-2'>{deliveryRate}%</p>
                                <p className='text-sm text-gray-600 mt-2 flex items-center gap-1'>
                                    <CheckCircle className='h-4 w-4' />
                                    {emailMetrics.delivered} delivered
                                </p>
                            </div>
                            <TrendingUp className='h-12 w-12 text-orange-500 opacity-20' />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Email Billing Usage */}
            {renderEmailUsageChart()}

            {/* Charts Row 1 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Monthly Trends */}
                {monthlyData.length > 0 && (
                    <Card className='shadow-md'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <TrendingUp className='h-5 w-5 text-blue-600' />
                                Monthly Performance Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width='100%' height={300}>
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id='colorSent' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                                            <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id='colorUsers' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                                            <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='month' />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type='monotone' dataKey='sent' stroke='#3b82f6' fillOpacity={1} fill='url(#colorSent)' name='Emails Sent' />
                                    <Area type='monotone' dataKey='users' stroke='#10b981' fillOpacity={1} fill='url(#colorUsers)' name='New Users' />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Email Status Distribution */}
                {statusData.length > 0 && (
                    <Card className='shadow-md'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Mail className='h-5 w-5 text-purple-600' />
                                Email Status Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width='100%' height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx='50%'
                                        cy='50%'
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill='#8884d8'
                                        dataKey='value'
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className='mt-4 flex justify-center gap-4 flex-wrap'>
                                {statusData.map((item, i) => (
                                    <div key={i} className='flex items-center gap-2'>
                                        <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }}></div>
                                        <span className='text-sm text-gray-600'>
                                            {item.name}: {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Charts Row 2 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Weekly Activity */}
                {weeklyData.some((d) => d.emails > 0) && (
                    <Card className='shadow-md'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Calendar className='h-5 w-5 text-green-600' />
                                Weekly Email Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width='100%' height={300}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='day' />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey='emails' fill='#3b82f6' name='Emails Sent' />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Performance vs Target */}
                {performanceData.length > 0 && (
                    <Card className='shadow-md'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <TrendingUp className='h-5 w-5 text-orange-600' />
                                Performance vs Target
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width='100%' height={300}>
                                <BarChart data={performanceData} layout='vertical'>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis type='number' />
                                    <YAxis dataKey='metric' type='category' width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey='current' fill='#3b82f6' name='Current' />
                                    <Bar dataKey='target' fill='#cbd5e1' name='Target' />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Detailed Stats Row */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <CheckCircle className='h-5 w-5 text-green-600' />
                            Success Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Emails Delivered</span>
                            <span className='font-bold text-green-600'>{emailMetrics.delivered}</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Delivery Rate</span>
                            <span className='font-bold text-green-600'>{deliveryRate}%</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Active Subscribers</span>
                            <span className='font-bold text-green-600'>{userCounts}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <AlertCircle className='h-5 w-5 text-orange-600' />
                            Areas for Improvement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Failed Emails</span>
                            <span className='font-bold text-red-600'>{emailMetrics.failed}</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Failure Rate</span>
                            <span className='font-bold text-red-600'>{failureRate}%</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Pending Tasks</span>
                            <span className='font-bold text-orange-600'>{emailMetrics.pending}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <Clock className='h-5 w-5 text-blue-600' />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Last Campaign</span>
                            <span className='font-bold text-blue-600'>
                                {totalEmailSent.length > 0
                                    ? new Date(totalEmailSent[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>New Subscribers</span>
                            <span className='font-bold text-blue-600'>{latestUsers.length} recent</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Active Automations</span>
                            <span className='font-bold text-blue-600'>{emailMetrics.activeAutomations}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Latest Subscribers */}
            {/* {latestUsers.length > 0 && (
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Users className='h-5 w-5 text-blue-600' />
                            Latest Subscribers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b'>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Name</th>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Email</th>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Joined Date</th>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestUsers.map((user) => (
                                        <tr key={user.id} className='border-b hover:bg-gray-50'>
                                            <td className='py-3 px-4'>{user.fullName || 'N/A'}</td>
                                            <td className='py-3 px-4 text-gray-600'>{user.email || 'N/A'}</td>
                                            <td className='py-3 px-4 text-gray-600'>
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className='py-3 px-4'>
                                                <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'>Active</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )} */}
        </div>
    );
}
