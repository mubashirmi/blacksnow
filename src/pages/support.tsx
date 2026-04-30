import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FeedbackUnsubscribeButtons } from '@/components/unsubscribe-flow';
import lottie from 'lottie-web';
import { AlertTriangle, CheckCircle, Clock, CreditCard, Eye, Headphones, Mail, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function Page() {
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

    const supportFeatures = [
        {
            icon: Users,
            title: 'Personalized Assistance',
            description:
                "Every customer's needs are unique. Our support specialists are trained to provide clear, tailored guidance so you always understand your options.",
        },
        {
            icon: Clock,
            title: 'Quick Response Times',
            description: "We know that time matters. That's why we strive to respond to all inquiries as quickly as possible.",
        },
        {
            icon: Eye,
            title: 'Transparency & Clarity',
            description:
                'We take the guesswork out of subscriptions by explaining your benefits, billing details, and plan information in simple, straightforward terms.',
        },
        {
            icon: Headphones,
            title: 'Multi-Channel Support',
            description: "You can reach us through phone, email, or live chat. No matter your preference, you'll receive the same high level of service.",
        },
    ];

    const subscriptionSteps = [
        {
            icon: CreditCard,
            title: 'Convenient Access',
            description: 'For your convenience, we provide an Unsubscribe button right here on the Support page.',
        },
        {
            icon: Mail,
            title: 'Email Integration',
            description: "You'll also find the same button included in every billing email.",
        },
        {
            icon: CheckCircle,
            title: 'Immediate Review',
            description: 'Clicking Unsubscribe lets you securely review the products connected to your account.',
        },
        {
            icon: Shield,
            title: 'Account Verification',
            description: 'Before showing subscription details, we verify your login so your product information stays protected.',
        },
    ];

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Background System - Aligned with Billboard */}
            <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute -top-96 -right-96 w-[800px] h-[800px] bg-gradient-to-br from-[#4cc7e8]/20 via-[#2c7bbe]/10 to-transparent rounded-full blur-3xl opacity-30'></div>
                <div className='absolute top-1/3 -left-96 w-[600px] h-[600px] bg-gradient-to-tr from-[#2c7bbe]/15 via-[#4cc7e8]/8 to-transparent rounded-full blur-3xl opacity-20'></div>
                <div className='absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#4cc7e8]/10 via-[#2c7bbe]/5 to-transparent rounded-full blur-3xl opacity-15'></div>

                <div className='absolute inset-0 opacity-5'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `linear-gradient(rgba(44, 123, 190, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 123, 190, 0.1) 1px, transparent 1px)`,
                            backgroundSize: '100px 100px',
                        }}
                    ></div>
                </div>
            </div>

            {/* Feedback & Subscription Controls */}
            <section className='relative pt-10 sm:pt-16 pb-8 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border-2 border-red-500/30 shadow-2xl shadow-red-500/20 max-w-5xl mx-auto animate-slide-in-up overflow-hidden'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800 rounded-t-3xl'></div>

                        <div className='flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6'>
                            <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                                <AlertTriangle className='w-7 h-7 sm:w-8 sm:h-8 text-red-500' />
                            </div>

                            <div className='flex-1'>
                                <h3 className='text-xl sm:text-2xl font-black text-white mb-4'>Manage Feedback & Subscription Access</h3>

                                <p className='text-sm sm:text-base text-gray-300 mb-6 leading-relaxed'>
                                    Share feedback with our team or review your current product access. If you need to unsubscribe, we will first verify your
                                    account and then show the products connected to your profile.
                                </p>

                                <FeedbackUnsubscribeButtons size='section' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How We Support You */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Elite Customer Care</span>
                        </h2>

                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Whether you need help understanding your account, managing your payments, or making changes to your plan, our dedicated support team
                            is here for you.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8'>
                        {supportFeatures.map((feature, index) => (
                            <div key={index} className='group animate-slide-in-left' style={{ animationDelay: `${index * 200}ms` }}>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    <CardContent className='p-6 sm:p-8 text-center flex flex-col h-full'>
                                        <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
                                            <feature.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                        </div>

                                        <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4'>{feature.title}</h3>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed flex-1'>{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Managing Your Subscription */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Flexible Plans</span>
                        </h2>

                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            We offer flexible monthly and annual plans, giving you the freedom to choose what works best for you.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16'>
                        {subscriptionSteps.map((step, index) => (
                            <div key={index} className='group animate-slide-in-up' style={{ animationDelay: `${index * 150}ms` }}>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    <CardContent className='p-6'>
                                        <div className='w-12 h-12 bg-gradient-to-r from-[#4cc7e8]/20 to-[#2c7bbe]/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-[#4cc7e8]/30 group-hover:to-[#2c7bbe]/30 transition-all duration-300'>
                                            <step.icon className='w-6 h-6 text-[#4cc7e8]' />
                                        </div>

                                        <h3 className='text-lg font-bold text-white mb-2'>{step.title}</h3>
                                        <p className='text-sm text-gray-300 leading-relaxed'>{step.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* <div className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border-2 border-amber-500/30 shadow-2xl shadow-amber-500/20 max-w-5xl mx-auto animate-slide-in-up delay-600 overflow-hidden'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-3xl'></div>

                        <div className='flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6'>
                            <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                                <AlertTriangle className='w-7 h-7 sm:w-8 sm:h-8 text-amber-500' />
                            </div>

                            <div className='flex-1'>
                                <h3 className='text-xl sm:text-2xl font-black text-white mb-4'>Need to Unsubscribe Your Plan?</h3>

                                <p className='text-sm sm:text-base text-gray-300 mb-6 leading-relaxed'>
                                    If you unsubscribe your plan, you can always log back into your account or contact our support team for assistance. We will
                                    securely verify your login before showing your product access.
                                </p>

                                <div className='flex flex-col sm:flex-row gap-4 mt-[1px]'>
                                    <FeedbackUnsubscribeButtons size='section' />
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </section>

            {/* Our Commitment */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 sm:gap-16 items-center'>
                        <div className='space-y-6 sm:space-y-8'>
                            <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Our&nbsp;
                                <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Commitment</span>
                                <br />
                            </h2>

                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                Your trust means everything to us. We promise to deliver exceptional customer service and to handle every request—whether big or
                                small—with professionalism and care.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-5 pt-4'>
                                <Link href={'/faq'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg bg-transparent cursor-pointer w-full sm:w-[300px]'
                                    >
                                        Were here to support you
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className='flex items-center justify-center'>
                            <div className='w-full h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/supportpage.json' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
