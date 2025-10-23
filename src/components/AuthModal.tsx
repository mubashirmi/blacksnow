'use client';

import axios from 'axios';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
// shadcn/ui
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// OPTIONAL: keep your existing Card look inside the modal
import { Card, CardContent } from '@/components/ui/card';

/**
 * Reusable auth modal that supports both Sign In and Sign Up flows.
 *
 * ✅ Drop-in anywhere (header, homepage button, pricing page, etc.)
 * ✅ Controlled via `open`/`onOpenChange`
 * ✅ Preserves all existing behaviors (alerts, validation, redirects, cookies)
 * ✅ Can default to signup from props or URL query (?signup, ?mode=signup, etc.)
 * ✅ Emits `onSuccess` so parents can react (analytics, close modal, toasts)
 */

export type AuthModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** default view if URL doesn't request signup */
    defaultView?: 'signin' | 'signup';
    /** If provided, overrides where to go after a successful login (non-admin). */
    redirectAfterLogin?: string;
    /** If provided, overrides where to go after a successful signup. */
    redirectAfterSignup?: string;
    /** If you're opening the modal from a specific route (e.g., '/affiliate'), pass it for role inference */
    sourceRoute?: string;
    /** Called on successful auth. Return true to prevent default redirect. */
    onSuccess?: (ctx: { kind: 'login' | 'signup'; role?: string; userId?: string }) => boolean | void;
};

