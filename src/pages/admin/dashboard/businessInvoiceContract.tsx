// pages/dashboard/business-invoice.tsx
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type Contract = {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string | null;
    email: string;
    businessName: string | null;
    contractName: string | null;
    pdf: string;
    signed: 'signed' | 'notSigned' | 'rejected' | boolean | string; // tolerate API variance
    authId: number;
};

type Invoice = {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string | null;
    email: string;
    businessName: string | null;
    price: string | null;
    contractId: number | null;
    authId: number;
    Contract: Contract | null;
};

type ContractsResponse = { contracts: Contract[] };
type InvoicesResponse = { invoices: Invoice[] };

type CreateContractResponse = {
    id?: number;
    contract?: Contract;
    invoice?: Contract;
    message?: string;
    success?: boolean;
    [key: string]: unknown;
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

const normalizeContractStatus = (signed: any): 'signed' | 'notSigned' | 'rejected' => {
    if (signed === true) return 'signed';
    if (signed === false) return 'notSigned';

    const v = String(signed || '').toLowerCase();
    if (v === 'signed') return 'signed';
    if (v === 'notsigned' || v === 'not_signed' || v === 'pending') return 'notSigned';
    if (v === 'rejected' || v === 'declined') return 'rejected';

    // fallback (most dashboards treat unknown as pending)
    return 'notSigned';
};

function SectionShell({
    title,
    open,
    onToggle,
    actionLabel,
    onAction,
    children,
}: {
    title: string;
    open: boolean;
    onToggle: () => void;
    actionLabel?: string;
    onAction?: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className='overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
            {/* Header bar like your screenshot */}
            <button
                type='button'
                onClick={onToggle}
                className='w-full flex items-center justify-between gap-4 px-5 py-4 text-white bg-gradient-to-r from-slate-900 to-slate-700'
            >
                <div className='flex items-center gap-3'>
                    <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/10'>
                        {open ? <ChevronDown className='w-5 h-5' /> : <ChevronRight className='w-5 h-5' />}
                    </span>
                    <h2 className='text-[18px] sm:text-[20px] font-semibold'>{title}</h2>
                </div>

                {actionLabel && onAction && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction();
                        }}
                        className='inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-[12px] sm:text-[13px] font-semibold cursor-pointer hover:bg-blue-700 transition-colors'
                    >
                        + {actionLabel}
                    </span>
                )}
            </button>

            {/* Body */}
            {open && <div className='px-5 py-5'>{children}</div>}
        </section>
    );
}

