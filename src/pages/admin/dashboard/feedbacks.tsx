'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

type FeedbackApiItem = {
    id: number | string;
    authId?: number | string;
    review?: string | null;
    stars?: string | number | null;
    toolName?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    Auth?: {
        id?: number | string;
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    } | null;
};

type FeedbackRow = {
    id: string;
    name: string;
    email: string;
    toolName: string;
    review: string;
    stars: string;
    date: string;
};

export default function FeedbackPage() {
    const [feedbackData, setFeedbackData] = useState<FeedbackRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const formatDate = (value?: string | null) => {
        if (!value) return '-';

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getFullName = (item: FeedbackApiItem) => {
        const firstName = String(item.Auth?.firstName || '').trim();
        const lastName = String(item.Auth?.lastName || '').trim();
        const fullName = `${firstName} ${lastName}`.trim();

        return fullName || 'Unknown User';
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/v5/tool-feedback');
            const list: FeedbackApiItem[] = Array.isArray(response.data) ? response.data : [];

            const formattedData: FeedbackRow[] = list.map((item) => ({
                id: String(item.id),
                name: getFullName(item),
                email: item.Auth?.email || '-',
                toolName: item.toolName || '-',
                review: item.review || '-',
                stars: item.stars != null ? String(item.stars) : '-',
                date: formatDate(item.createdAt),
            }));

            setFeedbackData(formattedData);
            setSuccess('Feedback loaded successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to fetch feedback. Please try again later.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totalFeedback = feedbackData.length;

    const averageStars = useMemo(() => {
        const numbers = feedbackData.map((item) => Number(item.stars)).filter((value) => Number.isFinite(value));

        if (!numbers.length) return '-';

        const avg = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
        return avg.toFixed(1);
    }, [feedbackData]);

    return (
        <div className='space-y-6'>
            {isLoading && (
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='dot-spinner'>
                        <div className='dot-spinner__dot'></div>
                        <div className='dot-spinner__dot'></div>
                        <div className='dot-spinner__dot'></div>
                        <div className='dot-spinner__dot'></div>
                        <div className='dot-spinner__dot'></div>
                    </div>
                </div>
            )}

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

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                    <p className='text-sm font-medium text-slate-500'>Total Feedback</p>
                    <p className='mt-2 text-3xl font-bold text-slate-800'>{totalFeedback}</p>
                </div>

                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                    <p className='text-sm font-medium text-slate-500'>Average Stars</p>
                    <p className='mt-2 text-3xl font-bold text-slate-800'>{averageStars}</p>
                </div>
            </div>

            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-white'>Feedback</h2>

                    <button
                        type='button'
                        onClick={fetchData}
                        disabled={isLoading}
                        className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                        {isLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                <div className='p-6'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead>
                                <tr className='border-b border-slate-200'>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Sr #</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Name</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Email</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Tool Name</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Review</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Stars</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {feedbackData.map((feedback, index) => (
                                    <tr key={feedback.id} className='border-b border-slate-100 hover:bg-slate-50 transition-colors align-top'>
                                        <td className='py-3 px-4 text-slate-600'>{index + 1}</td>

                                        <td className='py-3 px-4 font-medium text-slate-800 whitespace-nowrap'>{feedback.name}</td>

                                        <td className='py-3 px-4 text-blue-600 whitespace-nowrap'>{feedback.email}</td>

                                        <td className='py-3 px-4'>
                                            <span className='inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'>
                                                {feedback.toolName}
                                            </span>
                                        </td>

                                        <td className='py-3 px-4 text-slate-700 min-w-[260px] max-w-xl'>
                                            <p className='leading-relaxed'>{feedback.review}</p>
                                        </td>

                                        <td className='py-3 px-4'>
                                            <span className='inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700'>
                                                ★ {feedback.stars}
                                            </span>
                                        </td>

                                        <td className='py-3 px-4 text-slate-600 whitespace-nowrap'>{feedback.date}</td>
                                    </tr>
                                ))}

                                {feedbackData.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={7} className='py-6 px-4 text-center text-slate-500'>
                                            No feedback found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
