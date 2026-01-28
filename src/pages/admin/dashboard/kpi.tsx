'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function KPIPage() {
    // const [expandedSections, setExpandedSections] = useState<string[]>(['Overview']);
    const [data, setData] = useState<KPIResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Pagination and sorting for paying customers
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'revenue' | 'date'>('revenue');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 10;

    // const toggleSection = (sectionName: string) => {
    //     setExpandedSections((prev) => (prev.includes(sectionName) ? prev.filter((s) => s !== sectionName) : [...prev, sectionName]));
    // };

    useEffect(() => {
        const fetchKPI = async () => {
            try {
                setIsLoading(true);
                setErrorMsg(null);
                const res = await fetch('/api/v2/kpi', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!res.ok) throw new Error(`Failed to fetch KPI: ${res.status}`);
                const json = (await res.json()) as KPIResponse;
                setData(json);
            } catch (e: any) {
                setErrorMsg(e?.message || 'Failed to load data');
                console.error('KPI fetch error:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchKPI();
    }, []);

    const affiliates = data?.affiliateUsers ?? [];
    const sales = data?.salesUsers ?? [];
    // const latestBlog = data?.latestBlog ?? null;
    const latestNotes = data?.latestThreeNotes ?? [];
    // const latestBillboard = data?.latestBillboard ?? null;
    const billboardApprovals = data?.latestBillBoardApprovels ?? [];
    // const latestJob = data?.latestJob ?? null;
    const latestApplicants = data?.latestJobApplicants ?? [];
    const rsvpEvents = data?.rsvpEvents ?? [];
    const checkoutRevenues = (data?.checkoutRevenues ?? []) as CheckoutRevenue[];
    const userProducts = (data?.userProducts ?? []) as ProductUser[];

    // Analytics calculations
    // const getGrowthData = (users: User[]) => {
    //     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //     const monthlyData = months.map((month, idx) => {
    //         const count = users.filter((u) => {
    //             const date = new Date(u.createdAt);
    //             return date.getMonth() === idx && date.getFullYear() === 2025;
    //         }).length;
    //         return { month, count };
    //     });
    //     return monthlyData;
    // };

    // const getBillboardStatusData = () => {
    //     const statuses = ['Approved', 'NotApproved', 'Rejected'];
    //     return statuses
    //         .map((status) => ({
    //             name: status,
    //             value: billboardApprovals.filter((b) => b.status === status).length,
    //         }))
    //         .filter((item) => item.value > 0);
    // };

    const getRecentActivity = () => {
        const allActivity = [
            ...affiliates.map((u) => ({ type: 'Affiliate Signup', date: u.createdAt, name: `${u.firstName} ${u.lastName}` })),
            ...sales.map((u) => ({ type: 'Sales Signup', date: u.createdAt, name: `${u.firstName} ${u.lastName}` })),
            ...latestApplicants.map((a) => ({ type: 'Job Application', date: a.createdAt, name: `${a.firstName} ${a.lastName}` })),
            ...billboardApprovals.map((b) => ({ type: 'Billboard Request', date: b.createdAt, name: b.fullName })),
        ];
        return allActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    };

    // const getRsvpUtilization = () => {
    //     return rsvpEvents.map((event) => ({
    //         id: event.id,
    //         date: new Date(event.date).toLocaleDateString(),
    //         registered: event.userBroughtProduct?.length || 0,
    //         limit: event.limit,
    //         utilization: ((event.userBroughtProduct?.length || 0) / event.limit) * 100,
    //     }));
    // };

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
            .filter((item) => item._sum?.amount && item._sum.amount > 0)
            .map((item) => ({
                name: formatProductName(item.product),
                value: item._sum.amount || 0,
            }));
    }

    function getProductComparisons(revenues: CheckoutRevenue[]) {
        const products = revenues.map((r) => ({ product: formatProductName(r.product), revenue: r._sum.amount || 0 }));
        // Example comparison: highest vs lowest
        if (products.length < 2) return null;
        const sorted = [...products].sort((a, b) => b.revenue - a.revenue);
        const highest = sorted[0];
        const lowest = sorted[sorted.length - 1];
        const avg = products.reduce((sum, p) => sum + p.revenue, 0) / products.length;
        return { highest, lowest, average: avg };
    }

    // function getNewsletterSubscribers(users: ProductUser[]) {
    //     return users.filter((user) => user.roles?.includes('NewsLetter') ?? false);
    // }

    const currency = (n?: number | null) =>
        typeof n === 'number' ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : '$0';

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

    // const affiliateGrowth = getGrowthData(affiliates);
    // const salesGrowth = getGrowthData(sales);
    // const billboardStatus = getBillboardStatusData();
    const recentActivity = getRecentActivity();
    // const rsvpUtilization = getRsvpUtilization();

    const revenueBreakdown = getRevenueBreakdownFromUsers(userProducts);
    const allPayingCustomersRaw = getAllPayingCustomers(userProducts);
    const sortedCustomers = sortCustomers(allPayingCustomersRaw);
    const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
    const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const productRevenueChartData = checkoutRevenues
        .filter((item) => item && typeof item.product === 'string')
        .map((item) => {
            const rawProduct = item.product;
            const amount = item._sum?.amount ?? 0;
            return {
                productKey: rawProduct,
                product: formatProductName(rawProduct),
                revenue: typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0,
            };
        })
        .filter((item) => item.revenue > 0);

    const revenuePieData = getRevenuePieData(checkoutRevenues);
    const productComparisons = getProductComparisons(checkoutRevenues);

    const derivedTotalRevenue = productRevenueChartData.reduce((sum, item) => sum + item.revenue, 0);
    const apiTotalProfit = data?.totalProfit?._sum?.amount;
    const totalProfit = typeof apiTotalProfit === 'number' && !Number.isNaN(apiTotalProfit) ? apiTotalProfit : derivedTotalRevenue;

    const totalPayingCustomers = userProducts.filter(
        (user) => Array.isArray(user.Checkouts) && user.Checkouts.some((checkout) => checkout && checkout.paid && !checkout.deleted)
    ).length;

    const totalPaidTransactions = userProducts.reduce((sum, user) => {
        if (!Array.isArray(user.Checkouts)) return sum;
        const paidCount = user.Checkouts.filter((checkout) => checkout && checkout.paid && !checkout.deleted).length;
        return sum + paidCount;
    }, 0);

    const avgRevenuePerCustomer = totalPayingCustomers > 0 ? totalProfit / totalPayingCustomers : 0;

    // const getRevenueForProduct = (productKey: string) => productRevenueChartData.find((item) => item.productKey === productKey)?.revenue ?? 0;

    // const newsletterRevenue = getRevenueForProduct('NewsLetter');
    // const billboardRevenue = getRevenueForProduct('DigitalBillboard');
    // const rsvpRevenue = getRevenueForProduct('RSVP');

    // const newsletterSubscribers = getNewsletterSubscribers(userProducts);

    const handleSort = (column: 'revenue' | 'date') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    // const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    //     <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
    //         <div className='flex items-center justify-between mb-4'>
    //             <div className={`p-3 rounded-lg bg-${color}-50`}>
    //                 <Icon className={`w-6 h-6 text-${color}-600`} />
    //             </div>
    //             {trend && (
    //                 <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
    //                     {trend === 'up' ? <TrendingUp className='w-4 h-4' /> : <TrendingDown className='w-4 h-4' />}
    //                     <span>{trendValue}</span>
    //                 </div>
    //             )}
    //         </div>
    //         <h3 className='text-sm font-medium text-gray-500 mb-1'>{title}</h3>
    //         <p className='text-3xl font-bold text-gray-900'>{value}</p>
    //     </div>
    // );

    if (errorMsg) {
        return (
            <div className='min-h-screen bg-gray-50 p-8'>
                <div className='max-w-7xl mx-auto'>
                    <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
                        <h3 className='text-lg font-semibold text-red-800 mb-2'>Error Loading Dashboard</h3>
                        <p className='text-red-600'>{errorMsg}</p>
                        <button onClick={() => window.location.reload()} className='mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'>
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className='max-w-7xl mx-auto space-y-8'>
                {/* Header */}
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg shadow-lg p-8 text-white'>
                    <h1 className='text-4xl font-bold mb-2'>Analytics Dashboard</h1>
                    <p className='text-blue-100'>Comprehensive KPI metrics and insights</p>
                    {isLoading && <div className='mt-4 text-sm'>Loading data...</div>}
                </div>

                {/* Overview Stats */}
                {/*
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    <StatCard title='Total Affiliates' value={isLoading ? '...' : affiliates.length} icon={Users} color='blue' trend='up' trendValue='+12%' />
                    <StatCard title='Sales Team' value={isLoading ? '...' : sales.length} icon={Briefcase} color='green' trend='up' trendValue='+8%' />
                    <StatCard title='Job Applicants' value={isLoading ? '...' : latestApplicants.length} icon={FileText} color='orange' />
                    <StatCard
                        title='Total Revenue'
                        value={isLoading ? '...' : currency(totalProfit)}
                        icon={DollarSign}
                        color='purple'
                        trend='up'
                        trendValue='+24%'
                    />
                </div>
                */}

                {/* Growth Charts */}
                {/*
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Affiliate Growth Trend</h3>
                        {isLoading ? (
                            <div className='h-64 flex items-center justify-center text-gray-400'>Loading chart...</div>
                        ) : affiliates.length > 0 ? (
                            <ResponsiveContainer width='100%' height={300}>
                                <AreaChart data={affiliateGrowth}>
                                    <defs>
                                        <linearGradient id='colorAff' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                                            <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='month' />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type='monotone' dataKey='count' stroke='#3b82f6' fillOpacity={1} fill='url(#colorAff)' />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='h-64 flex items-center justify-center text-gray-400'>No data available</div>
                        )}
                    </div>

                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Sales Growth Trend</h3>
                        {isLoading ? (
                            <div className='h-64 flex items-center justify-center text-gray-400'>Loading chart...</div>
                        ) : sales.length > 0 ? (
                            <ResponsiveContainer width='100%' height={300}>
                                <LineChart data={salesGrowth}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='month' />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type='monotone' dataKey='count' stroke='#10b981' strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='h-64 flex items-center justify-center text-gray-400'>No data available</div>
                        )}
                    </div>
                </div>
                */}

                {/* Billboard & RSVP Analytics */}
                {/*
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Billboard Status Distribution</h3>
                        {isLoading ? (
                            <div className='h-64 flex items-center justify-center text-gray-400'>Loading chart...</div>
                        ) : billboardStatus.length > 0 ? (
                            <ResponsiveContainer width='100%' height={300}>
                                <PieChart>
                                    <Pie
                                        data={billboardStatus}
                                        cx='50%'
                                        cy='50%'
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill='#8884d8'
                                        dataKey='value'
                                    >
                                        {billboardStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='h-64 flex items-center justify-center text-gray-400'>No billboard data</div>
                        )}
                    </div>

                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-4'>RSVP Event Utilization</h3>
                        {isLoading ? (
                            <div className='h-64 flex items-center justify-center text-gray-400'>Loading chart...</div>
                        ) : rsvpUtilization.length > 0 ? (
                            <ResponsiveContainer width='100%' height={300}>
                                <BarChart data={rsvpUtilization}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='date' />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey='registered' fill='#3b82f6' name='Registered' />
                                    <Bar dataKey='limit' fill='#e5e7eb' name='Limit' />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='h-64 flex items-center justify-center text-gray-400'>No RSVP data</div>
                        )}
                    </div>
                </div>
                */}

                {/* Revenue Analytics */}
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
                                        <Tooltip formatter={(value) => currency(value as number)} labelFormatter={(label) => `Product: ${label}`} />
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
                                        {revenuePieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => currency(value as number)} />
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
                                    disabled={currentPage === totalPages}
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

                {/* Detailed Sections */}
                {/* <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                    {['Newsletter', 'Billboard', 'Affiliate', 'Sales', 'Events', 'Blogs', 'Notes'].map((section) => (
                        <div key={section} className='border-b border-gray-200 last:border-b-0'>
                            <button
                                onClick={() => toggleSection(section)}
                                className='w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition'
                            >
                                <span className='text-lg font-semibold text-gray-800'>{section}</span>
                                {expandedSections.includes(section) ? (
                                    <ChevronDown className='w-5 h-5 text-gray-500' />
                                ) : (
                                    <ChevronRight className='w-5 h-5 text-gray-500' />
                                )}
                            </button>

                            {expandedSections.includes(section) && (
                                <div className='px-6 pb-6'>
                                    {section === 'Newsletter' && (
                                        <div className='space-y-6'>
                                            <div className='flex flex-wrap gap-4'>
                                                <div className='px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm'>
                                                    <span className='font-semibold'>Newsletter revenue: </span>
                                                    <span>{currency(newsletterRevenue)}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className='font-semibold text-gray-800 mb-3'>Newsletter Subscribers</h4>
                                                {newsletterSubscribers.length > 0 ? (
                                                    <div className='overflow-x-auto'>
                                                        <table className='w-full text-sm'>
                                                            <thead className='bg-gray-50'>
                                                                <tr>
                                                                    <th className='px-4 py-2 text-left font-medium text-gray-500'>Name</th>
                                                                    <th className='px-4 py-2 text-left font-medium text-gray-500'>Email</th>
                                                                    <th className='px-4 py-2 text-left font-medium text-gray-500'>Subscribed On</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className='divide-y'>
                                                                {newsletterSubscribers.map((user) => (
                                                                    <tr key={user.id}>
                                                                        <td className='px-4 py-2 font-medium text-gray-900'>
                                                                            {user.firstName} {user.lastName}
                                                                        </td>
                                                                        <td className='px-4 py-2 text-gray-600'>{user.email}</td>
                                                                        <td className='px-4 py-2 text-gray-500'>{formatDate(user.createdAt)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className='text-gray-500'>No subscribers yet</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {section === 'Blogs' && (
                                        <div className='space-y-6'>
                                            {latestBlog ? (
                                                <div className='border rounded-lg p-4'>
                                                    <h4 className='font-semibold text-gray-800 mb-2'>Latest Blog: {latestBlog.title}</h4>
                                                    <div className='flex gap-4 text-sm text-gray-500 mb-3'>
                                                        <span>Category: {latestBlog.category}</span>
                                                        <span>Views: {latestBlog.views}</span>
                                                        <span>{formatDate(latestBlog.createdAt)}</span>
                                                    </div>
                                                    <p className='text-gray-600 line-clamp-3'>{latestBlog.postContent}</p>
                                                </div>
                                            ) : (
                                                <p className='text-gray-500'>No blog posts available</p>
                                            )}
                                        </div>
                                    )}

                                    {section === 'Notes' && (
                                        <div className='space-y-6'>
                                            {latestNotes.length > 0 ? (
                                                <div>
                                                    <h4 className='font-semibold text-gray-800 mb-3'>Recent Notes</h4>
                                                    <div className='space-y-3'>
                                                        {latestNotes.map((note) => (
                                                            <div key={note.id} className='border rounded-lg p-4'>
                                                                <div className='flex justify-between items-start mb-2'>
                                                                    <h5 className='font-medium text-gray-800'>{note.title}</h5>
                                                                    <span className='text-xs text-gray-500'>{timeAgo(note.createdAt)}</span>
                                                                </div>
                                                                <p className='text-sm text-gray-600'>{note.content}</p>
                                                                <p className='text-xs text-gray-500 mt-2'>by {note.authorName}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className='text-gray-500'>No notes available</p>
                                            )}
                                        </div>
                                    )}

                                    {section === 'Affiliate' && (
                                        <div className='overflow-x-auto'>
                                            {affiliates.length > 0 ? (
                                                <table className='w-full'>
                                                    <thead className='bg-gray-50'>
                                                        <tr>
                                                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Name</th>
                                                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Email</th>
                                                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Joined</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className='divide-y'>
                                                        {affiliates.slice(0, 10).map((user) => (
                                                            <tr key={user.id}>
                                                                <td className='px-4 py-2 text-sm'>
                                                                    {user.firstName} {user.lastName}
                                                                </td>
                                                                <td className='px-4 py-2 text-sm text-gray-600'>{user.email}</td>
                                                                <td className='px-4 py-2 text-sm text-gray-500'>{timeAgo(user.createdAt)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className='text-gray-500'>No affiliates found</p>
                                            )}
                                        </div>
                                    )}

                                    {section === 'Sales' && (
                                        <div className='space-y-6'>
                                            {sales.length > 0 && (
                                                <div className='overflow-x-auto'>
                                                    <table className='w-full'>
                                                        <thead className='bg-gray-50'>
                                                            <tr>
                                                                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Name</th>
                                                                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Email</th>
                                                                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Joined</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className='divide-y'>
                                                            {sales.slice(0, 10).map((user) => (
                                                                <tr key={user.id}>
                                                                    <td className='px-4 py-2 text-sm'>
                                                                        {user.firstName} {user.lastName}
                                                                    </td>
                                                                    <td className='px-4 py-2 text-sm text-gray-600'>{user.email}</td>
                                                                    <td className='px-4 py-2 text-sm text-gray-500'>{timeAgo(user.createdAt)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {latestJob && (
                                                <div className='border rounded-lg p-4'>
                                                    <h4 className='font-semibold text-gray-800 mb-2'>{latestJob.title}</h4>
                                                    <div className='flex gap-4 text-sm text-gray-500 mb-2'>
                                                        <span>{latestJob.location}</span>
                                                        <span>{currency(latestJob.salary)}</span>
                                                        <span>{latestJob.type}</span>
                                                    </div>
                                                    <p className='text-gray-600'>{latestJob.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {section === 'Billboard' && (
                                        <div>
                                            <div className='mb-4'>
                                                <span className='text-sm font-semibold text-gray-700'>Digital billboard revenue:</span>
                                                <span className='ml-2 text-sm text-gray-900'>{currency(billboardRevenue)}</span>
                                            </div>
                                            {billboardApprovals.length > 0 ? (
                                                <div className='grid md:grid-cols-2 gap-4'>
                                                    {billboardApprovals.map((billboard) => (
                                                        <div key={billboard.id} className='border rounded-lg p-4'>
                                                            <div className='flex justify-between items-start mb-2'>
                                                                <h5 className='font-medium'>{billboard.fullName}</h5>
                                                                <span
                                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                                        billboard.status === 'Approved'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : billboard.status === 'Rejected'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}
                                                                >
                                                                    {billboard.status}
                                                                </span>
                                                            </div>
                                                            {billboard.companyName && <p className='text-sm text-gray-600'>{billboard.companyName}</p>}
                                                            {billboard.description && <p className='text-sm text-gray-500 mt-2'>{billboard.description}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className='text-gray-500'>No billboard data available</p>
                                            )}
                                        </div>
                                    )}

                                    {section === 'Events' && (
                                        <div>
                                            <div className='mb-4'>
                                                <span className='text-sm font-semibold text-gray-700'>RSVP revenue:</span>
                                                <span className='ml-2 text-sm text-gray-900'>{currency(rsvpRevenue)}</span>
                                            </div>
                                            {rsvpEvents.length > 0 ? (
                                                <div className='overflow-x-auto'>
                                                    <table className='w-full'>
                                                        <thead className='bg-gray-50'>
                                                            <tr>
                                                                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Event ID</th>
                                                                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Date</th>
                                                                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Time</th>
                                                                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Registered</th>
                                                                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Limit</th>
                                                                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Utilization</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className='divide-y'>
                                                            {rsvpEvents.map((event) => {
                                                                const registered = event.userBroughtProduct?.length || 0;
                                                                const utilization = (registered / event.limit) * 100;
                                                                return (
                                                                    <tr key={event.id} className='hover:bg-gray-50'>
                                                                        <td className='px-4 py-2 text-sm font-medium'>#{event.id}</td>
                                                                        <td className='px-4 py-2 text-sm'>{formatDate(event.date)}</td>
                                                                        <td className='px-4 py-2 text-sm'>{event.time}</td>
                                                                        <td className='px-4 py-2 text-sm'>{registered}</td>
                                                                        <td className='px-4 py-2 text-sm'>{event.limit}</td>
                                                                        <td className='px-4 py-2 text-sm'>
                                                                            <div className='flex items-center gap-2'>
                                                                                <div className='flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]'>
                                                                                    <div
                                                                                        className={`h-2 rounded-full ${
                                                                                            utilization >= 80
                                                                                                ? 'bg-green-500'
                                                                                                : utilization >= 50
                                                                                                ? 'bg-yellow-500'
                                                                                                : 'bg-red-500'
                                                                                        }`}
                                                                                        style={{ width: `${Math.min(utilization, 100)}%` }}
                                                                                    />
                                                                                </div>
                                                                                <span className='text-xs text-gray-600'>{utilization.toFixed(0)}%</span>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className='text-gray-500'>No events scheduled</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div> */}

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
