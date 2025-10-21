import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import lottie from 'lottie-web';
import { ArrowRight, BarChart3, CheckCircle, Clock, Eye, Globe, Loader2, Megaphone, Monitor, Play, Rocket, Star, Target, Users, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState } from 'react';

function Advertising() {
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
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showExistingApplicationModal, setShowExistingApplicationModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        website: '',
        podcast: '',
        twitter: '',
        youTube: '',
        facebook: '',
        image: '',
        companyName: '',
        description: '',
    });
    const cookies = parseCookies();
    const id = cookies.id;
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({
        fullName: '',
        website: '',
        podcast: '',
        twitter: '',
        youTube: '',
        facebook: '',
        image: '',
        companyName: '',
        description: '',
    });
    const [hasBillboard, setHasBillboard] = useState(false);

    useEffect(() => {
        const trackRefIdClick = async () => {
            // Get the refId from URL query parameters
            const { refId } = router.query;
            localStorage.setItem('referredby', refId);

            if (refId) {
                try {
                    // Get current URL without query parameters
                    const currentUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

                    const response = await fetch(`/api/v2/clicks/?id=${refId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            productLink: currentUrl,
                        }),
                    });

                    if (response.ok) {
                        console.log('RefId click tracked successfully');
                    } else {
                        console.error('Failed to track refId click');
                    }
                } catch (error) {
                    console.error('Error tracking refId click:', error);
                }
            }
        };

        // Only track when router is ready (to ensure query params are available)
        if (router.isReady) {
            trackRefIdClick();
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (id) {
            const fetchProductInfo = async () => {
                try {
                    const response = await axios.get(`/api/v2/get-user-product-info/?id=${id}`);
                    setHasBillboard(response.data.data.DigitalBillboard !== 'NotPurchased');
                } catch (error) {
                    console.error('Error fetching product info:', error);
                }
            };
            fetchProductInfo();
        }
    }, [id]);

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'gptfrontend'); // Replace with your Cloudinary upload preset
        formData.append('cloud_name', 'dpl3j2r3f'); // Replace with your Cloudinary cloud name

        try {
            const response = await axios.post('https://api.cloudinary.com/v1_1/dpl3j2r3f/image/upload', formData);
            setFormData((prev) => ({
                ...prev,
                image: response.data.secure_url,
            }));
            setErrors((prev) => ({ ...prev, image: '' }));
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleAdvertiseClick = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!id) {
            setShowLoginModal(true);
            setIsLoading(false);
            return;
        }

        if (!hasBillboard) {
            setShowPurchaseModal(true);
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`/api/v2/get-digital-billboard-status/?id=${id}`);
            if (response.data.status) {
                setShowExistingApplicationModal(true);
            } else {
                setShowFormModal(true);
            }
        } catch (error) {
            console.error('Error fetching billboard status:', error);
            setShowLoginModal(true); // Fallback if API fails
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartCampaignClick = handleAdvertiseClick;

    const validateForm = () => {
        const newErrors = {
            fullName: !formData.fullName ? 'Full Name is required' : '',
            website: !formData.website ? 'Website is required' : '',
            podcast: !formData.podcast ? 'Podcast is required' : '',
            twitter: !formData.twitter ? 'Twitter is required' : '',
            youTube: !formData.youTube ? 'YouTube is required' : '',
            facebook: !formData.facebook ? 'Facebook is required' : '',
            image: !formData.image ? 'Image is required' : '',
            companyName: !formData.companyName ? 'Company Name is required' : '',
            description: !formData.description ? 'Description is required' : '',
        };
        setErrors(newErrors);
        return Object.values(newErrors).every((error) => !error);
    };

    const handleFormSubmit = async () => {
        if (isSubmitting || !validateForm()) return;
        setIsSubmitting(true);

        try {
            const response = await axios.post(`/api/v2/digital-billboard/?id=${id}`, formData);
            if (response.status === 201) {
                setShowFormModal(false);
                setShowConfirmationModal(true);
            }
        } catch (error) {
            console.error('Error submitting billboard application:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const truncateImageName = (url: string) => {
        const maxLength = 30;
        const fileName = url.split('/').pop() || url;
        return fileName.length > maxLength ? fileName.substring(0, maxLength) + '...' : fileName;
    };

    return (
        <div className='min-h-screen bg-[#050608]'>
            {/* Hero Section */}
            <section className='relative pb-12 sm:pb-16 pt-16 sm:pt-20 md:pt-24 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-[90rem] relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* Left Content */}
                        <div className='space-y-8 sm:space-y-10 md:space-y-12 animate-slide-in-left'>
                            <div>
                                <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                    PREMIUM ADVERTISING
                                </Badge>
                                <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Digital</span>
                                    &nbsp;Billboards
                                </h1>
                                <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-6 sm:mb-8'></div>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Placing your business advertisements across our website has never been easier. In a few easy steps, activate your robust
                                    campaign and monitor your performance in real-time.
                                </p>
                                <p className='text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Advertise your <span className='text-[#4cc7e8] font-semibold'>Business, Podcast, Product Page</span>,{' '}
                                    <span className='text-[#2c7bbe] font-semibold'>Social Media</span> and etc.
                                </p>
                            </div>

                            {/* Feature List */}
                            <div className='space-y-4 sm:space-y-6'>
                                {[
                                    {
                                        title: 'Simple and Quick Setup',
                                        description: 'Launch your advertising campaign in just a few easy steps with no technical expertise required.',
                                        icon: Zap,
                                        color: 'from-[#4cc7e8] to-[#2c7bbe]',
                                    },
                                    {
                                        title: 'Global Exposure',
                                        description: "Get promoted to a worldwide audience, expanding your brand's reach far beyond local markets.",
                                        icon: Globe,
                                        color: 'from-[#2c7bbe] to-[#4cc7e8]',
                                    },
                                    {
                                        title: 'Real-Time Performance Tracking',
                                        description:
                                            'Monitor the effectiveness of your campaign with real-time analytics, giving you full control over your results.',
                                        icon: BarChart3,
                                        color: 'from-[#4cc7e8] to-[#2a8dcc]',
                                    },
                                    {
                                        title: 'Enhanced Visibility',
                                        description: "Maximize your brand's presence through prominent ad placement on key pages of our website.",
                                        icon: Eye,
                                        color: 'from-[#2a8dcc] to-[#2c7bbe]',
                                    },
                                ].map((feature, index) => (
                                    <div
                                        key={index}
                                        className='group flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 border border-[#2c7bbe]/20 hover:border-[#4cc7e8]/40 transition-all duration-300 animate-slide-in-left'
                                        style={{ animationDelay: `${index * 200}ms` }}
                                    >
                                        <div className='flex-shrink-0'>
                                            <div
                                                className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${feature.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                            >
                                                <CheckCircle className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <h3 className='text-lg sm:text-xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300 flex items-center'>
                                                {feature.title}
                                                <feature.icon className='w-4 h-4 sm:w-5 sm:h-5 ml-2 text-[#4cc7e8]' />
                                            </h3>
                                            <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    size='lg'
                                    className='group cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto'
                                    onClick={handleAdvertiseClick}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className='w-5 h-5 sm:w-6 sm:h-6 mr-3 animate-spin' />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Megaphone className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                            Advertise
                                            <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                        </>
                                    )}
                                </Button>
                                <Link href={'/billboards'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 cursor-pointer border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-auto'
                                    >
                                        <Monitor className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Digital Billboard
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className='relative animate-slide-in-right'>
                            {/* Main Play Button with Decorative Elements */}
                            <div className='relative flex items-center justify-center'>
                                {/* Decorative Background Elements */}
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    {/* Curved Lines */}
                                    <svg className='w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 opacity-20' viewBox='0 0 400 400'>
                                        <path d='M50,200 Q200,50 350,200' stroke='url(#curveGradient1)' strokeWidth='8' fill='none' className='animate-pulse' />
                                        <path
                                            d='M50,250 Q200,100 350,250'
                                            stroke='url(#curveGradient2)'
                                            strokeWidth='6'
                                            fill='none'
                                            className='animate-pulse delay-500'
                                        />
                                        <path
                                            d='M100,300 Q200,150 300,300'
                                            stroke='url(#curveGradient3)'
                                            strokeWidth='4'
                                            fill='none'
                                            className='animate-pulse delay-1000'
                                        />
                                        <defs>
                                            <linearGradient id='curveGradient1' x1='0%' y1='0%' x2='100%' y2='0%'>
                                                <stop offset='0%' stopColor='#4cc7e8' stopOpacity='0.6' />
                                                <stop offset='100%' stopColor='#2c7bbe' stopOpacity='0.3' />
                                            </linearGradient>
                                            <linearGradient id='curveGradient2' x1='0%' y1='0%' x2='100%' y2='0%'>
                                                <stop offset='0%' stopColor='#2a8dcc' stopOpacity='0.5' />
                                                <stop offset='100%' stopColor='#4cc7e8' stopOpacity='0.2' />
                                            </linearGradient>
                                            <linearGradient id='curveGradient3' x1='0%' y1='0%' x2='100%' y2='0%'>
                                                <stop offset='0%' stopColor='#2c7bbe' stopOpacity='0.4' />
                                                <stop offset='100%' stopColor='#2a8dcc' stopOpacity='0.1' />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    {/* Floating Dots */}
                                    <div className='absolute top-12 sm:top-16 left-12 sm:left-16 w-3 sm:w-4 h-3 sm:h-4 bg-[#4cc7e8] rounded-full animate-bounce opacity-60'></div>
                                    <div className='absolute top-24 sm:top-32 right-16 sm:right-20 w-2 sm:w-3 h-2 sm:h-3 bg-[#2c7bbe] rounded-full animate-pulse delay-300 opacity-70'></div>
                                    <div className='absolute bottom-20 sm:bottom-24 left-20 sm:left-24 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#2a8dcc] rounded-full animate-ping delay-700 opacity-50'></div>
                                    <div className='absolute bottom-12 sm:bottom-16 right-12 sm:right-16 w-4 sm:w-5 h-4 sm:h-5 bg-[#4cc7e8] rounded-full animate-bounce delay-1000 opacity-40'></div>
                                    <div className='absolute top-16 sm:top-20 right-24 sm:right-32 w-2 sm:w-3 h-2 sm:h-3 bg-[#2c7bbe] rounded-full animate-pulse delay-1500 opacity-60'></div>
                                    <div className='absolute bottom-24 sm:bottom-32 left-24 sm:left-32 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#2a8dcc] rounded-full animate-ping delay-2000 opacity-50'></div>
                                </div>

                                {/* Main Play Button */}
                                <div className='relative group'>
                                    <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse'></div>
                                    <div className='relative w-40 sm:w-44 md:w-48 h-40 sm:h-44 md:h-48 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] rounded-2xl sm:rounded-3xl border-4 border-[#4cc7e8]/30 flex items-center justify-center shadow-xl sm:shadow-2xl shadow-[#2c7bbe]/40 transform group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-500'>
                                        <div className='w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl transform group-hover:rotate-12 transition-transform duration-500'>
                                            <Play className='w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white ml-1 sm:ml-2' />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Stats Cards */}
                            <div className='absolute -top-6 sm:-top-8 -left-6 sm:-left-8 bg-gradient-to-br from-[#4cc7e8]/90 to-[#2c7bbe]/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/20 shadow-xl sm:shadow-2xl animate-float-slow'>
                                <div className='flex items-center space-x-2 sm:space-x-3'>
                                    <Users className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                                    <div>
                                        <div className='text-xl sm:text-2xl font-bold text-white'>50K+</div>
                                        <div className='text-white/80 text-xs sm:text-sm'>Daily Views</div>
                                    </div>
                                </div>
                            </div>

                            <div className='absolute -bottom-6 sm:-bottom-8 -right-6 sm:-right-8 bg-gradient-to-br from-[#2a8dcc]/90 to-[#4cc7e8]/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/20 shadow-xl sm:shadow-2xl animate-float-slow delay-1000'>
                                <div className='flex items-center space-x-2 sm:space-x-3'>
                                    <Target className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                                    <div>
                                        <div className='text-xl sm:text-2xl font-bold text-white'>98%</div>
                                        <div className='text-white/80 text-xs sm:text-sm'>Reach Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-6 py-2 text-sm font-bold'>
                            ADVERTISING EXCELLENCE
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6'>
                            Why Choose Our <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Digital Platform</span>
                        </h2>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
                            Experience the power of premium digital advertising with our cutting-edge platform designed for maximum impact and ROI.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {[
                            {
                                icon: Rocket,
                                title: 'Instant Launch',
                                description: 'Get your campaigns live in minutes with our streamlined setup process.',
                            },
                            {
                                icon: BarChart3,
                                title: 'Advanced Analytics',
                                description: 'Track performance with detailed insights and real-time reporting.',
                            },
                            {
                                icon: Globe,
                                title: 'Global Reach',
                                description: 'Connect with audiences worldwide through our extensive network.',
                            },
                            {
                                icon: Target,
                                title: 'Precision Targeting',
                                description: 'Reach your ideal customers with advanced targeting capabilities.',
                            },
                            {
                                icon: Clock,
                                title: '24/7 Support',
                                description: 'Get help whenever you need it with our round-the-clock support team.',
                            },
                            {
                                icon: Star,
                                title: 'Premium Placement',
                                description: 'Secure prime advertising spots on high-traffic pages for maximum visibility.',
                            },
                        ].map((feature, index) => (
                            <Card
                                key={index}
                                className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'
                            >
                                <CardContent className='p-8'>
                                    <div className='w-16 h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center mb-6'>
                                        <feature.icon className='w-8 h-8 text-white' />
                                    </div>
                                    <h3 className='text-2xl font-bold text-white mb-4'>{feature.title}</h3>
                                    <p className='text-gray-300 leading-relaxed'>{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section with Lottie Animation */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-6xl'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        {/* Left Content */}
                        <div className='space-y-8'>
                            <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-8 py-3 text-sm font-bold'>
                                START ADVERTISING TODAY
                            </Badge>
                            <h2 className='text-5xl lg:text-6xl font-black text-white mb-6'>
                                Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Transform</span>
                                <br />
                                Your Future?
                            </h2>
                            <p className='text-xl text-gray-300 leading-relaxed'>
                                Join thousands of successful businesses who have chosen our platform to reach their target audience and drive exceptional
                                results.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-6 pt-8'>
                                <Button
                                    size='lg'
                                    className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] cursor-pointer hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-12 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300'
                                    onClick={handleStartCampaignClick}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className='w-6 h-6 mr-3 animate-spin' />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Megaphone className='w-6 h-6 mr-3' />
                                            Start Campaign
                                            <ArrowRight className='w-5 h-5 ml-3' />
                                        </>
                                    )}
                                </Button>
                                <Link href={'/pricing'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='cursor-pointer border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-12 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300 bg-transparent'
                                    >
                                        <BarChart3 className='w-6 h-6 mr-3' />
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Animation */}
                        <div className='flex items-center justify-center'>
                            <div className='w-96 h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/advretisingicon.json' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Login Modal */}
            <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowLoginModal(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>

                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='min-w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Megaphone className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Login Required</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold'>Please login to advertise your billboard.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className='text-center py-4 space-y-4'>
                        <p className='text-gray-300 leading-relaxed'>You need to be logged in to proceed with advertising.</p>
                        <Link href='/login'>
                            <Button className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl cursor-pointer'>
                                Login
                            </Button>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Purchase Modal */}
            <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowPurchaseModal(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>

                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='min-w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Monitor className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Purchase Required</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold'>
                                    Please purchase a Digital Billboard subscription to advertise.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className='text-center py-4 space-y-4'>
                        <p className='text-gray-300 leading-relaxed'>You need to purchase a subscription to proceed with advertising.</p>
                        <Link href='/pricing'>
                            <Button className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl cursor-pointer'>
                                Purchase Now
                            </Button>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Form Modal */}
            <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl max-h-[80vh] overflow-y-auto'>
                    <button
                        onClick={() => setShowFormModal(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>

                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='min-w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Monitor className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Billboard Application</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold'>
                                    Please fill out the details for your advertising application.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className='space-y-6 py-4'>
                        <div className='space-y-2'>
                            {/* <Label className='text-white font-semibold'>Full Name</Label> */}
                            <Input
                                placeholder='Enter your Full Name'
                                className='bg-[#0a0b0f] border-[#2c7bbe]/30 text-white'
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                            {errors.fullName && <p className='text-red-500 text-sm'>{errors.fullName}</p>}
                        </div>
                        <div className='space-y-2'>
                            {/* <Label className='text-white font-semibold'>Website</Label> */}
                            <Input
                                placeholder='Enter your Website URL'
                                className='bg-[#0a0b0f] border-[#2c7bbe]/30 text-white'
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
                            {errors.website && <p className='text-red-500 text-sm'>{errors.website}</p>}
                        </div>
                        <div className='space-y-2'>
                            {/* <Label className='text-white font-semibold'>Podcast</Label> */}
                            <Input
                                placeholder='Enter your Podcast Link'
                                className='bg-[#0a0b0f] border-[#2c7bbe]/30 text-white'
                                value={formData.podcast}
                                onChange={(e) => setFormData({ ...formData, podcast: e.target.value })}
                            />
                            {errors.podcast && <p className='text-red-500 text-sm'>{errors.podcast}</p>}
                        </div>
                        <div className='space-y-2'>
                            {/* <Label className='text-white font-semibold'>Twitter</Label> */}
                            <Input
                                placeholder='Enter your Twitter Link'
                                className='bg-[#0a0b0f] border-[#2c7bbe]/30 text-white'
                                value={formData.twitter}
                                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                            />
                            {errors.twitter && <p className='text-red-500 text-sm'>{errors.twitter}</p>}
                        </div>
                        <div className='space-y-2'>
                            {/* <Label className='text-white font-semibold'>YouTube</Label> */}
                            <Input
                                placeholder='Enter your Youtube Link'
                                className='bg-[#0a0b0f] border-[#2c7bbe]/30 text-white'
                                value={formData.youTube}
                                onChange={(e) => setFormData({ ...formData, youTube: e.target.value })}
                            />
                            {errors.youTube && <p className='text-red-500 text-sm'>{errors.youTube}</p>}
                        </div>
                        <div className='space-y-2'>
                            {/* <Label className='text-white font-semibold'>Facebook</Label> */}
                            <Input
                                placeholder='Enter your Facebook Link'
                                className='bg-[#0a0b0f] border-[#2c7bbe]/30 text-white'
                                value={formData.facebook}
                                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                            />
                            {errors.facebook && <p className='text-red-500 text-sm'>{errors.facebook}</p>}
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-white font-semibold'>Image</Label>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file);
                                }}
                                className='bg-[#0a0b0f] border-[#2c7bbe]/30 border-2 text-white p-2 rounded-lg w-full'
                            />
                            {formData.image && <p className='text-green-400 text-sm break-words'>{truncateImageName(formData.image)}</p>}
                            {errors.image && <p className='text-red-500 text-sm'>{errors.image}</p>}
                        </div>
                        <div className='space-y-2'>
                            {/* <Label className='text-white font-semibold'>Company Name</Label> */}
                            <Input
                                placeholder='Enter your Company Name'
                                className='bg-[#0a0b0f] border-[#2c7bbe]/30 text-white'
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                            {errors.companyName && <p className='text-red-500 text-sm'>{errors.companyName}</p>}
                        </div>
                        <div className='space-y-2'>
                            {/* <Label className='text-white font-semibold'>Description</Label> */}
                            <Input
                                placeholder='Enter Description'
                                className='bg-[#0a0b0f] border-[#2c7bbe]/30 text-white'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            {errors.description && <p className='text-red-500 text-sm'>{errors.description}</p>}
                        </div>
                        <Button
                            onClick={handleFormSubmit}
                            className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl cursor-pointer'
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className='w-6 h-6 mr-3 animate-spin' />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal */}
            <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowConfirmationModal(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>

                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='min-w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Monitor className='w-7 h-7 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Application Submitted</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold'>
                                    Your billboard advertising application has been sent to admin for approval. We will inform you via email if the admin
                                    approves or rejects.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Existing Application Modal */}
            <Dialog open={showExistingApplicationModal} onOpenChange={setShowExistingApplicationModal}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <button
                        onClick={() => setShowExistingApplicationModal(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>

                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='min-w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Monitor className='w-7 h-7 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Application Status</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold'>
                                    You have already applied for a digital billboard. Please wait for approval from admin; we will inform you as soon as
                                    possible via email. Alternatively, visit{' '}
                                    <Link href='/billboards' className='underline'>
                                        /billboards
                                    </Link>{' '}
                                    to check your status.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export { Advertising };
