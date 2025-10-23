'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

type Subscriber = {
    id: number;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
    email: string;
    firstName: string | null;
    lastName: string | null;
};

export default function NewsletterPage() {
    const [alert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // ---- Subscribers list state ----
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(false);
    const [listError, setListError] = useState<string | null>(null);

    // Fetch subscribers
    const fetchSubscribers = async () => {
        setListError(null);
        setListLoading(true);
        try {
            const res = await fetch('/api/v1/newsletter', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store', // avoid stale data
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch subscribers (${res.status})`);
            }

            const json = await res.json();
            const data: unknown = json?.data;

            if (!Array.isArray(data)) {
                throw new Error('Unexpected response format');
            }

            setSubscribers(data as Subscriber[]);
        } catch (err: any) {
            setSubscribers([]);
            setListError(err?.message || 'Failed to load subscribers.');
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    return (
        <div className='space-y-8'>
            {/* Alert */}
            {alert && (
                <div className={`p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{alert.message}</div>
            )}

            {/* Subscribers Card — matches Notes page structure */}
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                {/* Dark gradient header bar */}
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-white'>Newsletter Subscribers</h2>

                    <div className='flex items-center gap-3'>
                        <span className='hidden sm:inline text-sm text-white/80'>
                            {listLoading ? 'Loading…' : listError ? 'Error' : `${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className='p-6 space-y-4'>
                    {/* Loading state */}
                    {listLoading && (
                        <div className='space-y-2'>
                            <div className='h-10 w-full animate-pulse rounded bg-slate-200' />
                            <div className='h-10 w-full animate-pulse rounded bg-slate-200' />
                            <div className='h-10 w-full animate-pulse rounded bg-slate-200' />
                        </div>
                    )}

                    {/* Error state */}
                    {!listLoading && listError && (
                        <div className='rounded-md border border-red-200 bg-red-50 p-3 text-red-700'>
                            <div className='flex items-center justify-between'>
                                <p className='text-sm'>{listError}</p>
                                <Button size='sm' variant='outline' onClick={fetchSubscribers}>
                                    Retry
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!listLoading && !listError && subscribers.length === 0 && (
                        <div className='rounded-md border border-slate-200 p-4 text-sm text-slate-600'>No subscribers found.</div>
                    )}

                    {/* Data table */}
                    {!listLoading && !listError && subscribers.length > 0 && (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b border-slate-200'>
                                        <th className='py-2 px-2 text-left font-medium text-slate-700'>Name</th>
                                        <th className='py-2 px-2 text-left font-medium text-slate-700'>Email</th>
                                        <th className='py-2 px-2 text-left font-medium text-slate-700'>Subscribed At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribers.map((s) => {
                                        const fullName = [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || '—';
                                        return (
                                            <tr key={s.id} className='border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors'>
                                                <td className='py-2 px-2 text-slate-800'>{fullName}</td>
                                                <td className='py-2 px-2 text-slate-700'>{s.email || '—'}</td>
                                                <td className='py-2 px-2 text-slate-700'>{s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
