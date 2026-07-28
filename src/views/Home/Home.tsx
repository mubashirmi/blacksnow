import AuthModal from '@/components/AuthModal';
import { PricingComponent } from '@/components/PricingComponent';
import { LottieAnimation } from '@/components/lottie-animation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription as DialogDesc, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { BarChart2, Calendar, CheckCircle, DollarSign, Globe, LayoutGrid, List, Shield, Smartphone, TrendingUp, X, Zap } from 'lucide-react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';
import { CookieConsentBanner } from './components/CookieConsentBanner';

const textOptions = ['Market Data', 'Swing Trades', 'Stock Options', 'Day Trades', 'Long Term Investment', 'Chart Patterns', 'Indicators', 'Stock Lists'];

// ─── Strategy Panels Data ───────────────────────────────────────────────────
const strategyPanels = [
    {
        id: 'market-at-glance',
        label: 'Major Indexes',
        accent: '#5EDC7A',
        HeaderIcon: TrendingUp,
        headerSubtitle: 'Market at a Glance',
        title: 'Market Movers',
        description: `Track indices, currencies, metals, and crypto ahead.\nIdentify capital flow and position before market moves.`,
        bullets: ['Track major indices performance', 'Monitor sector capital rotation', 'Identify gainers losers sentiment'],
        cta: 'View Market Overview',
        discoveryContent: `Get a real-time snapshot of the broader market across major indices, currencies, metals, and crypto. Market at a Glance helps you quickly understand where capital is flowing, which assets are gaining momentum, and how sentiment is shifting across global markets. Instead of piecing together scattered information, you can monitor the full landscape in one place and identify opportunities before they fully develop.`,
        discoveryCta: 'Open Market Overview',
    },
    {
        id: 'paper-trading',
        label: 'Paper Trading',
        accent: '#F5A623',
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
        accent: '#c45002',
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
    {
        id: 'economic-simulator',
        label: 'Economic Simulator',
        accent: '#5F32C8',
        HeaderIcon: BarChart2,
        headerSubtitle: 'Supply and Demand',
        title: 'Interactive Charts',
        description: `Explore advanced economic models with dynamic visuals and rigorous theory.\nUsers can manipulate charts using toggle switches for insights, equilibrium analysis, and growth.`,
        bullets: ['Interactive toggles for chart control', 'Access advanced economic models', 'Build core market understanding'],
        cta: 'Explore Simulator',
        discoveryContent: `Interact with economic models through dynamic charts designed to make complex theory easier to understand. Adjust variables, use toggle controls, and explore how changes in supply, demand, equilibrium, and growth affect outcomes in real time. The simulator turns static concepts into hands-on learning, helping users build stronger intuition around market mechanics, price behavior, and economic relationships through clear visual feedback.`,
        discoveryCta: 'Open Economic Simulator',
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
                    <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black leading-[1.22] sm:leading-tight text-white mb-3'>
                        <span className='whitespace-nowrap'>Mobile & Desktop</span>{' '}
                        <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent whitespace-nowrap'>Compatible</span>
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
                                <h3 className='text-white font-extrabold text-base sm:text-[28px] leading-[1.28] sm:leading-tight mb-1.5'>{title}</h3>
                                <p className='text-gray-400 text-sm sm:text-xl leading-relaxed max-w-4xl'>{desc}</p>
                            </div>
                        </div>
                    ))}

                    <div className='px-4 sm:px-8 pb-4 sm:pb-8 pt-2 sm:pt-5'>
                        <Button
                            onClick={() => router.push('/signup')}
                            size='lg'
                            className='w-full h-14 cursor-pointer sm:h-16 rounded-2xl border border-[#6ad7f0] bg-gradient-to-r from-[#3d82c2] to-[#57c4e4] hover:from-[#4a8fd0] hover:to-[#63cee8] text-white text-base sm:text-2xl font-bold shadow-[0_0_30px_rgba(76,199,232,0.22)] transition-all duration-300'
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

