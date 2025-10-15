import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import Cookies from 'js-cookie';
import lottie from 'lottie-web';
import { ArrowRight, BookOpen, Calendar, CheckCircle, Clock, DollarSign, MessageSquare, Monitor, Newspaper, Star, Target, Users, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState } from 'react';

function Pricing() {
    const LottieAnimation = ({ src, loop, autoplay, style }) => {
        const containerRef = useRef(null);

        useEffect(() => {
            if (containerRef.current) {
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

    const [isClient, setIsClient] = useState(false);
    const [purchasedProducts, setPurchasedProducts] = useState({});
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);
    const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = useState(false);
    const router = useRouter();

    // Ensure code runs only on client-side
    useEffect(() => {
        setIsClient(true);
        // Debug: Log all cookies to verify userId presence
        console.log('All cookies:', Cookies.get());
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
            price: '$100',
            period: '',
            description: 'Premium trading insights and market analysis delivered weekly',
            features: [
                'Get your weekly stock picks for day trades, swing trades, options and dividends',
                'Receive trading strategy from the best performances in top market sectors including AI, EV and Tech',
                'Catch blog updates from every week',
                'Get detailed time special offers and sponsorships',
                'Read Featured News Articles',
            ],
            icon: Newspaper,
            color: 'from-[#4cc7e8] to-[#2c7bbe]',
            available: true,
            popular: true,
            apiName: 'NewsLetter',
            productLink: 'http://localhost:3000',
            productComission: '100',
        },
        {
            id: 'RSVP',
            name: 'RSVP',
            price: '$10',
            period: '/Month or $80/Year',
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
            productLink: 'http://localhost:3000/rsvp',
            productComission: '10',
        },
        {
            id: 'DigitalBillboard',
            name: 'Digital Billboard',
            price: '$150',
            period: '/Month or $600/Year',
            description: 'Premium advertising placement across our platform',
            features: ['Simple and Quick Setup', 'Global Exposure', 'Real-Time Performance Tracking', 'Enhanced Visibility'],
            icon: Monitor,
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
            available: true,
            popular: false,
            apiName: 'DigitalBillboard',
            productLink: 'http://localhost:3000/advertising',
            productComission: '150',
        },
        {
            id: 'Sales',
            name: 'Email/SMS System',
            price: '$40',
            period: '',
            description: 'Comprehensive communication platform for your business',
            features: ['Send Unlimited Emails/SMS', 'Create Custom Emails/SMS', 'Send Emails/SMS in bulk', 'Scheduled Campaigns'],
            icon: MessageSquare,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
            available: true,
            popular: false,
            apiName: 'EmailSMS',
            productLink: 'http://localhost:3000/emailMarketing',
            productComission: '100',
        },
    ];

    const fetchUserEmail = async (userId) => {
        setIsLoadingEmail(true);
        try {
            const response = await axios.get(`/api/v2/getUserMail/?id=${userId}`);
            return response.data.email;
        } catch (error) {
            console.error('Error fetching user email:', error);
            return null; // Fallback to null if email fetch fails
        } finally {
            setIsLoadingEmail(false);
        }
    };

    const handlePurchase = async (product) => {
        if (!isClient) {
            console.warn('Cannot access localStorage on server-side');
            return;
        }
        const userId = localStorage.getItem('userId');

        if (!userId) {
            console.log('No userId found, showing signup modal');
            setShowSignupModal(true);
            return;
        }

        if (isLoadingEmail) return; // Prevent multiple clicks while loading

        // Map product.id to role for the deleteRole API
        let role;
        switch (product.id) {
            case 'NewsLetter':
            case 'newsletter':
                role = 'NewsLetter';
                break;
            case 'RSVP':
            case 'rsvp':
                role = 'Rsvp';
                break;
            case 'DigitalBillboard':
            case 'digital-billboard':
                role = 'DigitalBillboard';
                break;
            case 'email-sms':
            case 'EmailSMS':
                role = 'Sales';
                break;
            default:
                role = product.id; // Fallback to id if no match
        }

        try {
            // First, update the user role
            console.log(`Updating user role to: ${role}`);
            const roleResponse = await axios.patch(`/api/v2/update-roles/?id=${userId}`, {
                rolesToAdd: role,
            });
            console.log(roleResponse.data?.user?.roles);
            if (roleResponse) localStorage.setItem('roles', JSON.stringify(roleResponse.data?.user?.roles));

            localStorage.setItem('productLink', product.productLink);
            localStorage.setItem('comission', product.productComission);

            if (roleResponse.status === 200) {
                // Fetch user email
                const email = await fetchUserEmail(userId);
                if (!email) {
                    console.error('Could not fetch user email');
                    return;
                }

                // Map product.id to formatted productType for Stripe API
                let productType;
                switch (product.id) {
                    case 'newsletter':
                        productType = 'NewsLetter';
                        break;
                    case 'rsvp':
                        productType = 'RSVP';
                        break;
                    case 'digital-billboard':
                        productType = 'DigitalBillboard';
                        break;
                    default:
                        productType = product.id; // Fallback to id if no match
                }

                // Proceed with existing purchase logic
                const stripeResponse = await axios.post('/api/v1/stripe', {
                    id: Number(userId),
                    email,
                    productType,
                });

                // Redirect to Stripe checkout
                window.location.href = stripeResponse.data.data;
            } else {
                console.error('Failed to update user role');
                // Handle role update failure (you might want to show an error message to user)
            }
        } catch (error) {
            console.error('Error in handlePurchase:', error);

            // Check if the error is from role update or stripe API
            if (error.config && error.config.url && error.config.url.includes('deleteRole')) {
                console.error('Role update failed:', error);
                // Handle role update error (show user-friendly message)
            } else {
                console.error(`${product.name} purchase error:`, error);
                // Handle Stripe API error (show user-friendly message)
            }
        }
    };

    const handleUnsubscribe = (product) => {
        setSelectedProduct(product);
        setShowConfirmModal(true);
    };

    const confirmUnsubscribe = async () => {
        if (isLoadingUnsubscribe) return; // Prevent multiple clicks while loading

        const cookies = parseCookies();
        const id = cookies.id;

        if (!id || !selectedProduct) return;

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
            } else {
                console.error('Unsubscribe failed');
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
            <section className='relative pt-28 px-8'>
                <div className='container mx-auto max-w-6xl relative z-10'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-8 px-8 py-3 text-sm font-bold animate-fade-in'>
                            PREMIUM PRODUCTS & SERVICES
                        </Badge>
                        <h1 className='text-6xl lg:text-7xl font-black text-white mb-5 apartments-tight animate-slide-in-up'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Pricing</span>
                        </h1>
                        <div className='w-60 h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mx-auto mb-8 animate-slide-in-up delay-200'></div>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-slide-in-up delay-300'>
                            Discover our comprehensive suite of trading tools, educational resources, and premium services designed to elevate your trading
                            success.
                        </p>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className='relative py-20 px-8'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='grid lg:grid-cols-2 gap-8'>
                        {products.map((product, index) => {
                            const isPurchased = purchasedProducts[product.apiName] === 'Purchased';

                            return (
                                <Card
                                    key={product.id}
                                    className={`group relative bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 transition-all duration-500 rounded-3xl overflow-hidden transform hover:scale-105 animate-fade-in-up ${
                                        isPurchased
                                            ? 'border-green-500/50'
                                            : product.available
                                            ? 'border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 cursor-pointer'
                                            : 'border-gray-600/30 hover:border-gray-500/50'
                                    }`}
                                    style={{ animationDelay: `${index * 200}ms` }}
                                    onClick={() => product.available && !isPurchased && handlePurchase(product)}
                                >
                                    {/* Gradient Border Effect */}
                                    <div
                                        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isPurchased ? 'bg-green-500/90' : product.color} ${
                                            !product.available ? 'opacity-50' : ''
                                        }`}
                                    ></div>

                                    <CardHeader className='p-8 pb-4'>
                                        <div className='flex items-center justify-between mb-6'>
                                            <div className='flex items-center space-x-4'>
                                                <div
                                                    className={`w-16 h-16 bg-gradient-to-r ${
                                                        isPurchased ? 'bg-green-500/70' : product.color
                                                    } rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                                                        !product.available ? 'opacity-50' : ''
                                                    }`}
                                                >
                                                    <product.icon className='w-8 h-8 text-white' />
                                                </div>
                                                <div>
                                                    <CardTitle className='text-3xl font-bold text-white mb-2'>{product.name}</CardTitle>
                                                    <p className='text-gray-400 text-sm'>{product.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pricing */}
                                        <div className='text-center mb-6'>
                                            <div className={`text-5xl font-black ${isPurchased ? 'text-green-500' : 'text-[#4cc7e8]'} mb-2}`}>
                                                {product.price}
                                                {product.period && <span className='text-2xl text-gray-400'>{product.period}</span>}
                                            </div>
                                            {product.available && <div className='text-sm text-gray-500 mt-2'>VAT & local taxes may apply</div>}
                                        </div>
                                    </CardHeader>

                                    <CardContent className='p-8 pt-0'>
                                        {/* Features List */}
                                        <div className='space-y-4 mb-8'>
                                            {product.features.map((feature, featureIndex) => (
                                                <div
                                                    key={featureIndex}
                                                    className='flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 border border-[#2c7bbe]/20 group-hover:border-[#4cc7e8]/30 transition-all duration-300'
                                                >
                                                    <CheckCircle
                                                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${product.available ? 'text-green-400' : 'text-gray-500'}`}
                                                    />
                                                    <span className={`text-sm leading-relaxed ${product.available ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Purchase/Unsubscribe Button */}
                                        <div className='text-center'>
                                            {product.available ? (
                                                isPurchased ? (
                                                    <Button
                                                        size='lg'
                                                        className={`group cursor-pointer w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-6 text-lg font-bold shadow-2xl shadow-red-500/40 transition-all duration-300 transform hover:scale-105`}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent card click from triggering
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
                                                        className={`group cursor-pointer w-full bg-gradient-to-r ${product.color} hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white py-6 text-lg font-bold shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105`}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent card click from triggering
                                                            handlePurchase(product);
                                                        }}
                                                        disabled={isLoadingEmail}
                                                    >
                                                        <DollarSign className='w-6 h-6 mr-3' />
                                                        {isLoadingEmail ? 'Loading...' : 'Purchase'}
                                                        <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                                    </Button>
                                                )
                                            ) : (
                                                <div className='w-full py-6 text-center'>
                                                    <Badge className='bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 text-lg font-bold'>
                                                        <Clock className='w-5 h-5 mr-2' />
                                                        Coming Soon!
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>

                                    {/* Hover Effect Overlay */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-r ${product.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                                    ></div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Comparison Section */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-6xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                            WHY CHOOSE BLACK SNOW
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6 animate-slide-in-up'>
                            Premium <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Trading Solutions</span>
                        </h2>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            Our comprehensive suite of products is designed to give you the competitive edge in today&apos;s dynamic markets.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-8'>
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
                            <Card
                                key={index}
                                className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-2xl overflow-hidden transform hover:scale-105 animate-fade-in-up'
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                <CardContent className='relative p-8 text-center'>
                                    <div
                                        className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <feature.icon className='w-8 h-8 text-white' />
                                    </div>
                                    <h3 className='text-2xl font-bold text-white mb-4 group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-gray-300 leading-relaxed'>{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section with Rocket Animation */}
            <section className='relative py-24 px-8'>
                <div className='container mx-auto max-w-5xl'>
                    <div className='relative bg-gradient-to-br from-[#0a0b0f]/80 to-[#050608]/90 backdrop-blur-xl border border-[#2c7bbe]/30 rounded-3xl p-12 overflow-hidden'>
                        {/* Background Elements */}
                        <div className='absolute top-0 right-0 w-64 h-64 bg-[#4cc7e8]/10 rounded-full blur-3xl'></div>
                        <div className='absolute bottom-0 left-0 w-48 h-48 bg-[#2c7bbe]/10 rounded-full blur-3xl'></div>

                        <div className='relative z-10 grid lg:grid-cols-2 gap-12 items-center'>
                            {/* Content */}
                            <div className='text-center lg:text-left'>
                                <Badge className='bg-[#2c7bbe]/20 text-[#4cc7e8] border border-[#2c7bbe]/30 mb-6'>START YOUR JOURNEY TODAY</Badge>
                                <h2 className='text-4xl lg:text-5xl font-bold text-white mb-6'>
                                    Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Transform</span>
                                    <br />
                                    Your Trading?
                                </h2>
                                <p className='text-xl text-gray-300 mb-8 leading-relaxed'>
                                    Join thousands of successful traders who have chosen Black Snow to accelerate their trading journey and achieve consistent
                                    profitability.
                                </p>
                                <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                                    <Link href={'/login?signup'}>
                                        <Button
                                            size='lg'
                                            className='cursor-pointer w-full sm:w-fit bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white px-8 py-4 text-lg font-bold'
                                        >
                                            <Star className='w-5 h-5 mr-2' />
                                            Get Started
                                            <ArrowRight className='w-5 h-5 ml-2' />
                                        </Button>
                                    </Link>
                                    <Link href={'/about'}>
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            className='cursor-pointer border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] w-full sm:w-fit px-8 py-4 text-lg font-bold bg-transparent'
                                        >
                                            <BookOpen className='w-5 h-5 mr-2' />
                                            Learn More
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Rocket Animation */}
                            <div className='flex justify-center lg:justify-end'>
                                <div className='relative'>
                                    {/* Animation Container */}
                                    <div className='w-96 h-96 relative'>
                                        <LottieAnimation src='/animations/pricingicon.json' loop={true} autoplay={true} />
                                    </div>

                                    {/* Decorative Elements */}
                                    <div className='absolute -top-4 -right-4 w-8 h-8 bg-[#4cc7e8]/30 rounded-full animate-pulse'></div>
                                    <div className='absolute -bottom-4 -left-4 w-6 h-6 bg-[#2c7bbe]/40 rounded-full animate-pulse delay-1000'></div>
                                    <div className='absolute top-1/2 -left-8 w-4 h-4 bg-[#4cc7e8]/50 rounded-full animate-bounce delay-500'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Signup Modal */}
            <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowSignupModal(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>

                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Calendar className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Signup Required</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold'>For purchasing any product please signup.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className='text-center py-4 space-y-4'>
                        <p className='text-gray-300 leading-relaxed'>Please sign up to proceed with your purchase.</p>
                        <Button
                            onClick={() => router.push('/login?signup')}
                            className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl cursor-pointer'
                        >
                            Signup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowConfirmModal(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>

                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Calendar className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Confirm Unsubscribe</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold'>
                                    Are you sure you want to unsubscribe from {selectedProduct?.name}?
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className='text-center py-4 space-y-4'>
                        <p className='text-gray-300 leading-relaxed'>This action cannot be undone.</p>
                        <Button
                            onClick={confirmUnsubscribe}
                            className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl cursor-pointer'
                            disabled={isLoadingUnsubscribe}
                        >
                            {isLoadingUnsubscribe ? 'Processing...' : 'Confirm'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowSuccessModal(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>

                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Calendar className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Unsubscribed Successfully</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold'>You successfully unsubscribed</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className='text-center py-4 space-y-4'>
                        <p className='text-gray-300 leading-relaxed'>Redirecting to home page...</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export { Pricing };
