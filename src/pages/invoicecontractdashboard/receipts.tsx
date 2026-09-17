// pages/dashboard/receipts.tsx
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ContractSummary = {
    contractName: string | null;
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
    status?: string | null;
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
    Contract: ContractSummary | null;
};

type ReceiptType = 'invoice' | 'subscription';

type ReceiptFilter = 'all' | ReceiptType;

type Receipt = Invoice & {
    receiptType: ReceiptType;
};

type ReceiptsApiResponse = {
    invoices?: Invoice[];
    subscriptionInv?: Invoice[];
    subscriptionInvoices?: Invoice[];
    data?: Invoice[];
};

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

const extractInvoices = (response: ReceiptsApiResponse | Invoice[]): Invoice[] => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response.invoices)) {
        return response.invoices;
    }

    if (Array.isArray(response.subscriptionInv)) {
        return response.subscriptionInv;
    }

    if (Array.isArray(response.subscriptionInvoices)) {
        return response.subscriptionInvoices;
    }

    if (Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

const isPaidReceipt = (invoice: Invoice): boolean => {
    return invoice.paid === true || invoice.status?.toLowerCase() === 'paid';
};

const ReceiptsPage: NextPage = () => {
    const router = useRouter();

    // Auth
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Receipts state
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
    const [receiptsError, setReceiptsError] = useState<string | null>(null);
    const [receiptFilter, setReceiptFilter] = useState<ReceiptFilter>('all');
    const [receiptSearch, setReceiptSearch] = useState('');

    // Refund modal state
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [refundType, setRefundType] = useState<RefundType>('full');
    const [customRefundAmount, setCustomRefundAmount] = useState('');
    const [isRefunding, setIsRefunding] = useState(false);
    const [refundError, setRefundError] = useState<string | null>(null);
    const [refundMessage, setRefundMessage] = useState<string | null>(null);

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
                    roles = parsed.filter((role): role is string => typeof role === 'string');
                } else if (typeof parsed === 'string') {
                    roles = [parsed];
                }
            } catch {
                roles = rawRoles
                    .split(',')
                    .map((role) => role.trim())
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

    const fetchReceiptSource = useCallback(
        async (endpoint: string, receiptType: ReceiptType): Promise<Receipt[]> => {
            if (!userId) return [];

            const response = await fetch(`${endpoint}?authId=${encodeURIComponent(userId)}`);

            if (!response.ok) {
                const text = await response.text();

                throw new Error(text || `Failed to load ${receiptType} receipts.`);
            }

            const data = (await response.json()) as ReceiptsApiResponse | Invoice[];

            return extractInvoices(data)
                .filter(isPaidReceipt)
                .map((invoice) => ({
                    ...invoice,
                    receiptType,
                }));
        },
        [userId]
    );

    const fetchReceipts = useCallback(async () => {
        if (typeof window === 'undefined') return;
        if (!isAuthChecked || !userId) return;

        setIsLoadingReceipts(true);
        setReceiptsError(null);

        /*
         * Both APIs are always requested. Promise.allSettled ensures
         * one successful API can still display its paid receipts even
         * if the other API fails.
         */
        const [invoiceResult, subscriptionResult] = await Promise.allSettled([
            fetchReceiptSource('/api/v2/invoices', 'invoice'),
            fetchReceiptSource('/api/v2/subscriptionInv', 'subscription'),
        ]);

        const loadedReceipts: Receipt[] = [];
        const errors: string[] = [];

        if (invoiceResult.status === 'fulfilled') {
            loadedReceipts.push(...invoiceResult.value);
        } else {
            errors.push(invoiceResult.reason instanceof Error ? invoiceResult.reason.message : 'Failed to load invoice receipts.');
        }

        if (subscriptionResult.status === 'fulfilled') {
            loadedReceipts.push(...subscriptionResult.value);
        } else {
            errors.push(subscriptionResult.reason instanceof Error ? subscriptionResult.reason.message : 'Failed to load subscription receipts.');
        }

        loadedReceipts.sort((first, second) => {
            const firstTime = new Date(first.createdAt).getTime();
            const secondTime = new Date(second.createdAt).getTime();

            return (Number.isFinite(secondTime) ? secondTime : 0) - (Number.isFinite(firstTime) ? firstTime : 0);
        });

        setReceipts(loadedReceipts);

        if (errors.length > 0) {
            setReceiptsError(errors.join(' '));
        }

        setIsLoadingReceipts(false);
    }, [fetchReceiptSource, isAuthChecked, userId]);

    useEffect(() => {
        if (!isAuthChecked || !userId) return;

        // eslint-disable-next-line
        void fetchReceipts();
    }, [fetchReceipts, isAuthChecked, userId]);

    useEffect(() => {
        if (!selectedReceipt) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isRefunding) {
                setSelectedReceipt(null);
            }
        };

        window.addEventListener('keydown', handleEscape);
        // eslint-disable-next-line
        return () => window.removeEventListener('keydown', handleEscape);
        // eslint-disable-next-line
    }, [isRefunding, selectedReceipt]);

    const openRefundModal = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
        setRefundType('full');
        setCustomRefundAmount('');
        setRefundError(null);
        setRefundMessage(null);
    };

    const closeRefundModal = () => {
        if (isRefunding) return;

        setSelectedReceipt(null);
        setRefundType('full');
        setCustomRefundAmount('');
        setRefundError(null);
    };

    const receiptAmount = useMemo(() => {
        if (!selectedReceipt) return 0;

        return parseMoney(selectedReceipt.price);
    }, [selectedReceipt]);

    const serviceFeePercent = selectedReceipt?.serviceFeePercent ?? 0;
    const platformFeePercent = selectedReceipt?.platformFeePercent ?? 0;
    const totalFeePercent = serviceFeePercent + platformFeePercent;
    const customRequestedAmount = parseMoney(customRefundAmount);
    const customFeeAmount = customRequestedAmount * (totalFeePercent / 100);
    const customNetRefundAmount = Math.max(0, customRequestedAmount - customFeeAmount);

    const handleRefund = async () => {
        if (!selectedReceipt || isRefunding) return;

        setRefundError(null);
        setRefundMessage(null);

        if (!isPaidReceipt(selectedReceipt)) {
            setRefundError('Only paid receipts can be refunded.');
            return;
        }

        if (selectedReceipt.refunded) {
            setRefundError('This receipt has already been refunded.');
            return;
        }

        let payload: RefundPayload = {
            invoiceId: selectedReceipt.id,
            reason: 'requested_by_customer',
        };

        if (refundType === 'custom') {
            if (!customRefundAmount.trim() || customRequestedAmount <= 0) {
                setRefundError('Enter a valid custom refund amount greater than 0.');
                return;
            }

            if (customRequestedAmount > receiptAmount) {
                setRefundError(`The custom amount cannot be greater than ${formatMoney(receiptAmount, selectedReceipt.currency)}.`);
                return;
            }

            if (customNetRefundAmount <= 0) {
                setRefundError('The refund amount is too small. Enter a larger amount and try again.');
                return;
            }

            payload = {
                invoiceId: selectedReceipt.id,
                amount: customNetRefundAmount.toFixed(2),
                reason: 'requested_by_customer',
            };
        }

        setIsRefunding(true);

        try {
            const refundEndpoint = selectedReceipt.receiptType === 'subscription' ? '/api/v2/subscriptionInv/stripe-refund' : '/api/v2/invoices/stripe-refund';

            const response = await fetch(refundEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = (await response.json().catch(() => ({}))) as ApiMessageResponse;

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Refund request failed.');
            }

            setRefundMessage(data.message || 'Refund processed successfully.');
            setSelectedReceipt(null);
            setRefundType('full');
            setCustomRefundAmount('');
            await fetchReceipts();
        } catch (error) {
            setRefundError(error instanceof Error ? error.message : 'Something went wrong while processing the refund.');
        } finally {
            setIsRefunding(false);
        }
    };

    const totalReceipts = receipts.length;
    const invoiceReceipts = receipts.filter((receipt) => receipt.receiptType === 'invoice').length;
    const subscriptionReceipts = receipts.filter((receipt) => receipt.receiptType === 'subscription').length;

    const filteredReceipts = useMemo(() => {
        const normalizedSearch = receiptSearch.trim().toLowerCase();

        return receipts.filter((receipt) => {
            const matchesType = receiptFilter === 'all' || receipt.receiptType === receiptFilter;
            if (!matchesType) return false;
            if (!normalizedSearch) return true;

            return [receipt.name, receipt.email, receipt.businessName, receipt.Contract?.contractName, receipt.transactionId, String(receipt.id)]
                .filter((value): value is string => typeof value === 'string')
                .some((value) => value.toLowerCase().includes(normalizedSearch));
        });
    }, [receiptFilter, receiptSearch, receipts]);

    if (!isAuthChecked) {
        return <div className='min-h-screen p-[7px] text-sm text-gray-500'>Checking access…</div>;
    }

    return (
        <div className='min-h-screen p-[7px]'>
            <div className='mx-auto max-w-7xl'>
                {/* Header */}
                <header className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <h1 className='mb-1 text-[28px] font-semibold text-slate-900'>Receipts</h1>
                        <p className='text-sm text-gray-500'>View all paid invoice and subscription receipts in one place.</p>
                    </div>

                    {/* <div className='flex flex-wrap items-center gap-3'>
                        <button
                            type='button'
                            // eslint-disable-next-line
                            onClick={() =>
                                void router.push(
                                    '/invoicecontractdashboard/contract',
                                )
                            }
                            className='inline-flex items-center gap-2 rounded-[13px] border border-gray-300 bg-white px-[16px] py-[10px] text-sm font-medium text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:bg-gray-50'
                        >
                            Contracts
                        </button>

                        <button
                            type='button'
                            onClick={handleCreateInvoice}
                            className='inline-flex cursor-pointer items-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] px-[18px] py-[10px] text-sm font-medium text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition-shadow hover:shadow-[0_12px_28px_rgba(37,99,235,0.45)]'
                        >
                            <span className='text-[18px] leading-none'>
                                ＋
                            </span>
                            <span>Create Invoice</span>
                        </button>
                    </div> */}
                </header>

                {/* Overview stats */}
                <section className='mb-6 grid gap-4 sm:grid-cols-3'>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Invoice Receipts</div>
                        <div className='mt-1 text-[22px] font-semibold text-blue-700'>{invoiceReceipts}</div>
                    </div>

                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Subscription Receipts</div>
                        <div className='mt-1 text-[22px] font-semibold text-violet-700'>{subscriptionReceipts}</div>
                    </div>

                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Total Receipts</div>
                        <div className='mt-1 text-[22px] font-semibold text-slate-900'>{totalReceipts}</div>
                    </div>
                </section>

                {/* Paid Receipts Table */}
                <section className='mb-6 rounded-[16px] border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                    <div className='mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <h2 className='text-lg font-semibold text-slate-900'>Paid Receipts</h2>
                        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
                            <select
                                value={receiptFilter}
                                onChange={(event) => setReceiptFilter(event.target.value as ReceiptFilter)}
                                className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                aria-label='Filter receipts by type'
                            >
                                <option value='all'>All Receipts</option>
                                <option value='invoice'>Invoice Receipts</option>
                                <option value='subscription'>Subscription Receipts</option>
                            </select>
                            <input
                                type='search'
                                value={receiptSearch}
                                onChange={(event) => setReceiptSearch(event.target.value)}
                                placeholder='Search receipts...'
                                className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64'
                                aria-label='Search receipts'
                            />
                        </div>
                    </div>

                    {refundMessage && (
                        <div className='mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-medium text-green-800'>
                            {refundMessage}
                        </div>
                    )}

                    {isLoadingReceipts && <p className='text-sm text-gray-500'>Loading paid receipts…</p>}

                    {receiptsError && <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700'>{receiptsError}</div>}

                    {!isLoadingReceipts && receipts.length === 0 && (
                        <p className='text-sm text-gray-500'>No paid invoice or subscription receipts found yet.</p>
                    )}

                    {!isLoadingReceipts && receipts.length > 0 && filteredReceipts.length === 0 && (
                        <p className='text-sm text-gray-500'>No receipts match the selected type or search.</p>
                    )}

                    {!isLoadingReceipts && filteredReceipts.length > 0 && (
                        <div className='mt-2 overflow-x-auto rounded-xl border border-gray-200'>
                            <table className='min-w-[1260px] w-full border-collapse text-[13px]'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        {[
                                            'Sr #',
                                            'Receipt Name',
                                            'Email',
                                            'Business Name',
                                            'Price',
                                            'Status',
                                            'Type',
                                            'Contract Name',
                                            'Created At',
                                            'Receipt',
                                            'Action',
                                        ].map((header) => (
                                            <th key={header} className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredReceipts.map((receipt, index) => {
                                        const displayName = receipt.name?.trim() || '—';
                                        const displayBusinessName = receipt.businessName?.trim() || '—';
                                        const displayContractName = receipt.Contract?.contractName?.trim() || '—';
                                        const displayPrice = formatMoney(parseMoney(receipt.price), receipt.currency);
                                        const receiptImage = receipt.paidImage || receipt.unpaidImage;
                                        const canRefund = isPaidReceipt(receipt) && !receipt.refunded;

                                        return (
                                            <tr key={`${receipt.receiptType}-${receipt.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{index + 1}</td>

                                                <td className='px-3 py-2.5 text-[13px] font-medium text-slate-900'>{displayName}</td>

                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{receipt.email || '—'}</td>

                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayBusinessName}</td>

                                                <td className='px-3 py-2.5 text-[13px] font-semibold text-green-700'>{displayPrice}</td>

                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-[12px] font-semibold text-green-800'>
                                                        Paid
                                                    </span>
                                                </td>

                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize ${
                                                            receipt.receiptType === 'invoice' ? 'bg-blue-100 text-blue-800' : 'bg-violet-100 text-violet-800'
                                                        }`}
                                                    >
                                                        {receipt.receiptType}
                                                    </span>
                                                </td>

                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayContractName}</td>

                                                <td className='whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-600'>{formatDateTime(receipt.createdAt)}</td>

                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    {receiptImage ? (
                                                        <a
                                                            href={receiptImage}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='inline-flex cursor-pointer items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-medium text-blue-700 no-underline transition-colors hover:bg-blue-100'
                                                        >
                                                            View Receipt
                                                        </a>
                                                    ) : (
                                                        <span className='text-[12px] text-gray-400'>No image</span>
                                                    )}
                                                </td>

                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    {receipt.refunded ? (
                                                        <span className='inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-[12px] font-medium text-slate-600'>
                                                            Refunded
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type='button'
                                                            onClick={() => openRefundModal(receipt)}
                                                            disabled={!canRefund}
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

            {/* Refund Modal */}
            {selectedReceipt && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md'
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target) {
                            closeRefundModal();
                        }
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
                                        Refund receipt
                                    </h3>

                                    <p className='mt-1 text-sm text-slate-600'>
                                        <span className='capitalize'>{selectedReceipt.receiptType}</span> #{selectedReceipt.id} ·{' '}
                                        {selectedReceipt.name || selectedReceipt.email}
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
                                    <span className='text-slate-500'>Receipt amount</span>

                                    <span className='font-semibold text-slate-900'>{formatMoney(receiptAmount, selectedReceipt.currency)}</span>
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

                                    <span className='mt-1 block text-[12px] leading-5 text-slate-500'>Refund the complete receipt through Stripe.</span>
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
                                            max={receiptAmount}
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

export default ReceiptsPage;
