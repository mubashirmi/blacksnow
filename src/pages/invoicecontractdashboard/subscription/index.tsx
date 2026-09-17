import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Contract = {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    contractName: string | null;
    email: string;
    businessName: string;
    pdf: string;
    signed: boolean | string;
    authId: number;
};

type Invoice = {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    email: string;
    businessName: string;
    price: string;
    paidImage: string | null;
    unpaidImage: string | null;
    transactionId: string | null;
    paid: boolean;
    paymentType: string;
    subscriptionInterval: string | null;
    currency: string;
    baseAmount: number;
    serviceFeePercent: number;
    platformFeePercent: number;
    serviceFeeAmount: number;
    platformFeeAmount: number;
    applicationFeeAmount: number;
    totalAmount: number;
    stripeCheckoutSessionId: string | null;
    stripePaymentIntentId: string | null;
    stripeChargeId: string | null;
    stripeSubscriptionId: string | null;
    stripeCustomerId: string | null;
    stripeLatestInvoiceId: string | null;
    stripeSubscriptionStatus: string | null;
    stripeCurrentPeriodEnd: string | null;
    stripeCancelAtPeriodEnd: boolean;
    subscriptionStartedAt: string | null;
    subscriptionCanceledAt: string | null;
    refunded: boolean;
    refundedAmount: number;
    stripeLatestRefundId: string | null;
    stripeRefundStatus: string | null;
    refundedAt: string | null;
    contractId: number | null;
    authId: number;
    Contract: Contract | null;
};

type ContractsResponse = {
    contracts: Contract[];
};

type InvoicesResponse = {
    invoices: Invoice[];
};

type PaymentStatusFilter = 'all' | 'paid' | 'unpaid';

type RefundType = 'full' | 'custom';

type RefundPayload =
    | {
          invoiceId: number;
          reason: 'requested_by_customer';
      }
    | {
          invoiceId: number;
          amount: string;
          reason: 'requested_by_customer';
      };

type ApiMessageResponse = {
    message?: string;
    error?: string;
};

const formatDateTime = (isoString: string): string => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const parseMoney = (value: string | number | null | undefined): number => {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value || '0');
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (amount: number, currency = 'usd'): string => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `$${amount.toFixed(2)}`;
    }
};

const sanitizeFileName = (value: string): string => {
    const cleaned = value
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return cleaned || 'invoice';
};

const triggerBlobDownload = (blob: Blob, fileName: string): void => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

const loadBlobImage = (blob: Blob): Promise<HTMLImageElement> => {
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
};

const latin1Bytes = (value: string): Uint8Array => {
    const bytes = new Uint8Array(value.length);
    for (let index = 0; index < value.length; index += 1) bytes[index] = value.charCodeAt(index) & 0xff;
    return bytes;
};

const concatByteArrays = (chunks: Uint8Array[]): Uint8Array => {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    chunks.forEach((chunk) => {
        result.set(chunk, offset);
        offset += chunk.length;
    });

    return result;
};

const buildInvoicePdfFromJpeg = (jpegBytes: Uint8Array, imageWidth: number, imageHeight: number): Blob => {
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
};

const downloadImageAsPdf = async (imageUrl: string, fileName: string): Promise<void> => {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('The invoice file could not be downloaded.');

    const imageBlob = await response.blob();
    const image = await loadBlobImage(imageBlob);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the invoice PDF.');

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The invoice PDF could not be generated.'))), 'image/jpeg', 0.95);
    });

    const pdfBlob = buildInvoicePdfFromJpeg(new Uint8Array(await jpegBlob.arrayBuffer()), canvas.width, canvas.height);
    triggerBlobDownload(pdfBlob, `${sanitizeFileName(fileName)}.pdf`);
};

