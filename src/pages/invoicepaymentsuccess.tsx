'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, CircleAlert, Download, Loader2, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

type ApiStatusType = 'loading' | 'success' | 'error';
type PagePaymentType = 'invoice' | 'subscription';

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

type PaymentRecord = {
    id: number;
    paidImage?: string | null;
};

type PaymentRecordResponse = {
    invoice?: PaymentRecord;
    subscriptionInv?: PaymentRecord;
    message?: string;
    error?: string;
};

function getErrorMessage(data: StripeInvoiceStatusResponse, fallback: string): string {
    return data.error || data.message || data.data?.message || fallback;
}

function isInvoiceDeductionSuccessful(data: StripeInvoiceStatusResponse): boolean {
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

    // Preserve the existing behavior when the endpoint uses HTTP success
    // as the only confirmation signal.
    return true;
}

function sanitizeFileName(value: string): string {
    const cleaned = value
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return cleaned || 'invoice';
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function loadBlobImage(blob: Blob): Promise<HTMLImageElement> {
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
        const image = new window.Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('The paid invoice image could not be loaded.'));
        };

        image.src = objectUrl;
    });
}

function latin1Bytes(value: string): Uint8Array {
    const bytes = new Uint8Array(value.length);

    for (let index = 0; index < value.length; index += 1) {
        bytes[index] = value.charCodeAt(index) & 0xff;
    }

    return bytes;
}

function concatByteArrays(chunks: Uint8Array[]): Uint8Array {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    chunks.forEach((chunk) => {
        result.set(chunk, offset);
        offset += chunk.length;
    });

    return result;
}

