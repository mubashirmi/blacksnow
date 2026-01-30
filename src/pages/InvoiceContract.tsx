import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import lottie from 'lottie-web';
import {
    ArrowRight,
    BarChart3,
    CheckCircle,
    Clock,
    FileCheck,
    FileText,
    LinkIcon,
    Pen,
    Receipt,
    Rocket,
    Send,
    Share2,
    Shield,
    Star,
    Target,
    Upload,
    Users,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function InvoiceContractPage() {
    const howItWorksRef = useRef<HTMLDivElement | null>(null);

    // 👉 NEW: scroll handler
    const handleScrollToHowItWorks = () => {
        howItWorksRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const LottieAnimation = ({ src, loop, autoplay, style }) => {
        const containerRef = useRef(null);

        useEffect(() => {
            if (typeof window !== 'undefined' && containerRef.current) {
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
            icon: Star,
            title: 'Professional Custom Invoices',
            description: 'Send clean, branded invoices that make you look established and trustworthy. No design skills or formatting required.',
            color: 'from-[#4cc7e8] to-[#2c7bbe]',
        },
        {
            icon: Upload,
            title: 'Email Delivery Options',
            description: 'Send invoices instantly through email so clients receive them quickly and can make payments without delays.',
            color: 'from-[#4cc7e8] to-[#2c7bbe]',
        },
        {
            icon: Zap,
            title: 'Automatic Payment Reminders',
            description: 'The system follows up for you so you don’t have to. More reminders mean more on-time payments without awkward conversations.',
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
        },
        {
            icon: LinkIcon,
            title: 'Create Invoice Contracts',
            description: 'Upload simple invoice-based contracts clients can review before paying. Keep all terms and signatures.',
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
        },
        {
            icon: Pen,
            title: 'Create Recurring Invoices',
            description: 'Set up weekly, monthly, or annual billing that sends itself. Perfect for subscription services or long-term clients.',
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
        },
        {
            icon: BarChart3,
            title: 'Add Multiple Users',
            description: 'Invite assistants or team members to help manage billing. Access controls ensure the right people see the right information.',
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
        },
    ];

    const steps = [
        {
            step: '01',
            title: 'Upload Your PDF',
            description: 'Start by uploading your contract or invoice PDF to the Invoice/Contract tool.',
            icon: Upload,
        },
        {
            step: '02',
            title: 'Generate Sharing Link',
            description: 'Automatically receive a unique, secure link that you can share with anyone.',
            icon: Send,
        },
        {
            step: '03',
            title: 'Recipients Sign',
            description: 'Share the link with anyone who needs to sign. They can review and sign securely.',
            icon: FileCheck,
        },
        {
            step: '04',
            title: 'Create Invoice',
            description: 'Once signed, create professional invoices from your signed contracts with ease.',
            icon: Receipt,
        },
    ];

    const benefits = [
        {
            icon: Star,
            title: 'Professional Invoices',
            description: 'Sends professional invoices that elevate your brand image.',
            stat: 'Pro',
            statLabel: 'Branding',
        },
        {
            icon: Rocket,
            title: 'Faster Payments',
            description: 'Speeds up payments through fast, reliable email delivery.',
            stat: 'Fast',
            statLabel: 'Delivery',
        },
        {
            icon: Target,
            title: 'Fewer Errors',
            description: 'Eliminates manual tracking and reduces billing errors.',
            stat: 'Less',
            statLabel: 'Mistakes',
        },
        {
            icon: Clock,
            title: 'Automated Reminders',
            description: 'Saves time with automated reminders and recurring invoices.',
            stat: 'Auto',
            statLabel: 'Follow-ups',
        },
        {
            icon: BarChart3,
            title: 'Organized Records',
            description: 'Keeps your financial records clean and organized.',
            stat: 'Clean',
            statLabel: 'Books',
        },
        {
            icon: CheckCircle,
            title: 'Smooth Billing',
            description: 'Provides a smooth, dependable billing flow from start to finish.',
            stat: 'Smooth',
            statLabel: 'Flow',
        },
    ];

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hero Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* Left Content */}
                        <div className='space-y-8 sm:space-y-10 md:space-y-12 animate-slide-in-left'>
                            <div>
                                <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                    Create Invoices
                                </Badge>
                                <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Business </span>
                                    &nbsp;Invoice
                                </h1>
                                <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5'></div>
                                <p className='text-base sm:text-md md:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Your Business Invoice system makes billing clean, fast, and effortless. Every payment is tracked, organized, and stored so
                                    you always know where your money stands. Clients receive clear, polished invoices that make paying simple and stress-free.
                                    The platform is designed for speed, efficiency, and total accuracy. Create unlimited invoices and contracts for customers on
                                    {'   '}
                                    <span className='text-[#4cc7e8] font-semibold'> a single dashboard.</span>
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    size='lg'
                                    onClick={handleScrollToHowItWorks}
                                    className='group border-2 box-border border-[#4cc7e8] cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Learn More
                                </Button>
                                <Link href={'/pricing'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 cursor-pointer border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    >
                                        <BarChart3 className='w-6 h-6 mr-3' />
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className='relative animate-slide-in-right '>
                            <div className='relative overflow-hidden '>
                                <div className='relative flex items-center justify-center w-full h-full'>
                                    <div className=' flex items-center justify-center w-full sm:w-fit bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                        <LottieAnimation
                                            src='/animations/invoivecontracticon.json'
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

            {/* How It Works Section - IMPROVED */}
            <section ref={howItWorksRef} className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='absolute inset-0 bg-gradient-to-b from-transparent via-[#2c7bbe]/5 to-transparent pointer-events-none'></div>

                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-4 sm:mb-6 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold'>
                            SIMPLE PROCESS
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                            How It <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Works</span>
                        </h2>
                        <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5 mx-auto'></div>
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>Get started in four simple steps</p>
                    </div>

                    <div className='relative'>
                        {/* Connection Line */}
                        <div className='hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4cc7e8]/20 via-[#2c7bbe]/40 to-[#4cc7e8]/20 -translate-y-1/2'></div>

                        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
                            {steps.map((item, index) => (
                                <div key={index} className='relative group'>
                                    <div className='relative bg-gradient-to-br from-[#0a0b0f] to-[#050608] border border-[#2c7bbe]/20 rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:border-[#4cc7e8]/50 hover:shadow-lg hover:shadow-[#4cc7e8]/10 hover:-translate-y-2'>
                                        {/* Step Number Badge */}
                                        <div className='absolute -top-4 -right-4 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#4cc7e8] to-[#2c7bbe] rounded-full flex items-center justify-center shadow-lg shadow-[#4cc7e8]/30 group-hover:scale-110 transition-transform duration-300'>
                                            <span className='text-lg sm:text-xl font-black text-white'>{item.step}</span>
                                        </div>

                                        <div className='mt-6 sm:mt-8'>
                                            <h3 className='text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                {item.title}
                                            </h3>
                                            <p className='text-sm sm:text-base text-gray-400 leading-relaxed'>{item.description}</p>
                                        </div>

                                        {/* Arrow Indicator */}
                                        {index < steps.length - 1 && (
                                            <div className='hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10'>
                                                <div className='w-8 h-8 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full flex items-center justify-center shadow-md'>
                                                    <ArrowRight className='w-4 h-4 text-white' />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - IMPROVED */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-transparent via-[#0a0b0f] to-transparent'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-4 sm:mb-6 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold'>
                            Features
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Professional Custom <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Invoices </span>
                        </h2>
                        <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5 mx-auto'></div>
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>
                            Send clean, branded invoices that make you look established and trustworthy. No design skills or formatting required.
                        </p>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-6 lg:gap-8'>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className='group relative bg-gradient-to-br from-[#0a0b0f] to-[#050608] border border-[#2c7bbe]/20 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#4cc7e8]/50 hover:shadow-xl hover:shadow-[#4cc7e8]/10 hover:-translate-y-1'
                            >
                                {/* Top gradient line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`}></div>

                                <div className='p-6 sm:p-8 flex items-start gap-4 sm:gap-6'>
                                    {/* Icon */}
                                    <div
                                        className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                                    >
                                        <feature.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 min-w-0'>
                                        <h3 className='text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            {feature.title}
                                        </h3>
                                        <p className='text-sm sm:text-base text-gray-400 leading-relaxed'>{feature.description}</p>
                                    </div>
                                </div>

                                {/* Hover effect overlay */}
                                <div className='absolute inset-0 bg-gradient-to-br from-[#4cc7e8]/0 to-[#2c7bbe]/0 group-hover:from-[#4cc7e8]/5 group-hover:to-[#2c7bbe]/5 transition-all duration-500 pointer-events-none'></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section - IMPROVED  */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='absolute inset-0 bg-gradient-to-b from-transparent via-[#2c7bbe]/5 to-transparent pointer-events-none'></div>

                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-4 sm:mb-6 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold'>
                            WHY CHOOSE US
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Why Choose Our <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'> Digital Solution</span>
                        </h2>
                        <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5 mx-auto'></div>
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>Transform your document workflow</p>
                    </div>

                    <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className='group relative bg-gradient-to-br from-[#0a0b0f] to-[#050608] border border-[#2c7bbe]/20 rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:border-[#4cc7e8]/50 hover:shadow-lg hover:shadow-[#4cc7e8]/10 hover:-translate-y-1'
                            >
                                {/* Icon */}
                                <div className='w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#4cc7e8] to-[#2c7bbe] rounded-xl flex items-center justify-center shadow-md mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300'>
                                    <benefit.icon className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
                                </div>

                                {/* Content */}
                                <h3 className='text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                    {benefit.title}
                                </h3>
                                <p className='text-sm sm:text-base text-gray-400 leading-relaxed'>{benefit.description}</p>

                                {/* Decorative element */}
                                <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#4cc7e8]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases Section - IMPROVED  */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-transparent via-[#0a0b0f] to-transparent'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-4 sm:mb-6 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold'>
                            VERSATILE SOLUTIONS
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Perfect For Every <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Business</span>
                        </h2>
                        <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5 mx-auto'></div>
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>Discover how our platform adapts to your needs</p>
                    </div>

                    <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {[
                            {
                                icon: FileText,
                                title: 'Business Contracts',
                                description: 'Manage service agreements, NDAs, and partnership contracts with secure digital signatures.',
                                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                            },
                            {
                                icon: BarChart3,
                                title: 'Invoice Management',
                                description: 'Create, send, and track professional invoices directly from your signed contracts.',
                                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                            },
                            {
                                icon: Users,
                                title: 'Client Onboarding',
                                description: 'Streamline client onboarding with digital forms, agreements, and instant document signing.',
                                color: 'from-[#4cc7e8] to-[#2a8dcc]',
                            },
                            {
                                icon: CheckCircle,
                                title: 'Legal Documentation',
                                description: 'Manage legal documents with audit trails and compliance-ready record keeping.',
                                color: 'from-[#2a8dcc] to-[#2c7bbe]',
                            },
                            {
                                icon: Share2,
                                title: 'Vendor Agreements',
                                description: 'Collaborate with vendors using secure document sharing and multi-party signing.',
                                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                            },
                            {
                                icon: Shield,
                                title: 'Finance Operations',
                                description: 'Automate financial workflows with secure document management and invoice generation.',
                                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                            },
                        ].map((useCase, index) => (
                            <div key={index} className='group relative'>
                                {/* Card */}
                                <div className='relative bg-gradient-to-br from-[#0a0b0f] to-[#050608] border border-[#2c7bbe]/20 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#4cc7e8]/50 hover:shadow-xl hover:shadow-[#4cc7e8]/10 hover:-translate-y-2 h-full'>
                                    {/* Gradient accent */}
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${useCase.color}`}></div>

                                    <div className='p-6 sm:p-8 text-center'>
                                        {/* Icon */}
                                        <div
                                            className={`inline-flex w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${useCase.color} rounded-xl items-center justify-center shadow-lg mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
                                        >
                                            <useCase.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                        </div>

                                        {/* Content */}
                                        <h3 className='text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            {useCase.title}
                                        </h3>
                                        <p className='text-sm sm:text-base text-gray-400 leading-relaxed'>{useCase.description}</p>
                                    </div>

                                    {/* Background glow effect */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        {/* Left Content */}
                        <div className='space-y-8'>
                            <Badge className='uppercase bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-4 sm:mb-5 px-8 py-3 text-sm font-bold'>
                                START MANAGING DOCUMENTS LIKE A PRO
                            </Badge>
                            <h2 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Create New
                                <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>&nbsp;Transactions</span>
                                <br />
                            </h2>
                            <p className='text-xl text-gray-300 leading-relaxed'>
                                Start today and experience a faster, cleaner, and more professional way to handle every invoice.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-6 pt-8'>
                                <Button
                                    size='lg'
                                    onClick={handleScrollToHowItWorks}
                                    className='bg-gradient-to-r border-2 box-border border-[#4cc7e8] from-[#2c7bbe] to-[#4cc7e8] cursor-pointer hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-12 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300 w-full sm:w-[300px]'
                                >
                                    Learn More
                                </Button>
                                <Link href={'/pricing'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='cursor-pointer border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-12 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300 bg-transparent w-full sm:w-[300px]'
                                    >
                                        <BarChart3 className='w-6 h-6 mr-3' />
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Animation */}
                        <div className='flex items-center justify-center'>
                            <div className='w-full h-full sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/invoicecontractctaicon.json' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
