'use client';

import { LottieAnimation } from '@/components/lottie-animation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import {
    ArrowRight,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Crown,
    Eye,
    EyeOff,
    FilePen,
    FileText,
    Lock,
    Mail,
    MessageSquare,
    Monitor,
    Newspaper,
    Phone,
    Shield,
    User,
    X,
    Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

// ── Snowflake config ──────────────────────────────────────────
const SNOWFLAKE_COUNT = 45;

const UNIFIED_CARD_HEIGHT = 580;

type Flake = {
    id: number;
    left: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
    drift: number;
    char: string;
};

type AuthFormValues = {
    fullName?: string;
    email: string;
    phone?: string;
    password: string;
    termsAccepted?: boolean;
};

type PendingSignupFlow = {
    user: any;
    role: string;
};

type ToolSlide = {
    id: string;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    description: string;
    features: string[];
    Icon: any;
    accent: string;
    gradient: string;
    available: boolean;
    popular: boolean;
    hasSubscription: boolean;
    redirectRoute: string;
};

const FLAKE_CHARS = ['❄', '❅', '❆', '*'];

function useSnowflakes() {
    return useMemo<Flake[]>(() => {
        return Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: Math.random() * 14 + 8,
            duration: Math.random() * 10 + 8,
            delay: Math.random() * 12,
            opacity: Math.random() * 0.45 + 0.15,
            drift: (Math.random() - 0.5) * 120,
            char: FLAKE_CHARS[Math.floor(Math.random() * FLAKE_CHARS.length)],
        }));
    }, []);
}

function Snowflakes() {
    const [clientReady, setClientReady] = useState(false);

    useEffect(() => {
        setClientReady(true);
    }, []);

    const flakes = useSnowflakes();

    if (!clientReady) return null;

    return (
        <>
            <style>{`
                @keyframes snowfall {
                    0%   { transform: translateY(-40px) translateX(0px) rotate(0deg); opacity: 0; }
                    5%   { opacity: 1; }
                    95%  { opacity: 0.6; }
                    100% { transform: translateY(110vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
                }
                .snowflake {
                    position: absolute;
                    top: 0;
                    pointer-events: none;
                    user-select: none;
                    animation: snowfall linear infinite;
                    will-change: transform, opacity;
                }
            `}</style>

            {flakes.map((f) => (
                <span
                    key={f.id}
                    className='snowflake'
                    style={
                        {
                            left: `${f.left}%`,
                            fontSize: `${f.size}px`,
                            animationDuration: `${f.duration}s`,
                            animationDelay: `${f.delay}s`,
                            opacity: f.opacity,
                            color: '#a8d8f0',
                            '--drift': `${f.drift}px`,
                        } as React.CSSProperties
                    }
                >
                    {f.char}
                </span>
            ))}
        </>
    );
}

// ── Existing signin carousel data ─────────────────────────────
const SLIDES = [
    {
        lottie: '/animations/papertradingicon.json',
        accent: '#5EDC7A',
        label: 'Paper Trading',
        subtitle: 'Stock Market Simulator',
        desc: 'Practice with real market data — zero risk, maximum learning.',
    },
    {
        lottie: '/animations/stockscreenericon.json',
        accent: '#F5A623',
        label: 'Stock Screener',
        subtitle: 'Market Analysis Tool',
        desc: 'Filter thousands of stocks and find your next winning trade.',
    },
    {
        lottie: '/animations/watchlisticon.json',
        accent: '#E74C3C',
        label: 'Watchlist',
        subtitle: 'Track Stock Performance',
        desc: 'Monitor your favourite stocks and never miss a move.',
    },
    {
        lottie: '/animations/globaleconomicindicatoricon.json',
        accent: '#4A90D9',
        label: 'Global Economic Indicators',
        subtitle: 'World Economic KPI Dashboard',
        desc: 'Stay informed on key economic metrics from across the globe.',
    },
];

// ── New slideshow shown after successful signup ───────────────
const POST_SIGNUP_SLIDES: ToolSlide[] = [
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
        Icon: Newspaper,
        accent: '#4cc7e8',
        gradient: 'from-[#4cc7e8] to-[#2c7bbe]',
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
        features: ['Instant Invoice Builder', 'Email Delivery', 'Invoice Dashboard', 'Create Invoice Contracts', 'Add Multiple Users', 'Recurring Invoices'],
        Icon: FilePen,
        accent: '#2c7bbe',
        gradient: 'from-[#2c7bbe] to-[#4cc7e8]',
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
        Icon: Monitor,
        accent: '#2a8dcc',
        gradient: 'from-[#4cc7e8] to-[#2a8dcc]',
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
        Icon: MessageSquare,
        accent: '#2c7bbe',
        gradient: 'from-[#2a8dcc] to-[#2c7bbe]',
        available: true,
        popular: false,
        hasSubscription: true,
        redirectRoute: '/emailMarketing',
    },
    {
        id: 'LightningSilver',
        name: 'Lightning Silver',
        monthlyPrice: 5,
        yearlyPrice: 60,
        description: '25% lifetime commissions on monthly and annual subscriptions',
        features: [
            '25% Lifetime Commissions',
            '$5/month Membership',
            'Monthly & Annual Payouts',
            'No Income Cap or Expiry',
            'Multi-Currency Global Payouts',
            'KPI Dashboard + CRM Tools',
        ],
        Icon: Zap,
        accent: '#c9d6e8',
        gradient: 'from-[#eef4ff] to-[#8fb6df]',
        available: true,
        popular: false,
        hasSubscription: true,
        redirectRoute: '/lightningSilver',
    },
    {
        id: 'LightningGold',
        name: 'Lightning Gold',
        monthlyPrice: 250,
        yearlyPrice: 3000,
        description: '75% lifetime commissions designed to maximize recurring payouts',
        features: [
            '75% Lifetime Commissions',
            '$250/month Membership',
            'Highest Commission Rate',
            'Higher Recurring Payouts',
            'Automated Global Payouts',
            'KPI Tracking + Email/SMS CRM',
        ],
        Icon: Crown,
        accent: '#f4c95d',
        gradient: 'from-[#f4c95d] to-[#c8941d]',
        available: true,
        popular: true,
        hasSubscription: true,
        redirectRoute: '/lightningGold',
    },
];

