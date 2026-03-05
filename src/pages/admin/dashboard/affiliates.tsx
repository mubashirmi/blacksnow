'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';

// Shape coming back from /api/v2/get-all-user-data (based on sample provided)
type ApiUser = {
    id: number;
    createdAt: string;
    updatedAt?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    roles?: string[];
    adminStripeConnectId?: string | null;
    adminStripeConnectIdStatus?: boolean;
    referredById?: number | null;
};

type AffiliateRow = {
    id: number;
    name: string;
    email: string;
    status: 'Silver' | 'Gold';
    joinDate: string;
};

const PAGE_SIZE = 10;

export default function AffiliatesPage() {
    const router = useRouter();
    const [rows, setRows] = React.useState<AffiliateRow[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    const [page, setPage] = React.useState<number>(1);

    // Delete per-row loading
    const [deleteLoadingId, setDeleteLoadingId] = React.useState<number | null>(null);

    // ✅ Used to ignore stale/aborted requests (fixes "Failed to load affiliates" showing permanently in dev/StrictMode)
    const loadReqIdRef = React.useRef(0);

    React.useEffect(() => {
        const controller = new AbortController();
        const reqId = ++loadReqIdRef.current;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch('/api/v2/get-all-user-data', {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                    signal: controller.signal,
                });

                if (!res.ok) throw new Error(`Request failed (${res.status})`);

                const data: ApiUser[] = await res.json();

                const affiliates = (data ?? [])
                    .filter((u) => {
                        const roles = u.roles ?? [];
                        return roles.includes('Affiliate') || roles.includes('SuperAffiliate');
                    })
                    .map<AffiliateRow>((u) => {
                        const roles = u.roles ?? [];
                        const isSuper = roles.includes('SuperAffiliate');

                        return {
                            id: u.id,
                            name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '(No name)',
                            email: u.email,
                            status: isSuper ? 'Gold' : 'Silver',
                            joinDate: u.createdAt,
                        };
                    });

                // ✅ Ignore if this is not the latest request or it got aborted
                if (controller.signal.aborted || loadReqIdRef.current !== reqId) return;

                setRows(affiliates);
                setError(null); // extra safety
            } catch (err: any) {
                // ✅ Ignore stale/aborted request errors
                const msg = String(err?.message || '');
                const isAbort =
                    controller.signal.aborted ||
                    err?.name === 'AbortError' ||
                    msg.toLowerCase().includes('abort') ||
                    msg.toLowerCase().includes('canceled');

                if (loadReqIdRef.current === reqId && !isAbort) {
                    setError(err?.message || 'Failed to load affiliates');
                }
            } finally {
                if (!controller.signal.aborted && loadReqIdRef.current === reqId) {
                    setLoading(false);
                }
            }
        }

        load();
        return () => controller.abort('cleanup');
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

    const handleDeleteAffiliate = async (userId: number, name: string) => {
        const ok = window.confirm(`Are you sure you want to delete ${name}?`);
        if (!ok) return;

        setError(null);
        setSuccess(null);
        setDeleteLoadingId(userId);

        try {
            const res = await fetch(`/api/v2/delete-user?authId=${userId}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
                credentials: 'include',
            });

            if (!res.ok) {
                let msg = `Failed to delete user (${res.status})`;
                try {
                    const data = await res.json();
                    msg = (data as any)?.message || msg;
                } catch { }
                throw new Error(msg);
            }

            setRows((prev) => prev.filter((r) => r.id !== userId));
            setSuccess('User deleted successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err?.message || 'Failed to delete user. Please try again.');
        } finally {
            setDeleteLoadingId(null);
        }
    };

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className='space-y-6'>
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-white'>Affiliates</h2>
                    {!loading && <span className='text-sm text-white/80'>{rows.length} total</span>}
                </div>

                <div className='p-6'>
                    {/* Success / Error */}
                    {success && <div className='mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700'>{success}</div>}
                    {/* ✅ Only show load error if we have no rows */}
                    {error && !loading && rows.length === 0 && (
                        <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</div>
                    )}

                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead>
                                <tr className='border-b border-slate-200'>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Name</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Email</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Status</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Join Date</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
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
                                                <div className='h-4 w-32 animate-pulse rounded bg-slate-200' />
                                            </td>
                                            <td className='py-3 px-4'>
                                                <div className='h-4 w-44 animate-pulse rounded bg-slate-200' />
                                            </td>
                                        </tr>
                                    ))
                                ) : paginated.length > 0 ? (
                                    paginated.map((affiliate) => (
                                        <tr key={affiliate.id} className='border-b border-slate-100 hover:bg-slate-50'>
                                            <td className='py-3 px-4'>{affiliate.name}</td>
                                            <td className='py-3 px-4 text-blue-600'>{affiliate.email}</td>
                                            <td className='py-3 px-4'>
                                                <span
                                                    className={[
                                                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                                                        affiliate.status === 'Gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800',
                                                    ].join(' ')}
                                                >
                                                    {affiliate.status}
                                                </span>
                                            </td>
                                            <td className='py-3 px-4'>{formatDate(affiliate.joinDate)}</td>
                                            <td className='py-3 px-4'>
                                                <div className='flex items-center gap-3'>
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                {
                                                                    pathname: `/admin/dashboard/affiliate/kpi/${affiliate.id}`,
                                                                    query: { name: affiliate.name },
                                                                },
                                                                undefined,
                                                                { shallow: true }
                                                            )
                                                        }
                                                        className='rounded-lg text-white cursor-pointer py-2 px-5 bg-blue-400 hover:bg-blue-500 duration-200 ease-in-out transition-all disabled:opacity-60'
                                                        disabled={deleteLoadingId === affiliate.id}
                                                    >
                                                        View KPI
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteAffiliate(affiliate.id, affiliate.name)}
                                                        className='rounded-lg text-white cursor-pointer py-2 px-5 bg-red-500 hover:bg-red-600 duration-200 ease-in-out transition-all disabled:opacity-60 disabled:cursor-not-allowed'
                                                        disabled={deleteLoadingId === affiliate.id}
                                                    >
                                                        {deleteLoadingId === affiliate.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className='py-6 text-center text-slate-500'>
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