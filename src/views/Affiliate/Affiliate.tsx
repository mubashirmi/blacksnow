'use client';

import { AuthModalTrigger } from '@/components/AuthModal';
import ShareBanner from '@/components/ShareBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import lottie from 'lottie-web';
import { ArrowRight, BarChart3, Clock, Megaphone, Rocket, Target, Users } from 'lucide-react';
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

    const plans = [
        {
            title: 'Lightning Basic',
            kicker: 'Start Free. Build Recurring Income',
            priceMonthly: '$0 / month',
            commission: '25% lifetime commissions',
            description:
                'Earn 25% lifetime commissions on both monthly and annual subscriptions for every active customer you refer. Build predictable long-term payouts while tracking performance and growing at your own pace.',
            highlights: [
                'Free membership',
                '25% lifetime commissions',
                'Referral bonuses: earn $100/month for every 10 products sold',
                'Email & SMS CRM included to promote offers',
                'KPI dashboard for sales, traffic, and performance tracking',
                'Automated payouts with no income cap',
            ],
            icon: Rocket,
            color: 'from-[#4cc7e8] to-[#2c7bbe]',
            cta: { joinText: 'Join Basic', joinRedirect: '/pricing', learnHref: '/about' },
        },
        {
            title: 'Lightning Max',
            kicker: 'Scale Faster. Maximize Every Sale',
            priceMonthly: '$250 / month',
            commission: '75% lifetime commissions',
            description:
                'Earn 75% lifetime commissions on both monthly and annual subscriptions for every active customer you refer with a $250/month membership. Convert the same traffic into higher recurring payouts and scale more efficiently.',
            highlights: [
                'Max commission rate: 75% lifetime commissions',
                '$250/month membership',
                'Referral bonuses: earn $100/month for every 10 products sold',
                'Email & SMS CRM included to promote offers',
                'KPI dashboard for sales, traffic, and performance tracking',
                'Automated payouts with no income cap',
            ],
            icon: Target,
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
            cta: { joinText: 'Join Max', joinRedirect: '/pricing', learnHref: '/about' },
        },
    ];

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
            title: "Real-Time KPI's",
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

            {/* Hero Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* Left Content */}
                        <div className='space-y-7 sm:space-y-8 md:space-y-10 animate-slide-in-left'>
                            <div>
                                <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                    Lightning Affiliate Program
                                </Badge>

                                <div className='inline-block'>
                                    <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                                        Join the{' '}
                                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                            Lightning
                                        </span>{' '}
                                        <br />
                                        Affiliate Program
                                    </h1>

                                    <div className='w-full h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5'></div>
                                </div>

                                <p className='text-base sm:text-md md:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    The Lightning Affiliate Program allows you to earn recurring monthly income by promoting proven, subscription-based business
                                    tools. It is designed for individuals and businesses seeking predictable, long-term earnings rather than one-time
                                    commissions. Affiliates gain access to automated tracking, built-in Email and SMS marketing tools, and real-time KPI metrics
                                    with full visibility into sales, referrals, and growth—supporting both beginners and experienced marketers looking to scale.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <AuthModalTrigger
                                    buttonText='Join Now'
                                    defaultView='signup'
                                    sourceRoute='/affiliate'
                                    redirectAfterLogin='/affiliate'
                                    redirectAfterSignup='/pricing'
                                >
                                    <Button
                                        size='lg'
                                        className='group border-2 box-border border-[#4cc7e8] cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    >
                                        <Users className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Join Now
                                        <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </AuthModalTrigger>

                                {showDashboardButton && (
                                    <Link href={'/affiliate/dashboard/kpi'}>
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            className='border-2 cursor-pointer border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                        >
                                            <BarChart3 className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                            View Earnings
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right */}
                        <div className='relative animate-slide-in-right'>
                            <div className='relative overflow-hidden'>
                                <div className='relative flex items-center justify-center w-full h-full'>
                                    <div className='flex items-center justify-center w-full sm:w-fit bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                        <LottieAnimation
                                            src='/animations/affiliate-coin-dollar-blue.json'
                                            className='w-[90%] h-full sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:min-w-[550px] lg:h-[500px]'
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

            {/* Earn Big Commissions */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            Earn Big Commissions
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Recurring <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Lifetime</span> Earnings
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            Lightning affiliates earn recurring monthly and annual lifetime commissions on every subscription product they refer. Commissions
                            continue as long as customers remain active—no income caps, automated payouts, and a model built for long-term retention and volume.
                        </p>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-5 sm:gap-6'>
                        {plans.map((plan, index) => (
                            <div key={plan.title} className='group animate-slide-in-left' style={{ animationDelay: `${index * 200}ms` }}>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl h-full'>
                                    <CardHeader className='p-6 sm:p-8'>
                                        <div className='flex flex-col gap-4'>
                                            <div className='flex items-start justify-between gap-4'>
                                                <div className='flex items-center space-x-4'>
                                                    <div
                                                        className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                                    >
                                                        <plan.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                                    </div>
                                                    <div>
                                                        <CardTitle className='text-lg sm:text-xl font-bold text-white'>{plan.title}</CardTitle>
                                                        <p className='text-xs sm:text-sm text-gray-400'>{plan.kicker}</p>
                                                    </div>
                                                </div>

                                                <div className='text-right'>
                                                    <div className='text-2xl sm:text-3xl font-black text-[#4cc7e8]'>{plan.priceMonthly}</div>
                                                    <div className='text-xs sm:text-sm text-gray-400'>{plan.commission}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className='px-6 py-6 sm:px-8 pt-0 space-y-6'>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{plan.description}</p>

                                        <ul className='space-y-2 text-sm sm:text-base text-gray-300'>
                                            {plan.highlights.map((item) => (
                                                <li key={item} className='flex gap-3'>
                                                    <span className='mt-2 h-2 w-2 rounded-full bg-[#4cc7e8]' />
                                                    <span className='leading-relaxed'>{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className='flex flex-col sm:flex-row gap-3 pt-2'>
                                            <AuthModalTrigger
                                                buttonText={plan.cta.joinText}
                                                defaultView='signup'
                                                sourceRoute='/affiliate'
                                                redirectAfterLogin={plan.cta.joinRedirect}
                                                redirectAfterSignup={plan.cta.joinRedirect}
                                            >
                                                <Button
                                                    size='lg'
                                                    className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 py-5 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full cursor-pointer'
                                                >
                                                    {plan.cta.joinText}
                                                    <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                                </Button>
                                            </AuthModalTrigger>

                                            <Link href={plan.cta.learnHref} className='w-full'>
                                                <Button
                                                    size='lg'
                                                    variant='outline'
                                                    className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 py-5 text-base sm:text-lg font-bold transition-all duration-300 rounded-lg bg-transparent cursor-pointer w-full'
                                                >
                                                    <Clock className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                                    Learn More
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Referral Program */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-10 sm:mb-14'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            Referral Program
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Stack <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Monthly</span> Bonuses
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            In addition to standard commissions, Lightning offers a recurring referral bonus program to increase total monthly earnings.
                            Affiliates earn <span className='text-white font-semibold'>$100 per month for every 10 products sold</span>, paid on an ongoing
                            basis. These bonuses stack and remain active as long as referred customers continue their subscriptions—simple, transparent, and
                            performance-based.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-6 sm:gap-8'>
                        <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 rounded-2xl'>
                            <CardContent className='p-6 sm:p-8'>
                                <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg'>
                                    <Users className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                </div>
                                <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4'>$100 / month bonus</h3>
                                <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>
                                    Earn a recurring $100/month bonus for every 10 products sold—bonuses stack as your volume grows.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 rounded-2xl'>
                            <CardContent className='p-6 sm:p-8'>
                                <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg'>
                                    <Rocket className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                </div>
                                <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4'>Stacks with commissions</h3>
                                <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>
                                    Referral bonuses are separate from direct commissions—adding a second layer of recurring revenue.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 rounded-2xl'>
                            <CardContent className='p-6 sm:p-8'>
                                <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg'>
                                    <BarChart3 className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                </div>
                                <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4'>Long-term compounding</h3>
                                <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>
                                    Bonuses remain active as long as referred customers stay subscribed—built for retention and growth.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Why Join Our Program */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            Why Join Our Program
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Built for <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Recurring</span> Growth
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                            Lightning combines real products, automation, and analytics into one unified affiliate ecosystem—so you can focus on traffic and
                            conversions while the system handles tracking, reporting, and payouts.
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
                                        <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-[#4cc7e8] transition-colors duration-300'>
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

            {/* Final CTA with Lottie */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 sm:gap-16 items-center'>
                        <div className='space-y-6 sm:space-y-8'>
                            <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                Ready to Get Started?
                            </Badge>
                            <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Choose Your <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Affiliate</span> Level
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                Choose the affiliate level that fits your goals and earning strategy. Both options include the same tools, tracking, and
                                referral bonuses.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2'>
                                <AuthModalTrigger
                                    buttonText='Join Basic'
                                    defaultView='signup'
                                    sourceRoute='/affiliate'
                                    redirectAfterLogin='/pricing'
                                    redirectAfterSignup='/pricing'
                                >
                                    <Button
                                        size='lg'
                                        className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] cursor-pointer'
                                    >
                                        <Users className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Join Basic
                                        <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </AuthModalTrigger>

                                <AuthModalTrigger
                                    buttonText='Join Max'
                                    defaultView='signup'
                                    sourceRoute='/affiliate'
                                    redirectAfterLogin='/pricing'
                                    redirectAfterSignup='/pricing'
                                >
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg bg-transparent cursor-pointer w-full sm:w-[300px]'
                                    >
                                        <Target className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Join Max
                                    </Button>
                                </AuthModalTrigger>
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