function buildInvoicePdfFromJpeg(jpegBytes: Uint8Array, imageWidth: number, imageHeight: number): Blob {
    const pageWidth = 595;
    const pageHeight = 842;
    const scale = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
    const renderedWidth = imageWidth * scale;
    const renderedHeight = imageHeight * scale;
    const x = (pageWidth - renderedWidth) / 2;
    const y = (pageHeight - renderedHeight) / 2;

    const objectOffsets: number[] = [0];
    const chunks: Uint8Array[] = [];
    let byteLength = 0;

    const push = (chunk: Uint8Array) => {
        chunks.push(chunk);
        byteLength += chunk.length;
    };

    const addTextObject = (objectNumber: number, body: string) => {
        objectOffsets[objectNumber] = byteLength;
        push(latin1Bytes(`${objectNumber} 0 obj\n${body}\nendobj\n`));
    };

    push(latin1Bytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
    addTextObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
    addTextObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    addTextObject(
        3,
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>'
    );

    objectOffsets[4] = byteLength;
    push(
        latin1Bytes(
            `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
        )
    );
    push(jpegBytes);
    push(latin1Bytes('\nendstream\nendobj\n'));

    const contentStream = `q\n${renderedWidth.toFixed(2)} 0 0 ${renderedHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
    addTextObject(5, `<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`);

    const crossReferenceOffset = byteLength;
    let crossReference = 'xref\n0 6\n0000000000 65535 f \n';

    for (let objectNumber = 1; objectNumber <= 5; objectNumber += 1) {
        crossReference += `${String(objectOffsets[objectNumber]).padStart(10, '0')} 00000 n \n`;
    }

    crossReference += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`;
    push(latin1Bytes(crossReference));

    return new Blob([concatByteArrays(chunks)], { type: 'application/pdf' });
}

async function downloadImageAsPdf(imageUrl: string, fileName: string): Promise<void> {
    const response = await fetch('/api/v2/payment-image-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/octet-stream, application/pdf, image/*',
        },
        body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
        let message = 'The paid invoice image could not be downloaded.';

        try {
            const errorData = (await response.json()) as { error?: string };
            if (errorData.error) message = errorData.error;
        } catch {
            // Keep the fallback message for non-JSON errors.
        }

        throw new Error(message);
    }

    const sourceBlob = await response.blob();

    if (sourceBlob.type === 'application/pdf') {
        triggerBlobDownload(sourceBlob, `${sanitizeFileName(fileName)}.pdf`);
        return;
    }

    const image = await loadBlobImage(sourceBlob);

    if (!image.naturalWidth || !image.naturalHeight) {
        throw new Error('The paid invoice image has invalid dimensions.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Your browser could not prepare the paid invoice PDF.');
    }

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The paid invoice PDF could not be generated.'))), 'image/jpeg', 0.95);
    });

    const pdfBlob = buildInvoicePdfFromJpeg(new Uint8Array(await jpegBlob.arrayBuffer()), canvas.width, canvas.height);
    triggerBlobDownload(pdfBlob, `${sanitizeFileName(fileName)}.pdf`);
}

function InvoiceDeductionConfirmationContent() {
    const searchParams = useSearchParams();

    const sessionId = searchParams.get('session_id');
    const rawInvoiceId = searchParams.get('invoiceId');
    const rawSubscriptionInvId = searchParams.get('subscriptionInvId');

    const parsedInvoiceId = rawInvoiceId ? Number(rawInvoiceId) : Number.NaN;
    const parsedSubscriptionInvId = rawSubscriptionInvId ? Number(rawSubscriptionInvId) : Number.NaN;

    const hasValidInvoiceId = Number.isInteger(parsedInvoiceId) && parsedInvoiceId > 0;
    const hasValidSubscriptionInvId = Number.isInteger(parsedSubscriptionInvId) && parsedSubscriptionInvId > 0;

    // Exactly one record id should be present in the success URL.
    // invoiceId => invoice flow, subscriptionInvId => subscription flow.
    const paymentType: PagePaymentType | null = hasValidInvoiceId === hasValidSubscriptionInvId ? null : hasValidSubscriptionInvId ? 'subscription' : 'invoice';

    const paymentRecordId = paymentType === 'subscription' ? parsedSubscriptionInvId : paymentType === 'invoice' ? parsedInvoiceId : Number.NaN;

    const [apiStatus, setApiStatus] = useState('Verifying your payment...');
    const [statusType, setStatusType] = useState<ApiStatusType>('loading');

    const [paidImage, setPaidImage] = useState<string | null>(null);
    const [isLoadingPaidImage, setIsLoadingPaidImage] = useState(false);
    const [paidImageError, setPaidImageError] = useState<string | null>(null);

    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [pdfDownloadError, setPdfDownloadError] = useState<string | null>(null);

    const processedRequestRef = useRef<string | null>(null);

    const fetchPaidImage = useCallback(async () => {
        if (!Number.isInteger(paymentRecordId) || paymentRecordId <= 0 || !paymentType) {
            return;
        }

        setIsLoadingPaidImage(true);
        setPaidImageError(null);
        setPaidImage(null);

        try {
            const recordEndpoint =
                paymentType === 'subscription'
                    ? `/api/v2/subscriptionInv?id=${encodeURIComponent(String(paymentRecordId))}`
                    : `/api/v2/invoices?id=${encodeURIComponent(String(paymentRecordId))}`;

            const response = await fetch(recordEndpoint, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                cache: 'no-store',
            });

            let data: PaymentRecordResponse = {};

            try {
                data = (await response.json()) as PaymentRecordResponse;
            } catch {
                throw new Error('The server returned an invalid payment record response.');
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Unable to load the paid invoice.');
            }

            const paymentRecord = data.invoice || data.subscriptionInv || null;

            if (!paymentRecord) {
                throw new Error('The successful payment record was not returned by the server.');
            }

            if (!paymentRecord.paidImage) {
                throw new Error('No paid invoice image is available for this payment.');
            }

            setPaidImage(paymentRecord.paidImage);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to load the paid invoice image.';
            console.error('Paid invoice image lookup failed:', error);
            setPaidImageError(message);
        } finally {
            setIsLoadingPaidImage(false);
        }
    }, [paymentRecordId, paymentType]);

    const verifyInvoice = useCallback(async () => {
        if (!sessionId) {
            setStatusType('error');
            setApiStatus('Unable to verify the payment because the session ID is missing.');
            return;
        }

        if (!paymentType || !Number.isInteger(paymentRecordId) || paymentRecordId <= 0) {
            setStatusType('error');
            setApiStatus('The payment URL must contain either a valid invoiceId or a valid subscriptionInvId.');
            return;
        }

        setStatusType('loading');
        setApiStatus(paymentType === 'subscription' ? 'Verifying your subscription payment...' : 'Verifying your invoice payment...');
        setPaidImage(null);
        setPaidImageError(null);
        setPdfDownloadError(null);

        try {
            const requestOptions = {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                cache: 'no-store',
            };

            const statusEndpoint =
                paymentType === 'subscription'
                    ? `/api/v2/subscriptionInv/stripe-status?session_id=${encodeURIComponent(sessionId)}`
                    : `/api/v2/invoices/stripe-status?session_id=${encodeURIComponent(sessionId)}`;

            const response = await fetch(statusEndpoint, requestOptions);

            let data: StripeInvoiceStatusResponse = {};

            try {
                data = (await response.json()) as StripeInvoiceStatusResponse;
            } catch {
                // Keep an empty object when the server sends no JSON body.
            }

            if (!response.ok) {
                throw new Error(getErrorMessage(data, 'Payment verification failed.'));
            }

            if (!isInvoiceDeductionSuccessful(data)) {
                throw new Error(getErrorMessage(data, 'The payment has not completed successfully.'));
            }

            setStatusType('success');
            setApiStatus(
                data.message ||
                    data.data?.message ||
                    (paymentType === 'subscription' ? 'Subscription payment completed successfully!' : 'Invoice payment completed successfully!')
            );

            // The payment has already been verified at this point. Loading the
            // paid image is intentionally separate so an image error does not
            // turn a successful payment into a failed payment state.
            await fetchPaidImage();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to verify the payment.';

            console.error('Payment verification failed:', error);
            setStatusType('error');
            setApiStatus(message);
        }
    }, [fetchPaidImage, paymentRecordId, paymentType, sessionId]);

    useEffect(() => {
        const requestKey = `${sessionId ?? ''}:${rawInvoiceId ?? ''}:${rawSubscriptionInvId ?? ''}`;

        if (processedRequestRef.current === requestKey) return;
        processedRequestRef.current = requestKey;

        // eslint-disable-next-line
        void verifyInvoice();
    }, [rawInvoiceId, rawSubscriptionInvId, sessionId, verifyInvoice]);

    const handleDownloadPaidPdf = useCallback(async () => {
        if (!paidImage || !Number.isInteger(paymentRecordId) || paymentRecordId <= 0 || isDownloadingPdf) {
            return;
        }

        setIsDownloadingPdf(true);
        setPdfDownloadError(null);

        try {
            const filePrefix = paymentType === 'subscription' ? 'paid-subscription' : 'paid-invoice';
            await downloadImageAsPdf(paidImage, `${filePrefix}-${paymentRecordId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to download the paid invoice as PDF.';
            console.error('Paid invoice PDF download failed:', error);
            setPdfDownloadError(message);
        } finally {
            setIsDownloadingPdf(false);
        }
    }, [isDownloadingPdf, paidImage, paymentRecordId, paymentType]);

    const isSubscription = paymentType === 'subscription';

    const confirmationHeading =
        statusType === 'success'
            ? isSubscription
                ? 'Your subscription payment was successful.'
                : 'Your invoice payment was successful.'
            : statusType === 'error'
            ? isSubscription
                ? 'We could not confirm your subscription payment.'
                : 'We could not confirm your invoice payment.'
            : isSubscription
            ? 'Your subscription payment is being confirmed.'
            : 'Your invoice payment is being confirmed.';

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

                        <span className={`text-sm font-bold uppercase tracking-wider ${statusType === 'error' ? 'text-red-400' : 'text-[#4cc7e8]'}`}>
                            {statusType === 'loading'
                                ? 'Processing'
                                : statusType === 'success'
                                ? isSubscription
                                    ? 'Subscription Paid'
                                    : 'Invoice Paid'
                                : 'Verification Failed'}
                        </span>
                    </div>
                </div>

                <Card className='relative overflow-hidden rounded-3xl border-2 border-[#2c7bbe]/30 bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl transition-all duration-500 hover:border-[#4cc7e8]/50 animate-slide-in-up delay-200'>
                    <div className='absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]' />

                    <CardHeader className='p-6 text-center sm:p-8'>
                        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] animate-bounce-slow'>
                            <ReceiptText className='h-8 w-8 text-white' />
                        </div>

                        <CardTitle className='mb-2 text-4xl font-black text-white lg:text-5xl'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                {isSubscription ? 'Subscription Confirmation' : 'Invoice Confirmation'}
                            </span>
                        </CardTitle>

                        <div className='space-y-2 text-center'>
                            <h2 className='text-base font-semibold text-white sm:text-lg'>{confirmationHeading}</h2>

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
                        {statusType === 'success' && (
                            <div className='mb-8 overflow-hidden rounded-2xl border border-[#4cc7e8]/20 bg-white/5'>
                                {isLoadingPaidImage ? (
                                    <div className='flex min-h-[360px] items-center justify-center text-[#4cc7e8]'>
                                        <Loader2 className='mr-3 h-6 w-6 animate-spin' />
                                        Loading paid invoice...
                                    </div>
                                ) : paidImage ? (
                                    <div className='flex min-h-[360px] items-center justify-center bg-white p-3'>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={paidImage}
                                            alt={isSubscription ? 'Paid subscription invoice' : 'Paid invoice'}
                                            className='max-h-[680px] w-full object-contain'
                                        />
                                    </div>
                                ) : (
                                    <div className='flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-gray-400'>
                                        {paidImageError || 'No paid invoice image is available for this payment.'}
                                    </div>
                                )}
                            </div>
                        )}

                        {pdfDownloadError && (
                            <div className='mb-6 flex justify-center'>
                                <div className='inline-flex max-w-full items-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-400'>
                                    <CircleAlert className='h-4 w-4 shrink-0' />
                                    <span>{pdfDownloadError}</span>
                                </div>
                            </div>
                        )}

                        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                            {statusType === 'error' && sessionId && (
                                <Button
                                    type='button'
                                    onClick={() => {
                                        processedRequestRef.current = null;
                                        // eslint-disable-next-line
                                        void verifyInvoice();
                                    }}
                                    className='rounded-2xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-8 py-6 text-lg font-bold text-white transition-all duration-300 hover:opacity-90'
                                >
                                    Try Again
                                </Button>
                            )}

                            {statusType === 'success' && (
                                <Button
                                    type='button'
                                    variant='outline'
                                    disabled={isLoadingPaidImage || isDownloadingPdf || !paidImage}
                                    onClick={() => {
                                        // eslint-disable-next-line
                                        void handleDownloadPaidPdf();
                                    }}
                                    className='rounded-2xl border-2 border-[#4cc7e8]/30 bg-transparent px-8 py-6 text-lg font-bold text-[#4cc7e8] transition-all duration-300 hover:border-[#4cc7e8]/50 hover:bg-[#4cc7e8]/10 disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    {isDownloadingPdf ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <Download className='mr-2 h-5 w-5' />}
                                    {isDownloadingPdf ? 'Preparing PDF...' : 'Download as PDF'}
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
                    Loading payment confirmation...
                </div>
            }
        >
            <InvoiceDeductionConfirmationContent />
        </Suspense>
    );
}

export default InvoiceDeductionSuccessPage;
export { InvoiceDeductionConfirmationContent };
