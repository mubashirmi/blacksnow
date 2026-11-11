import AuthModal from '@/components/AuthModal';
import BusinessInvoiceSlideshow from '@/components/BusinessInvoiceSlideshow';
import { PricingComponent } from '@/components/PricingComponent';
import { ProductPricingOverview } from '@/components/ProductPricingOverview';
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
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState } from 'react';

export default function InvoiceContractPage() {
    const howItWorksRef = useRef<HTMLDivElement | null>(null);
    const [slideshowOpen, setSlideshowOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [openPricingAfterAuth, setOpenPricingAfterAuth] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const trackRefIdClick = async () => {
            const { refId } = router.query;
            if (refId) {
                localStorage.setItem('referredby', refId as string);
                try {
                    const currentUrl = `https://blacksnowholdings.com/InvoiceContract`;
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

    const isUserLoggedIn = () => {
        const cookies = parseCookies();
        const cookieId = cookies?.id;
        const localId = typeof window !== 'undefined' ? localStorage.getItem('userId') || localStorage.getItem('id') : null;
        return Boolean(cookieId || localId);
    };

    const handlePurchaseClick = () => {
        if (isUserLoggedIn()) {
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
            icon: Star,
            title: 'Professional Custom Invoices',
            description: 'Send clean, branded invoices that make you look established and trustworthy. No design skills or formatting required.',
            color: 'bg-[#8350E0]',
        },
        {
            icon: Upload,
            title: 'Email Delivery Options',
            description: 'Send invoices instantly through email so clients receive them quickly and can make payments without delays.',
            color: 'bg-[#8350E0]',
        },
        {
            icon: Zap,
            title: 'Automatic Payment Reminders',
            description: 'The system follows up for you so you don’t have to. More reminders mean more on-time payments without awkward conversations.',
            color: 'bg-[#8350E0]',
        },
        {
            icon: LinkIcon,
            title: 'Create Invoice Contracts',
            description: 'Upload simple invoice-based contracts clients can review before paying. Keep all terms and signatures.',
            color: 'bg-[#8350E0]',
        },
        {
            icon: Pen,
            title: 'Create Recurring Invoices',
            description: 'Set up weekly, monthly, or annual billing that sends itself. Perfect for subscription services or long-term clients.',
            color: 'bg-[#8350E0]',
        },
        {
            icon: BarChart3,
            title: 'Add Multiple Users',
            description: 'Invite assistants or team members to help manage billing. Access controls ensure the right people see the right information.',
            color: 'bg-[#8350E0]',
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
            <BusinessInvoiceSlideshow open={slideshowOpen} onOpenChange={setSlideshowOpen} />
            {/* Hero Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        {/* Left Content */}
                        <div className='space-y-10 animate-slide-in-left'>
                            <div>
                                <div className='inline-block'>
                                    <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-white mb-4 sm:mb-5'>
                                        <span className='text-[#8350E0]'>Business </span>
                                        &nbsp;Invoice
                                    </h1>
                                </div>

                                <p className='text-md sm:text-lg text-gray-300 leading-relaxed max-w-2xl'>
                                    Your Business Invoice system makes billing clean, fast, and effortless. Every payment is tracked, organized, and stored so
                                    you always know where your money stands. Clients receive clear, polished invoices that make paying simple and stress-free.
                                    The platform is designed for speed, efficiency, and total accuracy. Create unlimited invoices and contracts for customers on
                                    {'   '}
                                    <span className='text-[#8350E0] font-semibold'> a single dashboard.</span>
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className='flex flex-col sm:flex-row sm:flex-wrap lg:flex-col 2xl:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    className='border-2 cursor-pointer px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-[calc(50%_-_0.75rem)] lg:w-full lg:max-w-[300px] 2xl:w-[300px] border-[#8350E0] bg-[#8350E0] text-white hover:bg-[#693DB6] hover:text-white hover:border-[#693DB6]'
                                >
                                    Purchase
                                </Button>
                                <Button
                                    size='lg'
                                    onClick={() => setSlideshowOpen(true)}
                                    className='group border-2 box-border cursor-pointer px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-[calc(50%_-_0.75rem)] lg:w-full lg:max-w-[300px] 2xl:w-[300px] border-[#8350E0] bg-transparent text-[#8350E0] hover:bg-[#8350E0]/10 hover:text-[#B38DF3] hover:border-[#8350E0] shadow-[0_0_18px_rgba(131,80,224,0.12)]'
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className='relative animate-slide-in-right min-w-0'>
                            <div className='relative flex items-center justify-center w-full h-full'>
                                <div className='flex items-center justify-center w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] aspect-square rounded-2xl sm:rounded-3xl border border-[#414A5D]'>
                                    <div className='w-[90%] aspect-square sm:w-full'>
                                        <LottieAnimation
                                            src='/animations/invoivecontracticon.json'
                                            style={{ width: '100%', height: '100%' }}
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

            <ProductPricingOverview product='business-invoice' onGetStarted={handlePurchaseClick} />
            {/* <div ref={pricingRef} className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <PricingComponent name='InvoiceTool' />
            </div> */}
            {/* How It Works Section - IMPROVED */}
            <section ref={howItWorksRef} className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='absolute inset-0 pointer-events-none bg-transparent'></div>

                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            How It <span className='text-[#8350E0]'>Works</span>
                        </h2>
                        {/* <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 rounded-full mb-4 sm:mb-5 mx-auto bg-[#8350E0]'></div> */}
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>Get started in four simple steps</p>
                    </div>

                    <div className='relative'>
                        {/* Connection Line */}
                        <div className='hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-[#8350E0]'></div>

                        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
                            {steps.map((item, index) => (
                                <div key={index} className='relative group'>
                                    <div className='relative border border-[#414A5D] rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:border-[#414A5D] hover:shadow-lg hover:shadow-[#8350E0]/15 hover:-translate-y-2 bg-[#0C0F18]'>
                                        {/* Step Number Badge */}
                                        <div className='absolute -top-4 -right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg shadow-[#8350E0]/15 group-hover:scale-110 transition-transform duration-300 bg-[#8350E0] hover:bg-[#693DB6]'>
                                            <span className='text-lg sm:text-xl font-black text-white'>{item.step}</span>
                                        </div>

                                        <div className='mt-6 sm:mt-8'>
                                            <h3 className='text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 leading-[1.28] group-hover:text-[#8350E0] transition-colors duration-300'>
                                                {item.title}
                                            </h3>
                                            <p className='text-sm sm:text-base text-gray-400 leading-relaxed'>{item.description}</p>
                                        </div>

                                        {/* Arrow Indicator */}
                                        {index < steps.length - 1 && (
                                            <div className='hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10'>
                                                <div className='w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-[#8350E0]'>
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
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8   bg-[#0C0F18]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Professional Custom <span className='text-[#8350E0]'>Invoices </span>
                        </h2>
                        {/* <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 rounded-full mb-4 sm:mb-5 mx-auto bg-[#8350E0]'></div> */}
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>
                            Send clean, branded invoices that make you look established and trustworthy. No design skills or formatting required.
                        </p>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-6 lg:gap-8'>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className='group relative border border-[#414A5D] rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#414A5D] hover:shadow-xl hover:shadow-[#8350E0]/15 hover:-translate-y-1 bg-black'
                            >
                                {/* Top gradient line */}
                                <div className='absolute top-0 left-0 right-0 h-1 bg-[#414A5D]'></div>

                                <div className='p-6 sm:p-8 flex items-start gap-4 sm:gap-6'>
                                    {/* Icon */}
                                    <div
                                        className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 hover:bg-[#693DB6]`}
                                    >
                                        <feature.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 min-w-0'>
                                        <h3 className='text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 leading-[1.28] group-hover:text-[#8350E0] transition-colors duration-300'>
                                            {feature.title}
                                        </h3>
                                        <p className='text-sm sm:text-base text-gray-400 leading-relaxed'>{feature.description}</p>
                                    </div>
                                </div>

                                {/* Hover effect overlay */}
                                <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[#8350E0]/10'></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section - IMPROVED  */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='absolute inset-0 pointer-events-none bg-transparent'></div>

                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Why Choose Our <span className='text-[#8350E0]'> Digital Solution</span>
                        </h2>
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>Transform your document workflow</p>
                    </div>

                    <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className='group relative border border-[#414A5D] rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:border-[#414A5D] hover:shadow-lg hover:shadow-[#8350E0]/15 hover:-translate-y-1 bg-[#0C0F18]'
                            >
                                {/* Icon */}
                                <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-md mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 bg-[#8350E0] hover:bg-[#693DB6]'>
                                    <benefit.icon className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
                                </div>

                                {/* Content */}
                                <h3 className='text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 leading-[1.28] group-hover:text-[#8350E0] transition-colors duration-300'>
                                    {benefit.title}
                                </h3>
                                <p className='text-sm sm:text-base text-gray-400 leading-relaxed'>{benefit.description}</p>

                                {/* Decorative element */}
                                <div className='absolute top-0 right-0 w-20 h-20  rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#8350E0] hover:bg-[#693DB6]'></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases Section - IMPROVED  */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8   bg-[#0C0F18]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Perfect For Every <span className='text-[#8350E0]'>Business</span>
                        </h2>
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>Discover how our platform adapts to your needs</p>
                    </div>

                    <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {[
                            {
                                icon: FileText,
                                title: 'Business Contracts',
                                description: 'Manage service agreements, NDAs, and partnership contracts with secure digital signatures.',
                                color: 'bg-[#8350E0]',
                            },
                            {
                                icon: BarChart3,
                                title: 'Invoice Management',
                                description: 'Create, send, and track professional invoices directly from your signed contracts.',
                                color: 'bg-[#8350E0]',
                            },
                            {
                                icon: Users,
                                title: 'Client Onboarding',
                                description: 'Streamline client onboarding with digital forms, agreements, and instant document signing.',
                                color: 'bg-[#8350E0]',
                            },
                            {
                                icon: CheckCircle,
                                title: 'Legal Documentation',
                                description: 'Manage legal documents with audit trails and compliance-ready record keeping.',
                                color: 'bg-[#8350E0]',
                            },
                            {
                                icon: Share2,
                                title: 'Vendor Agreements',
                                description: 'Collaborate with vendors using secure document sharing and multi-party signing.',
                                color: 'bg-[#8350E0]',
                            },
                            {
                                icon: Shield,
                                title: 'Finance Operations',
                                description: 'Automate financial workflows with secure document management and invoice generation.',
                                color: 'bg-[#8350E0]',
                            },
                        ].map((useCase, index) => (
                            <div key={index} className='group relative'>
                                {/* Card */}
                                <div className='relative border border-[#414A5D] rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#414A5D] hover:shadow-xl hover:shadow-[#8350E0]/15 hover:-translate-y-2 h-full bg-black'>
                                    {/* Gradient accent */}
                                    <div className='absolute top-0 left-0 right-0 h-1 bg-[#414A5D]'></div>

                                    <div className='p-6 sm:p-8 text-center'>
                                        {/* Icon */}
                                        <div
                                            className={`inline-flex w-14 h-14 sm:w-16 sm:h-16 ${useCase.color} rounded-xl items-center justify-center shadow-lg mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 bg-[#8350E0] hover:bg-[#693DB6]`}
                                        >
                                            <useCase.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                        </div>

                                        {/* Content */}
                                        <h3 className='text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 leading-[1.28] group-hover:text-[#8350E0] transition-colors duration-300'>
                                            {useCase.title}
                                        </h3>
                                        <p className='text-sm sm:text-base text-gray-400 leading-relaxed'>{useCase.description}</p>
                                    </div>

                                    {/* Background glow effect */}
                                    <div
                                        className={`absolute inset-0 ${useCase.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none bg-[#8350E0] hover:bg-[#693DB6]`}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        <div className='space-y-8'>
                            <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                Create New <br className='inline sm:hidden' />
                                <span className='text-[#8350E0]'>&nbsp;Transactions</span>
                                <br />
                            </h2>
                            <p className='text-xl text-gray-300 leading-relaxed'>
                                Start today and experience a faster, cleaner, and more professional way to handle every invoice.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-6 pt-8'>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    className='cursor-pointer border-2 px-12 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300 w-full sm:w-[300px] border-[#8350E0] bg-[#8350E0] text-white hover:bg-[#693DB6] hover:text-white hover:border-[#693DB6]'
                                >
                                    Purchase
                                </Button>
                                <Button
                                    size='lg'
                                    onClick={() => setSlideshowOpen(true)}
                                    className='border-2 box-border cursor-pointer px-12 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300 w-full sm:w-[300px] border-[#8350E0] bg-transparent text-[#8350E0] hover:bg-[#8350E0]/10 hover:text-[#B38DF3] hover:border-[#8350E0] shadow-[0_0_18px_rgba(131,80,224,0.12)]'
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>

                        {/* Right Animation */}
                        <div className='flex items-center justify-center'>
                            <div className='w-full h-full sm:w-96 sm:h-96 rounded-3xl border border-[#414A5D] flex items-center justify-center backdrop-blur-xl bg-[#0C0F18]'>
                                <LottieAnimation src='/animations/invoicecontractctaicon.json' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {authOpen && (
                <AuthModal
                    open={authOpen}
                    onOpenChange={(open) => {
                        setAuthOpen(open);
                        if (open) setPricingOpen(false);
                    }}
                    defaultView='signup'
                    sourceRoute='/invoiceContract'
                    onSuccess={handleAuthSuccess}
                />
            )}

            {!authOpen && <PricingComponent name='InvoiceTool' asModal open={pricingOpen} onOpenChange={setPricingOpen} />}
        </div>
    );
}