type ProductRole = 'EmailMarketing' | 'InvoiceTool' | 'NewsLetter' | 'DigitalBillboard' | 'LightningGold' | 'LightningSilver';

type RoleOption = {
    role: ProductRole;
    label: string;
    route: string;
    description: string;
    Icon: any;
    accent: string;
};

const ROLE_OPTIONS: Record<ProductRole, RoleOption> = {
    EmailMarketing: {
        role: 'EmailMarketing',
        label: 'Email/SMS CRM',
        route: '/emailMarketing/dashboard/users',
        description: 'Open your Email Marketing users dashboard.',
        Icon: MessageSquare,
        accent: '#2c7bbe',
    },
    InvoiceTool: {
        role: 'InvoiceTool',
        label: 'Invoice & Contract',
        route: '/invoicecontractdashboard/contract',
        description: 'Open the Invoice & Contract product page.',
        Icon: FilePen,
        accent: '#4cc7e8',
    },
    NewsLetter: {
        role: 'NewsLetter',
        label: 'Newsletter',
        route: '/',
        description: 'Open the Newsletter home experience.',
        Icon: Newspaper,
        accent: '#4cc7e8',
    },
    DigitalBillboard: {
        role: 'DigitalBillboard',
        label: 'Digital Billboard',
        route: '/digitalBillboard/dashboard',
        description: 'Open your Digital Billboard dashboard.',
        Icon: Monitor,
        accent: '#2a8dcc',
    },
    LightningGold: {
        role: 'LightningGold',
        label: 'Lightning Gold',
        route: '/superAffiliate/dashboard/kpi',
        description: 'Open your Lightning Gold KPI dashboard.',
        Icon: Crown,
        accent: '#f4c95d',
    },
    LightningSilver: {
        role: 'LightningSilver',
        label: 'Lightning Silver',
        route: '/affiliate/dashboard/kpi',
        description: 'Open your Lightning Silver KPI dashboard.',
        Icon: Zap,
        accent: '#c9d6e8',
    },
};

const NORMALIZED_PRODUCT_ROLES: Record<string, ProductRole> = {
    emailmarketing: 'EmailMarketing',
    invoicetool: 'InvoiceTool',
    newsletter: 'NewsLetter',
    digitalbillboard: 'DigitalBillboard',
    lightninggold: 'LightningGold',
    lightningsilver: 'LightningSilver',
};

function getRoleOptionsFromUserRoles(rawRoles: any[] = []) {
    const seen = new Set<ProductRole>();

    return rawRoles.reduce<RoleOption[]>((acc, rawRole) => {
        const normalized = String(rawRole || '')
            .trim()
            .toLowerCase();

        const role = NORMALIZED_PRODUCT_ROLES[normalized];

        if (!role || seen.has(role)) return acc;

        seen.add(role);
        acc.push(ROLE_OPTIONS[role]);

        return acc;
    }, []);
}

const DASHBOARD_ROLE_PRIORITY: ProductRole[] = ['DigitalBillboard', 'EmailMarketing', 'InvoiceTool', 'LightningGold', 'LightningSilver', 'NewsLetter'];

function getPriorityDashboardRoute(rawRoles: any[] = []) {
    const roleOptions = getRoleOptionsFromUserRoles(rawRoles);

    for (const priorityRole of DASHBOARD_ROLE_PRIORITY) {
        const matchedRoleOption = roleOptions.find((option) => option.role === priorityRole);

        if (matchedRoleOption) return matchedRoleOption.route;
    }

    return undefined;
}

function ProductCarousel() {
    const [current, setCurrent] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setVisible(false);

            window.setTimeout(() => {
                setCurrent((prev) => (prev + 1) % SLIDES.length);
                setVisible(true);
            }, 450);
        }, 3500);

        return () => clearInterval(timer);
    }, []);

    const { lottie, accent, label, subtitle, desc } = SLIDES[current];

    return (
        <div className='relative w-full h-full flex flex-col items-center justify-center px-10 py-12 select-none overflow-hidden'>
            <div
                className='pointer-events-none absolute inset-0 transition-all duration-1000'
                style={{ background: `radial-gradient(ellipse at 50% 45%, ${accent}1a 0%, transparent 68%)` }}
            />

            <div
                className='pointer-events-none absolute inset-0 opacity-[0.025]'
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                }}
            />

            <div
                className='relative z-10 flex flex-col items-center text-center'
                style={{
                    transition: 'opacity 0.45s ease, transform 0.45s ease',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0px)' : 'translateY(-20px)',
                }}
            >
                <div
                    className='mb-6 flex items-center justify-center'
                    style={{
                        filter: `drop-shadow(0 0 24px ${accent}66)`,
                        transition: 'filter 0.6s ease',
                    }}
                >
                    <LottieAnimation src={lottie} className='w-28 h-28' loop autoplay />
                </div>

                <h2 className='text-3xl font-black text-white leading-tight mb-2'>{label}</h2>

                <p className='text-sm font-semibold mb-4' style={{ color: accent }}>
                    {subtitle}
                </p>

                <p className='text-gray-400 text-sm leading-relaxed max-w-[220px]'>{desc}</p>
            </div>

            <div className='absolute bottom-8 flex items-center gap-2.5'>
                {SLIDES.map((s, i) => (
                    <button
                        key={s.label}
                        type='button'
                        onClick={() => {
                            setVisible(false);

                            window.setTimeout(() => {
                                setCurrent(i);
                                setVisible(true);
                            }, 450);
                        }}
                        className='rounded-full transition-all duration-500'
                        style={{
                            width: i === current ? 24 : 7,
                            height: 7,
                            backgroundColor: i === current ? SLIDES[current].accent : 'rgba(255,255,255,0.18)',
                        }}
                        aria-label={`Go to ${s.label}`}
                    />
                ))}
            </div>
        </div>
    );
}

