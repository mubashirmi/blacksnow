import { AlertCircle, CheckCircle2, Clock, RefreshCw, Search, XCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type EmailUser = {
    id: number;
    email: string;
    fullName: string;
};

type EmailJob = {
    id: string;
    createdAt: string;
    updatedAt: string;
    subject: string | null;
    text: string | null;
    html: string | null;
    runAt: string | null; // ISO
    repeated: boolean;
    timeInterval: number | null; // seconds
    weekdays: number[]; // 0..6 (Sun..Sat)
    rotationSpanSeconds: number | null; // seconds
    authId: number;
    emailUserId: number;
    status: 'pending' | 'sent' | string;
    emailUser: EmailUser;
};

type ApiResponse = {
    count: number;
    histories: EmailJob[];
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(iso?: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
}

function humanizeSeconds(sec?: number | null) {
    if (!sec) return '—';
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const bits: string[] = [];
    if (d) bits.push(`${d}d`);
    if (h) bits.push(`${h}h`);
    if (m && !d) bits.push(`${m}m`);
    return bits.join(' ') || `${sec}s`;
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        sent: 'bg-green-100 text-green-800',
        pending: 'bg-amber-100 text-amber-800',
        failed: 'bg-red-100 text-red-800',
    };
    const cls = map[status] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

export default function EmailJobsPage() {
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [data, setData] = useState<ApiResponse | null>(null);

    // UI state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent'>('all');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Fetch
    const load = async () => {
        setLoading(true);
        setApiError(null);
        try {
            const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
            if (!userId) throw new Error('Admin ID not found in localStorage (key: "userId").');

            const res = await fetch(`/api/v2/email-jobs?authId=${encodeURIComponent(userId)}`);
            if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
            const json = (await res.json()) as ApiResponse;

            if (!json || !Array.isArray(json.histories)) {
                throw new Error('Unexpected response shape.');
            }
            setData(json);
        } catch (e: any) {
            setApiError(e?.message || 'Failed to fetch email jobs.');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    /* eslint-disable-next-line no-use-before-define, react-hooks/exhaustive-deps */
    const jobs = data?.histories ?? [];

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return jobs.filter((j) => {
            const statusOk = statusFilter === 'all' ? true : j.status === statusFilter;
            const text = `${j.subject ?? ''} ${j.text ?? ''} ${j.emailUser?.email ?? ''} ${j.emailUser?.fullName ?? ''}`.toLowerCase();
            const searchOk = q ? text.includes(q) : true;
            return statusOk && searchOk;
        });
    }, [jobs, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        // If filters change, reset to first page
        setPage(1);
    }, [search, statusFilter]);

    // KPIs
    const kpi = useMemo(() => {
        const pending = jobs.filter((j) => j.status === 'pending').length;
        const sent = jobs.filter((j) => j.status === 'sent').length;
        const recurring = jobs.filter((j) => j.repeated).length;

        // soonest upcoming (future) run
        const now = Date.now();
        const upcoming = jobs
            .map((j) => (j.runAt ? new Date(j.runAt).getTime() : Number.POSITIVE_INFINITY))
            .filter((t) => t > now)
            .sort((a, b) => a - b)[0];

        return {
            total: data?.count ?? jobs.length,
            pending,
            sent,
            recurring,
            nextRunAt: Number.isFinite(upcoming) ? new Date(upcoming).toLocaleString() : '—',
        };
    }, [jobs, data?.count]);

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            <div className='max-w-6xl mx-auto p-6 space-y-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900'>Email Schedules</h1>
                        <p className='text-gray-600'>All scheduled and sent email jobs for your account</p>
                    </div>
                    <button
                        onClick={load}
                        className='inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700 shadow-sm'
                        title='Reload'
                    >
                        <RefreshCw className='w-4 h-4' />
                        Refresh
                    </button>
                </div>

                {/* Loader */}
                {loading && (
                    <div className='flex justify-center items-center py-20'>
                        <div className='dot-spinner'>
                            <div className='dot-spinner__dot'></div>
                            <div className='dot-spinner__dot'></div>
                            <div className='dot-spinner__dot'></div>
                            <div className='dot-spinner__dot'></div>
                            <div className='dot-spinner__dot'></div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {!loading && apiError && (
                    <div className='bg-white border border-red-200 rounded-xl p-4 shadow-sm'>
                        <div className='flex items-start gap-3 text-red-700'>
                            <XCircle className='w-5 h-5 mt-0.5' />
                            <div>
                                <div className='font-semibold'>Failed to load</div>
                                <div className='text-sm'>{apiError}</div>
                                <button
                                    onClick={load}
                                    className='mt-3 inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700'
                                >
                                    <RefreshCw className='w-4 h-4' />
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                {!loading && !apiError && (
                    <>
                        {/* KPIs */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                            <KpiCard title='Total Jobs' value={kpi.total.toLocaleString()} icon={<CheckCircle2 className='w-5 h-5' />} />
                            <KpiCard title='Pending' value={kpi.pending.toLocaleString()} icon={<Clock className='w-5 h-5' />} tone='amber' />
                            <KpiCard title='Sent' value={kpi.sent.toLocaleString()} icon={<CheckCircle2 className='w-5 h-5' />} tone='green' />
                            <KpiCard title='Recurring' value={kpi.recurring.toLocaleString()} icon={<RefreshCw className='w-5 h-5' />} tone='purple' />
                        </div>

                        {/* Next run banner */}
                        <div className='bg-white border rounded-xl px-4 py-3 shadow-sm flex items-center gap-2'>
                            <Clock className='w-4 h-4 text-gray-500' />
                            <span className='text-sm text-gray-700'>
                                <span className='font-medium'>Next run:</span> {kpi.nextRunAt}
                            </span>
                        </div>

                        {/* Filters */}
                        <div className='bg-white border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between'>
                            <div className='relative w-full md:max-w-md'>
                                <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder='Search subject, text, recipient name/email…'
                                    className='w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none'
                                />
                            </div>
                            <div className='flex items-center gap-2'>
                                <label className='text-sm text-gray-600'>Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className='px-3 py-2 rounded-lg border bg-white'
                                >
                                    <option value='all'>All</option>
                                    <option value='pending'>Pending</option>
                                    <option value='sent'>Sent</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className='bg-white border rounded-xl shadow-sm overflow-hidden'>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead className='bg-gray-50 border-b'>
                                        <tr>
                                            <Th>Subject</Th>
                                            <Th>Recipient</Th>
                                            <Th>Status</Th>
                                            <Th>Repeated</Th>
                                            <Th>Schedule</Th>
                                            <Th>Run At</Th>
                                            <Th>Created</Th>
                                            <Th>ID</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageData.map((j) => (
                                            <tr key={j.id} className='border-b last:border-0 hover:bg-gray-50'>
                                                <Td>
                                                    <div className='max-w-[320px]'>
                                                        <div className='font-medium text-gray-900 truncate'>{j.subject || '(No subject)'}</div>
                                                        <div className='text-gray-500 truncate'>{j.text || j.html ? 'Body included' : '—'}</div>
                                                    </div>
                                                </Td>
                                                <Td>
                                                    <div className='max-w-[220px]'>
                                                        <div className='text-gray-900 truncate'>{j.emailUser?.fullName || '—'}</div>
                                                        <div className='text-gray-500 truncate'>{j.emailUser?.email || '—'}</div>
                                                    </div>
                                                </Td>
                                                <Td>
                                                    <StatusBadge status={j.status} />
                                                </Td>
                                                <Td>
                                                    {j.repeated ? (
                                                        <span className='px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                                                            Yes
                                                        </span>
                                                    ) : (
                                                        <span className='px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>No</span>
                                                    )}
                                                </Td>
                                                <Td>
                                                    <div className='text-gray-700'>
                                                        {j.weekdays?.length ? (
                                                            <div className='mb-0.5'>{j.weekdays.map((n) => WEEKDAYS[n] ?? n).join(', ')}</div>
                                                        ) : null}
                                                        {j.rotationSpanSeconds ? (
                                                            <div className='text-gray-500'>every {humanizeSeconds(j.rotationSpanSeconds)}</div>
                                                        ) : j.timeInterval ? (
                                                            <div className='text-gray-500'>every {humanizeSeconds(j.timeInterval)}</div>
                                                        ) : (
                                                            <div className='text-gray-500'>one-time or fixed date</div>
                                                        )}
                                                    </div>
                                                </Td>
                                                <Td>{formatDate(j.runAt)}</Td>
                                                <Td>{formatDate(j.createdAt)}</Td>
                                                <Td>
                                                    <code className='text-xs bg-gray-100 px-2 py-0.5 rounded'>{j.id.slice(0, 8)}…</code>
                                                </Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty state */}
                            {filtered.length === 0 && (
                                <div className='flex items-center justify-center py-16 text-gray-600'>
                                    <div className='max-w-md text-center'>
                                        <AlertCircle className='w-8 h-8 mx-auto mb-2 text-gray-400' />
                                        <div className='font-semibold mb-1'>No jobs match your filters</div>
                                        <div className='text-sm'>Try clearing the search or changing the status filter.</div>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {filtered.length > 0 && (
                                <div className='flex items-center justify-between px-4 py-3 bg-gray-50'>
                                    <div className='text-xs text-gray-600'>
                                        Showing{' '}
                                        <span className='font-medium'>
                                            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)}
                                        </span>{' '}
                                        of <span className='font-medium'>{filtered.length}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            className='px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50'
                                        >
                                            Prev
                                        </button>
                                        <div className='text-xs'>
                                            Page <span className='font-medium'>{page}</span> / {totalPages}
                                        </div>
                                        <button
                                            disabled={page === totalPages}
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            className='px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50'
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/** UI bits **/
function KpiCard({
    title,
    value,
    icon,
    tone = 'blue',
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    tone?: 'blue' | 'green' | 'amber' | 'purple';
}) {
    const toneMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        amber: 'bg-amber-50 text-amber-700',
        purple: 'bg-purple-50 text-purple-700',
    };
    return (
        <div className='bg-white border rounded-xl p-4 shadow-sm'>
            <div className='flex items-center justify-between'>
                <div>
                    <div className='text-sm text-gray-600'>{title}</div>
                    <div className='text-2xl font-bold text-gray-900'>{value}</div>
                </div>
                <div className={`p-3 rounded-lg ${toneMap[tone]}`}>{icon}</div>
            </div>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return <th className='text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3 whitespace-nowrap'>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
    return <td className='px-4 py-3 align-top'>{children}</td>;
}
