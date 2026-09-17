'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bell, CheckCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type ApiStatusType = 'loading' | 'success' | 'error';

type ApiResult = {
    success: boolean;
    type: 'payment' | 'commission';
    error?: string;
};

function SubscriptionConfirmation() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [apiStatus, setApiStatus] = useState('Confirming your payment...');
    const [statusType, setStatusType] = useState<ApiStatusType>('loading');
    const [productLink, setProductLink] = useState<string | null>(null);

    const hasProcessedRef = useRef(false);

    useEffect(() => {
        const storedProductLink = localStorage.getItem('productLink');
        setProductLink(storedProductLink);

        const sessionId = searchParams.get('session_id') || new URLSearchParams(window.location.search).get('session_id');

        if (!sessionId) {
            setStatusType('error');
            setApiStatus('Unable to confirm payment because the session ID is missing.');
            return;
        }

        // Prevent duplicate API calls in React Strict Mode
        if (hasProcessedRef.current) return;
        hasProcessedRef.current = true;

        const processPayment = async () => {
            setStatusType('loading');
            setApiStatus('Confirming your payment...');

            try {
                const promises: Promise<ApiResult>[] = [];

                const paymentPromise: Promise<ApiResult> = fetch(`/api/v1/stripe/success?sessionId=${encodeURIComponent(sessionId)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(async (response) => {
                        const data = await response.json();

                        if (response.ok) {
                            console.log('Payment confirmed successfully');

                            return {
                                success: true,
                                type: 'payment',
                            };
                        }

                        console.error('Payment confirmation failed:', data.message);

                        return {
                            success: false,
                            type: 'payment',
                            error: data.message || 'Payment confirmation failed',
                        };
                    })
                    .catch((error) => {
                        console.error('Payment API call failed:', error);

                        return {
                            success: false,
                            type: 'payment',
                            error: error.message || 'Payment API call failed',
                        };
                    });

                promises.push(paymentPromise);

                const referredby = localStorage.getItem('referredby');
                const storedProductLink = localStorage.getItem('productLink');
                const comission = Number(localStorage.getItem('comission'));

                if (referredby && referredby !== 'undefined') {
                    const commissionPromise: Promise<ApiResult> = fetch(`/api/v2/comission/?id=${referredby}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            productLink: storedProductLink,
                            comission,
                        }),
                    })
                        .then(async (response) => {
                            const data = await response.json();

                            if (response.ok) {
                                console.log('Commission confirmed successfully');

                                return {
                                    success: true,
                                    type: 'commission',
                                };
                            }

                            console.error('Commission confirmation failed:', data.message);

                            return {
                                success: false,
                                type: 'commission',
                                error: data.message || 'Commission confirmation failed',
                            };
                        })
                        .catch((error) => {
                            console.error('Commission API call failed:', error);

                            return {
                                success: false,
                                type: 'commission',
                                error: error.message || 'Commission API call failed',
                            };
                        });

                    promises.push(commissionPromise);
                }

                const results = await Promise.all(promises);

                const paymentResult = results.find((result) => result.type === 'payment');
                const commissionResult = results.find((result) => result.type === 'commission');

                if (paymentResult?.success && (!commissionResult || commissionResult.success)) {
                    setStatusType('success');
                    setApiStatus('Payment confirmed successfully!');
                } else {
                    const errors = [];

                    if (!paymentResult?.success) {
                        errors.push(`Payment: ${paymentResult?.error || 'Failed'}`);
                    }

                    if (commissionResult && !commissionResult.success) {
                        errors.push(`Commission: ${commissionResult.error || 'Failed'}`);
                    }

                    setStatusType('error');
                    setApiStatus(`Error: ${errors.join(', ')}`);
                }
            } catch (error) {
                setStatusType('error');
                setApiStatus('Error: Failed to process payment confirmation');
                console.error('Payment processing failed:', error);
            }
        };

        processPayment();
    }, [searchParams]);

    const handleNavigate = () => {
        if (!productLink) {
            router.push('/');
            return;
        }

        if (productLink === 'https://blacksnowholdings.com/emailMarketing') {
            router.push('/emailMarketing/dashboard/kpi');
        } else if (productLink === 'https://blacksnowholdings.com/InvoiceContract') {
            router.push('/invoicecontractdashboard/contract');
        } else if (productLink === 'https://blacksnowholdings.com/advertising') {
            router.push('/digitalBillboard/dashboard');
        } else if (productLink === 'https://blacksnowholdings.com/lightningGold') {
            router.push('/superAffiliate/dashboard/kpi');
        } else if (productLink === 'https://blacksnowholdings.com/lightningSilver') {
            router.push('/affiliate/dashboard/kpi');
        } else {
            router.push('/');
        }
    };

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden flex items-center justify-center py-20'>
            {/* Confirmation Card */}
            <div className='relative z-10 w-full max-w-2xl px-6'>
                {/* Success Badge */}
                <div className='text-center mb-8 animate-slide-in-up'>
                    <div className='inline-flex items-center space-x-3 bg-gradient-to-r from-[#2c7bbe]/10 via-[#4cc7e8]/20 to-[#2a8dcc]/10 backdrop-blur-2xl border border-[#4cc7e8]/30 rounded-full px-8 py-4 shadow-2xl shadow-[#2c7bbe]/20 mb-6'>
                        <CheckCircle className='w-6 h-6 text-[#4cc7e8] animate-pulse' />
                        <span className='text-[#4cc7e8] font-bold text-sm tracking-wider uppercase'>Subscribed</span>
                    </div>
                </div>

                <Card className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-3xl overflow-hidden animate-slide-in-up delay-200'>
                    {/* Top Border */}
                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>

                    <CardHeader className='p-12 text-center'>
                        {/* Success Icon */}
                        <div className='w-24 h-24 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#2c7bbe]/40 animate-bounce-slow'>
                            <Mail className='w-12 h-12 text-white' />
                        </div>

                        <CardTitle className='text-4xl lg:text-5xl font-black text-white mb-6'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Confirmation</span>
                        </CardTitle>

                        <div className='space-y-4 text-center'>
                            <h2 className='text-2xl lg:text-3xl font-bold text-white'>You have been subscribed to our newsletter!</h2>

                            <div className='flex justify-center'>
                                {statusType === 'loading' && (
                                    <div className='inline-flex items-center gap-3 rounded-full border border-[#4cc7e8]/30 bg-[#4cc7e8]/10 px-5 py-3 text-sm font-semibold text-[#4cc7e8] shadow-lg shadow-[#2c7bbe]/20'>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        <span>{apiStatus}</span>
                                    </div>
                                )}

                                {statusType === 'success' && (
                                    <p className='inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-5 py-3 text-sm font-semibold text-green-400'>
                                        <CheckCircle className='h-4 w-4' />
                                        {apiStatus}
                                    </p>
                                )}

                                {statusType === 'error' && (
                                    <p className='rounded-full border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-400'>
                                        {apiStatus}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className='p-12 pt-0'>
                        {/* Additional Info */}
                        <div className='grid md:grid-cols-2 gap-6 mb-8'>
                            <div className='bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl p-6 border border-[#4cc7e8]/20 text-center'>
                                <Mail className='w-8 h-8 text-[#4cc7e8] mx-auto mb-3' />
                                <h3 className='text-white font-bold mb-2'>Newsletter Access</h3>
                                <p className='text-gray-300 text-sm'>You&apos;ll receive our latest trading insights and market analysis</p>
                            </div>

                            <div className='bg-gradient-to-r from-[#4cc7e8]/10 to-[#2a8dcc]/10 rounded-2xl p-6 border border-[#4cc7e8]/20 text-center'>
                                <Bell className='w-8 h-8 text-[#4cc7e8] mx-auto mb-3' />
                                <h3 className='text-white font-bold mb-2'>Premium Updates</h3>
                                <p className='text-gray-300 text-sm'>Get notified about exclusive trading opportunities</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Button
                                onClick={handleNavigate}
                                disabled={statusType === 'loading'}
                                className='bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] hover:from-[#4cc7e8] hover:via-[#2a8dcc] hover:to-[#2c7bbe] text-white font-bold py-6 px-8 text-lg shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-500 transform hover:scale-105 rounded-2xl group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'
                            >
                                {statusType === 'loading' ? 'Please wait...' : 'View Dashboard'}
                                <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
                            </Button>

                            <Button
                                asChild
                                variant='outline'
                                className='bg-transparent border-2 border-[#4cc7e8]/30 text-[#4cc7e8] hover:bg-[#4cc7e8]/10 hover:border-[#4cc7e8]/50 font-bold py-6 px-8 text-lg transition-all duration-300 rounded-2xl'
                            >
                                <Link href='/'>Return Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export { SubscriptionConfirmation };
