'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

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

        // handles: ?signup, ?signup=true, ?signup=1, ?view=signup, ?mode=signup
        const hasSignupKey = Object.prototype.hasOwnProperty.call(q, 'signup');
        const first = (k: string) => {
            const v = (q as any)[k];
            return Array.isArray(v) ? v[0] : v;
        };

        const raw = first('signup') ?? first('view') ?? first('mode') ?? '';
        const val = typeof raw === 'string' ? raw.toLowerCase() : '';

        const shouldSignUp = hasSignupKey || ['signup', 'true', '1', 'yes'].includes(val);

        setIsSignUp(shouldSignUp);
    }, [router.isReady, router.query]);

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Please enter a valid email address';
    };

    const validatePassword = (value) => {
        return value.length >= 6 || 'Password must be at least 6 characters long';
    };

    const setCookie = (name, value, days = 7) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setAlert({ type: '', message: '' });
        try {
            if (isSignUp) {
                const signupData = {
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    password: data.password,
                    role: '',
                };
                const refId = localStorage.getItem('referredby');
                let response;
                if (refId) {
                    response = await axios.post(`/api/v2/signup?referredBy=${refId}`, signupData);
                } else {
                    response = await axios.post('/api/v2/signup', signupData);
                }
                const userId = response.data.user.id;

                localStorage.setItem('userId', userId);
                setCookie('id', response.data.user.id);

                setAlert({
                    type: 'success',
                    message: 'Account created successfully! Please sign in.',
                });
                setIsSignUp(false);
                reset();
                router.push('/pricing');
            } else {
                const loginData = {
                    email: data.email,
                    password: data.password,
                };
                const response = await axios.post('/api/v2/login', loginData);

                // Check response for admin role
                if (response.data.role === 'admin') {
                    setCookie('admin_token', response.data.token);
                    setCookie('role', response.data.role);
                    setAlert({
                        type: 'success',
                        message: 'Admin login successful!',
                    });
                    reset();
                    router.push('/admin/dashboard');
                } else if (response.data.paymentRequired) {
                    setAlert({
                        type: 'error',
                        message: 'Access denied. Please complete your payment to access the system.',
                    });
                } else {
                    setCookie('token', response.data.token);
                    setCookie('id', response.data.user.id);
                    localStorage.setItem('userId', response.data.user.id);
                    localStorage.setItem('roles', JSON.stringify(response.data?.user?.roles));
                    setAlert({
                        type: 'success',
                        message: 'Login successful!',
                    });
                    reset();
                    router.push('/');
                }
            }
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#050608] py-10 relative overflow-hidden flex items-center justify-center'>
            <div className='relative z-10 w-full max-w-md px-6'>
                <Card className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl shadow-[#2c7bbe]/20 animate-slide-in-up delay-200'>
                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>

                    <CardHeader className='p-8 text-center'>
                        <div className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6'>
                            <Image width={120} height={120} src={'/logocolored.png'} alt='Logo' />
                        </div>
                        <CardTitle className='text-2xl font-bold text-white mb-2'>{isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}</CardTitle>
                        <CardDescription className='text-gray-300 text-base'>
                            {isSignUp ? 'Fill in the details to get started' : 'Enter your credentials to access the trading platform'}
                        </CardDescription>
                    </CardHeader>

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
                                        <Label htmlFor='firstName' className='text-white font-semibold flex items-center space-x-2'>
                                            <User className='w-4 h-4 text-[#4cc7e8]' />
                                            <span>First Name</span>
                                        </Label>
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
                                            <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                                                <User className='w-5 h-5 text-[#4cc7e8]' />
                                            </div>
                                        </div>
                                        {errors.firstName && <p className='text-red-400 text-sm'>{errors.firstName.message}</p>}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='lastName' className='text-white font-semibold flex items-center space-x-2'>
                                            <User className='w-4 h-4 text-[#4cc7e8]' />
                                            <span>Last Name</span>
                                        </Label>
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
                                            <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                                                <User className='w-5 h-5 text-[#4cc7e8]' />
                                            </div>
                                        </div>
                                        {errors.lastName && <p className='text-red-400 text-sm'>{errors.lastName.message}</p>}
                                    </div>
                                </>
                            )}

                            <div className='space-y-2'>
                                <Label htmlFor='email' className='text-white font-semibold flex items-center space-x-2'>
                                    <Mail className='w-4 h-4 text-[#4cc7e8]' />
                                    <span>Email Address</span>
                                </Label>
                                <div className='relative'>
                                    <Input
                                        id='email'
                                        type='email'
                                        placeholder='Enter your email'
                                        {...register('email', { required: 'Email is required', validate: validateEmail })}
                                        className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 rounded-2xl transition-all duration-300'
                                    />
                                    <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                                        <Mail className='w-5 h-5 text-[#4cc7e8]' />
                                    </div>
                                </div>
                                {errors.email && <p className='text-red-400 text-sm'>{errors.email.message}</p>}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='password' className='text-white font-semibold flex items-center space-x-2'>
                                    <Lock className='w-4 h-4 text-[#4cc7e8]' />
                                    <span>Password</span>
                                </Label>
                                <div className='relative'>
                                    <Input
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Enter your password'
                                        {...register('password', { required: 'Password is required', validate: validatePassword })}
                                        className='bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 border-2 border-[#2c7bbe]/30 focus:border-[#4cc7e8]/60 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold text-base py-6 pl-12 pr-12 rounded-2xl transition-all duration-300'
                                    />
                                    <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                                        <Lock className='w-5 h-5 text-[#4cc7e8]' />
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => setShowPassword(!showPassword)}
                                        className='absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4cc7e8] hover:text-[#2c7bbe] transition-colors duration-300'
                                    >
                                        {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                                    </button>
                                </div>
                                {errors.password && <p className='text-red-400 text-sm'>{errors.password.message}</p>}
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
                                        setIsSignUp(!isSignUp);
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
                </Card>
            </div>
        </div>
    );
}

export { SignIn };
