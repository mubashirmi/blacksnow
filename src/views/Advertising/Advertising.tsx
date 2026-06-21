import AuthModal from '@/components/AuthModal';
import DigitalBillboardSlideshow from '@/components/DigitalBillboardSlideshow';
import { PricingComponent } from '@/components/PricingComponent';
import ShareBanner from '@/components/ShareBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import lottie from 'lottie-web';
import { BarChart3, CheckCircle, Clock, Eye, Globe, Loader2, Megaphone, Monitor, Rocket, Star, Target, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

function Advertising() {
    // const pricingRef = useRef<HTMLDivElement | null>(null);
    const LottieAnimation = ({
        src,
        loop = true,
        autoplay = true,
        style,
        className = '',
    }: {
        src: string;
        loop?: boolean;
        autoplay?: boolean;
        style?: CSSProperties;
        className?: string;
    }) => {
        const containerRef = useRef<HTMLDivElement | null>(null);

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

        return <div ref={containerRef} className={className} style={style} />;
    };
    const [slideshowOpen, setSlideshowOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [openPricingAfterAuth, setOpenPricingAfterAuth] = useState(false);
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

    const isUserLoggedIn = () => {
        const cookies = parseCookies();
        const cookieId = cookies?.id;
        const localId = typeof window !== 'undefined' ? localStorage.getItem('userId') || localStorage.getItem('id') : null;
        return Boolean(cookieId || localId);
    };

    const handlePurchaseClick = () => {
        if (isUserLoggedIn()) {
            setAuthOpen(false);
            setOpenPricingAfterAuth(false);
            setPricingOpen(true);
            return;
        }

        setPricingOpen(false);
        setOpenPricingAfterAuth(false);
        setAuthOpen(true);
    };

    const handleAuthSuccess = () => {
        setPricingOpen(false);
        setOpenPricingAfterAuth(true);
        setAuthOpen(false);
        return false;
    };

    useEffect(() => {
        if (authOpen || !openPricingAfterAuth) return;

        const timer = window.setTimeout(() => {
            setOpenPricingAfterAuth(false);
            setPricingOpen(true);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [authOpen, openPricingAfterAuth]);

    const handlePurchaseRequiredClick = () => {
        setShowPurchaseModal(false);
        window.setTimeout(() => {
            setPricingOpen(true);
        }, 250);
    };

    useEffect(() => {
        const trackRefIdClick = async () => {
            // Get the refId from URL query parameters
            const { refId } = router.query;
            localStorage.setItem('referredby', refId);

            if (refId) {
                try {
                    // Get current URL without query parameters
                    const currentUrl = `https://blacksnowholdings.com/advertising`;

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

        const currentId = parseCookies().id || (typeof window !== 'undefined' ? localStorage.getItem('userId') || localStorage.getItem('id') : null);

        if (!currentId) {
            setPricingOpen(false);
            setOpenPricingAfterAuth(false);
            setAuthOpen(true);
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
            setAuthOpen(true); // Fallback if API fails
        } finally {
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line
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
            <ShareBanner />
            {/* Hero Section */}
            <section className='relative overflow-x-hidden lg:overflow-visible py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* Left Content */}
                        <div className='space-y-8 sm:space-y-10 md:space-y-12 animate-slide-in-left'>
                            <div>
                                <div className='inline-block'>
                                    <h1 className='text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                            Digital
                                        </span>
                                        &nbsp;Billboards
                                    </h1>
                                </div>

                                <p className='text-base sm:text-md md:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Your Digital Billboard positions your business in front of active buyers exactly when intent is highest, running nonstop to
                                    funnel traffic back to your advertisement automatically. Every impression is monitored and optimized to maximize visibility,
                                    without the need for a design or marketing team. It delivers simple, always-on exposure built for speed, clarity, and
                                    reliable results.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    size='lg'
                                    className='group border-2 box-border border-[#4cc7e8] cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    onClick={() => setSlideshowOpen(true)}
                                >
                                    Learn More
                                </Button>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    variant='outline'
                                    className='border-2 cursor-pointer border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Purchase
                                </Button>
                            </div>
                        </div>

                        {/* RIGHT - Mobile */}
                        <div className='relative w-full max-w-full overflow-hidden lg:hidden'>
                            <div className='relative w-full max-w-full overflow-hidden'>
                                <div className='relative flex items-center justify-center w-full h-full'>
                                    <div className='flex items-center justify-center w-full max-w-[340px] mx-auto rounded-2xl border border-[#2c7bbe]/20 sm:max-w-[400px] sm:rounded-3xl md:max-w-[500px]'>
                                        <LottieAnimation
                                            src='/animations/billboardherosection.json'
                                            className='w-full h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]'
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT - Desktop - kept like your attached code */}
                        <div className='relative hidden lg:block animate-slide-in-right '>
                            <div className='relative overflow-hidden '>
                                <div className='relative flex items-center justify-center w-full h-full'>
                                    <div className=' flex items-center justify-center w-full sm:w-fit rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                        <LottieAnimation src='/animations/billboardherosection.json' loop={true} autoplay={true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8  bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='mt-10 sm:mt-6 container mx-auto max-w-8xl relative z-10 '>
                    <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 text-center'>
                        Digital Billboard <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Features</span>{' '}
                    </h2>
                    <p className='text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed text-center px-20'>
                        High-visibility placement, real-time analytics, share buttons, up to 4 campaigns, and team access.
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-10'>
                        {[
                            {
                                title: 'High-Visibility Placement',
                                description:
                                    'Your ads appear in premium online locations that drive real clicks and real visibility. No confusing settings—just plug in your offer and let the system distribute traffic.',
                                icon: Eye,
                                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                            },
                            {
                                title: 'Live Analytics Dashboard',
                                description: 'Track impressions, clicks, and engagement in real time. You always know exactly how your campaign is performing.',
                                icon: BarChart3,
                                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                            },
                            {
                                title: 'Simple Setup & Zero Maintenance',
                                description:
                                    'Upload your content once and let the system run itself. Perfect for business owners who want steady traffic without extra work.',
                                icon: Zap,
                                color: 'from-[#4cc7e8] to-[#2a8dcc]',
                            },
                            {
                                title: 'Create Up to 4 Billboards',
                                description:
                                    'Run multiple billboard campaigns at once for different products, offers, or audiences. Maximize your exposure with more digital real estate.',
                                icon: Monitor,
                                color: 'from-[#2a8dcc] to-[#2c7bbe]',
                            },
                            {
                                title: 'Email & SMS Share Buttons',
                                description:
                                    'Your ads include built-in share buttons that let viewers send your offer instantly through email or SMS. This expands your reach through effortless referrals.',
                                icon: Megaphone,
                                color: 'from-[#4cc7e8] to-[#2c7bbe]',
                            },
                            {
                                title: 'Add Multiple Users',
                                description:
                                    'Invite team members into the platform with controlled access. Great for larger businesses and teams that need collaborative management.',
                                icon: CheckCircle,
                                color: 'from-[#2c7bbe] to-[#4cc7e8]',
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className='group relative overflow-hidden cursor-pointer rounded-2xl border border-[#2c7bbe]/20 bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/5 p-5 sm:p-6 transition-all duration-300 hover:border-[#4cc7e8]/40 hover:translate-y-[-2px]'
                            >
                                {/* glow */}
                                <div className='pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#4cc7e8]/10 to-[#2c7bbe]/10' />

                                <div className='relative flex items-start gap-4'>
                                    <div
                                        className={`flex h-12 w-12 p-2 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <feature.icon className='h-14 w-14 text-white' />
                                    </div>

                                    <div className='space-y-2'>
                                        <h3 className='text-lg font-bold text-white group-hover:text-[#4cc7e8] transition-colors'>{feature.title}</h3>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Features Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-20'>
                        <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Why Choose Our{' '}
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Digital Billboard?</span>
                        </h2>
                        <p className='text-base sm:text-lg text-gray-300 max-w-3xl mx-auto'>
                            Experience the power of premium digital advertising with our cutting-edge platform designed for maximum impact and ROI.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {[
                            {
                                icon: Globe,
                                title: '24/7 Brand Visibility',
                                description: 'Your brand receives nonstop visibility 24/7 without added workload.',
                            },
                            {
                                icon: Star,
                                title: 'Premium Traffic',
                                description: 'Premium share buttons ensure real traffic and meaningful attention.',
                            },
                            {
                                icon: Target,
                                title: 'Automatic Optimization',
                                description: 'Automatic optimization keeps your ads performing consistently well.',
                            },
                            {
                                icon: Rocket,
                                title: 'Fast Setup',
                                description: 'The entire system is designed for quick setup and ease of use.',
                            },
                            {
                                icon: BarChart3,
                                title: 'Clear Analytics',
                                description: 'Analytics give you complete clarity on your performance at all times.',
                            },
                            {
                                icon: Clock,
                                title: 'Hands-Off Exposure',
                                description: 'Reliable, hands-off exposure that keeps your business in front of buyers.',
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
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        {/* Left Content */}
                        <div className='space-y-8'>
                            <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
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
                                    className='group border-2 box-border border-[#4cc7e8] cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    onClick={() => setSlideshowOpen(true)}
                                >
                                    Learn More
                                </Button>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    variant='outline'
                                    className='cursor-pointer border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-12 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300 bg-transparent w-full sm:w-[300px]'
                                >
                                    Purchase
                                </Button>
                            </div>
                        </div>

                        {/* Right Animation */}
                        <div className='flex items-center justify-center'>
                            <div className='w-80 h-80 sm:w-96 sm:h-96 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/advretisingicon.json' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <DigitalBillboardSlideshow open={slideshowOpen} onOpenChange={setSlideshowOpen} />

            {authOpen && (
                <AuthModal
                    open={authOpen}
                    onOpenChange={(open) => {
                        setAuthOpen(open);
                        if (open) setPricingOpen(false);
                    }}
                    defaultView='signin'
                    sourceRoute='/advertising'
                    onSuccess={handleAuthSuccess}
                />
            )}

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
                        <Button
                            onClick={handlePurchaseRequiredClick}
                            className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl cursor-pointer'
                        >
                            Purchase Now
                        </Button>
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

            {!authOpen && <PricingComponent name='DigitalBillboard' asModal open={pricingOpen} onOpenChange={setPricingOpen} />}
        </div>
    );
}

export { Advertising };
