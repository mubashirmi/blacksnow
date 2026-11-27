'use client';

import { FeedbackUnsubscribeButtons } from '@/components/unsubscribe-flow';
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Clock, CreditCard, Eye, Headphones, Shield, Users } from 'lucide-react';
import { Michroma } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
const michroma = Michroma({ subsets: ['latin'], weight: '400' });

const slides = [
    {
        icon: Headphones,
        title: 'Elite Customer Care',
        kicker: 'How We Support You',
        description: 'Get personalized assistance for your account, subscription, and use of Black Snow services.',
        features: [
            'Personalized guidance',
            'Clear communication',
            'Multiple contact options',
            'Responsive assistance',
            'Help with account questions',
            'Guidance on product benefits',
        ],
        panelTitle: 'Support that listens',
        panelBody: 'Our specialists aim to understand your needs and provide straightforward guidance on the options available.',
        panelPoints: ['Personalized assistance', 'Quick response focus', 'Transparent explanations'],
        action: 'Read Our FAQs',
        href: '/faq',
        account: false,
    },
    {
        icon: Eye,
        title: 'Clear Guidance',
        kicker: 'Know Your Options',
        description: 'Understand your plan, product access, and billing information through clear explanations and support.',
        features: [
            'Billing explanations',
            'Plan information',
            'Help with product access',
            'Straightforward next steps',
            'Monthly and annual plans',
            'Understand subscription benefits',
        ],
        panelTitle: 'Know where you stand',
        panelBody: 'We aim to make subscriptions easier to understand, with simple information about benefits and account choices.',
        panelPoints: ['Transparency and clarity', 'Helpful account information', 'Access to FAQs'],
        action: 'Explore FAQs',
        href: '/faq',
        account: false,
    },
    {
        icon: CreditCard,
        title: 'Manage Feedback & Access',
        kicker: 'Account Controls',
        description: 'Share feedback with our team or securely review the products and subscriptions linked to your account.',
        features: [
            'Send feedback',
            'Review subscriptions',
            'Verify account ownership',
            'Manage access securely',
            'Access from billing emails',
            'Review linked products',
        ],
        panelTitle: 'Feedback & subscription controls',
        panelBody: 'Use the existing account controls below. We verify your login before displaying your subscription details.',
        panelPoints: [],
        action: 'Manage Your Account',
        href: '',
        account: true,
    },
    {
        icon: Shield,
        title: 'Our Commitment',
        kicker: 'Always Client-Focused',
        description: 'Your trust matters. We aim to handle support requests with care, professionalism, and clear communication.',
        features: [
            'Professional service',
            'Respect for your time',
            'Clear information',
            'Thoughtful assistance',
            'Respect your preferences',
            'Support across channels',
        ],
        panelTitle: 'Here to help',
        panelBody: 'From answering a simple question to helping you understand a plan, our aim is to make every interaction useful.',
        panelPoints: ['Helpful information', 'Responsible assistance', 'Commitment to clarity'],
        action: 'Visit Help & FAQs',
        href: '/faq',
        account: false,
    },
];
const valueCards = [
    { icon: Users, title: 'Personal Care', description: 'Guidance tailored to your questions.' },
    { icon: Clock, title: 'Quick Responses', description: 'We aim to help as promptly as we can.' },
    { icon: Shield, title: 'Secure Access', description: 'Account verification protects plan details.' },
    { icon: CreditCard, title: 'Flexible Plans', description: 'Review monthly and annual options.' },
];
export default function Page() {
    const [activeSlide, setActiveSlide] = useState(0);
    const openAccountControls = () => {
        setActiveSlide(2);
        document.getElementById('support-overview')?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className='relative min-h-screen isolate overflow-hidden bg-[#050608] text-white'>
            <section className='relative z-10 px-4 pb-8 pt-12 sm:px-6 sm:pt-16 md:px-8 lg:pb-10'>
                <div className='mx-auto max-w-[1380px]'>
                    <div className='grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14'>
                        <div className='relative isolate z-10 animate-slide-in-left'>
                            <h1
                                className={`${michroma.className} max-w-3xl text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.32] min-[1100px]:leading-[1.34] tracking-tight text-white`}
                            >
                                <span className='block lg:whitespace-nowrap'>Elite Support.</span>
                                <span className='block text-[#4333AF] lg:whitespace-nowrap'>Here To Help.</span>
                            </h1>
                            <p className='mt-7 max-w-xl text-base leading-8 text-gray-300 sm:text-lg'>
                                Find clear answers, get help with your account, and manage subscriptions through Black Snow customer support.
                            </p>
                            <div className='mt-8 flex flex-wrap items-center gap-4'>
                                <button
                                    type='button'
                                    onClick={openAccountControls}
                                    className='flex h-14 items-center justify-center gap-3 rounded-full bg-[#4333AF] px-6 text-base font-semibold text-white transition-colors hover:bg-[#38299B]'
                                >
                                    Manage My Account <ArrowRight className='h-5 w-5 shrink-0' />
                                </button>
                                <Link
                                    href='/faq'
                                    className='flex h-14 items-center justify-center rounded-full border border-[#414A5D] bg-[#0C0F18] px-6 text-base font-semibold text-white transition-colors hover:border-[#4333AF]/50'
                                >
                                    Browse FAQs
                                </Link>
                            </div>
                        </div>
                        <div className='relative min-h-[300px] overflow-visible animate-slide-in-right sm:min-h-[420px] lg:min-h-[470px]'>
                            {/* The same localized glow and floating logo-card geometry as Pricing. */}
                            <div
                                aria-hidden='true'
                                className='pointer-events-none absolute left-1/2 top-[48%] z-0 h-[490px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(67,51,175,0.24)_0%,rgba(67,51,175,0.16)_36%,rgba(5,6,8,0)_77%)] blur-[52px] sm:h-[620px] sm:w-[790px] lg:left-[60%] lg:top-[52%] lg:h-[660px] lg:w-[900px] lg:blur-[65px]'
                            />
                            <div className='bs-info-hero-card relative z-20 top-4 mx-auto h-[255px] w-full max-w-[350px] rounded-[28px] border border-[#414A5D] bg-[#0C0F18] shadow-[0_32px_110px_-38px_rgba(67,51,175,0.42),0_22px_46px_-25px_rgba(0,0,0,0.85)] sm:top-6 sm:h-[310px] sm:max-w-[470px] lg:absolute lg:left-1/2 lg:top-16 lg:h-[335px] lg:w-full lg:max-w-[530px]'>
                                <div
                                    aria-hidden='true'
                                    className='pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_1px_0_rgba(67,51,175,0.13),inset_0_0_65px_rgba(67,51,175,0.05)]'
                                />
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
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section id='support-overview' className='relative z-10 overflow-hidden px-4 pb-10 sm:px-6 md:px-8'>
                <div className='relative mx-auto max-w-[1380px]'>
                    <div className='relative w-full overflow-hidden rounded-[28px] border border-[#414A5D] bg-[#0C0F18] shadow-[0_28px_110px_-40px_rgba(67,51,175,0.25),0_20px_65px_-35px_rgba(0,0,0,0.8)]'>
                        <div className='bs-info-slider-track relative z-10 flex w-full min-w-0' style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                            {slides.map((slide) => {
                                const SlideIcon = slide.icon;
                                return (
                                    <div key={slide.title} className='w-full min-w-full shrink-0 overflow-hidden'>
                                        <div className='grid w-full min-w-0 grid-cols-1 gap-6 px-4 pb-24 pt-6 sm:px-7 sm:pb-24 sm:pt-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)] lg:gap-8 lg:px-10 lg:pb-20 lg:pt-10 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.72fr)] xl:px-12 h-full lg:h-[480px] xl:h-[440px] lg:grid-rows-[minmax(0,1fr)]'>
                                            <div className='grid min-w-0 gap-5 md:grid-cols-[104px_1fr] md:gap-6 lg:min-h-0 lg:overflow-y-auto'>
                                                <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#414A5D] bg-[#0A0D14] sm:h-24 sm:w-24 md:mx-0'>
                                                    <SlideIcon className='h-9 w-9 text-[#4333AF] sm:h-11 sm:w-11' strokeWidth={1.8} />
                                                </div>
                                                <div className='flex min-w-0 flex-col text-center md:text-left'>
                                                    <p className='mb-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#4333AF]'>{slide.kicker}</p>
                                                    <h2
                                                        className={`${michroma.className} break-words text-xl leading-[1.32] tracking-[-0.02em] text-white sm:text-3xl lg:text-[clamp(1.5rem,2.25vw,2.25rem)]`}
                                                    >
                                                        {slide.title}
                                                    </h2>
                                                    <p className='mx-auto mt-3 max-w-2xl break-words text-sm leading-7 text-gray-300 sm:text-base md:mx-0'>
                                                        {slide.description}
                                                    </p>
                                                    <div className='mt-5 grid min-w-0 gap-3 sm:grid-cols-2 lg:flex-1 lg:auto-rows-fr'>
                                                        {slide.features.map((feature) => (
                                                            <div
                                                                key={feature}
                                                                className='flex min-w-0 items-center gap-3 rounded-xl border border-[#414A5D] bg-[#0A0D14] px-3 py-2.5 lg:gap-2 lg:px-2 lg:py-2 xl:gap-3 xl:px-3 xl:py-2.5 transition-colors duration-300 hover:border-[#4333AF]/50'
                                                            >
                                                                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#414A5D]'>
                                                                    <CheckCircle className='h-4 w-4 text-[#4333AF]' />
                                                                </span>
                                                                <span className='min-w-0 break-words text-left text-sm leading-6 text-gray-100 sm:text-base lg:text-sm lg:leading-5 xl:text-base xl:leading-6'>
                                                                    {feature}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flex w-full min-w-0 flex-col rounded-[24px] lg:min-h-0 lg:overflow-y-auto border border-[#414A5D] bg-[#0A0D14] px-4 py-5 shadow-[0_12px_48px_-26px_rgba(67,51,175,0.13)] sm:px-6 sm:py-6 lg:px-5 lg:py-4 xl:px-6'>
                                                <h3 className={`${michroma.className} text-base leading-[1.45] text-white sm:text-lg`}>{slide.panelTitle}</h3>
                                                <p className='mt-2 text-sm leading-5 text-gray-300'>{slide.panelBody}</p>
                                                {!slide.account && slide.panelPoints.length > 0 && (
                                                    <div className='mt-3 space-y-2 pb-4'>
                                                        {slide.panelPoints.map((point) => (
                                                            <div key={point} className='flex items-start gap-3 text-sm text-gray-200'>
                                                                <CheckCircle className='mt-0.5 h-4 w-4 shrink-0 text-[#4333AF]' />
                                                                {point}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {slide.account ? (
                                                    <div className='mt-4 grid w-full min-w-0 shrink-0 gap-2 [&>div]:!w-full [&>div]:!min-w-0 [&>div]:!flex-col [&>div]:!flex-wrap [&>div]:!items-stretch [&>div]:!gap-2 [&>button]:!w-full [&>button]:!min-w-0 [&>button]:!max-w-full [&>button]:whitespace-normal [&>div>button]:!w-full [&>div>button]:!min-w-0 [&>div>button]:!max-w-full [&>div>button]:whitespace-normal'>
                                                        <FeedbackUnsubscribeButtons size='section' />
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={slide.href}
                                                        className='mt-4 flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#4333AF] px-3 py-2 text-center text-sm font-black leading-snug text-white transition-colors duration-300 hover:bg-[#38299B] lg:mt-auto'
                                                    >
                                                        {slide.action}
                                                        <ArrowRight className='h-5 w-5 shrink-0' />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className='pointer-events-none absolute inset-x-0 bottom-5 z-20 flex items-center justify-between px-5 sm:px-7 lg:px-10'>
                            <button
                                type='button'
                                onClick={() => setActiveSlide((current) => (current - 1 + slides.length) % slides.length)}
                                className='pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#414A5D] bg-[#050608] text-gray-200 transition-colors duration-300 hover:border-[#4333AF]/50 hover:bg-[#0C0F18] hover:text-white'
                                aria-label='Previous slide'
                            >
                                <ChevronLeft className='h-5 w-5 text-[#4333AF]' />
                            </button>
                            <div className='pointer-events-auto hidden items-center justify-center gap-2 sm:flex'>
                                {slides.map((slide, index) => (
                                    <button
                                        key={slide.title}
                                        type='button'
                                        onClick={() => setActiveSlide(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            activeSlide === index ? 'w-8 bg-[#4333AF]' : 'w-2 bg-[#4333AF]/45 hover:bg-[#4333AF]/70'
                                        }`}
                                        aria-label={`Show ${slide.title}`}
                                        aria-current={activeSlide === index ? 'true' : undefined}
                                    />
                                ))}
                            </div>
                            <button
                                type='button'
                                onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
                                className='pointer-events-auto flex h-10 items-center gap-1 rounded-full border border-[#414A5D] bg-[#050608] px-4 text-sm font-semibold text-gray-200 transition-colors duration-300 hover:border-[#4333AF]/50 hover:bg-[#0C0F18] hover:text-white'
                                aria-label='Next slide'
                            >
                                Next <ChevronRight className='h-4 w-4 text-[#4333AF]' />
                            </button>
                        </div>
                    </div>
                    <div className='mt-10 flex items-center gap-4'>
                        <div className='h-px flex-1 bg-[#4333AF]/35' />
                        <p className={`${michroma.className} text-center text-[11px] leading-[1.6] uppercase tracking-[0.5em] text-[#4333AF]`}>
                            Support You Can Count On
                        </p>
                        <div className='h-px flex-1 bg-[#4333AF]/35' />
                    </div>
                    <div className='mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                        {valueCards.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className='rounded-2xl border border-[#414A5D] bg-[#0C0F18] shadow-[0_14px_55px_-30px_rgba(67,51,175,0.16)] transition-colors duration-300 hover:border-[#4333AF]/50 hover:bg-[#0C0F18]/80'
                            >
                                <div className='flex items-center gap-5 p-6'>
                                    <Icon className='h-12 w-12 shrink-0 text-[#4333AF]' aria-hidden='true' />
                                    <div>
                                        <h3 className={`${michroma.className} text-sm leading-6 text-white`}>{title}</h3>
                                        <p className='mt-2 text-sm leading-6 text-gray-400'>{description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <style jsx global>{`
                .bs-info-hero-card {
                    --bs-info-card-x: 0;
                    transform: translateX(var(--bs-info-card-x));
                    transform-style: preserve-3d;
                    animation: bs-info-float 5.5s ease-in-out infinite;
                }
                @media (min-width: 1024px) {
                    .bs-info-hero-card {
                        --bs-info-card-x: -50%;
                    }
                }
                .bs-info-slider-track {
                    transition: transform 780ms cubic-bezier(0.22, 1, 0.36, 1);
                    will-change: transform;
                }
                @media (prefers-reduced-motion: reduce) {
                    .bs-info-hero-card {
                        animation: none;
                    }
                    .bs-info-slider-track {
                        transition: none;
                    }
                }
                @keyframes bs-info-float {
                    0%,
                    100% {
                        transform: translateX(var(--bs-info-card-x)) translateY(0);
                    }
                    50% {
                        transform: translateX(var(--bs-info-card-x)) translateY(-12px);
                    }
                }
            `}</style>
        </div>
    );
}
