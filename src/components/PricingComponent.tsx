'use client';

import { AuthModalTrigger } from '@/components/AuthModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { ArrowRight, Calendar, CheckCircle, Clock, DollarSign, FilePen, Lock, Mail, MessageSquare, Monitor, Newspaper, Star, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useMemo, useState } from 'react';

const PRODUCTS = [
    {
        id: 'NewsLetter',
        apiName: 'NewsLetter',
        name: 'Newsletter',
        monthlyPrice: 10,
        yearlyPrice: 50,
        description: 'Weekly premium market insights',
        features: [
            'Weekly Stock Picks',
            'Macro Market Updates',
            'Latest Blog Articles',
            'Exclusive Financial Insights',
            'Portfolio Strategy Notes',
            'Market Data Briefings',
        ],
        icon: Newspaper,
        color: 'from-[#4cc7e8] to-[#2c7bbe]',
        available: true,
        popular: true,
        productLink: 'https://blacksnowholdings.com',
        productComission: '100',
        hasSubscription: true,
    },
    {
        id: 'InvoiceTool',
        apiName: 'InvoiceTool',
        name: 'Invoice & Contract',
        monthlyPrice: 20,
        yearlyPrice: 200,
        description: 'All-in-one contracts, signatures, and invoices—made simple',
        features: ['Instant Invoice Builder', 'Email Delivery', 'Invoice Dashboard', 'Create Invoice Contracts', 'Add Multiple Users', 'Recurring Invoices'],
        icon: FilePen,
        color: 'from-[#2c7bbe] to-[#4cc7e8]',
        available: true,
        popular: false,
        productLink: 'https://blacksnowholdings.com/InvoiceContract',
        productComission: '10',
        hasSubscription: true,
    },
    {
        id: 'DigitalBillboard',
        apiName: 'DigitalBillboard',
        name: 'Digital Billboard',
        monthlyPrice: 150,
        yearlyPrice: 600,
        description: 'Premium advertising placement across our platform',
        features: [
            'Billboard Creator',
            'Email & SMS Share Buttons',
            'Lead Capture Form',
            'Create Invoice Contracts',
            'Add Multiple Users',
            'Create Up to 4 Billboards',
        ],
        icon: Monitor,
        color: 'from-[#4cc7e8] to-[#2a8dcc]',
        available: true,
        popular: false,
        productLink: 'https://blacksnowholdings.com/advertising',
        productComission: '150',
        hasSubscription: true,
    },
    {
        id: 'Sales',
        apiName: 'EmailMarketing',
        name: 'Email CRM',
        monthlyPrice: 500,
        yearlyPrice: 4000,
        description: 'Comprehensive communication platform for your business',
        features: [
            'Email Campaigns & Automated Sequences',
            'SMS Campaigns & Sequences',
            'SMS Chatbot',
            'Email KPIs Dashboard',
            'Email Scheduling',
            'List Upload Tools',
        ],
        icon: MessageSquare,
        color: 'from-[#2a8dcc] to-[#2c7bbe]',
        available: true,
        popular: false,
        productLink: 'https://blacksnowholdings.com/emailMarketing',
        productComission: '100',
        hasSubscription: true,
    },
    {
        id: 'SuperAffiliate',
        apiName: 'SuperAffiliate',
        name: 'Lightning Gold',
        price: 250, // one-time
        period: 'One-time',
        description:
            'Earn 75% lifetime commissions on every active subscriber you refer—automated payouts, KPI tracking, and Email & SMS CRM tools to maximize every sale.',
        features: [
            '75% lifetime commissions (monthly + annual referrals)',
            'Automated payouts with no income cap',
            'Subscriber referral bonuses',
            'Commission table (monthly + annual) in one view',
            'KPI performance dashboard',
            'Email & SMS CRM included to promote offers',
        ],
        icon: Star,
        color: 'from-[#fbbf24] to-[#f59e0b]',
        available: true,
        popular: false,
        productLink: 'https://blacksnowholdings.com/lightningGold',
        productComission: '100',
        hasSubscription: false,
    },
];

type BillingPeriod = 'monthly' | 'yearly';

