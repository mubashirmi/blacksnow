'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
    const router = useRouter();

    const [productLink, setProductLink] = useState<string | null>(null);
    const [isCheckingStripeStatus, setIsCheckingStripeStatus] = useState(true);
    const [stripeStatusError, setStripeStatusError] = useState('');

    useEffect(() => {
        const storedProductLink = localStorage.getItem('productLink');

        setProductLink(storedProductLink);

        const checkStripeStatus = async () => {
            try {
                setIsCheckingStripeStatus(true);
                setStripeStatusError('');

                // Get user ID from cookies.
                const cookieUserId = document.cookie
                    .split('; ')
                    .find((cookie) => cookie.startsWith('id='))
                    ?.split('=')[1];

                if (!cookieUserId) {
                    throw new Error('User ID was not found in cookies.');
                }

                // Decode the cookie and remove quotation marks if present.
                const userId = decodeURIComponent(cookieUserId).replace(/^"|"$/g, '');

                if (!userId) {
                    throw new Error('Invalid user ID.');
                }

                const response = await fetch(`/api/v2/stripe-connect/status?id=${encodeURIComponent(userId)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-store',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);

                    throw new Error(errorData?.message || 'Failed to check Stripe connection status.');
                }

                // Read the response so the API request is fully completed.
                await response.json().catch(() => null);
            } catch (error) {
                console.error('Stripe status check failed:', error);

                setStripeStatusError(error instanceof Error ? error.message : 'Failed to check Stripe connection status.');
            } finally {
                setIsCheckingStripeStatus(false);
            }
        };

        checkStripeStatus();
    }, []);

    const handleNavigate = () => {
        if (productLink === 'https://blacksnowholdings.com/lightningGold') {
            router.push('/superAffiliate/dashboard/kpi');
        } else if (productLink === 'https://blacksnowholdings.com/lightningSilver') {
            router.push('/affiliate/dashboard/kpi');
        } else {
            router.push('/affiliate/dashboard/links');
        }
    };

    // The confirmation page is only displayed after
    // the Stripe status API request has completed.
    if (isCheckingStripeStatus) {
        return (
            <div className='min-h-screen bg-[#050608] flex items-center justify-center'>
                <div className='flex items-center gap-3 text-green-400'>
                    <Loader2 className='w-6 h-6 animate-spin' />

                    <span className='text-sm font-semibold'>Checking Stripe connection...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden flex items-center justify-center'>
            {/* Confirmation Card */}
            <div className='relative z-10 w-full max-w-2xl px-6 py-20'>
                {/* Success Badge */}
                <div className='text-center mb-8 animate-slide-in-up'>
                    <div className='inline-flex items-center space-x-3 bg-gradient-to-r from-green-500/10 via-emerald-500/20 to-green-500/10 backdrop-blur-2xl border border-green-400/30 rounded-full px-8 py-4 shadow-2xl shadow-green-500/20 mb-6'>
                        <CheckCircle className='w-6 h-6 text-green-400 animate-pulse' />

                        <span className='text-green-400 font-bold text-sm tracking-wider uppercase'>Success</span>
                    </div>
                </div>

                {/* Glowing Background Effect */}
                <div className='absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-2xl opacity-60'></div>

                <Card className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-green-500/30 hover:border-green-400/50 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl shadow-green-500/20 animate-slide-in-up delay-200'>
                    {/* Top Border */}
                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600'></div>

                    <CardHeader className='p-12 text-center'>
                        {/* Success Icon */}
                        <div className='w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/40 animate-bounce-slow'>
                            <CheckCircle className='w-12 h-12 text-white' />
                        </div>

                        <CardTitle className='text-4xl lg:text-5xl font-black text-white mb-6'>
                            <span className='bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 bg-clip-text text-transparent'>Confirmation</span>
                        </CardTitle>

                        <div className='space-y-4 text-center'>
                            <h2 className='text-2xl lg:text-3xl font-semibold text-white'>Your Stripe checkout has been connected successfully.</h2>
                        </div>
                    </CardHeader>

                    <CardContent className='p-12 pt-0'>
                        {stripeStatusError && (
                            <div className='mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center'>
                                <p className='text-sm text-red-400'>{stripeStatusError}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Button
                                onClick={handleNavigate}
                                className='bg-gradient-to-r from-[#012e07] via-[#023108] to-[#033101] text-white font-bold py-6 px-8 text-lg shadow-2xl shadow-[#012e07]/40 transition-all duration-500 transform hover:scale-105 rounded-2xl group'
                            >
                                Access Dashboard
                                <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
                            </Button>

                            <Button
                                asChild
                                variant='outline'
                                className='bg-transparent border-2 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-400/50 font-bold py-6 px-8 text-lg transition-all duration-300 rounded-2xl'
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
