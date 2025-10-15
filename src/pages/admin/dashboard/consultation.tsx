'use client';

import { useEffect, useState } from 'react';

type Consultation = {
    id: number;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
    name: string;
    companyName: string;
    location: string;
    title: string;
    email: string;
    phone: string;
    numOfPositions: number;
    dateTime: string;
};

type ApiResponse = {
    success: boolean;
    message: string;
    data?: {
        consultations: Consultation[];
    };
};

export default function ConsultationPage() {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConsultations = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/consultation', { method: 'GET' });
            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }
            const json: ApiResponse = await res.json();
            if (!json.success) {
                throw new Error(json.message || 'Unknown error');
            }
            setConsultations(json.data?.consultations ?? []);
        } catch (err: any) {
            setError(err?.message || 'Something went wrong while fetching consultations.');
            setConsultations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    return (
        <div className='text-gray-900 p-6'>
            <div className='max-w-7xl mx-auto'>
                <div className='flex items-center justify-between mb-4'>
                    <h1 className='text-3xl font-semibold'>Consultations</h1>
                </div>

                {error && <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</div>}

                <div className='overflow-x-auto rounded-lg border border-gray-200'>
                    <table className='min-w-full divide-y divide-gray-200 text-sm'>
                        <thead className='bg-gray-50'>
                            <tr>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>ID</th>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>Name</th>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>Company</th>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>Location</th>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>Title</th>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>Email</th>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>Phone</th>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>Positions</th>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>Date & Time</th>
                                <th className='px-3 py-2 text-left font-semibold text-gray-700'>Created At</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100 bg-white'>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={`skeleton-${i}`} className='animate-pulse'>
                                        {Array.from({ length: 10 }).map((__, j) => (
                                            <td key={`cell-${i}-${j}`} className='px-3 py-3'>
                                                <div className='h-4 w-24 rounded bg-gray-200' />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : consultations.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className='px-3 py-6 text-center text-gray-500'>
                                        No consultations found.
                                    </td>
                                </tr>
                            ) : (
                                consultations.map((c) => (
                                    <tr key={c.id} className='hover:bg-gray-50'>
                                        <td className='px-3 py-3'>{c.id}</td>
                                        <td className='px-3 py-3'>{c.name}</td>
                                        <td className='px-3 py-3'>{c.companyName}</td>
                                        <td className='px-3 py-3'>{c.location}</td>
                                        <td className='px-3 py-3'>{c.title}</td>
                                        <td className='px-3 py-3'>
                                            <a href={`mailto:${c.email}`} className='text-blue-600 hover:underline'>
                                                {c.email}
                                            </a>
                                        </td>
                                        <td className='px-3 py-3'>{c.phone}</td>
                                        <td className='px-3 py-3'>{c.numOfPositions}</td>
                                        <td className='px-3 py-3'>{new Date(c.dateTime).toLocaleString()}</td>
                                        <td className='px-3 py-3'>{new Date(c.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
