'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import lottie from 'lottie-web';
import { ArrowRight, Calendar, CheckCircle, Clock, DollarSign, MessageSquare, Monitor, Newspaper, Target, Users, X, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState } from 'react';

function Pricing() {
    const [isClient, setIsClient] = useState(false);
    const [purchasedProducts, setPurchasedProducts] = useState({});
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);
    const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
    const router = useRouter();

    const LottieAnimation = ({ src, loop, autoplay, style }) => {
        const containerRef = useRef(null);

        useEffect(() => {
            if (typeof window !== 'undefined' && containerRef.current) {
                const animation = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop,
                    autoplay,
                    path: src,
                });

                return () => animation.destroy(); // Cleanup
            }
        }, [src, loop, autoplay]);

        return <div ref={containerRef} style={style} />;
    };

    useEffect(() => {
        setIsClient(true);
        const cookies = parseCookies();
        const id = cookies.id;

        if (id) {
            axios
                .get(`/api/v2/get-user-product-info/?id=${id}`)
                .then((response) => {
                    if (response.data.message === 'No product found') {
                        setPurchasedProducts({});
                    } else {
                        setPurchasedProducts(response.data.data);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching product info:', error);
                });
        }
    }, []);

    const products = [
        {
            id: 'NewsLetter',
            name: 'Newsletter',
            monthlyPrice: 10,
            yearlyPrice: 50,
            description: 'Premium trading insights and market analysis delivered weekly',
            features: [
                'Get your weekly stock picks for day trades, swing trades, options and dividends',
                'Receive trading strategy from the best performances in top market sectors',
                'Catch blog updates from every week',
                'Get detailed time special offers and sponsorships',
                'Read Featured News Articles',
            ],
            icon: Newspaper,
            color: 'from-[#4cc7e8] to-[#2c7bbe]',
            available: true,
            popular: true,
            apiName: 'NewsLetter',
            productLink: 'https://blacksnowholdings.com',
            productComission: '100',
            hasSubscription: true,
        },
        {
            id: 'RSVP',
            name: 'RSVP',
            price: 250,
            period: 'one time',
            description: 'Access to exclusive webinars and advanced trading education',
            features: [
                'Register for Webinar',
                'Learn Investing Strategies',
                'Learn to Build and Prospect a Master Stock List',
                'Learn Covered Calls and Protective Puts',
                'Learn Multiple Day Trading Strategies',
            ],
            icon: Calendar,
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
            available: true,
            popular: false,
            apiName: 'RSVP',
            productLink: 'https://blacksnowholdings.com/rsvp',
            productComission: '10',
            hasSubscription: false,
        },
        {
            id: 'DigitalBillboard',
            name: 'Digital Billboard',
            monthlyPrice: 150,
            yearlyPrice: 600,
            description: 'Premium advertising placement across our platform',
            features: ['Simple and Quick Setup', 'Global Exposure', 'Real-Time Performance Tracking', 'Enhanced Visibility'],
            icon: Monitor,
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
            available: true,
            popular: false,
            apiName: 'DigitalBillboard',
            productLink: 'https://blacksnowholdings.com/advertising',
            productComission: '150',
            hasSubscription: true,
        },
        {
            id: 'Sales',
            name: 'Email/SMS System',
            monthlyPrice: 500,
            yearlyPrice: 4000,
            description: 'Comprehensive communication platform for your business',
            features: ['Send Unlimited Emails/SMS', 'Create Custom Emails/SMS', 'Send Emails/SMS in bulk', 'Scheduled Campaigns'],
            icon: MessageSquare,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
            available: true,
            popular: false,
            apiName: 'EmailMarketing',
            productLink: 'https://blacksnowholdings.com/emailMarketing',
            productComission: '100',
            hasSubscription: true,
        },
    ];

    const getProductPrice = (product) => {
        if (!product.hasSubscription) {
            return `$${product.price}`;
        }
        return billingPeriod === 'monthly' ? `$${product.monthlyPrice}` : `$${product.yearlyPrice}`;
    };

    const getProductPeriod = (product) => {
        if (!product.hasSubscription) {
            return `/ ${product.period}`;
        }
        return billingPeriod === 'monthly' ? '/Month' : '/Year';
    };

    const getSavingsPercentage = (product) => {
        if (!product.hasSubscription) return 0;
        const monthlyCost = product.monthlyPrice * 12;
        const yearlyCost = product.yearlyPrice;
        return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
    };

    const fetchUserEmail = async (userId) => {
        setIsLoadingEmail(true);
        try {
            const response = await axios.get(`/api/v2/getUserMail/?id=${userId}`);
            return response.data.email;
        } catch (error) {
            console.error('Error fetching:', error);
            return null;
        } finally {
            setIsLoadingEmail(false);
        }
    };

    const handlePurchase = async (product) => {
        if (!isClient) return;
        const userId = localStorage.getItem('userId');

        if (!userId) {
            setShowSignupModal(true);
            return;
        }

        if (isLoadingEmail) return;

        let role;
        switch (product.id) {
            case 'NewsLetter':
                role = 'NewsLetter';
                break;
            case 'RSVP':
                role = 'Rsvp';
                break;
            case 'DigitalBillboard':
                role = 'DigitalBillboard';
                break;
            case 'Sales':
                role = 'EmailMarketing';
                break;
            default:
                role = product.id;
        }

        try {
            const roleResponse = await axios.patch(`/api/v2/update-roles/?id=${userId}`, { rolesToAdd: role });
            if (roleResponse.data?.user?.roles) {
                localStorage.setItem('roles', JSON.stringify(roleResponse.data.user.roles));
            }

            localStorage.setItem('productLink', product.productLink);
            localStorage.setItem('comission', product.productComission);

            const email = await fetchUserEmail(userId);
            if (!email) return;

            let productType = product.id;
            if (product.id === 'Sales') productType = 'EmailMarketing';

            const requestBody = {
                id: Number(userId),
                email,
                productType,
            };

            // Add period only for products with subscription
            if (product.hasSubscription) {
                requestBody.period = billingPeriod;
            }

            const stripeResponse = await axios.post('/api/v1/stripe', requestBody);

            window.location.href = stripeResponse.data.data;
        } catch (error) {
            console.error('Error in handlePurchase:', error);
        }
    };

    const handleUnsubscribe = (product) => {
        setSelectedProduct(product);
        setShowConfirmModal(true);
    };

    const confirmUnsubscribe = async () => {
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
    };

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hero Section */}
            <section className='relative pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8'>
                <div className='container max-w-8xl mx-auto'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        <div>
                            <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                PREMIUM PRODUCTS & SERVICES
                            </Badge>
                            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                                <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Pricing</span>
                            </h1>
                            <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5'></div>
                            <p className='text-lg sm:text-xl text-gray-300 max-w-3xl leading-relaxed mb-8'>
                                Discover our comprehensive suite of trading tools, educational resources, and premium services designed to elevate your trading
                                success.
                            </p>
                        </div>
                        {/* RIGHT */}
                        <div className='relative animate-slide-in-right '>
                            <div className='relative overflow-hidden '>
                                <div className='relative flex items-center justify-center w-full h-full'>
                                    <div className=' flex items-center justify-center w-full sm:w-fit bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                        <LottieAnimation
                                            src='/animations/pricingicon.json'
                                            className='w-[90%] h-full sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:max-w-[250px] lg:max-h-[250px]'
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing Toggle */}
                    <div className='flex items-center justify-center gap-4 mt-8'>
                        <span
                            className={`text-base font-semibold transition-colors duration-300 ${
                                billingPeriod === 'monthly' ? 'text-[#4cc7e8]' : 'text-gray-400'
                            }`}
                        >
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                            className='relative w-16 h-8 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#4cc7e8]/30'
                        >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                                    billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-0'
                                }`}
                            ></div>
                        </button>
                        <span
                            className={`text-base font-semibold transition-colors duration-300 ${
                                billingPeriod === 'yearly' ? 'text-[#4cc7e8]' : 'text-gray-400'
                            }`}
                        >
                            Yearly
                        </span>
                        {billingPeriod === 'yearly' && (
                            <Badge className='ml-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 text-xs font-bold animate-pulse'>
                                SAVE UP TO 58%
                            </Badge>
                        )}
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className='pb-10 sm:pb-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-6 sm:gap-8'>
                        {products.map((product, index) => {
                            const isPurchased = purchasedProducts[product.apiName] === 'Purchased';
                            const savings = getSavingsPercentage(product);

                            return (
                                <div key={product.id} className='group animate-slide-in-up' style={{ animationDelay: `${index * 200}ms` }}>
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
                                        <div
                                            className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                                                isPurchased ? 'from-green-400 to-emerald-500' : product.color
                                            }`}
                                        ></div>

                                        <CardHeader className='p-6 sm:p-8 pb-4'>
                                            <div className='flex items-center justify-between mb-6'>
                                                <div className='flex items-center space-x-4'>
                                                    <div
                                                        className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${
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

                                            <div className='text-center mb-6'>
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
                                                        <CheckCircle
                                                            className={`w-5 h-5 text-green-400 flex-shrink-0 ${!product.available && 'text-gray-500'}`}
                                                        />
                                                        <span
                                                            className={`text-sm sm:text-base leading-relaxed ${
                                                                product.available ? 'text-gray-300' : 'text-gray-500'
                                                            }`}
                                                        >
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
                                        ></div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Comparison */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            WHY CHOOSE BLACK SNOW
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Premium <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Digital Solutions</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Our comprehensive suite of products is designed to give you the competitive edge in today&apos;s dynamic markets.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-6 sm:gap-8'>
                        {[
                            {
                                icon: Target,
                                title: 'Precision Analytics',
                                description: 'Advanced market analysis and real-time data insights for informed decision making.',
                                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                            },
                            {
                                icon: Users,
                                title: 'Expert Community',
                                description: 'Connect with professional traders and learn from industry veterans.',
                                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                            },
                            {
                                icon: Zap,
                                title: 'Instant Execution',
                                description: 'Lightning-fast trade execution and real-time market notifications.',
                                color: 'from-[#4cc7e8] to-[#2a8dcc]',
                            },
                        ].map((feature, index) => (
                            <div key={index} className='group animate-slide-in-up' style={{ animationDelay: `${index * 150}ms` }}>
                                <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105 h-full'>
                                    <CardContent className='p-6 sm:p-8 text-center'>
                                        <div
                                            className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            <feature.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                        </div>
                                        <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            {feature.title}
                                        </h3>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
                        <Button
                            onClick={() => router.push('/login')}
                            className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold py-6 text-lg shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-2xl'
                        >
                            Signup Now
                        </Button>
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
        </div>
    );
}

export { Pricing };
