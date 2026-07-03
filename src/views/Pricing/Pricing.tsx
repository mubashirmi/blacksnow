'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ArrowRight,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    FilePen,
    Headphones,
    LockKeyhole,
    MessageSquare,
    Monitor,
    Newspaper,
    RefreshCw,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { Michroma } from 'next/font/google';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';

const michroma = Michroma({
    subsets: ['latin'],
    weight: '400',
});

function Pricing() {
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const [activeProductIndex, setActiveProductIndex] = useState(0);
    const router = useRouter();

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
                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                available: true,
                popular: true,
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
                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                available: true,
                popular: false,
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
                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                available: true,
                popular: false,
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
                color: 'from-[#4cc7e8] to-[#2a8dcc]',
                available: true,
                popular: false,
                hasSubscription: true,
                redirectRoute: '/emailMarketing',
            },
        ],
        []
    );

    // const digitalTools = useMemo(
    //     () => [
    //         {
    //             id: 'dt-newsletter',
    //             name: 'Newsletter',
    //             description: 'Receive curated market updates and structured insight in one consistent format.',
    //             features: [
    //                 'Curated market updates delivered directly to you',
    //                 'Actionable intel and clear overviews',
    //                 'Stay informed on price movement, trends, and platform activity',
    //                 'Structured insight instead of information overload',
    //             ],
    //             icon: Newspaper,
    //             color: 'from-[#4cc7e8] to-[#2c7bbe]',
    //             redirectRoute: '/',
    //         },
    //         {
    //             id: 'dt-billboard',
    //             name: 'Digital Billboard',
    //             description: 'Promote your business, services, or content with a public-facing platform display.',
    //             features: [
    //                 'Showcase offers, announcements, or featured tools',
    //                 'Built for visibility, discovery, and engagement',
    //                 'Acts as a real-time digital storefront',
    //                 'No external ad systems required',
    //             ],
    //             icon: Monitor,
    //             color: 'from-[#2c7bbe] to-[#4cc7e8]',
    //             redirectRoute: '/advertising',
    //         },
    //         {
    //             id: 'dt-invoice',
    //             name: 'Business Invoice',
    //             description: 'Create, send, and manage invoices through a streamlined billing workflow.',
    //             features: [
    //                 'Generate professional invoices directly from the platform',
    //                 'Track payments and organize customer records',
    //                 'Manage recurring charges with more clarity',
    //                 'Keep billing connected to customer data',
    //             ],
    //             icon: FilePen,
    //             color: 'from-[#4cc7e8] to-[#2a8dcc]',
    //             redirectRoute: '/InvoiceContract',
    //         },
    //         {
    //             id: 'dt-crm',
    //             name: 'Email & SMS CRM',
    //             description: 'Manage conversations, follow-ups, and relationships from one centralized system.',
    //             features: [
    //                 'Send emails and SMS messages from one place',
    //                 'Organize contacts and track interactions',
    //                 'Communication is logged automatically',
    //                 'Turn outreach into a repeatable workflow',
    //             ],
    //             icon: MessageSquare,
    //             color: 'from-[#2a8dcc] to-[#2c7bbe]',
    //             redirectRoute: '/emailMarketing',
    //         },
    //         {
    //             id: 'dt-users',
    //             name: 'Unlimited Users',
    //             description: 'Scale your operations without limits by keeping teams, partners, and contributors connected.',
    //             features: [
    //                 'Add unlimited users to any digital tool',
    //                 'Keep everyone connected to the same data and workflows',
    //                 'Make coordination simple and transparent',
    //                 'Grow without worrying about account restrictions',
    //             ],
    //             icon: Users,
    //             color: 'from-[#4cc7e8] to-[#2c7bbe]',
    //             redirectRoute: null,
    //         },
    //     ],
    //     []
    // );

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

    const handleBillingPeriodToggle = useCallback(() => {
        setBillingPeriod((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'));
    }, []);

    const handleNextProduct = useCallback(() => {
        setActiveProductIndex((prev) => (prev + 1) % products.length);
    }, [products.length]);

    const handlePrevProduct = useCallback(() => {
        setActiveProductIndex((prev) => (prev - 1 + products.length) % products.length);
    }, [products.length]);

    const goToProduct = useCallback(
        (route) => {
            if (route) {
                router.push(route);
            }
        },
        [router]
    );

    const activeProduct = products[activeProductIndex];
    const previousProduct = products[(activeProductIndex - 1 + products.length) % products.length];
    const nextProduct = products[(activeProductIndex + 1) % products.length];
    const activeSavings = getSavingsPercentage(activeProduct);
    const ActiveHeroIcon = activeProduct.icon;

    return (
        <div className='relative min-h-screen overflow-hidden bg-[#050608] text-white'>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_12%,rgba(76,199,232,0.18),transparent_34%),radial-gradient(circle_at_12%_22%,rgba(44,123,190,0.16),transparent_30%),linear-gradient(180deg,#050608_0%,#0a0b0f_48%,#050608_100%)]'></div>
            <div className='pointer-events-none absolute inset-0 opacity-[0.045] pricing-grid-bg'></div>

            {/* ── Hero Section ─────────────────────────────────────────── */}
            <section className='relative px-4 pb-8 pt-12 sm:px-6 sm:pt-16 md:px-8 lg:pb-10'>
                <div className='mx-auto max-w-[1380px]'>
                    <div className='grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14'>
                        <div className='relative z-10 animate-slide-in-left'>
                            <h1
                                className={`${michroma.className} max-w-3xl text-4xl leading-[1.15] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl xl:text-7xl`}
                            >
                                <span className='block lg:whitespace-nowrap'>Simple Pricing.</span>
                                <span className='block bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent lg:whitespace-nowrap'>
                                    Powerful Value.
                                </span>
                            </h1>

                            <p className='mt-7 max-w-xl text-base leading-8 text-gray-300 sm:text-lg'>
                                Discover our comprehensive suite of trading tools, educational resources, and premium services designed to elevate your trading
                                success.
                            </p>

                            <div className='mt-8 flex flex-wrap items-center gap-4'>
                                <button
                                    type='button'
                                    onClick={handleBillingPeriodToggle}
                                    className='group flex h-14 items-center gap-4 rounded-full border border-[#2c7bbe]/30 bg-[#050608]/80 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_30px_rgba(44,123,190,0.12)] transition-all duration-300 hover:border-[#4cc7e8]/55 hover:shadow-[0_0_30px_rgba(76,199,232,0.16)]'
                                    aria-label={`Switch to ${billingPeriod === 'monthly' ? 'yearly' : 'monthly'} billing`}
                                >
                                    <span
                                        className={`text-base font-semibold transition-colors duration-300 ${
                                            billingPeriod === 'monthly' ? 'text-[#4cc7e8]' : 'text-gray-400'
                                        }`}
                                    >
                                        Monthly
                                    </span>

                                    <span className='relative h-10 w-[76px] rounded-full border border-[#2c7bbe]/40 bg-[#0a0b0f] p-1'>
                                        <span className='absolute inset-0 rounded-full bg-gradient-to-r from-[#0e2747] to-[#1e4f85] opacity-90'></span>
                                        <span
                                            className={`relative block h-8 w-8 rounded-full bg-white shadow-[0_0_20px_rgba(76,199,232,0.42)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                billingPeriod === 'yearly' ? 'translate-x-9' : 'translate-x-0'
                                            }`}
                                        ></span>
                                    </span>

                                    <span
                                        className={`text-base font-semibold transition-colors duration-300 ${
                                            billingPeriod === 'yearly' ? 'text-[#4cc7e8]' : 'text-gray-400'
                                        }`}
                                    >
                                        Yearly
                                    </span>
                                </button>

                                {activeProduct.hasSubscription && activeSavings > 0 && (
                                    <span className='rounded-full border border-[#4cc7e8]/30 bg-[#050608]/70 px-5 py-3 text-sm font-semibold text-[#4cc7e8] shadow-[0_0_25px_rgba(76,199,232,0.12)]'>
                                        Save {activeSavings}%
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className='relative min-h-[300px] overflow-visible animate-slide-in-right sm:min-h-[420px] lg:min-h-[470px]'>
                            <div className='absolute inset-0 rounded-full border border-[#2c7bbe]/20 bg-[#07101c]/20 blur-sm'></div>

                            <div className='pricing-hero-card relative top-0 mx-auto h-[255px] w-full max-w-[350px] rounded-[28px] border border-[#4cc7e8]/35 bg-[#050608]/75 shadow-[0_0_70px_rgba(44,123,190,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:h-[310px] sm:max-w-[470px] lg:absolute lg:left-1/2 lg:top-7 lg:h-[335px] lg:w-[530px] lg:max-w-none'>
                                <div className='absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(76,199,232,0.09),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]'></div>

                                <div className='absolute left-6 top-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4cc7e8]/35 bg-transparent shadow-[0_0_28px_rgba(76,199,232,0.13)] sm:left-8 sm:top-8 sm:h-20 sm:w-20'>
                                    <ActiveHeroIcon className='h-8 w-8 text-[#4cc7e8] sm:h-10 sm:w-10' />
                                </div>

                                <div className='absolute right-4 top-4 rounded-xl border border-[#4cc7e8]/35 bg-[#050608]/85 px-3 py-2 shadow-[0_0_35px_rgba(76,199,232,0.18)] sm:right-[-18px] sm:top-8 sm:px-4 sm:py-3 lg:right-[-30px]'>
                                    <div className={`${michroma.className} text-sm text-[#4cc7e8] sm:text-base`}>+{activeSavings || 28}.6%</div>
                                    <div className='mt-1 text-xs text-gray-300'>YTD Value</div>
                                </div>

                                <div className='absolute bottom-7 left-6 right-6 top-28 sm:bottom-9 sm:left-9 sm:right-9 sm:top-32'>
                                    <div className='pricing-chart-grid absolute inset-0 rounded-2xl opacity-45'></div>
                                    <svg viewBox='0 0 520 220' className='absolute inset-0 h-full w-full overflow-visible'>
                                        <defs>
                                            <linearGradient id='pricingLineGradient' x1='0' x2='1' y1='0' y2='0'>
                                                <stop offset='0%' stopColor='#4cc7e8' />
                                                <stop offset='50%' stopColor='#2c7bbe' />
                                                <stop offset='100%' stopColor='#4cc7e8' />
                                            </linearGradient>
                                            <filter id='pricingLineGlow'>
                                                <feGaussianBlur stdDeviation='5' result='coloredBlur' />
                                                <feMerge>
                                                    <feMergeNode in='coloredBlur' />
                                                    <feMergeNode in='SourceGraphic' />
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <path
                                            d='M5 178 C55 165, 70 105, 126 120 C178 134, 184 62, 242 72 C300 82, 298 24, 360 36 C413 46, 420 10, 515 16'
                                            fill='none'
                                            stroke='url(#pricingLineGradient)'
                                            strokeWidth='5'
                                            strokeLinecap='round'
                                            filter='url(#pricingLineGlow)'
                                        />
                                        <path
                                            d='M5 178 C55 165, 70 105, 126 120 C178 134, 184 62, 242 72 C300 82, 298 24, 360 36 C413 46, 420 10, 515 16 L515 220 L5 220 Z'
                                            fill='url(#pricingLineGradient)'
                                            opacity='0.12'
                                        />
                                    </svg>
                                </div>

                                <div className='absolute -bottom-9 left-1/2 h-12 w-[78%] -translate-x-1/2 rounded-[100%] bg-[#4cc7e8]/16 blur-2xl'></div>
                            </div>

                            <div className='absolute bottom-7 left-[4%] hidden h-44 items-end gap-4 md:flex'>
                                {[40, 76, 116, 154].map((height, index) => (
                                    <div
                                        key={index}
                                        className='w-6 rounded-t-md border border-[#4cc7e8]/25 bg-gradient-to-t from-[#0e2747] to-[#2c7bbe]/80 shadow-[0_0_20px_rgba(76,199,232,0.12)]'
                                        style={{ height: `${height}px` }}
                                    ></div>
                                ))}
                            </div>

                            <div className='absolute bottom-7 right-[3%] hidden h-56 items-end gap-4 md:flex'>
                                {[88, 122, 164, 206].map((height, index) => (
                                    <div
                                        key={index}
                                        className='w-7 rounded-t-md border border-[#4cc7e8]/25 bg-gradient-to-t from-[#0e2747] to-[#2c7bbe]/80 shadow-[0_0_20px_rgba(76,199,232,0.12)]'
                                        style={{ height: `${height}px` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Animated Product Slider ───────────────────────────────── */}
            <section className='relative overflow-hidden px-4 pb-10 sm:px-6 md:px-8'>
                <div className='mx-auto max-w-[1380px]'>
                    <div className='relative w-full overflow-hidden rounded-[28px] border border-[#2c7bbe]/35 bg-gradient-to-br from-[#050608]/92 via-[#0a0b0f]/96 to-[#050608]/98 shadow-[0_0_80px_rgba(44,123,190,0.16),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl'>
                        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(76,199,232,0.13),transparent_28%),radial-gradient(circle_at_86%_50%,rgba(44,123,190,0.12),transparent_32%)]'></div>
                        <div className='pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#4cc7e8]/55 to-transparent'></div>

                        <div
                            className='pricing-slider-track relative z-10 flex w-full min-w-0'
                            style={{
                                transform: `translateX(-${activeProductIndex * 100}%)`,
                            }}
                        >
                            {products.map((product) => {
                                const ProductIcon = product.icon;
                                const savings = getSavingsPercentage(product);

                                return (
                                    <div key={product.id} className='w-full min-w-full shrink-0 overflow-hidden'>
                                        <div className='grid w-full min-w-0 grid-cols-1 gap-6 px-4 pb-24 pt-6 sm:px-7 sm:pb-24 sm:pt-8 lg:grid-cols-[1.6fr_0.6fr] lg:gap-8 lg:px-10 lg:pb-20 lg:pt-10 xl:px-12'>
                                            <div className='grid min-w-0 gap-5 md:grid-cols-[104px_1fr] md:gap-6'>
                                                <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#4cc7e8]/35 bg-transparent shadow-[0_0_32px_rgba(76,199,232,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:border-[#4cc7e8]/60 hover:shadow-[0_0_42px_rgba(76,199,232,0.2)] sm:h-24 sm:w-24 md:mx-0'>
                                                    <ProductIcon className='h-9 w-9 text-[#4cc7e8] sm:h-11 sm:w-11' strokeWidth={1.8} />
                                                </div>

                                                <div className='min-w-0 text-center md:text-left'>
                                                    {/* <div className='mb-3 flex flex-wrap items-center gap-3'>
                                                        <span className={`${michroma.className} text-[11px] uppercase tracking-[0.42em] text-[#4cc7e8]`}>
                                                            {product.name}
                                                        </span>

                                                        {product.popular && (
                                                            <Badge className='border border-[#4cc7e8]/30 bg-[#4cc7e8]/10 px-3 py-1 text-xs font-bold text-[#4cc7e8] hover:bg-[#4cc7e8]/15'>
                                                                POPULAR
                                                            </Badge>
                                                        )}
                                                    </div> */}

                                                    <h2
                                                        className={`${michroma.className} break-words text-xl leading-tight tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl`}
                                                    >
                                                        {product.name}
                                                    </h2>

                                                    <p className='mx-auto mt-3 max-w-2xl break-words text-sm leading-7 text-gray-300 sm:text-base md:mx-0'>
                                                        {product.description}
                                                    </p>

                                                    <div className='mt-6 grid min-w-0 gap-3 md:grid-cols-2'>
                                                        {product.features.map((feature, i) => (
                                                            <div
                                                                key={i}
                                                                className='flex min-w-0 items-start gap-3 rounded-xl border border-[#2c7bbe]/15 bg-white/[0.025] px-3 py-2.5 transition-all duration-300 hover:border-[#4cc7e8]/35 hover:bg-[#4cc7e8]/[0.04]'
                                                            >
                                                                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#4cc7e8]/50 bg-transparent'>
                                                                    <CheckCircle className='h-4 w-4 text-[#4cc7e8]' />
                                                                </span>
                                                                <span className='min-w-0 break-words text-left text-sm leading-6 text-gray-100 sm:text-base'>
                                                                    {feature}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex w-full min-w-0 flex-col justify-center rounded-[24px] border border-[#2c7bbe]/24 bg-[#050608]/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6 lg:border-l lg:border-y-0 lg:border-r-0 lg:bg-transparent lg:py-2 lg:pl-8 lg:pr-0 lg:shadow-none'>
                                                <div className='flex min-w-0 flex-wrap items-end gap-1 sm:gap-2'>
                                                    <span
                                                        className={`${michroma.className} text-[2.7rem] leading-none tracking-[-0.06em] text-white sm:text-5xl xl:text-6xl`}
                                                    >
                                                        {getProductPrice(product)}
                                                    </span>
                                                    <span className='pb-1 text-base text-gray-300 sm:pb-2 sm:text-xl'>{getProductPeriod(product)}</span>
                                                </div>

                                                {billingPeriod === 'yearly' && product.hasSubscription && savings > 0 && (
                                                    <p className='mt-3 text-sm font-semibold text-[#4cc7e8]'>Save {savings}% with yearly billing</p>
                                                )}

                                                {product.available && <p className='mt-4 text-sm text-gray-400'>VAT & local taxes may apply</p>}

                                                {product.available ? (
                                                    <Button
                                                        size='lg'
                                                        className={`mt-6 h-14 w-full cursor-pointer rounded-2xl bg-gradient-to-r ${product.color} text-sm font-black text-white shadow-[0_0_40px_rgba(44,123,190,0.32)] transition-all duration-300 hover:scale-[1.02] hover:from-[#4cc7e8] hover:to-[#2c7bbe] sm:h-16 sm:text-lg`}
                                                        onClick={() => goToProduct(product.redirectRoute)}
                                                    >
                                                        Get Started
                                                        <ArrowRight className='ml-3 h-5 w-5 sm:h-6 sm:w-6' />
                                                    </Button>
                                                ) : (
                                                    <div className='mt-6 w-full py-4 text-center'>
                                                        <Badge className='uppercase bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-3 text-base font-bold text-white'>
                                                            <Clock className='mr-2 h-5 w-5' />
                                                            Coming Soon!
                                                        </Badge>
                                                    </div>
                                                )}

                                                <div className='mt-4 flex min-w-0 items-start gap-3 text-sm text-gray-400'>
                                                    <LockKeyhole className='h-5 w-5 text-[#4cc7e8]' />
                                                    <span className='min-w-0 break-words leading-6'>Secure payments. Cancel anytime.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className='pointer-events-none absolute inset-x-0 bottom-5 z-20 flex items-center justify-between px-5 sm:px-7 lg:px-10'>
                            <button
                                type='button'
                                onClick={handlePrevProduct}
                                className='pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#4cc7e8]/35 bg-[#050608]/90 text-gray-200 shadow-[0_0_24px_rgba(44,123,190,0.16)] transition-all duration-300 hover:border-[#4cc7e8]/70 hover:bg-[#0a0b0f] hover:text-white'
                                aria-label={`Show ${previousProduct.name}`}
                            >
                                <ChevronLeft className='h-5 w-5 text-[#4cc7e8]' />
                            </button>

                            <div className='pointer-events-auto hidden items-center justify-center gap-2 sm:flex'>
                                {products.map((item, index) => (
                                    <button
                                        key={item.id}
                                        type='button'
                                        onClick={() => setActiveProductIndex(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            activeProductIndex === index ? 'w-8 bg-[#4cc7e8]' : 'w-2 bg-[#2c7bbe]/45 hover:bg-[#4cc7e8]/70'
                                        }`}
                                        aria-label={`Show ${item.name}`}
                                    ></button>
                                ))}
                            </div>

                            <button
                                type='button'
                                onClick={handleNextProduct}
                                className='pointer-events-auto flex h-10 items-center gap-1 rounded-full border border-[#4cc7e8]/35 bg-[#050608]/90 px-4 text-sm font-semibold text-gray-200 shadow-[0_0_24px_rgba(44,123,190,0.16)] transition-all duration-300 hover:border-[#4cc7e8]/70 hover:bg-[#0a0b0f] hover:text-white'
                                aria-label={`Show ${nextProduct.name}`}
                            >
                                Next
                                <ChevronRight className='h-4 w-4 text-[#4cc7e8]' />
                            </button>
                        </div>
                    </div>

                    <div className='mt-10 flex items-center gap-4'>
                        <div className='h-px flex-1 bg-gradient-to-r from-transparent via-[#2c7bbe]/45 to-[#2c7bbe]/45'></div>
                        <p className={`${michroma.className} text-center text-[11px] uppercase tracking-[0.5em] text-[#4cc7e8]`}>Built For Serious Traders</p>
                        <div className='h-px flex-1 bg-gradient-to-r from-[#2c7bbe]/45 via-[#2c7bbe]/45 to-transparent'></div>
                    </div>

                    <div className='mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                        {[
                            {
                                icon: ShieldCheck,
                                title: 'Secure Payments',
                                description: 'Your data is protected with bank-level security.',
                            },
                            {
                                icon: Zap,
                                title: 'Instant Access',
                                description: 'Get immediate access after sign up.',
                            },
                            {
                                icon: RefreshCw,
                                title: 'Cancel Anytime',
                                description: 'No long-term contracts. Cancel anytime.',
                            },
                            {
                                icon: Headphones,
                                title: '24/7 Support',
                                description: 'Our team is here to help you succeed.',
                            },
                        ].map((item) => (
                            <Card
                                key={item.title}
                                className='rounded-2xl border border-[#2c7bbe]/20 bg-[#050608]/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-[#4cc7e8]/45 hover:bg-[#0a0b0f]/80'
                            >
                                <CardContent className='flex items-center gap-5 p-6'>
                                    <item.icon className='h-12 w-12 shrink-0 text-[#4cc7e8]' />
                                    <div>
                                        <h3 className={`${michroma.className} text-sm leading-6 text-white`}>{item.title}</h3>
                                        <p className='mt-2 text-sm leading-6 text-gray-400'>{item.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Digital Tools Section ─────────────────────────────────── */}
            {/* <section className='relative px-4 py-14 sm:px-6 sm:py-20 md:px-8'>
                <div className='mx-auto max-w-[1280px]'>
                    <div className='mx-auto mb-12 max-w-4xl text-center'>
                        <div className='mb-4 inline-flex rounded-full border border-[#2c7bbe]/30 bg-[#071225]/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-[#5d7cff]'>
                            Digital Tools
                        </div>

                        <h2 className='text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl'>
                            One Platform. <span className='text-[#4cc7e8]'>Every Tool You Need.</span>
                        </h2>

                        <div className='mt-6 space-y-4 text-sm leading-7 text-slate-400 sm:text-base md:text-lg'>
                            <p>
                                Our digital tools are built to help you communicate, promote, and manage operations through simple, connected systems.
                                Everything is designed around real usage, whether you’re sharing updates, advertising services, invoicing clients, or building
                                customer relationships.
                            </p>

                            <p>
                                These tools aren’t just about automation, they’re about clarity, reach, and measurable interaction. From newsletters to digital
                                advertising to billing and messaging, every feature is designed to help you stay organized and visible.
                            </p>
                        </div>
                    </div>

                    <div className='grid gap-5 md:grid-cols-2'>
                        {digitalTools
                            .filter((tool) => tool.id !== 'dt-users')
                            .map((tool) => (
                                <Card
                                    key={tool.id}
                                    className='group overflow-hidden rounded-[26px] border border-[#1d2a42] bg-[#07101c]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#5d7cff]/50 hover:shadow-[0_0_45px_rgba(44,123,190,0.14)]'
                                >
                                    <CardContent className='p-6 sm:p-7'>
                                        <div className='mb-6 flex items-start gap-4'>
                                            <div
                                                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r ${tool.color} shadow-[0_0_30px_rgba(44,123,190,0.25)] transition-transform duration-300 group-hover:scale-110`}
                                            >
                                                <tool.icon className='h-7 w-7 text-white' />
                                            </div>

                                            <div>
                                                <h3 className='text-xl font-black text-white'>{tool.name}</h3>
                                                <p className='mt-2 text-sm leading-6 text-slate-400 sm:text-base'>{tool.description}</p>
                                            </div>
                                        </div>

                                        <div className='mb-7 space-y-3'>
                                            {tool.features.map((feature, i) => (
                                                <div key={i} className='flex items-start gap-3'>
                                                    <CheckCircle className='mt-1 h-4 w-4 shrink-0 text-[#4cc7e8]' />
                                                    <span className='text-sm leading-6 text-slate-300 sm:text-base'>{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            size='lg'
                                            className='rounded-xl bg-[#2c7bbe] px-5 text-white hover:bg-[#2567a3]'
                                            onClick={() => router.push(tool.redirectRoute)}
                                        >
                                            Open {tool.name}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>

                    {digitalTools
                        .filter((tool) => tool.id === 'dt-users')
                        .map((tool) => (
                            <Card
                                key={tool.id}
                                className='mt-5 rounded-[26px] border border-[#1d2a42] bg-[#07101c]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 hover:border-[#5d7cff]/50'
                            >
                                <CardContent className='p-6 sm:p-8'>
                                    <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
                                        <div className='flex-1'>
                                            <div className='mb-6 flex items-start gap-4'>
                                                <div
                                                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r ${tool.color} shadow-[0_0_30px_rgba(44,123,190,0.25)]`}
                                                >
                                                    <tool.icon className='h-7 w-7 text-white' />
                                                </div>

                                                <div>
                                                    <h3 className='text-2xl font-black text-white'>{tool.name}</h3>
                                                    <p className='mt-2 text-sm leading-6 text-slate-400 sm:text-base'>{tool.description}</p>
                                                </div>
                                            </div>

                                            <div className='grid gap-3 md:grid-cols-2'>
                                                {tool.features.map((feature, i) => (
                                                    <div key={i} className='flex items-start gap-3'>
                                                        <CheckCircle className='mt-1 h-4 w-4 shrink-0 text-[#4cc7e8]' />
                                                        <span className='text-sm leading-6 text-slate-300 sm:text-base'>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className='lg:min-w-[240px]'>
                                            <Badge className='rounded-xl border border-[#5d7cff]/35 bg-[#111827] px-4 py-3 text-slate-200'>
                                                Included With All Plans
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </section> */}

            {/* ── Features Comparison ───────────────────────────────────── */}
            {/* <section className='relative px-4 py-14 sm:px-6 sm:py-20 md:px-8'>
                <div className='mx-auto max-w-[1280px]'>
                    <div className='mb-12 text-center'>
                        <h2 className='text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl'>
                            Premium{' '}
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Digital Solutions</span>
                        </h2>
                        <p className='mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg'>
                            Our comprehensive suite of products is designed to give you the competitive edge in today&apos;s dynamic markets.
                        </p>
                    </div>

                    <div className='grid gap-5 md:grid-cols-3'>
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
                                icon: TrendingUp,
                                title: 'Instant Execution',
                                description: 'Lightning-fast trade execution and real-time market notifications.',
                                color: 'from-[#4cc7e8] to-[#2a8dcc]',
                            },
                        ].map((feature, index) => (
                            <Card
                                key={index}
                                className='group h-full rounded-[26px] border border-[#1d2a42] bg-[#07101c]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#5d7cff]/50 hover:shadow-[0_0_45px_rgba(44,123,190,0.14)]'
                            >
                                <CardContent className='p-7 text-center sm:p-8'>
                                    <div
                                        className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color} shadow-[0_0_30px_rgba(44,123,190,0.25)] transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <feature.icon className='h-8 w-8 text-white' />
                                    </div>

                                    <h3 className='mb-4 text-xl font-black text-white transition-colors duration-300 group-hover:text-[#4cc7e8]'>
                                        {feature.title}
                                    </h3>

                                    <p className='text-sm leading-7 text-slate-400 sm:text-base'>{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* ── Global Styles ─────────────────────────────────────────── */}
            <style jsx global>{`
                .pricing-grid-bg {
                    background-image: linear-gradient(rgba(76, 199, 232, 0.16) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(76, 199, 232, 0.16) 1px, transparent 1px);
                    background-size: 72px 72px;
                    mask-image: radial-gradient(circle at 50% 10%, black, transparent 72%);
                }

                .pricing-chart-grid {
                    background-image: linear-gradient(rgba(76, 199, 232, 0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(76, 199, 232, 0.2) 1px, transparent 1px);
                    background-size: 54px 44px;
                }

                .pricing-hero-card {
                    --pricing-card-x: 0;
                    transform-style: preserve-3d;
                    animation: pricing-float 5.5s ease-in-out infinite;
                }

                @media (min-width: 1024px) {
                    .pricing-hero-card {
                        --pricing-card-x: -50%;
                    }
                }

                .pricing-slider-track {
                    transition: transform 780ms cubic-bezier(0.22, 1, 0.36, 1);
                    will-change: transform;
                }

                @keyframes pricing-float {
                    0%,
                    100% {
                        transform: translateX(var(--pricing-card-x)) translateY(0);
                    }
                    50% {
                        transform: translateX(var(--pricing-card-x)) translateY(-12px);
                    }
                }
            `}</style>
        </div>
    );
}

export { Pricing };
