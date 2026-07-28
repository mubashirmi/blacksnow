'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CircleAlert, CreditCard, Loader2, ReceiptText, RefreshCcw, Repeat2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PagePaymentType = 'invoice' | 'subscription';
type PageStatus = 'loading' | 'ready' | 'redirecting' | 'error';

type StripePaymentRequest = {
    invoiceId: number;
    paymentType: 'one_time' | 'subscription';
    currency: 'usd';
    subscriptionInterval?: 'month';
};

type StripePaymentResponse = {
    success?: boolean;
    message?: string;
    error?: string;
    url?: string;
    checkoutUrl?: string;
    checkout_url?: string;
    paymentUrl?: string;
    payment_url?: string;
    data?: {
        success?: boolean;
        message?: string;
        url?: string;
        checkoutUrl?: string;
        checkout_url?: string;
        paymentUrl?: string;
        payment_url?: string;
    };
};

function getCheckoutUrl(data: StripePaymentResponse): string | null {
    return (
        data.url ||
        data.checkoutUrl ||
        data.checkout_url ||
        data.paymentUrl ||
        data.payment_url ||
        data.data?.url ||
        data.data?.checkoutUrl ||
        data.data?.checkout_url ||
        data.data?.paymentUrl ||
        data.data?.payment_url ||
        null
    );
}

function getResponseMessage(data: StripePaymentResponse, fallback: string): string {
    return data.error || data.message || data.data?.message || fallback;
}

function isSafeRedirectUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url, window.location.origin);
        return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
    } catch {
        return false;
    }
}