const InvoicesPage: NextPage = () => {
    const router = useRouter();

    // Auth
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Contracts state
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(false);
    const [contractsError, setContractsError] = useState<string | null>(null);

    // Invoices state
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [invoicesError, setInvoicesError] = useState<string | null>(null);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatusFilter>('all');

    // Refund modal state
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [refundType, setRefundType] = useState<RefundType>('full');
    const [customRefundAmount, setCustomRefundAmount] = useState('');
    const [isRefunding, setIsRefunding] = useState(false);
    const [refundError, setRefundError] = useState<string | null>(null);
    const [refundMessage, setRefundMessage] = useState<string | null>(null);

    // Download and payment-link state
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<number | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [paymentLinkInvoice, setPaymentLinkInvoice] = useState<Invoice | null>(null);
    const [copiedPaymentLink, setCopiedPaymentLink] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedUserId = window.localStorage.getItem('userId');
        if (!storedUserId) {
            // eslint-disable-next-line
            void router.replace('/login');
            return;
        }

        const rawRoles = window.localStorage.getItem('roles');
        let roles: string[] = [];

        if (rawRoles) {
            try {
                const parsed = JSON.parse(rawRoles);
                if (Array.isArray(parsed)) {
                    roles = parsed.filter((r): r is string => typeof r === 'string');
                } else if (typeof parsed === 'string') {
                    roles = [parsed];
                }
            } catch {
                roles = rawRoles
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
        }

        if (!roles.includes('InvoiceTool')) {
            // eslint-disable-next-line
            void router.replace('/pricing');
            return;
        }

        setUserId(storedUserId);
        setIsAuthChecked(true);
    }, [router]);

    const fetchContracts = useCallback(async () => {
        if (typeof window === 'undefined') return;
        if (!isAuthChecked || !userId) return;

        setIsLoadingContracts(true);
        setContractsError(null);

        try {
            const res = await fetch(`/api/v2/contract?authId=${encodeURIComponent(userId)}`);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to load contracts.');
            }

            const data = (await res.json()) as ContractsResponse;
            const signedContracts = (data.contracts || []).filter((contract) => contract.signed === true || contract.signed === 'signed');
            setContracts(signedContracts);
        } catch (err) {
            setContractsError(err instanceof Error ? err.message : 'Something went wrong while loading contracts.');
            setContracts([]);
        } finally {
            setIsLoadingContracts(false);
        }
    }, [isAuthChecked, userId]);

    const fetchInvoices = useCallback(async () => {
        if (typeof window === 'undefined') return;
        if (!isAuthChecked || !userId) return;

        setIsLoadingInvoices(true);
        setInvoicesError(null);

        try {
            const res = await fetch(`/api/v2/subscriptionInv?authId=${encodeURIComponent(userId)}`);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to load invoices.');
            }

            const data = (await res.json()) as InvoicesResponse;
            setInvoices(data.invoices || []);
        } catch (err) {
            setInvoicesError(err instanceof Error ? err.message : 'Something went wrong while loading invoices.');
            setInvoices([]);
        } finally {
            setIsLoadingInvoices(false);
        }
    }, [isAuthChecked, userId]);

    useEffect(() => {
        if (!isAuthChecked || !userId) return;
        // eslint-disable-next-line
        void fetchContracts();
        // eslint-disable-next-line
        void fetchInvoices();
    }, [fetchContracts, fetchInvoices, isAuthChecked, userId]);

    useEffect(() => {
        if (!selectedInvoice) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isRefunding) {
                setSelectedInvoice(null);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isRefunding, selectedInvoice]);

    useEffect(() => {
        if (!paymentLinkInvoice) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setPaymentLinkInvoice(null);
                setCopiedPaymentLink(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [paymentLinkInvoice]);

    const hasInvoice = (contractId: number): boolean => {
        return invoices.some((invoice) => invoice.contractId === contractId);
    };

    const handleCreateInvoice = () => {
        // eslint-disable-next-line
        void router.push('/invoicecontractdashboard/subscription/create');
    };

    const handleCreateInvoiceForContract = (contractId: number) => {
        // eslint-disable-next-line
        void router.push(`/invoicecontractdashboard/invoice/create?contractId=${contractId}`);
    };

    const openRefundModal = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setRefundType('full');
        setCustomRefundAmount('');
        setRefundError(null);
        setRefundMessage(null);
    };

    const closeRefundModal = () => {
        if (isRefunding) return;
        setSelectedInvoice(null);
        setRefundType('full');
        setCustomRefundAmount('');
        setRefundError(null);
    };

    const invoiceAmount = useMemo(() => {
        if (!selectedInvoice) return 0;
        return parseMoney(selectedInvoice.price);
    }, [selectedInvoice]);

    const serviceFeePercent = selectedInvoice?.serviceFeePercent ?? 0;
    const platformFeePercent = selectedInvoice?.platformFeePercent ?? 0;
    const totalFeePercent = serviceFeePercent + platformFeePercent;
    const customRequestedAmount = parseMoney(customRefundAmount);
    const customFeeAmount = customRequestedAmount * (totalFeePercent / 100);
    const customNetRefundAmount = Math.max(0, customRequestedAmount - customFeeAmount);

    const handleRefund = async () => {
        if (!selectedInvoice || isRefunding) return;

        setRefundError(null);
        setRefundMessage(null);

        if (!selectedInvoice.paid) {
            setRefundError('Only paid invoices can be refunded.');
            return;
        }

        if (selectedInvoice.refunded) {
            setRefundError('This invoice has already been refunded.');
            return;
        }

        let payload: RefundPayload = {
            invoiceId: selectedInvoice.id,
            reason: 'requested_by_customer',
        };

        if (refundType === 'custom') {
            if (!customRefundAmount.trim() || customRequestedAmount <= 0) {
                setRefundError('Enter a valid custom refund amount greater than 0.');
                return;
            }

            if (customRequestedAmount > invoiceAmount) {
                setRefundError(`The custom amount cannot be greater than ${formatMoney(invoiceAmount, selectedInvoice.currency)}.`);
                return;
            }

            if (customNetRefundAmount <= 0) {
                setRefundError('The refund amount is too small. Enter a larger amount and try again.');
                return;
            }

            payload = {
                invoiceId: selectedInvoice.id,
                amount: customNetRefundAmount.toFixed(2),
                reason: 'requested_by_customer',
            };
        }

        setIsRefunding(true);

        try {
            const res = await fetch('/api/v2/subscriptionInv/stripe-refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = (await res.json().catch(() => ({}))) as ApiMessageResponse;

            if (!res.ok) {
                throw new Error(data.error || data.message || 'Refund request failed.');
            }

            setRefundMessage(data.message || 'Refund processed successfully.');
            setSelectedInvoice(null);
            setRefundType('full');
            setCustomRefundAmount('');
            await fetchInvoices();
        } catch (err) {
            setRefundError(err instanceof Error ? err.message : 'Something went wrong while processing the refund.');
        } finally {
            setIsRefunding(false);
        }
    };

    const selectedPaymentLink = useMemo(() => {
        if (!paymentLinkInvoice || typeof window === 'undefined') return '';
        return `${window.location.origin}/invoicepaymentrequest?id=${encodeURIComponent(paymentLinkInvoice.id)}&paymentType=subscription`;
    }, [paymentLinkInvoice]);

    const openPaymentLinkModal = (invoice: Invoice) => {
        setPaymentLinkInvoice(invoice);
        setCopiedPaymentLink(false);
    };

    const closePaymentLinkModal = () => {
        setPaymentLinkInvoice(null);
        setCopiedPaymentLink(false);
    };

    const copyPaymentLink = async () => {
        if (!selectedPaymentLink) return;

        try {
            await navigator.clipboard.writeText(selectedPaymentLink);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = selectedPaymentLink;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }

        setCopiedPaymentLink(true);
        window.setTimeout(() => setCopiedPaymentLink(false), 2000);
    };

    const handleDownloadInvoice = async (invoice: Invoice) => {
        const imageUrl = invoice.paid ? invoice.paidImage : invoice.unpaidImage;
        if (!imageUrl || downloadingInvoiceId !== null) return;

        setDownloadingInvoiceId(invoice.id);
        setDownloadError(null);

        try {
            await downloadImageAsPdf(imageUrl, `${invoice.name || 'invoice'}-${invoice.id}`);
        } catch (error) {
            setDownloadError(error instanceof Error ? error.message : 'The invoice could not be downloaded.');
        } finally {
            setDownloadingInvoiceId(null);
        }
    };

    const totalInvoices = invoices.length;
    const pendingInvoices = invoices.filter((invoice) => !invoice.paid).length;
    const totalSignedContracts = contracts.length;

    const filteredInvoices = useMemo(() => {
        if (paymentStatusFilter === 'paid') return invoices.filter((invoice) => invoice.paid);
        if (paymentStatusFilter === 'unpaid') return invoices.filter((invoice) => !invoice.paid);
        return invoices;
    }, [invoices, paymentStatusFilter]);

    if (!isAuthChecked) {
        return <div className='min-h-screen p-[7px] text-sm text-gray-500'>Checking access…</div>;
    }

    return (
        <div className='min-h-screen p-[7px]'>
            <div className='mx-auto max-w-7xl'>
                {/* Header */}
                <header className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <h1 className='mb-1 text-[28px] font-semibold text-slate-900'>Subscriptions</h1>
                        <p className='text-sm text-gray-500'>Manage all your subscriptions and signed contracts in one place.</p>
                    </div>

                    <div className='flex flex-wrap items-center gap-3'>
                        <button
                            type='button'
                            // eslint-disable-next-line
                            onClick={() => void router.push('/invoicecontractdashboard/contract')}
                            className='inline-flex items-center gap-2 rounded-[13px] border border-gray-300 bg-white px-[16px] py-[10px] text-sm font-medium text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:bg-gray-50'
                        >
                            Contracts
                        </button>

                        <button
                            type='button'
                            onClick={handleCreateInvoice}
                            className='inline-flex cursor-pointer items-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] px-[18px] py-[10px] text-sm font-medium text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition-shadow hover:shadow-[0_12px_28px_rgba(37,99,235,0.45)]'
                        >
                            <span className='text-[18px] leading-none'>＋</span>
                            <span>Create Subscription</span>
                        </button>
                    </div>
                </header>

                {/* Overview stats */}
                <section className='mb-6 grid gap-4 sm:grid-cols-3'>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Pending Subscriptions</div>
                        <div className='mt-1 text-[22px] font-semibold text-amber-700'>{pendingInvoices}</div>
                    </div>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Signed Contracts</div>
                        <div className='mt-1 text-[22px] font-semibold text-green-700'>{totalSignedContracts}</div>
                    </div>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Total Subscriptions</div>
                        <div className='mt-1 text-[22px] font-semibold text-slate-900'>{totalInvoices}</div>
                    </div>
                </section>

                {/* Signed Contracts Table */}
                <section className='mb-6 rounded-[16px] border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                    <div className='mb-3 flex items-center justify-between gap-2'>
                        <h2 className='text-lg font-semibold text-slate-900'>Signed Contracts</h2>
                    </div>

                    {isLoadingContracts && <p className='text-sm text-gray-500'>Loading signed contracts…</p>}

                    {contractsError && <p className='text-[13px] text-red-700'>{contractsError}</p>}

                    {!isLoadingContracts && !contractsError && contracts.length === 0 && (
                        <p className='text-sm text-gray-500'>No signed contracts found yet.</p>
                    )}

                    {!isLoadingContracts && !contractsError && contracts.length > 0 && (
                        <div className='mt-2 overflow-x-auto rounded-xl border border-gray-200'>
                            <table className='min-w-[900px] w-full border-collapse text-[13px]'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        {['Sr #', 'Contract Name', 'Email', 'Name', 'Business Name', 'Created At', 'PDF', 'Action'].map((header) => (
                                            <th key={header} className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {contracts.map((contract, index) => {
                                        const displayContractName = contract.contractName?.trim() || '—';
                                        const displayName = contract.name?.trim() || '—';
                                        const displayBusinessName = contract.businessName?.trim() || '—';
                                        const invoiceCreated = hasInvoice(contract.id);

                                        return (
                                            <tr key={contract.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{index + 1}</td>
                                                <td className='px-3 py-2.5 text-[13px] font-medium text-slate-900'>{displayContractName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{contract.email || '—'}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayBusinessName}</td>
                                                <td className='whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-600'>
                                                    {formatDateTime(contract.createdAt)}
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <a
                                                        href={contract.pdf}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='cursor-pointer text-[13px] text-blue-600 no-underline hover:underline'
                                                    >
                                                        View PDF
                                                    </a>
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    {invoiceCreated ? (
                                                        <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[12px] font-medium text-green-800'>
                                                            Invoice Created
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type='button'
                                                            onClick={() => handleCreateInvoiceForContract(contract.id)}
                                                            className='inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-blue-700'
                                                        >
                                                            Create Invoice
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* All Subscriptions Table */}
                <section className='rounded-[16px] border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                    <div className='mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <h2 className='text-lg font-semibold text-slate-900'>All Subscriptions</h2>
                        <select
                            value={paymentStatusFilter}
                            onChange={(event) => setPaymentStatusFilter(event.target.value as PaymentStatusFilter)}
                            className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            aria-label='Filter subscriptions by payment status'
                        >
                            <option value='all'>All Subscriptions</option>
                            <option value='paid'>Paid</option>
                            <option value='unpaid'>Pending</option>
                        </select>
                    </div>

                    {downloadError && (
                        <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700'>{downloadError}</div>
                    )}

                    {refundMessage && (
                        <div className='mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-medium text-green-800'>
                            {refundMessage}
                        </div>
                    )}

                    {isLoadingInvoices && <p className='text-sm text-gray-500'>Loading subscriptions...</p>}

                    {invoicesError && <p className='text-[13px] text-red-700'>{invoicesError}</p>}

                    {!isLoadingInvoices && !invoicesError && invoices.length === 0 && (
                        <p className='text-sm text-gray-500'>No subscriptions found yet. Create your first subscription to see it here.</p>
                    )}

                    {!isLoadingInvoices && !invoicesError && invoices.length > 0 && filteredInvoices.length === 0 && (
                        <p className='text-sm text-gray-500'>No subscriptions match the selected payment filter.</p>
                    )}

                    {!isLoadingInvoices && !invoicesError && filteredInvoices.length > 0 && (
                        <div className='mt-2 overflow-x-auto rounded-xl border border-gray-200'>
                            <table className='min-w-[1420px] w-full border-collapse text-[13px]'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        {[
                                            'Sr #',
                                            'Invoice Name',
                                            'Email',
                                            'Business Name',
                                            'Price',
                                            'Status',
                                            'Contract Name',
                                            'Created At',
                                            'Invoice',
                                            'Download',
                                            'Payment Link',
                                            'Action',
                                        ].map((header) => (
                                            <th key={header} className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((invoice, index) => {
                                        const displayName = invoice.name?.trim() || '—';
                                        const displayBusinessName = invoice.businessName?.trim() || '—';
                                        const displayContractName = invoice.Contract?.contractName?.trim() || '—';
                                        const displayPrice = formatMoney(parseMoney(invoice.price), invoice.currency);
                                        const invoiceImage = invoice.paid ? invoice.paidImage : invoice.unpaidImage;
                                        const canRefund = invoice.paid && !invoice.refunded;

                                        return (
                                            <tr key={invoice.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{index + 1}</td>
                                                <td className='px-3 py-2.5 text-[13px] font-medium text-slate-900'>{displayName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{invoice.email || '—'}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayBusinessName}</td>
                                                <td className='px-3 py-2.5 text-[13px] font-semibold text-green-700'>{displayPrice}</td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                                                            invoice.paid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        {invoice.paid ? 'Paid' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayContractName}</td>
                                                <td className='whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-600'>{formatDateTime(invoice.createdAt)}</td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    {invoiceImage ? (
                                                        <a
                                                            href={invoiceImage}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='inline-flex cursor-pointer items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-medium text-blue-700 no-underline transition-colors hover:bg-blue-100'
                                                        >
                                                            View Subscription
                                                        </a>
                                                    ) : (
                                                        <span className='text-[12px] text-gray-400'>No image</span>
                                                    )}
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <button
                                                        type='button'
                                                        // eslint-disable-next-line
                                                        onClick={() => void handleDownloadInvoice(invoice)}
                                                        disabled={!invoiceImage || downloadingInvoiceId !== null}
                                                        className={`inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                                                            invoiceImage && downloadingInvoiceId === null
                                                                ? 'cursor-pointer bg-slate-900 text-white hover:bg-slate-800'
                                                                : 'cursor-not-allowed bg-gray-200 text-gray-500'
                                                        }`}
                                                    >
                                                        {downloadingInvoiceId === invoice.id ? 'Downloading…' : 'Download PDF'}
                                                    </button>
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    {!invoice.paid ? (
                                                        <button
                                                            type='button'
                                                            onClick={() => openPaymentLinkModal(invoice)}
                                                            className='inline-flex cursor-pointer items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100'
                                                        >
                                                            Show link
                                                        </button>
                                                    ) : (
                                                        <span className='text-[12px] text-gray-400'>—</span>
                                                    )}
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    {invoice.refunded ? (
                                                        <span className='inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-[12px] font-medium text-slate-600'>
                                                            Refunded
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type='button'
                                                            onClick={() => openRefundModal(invoice)}
                                                            disabled={!canRefund}
                                                            title={!invoice.paid ? 'Only paid invoices can be refunded.' : undefined}
                                                            className={`inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                                                                canRefund
                                                                    ? 'cursor-pointer bg-red-600 text-white hover:bg-red-700'
                                                                    : 'cursor-not-allowed bg-gray-200 text-gray-500'
                                                            }`}
                                                        >
                                                            Refund
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {/* Payment Link Modal */}
            {paymentLinkInvoice && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md'
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target) closePaymentLinkModal();
                    }}
                    role='presentation'
                >
                    <div
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='payment-link-modal-title'
                        className='w-full max-w-lg overflow-hidden rounded-[24px] border border-white/60 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.35)] backdrop-blur-2xl'
                    >
                        <div className='flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5'>
                            <div>
                                <h3 id='payment-link-modal-title' className='text-xl font-semibold text-slate-900'>
                                    Payment link
                                </h3>
                                <p className='mt-1 text-sm text-slate-600'>
                                    Invoice #{paymentLinkInvoice.id} · {paymentLinkInvoice.name || paymentLinkInvoice.email}
                                </p>
                            </div>
                            <button
                                type='button'
                                onClick={closePaymentLinkModal}
                                aria-label='Close payment link modal'
                                className='flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xl leading-none text-slate-500 transition hover:bg-slate-50 hover:text-slate-900'
                            >
                                ×
                            </button>
                        </div>

                        <div className='space-y-4 px-6 py-5'>
                            <p className='text-sm text-slate-600'>Copy this link and send it to the customer to complete payment.</p>
                            <div className='flex flex-col gap-3 sm:flex-row'>
                                <input
                                    type='text'
                                    readOnly
                                    value={selectedPaymentLink}
                                    onFocus={(event) => event.currentTarget.select()}
                                    className='min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                />
                                <button
                                    type='button'
                                    // eslint-disable-next-line
                                    onClick={() => void copyPaymentLink()}
                                    className='rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700'
                                >
                                    {copiedPaymentLink ? 'Copied!' : 'Copy link'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Modal */}
            {selectedInvoice && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md'
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target) closeRefundModal();
                    }}
                    role='presentation'
                >
                    <div
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='refund-modal-title'
                        className='w-full max-w-lg overflow-hidden rounded-[24px] border border-white/60 bg-white/85 shadow-[0_30px_90px_rgba(15,23,42,0.35)] backdrop-blur-2xl'
                    >
                        <div className='border-b border-white/70 bg-white/55 px-6 py-5'>
                            <div className='flex items-start justify-between gap-4'>
                                <div>
                                    <h3 id='refund-modal-title' className='text-xl font-semibold text-slate-900'>
                                        Refund invoice
                                    </h3>
                                    <p className='mt-1 text-sm text-slate-600'>
                                        Invoice #{selectedInvoice.id} · {selectedInvoice.name || selectedInvoice.email}
                                    </p>
                                </div>
                                <button
                                    type='button'
                                    onClick={closeRefundModal}
                                    disabled={isRefunding}
                                    aria-label='Close refund modal'
                                    className='flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-xl leading-none text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className='space-y-5 px-6 py-5'>
                            <div className='rounded-2xl border border-slate-200/80 bg-white/65 p-4'>
                                <div className='flex items-center justify-between gap-3 text-sm'>
                                    <span className='text-slate-500'>Invoice amount</span>
                                    <span className='font-semibold text-slate-900'>{formatMoney(invoiceAmount, selectedInvoice.currency)}</span>
                                </div>
                            </div>

                            <div className='grid gap-3 sm:grid-cols-2'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setRefundType('full');
                                        setRefundError(null);
                                    }}
                                    className={`rounded-2xl border p-4 text-left transition ${
                                        refundType === 'full'
                                            ? 'border-blue-500 bg-blue-50/90 shadow-[0_8px_24px_rgba(37,99,235,0.12)]'
                                            : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white/80'
                                    }`}
                                >
                                    <span className='block text-sm font-semibold text-slate-900'>Full refund</span>
                                    <span className='mt-1 block text-[12px] leading-5 text-slate-500'>Refund the complete invoice through Stripe.</span>
                                </button>

                                <button
                                    type='button'
                                    onClick={() => {
                                        setRefundType('custom');
                                        setRefundError(null);
                                    }}
                                    className={`rounded-2xl border p-4 text-left transition ${
                                        refundType === 'custom'
                                            ? 'border-blue-500 bg-blue-50/90 shadow-[0_8px_24px_rgba(37,99,235,0.12)]'
                                            : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white/80'
                                    }`}
                                >
                                    <span className='block text-sm font-semibold text-slate-900'>Custom refund</span>
                                    <span className='mt-1 block text-[12px] leading-5 text-slate-500'>Enter the specific amount you want to refund.</span>
                                </button>
                            </div>

                            {refundType === 'custom' && (
                                <div className='space-y-3'>
                                    <label htmlFor='custom-refund-amount' className='block text-sm font-medium text-slate-800'>
                                        Requested refund amount
                                    </label>
                                    <div className='relative'>
                                        <span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500'>$</span>
                                        <input
                                            id='custom-refund-amount'
                                            type='number'
                                            min='0.01'
                                            max={invoiceAmount}
                                            step='0.01'
                                            inputMode='decimal'
                                            value={customRefundAmount}
                                            onChange={(event) => {
                                                setCustomRefundAmount(event.target.value);
                                                setRefundError(null);
                                            }}
                                            placeholder='25.00'
                                            className='w-full rounded-xl border border-slate-300 bg-white/80 py-3 pl-8 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                        />
                                    </div>
                                </div>
                            )}

                            {refundError && (
                                <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700'>{refundError}</div>
                            )}
                        </div>

                        <div className='flex flex-col-reverse gap-3 border-t border-white/70 bg-white/45 px-6 py-4 sm:flex-row sm:justify-end'>
                            <button
                                type='button'
                                onClick={closeRefundModal}
                                disabled={isRefunding}
                                className='rounded-xl border border-slate-300 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                Cancel
                            </button>
                            <button
                                type='button'
                                // eslint-disable-next-line
                                onClick={() => void handleRefund()}
                                disabled={isRefunding}
                                className='rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(220,38,38,0.28)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
                            >
                                {isRefunding ? 'Processing refund…' : refundType === 'full' ? 'Confirm full refund' : 'Confirm custom refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicesPage;