function PostSignupToolsSlideshow() {
    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const [visible, setVisible] = useState(true);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');

    const slide = POST_SIGNUP_SLIDES[current];
    const isFirstSlide = current === 0;
    const isLastSlide = current === POST_SIGNUP_SLIDES.length - 1;
    const Icon = slide.Icon;

    const goToSlide = (nextIndex: number) => {
        if (nextIndex < 0 || nextIndex >= POST_SIGNUP_SLIDES.length || nextIndex === current) return;

        setDirection(nextIndex > current ? 'next' : 'prev');
        setVisible(false);

        window.setTimeout(() => {
            setCurrent(nextIndex);
            setVisible(true);
        }, 240);
    };

    return (
        <div className='relative z-10 w-full flex flex-col lg:flex-row' style={{ minHeight: UNIFIED_CARD_HEIGHT }}>
            <div className='relative flex-1 flex flex-col justify-center px-8 sm:px-10 py-16 lg:py-10 overflow-hidden'>
                <div
                    className='pointer-events-none absolute inset-0 transition-all duration-500'
                    style={{ background: `radial-gradient(ellipse at 50% 45%, ${slide.accent}1a 0%, transparent 68%)` }}
                />

                <div
                    className='pointer-events-none absolute inset-0 opacity-[0.025]'
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '36px 36px',
                    }}
                />

                <div
                    className='relative z-10 transition-all duration-300'
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateX(0)' : `translateX(${direction === 'next' ? '-18px' : '18px'})`,
                    }}
                >
                    <div
                        className={`mb-6 inline-flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br ${slide.gradient}`}
                        style={{ boxShadow: `0 0 28px ${slide.accent}44` }}
                    >
                        <Icon className='w-12 h-12 text-white' strokeWidth={2.2} />
                    </div>

                    <div className='flex items-center gap-2 mb-3'>
                        <h2 className='text-3xl sm:text-4xl font-black text-white leading-tight'>{slide.name}</h2>

                        {slide.popular ? (
                            <span
                                className='rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide'
                                style={{ backgroundColor: `${slide.accent}1f`, color: slide.accent, border: `1px solid ${slide.accent}40` }}
                            >
                                Popular
                            </span>
                        ) : null}
                    </div>

                    <div className='h-1 w-16 rounded-full mb-5' style={{ background: `linear-gradient(90deg, ${slide.accent}, transparent)` }} />

                    <p className='text-gray-400 text-base leading-relaxed max-w-md mb-5'>{slide.description}</p>

                    <ul className='grid gap-2 max-w-md'>
                        {slide.features.map((feature) => (
                            <li key={feature} className='flex items-start gap-2.5 text-sm text-white/70'>
                                <CheckCircle className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: slide.accent }} strokeWidth={2.5} />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className='hidden lg:block w-[1px] flex-shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/10 to-transparent my-8' />

            <div className='relative flex-1 flex flex-col justify-center items-center text-center px-8 sm:px-10 py-16 lg:py-10'>
                <div
                    className='transition-all duration-300'
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateX(0)' : `translateX(${direction === 'next' ? '18px' : '-18px'})`,
                    }}
                >
                    <div className='w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 bg-white/5'>
                        <Image width={150} height={150} src='/logocolored.png' alt='Logo' />
                    </div>

                    <p className='text-gray-400 text-md font-semibold mb-4'>Starting from</p>

                    <h3 className='text-4xl sm:text-5xl font-black text-white mb-4'>${slide.monthlyPrice}/mo</h3>
                    <p className='text-white/45 text-md font-semibold mb-6'>${slide.yearlyPrice}/yr</p>

                    <Button
                        type='button'
                        onClick={() => router.push(slide.redirectRoute)}
                        className='rounded-2xl border px-8 py-6 text-base font-bold text-white/80 backdrop-blur-[7px] hover:scale-[1.02] active:scale-[0.99]'
                        style={{
                            background: `linear-gradient(135deg, ${slide.accent}cc, ${slide.accent}77)`,
                            borderColor: `${slide.accent}66`,
                            boxShadow: `0 14px 34px ${slide.accent}22`,
                        }}
                    >
                        Learn More
                        <ArrowRight className='w-5 h-5 ml-2' />
                    </Button>
                </div>
            </div>

            <div className='absolute bottom-6 left-0 right-0 px-6 sm:px-8 flex items-center justify-between'>
                <button
                    type='button'
                    onClick={() => goToSlide(current - 1)}
                    disabled={isFirstSlide}
                    className='w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105'
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    aria-label='Previous tool'
                >
                    <ChevronLeft className='w-5 h-5 text-white' />
                </button>

                <div className='flex items-center gap-2'>
                    {POST_SIGNUP_SLIDES.map((item, index) => (
                        <button
                            key={item.id}
                            type='button'
                            onClick={() => goToSlide(index)}
                            className='rounded-full transition-all duration-300'
                            style={{
                                width: index === current ? 24 : 7,
                                height: 7,
                                backgroundColor: index === current ? slide.accent : 'rgba(255,255,255,0.18)',
                            }}
                            aria-label={`Go to ${item.name}`}
                        />
                    ))}
                </div>

                <button
                    type='button'
                    onClick={() => goToSlide(current + 1)}
                    disabled={isLastSlide}
                    className='w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105'
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    aria-label='Next tool'
                >
                    <ChevronRight className='w-5 h-5 text-white' />
                </button>
            </div>
        </div>
    );
}

