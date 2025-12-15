'use client';

import { ArrowLeft, Building2, CheckCircle2, DollarSign, Download, FileText, Plus, Trash2, Upload, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface CustomField {
    id: string;
    label: string;
    value: string;
}

interface InvoiceData {
    invoiceName: string; // ✅ editable (and used as API "name")
    invoiceNumber: string; // ✅ editable
    issueDate: string;
    dueDate: string;

    senderName: string;
    senderContact: string;

    clientName: string; // ✅ for contract "name"
    clientEmail: string; // ✅ for API "email"
    businessName: string; // ✅ for API "businessName"
    recipientContact: string; // address / notes

    items: InvoiceItem[];
    currency: string;
    tax: number;

    customFields: CustomField[];
    terms: string;
    logo: string | null;

    companyInfo: string;
    clientInfo: string;
    description: string;
    paymentInfo: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title: string;
    children: React.ReactNode;
    closable?: boolean; // default true
}

function Modal({ isOpen, onClose, title, children, closable = true }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-fadeIn'>
                <div className='flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50'>
                    <h3 className='text-xl font-bold text-slate-800'>{title}</h3>
                    {closable && onClose && (
                        <button onClick={onClose} className='text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg p-2 transition-all'>
                            <X className='w-5 h-5' />
                        </button>
                    )}
                </div>
                <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>{children}</div>
            </div>
        </div>
    );
}

