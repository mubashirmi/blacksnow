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
            {/* Feedback & Subscription Controls */}
            <section className='relative pt-10 sm:pt-16 pb-8 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='relative bg-[#0C0F18] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border-2 border-[#414A5D] max-w-5xl mx-auto animate-slide-in-up overflow-hidden'>
                        <div className='flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6'>
                            <div className='w-14 h-14 sm:w-16 sm:h-16 bg-[#414A5D]/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                                <AlertTriangle className='w-7 h-7 sm:w-8 sm:h-8 text-[#6D83B2]' />
                            </div>

                            <div className='flex-1'>
                                <h3 className='text-xl sm:text-2xl font-black text-white mb-4 leading-[1.25]'>Manage Feedback & Subscription Access</h3>

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
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-white mb-4 sm:mb-5'>
                            <span className=' text-[#4333AF] '>Elite Customer Care</span>
                        </h2>

                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Whether you need help understanding your account, managing your payments, or making changes to your plan, our dedicated support team
                            is here for you.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8'>
                        {supportFeatures.map((feature, index) => (
                            <div key={index} className='group animate-slide-in-left' style={{ animationDelay: `${index * 200}ms` }}>
                                <Card className='bg-[#0C0F18] border-2 border-[#414A5D] hover:border-[#4333AF]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    <CardContent className='p-6 sm:p-8 text-center flex flex-col h-full'>
                                        <div className='w-14 h-14 sm:w-16 sm:h-16 bg-[#4333AF] rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
                                            <feature.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                        </div>

                                        <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 leading-[1.28]'>{feature.title}</h3>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed flex-1'>{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Managing Your Subscription */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            <span className=' text-[#4333AF] '>Flexible Plans</span>
                        </h2>

                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            We offer flexible monthly and annual plans, giving you the freedom to choose what works best for you.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16'>
                        {subscriptionSteps.map((step, index) => (
                            <div key={index} className='group animate-slide-in-up' style={{ animationDelay: `${index * 150}ms` }}>
                                <Card className='bg-[#0C0F18] border border-[#414A5D] hover:border-[#4333AF]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    <CardContent className='p-6'>
                                        <div className='w-12 h-12 bg-[#4333AF]/15 rounded-xl flex items-center justify-center mb-4 group-hover:from-[#4333AF]/30 group-hover:to-[#6350C6]/30 transition-all duration-300'>
                                            <step.icon className='w-6 h-6 text-[#4333AF]' />
                                        </div>

                                        <h3 className='text-lg font-bold text-white mb-2 leading-[1.28]'>{step.title}</h3>
                                        <p className='text-sm text-gray-300 leading-relaxed'>{step.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* <div className='relative bg-[#0C0F18] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border-2 border-amber-500/30 shadow-2xl shadow-amber-500/20 max-w-5xl mx-auto animate-slide-in-up delay-600 overflow-hidden'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-amber-700 rounded-t-3xl'></div>

                        <div className='flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6'>
                            <div className='w-14 h-14 sm:w-16 sm:h-16 bg-amber-500/15 rounded-2xl flex items-center justify-center flex-shrink-0'>
                                <AlertTriangle className='w-7 h-7 sm:w-8 sm:h-8 text-amber-500' />
                            </div>

                            <div className='flex-1'>
                                <h3 className='text-xl sm:text-2xl font-black text-white mb-4 leading-[1.25]'>Need to Unsubscribe Your Plan?</h3>

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
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 sm:gap-16 items-center'>
                        <div className='space-y-6 sm:space-y-8'>
                            <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                Our&nbsp;
                                <span className=' text-[#4333AF] '>Commitment</span>
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
                                        className='border-2 border-[#414A5D] text-white hover:bg-[#4333AF] hover:text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg bg-transparent cursor-pointer w-full sm:w-[300px]'
                                    >
                                        Were here to support you
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className='flex items-center justify-center'>
                            <div className='w-full h-80 sm:w-96 sm:h-96 bg-[#0C0F18] rounded-3xl border border-[#414A5D] flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/supportpage.json' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
