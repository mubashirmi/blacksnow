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

// ⬇️ import the trigger helper from your new modal
import { AuthModalTrigger } from '@/components/AuthModal';

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
            amount: '$5/Month',
            description: 'Promote our newsletter and earn a recurring $5 commission for each new subscriber.',
            icon: Mail,
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
            period: 'or $40/Year',
        },
        {
            title: 'Basic Digital Billboard',
            amount: '$75/Month',
            description: 'Generate a steady stream of income with $125 monthly for each Basic Digital Billboard you refer.',
            icon: Monitor,
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
            period: 'or $300/Year',
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
        // Check localStorage for userId and roles
        const storedUserId = localStorage.getItem('userId');
        const storedRoles = localStorage.getItem('roles');
        const roles = storedRoles ? JSON.parse(storedRoles) : [];

        // Show dashboard button only if userId exists and 'Affiliate' is in roles
        setShowDashboardButton(!!storedUserId && Array.isArray(roles) && roles.includes('Affiliate'));
    }, []);

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hero Section */}
            <section className='relative py-32 px-8'>
                <div className='container mx-auto max-w-7xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-20 items-center'>
                        {/* Left Content */}
                        <div className='space-y-12 animate-slide-in-left'>
                            <div>
                                <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-8 px-8 py-3 text-sm font-bold'>
                                    EARN UNLIMITED COMMISSIONS
                                </Badge>
                                <h1 className='text-6xl lg:text-7xl font-black text-white mb-8 leading-tight'>
                                    Join Our{' '}
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Affiliate</span>
                                    <br />
                                    Program
                                </h1>
                                <div className='w-32 h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-8'></div>
                                <p className='text-xl text-gray-300 leading-relaxed max-w-2xl'>
                                    Sign up as an affiliate and earn <span className='text-[#4cc7e8] font-semibold'>unlimited commission</span> for each RSVP
                                    and monthly residual income for each site advertisement sign up. Gain commissions and monthly residual income while working
                                    from home on a laptop, computer or mobile device anywhere around the world.{' '}
                                    <span className='text-[#2c7bbe] font-semibold'>It&apos;s quick and easy to get started.</span>
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className='grid grid-cols-2 gap-6'>
                                <div className='text-center p-6 bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl border border-[#2c7bbe]/20'>
                                    <div className='text-4xl font-black text-[#4cc7e8] mb-2'>50%</div>
                                    <div className='text-gray-400 font-semibold'>Commission Rate</div>
                                </div>
                                <div className='text-center p-6 bg-gradient-to-r from-[#4cc7e8]/10 to-[#2a8dcc]/10 rounded-2xl border border-[#4cc7e8]/20'>
                                    <div className='text-4xl font-black text-[#2c7bbe] mb-2'>$250</div>
                                    <div className='text-gray-400 font-semibold'>Per RSVP</div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className='flex flex-col sm:flex-row gap-6 pt-8'>
                                {/* ⬇️ REPLACED Link to /login?signup with modal trigger */}
                                <AuthModalTrigger
                                    buttonText='Join Now'
                                    defaultView='signup'
                                    sourceRoute='/affiliate'
                                    redirectAfterLogin='/affiliate'
                                    redirectAfterSignup='/pricing'
                                >
                                    <Button
                                        size='lg'
                                        className='cursor-pointer group bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-12 py-6 text-lg font-bold shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105'
                                    >
                                        <Users className='w-6 h-6 mr-3' />
                                        Join Now
                                        <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </AuthModalTrigger>

                                {showDashboardButton && (
                                    <Link href={'/affiliate/dashboard/kpi'}>
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            className='cursor-pointer border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-12 py-6 text-lg font-bold transition-all duration-300 transform hover:scale-105'
                                        >
                                            <BarChart3 className='w-6 h-6 mr-3' />
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

            {/* Commission Tiers Section */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                            COMMISSION STRUCTURE
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6 animate-slide-in-up'>
                            Earn <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Big Commissions</span>
                        </h2>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            Multiple revenue streams with competitive rates and recurring income opportunities.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                        {commissionTiers.map((tier, index) => (
                            <Card
                                key={index}
                                className='group relative bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-xl overflow-hidden transform hover:scale-105 animate-fade-in-up'
                                style={{ animationDelay: `${index * 200}ms` }}
                            >
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${tier.color}`}></div>

                                <CardHeader className='p-4 sm:p-6'>
                                    <div className='flex flex-col sm:flex-row items-center justify-between mb-2 sm:mb-4'>
                                        <div className='flex items-center space-x-3 sm:space-x-4'>
                                            <div
                                                className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${tier.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                            >
                                                <tier.icon className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
                                            </div>
                                            <div>
                                                <CardTitle className='text-lg sm:text-2xl font-bold text-white'>{tier.title}</CardTitle>
                                                <div className='text-gray-400 text-xs sm:text-sm'>{tier.period}</div>
                                            </div>
                                        </div>
                                        <div className='text-right mt-2 sm:mt-0'>
                                            <div className='text-2xl sm:text-4xl font-black text-[#4cc7e8]'>{tier.amount}</div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className='p-4 sm:p-6 pt-0'>
                                    <p className='text-gray-300 text-sm sm:text-base leading-relaxed text-wrap'>{tier.description}</p>
                                </CardContent>

                                <div
                                    className={`absolute inset-0 bg-gradient-to-r ${tier.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                                ></div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                            PROGRAM BENEFITS
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6 animate-slide-in-up'>
                            Why Choose Our <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Affiliate Program</span>
                        </h2>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            Everything you need to succeed as an affiliate partner with comprehensive tools and support.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-8'>
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-2xl overflow-hidden transform hover:scale-105 animate-fade-in-up'
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                <CardContent className='relative p-8'>
                                    <div className='w-16 h-16 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
                                        <feature.icon className='w-8 h-8 text-white' />
                                    </div>
                                    <h3 className='text-xl font-bold text-white mb-4 group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-gray-300 leading-relaxed'>{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section with Lottie Animation */}
            <section className='relative py-20 px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-6xl'>
                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        {/* Left Content */}
                        <div className='space-y-6'>
                            <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-4 px-6 py-2 text-sm font-bold'>
                                START EARNING TODAY
                            </Badge>
                            <h2 className='text-4xl lg:text-5xl font-black text-white mb-4'>
                                Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Start Earning</span>
                                <br />
                                Commissions?
                            </h2>
                            <p className='text-lg text-gray-300 leading-relaxed'>
                                Join our affiliate program today and start earning unlimited commissions with industry-leading rates and comprehensive support.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
                                {/* ⬇️ REPLACED Link to /login?signup with modal trigger */}
                                <AuthModalTrigger
                                    buttonText='Join Now'
                                    defaultView='signup'
                                    sourceRoute='/affiliate'
                                    redirectAfterLogin='/affiliate'
                                    redirectAfterSignup='/pricing'
                                >
                                    <Button
                                        size='lg'
                                        className='cursor-pointer group bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-10 py-4 text-lg font-bold shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105'
                                    >
                                        <Users className='w-5 h-5 mr-2' />
                                        Join Now
                                        <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </AuthModalTrigger>

                                <Link href={'/about'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='cursor-pointer border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-10 py-4 text-lg font-bold transition-all duration-300 transform hover:scale-105 bg-transparent'
                                    >
                                        <Clock className='w-5 h-5 mr-2' />
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Lottie Animation */}
                        <div className='flex items-center justify-center'>
                            <div className='relative'>
                                <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full blur-2xl'></div>
                                <div className='relative w-80 h-80 flex items-center justify-center'>
                                    <LottieAnimation
                                        src='/animations/affiliateicon.json'
                                        loop={true}
                                        autoplay={true}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export { Affiliate };
