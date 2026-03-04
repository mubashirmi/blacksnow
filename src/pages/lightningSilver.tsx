'use client';

import { AuthModalTrigger } from '@/components/AuthModal';
import ShareBanner from '@/components/ShareBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import lottie from 'lottie-web';
import { ArrowRight, BarChart3, CheckCircle2, Megaphone, Rocket, Target } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

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

    const perks = [
        { label: 'Free Membership', icon: Rocket },
        { label: '25% lifetime commissions', icon: Target },
        { label: 'Subscriber referral bonuses', icon: CheckCircle2 },
        { label: 'Email & SMS CRM included to promote offers', icon: Megaphone },
        { label: 'KPI performance dashboard', icon: BarChart3 },
        { label: 'Automated payouts with no income cap', icon: CheckCircle2 },
    ];

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            <ShareBanner />

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* Left */}
                        <div className='space-y-7 sm:space-y-8 md:space-y-10 animate-slide-in-left'>
                            <div>
                                <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                    Lightning Silver
                                </Badge>

                                {/*
                                    `display: table` shrink-wraps to the natural width of its content
                                    (the h1 text), so the gradient line below is always pixel-perfect
                                    equal to the heading width — no more, no less.
                                */}
                                <div style={{ display: 'table' }}>
                                    <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-4 leading-tight'>
                                        Start Free.{' '}
                                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                            Build Recurring Income
                                        </span>
                                    </h1>
                                    <div className='w-full h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5' />
                                </div>

                                <p className='text-base sm:text-md md:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Earn 25% lifetime commissions, paid on both monthly and annual subscriptions, for every active customer you refer. Gain
                                    commissions that continue as long as your subscribers remain active, creating predictable long-term payouts. Build
                                    consistently while using built-in tools to track performance and grow at your own pace.
                                </p>
                            </div>

                            {/* CTA */}
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <AuthModalTrigger
                                    buttonText='Join Silver'
                                    defaultView='signup'
                                    sourceRoute='/lightningSilver'
                                    redirectAfterLogin={ROUTES.afterLogin}
                                    redirectAfterSignup={ROUTES.afterSignup}
                                >
                                    <Button
                                        size='lg'
                                        className='group border-2 box-border border-[#4cc7e8] cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    >
                                        <Rocket className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Join Silver
                                        <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </AuthModalTrigger>
                            </div>
                        </div>

                        {/* Right – Lottie */}
                        <div className='relative animate-slide-in-right'>
                            <div className='relative flex items-center justify-center w-full h-full'>
                                <div className='flex items-center justify-center w-full sm:w-fit bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                    <LottieAnimation
                                        src='/animations/coinsdollarjump.json'
                                        className='w-[90%] h-full sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:min-w-[550px] lg:h-[500px]'
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
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            Build Earnings From Subscribers
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Build Earnings From <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Subscribers</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            Every active subscriber you refer generates a lifetime commission—paid monthly or annually for as long as they stay subscribed. No
                            income cap. No expiry. Just compounding, predictable earnings that grow with your audience.
                        </p>
                    </div>

                    {/* Table card */}
                    <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl overflow-hidden mb-8 sm:mb-10'>
                        <CardContent className='p-6 sm:p-8'>
                            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
                                <div>
                                    <div className='text-xl sm:text-2xl md:text-3xl font-bold text-white'>Commission Table</div>
                                    <div className='text-gray-300 text-sm sm:text-base mt-1'>Monthly and annual commissions in one clear view.</div>
                                </div>
                                <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base'>
                                    FREE
                                </Badge>
                            </div>

                            <div className='overflow-x-auto rounded-xl border border-[#2c7bbe]/25'>
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
                                            <tr key={row.product} className='border-t border-[#2c7bbe]/20 hover:bg-white/[0.02] transition-colors'>
                                                <td className='p-4 sm:p-5 text-gray-200 font-medium text-sm sm:text-base'>{row.product}</td>
                                                <td className='p-4 sm:p-5 text-[#4cc7e8] font-bold text-sm sm:text-base'>{row.monthly}</td>
                                                <td className='p-4 sm:p-5 text-[#4cc7e8] font-bold text-sm sm:text-base'>{row.annual}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p className='text-xs sm:text-sm text-gray-400 mt-4 sm:mt-5'>
                                Commissions are lifetime and continue as long as subscribers remain active.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Perks grid */}
                    <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'>
                        {perks.map(({ label, icon: Icon }) => (
                            <div key={label} className='group'>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    <CardContent className='p-6 sm:p-8 flex gap-4 items-start'>
                                        <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300'>
                                            <Icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                        </div>
                                        <div className='text-gray-200 font-semibold text-sm sm:text-base leading-snug group-hover:text-[#4cc7e8] transition-colors duration-300 pt-1'>
                                            {label}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ────────────────────────────────────────────────── */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 sm:gap-16 items-center'>
                        {/* Left copy */}
                        <div className='space-y-6 sm:space-y-8'>
                            <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                Ready to Start Earning Commissions?
                            </Badge>
                            <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Get <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>25% Lifetime</span> Commissions
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                Get 25% lifetime commissions on every referral, for both monthly and annual plans. Use the built-in Email &amp; SMS CRM and KPI
                                dashboard to track performance and grow effortlessly.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <AuthModalTrigger
                                    buttonText='Join Silver'
                                    defaultView='signup'
                                    sourceRoute='/lightningSilver'
                                    redirectAfterLogin={ROUTES.afterLogin}
                                    redirectAfterSignup={ROUTES.afterSignup}
                                >
                                    <Button
                                        size='lg'
                                        className='group border-2 box-border border-[#4cc7e8] cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    >
                                        <Rocket className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Join Silver
                                        <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </AuthModalTrigger>
                            </div>
                        </div>

                        {/* Right – Lottie */}
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
