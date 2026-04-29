'use client';

import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { AlertTriangle, CheckCircle, ChevronDown, Loader2, MailCheck, Minus, Newspaper, Package, Plus, ReceiptText, X, Zap } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const UNIFIED_CARD_HEIGHT = 580;

type ProductStatus = 'Purchased' | 'NotPurchased' | string;
type UserProductData = Record<string, ProductStatus>;

type ProductItem = {
    id: string;
    key: string;
    label: string;
    Icon: React.ElementType;
    description: string;
};

type FeedbackUnsubscribeButtonsProps = {
    size?: 'footer' | 'section';
    className?: string;
    onFeedbackClick?: () => void;
};

const PRODUCTS: ProductItem[] = [
    {
        id: 'NewsLetter',
        key: 'NewsLetter',
        label: 'Newsletter',
        Icon: Newspaper,
        description: 'Market updates, insights, alerts, and educational email content.',
    },
    {
        id: 'EmailMarketing',
        key: 'EmailMarketing',
        label: 'Email Marketing',
        Icon: MailCheck,
        description: 'CRM, email marketing tools, campaigns, and subscriber management.',
    },
    {
        id: 'InvoiceTool',
        key: 'InvoiceTool',
        label: 'Invoice Tool',
        Icon: ReceiptText,
        description: 'Business invoicing, contract support, and payment document tools.',
    },
    {
        id: 'LightningSilver',
        key: 'LightningSilver',
        label: 'Lightning Silver',
        Icon: Zap,
        description: 'Lightning Silver product access and subscription status.',
    },
    {
        id: 'LightningGold',
        key: 'LightningGold',
        label: 'Lightning Gold',
        Icon: Zap,
        description: 'Lightning Gold product access and subscription status.',
    },
];

function getCookie(name: string) {
    if (typeof document === 'undefined') return '';

    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : '';
}

function getLoggedInUserId() {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem('userId') || localStorage.getItem('id') || getCookie('id') || null;
}

function RedLogoBox() {
    return (
        <div
            className='h-14 w-14 rounded-2xl border bg-black/30 flex items-center justify-center mb-4 shadow-xl'
            style={{
                borderColor: 'rgba(239,35,60,0.4)',
                boxShadow: '0 18px 40px rgba(239,35,60,0.18)',
            }}
        >
            <Image width={120} height={120} src='/redLogo.png' alt='Logo' className='object-contain' />
        </div>
    );
}

function RedModalCloseButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type='button'
            onClick={onClick}
            className='absolute right-4 top-4 z-20 w-10 h-10 rounded-2xl flex items-center justify-center bg-black/45 border border-red-500/35 hover:border-red-500/70 hover:bg-red-500/10 transition-all duration-300'
        >
            <X className='w-5 h-5 text-red-400' />
        </button>
    );
}

function RedModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <DialogContent className='max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden'>
            <div
                className='relative rounded-[32px] border border-red-900/15 overflow-hidden flex flex-col backdrop-blur-2xl'
                style={{
                    minHeight: UNIFIED_CARD_HEIGHT,
                    height: UNIFIED_CARD_HEIGHT,
                    // background: 'linear-gradient(180deg, rgba(8, 11, 15, 0.72) 0%, rgba(12, 15, 20, 0.56) 42%, rgba(7, 10, 14, 0.72) 100%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(145%)',
                    backdropFilter: 'blur(20px) saturate(145%)',
                    boxShadow:
                        '0 28px 80px rgba(0,0,0,0.74), 0 0 42px rgba(239,35,60,0.16), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)',
                }}
            >
                <div className='absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-800 via-red-700 to-red-900' />
                <RedModalCloseButton onClick={onClose} />
                {children}
            </div>
        </DialogContent>
    );
}

const scrollbarStyles = `
.products-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(220, 38, 38, 0.45) transparent;
}
.products-scroll::-webkit-scrollbar {
    width: 4px;
}
.products-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 999px;
    margin-top: 6px;
    margin-bottom: 6px;
}
.products-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(
        180deg,
        rgba(239, 68, 68, 0.25) 0%,
        rgba(220, 38, 38, 0.55) 40%,
        rgba(185, 28, 28, 0.55) 60%,
        rgba(239, 68, 68, 0.25) 100%
    );
    border-radius: 999px;
    border: none;
}
.products-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
        180deg,
        rgba(239, 68, 68, 0.35) 0%,
        rgba(220, 38, 38, 0.75) 40%,
        rgba(185, 28, 28, 0.75) 60%,
        rgba(239, 68, 68, 0.35) 100%
    );
}
`;

