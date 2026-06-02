'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

type BillingRecord = {
    rowKey: string;
    id: number;
    transactionId: string;
    AuthId?: number | null;
    amount: number;
    period: string;
    product: string;
    nextBillingDate: string | null;
    startDate: string | null;
    paymentStatus?: string | null;
    auth: {
        email: string;
        firstName: string;
        lastName: string;
    };
};

type CheckoutApiRecord = {
    id: number;
    transactionId?: string | null;
    AuthId?: number | null;
    amount?: number | null;
    period?: string | null;
    product?: string | null;
    nextBillingDate?: string | null;
    startDate?: string | null;
    auth?: {
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    };
};

type Consultation = {
    id: number;
    createdAt: string;
    updatedAt?: string;
    deleted?: boolean;
    fullName?: string | null;
    companyName?: string | null;
    location?: string | null;
    jobTitle?: string | null;
    email?: string | null;
    phone?: string | null;
    numOfPositions?: number | null;
    dateTime?: string | null;
    totalAmount?: number | null;
    currency?: string | null;
    stripeCheckoutSessionId?: string | null;
    stripePaymentIntentId?: string | null;
    paidAt?: string | null;
    status?: string | null;
};

const PRODUCT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    NewsLetter: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
    DigitalBillboard: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    EmailMarketing: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Consultation: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' },
};

