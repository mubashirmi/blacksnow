// pages/dashboard/contracts.tsx
import type { NextPage } from 'next';
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';

type Invoice = {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string | null;
    email: string;
    businessName: string | null;
    contractName: string | null;
    pdf: string;
    signed: boolean;
    authId: number;
};

type ContractsResponse = {
    contracts: Invoice[];
};

type CreateInvoiceResponse = {
    id?: number;
    invoice?: Invoice;
    message?: string;
    success?: boolean;
    [key: string]: unknown;
};

// Helper: format createdAt nicely for the table
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

const ContractsPage: NextPage = () => {
    // Create-contract modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [contractName, setContractName] = useState('');
    const [email, setEmail] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Invoices table
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [invoicesError, setInvoicesError] = useState<string | null>(null);

    // Share-link modal
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Fetch invoices from /api/v2/contract?authId=${adminId}
    const fetchInvoices = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const adminId = window.localStorage.getItem('adminId');
        if (!adminId) {
            setInvoicesError('Admin ID not found in localStorage.');
            return;
        }

        setIsLoadingInvoices(true);
        try {
            const res = await fetch(`/api/v2/contract?authId=${encodeURIComponent(adminId)}`);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to load invoices.');
            }

            const data = (await res.json()) as ContractsResponse;
            setInvoices(data.contracts || []);
            setInvoicesError(null);
        } catch (err) {
            setInvoicesError(err instanceof Error ? err.message : 'Something went wrong while loading invoices.');
        } finally {
            setIsLoadingInvoices(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        void fetchInvoices();
    }, [fetchInvoices]);

    const handleOpenCreateModal = () => {
        setFormError(null);
        setContractName('');
        setEmail('');
        setPdfFile(null);
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setCopyStatus('idle');

        if (!contractName) {
            setFormError('Contract name is required.');
            return;
        }

        if (!email) {
            setFormError('Email is required.');
            return;
        }

        if (!pdfFile) {
            setFormError('Please upload a PDF file.');
            return;
        }

        if (typeof window === 'undefined') {
            setFormError('Window is not available.');
            return;
        }

        const adminId = window.localStorage.getItem('adminId');
        if (!adminId) {
            setFormError('Admin ID not found in localStorage.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Create FormData to send the PDF file directly
            const formData = new FormData();
            formData.append('contractName', contractName);
            formData.append('email', email);
            formData.append('authId', adminId);
            formData.append('pdf', pdfFile); // Append the actual file

            // Send the file directly to your backend
            const res = await fetch(`/api/v2/contract?authId=${encodeURIComponent(adminId)}`, {
                method: 'POST',
                body: formData, // Send as FormData (no Content-Type header needed)
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to create contract.');
            }

            const data = (await res.json()) as CreateInvoiceResponse;

            // Try to get the invoice ID from the response
            const contractId = data.contract?.id ?? (typeof data.id === 'number' ? data.id : undefined);

            if (!contractId) {
                throw new Error('Contract id not returned from API.');
            }

            // Build the shareable link
            const url = `https://www.blacksnowholdings.com/contractsignature?id=${contractId}`;
            setShareLink(url);

            // Reset form + close create modal
            setContractName('');
            setEmail('');
            setPdfFile(null);
            setIsCreateModalOpen(false);

            // Refresh invoices table
            // eslint-disable-next-line
            void fetchInvoices();

            // Open share-link modal
            setIsShareModalOpen(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong while creating the contract.';
            setFormError(message);
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

    const totalInvoices = invoices.length;
    const signedCount = invoices.filter((i) => i.signed).length;
    const unsignedCount = totalInvoices - signedCount;

    return (
        <div className='min-h-screen p-[7px]'>
            <div className='mx-auto max-w-6xl'>
                {/* Header */}
                <header className='mb-6 flex items-center justify-between gap-4'>
                    <div>
                        <h1 className='mb-1 text-[28px] font-semibold text-slate-900'>Contracts</h1>
                        <p className='text-sm text-gray-500'>Create contracts, send them for signing, and track their status in one place.</p>
                    </div>
                    <button
                        type='button'
                        onClick={handleOpenCreateModal}
                        className='inline-flex items-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] px-[18px] py-[10px] text-sm font-medium text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)]'
                    >
                        <span className='text-[18px] leading-none'>＋</span>
                        <span>Start a Contract</span>
                    </button>
                </header>

                {/* Overview stats */}
                <section className='mb-6 grid gap-4 sm:grid-cols-3'>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Total Contracts</div>
                        <div className='mt-1 text-[22px] font-semibold text-slate-900'>{totalInvoices}</div>
                    </div>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Signed</div>
                        <div className='mt-1 text-[22px] font-semibold text-green-700'>{signedCount}</div>
                    </div>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Pending Signature</div>
                        <div className='mt-1 text-[22px] font-semibold text-amber-700'>{unsignedCount}</div>
                    </div>
                </section>

                {/* Invoices Table */}
                <section className='rounded-[16px] border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                    <div className='mb-3 flex items-center justify-between gap-2'>
                        <h2 className='text-lg font-semibold text-slate-900'>All Contracts</h2>
                    </div>

                    {isLoadingInvoices && <p className='text-sm text-gray-500'>Loading invoices…</p>}

                    {invoicesError && <p className='text-[13px] text-red-700'>{invoicesError}</p>}

                    {!isLoadingInvoices && !invoicesError && invoices.length === 0 && (
                        <p className='text-sm text-gray-500'>No invoices found yet. Create your first contract to see it here.</p>
                    )}

                    {!isLoadingInvoices && invoices.length > 0 && (
                        <div className='mt-2 overflow-hidden rounded-xl border border-gray-200'>
                            <table className='w-full border-collapse text-[13px]'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        {['Sr #', 'Contract Name', 'Email', 'Name', 'Business Name', 'Created At', 'PDF', 'Status'].map((header) => (
                                            <th key={header} className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice, index) => {
                                        const displayContractName = invoice.contractName && invoice.contractName.trim().length > 0 ? invoice.contractName : '—';
                                        const displayName = invoice.name && invoice.name.trim().length > 0 ? invoice.name : '—';
                                        const displayBusinessName = invoice.businessName && invoice.businessName.trim().length > 0 ? invoice.businessName : '—';
                                        const isSigned = invoice.signed;

                                        return (
                                            <tr key={invoice.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{index + 1}</td>
                                                <td className='px-3 py-2.5 text-[13px] font-medium text-slate-900'>{displayContractName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{invoice.email}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayBusinessName}</td>
                                                <td className='whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-600'>{formatDateTime(invoice.createdAt)}</td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <a
                                                        href={invoice.pdf}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='text-[13px] text-blue-600 no-underline hover:underline'
                                                    >
                                                        View PDF
                                                    </a>
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                                                            isSigned === 'notSigned'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : isSigned === 'signed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-200 text-red-700'
                                                        }`}
                                                    >
                                                        {isSigned === 'notSigned' ? 'Not Signed' : isSigned === 'signed' ? 'Signed' : 'Rejected'}
                                                    </span>
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

            {/* Create Contract Modal */}
            {isCreateModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60'>
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

                        <form onSubmit={handleSubmit} className='space-y-3'>
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

            {/* Share Link Modal */}
            {isShareModalOpen && shareLink && (
                <div className='fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60'>
                    <div className='w-full max-w-md rounded-[18px] bg-white px-6 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.4)]'>
                        <div className='mb-3 flex items-center justify-between'>
                            <h2 className='text-lg font-semibold text-slate-900'>Share Contract Link</h2>
                            <button type='button' onClick={handleCloseShareModal} className='text-[20px] leading-none text-gray-400 hover:text-gray-600'>
                                ×
                            </button>
                        </div>

                        <p className='mb-3 text-[13px] text-gray-600'>Please copy this link and send it to the person you want to sign the contract.</p>

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
                        {copyStatus === 'error' && <p className='text-[12px] text-red-700'>Could not copy automatically. Please select and copy manually.</p>}

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

export default ContractsPage;
