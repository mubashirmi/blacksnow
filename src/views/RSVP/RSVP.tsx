'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { showNotification } from '@mantine/notifications';
import { AnimatePresence, motion } from 'framer-motion';
import lottie from 'lottie-web';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    Brain,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    Globe,
    Mail,
    Settings,
    Shield,
    Target,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState } from 'react';

export async function getServerSideProps(context) {
    const { req } = context;
    let initialIsLoggedIn = false;
    let initialToken = null;
    let initialId = null;

    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split('; ').reduce((acc, cookie) => {
            const [name, value] = cookie.split('=');
            acc[name] = decodeURIComponent(value);
            return acc;
        }, {});
        initialToken = cookies.token || null;
        initialId = cookies.id || null;
        initialIsLoggedIn = !!initialId;
    }

    return {
        props: { initialIsLoggedIn, initialToken, initialId },
    };
}

function RSVP({ initialIsLoggedIn }) {
    const router = useRouter();
    const { isLoggedIn, loading: authLoading } = useAuth();
    const [events, setEvents] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [updatesChecked, setUpdatesChecked] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);
    const [formErrors, setFormErrors] = useState({ name: '', email: '', phone: '', checkboxes: '' });

    const [modalOpened, setModalOpened] = useState(false);
    const [purchaseModalOpened, setPurchaseModalOpened] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const cookies = parseCookies();
    const id = cookies.id;

    useEffect(() => {
        if (router.isReady) {
            const { refId } = router.query;
            if (refId) {
                localStorage.setItem('referredby', refId as string);
                const trackRefIdClick = async () => {
                    try {
                        const currentUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                        const response = await fetch(`/api/v2/clicks/?id=${refId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ productLink: currentUrl }),
                        });
                        if (response.ok) console.log('RefId click tracked successfully');
                        else console.error('Failed to track refId click');
                    } catch (error) {
                        console.error('Error tracking refId click:', error);
                    }
                };
                trackRefIdClick();
            }
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/v1/calendar');
                const data = await response.json();
                if (data.success) {
                    setEvents(data.data);
                    if (data.data.length > 0) setSelectedEvent(data.data[0].id);
                } else {
                    setError('Failed to fetch calendar events');
                }
            } catch (err) {
                setError('Error fetching calendar events');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const curriculumParts = [
        {
            title: 'Part 1: Introduction to the Stock Market',
            description:
                'Master the fundamentals of stock market trading with our comprehensive introduction course. Learn from industry experts and build a solid foundation for your trading journey.',
            items: [
                {
                    title: 'Understanding Market Mechanics',
                    description: 'Overview of how stock markets operate and key players involved',
                    icon: Settings,
                    color: 'from-[#4cc7e8] to-[#2c7bbe]',
                },
                {
                    title: 'Types of Financial Markets',
                    description: 'Distinction between primary and secondary markets, and different asset classes',
                    icon: BarChart3,
                    color: 'from-[#2c7bbe] to-[#4cc7e8]',
                },
                {
                    title: 'Market Structure',
                    description: 'Explanation of exchanges, over-the-counter markets, and market makers',
                    icon: Target,
                    color: 'from-[#4cc7e8] to-[#2a8dcc]',
                },
                {
                    title: 'Key Stock Market Terminology',
                    description: 'Definitions of market capitalization, liquidity, volatility, and more',
                    icon: BookOpen,
                    color: 'from-[#2a8dcc] to-[#2c7bbe]',
                },
                {
                    title: 'Stock Types',
                    description: 'Differences between common and preferred stocks, and their respective rights',
                    icon: TrendingUp,
                    color: 'from-[#2c7bbe] to-[#4cc7e8]',
                },
                {
                    title: 'Role of Indices',
                    description: 'Understanding major stock indices (e.g., S&P 500, Dow Jones) and their significance',
                    icon: Award,
                    color: 'from-[#4cc7e8] to-[#2a8dcc]',
                },
                {
                    title: 'Market Hours and Trading Sessions',
                    description: 'Overview of regular trading hours and pre/post-market sessions',
                    icon: Clock,
                    color: 'from-[#2a8dcc] to-[#2c7bbe]',
                },
                {
                    title: 'Understanding Economic Indicators',
                    description: 'How economic data impacts stock market performance',
                    icon: Globe,
                    color: 'from-[#2c7bbe] to-[#4cc7e8]',
                },
                {
                    title: 'Market Sentiment',
                    description: 'Role of news, earnings reports, and global events in shaping investor sentiment',
                    icon: Brain,
                    color: 'from-[#4cc7e8] to-[#2a8dcc]',
                },
                {
                    title: 'Importance of Regulation',
                    description: 'Overview of regulatory bodies (e.g., SEC) and their role in protecting investors',
                    icon: Shield,
                    color: 'from-[#2a8dcc] to-[#2c7bbe]',
                },
            ],
        },
        {
            title: 'Part 2: Fundamental Analysis',
            description: 'Dive deeper into analyzing company fundamentals and long-term value.',
            items: [
                { title: 'Financial Statements', description: 'How to read and interpret income, balance sheet, and cash flow', icon: BookOpen },
                { title: 'Valuation Metrics', description: 'P/E, EPS, ROI, book value—what they mean and how to use them', icon: BarChart3 },
                { title: 'Industry Analysis', description: 'Evaluating industry growth potential and risks', icon: Globe },
                { title: 'Economic Indicators', description: 'GDP, inflation, unemployment, interest rates in stock evaluation', icon: TrendingUp },
                { title: 'Management Assessment', description: 'Evaluating leadership quality and governance', icon: Award },
                { title: 'Earnings Reports', description: 'How to analyze earnings and forecasts', icon: Calendar },
                { title: 'Market Competition', description: 'Assessing competitors and moat strength', icon: Target },
                { title: 'Growth vs. Gains', description: 'Long-term growth vs. short-term gains', icon: Brain },
                { title: 'Dividends & Returns', description: 'Evaluating dividend-paying stocks and total return', icon: DollarSign },
                { title: 'Creating a Watchlist', description: 'Build a fundamentals-driven watchlist', icon: Eye },
            ],
        },
        {
            title: 'Part 3: Technical Analysis Basics',
            description: 'Learn how to read charts, indicators, and patterns to guide trades.',
            items: [
                { title: 'Understanding Charts', description: 'Candlestick, line, bar — when to use each', icon: BookOpen },
                { title: 'Key Indicators', description: 'Moving averages, RSI, MACD, Bollinger Bands', icon: BarChart3 },
                { title: 'Chart Patterns', description: 'Head & shoulders, triangles, flags', icon: Target },
                { title: 'Support & Resistance', description: 'Identify and use S/R levels', icon: Shield },
                { title: 'Volume Analysis', description: 'Use volume to confirm trends/patterns', icon: Users },
                { title: 'Trend Analysis', description: 'Up, down, sideways — reading trend structure', icon: TrendingUp },
                { title: 'Time Frames', description: 'Selecting time frames for strategies', icon: Clock },
                { title: 'Combining Indicators', description: 'Confluence for better decisions', icon: Brain },
                { title: 'Backtesting', description: 'Validate strategies with historical data', icon: CheckCircle },
                { title: 'Trading Plan', description: 'Integrate TA into a full plan', icon: Settings },
            ],
        },
        {
            title: 'Part 4: Day Trading Strategies',
            description: 'Tactics, risk rules, and psychology for intraday trading.',
            items: [
                { title: 'Intro to Day Trading', description: 'Objectives, setups, and routines', icon: BookOpen },
                { title: 'Scalping Techniques', description: 'Quick trades for small profits', icon: Clock },
                { title: 'Momentum Trading', description: 'Ride strong moves with risk controls', icon: TrendingUp },
                { title: 'News-Based Trading', description: 'Trade earnings and catalysts', icon: Mail },
                { title: 'Risk Management', description: 'Stops, sizing, R-multiples', icon: Shield },
                { title: 'Level II Quotes', description: 'Reading market depth', icon: BarChart3 },
                { title: 'Discipline', description: 'Stick to plan; avoid overtrading', icon: Award },
                { title: 'Trading Psychology', description: 'Biases and emotional control', icon: Brain },
                { title: 'Live Examples', description: 'Real-time walkthroughs', icon: Eye },
                { title: 'Trade Reviews', description: 'Journal and improve systematically', icon: BookOpen },
            ],
        },
        {
            title: 'Part 5: Options Trading Fundamentals',
            description: 'Core concepts, pricing, and essential strategies for options.',
            items: [
                { title: 'What Are Options?', description: 'Calls, puts, intrinsic/extrinsic', icon: BookOpen },
                { title: 'Terminology', description: 'Strike, expiry, premium, moneyness', icon: Settings },
                { title: 'Basic Strategies', description: 'Buying calls/puts — when and why', icon: Target },
                { title: 'Leverage & Risk', description: 'Risk/reward profiles explained', icon: Shield },
                { title: 'Pricing Models', description: 'Black–Scholes basics & the Greeks', icon: BarChart3 },
                { title: 'Market Conditions', description: 'Volatility regimes and usage', icon: Globe },
                { title: 'Covered Calls / CSPs', description: 'Income strategies overview', icon: DollarSign },
                { title: 'Implied Volatility', description: 'How IV impacts pricing & choices', icon: Eye },
                { title: 'Spreads & Combos', description: 'Bull/bear spreads & more', icon: ArrowRight },
                { title: 'Risk Management', description: 'Hedging and position sizing', icon: Shield },
            ],
        },
        {
            title: 'Part 6: Advanced Trading Strategies',
            description: 'Integrate methods, adapt to regimes, and measure performance.',
            items: [
                { title: 'Blend FA + TA', description: 'Use fundamentals with technicals', icon: Brain },
                { title: 'Multi-Strategy', description: 'Diversify edges and signals', icon: Settings },
                { title: 'Seasonality', description: 'Calendar/seasonal patterns', icon: Calendar },
                { title: 'Algo & Quant Basics', description: 'Rules, signals, and automation', icon: BarChart3 },
                { title: 'Behavioral Finance', description: 'Psychology & crowd dynamics', icon: Users },
                { title: 'News & Sentiment', description: 'Sentiment tools and feeds', icon: Mail },
                { title: 'Advanced Indicators', description: 'Fibonacci, volume profile, more', icon: Award },
                { title: 'Advanced Risk', description: 'Max drawdown, Kelly, VAR-intro', icon: Shield },
                { title: 'Adapt to Regimes', description: 'Trend, chop, volatility cycles', icon: Globe },
                { title: 'Performance Review', description: 'KPIs and continuous improvement', icon: CheckCircle },
            ],
        },
        {
            title: 'Part 7: Building a Professional Investment Portfolio',
            description: 'Construct, maintain, and monitor a robust long-term portfolio.',
            items: [
                { title: 'Asset Allocation', description: 'Diversify across asset classes', icon: BarChart3 },
                { title: 'Long-Term Strategies', description: 'Buy-and-hold frameworks', icon: Award },
                { title: 'Risk Tolerance', description: 'Assess risk profile & goals', icon: Shield },
                { title: 'Investment Vehicles', description: 'Stocks, bonds, ETFs, mutual funds', icon: BookOpen },
                { title: 'Balanced Portfolio', description: 'Blend growth and income', icon: Target },
                { title: 'Rebalancing', description: 'Maintain allocation over time', icon: Settings },
                { title: 'Tax Considerations', description: 'Capital gains, dividends, efficiency', icon: DollarSign },
                { title: 'Retirement Accounts', description: 'IRAs, 401(k)s, and benefits', icon: Calendar },
                { title: 'Monitoring', description: 'Track and evaluate performance', icon: Eye },
                { title: 'Investment Plan', description: 'Comprehensive, personalized plan', icon: Brain },
            ],
        },
    ];

    const [currentPartIndex, setCurrentPartIndex] = useState(0);

    const nextPart = () => setCurrentPartIndex((prev) => (prev + 1) % curriculumParts.length);
    const prevPart = () => setCurrentPartIndex((prev) => (prev === 0 ? curriculumParts.length - 1 : prev - 1));

    const validateForm = () => {
        let valid = true;
        const errors = { name: '', email: '', phone: '', checkboxes: '' };

        if (!name.trim()) {
            errors.name = 'Full Name is required';
            valid = false;
        } else {
            const [firstName] = name.trim().split(' ');
            if (!firstName) {
                errors.name = 'First name is required';
                valid = false;
            }
        }

        if (!email.trim()) {
            errors.email = 'Email is required';
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Invalid email format';
            valid = false;
        }

        if (!phone.trim()) {
            errors.phone = 'Phone Number is required';
            valid = false;
        } else if (!/^\d{10,15}$/.test(phone)) {
            errors.phone = 'Invalid phone number';
            valid = false;
        }

        if (!updatesChecked || !termsChecked) {
            errors.checkboxes = 'Both checkboxes must be checked';
            valid = false;
        }

        setFormErrors(errors);
        return valid;
    };

    const handleRSVP = async () => {
        if (submitLoading || fetchLoading || authLoading) return;

        if (!isLoggedIn) {
            setModalOpened(true);
            return;
        }

        if (!validateForm()) return;

        setSubmitLoading(true);

        try {
            const response = await fetch(`/api/v2/get-user-product-info/?id=${id}`);
            const data = await response.json();

            if (data.data.RSVP !== 'Purchased') {
                setPurchaseModalOpened(true);
                return;
            }

            const [firstName, ...lastNameParts] = name.trim().split(' ');
            const lastName = lastNameParts.join(' ');

            const rsvpResponse = await fetch('/api/v2/rsvp-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    phone,
                    firstName,
                    lastName,
                    calendarId: selectedEvent,
                }),
            });

            const rsvpData = await rsvpResponse.json();

            if (rsvpData.success) {
                showNotification({
                    title: 'Success',
                    message: 'Successfully registered for the event!',
                    color: 'green',
                });
                setName('');
                setEmail('');
                setPhone('');
                setUpdatesChecked(false);
                setTermsChecked(false);
                setSelectedEvent(events[0]?.id);
            } else {
                showNotification({
                    title: 'Error',
                    message: 'Failed to register. Please try again.',
                    color: 'red',
                });
            }
        } catch (err) {
            showNotification({
                title: 'Error',
                message: 'An error occurred. Please try again.',
                color: 'red',
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    const LottieAnimation = ({ src, loop = true, autoplay = true, style }) => {
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
                return () => animation.destroy();
            }
        }, [src, loop, autoplay]);
        return <div ref={containerRef} style={style} />;
    };

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hero Section */}
            <section className='relative pt-10 sm:pb:7 sm:pt-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='sm:text-center mb-6'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            EXCLUSIVE TRADING WEBINAR
                        </Badge>
                        <h1 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'> Webinar&nbsp;</span>RSVP
                        </h1>
                        <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5 sm:mx-auto'></div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className='relative pb-10 sm:pb-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-3 gap-12 lg:gap-16'>
                        {/* Curriculum */}
                        <div className='lg:col-span-2 space-y-12'>
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentPartIndex}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.45 }}
                                >
                                    <div className='space-y-6'>
                                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                            COMPREHENSIVE CURRICULUM
                                        </Badge>
                                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>
                                                {curriculumParts[currentPartIndex].title}
                                            </span>
                                        </h2>
                                        <p className='text-lg sm:text-xl text-gray-300 leading-relaxed'>{curriculumParts[currentPartIndex].description}</p>
                                    </div>

                                    <div className='space-y-6 mt-8'>
                                        {curriculumParts[currentPartIndex].items.map((item, index) => {
                                            const Icon = item.icon || CheckCircle;
                                            return (
                                                <Card
                                                    key={index}
                                                    className='group bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    {/* <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color || 'from-[#2c7bbe] to-[#4cc7e8]'}`}></div> */}
                                                    <CardContent className='p-6'>
                                                        <div className='flex items-start space-x-4'>
                                                            <div
                                                                className={`w-14 h-14 bg-gradient-to-r ${
                                                                    item.color || 'from-[#2c7bbe] to-[#4cc7e8]'
                                                                } rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                                            >
                                                                <Icon className='w-7 h-7 text-white' />
                                                            </div>
                                                            <div className='space-y-2 flex-1'>
                                                                <h3 className='text-lg sm:text-xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                                    {item.title}
                                                                </h3>
                                                                <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{item.description}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>

                                    <div className='flex justify-between items-center pt-8'>
                                        <Button
                                            variant='outline'
                                            onClick={prevPart}
                                            className='border-2 border-[#2c7bbe] text-[#2c7bbe] hover:bg-[#2c7bbe] hover:text-white px-6 sm:px-8 py-4 text-base sm:text-lg font-bold transition-all duration-300 rounded-lg'
                                        >
                                            <ArrowLeft className='w-5 h-5 mr-2' />
                                            Previous
                                        </Button>
                                        <div className='text-gray-400 font-semibold text-sm sm:text-base'>
                                            {currentPartIndex + 1} / {curriculumParts.length}
                                        </div>
                                        <Button
                                            variant='outline'
                                            onClick={nextPart}
                                            className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-6 sm:px-8 py-4 text-base sm:text-lg font-bold transition-all duration-300 rounded-lg'
                                        >
                                            Next
                                            <ArrowRight className='w-5 h-5 ml-2' />
                                        </Button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* RSVP Form */}
                        <div className='relative'>
                            <Card className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 rounded-3xl shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-xl overflow-hidden sticky top-8'>
                                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>
                                <CardHeader className='p-6 sm:p-8 pb-4'>
                                    <CardTitle className='text-2xl sm:text-3xl font-black text-white flex items-center'>
                                        <Calendar className='w-7 h-7 sm:w-8 sm:h-8 text-[#4cc7e8] mr-3' />
                                        Reserve Your Spot
                                    </CardTitle>
                                    <p className='text-sm sm:text-base text-gray-300 mt-2'>
                                        Join our exclusive webinar and start your journey to trading mastery. Limited seats available!
                                    </p>
                                </CardHeader>

                                <CardContent className='p-6 sm:p-8 pt-0 space-y-6'>
                                    {fetchLoading ? (
                                        <p className='text-white font-semibold text-center'>Loading events...</p>
                                    ) : error ? (
                                        <p className='text-red-400 font-semibold text-center'>{error}</p>
                                    ) : events.length > 0 ? (
                                        events.map((event) => {
                                            const displayDate = new Date(event.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            });
                                            return (
                                                <div
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event.id)}
                                                    className={`p-5 sm:p-6 bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                                        selectedEvent === event.id
                                                            ? 'border-[#4cc7e8] bg-gradient-to-r bg-[#2c7bbe]/20 to-[#4cc7e8]/20'
                                                            : 'border-[#2c7bbe]/20 hover:border-[#4cc7e8]/40'
                                                    }`}
                                                >
                                                    <div className='flex items-center space-x-3'>
                                                        <input
                                                            type='radio'
                                                            id={`event-${event.id}`}
                                                            name='event'
                                                            value={event.id}
                                                            checked={selectedEvent === event.id}
                                                            onChange={() => setSelectedEvent(event.id)}
                                                            className='w-4 h-4 text-[#4cc7e8] border-[#2c7bbe] focus:ring-[#4cc7e8] cursor-pointer'
                                                        />
                                                        <label
                                                            htmlFor={`event-${event.id}`}
                                                            className='text-white font-semibold cursor-pointer text-sm sm:text-base'
                                                        >
                                                            {displayDate}
                                                        </label>
                                                    </div>
                                                    <div className='flex items-center space-x-3 mt-2 text-sm text-gray-300'>
                                                        <Clock className='w-4 h-4 text-[#4cc7e8]' />
                                                        <span>{event.time}</span>
                                                    </div>
                                                    <div className='flex items-center space-x-3 mt-1 text-sm text-gray-300'>
                                                        <Users className='w-4 h-4 text-[#4cc7e8]' />
                                                        <span>{event.limit} seats</span>
                                                    </div>
                                                    <div className='flex items-center space-x-3 mt-1 text-sm'>
                                                        <DollarSign className='w-4 h-4 text-green-400' />
                                                        <span className='text-green-400 font-semibold'>FREE</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className='text-white font-semibold text-center'>No events available</p>
                                    )}

                                    <form className='space-y-5'>
                                        <div className='space-y-2'>
                                            <Input
                                                id='name'
                                                placeholder='Full Name'
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className='bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-500 focus:border-[#4cc7e8] transition-colors duration-300 rounded-xl'
                                            />
                                            {formErrors.name && <p className='text-red-400 text-sm'>{formErrors.name}</p>}
                                        </div>

                                        <div className='space-y-2'>
                                            <Input
                                                id='email'
                                                type='email'
                                                placeholder='Email Address'
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className='bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-500 focus:border-[#4cc7e8] transition-colors duration-300 rounded-xl'
                                            />
                                            {formErrors.email && <p className='text-red-400 text-sm'>{formErrors.email}</p>}
                                        </div>

                                        <div className='space-y-2'>
                                            <Input
                                                id='phone'
                                                type='tel'
                                                placeholder='Phone Number'
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className='bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-500 focus:border-[#4cc7e8] transition-colors duration-300 rounded-xl'
                                            />
                                            {formErrors.phone && <p className='text-red-400 text-sm'>{formErrors.phone}</p>}
                                        </div>

                                        <div className='space-y-4'>
                                            <div className='flex items-start space-x-3 p-4 bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 rounded-xl border border-[#2c7bbe]/20'>
                                                <Checkbox
                                                    id='updates'
                                                    checked={updatesChecked}
                                                    onCheckedChange={setUpdatesChecked}
                                                    className='mt-1 border-[#2c7bbe] data-[state=checked]:bg-[#4cc7e8] data-[state=checked]:border-[#4cc7e8]'
                                                />
                                                <Label htmlFor='updates' className='text-sm text-gray-300 leading-relaxed cursor-pointer'>
                                                    I want to receive trading tips and market updates
                                                </Label>
                                            </div>
                                            <div className='flex items-start space-x-3 p-4 bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 rounded-xl border border-[#2c7bbe]/20'>
                                                <Checkbox
                                                    id='terms'
                                                    checked={termsChecked}
                                                    onCheckedChange={setTermsChecked}
                                                    className='mt-1 border-[#2c7bbe] data-[state=checked]:bg-[#4cc7e8] data-[state=checked]:border-[#4cc7e8]'
                                                />
                                                <Label htmlFor='terms' className='text-sm text-gray-300 leading-relaxed cursor-pointer'>
                                                    I agree to the{' '}
                                                    <span className='text-[#4cc7e8] hover:text-[#2c7bbe] transition-colors duration-300 underline cursor-pointer'>
                                                        Terms & Conditions
                                                    </span>
                                                </Label>
                                            </div>
                                            {formErrors.checkboxes && <p className='text-red-400 text-sm'>{formErrors.checkboxes}</p>}
                                        </div>

                                        <Button
                                            type='button'
                                            size='lg'
                                            className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white py-5 sm:py-6 text-base sm:text-lg font-bold shadow-xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg'
                                            onClick={handleRSVP}
                                            disabled={submitLoading}
                                        >
                                            {submitLoading ? (
                                                <>
                                                    <Calendar className='w-5 h-5 sm:w-6 sm:h-6 mr-3 animate-spin' />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                                    RSVP
                                                    <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3' />
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    <p className='text-center text-xs sm:text-sm text-gray-400'>
                                        You&apos;ll receive a confirmation email with webinar access details
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            WEBINAR BENEFITS
                        </Badge>
                        <h1 className='text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>
                                What You&apos;ll Gain
                            </span>
                        </h1>
                    </div>

                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        <div className='space-y-6'>
                            {[
                                { title: 'Expert Knowledge', description: 'Learn from professional traders with years of market experience', icon: Brain },
                                { title: 'Practical Skills', description: 'Gain hands-on experience with real trading scenarios and strategies', icon: Target },
                                { title: 'Market Insights', description: 'Understand current market trends and future opportunities', icon: Eye },
                            ].map((benefit, index) => (
                                <Card
                                    key={index}
                                    className='bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'
                                >
                                    <CardContent className='p-6'>
                                        <div className='flex items-start space-x-4'>
                                            <div className='w-14 h-14 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center shadow-lg'>
                                                <benefit.icon className='w-7 h-7 text-white' />
                                            </div>
                                            <div className='space-y-2'>
                                                <h3 className='text-lg sm:text-xl font-bold text-white'>{benefit.title}</h3>
                                                <p className='text-sm sm:text-base text-gray-300'>{benefit.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className='flex justify-center'>
                            <div className='relative'>
                                <div className='absolute inset-0 w-96 h-96 bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-full blur-2xl'></div>
                                <div className='relative w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center shadow-2xl backdrop-blur-xl p-8'>
                                    <LottieAnimation src='/animations/rsvpicon.json' loop={true} autoplay={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modals */}
            <Dialog open={modalOpened} onOpenChange={setModalOpened}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-xl'>
                    <button
                        onClick={() => setModalOpened(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>
                    <DialogHeader className='space-y-6 text-center'>
                        <div className='flex flex-col items-center'>
                            <div className='w-16 h-16 mb-4 p-2 border-2 border-[#2c7bbe] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Image src='/logocolored.png' alt='Logo' width={100} height={100} className='object-contain drop-shadow-2xl' priority />
                            </div>
                            <DialogTitle className='text-2xl font-black text-white'>Signup Required</DialogTitle>
                            <DialogDescription className='text-[#4cc7e8] font-semibold'>You can&apos;t access the webinar until you sign up.</DialogDescription>
                        </div>
                    </DialogHeader>
                    <Button
                        onClick={() => router.push('/login?signup')}
                        className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-5 text-lg shadow-xl shadow-[#2c7bbe]/50 transition-all duration-500 transform hover:scale-105 rounded-2xl'
                    >
                        Signup
                    </Button>
                </DialogContent>
            </Dialog>

            <Dialog open={purchaseModalOpened} onOpenChange={setPurchaseModalOpened}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-xl'>
                    <button
                        onClick={() => setPurchaseModalOpened(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>
                    <DialogHeader className='space-y-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Calendar className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Purchase Required</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold'>
                                    You need to purchase an RSVP subscription to register.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <Button
                        onClick={() => router.push('/pricing')}
                        className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-5 text-lg shadow-xl shadow-[#2c7bbe]/50 transition-all duration-500 transform hover:scale-105 rounded-2xl'
                    >
                        Purchase Now
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export { RSVP };
