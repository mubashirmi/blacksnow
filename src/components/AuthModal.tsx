'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { CheckCircle, ChevronLeft, ChevronRight, Eye, EyeOff, FileText, Lock, Mail, Shield, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

// ─── Shared Constants ─────────────────────────────────────────────────────────
const UNIFIED_CARD_HEIGHT = 580;

// ─── Terms Slides ─────────────────────────────────────────────────────────────
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

// ─── Terms Slide Modal ────────────────────────────────────────────────────────
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

        setTimeout(() => {
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
    const { accent, Icon, badge, titleGrad, titlePlain, gradAtEnd, summary, link, bullets } = slide;
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
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='relative z-10 flex flex-1 flex-col px-7 pt-8 pb-6' style={slideAnim}>
                        <div
                            className='inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase mb-5'
                            style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                        >
                            <Icon className='w-3.5 h-3.5' />
                            {badge}
                        </div>

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

                        <div className='pt-6 flex items-center justify-between'>
                            <div className='flex items-center gap-1.5'>
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

                                <span className='text-xs text-white/30 ml-2'>
                                    {current + 1}/{TERMS_SLIDES.length}
                                </span>
                            </div>

                            <div className='flex items-center gap-2'>
                                <button
                                    type='button'
                                    onClick={handlePrev}
                                    disabled={current === 0}
                                    className='w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105'
                                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
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

// ─── Product Context Type ─────────────────────────────────────────────────────
export type ProductContext = {
    name: string;
    description?: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    price?: number;
    period?: string;
    hasSubscription?: boolean;
    color?: string;
    icon?: React.ElementType;
};

export type AuthModalVisualVariant = 'default' | 'danger';

// ─── Auth Modal Props ─────────────────────────────────────────────────────────
export type AuthModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultView?: 'signin' | 'signup';
    redirectAfterLogin?: string;
    redirectAfterSignup?: string;
    sourceRoute?: string;
    productContext?: ProductContext;
    visualVariant?: AuthModalVisualVariant;
    onSuccess?: (ctx: { kind: 'login' | 'signup'; role?: string; roles?: string[]; userId?: string }) => boolean | void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function splitFullName(fullName: string) {
    const cleaned = String(fullName || '')
        .trim()
        .replace(/\s+/g, ' ');

    if (!cleaned) return { firstName: '', lastName: '' };

    const parts = cleaned.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : ' ';

    return { firstName, lastName };
}

function validateEmail(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
}

function validatePassword(value: string) {
    return value.length >= 6 || 'Password must be at least 6 characters long';
}

// ─── Product Header Sub-component ────────────────────────────────────────────
function ProductHeader({
    product,
    billingPeriod,
    onBillingChange,
}: {
    product: ProductContext;
    billingPeriod: 'monthly' | 'yearly';
    onBillingChange: (v: 'monthly' | 'yearly') => void;
}) {
    const ProductIcon = product.icon;

    const displayPrice = () => {
        if (product.hasSubscription) {
            return billingPeriod === 'monthly' ? `$${product.monthlyPrice}` : `$${product.yearlyPrice}`;
        }

        return product.price != null ? `$${product.price}` : null;
    };

    const displayPeriod = () => {
        if (product.hasSubscription) return billingPeriod === 'monthly' ? 'Month' : 'Year';
        return product.period || null;
    };

    const savings = () => {
        if (!product.hasSubscription || !product.monthlyPrice || !product.yearlyPrice) return 0;
        return Math.round(((product.monthlyPrice * 12 - product.yearlyPrice) / (product.monthlyPrice * 12)) * 100);
    };

    const price = displayPrice();
    const period = displayPeriod();
    const savingsPct = savings();

    return (
        <div className='relative px-7 pt-6 pb-0'>
            <div className='grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 mb-3'>
                <div className='h-11 w-11 rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center shadow-md'>
                    {ProductIcon ? (
                        <ProductIcon className='w-6 h-6 text-white/80' />
                    ) : (
                        <Image src='/logowhite.png' alt='Logo' width={32} height={32} className='object-contain' />
                    )}
                </div>

                <div className='flex flex-col items-center justify-center text-center'>
                    <h3 className='text-[21px] font-extrabold text-white leading-tight tracking-tight'>{product.name}</h3>
                    {product.description && <p className='text-xs text-white/45 mt-0.5 leading-snug line-clamp-1'>{product.description}</p>}
                </div>

                <div aria-hidden='true' className='h-11 w-11' />
            </div>

            {product.hasSubscription && (
                <div className='flex justify-center mb-3'>
                    <div className='flex w-full max-w-[220px] rounded-full border border-white/12 bg-white/5 p-1 shadow-inner'>
                        <button
                            type='button'
                            onClick={() => onBillingChange('monthly')}
                            className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                billingPeriod === 'monthly' ? 'bg-white/10 text-white shadow' : 'text-white/55 hover:text-white/85'
                            }`}
                        >
                            Monthly
                        </button>

                        <button
                            type='button'
                            onClick={() => onBillingChange('yearly')}
                            className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                billingPeriod === 'yearly' ? 'bg-white/10 text-white shadow' : 'text-white/55 hover:text-white/85'
                            }`}
                        >
                            Annual
                        </button>
                    </div>
                </div>
            )}

            {price && (
                <div className='flex flex-col items-center text-center mb-3'>
                    <div className='flex items-end gap-1'>
                        <span className='text-[38px] leading-none font-black tracking-tight text-white'>{price}</span>
                        {period && <span className='text-sm font-bold text-white/60 mb-1.5'>/{period}</span>}
                    </div>

                    {billingPeriod === 'yearly' && product.hasSubscription && savingsPct > 0 && (
                        <div className='mt-2 inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300'>
                            Save {savingsPct}% with yearly billing
                        </div>
                    )}
                </div>
            )}

            <div className='h-px w-full bg-white/10' />
        </div>
    );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
export default function AuthModal({
    open,
    onOpenChange,
    defaultView = 'signin',
    redirectAfterLogin = '/',
    redirectAfterSignup = '/pricing',
    sourceRoute,
    productContext,
    visualVariant = 'default',
    onSuccess,
}: AuthModalProps) {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(defaultView === 'signin');
    const [isLoading, setIsLoading] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsCompleted, setTermsCompleted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const currentRoute = useMemo(() => {
        const fromProp = sourceRoute ?? '';
        if (fromProp) return fromProp;
        if (typeof window !== 'undefined') return window.location.pathname || '';
        return '';
    }, [sourceRoute]);

    const hasProduct = !!productContext;
    const isDangerVariant = visualVariant === 'danger';

    const modalAccent = '#4cc7e8';

    const redLogoFilter = 'brightness(0) saturate(100%) invert(18%) sepia(98%) saturate(4622%) hue-rotate(345deg) brightness(98%) contrast(98%)';

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
        const shouldSignUp = hasSignupKey || ['signup', 'true', '1', 'yes'].includes(val);

        setIsSignUp(shouldSignUp ? true : defaultView === 'signup');
    }, [router.isReady, router.query, defaultView]);

    async function onSubmit(data: any) {
        setIsLoading(true);
        setAlert({ type: '', message: '' });

        try {
            if (isSignUp) {
                const { firstName, lastName } = splitFullName(data.fullName);

                const signupData = {
                    email: data.email,
                    firstName,
                    lastName,
                    password: data.password,
                    role: '',
                };

                const response = await axios.post('/api/v2/signup', signupData);

                const userId = response.data.user?.id ? String(response.data.user.id) : undefined;
                const userRoles = Array.isArray(response.data.user?.roles) ? response.data.user.roles : [];

                if (userId) {
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('id', userId);
                    setCookie('id', userId);
                    setCookie('firstName', response.data.user.firstName);
                    setCookie('lastName', response.data.user.lastName);
                    setCookie('email', response.data.user.email);
                }

                localStorage.setItem('roles', JSON.stringify(userRoles));

                setAlert({ type: 'success', message: 'Account created successfully!' });
                reset();

                const preventDefault =
                    onSuccess?.({
                        kind: 'signup',
                        role: signupData.role,
                        roles: userRoles,
                        userId,
                    }) === false;

                if (preventDefault) {
                    onOpenChange(false);
                    return;
                }

                onOpenChange(false);

                if (currentRoute === '/lightningSilver') {
                    router.push('/affiliate/dashboard/kpi');
                    return;
                }

                router.push(redirectAfterSignup || '/pricing');
                return;
            }

            const loginData = {
                email: data.email,
                password: data.password,
            };

            const response = await axios.post('/api/v2/login', loginData);

            if (response.data.role === 'admin') {
                setCookie('admin_token', response.data.token);
                setCookie('role', response.data.role);
                setAlert({ type: 'success', message: 'Admin login successful!' });
                reset();

                const preventDefault =
                    onSuccess?.({
                        kind: 'login',
                        role: 'admin',
                        userId: response.data.user?.id,
                    }) === false;

                if (!preventDefault) {
                    onOpenChange(false);
                    router.push('/admin/dashboard/sales');
                }

                return;
            }

            if (response.data.paymentRequired) {
                setAlert({
                    type: 'error',
                    message: 'Access denied. Please complete your payment to access the system.',
                });
                return;
            }

            const userId = response.data.user?.id ? String(response.data.user.id) : undefined;
            const userRoles = Array.isArray(response.data.user?.roles) ? response.data.user.roles : [];

            if (response.data.token) {
                setCookie('token', response.data.token);
            }

            setCookie('id', String(response.data.user.id));
            setCookie('firstName', response.data.user.firstName);
            setCookie('lastName', response.data.user.lastName);
            setCookie('email', response.data.user.email);

            if (userId) {
                localStorage.setItem('userId', userId);
                localStorage.setItem('id', userId);
            }

            localStorage.setItem('roles', JSON.stringify(userRoles));

            setAlert({ type: 'success', message: 'Login successful!' });
            reset();

            const preventDefault =
                onSuccess?.({
                    kind: 'login',
                    role: response.data.role,
                    roles: userRoles,
                    userId,
                }) === false;

            if (preventDefault) {
                onOpenChange(false);
                return;
            }

            onOpenChange(false);
            router.push(redirectAfterLogin);
        } catch (error: any) {
            setAlert({
                type: 'error',
                message: error?.response?.data?.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(v) => {
                    if (!isLoading) onOpenChange(v);
                }}
            >
                <DialogContent className='max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden'>
                    <div
                        className='relative rounded-[32px] border overflow-hidden flex flex-col backdrop-blur-2xl'
                        style={{
                            minHeight: UNIFIED_CARD_HEIGHT,
                            height: UNIFIED_CARD_HEIGHT,
                            background: 'linear-gradient(180deg, rgba(7,9,13,0.68) 0%, rgba(10,12,18,0.52) 45%, rgba(6,8,12,0.68) 100%)',
                    WebkitBackdropFilter: 'blur(8px) saturate(145%)',
                    backdropFilter: 'blur(8px) saturate(145%)',
                    boxShadow
                        : '0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)',
                    borderColor:'rgba(255,255,255,0.10)',
                        }}
                    >
                        {hasProduct && <ProductHeader product={productContext!} billingPeriod={billingPeriod} onBillingChange={setBillingPeriod} />}

                        {/* Close button */}
                        <button
                            type='button'
                            onClick={() => {
                                if (!isLoading) onOpenChange(false);
                            }}
                            className='absolute right-4 top-4 w-10 h-10 bg-black/40 rounded-2xl flex items-center justify-center border hover:bg-white/10 transition-all duration-300 z-20'
                            style={{
                                borderColor: 'rgba(255,255,255,0.1)',
                            }}
                        >
                            <X
                                className='w-5 h-5'
                                style={{
                                    color: 'rgba(255,255,255,0.7)',
                                }}
                            />
                        </button>

                        {/* Header */}
                        {!hasProduct && (
                            <DialogHeader className='relative z-10 px-7 pt-7 pb-0 text-center'>
                                <div className='flex flex-col items-center mb-5'>
                                    <div
                                        className='h-14 w-14 rounded-2xl border bg-black/30 flex items-center justify-center mb-4 shadow-xl'
                                        style={{
                                            borderColor: 'rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <Image
                                            width={120}
                                            height={120}
                                            src='/logocolored.png'
                                            alt='Logo'
                                            className='object-contain'
                                            style={{
                                                filter: isDangerVariant ? redLogoFilter : undefined,
                                            }}
                                        />
                                    </div>

                                    <DialogTitle className='text-2xl font-extrabold text-white leading-tight'>
                                        {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
                                    </DialogTitle>
                                </div>
                            </DialogHeader>
                        )}

                        {hasProduct && (
                            <div className='relative z-10 px-7 pt-3 pb-0 text-center'>
                                <p className='text-[15px] font-bold text-white/90'>{isSignUp ? 'Create an account to continue' : 'Sign in to purchase'}</p>

                                <p className='text-xs text-white/40 mt-0.5'>
                                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}

                                    <button
                                        type='button'
                                        onClick={() => {
                                            setIsSignUp((v) => !v);
                                            setAlert({ type: '', message: '' });
                                            reset();
                                        }}
                                        className='font-semibold hover:text-white transition-colors duration-300 cursor-pointer'
                                        style={{ color: modalAccent }}
                                    >
                                        {isSignUp ? 'Sign In' : 'Sign Up'}
                                    </button>
                                </p>
                            </div>
                        )}

                        {/* Body */}
                        <div className='relative z-10 px-7 pb-5 pt-3 overflow-hidden flex-1 flex flex-col'>
                            {alert.message && (
                                <div
                                    className={`mb-3 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                                        alert.type === 'success'
                                            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                                            : 'border-red-400/30 bg-red-500/10 text-red-300'
                                    }`}
                                >
                                    <div className='mt-0.5 shrink-0'>
                                        {alert.type === 'success' ? (
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                            </svg>
                                        ) : (
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                            </svg>
                                        )}
                                    </div>

                                    <span>{alert.message}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2.5 flex-1'>
                                {isSignUp && (
                                    <div className='space-y-1'>
                                        <div className='relative'>
                                            <Input
                                                id='fullName'
                                                type='text'
                                                placeholder='Full name'
                                                {...register('fullName', {
                                                    required: 'Full name is required',
                                                    validate: (v: string) => {
                                                        const cleaned = String(v || '')
                                                            .trim()
                                                            .replace(/\s+/g, ' ');

                                                        return cleaned.length >= 2 || 'Please enter your name';
                                                    },
                                                })}
                                                className='w-full rounded-2xl border border-white/10 bg-black/25 pl-12 pr-4 py-5 text-white placeholder:text-white/35 text-sm font-medium focus:bg-black/35 transition-all duration-300 outline-none'
                                                style={{
                                                    borderColor: undefined,
                                                }}
                                            />

                                            <User className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40' />
                                        </div>

                                        {errors?.fullName && <p className='text-red-400 text-xs px-1'>{(errors as any).fullName.message}</p>}
                                    </div>
                                )}

                                <div className='space-y-1'>
                                    <div className='relative'>
                                        <Input
                                            id='email'
                                            type='email'
                                            placeholder='Email address'
                                            {...register('email', { required: 'Email is required', validate: validateEmail as any })}
                                            className='w-full rounded-2xl border border-white/10 bg-black/25 pl-12 pr-4 py-5 text-white placeholder:text-white/35 text-sm font-medium focus:bg-black/35 transition-all duration-300 outline-none'
                                        />

                                        <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40' />
                                    </div>

                                    {errors?.email && <p className='text-red-400 text-xs px-1'>{(errors as any).email.message}</p>}
                                </div>

                                <div className='space-y-1'>
                                    <div className='relative'>
                                        <Input
                                            id='password'
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder='Password'
                                            {...register('password', { required: 'Password is required', validate: validatePassword as any })}
                                            className='w-full rounded-2xl border border-white/10 bg-black/25 pl-12 pr-12 py-5 text-white placeholder:text-white/35 text-sm font-medium focus:bg-black/35 transition-all duration-300 outline-none'
                                        />

                                        <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40' />

                                        <button
                                            type='button'
                                            onClick={() => setShowPassword((p) => !p)}
                                            className='absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-300'
                                        >
                                            {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                                        </button>
                                    </div>

                                    {errors?.password && <p className='text-red-400 text-xs px-1'>{(errors as any).password.message}</p>}
                                </div>

                                {isSignUp && (
                                    <div className='flex items-start gap-3 pt-0.5'>
                                        <button
                                            type='button'
                                            disabled={!termsCompleted}
                                            onClick={() => termsCompleted && setTermsAccepted((v) => !v)}
                                            className='mt-0.5 h-5 w-5 shrink-0 rounded-md border flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed'
                                            style={{
                                                backgroundColor: termsAccepted ? modalAccent : 'transparent',
                                                borderColor: termsAccepted ? modalAccent : termsCompleted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
                                                opacity: termsCompleted ? 1 : 0.5,
                                            }}
                                        >
                                            {termsAccepted && <CheckCircle className='h-3.5 w-3.5 text-[#080b12]' strokeWidth={3} />}
                                        </button>

                                        <p className='leading-relaxed text-xs text-white/50'>
                                            I agree to our{' '}
                                            <button
                                                type='button'
                                                onClick={() => setShowTermsModal(true)}
                                                className='text-xs font-semibold underline underline-offset-2 transition-colors hover:text-white'
                                                style={{ color: '#93c5fd' }}
                                            >
                                                Terms & Conditions
                                            </button>{' '}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    type='submit'
                                    disabled={isLoading || (isSignUp && !termsAccepted)}
                                    className='w-full rounded-2xl py-5 font-bold text-base transition-all duration-300 group disabled:cursor-not-allowed mt-auto flex items-center justify-center gap-3 border backdrop-blur-2xl hover:scale-[1.01] active:scale-[0.99]'
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(42, 47, 53, 0.62) 0%, rgba(20, 24, 29, 0.72) 100%)',
                                        borderColor: 'rgba(255,255,255,0.09)',
                                        color: 'rgba(255,255,255,0.66)',
                                        WebkitBackdropFilter: 'blur(18px) saturate(135%)',
                                        backdropFilter: 'blur(18px) saturate(135%)',
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.35), 0 14px 38px rgba(0,0,0,0.42)',
                                        opacity: isLoading || (isSignUp && !termsAccepted) ? 0.58 : 1,
                                    }}
                                >
                                    {isLoading ? (
                                        <div className='flex items-center justify-center gap-2'>Processing...</div>
                                    ) : (
                                        <>
                                            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                            <ChevronRight className='h-4 w-4 text-white/45 transition-transform duration-300 group-hover:translate-x-0.5' />
                                        </>
                                    )}
                                </Button>

                                {!hasProduct && (
                                    <div className='text-center pt-1'>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                setIsSignUp((v) => !v);
                                                setAlert({ type: '', message: '' });
                                                reset();
                                            }}
                                            className='text-white/50 text-sm'
                                        >
                                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}

                                            <span
                                                className='hover:text-white transition-colors duration-300 cursor-pointer font-semibold'
                                                style={{
                                                    color: '#4cc7e8',
                                                }}
                                            >
                                                {isSignUp ? ' Sign In' : ' Sign Up'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </form>

                            <div className='mt-3 flex items-center justify-center gap-2 text-xs text-white/30'>
                                <Lock className='h-3.5 w-3.5' />
                                Secure &amp; encrypted connection
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <TermsSlideModal
                open={showTermsModal}
                onOpenChange={setShowTermsModal}
                onComplete={() => {
                    setTermsCompleted(true);
                    setTermsAccepted(true);
                }}
            />
        </>
    );
}

// ─── AuthModalTrigger ─────────────────────────────────────────────────────────
export function AuthModalTrigger({
    buttonText = 'Sign In',
    defaultView = 'signin',
    redirectAfterLogin,
    redirectAfterSignup,
    sourceRoute,
    productContext,
    visualVariant = 'default',
    onSuccess,
    className,
    children,
}: {
    buttonText?: string;
    defaultView?: 'signin' | 'signup';
    redirectAfterLogin?: string;
    redirectAfterSignup?: string;
    sourceRoute?: string;
    productContext?: ProductContext;
    visualVariant?: AuthModalVisualVariant;
    onSuccess?: AuthModalProps['onSuccess'];
    className?: string;
    children?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {children ? (
                <span onClick={() => setOpen(true)}>{children}</span>
            ) : (
                <Button onClick={() => setOpen(true)} className={className}>
                    {buttonText}
                </Button>
            )}

            <AuthModal
                open={open}
                onOpenChange={setOpen}
                defaultView={defaultView}
                redirectAfterLogin={redirectAfterLogin}
                redirectAfterSignup={redirectAfterSignup}
                sourceRoute={sourceRoute}
                productContext={productContext}
                visualVariant={visualVariant}
                onSuccess={onSuccess}
            />
        </>
    );
}