type PricingComponentProps = {
    name: string;
    defaultBillingPeriod?: BillingPeriod;
    className?: string;
    asModal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function PricingComponent({ name, defaultBillingPeriod = 'monthly', className = '', asModal = false, open, onOpenChange }: PricingComponentProps) {
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);
    const [purchasedProducts, setPurchasedProducts] = useState<Record<string, string>>({});
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);
    const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultBillingPeriod);

    const [internalOpen, setInternalOpen] = useState(false);
    const modalOpen = open ?? internalOpen;
    const setModalOpen = onOpenChange ?? setInternalOpen;

    const product = useMemo(() => {
        return PRODUCTS.find((p) => p.apiName === name || p.id === name) || null;
    }, [name]);

    useEffect(() => {
        setIsClient(true);

        const cookies = parseCookies();
        const id = cookies.id;
        if (!id) return;

        axios
            .get(`/api/v2/get-user-product-info/?id=${id}`)
            .then((response) => {
                if (response?.data?.message === 'No product found') setPurchasedProducts({});
                else setPurchasedProducts(response?.data?.data || {});
            })
            .catch((error) => {
                console.error('Error fetching product info:', error);
            });
    }, []);

    const getProductPrice = useCallback(
        (p: any) => {
            if (!p?.hasSubscription) return `$${p?.price}`;
            return billingPeriod === 'monthly' ? `$${p?.monthlyPrice}` : `$${p?.yearlyPrice}`;
        },
        [billingPeriod]
    );

    const getProductPeriod = useCallback(
        (p: any) => {
            if (!p?.hasSubscription) return `/ ${p?.period}`;
            return billingPeriod === 'monthly' ? '/Month' : '/Year';
        },
        [billingPeriod]
    );

    const getSavingsPercentage = useCallback((p: any) => {
        if (!p?.hasSubscription) return 0;
        const monthlyCost = p.monthlyPrice * 12;
        const yearlyCost = p.yearlyPrice;
        return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
    }, []);

    const fetchUserEmail = useCallback(async (userId: string) => {
        setIsLoadingEmail(true);
        try {
            const response = await axios.get(`/api/v2/getUserMail/?id=${userId}`);
            return response?.data?.email || null;
        } catch (error) {
            console.error('Error fetching:', error);
            return null;
        } finally {
            setIsLoadingEmail(false);
        }
    }, []);

    const handlePurchase = useCallback(
        async (p: any) => {
            if (!isClient || !p) return;

            const userId = localStorage.getItem('userId');
            if (!userId) {
                setShowSignupModal(true);
                return;
            }

            if (isLoadingEmail) return;

            let role;
            switch (p.id) {
                case 'NewsLetter':
                    role = 'NewsLetter';
                    break;
                case 'InvoiceTool':
                    role = 'InvoiceTool';
                    break;
                case 'DigitalBillboard':
                    role = 'DigitalBillboard';
                    break;
                case 'SuperAffiliate':
                    role = 'SuperAffiliate';
                    break;
                case 'Sales':
                    role = 'EmailMarketing';
                    break;
                default:
                    role = p.id;
            }

            try {
                const roleResponse = await axios.patch(`/api/v2/update-roles/?id=${userId}`, { rolesToAdd: role });
                if (roleResponse?.data?.user?.roles) {
                    localStorage.setItem('roles', JSON.stringify(roleResponse.data.user.roles));
                }

                localStorage.setItem('productLink', p.productLink);
                localStorage.setItem('comission', p.productComission);

                const email = await fetchUserEmail(userId);
                if (!email) return;

                let productType = p.id;
                if (p.id === 'Sales') productType = 'EmailMarketing';

                const requestBody: any = {
                    id: Number(userId),
                    email,
                    productType,
                };

                if (p.hasSubscription) requestBody.period = billingPeriod;

                const stripeResponse = await axios.post('/api/v1/stripe', requestBody);
                window.location.href = stripeResponse?.data?.data;
            } catch (error) {
                console.error('Error in handlePurchase:', error);
            }
        },
        [billingPeriod, fetchUserEmail, isClient, isLoadingEmail]
    );

    const handleUnsubscribe = useCallback((p: any) => {
        setSelectedProduct(p);
        setShowConfirmModal(true);
    }, []);

    const confirmUnsubscribe = useCallback(async () => {
        if (isLoadingUnsubscribe || !selectedProduct) return;

        const cookies = parseCookies();
        const id = cookies.id;
        if (!id) return;

        setIsLoadingUnsubscribe(true);
        try {
            const response = await axios.post(`/api/v2/cancel-subscription?id=${id}`, {
                product: selectedProduct.id,
            });

            if (response.status === 200) {
                setShowConfirmModal(false);
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    router.push('/');
                }, 3000);
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        } finally {
            setIsLoadingUnsubscribe(false);
        }
    }, [isLoadingUnsubscribe, selectedProduct, router]);

    if (!product) return null;

    const isPurchased = purchasedProducts[product.apiName] === 'Purchased';
    const savings = getSavingsPercentage(product);
    const isLightningGold = router.pathname === '/lightningGold';

    const formRows = product.features.slice(0, 3);
    const rowIcons = [Star, Mail, Lock];

    const CheckoutCard = ({ inModal }: { inModal: boolean }) => (
        <div className={`w-full ${!inModal ? 'mt-8 sm:mt-10 max-w-md mx-auto' : ''}`}>
            <div
                className={`relative rounded-[32px] border bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden ${
                    isPurchased ? 'border-emerald-400/25' : 'border-white/10'
                } ${product.available ? '' : 'opacity-70'} ${inModal ? 'w-full' : ''}`}
            >
                {/* top accent line */}
                <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${isPurchased ? 'from-emerald-400 to-green-500' : product.color}`} />

                <div className='relative p-6 sm:p-8'>
                    {/* ✅ UPDATED Header — logo left, text stacked right, badge top-right */}
                    <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-4'>
                            {/* ✅ FIX 1: Use /logowhite.png instead of product.icon */}
                            <div className='h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0'>
                                <Image src='/logowhite.png' alt='Logo' width={48} height={48} className='object-contain w-full h-full' />
                            </div>

                            {/* ✅ FIX 2: Text stacked vertically, tighter and cleaner */}
                            <div className='flex flex-col justify-center'>
                                <h3 className='text-xl font-extrabold text-white leading-tight tracking-tight'>{product.name}</h3>
                                <p className='text-lg font-semibold text-white leading-snug mt-0.5'>
                                    {getProductPrice(product)}
                                    <span className='text-white/55 font-medium text-base'>{getProductPeriod(product)}</span>
                                </p>
                            </div>
                        </div>

                        {product.popular && (
                            <Badge className='uppercase bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-4 py-1 text-xs self-start'>
                                POPULAR
                            </Badge>
                        )}
                    </div>

                    {/* Segmented Toggle — hidden on /lightningGold route */}
                    {product.hasSubscription && !isLightningGold && (
                        <div className='mt-6 flex justify-center'>
                            <div className='flex w-full max-w-[280px] rounded-2xl border border-white/10 bg-black/30 p-1'>
                                <button
                                    type='button'
                                    onClick={() => setBillingPeriod('monthly')}
                                    className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                        billingPeriod === 'monthly' ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white/80'
                                    }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setBillingPeriod('yearly')}
                                    className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                        billingPeriod === 'yearly' ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white/80'
                                    }`}
                                >
                                    Yearly
                                </button>
                            </div>
                        </div>
                    )}

                    {billingPeriod === 'yearly' && product.hasSubscription && savings > 0 && !isLightningGold && (
                        <div className='mt-3 flex justify-center'>
                            <div className='inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300'>
                                Save {savings}% with yearly billing
                            </div>
                        </div>
                    )}

                    {/* Form-like rows */}
                    <div className='mt-6 space-y-3'>
                        {formRows.map((text: string, i: number) => {
                            const Icon = rowIcons[i] || CheckCircle;
                            return (
                                <div key={`${text}-${i}`} className='flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3'>
                                    <Icon className='h-5 w-5 text-white/55' />
                                    <span className='text-sm text-white/70'>{text}</span>
                                </div>
                            );
                        })}

                        {product.features.length > 3 && <div className='text-xs text-white/40 px-1'>+ {product.features.length - 3} more included</div>}
                    </div>

                    {/* Terms line (visual) */}
                    <div className='mt-5 flex items-start gap-3 text-sm text-white/60'>
                        <div className='mt-0.5 h-5 w-5 rounded-md border border-white/15 bg-black/30 flex items-center justify-center'>
                            <CheckCircle className='h-4 w-4 text-white/55' />
                        </div>
                        <p className='leading-relaxed'>
                            I agree to the <span className='text-[#4cc7e8] hover:underline cursor-pointer'>Terms</span> and the{' '}
                            <span className='text-[#4cc7e8] hover:underline cursor-pointer'>Privacy</span> policies.
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className='mt-6'>
                        {product.available ? (
                            isPurchased ? (
                                <Button
                                    size='lg'
                                    className='w-full rounded-2xl border border-red-400/20 bg-red-500/15 hover:bg-red-500/25 text-red-200 py-6 font-bold transition'
                                    onClick={() => handleUnsubscribe(product)}
                                    disabled={isLoadingUnsubscribe}
                                >
                                    {isLoadingUnsubscribe ? 'Unsubscribing...' : 'Unsubscribe'}
                                    <ArrowRight className='h-5 w-5 ml-3 opacity-80' />
                                </Button>
                            ) : (
                                <Button
                                    size='lg'
                                    className='w-full cursor-pointer rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 text-white py-6 font-bold shadow-xl transition'
                                    onClick={() => handlePurchase(product)}
                                    disabled={isLoadingEmail}
                                >
                                    <DollarSign className='h-5 w-5 mr-2 opacity-90' />
                                    {isLoadingEmail ? 'Loading...' : 'Continue'}
                                    <ArrowRight className='h-5 w-5 ml-3 opacity-80' />
                                </Button>
                            )
                        ) : (
                            <div className='w-full py-6 text-center'>
                                <span className='inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-bold text-white/70'>
                                    <Clock className='h-5 w-5' />
                                    Coming Soon
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className='mt-4 flex items-center justify-center gap-2 text-xs text-white/40'>
                        <Lock className='h-4 w-4' />
                        Secure Stripe Checkout
                    </div>

                    {product.available && <p className='mt-3 text-center text-[11px] text-white/35'>VAT & local taxes may apply</p>}
                </div>
            </div>
        </div>
    );

    // ✅ Modal Mode
    if (asModal) {
        return (
            <div className={className}>
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className='sm:max-w-[540px] p-0 border-0 bg-transparent shadow-none'>
                        <button
                            onClick={() => setModalOpen(false)}
                            className='absolute right-4 top-4 w-10 h-10 bg-black/40 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition z-10'
                            aria-label='Close'
                        >
                            <X className='w-5 h-5 text-white/70' />
                        </button>

                        <CheckoutCard inModal={true} />
                    </DialogContent>
                </Dialog>

                {/* Signup Modal */}
                <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
                    <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-2xl'>
                        <button
                            onClick={() => setShowSignupModal(false)}
                            className='absolute right-4 top-4 w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                        >
                            <X className='w-5 h-5 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                        </button>

                        <DialogHeader className='space-y-6 text-center'>
                            <div className='flex flex-col items-center'>
                                <div className='w-16 h-16 mb-4 p-2 border-2 border-[#2c7bbe] rounded-2xl flex items-center justify-center shadow-xl'>
                                    <Image
                                        src='/logocolored.png'
                                        alt='Black Snow Logo'
                                        width={100}
                                        height={100}
                                        className='object-contain drop-shadow-2xl'
                                        priority
                                    />
                                </div>
                                <DialogTitle className='text-2xl font-black text-white'>Signup Required</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold mt-2'>
                                    You can&apos;t access this feature until you sign up.
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className='py-4'>
                            <AuthModalTrigger
                                buttonText='Signup Now'
                                defaultView='signup'
                                sourceRoute='/pricing'
                                redirectAfterLogin='/pricing'
                                redirectAfterSignup='/pricing'
                            >
                                <Button className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold py-6 text-lg shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-2xl'>
                                    Signup Now
                                </Button>
                            </AuthModalTrigger>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Confirm Unsubscribe Modal */}
                <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                    <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-2xl'>
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className='absolute right-4 top-4 w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                        >
                            <X className='w-5 h-5 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                        </button>

                        <DialogHeader className='space-y-6'>
                            <div className='flex items-center space-x-4'>
                                <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl'>
                                    <Calendar className='w-6 h-6 text-white' />
                                </div>
                                <div>
                                    <DialogTitle className='text-2xl font-black text-white'>Confirm Unsubscribe</DialogTitle>
                                    <DialogDescription className='text-red-400 font-semibold'>
                                        Are you sure you want to unsubscribe from {selectedProduct?.name}?
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className='py-4 space-y-4'>
                            <p className='text-gray-300 text-center'>This action cannot be undone.</p>
                            <Button
                                onClick={confirmUnsubscribe}
                                className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-6 text-lg shadow-2xl shadow-red-500/40 transition-all duration-300 transform hover:scale-105 rounded-2xl'
                                disabled={isLoadingUnsubscribe}
                            >
                                {isLoadingUnsubscribe ? 'Processing...' : 'Confirm Unsubscribe'}
                                <ArrowRight className='w-5 h-5 ml-3 opacity-80' />
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Success Modal */}
                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-2xl'>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className='absolute right-4 top-4 w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                        >
                            <X className='w-5 h-5 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                        </button>

                        <DialogHeader className='space-y-6 text-center'>
                            <div className='flex flex-col items-center'>
                                <div className='w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl mb-4'>
                                    <CheckCircle className='w-8 h-8 text-white' />
                                </div>
                                <DialogTitle className='text-2xl font-black text-white'>Unsubscribed Successfully</DialogTitle>
                                <DialogDescription className='text-green-400 font-semibold'>You have been removed from the plan.</DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className='py-4 text-center'>
                            <p className='text-gray-300'>Redirecting to home page...</p>
                        </div>
                    </DialogContent>
                </Dialog>

                <style jsx global>{`
                    @keyframes slide-in-up {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .animate-slide-in-up {
                        animation: slide-in-up 0.5s ease-out forwards;
                        animation-fill-mode: both;
                    }

                    button,
                    .transition-all {
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 300ms;
                    }
                `}</style>
            </div>
        );
    }

    // ✅ Inline Mode
    return (
        <div className={`w-full ${className}`}>
            <CheckoutCard inModal={false} />
        </div>
    );
}
