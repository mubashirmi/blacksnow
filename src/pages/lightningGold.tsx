'use client';

import AuthModal from '@/components/AuthModal';
import LightningGoldSlideshow from '@/components/LightningGoldSlideshow';
import { MultiCurrencyAcceptanceSection } from '@/components/MultiCurrencyAcceptanceSection';
import { PricingComponent } from '@/components/PricingComponent';
import { RevenuePayoutsSection } from '@/components/RevenuePayoutsSection';
import ShareBanner from '@/components/ShareBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import lottie from 'lottie-web';
import { parseCookies } from 'nookies';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type LottieAnimationProps = {
    src: string;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

function LightningGold() {
    // ✅ Modal states
    const [authOpen, setAuthOpen] = useState(false);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [openPricingAfterAuth, setOpenPricingAfterAuth] = useState(false);
    // eslint-disable-next-line
    const [authDefaultView, setAuthDefaultView] = useState<'signin' | 'signup'>('signup');
    const [activeSlideshow, setActiveSlideshow] = useState<'silver' | 'gold' | null>(null);

    // eslint-disable-next-line
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // ✅ Check login status (cookie id or localStorage userId)
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

    const handleJoinGold = useCallback(() => {
        const logged = computeLoggedIn();
        setIsLoggedIn(logged);

        if (!logged) {
            setAuthDefaultView('signup'); // or 'signin' if you prefer
            setAuthOpen(true);
            return;
        }

        // ✅ Logged in → open pricing modal (SuperAffiliate)
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

    const commissionRows = useMemo(
        () => [
            { product: 'Newsletter', monthly: '$7.50 / mo', annual: '$37.50 / year' },
            { product: 'Business Invoice', monthly: '$15 / mo', annual: '$150 / year' },
            { product: 'Digital Billboard', monthly: '$112.50 / mo', annual: '$450 / year' },
            { product: 'Email/SMS CRM', monthly: '$375 / mo', annual: '$3,000 / year' },
        ],
        []
    );

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            <ShareBanner />

            {/* ✅ Auth modal (opens if not logged in) */}
            {authOpen && (
                <AuthModal
                    open={authOpen}
                    onOpenChange={(open) => {
                        setAuthOpen(open);
                        if (open) setPricingOpen(false);
                    }}
                    defaultView='signup'
                    sourceRoute='/lightningGold'
                    onSuccess={() => {
                        setIsLoggedIn(true);
                        setPricingOpen(false);
                        setOpenPricingAfterAuth(true);
                        setAuthOpen(false);
                        return false;
                    }}
                />
            )}

            {/* ✅ Pricing modal (opens only after auth modal closes) */}
            {!authOpen && <PricingComponent name='LightningGold' asModal open={pricingOpen} onOpenChange={setPricingOpen} className='' />}

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* Left */}
                        <div className='space-y-7 sm:space-y-8 md:space-y-10 animate-slide-in-left'>
                            <div>
                                {/* <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                    Lightning Gold
                                </Badge> */}

                                <div style={{ display: 'table' }}>
                                    <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-[#ffd500] mb-3 sm:mb-4'>
                                        <span className='block whitespace-nowrap'>Lightning Gold</span>
                                        <span className='block whitespace-nowrap'>75% Commission</span>
                                    </h1>
                                    {/* <div className='w-full h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5' /> */}
                                </div>

                                <p className='text-base sm:text-md md:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Earn 75% lifetime commissions, paid on both monthly and annual subscriptions, for every active customer you refer with a
                                    $250/month membership. Gain more from the same subscribers by increasing your commission rate without changing your effort.
                                    Build faster and scale more efficiently by converting the same traffic into higher recurring payouts.
                                </p>
                            </div>

                            {/* CTA */}
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    onClick={() => setActiveSlideshow('gold')}
                                    size='lg'
                                    className='group border-2 box-border border-[#ccab07] cursor-pointer hover:bg-[#c2a203]/10 text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-md shadow-[#ffd500]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Learn More
                                </Button>
                                <Button
                                    onClick={handleJoinGold}
                                    size='lg'
                                    className='group border-2 box-border border-[#ccab07] cursor-pointer bg-[#ffd500] hover:bg-[#c2a203] text-black px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-md shadow-[#ffd500]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Join Gold
                                </Button>
                            </div>
                        </div>

                        {/* Right – Lottie */}
                        <div className='relative animate-slide-in-right'>
                            <div className='relative flex items-center justify-center w-full h-full'>
                                <div className='flex items-center justify-center w-full sm:w-fit rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                    <LottieAnimation
                                        src='/animations/lightningGoldherosection.json'
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

            {/* ── COMMISSION TABLE ─────────────────────────────────────────── */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Build Faster and <span className='text-[#ffd500]'>Maximize Earnings</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            Every active subscriber you refer generates a 75% lifetime commission—paid monthly or annually for as long as they stay subscribed.
                            The highest commission rate available, with no income cap and no expiry.
                        </p>
                    </div>

                    {/* Table card */}
                    <Card className='bg-black/70 rounded-2xl overflow-hidden mb-8 sm:mb-10 border-[1px] border-[#ffd500]/40'>
                        <CardContent className='p-6 sm:p-8'>
                            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
                                <div className='flex flex-row justify-between w-full'>
                                    <div className='w-full sm:w-max'>
                                        <div className='text-xl sm:text-2xl md:text-3xl font-bold text-[#ffd500] text-center sm:text-left'>
                                            Lightning Gold (75%)
                                        </div>
                                        <div className='text-gray-300 text-sm sm:text-base mt-1 hidden sm:block'>
                                            Monthly and annual commissions in one clear view.
                                        </div>
                                    </div>
                                    <div className='text-xl sm:text-2xl md:text-3xl font-bold text-[#ffd500] hidden sm:block'>$250 / month</div>
                                </div>
                                {/* <Badge className='bg-[#e9a427] text-black px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base'>$250 / mo</Badge> */}
                            </div>

                            <div className='overflow-x-auto rounded-xl border border-[#ffd500]/40'>
                                <table className='w-full text-left'>
                                    <thead>
                                        <tr>
                                            <th className='p-4 sm:p-5 text-sm sm:text-base font-semibold text-gray-300'>Product</th>
                                            <th className='p-4 sm:p-5 text-sm sm:text-base font-semibold text-gray-300'>Monthly</th>
                                            <th className='p-4 sm:p-5 text-sm sm:text-base font-semibold text-gray-300'>Annual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissionRows.map((row) => (
                                            <tr key={row.product} className='border-t border-[#ffd500]/40 hover:bg-white/[0.02] transition-colors'>
                                                <td className='p-4 sm:p-5 text-gray-300 font-medium text-sm sm:text-base'>{row.product}</td>
                                                <td className='p-4 sm:p-5 text-gray-300 font-bold text-sm sm:text-base'>{row.monthly}</td>
                                                <td className='p-4 sm:p-5 text-gray-300 font-bold text-sm sm:text-base'>{row.annual}</td>
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

            {/* ── FINAL CTA ────────────────────────────────────────────────── */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 sm:gap-16 items-center'>
                        {/* Left copy */}
                        <div className='space-y-6 sm:space-y-8'>
                            {/* <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                Ready to Unlock Maximum Commissions?
                            </Badge> */}
                            <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                Earn <span className='text-[#ffd500]'>75% Lifetime</span> Commissions
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                Earn 75% lifetime commissions on every referral, for both monthly and annual plans. Scale faster with full automation, KPI
                                tracking, and Email &amp; SMS CRM tools designed to maximize every sale.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    onClick={() => setActiveSlideshow('gold')}
                                    size='lg'
                                    className='group border-2 box-border border-[#ccab07] cursor-pointer hover:bg-[#c2a203]/10 text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-md shadow-[#ffd500]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Learn More
                                </Button>
                                <Button
                                    onClick={handleJoinGold}
                                    size='lg'
                                    className='group border-2 box-border border-[#ccab07] cursor-pointer bg-[#ffd500] hover:bg-[#c2a203] text-black px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-md shadow-[#ffd500]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Join Gold
                                </Button>
                            </div>
                        </div>

                        {/* Right – Lottie */}
                        <div className='flex items-center justify-center'>
                            <div className='w-full h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/lightningGoldctasection.json' loop autoplay className='w-full h-full' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <LightningGoldSlideshow open={activeSlideshow === 'gold'} onOpenChange={(open) => setActiveSlideshow(open ? 'gold' : null)} />
        </div>
    );
}

export default LightningGold;
export { LightningGold };