function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
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
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    // Derive previousRoute (for role assignment) with a sensible fallback
    const currentRoute = useMemo(() => {
        const fromProp = sourceRoute ?? '';
        if (fromProp) return fromProp;
        if (typeof window !== 'undefined') {
            return window.location.pathname || '';
        }
        return '';
    }, [sourceRoute]);

    // Allow URL query to flip to signup when present (works on any page)
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
                const signupData = {
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    password: data.password,
                    role: currentRoute === '/affiliate' ? 'Affiliate' : 'Sales',
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

                const prevent = onSuccess?.({ kind: 'signup', role: signupData.role, userId });
                if (!prevent) {
                    // keep the modal open so they can sign in, but you can auto-redirect if you prefer
                    if (currentRoute === '/affiliate') {
                        router.push('/affiliate/dashboard/kpi');
                    } else {
                        router.push('/pricing');
                    }
                }
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
                        router.push('/admin/dashboard');
                    }
                } else if (response.data.paymentRequired) {
                    setAlert({ type: 'error', message: 'Access denied. Please complete your payment to access the system.' });
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
            setAlert({ type: 'error', message: error?.response?.data?.message || 'Something went wrong. Please try again.' });
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
            <DialogContent className='max-w-md p-0 overflow-hidden border-0 bg-transparent'>
                <Card className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-4xl overflow-hidden shadow-4xl shadow-[#2c7bbe]/20'>
                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]' />

                    <DialogHeader className='p-8 text-center'>
                        <div className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6'>
                            <Image width={120} height={120} src={'/logocolored.png'} alt='Logo' />
                        </div>
                        <DialogTitle className='text-2xl font-bold text-white mb-2 text-center'>
                            {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
                        </DialogTitle>
                        <DialogDescription className='text-gray-300 text-base text-center'>
                            {isSignUp ? 'Fill in the details to get started' : 'Enter your credentials to access the trading platform'}
                        </DialogDescription>
                    </DialogHeader>

                    <CardContent className='p-8 pt-0'>
                        {alert.message && (
                            <Alert className={`mb-6 ${alert.type === 'success' ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500'}`}>
                                <AlertTitle className='text-white'>{alert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                <AlertDescription className='text-gray-200'>{alert.message}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                            {isSignUp && (
                                <>
                                    <div className='space-y-2'>
                                        {/* <Label htmlFor='firstName' className='text-white font-semibold flex items-center space-x-2'>
                                            <User className='w-4 h-4 text-[#4cc7e8]' />
                                            <span>First Name</span>
                                        </Label> */}
                                        <div className='relative'>
                                            <Input
                                                id='firstName'
                                                type='text'
                                                placeholder='Enter your first name'
                                                {...register('firstName', {
                                                    required: 'First name is required',
                                                    minLength: { value: 2, message: 'First name must be at least 2 characters' },
                                                })}
                                                className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 rounded-2xl transition-all duration-300'
                                            />
                                            <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                                <User className='w-5 h-5 text-[#4cc7e8]' />
                                            </div>
                                        </div>
                                        {errors?.firstName && <p className='text-red-400 text-sm'>{(errors as any).firstName.message}</p>}
                                    </div>

                                    <div className='space-y-2'>
                                        {/* <Label htmlFor='lastName' className='text-white font-semibold flex items-center space-x-2'>
                                            <User className='w-4 h-4 text-[#4cc7e8]' />
                                            <span>Last Name</span>
                                        </Label> */}
                                        <div className='relative'>
                                            <Input
                                                id='lastName'
                                                type='text'
                                                placeholder='Enter your last name'
                                                {...register('lastName', {
                                                    required: 'Last name is required',
                                                    minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                                                })}
                                                className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 rounded-2xl transition-all duration-300'
                                            />
                                            <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                                <User className='w-5 h-5 text-[#4cc7e8]' />
                                            </div>
                                        </div>
                                        {errors?.lastName && <p className='text-red-400 text-sm'>{(errors as any).lastName.message}</p>}
                                    </div>
                                </>
                            )}

                            <div className='space-y-2'>
                                {/* <Label htmlFor='email' className='text-white font-semibold flex items-center space-x-2'>
                                    <Mail className='w-4 h-4 text-[#4cc7e8]' />
                                    <span>Email Address</span>
                                </Label> */}
                                <div className='relative'>
                                    <Input
                                        id='email'
                                        type='email'
                                        placeholder='Enter your email'
                                        {...register('email', { required: 'Email is required', validate: validateEmail as any })}
                                        className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 rounded-2xl transition-all duration-300'
                                    />
                                    <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                        <Mail className='w-5 h-5 text-[#4cc7e8]' />
                                    </div>
                                </div>
                                {errors?.email && <p className='text-red-400 text-sm'>{(errors as any).email.message}</p>}
                            </div>

                            <div className='space-y-2'>
                                {/* <Label htmlFor='password' className='text-white font-semibold flex items-center space-x-2'>
                                    <Lock className='w-4 h-4 text-[#4cc7e8]' />
                                    <span>Password</span>
                                </Label> */}
                                <div className='relative'>
                                    <Input
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Enter your password'
                                        {...register('password', { required: 'Password is required', validate: validatePassword as any })}
                                        className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 pr-12 rounded-2xl transition-all duration-300'
                                    />
                                    <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                        <Lock className='w-5 h-5 text-[#4cc7e8]' />
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => setShowPassword((p) => !p)}
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
                                className='w-full bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] hover:from-[#4cc7e8] hover:via-[#2a8dcc] hover:to-[#2c7bbe] text-white font-bold py-6 text-lg shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-500 transform hover:scale-105 rounded-2xl group disabled:opacity-50 cursor-pointer'
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
                                        {isSignUp ? 'Create Account' : 'Sign In to Dashboard'}
                                        <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
                                    </>
                                )}
                            </Button>

                            <div className='text-center'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setIsSignUp((v) => !v);
                                        setAlert({ type: '', message: '' });
                                        reset();
                                    }}
                                    className='text-[#fff] text-sm font-semibold'
                                >
                                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                                    <span className='cursor-pointer text-[#4cc7e8] hover:text-[#2c7bbe] transition-colors duration-300'>
                                        {isSignUp ? 'Sign In' : 'Sign Up'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </CardContent>

                    <DialogClose asChild>
                        <button className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'>
                            <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                        </button>
                    </DialogClose>
                </Card>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Convenience wrapper with its own trigger button. Useful for quick drops on pages.
 *
 * Example:
 * <AuthModalTrigger buttonText="Open Account" defaultView="signup" />
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
    children?: React.ReactNode; // if provided, this replaces the default button UI
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
