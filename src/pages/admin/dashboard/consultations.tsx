'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

type ConsultationApiItem = {
    id: number | string;
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
    createdAt?: string | null;
    updatedAt?: string | null;
    deleted?: boolean;
};

type ConsultationRow = {
    id: string;
    fullName: string;
    companyName: string;
    location: string;
    jobTitle: string;
    email: string;
    phone: string;
    numOfPositions: string;
    dateTime: string;
    totalAmount: string;
    status: string;
    createdAt: string;
};

export default function ConsultationPage() {
    const [consultationData, setConsultationData] = useState<ConsultationRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        // treat epoch (paidAt default) as unpaid
        if (date.getFullYear() === 1970) return '-';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatAmount = (amount?: number | null, currency?: string | null) => {
        if (amount == null) return '-';
        const curr = (currency || 'usd').toUpperCase();
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: curr,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/v5/consultation');
            const list: ConsultationApiItem[] = Array.isArray(response.data?.consultations) ? response.data.consultations : [];

            const formattedData: ConsultationRow[] = list.map((item) => ({
                id: String(item.id),
                fullName: item.fullName || '-',
                companyName: item.companyName || '-',
                location: item.location || '-',
                jobTitle: item.jobTitle || '-',
                email: item.email || '-',
                phone: item.phone || '-',
                numOfPositions: item.numOfPositions != null ? String(item.numOfPositions) : '-',
                dateTime: formatDate(item.dateTime),
                totalAmount: formatAmount(item.totalAmount, item.currency),
                status: item.status || '-',
                createdAt: formatDate(item.createdAt),
            }));

            setConsultationData(formattedData);
            // setSuccess('Consultations loaded successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to fetch consultations. Please try again later.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // const totalConsultations = consultationData.length;

    // const paidCount = useMemo(() => consultationData.filter((item) => item.status === 'paid').length, [consultationData]);

    // const pendingCount = useMemo(() => consultationData.filter((item) => item.status === 'pending').length, [consultationData]);

    // const statusBadge = (status: string) => {
    //     if (status === 'paid') {
    //         return <span className='inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700'>✓ Paid</span>;
    //     }
    //     if (status === 'pending') {
    //         return <span className='inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700'>⏳ Pending</span>;
    //     }
    //     return <span className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'>{status}</span>;
    // };

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

            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-white'>Consultation Requests</h2>

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
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Full Name</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Company</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Location</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Job Title</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Email</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Phone</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Positions</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Scheduled</th>
                                    {/* <th className='text-left py-3 px-4 font-medium text-slate-700'>Amount</th> */}
                                    {/* <th className='text-left py-3 px-4 font-medium text-slate-700'>Status</th> */}
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Created At</th>
                                </tr>
                            </thead>

                            <tbody>
                                {consultationData.map((consultation, index) => (
                                    <tr key={consultation.id} className='border-b border-slate-100 hover:bg-slate-50 transition-colors align-top'>
                                        <td className='py-3 px-4 text-slate-600'>{index + 1}</td>

                                        <td className='py-3 px-4 font-medium text-slate-800 whitespace-nowrap'>{consultation.fullName}</td>

                                        <td className='py-3 px-4 text-slate-700 whitespace-nowrap'>{consultation.companyName}</td>

                                        <td className='py-3 px-4 text-slate-600 whitespace-nowrap'>{consultation.location}</td>

                                        <td className='py-3 px-4'>
                                            <span className='inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'>
                                                {consultation.jobTitle}
                                            </span>
                                        </td>

                                        <td className='py-3 px-4 text-blue-600 whitespace-nowrap'>{consultation.email}</td>

                                        <td className='py-3 px-4 text-slate-600 whitespace-nowrap'>{consultation.phone}</td>

                                        <td className='py-3 px-4 text-center text-slate-700 font-semibold'>{consultation.numOfPositions}</td>

                                        <td className='py-3 px-4 text-slate-600 whitespace-nowrap'>{consultation.dateTime}</td>

                                        {/* <td className='py-3 px-4 font-semibold text-slate-800 whitespace-nowrap'>
                                            {consultation.totalAmount}
                                        </td> */}

                                        {/* <td className='py-3 px-4'>{statusBadge(consultation.status)}</td> */}

                                        <td className='py-3 px-4 text-slate-600 whitespace-nowrap'>{consultation.createdAt}</td>
                                    </tr>
                                ))}

                                {consultationData.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={12} className='py-6 px-4 text-center text-slate-500'>
                                            No consultations found.
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
