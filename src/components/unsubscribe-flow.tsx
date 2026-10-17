/* eslint-disable react/jsx-no-bind */
'use client';

import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { AlertTriangle, CheckCircle, ChevronDown, Loader2, MailCheck, Minus, Monitor, Newspaper, Plus, ReceiptText, Star, X, Zap } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const UNIFIED_CARD_HEIGHT = 580;

type ProductStatus = 'Purchased' | 'NotPurchased' | string;
type UserProductData = Record<string, ProductStatus>;
type ProductDialogMode = 'unsubscribe' | 'feedback';

type ProductItem = {
    id: string;
    key: string;
    label: string;
    Icon: React.ElementType;
    description: string;
};

type ToolFeedback = {
    id: number;
    toolName: string;
    stars: string;
    review: string;
    createdAt: string;
};

type FeedbackStatusResponse = {
    user?: {
        id: number;
        firstName?: string;
        lastName?: string;
        email?: string;
        roles?: string[];
    };
    totalFeedbacks?: number;
    toolsGivenFeedback?: string[];
    toolsWithoutFeedback?: string[];
    feedbacks?: ToolFeedback[];
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
        id: 'DigitalBillboard',
        key: 'DigitalBillboard',
        label: 'Digital Billboard',
        Icon: Monitor,
        description: 'Digital billboard product access and feedback status.',
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

function getFeedbackAuthId(userId?: string) {
    return getCookie('id') || userId || getLoggedInUserId();
}

function productHasFeedback(feedbackStatus: FeedbackStatusResponse | null, product: ProductItem) {
    if (!feedbackStatus) return false;

    return Boolean(
        feedbackStatus.toolsGivenFeedback?.includes(product.id) ||
            feedbackStatus.toolsGivenFeedback?.includes(product.key) ||
            feedbackStatus.feedbacks?.some((feedback) => feedback.toolName === product.id || feedback.toolName === product.key)
    );
}

function LogoBox({ mode = 'unsubscribe' }: { mode?: ProductDialogMode }) {
    const isFeedback = mode === 'feedback';

    return (
        <div
            className={`h-14 w-14 rounded-2xl border bg-black/10 flex items-center justify-center mb-4 shadow-xl ${
                isFeedback ? 'border-emerald-900/45 shadow-emerald-950/30' : 'border-red-900/15'
            }`}
        >
            <Image
                width={120}
                height={120}
                src={isFeedback ? '/logo.png' : '/redLogo.png'}
                alt='Logo'
                className='object-contain'
                style={
                    isFeedback
                        ? { filter: 'brightness(0) saturate(100%) invert(24%) sepia(91%) saturate(876%) hue-rotate(115deg) brightness(82%) contrast(96%)' }
                        : undefined
                }
            />
        </div>
    );
}

function ModalCloseButton({ onClick, mode = 'unsubscribe' }: { onClick: () => void; mode?: ProductDialogMode }) {
    const isFeedback = mode === 'feedback';

    return (
        <button
            type='button'
            onClick={onClick}
            className={`absolute right-4 top-4 w-10 h-10 bg-black/40 rounded-2xl flex items-center justify-center border hover:bg-white/10 transition-all duration-300 z-20 ${
                isFeedback ? 'border-emerald-900/35 hover:border-emerald-700/60' : ''
            }`}
            style={{
                borderColor: isFeedback ? 'rgba(6,78,59,0.55)' : 'rgba(255,255,255,0.1)',
            }}
        >
            <X
                className='w-5 h-5'
                style={{
                    color: isFeedback ? 'rgba(167,243,208,0.85)' : 'rgba(255,255,255,0.7)',
                }}
            />
        </button>
    );
}

function ModalShell({ children, onClose, mode = 'unsubscribe' }: { children: React.ReactNode; onClose: () => void; mode?: ProductDialogMode }) {
    const isFeedback = mode === 'feedback';

    return (
        <DialogContent className='max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden'>
            <div
                className={`relative rounded-[32px] border overflow-hidden flex flex-col backdrop-blur-2xl ${
                    isFeedback ? 'border-emerald-950/35' : 'border-red-900/15'
                }`}
                style={{
                    minHeight: UNIFIED_CARD_HEIGHT,
                    height: UNIFIED_CARD_HEIGHT,
                    WebkitBackdropFilter: 'blur(20px) saturate(145%)',
                    backdropFilter: 'blur(20px) saturate(145%)',
                    boxShadow: isFeedback
                        ? '0 28px 80px rgba(0,0,0,0.74), 0 0 42px rgba(6,78,59,0.28), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)'
                        : '0 28px 80px rgba(0,0,0,0.74), 0 0 42px rgba(239,35,60,0.16), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)',
                }}
            >
                <ModalCloseButton onClick={onClose} mode={mode} />
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
.feedback-products-scroll {
    scrollbar-color: rgba(6, 78, 59, 0.65) transparent;
}
.feedback-products-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(
        180deg,
        rgba(6, 95, 70, 0.25) 0%,
        rgba(6, 78, 59, 0.72) 40%,
        rgba(4, 47, 46, 0.75) 60%,
        rgba(6, 95, 70, 0.25) 100%
    );
}
.feedback-products-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
        180deg,
        rgba(6, 95, 70, 0.45) 0%,
        rgba(6, 78, 59, 0.9) 40%,
        rgba(4, 47, 46, 0.92) 60%,
        rgba(6, 95, 70, 0.45) 100%
    );
}
`;

type FeedbackStarButtonProps = {
    starValue: number;
    selected: boolean;
    isSubmittingFeedback: boolean;
    onSelect: React.Dispatch<React.SetStateAction<string>>;
};

function FeedbackStarButton({ starValue, selected, isSubmittingFeedback, onSelect }: FeedbackStarButtonProps) {
    function handleClick() {
        onSelect(String(starValue));
    }

    return (
        <button
            type='button'
            disabled={isSubmittingFeedback}
            onClick={handleClick}
            className={`rounded-xl p-1 transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 ${
                selected ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(6,78,59,0.65)]' : 'text-white/20 hover:text-emerald-200/70'
            }`}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
        >
            <Star className='h-7 w-7 sm:h-8 sm:w-8' fill={selected ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
    );
}

type ProductAccordionCardProps = {
    product: ProductItem;
    isOpen: boolean;
    isFeedback: boolean;
    alreadyReviewed: boolean;
    onToggle: (productKey: string) => void;
    onFeedbackClick: (product: ProductItem) => void;
    onUnsubscribeClick: (product: ProductItem) => void;
};

function ProductAccordionCard({ product, isOpen, isFeedback, alreadyReviewed, onToggle, onFeedbackClick, onUnsubscribeClick }: ProductAccordionCardProps) {
    const Icon = product.Icon;

    function handleToggle() {
        onToggle(product.key);
    }

    function handleFeedbackClick() {
        onFeedbackClick(product);
    }

    function handleUnsubscribeClick() {
        onUnsubscribeClick(product);
    }

    return (
        <div className='rounded-2xl border border-white/10 bg-black/25 overflow-hidden'>
            <button type='button' onClick={handleToggle} className='w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-all duration-300'>
                <div
                    className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${
                        isFeedback ? 'border-emerald-900/45 bg-emerald-950/30' : 'border-red-500/25 bg-red-500/10'
                    }`}
                >
                    <Icon className={`h-5 w-5 ${isFeedback ? 'text-emerald-300' : 'text-red-300'}`} />
                </div>

                <div className='min-w-0 flex-1'>
                    <p className='font-bold text-white truncate'>{product.label}</p>
                    <p className='text-xs text-white/40 truncate'>{product.description}</p>
                </div>

                <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black border ${
                        alreadyReviewed ? 'bg-white/5 text-white/55 border-white/10' : 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25'
                    }`}
                >
                    {alreadyReviewed ? 'Reviewed' : 'Purchased'}
                </span>

                <ChevronDown className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className='border-t border-white/10 px-4 pb-4 pt-3'>
                    <div className='rounded-xl bg-white/[0.03] border border-white/10 p-3'>
                        <div className='flex items-start gap-3'>
                            <CheckCircle className='h-5 w-5 text-emerald-300 shrink-0 mt-0.5' />

                            <div className='min-w-0 flex-1'>
                                <p className='text-sm font-bold text-white'>{product.label} is active on your account.</p>

                                <p className='text-xs text-white/50 leading-relaxed mt-1'>
                                    {isFeedback
                                        ? alreadyReviewed
                                            ? 'You have already submitted feedback for this product.'
                                            : 'You can submit feedback for this product.'
                                        : 'You can unsubscribe this product from your account.'}
                                </p>

                                {isFeedback ? (
                                    <Button
                                        type='button'
                                        disabled={alreadyReviewed}
                                        onClick={handleFeedbackClick}
                                        className={`mt-4 w-full rounded-xl text-white font-black py-3 text-sm shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
                                            alreadyReviewed
                                                ? 'border border-white/10 bg-white/5 hover:bg-white/5 shadow-none'
                                                : 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-950/40'
                                        }`}
                                    >
                                        {alreadyReviewed ? 'Feedback Submitted' : 'Give Review'}
                                    </Button>
                                ) : (
                                    <Button
                                        type='button'
                                        onClick={handleUnsubscribeClick}
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
}

function ProductsDialog({
    open,
    onOpenChange,
    loading,
    error,
    products,
    mode = 'unsubscribe',
    feedbackStatus,
    feedbackFormProduct,
    feedbackStars,
    setFeedbackStars,
    feedbackReview,
    setFeedbackReview,
    feedbackError,
    isSubmittingFeedback,
    onUnsubscribeClick,
    onFeedbackClick,
    onFeedbackBack,
    onSubmitFeedback,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loading: boolean;
    error: string;
    products: UserProductData | null;
    mode?: ProductDialogMode;
    feedbackStatus?: FeedbackStatusResponse | null;
    feedbackFormProduct?: ProductItem | null;
    feedbackStars: string;
    setFeedbackStars: React.Dispatch<React.SetStateAction<string>>;
    feedbackReview: string;
    setFeedbackReview: React.Dispatch<React.SetStateAction<string>>;
    feedbackError: string | null;
    isSubmittingFeedback: boolean;
    onUnsubscribeClick: (product: ProductItem) => void;
    onFeedbackClick: (product: ProductItem) => void;
    onFeedbackBack: () => void;
    onSubmitFeedback: () => void;
}) {
    const [openProductKey, setOpenProductKey] = useState(PRODUCTS[0]?.key || '');

    const isFeedback = mode === 'feedback';
    const showFeedbackForm = isFeedback && Boolean(feedbackFormProduct);
    const activeProducts = PRODUCTS.filter((product) => products?.[product.key] === 'Purchased');
    const FeedbackIcon = feedbackFormProduct?.Icon;

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen && isSubmittingFeedback) return;

        if (!nextOpen) onFeedbackBack();
        onOpenChange(nextOpen);
    }

    function handleClose() {
        handleOpenChange(false);
    }

    function handleFeedbackReviewChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setFeedbackReview(event.target.value);
    }

    function handleProductToggle(productKey: string) {
        setOpenProductKey((previousKey) => (previousKey === productKey ? '' : productKey));
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

            <ModalShell onClose={handleClose} mode={mode}>
                <div className='relative z-10 px-7 pt-7 pb-4 text-center'>
                    <div className='flex flex-col items-center'>
                        <LogoBox mode={mode} />

                        <DialogTitle className='text-2xl font-extrabold text-white leading-tight'>Your Products</DialogTitle>

                        <DialogDescription className='text-white/55 text-sm mt-2 font-medium'>
                            {isFeedback
                                ? showFeedbackForm
                                    ? `Share your ${feedbackFormProduct?.label || 'product'} experience.`
                                    : 'Select an active product and share your experience.'
                                : 'Review your active subscriptions below.'}
                        </DialogDescription>
                    </div>
                </div>

                <div className={`px-5 pb-5 overflow-y-auto flex-1 products-scroll ${isFeedback ? 'feedback-products-scroll' : ''}`}>
                    {loading && (
                        <div className='h-full flex flex-col items-center justify-center text-white/60 gap-3'>
                            <Loader2 className={`h-7 w-7 animate-spin ${isFeedback ? 'text-emerald-700' : 'text-red-400'}`} />
                            {isFeedback ? 'Fetching feedback information...' : 'Fetching product information...'}
                        </div>
                    )}

                    {!loading && error && <div className='rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300'>{error}</div>}

                    {!loading && !error && showFeedbackForm && feedbackFormProduct && (
                        <div className='space-y-4'>
                            <div className='rounded-2xl border border-emerald-950/45 bg-emerald-950/20 p-4 shadow-lg shadow-emerald-950/20'>
                                <div className='flex items-center gap-3'>
                                    <div className='h-10 w-10 shrink-0 rounded-xl border border-emerald-900/45 bg-emerald-950/35 flex items-center justify-center'>
                                        {FeedbackIcon && <FeedbackIcon className='h-5 w-5 text-emerald-300' />}
                                    </div>

                                    <div className='min-w-0 flex-1 text-left'>
                                        <p className='font-black text-white truncate'>{feedbackFormProduct.label}</p>
                                        <p className='text-xs text-white/45 truncate'>{feedbackFormProduct.description}</p>
                                    </div>

                                    <span className='shrink-0 rounded-full border border-emerald-700/35 bg-emerald-950/45 px-3 py-1 text-[10px] font-black text-emerald-300'>
                                        Feedback
                                    </span>
                                </div>
                            </div>

                            {feedbackError && (
                                <div className='rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200'>{feedbackError}</div>
                            )}

                            <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-[7px]'>
                                <div className='mb-3 flex items-center justify-between gap-3'>
                                    <label className='block text-sm font-black text-white'>Review</label>
                                    <span className='rounded-full border border-emerald-900/50 bg-emerald-950/35 px-3 py-1 text-xs font-black text-emerald-300'>
                                        {feedbackStars}/5 Stars
                                    </span>
                                </div>

                                <div className='flex items-center justify-center gap-1.5'>
                                    {Array.from({ length: 5 }, (_, index) => {
                                        const starValue = index + 1;
                                        const selected = Number(feedbackStars) >= starValue;

                                        return (
                                            <FeedbackStarButton
                                                key={starValue}
                                                starValue={starValue}
                                                selected={selected}
                                                isSubmittingFeedback={isSubmittingFeedback}
                                                onSelect={setFeedbackStars}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-[7px]'>
                                <label className='mb-3 block text-sm font-black text-white'>Feedback</label>
                                <textarea
                                    value={feedbackReview}
                                    onChange={handleFeedbackReviewChange}
                                    disabled={isSubmittingFeedback}
                                    rows={5}
                                    placeholder='Write your feedback here...'
                                    className='w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-emerald-800/80 focus:ring-4 focus:ring-emerald-950/30 disabled:opacity-60'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <Button
                                    type='button'
                                    disabled={isSubmittingFeedback}
                                    onClick={onFeedbackBack}
                                    className='w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black py-4 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type='button'
                                    disabled={isSubmittingFeedback}
                                    onClick={onSubmitFeedback}
                                    className='w-full rounded-2xl border border-emerald-900/50 bg-emerald-800 hover:bg-emerald-900 text-white font-black py-4 text-sm shadow-md shadow-emerald-950/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    {isSubmittingFeedback ? (
                                        <span className='flex items-center justify-center gap-2'>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Submitting...
                                        </span>
                                    ) : (
                                        'Submit'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && !showFeedbackForm && activeProducts.length === 0 && (
                        <div className='h-full flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/25 p-6 text-center'>
                            <p className='text-xl font-black text-white'>No Active Subscriptions</p>
                        </div>
                    )}

                    {!loading && !error && !showFeedbackForm && activeProducts.length > 0 && (
                        <div className='space-y-3'>
                            {activeProducts.map((product) => {
                                const isOpen = openProductKey === product.key;
                                const alreadyReviewed = isFeedback && productHasFeedback(feedbackStatus || null, product);

                                return (
                                    <ProductAccordionCard
                                        key={product.key}
                                        product={product}
                                        isOpen={isOpen}
                                        isFeedback={isFeedback}
                                        alreadyReviewed={alreadyReviewed}
                                        onToggle={handleProductToggle}
                                        onFeedbackClick={onFeedbackClick}
                                        onUnsubscribeClick={onUnsubscribeClick}
                                    />
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
            </ModalShell>
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
    function handleOpenChange(nextOpen: boolean) {
        if (!isLoading) onOpenChange(nextOpen);
    }

    function handleClose() {
        if (!isLoading) onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <ModalShell onClose={handleClose}>
                <div className='relative z-10 flex flex-1 flex-col justify-center px-7 py-8 text-center'>
                    <div className='flex flex-col items-center'>
                        <LogoBox />

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
                            onClick={handleClose}
                            className='w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black py-5 text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </ModalShell>
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

    function handleClose() {
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <ModalShell onClose={handleClose}>
                <div className='relative z-10 flex flex-1 flex-col justify-center px-7 py-8 text-center'>
                    <div className='flex flex-col items-center'>
                        <LogoBox />

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
                        onClick={handleClose}
                        className={`mt-8 w-full rounded-2xl text-white font-black py-5 text-base shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
                            isSuccess ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-600/30' : 'bg-red-700 hover:bg-red-800 shadow-red-600/40'
                        }`}
                    >
                        Close
                    </Button>
                </div>
            </ModalShell>
        </Dialog>
    );
}

export function FeedbackUnsubscribeButtons({ size = 'section', className = '', onFeedbackClick }: FeedbackUnsubscribeButtonsProps) {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authFlow, setAuthFlow] = useState<ProductDialogMode>('unsubscribe');
    const [productsOpen, setProductsOpen] = useState(false);
    const [productsMode, setProductsMode] = useState<ProductDialogMode>('unsubscribe');
    const [products, setProducts] = useState<UserProductData | null>(null);
    const [productLoading, setProductLoading] = useState(false);
    const [productError, setProductError] = useState('');

    const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatusResponse | null>(null);
    const [feedbackProduct, setFeedbackProduct] = useState<ProductItem | null>(null);
    const [feedbackStars, setFeedbackStars] = useState('5');
    const [feedbackReview, setFeedbackReview] = useState('');
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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

    const fetchFeedbackStatus = React.useCallback(async (userId?: string) => {
        const id = getFeedbackAuthId(userId || undefined);

        if (!id) {
            setFeedbackStatus(null);
            return null;
        }

        const response = await axios.get(`/api/v5/tool-feedback/status?authId=${encodeURIComponent(id)}`);
        const status = response.data || null;
        setFeedbackStatus(status);
        return status as FeedbackStatusResponse | null;
    }, []);

    async function fetchProducts(userId?: string, mode: ProductDialogMode = 'unsubscribe') {
        const id = userId || getLoggedInUserId();

        if (!id) {
            setAuthFlow(mode);
            setAuthModalOpen(true);
            return;
        }

        setProductsMode(mode);
        setProductsOpen(true);
        setProductLoading(true);
        setProductError('');
        setFeedbackStatus(null);
        setFeedbackProduct(null);

        try {
            const response = await axios.get(`/api/v2/get-user-product-info/?id=${encodeURIComponent(id)}`);
            const nextProducts = response.data?.data || {};
            const hasActiveProducts = PRODUCTS.some((product) => nextProducts?.[product.key] === 'Purchased');

            setProducts(nextProducts);

            if (mode === 'feedback' && hasActiveProducts) {
                try {
                    await fetchFeedbackStatus(id);
                } catch (error: any) {
                    setProductError(error?.response?.data?.message || 'Unable to fetch your feedback status. Please try again.');
                }
            }
        } catch (error: any) {
            setProductError(error?.response?.data?.message || 'Unable to fetch your product information. Please try again.');
        } finally {
            setProductLoading(false);
        }
    }

    function continueAfterAuth(userId?: string) {
        const id = userId || getLoggedInUserId();
        const nextFlow = authFlow;

        setAuthModalOpen(false);

        if (!id) {
            setProductsMode(nextFlow);
            setProductsOpen(true);
            setProductLoading(false);
            setProductError('Login succeeded, but user id was not found.');
            return;
        }

        fetchProducts(id, nextFlow);
    }

    function handleFeedbackButtonClick() {
        onFeedbackClick?.();

        const id = getLoggedInUserId();

        if (!id) {
            setAuthFlow('feedback');
            setAuthModalOpen(true);
            return;
        }

        fetchProducts(id, 'feedback');
    }

    function handleUnsubscribeClick() {
        const id = getLoggedInUserId();

        if (!id) {
            setAuthFlow('unsubscribe');
            setAuthModalOpen(true);
            return;
        }

        fetchProducts(id, 'unsubscribe');
    }

    function openConfirmUnsubscribe(product: ProductItem) {
        setSelectedProduct(product);
        setConfirmOpen(true);
    }

    function openFeedbackForm(product: ProductItem) {
        if (productHasFeedback(feedbackStatus, product)) return;

        setFeedbackProduct(product);
        setFeedbackStars('5');
        setFeedbackReview('');
        setFeedbackError(null);
    }

    function closeFeedbackForm() {
        if (isSubmittingFeedback) return;

        setFeedbackProduct(null);
        setFeedbackReview('');
        setFeedbackStars('5');
        setFeedbackError(null);
    }

    async function confirmUnsubscribe() {
        if (isLoadingUnsubscribe || !selectedProduct) return;

        const id = getLoggedInUserId();

        if (!id) {
            setConfirmOpen(false);
            setAuthFlow('unsubscribe');
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

    const submitFeedback = React.useCallback(async () => {
        if (isSubmittingFeedback || !feedbackProduct) return;

        const id = getFeedbackAuthId();
        const review = feedbackReview.trim();

        if (!id) {
            setFeedbackError('User session was not found. Please sign in again and try to submit feedback.');
            return;
        }

        if (!review) {
            setFeedbackError('Please write your review before submitting.');
            return;
        }

        const confirmed = window.confirm('Are you sure you want to submit this feedback? Please recheck your review and stars before confirming.');
        if (!confirmed) return;

        setIsSubmittingFeedback(true);
        setFeedbackError(null);

        try {
            await axios.post('/api/v5/tool-feedback', {
                authId: id,
                review,
                stars: feedbackStars,
                toolName: feedbackProduct.id,
            });

            setFeedbackReview('');
            setFeedbackStars('5');
            await fetchFeedbackStatus(id);

            if (typeof window !== 'undefined') {
                window.alert('Feedback submitted successfully!');
            }

            setFeedbackProduct(null);
            setProductsOpen(false);
        } catch (error: any) {
            setFeedbackError(error?.response?.data?.message || 'Unable to submit feedback. Please try again.');
        } finally {
            setIsSubmittingFeedback(false);
        }
    }, [feedbackReview, feedbackStars, fetchFeedbackStatus, isSubmittingFeedback, feedbackProduct]);

    function handleAuthSuccess({ userId }: { userId?: string }) {
        continueAfterAuth(userId);
        return false;
    }

    return (
        <>
            <div className={wrapperClassName}>
                <Button
                    type='button'
                    onClick={handleFeedbackButtonClick}
                    className={`${buttonBaseClassName} bg-gradient-to-r from-[#2fa51f] to-[#46c92a] hover:from-[#278c1a] hover:to-[#3ab822]`}
                >
                    <Plus className={iconClassName} />
                    Feedback
                </Button>

                <Button
                    type='button'
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
                defaultView='signup'
                redirectAfterLogin='/'
                redirectAfterSignup='/'
                sourceRoute={authFlow === 'feedback' ? '/feedback' : '/unsubscribe'}
                authAction={authFlow}
                visualVariant={authFlow === 'feedback' ? 'success' : 'danger'}
                onSuccess={handleAuthSuccess}
            />

            <ProductsDialog
                open={productsOpen}
                onOpenChange={setProductsOpen}
                loading={productLoading}
                error={productError}
                products={products}
                mode={productsMode}
                feedbackStatus={feedbackStatus}
                feedbackFormProduct={feedbackProduct}
                feedbackStars={feedbackStars}
                setFeedbackStars={setFeedbackStars}
                feedbackReview={feedbackReview}
                setFeedbackReview={setFeedbackReview}
                feedbackError={feedbackError}
                isSubmittingFeedback={isSubmittingFeedback}
                onUnsubscribeClick={openConfirmUnsubscribe}
                onFeedbackClick={openFeedbackForm}
                onFeedbackBack={closeFeedbackForm}
                onSubmitFeedback={submitFeedback}
            />

            <ConfirmUnsubscribeDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                selectedProduct={selectedProduct}
                isLoading={isLoadingUnsubscribe}
                onConfirm={confirmUnsubscribe}
            />

            <UnsubscribeResultDialog open={resultOpen} onOpenChange={setResultOpen} type={resultType} message={resultMessage} />
        </>
    );
}