// ─── Data Driven Analytics Section ──────────────────────────────────────────
function DataAnalyticsSection() {
    const analyticsBlocks = [
        {
            label: 'Analytics',
            title: 'Data Driven Analytics',
            accent: '#4cc7e8',
            icon: BarChart2,
            body: `Turn raw market data into clear, actionable insight. Our analytics engine breaks down performance, patterns, and trading behavior so you can see exactly what's working — and what isn't. Review win rates, risk exposure, and strategy effectiveness with precision. Every trade becomes feedback, helping you continuously optimize your approach using measurable results.`,
        },
        {
            label: 'Infrastructure',
            title: 'Smart Technology Infrastructure',
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
        {
            label: 'Execution',
            title: 'Trade Execution Engine',
            accent: '#F5A623',
            icon: DollarSign,
            body: `Execute trades with speed, precision, and full control. Manage entries, exits, and position sizing with accuracy while minimizing slippage in fast markets. Every action is calculated and intentional, giving you the ability to operate with discipline, consistency, and confidence across any market condition or level of volatility.`,
        },
        {
            label: 'Optimization',
            title: 'Strategy Optimization',
            accent: '#5F32C8',
            icon: TrendingUp,
            body: `Continuously refine your approach using real performance data. Analyze outcomes, identify strengths and weaknesses, and adapt strategies based on measurable results. Turn every trade into feedback, improving decision-making over time while optimizing for consistency, efficiency, and long-term performance across changing market environments.`,
        },
        {
            label: 'Technology',
            title: 'Data-Driven Technology',
            accent: '#E74C3C',
            icon: LayoutGrid,
            body: `Leverage real-time data to drive every decision with precision. Our system processes vast datasets to uncover patterns, detect shifts, and deliver actionable intelligence. Eliminate guesswork and operate with clarity, speed, and confidence as every move is backed by measurable data, continuous analysis, and proven performance insights.`,
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
                    <h2 className='text-[clamp(1.6rem,6.8vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-[1.22] sm:leading-tight'>
                        <span className='whitespace-nowrap'>Built for Modern</span>{' '}
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent whitespace-nowrap'>
                            Trading Workflows
                        </span>
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
                                    <h3 className='text-xl sm:text-2xl font-bold text-white mt-1 leading-[1.28] sm:leading-tight'>{title}</h3>
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
    const [authOpen, setAuthOpen] = useState(false);
    const [openPricingAfterAuth, setOpenPricingAfterAuth] = useState(false);
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
        const userId = localStorage.getItem('userId') || localStorage.getItem('id');
        const cookies = parseCookies();
        const id = cookies.id || userId;

        if (!userId || !id) {
            setIsSubscribeFormOpen(false);
            setPricingOpen(false);
            setOpenPricingAfterAuth(false);
            setAuthOpen(true);
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

    const handleAuthSuccess = () => {
        setIsSubscribeFormOpen(false);
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
                    <h3 className='max-[420px]:text-base text-lg sm:text-xl font-bold text-white leading-[1.28]'>Weekly Market Intelligence</h3>
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
                        <h2 className='text-[clamp(1.38rem,5.8vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-[1.22] sm:leading-tight'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent whitespace-nowrap'>
                                Explore Data-Driven
                            </span>
                            <br />
                            <span className='whitespace-nowrap'>
                                <span className='text-white'>Market </span>
                                <span className='relative inline-block'>
                                    <span className='bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] bg-clip-text text-transparent'>
                                        Intelligence Hub
                                    </span>
                                </span>
                            </span>
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
                                    {/* Tab Content */}
                                    <div className='relative z-10 px-5 sm:px-10 md:px-14 lg:px-16 py-8 md:py-12 lg:py-16'>
                                        <div className='grid'>
                                            {/* ── DETAILS TAB ── */}
                                            <div
                                                aria-hidden={activeTab !== 'Details'}
                                                className={`col-start-1 row-start-1 flex flex-col transition-all duration-300 ${
                                                    activeTab === 'Details'
                                                        ? 'visible opacity-100 translate-x-0'
                                                        : 'invisible opacity-0 translate-x-4 pointer-events-none'
                                                }`}
                                            >
                                                <div>
                                                    <h3 className='text-2xl md:text-5xl lg:text-6xl font-extralight text-white leading-[1.22] md:leading-tight mb-6 md:mb-8'>
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
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── DISCOVERY TAB ── */}
                                            <div
                                                aria-hidden={activeTab !== 'Discovery'}
                                                className={`col-start-1 row-start-1 flex flex-col gap-8 md:gap-12 transition-all duration-300 ${
                                                    activeTab === 'Discovery'
                                                        ? 'visible opacity-100 translate-x-0'
                                                        : 'invisible opacity-0 translate-x-4 pointer-events-none'
                                                }`}
                                            >
                                                <p className='text-base sm:text-xl md:text-2xl text-white/70 leading-relaxed'>{panel.discoveryContent}</p>

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
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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
            {authOpen && (
                <AuthModal
                    open={authOpen}
                    onOpenChange={(open) => {
                        setAuthOpen(open);
                        if (open) setPricingOpen(false);
                    }}
                    defaultView='signup'
                    sourceRoute='/'
                    onSuccess={handleAuthSuccess}
                />
            )}

            {/* ─── HERO SECTION ─── */}
            <section className='relative flex items-center justify-center py-10 sm:py-14 min-[1100px]:py-14 px-4 sm:px-6 md:px-8 lg:px-8 min-h-[calc(100vh-64px)] min-[1100px]:min-h-0'>
                <div className='absolute inset-0'>
                    <div className='absolute inset-0 bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/blacksnowbgimage.webp')" }} />
                    <div className='absolute inset-0 bg-black/90' />
                </div>

                <div className='relative z-10 w-full max-w-[1160px] mx-auto'>
                    <div className='grid min-[1100px]:grid-cols-2 items-center'>
                        {/* ── LEFT ── */}
                        <div className='flex flex-col gap-7 min-[1100px]:gap-8 min-w-0'>
                            <div className='space-y-3 animate-slide-in-left delay-200'>
                                <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight'>
                                    <span className='text-[#f4f4f4] whitespace-nowrap'>Global Multi-Asset</span>
                                    <br />
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2a8dcc] to-[#2c7bbe] bg-clip-text text-transparent font-black whitespace-nowrap'>
                                        Intelligence Engine
                                    </span>
                                </h1>

                                <p className='text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed max-w-xl font-light'>
                                    Data-driven global paper trading, stock screening, watchlists, and economic KPI&apos;s
                                </p>
                            </div>

                            {/* Mobile animation */}
                            <div className='block min-[1100px]:hidden w-full animate-slide-in-left delay-300'>
                                <div className='flex items-center justify-center w-full rounded-2xl border border-[#2c7bbe]/20 bg-[#07131a]/50'>
                                    <LottieAnimation
                                        src='/animations/growthChartIcon.json'
                                        className='w-full h-[220px] xs:h-[250px]'
                                        loop={true}
                                        autoplay={true}
                                    />
                                </div>
                            </div>

                            <div className='animate-slide-in-left delay-400 overflow-hidden w-full'>
                                <NewsletterSubscribeBar />
                            </div>
                        </div>

                        {/* ── RIGHT — desktop only ── */}
                        <div className='hidden min-[1100px]:flex relative animate-slide-in-right w-full items-center justify-center'>
                            <div className='w-full max-w-[440px] aspect-square bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-3xl border border-[#2c7bbe]/20 overflow-hidden'>
                                <LottieAnimation src='/animations/growthChartIcon.json' className='w-full h-full' loop={true} autoplay={true} />
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

            {/* <HomeTourPopup /> */}

            {/* 4) Pricing Modal */}
            {!authOpen && <PricingComponent name='NewsLetter' asModal open={pricingOpen} onOpenChange={setPricingOpen} />}

            <CookieConsentBanner />
        </div>
    );
}

export { Home };
