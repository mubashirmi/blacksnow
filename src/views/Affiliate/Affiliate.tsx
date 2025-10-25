import { AuthModalTrigger } from '@/components/AuthModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import lottie from 'lottie-web';
import {
    ArrowRight,
    Award,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    Globe,
    Mail,
    Megaphone,
    Monitor,
    Share2,
    Target,
    Users,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function Affiliate() {
    const [showDashboardButton, setShowDashboardButton] = useState(false);

    const LottieAnimation = ({ src, loop, autoplay, style }) => {
        const containerRef = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            if (containerRef.current) {
                const animation = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop,
                    autoplay,
                    path: src,
                });
                return () => animation.destroy();
            }
        }, [src, loop, autoplay]);

        return <div ref={containerRef} style={style} />;
    };

    const commissionTiers = [
        {
            title: 'RSVP Commissions',
            amount: '$250',
            description: 'Receive a $150 commission for every confirmed RSVP generated through your referral link.',
            icon: Calendar,
            color: 'from-[#4cc7e8] to-[#2c7bbe]',
            period: 'per RSVP',
        },
        {
            title: 'Newsletter Subscriptions',
            amount: '$10/Month',
            description: 'Promote our newsletter and earn a recurring $5 commission for each new subscriber.',
            icon: Mail,
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
            period: 'or $50/Year',
        },
        {
            title: 'Basic Digital Billboard',
            amount: '$150/Month',
            description: 'Generate a steady stream of income with $125 monthly for each Basic Digital Billboard you refer.',
            icon: Monitor,
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
            period: 'or $600/Year',
        },
        {
            title: 'Premium Email/SMS Systems',
            amount: '$500/Month',
            description: 'Secure a significant monthly commission of $350 for each Premium Digital Billboard referral.',
            icon: Megaphone,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
            period: 'or $4000/Year',
        },
    ];

    const features = [
        {
            title: 'Competitive Commission Rates',
            description: 'Earn an attractive 50% industry-leading commissions on every sale or lead generated through your referral links.',
            icon: DollarSign,
        },
        {
            title: 'Complete Our Simple Online Application',
            description: 'Quickly submit your application through our streamlined online form to get started.',
            icon: CheckCircle,
        },
        {
            title: 'Real-Time Tracking',
            description: 'Access to a user-friendly dashboard to track clicks, conversions, and commissions in real time.',
            icon: BarChart3,
        },
        {
            title: 'Monthly Payouts',
            description: 'Receive regular, reliable payouts on a monthly basis after connecting your Stripe account.',
            icon: CreditCard,
        },
        {
            title: 'Marketing Tools and Resources',
            description: 'Access to banners, email templates, and other promotional materials to help you effectively promote our products.',
            icon: Target,
        },
        {
            title: 'No Traffic Restrictions',
            description: 'Run ads and promotions through various channels (social media, blogs, websites) without restrictions on traffic sources.',
            icon: Globe,
        },
        {
            title: 'Access Your Personalized Dashboard',
            description: 'Upon approval, receive a unique link to your landing page along with access to your performance dashboard.',
            icon: Eye,
        },
        {
            title: 'Promote Your Link Across Multiple Channels',
            description: 'Drive traffic by advertising your unique referral link on your preferred platforms.',
            icon: Megaphone,
        },
        {
            title: 'Share Your Link on Social Media',
            description: 'Leverage your social media presence to maximize exposure and drive engagement with your affiliate link.',
            icon: Share2,
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
            {/* Hero Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* Left Content */}
                        <div className='space-y-7 sm:space-y-8 md:space-y-10 animate-slide-in-left'>
                            <div>
                                <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                    EARN UNLIMITED COMMISSIONS
                                </Badge>
                                <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                                    Join Our{' '}
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Affiliate</span>{' '}
                                    <br />
                                    Program
                                </h1>
                                <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5'></div>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Sign up as an affiliate and earn <span className='text-[#4cc7e8] font-semibold'>unlimited commission</span> for each RSVP
                                    and monthly residual income for each site advertisement sign up. Gain commissions and monthly residual income while working
                                    from home on a laptop, computer or mobile device anywhere around the world.{' '}
                                    <span className='text-[#2c7bbe] font-semibold'>It&apos;s quick and easy to get started.</span>
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
                                            View Dashboard
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right Visual - Dollar Sign */}
                        <div className='relative animate-slide-in-right'>
                            <div className='relative flex items-center justify-center'>
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <div className='absolute w-80 h-80 border-4 border-[#4cc7e8]/20 rounded-full animate-spin-slow'></div>
                                    <div
                                        className='absolute w-64 h-64 border-4 border-[#2c7bbe]/30 rounded-full animate-spin-slow delay-1000'
                                        style={{ animationDirection: 'reverse' }}
                                    ></div>
                                    <div className='absolute w-48 h-48 border-4 border-[#2a8dcc]/40 rounded-full animate-spin-slow delay-2000'></div>
                                </div>

                                <div className='relative group'>
                                    <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse'></div>
                                    <div className='relative w-64 h-64 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] rounded-full border-8 border-[#4cc7e8]/30 flex items-center justify-center shadow-2xl shadow-[#2c7bbe]/40 transform group-hover:scale-110 transition-transform duration-500'>
                                        <DollarSign className='w-32 h-32 text-[#4cc7e8] animate-pulse' />
                                    </div>
                                </div>

                                <div className='absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl animate-float-slow'>
                                    <DollarSign className='min-w-8 min-h-8 text-white' />
                                </div>

                                <div className='absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl animate-float-slow delay-1000'>
                                    <Award className='min-w-10 min-h-10 text-white' />
                                </div>

                                <div className='absolute top-8 -right-12 w-12 h-12 bg-gradient-to-br from-[#4cc7e8] to-[#2c7bbe] rounded-xl flex items-center justify-center shadow-xl animate-float-slow delay-500'>
                                    <Zap className='min-w-6 min-h-6 text-white' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Commission Tiers */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            COMMISSION STRUCTURE
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Earn <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Big Commissions</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Multiple revenue streams with competitive rates and recurring income opportunities.
                        </p>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-5 sm:gap-6'>
                        {commissionTiers.map((tier, index) => (
                            <div key={index} className='group animate-slide-in-left' style={{ animationDelay: `${index * 200}ms` }}>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    {/* <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${tier.color}`}></div> */}
                                    <CardHeader className='p-6 sm:p-8'>
                                        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                                            <div className='flex items-center space-x-4'>
                                                <div
                                                    className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${tier.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                                >
                                                    <tier.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                                </div>
                                                <div>
                                                    <CardTitle className='text-lg sm:text-xl font-bold text-white'>{tier.title}</CardTitle>
                                                    <p className='text-xs sm:text-sm text-gray-400'>{tier.period}</p>
                                                </div>
                                            </div>
                                            <div className='text-3xl sm:text-4xl font-black text-[#4cc7e8]'>{tier.amount}</div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className='p-6 sm:p-8 pt-0'>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{tier.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            PROGRAM BENEFITS
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Why Choose Our <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Affiliate Program</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Everything you need to succeed as an affiliate partner with comprehensive tools and support.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-6 sm:gap-8'>
                        {features.map((feature, index) => (
                            <div key={index} className='group animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
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

            {/* CTA with Lottie */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 sm:gap-16 items-center'>
                        <div className='space-y-6 sm:space-y-8'>
                            <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                START EARNING TODAY
                            </Badge>
                            <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Start Earning</span>
                                <br />
                                Commissions?
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                Join our affiliate program today and start earning unlimited commissions with industry-leading rates and comprehensive support.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-5 pt-4'>
                                <AuthModalTrigger
                                    buttonText='Join Now'
                                    defaultView='signup'
                                    sourceRoute='/affiliate'
                                    redirectAfterLogin='/affiliate'
                                    redirectAfterSignup='/pricing'
                                >
                                    <Button
                                        size='lg'
                                        className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] cursor-pointer'
                                    >
                                        <Users className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Join Now
                                        <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </AuthModalTrigger>

                                <Link href={'/about'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg bg-transparent cursor-pointer w-full sm:w-[300px]'
                                    >
                                        <Clock className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className='flex items-center justify-center'>
                            <div className='w-96 h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/affiliateicon.json' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export { Affiliate };
