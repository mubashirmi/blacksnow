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
    Edit3,
    Globe,
    Mail,
    MessageSquare,
    Send,
    Settings,
    Shield,
    Target,
    Users,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

function EmailMarketing() {
    const LottieAnimation = ({ src, loop, autoplay, style }) => {
        const containerRef = useRef(null);

        const router = useRouter();

        useEffect(() => {
            const trackRefIdClick = async () => {
                // Get the refId from URL query parameters
                const { refId } = router.query;
                localStorage.setItem('referredby', refId);

                if (refId) {
                    try {
                        // Get current URL without query parameters
                        const currentUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

                        const response = await fetch(`/api/v2/clicks/?id=${refId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                productLink: currentUrl,
                            }),
                        });

                        if (response.ok) {
                            console.log('RefId click tracked successfully');
                        } else {
                            console.error('Failed to track refId click');
                        }
                    } catch (error) {
                        console.error('Error tracking refId click:', error);
                    }
                }
            };

            // Only track when router is ready (to ensure query params are available)
            if (router.isReady) {
                trackRefIdClick();
            }
        }, [router.isReady, router.query]);

        useEffect(() => {
            if (containerRef.current) {
                const animation = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop,
                    autoplay,
                    path: src,
                });

                return () => animation.destroy(); // Cleanup
            }
        }, [src, loop, autoplay]);

        return <div ref={containerRef} style={style} />;
    };

    const features = [
        {
            title: 'Create Custom Emails/SMS',
            description: 'Design personalized, eye-catching email campaigns with an easy-to-use editor, tailored to your audience.',
            icon: Edit3,
            color: 'from-[#4cc7e8] to-[#2c7bbe]',
            benefits: ['Drag-and-drop email builder', 'Professional templates library', 'Mobile-responsive designs', 'Brand customization tools'],
        },
        {
            title: 'Send Emails/SMS in Bulk',
            description: 'Reach a large number of subscribers at once with the ability to send emails in bulk, ensuring maximum outreach.',
            icon: Send,
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
            benefits: ['Mass email distribution', 'SMS campaign management', 'Contact list segmentation', 'Delivery optimization'],
        },
        {
            title: 'Schedule Campaigns',
            description: 'Plan ahead by scheduling your email campaigns for future dates and times, optimizing engagement based on audience behavior.',
            icon: Calendar,
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
            benefits: ['Advanced scheduling options', 'Time zone optimization', 'Automated drip campaigns', 'Behavioral triggers'],
        },
        {
            title: 'Unlimited Users',
            description:
                'Easily manage your team by adding unlimited users to your account for a single monthly fee, allowing everyone to collaborate and contribute to your email campaigns without restrictions.',
            icon: Users,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
            benefits: ['Team collaboration tools', 'Role-based permissions', 'Shared campaign access', 'No user limits'],
        },
    ];

    const additionalFeatures = [
        {
            title: 'Advanced Analytics',
            description: 'Track open rates, click-through rates, and conversion metrics in real-time.',
            icon: BarChart3,
        },
        {
            title: 'A/B Testing',
            description: 'Optimize your campaigns with split testing for subject lines and content.',
            icon: Target,
        },
        {
            title: 'Automation Workflows',
            description: 'Set up automated email sequences based on user behavior and triggers.',
            icon: Zap,
        },
        {
            title: 'Global Delivery',
            description: 'Reliable email delivery worldwide with high deliverability rates.',
            icon: Globe,
        },
        {
            title: 'GDPR Compliance',
            description: 'Built-in compliance tools to meet international data protection standards.',
            icon: Shield,
        },
        {
            title: '24/7 Support',
            description: 'Round-the-clock customer support to help you succeed with your campaigns.',
            icon: Award,
        },
    ];

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hero Section */}
            <section className='relative pb-12 sm:pb-16 pt-16 sm:pt-20 md:pt-24 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-7xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-20 items-center'>
                        {/* Left Content */}
                        <div className='space-y-12 animate-slide-in-left'>
                            <div>
                                <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-8 px-8 py-3 text-sm font-bold'>
                                    POWERFUL EMAIL MARKETING
                                </Badge>
                                <h1 className='text-5xl lg:text-6xl font-black text-white mb-3 leading-tight'>
                                    Email Marketing{' '}
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Features</span>
                                </h1>
                                <div className='w-96 h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-8'></div>
                                <p className='text-xl text-gray-300 leading-relaxed max-w-2xl'>
                                    Transform your marketing strategy with our comprehensive email and SMS platform. Reach your audience effectively with{' '}
                                    <span className='text-[#4cc7e8] font-semibold'>personalized campaigns</span>, advanced automation, and powerful analytics
                                    that drive real results.
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className='grid grid-cols-3 gap-6'>
                                <div className='text-center p-6 bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl border border-[#2c7bbe]/20'>
                                    <div className='text-4xl font-black text-[#4cc7e8] mb-2'>99.9%</div>
                                    <div className='text-gray-400 font-semibold text-sm'>Delivery Rate</div>
                                </div>
                                <div className='text-center p-6 bg-gradient-to-r from-[#4cc7e8]/10 to-[#2a8dcc]/10 rounded-2xl border border-[#4cc7e8]/20'>
                                    <div className='text-4xl font-black text-[#2c7bbe] mb-2'>50K+</div>
                                    <div className='text-gray-400 font-semibold text-sm'>Emails/Hour</div>
                                </div>
                                <div className='text-center p-6 bg-gradient-to-r from-[#2a8dcc]/10 to-[#2c7bbe]/10 rounded-2xl border border-[#2a8dcc]/20'>
                                    <div className='text-4xl font-black text-[#4cc7e8] mb-2'>24/7</div>
                                    <div className='text-gray-400 font-semibold text-sm'>Support</div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className='flex flex-col sm:flex-row gap-6 pt-8'>
                                <Link href={'/login'}>
                                    <Button
                                        size='lg'
                                        className='group bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-12 py-6 text-lg font-bold shadow-xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105'
                                    >
                                        <Mail className='w-6 h-6 mr-3' />
                                        Join Now
                                        <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Visual - Large Email Icon */}
                        <div className='relative animate-slide-in-right'>
                            <div className='relative flex items-center justify-center'>
                                {/* Decorative Background Elements */}
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    {/* Animated Circles */}
                                    <div className='absolute w-96 h-96 border-4 border-[#4cc7e8]/20 rounded-full animate-spin-slow'></div>
                                    <div
                                        className='absolute w-80 h-80 border-4 border-[#2c7bbe]/30 rounded-full animate-spin-slow delay-1000'
                                        style={{ animationDirection: 'reverse' }}
                                    ></div>
                                    <div className='absolute w-64 h-64 border-4 border-[#2a8dcc]/40 rounded-full animate-spin-slow delay-2000'></div>

                                    {/* Floating Email Elements */}
                                    <div className='absolute -top-12 -left-12 w-16 h-16 bg-gradient-to-br from-[#4cc7e8]/90 to-[#2c7bbe]/90 rounded-2xl flex items-center justify-center shadow-2xl animate-float-slow'>
                                        <Send className='w-8 h-8 text-white' />
                                    </div>

                                    <div className='absolute -bottom-12 -right-12 w-20 h-20 bg-gradient-to-br from-[#2a8dcc]/90 to-[#4cc7e8]/90 rounded-2xl flex items-center justify-center shadow-2xl animate-float-slow delay-1000'>
                                        <MessageSquare className='w-10 h-10 text-white' />
                                    </div>

                                    <div className='absolute top-12 -right-16 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-xl animate-float-slow delay-500'>
                                        <CheckCircle className='w-6 h-6 text-white' />
                                    </div>

                                    <div className='absolute bottom-16 -left-16 w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-xl animate-float-slow delay-1500'>
                                        <Calendar className='w-7 h-7 text-white' />
                                    </div>
                                </div>

                                {/* Main Email Icon */}
                                <div className='relative group'>
                                    <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse'></div>
                                    <div className='relative w-80 h-80 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] rounded-3xl border-8 border-[#4cc7e8]/30 flex items-center justify-center shadow-xl shadow-[#2c7bbe]/40 transform group-hover:scale-110 transition-transform duration-500'>
                                        {/* Email Icon SVG */}
                                        <svg
                                            className='w-48 h-48 text-[#4cc7e8]'
                                            viewBox='0 0 200 200'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='4'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        >
                                            {/* Email Envelope */}
                                            <rect x='20' y='60' width='160' height='120' rx='8' className='animate-pulse' />
                                            {/* Email Flap */}
                                            <path d='M20 60 L100 120 L180 60' className='animate-pulse delay-300' />
                                            {/* Email Lines */}
                                            <line x1='40' y1='100' x2='80' y2='100' className='animate-pulse delay-500' />
                                            <line x1='40' y1='120' x2='120' y2='120' className='animate-pulse delay-700' />
                                            <line x1='40' y1='140' x2='100' y2='140' className='animate-pulse delay-900' />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Features Section */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                            CORE FEATURES
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6 animate-slide-in-up'>
                            Powerful <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Email Marketing</span>
                            <br />
                            Capabilities
                        </h2>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            Everything you need to create, send, and optimize your email marketing campaigns for maximum impact and engagement.
                        </p>
                    </div>

                    <div className='grid lg:grid-cols-2 gap-8'>
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className='group relative bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-3xl overflow-hidden transform hover:scale-105 animate-fade-in-up'
                                style={{ animationDelay: `${index * 200}ms` }}
                            >
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`}></div>

                                <CardHeader className='p-8'>
                                    <div className='flex items-center space-x-4 mb-6'>
                                        <div
                                            className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            <feature.icon className='w-8 h-8 text-white' />
                                        </div>
                                        <CardTitle className='text-3xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            {feature.title}
                                        </CardTitle>
                                    </div>
                                </CardHeader>

                                <CardContent className='p-8 pt-0 space-y-6'>
                                    <p className='text-xl text-gray-300 leading-relaxed'>{feature.description}</p>

                                    {/* Feature Benefits */}
                                    <div className='space-y-3'>
                                        {feature.benefits.map((benefit, benefitIndex) => (
                                            <div
                                                key={benefitIndex}
                                                className='flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 border border-[#2c7bbe]/20 group-hover:border-[#4cc7e8]/30 transition-all duration-300'
                                            >
                                                <CheckCircle className='w-5 h-5 text-green-400 flex-shrink-0' />
                                                <span className='text-gray-300 font-medium'>{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                <div
                                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                                ></div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features Section */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                            ADVANCED CAPABILITIES
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6 animate-slide-in-up'>
                            Enhanced <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Marketing Tools</span>
                        </h2>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            Take your email marketing to the next level with advanced features designed for professional marketers and growing businesses.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {additionalFeatures.map((feature, index) => (
                            <Card
                                key={index}
                                className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-2xl overflow-hidden transform hover:scale-105 animate-fade-in-up'
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                <CardContent className='relative p-8 text-center'>
                                    <div className='w-16 h-16 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
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

            {/* Call to Action Section with Mailbox Animation */}
            <section className='relative py-32 px-8 bg-[#0a0b0f]'>
                <div className='container mx-auto max-w-6xl'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        {/* Left Content */}
                        <div className='space-y-8'>
                            <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-4 px-6 py-2 text-sm font-bold'>
                                START YOUR CAMPAIGN TODAY
                            </Badge>
                            <h2 className='text-4xl lg:text-5xl font-black text-white mb-4'>
                                Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Transform</span>
                                <br />
                                Your Marketing?
                            </h2>
                            <p className='text-lg text-gray-300 leading-relaxed'>
                                Join thousands of successful businesses who have chosen our email marketing platform to drive engagement, increase conversions,
                                and grow their revenue.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
                                <Link href={'/login'}>
                                    <Button
                                        size='lg'
                                        className='group bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-10 py-4 text-lg font-bold transition-all duration-300 transform hover:scale-105'
                                    >
                                        <Mail className='w-5 h-5 mr-2' />
                                        Join Now
                                        <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </Link>
                                <Link href={'/pricing'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-10 py-4 text-lg font-bold transition-all duration-300 transform hover:scale-105 bg-transparent'
                                    >
                                        <Settings className='w-5 h-5 mr-2' />
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Animation */}
                        <div className='relative flex items-center justify-center'>
                            <div className='relative'>
                                {/* Background Circle */}
                                <div className='absolute inset-0 w-96 h-96 bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-full blur-2xl'></div>

                                {/* Mailbox Animation Container */}
                                <div className='relative w-96 h-96 flex items-center justify-center shadow-2xl'>
                                    <LottieAnimation src='/animations/emailmarketingicon.json' loop={true} autoplay={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export { EmailMarketing };
