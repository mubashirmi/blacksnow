// pages/dashboard/invoices.tsx
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

    // Refund modal state
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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
    const estimatedFullRefund = Math.max(0, invoiceAmount - invoiceAmount * (totalFeePercent / 100));

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
                setRefundError('The refund amount is too small after fee deduction.');
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
            const res = await fetch('/api/v2/invoices/stripe-refund', {
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

    const totalInvoices = invoices.length;
    const totalSignedContracts = contracts.length;

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
                <section className='mb-6 grid gap-4 sm:grid-cols-2'>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Total Subscriptions</div>
                        <div className='mt-1 text-[22px] font-semibold text-slate-900'>{totalInvoices}</div>
                    </div>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Signed Contracts</div>
                        <div className='mt-1 text-[22px] font-semibold text-green-700'>{totalSignedContracts}</div>
                    </div>
                </section>

                {/* All Invoices Table */}
                <section className='mb-6 rounded-[16px] border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                    <div className='mb-3 flex items-center justify-between gap-2'>
                        <h2 className='text-lg font-semibold text-slate-900'>All Subscriptions</h2>
                    </div>

                    {refundMessage && (
                        <div className='mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-medium text-green-800'>
                            {refundMessage}
                        </div>
                    )}

                    {isLoadingInvoices && <p className='text-sm text-gray-500'>Loading subscriptions...</p>}

                    {invoicesError && <p className='text-[13px] text-red-700'>{invoicesError}</p>}

                    {!isLoadingInvoices && !invoicesError && invoices.length === 0 && (
                        <p className='text-sm text-gray-500'>No invoices found yet. Create your first subscription to see it here.</p>
                    )}

                    {!isLoadingInvoices && !invoicesError && invoices.length > 0 && (
                        <div className='mt-2 overflow-x-auto rounded-xl border border-gray-200'>
                            <table className='min-w-[1180px] w-full border-collapse text-[13px]'>
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
                                            'Action',
                                        ].map((header) => (
                                            <th key={header} className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice, index) => {
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
                                                        {invoice.paid ? 'Paid' : 'Unpaid'}
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

                {/* Signed Contracts Table */}
                <section className='rounded-[16px] border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
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
            </div>

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
                                <div className='mt-2 flex items-center justify-between gap-3 text-sm'>
                                    <span className='text-slate-500'>Fee deduction</span>
                                    <span className='font-medium text-red-600'>
                                        -{totalFeePercent}% ({serviceFeePercent}% service + {platformFeePercent}% platform)
                                    </span>
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
                                    <span className='mt-1 block text-[12px] leading-5 text-slate-500'>
                                        Enter a specific amount before the 10% fee deduction.
                                    </span>
                                </button>
                            </div>

                            {refundType === 'full' ? (
                                <div className='rounded-2xl border border-amber-200 bg-amber-50/80 p-4'>
                                    <div className='flex items-center justify-between gap-3'>
                                        <span className='text-sm font-medium text-amber-900'>Estimated customer refund</span>
                                        <span className='text-base font-semibold text-amber-900'>
                                            {formatMoney(estimatedFullRefund, selectedInvoice.currency)}
                                        </span>
                                    </div>
                                    <p className='mt-2 text-[12px] leading-5 text-amber-800'>
                                        The full-refund request is sent without an amount, exactly as required by the API. The backend must apply the final
                                        Stripe refund calculation.
                                    </p>
                                </div>
                            ) : (
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

                                    <div className='rounded-2xl border border-slate-200 bg-white/65 p-4 text-sm'>
                                        <div className='flex items-center justify-between gap-3'>
                                            <span className='text-slate-500'>Requested amount</span>
                                            <span className='font-medium text-slate-900'>{formatMoney(customRequestedAmount, selectedInvoice.currency)}</span>
                                        </div>
                                        <div className='mt-2 flex items-center justify-between gap-3'>
                                            <span className='text-slate-500'>Total fee ({totalFeePercent}%)</span>
                                            <span className='font-medium text-red-600'>-{formatMoney(customFeeAmount, selectedInvoice.currency)}</span>
                                        </div>
                                        <div className='mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3'>
                                            <span className='font-semibold text-slate-900'>Amount sent to refund API</span>
                                            <span className='text-base font-semibold text-green-700'>
                                                {formatMoney(customNetRefundAmount, selectedInvoice.currency)}
                                            </span>
                                        </div>
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