const BusinessInvoicePage: NextPage = () => {
    const router = useRouter();

    // Collapsibles
    const [contractsOpen, setContractsOpen] = useState(true);
    const [invoicesOpen, setInvoicesOpen] = useState(true);

    // Contracts state
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(false);
    const [contractsError, setContractsError] = useState<string | null>(null);

    // Invoices state
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [invoicesError, setInvoicesError] = useState<string | null>(null);

    // Create-contract modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [contractName, setContractName] = useState('');
    const [email, setEmail] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Share-link modal
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // const adminId = useMemo(() => {
    //     if (typeof window === 'undefined') return null;
    //     return window.localStorage.getItem('adminId');
    // }, []);

    const fetchContracts = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const id = window.localStorage.getItem('adminId');
        if (!id) {
            setContractsError('Admin ID not found in localStorage.');
            return;
        }

        setIsLoadingContracts(true);
        setContractsError(null);

        try {
            const res = await fetch(`/api/v2/contract?authId=${encodeURIComponent(id)}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to load contracts.');
            }

            const data = (await res.json()) as ContractsResponse;
            setContracts(data.contracts || []);
        } catch (err) {
            setContractsError(err instanceof Error ? err.message : 'Something went wrong while loading contracts.');
            setContracts([]);
        } finally {
            setIsLoadingContracts(false);
        }
    }, []);

    const fetchInvoices = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const id = window.localStorage.getItem('adminId');
        if (!id) {
            setInvoicesError('Admin ID not found in localStorage.');
            return;
        }

        setIsLoadingInvoices(true);
        setInvoicesError(null);

        try {
            const res = await fetch(`/api/v2/invoices?authId=${encodeURIComponent(id)}`);
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
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        void fetchContracts();
        // eslint-disable-next-line
        void fetchInvoices();
    }, [fetchContracts, fetchInvoices]);

    const signedContracts = useMemo(() => {
        return (contracts || []).filter((c) => normalizeContractStatus(c.signed) === 'signed');
    }, [contracts]);

    const hasInvoice = useCallback((contractId: number) => invoices.some((inv) => inv.contractId === contractId), [invoices]);

    // ---- Contracts: create modal handlers ----
    const handleOpenCreateModal = () => {
        setFormError(null);
        setContractName('');
        setEmail('');
        setPdfFile(null);
        setCopyStatus('idle');
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        if (isSubmitting) return;
        setIsCreateModalOpen(false);
        setFormError(null);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file && file.type !== 'application/pdf') {
            setFormError('Please upload a PDF file.');
            setPdfFile(null);
            return;
        }
        setFormError(null);
        setPdfFile(file);
    };

    const handleSubmitContract = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setCopyStatus('idle');

        if (!contractName.trim()) return setFormError('Contract name is required.');
        if (!email.trim()) return setFormError('Email is required.');
        if (!pdfFile) return setFormError('Please upload a PDF file.');
        if (typeof window === 'undefined') return setFormError('Window is not available.');

        const id = window.localStorage.getItem('adminId');
        if (!id) return setFormError('Admin ID not found in localStorage.');

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('contractName', contractName.trim());
            formData.append('email', email.trim());
            formData.append('authId', id);
            formData.append('pdf', pdfFile);

            const res = await fetch(`/api/v2/contract?authId=${encodeURIComponent(id)}`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to create contract.');
            }

            const data = (await res.json()) as CreateContractResponse;

            const createdId =
                (data as any)?.contract?.id ??
                (data as any)?.invoice?.id ?? // some APIs return `invoice`
                (typeof (data as any)?.id === 'number' ? (data as any).id : undefined);

            if (!createdId) throw new Error('Contract id not returned from API.');

            const url = `https://www.blacksnowholdings.com/contractsignature?id=${createdId}`;
            setShareLink(url);

            // reset + close create modal
            setContractName('');
            setEmail('');
            setPdfFile(null);
            setIsCreateModalOpen(false);
            // eslint-disable-next-line
            void fetchContracts();
            setIsShareModalOpen(true);
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'Something went wrong while creating the contract.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyLink = async () => {
        if (!shareLink) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareLink);
                setCopyStatus('success');
            } else {
                setCopyStatus('error');
            }
        } catch {
            setCopyStatus('error');
        }
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setShareLink(null);
        setCopyStatus('idle');
    };

    // ---- Invoice actions ----
    const handleCreateInvoice = () => {
        router.push('/admin/dashboard/invoice/create');
    };

    const handleCreateInvoiceForContract = (contractId: number) => {
        router.push(`/admin/dashboard/invoice/create?contractId=${contractId}`);
    };

    // ---- Stats ----
    const totalContracts = contracts.length;
    const signedCount = contracts.filter((c) => normalizeContractStatus(c.signed) === 'signed').length;
    const unsignedCount = totalContracts - signedCount;

    const totalInvoices = invoices.length;

    return (
        <div className='min-h-screen p-[10px]'>
            <div className='mx-auto max-w-7xl space-y-6'>
                {/* Page Header */}
                <header className='flex items-start justify-between gap-4'>
                    <div>
                        <h1 className='text-[28px] font-semibold text-slate-900'>Business Invoice</h1>
                        <p className='text-sm text-gray-500'>
                            Manage your contracts and invoices in one page — create, track, and generate invoices from signed contracts.
                        </p>
                    </div>
                </header>

                {/* 1) Contracts Section */}
                <SectionShell
                    title='Contracts'
                    open={contractsOpen}
                    onToggle={() => setContractsOpen((v) => !v)}
                    actionLabel='Start Contract'
                    onAction={handleOpenCreateModal}
                >
                    {/* Overview stats */}
                    <div className='mb-5 grid gap-4 sm:grid-cols-3'>
                        <div className='rounded-[14px] border border-gray-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                            <div className='text-[12px] uppercase text-gray-500'>Total Contracts</div>
                            <div className='mt-1 text-[22px] font-semibold text-slate-900'>{totalContracts}</div>
                        </div>
                        <div className='rounded-[14px] border border-gray-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                            <div className='text-[12px] uppercase text-gray-500'>Signed</div>
                            <div className='mt-1 text-[22px] font-semibold text-green-700'>{signedCount}</div>
                        </div>
                        <div className='rounded-[14px] border border-gray-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                            <div className='text-[12px] uppercase text-gray-500'>Pending Signature</div>
                            <div className='mt-1 text-[22px] font-semibold text-amber-700'>{unsignedCount}</div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className='rounded-[14px] border border-gray-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                        <div className='mb-3 flex items-center justify-between gap-2'>
                            <h3 className='text-lg font-semibold text-slate-900'>All Contracts</h3>
                        </div>

                        {isLoadingContracts && <p className='text-sm text-gray-500'>Loading contracts…</p>}
                        {contractsError && <p className='text-[13px] text-red-700'>{contractsError}</p>}

                        {!isLoadingContracts && !contractsError && contracts.length === 0 && (
                            <p className='text-sm text-gray-500'>No contracts found yet. Create your first contract to see it here.</p>
                        )}

                        {!isLoadingContracts && !contractsError && contracts.length > 0 && (
                            <div className='mt-2 overflow-hidden rounded-xl border border-gray-200'>
                                <table className='w-full border-collapse text-[13px]'>
                                    <thead className='bg-gray-50'>
                                        <tr>
                                            {['Sr #', 'Contract Name', 'Email', 'Name', 'Business Name', 'Created At', 'PDF', 'Status'].map((header) => (
                                                <th
                                                    key={header}
                                                    className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contracts.map((c, index) => {
                                            const displayContractName = c.contractName?.trim() ? c.contractName : '—';
                                            const displayName = c.name?.trim() ? c.name : '—';
                                            const displayBusiness = c.businessName?.trim() ? c.businessName : '—';
                                            const status = normalizeContractStatus(c.signed);

                                            const badge =
                                                status === 'signed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : status === 'notSigned'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-red-100 text-red-800';

                                            const label = status === 'signed' ? 'Signed' : status === 'notSigned' ? 'Not Signed' : 'Rejected';

                                            return (
                                                <tr key={c.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className='px-3 py-2.5 text-slate-900'>{index + 1}</td>
                                                    <td className='px-3 py-2.5 font-medium text-slate-900'>{displayContractName}</td>
                                                    <td className='px-3 py-2.5 text-slate-900'>{c.email || '—'}</td>
                                                    <td className='px-3 py-2.5 text-gray-600'>{displayName}</td>
                                                    <td className='px-3 py-2.5 text-gray-600'>{displayBusiness}</td>
                                                    <td className='whitespace-nowrap px-3 py-2.5 text-gray-600'>{formatDateTime(c.createdAt)}</td>
                                                    <td className='px-3 py-2.5'>
                                                        <a
                                                            href={c.pdf}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='text-blue-600 no-underline hover:underline'
                                                        >
                                                            View PDF
                                                        </a>
                                                    </td>
                                                    <td className='px-3 py-2.5'>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${badge}`}
                                                        >
                                                            {label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </SectionShell>

                {/* 2) Invoices Section */}
                <SectionShell
                    title='Invoices'
                    open={invoicesOpen}
                    onToggle={() => setInvoicesOpen((v) => !v)}
                    actionLabel='Create Invoice'
                    onAction={handleCreateInvoice}
                >
                    {/* Overview stats */}
                    <div className='mb-5 grid gap-4 sm:grid-cols-2'>
                        <div className='rounded-[14px] border border-gray-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                            <div className='text-[12px] uppercase text-gray-500'>Total Invoices</div>
                            <div className='mt-1 text-[22px] font-semibold text-slate-900'>{totalInvoices}</div>
                        </div>
                        <div className='rounded-[14px] border border-gray-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                            <div className='text-[12px] uppercase text-gray-500'>Signed Contracts</div>
                            <div className='mt-1 text-[22px] font-semibold text-green-700'>{signedContracts.length}</div>
                        </div>
                    </div>

                    {/* All Invoices Table */}
                    <div className='mb-6 rounded-[14px] border border-gray-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                        <div className='mb-3 flex items-center justify-between gap-2'>
                            <h3 className='text-lg font-semibold text-slate-900'>All Invoices</h3>
                        </div>

                        {isLoadingInvoices && <p className='text-sm text-gray-500'>Loading invoices…</p>}
                        {invoicesError && <p className='text-[13px] text-red-700'>{invoicesError}</p>}

                        {!isLoadingInvoices && !invoicesError && invoices.length === 0 && (
                            <p className='text-sm text-gray-500'>No invoices found yet. Create your first invoice to see it here.</p>
                        )}

                        {!isLoadingInvoices && !invoicesError && invoices.length > 0 && (
                            <div className='mt-2 overflow-hidden rounded-xl border border-gray-200'>
                                <table className='w-full border-collapse text-[13px]'>
                                    <thead className='bg-gray-50'>
                                        <tr>
                                            {['Sr #', 'Invoice Name', 'Email', 'Business Name', 'Price', 'Contract Name', 'Created At'].map((header) => (
                                                <th
                                                    key={header}
                                                    className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((inv, index) => {
                                            const displayName = inv.name?.trim() ? inv.name : '—';
                                            const displayBusiness = inv.businessName?.trim() ? inv.businessName : '—';
                                            const displayContract = inv.Contract?.contractName?.trim() ? inv.Contract.contractName : '—';
                                            const displayPrice = inv.price ? `$${parseFloat(inv.price).toFixed(2)}` : '—';

                                            return (
                                                <tr key={inv.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className='px-3 py-2.5 text-slate-900'>{index + 1}</td>
                                                    <td className='px-3 py-2.5 font-medium text-slate-900'>{displayName}</td>
                                                    <td className='px-3 py-2.5 text-slate-900'>{inv.email || '—'}</td>
                                                    <td className='px-3 py-2.5 text-gray-600'>{displayBusiness}</td>
                                                    <td className='px-3 py-2.5 font-semibold text-green-700'>{displayPrice}</td>
                                                    <td className='px-3 py-2.5 text-gray-600'>{displayContract}</td>
                                                    <td className='whitespace-nowrap px-3 py-2.5 text-gray-600'>{formatDateTime(inv.createdAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Signed Contracts Table (Create Invoice helper) */}
                    <div className='rounded-[14px] border border-gray-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                        <div className='mb-3 flex items-center justify-between gap-2'>
                            <h3 className='text-lg font-semibold text-slate-900'>Signed Contracts</h3>
                        </div>

                        {isLoadingContracts && <p className='text-sm text-gray-500'>Loading signed contracts…</p>}
                        {contractsError && <p className='text-[13px] text-red-700'>{contractsError}</p>}

                        {!isLoadingContracts && !contractsError && signedContracts.length === 0 && (
                            <p className='text-sm text-gray-500'>No signed contracts found yet.</p>
                        )}

                        {!isLoadingContracts && !contractsError && signedContracts.length > 0 && (
                            <div className='mt-2 overflow-hidden rounded-xl border border-gray-200'>
                                <table className='w-full border-collapse text-[13px]'>
                                    <thead className='bg-gray-50'>
                                        <tr>
                                            {['Sr #', 'Contract Name', 'Email', 'Name', 'Business Name', 'Created At', 'PDF', 'Action'].map((header) => (
                                                <th
                                                    key={header}
                                                    className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {signedContracts.map((c, index) => {
                                            const displayContractName = c.contractName?.trim() ? c.contractName : '—';
                                            const displayName = c.name?.trim() ? c.name : '—';
                                            const displayBusiness = c.businessName?.trim() ? c.businessName : '—';
                                            const invoiceCreated = hasInvoice(c.id);

                                            return (
                                                <tr key={c.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className='px-3 py-2.5 text-slate-900'>{index + 1}</td>
                                                    <td className='px-3 py-2.5 font-medium text-slate-900'>{displayContractName}</td>
                                                    <td className='px-3 py-2.5 text-slate-900'>{c.email || '—'}</td>
                                                    <td className='px-3 py-2.5 text-gray-600'>{displayName}</td>
                                                    <td className='px-3 py-2.5 text-gray-600'>{displayBusiness}</td>
                                                    <td className='whitespace-nowrap px-3 py-2.5 text-gray-600'>{formatDateTime(c.createdAt)}</td>
                                                    <td className='px-3 py-2.5'>
                                                        <a
                                                            href={c.pdf}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='cursor-pointer text-blue-600 no-underline hover:underline'
                                                        >
                                                            View PDF
                                                        </a>
                                                    </td>
                                                    <td className='px-3 py-2.5'>
                                                        {invoiceCreated ? (
                                                            <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[12px] font-medium text-green-800'>
                                                                Invoice Created
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type='button'
                                                                onClick={() => handleCreateInvoiceForContract(c.id)}
                                                                className='cursor-pointer inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 transition-colors'
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
                    </div>
                </SectionShell>
            </div>

            {/* ---- Create Contract Modal ---- */}
            {isCreateModalOpen && (
                <div className='fixed inset-0 z-[50] flex items-center justify-center bg-slate-900/60 px-3'>
                    <div className='w-full max-w-md rounded-[18px] bg-white px-6 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.4)]'>
                        <div className='mb-3 flex items-start justify-between'>
                            <div>
                                <h2 className='text-lg font-semibold text-slate-900'>Start a Contract</h2>
                                <p className='text-[13px] text-gray-500'>Enter contract details and upload the PDF.</p>
                            </div>
                            <button
                                type='button'
                                onClick={handleCloseCreateModal}
                                disabled={isSubmitting}
                                className='text-[20px] leading-none text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed'
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitContract} className='space-y-3'>
                            <div>
                                <label htmlFor='contractName' className='mb-1 block text-[13px] font-medium text-slate-700'>
                                    Contract Name
                                </label>
                                <input
                                    id='contractName'
                                    type='text'
                                    required
                                    value={contractName}
                                    onChange={(e) => setContractName(e.target.value)}
                                    placeholder='e.g., Service Agreement 2024'
                                    className='w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                />
                            </div>

                            <div>
                                <label htmlFor='email' className='mb-1 block text-[13px] font-medium text-slate-700'>
                                    Recipient Email
                                </label>
                                <input
                                    id='email'
                                    type='email'
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='client@example.com'
                                    className='w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                />
                            </div>

                            <div>
                                <label htmlFor='pdf' className='mb-1 block text-[13px] font-medium text-slate-700'>
                                    Contract PDF
                                </label>
                                <input
                                    id='pdf'
                                    type='file'
                                    accept='application/pdf'
                                    onChange={handleFileChange}
                                    className='block w-full text-[13px] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-blue-700 hover:file:bg-blue-100'
                                />
                                {pdfFile && <p className='mt-1 text-[12px] text-gray-500'>Selected: {pdfFile.name}</p>}
                            </div>

                            {formError && <p className='text-[13px] text-red-700'>{formError}</p>}

                            <div className='mt-4 flex justify-end gap-2'>
                                <button
                                    type='button'
                                    onClick={handleCloseCreateModal}
                                    disabled={isSubmitting}
                                    className='rounded-[12px] border border-gray-300 px-3.5 py-2 text-[13px] text-slate-700 hover:bg-gray-50 disabled:cursor-not-allowed'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='rounded-[12px] border-none bg-blue-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'
                                >
                                    {isSubmitting ? 'Creating…' : 'Create Contract'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ---- Share Link Modal ---- */}
            {isShareModalOpen && shareLink && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-3'>
                    <div className='w-full max-w-md rounded-[18px] bg-white px-6 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.4)]'>
                        <div className='mb-3 flex items-center justify-between'>
                            <h2 className='text-lg font-semibold text-slate-900'>Share Contract Link</h2>
                            <button type='button' onClick={handleCloseShareModal} className='text-[20px] leading-none text-gray-400 hover:text-gray-600'>
                                ×
                            </button>
                        </div>

                        <p className='mb-3 text-[13px] text-gray-600'>Copy this link and send it to the person you want to sign the contract.</p>

                        <div className='mb-2 flex items-center gap-2'>
                            <div className='flex-1 break-all rounded-[10px] border border-gray-300 bg-gray-50 px-3 py-2.5 text-[13px] text-slate-900'>
                                {shareLink}
                            </div>
                            <button
                                type='button'
                                onClick={handleCopyLink}
                                className='inline-flex items-center whitespace-nowrap rounded-full bg-slate-900 px-3 py-2 text-[13px] font-medium text-white hover:bg-black'
                            >
                                Copy
                            </button>
                        </div>

                        {copyStatus === 'success' && <p className='text-[12px] text-green-600'>Link copied to clipboard.</p>}
                        {copyStatus === 'error' && <p className='text-[12px] text-red-700'>Could not copy automatically. Please copy manually.</p>}

                        <div className='mt-4 flex justify-end'>
                            <button
                                type='button'
                                onClick={handleCloseShareModal}
                                className='rounded-full bg-blue-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-blue-700'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessInvoicePage;