function PaymentApplicationContent() {
    const searchParams = useSearchParams();

    const rawInvoiceId = searchParams.get('id');
    const rawPaymentType = searchParams.get('paymentType');

    const invoiceId = rawInvoiceId ? Number(rawInvoiceId) : Number.NaN;
    const paymentType: PagePaymentType | null = rawPaymentType === 'invoice' || rawPaymentType === 'subscription' ? rawPaymentType : null;

    const [status, setStatus] = useState<PageStatus>('loading');
    const [statusMessage, setStatusMessage] = useState('Preparing your secure payment...');
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

    // React Strict Mode can run effects twice in development. This key prevents
    // the same URL parameters from creating two Stripe Checkout sessions.
    const processedRequestRef = useRef<string | null>(null);

    const paymentRequest = useMemo<StripePaymentRequest | null>(() => {
        if (!Number.isInteger(invoiceId) || invoiceId <= 0 || !paymentType) {
            return null;
        }

        if (paymentType === 'subscription') {
            return {
                invoiceId,
                paymentType: 'subscription',
                subscriptionInterval: 'month',
                currency: 'usd',
            };
        }

        return {
            invoiceId,
            paymentType: 'one_time',
            currency: 'usd',
        };
    }, [invoiceId, paymentType]);

    const redirectToCheckout = useCallback((url: string) => {
        if (!isSafeRedirectUrl(url)) {
            setStatus('error');
            setStatusMessage('The payment server returned an invalid checkout URL.');
            return;
        }

        setStatus('redirecting');
        setStatusMessage('Redirecting you to secure Stripe Checkout...');
        window.location.assign(url);
    }, []);

    const createPaymentSession = useCallback(async () => {
        if (!rawInvoiceId) {
            setStatus('error');
            setStatusMessage('The invoice ID is missing from the page URL.');
            return;
        }

        if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
            setStatus('error');
            setStatusMessage('The invoice ID in the page URL is invalid.');
            return;
        }

        if (!paymentType) {
            setStatus('error');
            setStatusMessage('Payment type must be either "invoice" or "subscription".');
            return;
        }

        if (!paymentRequest) {
            setStatus('error');
            setStatusMessage('Unable to prepare the payment request.');
            return;
        }

        setStatus('loading');
        setStatusMessage(paymentType === 'subscription' ? 'Preparing your monthly subscription...' : 'Preparing your one-time invoice payment...');
        setCheckoutUrl(null);

        try {
            const paymentEndpoint = paymentType === 'subscription' ? '/api/v2/subscriptionInv/stripe-payment' : '/api/v2/invoices/stripe-payment';

            const response = await fetch(paymentEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(paymentRequest),
            });

            let data: StripePaymentResponse = {};

            try {
                data = (await response.json()) as StripePaymentResponse;
            } catch {
                // The error below handles empty or non-JSON responses.
            }

            if (!response.ok || data.success === false || data.data?.success === false) {
                throw new Error(getResponseMessage(data, 'Unable to create the Stripe payment session.'));
            }

            const paymentUrl = getCheckoutUrl(data);

            if (!paymentUrl) {
                throw new Error(getResponseMessage(data, 'Payment session created, but no Stripe checkout URL was returned.'));
            }

            if (!isSafeRedirectUrl(paymentUrl)) {
                throw new Error('The payment server returned an invalid checkout URL.');
            }

            setCheckoutUrl(paymentUrl);
            setStatus('ready');
            setStatusMessage('Your secure Stripe Checkout session is ready.');

            // Redirect immediately. The button remains useful when a browser blocks
            // navigation or the user returns to this page from checkout.
            redirectToCheckout(paymentUrl);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to start the payment.';

            console.error('Stripe payment session creation failed:', error);
            setStatus('error');
            setStatusMessage(message);
        }
    }, [invoiceId, paymentRequest, paymentType, rawInvoiceId, redirectToCheckout]);

    useEffect(() => {
        const requestKey = `${rawInvoiceId ?? ''}:${rawPaymentType ?? ''}`;

        if (processedRequestRef.current === requestKey) return;
        processedRequestRef.current = requestKey;
        // eslint-disable-next-line
        void createPaymentSession();
    }, [createPaymentSession, rawInvoiceId, rawPaymentType]);

    const isSubscription = paymentType === 'subscription';
    const isBusy = status === 'loading' || status === 'redirecting';

    return (
        <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050608] py-20'>
            <div className='relative z-10 w-full max-w-2xl px-6'>
                <div className='mb-8 text-center animate-slide-in-up'>
                    <div className='mb-6 inline-flex items-center space-x-3 rounded-full border border-[#4cc7e8]/30 bg-gradient-to-r from-[#2c7bbe]/10 via-[#4cc7e8]/20 to-[#2a8dcc]/10 px-8 py-4 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                        {status === 'error' ? (
                            <CircleAlert className='h-6 w-6 text-red-400' />
                        ) : isBusy ? (
                            <Loader2 className='h-6 w-6 animate-spin text-[#4cc7e8]' />
                        ) : (
                            <ShieldCheck className='h-6 w-6 text-[#4cc7e8]' />
                        )}

                        <span className={`text-sm font-bold uppercase tracking-wider ${status === 'error' ? 'text-red-400' : 'text-[#4cc7e8]'}`}>
                            {status === 'error' ? 'Payment Error' : status === 'ready' ? 'Checkout Ready' : 'Secure Payment'}
                        </span>
                    </div>
                </div>

                <div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 opacity-60 blur-2xl' />

                <Card className='relative overflow-hidden rounded-3xl border-2 border-[#2c7bbe]/30 bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl transition-all duration-500 hover:border-[#4cc7e8]/50 animate-slide-in-up delay-200'>
                    <div className='absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]' />

                    <CardHeader className='p-8 text-center sm:p-12'>
                        <div className='mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] shadow-2xl shadow-[#2c7bbe]/40 animate-bounce-slow'>
                            {isSubscription ? <Repeat2 className='h-12 w-12 text-white' /> : <CreditCard className='h-12 w-12 text-white' />}
                        </div>

                        <CardTitle className='mb-6 text-4xl font-black text-white lg:text-5xl'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                {isSubscription ? 'Start Subscription' : 'Pay Your Invoice'}
                            </span>
                        </CardTitle>

                        <h2 className='text-xl font-bold text-white sm:text-2xl'>
                            {isSubscription
                                ? 'Continue to Stripe to activate your monthly subscription.'
                                : 'Continue to Stripe to complete your one-time payment.'}
                        </h2>

                        <div className='mt-6 flex justify-center'>
                            <div
                                className={`inline-flex max-w-full items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold ${
                                    status === 'error'
                                        ? 'border-red-400/30 bg-red-400/10 text-red-400'
                                        : 'border-[#4cc7e8]/30 bg-[#4cc7e8]/10 text-[#4cc7e8] shadow-lg shadow-[#2c7bbe]/20'
                                }`}
                            >
                                {isBusy && <Loader2 className='h-4 w-4 shrink-0 animate-spin' />}
                                {status === 'error' && <CircleAlert className='h-4 w-4 shrink-0' />}
                                <span>{statusMessage}</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className='p-8 pt-0 sm:p-12 sm:pt-0'>
                        <div className='mb-8 grid gap-6 md:grid-cols-2'>
                            <div className='rounded-2xl border border-[#4cc7e8]/20 bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 p-6 text-center'>
                                <ReceiptText className='mx-auto mb-3 h-8 w-8 text-[#4cc7e8]' />
                                <h3 className='mb-2 font-bold text-white'>Invoice</h3>
                                <p className='break-words text-sm text-gray-300'>
                                    {Number.isInteger(invoiceId) && invoiceId > 0 ? `Invoice #${invoiceId}` : 'No valid invoice selected'}
                                </p>
                            </div>

                            <div className='rounded-2xl border border-[#4cc7e8]/20 bg-gradient-to-r from-[#4cc7e8]/10 to-[#2a8dcc]/10 p-6 text-center'>
                                {isSubscription ? (
                                    <Repeat2 className='mx-auto mb-3 h-8 w-8 text-[#4cc7e8]' />
                                ) : (
                                    <ShieldCheck className='mx-auto mb-3 h-8 w-8 text-[#4cc7e8]' />
                                )}
                                <h3 className='mb-2 font-bold text-white'>Payment Plan</h3>
                                <p className='text-sm text-gray-300'>
                                    {isSubscription
                                        ? 'Monthly subscription · USD'
                                        : paymentType === 'invoice'
                                        ? 'One-time payment · USD'
                                        : 'Invalid payment type'}
                                </p>
                            </div>
                        </div>

                        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                            {status === 'error' ? (
                                <Button
                                    type='button'
                                    onClick={() => {
                                        processedRequestRef.current = null;
                                        // eslint-disable-next-line
                                        void createPaymentSession();
                                    }}
                                    className='rounded-2xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-8 py-6 text-lg font-bold text-white shadow-lg shadow-[#2c7bbe]/30 transition-all duration-300 hover:opacity-90'
                                >
                                    <RefreshCcw className='mr-2 h-5 w-5' />
                                    Try Again
                                </Button>
                            ) : (
                                <Button
                                    type='button'
                                    disabled={isBusy || !checkoutUrl}
                                    onClick={() => checkoutUrl && redirectToCheckout(checkoutUrl)}
                                    className='rounded-2xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-8 py-6 text-lg font-bold text-white shadow-lg shadow-[#2c7bbe]/30 transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    {isBusy ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <ArrowRight className='mr-2 h-5 w-5' />}
                                    {status === 'redirecting' ? 'Redirecting...' : 'Continue to Checkout'}
                                </Button>
                            )}

                            <Button
                                asChild
                                variant='outline'
                                className='rounded-2xl border-2 border-[#4cc7e8]/30 bg-transparent px-8 py-6 text-lg font-bold text-[#4cc7e8] transition-all duration-300 hover:border-[#4cc7e8]/50 hover:bg-[#4cc7e8]/10'
                            >
                                <Link href='/'>Return Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function PaymentApplicationPage() {
    return (
        <Suspense
            fallback={
                <div className='flex min-h-screen items-center justify-center bg-[#050608] text-[#4cc7e8]'>
                    <Loader2 className='mr-3 h-6 w-6 animate-spin' />
                    Loading payment page...
                </div>
            }
        >
            <PaymentApplicationContent />
        </Suspense>
    );
}

export { PaymentApplicationContent };
