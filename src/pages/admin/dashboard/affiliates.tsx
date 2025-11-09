'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';

// Shape coming back from /api/v2/get-affiliate (based on sample provided)
type ApiAffiliate = {
    id: number;
    createdAt: string;
    updatedAt?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    status?: string | null;
    adminStripeConnectId?: string | null;
    referredById?: number | null;
};

type AffiliateRow = {
    id: number;
    name: string;
    email: string;
    status: string;
    joinDate: string;
};

const PAGE_SIZE = 10;

export default function AffiliatesPage() {
    const router = useRouter();
    const [rows, setRows] = React.useState<AffiliateRow[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [page, setPage] = React.useState<number>(1);

    React.useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('/api/v2/get-affiliate', {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`Request failed (${res.status})`);
                }

                const data: { message?: string; auths?: ApiAffiliate[] } = await res.json();
                const affiliates = (data.auths ?? []).map<AffiliateRow>((a) => ({
                    id: a.id,
                    name: `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() || '(No name)',
                    email: a.email,
                    // If API doesn't provide explicit status, default Affiliates to Active; otherwise show status/role
                    status: (a.status ?? null) !== null && a.status !== undefined ? String(a.status) : a.role === 'Affiliate' ? 'Active' : a.role ?? 'Unknown',
                    joinDate: a.createdAt,
                }));

                setRows(affiliates);
            } catch (err: any) {
                if (err?.name !== 'AbortError') setError(err?.message || 'Failed to load affiliates');
            } finally {
                setLoading(false);
            }
        }

        load();
        return () => controller.abort();
    }, []);

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const paginated = React.useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return rows.slice(start, start + PAGE_SIZE);
    }, [rows, page]);

    React.useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    const formatDate = (iso: string) => {
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return iso;
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
        } catch {
            return iso;
        }
    };

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className='space-y-6'>
            {/* Card shell with dark gradient header (shared design) */}
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-white'>Affiliates</h2>
                    {!loading && <span className='text-sm text-white/80'>{rows.length} total</span>}
                </div>

                <div className='p-6'>
                    {/* Error state */}
                    {error && <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</div>}

                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead>
                                <tr className='border-b border-slate-200'>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Name</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Email</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Join Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    // Skeleton rows
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={`skeleton-${i}`} className='border-b border-slate-100'>
                                            <td className='py-3 px-4'>
                                                <div className='h-4 w-40 animate-pulse rounded bg-slate-200' />
                                            </td>
                                            <td className='py-3 px-4'>
                                                <div className='h-4 w-56 animate-pulse rounded bg-slate-200' />
                                            </td>
                                            <td className='py-3 px-4'>
                                                <div className='h-5 w-20 animate-pulse rounded-full bg-slate-200' />
                                            </td>
                                            <td className='py-3 px-4'>
                                                <div className='h-4 w-28 animate-pulse rounded bg-slate-200' />
                                            </td>
                                        </tr>
                                    ))
                                ) : paginated.length > 0 ? (
                                    paginated.map((affiliate) => (
                                        <tr key={affiliate.id} className='border-b border-slate-100 hover:bg-slate-50'>
                                            <td className='py-3 px-4'>{affiliate.name}</td>
                                            <td className='py-3 px-4 text-blue-600'>{affiliate.email}</td>
                                            <td className='py-3 px-4'>{formatDate(affiliate.joinDate)}</td>
                                            <td className='py-3 px-4'>
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            {
                                                                pathname: `/admin/dashboard/affiliate/kpi/${affiliate.id}`,
                                                                query: { name: affiliate.name }, // ⬅️ add this
                                                            },
                                                            undefined,
                                                            { shallow: true }
                                                        )
                                                    }
                                                    className='rounded-lg text-white cursor-pointer py-2 px-5 bg-blue-400 hover:bg-blue-500 duration-200 ease-in-out transition-all'
                                                >
                                                    View KPI
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className='py-6 text-center text-slate-500'>
                                            No affiliates found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className='flex items-center justify-center gap-2 mt-6'>
                            <button
                                className='p-2 hover:bg-slate-100 rounded disabled:opacity-40'
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                aria-label='Previous page'
                            >
                                <ChevronLeft className='w-4 h-4' />
                            </button>

                            {pageNumbers.map((n) => (
                                <button
                                    key={n}
                                    className={['w-8 h-8 rounded', n === page ? 'bg-blue-500 text-white' : 'hover:bg-slate-100'].join(' ')}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            ))}

                            <button
                                className='p-2 hover:bg-slate-100 rounded disabled:opacity-40'
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                aria-label='Next page'
                            >
                                <ChevronRight className='w-4 h-4' />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
