import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ArrowRight, CheckCircle, Clock, CreditCard, Eye, Headphones, Mail, MessageCircle, Phone, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';

export default function Page() {
    const cookies = parseCookies();
    const id = cookies.id;
    const router = useRouter();

    const handlePricingClick = () => {
        router.push('/pricing');
    };

    const handleUnsubscribeClick = () => {
        router.push('/pricing');
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
            title: 'Immediate Action',
            description: 'Clicking Unsubscribe will immediately stop any future payments tied to your account.',
        },
        {
            icon: Shield,
            title: 'Confirmation',
            description: 'Once unsubscribed, you will receive a confirmation email so you have peace of mind knowing your payments have been canceled.',
        },
    ];

    const contactMethods = [
        {
            icon: Mail,
            title: 'Email Support',
            value: 'support@support.com',
            description: 'Get detailed help via email',
            action: 'Send Email',
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

            {/* Hero Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-[90rem] relative z-10'>
                    <div className='text-center max-w-8xl mx-auto'>
                        {/* Status Badge */}
                        <div className='inline-flex items-center space-x-3 bg-gradient-to-r from-[#2c7bbe]/10 via-[#4cc7e8]/20 to-[#2c7bbe]/10 backdrop-blur-2xl border border-[#2c7bbe]/30 rounded-full px-6 sm:px-8 py-2.5 sm:py-3 shadow-2xl shadow-[#2c7bbe]/20 animate-slide-in-up mb-4 sm:mb-5'>
                            <div className='relative'>
                                <div className='w-3 h-3 bg-[#4cc7e8] rounded-full'></div>
                            </div>
                            <span className='text-[#4cc7e8] font-bold text-xs sm:text-sm tracking-wider uppercase'>24/7 ELITE SUPPORT</span>
                            <Shield className='w-5 h-5 text-[#4cc7e8]' />
                        </div>

                        {/* Headline */}
                        <div className='space-y-6 sm:space-y-8 animate-slide-in-up delay-200'>
                            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight'>
                                <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                    We&apos;re Here to
                                </span>{' '}
                                <br />
                                <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Support You</span>
                            </h1>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto font-light'>
                                At <span className='text-[#4cc7e8] font-semibold'>Black Snow</span>, we believe that great service begins with putting our
                                customers first. Our priority is to ensure that every customer feels{' '}
                                <span className='text-white font-bold'>supported, informed, and confident</span> in the plan they choose with us.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-8 sm:pt-10 animate-slide-in-up delay-400'>
                            <Button
                                size='lg'
                                className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] cursor-pointer'
                            >
                                <MessageCircle className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                Start Live Chat
                                <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                            </Button>
                            <Button
                                size='lg'
                                variant='outline'
                                className='group border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] cursor-pointer'
                            >
                                <Phone className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                Call Support
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* How We Support You */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            HOW WE SUPPORT YOU
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
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
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            SUBSCRIPTION MANAGEMENT
                        </Badge>
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

                    <div className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border-2 border-amber-500/30 shadow-2xl shadow-amber-500/20 max-w-5xl mx-auto animate-slide-in-up delay-600'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-3xl'></div>
                        <div className='flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6'>
                            <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                                <AlertTriangle className='w-7 h-7 sm:w-8 sm:h-8 text-amber-500' />
                            </div>
                            <div className='flex-1'>
                                <h3 className='text-xl sm:text-2xl font-black text-white mb-4'>Need to Unsubscribe Your Plan?</h3>
                                <p className='text-sm sm:text-base text-gray-300 mb-6 leading-relaxed'>
                                    If you unsubscribe your plan, you can always log back into your account or contact our support team for assistance.
                                </p>
                                <div className='flex flex-col sm:flex-row gap-4'>
                                    {id ? (
                                        <Button
                                            className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 sm:px-8 py-3 text-base shadow-xl shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 rounded-lg cursor-pointer w-full sm:w-[300px]'
                                            onClick={handlePricingClick}
                                        >
                                            Pricing
                                        </Button>
                                    ) : (
                                        <Button
                                            className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-6 sm:px-8 py-3 text-base shadow-xl shadow-red-500/30 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] cursor-pointer'
                                            onClick={handleUnsubscribeClick}
                                        >
                                            <CreditCard className='mr-2 h-5 w-5' />
                                            Unsubscribe
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Methogfds */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            GET IN TOUCH
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Need Help?</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            We&apos;re here to support you every step of the way.
                        </p>
                    </div>

                    <div className='flex justify-center'>
                        {contactMethods.map((method, index) => (
                            <div key={index} className='group animate-slide-in-up max-w-md w-full' style={{ animationDelay: `${index * 200}ms` }}>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-3xl transform hover:scale-105 hover:-translate-y-2 shadow-2xl shadow-[#2c7bbe]/20 h-full flex flex-col'>
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe]'></div>
                                    <CardContent className='p-8 text-center flex-1 flex flex-col'>
                                        <div className='w-16 h-16 bg-gradient-to-br from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300'>
                                            <method.icon className='w-8 h-8 text-white' />
                                        </div>
                                        <h3 className='text-xl sm:text-2xl font-bold text-white mb-2'>{method.title}</h3>
                                        <p className='text-lg sm:text-xl font-bold text-[#4cc7e8] mb-2'>{method.value}</p>
                                        <p className='text-sm sm-sm sm:text-base text-gray-300 mb-6 flex-1'>{method.description}</p>
                                        <Button className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold py-3 text-base shadow-xl shadow-[#2c7bbe]/30 transition-all duration-300 transform hover:scale-105 rounded-lg w-full cursor-pointer'>
                                            {method.action}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Commitment */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='text-center max-w-5xl mx-auto'>
                        <div className='w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-slide-in-up'>
                            <Shield className='w-10 h-10 sm:w-12 sm:h-12 text-[#4cc7e8]' />
                        </div>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-[#4cc7e8] mb-4 sm:mb-5 animate-slide-in-up delay-200'>
                            Our Commitment
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-10 sm:mb-12 leading-relaxed font-light animate-slide-in-up delay-400'>
                            Your trust means everything to us. We promise to deliver{' '}
                            <span className='text-[#4cc7e8] font-bold'>exceptional customer service</span> and to handle every request—whether big or small—with{' '}
                            <span className='text-[#4cc7e8] font-bold'>professionalism and care</span>.
                        </p>
                        <div className='flex flex-col lg:flex-row gap-4 sm:gap-6 justify-center animate-slide-in-up delay-600'>
                            <Button
                                size='lg'
                                className='group border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-lg w-full sm:w-[300px] cursor-pointer'
                            >
                                <MessageCircle className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                Contact Support Now
                                <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300' />
                            </Button>
                            <Button
                                size='lg'
                                variant='outline'
                                className='group border-2 border-white text-white hover:bg-white/10 px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold backdrop-blur-sm rounded-lg w-full sm:w-[300px] bg-transparent transition-all duration-300 cursor-pointer'
                            >
                                <Eye className='w-5 h-5 sm:w-6 sm:h-6 mr-3 group-hover:scale-110 transition-transform duration-300' />
                                View FAQ
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
