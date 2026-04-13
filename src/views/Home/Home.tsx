import { AuthModalTrigger } from '@/components/AuthModal';
import { HomeTourPopup } from '@/components/HomeTourPopup';
import { PricingComponent } from '@/components/PricingComponent';
import { LottieAnimation } from '@/components/lottie-animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription as DialogDesc, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { BarChart2, Calendar, CheckCircle, DollarSign, Globe, LayoutGrid, List, Shield, Smartphone, TrendingUp, X, Zap } from 'lucide-react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState } from 'react';
import { CookieConsentBanner } from './components/CookieConsentBanner';

const textOptions = ['Market Data', 'Swing Trades', 'Stock Options', 'Day Trades', 'Long Term Investment', 'Chart Patterns', 'Indicators', 'Stock Lists'];

// ─── Strategy Panels Data ───────────────────────────────────────────────────
const strategyPanels = [
    {
        id: 'paper-trading',
        label: 'Paper Trading',
        accent: '#5EDC7A',
        HeaderIcon: DollarSign,
        headerSubtitle: 'Stock Market Simulator',
        title: 'Generate Consistent Profits',
        description: `Practice trading in a risk-free environment using real market data.\nDevelop strategies, test your skills, and build confidence before transitioning to a live account.`,
        bullets: ['Test trading strategies risk-free', 'Gain experience with real market data', 'Build confidence for live trading'],
        cta: 'Start Paper Trading',
        discoveryContent: `Practice real strategies with zero risk across stock trading, options trading, and crypto using a simulation environment that mirrors live market behavior. Execute trades, test position sizing, and refine entries and exits without putting real capital on the line. This gives you space to build confidence while developing consistency across multiple asset classes. Every move is tracked so you can analyze performance, identify strengths, and correct mistakes before stepping into live markets.`,
        discoveryCta: 'Launch Paper Trading',
    },
    {
        id: 'stock-screener',
        label: 'Stock Screener',
        accent: '#F5A623',
        HeaderIcon: BarChart2,
        headerSubtitle: 'Market Analysis Tool',
        title: 'Find Your Next Trade',
        description: `Discover top stock opportunities with advanced screening tools.\nIdentify trends, filter by metrics, and spot winning setups in the market.`,
        bullets: ['Search for stocks with precise criteria', 'Analyze fundamental & technical data', 'Uncover trade opportunities fast'],
        cta: 'Start Screening',
        discoveryContent: `Instantly surface high-potential opportunities using customizable filters for volume, momentum, price action, and fundamentals. Instead of scanning hundreds of charts, the screener narrows the market down to only stocks that meet your exact criteria. This saves time and removes guesswork from your daily routine. You stay focused on quality setups while eliminating unnecessary noise from your workflow.`,
        discoveryCta: 'Open Stock Screener',
    },
    {
        id: 'watchlist',
        label: 'Watchlist',
        accent: '#E74C3C',
        HeaderIcon: List,
        headerSubtitle: 'Track Stock Performance',
        title: 'Monitor Your Favorites',
        description: `Keep an eye on your top stocks. Easily organize and track price movements.\nStay informed and react quickly to market changes.`,
        bullets: ['Create and manage a personalized watchlist', 'Get real-time price updates and alerts', 'Track performance in one convenient view'],
        cta: 'Start Watching',
        discoveryContent: `Track your favorite assets in one centralized dashboard built for speed and clarity. Monitor real-time price movement, volume changes, and trend shifts throughout the trading day. Your watchlist becomes your daily command center for planning entries and managing opportunities. With everything organized in one place, you're always prepared when momentum appears.`,
        discoveryCta: 'Build Your Watchlist',
    },
    {
        id: 'economic-kpis',
        label: 'Global KPI',
        accent: '#4A90D9',
        HeaderIcon: Globe,
        headerSubtitle: 'World Economic KPI Dashboard',
        title: 'Explore Key Economic KPIs',
        description: `Access economic health metrics, analyze global trends,\ncompare countries, and stay informed on key long-term indicators.`,
        bullets: ['View GDP, inflation, unemployment & more', 'Compare country data for informed decisions', 'Track economic trends across the world'],
        cta: 'Explore KPIs',
        discoveryContent: `Gain a macro-level edge by monitoring the economic forces that drive market cycles and sector rotation. Our global KPI dashboard aggregates real-time data on GDP growth, inflation rates, central bank policy, and employment trends across major economies. Understanding these indicators helps you anticipate broader market movements, position ahead of macro shifts, and make more informed long-term investment decisions grounded in economic reality.`,
        discoveryCta: 'Explore Global KPIs',
    },
];

