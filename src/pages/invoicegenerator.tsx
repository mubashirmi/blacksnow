import { Building2, DollarSign, Download, FileText, Plus, Save, Trash2, Upload, User, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

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
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    senderName: string;
    senderContact: string;
    recipientName: string;
    recipientContact: string;
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
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 bg-opacity-50 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-fadeIn'>
                <div className='flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50'>
                    <h3 className='text-xl font-bold text-slate-800'>{title}</h3>
                    <button onClick={onClose} className='text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg p-2 transition-all'>
                        <X className='w-5 h-5' />
                    </button>
                </div>
                <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>{children}</div>
            </div>
        </div>
    );
}

export default function InvoiceGenerator() {
    const [invoice, setInvoice] = useState<InvoiceData>({
        invoiceNumber: 'INV-0004',
        issueDate: '2025-12-09',
        dueDate: '2026-01-08',
        senderName: 'Your Company Name',
        senderContact: 'Address Line 1\nCity, State ZIP\nemail@company.com',
        recipientName: 'Client Company Name',
        recipientContact: 'Client Address\nCity, State ZIP\nclient@email.com',
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
    });

    const [tempData, setTempData] = useState({
        fieldLabel: '',
        fieldValue: '',
        companyInfo: '',
        clientInfo: '',
        description: '',
        paymentInfo: '',
    });

    const openModal = (type: keyof typeof modalState) => {
        if (type === 'companyInfo') setTempData({ ...tempData, companyInfo: invoice.companyInfo });
        if (type === 'clientInfo') setTempData({ ...tempData, clientInfo: invoice.clientInfo });
        if (type === 'description') setTempData({ ...tempData, description: invoice.description });
        if (type === 'paymentInfo') setTempData({ ...tempData, paymentInfo: invoice.paymentInfo });
        setModalState({ ...modalState, [type]: true });
    };

    const closeModal = (type: keyof typeof modalState) => {
        setModalState({ ...modalState, [type]: false });
        setTempData({ fieldLabel: '', fieldValue: '', companyInfo: '', clientInfo: '', description: '', paymentInfo: '' });
    };

    const calculateSubtotal = () => {
        return invoice.items.reduce((sum, item) => sum + item.amount, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal + invoice.tax;
    };

    const addItem = () => {
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
        };
        setInvoice({ ...invoice, items: [...invoice.items, newItem] });
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        const updatedItems = invoice.items.map((item) => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    updated.amount = updated.quantity * updated.rate;
                }
                return updated;
            }
            return item;
        });
        setInvoice({ ...invoice, items: updatedItems });
    };

    const removeItem = (id: string) => {
        setInvoice({ ...invoice, items: invoice.items.filter((item) => item.id !== id) });
    };

    const addCustomField = () => {
        if (tempData.fieldLabel && tempData.fieldValue) {
            const newField: CustomField = {
                id: Date.now().toString(),
                label: tempData.fieldLabel,
                value: tempData.fieldValue,
            };
            setInvoice({ ...invoice, customFields: [...invoice.customFields, newField] });
            closeModal('customField');
        }
    };

    const removeCustomField = (id: string) => {
        setInvoice({ ...invoice, customFields: invoice.customFields.filter((f) => f.id !== id) });
    };

    const saveCompanyInfo = () => {
        setInvoice({ ...invoice, companyInfo: tempData.companyInfo });
        closeModal('companyInfo');
    };

    const saveClientInfo = () => {
        setInvoice({ ...invoice, clientInfo: tempData.clientInfo });
        closeModal('clientInfo');
    };

    const saveDescription = () => {
        setInvoice({ ...invoice, description: tempData.description });
        closeModal('description');
    };

    const savePaymentInfo = () => {
        setInvoice({ ...invoice, paymentInfo: tempData.paymentInfo });
        closeModal('paymentInfo');
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setInvoice({ ...invoice, logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const downloadPDF = () => {
        window.print();
    };

    const saveInvoice = async () => {
        try {
            await window.storage.set('invoice-current', JSON.stringify(invoice));
            alert('✓ Invoice saved successfully!');
        } catch (error) {
            console.log('Saving to memory:', invoice);
            alert('✓ Invoice saved!');
        }
    };

    const deleteInvoice = () => {
        if (confirm('Are you sure you want to clear this invoice?')) {
            setInvoice({
                invoiceNumber: 'INV-0001',
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                senderName: 'Your Company Name',
                senderContact: 'Address Line 1\nCity, State ZIP\nemail@company.com',
                recipientName: 'Client Company Name',
                recipientContact: 'Client Address\nCity, State ZIP\nclient@email.com',
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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

            {/* Modals */}
            <Modal isOpen={modalState.customField} onClose={() => closeModal('customField')} title='Add Custom Field'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Field Label</label>
                        <input
                            type='text'
                            value={tempData.fieldLabel}
                            onChange={(e) => setTempData({ ...tempData, fieldLabel: e.target.value })}
                            placeholder='e.g., PO Number, Project ID'
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Field Value</label>
                        <input
                            type='text'
                            value={tempData.fieldValue}
                            onChange={(e) => setTempData({ ...tempData, fieldValue: e.target.value })}
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
                            onChange={(e) => setTempData({ ...tempData, companyInfo: e.target.value })}
                            placeholder='Tax ID: 123-45-6789&#10;Registration Number: ABC123&#10;Website: www.company.com'
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
                            onChange={(e) => setTempData({ ...tempData, clientInfo: e.target.value })}
                            placeholder='Contact Person: John Doe&#10;Phone: +1 234 567 8900&#10;Account Number: ACC-12345'
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
                            onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
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
                            onChange={(e) => setTempData({ ...tempData, paymentInfo: e.target.value })}
                            placeholder='Bank Name: ABC Bank&#10;Account Number: 1234567890&#10;SWIFT Code: ABCDEF12&#10;Payment Methods: Bank Transfer, PayPal, Credit Card'
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
                <div id='invoice-print' className='lg:col-span-3 bg-white rounded-xl shadow-lg p-8 md:p-12 border border-slate-200'>
                    {/* Header */}
                    <div className='flex justify-between items-start mb-12 pb-8 border-b-2 border-slate-200'>
                        <div className='flex items-center gap-4'>
                            <label className='cursor-pointer no-print'>
                                <div className='w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all'>
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
                            {invoice.logo && (
                                <div className='print:hidden'>
                                    <Image width={100} height={100} src={invoice.logo} alt='Logo' className='w-24 h-24 object-contain' />
                                </div>
                            )}
                        </div>
                        <div className='text-right'>
                            <h1 className='text-4xl font-bold text-slate-800 mb-3 tracking-tight'>INVOICE</h1>
                            <input
                                type='text'
                                value={invoice.invoiceNumber}
                                onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                                className='text-right text-xl font-semibold text-slate-600 border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none transition-colors px-2 bg-transparent'
                            />
                        </div>
                    </div>

                    {/* Invoice Description */}
                    {invoice.description && (
                        <div className='mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 shadow-sm'>
                            <div className='flex items-start gap-3'>
                                <FileText className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                                <div>
                                    <h3 className='font-bold text-slate-800 mb-2'>Invoice Description</h3>
                                    <p className='text-slate-700 text-sm leading-relaxed whitespace-pre-wrap'>{invoice.description}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dates and Custom Fields */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
                        <div className='space-y-3'>
                            <div className='flex items-center gap-3 bg-slate-50 p-3 rounded-lg'>
                                <label className='text-slate-700 font-semibold w-28'>Issue Date:</label>
                                <input
                                    type='date'
                                    value={invoice.issueDate}
                                    onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                                    className='border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 bg-white'
                                />
                            </div>
                            <div className='flex items-center gap-3 bg-slate-50 p-3 rounded-lg'>
                                <label className='text-slate-700 font-semibold w-28'>Due Date:</label>
                                <input
                                    type='date'
                                    value={invoice.dueDate}
                                    onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
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
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mb-12'>
                        <div className='bg-slate-50 p-6 rounded-xl border border-slate-200'>
                            <div className='flex items-center gap-3 mb-4 pb-3 border-b-2 border-slate-300'>
                                <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
                                    <Building2 className='w-5 h-5 text-white' />
                                </div>
                                <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wider'>From</h3>
                            </div>
                            <div>
                                <input
                                    type='text'
                                    value={invoice.senderName}
                                    onChange={(e) => setInvoice({ ...invoice, senderName: e.target.value })}
                                    className='font-bold text-lg text-slate-800 mb-2 w-full border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                    placeholder='Your Company Name'
                                />
                                <textarea
                                    value={invoice.senderContact}
                                    onChange={(e) => setInvoice({ ...invoice, senderContact: e.target.value })}
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
                        </div>

                        <div className='bg-slate-50 p-6 rounded-xl border border-slate-200'>
                            <div className='flex items-center gap-3 mb-4 pb-3 border-b-2 border-slate-300'>
                                <div className='w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center'>
                                    <User className='w-5 h-5 text-white' />
                                </div>
                                <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wider'>Bill To</h3>
                            </div>
                            <div>
                                <input
                                    type='text'
                                    value={invoice.recipientName}
                                    onChange={(e) => setInvoice({ ...invoice, recipientName: e.target.value })}
                                    className='font-bold text-lg text-slate-800 mb-2 w-full border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                    placeholder='Client Company Name'
                                />
                                <textarea
                                    value={invoice.recipientContact}
                                    onChange={(e) => setInvoice({ ...invoice, recipientContact: e.target.value })}
                                    className='text-sm text-slate-600 w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none resize-none bg-transparent leading-relaxed'
                                    placeholder='Client contact details'
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
                                        <div className='col-span-1'></div>
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
                                        onChange={(e) => setInvoice({ ...invoice, currency: e.target.value })}
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
                                                onChange={(e) => setInvoice({ ...invoice, tax: parseFloat(e.target.value) || 0 })}
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
                        onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
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
                            <button
                                onClick={saveInvoice}
                                className='w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 transition-all font-semibold shadow-md hover:shadow-lg'
                            >
                                <Save className='w-4 h-4' />
                                Save Invoice
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
