'use client';

import { LottieAnimation } from '@/components/lottie-animation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

// ── Snowflake config ──────────────────────────────────────────
const SNOWFLAKE_COUNT = 45;

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

// ── Carousel data — Lottie JSON paths ────────────────────────
const UNIFIED_CARD_HEIGHT = 580;

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

// ── Left carousel panel ───────────────────────────────────────
function ProductCarousel() {
    const [current, setCurrent] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setCurrent((prev) => (prev + 1) % SLIDES.length);
                setVisible(true);
            }, 450);
        }, 3500);
        return () => clearInterval(timer);
    }, []);

    const { lottie, accent, label, subtitle, desc } = SLIDES[current];

    return (
        <div className='relative w-full h-full flex flex-col items-center justify-center px-10 py-12 select-none overflow-hidden'>
            {/* Accent glow blob */}
            <div
                className='pointer-events-none absolute inset-0 transition-all duration-1000'
                style={{ background: `radial-gradient(ellipse at 50% 45%, ${accent}1a 0%, transparent 68%)` }}
            />
            {/* Grid texture */}
            <div
                className='pointer-events-none absolute inset-0 opacity-[0.025]'
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                }}
            />

            {/* Slide content */}
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

            {/* Dot indicators */}
            <div className='absolute bottom-8 flex items-center gap-2.5'>
                {SLIDES.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setVisible(false);
                            setTimeout(() => {
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
                    />
                ))}
            </div>
        </div>
    );
}

// ── Main SignIn component ─────────────────────────────────────
function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '' });
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

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
    const setCookie = (name: string, value: string, days = 7) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    };

    const onSubmit = async (data: any) => {
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
                        role: '',
                    });
                } else {
                    response = await axios.post('/api/v2/signup', { email: data.email, firstName, lastName, password: data.password, role: '' });
                }
                localStorage.setItem('userId', response.data.user.id);
                setCookie('firstName', response.data.user.firstName);
                setCookie('lastName', response.data.user.lastName);
                setCookie('email', response.data.user.email);
                setCookie('id', response.data.user.id);
                setAlert({ type: 'success', message: 'Account created successfully! Please sign in.' });
                setIsSignUp(false);
                reset();
                router.push('/pricing');
            } else {
                const response = await axios.post('/api/v2/login', { email: data.email, password: data.password });
                const { token, user, paymentRequired } = response.data || {};
                const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => String(r).toLowerCase()) : [];
                if (roles.includes('admin')) {
                    setCookie('admin_token', token);
                    setCookie('role', 'admin');
                    setCookie('adminId', user.id);
                    setCookie('id', user.id);
                    localStorage.setItem('adminId', String(user.id));
                    localStorage.setItem('roles', JSON.stringify(user.roles || []));
                    setAlert({ type: 'success', message: 'Admin login successful!' });
                    reset();
                    router.push('/admin/dashboard/sales');
                } else if (roles.includes('sales')) {
                    setCookie('token', token);
                    setCookie('id', user.id);
                    setCookie('firstName', user.firstName);
                    setCookie('lastName', user.lastName);
                    localStorage.setItem('userId', String(user.id));
                    localStorage.setItem('roles', JSON.stringify(user.roles || []));
                    setAlert({ type: 'success', message: 'Login successful!' });
                    reset();
                    router.push('/sales/dashboard/users');
                } else if (paymentRequired) {
                    setAlert({ type: 'error', message: 'Access denied. Please complete your payment to access the system.' });
                } else {
                    setCookie('token', token);
                    setCookie('id', user.id);
                    setCookie('firstName', user.firstName);
                    setCookie('lastName', user.lastName);
                    setCookie('email', user.email);
                    localStorage.setItem('userId', String(user.id));
                    localStorage.setItem('roles', JSON.stringify(user.roles || []));
                    setAlert({ type: 'success', message: 'Login successful!' });
                    reset();
                    router.push('/pricing');
                }
            }
        } catch (error: any) {
            setAlert({ type: 'error', message: error?.response?.data?.message || 'Something went wrong. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] bg-[#050608] relative overflow-hidden flex items-center justify-center py-10'>
            {/* Background */}
            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/blacksnowbgimage.webp')" }} />
                <div className='absolute inset-0 bg-black/90' />
            </div>

            {/* Snowflakes */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none z-[5]'>
                <Snowflakes />
            </div>

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
                    {/* Glass shine */}
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

                    {/* Top gradient bar */}
                    <div className='absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] z-20' />

                    {/* LEFT — Carousel (hidden on mobile) */}
                    <div className='relative z-10 hidden lg:flex lg:w-[50%] flex-shrink-0'>
                        <ProductCarousel />
                    </div>

                    {/* Center divider */}
                    <div className='relative z-10 hidden lg:block w-[1px] flex-shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/10 to-transparent my-8' />

                    {/* RIGHT — Form: min-height locks the card to SignUp height at all times */}
                    <div className='relative z-10 flex-1 flex flex-col justify-center px-8 sm:px-10 py-10' style={{ minHeight: UNIFIED_CARD_HEIGHT }}>
                        <div className='text-center mb-8'>
                            <div className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5'>
                                <Image width={120} height={120} src={'/logocolored.png'} alt='Logo' />
                            </div>
                            <h2 className='text-2xl font-bold text-white mb-1'>{isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}</h2>
                            <p className='text-gray-400 text-sm'>
                                {isSignUp ? 'Fill in the details to get started' : 'Enter your credentials to access the trading platform'}
                            </p>
                        </div>

                        {alert.message && (
                            <Alert className={`mb-5 ${alert.type === 'success' ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500'}`}>
                                <AlertTitle className='text-white'>{alert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                <AlertDescription className='text-gray-200'>{alert.message}</AlertDescription>
                            </Alert>
                        )}

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
                                                validate: (v: string) =>
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
                                    {errors?.fullName && <p className='text-red-400 text-sm'>{(errors as any).fullName.message}</p>}
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
                                {errors?.email && <p className='text-red-400 text-sm'>{(errors as any).email.message}</p>}
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
                                    >
                                        {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                                    </button>
                                </div>
                                {errors?.password && <p className='text-red-400 text-sm'>{(errors as any).password.message}</p>}
                            </div>

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
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.38), 0 14px 34px rgba(0,0,0,0.42)',
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export { SignIn };
