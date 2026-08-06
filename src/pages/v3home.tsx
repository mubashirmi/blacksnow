import { LottieAnimation } from '@/components/lottie-animation';
import { SubscriptionModal } from '@/components/subscription-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Award,
    BarChart2,
    CheckCircle,
    Clock,
    DollarSign,
    Layers,
    RefreshCw,
    Rocket,
    Shield,
    Target,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
const textOptions = ['Market Data', 'Swing Trades', 'Stock Options', 'Day Trades', 'Long Term Investment', 'Chart Patterns', 'Indicators', 'Stock Lists'];

function Page() {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTextIndex((prevIndex) => (prevIndex + 1) % textOptions.length);
        }, 2000); // Change text every 2 second

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Simplified Background System - Removed floating icon */}
            <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                {/* Geometric Grid */}
                <div className='absolute inset-0 opacity-5'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `
              linear-gradient(rgba(76, 199, 232, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(76, 199, 232, 0.1) 1px, transparent 1px)
            `,
                            backgroundSize: '100px 100px',
                        }}
                    ></div>
                </div>
            </div>

            {/* HERO SECTION - Updated content */}
            <section className='bg-[#CDE7FF] relative min-h-screen flex items-center justify-center px-8 py-32'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-20 items-center'>
                        {/* LEFT: Content from image */}
                        <div className='space-y-12'>
                            <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                                Live Market Analysis
                            </Badge>

                            <div className='space-y- animate-slide-in-left delay-200'>
                                <h1 className='text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight'>
                                    <div className='relative inline-block'>
                                        <span className='text-black/80'>Investment &nbsp; strategies</span>
                                    </div>
                                    <br />
                                    <span className='text-black/80 leading-tight'>for&nbsp; everyone &nbsp;on &nbsp;the</span>
                                    <br />
                                    <div className='relative inline-block'>
                                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2a8dcc] to-[#2c7bbe] bg-clip-text text-transparent font-black'>
                                            internet
                                        </span>
                                    </div>
                                </h1>

                                <div className='relative'>
                                    <p className='text-lg lg:text-xl text-gray-800 leading-relaxed max-w-3xl font-light'>
                                        Learn comprehensive trading strategies and market data analysis to make informed investment decisions in today&apos;s
                                        dynamic markets.
                                    </p>
                                </div>
                            </div>

                            <div className='space-y-8 animate-slide-in-left delay-400'>
                                <div className='flex flex-col lg:flex-row gap-6'>
                                    <Button
                                        size='lg'
                                        className='cursor-pointer group relative bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] hover:from-[#4cc7e8] hover:via-[#2a8dcc] hover:to-[#2c7bbe] text-white px-10 py-6 text-lg font-black shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl overflow-hidden'
                                    >
                                        <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                        <span
                                            className='inline-block animate-[cubicText_0.5s_cubic-bezier(0.68,-0.55,0.27,1.55)]'
                                            key={textOptions[currentTextIndex]}
                                        >
                                            Learn : {textOptions[currentTextIndex]}
                                        </span>
                                        <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300' />
                                    </Button>
                                </div>

                                {/* Newsletter Signup */}
                                <div className='bg-gradient-to-r from-[#2c7bbe]/10 via-[#4cc7e8]/20 to-[#2a8dcc]/10 backdrop-blur-2xl rounded-3xl p-8 border border-[#4cc7e8] shadow-2xl shadow-[#2c7bbe]/20'>
                                    <div className='flex flex-col lg:flex-row gap-4'>
                                        <Input
                                            placeholder='Join our Newsletter'
                                            className='flex-1 bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-100 backdrop-blur-sm font-semibold text-lg py-6'
                                        />
                                        <Button
                                            onClick={openModal}
                                            className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white cursor-pointer font-black px-8 py-6 text-lg shadow-lg'
                                        >
                                            Subscribe
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Lottie Animation */}
                        <div className='relative animate-slide-in-right'>
                            <div className='relative overflow-hidden'>
                                {/* Lottie Animation Container */}
                                <div className='relative flex items-center justify-center w-full h-full'>
                                    <div className='flex items-center justify-center bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-3xl border border-[#2c7bbe]/70'>
                                        <LottieAnimation src='/animations/growthChartIcon.json' className='w-[550px] h-[550px]' loop={true} autoplay={true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trading Strategies Section - Updated content from images */}
            <section className='relative py-32 px-6 bg-[#fff]'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='text-center mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in'>
                            MASTER THE MARKETS
                        </Badge>
                        <h2 className='text-4xl lg:text-5xl font-black text-black/80 mb-6 animate-slide-in-up'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Covered Calls Vs</span>
                            <br />
                            Protective Puts
                        </h2>
                        <p className='text-lg text-gray-9200 max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            Understand the sophisticated differences between covered calls and protective puts with our comprehensive analysis framework
                        </p>
                    </div>

                    <div className='grid lg:grid-cols-2 gap-12'>
                        {/* Covered Calls Card */}
                        <div className='group relative animate-slide-in-left'>
                            <div className='absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500'></div>
                            <Card className='relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-green-500/30 hover:border-green-400/50 transition-all duration-500 rounded-3xl overflow-hidden transform hover:scale-105'>
                                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500'></div>

                                <CardHeader className='p-8'>
                                    <div className='flex items-center justify-between mb-4'>
                                        <div className='flex items-center space-x-4'>
                                            <div className='w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse'>
                                                <TrendingUp className='w-7 h-7 text-white' />
                                            </div>
                                            <div>
                                                <CardTitle className='text-2xl font-bold text-white'>Covered Calls</CardTitle>
                                                <CardDescription className='text-green-400 font-semibold text-base'>
                                                    Profit From Stock Price Increase
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className='p-8 pt-0 space-y-6'>
                                    <div className='space-y-4'>
                                        <div className='bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20 transform hover:scale-105 transition-transform duration-300'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse'></div>
                                                Right to Buy:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Call options give the holder the right (but not the obligation) to buy the underlying asset at a specified
                                                strike price before expiration
                                            </p>
                                        </div>

                                        <div className='bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20 transform hover:scale-105 transition-transform duration-300'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse'></div>
                                                Leverage Potential:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Investors use calls to gain leveraged exposure to stock price increases, potentially leading to higher
                                                percentage returns than buying the stock outright
                                            </p>
                                        </div>

                                        <div className='bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20 transform hover:scale-105 transition-transform duration-300'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse'></div>
                                                Bullish Strategy:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Calls are typically used in bullish strategies, allowing investors to profit from anticipated price increases in
                                                the underlying asset
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Protective Puts Card */}
                        <div className='group relative animate-slide-in-right'>
                            <div className='absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500'></div>
                            <Card className='relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-red-500/30 hover:border-red-400/50 transition-all duration-500 rounded-3xl overflow-hidden transform hover:scale-105'>
                                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-rose-500'></div>

                                <CardHeader className='p-8'>
                                    <div className='flex items-center justify-between mb-4'>
                                        <div className='flex items-center space-x-4'>
                                            <div className='w-14 h-14 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse'>
                                                <Shield className='w-7 h-7 text-white' />
                                            </div>
                                            <div>
                                                <CardTitle className='text-2xl font-bold text-white'>Protective Puts</CardTitle>
                                                <CardDescription className='text-red-400 font-semibold text-base'>
                                                    Profit From Stock Price Decrease
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className='p-8 pt-0 space-y-6'>
                                    <div className='space-y-4'>
                                        <div className='bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-2xl p-6 border border-red-500/20 transform hover:scale-105 transition-transform duration-300'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse'></div>
                                                Right to Sell:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Put options provide the holder the right (but not the obligation) to sell the underlying asset at a specified
                                                strike price before expiration
                                            </p>
                                        </div>

                                        <div className='bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-2xl p-6 border border-red-500/20 transform hover:scale-105 transition-transform duration-300'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse'></div>
                                                Hedging Tool:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Puts are commonly used as a hedging strategy to protect against declines in asset prices, helping to offset
                                                potential losses in a portfolio
                                            </p>
                                        </div>

                                        <div className='bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-2xl p-6 border border-red-500/20 transform hover:scale-105 transition-transform duration-300'>
                                            <h4 className='font-bold text-white mb-3 flex items-center'>
                                                <div className='w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse'></div>
                                                Bearish Strategy:
                                            </h4>
                                            <p className='text-gray-300 leading-relaxed text-sm'>
                                                Investors use puts to profit from anticipated decreases in the underlying asset&apos;s price, making them a
                                                useful tool in bearish market conditions
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
            <section className='relative py-40 px-6 bg-[#CDE7FF] overflow-hidden'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    {/* Revolutionary Header */}
                    <div className='text-center mb-24 animate-slide-in-up'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in uppercase'>
                            Elite Framework
                        </Badge>

                        <h2 className='text-5xl lg:text-7xl font-black text-white mb-8 leading-tight'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent animate-gradient bg-300%'>
                                Learn Multiple Day
                            </span>
                            <br />
                            <span className='text-black/80'>Trading</span>{' '}
                            <span className='relative inline-block'>
                                <span className='bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] bg-clip-text text-transparent'>Strategies</span>
                                <div className='absolute -bottom-4 left-0 right-0 h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full opacity-60 animate-pulse'></div>
                            </span>
                        </h2>

                        <p className='text-xl lg:text-2xl text-gray-800 max-w-4xl mx-auto leading-relaxed font-light'>
                            Transform from beginner to <span className='text-[#4cc7e8] font-bold'>elite trader</span> with our revolutionary framework that has
                            generated <span className='text-[#2c7bbe] font-bold'>$12.8M+</span> in profits
                        </p>
                    </div>

                    <div className='relative'>
                        {/* Connecting Lines */}
                        <div className='hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4cc7e8]/30 to-transparent transform -translate-y-1/2 z-0'></div>

                        <div className='grid lg:grid-cols-3 gap-12 lg:gap-8 relative z-10'>
                            {/* Step 1: Problem Analysis */}
                            <div className='group relative animate-slide-in-left'>
                                {/* Floating Number Badge */}
                                <div className='absolute -top-6 left-8 z-20'>
                                    <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/40 transform group-hover:scale-110 transition-transform duration-300'>
                                        <span className='text-white font-black text-lg'>1</span>
                                    </div>
                                </div>

                                {/* Glowing Background Effect */}
                                <div className='absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-60'></div>

                                {/* Main Card */}
                                <div className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl rounded-3xl p-10 border-2 border-red-500/30 hover:border-red-400/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-2xl shadow-red-500/20 min-h-[600px] flex flex-col h-full'>
                                    {/* Animated Top Border */}
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-rose-500 to-red-600 rounded-t-3xl'></div>

                                    {/* Floating Icons */}
                                    <div className='absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300'>
                                        <AlertTriangle className='w-8 h-8 text-red-400 animate-pulse' />
                                    </div>

                                    {/* Header */}
                                    <div className='mb-8'>
                                        <div className='flex items-center space-x-4 mb-6'>
                                            <div className='w-16 h-16 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse'>
                                                <Clock className='w-8 h-8 text-white' />
                                            </div>
                                            <div>
                                                <h3 className='text-2xl font-black text-red-400 mb-2'>IDENTIFY</h3>
                                                <p className='text-red-300 font-semibold'>Market Problems</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 space-y-6'>
                                        <h4 className='text-3xl font-black text-white leading-tight'>
                                            Stop Losing Money on <span className='text-red-400'>Bad Trades</span>
                                        </h4>

                                        <p className='text-gray-300 leading-relaxed text-lg'>
                                            Most traders fail because they rely on insufficient market data and ignore critical warning signals. Our AI
                                            identifies these costly mistakes before they happen.
                                        </p>

                                        {/* Problem Points */}
                                        <div className='space-y-4'>
                                            {[
                                                {
                                                    icon: TrendingDown,
                                                    text: 'Missing key market signals',
                                                    color: 'text-red-400',
                                                },
                                                {
                                                    icon: AlertTriangle,
                                                    text: 'Ignoring risk indicators',
                                                    color: 'text-orange-400',
                                                },
                                                {
                                                    icon: Clock,
                                                    text: 'Poor timing decisions',
                                                    color: 'text-yellow-400',
                                                },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className='flex items-center space-x-4 p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-2xl border border-red-500/20 transform hover:scale-105 transition-transform duration-300'
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
                                            <div className='flex items-center justify-between mb-4'>
                                                <span className='text-red-400 font-bold'>Risk Analysis</span>
                                                <div className='flex space-x-2'>
                                                    <div className='w-2 h-2 bg-red-400 rounded-full animate-pulse'></div>
                                                    <div className='w-2 h-2 bg-rose-400 rounded-full animate-pulse delay-300'></div>
                                                    <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse delay-600'></div>
                                                </div>
                                            </div>
                                            <div className='text-white font-semibold text-lg'>High-Risk Signals Detected</div>
                                            <div className='text-red-400 text-sm mt-2'>Avoiding 73% of potential losses</div>
                                        </div>
                                    </div>

                                    {/* Floating Elements */}
                                    <div className='absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-slow opacity-80'>
                                        <AlertTriangle className='w-8 h-8 text-white' />
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Strategy Selection */}
                            <div className='group relative animate-slide-in-up delay-200'>
                                {/* Floating Number Badge */}
                                <div className='absolute -top-6 left-8 z-20'>
                                    <div className='w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40 transform group-hover:scale-110 transition-transform duration-300'>
                                        <span className='text-white font-black text-lg'>2</span>
                                    </div>
                                </div>

                                {/* Glowing Background Effect */}
                                <div className='absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-60'></div>

                                {/* Main Card */}
                                <div className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl rounded-3xl p-10 border-2 border-orange-500/30 hover:border-orange-400/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-2xl shadow-orange-500/20 min-h-[600px] flex flex-col h-full'>
                                    {/* Animated Top Border */}
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 rounded-t-3xl'></div>

                                    {/* Floating Icons */}
                                    <div className='absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300'>
                                        <RefreshCw className='w-8 h-8 text-orange-400 animate-spin-slow' />
                                    </div>

                                    {/* Header */}
                                    <div className='mb-8'>
                                        <div className='flex items-center space-x-4 mb-6'>
                                            <div className='w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse'>
                                                <Layers className='w-8 h-8 text-white' />
                                            </div>
                                            <div>
                                                <h3 className='text-2xl font-black text-orange-400 mb-2'>STRATEGIZE</h3>
                                                <p className='text-orange-300 font-semibold'>Smart Selection</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 space-y-6'>
                                        <h4 className='text-3xl font-black text-white leading-tight'>
                                            Choose <span className='text-orange-400'>Winning</span> Strategies
                                        </h4>

                                        <p className='text-gray-300 leading-relaxed text-lg'>
                                            Our AI analyzes thousands of market scenarios to recommend the optimal trading strategy for current market
                                            conditions and your risk profile.
                                        </p>

                                        {/* Strategy Points */}
                                        <div className='space-y-4'>
                                            {[
                                                {
                                                    icon: Activity,
                                                    text: 'AI-powered strategy selection',
                                                    color: 'text-orange-400',
                                                },
                                                {
                                                    icon: BarChart2,
                                                    text: 'Real-time market analysis',
                                                    color: 'text-yellow-400',
                                                },
                                                {
                                                    icon: Target,
                                                    text: 'Risk-optimized approaches',
                                                    color: 'text-amber-400',
                                                },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className='flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl border border-orange-500/20 transform hover:scale-105 transition-transform duration-300'
                                                >
                                                    <div className='w-10 h-10 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl flex items-center justify-center'>
                                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                                    </div>
                                                    <span className='text-white font-semibold'>{item.text}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Interactive Strategy Selector */}
                                        <div className='bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-2xl p-6 border border-orange-500/20'>
                                            <div className='flex items-center justify-between mb-4'>
                                                <span className='text-orange-400 font-bold'>Current Strategy</span>
                                                <div className='flex space-x-2'>
                                                    <div className='w-2 h-2 bg-orange-400 rounded-full animate-pulse'></div>
                                                    <div className='w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300'></div>
                                                    <div className='w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-600'></div>
                                                </div>
                                            </div>
                                            <div className='text-white font-semibold text-lg'>Momentum Scalping</div>
                                            <div className='text-gray-400 text-sm mt-2'>Optimized for current volatility</div>
                                        </div>
                                    </div>

                                    {/* Floating Elements */}
                                    <div className='absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-slow opacity-80'>
                                        <RefreshCw className='w-8 h-8 text-white animate-spin-slow' />
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Profit Execution */}
                            <div className='group relative animate-slide-in-right delay-400'>
                                {/* Floating Number Badge */}
                                <div className='absolute -top-6 left-8 z-20'>
                                    <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/40 transform group-hover:scale-110 transition-transform duration-300'>
                                        <span className='text-white font-black text-lg'>3</span>
                                    </div>
                                </div>

                                {/* Glowing Background Effect */}
                                <div className='absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-60'></div>

                                {/* Main Card */}
                                <div className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl rounded-3xl p-10 border-2 border-green-500/30 hover:border-green-400/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-2xl shadow-green-500/20 min-h-[600px] flex flex-col h-full'>
                                    {/* Animated Top Border */}
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-t-3xl'></div>

                                    {/* Floating Icons */}
                                    <div className='absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300'>
                                        <Rocket className='w-8 h-8 text-green-400 animate-bounce' />
                                    </div>

                                    {/* Header */}
                                    <div className='mb-8'>
                                        <div className='flex items-center space-x-4 mb-6'>
                                            <div className='w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse'>
                                                <DollarSign className='w-8 h-8 text-white' />
                                            </div>
                                            <div>
                                                <h3 className='text-2xl font-black text-green-400 mb-2'>EXECUTE</h3>
                                                <p className='text-green-300 font-semibold'>Profit Generation</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 space-y-6'>
                                        <h4 className='text-3xl font-black text-white leading-tight'>
                                            Generate <span className='text-green-400'>Consistent</span> Profits
                                        </h4>

                                        <p className='text-gray-300 leading-relaxed text-lg'>
                                            Execute trades with precision using our automated signals and real-time monitoring. Watch your portfolio grow with
                                            systematic, data-driven decisions.
                                        </p>

                                        {/* Success Metrics */}
                                        <div className='space-y-4'>
                                            {[
                                                {
                                                    icon: TrendingUp,
                                                    text: 'Automated trade execution',
                                                    color: 'text-green-400',
                                                    value: '99.2%',
                                                },
                                                {
                                                    icon: DollarSign,
                                                    text: 'Profit optimization',
                                                    color: 'text-emerald-400',
                                                    value: '+347%',
                                                },
                                                {
                                                    icon: Award,
                                                    text: 'Risk management',
                                                    color: 'text-teal-400',
                                                    value: 'Elite',
                                                },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className='flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20 transform hover:scale-105 transition-transform duration-300'
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
                                            <div className='flex items-center justify-between mb-4'>
                                                <span className='text-green-400 font-bold'>Live Profits</span>
                                                <div className='flex items-center space-x-2'>
                                                    <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                                                    <span className='text-green-400 text-sm font-semibold'>ACTIVE</span>
                                                </div>
                                            </div>
                                            <div className='text-white font-black text-2xl'>$47,230</div>
                                            <div className='text-green-400 text-sm mt-2 flex items-center'>
                                                <TrendingUp className='w-4 h-4 mr-2' />
                                                +28.3% this month
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Elements */}
                                    <div className='absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-slow opacity-80'>
                                        <Rocket className='w-8 h-8 text-white' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revolutionary CTA Section */}
                    <div className='text-center mt-24 animate-slide-in-up delay-600'>
                        <div className='bg-gradient-to-r from-[#2c7bbe]/10 via-[#4cc7e8]/20 to-[#2a8dcc]/10 backdrop-blur-2xl rounded-3xl p-12 border border-[#4cc7e8] shadow-2xl shadow-[#2c7bbe]/20 max-w-4xl mx-auto'>
                            <h3 className='text-4xl font-black text-black/80 mb-6'>
                                Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Transform</span> Your
                                Trading?
                            </h3>
                            <p className='text-xl text-gray-800 mb-8 max-w-2xl mx-auto'>
                                Join 75,000+ elite traders who&apos;ve mastered our 3-step framework and generated over $12.8M in profits
                            </p>

                            <div className='flex flex-col lg:flex-row gap-6 justify-center items-center'>
                                <Button
                                    size='lg'
                                    className='group bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] hover:from-[#4cc7e8] hover:via-[#2a8dcc] hover:to-[#2c7bbe] text-white px-12 py-6 text-xl font-black shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-110 rounded-2xl'
                                >
                                    <Rocket className='w-6 h-6 mr-3 animate-pulse' />
                                    Start Elite Training
                                    <ArrowRight className='w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300' />
                                </Button>

                                <div className='flex items-center space-x-4 text-gray-300'>
                                    <div className='flex -space-x-2'>
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className='w-10 h-10 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full border-2 border-[#050608] flex items-center justify-center'
                                            >
                                                <span className='text-white font-bold text-sm'>{i}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className='text-black/80 font-bold'>75,000+ Traders</div>
                                        <div className='text-sm text-gray-700'>Already Mastering Markets</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section - Enhanced with Learn More Lottie Animation in a different position */}
            <section className='relative py-32 px-6 bg-[#fff]'>
                <div className='container mx-auto max-w-6xl'>
                    <div className='text-center mb-16'>
                        <h2 className='text-4xl lg:text-5xl font-black text-white mb-6'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>
                                Subscribe to our Monthly Newsletter
                            </span>
                            <br />
                            <span className='text-black/80'>to stay updated</span>
                        </h2>
                        <p className='text-xl text-gray-800 max-w-4xl mx-auto leading-relaxed'>
                            Streamline your search for market insights and get weekly updates, articles and recommended reads every week. Reduce your time by
                            staying up to date with the latest information available.
                        </p>
                    </div>

                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        <div className='space-y-6'>
                            {[
                                'Get your weekly stock picks for day trades, swing trades, options and dividends',
                                'Receive trading Strategy from the best performances in top market sectors including A.I, EV, and Tech',
                                'Catch blog updates from every week',
                                'View limited time special offers and sponsorships',
                                'Read Featured News Articles',
                            ].map((item, index) => (
                                <div key={index} className='flex items-start space-x-4'>
                                    <div className='w-6 h-6 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full flex items-center justify-center mt-1 flex-shrink-0'>
                                        <CheckCircle className='w-4 h-4 text-white' />
                                    </div>
                                    <p className='text-gray-800 leading-relaxed'>{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className='relative'>
                            {/* Learn More Animation positioned at top right of the subscription form */}
                            <div className='absolute -top-15 -right-15 z-10'>
                                <div className='w-28 overflow-hidden h-28 bg-gradient-to-br from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-sm'>
                                    <LottieAnimation src='/animations/LearnMore.json' className='w-24 h-24' loop={true} autoplay={true} />
                                </div>
                            </div>

                            <div className='bg-gradient-to-r from-[#2c7bbe]/10 via-[#4cc7e8]/20 to-[#2a8dcc]/10 backdrop-blur-2xl rounded-3xl p-8 border border-[#4cc7e8]/30 shadow-2xl shadow-[#2c7bbe]/20'>
                                <div className='flex flex-col gap-4'>
                                    <Input
                                        placeholder='Join Our Newsletter'
                                        className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-100 backdrop-blur-sm font-semibold text-lg py-6'
                                        readOnly
                                        onClick={openModal}
                                    />
                                    <Button
                                        onClick={openModal}
                                        className='cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-6 text-lg shadow-lg'
                                    >
                                        Subscribe
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='relative py-40 px-6 bg-[#CDE7FF] overflow-hidden'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-20 items-center'>
                        {/* LEFT: Master Stock List Content */}
                        <div className='space-y-12 animate-slide-in-left'>
                            {/* Premium Status Badge */}
                            <div className='rounded-[100px] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-6 px-6 py-2 text-sm font-bold animate-fade-in uppercase inline-block'>
                                Elite Stock Intelligence
                            </div>

                            {/* Headline */}
                            <div className='space-y-8'>
                                <h2 className='text-5xl lg:text-6xl font-black leading-tight'>
                                    <span className='text-black/80'>Build and Prospect a</span>
                                    <br />
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent animate-gradient bg-300%'>
                                        Master Stock List
                                    </span>
                                </h2>
                                <p className='text-xl lg:text-2xl text-gray-800 leading-relaxed font-light max-w-2xl'>
                                    Enrich your stock Market Trading experience by following and setting alerts for{' '}
                                    <span className='text-[#4cc7e8] font-bold'>Market Movers</span>
                                </p>
                            </div>

                            {/* Learning Points List */}
                            <div className='space-y-5'>
                                {[
                                    'Learn To Create Options Trading Lists',
                                    'Learn To Research Emerging Markets',
                                    'Learn To Identify Stock Market Press Release Source',
                                    'Learn To Set Price Movement Indicators',
                                    'Learn To Observe Major Stock Indicators',
                                    'Learn To Maintain Your Risk',
                                    'Learn Limit Sell, Stop Loss, and Paper Trading',
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className='group relative transform hover:scale-105 transition-all duration-300'
                                        style={{ animationDelay: `${index * 200}ms` }}
                                    >
                                        {/* Glowing Background */}
                                        <div className='absolute inset-0 bg-gradient-to-r from-[#4cc7e8]/10 to-[#2c7bbe]/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60'></div>

                                        {/* Main Content */}
                                        <div className='relative bg-gradient-to-r from-[#4cc7e8]/10 to-[#2c7bbe]/10 backdrop-blur-2xl rounded-2xl p-5 border border-[#35889f] hover:border-opacity-60 transition-all duration-300'>
                                            <div className='flex items-center space-x-4'>
                                                <div className='w-3 h-3 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full shadow-xl animate-pulse'></div>
                                                <h3 className='text-xl font-black text-black/70'>{item}</h3>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Lottie Animation */}
                        <div className='relative animate-slide-in-right flex justify-center overflow-hidden'>
                            <div className='relative overflow-hidden w-full h-[600px] max-w-full max-h-full'>
                                <LottieAnimation src='/animations/blackIcon.json' className='drop-shadow-2xl w-full h-full object-contain' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <SubscriptionModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
}

export default Page;
