'use client';

import { AuthModalTrigger } from '@/components/AuthModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { ArrowRight, Calendar, CheckCircle, Clock, DollarSign, FilePen, MessageSquare, Monitor, Newspaper, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router'; // If you're on App Router, swap to: import { useRouter } from 'next/navigation'
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
    // IMPORTANT: apiName is EmailMarketing but id is Sales (same as your page)
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
];

export function PricingComponent({
    name, // "NewsLetter" | "InvoiceTool" | "DigitalBillboard" | "EmailMarketing"
    defaultBillingPeriod = 'monthly', // "monthly" | "yearly"
    className = '',
}) {
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);
    const [purchasedProducts, setPurchasedProducts] = useState({});
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);
    const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState(defaultBillingPeriod);

    const product = useMemo(() => {
        // name is apiName (except you also allow passing "Sales" if you want)
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
        (p) => {
            if (!p?.hasSubscription) return `$${p?.price}`;
            return billingPeriod === 'monthly' ? `$${p?.monthlyPrice}` : `$${p?.yearlyPrice}`;
        },
        [billingPeriod]
    );

    const getProductPeriod = useCallback(
        (p) => {
            if (!p?.hasSubscription) return `/ ${p?.period}`;
            return billingPeriod === 'monthly' ? '/Month' : '/Year';
        },
        [billingPeriod]
    );

    const getSavingsPercentage = useCallback((p) => {
        if (!p?.hasSubscription) return 0;
        const monthlyCost = p.monthlyPrice * 12;
        const yearlyCost = p.yearlyPrice;
        return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
    }, []);

    const fetchUserEmail = useCallback(async (userId) => {
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
        async (p) => {
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

                const requestBody = {
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

    const handleUnsubscribe = useCallback((p) => {
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
                product: selectedProduct.id, // keep EXACT behavior from your page (Sales stays Sales)
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

    const handleBillingPeriodToggle = useCallback(() => {
        setBillingPeriod((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'));
    }, []);

    if (!product) {
        return null; // or return a small fallback UI if you want
    }

    const isPurchased = purchasedProducts[product.apiName] === 'Purchased';
    const savings = getSavingsPercentage(product);

    return (
        <div className={`w-full ${className}`}>
            {/* Billing Toggle */}
            <div className='flex items-center justify-center gap-4 mt-2 sm:mt-4'>
                <span className={`text-base font-semibold transition-colors duration-300 ${billingPeriod === 'monthly' ? 'text-[#4cc7e8]' : 'text-gray-400'}`}>
                    Monthly
                </span>
                <button
                    onClick={handleBillingPeriodToggle}
                    className='relative w-16 h-8 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#4cc7e8]/30 focus:outline-none focus:ring-2 focus:ring-[#4cc7e8]/50 focus:ring-offset-2 focus:ring-offset-[#050608]'
                    aria-label={`Switch to ${billingPeriod === 'monthly' ? 'yearly' : 'monthly'} billing`}
                >
                    <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                            billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-0'
                        }`}
                    />
                </button>
                <span className={`text-base font-semibold transition-colors duration-300 ${billingPeriod === 'yearly' ? 'text-[#4cc7e8]' : 'text-gray-400'}`}>
                    Yearly
                </span>
            </div>

            {/* Single Pricing Card (EXACT styling & behavior from your grid card) */}
            <div className='mt-8 sm:mt-10 max-w-3xl mx-auto'>
                <div className='group animate-slide-in-up'>
                    <Card
                        className={`bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 ${
                            isPurchased
                                ? 'border-green-500/50 shadow-green-500/20'
                                : product.available
                                ? 'border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 cursor-pointer'
                                : 'border-gray-600/30 opacity-70'
                        }`}
                        onClick={() => product.available && !isPurchased && handlePurchase(product)}
                    >
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isPurchased ? 'from-green-400 to-emerald-500' : product.color}`} />

                        <CardHeader className='p-6 sm:p-8 pb-4'>
                            <div className='flex items-center justify-between mb-6'>
                                <div className='flex items-center space-x-4'>
                                    <div
                                        className={`min-w-14 min-h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${
                                            isPurchased ? 'from-green-400 to-emerald-500' : product.color
                                        } rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                                            !product.available ? 'opacity-50' : ''
                                        }`}
                                    >
                                        <product.icon className='min-w-7 min-h-7 sm:min-w-8 sm:min-h-8 text-white' />
                                    </div>
                                    <div>
                                        <CardTitle className='text-xl sm:text-2xl font-black text-white'>{product.name}</CardTitle>
                                        <p className='text-sm sm:text-base text-gray-400 mt-1'>{product.description}</p>
                                    </div>
                                </div>

                                {product.popular && (
                                    <Badge className='uppercase bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-4 py-1 text-xs'>
                                        POPULAR
                                    </Badge>
                                )}
                            </div>

                            <div className='text-center'>
                                <div className='flex items-center justify-center gap-3'>
                                    <div className={`text-4xl sm:text-5xl font-black ${isPurchased ? 'text-green-400' : 'text-[#4cc7e8]'}`}>
                                        {getProductPrice(product)}
                                        <span className='text-lg sm:text-2xl text-gray-400 ml-1'>{getProductPeriod(product)}</span>
                                    </div>
                                </div>

                                {billingPeriod === 'yearly' && product.hasSubscription && savings > 0 && (
                                    <p className='text-sm text-green-400 mt-2 font-semibold'>Save {savings}% with yearly billing</p>
                                )}

                                {product.available && <p className='text-xs sm:text-sm text-gray-500 mt-2'>VAT & local taxes may apply</p>}
                            </div>
                        </CardHeader>

                        <CardContent className='p-6 sm:p-8 pt-0'>
                            <div className='space-y-3 mb-8'>
                                {product.features.map((feature, i) => (
                                    <div
                                        key={i}
                                        className='flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 border border-[#2c7bbe]/20 group-hover:border-[#4cc7e8]/30 transition-all duration-300'
                                    >
                                        <CheckCircle className={`w-5 h-5 text-green-400 flex-shrink-0 ${!product.available && 'text-gray-500'}`} />
                                        <span className={`text-sm sm:text-base leading-relaxed ${product.available ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className='text-center'>
                                {product.available ? (
                                    isPurchased ? (
                                        <Button
                                            size='lg'
                                            className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-800 text-white py-5 sm:py-6 text-base sm:text-lg font-bold shadow-2xl shadow-red-500/40 transition-all duration-300 transform hover:scale-105 rounded-lg'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnsubscribe(product);
                                            }}
                                            disabled={isLoadingUnsubscribe}
                                        >
                                            {isLoadingUnsubscribe ? 'Unsubscribing...' : 'Unsubscribe'}
                                            <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                        </Button>
                                    ) : (
                                        <Button
                                            size='lg'
                                            className={`w-full bg-gradient-to-r ${product.color} hover:from-[#4cc7e8] hover:hover:to-[#2a8dcc] text-white py-5 sm:py-6 text-base sm:text-lg font-bold shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-2xl`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePurchase(product);
                                            }}
                                            disabled={isLoadingEmail}
                                        >
                                            <DollarSign className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                            {isLoadingEmail ? 'Loading...' : 'Purchase'}
                                            <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                        </Button>
                                    )
                                ) : (
                                    <div className='w-full py-5 sm:py-6 text-center'>
                                        <Badge className='uppercase bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold'>
                                            <Clock className='w-5 h-5 mr-2' />
                                            Coming Soon!
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <div
                            className={`absolute inset-0 bg-gradient-to-r ${product.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                        />
                    </Card>
                </div>
            </div>

            {/* Signup Modal (same as your page) */}
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

            {/* Confirm Unsubscribe Modal (same as your page) */}
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
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Modal (same as your page) */}
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

            {/* Same global CSS used in your Pricing page (animations + grid contain) */}
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