type TermsSlide = {
    id: string;
    accent: string;
    Icon: any;
    badge: string;
    titleGrad: string;
    titlePlain: string;
    gradAtEnd?: boolean;
    summary: string;
    link: string;
    bullets: string[];
};

const TERMS_SLIDES: TermsSlide[] = [
    {
        id: 'terms',
        accent: '#2c7bbe',
        Icon: FileText,
        badge: 'Terms & Conditions',
        titleGrad: 'Terms',
        titlePlain: ' & Conditions',
        summary:
            'By using our platform you agree to our Terms & Conditions. These outline your rights and responsibilities, acceptable use policies, intellectual property rules, and procedures for resolving disputes. We reserve the right to update these terms with reasonable notice.',
        link: '/terms',
        bullets: ['Governs platform and tool usage', 'Outlines acceptable use and IP policies', 'Dispute resolution procedures included'],
    },
    {
        id: 'privacy',
        accent: '#4cc7e8',
        Icon: Shield,
        badge: 'Privacy Policy',
        titleGrad: 'Privacy',
        titlePlain: ' Policy',
        summary:
            'We collect only the data necessary to operate the platform and process payments. Your data is never sold to third parties. You have the right to access, correct, or delete your personal data at any time. All data is stored securely in compliance with applicable privacy laws.',
        link: '/privacy',
        bullets: ['Data collected only to operate the service', 'Your data is never sold to third parties', 'Right to access, correct, or delete your data'],
    },
];

