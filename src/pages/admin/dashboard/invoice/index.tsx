// pages/dashboard/invoices.tsx
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

type Contract = {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    contractName: string | null;
    email: string;
    businessName: string;
    pdf: string;
    signed: boolean;
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

const InvoicesPage: NextPage = () => {
    const router = useRouter();

    // Contracts state
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(false);
    const [contractsError, setContractsError] = useState<string | null>(null);

    // Invoices state
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [invoicesError, setInvoicesError] = useState<string | null>(null);

    // Fetch signed contracts from /api/v2/contract?authId=${adminId}
    const fetchContracts = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const adminId = window.localStorage.getItem('adminId');
        if (!adminId) {
            setContractsError('Admin ID not found in localStorage.');
            return;
        }

        setIsLoadingContracts(true);
        setContractsError(null);
        try {
            const res = await fetch(`/api/v2/contract?authId=${encodeURIComponent(adminId)}`);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to load contracts.');
            }

            const data = (await res.json()) as ContractsResponse;
            // Filter only signed contracts
            const signedContracts = (data.contracts || []).filter((c) => c.signed === 'signed');
            setContracts(signedContracts);
        } catch (err) {
            setContractsError(err instanceof Error ? err.message : 'Something went wrong while loading contracts.');
            setContracts([]);
        } finally {
            setIsLoadingContracts(false);
        }
    }, []);

    // Fetch invoices from /api/v2/invoices?authId=${adminId}
    const fetchInvoices = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const adminId = window.localStorage.getItem('adminId');
        if (!adminId) {
            setInvoicesError('Admin ID not found in localStorage.');
            return;
        }

        setIsLoadingInvoices(true);
        setInvoicesError(null);
        try {
            const res = await fetch(`/api/v2/invoices?authId=${encodeURIComponent(adminId)}`);

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

    // Check if an invoice exists for a contract
    const hasInvoice = (contractId: number): boolean => {
        return invoices.some((inv) => inv.contractId === contractId);
    };

    const handleCreateInvoice = () => {
        router.push('/admin/dashboard/invoice/create');
    };

    const handleCreateInvoiceForContract = (contractId: number) => {
        // Navigate to create invoice page with contract ID
        router.push(`/admin/dashboard/invoice/create?contractId=${contractId}`);
    };

    const totalInvoices = invoices.length;
    const totalSignedContracts = contracts.length;

    return (
        <div className='min-h-screen p-[7px]'>
            <div className='mx-auto max-w-7xl'>
                {/* Header */}
                <header className='mb-6 flex items-center justify-between gap-4'>
                    <div>
                        <h1 className='mb-1 text-[28px] font-semibold text-slate-900'>Invoices</h1>
                        <p className='text-sm text-gray-500'>Manage all your invoices and signed contracts in one place.</p>
                    </div>
                    <button
                        type='button'
                        onClick={handleCreateInvoice}
                        className='inline-flex cursor-pointer items-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] px-[18px] py-[10px] text-sm font-medium text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.45)] transition-shadow'
                    >
                        <span className='text-[18px] leading-none'>＋</span>
                        <span>Create Invoice</span>
                    </button>
                </header>

                {/* Overview stats */}
                <section className='mb-6 grid gap-4 sm:grid-cols-2'>
                    <div className='rounded-[16px] border border-gray-200 bg-white px-[18px] py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
                        <div className='text-[12px] uppercase text-gray-500'>Total Invoices</div>
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
                        <h2 className='text-lg font-semibold text-slate-900'>All Invoices</h2>
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
                                            <th key={header} className='border-b border-gray-200 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-600'>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice, index) => {
                                        const displayName = invoice.name && invoice.name.trim().length > 0 ? invoice.name : '—';
                                        const displayBusinessName = invoice.businessName && invoice.businessName.trim().length > 0 ? invoice.businessName : '—';
                                        const displayContractName =
                                            invoice.Contract?.contractName && invoice.Contract.contractName.trim().length > 0
                                                ? invoice.Contract.contractName
                                                : '—';
                                        const displayPrice = invoice.price ? `$${parseFloat(invoice.price).toFixed(2)}` : '—';

                                        return (
                                            <tr key={invoice.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{index + 1}</td>
                                                <td className='px-3 py-2.5 text-[13px] font-medium text-slate-900'>{displayName}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-slate-900'>{invoice.email || '—'}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayBusinessName}</td>
                                                <td className='px-3 py-2.5 text-[13px] font-semibold text-green-700'>{displayPrice}</td>
                                                <td className='px-3 py-2.5 text-[13px] text-gray-600'>{displayContractName}</td>
                                                <td className='whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-600'>{formatDateTime(invoice.createdAt)}</td>
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
                        <div className='mt-2 overflow-hidden rounded-xl border border-gray-200'>
                            <table className='w-full border-collapse text-[13px]'>
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
                                        const displayContractName =
                                            contract.contractName && contract.contractName.trim().length > 0 ? contract.contractName : '—';
                                        const displayName = contract.name && contract.name.trim().length > 0 ? contract.name : '—';
                                        const displayBusinessName =
                                            contract.businessName && contract.businessName.trim().length > 0 ? contract.businessName : '—';
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
                                                            className='cursor-pointer inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-blue-700 transition-colors'
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
        </div>
    );
};

export default InvoicesPage;
