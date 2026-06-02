'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, CheckCircle, Home, Loader2, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type ConfirmationStatus = 'loading' | 'success' | 'error';

type ConfirmConsultationResponse = {
    message?: string;
    consultation?: {
        id?: number;
        fullName?: string;
        companyName?: string;
        email?: string;
        phone?: string;
        status?: string;
    };
};

export default function ConsultationConfirmation() {
    const [status, setStatus] = useState<ConfirmationStatus>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const hasConfirmedRef = useRef(false);

    useEffect(() => {
        if (hasConfirmedRef.current) return;
        hasConfirmedRef.current = true;

        const confirmConsultationBooking = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const sessionId = params.get('session_id');

                if (!sessionId) {
                    throw new Error('Missing checkout session ID. Please contact support so we can confirm your consultation booking.');
                }

                const response = await fetch('/api/v5/consultation/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ session_id: sessionId }),
                });

                let result: ConfirmConsultationResponse | null = null;
                const contentType = response.headers.get('content-type');

                if (contentType?.includes('application/json')) {
                    result = await response.json();
                }

                if (!response.ok) {
                    throw new Error(result?.message || 'Unable to confirm your consultation booking right now. Please contact support.');
                }

                setStatus('success');
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Something went wrong while confirming your consultation booking.');
                setStatus('error');
            }
        };

        confirmConsultationBooking();
    }, []);

    const isLoading = status === 'loading';
    const isSuccess = status === 'success';
    const isError = status === 'error';

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden flex items-center justify-center px-4 py-10'>
            <div className='absolute top-[-120px] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#4cc7e8]/10 blur-3xl' />
            <div className='absolute bottom-[-140px] right-[-80px] h-80 w-80 rounded-full bg-[#2c7bbe]/10 blur-3xl' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(76,199,232,0.08),transparent_35%),radial-gradient(circle_at_bottom,rgba(44,123,190,0.08),transparent_35%)]' />

            <div className='relative z-10 w-full max-w-xl'>
                <div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2c7bbe]/10 via-[#4cc7e8]/10 to-emerald-500/10 blur-2xl opacity-70' />

                <Card
                    className={`relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/95 to-[#050608]/95 backdrop-blur-2xl shadow-2xl transition-all duration-500 ${
                        isError
                            ? 'border-red-500/30 shadow-red-500/10'
                            : isSuccess
                            ? 'border-green-500/30 shadow-green-500/20'
                            : 'border-[#4cc7e8]/30 shadow-[#2c7bbe]/20'
                    }`}
                >
                    <div
                        className={`absolute left-0 top-0 h-1 w-full ${
                            isError
                                ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600'
                                : isSuccess
                                ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600'
                                : 'bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'
                        }`}
                    />

                    <CardHeader className='px-7 pb-4 pt-10 text-center sm:px-10'>
                        <div
                            className={`mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl ${
                                isError
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30'
                                    : isSuccess
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-500/40'
                                    : 'bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] shadow-[#2c7bbe]/40'
                            }`}
                        >
                            {isLoading && <Loader2 className='h-10 w-10 animate-spin text-white' />}
                            {isSuccess && <CheckCircle className='h-10 w-10 text-white' />}
                            {isError && <AlertCircle className='h-10 w-10 text-white' />}
                        </div>

                        <div className='mb-4 flex justify-center'>
                            <div
                                className={`inline-flex items-center rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
                                    isError
                                        ? 'border-red-400/30 bg-red-500/10 text-red-300'
                                        : isSuccess
                                        ? 'border-green-400/30 bg-green-500/10 text-green-300'
                                        : 'border-[#4cc7e8]/30 bg-[#4cc7e8]/10 text-[#4cc7e8]'
                                }`}
                            >
                                {isLoading && 'Confirming'}
                                {isSuccess && 'Success'}
                                {isError && 'Action Needed'}
                            </div>
                        </div>

                        <CardTitle className='text-3xl font-black text-white sm:text-4xl'>
                            {isLoading && 'Confirming your consultation'}
                            {isSuccess && 'Consultation booking successful'}
                            {isError && 'Booking confirmation failed'}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className='px-7 pb-10 pt-2 text-center sm:px-10'>
                        {isLoading && (
                            <div className='space-y-5'>
                                <p className='mx-auto max-w-md text-base leading-relaxed text-gray-300'>
                                    Please wait while we verify your Stripe checkout session and confirm your consultation booking.
                                </p>

                                <div className='mx-auto max-w-sm rounded-2xl border border-[#4cc7e8]/20 bg-[#4cc7e8]/10 p-5'>
                                    <div className='mb-3 h-3 w-full animate-pulse rounded-full bg-white/10' />
                                    <div className='mx-auto h-3 w-4/5 animate-pulse rounded-full bg-white/10' />
                                </div>
                            </div>
                        )}

                        {isSuccess && (
                            <div className='space-y-7'>
                                <div className='mx-auto max-w-md rounded-2xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6'>
                                    <p className='text-lg font-semibold leading-relaxed text-white'>Thank you. Your consultation booking has been confirmed.</p>
                                    <p className='mt-3 text-sm leading-relaxed text-gray-300'>
                                        Our team will review the details you provided in the form and contact you through your submitted email or phone number.
                                    </p>
                                </div>

                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <div className='rounded-2xl border border-[#4cc7e8]/20 bg-[#4cc7e8]/10 p-5'>
                                        <Mail className='mx-auto mb-3 h-6 w-6 text-[#4cc7e8]' />
                                        <h3 className='mb-1 font-bold text-white'>Email Follow-Up</h3>
                                        <p className='text-xs leading-relaxed text-gray-400'>We may send your consultation details by email.</p>
                                    </div>

                                    <div className='rounded-2xl border border-green-500/20 bg-green-500/10 p-5'>
                                        <Phone className='mx-auto mb-3 h-6 w-6 text-green-400' />
                                        <h3 className='mb-1 font-bold text-white'>Direct Contact</h3>
                                        <p className='text-xs leading-relaxed text-gray-400'>Our team may reach out by phone if needed.</p>
                                    </div>
                                </div>

                                <div className='flex justify-center'>
                                    <Button
                                        asChild
                                        className='group rounded-2xl bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] px-8 py-6 text-base font-bold text-white shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-500 hover:scale-105 hover:from-[#4cc7e8] hover:via-[#2a8dcc] hover:to-[#2c7bbe]'
                                    >
                                        <Link href='/'>
                                            Return Home
                                            <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isError && (
                            <div className='space-y-7'>
                                <div className='mx-auto max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6'>
                                    <p className='text-base leading-relaxed text-gray-200'>{errorMessage}</p>
                                    <p className='mt-3 text-sm leading-relaxed text-gray-400'>
                                        If your payment was completed, please contact support and we will manually verify your consultation booking.
                                    </p>
                                </div>

                                <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                                    <Button
                                        asChild
                                        className='rounded-2xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-8 py-6 text-base font-bold text-white shadow-xl shadow-[#2c7bbe]/30 transition-all duration-300 hover:scale-105'
                                    >
                                        <Link href='/consultation'>Try Again</Link>
                                    </Button>

                                    <Button
                                        asChild
                                        variant='outline'
                                        className='rounded-2xl border-2 border-white/15 bg-transparent px-8 py-6 text-base font-bold text-white transition-all duration-300 hover:bg-white/10'
                                    >
                                        <Link href='/'>
                                            <Home className='mr-2 h-5 w-5' />
                                            Return Home
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