function ProductsDialog({
    open,
    onOpenChange,
    loading,
    error,
    products,
    onUnsubscribeClick,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loading: boolean;
    error: string;
    products: UserProductData | null;
    onUnsubscribeClick: (product: ProductItem) => void;
}) {
    const [openProductKey, setOpenProductKey] = useState(PRODUCTS[0]?.key || '');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

            <RedModalShell onClose={() => onOpenChange(false)}>
                <div className='relative z-10 px-7 pt-7 pb-4 text-center'>
                    <div className='flex flex-col items-center'>
                        <RedLogoBox />

                        <DialogTitle className='text-2xl font-extrabold text-white leading-tight'>Your Products</DialogTitle>

                        <DialogDescription className='text-white/55 text-sm mt-2 font-medium'>
                            Review purchased and non-purchased products below.
                        </DialogDescription>
                    </div>
                </div>

                <div className='px-5 pb-5 overflow-y-auto flex-1 products-scroll'>
                    {loading && (
                        <div className='h-full flex flex-col items-center justify-center text-white/60 gap-3'>
                            <Loader2 className='h-7 w-7 animate-spin text-red-400' />
                            Fetching product information...
                        </div>
                    )}

                    {!loading && error && <div className='rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300'>{error}</div>}

                    {!loading && !error && (
                        <div className='space-y-3'>
                            {PRODUCTS.map((product) => {
                                const Icon = product.Icon;
                                const status = products?.[product.key] || 'NotPurchased';
                                const purchased = status === 'Purchased';
                                const isOpen = openProductKey === product.key;

                                return (
                                    <div key={product.key} className='rounded-2xl border border-white/10 bg-black/25 overflow-hidden'>
                                        <button
                                            type='button'
                                            onClick={() => setOpenProductKey((prev) => (prev === product.key ? '' : product.key))}
                                            className='w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-all duration-300'
                                        >
                                            <div className='h-10 w-10 shrink-0 rounded-xl border border-red-500/25 bg-red-500/10 flex items-center justify-center'>
                                                <Icon className='h-5 w-5 text-red-300' />
                                            </div>

                                            <div className='min-w-0 flex-1'>
                                                <p className='font-bold text-white truncate'>{product.label}</p>
                                                <p className='text-xs text-white/40 truncate'>{product.description}</p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
                                                    purchased
                                                        ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/25'
                                                        : 'bg-white/5 text-white/45 border border-white/10'
                                                }`}
                                            >
                                                {purchased ? 'Purchased' : 'Not Purchased'}
                                            </span>

                                            <ChevronDown
                                                className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div className='border-t border-white/10 px-4 pb-4 pt-3'>
                                                <div className='rounded-xl bg-white/[0.03] border border-white/10 p-3'>
                                                    <div className='flex items-start gap-3'>
                                                        {purchased ? (
                                                            <CheckCircle className='h-5 w-5 text-emerald-300 shrink-0 mt-0.5' />
                                                        ) : (
                                                            <Package className='h-5 w-5 text-white/35 shrink-0 mt-0.5' />
                                                        )}

                                                        <div className='min-w-0 flex-1'>
                                                            <p className='text-sm font-bold text-white'>
                                                                {purchased
                                                                    ? `${product.label} is active on your account.`
                                                                    : `${product.label} is not currently purchased.`}
                                                            </p>

                                                            <p className='text-xs text-white/50 leading-relaxed mt-1'>
                                                                {purchased
                                                                    ? 'You can unsubscribe this product from your account.'
                                                                    : 'No active subscription was found for this product.'}
                                                            </p>

                                                            {purchased && (
                                                                <Button
                                                                    type='button'
                                                                    onClick={() => onUnsubscribeClick(product)}
                                                                    className='mt-4 w-full rounded-xl bg-red-700 hover:bg-red-800 text-white font-black py-3 text-sm shadow-md shadow-red-600/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]'
                                                                >
                                                                    Unsubscribe
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div
                    className='pointer-events-none absolute bottom-0 left-0 right-0 h-10 rounded-b-[32px]'
                    style={{
                        background: 'linear-gradient(to top, rgba(7, 10, 14, 0.65) 0%, transparent 100%)',
                    }}
                />
            </RedModalShell>
        </Dialog>
    );
}

function ConfirmUnsubscribeDialog({
    open,
    onOpenChange,
    selectedProduct,
    isLoading,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedProduct: ProductItem | null;
    isLoading: boolean;
    onConfirm: () => void;
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!isLoading) onOpenChange(value);
            }}
        >
            <RedModalShell onClose={() => !isLoading && onOpenChange(false)}>
                <div className='relative z-10 flex flex-1 flex-col justify-center px-7 py-8 text-center'>
                    <div className='flex flex-col items-center'>
                        <RedLogoBox />

                        <div className='h-16 w-16 rounded-2xl border border-red-500/35 bg-red-500/10 flex items-center justify-center mb-5 shadow-xl shadow-red-500/20'>
                            <AlertTriangle className='h-8 w-8 text-red-400' />
                        </div>

                        <DialogTitle className='text-2xl font-extrabold text-white leading-tight'>Confirm Unsubscribe</DialogTitle>

                        <DialogDescription className='text-white/55 text-sm mt-3 font-medium leading-relaxed max-w-sm'>
                            Are you sure you want to unsubscribe from <span className='font-black text-red-300'>{selectedProduct?.label}</span>? This action
                            will cancel the active subscription for this product.
                        </DialogDescription>
                    </div>

                    <div className='mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-left'>
                        <p className='text-sm font-bold text-white'>Before you continue</p>
                        <p className='text-xs text-white/50 leading-relaxed mt-1'>
                            Your product access may be removed after cancellation depending on your current billing/subscription policy.
                        </p>
                    </div>

                    <div className='mt-8 flex flex-col gap-3'>
                        <Button
                            type='button'
                            disabled={isLoading}
                            onClick={onConfirm}
                            className='w-full rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black py-5 text-base shadow-md shadow-red-600/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            {isLoading ? (
                                <span className='flex items-center justify-center gap-2'>
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                    Unsubscribing...
                                </span>
                            ) : (
                                'Yes, Unsubscribe'
                            )}
                        </Button>

                        <Button
                            type='button'
                            disabled={isLoading}
                            onClick={() => onOpenChange(false)}
                            className='w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black py-5 text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </RedModalShell>
        </Dialog>
    );
}

function UnsubscribeResultDialog({
    open,
    onOpenChange,
    type,
    message,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'success' | 'error';
    message: string;
}) {
    const isSuccess = type === 'success';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <RedModalShell onClose={() => onOpenChange(false)}>
                <div className='relative z-10 flex flex-1 flex-col justify-center px-7 py-8 text-center'>
                    <div className='flex flex-col items-center'>
                        <RedLogoBox />

                        <div
                            className={`h-20 w-20 rounded-3xl border flex items-center justify-center mb-6 shadow-xl ${
                                isSuccess
                                    ? 'border-emerald-400/35 bg-emerald-400/10 shadow-emerald-500/20'
                                    : 'border-red-500/35 bg-red-500/10 shadow-red-500/20'
                            }`}
                        >
                            {isSuccess ? <CheckCircle className='h-10 w-10 text-emerald-300' /> : <X className='h-10 w-10 text-red-400' />}
                        </div>

                        <DialogTitle className='text-2xl font-extrabold text-white leading-tight'>
                            {isSuccess ? 'Unsubscribed Successfully' : 'Unsubscribe Failed'}
                        </DialogTitle>

                        <DialogDescription className='text-white/55 text-sm mt-3 font-medium leading-relaxed max-w-sm'>{message}</DialogDescription>
                    </div>

                    <Button
                        type='button'
                        onClick={() => onOpenChange(false)}
                        className={`mt-8 w-full rounded-2xl text-white font-black py-5 text-base shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
                            isSuccess ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-600/30' : 'bg-red-700 hover:bg-red-800 shadow-red-600/40'
                        }`}
                    >
                        Close
                    </Button>
                </div>
            </RedModalShell>
        </Dialog>
    );
}

export function FeedbackUnsubscribeButtons({ size = 'section', className = '', onFeedbackClick }: FeedbackUnsubscribeButtonsProps) {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const [products, setProducts] = useState<UserProductData | null>(null);
    const [productLoading, setProductLoading] = useState(false);
    const [productError, setProductError] = useState('');

    const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [resultType, setResultType] = useState<'success' | 'error'>('success');
    const [resultMessage, setResultMessage] = useState('');

    const isFooter = size === 'footer';

    const wrapperClassName = isFooter ? `flex w-fit flex-col gap-2 sm:gap-3 ${className}` : `flex w-full flex-col gap-3 sm:w-[300px] ${className}`;

    const buttonBaseClassName = isFooter
        ? 'flex h-10 w-32 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-black text-white shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-14 sm:w-[190px] sm:gap-2 sm:rounded-2xl sm:text-xl'
        : 'flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-base font-black text-white shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-14 sm:rounded-2xl sm:text-xl';

    const iconClassName = isFooter ? 'h-4 w-4 stroke-[4] sm:h-7 sm:w-7' : 'h-5 w-5 stroke-[4] sm:h-7 sm:w-7';

    async function fetchProducts(userId?: string) {
        const id = userId || getLoggedInUserId();

        if (!id) {
            setAuthModalOpen(true);
            return;
        }

        setProductsOpen(true);
        setProductLoading(true);
        setProductError('');

        try {
            const response = await axios.get(`/api/v2/get-user-product-info/?id=${encodeURIComponent(id)}`);
            setProducts(response.data?.data || {});
        } catch (error: any) {
            setProductError(error?.response?.data?.message || 'Unable to fetch your product information. Please try again.');
        } finally {
            setProductLoading(false);
        }
    }

    function continueAfterAuth(userId?: string) {
        const id = userId || getLoggedInUserId();

        setAuthModalOpen(false);

        if (!id) {
            setProductsOpen(true);
            setProductLoading(false);
            setProductError('Login succeeded, but user id was not found.');
            return;
        }

        fetchProducts(id);
    }

    function handleUnsubscribeClick() {
        const id = getLoggedInUserId();

        if (!id) {
            setAuthModalOpen(true);
            return;
        }

        fetchProducts(id);
    }

    function openConfirmUnsubscribe(product: ProductItem) {
        setSelectedProduct(product);
        setConfirmOpen(true);
    }

    async function confirmUnsubscribe() {
        if (isLoadingUnsubscribe || !selectedProduct) return;

        const id = getLoggedInUserId();

        if (!id) {
            setConfirmOpen(false);
            setAuthModalOpen(true);
            return;
        }

        setIsLoadingUnsubscribe(true);

        try {
            const response = await axios.post(`/api/v2/cancel-subscription?id=${encodeURIComponent(id)}`, {
                product: selectedProduct.id,
            });

            if (response.status === 200) {
                setProducts((prev) => ({
                    ...(prev || {}),
                    [selectedProduct.key]: 'NotPurchased',
                }));

                setConfirmOpen(false);
                setProductsOpen(false);
                setResultType('success');
                setResultMessage(response.data?.message || `${selectedProduct.label} subscription cancelled successfully.`);
                setResultOpen(true);
                return;
            }

            setResultType('error');
            setResultMessage(response.data?.message || `Unable to unsubscribe from ${selectedProduct.label}. Please try again.`);
            setResultOpen(true);
        } catch (error: any) {
            setResultType('error');
            setResultMessage(error?.response?.data?.message || `Unable to unsubscribe from ${selectedProduct.label}. Please try again or contact support.`);
            setResultOpen(true);
        } finally {
            setIsLoadingUnsubscribe(false);
        }
    }

    return (
        <>
            <div className={wrapperClassName}>
                <Button
                    type='button'
                    onClick={onFeedbackClick || (() => {})}
                    className={`${buttonBaseClassName} bg-gradient-to-r from-[#2fa51f] to-[#46c92a] hover:from-[#278c1a] hover:to-[#3ab822]`}
                >
                    <Plus className={iconClassName} />
                    Feedback
                </Button>

                <Button
                    type='button'
                    // eslint-disable-next-line
                    onClick={handleUnsubscribeClick}
                    className={`${buttonBaseClassName} bg-gradient-to-r from-[#f02822] to-[#ff2f27] hover:from-[#c91f1a] hover:to-[#df241f]`}
                >
                    <Minus className={iconClassName} />
                    Unsubscribe
                </Button>
            </div>

            <AuthModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                defaultView='signin'
                redirectAfterLogin='/'
                redirectAfterSignup='/'
                sourceRoute='/unsubscribe'
                visualVariant='danger'
                onSuccess={({ userId }) => {
                    continueAfterAuth(userId);
                    return false;
                }}
            />

            <ProductsDialog
                open={productsOpen}
                onOpenChange={setProductsOpen}
                loading={productLoading}
                error={productError}
                products={products}
                // eslint-disable-next-line
                onUnsubscribeClick={openConfirmUnsubscribe}
            />

            <ConfirmUnsubscribeDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                selectedProduct={selectedProduct}
                isLoading={isLoadingUnsubscribe}
                // eslint-disable-next-line
                onConfirm={confirmUnsubscribe}
            />

            <UnsubscribeResultDialog open={resultOpen} onOpenChange={setResultOpen} type={resultType} message={resultMessage} />
        </>
    );
}
