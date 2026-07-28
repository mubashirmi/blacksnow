'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, CircleAlert, Loader2, ReceiptText, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

type ApiStatusType = 'loading' | 'success' | 'error';

type StripeInvoiceStatusResponse = {
    success?: boolean;
    message?: string;
    error?: string;
    status?: string;
    paid?: boolean;
    invoiceId?: string;
    invoice_id?: string;
    amount?: number;
    currency?: string;
    data?: {
        success?: boolean;
        message?: string;
        status?: string;
        paid?: boolean;
        invoiceId?: string;
        invoice_id?: string;
        amount?: number;
        currency?: string;
    };
};

type InvoiceDetails = {
    invoiceId?: string;
    amount?: number;
    currency?: string;
};

function getErrorMessage(data: StripeInvoiceStatusResponse, fallback: string) {
    return data.error || data.message || data.data?.message || fallback;
}

function isInvoiceDeductionSuccessful(data: StripeInvoiceStatusResponse) {
    const success = data.success ?? data.data?.success;
    const paid = data.paid ?? data.data?.paid;
    const status = (data.status ?? data.data?.status ?? '').toLowerCase();

    if (success === false || paid === false) return false;
    if (success === true || paid === true) return true;

    if (['paid', 'succeeded', 'success', 'complete', 'completed'].includes(status)) {
        return true;
    }

    if (['failed', 'error', 'unpaid', 'open', 'void', 'canceled', 'cancelled'].includes(status)) {
        return false;
    }

    // When the API uses the HTTP status as the success signal.
    return true;
}

function InvoiceDeductionConfirmationContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [apiStatus, setApiStatus] = useState('Verifying your invoice payment...');
    const [statusType, setStatusType] = useState<ApiStatusType>('loading');
    const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({});

    const processedSessionRef = useRef<string | null>(null);

    const verifyInvoice = useCallback(async () => {
        if (!sessionId) {
            setStatusType('error');
            setApiStatus('Unable to verify the invoice because the session ID is missing.');
            return;
        }

        setStatusType('loading');
        setApiStatus('Verifying your invoice payment...');

        try {
            const response = await fetch(`/api/v2/invoices/stripe-status?session_id=${encodeURIComponent(sessionId)}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                cache: 'no-store',
            });

            let data: StripeInvoiceStatusResponse = {};

            try {
                data = (await response.json()) as StripeInvoiceStatusResponse;
            } catch {
                // Keep an empty object when the server sends no JSON body.
            }

            if (!response.ok) {
                throw new Error(getErrorMessage(data, 'Invoice verification failed.'));
            }

            if (!isInvoiceDeductionSuccessful(data)) {
                throw new Error(getErrorMessage(data, 'The invoice payment has not completed successfully.'));
            }

            setInvoiceDetails({
                invoiceId: data.invoiceId ?? data.invoice_id ?? data.data?.invoiceId ?? data.data?.invoice_id,
                amount: data.amount ?? data.data?.amount,
                currency: data.currency ?? data.data?.currency,
            });
            setStatusType('success');
            setApiStatus(data.message || data.data?.message || 'Invoice payment deducted successfully!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to verify the invoice payment.';

            console.error('Invoice verification failed:', error);
            setStatusType('error');
            setApiStatus(message);
        }
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId) {
            setStatusType('error');
            setApiStatus('Unable to verify the invoice because the session ID is missing.');
            return;
        }

        // Prevent duplicate requests in React Strict Mode for the same session.
        if (processedSessionRef.current === sessionId) return;
        processedSessionRef.current = sessionId;
        // eslint-disable-next-line
        void verifyInvoice();
    }, [sessionId, verifyInvoice]);
    // eslint-disable-next-line
    const formattedAmount =
        typeof invoiceDetails.amount === 'number' && invoiceDetails.currency
            ? new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: invoiceDetails.currency.toUpperCase(),
              }).format(invoiceDetails.amount / 100)
            : null;

    return (
        <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050608] py-20'>
            <div className='relative z-10 w-full max-w-2xl px-6'>
                <div className='mb-8 text-center animate-slide-in-up'>
                    <div className='mb-6 inline-flex items-center space-x-3 rounded-full border border-[#4cc7e8]/30 bg-gradient-to-r from-[#2c7bbe]/10 via-[#4cc7e8]/20 to-[#2a8dcc]/10 px-8 py-4 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                        {statusType === 'loading' ? (
                            <Loader2 className='h-6 w-6 animate-spin text-[#4cc7e8]' />
                        ) : statusType === 'success' ? (
                            <CheckCircle className='h-6 w-6 animate-pulse text-[#4cc7e8]' />
                        ) : (
                            <CircleAlert className='h-6 w-6 text-red-400' />
                        )}
                        <span className='text-sm font-bold uppercase tracking-wider text-[#4cc7e8]'>
                            {statusType === 'loading' ? 'Processing' : statusType === 'success' ? 'Invoice Paid' : 'Verification Failed'}
                        </span>
                    </div>
                </div>

                <div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 opacity-60 blur-2xl' />

                <Card className='relative overflow-hidden rounded-3xl border-2 border-[#2c7bbe]/30 bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl transition-all duration-500 hover:border-[#4cc7e8]/50 animate-slide-in-up delay-200'>
                    <div className='absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]' />

                    <CardHeader className='p-8 text-center sm:p-12'>
                        <div className='mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] shadow-2xl shadow-[#2c7bbe]/40 animate-bounce-slow'>
                            <ReceiptText className='h-12 w-12 text-white' />
                        </div>

                        <CardTitle className='mb-6 text-4xl font-black text-white lg:text-5xl'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                Invoice Confirmation
                            </span>
                        </CardTitle>

                        <div className='space-y-4 text-center'>
                            <h2 className='text-2xl font-bold text-white lg:text-3xl'>
                                {statusType === 'success'
                                    ? 'Your invoice payment was successful.'
                                    : statusType === 'error'
                                    ? 'We could not confirm your invoice payment.'
                                    : 'Your invoice payment is being confirmed.'}
                            </h2>

                            <div className='flex justify-center'>
                                {statusType === 'loading' && (
                                    <div className='inline-flex items-center gap-3 rounded-full border border-[#4cc7e8]/30 bg-[#4cc7e8]/10 px-5 py-3 text-sm font-semibold text-[#4cc7e8] shadow-lg shadow-[#2c7bbe]/20'>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        <span>{apiStatus}</span>
                                    </div>
                                )}

                                {statusType === 'success' && (
                                    <p className='inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-5 py-3 text-sm font-semibold text-green-400'>
                                        <CheckCircle className='h-4 w-4' />
                                        {apiStatus}
                                    </p>
                                )}

                                {statusType === 'error' && (
                                    <p className='inline-flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-400'>
                                        <CircleAlert className='h-4 w-4 shrink-0' />
                                        {apiStatus}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className='p-8 pt-0 sm:p-12 sm:pt-0'>
                        <div className='mb-8 grid gap-6 md:grid-cols-2'>
                            <div className='rounded-2xl border border-[#4cc7e8]/20 bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 p-6 text-center'>
                                <ReceiptText className='mx-auto mb-3 h-8 w-8 text-[#4cc7e8]' />
                                <h3 className='mb-2 font-bold text-white'>Invoice Status</h3>
                                <p className='text-sm text-gray-300'>
                                    {statusType === 'success'
                                        ? 'Paid and recorded successfully'
                                        : statusType === 'error'
                                        ? 'Payment confirmation is incomplete'
                                        : 'Checking payment with Stripe'}
                                </p>
                            </div>

                            <div className='rounded-2xl border border-[#4cc7e8]/20 bg-gradient-to-r from-[#4cc7e8]/10 to-[#2a8dcc]/10 p-6 text-center'>
                                <ShieldCheck className='mx-auto mb-3 h-8 w-8 text-[#4cc7e8]' />
                                <h3 className='mb-2 font-bold text-white'>Secure Payment</h3>
                                <p className='text-sm text-gray-300'>Your payment status was verified securely through Stripe.</p>
                            </div>
                        </div>

                        {/* {statusType === 'success' && (invoiceDetails.invoiceId || formattedAmount) && (
                            <div className='mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-gray-300'>
                                {invoiceDetails.invoiceId && (
                                    <p>
                                        <span className='font-semibold text-white'>Invoice:</span> {invoiceDetails.invoiceId}
                                    </p>
                                )}
                                {formattedAmount && (
                                    <p className='mt-2'>
                                        <span className='font-semibold text-white'>Amount paid:</span> {formattedAmount}
                                    </p>
                                )}
                            </div>
                        )} */}

                        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                            {statusType === 'error' && sessionId && (
                                <Button
                                    type='button'
                                    onClick={() => {
                                        processedSessionRef.current = null;
                                        // eslint-disable-next-line
                                        void verifyInvoice();
                                    }}
                                    className='rounded-2xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-8 py-6 text-lg font-bold text-white transition-all duration-300 hover:opacity-90'
                                >
                                    Try Again
                                </Button>
                            )}

                            <Button
                                asChild
                                variant='outline'
                                className='rounded-2xl border-2 border-[#4cc7e8]/30 bg-transparent px-8 py-6 text-lg font-bold text-[#4cc7e8] transition-all duration-300 hover:border-[#4cc7e8]/50 hover:bg-[#4cc7e8]/10'
                            >
                                <Link href='/'>
                                    Return Home
                                    <ArrowRight className='ml-2 h-5 w-5' />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function InvoiceDeductionSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className='flex min-h-screen items-center justify-center bg-[#050608] text-[#4cc7e8]'>
                    <Loader2 className='mr-3 h-6 w-6 animate-spin' />
                    Loading invoice confirmation...
                </div>
            }
        >
            <InvoiceDeductionConfirmationContent />
        </Suspense>
    );
}

export default InvoiceDeductionSuccessPage;
export { InvoiceDeductionConfirmationContent };
