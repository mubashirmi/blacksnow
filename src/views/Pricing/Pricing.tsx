'use client';

import { AuthModalTrigger } from '@/components/AuthModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import lottie from 'lottie-web';
import { Calendar, CheckCircle, Clock, FilePen, MessageSquare, Monitor, Newspaper, Target, Users, X, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Memoized Lottie Animation Component
const LottieAnimation = memo(({ src, loop, autoplay, className }) => {
    const containerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && containerRef.current) {
            animationRef.current = lottie.loadAnimation({
                container: containerRef.current,
                renderer: 'svg',
                loop,
                autoplay,
                path: src,
            });

            return () => {
                if (animationRef.current) {
                    animationRef.current.destroy();
                }
            };
        }
    }, [src, loop, autoplay]);

    return <div ref={containerRef} className={className} />;
});

LottieAnimation.displayName = 'LottieAnimation';

function Pricing() {
    const [isClient, setIsClient] = useState(false);
    const [purchasedProducts, setPurchasedProducts] = useState({});
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);
    const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        const cookies = parseCookies();
        const id = cookies.id;

        if (id) {
            axios
                .get(`/api/v2/get-user-product-info/?id=${id}`)
                .then((response) => {
                    if (response.data.message === 'No product found') {
                        setPurchasedProducts({});
                    } else {
                        setPurchasedProducts(response.data.data);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching product info:', error);
                });
        }
    }, []);

    const products = useMemo(
        () => [
            {
                id: 'NewsLetter',
                name: 'Newsletter',
                monthlyPrice: 10,
                yearlyPrice: 50,
                description: 'Weekly premium market insights',
                features: [
                    'Weekly Stock Picks',
                    'Macro Market Updates',
                    'Latest Blog Articles',
                    'Exclusive Financial Insights',
                    'Portfolio Strategy Notes',
                    'Market Data Briefings',
                ],
                icon: Newspaper,
                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                available: true,
                popular: true,
                apiName: 'NewsLetter',
                productLink: 'https://blacksnowholdings.com',
                productComission: '100',
                hasSubscription: true,
                redirectRoute: '/',
            },
            {
                id: 'InvoiceTool',
                name: 'Invoice & Contract',
                monthlyPrice: 20,
                yearlyPrice: 200,
                description: 'All-in-one contracts, signatures, and invoices—made simple',
                features: [
                    'Instant Invoice Builder',
                    'Email Delivery',
                    'Invoice Dashboard',
                    'Create Invoice Contracts',
                    'Add Multiple Users',
                    'Recurring Invoices',
                ],
                icon: FilePen,
                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                available: true,
                popular: false,
                apiName: 'InvoiceTool',
                productLink: 'https://blacksnowholdings.com/InvoiceContract',
                productComission: '10',
                hasSubscription: true,
                redirectRoute: '/InvoiceContract',
            },
            {
                id: 'DigitalBillboard',
                name: 'Digital Billboard',
                monthlyPrice: 150,
                yearlyPrice: 600,
                description: 'Premium advertising placement across our platform',
                features: [
                    'Billboard Creator',
                    'Email & SMS Share Buttons',
                    'Lead Capture Form',
                    'Create Invoice Contracts',
                    'Add Multiple Users',
                    'Create Up to 4 Billboards',
                ],
                icon: Monitor,
                color: 'from-[#4cc7e8] to-[#2a8dcc]',
                available: true,
                popular: false,
                apiName: 'DigitalBillboard',
                productLink: 'https://blacksnowholdings.com/advertising',
                productComission: '150',
                hasSubscription: true,
                redirectRoute: '/advertising',
            },
            {
                id: 'Sales',
                name: 'Email CRM',
                monthlyPrice: 500,
                yearlyPrice: 4000,
                description: 'Comprehensive communication platform for your business',
                features: [
                    'Email Campaigns & Automated Sequences',
                    'SMS Campaigns & Sequences',
                    'SMS Chatbot',
                    'Email KPIs Dashboard',
                    'Email Scheduling',
                    'List Upload Tools',
                ],
                icon: MessageSquare,
                color: 'from-[#2a8dcc] to-[#2c7bbe]',
                available: true,
                popular: false,
                apiName: 'EmailMarketing',
                productLink: 'https://blacksnowholdings.com/emailMarketing',
                productComission: '100',
                hasSubscription: true,
                redirectRoute: '/emailMarketing',
            },
        ],
        []
    );

    const digitalTools = useMemo(
        () => [
            {
                id: 'dt-newsletter',
                name: 'Newsletter',
                description: 'Receive curated market updates and structured insight in one consistent format.',
                features: [
                    'Curated market updates delivered directly to you',
                    'Actionable intel and clear overviews',
                    'Stay informed on price movement, trends, and platform activity',
                    'Structured insight instead of information overload',
                ],
                icon: Newspaper,
                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                redirectRoute: '/',
            },
            {
                id: 'dt-billboard',
                name: 'Digital Billboard',
                description: 'Promote your business, services, or content with a public-facing platform display.',
                features: [
                    'Showcase offers, announcements, or featured tools',
                    'Built for visibility, discovery, and engagement',
                    'Acts as a real-time digital storefront',
                    'No external ad systems required',
                ],
                icon: Monitor,
                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                redirectRoute: '/advertising',
            },
            {
                id: 'dt-invoice',
                name: 'Business Invoice',
                description: 'Create, send, and manage invoices through a streamlined billing workflow.',
                features: [
                    'Generate professional invoices directly from the platform',
                    'Track payments and organize customer records',
                    'Manage recurring charges with more clarity',
                    'Keep billing connected to customer data',
                ],
                icon: FilePen,
                color: 'from-[#4cc7e8] to-[#2a8dcc]',
                redirectRoute: '/InvoiceContract',
            },
            {
                id: 'dt-crm',
                name: 'Email & SMS CRM',
                description: 'Manage conversations, follow-ups, and relationships from one centralized system.',
                features: [
                    'Send emails and SMS messages from one place',
                    'Organize contacts and track interactions',
                    'Communication is logged automatically',
                    'Turn outreach into a repeatable workflow',
                ],
                icon: MessageSquare,
                color: 'from-[#2a8dcc] to-[#2c7bbe]',
                redirectRoute: '/emailMarketing',
            },
            {
                id: 'dt-users',
                name: 'Unlimited Users',
                description: 'Scale your operations without limits by keeping teams, partners, and contributors connected.',
                features: [
                    'Add unlimited users to any digital tool',
                    'Keep everyone connected to the same data and workflows',
                    'Make coordination simple and transparent',
                    'Grow without worrying about account restrictions',
                ],
                icon: Users,
                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                redirectRoute: null,
            },
        ],
        []
    );

    const getProductPrice = useCallback(
        (product) => {
            if (!product.hasSubscription) {
                return `$${product.price}`;
            }
            return billingPeriod === 'monthly' ? `$${product.monthlyPrice}` : `$${product.yearlyPrice}`;
        },
        [billingPeriod]
    );

    const getProductPeriod = useCallback(
        (product) => {
            if (!product.hasSubscription) {
                return `/ ${product.period}`;
            }
            return billingPeriod === 'monthly' ? '/Month' : '/Year';
        },
        [billingPeriod]
    );

    const getSavingsPercentage = useCallback((product) => {
        if (!product.hasSubscription) return 0;
        const monthlyCost = product.monthlyPrice * 12;
        const yearlyCost = product.yearlyPrice;
        return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
    }, []);

    const fetchUserEmail = useCallback(async (userId) => {
        setIsLoadingEmail(true);
        try {
            const response = await axios.get(`/api/v2/getUserMail/?id=${userId}`);
            return response.data.email;
        } catch (error) {
            console.error('Error fetching:', error);
            return null;
        } finally {
            setIsLoadingEmail(false);
        }
    }, []);

    // eslint-disable-next-line
    const handlePurchase = useCallback(
        async (product) => {
            if (!isClient) return;
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setShowSignupModal(true);
                return;
            }

            if (isLoadingEmail) return;

            let role;
            switch (product.id) {
                case 'NewsLetter':
                    role = 'NewsLetter';
                    break;
                case 'InvoiceTool':
                    role = 'InvoiceTool';
                    break;
                case 'DigitalBillboard':
                    role = 'DigitalBillboard';
                    break;
                case 'Sales':
                    role = 'EmailMarketing';
                    break;
                default:
                    role = product.id;
            }

            try {
                const roleResponse = await axios.patch(`/api/v2/update-roles/?id=${userId}`, { rolesToAdd: role });
                if (roleResponse.data?.user?.roles) {
                    localStorage.setItem('roles', JSON.stringify(roleResponse.data.user.roles));
                }

                localStorage.setItem('productLink', product.productLink);
                localStorage.setItem('comission', product.productComission);

                const email = await fetchUserEmail(userId);
                if (!email) return;

                let productType = product.id;
                if (product.id === 'Sales') productType = 'EmailMarketing';

                const requestBody = {
                    id: Number(userId),
                    email,
                    productType,
                };

                if (product.hasSubscription) {
                    requestBody.period = billingPeriod;
                }

                const stripeResponse = await axios.post('/api/v1/stripe', requestBody);
                window.location.href = stripeResponse.data.data;
            } catch (error) {
                console.error('Error in handlePurchase:', error);
            }
        },
        [billingPeriod, fetchUserEmail, isClient, isLoadingEmail]
    );

    const handleUnsubscribe = useCallback((product) => {
        setSelectedProduct(product);
        setShowConfirmModal(true);
    }, []);

    const confirmUnsubscribe = useCallback(async () => {
        if (isLoadingUnsubscribe || !selectedProduct) return;

        const cookies = parseCookies();
        const id = cookies.id;
        if (!id) return;

        setIsLoadingUnsubscribe(true);
        try {
            const response = await axios.post(`/api/v2/cancel-subscription?id=${id}`, {
                product: selectedProduct.id,
            });

            if (response.status === 200) {
                setShowConfirmModal(false);
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    router.push('/');
                }, 3000);
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        } finally {
            setIsLoadingUnsubscribe(false);
        }
    }, [isLoadingUnsubscribe, selectedProduct, router]);

    const handleBillingPeriodToggle = useCallback(() => {
        setBillingPeriod((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'));
    }, []);

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* ── Hero Section ─────────────────────────────────────────── */}
            <section className='relative pt-16 sm:pt-20 md:pt-24 pb-5 sm:pb-7 px-4 sm:px-6 md:px-8'>
                <div className='container max-w-8xl mx-auto'>
                    <div className='grid lg:grid-cols-1 gap-8 sm:gap-12 md:gap-16 lg:gap-20'>
                        <div>
                            <div className='inline-block'>
                                <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Pricing</span>
                                </h1>
                            </div>
                            <p className='text-lg sm:text-xl text-gray-300 max-w-3xl leading-relaxed mb-8'>
                                Discover our comprehensive suite of trading tools, educational resources, and premium services designed to elevate your trading
                                success.
                            </p>
                        </div>
                    </div>

                    {/* Billing Toggle */}
                    <div className='flex items-center justify-center gap-4 mt-10 sm:mt-14'>
                        <span
                            className={`text-base font-semibold transition-colors duration-300 ${
                                billingPeriod === 'monthly' ? 'text-[#4cc7e8]' : 'text-gray-400'
                            }`}
                        >
                            Monthly
                        </span>
                        <button
                            onClick={handleBillingPeriodToggle}
                            className='relative w-16 h-8 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#4cc7e8]/30 focus:outline-none focus:ring-2 focus:ring-[#4cc7e8]/50 focus:ring-offset-2 focus:ring-offset-[#050608]'
                            aria-label={`Switch to ${billingPeriod === 'monthly' ? 'yearly' : 'monthly'} billing`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                                    billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-0'
                                }`}
                            ></div>
                        </button>
                        <span
                            className={`text-base font-semibold transition-colors duration-300 ${
                                billingPeriod === 'yearly' ? 'text-[#4cc7e8]' : 'text-gray-400'
                            }`}
                        >
                            Yearly
                        </span>
                    </div>
                </div>
            </section>

            {/* ── Products Grid ─────────────────────────────────────────── */}
            <section className='px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-6 sm:gap-8 pricing-grid pt-5 md:px-8 pb:10 sm:pb-16'>
                        {products.map((product, index) => {
                            const isPurchased = purchasedProducts[product.apiName] === 'Purchased';
                            const savings = getSavingsPercentage(product);

                            return (
                                <div key={product.id} className='group animate-slide-in-up' style={{ animationDelay: `${index * 200}ms` }}>
                                    <Card
                                        className={`bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 ${
                                            isPurchased
                                                ? 'border-green-500/50 shadow-green-500/20'
                                                : product.available
                                                ? 'border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 cursor-pointer'
                                                : 'border-gray-600/30 opacity-70'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                                                isPurchased ? 'from-green-400 to-emerald-500' : product.color
                                            }`}
                                        ></div>

                                        <CardHeader className='p-6 sm:p-8 pb-4'>
                                            <div className='flex items-center justify-between mb-6'>
                                                <div className='flex items-center space-x-4'>
                                                    <div
                                                        className={`min-w-14 min-h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${
                                                            isPurchased ? 'from-green-400 to-emerald-500' : product.color
                                                        } rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                                                            !product.available ? 'opacity-50' : ''
                                                        }`}
                                                    >
                                                        <product.icon className='min-w-7 min-h-7 sm:min-w-8 sm:min-h-8 text-white' />
                                                    </div>
                                                    <div>
                                                        <CardTitle className='text-xl sm:text-2xl font-black text-white'>{product.name}</CardTitle>
                                                        <p className='text-sm sm:text-base text-gray-400 mt-1'>{product.description}</p>
                                                    </div>
                                                </div>
                                                {product.popular && (
                                                    <Badge className='uppercase bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-4 py-1 text-xs'>
                                                        POPULAR
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className='text-center'>
                                                <div className='flex items-center justify-center gap-3'>
                                                    <div className={`text-4xl sm:text-5xl font-black ${isPurchased ? 'text-green-400' : 'text-[#4cc7e8]'}`}>
                                                        {getProductPrice(product)}
                                                        <span className='text-lg sm:text-2xl text-gray-400 ml-1'>{getProductPeriod(product)}</span>
                                                    </div>
                                                </div>
                                                {billingPeriod === 'yearly' && product.hasSubscription && savings > 0 && (
                                                    <p className='text-sm text-green-400 mt-2 font-semibold'>Save {savings}% with yearly billing</p>
                                                )}
                                                {product.available && <p className='text-xs sm:text-sm text-gray-500 mt-2'>VAT & local taxes may apply</p>}
                                            </div>
                                        </CardHeader>

                                        <CardContent className='p-6 sm:p-8 pt-0'>
                                            <div className='space-y-3 mb-8'>
                                                {product.features.map((feature, i) => (
                                                    <div
                                                        key={i}
                                                        className='flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 border border-[#2c7bbe]/20 group-hover:border-[#4cc7e8]/30 transition-all duration-300'
                                                    >
                                                        <CheckCircle
                                                            className={`w-5 h-5 text-green-400 flex-shrink-0 ${!product.available && 'text-gray-500'}`}
                                                        />
                                                        <span
                                                            className={`text-sm sm:text-base leading-relaxed ${
                                                                product.available ? 'text-gray-300' : 'text-gray-500'
                                                            }`}
                                                        >
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className='text-center'>
                                                {product.available ? (
                                                    isPurchased ? (
                                                        <Button
                                                            size='lg'
                                                            className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-800 text-white py-5 sm:py-6 text-base sm:text-lg font-bold shadow-2xl shadow-red-500/40 transition-all duration-300 transform hover:scale-105 rounded-lg'
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUnsubscribe(product);
                                                            }}
                                                            disabled={isLoadingUnsubscribe}
                                                        >
                                                            {isLoadingUnsubscribe ? 'Unsubscribing...' : 'Unsubscribe'}
                                                            {/* <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' /> */}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size='lg'
                                                            className={`cursor-pointer w-full bg-gradient-to-r ${product.color} hover:from-[#4cc7e8] hover:hover:to-[#2a8dcc] text-white py-5 sm:py-6 text-base sm:text-lg font-bold shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-2xl`}
                                                            onClick={() => {
                                                                router.push(product.redirectRoute);
                                                            }}
                                                            disabled={isLoadingEmail}
                                                        >
                                                            {/* <DollarSign className='w-5 h-5 sm:w-6 sm:h-6 mr-3' /> */}
                                                            {isLoadingEmail ? 'Loading...' : 'Learn More'}
                                                            {/* <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' /> */}
                                                        </Button>
                                                    )
                                                ) : (
                                                    <div className='w-full py-5 sm:py-6 text-center'>
                                                        <Badge className='uppercase bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold'>
                                                            <Clock className='w-5 h-5 mr-2' />
                                                            Coming Soon!
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>

                                        <div
                                            className={`absolute inset-0 bg-gradient-to-r ${product.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                                        ></div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Digital Tools Section ─────────────────────────────────── */}
            <section className='py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center max-w-4xl mx-auto mb-12'>
                        <Badge className='uppercase bg-[#2c7bbe] text-white mb-4 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide'>DIGITAL TOOLS</Badge>

                        <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4'>
                            One Platform. <span className='text-[#4cc7e8]'>Every Tool You Need.</span>
                        </h2>

                        <div className='space-y-4 text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed text-center'>
                            <p>
                                Our digital tools are built to help you communicate, promote, and manage operations through simple, connected systems.
                                Everything is designed around real usage, whether you’re sharing updates, advertising services, invoicing clients, or building
                                customer relationships. Instead of juggling multiple platforms, you operate from one unified environment. Each tool works
                                independently while becoming more powerful when combined.
                            </p>

                            <p>
                                These tools aren’t just about automation, they’re about clarity, reach, and measurable interaction. From newsletters to digital
                                advertising to billing and messaging, every feature is designed to help you stay organized and visible. You control your
                                communication, your customers, and your growth from one place. Simple tools, structured data, real results.
                            </p>
                        </div>
                    </div>

                    {/* Main tools */}
                    <div className='grid md:grid-cols-2 gap-6 mb-6'>
                        {digitalTools
                            .filter((tool) => tool.id !== 'dt-users')
                            .map((tool) => (
                                <Card
                                    key={tool.id}
                                    className='bg-[#0a0b0f] border border-[#1a2230] rounded-2xl shadow-none hover:border-[#2c7bbe] transition-colors duration-300'
                                >
                                    <CardContent className='p-6 sm:p-7'>
                                        <div className='flex items-start gap-4 mb-5'>
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center flex-shrink-0`}
                                            >
                                                <tool.icon className='w-6 h-6 text-white' />
                                            </div>

                                            <div>
                                                <h3 className='text-lg sm:text-xl font-semibold text-white'>{tool.name}</h3>
                                                <p className='text-sm sm:text-base text-gray-400 mt-1'>{tool.description}</p>
                                            </div>
                                        </div>

                                        <div className='space-y-3 mb-6'>
                                            {tool.features.map((feature, i) => (
                                                <div key={i} className='flex items-start gap-3'>
                                                    <CheckCircle className='w-4 h-4 text-[#4cc7e8] mt-1 flex-shrink-0' />
                                                    <span className='text-sm sm:text-base text-gray-300 leading-relaxed'>{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            size='lg'
                                            className='bg-[#2c7bbe] hover:bg-[#2567a3] text-white rounded-xl px-5'
                                            onClick={() => router.push(tool.redirectRoute)}
                                        >
                                            Open {tool.name}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>

                    {/* Unlimited Users - full width */}
                    {digitalTools
                        .filter((tool) => tool.id === 'dt-users')
                        .map((tool) => (
                            <Card
                                key={tool.id}
                                className='bg-[#0a0b0f] border border-[#1a2230] rounded-2xl shadow-none hover:border-[#2c7bbe] transition-colors duration-300'
                            >
                                <CardContent className='p-6 sm:p-8'>
                                    <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6'>
                                        <div className='flex-1'>
                                            <div className='flex items-start gap-4 mb-5'>
                                                <div
                                                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center flex-shrink-0`}
                                                >
                                                    <tool.icon className='w-6 h-6 text-white' />
                                                </div>

                                                <div>
                                                    <h3 className='text-xl sm:text-2xl font-semibold text-white'>{tool.name}</h3>
                                                    <p className='text-sm sm:text-base text-gray-400 mt-1'>{tool.description}</p>
                                                </div>
                                            </div>

                                            <div className='grid md:grid-cols-2 gap-3'>
                                                {tool.features.map((feature, i) => (
                                                    <div key={i} className='flex items-start gap-3'>
                                                        <CheckCircle className='w-4 h-4 text-[#4cc7e8] mt-1 flex-shrink-0' />
                                                        <span className='text-sm sm:text-base text-gray-300 leading-relaxed'>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className='lg:min-w-[240px]'>
                                            <Badge className='bg-[#111827] text-gray-200 border border-[#1f2937] px-4 py-2 rounded-lg'>
                                                Included With All Plans
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </section>

            {/* ── Features Comparison ───────────────────────────────────── */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            WHY CHOOSE BLACK SNOW
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Premium <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Digital Solutions</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Our comprehensive suite of products is designed to give you the competitive edge in today&apos;s dynamic markets.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-6 sm:gap-8'>
                        {[
                            {
                                icon: Target,
                                title: 'Precision Analytics',
                                description: 'Advanced market analysis and real-time data insights for informed decision making.',
                                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                            },
                            {
                                icon: Users,
                                title: 'Expert Community',
                                description: 'Connect with professional traders and learn from industry veterans.',
                                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                            },
                            {
                                icon: Zap,
                                title: 'Instant Execution',
                                description: 'Lightning-fast trade execution and real-time market notifications.',
                                color: 'from-[#4cc7e8] to-[#2a8dcc]',
                            },
                        ].map((feature, index) => (
                            <div key={index} className='group animate-slide-in-up' style={{ animationDelay: `${index * 150}ms` }}>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    <CardContent className='p-6 sm:p-8 text-center'>
                                        <div
                                            className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                        >
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

            {/* ── Signup Modal ──────────────────────────────────────────── */}
            <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowSignupModal(false)}
                        className='absolute right-4 top-4 w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-5 h-5 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>
                    <DialogHeader className='space-y-6 text-center'>
                        <div className='flex flex-col items-center'>
                            <div className='w-16 h-16 mb-4 p-2 border-2 border-[#2c7bbe] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Image
                                    src='/logocolored.png'
                                    alt='Black Snow Logo'
                                    width={100}
                                    height={100}
                                    className='object-contain drop-shadow-2xl'
                                    priority
                                />
                            </div>
                            <DialogTitle className='text-2xl font-black text-white'>Signup Required</DialogTitle>
                            <DialogDescription className='text-[#4cc7e8] font-semibold mt-2'>
                                You can&apos;t access this feature until you sign up.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className='py-4'>
                        <AuthModalTrigger
                            buttonText='Signup Now'
                            defaultView='signup'
                            sourceRoute='/pricing'
                            redirectAfterLogin='/pricing'
                            redirectAfterSignup='/pricing'
                        >
                            <Button className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold py-6 text-lg shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-2xl'>
                                Signup Now
                            </Button>
                        </AuthModalTrigger>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Confirm Unsubscribe Modal ─────────────────────────────── */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowConfirmModal(false)}
                        className='absolute right-4 top-4 w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-5 h-5 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>
                    <DialogHeader className='space-y-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl'>
                                <Calendar className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Confirm Unsubscribe</DialogTitle>
                                <DialogDescription className='text-red-400 font-semibold'>
                                    Are you sure you want to unsubscribe from {selectedProduct?.name}?
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className='py-4 space-y-4'>
                        <p className='text-gray-300 text-center'>This action cannot be undone.</p>
                        <Button
                            onClick={confirmUnsubscribe}
                            className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-6 text-lg shadow-2xl shadow-red-500/40 transition-all duration-300 transform hover:scale-105 rounded-2xl'
                            disabled={isLoadingUnsubscribe}
                        >
                            {isLoadingUnsubscribe ? 'Processing...' : 'Confirm Unsubscribe'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Success Modal ─────────────────────────────────────────── */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowSuccessModal(false)}
                        className='absolute right-4 top-4 w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-5 h-5 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>
                    <DialogHeader className='space-y-6 text-center'>
                        <div className='flex flex-col items-center'>
                            <div className='w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl mb-4'>
                                <CheckCircle className='w-8 h-8 text-white' />
                            </div>
                            <DialogTitle className='text-2xl font-black text-white'>Unsubscribed Successfully</DialogTitle>
                            <DialogDescription className='text-green-400 font-semibold'>You have been removed from the plan.</DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className='py-4 text-center'>
                        <p className='text-gray-300'>Redirecting to home page...</p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Global Styles ─────────────────────────────────────────── */}
            <style jsx global>{`
                @keyframes slide-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.6s ease-out forwards;
                }
                @keyframes slide-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-in-up {
                    animation: slide-in-up 0.5s ease-out forwards;
                    animation-fill-mode: both;
                }
                .pricing-grid {
                    contain: layout style paint;
                }
                button,
                .transition-all {
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 300ms;
                }
                .lottie-container {
                    backface-visibility: hidden;
                    transform: translateZ(0);
                    will-change: transform;
                }
            `}</style>
        </div>
    );
}

export { Pricing };
