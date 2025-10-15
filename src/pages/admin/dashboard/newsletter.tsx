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
    // const [expandedPreview, setExpandedPreview] = useState(false);
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
                // API shape unexpected
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

    // const handleCreate = async () => {
    //     setAlert(null);
    //     if (!validateForm()) return;

    //     setIsLoading(true);
    //     try {
    //         const response = await fetch('/api/v1/newsLetterContent', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 title: newsletterData.title.trim(),
    //                 content: newsletterData.content.trim(),
    //             }),
    //         });

    //         if (!response.ok) throw new Error('Failed to create newsletter');

    //         setAlert({ type: 'success', message: 'Newsletter created successfully!' });
    //         setNewsletterData({ title: '', content: '' });
    //         if (editorRef.current) editorRef.current.innerHTML = '';
    //         setErrors({});
    //     } catch {
    //         setAlert({ type: 'error', message: 'Failed to create newsletter. Please try again.' });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // const handleEditorInput = () => {
    //     if (editorRef.current) {
    //         setNewsletterData((prev) => ({ ...prev, content: editorRef.current!.innerHTML }));
    //     }
    // };

    return (
        <div className='space-y-8'>
            {/* Alert */}
            {alert && (
                <div className={`p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{alert.message}</div>
            )}

            {/* Subscribers List */}
            <div className='space-y-4 border border-black/40 rounded-lg p-7 bg-white'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-semibold'>Newsletter Subscribers</h2>
                    <div className='text-sm text-muted-foreground'>
                        {listLoading ? 'Loading…' : listError ? 'Error' : `${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`}
                    </div>
                </div>

                {/* Loading state */}
                {listLoading && (
                    <div className='space-y-2'>
                        <div className='h-10 w-full animate-pulse rounded bg-muted' />
                        <div className='h-10 w-full animate-pulse rounded bg-muted' />
                        <div className='h-10 w-full animate-pulse rounded bg-muted' />
                    </div>
                )}

                {/* Error state */}
                {!listLoading && listError && (
                    <div className='rounded-md border border-red-200 bg-red-50 p-3 text-red-700'>
                        <div className='flex items-center justify-between'>
                            <p>{listError}</p>
                            <Button size='sm' variant='outline' onClick={fetchSubscribers}>
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!listLoading && !listError && subscribers.length === 0 && (
                    <div className='rounded-md border p-4 text-sm text-muted-foreground'>No subscribers found.</div>
                )}

                {/* Data table */}
                {!listLoading && !listError && subscribers.length > 0 && (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='border-b'>
                                    <th className='py-2 text-left font-medium'>Name</th>
                                    <th className='py-2 text-left font-medium'>Email</th>
                                    <th className='py-2 text-left font-medium'>Subscribed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map((s) => {
                                    const fullName = [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || '—';
                                    return (
                                        <tr key={s.id} className='border-b last:border-0'>
                                            <td className='py-2'>{fullName}</td>
                                            <td className='py-2'>{s.email || '—'}</td>
                                            <td className='py-2'>{s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
