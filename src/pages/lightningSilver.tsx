'use client';

import AuthModal from '@/components/AuthModal';
import { PricingComponent } from '@/components/PricingComponent';
import ShareBanner from '@/components/ShareBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import lottie from 'lottie-web';
import { ArrowRight, Rocket, Target } from 'lucide-react';
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
    const ROUTES = {
        afterLogin: '/pricing?plan=silver',
        afterSignup: '/pricing?plan=silver',
    };

    const [authOpen, setAuthOpen] = useState(false);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [authDefaultView, setAuthDefaultView] = useState<'signin' | 'signup'>('signup');
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

            <AuthModal
                open={authOpen}
                onOpenChange={setAuthOpen}
                defaultView={authDefaultView}
                redirectAfterLogin={ROUTES.afterLogin}
                redirectAfterSignup={ROUTES.afterSignup}
                sourceRoute='/lightningSilver'
                onSuccess={(ctx) => {
                    if (ctx.kind === 'login') {
                        setIsLoggedIn(true);
                        setAuthOpen(false);
                        setPricingOpen(true);
                        return true;
                    }
                    return true;
                }}
            />

            <PricingComponent name='LightningSilver' asModal open={pricingOpen} onOpenChange={setPricingOpen} className='' />

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        <div className='space-y-7 sm:space-y-8 md:space-y-10 animate-slide-in-left'>
                            <div>
                                <div style={{ display: 'table' }}>
                                    <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-4 leading-tight'>
                                        Lightning Silver{' '}
                                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                            Earn 25% Commission
                                        </span>
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
                                    onClick={handleJoinSilver}
                                    size='lg'
                                    className='group border-2 box-border border-[#4cc7e8] cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    <Rocket className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                    Join Silver
                                    <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                </Button>
                            </div>
                        </div>

                        <div className='relative animate-slide-in-right'>
                            <div className='relative flex items-center justify-center w-full h-full'>
                                <div className='flex items-center justify-center w-full sm:w-fit bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                    <LottieAnimation
                                        src='/animations/coinsdollarjump.json'
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
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Build Earnings From <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Subscribers</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            Every active subscriber you refer generates a lifetime commission—paid monthly or annually for as long as they stay subscribed. No
                            income cap. No expiry. Just compounding, predictable earnings that grow with your audience.
                        </p>
                    </div>

                    <Card className='bg-[#195eab] rounded-2xl overflow-hidden mb-8 sm:mb-10'>
                        <CardContent className='p-6 sm:p-8'>
                            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
                                <div>
                                    <div className='text-xl sm:text-2xl md:text-3xl font-bold text-white'>Commission Table</div>
                                    <div className='text-gray-300 text-sm sm:text-base mt-1'>Monthly and annual commissions in one clear view.</div>
                                </div>
                                <Badge className='bg-[#2c6bb2] text-white px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base'>$5 / mo</Badge>
                            </div>

                            <div className='overflow-x-auto rounded-xl border border-blue-400'>
                                <table className='w-full text-left'>
                                    <thead className='bg-white/5'>
                                        <tr>
                                            <th className='p-4 sm:p-5 text-sm sm:text-base font-semibold text-white'>Product</th>
                                            <th className='p-4 sm:p-5 text-sm sm:text-base font-semibold text-white'>Monthly</th>
                                            <th className='p-4 sm:p-5 text-sm sm:text-base font-semibold text-white'>Annual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissionRows.map((row) => (
                                            <tr key={row.product} className='border-t border-blue-400 hover:bg-white/[0.02] transition-colors'>
                                                <td className='p-4 sm:p-5 text-gray-200 font-medium text-sm sm:text-base'>{row.product}</td>
                                                <td className='p-4 sm:p-5 text-[#4cc7e8] font-bold text-sm sm:text-base'>{row.monthly}</td>
                                                <td className='p-4 sm:p-5 text-[#4cc7e8] font-bold text-sm sm:text-base'>{row.annual}</td>
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

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 sm:gap-16 items-center'>
                        <div className='space-y-6 sm:space-y-8'>
                            <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Get <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>25% Lifetime</span> Commissions
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                Get 25% lifetime commissions on every referral, for both monthly and annual plans. Use the built-in Email &amp; SMS CRM and KPI
                                dashboard to track performance and grow effortlessly.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    onClick={handleJoinSilver}
                                    size='lg'
                                    className='group border-2 box-border border-[#4cc7e8] cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    <Target className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                    Join Silver
                                    <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                </Button>
                            </div>
                        </div>

                        <div className='flex items-center justify-center'>
                            <div className='w-full h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/dividendicon.json' loop autoplay className='w-full h-full' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LightningSilver;
export { LightningSilver };
