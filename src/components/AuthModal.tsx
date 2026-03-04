'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

export type AuthModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultView?: 'signin' | 'signup';
    redirectAfterLogin?: string;
    redirectAfterSignup?: string;
    sourceRoute?: string;
    onSuccess?: (ctx: { kind: 'login' | 'signup'; role?: string; userId?: string }) => boolean | void;
};

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

export default function AuthModal({
    open,
    onOpenChange,
    defaultView = 'signin',
    redirectAfterLogin = '/',
    redirectAfterSignup = '/pricing',
    sourceRoute,
    onSuccess,
}: AuthModalProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(defaultView === 'signup');
    const [isLoading, setIsLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | ''; message: string }>({
        type: '',
        message: '',
    });

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
                    role: currentRoute === '/lightningSilver' ? 'Affiliate' : '',
                };
                const response = await axios.post('/api/v2/signup', signupData);
                const userId = response.data.user.id as string | undefined;
                const userRoles = response.data.user.roles as string[] | undefined;
                if (userId) {
                    localStorage.setItem('userId', userId);
                    setCookie('id', userId);
                }
                if (userRoles) localStorage.setItem('roles', JSON.stringify(userRoles));
                setAlert({ type: 'success', message: 'Account created successfully! Please sign in.' });
                setIsSignUp(false);
                reset();
                const prevent = onSuccess?.({ kind: 'signup', role: signupData.role, userId }) === false;
                if (prevent) return;

                // close modal after successful signup
                onOpenChange(false);

                if (currentRoute === '/lightningSilver') {
                    router.push('/affiliate/dashboard/kpi');
                    return;
                }
                // if you want pricing to "refresh", do this instead of reload:
                router.push(redirectAfterSignup || '/pricing');
            } else {
                const loginData = { email: data.email, password: data.password };
                const response = await axios.post('/api/v2/login', loginData);
                if (response.data.role === 'admin') {
                    setCookie('admin_token', response.data.token);
                    setCookie('role', response.data.role);
                    setAlert({ type: 'success', message: 'Admin login successful!' });
                    reset();
                    const prevent = onSuccess?.({ kind: 'login', role: 'admin' });
                    if (!prevent) {
                        onOpenChange(false);
                        router.push('/admin/dashboard/sales');
                    }
                } else if (response.data.paymentRequired) {
                    setAlert({
                        type: 'error',
                        message: 'Access denied. Please complete your payment to access the system.',
                    });
                } else {
                    setCookie('token', response.data.token);
                    setCookie('id', response.data.user.id);
                    setAlert({ type: 'success', message: 'Login successful!' });
                    reset();
                    const prevent = onSuccess?.({ kind: 'login', role: response.data.role });
                    if (!prevent) {
                        onOpenChange(false);
                        router.push(redirectAfterLogin);
                    }
                }
            }
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
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!isLoading) onOpenChange(v);
            }}
        >
            <DialogContent className='max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none'>
                {/* ── Glassmorphic card matching PricingComponent aesthetic ── */}
                <div className='relative rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden'>
                    {/* Top accent line */}
                    <div className='absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]' />

                    {/* Close button */}
                    <DialogClose asChild>
                        <button className='absolute right-4 top-4 w-10 h-10 bg-black/40 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all duration-300 z-10'>
                            <X className='w-5 h-5 text-white/70' />
                        </button>
                    </DialogClose>

                    {/* Header */}
                    <DialogHeader className='px-8 pt-8 pb-0 text-center'>
                        <div className='flex flex-col items-center mb-6'>
                            <div className='h-16 w-16 rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center mb-5 shadow-xl'>
                                <Image width={120} height={120} src='/logocolored.png' alt='Logo' className='object-contain' />
                            </div>
                            <DialogTitle className='text-2xl font-extrabold text-white leading-tight'>
                                {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
                            </DialogTitle>
                            <DialogDescription className='text-white/55 text-sm mt-2 font-medium'>
                                {isSignUp ? 'Fill in the details to get started' : 'Enter your credentials to access the trading platform'}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* Body */}
                    <div className='px-8 pb-8 overflow-y-auto max-h-[calc(90vh-160px)]'>
                        {/* Alert */}
                        {alert.message && (
                            <div
                                className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
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

                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                            {/* Full Name (sign-up only) */}
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
                                            className='w-full rounded-2xl border border-white/10 bg-black/25 pl-12 pr-4 py-6 text-white placeholder:text-white/35 text-sm font-medium focus:border-[#4cc7e8]/50 focus:bg-black/35 transition-all duration-300 outline-none'
                                        />
                                        <User className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40' />
                                    </div>
                                    {errors?.fullName && <p className='text-red-400 text-xs px-1'>{(errors as any).fullName.message}</p>}
                                </div>
                            )}

                            {/* Email */}
                            <div className='space-y-1'>
                                <div className='relative'>
                                    <Input
                                        id='email'
                                        type='email'
                                        placeholder='Email address'
                                        {...register('email', {
                                            required: 'Email is required',
                                            validate: validateEmail as any,
                                        })}
                                        className='w-full rounded-2xl border border-white/10 bg-black/25 pl-12 pr-4 py-6 text-white placeholder:text-white/35 text-sm font-medium focus:border-[#4cc7e8]/50 focus:bg-black/35 transition-all duration-300 outline-none'
                                    />
                                    <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40' />
                                </div>
                                {errors?.email && <p className='text-red-400 text-xs px-1'>{(errors as any).email.message}</p>}
                            </div>

                            {/* Password */}
                            <div className='space-y-1'>
                                <div className='relative'>
                                    <Input
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Password'
                                        {...register('password', {
                                            required: 'Password is required',
                                            validate: validatePassword as any,
                                        })}
                                        className='w-full rounded-2xl border border-white/10 bg-black/25 pl-12 pr-12 py-6 text-white placeholder:text-white/35 text-sm font-medium focus:border-[#4cc7e8]/50 focus:bg-black/35 transition-all duration-300 outline-none'
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

                            {/* Terms line */}
                            <button type='button' onClick={() => setTermsAccepted((v) => !v)} className='flex items-start gap-3 pt-1 w-full text-left group'>
                                <div
                                    className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border flex items-center justify-center transition-all duration-200 ${
                                        termsAccepted ? 'border-[#4cc7e8]/60 bg-[#4cc7e8]/20' : 'border-white/20 bg-black/30 group-hover:border-white/40'
                                    }`}
                                >
                                    {termsAccepted && (
                                        <svg className='w-3 h-3 text-[#4cc7e8]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
                                        </svg>
                                    )}
                                </div>
                                <p className={`leading-relaxed text-xs transition-colors duration-200 ${termsAccepted ? 'text-white/60' : 'text-white/40'}`}>
                                    By continuing, you agree to our <span className='text-[#4cc7e8] hover:underline'>Terms of Service</span> and{' '}
                                    <span className='text-[#4cc7e8] hover:underline'>Privacy Policy</span>.
                                </p>
                            </button>
                            {!termsAccepted && <p className='text-white/30 text-xs px-1 -mt-1'>You must accept the terms to continue.</p>}

                            {/* Submit button */}
                            <Button
                                type='submit'
                                disabled={isLoading || !termsAccepted}
                                className='w-full rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 text-white py-6 font-bold text-base shadow-xl transition-all duration-300 group disabled:opacity-50 cursor-pointer mt-2'
                            >
                                {isLoading ? (
                                    <div className='flex items-center justify-center gap-2'>
                                        <svg className='animate-spin h-5 w-5 text-white' viewBox='0 0 24 24'>
                                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                                        </svg>
                                        Processing...
                                    </div>
                                ) : (
                                    <>
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                        <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
                                    </>
                                )}
                            </Button>

                            {/* Toggle sign-in / sign-up */}
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
                                    <span className='text-[#4cc7e8] hover:text-white transition-colors duration-300 cursor-pointer font-semibold'>
                                        {isSignUp ? 'Sign In' : 'Sign Up'}
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className='mt-5 flex items-center justify-center gap-2 text-xs text-white/30'>
                            <Lock className='h-3.5 w-3.5' />
                            Secure &amp; encrypted connection
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Convenience wrapper with its own trigger button.
 */
export function AuthModalTrigger({
    buttonText = 'Sign In',
    defaultView = 'signin',
    redirectAfterLogin,
    redirectAfterSignup,
    sourceRoute,
    onSuccess,
    className,
    children,
}: {
    buttonText?: string;
    defaultView?: 'signin' | 'signup';
    redirectAfterLogin?: string;
    redirectAfterSignup?: string;
    sourceRoute?: string;
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
                onSuccess={onSuccess}
            />
        </>
    );
}
