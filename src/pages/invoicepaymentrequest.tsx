'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CircleAlert, CreditCard, Download, Loader2, Repeat2, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

type PagePaymentType = 'invoice' | 'subscription';

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

type PaymentRecord = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    name?: string | null;
    email?: string;
    businessName?: string | null;
    price?: string;
    paidImage?: string | null;
    unpaidImage?: string | null;
    transactionId?: string | null;
    paid?: boolean;
    paymentType?: string;
    subscriptionInterval?: string | null;
    currency?: string;
};

type PaymentRecordResponse = {
    invoice?: PaymentRecord;
    subscriptionInv?: PaymentRecord;
    message?: string;
    error?: string;
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
            reject(new Error('The invoice image could not be loaded.'));
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
        let message = 'The invoice image could not be downloaded.';

        try {
            const errorData = (await response.json()) as { error?: string };
            if (errorData.error) {
                message = errorData.error;
            }
        } catch {
            // Keep the fallback message when the API does not return JSON.
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
        throw new Error('The invoice image has invalid dimensions.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Your browser could not prepare the invoice PDF.');
    }

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The invoice PDF could not be generated.'))), 'image/jpeg', 0.95);
    });

    const pdfBlob = buildInvoicePdfFromJpeg(new Uint8Array(await jpegBlob.arrayBuffer()), canvas.width, canvas.height);
    triggerBlobDownload(pdfBlob, `${sanitizeFileName(fileName)}.pdf`);
}

