'use client';

import AuthModal from '@/components/AuthModal';
import LightningSilverSlideshow from '@/components/LightningSilverSlideshow';
import { MultiCurrencyAcceptanceSection } from '@/components/MultiCurrencyAcceptanceSection';
import { PricingComponent } from '@/components/PricingComponent';
import { RevenuePayoutsSection } from '@/components/RevenuePayoutsSection';
import ShareBanner from '@/components/ShareBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import lottie from 'lottie-web';
import { parseCookies } from 'nookies';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type LottieAnimationProps = {
    src: string;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

function LightningSilver() {
    const [authOpen, setAuthOpen] = useState(false);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [openPricingAfterAuth, setOpenPricingAfterAuth] = useState(false);
    // eslint-disable-next-line
    const [authDefaultView, setAuthDefaultView] = useState<'signin' | 'signup'>('signup');
    const [activeSlideshow, setActiveSlideshow] = useState<'silver' | 'gold' | null>(null);
    // eslint-disable-next-line
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const computeLoggedIn = useCallback(() => {
        const cookies = parseCookies();
        const cookieId = cookies?.id;
        const localId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        return Boolean(cookieId || localId);
    }, []);

    useEffect(() => {
        setIsLoggedIn(computeLoggedIn());
    }, [computeLoggedIn]);

    useEffect(() => {
        if (authOpen || !openPricingAfterAuth) return;

        const timer = window.setTimeout(() => {
            setOpenPricingAfterAuth(false);
            setPricingOpen(true);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [authOpen, openPricingAfterAuth]);

    const handleJoinSilver = useCallback(() => {
        const logged = computeLoggedIn();
        setIsLoggedIn(logged);

        if (!logged) {
            setAuthDefaultView('signup');
            setAuthOpen(true);
            return;
        }

        setPricingOpen(true);
    }, [computeLoggedIn]);

    const LottieAnimation = ({ src, loop = true, autoplay = true, className, style }: LottieAnimationProps) => {
        const containerRef = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            if (!containerRef.current) return;

            const animation = lottie.loadAnimation({
                container: containerRef.current,
                renderer: 'svg',
                loop,
                autoplay,
                path: src,
            });

            return () => animation.destroy();
        }, [src, loop, autoplay]);

        return <div ref={containerRef} className={className} style={style} />;
    };

    const commissionRows = [
        { product: 'Newsletter', monthly: '$2.50 / mo', annual: '$12.50 / year' },
        { product: 'Business Invoice', monthly: '$5 / mo', annual: '$50 / year' },
        { product: 'Digital Billboard', monthly: '$37.50 / mo', annual: '$150 / year' },
        { product: 'Email/SMS CRM', monthly: '$125 / mo', annual: '$1,000 / year' },
    ];

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            <ShareBanner />

            {authOpen && (
                <AuthModal
                    open={authOpen}
                    onOpenChange={(open) => {
                        setAuthOpen(open);
                        if (open) setPricingOpen(false);
                    }}
                    defaultView='signup'
                    sourceRoute='/lightningSilver'
                    onSuccess={() => {
                        setIsLoggedIn(true);
                        setPricingOpen(false);
                        setOpenPricingAfterAuth(true);
                        setAuthOpen(false);
                        return false;
                    }}
                />
            )}

            {!authOpen && <PricingComponent name='LightningSilver' asModal open={pricingOpen} onOpenChange={setPricingOpen} className='' />}

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        <div className='space-y-7 sm:space-y-8 md:space-y-10 animate-slide-in-left'>
                            <div>
                                <div style={{ display: 'table' }}>
                                    <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-[#8d96c2] mb-3 sm:mb-4'>
                                        <span className='block whitespace-nowrap'>Lightning Silver</span>
                                        <span className='block whitespace-nowrap'>25% Commission</span>
                                    </h1>
                                </div>

                                <p className='text-base sm:text-md md:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Earn 25% lifetime commissions, paid on both monthly and annual subscriptions, for every active customer you refer with a
                                    $5/month membership. Gain commissions that continue as long as your subscribers remain active, creating predictable
                                    long-term payouts. Build consistently while using built-in tools to track performance and grow at your own pace.
                                </p>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    onClick={() => setActiveSlideshow('silver')}
                                    size='lg'
                                    className='group border-2 box-border border-[#8d96c2]/60 cursor-pointer hover:bg-[#8d96c2]/10 text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-sm shadow-[#8d96c2]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Learn More
                                </Button>
                                <Button
                                    onClick={handleJoinSilver}
                                    size='lg'
                                    className='group border-2 box-border border-[#8d96c2]/60 cursor-pointer bg-[#8d96c2] hover:bg-[#8d96c2]/70 text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-md shadow-[#8d96c2]/60 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Join Silver
                                </Button>
                            </div>
                        </div>

                        <div className='relative animate-slide-in-right'>
                            <div className='relative flex items-center justify-center w-full h-full'>
                                <div className='flex items-center justify-center w-full sm:w-fit rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                    <LottieAnimation
                                        src='/animations/lightningSilverherosection.json'
                                        className='w-[90%] lg:w-[85%] max-w-[255px] sm:max-w-[295px] md:max-w-[340px] lg:max-w-[360px] h-[315px] sm:h-[355px] md:h-[395px] lg:h-[415px]'
                                        loop
                                        autoplay
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Build Earnings From <span className='text-[#8d96c2]'>Subscribers</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            Every active subscriber you refer generates a lifetime commission—paid monthly or annually for as long as they stay subscribed. No
                            income cap. No expiry. Just compounding, predictable earnings that grow with your audience.
                        </p>
                    </div>

                    <Card className='bg-black/70 rounded-2xl overflow-hidden mb-8 sm:mb-10 border-[1px] border-[#8d96c2]/60'>
                        <CardContent className='p-6 sm:p-8'>
                            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
                                <div className='flex flex-row justify-between w-full'>
                                    <div className='w-full sm:w-fit'>
                                        <div className='text-xl sm:text-2xl md:text-3xl font-bold text-[#8d96c2] text-center sm:text-left'>
                                            Lightning Silver (25%)
                                        </div>
                                        <div className='text-gray-300 text-sm sm:text-base mt-1 hidden sm:block'>
                                            Monthly and annual commissions in one clear view.
                                        </div>
                                    </div>
                                    <div className='text-xl sm:text-2xl md:text-3xl font-bold text-[#8d96c2] hidden sm:block'>5$ per month</div>
                                </div>
                                {/* <Badge className='bg-[#2c6bb2] text-white px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base'>$5 / mo</Badge> */}
                            </div>

                            <div className='overflow-x-auto rounded-xl border border-[#8d96c2]/60'>
                                <table className='w-full text-left'>
                                    <thead>
                                        <tr>
                                            <th className='p-4 sm:p-5 text-sm sm:text-base font-semibold text-gray-200'>Product</th>
                                            <th className='p-4 sm:p-5 text-sm sm:text-base font-semibold text-gray-200'>Monthly</th>
                                            <th className='p-4 sm:p-5 text-sm sm:text-base font-semibold text-gray-200'>Annual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissionRows.map((row) => (
                                            <tr key={row.product} className='border-t border-[#8d96c2]/60 hover:bg-white/[0.02] transition-colors'>
                                                <td className='p-4 sm:p-5 text-gray-200 font-medium text-sm sm:text-base'>{row.product}</td>
                                                <td className='p-4 sm:p-5 text-gray-200 font-bold text-sm sm:text-base'>{row.monthly}</td>
                                                <td className='p-4 sm:p-5 text-gray-200 font-bold text-sm sm:text-base'>{row.annual}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p className='text-xs sm:text-sm text-gray-300 mt-4 sm:mt-5'>
                                Commissions are lifetime and continue as long as subscribers remain active.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <RevenuePayoutsSection />
            <MultiCurrencyAcceptanceSection />

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 sm:gap-16 items-center'>
                        <div className='space-y-6 sm:space-y-8'>
                            <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                Get <span className='text-[#8d96c2]'>25% Lifetime</span> Commissions
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                Get 25% lifetime commissions on every referral, for both monthly and annual plans. Use the built-in Email &amp; SMS CRM and KPI
                                dashboard to track performance and grow effortlessly.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    onClick={() => setActiveSlideshow('silver')}
                                    size='lg'
                                    className='group border-2 box-border border-[#8d96c2]/60 cursor-pointer hover:bg-[#8d96c2]/10 text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-sm shadow-[#8d96c2]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Learn More
                                </Button>
                                <Button
                                    onClick={handleJoinSilver}
                                    size='lg'
                                    className='group border-2 box-border border-[#8d96c2]/60 cursor-pointer bg-[#8d96c2] hover:bg-[#8d96c2]/70 text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-md shadow-[#8d96c2]/60 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Join Silver
                                </Button>
                            </div>
                        </div>

                        <div className='flex items-center justify-center'>
                            <div className='w-full h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/lightningSilverctasection.json' loop autoplay className='w-full h-full' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <LightningSilverSlideshow open={activeSlideshow === 'silver'} onOpenChange={(open) => setActiveSlideshow(open ? 'silver' : null)} />
        </div>
    );
}

export default LightningSilver;
export { LightningSilver };
