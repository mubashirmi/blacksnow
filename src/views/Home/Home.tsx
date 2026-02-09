import { AuthModalTrigger } from '@/components/AuthModal';
import { PricingComponent } from '@/components/PricingComponent';
import { LottieAnimation } from '@/components/lottie-animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription as DialogDesc, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import {
    Activity,
    AlertTriangle,
    Award,
    BarChart2,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Layers,
    Shield,
    Target,
    TrendingDown,
    TrendingUp,
    X,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState } from 'react';
import { CookieConsentBanner } from './components/CookieConsentBanner';

const textOptions = ['Market Data', 'Swing Trades', 'Stock Options', 'Day Trades', 'Long Term Investment', 'Chart Patterns', 'Indicators', 'Stock Lists'];
// const paperTradingOptions = [
//     'Daytrade',
//     'Swing Trade',
//     'Bid–Ask',
//     'Liquidity',
//     'Volatility',
//     'Risk Management',
//     'Options Chain',
//     'Moving Averages',
//     'RSI',
//     'MACD',
// ];

// const stockScreenerOptions = [
//     'Market Capitalization',
//     'Price Performance',
//     'Volume',
//     'Average Daily Volume',
//     'P/E Ratio',
//     'Dividend Yield',
//     '52-Week High / Low',
//     'Sector & Industry',
//     'Volatility (Beta)',
//     'Technical Signals',
// ];

// const watchlistOptions = [
//     'Real-Time Prices',
//     'Daily Change',
//     'Percent Change',
//     'Price Alerts',
//     'Dividend Calendar',
//     'Bid–Ask',
//     'Market Movers',
//     'News Updates',
//     'Earnings Date',
//     'Trend Direction',
// ];