const DEFAULT_COLOR = { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' };

function formatDate(dateStr: string | null) {
    if (!dateStr) return <span className='text-slate-400 italic'>N/A</span>;

    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getBillingStatus(
    nextBillingDate: string | null,
    paymentStatus?: string | null
): {
    label: string;
    className: string;
} {
    if (paymentStatus) {
        const status = paymentStatus.toLowerCase();

        if (status === 'paid') {
            return { label: 'Paid', className: 'bg-green-100 text-green-600' };
        }

        if (status === 'pending') {
            return { label: 'Pending', className: 'bg-orange-100 text-orange-600' };
        }

        if (status === 'failed') {
            return { label: 'Failed', className: 'bg-red-100 text-red-600' };
        }

        return {
            label: paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1),
            className: 'bg-slate-100 text-slate-600',
        };
    }

    if (!nextBillingDate) return { label: 'Inactive', className: 'bg-slate-100 text-slate-500' };

    const diff = new Date(nextBillingDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { label: 'Overdue', className: 'bg-red-100 text-red-600' };
    if (days <= 7) return { label: `Due in ${days}d`, className: 'bg-orange-100 text-orange-600' };

    return { label: 'Active', className: 'bg-green-100 text-green-600' };
}

function splitFullName(fullName?: string | null) {
    const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];

    return {
        firstName: parts[0] || 'Unknown',
        lastName: parts.slice(1).join(' '),
    };
}

function normalizeCheckout(checkout: CheckoutApiRecord): BillingRecord {
    return {
        rowKey: `checkout-${checkout.id}`,
        id: checkout.id,
        transactionId: checkout.transactionId || 'N/A',
        AuthId: checkout.AuthId ?? null,
        amount: Number(checkout.amount ?? 0),
        period: checkout.period || 'N/A',
        product: checkout.product || 'N/A',
        nextBillingDate: checkout.nextBillingDate ?? null,
        startDate: checkout.startDate ?? null,
        auth: {
            email: checkout.auth?.email || 'N/A',
            firstName: checkout.auth?.firstName || 'Unknown',
            lastName: checkout.auth?.lastName || '',
        },
    };
}

function normalizeConsultation(consultation: Consultation): BillingRecord {
    const name = splitFullName(consultation.fullName);

    return {
        rowKey: `consultation-${consultation.id}`,
        id: consultation.id,
        transactionId: consultation.stripePaymentIntentId || consultation.stripeCheckoutSessionId || 'N/A',
        AuthId: null,
        amount: Number(consultation.totalAmount ?? 0),
        period: 'one-time',
        product: 'Consultation',
        startDate: consultation.createdAt ?? null,
        nextBillingDate: null,
        paymentStatus: consultation.status ?? null,
        auth: {
            email: consultation.email || 'N/A',
            firstName: name.firstName,
            lastName: name.lastName,
        },
    };
}

export default function BillingPage() {
    const [checkouts, setCheckouts] = useState<BillingRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Search / filter
    const [search, setSearch] = useState('');
    const [filterProduct, setFilterProduct] = useState('All');

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [checkoutResult, consultationResult] = await Promise.allSettled([
                axios.get('/api/v3/all-users-checkout-details'),
                axios.get('/api/v5/consultation'),
            ]);

            if (checkoutResult.status === 'rejected' && consultationResult.status === 'rejected') {
                throw new Error('Failed to fetch billing and consultation data');
            }

            const checkoutRows: BillingRecord[] =
                checkoutResult.status === 'fulfilled'
                    ? (checkoutResult.value.data?.checkouts ?? []).map(normalizeCheckout)
                    : [];

            const consultationRows: BillingRecord[] =
                consultationResult.status === 'fulfilled'
                    ? (consultationResult.value.data?.consultations ?? []).map(normalizeConsultation)
                    : [];

            setCheckouts([...checkoutRows, ...consultationRows]);

            if (checkoutResult.status === 'rejected' || consultationResult.status === 'rejected') {
                setError('Some records could not be loaded. Please refresh again.');
                setTimeout(() => setError(null), 5000);
            } else {
                setSuccess('Billing data loaded successfully!');
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch {
            setError('Failed to fetch billing data. Please try again later.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Derived
    const allProducts = ['All', ...Array.from(new Set(checkouts.map((c) => c.product)))];

    const filtered = checkouts.filter((c) => {
        const searchValue = search.toLowerCase();
        const fullName = `${c.auth.firstName} ${c.auth.lastName}`.toLowerCase();

        const matchSearch =
            !search ||
            fullName.includes(searchValue) ||
            c.auth.email.toLowerCase().includes(searchValue) ||
            c.product.toLowerCase().includes(searchValue) ||
            c.transactionId.toLowerCase().includes(searchValue);

        const matchProduct = filterProduct === 'All' || c.product === filterProduct;

        return matchSearch && matchProduct;
    });

    // Summary cards
    // const totalRevenue = checkouts.reduce((s, c) => s + c.amount, 0);
    // const activeCount = checkouts.filter((c) => c.nextBillingDate && new Date(c.nextBillingDate) > new Date()).length;
    // const inactiveCount = checkouts.length - activeCount;

    return (
        <div className='space-y-6'>
            {/* ── Loading ── */}
            {isLoading && (
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='dot-spinner'>
                        <div className='dot-spinner__dot' />
                        <div className='dot-spinner__dot' />
                        <div className='dot-spinner__dot' />
                        <div className='dot-spinner__dot' />
                        <div className='dot-spinner__dot' />
                    </div>
                </div>
            )}

            {/* ── Toasts ── */}
            {success && (
                <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative' role='alert'>
                    <span className='block sm:inline'>{success}</span>
                </div>
            )}

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' role='alert'>
                    <span className='block sm:inline'>{error}</span>
                </div>
            )}

            {/* ── Summary Cards ── */}
            {/* {!isLoading && (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    <div className='bg-white rounded-xl shadow border border-slate-200 p-5 flex items-center gap-4'>
                        <div className='h-11 w-11 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl'>💳</div>
                        <div>
                            <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>Total Subscriptions</p>
                            <p className='text-2xl font-bold text-slate-800'>{checkouts.length}</p>
                        </div>
                    </div>

                    <div className='bg-white rounded-xl shadow border border-slate-200 p-5 flex items-center gap-4'>
                        <div className='h-11 w-11 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl'>✅</div>
                        <div>
                            <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>Active / Inactive</p>
                            <p className='text-2xl font-bold text-slate-800'>
                                {activeCount}
                                <span className='text-slate-400 text-base font-normal'> / {inactiveCount}</span>
                            </p>
                        </div>
                    </div>

                    <div className='bg-white rounded-xl shadow border border-slate-200 p-5 flex items-center gap-4'>
                        <div className='h-11 w-11 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-xl'>💰</div>
                        <div>
                            <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>Total Revenue</p>
                            <p className='text-2xl font-bold text-slate-800'>${totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )} */}

            {/* ── Main Table Card ── */}
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                {/* Header */}
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <h2 className='text-2xl font-bold text-white'>Billing Cycles</h2>

                    <button
                        onClick={fetchData}
                        className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer self-start sm:self-auto'
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className='px-6 pt-5 pb-3 flex flex-col sm:flex-row gap-3'>
                    <input
                        type='text'
                        placeholder='Search by name, email, product or transaction ID…'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />

                    <select
                        value={filterProduct}
                        onChange={(e) => setFilterProduct(e.target.value)}
                        className='rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                    >
                        {allProducts.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className='p-6 pt-2'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead>
                                <tr className='border-b border-slate-200'>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700 whitespace-nowrap'>Sr #</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700 whitespace-nowrap'>User</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700 whitespace-nowrap'>Product</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700 whitespace-nowrap'>Amount</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700 whitespace-nowrap'>Period</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700 whitespace-nowrap'>Start Date</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700 whitespace-nowrap'>Next Billing</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700 whitespace-nowrap'>Status</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700 whitespace-nowrap'>Transaction ID</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((checkout, index) => {
                                    const color = PRODUCT_COLORS[checkout.product] ?? DEFAULT_COLOR;
                                    const status = getBillingStatus(checkout.nextBillingDate, checkout.paymentStatus);

                                    return (
                                        <tr key={checkout.rowKey} className='border-b border-slate-100 hover:bg-slate-50 transition-colors'>
                                            {/* Sr # */}
                                            <td className='py-3 px-4 text-slate-500 text-sm'>{index + 1}</td>

                                            {/* User */}
                                            <td className='py-3 px-4'>
                                                <p className='font-medium text-slate-800 text-sm whitespace-nowrap'>
                                                    {checkout.auth.firstName} {checkout.auth.lastName}
                                                </p>
                                                <p className='text-xs text-blue-600'>{checkout.auth.email}</p>
                                            </td>

                                            {/* Product */}
                                            <td className='py-3 px-4'>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${color.bg} ${color.text}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                                                    {checkout.product}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className='py-3 px-4 font-semibold text-slate-800 text-sm'>${checkout.amount.toLocaleString()}</td>

                                            {/* Period */}
                                            <td className='py-3 px-4 text-sm capitalize text-slate-600'>{checkout.period}</td>

                                            {/* Start Date */}
                                            <td className='py-3 px-4 text-sm text-slate-600 whitespace-nowrap'>{formatDate(checkout.startDate)}</td>

                                            {/* Next Billing */}
                                            <td className='py-3 px-4 text-sm text-slate-600 whitespace-nowrap'>{formatDate(checkout.nextBillingDate)}</td>

                                            {/* Status */}
                                            <td className='py-3 px-4'>
                                                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>

                                            {/* Transaction ID */}
                                            <td className='py-3 px-4'>
                                                <span className='font-mono text-xs text-slate-400 truncate block max-w-[160px]' title={checkout.transactionId}>
                                                    {checkout.transactionId}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filtered.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={9} className='py-10 px-4 text-center text-slate-400 text-sm'>
                                            No billing records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer count */}
                    {filtered.length > 0 && (
                        <p className='mt-4 text-xs text-slate-400 text-right'>
                            Showing {filtered.length} of {checkouts.length} records
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