function PaymentApplicationContent() {
    const searchParams = useSearchParams();

    const rawInvoiceId = searchParams.get('id');
    const rawPaymentType = searchParams.get('paymentType');

    const invoiceId = rawInvoiceId ? Number(rawInvoiceId) : Number.NaN;
    const paymentType: PagePaymentType | null = rawPaymentType === 'invoice' || rawPaymentType === 'subscription' ? rawPaymentType : null;

    const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);
    const [isLoadingRecord, setIsLoadingRecord] = useState(true);
    const [recordError, setRecordError] = useState<string | null>(null);

    const [isPaying, setIsPaying] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

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

    const fetchPaymentRecord = useCallback(
        async (signal?: AbortSignal) => {
            setIsLoadingRecord(true);
            setRecordError(null);
            setPaymentRecord(null);

            if (!rawInvoiceId) {
                setRecordError('The invoice ID is missing from the page URL.');
                setIsLoadingRecord(false);
                return;
            }

            if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
                setRecordError('The invoice ID in the page URL is invalid.');
                setIsLoadingRecord(false);
                return;
            }

            if (!paymentType) {
                setRecordError('Payment type must be either "invoice" or "subscription".');
                setIsLoadingRecord(false);
                return;
            }

            try {
                const lookupEndpoint =
                    paymentType === 'subscription'
                        ? `/api/v2/subscriptionInv?id=${encodeURIComponent(String(invoiceId))}`
                        : `/api/v2/invoices?id=${encodeURIComponent(String(invoiceId))}`;

                const response = await fetch(lookupEndpoint, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                    signal,
                });

                let data: PaymentRecordResponse = {};

                try {
                    data = (await response.json()) as PaymentRecordResponse;
                } catch {
                    throw new Error('The server returned an invalid invoice response.');
                }

                if (!response.ok) {
                    throw new Error(data.error || data.message || 'Unable to load the invoice.');
                }

                const record = data.invoice || data.subscriptionInv || null;

                if (!record) {
                    throw new Error('The requested invoice was not returned by the server.');
                }

                setPaymentRecord(record);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                const message = error instanceof Error ? error.message : 'Unable to load the invoice.';
                console.error('Invoice lookup failed:', error);
                setRecordError(message);
            } finally {
                if (!signal?.aborted) {
                    setIsLoadingRecord(false);
                }
            }
        },
        [invoiceId, paymentType, rawInvoiceId]
    );

    useEffect(() => {
        const controller = new AbortController();

        // eslint-disable-next-line
        void fetchPaymentRecord(controller.signal);

        return () => controller.abort();
    }, [fetchPaymentRecord]);

    const handlePay = useCallback(async () => {
        if (!paymentRequest || !paymentType || !paymentRecord || isPaying) {
            return;
        }

        setIsPaying(true);
        setPaymentError(null);

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

            window.location.assign(paymentUrl);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to start the payment.';

            console.error('Stripe payment session creation failed:', error);
            setPaymentError(message);
            setIsPaying(false);
        }
    }, [isPaying, paymentRecord, paymentRequest, paymentType]);

    const handleDownloadPdf = useCallback(async () => {
        if (!paymentRecord?.unpaidImage || isDownloading) {
            return;
        }

        setIsDownloading(true);
        setDownloadError(null);

        try {
            const filePrefix = paymentType === 'subscription' ? 'subscription' : 'invoice';
            await downloadImageAsPdf(paymentRecord.unpaidImage, `${filePrefix}-${paymentRecord.id}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to download the invoice as PDF.';
            console.error('Invoice PDF download failed:', error);
            setDownloadError(message);
        } finally {
            setIsDownloading(false);
        }
    }, [isDownloading, paymentRecord, paymentType]);

    const isSubscription = paymentType === 'subscription';
    const hasPageError = Boolean(recordError || paymentError);

    const instructionText = isSubscription
        ? 'Click on Pay Subscription button to activate your monthly subscription.'
        : 'Click on Pay Invoice button to complete your one-time payment.';

    return (
        <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050608] py-20'>
            <div className='relative z-10 w-full max-w-3xl px-6'>
                <div className='mb-8 text-center animate-slide-in-up'>
                    <div className='mb-6 inline-flex items-center space-x-3 rounded-full border border-[#4cc7e8]/30 bg-gradient-to-r from-[#2c7bbe]/10 via-[#4cc7e8]/20 to-[#2a8dcc]/10 px-8 py-4 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                        {hasPageError ? (
                            <CircleAlert className='h-6 w-6 text-red-400' />
                        ) : isLoadingRecord || isPaying ? (
                            <Loader2 className='h-6 w-6 animate-spin text-[#4cc7e8]' />
                        ) : (
                            <ShieldCheck className='h-6 w-6 text-[#4cc7e8]' />
                        )}

                        <span className={`text-sm font-bold uppercase tracking-wider ${hasPageError ? 'text-red-400' : 'text-[#4cc7e8]'}`}>
                            {hasPageError ? 'Payment Error' : isLoadingRecord ? 'Loading Invoice' : isPaying ? 'Redirecting' : 'Secure Payment'}
                        </span>
                    </div>
                </div>

                <Card className='relative overflow-hidden rounded-3xl border-2 border-[#2c7bbe]/30 bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl transition-all duration-500 hover:border-[#4cc7e8]/50 animate-slide-in-up delay-200'>
                    <div className='absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]' />

                    <CardHeader className='p-6 text-center sm:p-8'>
                        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] animate-bounce-slow'>
                            {isSubscription ? <Repeat2 className='h-8 w-8 text-white' /> : <CreditCard className='h-8 w-8 text-white' />}
                        </div>

                        <CardTitle className='mb-2 text-4xl font-black text-white lg:text-5xl'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                {isSubscription ? 'Start Subscription' : 'Pay Your Invoice'}
                            </span>
                        </CardTitle>

                        <p className='mx-auto max-w-xl text-sm font-medium leading-5 text-gray-300'>{instructionText}</p>

                        {recordError && (
                            <div className='mt-6 flex justify-center'>
                                <div className='inline-flex max-w-full items-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-400'>
                                    <CircleAlert className='h-4 w-4 shrink-0' />
                                    <span>{recordError}</span>
                                </div>
                            </div>
                        )}

                        {paymentError && (
                            <div className='mt-6 flex justify-center'>
                                <div className='inline-flex max-w-full items-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-400'>
                                    <CircleAlert className='h-4 w-4 shrink-0' />
                                    <span>{paymentError}</span>
                                </div>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className='p-8 pt-0 sm:p-12 sm:pt-0'>
                        <div className='mb-8 overflow-hidden rounded-2xl border border-[#4cc7e8]/20 bg-white/5'>
                            {isLoadingRecord ? (
                                <div className='flex min-h-[360px] items-center justify-center text-[#4cc7e8]'>
                                    <Loader2 className='mr-3 h-6 w-6 animate-spin' />
                                    Loading invoice...
                                </div>
                            ) : paymentRecord?.unpaidImage ? (
                                <div className='flex min-h-[360px] items-center justify-center bg-white p-3'>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={paymentRecord.unpaidImage}
                                        alt={isSubscription ? 'Pending subscription invoice' : 'Pending invoice'}
                                        className='max-h-[680px] w-full object-contain'
                                    />
                                </div>
                            ) : (
                                <div className='flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-gray-400'>
                                    No pending invoice image is available for this payment.
                                </div>
                            )}
                        </div>

                        {downloadError && (
                            <div className='mb-6 flex justify-center'>
                                <div className='inline-flex max-w-full items-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-400'>
                                    <CircleAlert className='h-4 w-4 shrink-0' />
                                    <span>{downloadError}</span>
                                </div>
                            </div>
                        )}

                        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                            <Button
                                type='button'
                                disabled={isLoadingRecord || isPaying || !paymentRecord}
                                onClick={() => {
                                    // eslint-disable-next-line
                                    void handlePay();
                                }}
                                className='rounded-2xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-8 py-6 text-lg font-bold text-white shadow-lg shadow-[#2c7bbe]/30 transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
                            >
                                {isPaying ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <ArrowRight className='mr-2 h-5 w-5' />}
                                {isPaying ? 'Redirecting...' : isSubscription ? 'Pay Subscription' : 'Pay Invoice'}
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                disabled={isLoadingRecord || isDownloading || !paymentRecord?.unpaidImage}
                                onClick={() => {
                                    // eslint-disable-next-line
                                    void handleDownloadPdf();
                                }}
                                className='rounded-2xl border-2 border-[#4cc7e8]/30 bg-transparent px-8 py-6 text-lg font-bold text-[#4cc7e8] transition-all duration-300 hover:border-[#4cc7e8]/50 hover:bg-[#4cc7e8]/10 disabled:cursor-not-allowed disabled:opacity-60'
                            >
                                {isDownloading ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <Download className='mr-2 h-5 w-5' />}
                                {isDownloading ? 'Preparing PDF...' : 'Download as PDF'}
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
