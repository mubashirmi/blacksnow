'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface BillboardItem {
    id: number;
    fullName: string;
    website: string;
    podcast: string;
    twitter: string;
    youTube: string;
    facebook: string;
    image: string;
    companyName: string;
    description: string;
    status: 'Approved' | 'NotApproved' | 'Rejected';
}

export default function BillboardPage() {
    const [expandedSections, setExpandedSections] = useState<string[]>(['awaiting']);
    const [billboardData, setBillboardData] = useState<{
        awaiting: BillboardItem[];
        approved: BillboardItem[];
        denied: BillboardItem[];
    }>({
        awaiting: [],
        approved: [],
        denied: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]));
    };

    const fetchBillboardData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/v2/digital-billboard');
            const result = await response.json();

            if (result.message === 'Fetched all' && Array.isArray(result.data)) {
                const categorizedData = {
                    awaiting: result.data.filter((item: BillboardItem) => item.status === 'NotApproved'),
                    approved: result.data.filter((item: BillboardItem) => item.status === 'Approved'),
                    denied: result.data.filter((item: BillboardItem) => item.status === 'Rejected'),
                };
                setBillboardData(categorizedData);
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (err) {
            setError('Failed to fetch billboard data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateBillboardStatus = async (id: number, status: 'Approved' | 'Rejected') => {
        try {
            const response = await fetch(`/api/v2/digital-billboard/?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                await fetchBillboardData(); // Refresh data after status update
            } else {
                throw new Error('Failed to update billboard status');
            }
        } catch (err) {
            setError('Failed to update billboard status');
            console.error(err);
        }
    };

    const handleApprove = (id: number) => {
        updateBillboardStatus(id, 'Approved');
    };

    const handleDeny = (id: number) => {
        updateBillboardStatus(id, 'Rejected');
    };

    useEffect(() => {
        fetchBillboardData();
    }, []);

    if (isLoading) {
        return <div className='p-6'>Loading...</div>;
    }

    if (error) {
        return <div className='p-6 text-red-500'>{error}</div>;
    }

    return (
        <div className='space-y-6'>
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4'>
                    <h2 className='text-2xl font-bold text-white'>Billboard</h2>
                </div>

                <div className='p-6 space-y-6'>
                    {/* Awaiting Section */}
                    <div className='border border-slate-200 rounded-lg overflow-hidden'>
                        <button
                            onClick={() => toggleSection('awaiting')}
                            className='w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all'
                        >
                            <h3 className='text-lg font-semibold text-slate-800'>Awaiting</h3>
                            {expandedSections.includes('awaiting') ? (
                                <ChevronDown className='w-5 h-5 text-slate-600' />
                            ) : (
                                <ChevronRight className='w-5 h-5 text-slate-600' />
                            )}
                        </button>

                        {expandedSections.includes('awaiting') && (
                            <div className='p-6 bg-white border-t border-slate-200'>
                                {billboardData.awaiting.map((item) => (
                                    <div
                                        key={item.id}
                                        className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 bg-slate-50 rounded-2xl p-7 border border-slate-300'
                                    >
                                        <div className='space-y-4'>
                                            <h4 className='text-xl font-semibold text-slate-800'>{item.fullName}</h4>

                                            <div className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-medium text-slate-600'>Website:</span>
                                                    <a href={item.website} className='text-blue-600 hover:text-blue-800 flex items-center gap-1'>
                                                        {item.website}
                                                        <ExternalLink className='w-3 h-3' />
                                                    </a>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-medium text-slate-600'>Podcast:</span>
                                                    <a href={item.podcast} className='text-blue-600 hover:text-blue-800 flex items-center gap-1'>
                                                        {item.podcast}
                                                        <ExternalLink className='w-3 h-3' />
                                                    </a>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-medium text-slate-600'>Twitter:</span>
                                                    <a href={item.twitter} className='text-blue-600 hover:text-blue-800 flex items-center gap-1'>
                                                        {item.twitter}
                                                        <ExternalLink className='w-3 h-3' />
                                                    </a>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-medium text-slate-600'>YouTube:</span>
                                                    <a href={item.youTube} className='text-blue-600 hover:text-blue-800 flex items-center gap-1'>
                                                        {item.youTube}
                                                        <ExternalLink className='w-3 h-3' />
                                                    </a>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-medium text-slate-600'>Facebook:</span>
                                                    <a href={item.facebook} className='text-blue-600 hover:text-blue-800 flex items-center gap-1'>
                                                        {item.facebook}
                                                        <ExternalLink className='w-3 h-3' />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className='flex gap-3 pt-4'>
                                                <Button
                                                    onClick={() => handleDeny(item.id)}
                                                    variant='destructive'
                                                    className='bg-red-500 hover:bg-red-600 cursor-pointer'
                                                >
                                                    Deny
                                                </Button>
                                                <Button
                                                    onClick={() => handleApprove(item.id)}
                                                    className='bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                                                >
                                                    Approve
                                                </Button>
                                            </div>
                                        </div>

                                        <div className='space-y-4'>
                                            <Image
                                                src={item.image || '/placeholder.svg?height=200&width=300'}
                                                alt='Business Image'
                                                width={300}
                                                height={200}
                                                className='w-full h-48 object-cover rounded-lg border border-slate-200'
                                            />
                                            <div className='bg-slate-50 p-4 rounded-lg'>
                                                <p className='font-medium text-slate-700'>Company Name: {item.companyName}</p>
                                                <p className='text-slate-600 mt-2'>Description: {item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Approved Section */}
                    <div className='border border-slate-200 rounded-lg overflow-hidden'>
                        <button
                            onClick={() => toggleSection('approved')}
                            className='w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all'
                        >
                            <h3 className='text-lg font-semibold text-slate-800'>Approved</h3>
                            {expandedSections.includes('approved') ? (
                                <ChevronDown className='w-5 h-5 text-slate-600' />
                            ) : (
                                <ChevronRight className='w-5 h-5 text-slate-600' />
                            )}
                        </button>

                        {expandedSections.includes('approved') && (
                            <div className='p-6 bg-white border-t border-slate-200'>
                                {billboardData.approved.map((item) => (
                                    <div key={item.id} className='p-4 bg-green-50 rounded-lg mb-4'>
                                        <h4 className='font-semibold text-slate-800'>{item.fullName}</h4>
                                        <p className='text-slate-600'>{item.companyName}</p>
                                        <p className='text-slate-500 text-sm mt-1'>{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Denied Section */}
                    <div className='border border-slate-200 rounded-lg overflow-hidden'>
                        <button
                            onClick={() => toggleSection('denied')}
                            className='w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 transition-all'
                        >
                            <h3 className='text-lg font-semibold text-slate-800'>Denied</h3>
                            {expandedSections.includes('denied') ? (
                                <ChevronDown className='w-5 h-5 text-slate-600' />
                            ) : (
                                <ChevronRight className='w-5 h-5 text-slate-600' />
                            )}
                        </button>

                        {expandedSections.includes('denied') && (
                            <div className='p-6 bg-white border-t border-slate-200'>
                                {billboardData.denied.map((item) => (
                                    <div key={item.id} className='p-4 bg-red-50 rounded-lg mb-4'>
                                        <h4 className='font-semibold text-slate-800'>{item.fullName}</h4>
                                        <p className='text-slate-600'>{item.companyName}</p>
                                        <p className='text-slate-500 text-sm mt-1'>{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