// ─── Mobile & Desktop Compatible Section ────────────────────────────────────
const MOBILE_DESKTOP_FEATURES = [
    {
        Icon: TrendingUp,
        title: 'Data & Analytics',
        desc: 'Advanced tools for stock screening, paper trading, watchlists, and monitoring global economic KPIs.',
    },
    {
        Icon: Smartphone,
        title: 'Optimized for Touch & Efficiency',
        desc: 'Every button, chart, and trade entry field designed for fast tap-based interaction on mobile and tablet devices.',
    },
    {
        Icon: LayoutGrid,
        title: 'Adaptive Screen Layouts',
        desc: 'Responsive interface that auto-adjusts for iPhone, Android, or tablets, prioritizing key market data and tools.',
    },
    {
        Icon: Zap,
        title: 'Real-Time Data, Real Market Behavior',
        desc: 'Live updating market data that mirrors real-time movements and market conditions.',
    },
];

function MobileDesktopSection() {
    const router = useRouter();

    return (
        <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#050608]'>
            <div className='container mx-auto max-w-6xl'>
                <div className='text-center mb-8 sm:mb-10'>
                    <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 px-4 sm:px-5 py-2 text-[11px] sm:text-xs font-bold tracking-[0.22em]'>
                        TRADE FROM ANYWHERE
                    </Badge>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3'>
                        Mobile & Desktop <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Compatible</span>
                    </h2>
                    <p className='text-sm sm:text-base text-gray-400 max-w-2xl mx-auto'>
                        A clean, seamless experience across every screen — designed for modern traders.
                    </p>
                </div>

                <div className='max-w-5xl mx-auto rounded-[28px] border border-[#2c7bbe]/30 bg-[#050a12] shadow-[0_0_0_1px_rgba(44,123,190,0.08),0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden'>
                    {MOBILE_DESKTOP_FEATURES.map(({ Icon, title, desc }, i) => (
                        <div
                            key={title}
                            className='flex items-start gap-4 sm:gap-5 px-5 sm:px-8 py-5 sm:py-6'
                            style={{
                                borderBottom: i < MOBILE_DESKTOP_FEATURES.length - 1 ? '1px solid rgba(76,199,232,0.10)' : 'none',
                            }}
                        >
                            <div className='flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#2c7bbe] to-[#4cc7e8] flex items-center justify-center shadow-[0_8px_30px_rgba(76,199,232,0.18)]'>
                                <Icon className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                            </div>

                            <div className='min-w-0'>
                                <h3 className='text-white font-extrabold text-base sm:text-[28px] leading-tight mb-1.5'>{title}</h3>
                                <p className='text-gray-400 text-sm sm:text-xl leading-relaxed max-w-4xl'>{desc}</p>
                            </div>
                        </div>
                    ))}

                    <div className='px-4 sm:px-8 pb-4 sm:pb-8 pt-2 sm:pt-5'>
                        <Button
                            onClick={() => router.push('/pricing')}
                            size='lg'
                            className='w-full h-14 sm:h-16 rounded-2xl border border-[#6ad7f0] bg-gradient-to-r from-[#3d82c2] to-[#57c4e4] hover:from-[#4a8fd0] hover:to-[#63cee8] text-white text-base sm:text-2xl font-bold shadow-[0_0_30px_rgba(76,199,232,0.22)] transition-all duration-300'
                        >
                            Open Account
                            {/* <span className='ml-3 text-lg sm:text-2xl'>→</span> */}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Black Snow Mathematics Banner ──────────────────────────────────────────
function BSMBanner() {
    const router = useRouter();

    return (
        <section className='relative px-4 sm:px-6 md:px-8 py-6 sm:py-8'>
            <div className='container mx-auto max-w-7xl'>
                <button
                    onClick={() => router.push('/blacksnowmathematics')}
                    className='group relative block w-full overflow-hidden cursor-pointer rounded-2xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]'
                    style={{
                        background: 'linear-gradient(180deg, #07111e 0%, #0a1324 50%, #07111e 100%)',
                        border: '1px solid rgba(56,126,189,0.55)',
                        boxShadow: '0 0 24px rgba(44,123,190,0.20), inset 0 0 28px rgba(0,0,0,0.55)',
                    }}
                >
                    <div
                        className='absolute inset-0 pointer-events-none'
                        style={{
                            background:
                                'linear-gradient(90deg, transparent 0%, rgba(76,199,232,0.06) 20%, rgba(76,199,232,0.12) 50%, rgba(76,199,232,0.06) 80%, transparent 100%)',
                        }}
                    />
                    <div
                        className='absolute top-0 left-0 right-0 h-[1px]'
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(76,199,232,0.9), transparent)' }}
                    />
                    <div
                        className='absolute bottom-0 left-0 right-0 h-[1px]'
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(76,199,232,0.7), transparent)' }}
                    />

                    <div className='relative px-4 sm:px-6 md:px-10 py-4 sm:py-5'>
                        <div className='flex w-full items-center justify-center gap-2 sm:gap-4 md:gap-6'>
                            <div className='hidden lg:flex items-center flex-shrink-0 gap-[3px] min-w-0'>
                                {[0.25, 0.45, 0.7, 1].map((opacity, i) => (
                                    <div
                                        key={`lA-${i}`}
                                        style={{
                                            width: 0,
                                            height: 0,
                                            borderTop: '8px solid transparent',
                                            borderBottom: '8px solid transparent',
                                            borderLeft: `9px solid rgba(76,199,232,${opacity})`,
                                            filter: opacity === 1 ? 'drop-shadow(0 0 5px rgba(76,199,232,0.9))' : 'none',
                                        }}
                                    />
                                ))}
                                <span className='mx-1' />
                                {[0.25, 0.45, 0.7, 1].map((opacity, i) => (
                                    <div
                                        key={`lB-${i}`}
                                        style={{
                                            width: 0,
                                            height: 0,
                                            borderTop: '8px solid transparent',
                                            borderBottom: '8px solid transparent',
                                            borderLeft: `9px solid rgba(76,199,232,${opacity})`,
                                            filter: opacity === 1 ? 'drop-shadow(0 0 5px rgba(76,199,232,0.9))' : 'none',
                                        }}
                                    />
                                ))}
                            </div>

                            <div className='flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3 md:gap-4'>
                                <div
                                    className='hidden md:block flex-shrink-0 h-[1px] w-8 lg:w-14 xl:w-20'
                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(76,199,232,0.55))' }}
                                />

                                <h2 className='min-w-0 text-center uppercase font-black tracking-[0.05em] sm:tracking-[0.09em] leading-tight text-[13px] xs:text-[15px] sm:text-lg md:text-2xl lg:text-[28px] whitespace-normal break-words'>
                                    <span style={{ color: '#f5f7fb', textShadow: '0 0 12px rgba(255,255,255,0.10)' }}>BLACK SNOW</span>{' '}
                                    <span style={{ color: '#4cc7e8', textShadow: '0 0 14px rgba(76,199,232,0.60)' }}>MATHEMATICS</span>
                                </h2>

                                <div
                                    className='flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center'
                                    style={{
                                        borderColor: 'rgba(76,199,232,0.55)',
                                        background: 'rgba(76,199,232,0.08)',
                                        boxShadow: '0 0 10px rgba(76,199,232,0.22)',
                                    }}
                                >
                                    <span className='text-[11px] sm:text-sm font-black leading-none' style={{ color: '#4cc7e8' }}>
                                        ›
                                    </span>
                                </div>

                                <div
                                    className='hidden md:block flex-shrink-0 h-[1px] w-8 lg:w-14 xl:w-20'
                                    style={{ background: 'linear-gradient(270deg, transparent, rgba(76,199,232,0.55))' }}
                                />
                            </div>

                            <div className='hidden lg:flex items-center flex-shrink-0 gap-[3px] min-w-0' style={{ transform: 'scaleX(-1)' }}>
                                {[0.25, 0.45, 0.7, 1].map((opacity, i) => (
                                    <div
                                        key={`rA-${i}`}
                                        style={{
                                            width: 0,
                                            height: 0,
                                            borderTop: '8px solid transparent',
                                            borderBottom: '8px solid transparent',
                                            borderLeft: `9px solid rgba(76,199,232,${opacity})`,
                                            filter: opacity === 1 ? 'drop-shadow(0 0 5px rgba(76,199,232,0.9))' : 'none',
                                        }}
                                    />
                                ))}
                                <span className='mx-1' />
                                {[0.25, 0.45, 0.7, 1].map((opacity, i) => (
                                    <div
                                        key={`rB-${i}`}
                                        style={{
                                            width: 0,
                                            height: 0,
                                            borderTop: '8px solid transparent',
                                            borderBottom: '8px solid transparent',
                                            borderLeft: `9px solid rgba(76,199,232,${opacity})`,
                                            filter: opacity === 1 ? 'drop-shadow(0 0 5px rgba(76,199,232,0.9))' : 'none',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </section>
    );
}

// ─── Data Driven Analytics Section ──────────────────────────────────────────
function DataAnalyticsSection() {
    const analyticsBlocks = [
        {
            label: 'Analytics',
            title: 'Performance Analytics',
            accent: '#4cc7e8',
            icon: BarChart2,
            body: `Turn raw market data into clear, actionable insight. Our analytics engine breaks down performance, patterns, and trading behavior so you can see exactly what's working — and what isn't. Review win rates, risk exposure, and strategy effectiveness with precision. Every trade becomes feedback, helping you continuously optimize your approach using measurable results.`,
        },
        {
            label: 'Infrastructure',
            title: 'Trading Infrastructure',
            accent: '#5EDC7A',
            icon: Zap,
            body: `Built on modern, scalable technology, the platform delivers fast execution, real time updates, and automated workflows designed for serious traders. From performance tracking to intelligent alerts, every component works together seamlessly. The infrastructure is engineered for reliability, speed, and growth — allowing you to move faster, trade smarter, and stay focused on strategy instead of software.`,
        },
        {
            label: 'Philosophy',
            title: 'Black Snow Philosophy',
            accent: '#F5A623',
            icon: Shield,
            body: `Black Snow is built to make trading more accessible, clear, and practical for everyone. Whether you're learning the basics or refining advanced strategies, the platform is designed to support confident decision-making across stocks, options, and crypto. We focus on simple, powerful tools that remove complexity without removing control. Our goal is to provide an open trading environment where anyone can learn, practice, and grow at their own pace.`,
        },
    ];

    return (
        <section className='relative py-16 sm:py-24 px-4 sm:px-6 md:px-8 bg-[#050608] overflow-hidden'>
            <div
                className='pointer-events-none absolute inset-0'
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(44,123,190,0.06) 0%, transparent 60%)' }}
            />
            <div
                className='pointer-events-none absolute inset-0'
                style={{
                    backgroundImage: `linear-gradient(rgba(44,123,190,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(44,123,190,0.025) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />

            <div className='container mx-auto max-w-7xl relative z-10'>
                <div className='text-center mb-12 sm:mb-14'>
                    <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 px-5 py-2 text-[11px] font-bold tracking-[0.22em]'>
                        PLATFORM FOUNDATION
                    </Badge>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight'>
                        Built for Modern{' '}
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Trading Workflows</span>
                    </h2>
                    <p className='text-sm sm:text-base text-gray-400 max-w-2xl mx-auto'>
                        Professional tools, cleaner presentation, and a sharper focus on what matters most.
                    </p>
                </div>

                <div className='grid md:grid-cols-3 gap-5 lg:gap-6'>
                    {analyticsBlocks.map(({ label, title, accent, icon: Icon, body }) => (
                        <div
                            key={label}
                            className='relative rounded-2xl border border-white/10 p-6 sm:p-7 transition-all duration-300 hover:border-white/15'
                            style={{
                                background: 'linear-gradient(180deg, rgba(13,17,23,0.98) 0%, rgba(11,19,32,0.98) 100%)',
                                boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                            }}
                        >
                            <div
                                className='absolute top-0 left-0 right-0 h-[1px]'
                                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                            />

                            <div className='flex items-center gap-4 mb-5'>
                                <div
                                    className='w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0'
                                    style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}35` }}
                                >
                                    <Icon className='w-5 h-5' style={{ color: accent }} />
                                </div>

                                <div>
                                    <p className='text-[11px] font-bold tracking-[0.22em] uppercase' style={{ color: accent }}>
                                        {label}
                                    </p>
                                    <h3 className='text-xl sm:text-2xl font-bold text-white mt-1 leading-tight'>{title}</h3>
                                </div>
                            </div>

                            <div className='h-px w-14 mb-5' style={{ background: `${accent}55` }} />

                            <p className='text-gray-400 text-sm sm:text-base leading-relaxed'>{body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

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

    // Per-panel discovery/details tab state (one per panel)
    const [panelTabs, setPanelTabs] = useState<Record<string, 'Details' | 'Discovery'>>(Object.fromEntries(strategyPanels.map((p) => [p.id, 'Details'])));

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

    // Bolds the first word of each bullet
    const BSBullets = ({ accent, items, large = false }: { accent: string; items: string[]; large?: boolean }) => (
        <div className={large ? 'space-y-5 md:space-y-7' : 'space-y-4'}>
            {items.map((text, idx) => {
                const spaceIdx = text.indexOf(' ');
                const boldPart = spaceIdx !== -1 ? text.slice(0, spaceIdx) : text;
                const restPart = spaceIdx !== -1 ? text.slice(spaceIdx) : '';
                return (
                    <div key={idx} className='flex items-start gap-3 md:gap-4'>
                        <CheckCircle
                            strokeWidth={3}
                            className={large ? 'h-6 w-6 md:h-7 md:w-7 mt-0.5 flex-shrink-0' : 'h-5 w-5 mt-0.5 flex-shrink-0'}
                            style={{ color: accent }}
                        />
                        <div
                            className={large ? 'text-lg md:text-xl lg:text-2xl text-white/80 leading-snug' : 'text-base md:text-lg text-white/80 leading-snug'}
                        >
                            <span className='font-bold text-white'>{boldPart}</span>
                            {restPart}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // ─── STACKED STRATEGIES SECTION ──────────────────────────────────────────────
    const StackedStrategiesSection = () => {
        return (
            <section className='relative py-16 px-4 sm:px-6 md:px-8 bg-[#0B1320] overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]' />

                <div className='container mx-auto max-w-7xl relative z-10'>
                    {/* Section Heading */}
                    <div className='text-center mb-12'>
                        <h2 className='text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                Explore Data-Driven
                            </span>
                            <br />
                            <span className='text-white'>Market </span>
                            <div className='relative inline-block'>
                                <span className='bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] bg-clip-text text-transparent'>
                                    {' '}
                                    Intelligence Hub
                                </span>
                            </div>
                        </h2>
                        <p className='text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed font-light mt-6'>
                            Master every tool in your trading arsenal. Explore each strategy and discover how it works.
                        </p>
                    </div>

                    {/* Stacked panels */}
                    <div className='flex flex-col gap-8'>
                        {strategyPanels.map((panel) => {
                            const { HeaderIcon, accent, id } = panel;
                            const activeTab = panelTabs[id] ?? 'Details';

                            return (
                                <div
                                    key={id}
                                    className='relative rounded-3xl overflow-hidden border border-white/10 flex flex-col'
                                    style={{
                                        background: 'linear-gradient(135deg, #0d1117 0%, #0B1320 50%, #0d1117 100%)',
                                        boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.6), 0 0 80px ${accent}18`,
                                    }}
                                >
                                    {/* Glow accent line at top */}
                                    <div
                                        className='absolute top-0 left-0 right-0 h-[2px]'
                                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                                    />
                                    <div
                                        className='pointer-events-none absolute inset-0'
                                        style={{ background: `radial-gradient(ellipse at 20% 30%, ${accent}0d 0%, transparent 55%)` }}
                                    />

                                    {/* Header + Tabs Row */}
                                    <div className='relative z-10 flex flex-col gap-6 px-5 sm:px-10 md:px-14 lg:px-16 pt-8 md:pt-10 lg:pt-12 pb-0'>
                                        <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
                                            <div className='flex items-center gap-4 sm:gap-5 min-w-0'>
                                                <div
                                                    className='flex items-center justify-center rounded-2xl h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 flex-shrink-0'
                                                    style={{ backgroundColor: accent }}
                                                >
                                                    <HeaderIcon
                                                        className='h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 lg:h-16 lg:w-16'
                                                        style={{ color: '#0B1320' }}
                                                    />
                                                </div>
                                                <div className='min-w-0'>
                                                    <div className='text-2xl sm:text-4xl md:text-5xl lg:text-6xl lg:mb-2 font-bold text-white leading-tight'>
                                                        {panel.label}
                                                    </div>
                                                    <div
                                                        className='text-sm sm:text-lg md:text-xl lg:text-2xl font-medium leading-snug'
                                                        style={{ color: accent }}
                                                    >
                                                        {panel.headerSubtitle}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reference-style Tabs */}
                                            <div className='w-full lg:w-auto lg:flex-shrink-0'>
                                                <div className='relative flex items-end gap-6 sm:gap-8 md:gap-10 overflow-x-auto'>
                                                    {(
                                                        [
                                                            { label: 'Details', value: 'Details' },
                                                            { label: 'Discovery', value: 'Discovery' },
                                                        ] as const
                                                    ).map((tab) => {
                                                        const isActive = activeTab === tab.value;

                                                        return (
                                                            <button
                                                                key={tab.value}
                                                                onClick={() => setPanelTabs((prev) => ({ ...prev, [id]: tab.value }))}
                                                                className='relative flex-shrink-0 px-0 py-2 sm:py-3 text-center transition-all duration-200'
                                                                style={{ background: 'transparent', border: 'none', outline: 'none' }}
                                                            >
                                                                <span
                                                                    className='block text-[13px] sm:text-[15px] md:text-lg font-black uppercase tracking-[0.08em] sm:tracking-[0.12em] transition-all duration-200'
                                                                    style={{
                                                                        color: isActive ? accent : 'rgba(187, 204, 230, 0.72)',
                                                                        textShadow: isActive ? `0 0 12px ${accent}55` : 'none',
                                                                    }}
                                                                >
                                                                    {tab.label}
                                                                </span>

                                                                <span
                                                                    className='absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-all duration-300'
                                                                    style={{
                                                                        background: isActive ? accent : 'transparent',
                                                                        boxShadow: isActive ? `0 0 10px ${accent}` : 'none',
                                                                        opacity: isActive ? 1 : 0,
                                                                        transform: isActive ? 'scaleX(1)' : 'scaleX(0.55)',
                                                                    }}
                                                                />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thin separator line below header/tabs */}
                                    <div
                                        className='relative z-10 mx-5 sm:mx-10 md:mx-14 lg:mx-16 mt-5 md:mt-6 h-px'
                                        style={{ background: 'rgba(255,255,255,0.07)' }}
                                    />

                                    {/* Tab Content */}
                                    <div
                                        key={`${id}-${activeTab}`}
                                        className='relative z-10 flex-1 flex flex-col px-5 sm:px-10 md:px-14 lg:px-16 py-8 md:py-12 lg:py-16 animate-slide-in-left'
                                    >
                                        {activeTab === 'Details' ? (
                                            /* ── DETAILS TAB ── */
                                            <>
                                                <div>
                                                    <h3 className='text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-white leading-tight mb-6 md:mb-8'>
                                                        {panel.title}
                                                    </h3>
                                                    <div className='space-y-2 md:space-y-3'>
                                                        {panel.description.split('\n').map((line, i) => (
                                                            <p key={i} className='text-base sm:text-xl md:text-2xl text-white/45 leading-relaxed'>
                                                                {line}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className='flex flex-col xl:flex-row xl:items-end justify-between gap-8 md:gap-12 mt-8 md:mt-12 lg:mt-16'>
                                                    <BSBullets accent={accent} items={panel.bullets} large />
                                                    <div className='flex-shrink-0'>
                                                        <button
                                                            type='button'
                                                            className='w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 rounded-full inline-flex items-center justify-center gap-3 font-semibold text-white text-base md:text-lg lg:text-xl whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95'
                                                            style={{
                                                                background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
                                                                border: `2px solid ${accent}`,
                                                                boxShadow: `0 0 28px ${accent}45`,
                                                            }}
                                                        >
                                                            {panel.cta}
                                                            {/* <span aria-hidden className='leading-none text-xl'>
                                                                →
                                                            </span> */}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            /* ── DISCOVERY TAB ── */
                                            <div className='flex flex-col gap-8 md:gap-12'>
                                                <p className='text-lg sm:text-2xl md:text-3xl text-white/70 leading-relaxed font-light'>
                                                    {panel.discoveryContent}
                                                </p>
                                                <div className='flex-shrink-0'>
                                                    <button
                                                        type='button'
                                                        className='w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 rounded-full inline-flex items-center justify-center gap-3 font-semibold text-white text-base md:text-lg lg:text-xl whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95'
                                                        style={{
                                                            background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
                                                            border: `2px solid ${accent}`,
                                                            boxShadow: `0 0 28px ${accent}45`,
                                                        }}
                                                    >
                                                        {panel.discoveryCta}
                                                        {/* <span aria-hidden className='leading-none text-xl'>
                                                            →
                                                        </span> */}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
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
                            <div className='space-y-3 animate-slide-in-left delay-200'>
                                <h1 className='text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight'>
                                    <span className='text-[#f4f4f4]'>Global Multi-Asset</span>
                                    <br />
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2a8dcc] to-[#2c7bbe] bg-clip-text text-transparent font-black'>
                                        Intelligence Engine
                                    </span>
                                </h1>
                                <p className='text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl font-light'>
                                    Data-driven global paper trading, stock screening, watchlists, and economic KPI&apos;s
                                </p>
                            </div>

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

            {/* ─── MOBILE & DESKTOP COMPATIBLE ─── */}
            <MobileDesktopSection />

            {/* ─── EXPLORE DATA-DRIVEN MARKET INTELLIGENCE HUB ─── */}
            <StackedStrategiesSection />

            {/* ─── DATA DRIVEN ANALYTICS SECTION ─── */}
            <DataAnalyticsSection />

            {/* ─── NEWSLETTER SECTION ─── */}
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

            {/* ─── BLACK SNOW MATHEMATICS BANNER ─── */}
            <BSMBanner />

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
