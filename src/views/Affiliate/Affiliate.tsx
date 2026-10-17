'use client';

import { AffiliateOnboardingPopup } from '@/components/Affiliateonboardingpopup';
import ShareBanner from '@/components/ShareBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import lottie from 'lottie-web';
import { BarChart3, Megaphone, Rocket, Target, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

type LottieAnimationProps = {
    src: string;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

function Affiliate() {
    const [showDashboardButton, setShowDashboardButton] = useState(false);
    const [isAffiliatePopupOpen, setIsAffiliatePopupOpen] = useState(false);

    const earnBigRef = useRef<HTMLElement | null>(null);

    const handleScrollToEarnBig = () => {
        earnBigRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    const whyJoin = [
        {
            title: 'Recurring Income Model',
            description:
                'Earn recurring monthly and annual lifetime commissions that continue as long as customers remain active—income that compounds over time.',
            icon: Rocket,
        },
        {
            title: 'Automated Tracking',
            description: 'Automated tracking removes uncertainty and gives you confidence in performance measurement and attribution.',
            icon: Target,
        },
        {
            title: 'Real-Time KPIs',
            description: 'A centralized KPI dashboard gives full visibility into sales, referrals, traffic, and growth at all times.',
            icon: BarChart3,
        },
        {
            title: 'Built-In Email & SMS CRM',
            description: 'Promote offers from one platform using built-in Email and SMS tools—no third-party marketing software needed.',
            icon: Megaphone,
        },
    ];

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedRoles = localStorage.getItem('roles');
        const roles = storedRoles ? JSON.parse(storedRoles) : [];
        setShowDashboardButton(!!storedUserId && Array.isArray(roles) && roles.includes('Affiliate'));
    }, []);

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            <ShareBanner />
            <AffiliateOnboardingPopup open={isAffiliatePopupOpen} onOpenChange={setIsAffiliatePopupOpen} />

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        <div className='space-y-10 animate-slide-in-left'>
                            <div>
                                <div className='inline-block'>
                                    <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-white mb-4 sm:mb-5'>
                                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                            Lightning
                                        </span>{' '}
                                        Affiliate
                                    </h1>
                                </div>

                                <p className='text-md sm:text-lg text-gray-300 leading-relaxed max-w-2xl'>
                                    The Lightning Affiliate Program helps you earn recurring monthly income by promoting subscription-based business tools.
                                    Affiliates get automated tracking, built-in Email and SMS marketing tools, and real-time KPI metrics to monitor sales and
                                    growth. The program is designed for both beginners and experienced marketers who want predictable, long-term earnings.
                                </p>
                            </div>

                            <div className='flex flex-col sm:flex-row sm:flex-wrap lg:flex-col 2xl:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    onClick={() => setIsAffiliatePopupOpen(true)}
                                    size='lg'
                                    className='group border-2 box-border border-[#4cc7e8] cursor-pointer text-[#4cc7e8] px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[calc(50%_-_0.75rem)] lg:w-full lg:max-w-[300px] 2xl:w-[300px]'
                                >
                                    Learn More
                                </Button>

                                <Button
                                    onClick={handleScrollToEarnBig}
                                    size='lg'
                                    className='group border-2 box-border border-[#4cc7e8] cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[calc(50%_-_0.75rem)] lg:w-full lg:max-w-[300px] 2xl:w-[300px]'
                                >
                                    Join Now
                                </Button>

                                {showDashboardButton && (
                                    <Link href={'/affiliate/dashboard/kpi'}>
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            className='border-2 cursor-pointer border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-[calc(50%_-_0.75rem)] lg:w-full lg:max-w-[300px] 2xl:w-[300px]'
                                        >
                                            View Earnings
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className='relative animate-slide-in-right min-w-0'>
                            <div className='relative flex items-center justify-center w-full h-full'>
                                <div className='flex items-center justify-center w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] aspect-square rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                    <div className='w-[90%] aspect-square sm:w-full'>
                                        <LottieAnimation
                                            src='/animations/affiliate-coin-dollar-blue.json'
                                            className='w-full h-full'
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section ref={earnBigRef} className='relative pt-10 sm:pt-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-14 sm:mb-16'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Earn <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Big</span> Commissions
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            Lightning affiliates earn recurring lifetime commissions on every subscription they refer. Commissions are paid on both monthly and
                            annual plans and continue for as long as customers remain active. There are no income caps, allowing earnings to grow as traffic,
                            referrals, and customers increase over time. Automated payouts ensure commissions are delivered consistently and reliably
                        </p>
                    </div>
                </div>
            </section>

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-10 sm:mb-14'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Referral <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Program</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            Lightning also offers a recurring referral bonus that increases total monthly earnings. Affiliates earn $100 per month for every 10
                            products sold, paid on an ongoing basis while customers remain active. These bonuses stack over time, creating an additional revenue
                            layer beyond standard commissions.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-6 sm:gap-8'>
                        <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 rounded-2xl'>
                            <CardContent className='p-6 sm:p-8'>
                                <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg'>
                                    <Users className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                </div>
                                <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 leading-[1.28]'>$100 / month bonus</h3>
                                <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>
                                    Earn $100 per month for every 10 products sold—paid on an ongoing basis as long as customers stay subscribed.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 rounded-2xl'>
                            <CardContent className='p-6 sm:p-8'>
                                <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg'>
                                    <Rocket className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                </div>
                                <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 leading-[1.28]'>Stacks with commissions</h3>
                                <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>
                                    Referral bonuses stack on top of standard commissions—creating an extra recurring revenue layer.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 rounded-2xl'>
                            <CardContent className='p-6 sm:p-8'>
                                <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg'>
                                    <BarChart3 className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                </div>
                                <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 leading-[1.28]'>Built for long-term growth</h3>
                                <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>
                                    Bonuses remain active as long as referred customers continue their subscriptions—rewarding consistency and retention.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Why Join Our{' '}
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent whitespace-nowrap'>
                                Affiliate Program
                            </span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            Lightning combines real products, automation, and analytics into one affiliate ecosystem. <br />
                            Affiliates promote tools businesses already pay for while built-in CRM, automation, and KPI analytics drive scalable recurring
                            income.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-4 gap-6 sm:gap-8'>
                        {whyJoin.map((feature, index) => (
                            <div key={feature.title} className='group animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    <CardContent className='p-6 sm:p-8'>
                                        <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
                                            <feature.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                        </div>
                                        <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 leading-[1.28] group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            {feature.title}
                                        </h3>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 sm:gap-16 items-center'>
                        <div className='space-y-6 sm:space-y-8'>
                            <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                Choose Your{' '}
                                <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent whitespace-nowrap'>Affiliate</span>{' '}
                                Level
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                Choose the affiliate level that fits your goals and earning strategy. Both options include the same tools, tracking, and
                                referral bonuses.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2'>
                                <Link href='/lightningSilver'>
                                    <Button
                                        size='lg'
                                        className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] cursor-pointer'
                                    >
                                        Lightning Silver
                                    </Button>
                                </Link>

                                <Link href='/lightningGold'>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg bg-transparent cursor-pointer w-full sm:w-[300px]'
                                    >
                                        Lightning Gold
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className='flex items-center justify-center'>
                            <div className='w-full h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/dividendicon.json' loop={true} autoplay={true} className='w-full h-full' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export { Affiliate };
