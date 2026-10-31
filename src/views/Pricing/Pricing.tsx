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

import Image from 'next/image';

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

                monthlyPrice: 9.99,

                yearlyPrice: 49.99,

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

                color: 'bg-[#2c7bbe]',

                available: true,

                popular: true,

                hasSubscription: true,

                redirectRoute: '/',
            },

            {
                id: 'InvoiceTool',

                name: 'Invoice & Contract',

                monthlyPrice: 24.99,

                yearlyPrice: 249.99,

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

                color: 'bg-[#2c7bbe]',

                available: true,

                popular: false,

                hasSubscription: true,

                redirectRoute: '/InvoiceContract',
            },

            {
                id: 'DigitalBillboard',

                name: 'Digital Billboard',

                monthlyPrice: 149.99,

                yearlyPrice: 599.99,

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

                color: 'bg-[#2c7bbe]',

                available: true,

                popular: false,

                hasSubscription: true,

                redirectRoute: '/advertising',
            },

            {
                id: 'Sales',

                name: 'Email CRM Lite',

                monthlyPrice: 249.99,

                yearlyPrice: 1999.99,

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

                color: 'bg-[#2c7bbe]',

                available: true,

                popular: false,

                hasSubscription: true,

                redirectRoute: '/emailMarketing',
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
                return product.period ? (['year', 'yearly', 'yr'].includes(String(product.period).toLowerCase()) ? '/yr' : '/mo') : '';
            }

            return billingPeriod === 'monthly' ? '/Mo' : '/Yr';
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

    const previousProduct = products[(activeProductIndex - 1 + products.length) % products.length];

    const nextProduct = products[(activeProductIndex + 1) % products.length];

    return (
        <div className='relative min-h-screen isolate overflow-hidden bg-[#050608] text-white'>
            {/* Subtle atmospheric lighting inspired by the previous pricing design. */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 z-0'
                style={{
                    background: [
                        'radial-gradient(ellipse 62% 36% at 81% 19%, rgba(24, 119, 158, 0.20), transparent 76%)',
                        'radial-gradient(ellipse 48% 38% at 5% 43%, rgba(25, 75, 137, 0.16), transparent 77%)',
                        'radial-gradient(ellipse 65% 38% at 54% 75%, rgba(22, 69, 125, 0.14), transparent 80%)',
                        'linear-gradient(135deg, #050608 0%, #08111a 49%, #050608 100%)',
                    ].join(', '),
                }}
            />

            {/* ── Hero Section ─────────────────────────────────────────── */}

            <section className='relative z-10 px-4 pb-8 pt-12 sm:px-6 sm:pt-16 md:px-8 lg:pb-10'>
                <div className='mx-auto max-w-[1380px]'>
                    <div className='grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14'>
                        <div className='relative isolate z-10 animate-slide-in-left'>
                            {/* Gentle, widely diffused blue lighting behind the hero copy. */}
                            <div
                                aria-hidden='true'
                                className='pointer-events-none absolute -left-[18%] top-[46%] -z-10 h-[390px] w-[530px] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(40,121,195,0.14)_0%,rgba(30,96,165,0.08)_42%,rgba(5,6,8,0)_78%)] blur-[46px] sm:h-[470px] sm:w-[650px] lg:-left-[24%] lg:h-[540px] lg:w-[720px]'
                            />

                            <h1
                                className={`${michroma.className} max-w-3xl text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-white`}
                            >
                                <span className='block lg:whitespace-nowrap'>Simple Pricing.</span>

                                <span className='block text-[#4cc7e8] lg:whitespace-nowrap'>Powerful Value.</span>
                            </h1>

                            <p className='mt-7 max-w-xl text-base leading-8 text-gray-300 sm:text-lg'>
                                Discover our comprehensive suite of trading tools, educational resources, and premium services designed to elevate your trading
                                success.
                            </p>

                            <div className='mt-8 flex flex-wrap items-center gap-4'>
                                <button
                                    type='button'
                                    onClick={handleBillingPeriodToggle}
                                    className='group flex h-14 items-center gap-4 rounded-full border border-[#2c7bbe]/30 bg-[#0a0b0f] px-5 transition-colors duration-300 hover:border-[#4cc7e8]/55'
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
                                        <span className='absolute inset-0 rounded-full bg-[#0e2747]'></span>

                                        <span
                                            className={`relative block h-8 w-8 rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
                            </div>
                        </div>

                        <div className='relative min-h-[300px] overflow-visible animate-slide-in-right sm:min-h-[420px] lg:min-h-[470px]'>
                            {/* Soft blue halo, fading naturally into the page background. */}
                            <div
                                aria-hidden='true'
                                className='pointer-events-none absolute left-1/2 top-[48%] z-0 h-[490px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(38,129,191,0.24)_0%,rgba(26,94,157,0.16)_36%,rgba(5,6,8,0)_77%)] blur-[52px] sm:h-[620px] sm:w-[790px] lg:left-[60%] lg:top-[52%] lg:h-[660px] lg:w-[900px] lg:blur-[65px]'
                            />

                            <div className='pricing-hero-card relative z-20 top-4 mx-auto h-[255px] w-full max-w-[350px] rounded-[28px] border border-[#4cc7e8]/30 bg-[linear-gradient(150deg,#101a23_0%,#090d12_49%,#0b1720_100%)] shadow-[0_32px_110px_-38px_rgba(25,112,168,0.42),0_22px_46px_-25px_rgba(0,0,0,0.85)] sm:top-6 sm:h-[310px] sm:max-w-[470px] lg:absolute lg:left-1/2 lg:top-16 lg:h-[335px] lg:w-[530px] lg:max-w-none'>
                                <div
                                    aria-hidden='true'
                                    className='pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_1px_0_rgba(145,220,255,0.13),inset_0_0_65px_rgba(35,106,150,0.05)]'
                                />
                                {/* Center the logo against the entire card, not the space below the chip. */}
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <div className='relative h-[72%] w-[82%] sm:h-[76%] sm:w-[84%]'>
                                        <Image
                                            src='/logocolored.png'
                                            alt='Black Snow Holdings logo'
                                            fill
                                            priority
                                            sizes='(max-width: 640px) 350px, 500px'
                                            className='object-contain'
                                        />
                                    </div>
                                </div>

                                {/* Half-size gold chip, centered vertically at the card's left edge. */}
                                <div className='pointer-events-none absolute left-6 top-1/2 z-10 -translate-y-1/2 sm:left-9'>
                                    <svg
                                        className='h-[21px] w-[28px] sm:h-[24px] sm:w-[32px]'
                                        viewBox='0 0 64 48'
                                        role='img'
                                        aria-label='Gold payment card chip'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <defs>
                                            <linearGradient id='pricing-gold-chip' x1='0%' y1='0%' x2='100%' y2='100%'>
                                                <stop offset='0%' stopColor='#FFF1BB' />
                                                <stop offset='34%' stopColor='#E8C46E' />
                                                <stop offset='70%' stopColor='#C99742' />
                                                <stop offset='100%' stopColor='#F6D88B' />
                                            </linearGradient>
                                        </defs>
                                        <rect x='1' y='1' width='62' height='46' rx='8' fill='url(#pricing-gold-chip)' stroke='#FFE1A0' strokeWidth='1.2' />
                                        <g fill='none' stroke='#9C7137' strokeWidth='1.5' strokeLinejoin='round' opacity='0.88'>
                                            <path d='M1 15 H18 M1 33 H18 M46 15 H63 M46 33 H63' />
                                            <path d='M18 1 V15 M46 1 V15 M18 33 V47 M46 33 V47' />
                                            <path d='M32 1 V14 M32 34 V47 M1 24 H18 M46 24 H63' />
                                            <rect x='18' y='14' width='28' height='20' rx='5' />
                                        </g>
                                        <rect x='21.5' y='17.5' width='21' height='13' rx='3.5' fill='none' stroke='#FFF1BA' strokeWidth='0.9' opacity='0.75' />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Animated Product Slider ───────────────────────────────── */}

            <section className='relative z-10 overflow-hidden px-4 pb-10 sm:px-6 md:px-8'>
                <div
                    aria-hidden='true'
                    className='pointer-events-none absolute left-1/2 top-0 h-[440px] w-[1100px] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,103,153,0.15)_0%,rgba(17,55,104,0.07)_51%,transparent_79%)] blur-[65px]'
                />
                <div className='relative mx-auto max-w-[1380px]'>
                    <div className='relative w-full overflow-hidden rounded-[28px] border border-[#2c7bbe]/35 bg-[linear-gradient(120deg,#0b1117_0%,#090b0f_55%,#0a1119_100%)] shadow-[0_28px_110px_-40px_rgba(30,111,165,0.25),0_20px_65px_-35px_rgba(0,0,0,0.8)]'>
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
                                                <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#4cc7e8]/35 bg-[#0a0b0f] transition-colors duration-300 hover:border-[#4cc7e8]/60 sm:h-24 sm:w-24 md:mx-0'>
                                                    <ProductIcon className='h-9 w-9 text-[#4cc7e8] sm:h-11 sm:w-11' strokeWidth={1.8} />
                                                </div>

                                                <div className='min-w-0 text-center md:text-left'>
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

                                            <div className='flex w-full min-w-0 flex-col justify-center rounded-[24px] border border-[#2c7bbe]/24 bg-[#050608] p-4 shadow-[0_12px_48px_-26px_rgba(44,123,190,0.13)] sm:p-6 lg:border-l lg:border-y-0 lg:border-r-0 lg:bg-transparent lg:py-2 lg:pl-8 lg:pr-0 lg:shadow-none'>
                                                <div className='flex min-w-0 flex-nowrap items-baseline gap-1 whitespace-nowrap sm:gap-2'>
                                                    <span
                                                        className={`${michroma.className} text-[clamp(1.65rem,7.5vw,2.7rem)] leading-none tracking-[-0.06em] text-white sm:text-5xl lg:text-[clamp(1.3rem,2.2vw,2.4rem)] xl:text-[clamp(2rem,2.6vw,3rem)]`}
                                                    >
                                                        {getProductPrice(product)}
                                                    </span>

                                                    <span className='shrink-0 whitespace-nowrap pb-0.5 font-medium text-sm text-gray-400 sm:pb-1 sm:text-base xl:text-lg'>
                                                        {getProductPeriod(product)}
                                                    </span>
                                                </div>

                                                {billingPeriod === 'yearly' && product.hasSubscription && savings > 0 && (
                                                    <p className='mt-3 text-sm font-semibold text-[#4cc7e8]'>Save {savings}% with yearly billing</p>
                                                )}

                                                {product.available && <p className='mt-4 text-sm text-gray-400'>VAT & local taxes may apply</p>}

                                                {product.available ? (
                                                    <Button
                                                        size='lg'
                                                        className={`mt-6 h-14 w-full cursor-pointer rounded-2xl ${product.color} text-sm font-black text-white transition-colors duration-300 hover:bg-[#3189c4] sm:h-16 sm:text-lg`}
                                                        onClick={() => goToProduct(product.redirectRoute)}
                                                    >
                                                        Get Started
                                                        <ArrowRight className='ml-3 h-5 w-5 sm:h-6 sm:w-6' />
                                                    </Button>
                                                ) : (
                                                    <div className='mt-6 w-full py-4 text-center'>
                                                        <Badge className='uppercase bg-gray-700 px-8 py-3 text-base font-bold text-white'>
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
                                className='pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#4cc7e8]/35 bg-[#050608] text-gray-200 transition-colors duration-300 hover:border-[#4cc7e8]/70 hover:bg-[#0a0b0f] hover:text-white'
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
                                className='pointer-events-auto flex h-10 items-center gap-1 rounded-full border border-[#4cc7e8]/35 bg-[#050608] px-4 text-sm font-semibold text-gray-200 transition-colors duration-300 hover:border-[#4cc7e8]/70 hover:bg-[#0a0b0f] hover:text-white'
                                aria-label={`Show ${nextProduct.name}`}
                            >
                                Next
                                <ChevronRight className='h-4 w-4 text-[#4cc7e8]' />
                            </button>
                        </div>
                    </div>

                    <div className='mt-10 flex items-center gap-4'>
                        <div className='h-px flex-1 bg-[#2c7bbe]/35'></div>

                        <p className={`${michroma.className} text-center text-[11px] uppercase tracking-[0.5em] text-[#4cc7e8]`}>Built For Serious Traders</p>

                        <div className='h-px flex-1 bg-[#2c7bbe]/35'></div>
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
                                className='rounded-2xl border border-[#2c7bbe]/20 bg-[#0a0b0f] shadow-[0_14px_55px_-30px_rgba(44,123,190,0.16)] transition-colors duration-300 hover:border-[#4cc7e8]/45 hover:bg-[#0a0b0f]/80'
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

            {/* ── Global Styles ─────────────────────────────────────────── */}

            <style jsx global>{`
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
