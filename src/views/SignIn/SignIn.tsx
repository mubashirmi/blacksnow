'use client';

import { LottieAnimation } from '@/components/lottie-animation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
    Lock,
    Mail,
    MessageSquare,
    Monitor,
    Newspaper,
    Shield,
    Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

// ── Snowflake config ──────────────────────────────────────────
const SNOWFLAKE_COUNT = 45;

const UNIFIED_CARD_HEIGHT = 580;
const AUTH_CARD_HEIGHT = 520;

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
    smsOptInConsent?: boolean;
};

type PendingAuthFlow = { kind: 'signup'; user: any; role: string } | { kind: 'login'; responseData: any };

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
        accent: '#FACC15',
        label: 'Stock Screener',
        subtitle: 'Market Analysis Tool',
        desc: 'Filter thousands of stocks and find your next winning trade.',
    },
    {
        lottie: '/animations/watchlisticon.json',
        accent: '#F97316',
        label: 'Watchlist',
        subtitle: 'Track Stock Performance',
        desc: 'Monitor your favourite stocks and never miss a move.',
    },
    {
        lottie: '/animations/marketmover.json',
        accent: '#EF4444',
        label: 'Market Movers',
        subtitle: 'Market at a Glance',
        desc: 'Track major indices, capital rotation, and market sentiment ahead.',
    },
    {
        lottie: '/animations/globaleconomicindicatoricon.json',
        accent: '#4A90D9',
        label: 'Global Economic Indicators',
        subtitle: 'World Economic KPI Dashboard',
        desc: 'Stay informed on key economic metrics from across the globe.',
    },
    {
        lottie: '/animations/economicsimulator.json',
        accent: '#7C3AED',
        label: 'Economic Simulator',
        subtitle: 'Supply and Demand',
        desc: 'Explore interactive economic models with dynamic charts and rigorous theory.',
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
                style={{
                    background: `radial-gradient(ellipse at 50% 45%, ${accent}1a 0%, transparent 68%)`,
                }}
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
                    style={{
                        background: `radial-gradient(ellipse at 50% 45%, ${slide.accent}1a 0%, transparent 68%)`,
                    }}
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
                                style={{
                                    backgroundColor: `${slide.accent}1f`,
                                    color: slide.accent,
                                    border: `1px solid ${slide.accent}40`,
                                }}
                            >
                                Popular
                            </span>
                        ) : null}
                    </div>

                    <div
                        className='h-1 w-16 rounded-full mb-5'
                        style={{
                            background: `linear-gradient(90deg, ${slide.accent}, transparent)`,
                        }}
                    />

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
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
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
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    aria-label='Next tool'
                >
                    <ChevronRight className='w-5 h-5 text-white' />
                </button>
            </div>
        </div>
    );
}

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPostSignupSlideshow, setShowPostSignupSlideshow] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
    const [pendingAuthFlow, setPendingAuthFlow] = useState<PendingAuthFlow | null>(null);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [verificationPhone, setVerificationPhone] = useState('');
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
    } = useForm<AuthFormValues>();

    useEffect(() => {
        if (!alert.message) return;

        const timer = window.setTimeout(() => {
            setAlert({ type: '', message: '' });
        }, 3000);

        return () => window.clearTimeout(timer);
    }, [alert.message, alert.type]);

    const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid email address';

    const validatePassword = (value: string) => value.length >= 6 || 'Password must be at least 6 characters long';

    const setCookie = (name: string, value: string, days = 7) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    };

    const clearUnverifiedIdentityStorage = () => {
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        localStorage.removeItem('email');
    };

    const saveVerifiedIdentityStorage = (user: any) => {
        if (user?.firstName != null) localStorage.setItem('firstName', String(user.firstName));
        if (user?.lastName != null) localStorage.setItem('lastName', String(user.lastName));
        if (user?.email != null) localStorage.setItem('email', String(user.email));
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

        saveVerifiedIdentityStorage(user);
        localStorage.setItem('roles', JSON.stringify(Array.isArray(user?.roles) ? user.roles : []));
        localStorage.setItem('pausedRoles', JSON.stringify(Array.isArray(user?.pausedRoles) ? user.pausedRoles : []));
    };

    const resetVerificationState = () => {
        setShowVerification(false);
        setVerificationMethod('email');
        setPendingAuthFlow(null);
        setVerificationEmail('');
        setVerificationPhone('');
        setOtp('');
        setOtpSent(false);
        setOtpSending(false);
        setOtpVerifying(false);
    };

    const completeLoginFlow = (responseData: any) => {
        const { token, user, paymentRequired } = responseData || {};
        const rawRoles = Array.isArray(user?.roles) ? user.roles : [];
        const normalizedRoles = rawRoles.map((role: any) =>
            String(role || '')
                .trim()
                .toLowerCase()
        );
        const responseRole = String(responseData?.role || '').toLowerCase();

        if (responseRole === 'admin' || normalizedRoles.includes('admin')) {
            setCookie('admin_token', token);
            setCookie('role', 'admin');

            if (user?.id != null) {
                setCookie('adminId', String(user.id));
                setCookie('id', String(user.id));
                localStorage.setItem('adminId', String(user.id));
            }

            localStorage.setItem('roles', JSON.stringify(rawRoles));
            localStorage.setItem('pausedRoles', JSON.stringify(Array.isArray(user?.pausedRoles) ? user.pausedRoles : []));
            setAlert({ type: 'success', message: 'Admin login successful!' });
            reset();
            resetVerificationState();
            router.push('/admin/dashboard/sales');
            return;
        }

        if (responseRole === 'sales' || normalizedRoles.includes('sales')) {
            saveUserSession(token, user);
            setAlert({
                type: 'success',
                message: 'Email verified successfully. Login successful!',
            });
            reset();
            resetVerificationState();
            router.push('/sales/dashboard/users');
            return;
        }

        if (paymentRequired) {
            setAlert({
                type: 'error',
                message: 'Access denied. Please complete your payment to access the system.',
            });
            resetVerificationState();
            return;
        }

        saveUserSession(token, user);

        const priorityDashboardRoute = getPriorityDashboardRoute(rawRoles);

        setAlert({
            type: 'success',
            message: 'Email verified successfully. Login successful!',
        });
        reset();
        resetVerificationState();

        if (!priorityDashboardRoute) {
            setShowPostSignupSlideshow(true);
            return;
        }

        router.push(priorityDashboardRoute);
    };

    const handleSendEmailOtp = async () => {
        if (!verificationEmail) {
            setAlert({
                type: 'error',
                message: 'Email is missing. Please start again.',
            });
            return;
        }

        setOtpSending(true);
        setAlert({ type: '', message: '' });

        try {
            await axios.post('/api/auth/auth-email', { email: verificationEmail });
            setOtpSent(true);
            setAlert({
                type: 'success',
                message: `OTP sent to ${verificationEmail}`,
            });
        } catch (error: any) {
            setAlert({
                type: 'error',
                message: error?.response?.data?.message || 'Unable to send OTP. Please try again.',
            });
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        const trimmedOtp = otp.trim();

        if (!trimmedOtp) {
            setAlert({
                type: 'error',
                message: 'Please enter the OTP sent to your email.',
            });
            return;
        }

        if (pendingAuthFlow?.kind !== 'login') {
            setAlert({
                type: 'error',
                message: 'Login session expired. Please sign in again.',
            });
            resetVerificationState();
            return;
        }

        setOtpVerifying(true);
        setAlert({ type: '', message: '' });

        try {
            await axios.post('/api/auth/auth-email/verify', {
                email: verificationEmail,
                otp: trimmedOtp,
            });

            completeLoginFlow(pendingAuthFlow.responseData);
        } catch (error: any) {
            setAlert({
                type: 'error',
                message: error?.response?.data?.message || 'Invalid OTP. Please try again.',
            });
        } finally {
            setOtpVerifying(false);
        }
    };

    const isValidE164Phone = (value: string) => /^\+[1-9]\d{7,14}$/.test(value.trim());

    const handleSendSmsOtp = async () => {
        const userEmail = verificationEmail.trim();
        const userPhone = verificationPhone.trim();

        if (!userEmail) {
            setAlert({ type: 'error', message: 'Email is missing. Please sign in again.' });
            return;
        }

        if (!isValidE164Phone(userPhone)) {
            setAlert({
                type: 'error',
                message: 'Phone number must be in E.164 format, for example +923001234567.',
            });
            return;
        }

        setOtpSending(true);
        setAlert({ type: '', message: '' });

        try {
            await axios.post('/api/auth/auth-sms', {
                userEmail,
                userPhone,
            });

            setOtpSent(true);
            setAlert({ type: 'success', message: `OTP sent to ${userPhone}` });
        } catch (error: any) {
            setAlert({
                type: 'error',
                message: error?.response?.data?.message || 'Unable to send SMS OTP. Please try again.',
            });
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifySmsOtp = async () => {
        const userEmail = verificationEmail.trim();
        const trimmedOtp = otp.trim();

        if (!trimmedOtp) {
            setAlert({ type: 'error', message: 'Please enter the OTP sent to your phone.' });
            return;
        }

        if (pendingAuthFlow?.kind !== 'login') {
            setAlert({ type: 'error', message: 'Login session expired. Please sign in again.' });
            resetVerificationState();
            return;
        }

        setOtpVerifying(true);
        setAlert({ type: '', message: '' });

        try {
            await axios.post('/api/auth/auth-sms/verify', {
                userEmail,
                otp: trimmedOtp,
            });

            completeLoginFlow(pendingAuthFlow.responseData);
        } catch (error: any) {
            setAlert({
                type: 'error',
                message: error?.response?.data?.message || 'Invalid SMS OTP. Please try again.',
            });
        } finally {
            setOtpVerifying(false);
        }
    };

    const onSubmit = async (data: AuthFormValues) => {
        setIsLoading(true);
        setAlert({ type: '', message: '' });

        try {
            const response = await axios.post('/api/v2/login', {
                email: data.email,
                password: data.password,
            });

            const loginUser = response.data?.user;
            const loginRoles = Array.isArray(loginUser?.roles) ? loginUser.roles : [];
            const normalizedLoginRoles = loginRoles.map((role: any) =>
                String(role || '')
                    .trim()
                    .toLowerCase()
            );
            const loginResponseRole = String(response.data?.role || '').toLowerCase();
            const isAdminLogin = loginResponseRole === 'admin' || normalizedLoginRoles.includes('admin');

            if (isAdminLogin) {
                completeLoginFlow(response.data);
                return;
            }

            clearUnverifiedIdentityStorage();
            setPendingAuthFlow({ kind: 'login', responseData: response.data });
            setVerificationEmail(data.email);
            setVerificationMethod('email');
            setOtp('');
            setOtpSent(false);
            setShowVerification(true);
            setAlert({
                type: 'success',
                message: 'Login successful. Please verify your email to continue.',
            });
        } catch (error: any) {
            setAlert({
                type: 'error',
                message: error?.response?.data?.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] bg-[#050608] relative overflow-hidden flex items-center justify-center py-8'>
            <style>{`
                .glassy-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(76,199,232,0.42) rgba(255,255,255,0.035);
                }

                .glassy-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                .glassy-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.035);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 999px;
                    -webkit-backdrop-filter: blur(10px);
                    backdrop-filter: blur(10px);
                }

                .glassy-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, rgba(76,199,232,0.52), rgba(44,123,190,0.30));
                    border: 2px solid rgba(7,9,13,0.72);
                    border-radius: 999px;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 0 14px rgba(76,199,232,0.18);
                }

                .glassy-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, rgba(76,199,232,0.72), rgba(44,123,190,0.45));
                }
            `}</style>

            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/blacksnowbgimage.webp')" }} />
                <div className='absolute inset-0 bg-black/90' />
            </div>

            <div className='absolute inset-0 overflow-hidden pointer-events-none z-[5]'>
                <Snowflakes />
            </div>

            {alert.message && (
                <div className='pointer-events-none fixed top-4 right-4 z-[9999] w-[calc(100%-2rem)] max-w-sm'>
                    <Alert
                        className={`rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md ${
                            alert.type === 'success' ? 'bg-green-900/85 border-green-500/70' : 'bg-red-900/85 border-red-500/70'
                        }`}
                    >
                        <AlertTitle className='text-white text-sm leading-tight'>{alert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                        <AlertDescription className='text-gray-200 text-xs leading-snug'>{alert.message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className='relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6'>
                <div
                    className='relative flex rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-[7px]'
                    style={{
                        height: showPostSignupSlideshow ? UNIFIED_CARD_HEIGHT : AUTH_CARD_HEIGHT,
                        minHeight: showPostSignupSlideshow ? UNIFIED_CARD_HEIGHT : AUTH_CARD_HEIGHT,
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
                        style={{
                            background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 100%)',
                        }}
                    />

                    {showPostSignupSlideshow ? (
                        <PostSignupToolsSlideshow />
                    ) : (
                        <>
                            <div className='relative z-10 hidden lg:flex lg:w-[50%] flex-shrink-0'>
                                <ProductCarousel />
                            </div>

                            <div className='relative z-10 hidden lg:block w-[1px] flex-shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/10 to-transparent my-8' />

                            <div
                                className='relative z-10 flex-1 flex flex-col justify-center px-7 sm:px-9 py-5 overflow-hidden'
                                style={{ height: '100%', minHeight: 0 }}
                            >
                                <div className='text-center mb-3 flex-shrink-0'>
                                    <div className='w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2'>
                                        <Image width={104} height={104} src='/logocolored.png' alt='Logo' />
                                    </div>

                                    <h2 className='text-[22px] font-bold text-white mb-1'>
                                        {showVerification ? 'Verify Your Account' : 'Sign In to Your Account'}
                                    </h2>
                                </div>

                                <div className='min-h-0 overflow-visible pr-0'>
                                    {showVerification ? (
                                        <div className='space-y-2'>
                                            <div className='rounded-2xl border border-[#2c7bbe]/25 bg-[#050608]/45 p-2.5 text-left'>
                                                <p className='text-[11px] font-bold uppercase tracking-[0.18em] text-[#4cc7e8] mb-1.5'>Verify your account</p>
                                                <h3 className='text-base font-black text-white mb-1'>Choose a verification method</h3>
                                                <p className='text-xs text-gray-400 leading-snug'>
                                                    Verify using an email OTP sent to <span className='text-white font-semibold'>{verificationEmail}</span>, or
                                                    use an SMS OTP with a phone number in E.164 format.
                                                </p>
                                            </div>

                                            <div className='grid grid-cols-2 gap-2'>
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        setVerificationMethod('email');
                                                        setOtp('');
                                                        setOtpSent(false);
                                                    }}
                                                    className='rounded-2xl border p-2.5 text-left transition-all duration-300 hover:scale-[1.01]'
                                                    style={{
                                                        backgroundColor: verificationMethod === 'email' ? 'rgba(76,199,232,0.13)' : 'rgba(5,6,8,0.45)',
                                                        borderColor: verificationMethod === 'email' ? 'rgba(76,199,232,0.58)' : 'rgba(255,255,255,0.10)',
                                                    }}
                                                >
                                                    <Mail className='w-4 h-4 text-[#4cc7e8] mb-1.5' />
                                                    <p className='text-white font-bold text-sm leading-tight'>Email</p>
                                                    <p className='text-[#4cc7e8] text-xs mt-0.5'>OTP verification</p>
                                                </button>

                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        setVerificationMethod('sms');
                                                        setOtp('');
                                                        setOtpSent(false);
                                                    }}
                                                    className='rounded-2xl border p-2.5 text-left transition-all duration-300 hover:scale-[1.01]'
                                                    style={{
                                                        backgroundColor: verificationMethod === 'sms' ? 'rgba(76,199,232,0.13)' : 'rgba(5,6,8,0.45)',
                                                        borderColor: verificationMethod === 'sms' ? 'rgba(76,199,232,0.58)' : 'rgba(255,255,255,0.10)',
                                                    }}
                                                >
                                                    <MessageSquare className='w-4 h-4 text-[#4cc7e8] mb-1.5' />
                                                    <p className='text-white font-bold text-sm leading-tight'>SMS</p>
                                                    <p className='text-[#4cc7e8] text-xs mt-0.5'>OTP verification</p>
                                                </button>
                                            </div>

                                            {verificationMethod === 'sms' && (
                                                <div className='space-y-1.5'>
                                                    <Input
                                                        id='smsPhone'
                                                        type='tel'
                                                        inputMode='tel'
                                                        placeholder='+923001234567'
                                                        value={verificationPhone}
                                                        onChange={(event) => {
                                                            setVerificationPhone(event.target.value);
                                                            setOtp('');
                                                            setOtpSent(false);
                                                        }}
                                                        className='h-11 bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-sm py-0 px-4 rounded-2xl transition-all duration-300'
                                                    />
                                                    <p className='text-[11px] text-white/45'>Use E.164 format, for example +923001234567.</p>
                                                </div>
                                            )}

                                            <Button
                                                type='button'
                                                onClick={verificationMethod === 'sms' ? handleSendSmsOtp : handleSendEmailOtp}
                                                disabled={otpSending || otpVerifying}
                                                className='w-full cursor-pointer rounded-2xl border h-11 py-0 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-white/75 backdrop-blur-[7px] hover:scale-[1.01] active:scale-[0.99]'
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
                                                <div className='space-y-2'>
                                                    <div className='relative'>
                                                        <Input
                                                            id={verificationMethod === 'sms' ? 'smsOtp' : 'emailOtp'}
                                                            inputMode='numeric'
                                                            placeholder='Enter OTP'
                                                            value={otp}
                                                            onChange={(event) => setOtp(event.target.value)}
                                                            className='h-11 bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-sm py-0 pl-12 rounded-2xl transition-all duration-300'
                                                        />
                                                        <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                                            <Shield className='w-5 h-5 text-[#4cc7e8]' />
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type='button'
                                                        onClick={verificationMethod === 'sms' ? handleVerifySmsOtp : handleVerifyEmailOtp}
                                                        disabled={otpVerifying || otpSending || !otp.trim()}
                                                        className='w-full cursor-pointer rounded-2xl border h-11 py-0 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-white/75 backdrop-blur-[7px] hover:scale-[1.01] active:scale-[0.99]'
                                                        style={{
                                                            background: 'linear-gradient(135deg, #4cc7e8cc, #2c7bbe99)',
                                                            borderColor: 'rgba(76,199,232,0.46)',
                                                            boxShadow: '0 14px 34px rgba(76,199,232,0.18)',
                                                        }}
                                                    >
                                                        {otpVerifying ? (
                                                            <span className='flex items-center justify-center'>
                                                                <svg className='animate-spin h-5 w-5 mr-2 text-white' viewBox='0 0 24 24'>
                                                                    <circle
                                                                        className='opacity-25'
                                                                        cx='12'
                                                                        cy='12'
                                                                        r='10'
                                                                        stroke='currentColor'
                                                                        strokeWidth='4'
                                                                    />
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
                                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-2.5 min-h-full flex flex-col justify-center'>
                                            <div className='space-y-1.5'>
                                                <div className='relative'>
                                                    <Input
                                                        id='email'
                                                        type='email'
                                                        placeholder='Enter your email'
                                                        {...register('email', {
                                                            required: 'Email is required',
                                                            validate: validateEmail,
                                                        })}
                                                        className='h-12 bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-sm py-0 pl-12 rounded-2xl transition-all duration-300'
                                                    />
                                                    <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                                        <Mail className='w-5 h-5 text-[#4cc7e8]' />
                                                    </div>
                                                </div>
                                                {errors.email && <p className='text-red-400 text-xs leading-tight'>{errors.email.message}</p>}
                                            </div>

                                            <div className='space-y-1.5'>
                                                <div className='relative'>
                                                    <Input
                                                        id='password'
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder='Enter your password'
                                                        {...register('password', {
                                                            required: 'Password is required',
                                                            validate: validatePassword,
                                                        })}
                                                        className='h-12 bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-sm py-0 pl-12 pr-12 rounded-2xl transition-all duration-300'
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
                                                {errors.password && <p className='text-red-400 text-xs leading-tight'>{errors.password.message}</p>}
                                            </div>

                                            <Button
                                                type='submit'
                                                disabled={isLoading}
                                                className='w-full cursor-pointer rounded-2xl border h-12 py-0 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-white/75 backdrop-blur-[7px] hover:scale-[1.01] active:scale-[0.99] group'
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
                                                        Dashboard
                                                        <ArrowRight className='w-5 h-5 ml-2 opacity-70 group-hover:translate-x-1 transition-transform duration-300' />
                                                    </>
                                                )}
                                            </Button>

                                            <div className='text-center'>
                                                <button type='button' onClick={() => router.push('/signup')} className='text-white text-sm font-semibold'>
                                                    Don&apos;t have an account?{' '}
                                                    <span className='cursor-pointer text-[#4cc7e8] hover:text-[#2c7bbe] transition-colors duration-300'>
                                                        Sign Up
                                                    </span>
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export { SignIn };
