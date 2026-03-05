import { AuthModalTrigger } from '@/components/AuthModal';
import { HomeTourPopup } from '@/components/HomeTourPopup';
import { PricingComponent } from '@/components/PricingComponent';
import { LottieAnimation } from '@/components/lottie-animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription as DialogDesc, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { BarChart2, Calendar, CheckCircle, DollarSign, Globe, List, Shield, TrendingUp, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState } from 'react';
import { CookieConsentBanner } from './components/CookieConsentBanner';

const textOptions = ['Market Data', 'Swing Trades', 'Stock Options', 'Day Trades', 'Long Term Investment', 'Chart Patterns', 'Indicators', 'Stock Lists'];

function Home() {
    const [pricingOpen, setPricingOpen] = useState(false);
    const { loading: authLoading } = useAuth();
    // eslint-disable-next-line
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [isSubscribeFormOpen, setIsSubscribeFormOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isCheckingOpen, setIsCheckingOpen] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [agree, setAgree] = useState(false);
    const [formErrors, setFormErrors] = useState<{ firstName?: string; lastName?: string; email?: string; agree?: string }>({});
    const [entitlementError, setEntitlementError] = useState<string | null>(null);

    const router = useRouter();
    const authTriggerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            // reserved
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
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productLink: currentUrl }),
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

    const openSubscribeFlow = async () => {
        if (authLoading || checkingAccess) return;
        const userId = localStorage.getItem('userId');
        if (!userId) {
            authTriggerRef.current?.click();
            return;
        }
        const cookies = parseCookies();
        const id = cookies.id;
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
                setIsSubscribeFormOpen(false);
                setPricingOpen(true);
            } else {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                }),
            });
            if (!res.ok) throw new Error('Request failed');
            setIsSubscribeFormOpen(false);
            setIsSuccessModalOpen(true);
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

    // ==========================
    // REDESIGN HELPERS
    // ==========================

    const BSHeader = ({ accent, title, subtitle, Icon }: { accent: string; title: string; subtitle: string; Icon: any }) => (
        <div className='flex items-center gap-5'>
            <div
                className='flex items-center justify-center rounded-xl h-14 md:h-20 lg:h-28 w-14 md:w-20 lg:w-28 flex-shrink-0'
                style={{ backgroundColor: accent }}
            >
                <Icon className='h-10 md:h-16 lg:h-20 w-10 md:w-16 lg:w-20' style={{ color: '#0B1320' }} />
            </div>
            <div className='leading-tight'>
                <div className='text-3xl sm:text-4xl md:text-7xl font-extralight text-white'>{title}</div>
                <div className='text:xl md:text-2xl lg:text-3xl font-medium mt-1' style={{ color: accent }}>
                    {subtitle}
                </div>
            </div>
        </div>
    );

    // Bolds the first word of each bullet
    const BSBullets = ({ accent, items }: { accent: string; items: string[] }) => (
        <div className='space-y-5'>
            {items.map((text, idx) => {
                const spaceIdx = text.indexOf(' ');
                const boldPart = spaceIdx !== -1 ? text.slice(0, spaceIdx) : text;
                const restPart = spaceIdx !== -1 ? text.slice(spaceIdx) : '';
                return (
                    <div key={idx} className='flex items-start gap-4'>
                        <CheckCircle strokeWidth={3} className='h-6 w-6 mt-0.5 flex-shrink-0' style={{ color: accent }} />
                        <div className='text-lg md:text-xl lg:text-2xl text-white/80 leading-snug'>
                            <span className='font-bold text-white'>{boldPart}</span>
                            {restPart}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // Filled glowing pill button
    const BSButton = ({ accent, label }: { accent: string; label: string }) => (
        <button
            type='button'
            className='h-14 px-10 rounded-full inline-flex items-center justify-center gap-3 font-semibold text-white text-lg lg:text-xl whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95'
            style={{
                background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
                border: `2px solid ${accent}`,
                boxShadow: `0 0 24px ${accent}55`,
            }}
        >
            {label}
            <span aria-hidden className='leading-none text-xl'>
                →
            </span>
        </button>
    );

    // Full-screen panel — takes up 100vh, centers content
    const FullScreenPanel = ({
        accent,
        headerTitle,
        headerSubtitle,
        HeaderIcon,
        title,
        description,
        bullets,
        cta,
    }: {
        accent: string;
        headerTitle: string;
        headerSubtitle: string;
        HeaderIcon: any;
        title: string;
        description: string;
        bullets: string[];
        cta: string;
    }) => {
        const lines = description.split('\n');
        return (
            <div
                className='relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-center overflow-hidden bg-[#0B1320]'
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                {/* Content — constrained width, centered */}
                <div className='relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 md:px-16 py-20'>
                    {/* Header */}
                    <BSHeader accent={accent} title={headerTitle} subtitle={headerSubtitle} Icon={HeaderIcon} />

                    {/* Title */}
                    <h3 className='mt-10 lg:mt-14 text-4xl sm:text-5xl md:text-7xl font-extralight text-white leading-tight'>{title}</h3>

                    {/* Description */}
                    <div className='mt-6 space-y-2'>
                        {lines.map((l, i) => (
                            <p key={i} className='text-xl sm:text-2xl text-white/50 leading-relaxed'>
                                {l}
                            </p>
                        ))}
                    </div>

                    {/* Bullets + CTA */}
                    <div className='mt-14 lg:mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-10'>
                        <BSBullets accent={accent} items={bullets} />
                        <div className='flex-shrink-0'>
                            <BSButton accent={accent} label={cta} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ---------- JSX ----------
    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hidden AuthModalTrigger */}
            <AuthModalTrigger buttonText='Join Now' defaultView='signup' sourceRoute='/' redirectAfterLogin='/pricing' redirectAfterSignup='/pricing'>
                <button ref={authTriggerRef} type='button' className='hidden' />
            </AuthModalTrigger>

            {/* ─── HERO SECTION ─── */}
            <section className='relative flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6 md:px-8 min-h-[calc(100vh-64px)] lg:min-h-0'>
                <div className='absolute inset-0'>
                    <div className='absolute inset-0 bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/blacksnowbgimage.webp')" }} />
                    <div className='absolute inset-0 bg-black/90' />
                </div>

                <div className='container mx-auto max-w-8xl relative z-10 w-full'>
                    <div className='grid lg:grid-cols-2 gap-6 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* ── LEFT ── */}
                        <div className='flex flex-col gap-5 sm:gap-8 md:gap-10'>
                            {/* Badge — hidden on mobile, visible on lg+ */}
                            <Badge className='inline-flex uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold w-fit'>
                                PAPER BROKERAGE
                            </Badge>

                            {/* Title — 2 lines */}
                            <div className='space-y-3 animate-slide-in-left delay-200'>
                                <h1 className='text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight'>
                                    <span className='text-[#f4f4f4]'>Global Multi-Asset</span>
                                    <br />
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2a8dcc] to-[#2c7bbe] bg-clip-text text-transparent font-black'>
                                        Intelligence Engine
                                    </span>
                                </h1>

                                {/* Updated blurb — shown on both mobile and desktop */}
                                <p className='text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl font-light'>
                                    Data-driven global paper trading, stock screening, watchlists, and economic KPI&apos;s
                                </p>
                            </div>

                            {/* Mobile-only inline Lottie — hidden on lg+ */}
                            <div className='block lg:hidden w-full animate-slide-in-left delay-300'>
                                <div className='flex items-center justify-center w-full bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl border border-[#2c7bbe]/20'>
                                    <LottieAnimation
                                        src='/animations/growthChartIcon.json'
                                        className='w-full h-[220px] xs:h-[250px]'
                                        loop={true}
                                        autoplay={true}
                                    />
                                </div>
                            </div>

                            {/* Newsletter subscribe bar */}
                            <div className='animate-slide-in-left delay-400 overflow-hidden'>
                                <NewsletterSubscribeBar />
                            </div>
                        </div>

                        {/* ── RIGHT — desktop only ── */}
                        <div className='hidden lg:block relative animate-slide-in-right'>
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
                        {/* Mobile & Tablet */}
                        <div className='group relative animate-slide-in-left'>
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

                        {/* Desktop */}
                        <div className='group relative animate-slide-in-right'>
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
                                                identify trends, study patterns, and break down market setups with precision. <br /> <br />
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

            {/* ✅ UPDATED: Learn Multiple Day Trading Strategies */}
            {/* Section heading — sits above the full-screen panels */}
            <section className='relative py-16 px-4 sm:px-6 md:px-8 bg-[#0B1320] overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]' />
                <div className='container mx-auto max-w-8xl relative z-10 text-center'>
                    <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                        Elite Framework
                    </Badge>
                    <h2 className='text-5xl lg:text-7xl font-black text-white mb-4 sm:mb-8 leading-tight'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Learn Multiple Day</span>
                        <br />
                        <span className='text-white'>Trading </span>
                        <span className='relative inline-block'>
                            <span className='bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] bg-clip-text text-transparent'>Strategies</span>
                            <div className='absolute -bottom-4 left-0 right-0 h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full opacity-60 animate-pulse'></div>
                        </span>
                    </h2>
                    <p className='text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light mt-7'>
                        Clear, consistent UI across device sizes — without mixing layouts.
                    </p>
                </div>
            </section>

            {/* Each panel = full viewport height, full width */}
            <FullScreenPanel
                accent='#5EDC7A'
                headerTitle='Paper Trading'
                headerSubtitle='Stock Market Simulator'
                HeaderIcon={DollarSign}
                title='Generate Consistent Profits'
                description={`Practice trading in a risk-free environment using real market data.\nDevelop strategies, test your skills, and build confidence before transitioning to a live account.`}
                bullets={['Test trading strategies risk-free', 'Gain experience with real market data', 'Build confidence for live trading']}
                cta='Start Paper Trading'
            />

            <FullScreenPanel
                accent='#F5A623'
                headerTitle='Stock Screener'
                headerSubtitle='Market Analysis Tool'
                HeaderIcon={BarChart2}
                title='Find Your Next Trade'
                description={`Discover top stock opportunities with advanced screening tools.\nIdentify trends, filter by metrics, and spot winning setups in the market.`}
                bullets={['Search for stocks with precise criteria', 'Analyze fundamental & technical data', 'Uncover trade opportunities fast']}
                cta='Start Screening'
            />

            <FullScreenPanel
                accent='#E74C3C'
                headerTitle='Watchlist'
                headerSubtitle='Track Stock Performance'
                HeaderIcon={List}
                title='Monitor Your Favorites'
                description={`Keep an eye on your top stocks. Easily organize and track price movements.\nStay informed and react quickly to market changes.`}
                bullets={['Create and manage a personalized watchlist', 'Get real-time price updates and alerts', 'Track performance in one convenient view']}
                cta='Start Watching'
            />

            <FullScreenPanel
                accent='#4A90D9'
                headerTitle='Global Economic Indicators'
                headerSubtitle='World Economic KPI Dashboard'
                HeaderIcon={Globe}
                title='Explore Key Economic KPIs'
                description={`Access economic health metrics, analyze global trends,\ncompare countries, and stay informed on key long-term indicators.`}
                bullets={['View GDP, inflation, unemployment & more', 'Compare country data for informed decisions', 'Track economic trends across the world']}
                cta='Explore KPIs'
            />

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

                        {/* RIGHT - Lottie + subscribe bar */}
                        <div className='space-y-8'>
                            <div className='flex items-center justify-center w-full sm:w-fit bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl sm:rounded-3xl border border-[#2c7bbe]/20 mx-auto'>
                                <LottieAnimation
                                    src='/animations/LearnMore2.json'
                                    className='w-[90%] h-full sm:w-[400px] sm:h-[380px] md:w-[500px] md:h-[420px] lg:w-[550px] lg:h-[450px]'
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
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

            {/* 2) Subscribe Form */}
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

            <HomeTourPopup />

            {/* 4) Pricing Modal */}
            <PricingComponent name='NewsLetter' asModal open={pricingOpen} onOpenChange={setPricingOpen} />

            <CookieConsentBanner />
        </div>
    );
}

export { Home };