function Home() {
    // const [paperIdx, setPaperIdx] = useState(0);
    // const [screenerIdx, setScreenerIdx] = useState(0);
    // const [watchlistIdx, setWatchlistIdx] = useState(0);

    // ✅ Pricing modal (for logged-in but not purchased)
    const [pricingOpen, setPricingOpen] = useState(false);

    const { loading: authLoading } = useAuth();

    // eslint-disable-next-line
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    // Modals
    const [isSubscribeFormOpen, setIsSubscribeFormOpen] = useState(false); // Newsletter form modal (only if purchased)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Success after POST
    const [isCheckingOpen, setIsCheckingOpen] = useState(false); // Loader dialog while checking entitlement

    // Loaders
    const [checkingAccess, setCheckingAccess] = useState(false); // for the entitlement API
    const [submitLoading, setSubmitLoading] = useState(false); // for the POST /api/v1/newsletter

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [agree, setAgree] = useState(false);
    const [formErrors, setFormErrors] = useState<{ firstName?: string; lastName?: string; email?: string; agree?: string }>({});

    // Error for entitlement check
    const [entitlementError, setEntitlementError] = useState<string | null>(null);

    const router = useRouter();

    // ✅ Hidden AuthModalTrigger button ref (so we can open Auth modal programmatically)
    const authTriggerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            // setPaperIdx((i) => (i + 1) % paperTradingOptions.length);
            // setScreenerIdx((i) => (i + 1) % stockScreenerOptions.length);
            // setWatchlistIdx((i) => (i + 1) % watchlistOptions.length);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTextIndex((prevIndex) => (prevIndex + 1) % textOptions.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const trackRefIdClick = async () => {
            const { refId } = router.query;

            if (refId) {
                localStorage.setItem('referredby', String(refId));
                try {
                    const currentUrl = `https://blacksnowholdings.com`;

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

        if (router.isReady) {
            trackRefIdClick();
        }
    }, [router.isReady, router.query]);

    // ---------- Handlers ----------

    /**
     * ✅ New behavior:
     * - If NOT logged in -> open Auth modal (AuthModalTrigger) (NO "Signup Required" dialog)
     * - If logged in but NOT purchased -> open PricingComponent modal
     * - If purchased -> open subscribe form modal
     * Everything else stays the same.
     */
    const openSubscribeFlow = async () => {
        if (authLoading || checkingAccess) return;

        const userId = localStorage.getItem('userId');

        // 1) Not logged in -> open Auth modal
        if (!userId) {
            authTriggerRef.current?.click();
            return;
        }

        // 2) Logged in -> check entitlement
        const cookies = parseCookies();
        const id = cookies.id;

        // If cookie missing, treat as not logged in enough to identify -> open Auth modal
        if (!id) {
            authTriggerRef.current?.click();
            return;
        }

        try {
            setEntitlementError(null);
            setCheckingAccess(true);
            setIsCheckingOpen(true);

            const response = await fetch(`/api/v2/get-user-product-info/?id=${id}`);
            const data = await response.json();

            const newsLetterStatus = data?.data?.NewsLetter;

            if (newsLetterStatus !== 'Purchased') {
                // 3) Logged in but not purchased -> open Pricing modal
                setIsSubscribeFormOpen(false);
                setPricingOpen(true);
            } else {
                // 4) Purchased -> open form modal
                setPricingOpen(false);
                setIsSubscribeFormOpen(true);
            }
        } catch (err: any) {
            console.error('Entitlement check failed:', err);
            setEntitlementError('We could not verify your newsletter entitlement. Please try again.');
        } finally {
            setCheckingAccess(false);
            setIsCheckingOpen(false);
        }
    };

    const validateForm = () => {
        const errors: typeof formErrors = {};
        const emailRegex = /^\S+@\S+\.\S+$/;

        if (!firstName.trim()) errors.firstName = 'First name is required.';
        if (!lastName.trim()) errors.lastName = 'Last name is required.';
        if (!email.trim()) errors.email = 'Email is required.';
        else if (!emailRegex.test(email)) errors.email = 'Please enter a valid email address.';
        if (!agree) errors.agree = 'You must agree to the terms and policies.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitNewsletter = async () => {
        if (!validateForm()) return;

        try {
            setSubmitLoading(true);
            const res = await fetch('/api/v1/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                }),
            });

            if (!res.ok) {
                throw new Error('Request failed');
            }

            // Success -> close form, show success
            setIsSubscribeFormOpen(false);
            setIsSuccessModalOpen(true);

            // Reset form after success
            setFirstName('');
            setLastName('');
            setEmail('');
            setAgree(false);
            setFormErrors({});
        } catch (err) {
            console.error('Newsletter submission failed:', err);
            setFormErrors((prev) => ({ ...prev, email: 'Submission failed. Please try again.' }));
        } finally {
            setSubmitLoading(false);
        }
    };

    // ---------- UI Helpers ----------

    const FieldError = ({ msg }: { msg?: string }) => (msg ? <p className='text-xs text-red-400 mt-1'>{msg}</p> : null);

    // ✅ New Subscribe section design (matches the attached image style)
    const NewsletterSubscribeBar = ({ className = '' }: { className?: string }) => (
        <div
            className={[
                'relative w-full rounded-2xl border border-[#4cc7e8]/45 bg-[#0b0d12]/55 backdrop-blur-2xl',
                'shadow-[0_0_0_1px_rgba(76,199,232,0.22),0_0_45px_rgba(76,199,232,0.14)]',
                'p-5 sm:p-6',
                className,
            ].join(' ')}
        >
            <div className='absolute inset-0 rounded-2xl pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(76,199,232,0.12),transparent_55%)]' />
            <div className='relative'>
                <div className='space-y-2'>
                    <h3 className='text-xl sm:text-2xl font-extrabold text-white'>Weekly Market Intelligence</h3>
                    <p className='text-sm sm:text-base text-gray-400'>Subscribe for weekly trading insights and market data.</p>
                </div>

                <div className='mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4'>
                    <Input
                        placeholder='Enter your email'
                        readOnly
                        onClick={openSubscribeFlow}
                        className='h-12 sm:h-14 flex-1 rounded-xl bg-black/35 border-white/10 text-white placeholder:text-white/40 backdrop-blur-md'
                    />
                    <Button
                        onClick={openSubscribeFlow}
                        disabled={authLoading || checkingAccess}
                        className='h-12 sm:h-14 rounded-xl px-8 font-black text-base bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] shadow-xl shadow-[#2c7bbe]/30'
                    >
                        {checkingAccess ? 'Checking…' : 'Subscribe'}
                    </Button>
                </div>
            </div>
        </div>
    );

    // ---------- JSX ----------

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* ✅ Hidden AuthModalTrigger (opens when user clicks Subscribe and is not logged in) */}
            <AuthModalTrigger buttonText='Join Now' defaultView='signup' sourceRoute='/' redirectAfterLogin='/pricing' redirectAfterSignup='/pricing'>
                <button ref={authTriggerRef} type='button' className='hidden' />
            </AuthModalTrigger>

            <section className='relative flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                {/* ✅ Background image + dark overlay */}
                <div className='absolute inset-0'>
                    <div className='absolute inset-0 bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/blacksnowbgimage.webp')" }} />
                    <div className='absolute inset-0 bg-black/90' />
                </div>

                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* LEFT */}
                        <div className='space-y-8 sm:space-y-10 md:space-y-12'>
                            <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                PAPER BROKERAGE
                            </Badge>

                            <div className='space-y-4 sm:space-y-5 animate-slide-in-left delay-200'>
                                <h1 className='text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight'>
                                    <div className='relative inline-block'>
                                        <span className='text-[#f4f4f4]'>Global &nbsp; Investment</span>
                                    </div>
                                    <br />
                                    <span className='text-[#f4f4f4] leading-tight'>Strategies&nbsp; For</span>
                                    <br />
                                    <div className='relative inline-block'>
                                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2a8dcc] to-[#2c7bbe] bg-clip-text text-transparent font-black'>
                                            Everyone
                                        </span>
                                    </div>
                                </h1>

                                <div className='relative'>
                                    <p className='text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl sm:max-w-3xl font-light'>
                                        Learn comprehensive trading strategies and market data analysis to make informed investment decisions in today&apos;s
                                        dynamic markets.
                                    </p>
                                </div>
                            </div>

                            <div className='space-y-6 sm:space-y-8 animate-slide-in-left delay-400 overflow-hidden'>
                                <NewsletterSubscribeBar />
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className='relative animate-slide-in-right'>
                            <div className='relative overflow-hidden'>
                                <div className='relative flex items-center justify-center w-full h-full'>
                                    <div className='flex items-center justify-center w-full bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20'>
                                        <LottieAnimation
                                            src='/animations/growthChartIcon.json'
                                            className='w-[90%] h-full sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[550px] lg:h-[550px]'
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trading Strategies Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            MASTER THE MARKETS
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Device <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Compatibility</span>
                        </h2>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
                            Understand the sophisticated differences between covered calls and protective puts with our comprehensive analysis framework
                        </p>
                    </div>

                    <div className='grid lg:grid-cols-2 gap-12'>
                        {/* Covered Calls */}
                        <div className='group relative animate-slide-in-left'>
                            {/* <div className='absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500'></div> */}
                            <Card className='relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-white/35 transition-all duration-500 rounded-3xl overflow-hidden'>
                                <div className='absolute top-0 left-0 w-full h-[3px] bg-white/45'></div>
                                <CardHeader className='p-8'>
                                    <div className='flex items-center justify-between mb-4'>
                                        <div className='flex items-center space-x-4'>
                                            <div className='w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border-white/5 border-[1px]'>
                                                <TrendingUp className='w-7 h-7 text-[#2c7bbe]' />
                                            </div>
                                            <div>
                                                <CardTitle className='text-2xl font-bold text-[#2c7bbe]'>MOBILE & TABLET COMPATIBILITY</CardTitle>
                                                <CardDescription className='text-[#2c7bbe] font-semibold text-base'>
                                                    Paper Trade Anywhere — Fully Responsive Platform
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className='p-8 pt-0 space-y-6'>
                                    <div className='space-y-4'>
                                        <div className='bg-black/30 rounded-2xl p-6 border border-white/20'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-white/40 rounded-full mr-3'></div>
                                                Optimized for Touch & Efficiency:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Every button, chart, and trade entry field is designed for tap-based interaction, making it effortless to place
                                                simulated trades, adjust filters, and navigate charts without accidental clicks or zooming issues. Built for
                                                speed, clarity, and fingertip execution
                                            </p>
                                        </div>

                                        <div className='bg-black/30 rounded-2xl p-6 border border-white/20'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-white/40 rounded-full mr-3'></div>
                                                Adaptive Screen Layouts:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Whether you&apos;re on an iPhone, Android, or tablet, the interface automatically reorganizes to keep the most
                                                important market data visible, prioritizing watchlists, screener results, and open simulations in a clean
                                                vertical flow.
                                            </p>
                                        </div>

                                        <div className='bg-black/30 rounded-2xl p-6 border border-white/20'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-white/40 rounded-full mr-3'></div>
                                                Real-Time Data, Real Market Behavior:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Market data updates live while you move between screens, allowing you to practice strategy execution and monitor
                                                positions without constantly refreshing the page or losing your place in the platform.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Protective Puts */}
                        <div className='group relative animate-slide-in-right'>
                            {/* <div className='absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500'></div> */}
                            <Card className='relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-white/35 transition-all duration-500 rounded-3xl overflow-hidden'>
                                <div className='absolute top-0 left-0 w-full h-[3px] bg-white/45'></div>

                                <CardHeader className='p-8'>
                                    <div className='flex items-center justify-between mb-4'>
                                        <div className='flex items-center space-x-4'>
                                            <div className='w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border-white/5 border-[1px]'>
                                                <Shield className='w-7 h-7 text-[#2c7bbe]' />
                                            </div>
                                            <div>
                                                <CardTitle className='text-2xl font-bold text-[#2c7bbe]'>DESKTOP COMPATIBILITY</CardTitle>
                                                <CardDescription className='text-[#2c7bbe] font-semibold text-base'>
                                                    Professional Desktop Trading Workspace
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className='p-8 pt-0 space-y-6'>
                                    <div className='space-y-4'>
                                        <div className='bg-black/30 rounded-2xl p-6 border border-white/20'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-white/40 rounded-full mr-3'></div>
                                                Multi-Panel Workspace:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Analyze charts, run the stock screener, and execute simulated trades side-by-side without switching tabs. The
                                                desktop layout allows expandable windows and panel stacking, enabling professional workflow efficiency. Maximum
                                                visibility, total control, advanced analysis.
                                            </p>
                                        </div>

                                        <div className='bg-black/30 rounded-2xl p-6 border border-white/20'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-white/40 rounded-full mr-3'></div>
                                                High-Resolution Market Visualization:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Larger screens unlock fullwidth technical charts, deeper analytic tools, and expanded data tables so you can
                                                identify trends, study patterns, and break down market setups with precision.
                                            </p>
                                        </div>

                                        <div className='bg-black/30 rounded-2xl p-6 border border-white/20'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-white/40 rounded-full mr-3'></div>
                                                Keyboard-Driven Speed & Precision:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Designed for desktop power users, the platform incorporates keyboard shortcuts, faster data entry, and
                                                drag-and-drop modules, making trade execution and stock research significantly faster than on mobile.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* REVOLUTIONARY: Elite Trading Mastery Framework Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f] overflow-hidden'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    {/* Revolutionary Header */}
                    <div className='text-center mb-20 animate-slide-in-up'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            Elite Framework
                        </Badge>

                        <h2 className='text-5xl lg:text-7xl font-black text-white mb-4 sm:mb-8 leading-tight'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent animate-gradient bg-300%'>
                                Learn Multiple <br className='inline sm:hidden' /> Day
                            </span>
                            <br className='hidden sm:inline' />
                            <span className='text-white'>&nbsp;Trading</span> <br className='inline sm:hidden' />
                            <span className='relative inline-block'>
                                <span className='bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] bg-clip-text text-transparent'>Strategies</span>
                                <div className='absolute -bottom-4 left-0 right-0 h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full opacity-60 animate-pulse'></div>
                            </span>
                        </h2>

                        <p className='text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light mt-7'>
                            Transform from beginner to <span className='text-[#4cc7e8] font-bold'>elite trader</span> with our revolutionary framework that has
                            generated <span className='text-[#2c7bbe] font-bold'>$12.8M+</span> in profits
                        </p>
                    </div>

                    <div className='relative'>
                        {/* Connecting Lines */}
                        <div className='hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4cc7e8]/30 to-transparent transform -translate-y-1/2 z-0'></div>

                        <div className='grid lg:grid-cols-3 gap-12 lg:gap-8 relative z-10'>
                            {/* Step 1: Problem Analysis */}
                            <div className='group relative animate-slide-in-right delay-400'>
                                {/* Glowing Background Effect */}
                                {/* <div className='absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xs blur-xs'></div> */}

                                {/* Main Card */}
                                <div className='overflow-hidden relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl rounded-3xl p-10 border-2 border-green-500/30 min-h-[600px] flex flex-col h-full'>
                                    {/* Animated Top Border */}
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-t-3xl'></div>

                                    {/* Header */}
                                    <div className='mb-8'>
                                        <div className='flex items-center space-x-4 mb-6'>
                                            <div className='w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl'>
                                                <DollarSign className='w-8 h-8 text-white' />
                                            </div>
                                            <div>
                                                <h3 className='text-2xl font-black text-green-400 mb-2'>Paper Trading</h3>
                                                <p className='text-green-300 font-semibold'>Stock Market Simulator</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 space-y-6'>
                                        <h4 className='text-3xl font-black text-white leading-tight'>
                                            <span className='text-green-400'>Generate Consistent Profits</span>
                                        </h4>

                                        <p className='text-gray-300 leading-relaxed text-lg'>
                                            Paper Trading lets you execute simulated trades using real market data — without risk. You can test strategies, gain
                                            experience, and build discipline while learning how the market behaves. Track performance, analyze your results, and
                                            develop consistency before transitioning to a live account.
                                        </p>

                                        {/* Success Metrics */}
                                        <div className='space-y-4'>
                                            {[
                                                {
                                                    icon: TrendingUp,
                                                    text: 'Stock Trades',
                                                    color: 'text-green-400',
                                                    value: '99.2%',
                                                },
                                                {
                                                    icon: DollarSign,
                                                    text: 'Options Chains',
                                                    color: 'text-emerald-400',
                                                    value: '+347%',
                                                },
                                                {
                                                    icon: Award,
                                                    text: 'Live Markets',
                                                    color: 'text-teal-400',
                                                    value: 'Elite',
                                                },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className='flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20'
                                                >
                                                    <div className='flex items-center space-x-4'>
                                                        <div className='w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center'>
                                                            <item.icon className={`w-5 h-5 ${item.color}`} />
                                                        </div>
                                                        <span className='text-white font-semibold'>{item.text}</span>
                                                    </div>
                                                    <div className={`${item.color} font-black text-lg`}>{item.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Live Profit Tracker */}
                                        <div className='bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl p-6 border border-green-500/20'>
                                            <div className='flex items-center justify-between '>
                                                {/* <span className='text-green-400 font-bold'>Live Profits</span>
                                                <div className='flex items-center space-x-2'>
                                                    <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                                                    <span className='text-green-400 text-sm font-semibold'>ACTIVE</span>
                                                </div> */}
                                            </div>
                                            <div className='text-green-400  font-black text-2xl text-center'>Coming Soon</div>
                                            {/* <div className='text-green-400 text-sm mt-2 flex items-center'>
                                                <TrendingUp className='w-4 h-4 mr-2' />
                                                +28.3% this month
                                            </div> */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Strategy Selection */}
                            <div className='group relative animate-slide-in-up delay-200'>
                                {/* Glowing Background Effect */}
                                {/* <div className='absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xs blur-xs'></div> */}

                                {/* Main Card */}
                                <div className='overflow-hidden relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl rounded-3xl p-10 border-2 border-orange-500/30 min-h-[600px] flex flex-col h-full'>
                                    {/* Animated Top Border */}
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 rounded-t-3xl'></div>

                                    {/* Header */}
                                    <div className='mb-8'>
                                        <div className='flex items-center space-x-4 mb-6'>
                                            <div className='w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl'>
                                                <Layers className='w-8 h-8 text-white' />
                                            </div>
                                            <div>
                                                <h3 className='text-2xl font-black text-orange-400 mb-2'>Stock Screener</h3>
                                                <p className='text-orange-300 font-semibold'>Stock Market Analytics</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 space-y-6'>
                                        <h4 className='text-3xl font-black text-white leading-tight'>
                                            <span className='text-orange-400'>Choose Winning Strategies</span>
                                        </h4>

                                        <p className='text-gray-300 leading-relaxed text-lg'>
                                            The Stock Screener highlights opportunities that match your strategy. Customize filters based on momentum, volume,
                                            trend strength, price action, or fundamentals — and instantly identify stocks with potential. Instead of searching
                                            manually, the screener brings the best setups directly to you.
                                        </p>

                                        {/* Strategy Points */}
                                        <div className='space-y-4'>
                                            {[
                                                {
                                                    icon: Activity,
                                                    text: 'Custom filters',
                                                    color: 'text-orange-400',
                                                },
                                                {
                                                    icon: BarChart2,
                                                    text: 'Sector snapshot',
                                                    color: 'text-yellow-400',
                                                },
                                                {
                                                    icon: Target,
                                                    text: 'Stock, ETF, Mutual Fund Research',
                                                    color: 'text-amber-400',
                                                },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className='flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl border border-orange-500/20'
                                                >
                                                    <div className='w-10 h-10 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl flex items-center justify-center'>
                                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                                    </div>
                                                    <span className='text-white font-semibold'>{item.text}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Interactive Strategy Selector */}
                                        <div className='bg-gradient-to-r mt-14 from-orange-500/5 to-yellow-500/5 rounded-2xl p-6 border border-orange-500/20'>
                                            <div className='flex items-center justify-between'>
                                                {/* <span className='text-orange-400 font-bold'>Current Strategy</span>
                                                <div className='flex space-x-2'>
                                                    <div className='w-2 h-2 bg-orange-400 rounded-full animate-pulse'></div>
                                                    <div className='w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300'></div>
                                                    <div className='w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-600'></div>
                                                </div> */}
                                            </div>
                                            <div className='text-orange-400 font-black text-2xl text-center'>Coming Soon</div>
                                            {/* <div className='text-white font-semibold text-lg'>Momentum Scalping</div> */}
                                            {/* <div className='text-gray-400 text-sm mt-2'>Optimized for current volatility</div> */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Problem Analysis */}
                            <div className='group relative animate-slide-in-left'>
                                {/* Glowing Background Effect */}
                                {/* <div className='absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xs blur-xs'></div> */}

                                {/* Main Card */}
                                <div className='overflow-hidden relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl rounded-3xl p-10 border-2 border-red-500/30 min-h-[600px] flex flex-col h-full'>
                                    {/* Animated Top Border */}
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-rose-500 to-red-600 rounded-t-3xl'></div>

                                    {/* Header */}
                                    <div className='mb-8'>
                                        <div className='flex items-center space-x-4 mb-6'>
                                            <div className='w-16 h-16 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl'>
                                                <Clock className='w-8 h-8 text-white' />
                                            </div>
                                            <div>
                                                <h3 className='text-2xl font-black text-red-400 mb-2'>Watchlist</h3>
                                                <p className='text-red-300 font-semibold'>Market Movers</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 space-y-6'>
                                        <h4 className='text-3xl font-black text-white leading-tight'>
                                            <span className='text-red-400'>Manage Volatility</span>
                                        </h4>

                                        <p className='text-gray-300 leading-relaxed text-lg'>
                                            Market Glance gives you a complete, real-time snapshot of what’s happening across the market. View sector strength,
                                            top gainers and losers, volatility, and sentiment all in one streamlined dashboard. Know whether conditions favor
                                            bullish or bearish moves before placing a trade.
                                        </p>

                                        {/* Problem Points */}
                                        <div className='space-y-4'>
                                            {[
                                                {
                                                    icon: TrendingDown,
                                                    text: 'Real-time Data',
                                                    color: 'text-red-400',
                                                },
                                                {
                                                    icon: AlertTriangle,
                                                    text: 'Spot momentum early',
                                                    color: 'text-orange-400',
                                                },
                                                {
                                                    icon: Clock,
                                                    text: 'Market trend direction',
                                                    color: 'text-yellow-400',
                                                },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className='flex items-center space-x-4 p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-2xl border border-red-500/20'
                                                >
                                                    <div className='w-10 h-10 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl flex items-center justify-center'>
                                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                                    </div>
                                                    <span className='text-white font-semibold'>{item.text}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Risk Analysis Box */}
                                        <div className='bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-2xl p-6 border border-red-500/20'>
                                            <div className='flex items-center justify-between'>
                                                {/* <span className='text-red-400 font-bold'>Risk Analysis</span>
                                                <div className='flex space-x-2'>
                                                    <div className='w-2 h-2 bg-red-400 rounded-full animate-pulse'></div>
                                                    <div className='w-2 h-2 bg-rose-400 rounded-full animate-pulse delay-300'></div>
                                                    <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse delay-600'></div>
                                                </div> */}
                                            </div>
                                            <div className='text-red-400  font-black text-2xl text-center'>Coming Soon</div>
                                            {/* <div className='text-white font-semibold text-lg'>High-Risk Signals Detected</div>
                                            <div className='text-red-400 text-sm mt-2'>Avoiding 73% of potential losses</div> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16'>
                        <h2 className='text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-5'>
                            Subscribe to our Monthly{' '}
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Newsletter</span>
                        </h2>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
                            Streamline your search for market insights and get weekly updates, articles and recommended reads every week. Reduce your time by
                            staying up to date with the latest information available.
                        </p>
                    </div>

                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        {/* LEFT - Benefits List */}
                        <div className='space-y-6'>
                            {[
                                'Get your weekly stock picks for day trades, swing trades, options and dividends',
                                'Receive trading Strategy from the best performances in top market sectors including A.I, EV, and Tech',
                                'Catch blog updates from every week',
                                'View limited time special offers and sponsorships',
                                'Read Featured News Articles',
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className='flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 border border-[#2c7bbe]/20 group-hover:border-[#4cc7e8]/30 transition-all duration-300'
                                >
                                    <CheckCircle className='w-5 h-5 text-green-400 flex-shrink-0' />
                                    <span className='text-sm sm:text-base leading-relaxed text-gray-300'>{item}</span>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT - Lottie + NEW subscribe bar design */}
                        <div className='space-y-8'>
                            <div className='flex items-center justify-center w-full sm:w-fit bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20 mx-auto'>
                                <LottieAnimation
                                    src='/animations/LearnMore2.json'
                                    className='w-[90%] h-full sm:w-[400px] sm:h-[380px] md:w-[500px] md:h-[420px] lg:w-[550px] lg:h-[450px]'
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>

                            {/* ✅ New design from your image */}
                            <NewsletterSubscribeBar className='w-full sm:w-[400px] md:w-[500px] lg:w-[550px] mx-auto' />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MODALS --- */}

            {/* 1) Checking Entitlement Loader */}
            <Dialog open={isCheckingOpen} onOpenChange={setIsCheckingOpen}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <DialogHeader className='space-y-2'>
                        <DialogTitle className='text-2xl font-black text-white'>Checking access…</DialogTitle>
                        <DialogDesc className='text-[#4cc7e8] font-semibold'>Verifying your newsletter subscription status</DialogDesc>
                    </DialogHeader>
                    <div className='flex flex-col items-center justify-center py-8'>
                        <div className='w-10 h-10 rounded-full border-4 border-[#2c7bbe]/30 border-t-[#4cc7e8] animate-spin'></div>
                        {entitlementError && <p className='text-red-400 mt-6 text-sm text-center'>{entitlementError}</p>}
                        {entitlementError && (
                            <Button
                                onClick={() => setIsCheckingOpen(false)}
                                className='mt-4 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white font-black'
                            >
                                Close
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* 2) Subscribe Form (only when purchased) */}
            <Dialog open={isSubscribeFormOpen} onOpenChange={setIsSubscribeFormOpen}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <button
                        onClick={() => setIsSubscribeFormOpen(false)}
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
                                <DialogTitle className='text-2xl font-black text-white'>Subscribe to Newsletter</DialogTitle>
                                <DialogDesc className='text-[#4cc7e8] font-semibold'>Enter your details to receive updates.</DialogDesc>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className='space-y-5'>
                        <div>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder='Enter your first name'
                                className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-400'
                            />
                            <FieldError msg={formErrors.firstName} />
                        </div>

                        <div>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder='Enter your last name'
                                className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-400'
                            />
                            <FieldError msg={formErrors.lastName} />
                        </div>

                        <div>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type='email'
                                placeholder='Enter your email'
                                className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-400'
                            />
                            <FieldError msg={formErrors.email} />
                        </div>

                        <div className='flex items-start space-x-3'>
                            <input
                                id='agree'
                                type='checkbox'
                                checked={agree}
                                onChange={(e) => setAgree(e.target.checked)}
                                className='mt-1 w-4 h-4 rounded border-[#2c7bbe]/40 bg-transparent'
                            />
                            <label htmlFor='agree' className='text-sm text-gray-300'>
                                I agree to the <span className='text-[#4cc7e8] underline underline-offset-2 cursor-pointer'>terms and policies</span>.
                            </label>
                        </div>
                        <FieldError msg={formErrors.agree} />

                        <Button
                            onClick={submitNewsletter}
                            className='w-full cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl'
                            disabled={submitLoading}
                        >
                            {submitLoading ? 'Submitting…' : 'Submit'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 3) Success Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <DialogHeader className='space-y-6 pb-2'>
                        <div className='flex items-center space-x-4'>
                            <div className='min-w-12 min-h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <CheckCircle className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Request Submitted</DialogTitle>
                                <DialogDesc className='text-[#4cc7e8] font-semibold'>
                                    Your request was submitted successfully. We will inform you further via email.
                                </DialogDesc>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className='pt-2'>
                        <Button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className='w-full cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl'
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ✅ 4) Pricing Modal (logged in but NOT purchased) */}
            <PricingComponent name='NewsLetter' asModal open={pricingOpen} onOpenChange={setPricingOpen} />

            <CookieConsentBanner />
        </div>
    );
}

export { Home };
