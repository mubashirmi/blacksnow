import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type ContractStatus = boolean | 'notSigned' | 'signed' | 'rejected';

type Invoice = {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string | null;
    email: string;
    businessName: string | null;
    contractName: string | null;
    pdf: string;
    signed: ContractStatus;
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

const isContractSigned = (status: ContractStatus): boolean => status === true || status === 'signed';

const isContractUnsigned = (status: ContractStatus): boolean => status === false || status === 'notSigned';

const getContractShareLink = (contractId: number): string => `https://www.blacksnowholdings.com/contractsignature?id=${contractId}`;

const getPdfFileName = (contractName: string | null, contractId: number): string => {
    const safeName = (contractName || `contract-${contractId}`)
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .replace(/\s+/g, '-');

    return `${safeName || `contract-${contractId}`}.pdf`;
};

type CreateContractMode = 'choose' | 'upload';

type ContractFilter = 'all' | 'pending' | 'signed';

const ContractsPage: NextPage = () => {
    const router = useRouter();

    // Auth
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Create-contract modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [contractName, setContractName] = useState('');
    const [email, setEmail] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [createMode, setCreateMode] = useState<CreateContractMode>('choose');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Invoices table
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [invoicesError, setInvoicesError] = useState<string | null>(null);
    const [contractFilter, setContractFilter] = useState<ContractFilter>('all');
    const [contractSearch, setContractSearch] = useState('');
    const [downloadingContractId, setDownloadingContractId] = useState<number | null>(null);
    const [pdfDownloadError, setPdfDownloadError] = useState<string | null>(null);

    // Share-link modal
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // ✅ Auth guard:
    // 1) userId must exist -> else /login
    // 2) roles must exist and include "InvoiceTool" -> else /pricing
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
                // Fallback for non-JSON values (e.g. "a,b,c")
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

    // Fetch invoices from /api/v2/contract?authId=${userId}
    const fetchInvoices = useCallback(async () => {
        if (typeof window === 'undefined') return;
        if (!isAuthChecked || !userId) return;

        setIsLoadingInvoices(true);
        try {
            const res = await fetch(`/api/v2/contract?authId=${encodeURIComponent(userId)}`);

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
    }, [isAuthChecked, userId]);

    useEffect(() => {
        if (!isAuthChecked || !userId) return;
        // eslint-disable-next-line
        void fetchInvoices();
    }, [fetchInvoices, isAuthChecked, userId]);

    const handleOpenCreateModal = () => {
        setFormError(null);
        setContractName('');
        setEmail('');
        setPdfFile(null);
        setCreateMode('choose');
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        if (isSubmitting) return;
        setIsCreateModalOpen(false);
        setCreateMode('choose');
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

    const handleOpenShareModal = (contractId: number) => {
        setShareLink(getContractShareLink(contractId));
        setCopyStatus('idle');
        setIsShareModalOpen(true);
    };

    const handleDownloadPdf = async (invoice: Invoice) => {
        if (!invoice.pdf || downloadingContractId !== null) return;

        setPdfDownloadError(null);
        setDownloadingContractId(invoice.id);

        try {
            const response = await fetch(invoice.pdf);
            if (!response.ok) {
                throw new Error('Failed to download the PDF.');
            }

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');

            downloadLink.href = objectUrl;
            downloadLink.download = getPdfFileName(invoice.contractName, invoice.id);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            window.URL.revokeObjectURL(objectUrl);
        } catch {
            setPdfDownloadError('The PDF could not be downloaded automatically. It has been opened in a new tab instead.');

            const fallbackLink = document.createElement('a');
            fallbackLink.href = invoice.pdf;
            fallbackLink.target = '_blank';
            fallbackLink.rel = 'noopener noreferrer';
            document.body.appendChild(fallbackLink);
            fallbackLink.click();
            fallbackLink.remove();
        } finally {
            setDownloadingContractId(null);
        }
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

        if (createMode !== 'upload') {
            setFormError('Choose Upload PDF, or open the professional editor to design a contract.');
            return;
        }

        if (!pdfFile) {
            setFormError('Please upload a PDF file.');
            return;
        }

        if (!isAuthChecked || !userId) {
            setFormError('Unauthorized.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Create FormData to send the PDF file directly
            const formData = new FormData();
            formData.append('contractName', contractName);
            formData.append('email', email);
            formData.append('authId', userId); // ✅ userId
            formData.append('pdf', pdfFile);

            const res = await fetch(`/api/v2/contract?authId=${encodeURIComponent(userId)}`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to create contract.');
            }

            const data = (await res.json()) as CreateInvoiceResponse;

            const contractId = (data.contract as any)?.id ?? (typeof data.id === 'number' ? data.id : undefined);

            if (!contractId) {
                throw new Error('Contract id not returned from API.');
            }

            setContractName('');
            setEmail('');
            setPdfFile(null);
            setCreateMode('choose');
            setIsCreateModalOpen(false);
            // eslint-disable-next-line
            void fetchInvoices();

            handleOpenShareModal(contractId);
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
    const signedCount = invoices.filter((invoice) => isContractSigned(invoice.signed)).length;
    const unsignedCount = invoices.filter((invoice) => isContractUnsigned(invoice.signed)).length;
    const signedInvoices = useMemo(() => invoices.filter((invoice) => isContractSigned(invoice.signed)), [invoices]);

    const filteredInvoices = useMemo(() => {
        const normalizedSearch = contractSearch.trim().toLowerCase();

        return invoices.filter((invoice) => {
            const matchesStatus =
                contractFilter === 'all' ||
                (contractFilter === 'pending' && isContractUnsigned(invoice.signed)) ||
                (contractFilter === 'signed' && isContractSigned(invoice.signed));

            if (!matchesStatus) return false;
            if (!normalizedSearch) return true;

            return [invoice.contractName, invoice.email, invoice.name, invoice.businessName, String(invoice.id)]
                .filter((value): value is string => typeof value === 'string')
                .some((value) => value.toLowerCase().includes(normalizedSearch));
        });
    }, [contractFilter, contractSearch, invoices]);

    // Optional: prevent UI flash before auth check finishes
    if (!isAuthChecked) {
        return <div className='min-h-screen p-[7px] text-sm text-gray-500'>Checking access…</div>;
    }

    return (
        <div className='min-h-screen p-[7px]'>
            <div className='mx-auto max-w-6xl'>
                {/* Header */}
                <header className='mb-6 flex items-center justify-between gap-4'>
                    <div>
                        <h1 className='mb-1 text-[28px] font-semibold text-slate-900'>Contracts</h1>
                        <p className='text-sm text-gray-500'>Create contracts, send them for signing, and track their status in one place.</p>
                    </div>

                    <div className='flex items-center gap-3'>
                        {/* ✅ Invoices button */}
                        <button
                            type='button'
                            // eslint-disable-next-line
                            onClick={() => void router.push('/invoicecontractdashboard/invoice')}
                            className='inline-flex items-center gap-2 rounded-[13px] border border-gray-300 bg-white px-[16px] py-[10px] text-sm font-medium text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:bg-gray-50'
                        >
                            Invoices
                        </button>

                        <button
                            type='button'
                            onClick={handleOpenCreateModal}
                            className='inline-flex items-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] px-[18px] py-[10px] text-sm font-medium text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)]'
                        >
                            <span className='text-[18px] leading-none'>＋</span>
                            <span>Start a Contract</span>
                        </button>
                    </div>
                </header>

                {/* Overview stats */}
                <section className='mb-6 grid gap-4 sm:grid-cols-3'>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Pending Signature</div>
                        <div className='mt-1 text-[22px] font-semibold text-amber-700'>{unsignedCount}</div>
                    </div>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Signed</div>
                        <div className='mt-1 text-[22px] font-semibold text-green-700'>{signedCount}</div>
                    </div>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Total Contracts</div>
                        <div className='mt-1 text-[22px] font-semibold text-slate-900'>{totalInvoices}</div>
                    </div>
                </section>

                {/* Signed Contracts Table */}
                <section className='mb-6 rounded-[16px] border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                    <div className='mb-3 flex items-center justify-between gap-2'>
                        <h2 className='text-lg font-semibold text-slate-900'>Signed Contracts</h2>
                    </div>

                    {isLoadingInvoices && <p className='text-sm text-gray-500'>Loading signed contracts…</p>}

                    {invoicesError && <p className='text-[13px] text-red-700'>{invoicesError}</p>}

                    {!isLoadingInvoices && !invoicesError && signedInvoices.length === 0 && (
                        <p className='text-sm text-gray-500'>No signed contracts found yet.</p>
                    )}

                    {!isLoadingInvoices && !invoicesError && signedInvoices.length > 0 && (
                        <div className='mt-2 overflow-x-auto rounded-xl border border-gray-200'>
                            <table className='min-w-[1000px] w-full border-collapse text-[13px]'>
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
                                    {signedInvoices.map((invoice, index) => {
                                        const displayContractName = invoice.contractName && invoice.contractName.trim().length > 0 ? invoice.contractName : '—';
                                        const displayName = invoice.name && invoice.name.trim().length > 0 ? invoice.name : '—';
                                        const displayBusinessName = invoice.businessName && invoice.businessName.trim().length > 0 ? invoice.businessName : '—';
                                        const isDownloading = downloadingContractId === invoice.id;

                                        return (
                                            <tr key={invoice.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{index + 1}</td>
                                                <td className='px-3 py-2.5 text-[13px] font-medium text-slate-900'>{displayContractName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{invoice.email}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayBusinessName}</td>
                                                <td className='whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-600'>{formatDateTime(invoice.createdAt)}</td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <div className='flex items-center gap-3 whitespace-nowrap'>
                                                        <a
                                                            href={invoice.pdf}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='text-[13px] text-blue-600 no-underline hover:underline'
                                                        >
                                                            View
                                                        </a>
                                                        <button
                                                            type='button'
                                                            // eslint-disable-next-line
                                                            onClick={() => void handleDownloadPdf(invoice)}
                                                            disabled={downloadingContractId !== null}
                                                            className='border-0 bg-transparent p-0 text-[13px] text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400'
                                                        >
                                                            {isDownloading ? 'Downloading…' : 'Download'}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[12px] font-medium text-green-800'>
                                                        Signed
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

                {/* All Contracts Table */}
                <section className='rounded-[16px] border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'>
                    <div className='mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <h2 className='text-lg font-semibold text-slate-900'>All Contracts</h2>
                        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
                            <select
                                value={contractFilter}
                                onChange={(event) => setContractFilter(event.target.value as ContractFilter)}
                                className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                aria-label='Filter contracts by status'
                            >
                                <option value='all'>All Contracts</option>
                                <option value='pending'>Pending</option>
                                <option value='signed'>Signed</option>
                            </select>
                            <input
                                type='search'
                                value={contractSearch}
                                onChange={(event) => setContractSearch(event.target.value)}
                                placeholder='Search contracts...'
                                className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64'
                                aria-label='Search contracts'
                            />
                        </div>
                    </div>

                    {isLoadingInvoices && <p className='text-sm text-gray-500'>Loading invoices…</p>}

                    {invoicesError && <p className='text-[13px] text-red-700'>{invoicesError}</p>}

                    {pdfDownloadError && <p className='mb-2 text-[13px] text-amber-700'>{pdfDownloadError}</p>}

                    {!isLoadingInvoices && !invoicesError && invoices.length === 0 && (
                        <p className='text-sm text-gray-500'>No contracts found yet. Create your first contract to see it here.</p>
                    )}

                    {!isLoadingInvoices && !invoicesError && invoices.length > 0 && filteredInvoices.length === 0 && (
                        <p className='text-sm text-gray-500'>No contracts match the selected filter or search.</p>
                    )}

                    {!isLoadingInvoices && filteredInvoices.length > 0 && (
                        <div className='mt-2 overflow-x-auto rounded-xl border border-gray-200'>
                            <table className='min-w-[1120px] w-full border-collapse text-[13px]'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        {['Sr #', 'Contract Name', 'Email', 'Name', 'Business Name', 'Created At', 'PDF', 'Share Link', 'Status'].map(
                                            (header) => (
                                                <th
                                                    key={header}
                                                    className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'
                                                >
                                                    {header}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((invoice, index) => {
                                        const displayContractName = invoice.contractName && invoice.contractName.trim().length > 0 ? invoice.contractName : '—';
                                        const displayName = invoice.name && invoice.name.trim().length > 0 ? invoice.name : '—';
                                        const displayBusinessName = invoice.businessName && invoice.businessName.trim().length > 0 ? invoice.businessName : '—';
                                        const contractIsSigned = isContractSigned(invoice.signed);
                                        const contractIsUnsigned = isContractUnsigned(invoice.signed);
                                        const isDownloading = downloadingContractId === invoice.id;

                                        return (
                                            <tr key={invoice.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{index + 1}</td>
                                                <td className='px-3 py-2.5 text-[13px] font-medium text-slate-900'>{displayContractName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{invoice.email}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayBusinessName}</td>
                                                <td className='whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-600'>{formatDateTime(invoice.createdAt)}</td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <div className='flex items-center gap-3 whitespace-nowrap'>
                                                        <a
                                                            href={invoice.pdf}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='text-[13px] text-blue-600 no-underline hover:underline'
                                                        >
                                                            View
                                                        </a>
                                                        <button
                                                            type='button'
                                                            // eslint-disable-next-line
                                                            onClick={() => void handleDownloadPdf(invoice)}
                                                            disabled={downloadingContractId !== null}
                                                            className='border-0 bg-transparent p-0 text-[13px] text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400'
                                                        >
                                                            {isDownloading ? 'Downloading…' : 'Download'}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    {contractIsUnsigned ? (
                                                        <button
                                                            type='button'
                                                            onClick={() => handleOpenShareModal(invoice.id)}
                                                            className='whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-black'
                                                        >
                                                            Share Link
                                                        </button>
                                                    ) : (
                                                        <span className='text-gray-400'>—</span>
                                                    )}
                                                </td>
                                                <td className='px-3 py-2.5 text-[13px]'>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                                                            contractIsUnsigned
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : contractIsSigned
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-200 text-red-700'
                                                        }`}
                                                    >
                                                        {contractIsUnsigned ? 'Not Signed' : contractIsSigned ? 'Signed' : 'Rejected'}
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
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-3 py-6'>
                    <div className='w-full max-w-xl rounded-[18px] bg-white px-6 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.4)]'>
                        <div className='mb-4 flex items-start justify-between gap-4'>
                            <div>
                                <h2 className='text-lg font-semibold text-slate-900'>
                                    {createMode === 'choose' ? 'How would you like to create the contract?' : 'Upload a Contract'}
                                </h2>
                                <p className='mt-1 text-[13px] text-gray-500'>
                                    {createMode === 'choose'
                                        ? 'Upload a finished PDF, or build one from scratch in the professional contract studio.'
                                        : 'Enter the contract details and upload the finished PDF.'}
                                </p>
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

                        {createMode === 'choose' ? (
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <button
                                    type='button'
                                    onClick={() => setCreateMode('upload')}
                                    className='group rounded-[16px] border border-gray-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50/50'
                                >
                                    <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-700'>↑</div>
                                    <div className='text-base font-semibold text-slate-900'>Upload PDF</div>
                                    <p className='mt-1 text-[13px] leading-5 text-gray-500'>Use a contract PDF that is already complete.</p>
                                    <div className='mt-4 text-[13px] font-medium text-blue-700 group-hover:underline'>Choose a file →</div>
                                </button>

                                <button
                                    type='button'
                                    // eslint-disable-next-line
                                    onClick={() => void router.push('/invoicecontractdashboard/editor')}
                                    className='group rounded-[16px] border border-gray-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50/50'
                                >
                                    <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-xl text-white'>✦</div>
                                    <div className='text-base font-semibold text-slate-900'>Professional Editor</div>
                                    <p className='mt-1 text-[13px] leading-5 text-gray-500'>
                                        Create a polished multi-page PDF with drag-and-drop layout, typography, images, tables, signature blocks and reusable
                                        clauses.
                                    </p>
                                    <div className='mt-4 text-[13px] font-medium text-blue-700 group-hover:underline'>Open contract studio →</div>
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className='space-y-3'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setFormError(null);
                                        setPdfFile(null);
                                        setCreateMode('choose');
                                    }}
                                    disabled={isSubmitting}
                                    className='text-[13px] font-medium text-blue-700 hover:underline disabled:cursor-not-allowed'
                                >
                                    ← Back to options
                                </button>

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
                                        placeholder='e.g., Service Agreement 2026'
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

                                <div className='rounded-[14px] border border-dashed border-gray-300 bg-gray-50 p-4'>
                                    <label htmlFor='pdf' className='mb-2 block text-[13px] font-medium text-slate-700'>
                                        Contract PDF
                                    </label>
                                    <input
                                        id='pdf'
                                        type='file'
                                        accept='application/pdf'
                                        onChange={handleFileChange}
                                        className='block w-full text-[13px] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-blue-700 hover:file:bg-blue-100'
                                    />
                                    {pdfFile && <p className='mt-2 text-[12px] text-gray-500'>Selected: {pdfFile.name}</p>}
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
                        )}
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
