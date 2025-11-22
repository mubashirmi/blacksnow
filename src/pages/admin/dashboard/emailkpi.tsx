import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Calendar, CheckCircle, Clock, Info, Loader2, Lock, Mail, ShieldCheck, TrendingUp, Users, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function SalesKPIPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Credentials gate
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [checkingCredentials, setCheckingCredentials] = useState(false);
    const [credsSubmitting, setCredsSubmitting] = useState(false);
    const [credentialsData, setCredentialsData] = useState<{ email: string; appPassword: string }>({ email: '', appPassword: '' });
    const [credentialsErrors, setCredentialsErrors] = useState<{ email?: string; appPassword?: string }>({});

    useEffect(() => {
        (async () => {
            const ok = await checkMarketingCredentials();
            if (ok) {
                fetchKPIData();
            } else {
                setLoading(false); // stop page spinner if gated by creds
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkMarketingCredentials = async (): Promise<boolean> => {
        try {
            setCheckingCredentials(true);
            const adminId = Number(localStorage.getItem('adminId'));
            if (!adminId) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return false;
            }
            const res = await fetch(`/api/v2/marketingCredentials?adminId=${adminId}`);
            if (!res.ok) {
                setShowCredentialsModal(true);
                return false;
            }
            const json = await res.json();
            const ok =
                json &&
                json.policy &&
                typeof json.policy.email === 'string' &&
                json.policy.email.trim() &&
                typeof json.policy.appPassword === 'string' &&
                json.policy.appPassword.trim();

            setShowCredentialsModal(!ok);
            return !!ok;
        } catch (e) {
            console.error('Failed to check marketing credentials:', e);
            setShowCredentialsModal(true);
            return false;
        } finally {
            setCheckingCredentials(false);
        }
    };

    const validateCredentialsForm = () => {
        const errs: { email?: string; appPassword?: string } = {};
        const email = credentialsData.email.trim();
        const appPassword = credentialsData.appPassword.trim();

        if (!email) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';

        // Accept 16+ alphanum, OR four groups of 4 alphanum separated by spaces
        const noSpacePattern = /^[a-zA-Z0-9]{16,}$/;
        const groupedPattern = /^[a-zA-Z0-9]{4}(?:\s[a-zA-Z0-9]{4}){3}$/;

        if (!appPassword) errs.appPassword = 'App password is required';
        else if (!(noSpacePattern.test(appPassword) || groupedPattern.test(appPassword))) {
            errs.appPassword = 'Use a valid app password format (16+ chars or 4×4 groups)';
        }

        setCredentialsErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCredentialsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentialsData((prev) => ({ ...prev, [name]: value }));
        if (credentialsErrors[name as keyof typeof credentialsErrors]) {
            setCredentialsErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCredentialsSubmit = async () => {
        if (!validateCredentialsForm()) return;

        try {
            setError(null);
            setCredsSubmitting(true);
            const adminId = Number(localStorage.getItem('adminId'));
            if (!adminId) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const resp = await fetch('/api/v2/marketingCredentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: adminId,
                    email: credentialsData.email.trim(),
                    appPassword: credentialsData.appPassword.trim(),
                }),
            });

            if (!resp.ok) {
                const j = await resp.json().catch(() => ({}));
                throw new Error(j.message || 'Failed to save credentials');
            }

            setShowCredentialsModal(false);
            // now that creds exist, load KPI
            fetchKPIData();
        } catch (e: any) {
            setError(e.message || 'Failed to save credentials');
        } finally {
            setCredsSubmitting(false);
        }
    };

    const fetchKPIData = async () => {
        try {
            setLoading(true);
            setError(null);
            const adminId = Number(localStorage.getItem('adminId'));
            if (!adminId) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }
            const response = await fetch(`/api/v2/marketing-kpi/?authId=${adminId}`);
            if (!response.ok) throw new Error('Failed to fetch KPI data');

            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching KPI data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || checkingCredentials) {
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

    if (error && !showCredentialsModal) {
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
    const emailMarketingUsers = data?.emailMarketingUsers || [];
    const userCounts = data?.userCounts || 0;
    const latestSchedules = data?.latestSchedules || [];
    const totalEmailSent = data?.totalEmailSent || [];
    const sentEmailNumbers = data?.sentEmailNumbers || 0;

    const pendingEmails = latestSchedules.filter((s: any) => s.status === 'pending').length;
    const failedEmails = latestSchedules.filter((s: any) => s.status === 'failed').length;
    const sentEmails = totalEmailSent.filter((e: any) => e.status === 'sent').length;

    const emailMetrics = {
        totalSent: sentEmailNumbers,
        delivered: sentEmails,
        failed: failedEmails,
        pending: pendingEmails,
        activeAutomations: latestSchedules.length,
    };

    const deliveryRate = emailMetrics.totalSent > 0 ? ((emailMetrics.delivered / emailMetrics.totalSent) * 100).toFixed(1) : '0.0';
    const failureRate =
        emailMetrics.failed + emailMetrics.delivered > 0 ? ((emailMetrics.failed / (emailMetrics.failed + emailMetrics.delivered)) * 100).toFixed(1) : '0.0';

    const processMonthlyData = () => {
        const monthCounts: Record<string, { sent: number; users: number; automations: number }> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${months[date.getMonth()]}`;
            monthCounts[monthKey] = { sent: 0, users: 0, automations: 0 };
        }

        totalEmailSent.forEach((email: any) => {
            if (email.createdAt) {
                const date = new Date(email.createdAt);
                const monthKey = months[date.getMonth()];
                if (monthCounts[monthKey]) monthCounts[monthKey].sent++;
            }
        });

        // latestUsers.forEach((user: any) => {
        //     if (user.createdAt) {
        //         const date = new Date(user.createdAt);
        //         const monthKey = months[date.getMonth()];
        //         if (monthCounts[monthKey]) monthCounts[monthKey].users++;
        //     }
        // });

        return Object.entries(monthCounts).map(([month, data]) => ({ month, ...data }));
    };

    const monthlyData = processMonthlyData();

    const statusData = [
        { name: 'Sent', value: emailMetrics.delivered, color: '#10b981' },
        { name: 'Failed', value: emailMetrics.failed, color: '#ef4444' },
        { name: 'Pending', value: emailMetrics.pending, color: '#f59e0b' },
    ].filter((item) => item.value > 0);

    const weeklyData = [
        { day: 'Mon', emails: 0, opens: 0 },
        { day: 'Tue', emails: 0, opens: 0 },
        { day: 'Wed', emails: 0, opens: 0 },
        { day: 'Thu', emails: 0, opens: 0 },
        { day: 'Fri', emails: 0, opens: 0 },
        { day: 'Sat', emails: 0, opens: 0 },
        { day: 'Sun', emails: 0, opens: 0 },
    ];
    totalEmailSent.slice(0, 7).forEach((email: any, index: number) => {
        if (weeklyData[index]) weeklyData[index].emails++;
    });

    const performanceData = [
        { metric: 'Campaigns', current: emailMetrics.totalSent, target: Math.max(10, emailMetrics.totalSent + 3) },
        { metric: 'Subscribers', current: userCounts, target: Math.max(20, userCounts + 5) },
        { metric: 'Automations', current: emailMetrics.activeAutomations, target: Math.max(5, emailMetrics.activeAutomations + 2) },
        { metric: 'Delivery Rate', current: parseFloat(deliveryRate), target: 95 },
    ];

    // Credentials modal gate (shown when missing/incomplete)
    const CredentialsModal = () =>
        showCredentialsModal ? (
            <div className='fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50'>
                <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden'>
                    <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6'>
                        <div className='flex items-center gap-3'>
                            <ShieldCheck className='w-8 h-8 text-white' />
                            <div>
                                <h2 className='text-2xl font-bold text-white'>Email Credentials Required</h2>
                                <p className='text-blue-100 text-sm'>Setup required to view marketing analytics</p>
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
                                        Your email app password lets us pull/send data for KPI reporting, directly from your email provider.
                                    </p>
                                    <p className='text-blue-800 text-sm mt-2'>
                                        <strong>Note:</strong> An app password is different from your account password. Generate one in your provider&apos;s
                                        security settings.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                                <p className='text-red-800 text-sm'>{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor='cred-email' className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
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
                                    credentialsErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                placeholder='your.email@gmail.com'
                                disabled={credsSubmitting}
                            />
                            {credentialsErrors.email && <p className='text-red-600 text-sm mt-1'>{credentialsErrors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor='appPassword' className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
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
                                    credentialsErrors.appPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono`}
                                placeholder='xbsr gbiv sizp twwe'
                                disabled={credsSubmitting}
                            />
                            {credentialsErrors.appPassword && <p className='text-red-600 text-sm mt-1'>{credentialsErrors.appPassword}</p>}
                            <p className='text-slate-500 text-xs mt-1'>Enter the app password exactly as provided by your email provider</p>
                        </div>

                        <div className='pt-2'>
                            <button
                                type='button'
                                onClick={handleCredentialsSubmit}
                                disabled={credsSubmitting}
                                className='w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl'
                            >
                                {credsSubmitting ? (
                                    <>
                                        <Loader2 className='w-5 h-5 animate-spin' />
                                        Saving Credentials...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className='w-5 h-5' />
                                        Save &amp; Continue
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : null;

    return (
        <div className='space-y-6 p-6 bg-gray-50'>
            {/* Modal if needed */}
            <CredentialsModal />

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

            {/* Charts Row 1 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
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
                            <span className='font-bold text-blue-600'>{emailMarketingUsers.length} recent</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Active Automations</span>
                            <span className='font-bold text-blue-600'>{emailMetrics.activeAutomations}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Latest Subscribers */}
            {emailMarketingUsers.length > 0 && (
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Users className='h-5 w-5 text-blue-600' />
                            Latest Email Marketing Subscribers
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
                                    {emailMarketingUsers.map((user: any) => (
                                        <tr key={user.id} className='border-b hover:bg-gray-50'>
                                            <td className='py-3 px-4'>{user.firstName + ' ' + user.lastName}</td>
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
            )}
        </div>
    );
}
