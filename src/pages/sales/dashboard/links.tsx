'use client';

import { AlertCircle, CheckCircle, Copy, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AffiliateLink {
    id: number;
    productName: string;
    productLink: string;
    clicks: number;
    conversion: number;
    comission: number;
    createdAt: string;
    updatedAt: string;
    authId: number;
}

interface ApiResponse {
    message: string;
    affiliateData: AffiliateLink[];
}

export default function AffiliateLinks() {
    const [links, setLinks] = useState<AffiliateLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [retrying, setRetrying] = useState(false);

    const id = localStorage.getItem('userId');

    const fetchAffiliateData = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch(`/api/v2/admin-affiliate-data/?id=${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            setLinks(data.affiliateData || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch affiliate data');
        } finally {
            setLoading(false);
            setRetrying(false);
        }
    }, [id, setError, setLinks, setLoading, setRetrying]);

    useEffect(() => {
        fetchAffiliateData();
    }, [fetchAffiliateData]);

    const handleRetry = () => {
        setRetrying(true);
        setLoading(true);
        fetchAffiliateData();
    };

    const copyToClipboard = async (url: string, id: number) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const calculateTotals = () => {
        const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
        const totalConversions = links.reduce((sum, link) => sum + link.conversion, 0);
        const totalCommission = links.reduce((sum, link) => sum + link.comission, 0);

        return { totalClicks, totalConversions, totalCommission };
    };

    // Loading state
    if (loading && !retrying) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='dot-spinner'>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !loading) {
        return (
            <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-3xl font-bold text-gray-900'>Affiliate Links</h2>
                        <p className='text-gray-600 mt-1'>Manage your affiliate links and track performance</p>
                    </div>
                </div>

                <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
                    <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
                    <h3 className='text-lg font-semibold text-red-800 mb-2'>Error Loading Data</h3>
                    <p className='text-red-600 mb-4'>{error}</p>
                    <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className='flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto'
                    >
                        {retrying ? (
                            <>
                                <Loader2 className='w-4 h-4 animate-spin' />
                                Retrying...
                            </>
                        ) : (
                            <>
                                <RefreshCw className='w-4 h-4' />
                                Try Again
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    const { totalClicks, totalConversions } = calculateTotals();

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-3xl font-bold text-gray-900'>Sales Links</h2>
                    <p className='text-gray-600 mt-1'>Manage your Sales links and track performance</p>
                </div>
            </div>

            {/* Empty state */}
            {links.length === 0 && !loading && !error && (
                <div className='text-center py-12 bg-white rounded-lg border border-gray-200'>
                    <div className='text-gray-400 mb-4'>
                        <ExternalLink className='w-12 h-12 mx-auto' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>No Sales Links</h3>
                    <p className='text-gray-600'>You don&apos;t have any sales links yet.</p>
                </div>
            )}

            {/* Links Grid */}
            {links.length > 0 && (
                <div className='grid gap-6'>
                    {links.map((link) => {
                        return (
                            <div key={link.id} className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow'>
                                <div className='flex items-start justify-between mb-4'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <h3 className='text-xl font-semibold text-gray-900 capitalize'>
                                                {link.productName.replace(/([A-Z])/g, ' $1').trim()}
                                            </h3>
                                        </div>
                                        <div className='flex items-center gap-2 text-gray-600 mb-3'>
                                            <span className='text-sm'>URL:</span>
                                            <a
                                                href={link.productLink}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-blue-600 hover:text-blue-800 text-sm font-mono flex items-center gap-1 break-all'
                                            >
                                                {link.productLink + '?refId=' + id}
                                                <ExternalLink className='w-3 h-3 flex-shrink-0' />
                                            </a>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <button
                                            onClick={() => copyToClipboard(link.productLink + `?refId=${id}`, link.id)}
                                            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
                                            title='Copy URL'
                                        >
                                            {copiedId === link.id ? <CheckCircle className='w-4 h-4 text-green-500' /> : <Copy className='w-4 h-4' />}
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className='grid grid-cols-3 gap-4 pt-4 border-t border-gray-100'>
                                    <div className='text-center'>
                                        <div className='text-2xl font-bold text-gray-900'>{link.clicks}</div>
                                        <div className='text-sm text-gray-500'>Clicks</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-2xl font-bold text-gray-900'>{link.conversion}</div>
                                        <div className='text-sm text-gray-500'>Conversions</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-sm font-medium text-gray-900'>{formatDate(link.createdAt)}</div>
                                        <div className='text-sm text-gray-500'>Created</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary Stats */}
            {links.length > 0 && (
                <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>Summary</h3>
                    <div className='grid grid-cols-3 gap-6'>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-gray-900'>{links.length}</div>
                            <div className='text-sm text-gray-500'>Total Links</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-blue-600'>{totalClicks}</div>
                            <div className='text-sm text-gray-500'>Total Clicks</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-green-600'>{totalConversions}</div>
                            <div className='text-sm text-gray-500'>Total Conversions</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
