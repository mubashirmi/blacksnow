import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ArrowRight, CheckCircle, Clock, CreditCard, Eye, Headphones, Mail, MessageCircle, Phone, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';

export default function Page() {
    const cookies = parseCookies();
    const id = cookies.id;

    const router = useRouter(); // Initialize the router

    // Handle navigation for the Pricing button
    const handlePricingClick = () => {
        router.push('/pricing'); // Navigate to the pricing page
    };

    // Handle navigation for the Unsubscribe button
    const handleUnsubscribeClick = () => {
        router.push('/pricing'); // Navigate to the unsubscribe page
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
            value: 'support@blacksnow.com',
            description: 'Get detailed help via email',
            action: 'Send Email',
        },
    ];

    return (
        <div className='min-h-screen bg-black overflow-hidden relative'>
            {/* Background System - Consistent with main site */}
            <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute -top-96 -right-96 w-[800px] h-[800px] bg-gradient-to-br from-[#259dd3]/20 via-[#259dd3]/10 to-transparent rounded-full blur-3xl opacity-30'></div>
                <div className='absolute top-1/3 -left-96 w-[600px] h-[600px] bg-gradient-to-tr from-[#259dd3]/15 via-[#259dd3]/8 to-transparent rounded-full blur-3xl opacity-20'></div>
                <div className='absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#259dd3]/10 via-[#259dd3]/5 to-transparent rounded-full blur-3xl opacity-15'></div>

                <div className='absolute inset-0 opacity-5'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `
              linear-gradient(rgba(37, 157, 211, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37, 157, 211, 0.1) 1px, transparent 1px)
            `,
                            backgroundSize: '100px 100px',
                        }}
                    ></div>
                </div>
            </div>
            {/* Hero Section */}
            <section className='relative flex items-center justify-center px-8 py-32'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='text-center max-w-6xl mx-auto'>
                        {/* Status Badge */}
                        <div className='inline-flex items-center space-x-3 bg-gradient-to-r from-[#259dd3]/10 via-[#259dd3]/20 to-[#259dd3]/10 backdrop-blur-2xl border border-[#259dd3]/30 rounded-full px-8 py-4 shadow-2xl shadow-[#259dd3]/20 animate-slide-in-up mb-8'>
                            <div className='relative'>
                                <div className='w-3 h-3 bg-[#259dd3] rounded-full'></div>
                            </div>
                            <span className='text-[#259dd3] font-bold text-sm tracking-wider uppercase'>24/7 Elite Support</span>
                            <Shield className='w-5 h-5 text-[#259dd3]' />
                        </div>

                        {/* Headline */}
                        <div className='space-y-8 animate-slide-in-up delay-200'>
                            <h1 className='text-5xl lg:text-6xl font-black leading-tight tracking-tight'>
                                <div className='relative inline-block'>
                                    <span className='text-white'>We&apos;re Here to</span>
                                </div>
                                <br />
                                <div className='relative'>
                                    <span className='bg-gradient-to-r from-[#259dd3] via-[#259dd3] via-[#259dd3] to-[#259dd3] bg-clip-text text-transparent animate-gradient bg-300% font-black'>
                                        Support You
                                    </span>
                                </div>
                            </h1>

                            <div className='relative'>
                                <p className='text-lg lg:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto font-light'>
                                    At <span className='text-[#259dd3] font-bold'>Black Snow</span>, we believe that great service begins with putting our
                                    customers first. Our priority is to ensure that every customer feels{' '}
                                    <span className='text-white font-bold'>supported, informed, and confident</span> in the plan they choose with us.
                                </p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className='space-y-8 animate-slide-in-up delay-400 mt-12'>
                            <div className='flex flex-col lg:flex-row gap-6 justify-center'>
                                <Button
                                    size='lg'
                                    className='group relative bg-gradient-to-r from-[#259dd3] via-[#259dd3] to-[#1e7ba8] hover:from-[#1e7ba8] hover:via-[#259dd3] hover:to-[#259dd3] text-white px-10 py-6 text-lg font-black shadow-2xl shadow-[#259dd3]/50 hover:shadow-[#259dd3]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl overflow-hidden cursor-pointer'
                                >
                                    <MessageCircle className='w-6 h-6 mr-3' />
                                    Start Live Chat
                                    <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300' />
                                </Button>

                                <Button
                                    size='lg'
                                    variant='outline'
                                    className='group bg-transparent border-3 border-[#259dd3] text-[#259dd3] hover:bg-[#259dd3] hover:text-black px-10 py-6 text-lg font-black transition-all duration-300 backdrop-blur-sm rounded-2xl shadow-xl shadow-[#259dd3]/20 hover:shadow-[#259dd3]/40 cursor-pointer'
                                >
                                    <Phone className='w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300' />
                                    Call Support
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How We Support You */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-black via-[#0a0b0f] to-black'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#259dd3] to-[#259dd3] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                            HOW WE SUPPORT YOU
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6 animate-slide-in-up'>
                            <span className='bg-gradient-to-r from-[#259dd3] to-[#259dd3] bg-clip-text text-transparent'>Elite Customer Care</span>
                        </h2>
                        <p className='text-lg text-gray-300 max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            Whether you need help understanding your account, managing your payments, or making changes to your plan, our dedicated support team
                            is here for you.
                        </p>
                    </div>

                    <div className='grid lg:grid-cols-2 xl:grid-cols-4 gap-8'>
                        {supportFeatures.map((feature, index) => (
                            <div key={index} className='group relative animate-slide-in-up' style={{ animationDelay: `${index * 200}ms` }}>
                                <Card className='relative bg-gradient-to-br from-black/90 via-[#0a0b0f]/95 to-black/90 border-2 border-[#259dd3]/30 hover:border-[#259dd3]/50 transition-all duration-500 rounded-3xl overflow-hidden transform hover:scale-105 hover:-translate-y-2 shadow-2xl shadow-[#259dd3]/20 min-h-[400px] flex flex-col'>
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#259dd3] to-[#1e7ba8]'></div>

                                    <CardContent className='p-8 text-center flex-1 flex flex-col'>
                                        <div className='w-16 h-16 bg-gradient-to-br from-[#259dd3] to-[#1e7ba8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300'>
                                            <feature.icon className='w-8 h-8 text-white' />
                                        </div>
                                        <h3 className='text-2xl font-black text-white mb-4'>{feature.title}</h3>
                                        <p className='text-gray-300 leading-relaxed flex-1'>{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Managing Your Subscription */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-[#0a0b0f] via-black to-[#0a0b0f]'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#259dd3] to-[#259dd3] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                            SUBSCRIPTION MANAGEMENT
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6 animate-slide-in-up'>
                            <span className='bg-gradient-to-r from-[#259dd3] to-[#259dd3] bg-clip-text text-transparent'>Flexible Plans</span>
                        </h2>
                        <p className='text-lg text-gray-300 max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            We offer flexible monthly and annual plans, giving you the freedom to choose what works best for you.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
                        {subscriptionSteps.map((step, index) => (
                            <div key={index} className='group relative animate-slide-in-up' style={{ animationDelay: `${index * 150}ms` }}>
                                <Card className='relative bg-gradient-to-br from-black/90 via-[#0a0b0f]/95 to-black/90 border border-[#259dd3]/30 hover:border-[#259dd3]/50 transition-all duration-300 rounded-2xl overflow-hidden transform hover:scale-105 shadow-xl shadow-[#259dd3]/10'>
                                    <CardContent className='p-6'>
                                        <div className='w-12 h-12 bg-gradient-to-r from-[#259dd3]/20 to-[#1e7ba8]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gradient-to-r group-hover:from-[#259dd3]/30 group-hover:to-[#1e7ba8]/30 transition-all duration-300'>
                                            <step.icon className='w-6 h-6 text-[#259dd3]' />
                                        </div>
                                        <h3 className='text-lg font-black text-white mb-2'>{step.title}</h3>
                                        <p className='text-gray-300 text-sm leading-relaxed'>{step.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    <div className='relative bg-gradient-to-br from-black/95 via-[#0a0b0f]/90 to-black/95 backdrop-blur-2xl rounded-3xl p-10 border-2 border-amber-500/30 shadow-2xl shadow-amber-500/20 max-w-5xl mx-auto animate-slide-in-up delay-600 overflow-hidden'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-3xl'></div>

                        <div className='flex items-start space-x-6 '>
                            <div className='w-16 h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                                <AlertTriangle className='w-8 h-8 text-amber-500' />
                            </div>
                            <div className='flex-1'>
                                <h3 className='text-2xl font-black text-white mb-4'>Need to Unsubscribe Your Plan?</h3>
                                <p className='text-gray-300 mb-6 leading-relaxed'>
                                    If you unsubscribe your plan, you can always log back into your account or contact our support team for assistance.
                                </p>
                                <div className='flex flex-col sm:flex-row gap-4'>
                                    {id ? (
                                        <Button
                                            className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black px-8 py-3 shadow-xl shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 cursor-pointer'
                                            onClick={handlePricingClick} // Add onClick handler
                                        >
                                            Pricing
                                        </Button>
                                    ) : (
                                        <Button
                                            className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black px-8 py-3 shadow-xl shadow-red-500/30 transition-all duration-300 transform hover:scale-105 cursor-pointer'
                                            onClick={handleUnsubscribeClick} // Add onClick handler
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

            {/* Contact Methods */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-black via-[#0a0b0f] to-black'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#259dd3] to-[#259dd3] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                            GET IN TOUCH
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6 animate-slide-in-up'>
                            <span className='bg-gradient-to-r from-[#259dd3] to-[#259dd3] bg-clip-text text-transparent'>Need Help?</span>
                        </h2>
                        <p className='text-lg text-gray-300 max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            We&apos;re here to support you every step of the way.
                        </p>
                    </div>

                    <div className='flex justify-center items-center'>
                        {contactMethods.map((method, index) => (
                            <div key={index} className='group relative animate-slide-in-up max-w-lg min-w-lg' style={{ animationDelay: `${index * 200}ms` }}>
                                <Card className='relative bg-gradient-to-br from-black/90 via-[#0a0b0f]/95 to-black/90 border-2 border-[#259dd3]/30 hover:border-[#259dd3]/50 transition-all duration-500 rounded-3xl overflow-hidden transform hover:scale-105 hover:-translate-y-2 shadow-2xl shadow-[#259dd3]/20 min-h-[350px] flex flex-col'>
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#259dd3] to-[#1e7ba8]'></div>

                                    <CardContent className='p-8 text-center flex-1 flex flex-col'>
                                        <div className='w-16 h-16 bg-gradient-to-br from-[#259dd3] to-[#1e7ba8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300'>
                                            <method.icon className='w-8 h-8 text-white' />
                                        </div>
                                        <h3 className='text-2xl font-black text-white mb-2'>{method.title}</h3>
                                        <p className='text-xl font-bold text-[#259dd3] mb-2'>{method.value}</p>
                                        <p className='text-gray-300 mb-6 flex-1'>{method.description}</p>
                                        <Button className='w-full bg-gradient-to-r from-[#259dd3] to-[#1e7ba8] hover:from-[#1e7ba8] hover:to-[#259dd3] text-white font-black py-3 shadow-xl shadow-[#259dd3]/30 transition-all duration-300 transform hover:scale-105 cursor-pointer'>
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
            <section className='relative py-32 px-8 overflow-hidden'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='text-center max-w-5xl mx-auto'>
                        <div className='w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-slide-in-up'>
                            <Shield className='w-12 h-12 text-[#259dd3]' />
                        </div>
                        <h2 className='text-5xl lg:text-6xl xl:text-6xl font-black text-[#259dd3] mb-8 animate-slide-in-up delay-200'>Our Commitment</h2>
                        <p className='text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed font-light animate-slide-in-up delay-400'>
                            Your trust means everything to us. We promise to deliver{' '}
                            <span className='text-[#259dd3] font-bold'>exceptional customer service</span> and to handle every request—whether big or small—with{' '}
                            <span className='text-[#259dd3] font-bold'>professionalism and care</span>.
                        </p>
                        <div className='flex flex-col lg:flex-row gap-6 justify-center animate-slide-in-up delay-600'>
                            <Button
                                size='lg'
                                className='group border-2 border-[#259dd3] text-[#259dd3] cursor-pointer px-10 py-6 text-lg font-black shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-2xl'
                            >
                                <MessageCircle className='w-6 h-6 mr-3' />
                                Contact Support Now
                                <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300' />
                            </Button>
                            <Button
                                size='lg'
                                variant='outline'
                                className='group border-3 border-white text-white hover:bg-white/10 px-10 py-6 text-lg font-black backdrop-blur-sm rounded-2xl bg-transparent transition-all duration-300 cursor-pointer'
                            >
                                <Eye className='w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300' />
                                View FAQ
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
