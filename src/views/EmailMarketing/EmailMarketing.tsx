'use client';

import AuthModal from '@/components/AuthModal';
import EmailCRMSlideshow from '@/components/EmailCRMSlideshow';
import { PricingComponent } from '@/components/PricingComponent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import lottie from 'lottie-web';
import { BarChart3, Calendar, Clock, Edit3, Globe, Megaphone, Send, Target, Users, Zap } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

function EmailMarketing() {
    // eslint-disable-next-line
    const [userId, setUserId] = useState<string | null>(null);
    const [slideshowOpen, setSlideshowOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [openPricingAfterAuth, setOpenPricingAfterAuth] = useState(false);

    const LottieAnimation = ({ src, loop = true, autoplay = true, style }) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const router = useRouter();

        useEffect(() => {
            setUserId(localStorage.getItem('userId'));
            const trackRefIdClick = async () => {
                const { refId } = router.query;
                if (refId) {
                    localStorage.setItem('referredby', refId as string);
                    try {
                        const currentUrl = `https://blacksnowholdings.com/emailMarketing`;
                        const response = await fetch(`/api/v2/clicks/?id=${refId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ productLink: currentUrl }),
                        });
                        if (response.ok) console.log('RefId click tracked successfully');
                        else console.error('Failed to track refId click');
                    } catch (error) {
                        console.error('Error tracking refId click:', error);
                    }
                }
            };

            if (router.isReady) trackRefIdClick();
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
                return () => animation.destroy();
            }
        }, [src, loop, autoplay]);

        return <div ref={containerRef} style={style} />;
    };

    const handlePurchaseClick = () => {
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') || localStorage.getItem('id') : null;

        if (storedUserId) {
            setAuthOpen(false);
            setOpenPricingAfterAuth(false);
            setPricingOpen(true);
            return;
        }

        setPricingOpen(false);
        setOpenPricingAfterAuth(false);
        setAuthOpen(true);
    };

    const handleAuthSuccess = () => {
        setPricingOpen(false);
        setOpenPricingAfterAuth(true);
        setAuthOpen(false);
        return false;
    };

    useEffect(() => {
        if (authOpen || !openPricingAfterAuth) return;

        const timer = window.setTimeout(() => {
            setOpenPricingAfterAuth(false);
            setPricingOpen(true);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [authOpen, openPricingAfterAuth]);

    const features = [
        {
            title: 'Email Campaigns & Automated Sequence',
            description: 'Launch broadcast emails and build automated flows that follow your timing, rules, and goals.',
            icon: Edit3,
            color: 'from-[#4cc7e8] to-[#2c7bbe]',
            benefits: ['Drag-and-drop email builder', 'Professional templates library', 'Mobile-responsive designs', 'Brand customization tools'],
        },
        {
            title: 'Build SMS Campaigns & Sequences',
            description: 'Create SMS broadcasts and automated message sequences that complement your email strategy.',
            icon: Send,
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
            benefits: ['Mass email distribution', 'SMS campaign management', 'Contact list segmentation', 'Delivery optimization'],
        },
        {
            title: 'SMS Chatbot',
            description: 'Guide customers efficiently with a responsive SMS chatbot.',
            icon: Calendar,
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
            benefits: ['Advanced scheduling options', 'Time zone optimization', 'Automated drip campaigns', 'Behavioral triggers'],
        },
        {
            title: 'List Upload Tool',
            description: 'Upload and organize your contacts instantly for clean segmentation and targeted outreach.',
            icon: Users,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
            benefits: ['Team collaboration tools', 'Role-based permissions', 'Shared campaign access', 'No user limits'],
        },
        {
            title: 'Email KPIs Dashboard',
            description: 'Track performance with clear data: deliveries, opens, clicks, and engagement metrics.',
            icon: Users,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
            benefits: ['Team collaboration tools', 'Role-based permissions', 'Shared campaign access', 'No user limits'],
        },
        {
            title: 'Email Scheduling Overview',
            description: 'View all scheduled emails in one simple timeline so you know exactly what’s going out next.',
            icon: Users,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
            benefits: ['Team collaboration tools', 'Role-based permissions', 'Shared campaign access', 'No user limits'],
        },
    ];

    const additionalFeatures = [
        {
            title: 'Consistent Delivery',
            description: 'Delivers consistent results with a clean, high-deliverability framework.',
            icon: Globe,
        },
        {
            title: 'Simplified Automation',
            description: 'Simplifies automation so you can work faster with fewer steps.',
            icon: Zap,
        },
        {
            title: 'Email + SMS Platform',
            description: 'Handles both email and SMS inside one streamlined platform.',
            icon: Megaphone,
        },
        {
            title: 'Real Performance Data',
            description: 'Shows real performance data so you always know what’s working.',
            icon: BarChart3,
        },
        {
            title: 'Easy Segmentation',
            description: 'Makes list uploads and segmentation effortless.',
            icon: Target,
        },
        {
            title: 'Organized Scheduling',
            description: 'Keeps your entire messaging schedule organized and predictable.',
            icon: Clock,
        },
    ];

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hero Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        {/* Left Content */}
                        <div className='space-y-10 animate-slide-in-left'>
                            <div>
                                <div className='inline-block'>
                                    <h1 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                                        Email/SMS{' '}
                                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>CRM</span>
                                    </h1>
                                </div>

                                <p className='text-md sm:text-lg text-gray-300 leading-relaxed max-w-2xl'>
                                    Our Combined Email/SMS CRM is designed for fast deployment, clean automation, and high deliverability. You can launch email
                                    campaigns and automated sequences in minutes with no technical setup. Upload your lists instantly and start messaging
                                    without complicated workflows. SMS tools combine with your email system to create a high-value communication strategy inside
                                    one simple dashboard. Run powerful outreach across email and SMS.{' '}
                                </p>
                            </div>

                            {/* Quick Stats */}

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    onClick={() => setSlideshowOpen(true)}
                                    size='lg'
                                    className='group bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px]'
                                >
                                    Learn more
                                </Button>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    variant='outline'
                                    className='border-2 cursor-pointer border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Purchase
                                </Button>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className='relative animate-slide-in-right '>
                            <div className='relative overflow-hidden '>
                                <div className='relative flex items-center justify-center w-full h-full'>
                                    <div className=' flex items-center justify-center w-full sm:w-fit rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                        <LottieAnimation
                                            src='/animations/emailmarketing-herosection-page.json'
                                            className='w-[90%] h-full sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:min-w-[950px] lg:h-[750px]'
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

            {/* Main Features */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Powerful <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Email Marketing</span>
                            <br />
                            Capabilities
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Everything you need to create, send, and optimize your email marketing campaigns for maximum impact and engagement.
                        </p>
                    </div>

                    <div className='grid lg:grid-cols-2 gap-6 sm:gap-8= items-stretch'>
                        {features.map((feature, index) => (
                            <div key={index} className='group animate-slide-in-left h-full' style={{ animationDelay: `${index * 200}ms` }}>
                                <Card className='relative overflow-hidden bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl h-full flex flex-col min-h-[260px] sm:min-h-[300px] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#2c7bbe]/20'>
                                    <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${feature.color} opacity-60`} />

                                    <div className='pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#4cc7e8]/10 to-[#2c7bbe]/10' />

                                    {/* TOP (Icon + Title) */}
                                    <CardHeader className=''>
                                        <div
                                            className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            <feature.icon className='w-8 h-8 sm:w-9 sm:h-9 text-white' />
                                        </div>

                                        <CardTitle className='mt-6 text-2xl sm:text-3xl font-black text-white group-hover:text-[#4cc7e8] transition-colors duration-300 leading-tight'>
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>

                                    {/* BOTTOM (Description pinned) */}
                                    <CardContent className=''>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed max-w-md '>{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Why Choose Our Digital{' '}
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Email/SMS CRM </span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Take your email marketing to the next level with advanced features designed for professional marketers and growing businesses.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
                        {additionalFeatures.map((feature, index) => (
                            <div key={index} className='group animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    <CardContent className='p-6 sm:p-8 text-center'>
                                        <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
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

            {/* Final CTA */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        <div>
                            <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Start <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Automating</span>
                                <br />
                                Today
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-5'>
                                Get your email and SMS campaigns running in minutes with a fast, powerful CRM built for growth..
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4'>
                                <Button
                                    size='lg'
                                    onClick={() => setSlideshowOpen(true)}
                                    className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px]'
                                >
                                    Learn More
                                </Button>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    variant='outline'
                                    className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] bg-transparent'
                                >
                                    Purchase
                                </Button>
                            </div>
                        </div>

                        <div className='flex justify-center'>
                            <div className='relative'>
                                <div className='absolute inset-0 w-96 h-96 rounded-full blur-2xl'></div>
                                <div className='relative w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center shadow-2xl backdrop-blur-xl p-8'>
                                    <LottieAnimation src='/animations/emailmarketingicon.json' loop={true} autoplay={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <EmailCRMSlideshow open={slideshowOpen} onOpenChange={setSlideshowOpen} />

            {authOpen && (
                <AuthModal
                    open={authOpen}
                    onOpenChange={(open) => {
                        setAuthOpen(open);
                        if (open) setPricingOpen(false);
                    }}
                    defaultView='signin'
                    sourceRoute='/emailMarketing'
                    onSuccess={handleAuthSuccess}
                />
            )}

            {!authOpen && <PricingComponent name='EmailMarketing' asModal open={pricingOpen} onOpenChange={setPricingOpen} />}
        </div>
    );
}

export { EmailMarketing };