function TermsSlideModal({ open, onOpenChange, onComplete }: { open: boolean; onOpenChange: (v: boolean) => void; onComplete: () => void }) {
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState<'next' | 'prev'>('next');
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            setCurrent(0);
            setDir('next');
            setAnimating(false);
        }
    }, [open]);

    const goTo = (next: number, direction: 'next' | 'prev') => {
        if (animating) return;

        setDir(direction);
        setAnimating(true);

        window.setTimeout(() => {
            setCurrent(next);
            setAnimating(false);
        }, 220);
    };

    const handleNext = () => {
        if (animating) return;

        if (current < TERMS_SLIDES.length - 1) {
            goTo(current + 1, 'next');
            return;
        }

        onComplete();
        onOpenChange(false);
    };

    const handlePrev = () => {
        if (animating || current === 0) return;
        goTo(current - 1, 'prev');
    };

    const slide = TERMS_SLIDES[current];
    const { accent, badge, titleGrad, titlePlain, gradAtEnd, summary, link, bullets } = slide;
    const isLast = current === TERMS_SLIDES.length - 1;

    const slideAnim: React.CSSProperties = {
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '-18px' : '18px'})` : 'translateX(0)',
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[540px] p-0 border-0 bg-transparent shadow-none [&>button]:hidden'>
                <DialogTitle className='sr-only'>{badge}</DialogTitle>

                <div
                    className='relative rounded-[32px] border overflow-hidden flex flex-col bg-[#07090d]'
                    style={{
                        minHeight: UNIFIED_CARD_HEIGHT,
                        height: UNIFIED_CARD_HEIGHT,
                        borderColor: `${accent}35`,
                        boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 40px ${accent}10`,
                    }}
                >
                    <div
                        className='absolute inset-0 pointer-events-none'
                        style={{ background: `radial-gradient(circle at top, ${accent}18 0%, transparent 36%)` }}
                    />

                    <button
                        type='button'
                        onClick={() => onOpenChange(false)}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                        aria-label='Close terms modal'
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='relative z-10 flex flex-1 flex-col px-7 pt-8 pb-6' style={slideAnim}>
                        {/* <div
                            className='inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase mb-5'
                            style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                        >
                            <Icon className='w-3.5 h-3.5' />
                            {badge}
                        </div> */}

                        <h2 className='text-[28px] font-black text-white leading-tight mb-3'>
                            {gradAtEnd ? (
                                <>
                                    {titlePlain}
                                    <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #4cc7e8)` }}>
                                        {titleGrad}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #4cc7e8)` }}>
                                        {titleGrad}
                                    </span>
                                    {titlePlain}
                                </>
                            )}
                        </h2>

                        <div className='h-px rounded-full mb-5 w-full bg-white/10' />

                        <div className='rounded-2xl p-4 mb-5 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                            <p className='text-[11px] font-bold uppercase tracking-[0.18em] mb-2' style={{ color: accent }}>
                                Summary
                            </p>

                            <p className='text-white/65 text-sm leading-relaxed'>{summary}</p>

                            <a
                                href={link}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-1 mt-3 text-xs font-semibold hover:underline'
                                style={{ color: accent }}
                            >
                                Read full document →
                            </a>
                        </div>

                        <div className='flex-1'>
                            <ul className='space-y-3'>
                                {bullets.map((b, i) => (
                                    <li key={i} className='flex items-start gap-2.5'>
                                        <CheckCircle className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                        <span className='text-white/72 text-sm leading-snug'>{b}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className='pt-6 flex items-center justify-between gap-2'>
                            <div className='flex items-center justify-between gap-1.5'>
                                {TERMS_SLIDES.map((_, i) => (
                                    <div
                                        key={i}
                                        className='rounded-full transition-all duration-300'
                                        style={{
                                            width: i === current ? 20 : 6,
                                            height: 6,
                                            backgroundColor: i === current ? accent : i < current ? `${accent}55` : 'rgba(255,255,255,0.12)',
                                        }}
                                    />
                                ))}
                            </div>
                            <div>
                                <span
                                    className='rounded-xl px-3 py-1 text-xs font-bold text-white/70'
                                    style={{ backgroundColor: `${accent}14`, border: `1px solid ${accent}35` }}
                                >
                                    Slide {current + 1}/{TERMS_SLIDES.length}
                                </span>
                            </div>

                            <div className='flex items-center gap-2'>
                                <button
                                    type='button'
                                    onClick={handlePrev}
                                    disabled={current === 0}
                                    className='w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105'
                                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    aria-label='Previous terms slide'
                                >
                                    <ChevronLeft className='w-4 h-4 text-white' />
                                </button>

                                <button
                                    type='button'
                                    onClick={handleNext}
                                    className='h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-white transition-all hover:scale-105'
                                    style={{
                                        background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
                                        border: `1px solid ${accent}60`,
                                        boxShadow: `0 2px 12px ${accent}30`,
                                    }}
                                >
                                    {isLast ? 'I Understand ✓' : 'Next'}
                                    {!isLast && <ChevronRight className='w-3.5 h-3.5' />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPostSignupSlideshow, setShowPostSignupSlideshow] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
    const [pendingSignupFlow, setPendingSignupFlow] = useState<PendingSignupFlow | null>(null);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '' });
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<AuthFormValues>();

    useEffect(() => {
        if (!router.isReady) return;

        const q = router.query;
        const hasSignupKey = Object.prototype.hasOwnProperty.call(q, 'signup');

        const first = (k: string) => {
            const v = (q as any)[k];
            return Array.isArray(v) ? v[0] : v;
        };

        const raw = first('signup') ?? first('view') ?? first('mode') ?? '';
        const val = typeof raw === 'string' ? raw.toLowerCase() : '';

        setIsSignUp(hasSignupKey || ['signup', 'true', '1', 'yes'].includes(val));
    }, [router.isReady, router.query]);

    const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid email address';

    const validatePassword = (value: string) => value.length >= 6 || 'Password must be at least 6 characters long';

    const validatePhone = (value: string) => {
        const cleaned = String(value || '').replace(/[^0-9+]/g, '');
        return cleaned.length >= 7 || 'Please enter a valid phone number';
    };

    const setCookie = (name: string, value: string, days = 7) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    };

    const saveUserSession = (token: string | undefined, user: any) => {
        if (token) setCookie('token', token);

        if (user?.id != null) {
            setCookie('id', String(user.id));
            localStorage.setItem('userId', String(user.id));
        }

        if (user?.firstName != null) setCookie('firstName', String(user.firstName));
        if (user?.lastName != null) setCookie('lastName', String(user.lastName));
        if (user?.email != null) setCookie('email', String(user.email));

        localStorage.setItem('roles', JSON.stringify(user?.roles || []));
    };

    const resetVerificationState = () => {
        setShowVerification(false);
        setVerificationMethod('email');
        setPendingSignupFlow(null);
        setVerificationEmail('');
        setOtp('');
        setOtpSent(false);
        setOtpSending(false);
        setOtpVerifying(false);
    };

    const completeSignupFlow = () => {
        const signupUser = pendingSignupFlow?.user;

        if (!signupUser) {
            setAlert({ type: 'error', message: 'Signup session expired. Please sign up again.' });
            resetVerificationState();
            return;
        }

        localStorage.setItem('userId', String(signupUser.id));
        localStorage.setItem('id', String(signupUser.id));
        localStorage.setItem('roles', JSON.stringify(signupUser.roles || []));
        setCookie('firstName', signupUser.firstName);
        setCookie('lastName', signupUser.lastName);
        setCookie('email', signupUser.email);
        setCookie('id', String(signupUser.id));

        setAlert({ type: 'success', message: 'Email verified successfully!' });
        reset();
        resetVerificationState();
        setShowPostSignupSlideshow(true);
    };

    const handleSendEmailOtp = async () => {
        if (!verificationEmail) {
            setAlert({ type: 'error', message: 'Email is missing. Please sign up again.' });
            return;
        }

        setOtpSending(true);
        setAlert({ type: '', message: '' });

        try {
            await axios.post('/api/auth/auth-email', { email: verificationEmail });
            setOtpSent(true);
            setAlert({ type: 'success', message: `OTP sent to ${verificationEmail}` });
        } catch (error: any) {
            setAlert({ type: 'error', message: error?.response?.data?.message || 'Unable to send OTP. Please try again.' });
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        const trimmedOtp = otp.trim();

        if (!trimmedOtp) {
            setAlert({ type: 'error', message: 'Please enter the OTP sent to your email.' });
            return;
        }

        setOtpVerifying(true);
        setAlert({ type: '', message: '' });

        try {
            await axios.post('/api/auth/auth-email/verify', {
                email: verificationEmail,
                otp: trimmedOtp,
            });

            completeSignupFlow();
        } catch (error: any) {
            setAlert({ type: 'error', message: error?.response?.data?.message || 'Invalid OTP. Please try again.' });
        } finally {
            setOtpVerifying(false);
        }
    };

    const onSubmit = async (data: AuthFormValues) => {
        setIsLoading(true);
        setAlert({ type: '', message: '' });

        try {
            if (isSignUp) {
                const cleaned = String(data.fullName || '')
                    .trim()
                    .replace(/\s+/g, ' ');
                const parts = cleaned ? cleaned.split(' ') : [];
                const firstName = parts[0] || '';
                const lastName = parts.length > 1 ? parts.slice(1).join(' ') : ' ';
                const refId = localStorage.getItem('referredby');

                let response;

                if (refId) {
                    response = await axios.post(`/api/v2/signup?referredBy=${refId}`, {
                        email: data.email,
                        firstName,
                        lastName,
                        password: data.password,
                        phone: data.phone,
                        role: '',
                    });
                } else {
                    response = await axios.post('/api/v2/signup', {
                        email: data.email,
                        firstName,
                        lastName,
                        password: data.password,
                        phone: data.phone,
                        role: '',
                    });
                }

                const signupUser = response.data.user;

                setPendingSignupFlow({ user: signupUser, role: '' });
                setVerificationEmail(data.email);
                setVerificationMethod('email');
                setOtp('');
                setOtpSent(false);
                setShowVerification(true);
                setAlert({ type: 'success', message: 'Account created successfully. Please verify your email to continue.' });
            } else {
                const response = await axios.post('/api/v2/login', {
                    email: data.email,
                    password: data.password,
                });

                const { token, user, paymentRequired } = response.data || {};
                const rawRoles = Array.isArray(user?.roles) ? user.roles : [];
                const normalizedRoles = rawRoles.map((role: any) =>
                    String(role || '')
                        .trim()
                        .toLowerCase()
                );
                const responseRole = String(response.data?.role || '').toLowerCase();

                if (responseRole === 'admin' || normalizedRoles.includes('admin')) {
                    setCookie('admin_token', token);
                    setCookie('role', 'admin');

                    if (user?.id != null) {
                        setCookie('adminId', String(user.id));
                        setCookie('id', String(user.id));
                        localStorage.setItem('adminId', String(user.id));
                    }

                    localStorage.setItem('roles', JSON.stringify(rawRoles));
                    setAlert({ type: 'success', message: 'Admin login successful!' });
                    reset();
                    router.push('/admin/dashboard/sales');
                    return;
                }

                if (responseRole === 'sales' || normalizedRoles.includes('sales')) {
                    saveUserSession(token, user);
                    setAlert({ type: 'success', message: 'Login successful!' });
                    reset();
                    router.push('/sales/dashboard/users');
                    return;
                }

                if (paymentRequired) {
                    setAlert({ type: 'error', message: 'Access denied. Please complete your payment to access the system.' });
                    return;
                }

                saveUserSession(token, user);

                const priorityDashboardRoute = getPriorityDashboardRoute(rawRoles);

                setAlert({ type: 'success', message: 'Login successful!' });
                reset();

                if (!priorityDashboardRoute) {
                    setShowPostSignupSlideshow(true);
                    return;
                }

                router.push(priorityDashboardRoute);
            }
        } catch (error: any) {
            setAlert({ type: 'error', message: error?.response?.data?.message || 'Something went wrong. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] bg-[#050608] relative overflow-hidden flex items-center justify-center py-10'>
            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/blacksnowbgimage.webp')" }} />
                <div className='absolute inset-0 bg-black/90' />
            </div>

            <div className='absolute inset-0 overflow-hidden pointer-events-none z-[5]'>
                <Snowflakes />
            </div>

            <TermsSlideModal
                open={showTermsModal}
                onOpenChange={setShowTermsModal}
                onComplete={() => setValue('termsAccepted', true, { shouldValidate: true })}
            />

            <div className='relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6'>
                <div
                    className='relative flex rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-[7px]'
                    style={{
                        background: 'linear-gradient(180deg, rgba(7,9,13,0.68) 0%, rgba(10,12,18,0.52) 45%, rgba(6,8,12,0.68) 100%)',
                        WebkitBackdropFilter: 'blur(7px) saturate(145%)',
                        backdropFilter: 'blur(7px) saturate(145%)',
                        boxShadow:
                            '0 24px 60px rgba(0,0,0,0.7), 0 0 35px rgba(44,123,190,0.14), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)',
                    }}
                >
                    <div
                        className='absolute inset-0 pointer-events-none'
                        style={{
                            background:
                                'radial-gradient(circle at top, rgba(255,255,255,0.07) 0%, transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.055) 0%, transparent 38%, rgba(255,255,255,0.025) 100%)',
                        }}
                    />

                    <div
                        className='absolute inset-x-0 bottom-0 h-40 pointer-events-none'
                        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 100%)' }}
                    />

                    {/* <div className='absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] z-20' /> */}

                    {showPostSignupSlideshow ? (
                        <PostSignupToolsSlideshow />
                    ) : (
                        <>
                            <div className='relative z-10 hidden lg:flex lg:w-[50%] flex-shrink-0'>
                                <ProductCarousel />
                            </div>

                            <div className='relative z-10 hidden lg:block w-[1px] flex-shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/10 to-transparent my-8' />

                            <div className='relative z-10 flex-1 flex flex-col justify-center px-8 sm:px-10 py-10' style={{ minHeight: UNIFIED_CARD_HEIGHT }}>
                                <div className='text-center mb-8'>
                                    <div className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5'>
                                        <Image width={120} height={120} src={'/logocolored.png'} alt='Logo' />
                                    </div>

                                    <h2 className='text-2xl font-bold text-white mb-1'>
                                        {showVerification ? 'Verify Your Account' : isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
                                    </h2>

                                    {/* <p className='text-gray-400 text-sm'>
                                        {isSignUp ? 'Fill in the details to get started' : 'Enter your credentials to access the trading platform'}
                                    </p> */}
                                </div>

                                {alert.message && (
                                    <Alert className={`mb-5 ${alert.type === 'success' ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500'}`}>
                                        <AlertTitle className='text-white'>{alert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                        <AlertDescription className='text-gray-200'>{alert.message}</AlertDescription>
                                    </Alert>
                                )}

                                {showVerification ? (
                                    <div className='space-y-5'>
                                        <div className='rounded-2xl border border-[#2c7bbe]/25 bg-[#050608]/45 p-5 text-left'>
                                            <p className='text-xs font-bold uppercase tracking-[0.18em] text-[#4cc7e8] mb-2'>Verify your account</p>
                                            <h3 className='text-xl font-black text-white mb-2'>Choose a verification method</h3>
                                            <p className='text-sm text-gray-400 leading-relaxed'>
                                                Send an email OTP to <span className='text-white font-semibold'>{verificationEmail}</span>. SMS verification is
                                                visible for the flow, but disabled for now.
                                            </p>
                                        </div>

                                        <div className='grid grid-cols-2 gap-3'>
                                            <button
                                                type='button'
                                                onClick={() => setVerificationMethod('email')}
                                                className='rounded-2xl border p-4 text-left transition-all duration-300 hover:scale-[1.01]'
                                                style={{
                                                    backgroundColor: verificationMethod === 'email' ? 'rgba(76,199,232,0.13)' : 'rgba(5,6,8,0.45)',
                                                    borderColor: verificationMethod === 'email' ? 'rgba(76,199,232,0.58)' : 'rgba(255,255,255,0.10)',
                                                }}
                                            >
                                                <Mail className='w-5 h-5 text-[#4cc7e8] mb-3' />
                                                <p className='text-white font-bold text-sm'>Email</p>
                                                <p className='text-[#4cc7e8] text-xs mt-1'>Enabled</p>
                                            </button>

                                            <button
                                                type='button'
                                                disabled
                                                className='rounded-2xl border border-white/10 bg-[#050608]/30 p-4 text-left opacity-45 cursor-not-allowed'
                                            >
                                                <MessageSquare className='w-5 h-5 text-white/50 mb-3' />
                                                <p className='text-white font-bold text-sm'>SMS</p>
                                                <p className='text-white/45 text-xs mt-1'>Disabled</p>
                                            </button>
                                        </div>

                                        <Button
                                            type='button'
                                            onClick={handleSendEmailOtp}
                                            disabled={otpSending || otpVerifying || verificationMethod !== 'email'}
                                            className='w-full cursor-pointer rounded-2xl border py-6 text-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-white/75 backdrop-blur-[7px] hover:scale-[1.01] active:scale-[0.99]'
                                            style={{
                                                background:
                                                    'linear-gradient(180deg, rgba(42,47,53,0.54) 0%, rgba(15,18,23,0.66) 100%), radial-gradient(circle at top left, rgba(44,123,190,0.18) 0%, transparent 45%), radial-gradient(circle at bottom right, rgba(76,199,232,0.14) 0%, transparent 42%)',
                                                borderColor: 'rgba(255,255,255,0.10)',
                                                WebkitBackdropFilter: 'blur(7px) saturate(145%)',
                                                backdropFilter: 'blur(7px) saturate(145%)',
                                                boxShadow:
                                                    'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.38), 0 14px 34px rgba(0,0,0,0.42)',
                                            }}
                                        >
                                            {otpSending ? (
                                                <span className='flex items-center justify-center'>
                                                    <svg className='animate-spin h-5 w-5 mr-2 text-white' viewBox='0 0 24 24'>
                                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                                                    </svg>
                                                    Sending OTP...
                                                </span>
                                            ) : otpSent ? (
                                                'Resend OTP'
                                            ) : (
                                                'Send OTP'
                                            )}
                                        </Button>

                                        {otpSent && (
                                            <div className='space-y-4'>
                                                <div className='relative'>
                                                    <Input
                                                        id='emailOtp'
                                                        inputMode='numeric'
                                                        placeholder='Enter OTP'
                                                        value={otp}
                                                        onChange={(event) => setOtp(event.target.value)}
                                                        className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 rounded-2xl transition-all duration-300'
                                                    />
                                                    <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                                        <Shield className='w-5 h-5 text-[#4cc7e8]' />
                                                    </div>
                                                </div>

                                                <Button
                                                    type='button'
                                                    onClick={handleVerifyEmailOtp}
                                                    disabled={otpVerifying || otpSending || !otp.trim()}
                                                    className='w-full cursor-pointer rounded-2xl border py-6 text-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-white/75 backdrop-blur-[7px] hover:scale-[1.01] active:scale-[0.99]'
                                                    style={{
                                                        background: `linear-gradient(135deg, #4cc7e8cc, #2c7bbe99)`,
                                                        borderColor: 'rgba(76,199,232,0.46)',
                                                        boxShadow: '0 14px 34px rgba(76,199,232,0.18)',
                                                    }}
                                                >
                                                    {otpVerifying ? (
                                                        <span className='flex items-center justify-center'>
                                                            <svg className='animate-spin h-5 w-5 mr-2 text-white' viewBox='0 0 24 24'>
                                                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                                                            </svg>
                                                            Verifying...
                                                        </span>
                                                    ) : (
                                                        'Verify OTP'
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                                        {isSignUp && (
                                            <div className='space-y-1.5'>
                                                <div className='relative'>
                                                    <Input
                                                        id='fullName'
                                                        type='text'
                                                        placeholder='Enter your full name'
                                                        {...register('fullName', {
                                                            required: 'Full name is required',
                                                            validate: (v) =>
                                                                String(v || '')
                                                                    .trim()
                                                                    .replace(/\s+/g, ' ').length >= 2 || 'Please enter your name',
                                                        })}
                                                        className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 rounded-2xl transition-all duration-300'
                                                    />
                                                    <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                                        <User className='w-5 h-5 text-[#4cc7e8]' />
                                                    </div>
                                                </div>
                                                {errors.fullName && <p className='text-red-400 text-sm'>{errors.fullName.message}</p>}
                                            </div>
                                        )}

                                        {isSignUp && (
                                            <div className='space-y-1.5'>
                                                <div className='relative'>
                                                    <Input
                                                        id='phone'
                                                        type='tel'
                                                        placeholder='Enter your phone number'
                                                        {...register('phone', { required: 'Phone number is required', validate: validatePhone })}
                                                        className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 rounded-2xl transition-all duration-300'
                                                    />
                                                    <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                                        <Phone className='w-5 h-5 text-[#4cc7e8]' />
                                                    </div>
                                                </div>
                                                {errors.phone && <p className='text-red-400 text-sm'>{errors.phone.message}</p>}
                                            </div>
                                        )}

                                        <div className='space-y-1.5'>
                                            <div className='relative'>
                                                <Input
                                                    id='email'
                                                    type='email'
                                                    placeholder='Enter your email'
                                                    {...register('email', { required: 'Email is required', validate: validateEmail })}
                                                    className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 rounded-2xl transition-all duration-300'
                                                />
                                                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                                    <Mail className='w-5 h-5 text-[#4cc7e8]' />
                                                </div>
                                            </div>
                                            {errors.email && <p className='text-red-400 text-sm'>{errors.email.message}</p>}
                                        </div>

                                        <div className='space-y-1.5'>
                                            <div className='relative'>
                                                <Input
                                                    id='password'
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder='Enter your password'
                                                    {...register('password', { required: 'Password is required', validate: validatePassword })}
                                                    className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 pr-12 rounded-2xl transition-all duration-300'
                                                />
                                                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                                    <Lock className='w-5 h-5 text-[#4cc7e8]' />
                                                </div>
                                                <button
                                                    type='button'
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-[#4cc7e8] hover:text-[#2c7bbe] transition-colors duration-300'
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                                                </button>
                                            </div>
                                            {errors.password && <p className='text-red-400 text-sm'>{errors.password.message}</p>}
                                        </div>

                                        {isSignUp && (
                                            <div className='space-y-1.5'>
                                                <div className='flex items-start gap-3 text-sm text-gray-300 leading-relaxed'>
                                                    <input
                                                        id='termsAccepted'
                                                        type='checkbox'
                                                        {...register('termsAccepted', {
                                                            required: 'Please accept the terms to continue',
                                                        })}
                                                        className='mt-1 h-4 w-4 rounded border border-[#2c7bbe]/40 bg-[#050608] accent-[#4cc7e8]'
                                                    />

                                                    <p>
                                                        <label htmlFor='termsAccepted' className='cursor-pointer'>
                                                            I agree to the{' '}
                                                        </label>
                                                        <button
                                                            type='button'
                                                            onClick={() => setShowTermsModal(true)}
                                                            className='text-[#4cc7e8] hover:text-[#2c7bbe] transition-colors'
                                                        >
                                                            Terms & Conditions
                                                        </button>
                                                        .
                                                    </p>
                                                </div>
                                                {errors.termsAccepted && <p className='text-red-400 text-sm'>{errors.termsAccepted.message}</p>}
                                            </div>
                                        )}

                                        <Button
                                            type='submit'
                                            disabled={isLoading}
                                            className='w-full cursor-pointer rounded-2xl border py-6 text-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-white/75 backdrop-blur-[7px] hover:scale-[1.01] active:scale-[0.99] group'
                                            style={{
                                                background:
                                                    'linear-gradient(180deg, rgba(42,47,53,0.54) 0%, rgba(15,18,23,0.66) 100%), radial-gradient(circle at top left, rgba(44,123,190,0.18) 0%, transparent 45%), radial-gradient(circle at bottom right, rgba(76,199,232,0.14) 0%, transparent 42%)',
                                                borderColor: 'rgba(255,255,255,0.10)',
                                                WebkitBackdropFilter: 'blur(7px) saturate(145%)',
                                                backdropFilter: 'blur(7px) saturate(145%)',
                                                boxShadow:
                                                    'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.38), 0 14px 34px rgba(0,0,0,0.42)',
                                            }}
                                        >
                                            {isLoading ? (
                                                <div className='flex items-center justify-center'>
                                                    <svg className='animate-spin h-5 w-5 mr-2 text-white' viewBox='0 0 24 24'>
                                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                                                    </svg>
                                                    Processing...
                                                </div>
                                            ) : (
                                                <>
                                                    {isSignUp ? 'Create Account' : 'Dashboard'}
                                                    <ArrowRight className='w-5 h-5 ml-2 opacity-70 group-hover:translate-x-1 transition-transform duration-300' />
                                                </>
                                            )}
                                        </Button>

                                        <div className='text-center'>
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    setIsSignUp(!isSignUp);
                                                    setAlert({ type: '', message: '' });
                                                    reset();
                                                    resetVerificationState();
                                                }}
                                                className='text-white text-sm font-semibold'
                                            >
                                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                                                <span className='cursor-pointer text-[#4cc7e8] hover:text-[#2c7bbe] transition-colors duration-300'>
                                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                                </span>
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export { SignIn };