export default function InvoiceGenerator() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contractId = searchParams.get('contractId');

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const duePlus30 = useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], []);

    const [invoice, setInvoice] = useState<InvoiceData>({
        invoiceName: 'Invoice',
        invoiceNumber: 'INV-0004',
        issueDate: '2025-12-09',
        dueDate: '2026-01-08',

        senderName: 'Your Company Name',
        senderContact: 'Address Line 1\nCity, State ZIP\nemail@company.com',

        clientName: '',
        clientEmail: '',
        businessName: 'Client Company Name',
        recipientContact: 'Client Address\nCity, State ZIP',

        items: [],
        currency: 'USD',
        tax: 0,

        customFields: [],
        terms: '',
        logo: null,

        companyInfo: '',
        clientInfo: '',
        description: '',
        paymentInfo: '',
    });

    const [modalState, setModalState] = useState({
        customField: false,
        companyInfo: false,
        clientInfo: false,
        description: false,
        paymentInfo: false,
        created: false,
    });

    const [tempData, setTempData] = useState({
        fieldLabel: '',
        fieldValue: '',
        companyInfo: '',
        clientInfo: '',
        description: '',
        paymentInfo: '',
    });

    const [isPrefilling, setIsPrefilling] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // ✅ Prefill from contractId
    useEffect(() => {
        if (!contractId) return;

        let cancelled = false;
        (async () => {
            try {
                setIsPrefilling(true);
                const res = await fetch(`/api/v2/contract?id=${encodeURIComponent(contractId)}`, { method: 'GET' });
                if (!res.ok) throw new Error('Failed to fetch contract');
                const data = await res.json();

                if (cancelled) return;
                const c = data?.contract;

                setInvoice((prev) => ({
                    ...prev,
                    invoiceName: c?.contractName ?? prev.invoiceName, // contractName -> Invoice name
                    clientName: c?.name ?? prev.clientName,
                    clientEmail: c?.email ?? prev.clientEmail,
                    businessName: c?.businessName ?? prev.businessName,
                }));
            } catch (e) {
                alert('Failed to load contract info.');
            } finally {
                if (!cancelled) setIsPrefilling(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [contractId]);

    const openModal = (type: keyof typeof modalState) => {
        if (type === 'companyInfo') setTempData((t) => ({ ...t, companyInfo: invoice.companyInfo }));
        if (type === 'clientInfo') setTempData((t) => ({ ...t, clientInfo: invoice.clientInfo }));
        if (type === 'description') setTempData((t) => ({ ...t, description: invoice.description }));
        if (type === 'paymentInfo') setTempData((t) => ({ ...t, paymentInfo: invoice.paymentInfo }));
        setModalState((s) => ({ ...s, [type]: true }));
    };

    const closeModal = (type: keyof typeof modalState) => {
        setModalState((s) => ({ ...s, [type]: false }));
        setTempData({ fieldLabel: '', fieldValue: '', companyInfo: '', clientInfo: '', description: '', paymentInfo: '' });
    };

    const calculateSubtotal = () => invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const calculateTotal = () => calculateSubtotal() + invoice.tax;

    const addItem = () => {
        const newItem: InvoiceItem = { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 };
        setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setInvoice((prev) => ({
            ...prev,
            items: prev.items.map((item) => {
                if (item.id !== id) return item;
                const updated: InvoiceItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') updated.amount = updated.quantity * updated.rate;
                return updated;
            }),
        }));
    };

    const removeItem = (id: string) => setInvoice((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));

    const addCustomField = () => {
        if (tempData.fieldLabel && tempData.fieldValue) {
            const newField: CustomField = { id: Date.now().toString(), label: tempData.fieldLabel, value: tempData.fieldValue };
            setInvoice((prev) => ({ ...prev, customFields: [...prev.customFields, newField] }));
            closeModal('customField');
        }
    };

    const removeCustomField = (id: string) => setInvoice((prev) => ({ ...prev, customFields: prev.customFields.filter((f) => f.id !== id) }));

    const saveCompanyInfo = () => {
        setInvoice((prev) => ({ ...prev, companyInfo: tempData.companyInfo }));
        closeModal('companyInfo');
    };

    const saveClientInfo = () => {
        setInvoice((prev) => ({ ...prev, clientInfo: tempData.clientInfo }));
        closeModal('clientInfo');
    };

    const saveDescription = () => {
        setInvoice((prev) => ({ ...prev, description: tempData.description }));
        closeModal('description');
    };

    const savePaymentInfo = () => {
        setInvoice((prev) => ({ ...prev, paymentInfo: tempData.paymentInfo }));
        closeModal('paymentInfo');
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setInvoice((prev) => ({ ...prev, logo: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const downloadPDF = () => window.print();

    // ✅ Create Invoice (POST /api/v2/invoices)
    const createInvoice = async () => {
        try {
            setIsCreating(true);

            // const authId = String(localStorage.getItem('authId') || '');
            const adminId = String(localStorage.getItem('adminId') || '');

            const payload: any = {
                name: invoice.invoiceName,
                email: invoice.clientEmail,
                businessName: invoice.businessName,
                price: calculateTotal().toFixed(2),
                authId: String(adminId),
            };

            if (contractId) payload.contractId = String(contractId);

            const res = await fetch('/api/v2/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Failed to create invoice');

            // ✅ Uncloseable success modal (no X)
            setModalState((s) => ({ ...s, created: true }));
        } catch (e: any) {
            alert(e?.message || 'Failed to create invoice.');
        } finally {
            setIsCreating(false);
        }
    };

    const deleteInvoice = () => {
        if (confirm('Are you sure you want to clear this invoice?')) {
            setInvoice({
                invoiceName: 'Invoice',
                invoiceNumber: 'INV-0001',
                issueDate: today,
                dueDate: duePlus30,

                senderName: 'Your Company Name',
                senderContact: 'Address Line 1\nCity, State ZIP\nemail@company.com',

                clientName: '',
                clientEmail: '',
                businessName: 'Client Company Name',
                recipientContact: 'Client Address\nCity, State ZIP',

                items: [],
                currency: 'USD',
                tax: 0,

                customFields: [],
                terms: '',
                logo: null,

                companyInfo: '',
                clientInfo: '',
                description: '',
                paymentInfo: '',
            });
        }
    };

    // ✅ Close & go back
    const closeAndGoBack = () => {
        alert('Invoice is not saved.');
        router.push('/admin/dashboard/invoice');
    };

    const goToInvoices = () => router.push('/admin/dashboard/invoice');

    const downloadThenGo = () => {
        window.print();
        // small delay so print dialog opens before route change
        setTimeout(() => router.push('/admin/dashboard/invoice'), 300);
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8'>
            <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>

            {/* ✅ Loading overlay (contract prefill) */}
            {isPrefilling && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-sm text-center'>
                        <div className='w-8 h-8 mx-auto mb-3 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin' />
                        <p className='text-slate-800 font-semibold'>Loading contract…</p>
                        <p className='text-slate-500 text-sm mt-1'>Prefilling invoice details</p>
                    </div>
                </div>
            )}

            {/* ✅ Created modal (uncloseable) */}
            <Modal isOpen={modalState.created} title='Invoice Created' closable={false}>
                <div className='space-y-4'>
                    <div className='flex items-start gap-3'>
                        <CheckCircle2 className='w-6 h-6 text-green-600 mt-0.5' />
                        <div>
                            <p className='text-slate-800 font-bold'>Invoice created successfully!</p>
                            <p className='text-slate-600 text-sm mt-1'>What would you like to do next?</p>
                        </div>
                    </div>

                    <div className='flex gap-3 pt-2'>
                        <button
                            onClick={goToInvoices}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-md'
                        >
                            Back to invoices
                        </button>
                        <button
                            onClick={downloadThenGo}
                            className='flex-1 bg-slate-900 text-white rounded-lg py-3 font-semibold hover:bg-slate-800 transition-all shadow-md'
                        >
                            Download as PDF
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modals */}
            <Modal isOpen={modalState.customField} onClose={() => closeModal('customField')} title='Add Custom Field'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Field Label</label>
                        <input
                            type='text'
                            value={tempData.fieldLabel}
                            onChange={(e) => setTempData((t) => ({ ...t, fieldLabel: e.target.value }))}
                            placeholder='e.g., PO Number, Project ID'
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Field Value</label>
                        <input
                            type='text'
                            value={tempData.fieldValue}
                            onChange={(e) => setTempData((t) => ({ ...t, fieldValue: e.target.value }))}
                            placeholder='Enter the value'
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                        />
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={addCustomField}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Add Field
                        </button>
                        <button
                            onClick={() => closeModal('customField')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={modalState.companyInfo} onClose={() => closeModal('companyInfo')} title='Company Information'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Additional Company Details</label>
                        <textarea
                            value={tempData.companyInfo}
                            onChange={(e) => setTempData((t) => ({ ...t, companyInfo: e.target.value }))}
                            placeholder={'Tax ID: 123-45-6789\nRegistration Number: ABC123\nWebsite: www.company.com'}
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none'
                            rows={5}
                        />
                        <p className='text-xs text-slate-500 mt-2'>Enter additional company information like tax ID, registration number, website, etc.</p>
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={saveCompanyInfo}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Save
                        </button>
                        <button
                            onClick={() => closeModal('companyInfo')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={modalState.clientInfo} onClose={() => closeModal('clientInfo')} title='Client Information'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Additional Client Details</label>
                        <textarea
                            value={tempData.clientInfo}
                            onChange={(e) => setTempData((t) => ({ ...t, clientInfo: e.target.value }))}
                            placeholder={'Contact Person: John Doe\nPhone: +1 234 567 8900\nAccount Number: ACC-12345'}
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none'
                            rows={5}
                        />
                        <p className='text-xs text-slate-500 mt-2'>
                            Enter additional client information like contact person, phone number, account details, etc.
                        </p>
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={saveClientInfo}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Save
                        </button>
                        <button
                            onClick={() => closeModal('clientInfo')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={modalState.description} onClose={() => closeModal('description')} title='Invoice Description'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Description / Notes</label>
                        <textarea
                            value={tempData.description}
                            onChange={(e) => setTempData((t) => ({ ...t, description: e.target.value }))}
                            placeholder='This invoice is for professional services rendered during the month of December 2025...'
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none'
                            rows={6}
                        />
                        <p className='text-xs text-slate-500 mt-2'>Add a description or note about this invoice that will appear prominently at the top.</p>
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={saveDescription}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Save
                        </button>
                        <button
                            onClick={() => closeModal('description')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={modalState.paymentInfo} onClose={() => closeModal('paymentInfo')} title='Payment Information'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Payment Instructions</label>
                        <textarea
                            value={tempData.paymentInfo}
                            onChange={(e) => setTempData((t) => ({ ...t, paymentInfo: e.target.value }))}
                            placeholder={
                                'Bank Name: ABC Bank\nAccount Number: 1234567890\nSWIFT Code: ABCDEF12\nPayment Methods: Bank Transfer, PayPal, Credit Card'
                            }
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none'
                            rows={6}
                        />
                        <p className='text-xs text-slate-500 mt-2'>Enter bank details, payment methods, or any payment-related instructions.</p>
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={savePaymentInfo}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Save
                        </button>
                        <button
                            onClick={() => closeModal('paymentInfo')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6'>
                {/* Main Invoice Section */}
                <div id='invoice-print' className='lg:col-span-3 bg-white rounded-xl shadow-lg p-6 md:p-10 border border-slate-200'>
                    {/* ✅ Header (reduced vertical spacing) */}
                    <div className='flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-200'>
                        <div className='flex items-center gap-4'>
                            <label className='cursor-pointer no-print'>
                                <div className='w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all'>
                                    {invoice.logo ? (
                                        <Image width={100} height={100} src={invoice.logo} alt='Logo' className='w-full h-full object-contain rounded-lg' />
                                    ) : (
                                        <div className='text-center'>
                                            <Upload className='w-6 h-6 mx-auto text-slate-400 mb-1' />
                                            <span className='text-xs text-slate-500'>Logo</span>
                                        </div>
                                    )}
                                </div>
                                <input type='file' accept='image/*' onChange={handleLogoUpload} className='hidden' />
                            </label>
                        </div>

                        <div className='text-right'>
                            <h1 className='text-3xl font-bold text-slate-800 mb-2 tracking-tight'>INVOICE</h1>

                            {/* ✅ Editable invoice name */}
                            <input
                                type='text'
                                value={invoice.invoiceName}
                                onChange={(e) => setInvoice((p) => ({ ...p, invoiceName: e.target.value }))}
                                placeholder='Invoice name'
                                className='text-right text-lg font-semibold text-slate-700 border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none transition-colors px-2 bg-transparent w-full'
                            />

                            {/* ✅ Editable invoice number */}
                            <input
                                type='text'
                                value={invoice.invoiceNumber}
                                onChange={(e) => setInvoice((p) => ({ ...p, invoiceNumber: e.target.value }))}
                                className='text-right text-base font-semibold text-slate-600 border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none transition-colors px-2 bg-transparent mt-1'
                            />
                        </div>
                    </div>

                    {/* Invoice Description */}
                    {invoice.description && (
                        <div className='mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 shadow-sm'>
                            <div className='flex items-start gap-3'>
                                <FileText className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                                <div>
                                    <h3 className='font-bold text-slate-800 mb-2'>Invoice Description</h3>
                                    <p className='text-slate-700 text-sm leading-relaxed whitespace-pre-wrap'>{invoice.description}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ✅ Dates and Custom Fields (reduced spacing) */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-7'>
                        <div className='space-y-3'>
                            <div className='flex items-center gap-3 bg-slate-50 p-3 rounded-lg'>
                                <label className='text-slate-700 font-semibold w-28'>Issue Date:</label>
                                <input
                                    type='date'
                                    value={invoice.issueDate}
                                    onChange={(e) => setInvoice((p) => ({ ...p, issueDate: e.target.value }))}
                                    className='border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 bg-white'
                                />
                            </div>
                            <div className='flex items-center gap-3 bg-slate-50 p-3 rounded-lg'>
                                <label className='text-slate-700 font-semibold w-28'>Due Date:</label>
                                <input
                                    type='date'
                                    value={invoice.dueDate}
                                    onChange={(e) => setInvoice((p) => ({ ...p, dueDate: e.target.value }))}
                                    className='border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 bg-white'
                                />
                            </div>
                        </div>

                        <div className='space-y-3'>
                            {invoice.customFields.map((field) => (
                                <div key={field.id} className='flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200 group'>
                                    <label className='text-slate-700 font-semibold w-28'>{field.label}:</label>
                                    <span className='flex-1 text-slate-700'>{field.value}</span>
                                    <button
                                        onClick={() => removeCustomField(field.id)}
                                        className='no-print text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1.5 transition-all opacity-0 group-hover:opacity-100'
                                    >
                                        <X className='w-4 h-4' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* From/To Section */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-10'>
                        <div className='bg-slate-50 p-6 rounded-xl border border-slate-200'>
                            <div className='flex items-center gap-3 mb-4 pb-3 border-b-2 border-slate-300'>
                                <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
                                    <Building2 className='w-5 h-5 text-white' />
                                </div>
                                <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wider'>From</h3>
                            </div>

                            <input
                                type='text'
                                value={invoice.senderName}
                                onChange={(e) => setInvoice((p) => ({ ...p, senderName: e.target.value }))}
                                className='font-bold text-lg text-slate-800 mb-2 w-full border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                placeholder='Your Company Name'
                            />
                            <textarea
                                value={invoice.senderContact}
                                onChange={(e) => setInvoice((p) => ({ ...p, senderContact: e.target.value }))}
                                className='text-sm text-slate-600 w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none resize-none bg-transparent leading-relaxed'
                                placeholder='Your contact details'
                                rows={3}
                            />

                            {invoice.companyInfo && (
                                <div className='mt-4 pt-4 border-t border-slate-200'>
                                    <p className='text-xs text-slate-500 font-semibold mb-2'>ADDITIONAL INFO</p>
                                    <p className='text-sm text-slate-600 leading-relaxed whitespace-pre-wrap'>{invoice.companyInfo}</p>
                                </div>
                            )}
                        </div>

                        <div className='bg-slate-50 p-6 rounded-xl border border-slate-200'>
                            <div className='flex items-center gap-3 mb-4 pb-3 border-b-2 border-slate-300'>
                                <div className='w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center'>
                                    <User className='w-5 h-5 text-white' />
                                </div>
                                <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wider'>Bill To</h3>
                            </div>

                            {/* ✅ contract "name" */}
                            <input
                                type='text'
                                value={invoice.clientName}
                                onChange={(e) => setInvoice((p) => ({ ...p, clientName: e.target.value }))}
                                className='font-semibold text-base text-slate-800 mb-2 w-full border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                placeholder='Client Name'
                            />

                            {/* ✅ contract "businessName" */}
                            <input
                                type='text'
                                value={invoice.businessName}
                                onChange={(e) => setInvoice((p) => ({ ...p, businessName: e.target.value }))}
                                className='font-bold text-lg text-slate-800 mb-2 w-full border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                placeholder='Client Business Name'
                            />

                            {/* ✅ contract "email" */}
                            <input
                                type='email'
                                value={invoice.clientEmail}
                                onChange={(e) => setInvoice((p) => ({ ...p, clientEmail: e.target.value }))}
                                className='text-sm text-slate-700 w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent mb-2'
                                placeholder='client@email.com'
                            />

                            <textarea
                                value={invoice.recipientContact}
                                onChange={(e) => setInvoice((p) => ({ ...p, recipientContact: e.target.value }))}
                                className='text-sm text-slate-600 w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none resize-none bg-transparent leading-relaxed'
                                placeholder='Client address / details'
                                rows={3}
                            />

                            {invoice.clientInfo && (
                                <div className='mt-4 pt-4 border-t border-slate-200'>
                                    <p className='text-xs text-slate-500 font-semibold mb-2'>ADDITIONAL INFO</p>
                                    <p className='text-sm text-slate-600 leading-relaxed whitespace-pre-wrap'>{invoice.clientInfo}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className='mb-8'>
                        {invoice.items.length > 0 && (
                            <div className='mb-4 overflow-x-auto'>
                                <div className='min-w-full bg-slate-50 rounded-lg p-4'>
                                    <div className='grid grid-cols-12 gap-3 text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 pb-3 border-b-2 border-slate-300'>
                                        <div className='col-span-5'>Description</div>
                                        <div className='col-span-2 text-center'>Qty</div>
                                        <div className='col-span-2 text-right'>Rate</div>
                                        <div className='col-span-2 text-right'>Amount</div>
                                        <div className='col-span-1' />
                                    </div>

                                    {invoice.items.map((item) => (
                                        <div key={item.id} className='grid grid-cols-12 gap-3 mb-3 items-center bg-white rounded-lg p-3 shadow-sm'>
                                            <input
                                                type='text'
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                className='col-span-5 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                                                placeholder='Item description'
                                            />
                                            <input
                                                type='number'
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                className='col-span-2 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm'
                                                min='0'
                                            />
                                            <input
                                                type='number'
                                                value={item.rate}
                                                onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                className='col-span-2 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm'
                                                min='0'
                                                step='0.01'
                                            />
                                            <div className='col-span-2 px-3 py-2 text-slate-800 font-bold text-right text-sm'>
                                                {invoice.currency} {item.amount.toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className='col-span-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-2 transition-all no-print'
                                            >
                                                <Trash2 className='w-4 h-4' />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={addItem}
                            className='w-full border-2 border-dashed border-slate-300 rounded-lg py-5 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-semibold no-print'
                        >
                            <Plus className='w-5 h-5' />
                            Add Invoice Item
                        </button>
                    </div>

                    {/* Summary */}
                    <div className='flex justify-end mb-10'>
                        <div className='w-full md:w-96'>
                            <div className='bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 shadow-md border border-slate-200'>
                                <div className='flex items-center justify-between mb-5 pb-3 border-b border-slate-300'>
                                    <h3 className='font-bold text-slate-800 text-lg'>Summary</h3>
                                    <select
                                        value={invoice.currency}
                                        onChange={(e) => setInvoice((p) => ({ ...p, currency: e.target.value }))}
                                        className='border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-semibold'
                                    >
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>GBP</option>
                                        <option>PKR</option>
                                    </select>
                                </div>

                                <div className='space-y-4'>
                                    <div className='flex justify-between text-slate-700'>
                                        <span className='font-medium'>Subtotal</span>
                                        <span className='font-bold'>
                                            {invoice.currency} {calculateSubtotal().toFixed(2)}
                                        </span>
                                    </div>

                                    <div className='flex justify-between text-slate-700'>
                                        <span className='font-medium'>Tax</span>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm text-slate-500'>{invoice.currency}</span>
                                            <input
                                                type='number'
                                                value={invoice.tax}
                                                onChange={(e) => setInvoice((p) => ({ ...p, tax: parseFloat(e.target.value) || 0 }))}
                                                className='w-24 text-right font-bold border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                                min='0'
                                                step='0.01'
                                                placeholder='0.00'
                                            />
                                        </div>
                                    </div>

                                    <div className='flex justify-between text-slate-900 font-bold text-xl pt-4 border-t-2 border-slate-400'>
                                        <span>Total</span>
                                        <span className='text-blue-600'>
                                            {invoice.currency} {calculateTotal().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {invoice.paymentInfo && (
                        <div className='mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500 shadow-sm'>
                            <div className='flex items-start gap-3'>
                                <DollarSign className='w-6 h-6 text-green-600 flex-shrink-0 mt-0.5' />
                                <div className='flex-1'>
                                    <h3 className='font-bold text-slate-800 mb-3 text-lg'>Payment Information</h3>
                                    <p className='text-slate-700 text-sm whitespace-pre-wrap leading-relaxed'>{invoice.paymentInfo}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Terms */}
                    {invoice.terms && (
                        <div className='mb-4 p-6 bg-slate-50 rounded-xl border border-slate-200'>
                            <h3 className='font-bold text-slate-800 mb-3 flex items-center gap-2'>
                                <FileText className='w-5 h-5' />
                                Terms & Conditions
                            </h3>
                            <p className='text-slate-700 text-sm whitespace-pre-wrap leading-relaxed'>{invoice.terms}</p>
                        </div>
                    )}

                    <textarea
                        value={invoice.terms}
                        onChange={(e) => setInvoice((p) => ({ ...p, terms: e.target.value }))}
                        className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none no-print text-sm'
                        placeholder='Enter terms and conditions...'
                        rows={3}
                    />
                </div>

                {/* Sidebar */}
                <div className='lg:col-span-1 no-print'>
                    <div className='bg-white rounded-xl shadow-lg p-5 space-y-3 sticky top-4 border border-slate-200'>
                        <h2 className='font-bold text-slate-800 text-lg mb-4 pb-3 border-b border-slate-200'>Invoice Actions</h2>

                        <button
                            onClick={() => openModal('customField')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <FileText className='w-4 h-4' />
                            Add Custom Field
                        </button>

                        <button
                            onClick={() => openModal('companyInfo')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <Building2 className='w-4 h-4' />
                            {invoice.companyInfo ? 'Edit' : 'Add'} Company Info
                        </button>

                        <button
                            onClick={() => openModal('clientInfo')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <User className='w-4 h-4' />
                            {invoice.clientInfo ? 'Edit' : 'Add'} Client Info
                        </button>

                        <button
                            onClick={() => openModal('description')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <FileText className='w-4 h-4' />
                            {invoice.description ? 'Edit' : 'Add'} Description
                        </button>

                        <button
                            onClick={() => openModal('paymentInfo')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <DollarSign className='w-4 h-4' />
                            {invoice.paymentInfo ? 'Edit' : 'Add'} Payment Info
                        </button>

                        <div className='pt-4 space-y-3 border-t border-slate-200'>
                            {/* ✅ Save -> Create Invoice */}
                            <button
                                onClick={createInvoice}
                                disabled={isCreating}
                                className='w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'
                            >
                                {isCreating ? 'Creating…' : 'Create Invoice'}
                            </button>

                            <button
                                onClick={downloadPDF}
                                className='w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg'
                            >
                                <Download className='w-4 h-4' />
                                Download / Print
                            </button>

                            <button
                                onClick={deleteInvoice}
                                className='w-full flex items-center justify-center gap-2 bg-red-600 text-white rounded-lg py-3 hover:bg-red-700 transition-all font-semibold shadow-md hover:shadow-lg'
                            >
                                <Trash2 className='w-4 h-4' />
                                Clear Invoice
                            </button>

                            {/* ✅ NEW: Close & Go back */}
                            <button
                                onClick={closeAndGoBack}
                                className='w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-lg py-3 hover:bg-slate-800 transition-all font-semibold shadow-md hover:shadow-lg'
                            >
                                <ArrowLeft className='w-4 h-4' />
                                Close &amp; Go back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
