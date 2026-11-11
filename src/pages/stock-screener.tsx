import ComingSoonTrigger from '@/components/ComingSoonTrigger';
import HeroSection from '@/components/MainHeroSection';
import {
    ArrowRight,
    BarChart3,
    Bell,
    Bookmark,
    Check,
    ChevronDown,
    CircleDollarSign,
    Crosshair,
    Database,
    FileText,
    Landmark,
    LineChart,
    PieChart,
    RefreshCw,
    Scale,
    SlidersHorizontal,
    Star,
    TrendingUp,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import type { NextPage } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';

type ResultRow = {
    symbol: string;
    company: string;
    price: string;
    change: string;
    marketCap: string;
    pe: string;
    roe: string;
    revenueGrowth: string;
    range: number;
};

const GOLD = '#4333AF';
const GOLD_LIGHT = '#4333AF';
const PAGE_BG = '#0C0F18';
// const PANEL_BG = '#050608';
const BORDER = '#414A5D';

const resultRows: ResultRow[] = [
    {
        symbol: 'AAPL',
        company: 'Apple Inc.',
        price: '$187.32',
        change: '+1.25%',
        marketCap: '$2.90T',
        pe: '28.5',
        roe: '162%',
        revenueGrowth: '8.7%',
        range: 86,
    },
    {
        symbol: 'MSFT',
        company: 'Microsoft Corp.',
        price: '$389.45',
        change: '+0.73%',
        marketCap: '$2.89T',
        pe: '30.2',
        roe: '39%',
        revenueGrowth: '12.4%',
        range: 74,
    },
    {
        symbol: 'NVDA',
        company: 'NVIDIA Corp.',
        price: '$1,102.50',
        change: '+2.41%',
        marketCap: '$2.72T',
        pe: '66.1',
        roe: '98%',
        revenueGrowth: '125.6%',
        range: 92,
    },
    {
        symbol: 'AVGO',
        company: 'Broadcom Inc.',
        price: '$1,553.78',
        change: '+1.12%',
        marketCap: '$729B',
        pe: '45.3',
        roe: '32%',
        revenueGrowth: '15.2%',
        range: 81,
    },
    {
        symbol: 'AMD',
        company: 'Advanced Micro...',
        price: '$156.48',
        change: '+1.86%',
        marketCap: '$252B',
        pe: '85.7',
        roe: '8%',
        revenueGrowth: '4.3%',
        range: 67,
    },
];

const heroFeatures: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: SlidersHorizontal,
        title: 'Screen',
        body: 'Filter thousands of stocks with precision.',
    },
    {
        icon: LineChart,
        title: 'Analyze',
        body: 'View key metrics and financials instantly.',
    },
    {
        icon: Crosshair,
        title: 'Act',
        body: 'Build watchlists and track opportunities.',
    },
];

const screenCategories: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: Landmark,
        title: 'Fundamentals',
        body: 'Financial strength, profitability, growth.',
    },
    {
        icon: CircleDollarSign,
        title: 'Valuation',
        body: 'P/E, P/B, PEG, EV/EBITDA & more.',
    },
    {
        icon: TrendingUp,
        title: 'Technical',
        body: 'Price action, trends, momentum, volume.',
    },
    {
        icon: Users,
        title: 'Ownership',
        body: 'Institutions, insiders, ETF holdings.',
    },
];

const analyzeTools: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: PieChart,
        title: 'Key Metrics',
        body: 'Profitability, growth, valuation & more.',
    },
    {
        icon: LineChart,
        title: 'Charts',
        body: 'Price, volume, performance trends.',
    },
    {
        icon: Scale,
        title: 'Comparisons',
        body: 'Compare stocks side by side.',
    },
    {
        icon: FileText,
        title: 'Reports',
        body: 'Export, print, and share insights.',
    },
];

const opportunities: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: Star,
        title: 'Watchlists',
        body: 'Track your favorite stocks & screens.',
    },
    {
        icon: Bell,
        title: 'Alerts',
        body: 'Get notified of price moves, news & events.',
    },
    {
        icon: BarChart3,
        title: 'Market Insights',
        body: 'Top gainers, losers, and sector performance.',
    },
    {
        icon: Database,
        title: 'Data You Can Trust',
        body: 'Real-time, accurate data from trusted sources.',
    },
];

function CheckItem({ children }: { children: ReactNode }) {
    return (
        <li className='flex items-start gap-2.5 text-[13px] leading-[1.5] text-[#d4d4d1] sm:text-[14px]'>
            <span className='mt-[2px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: GOLD }}>
                <Check className='h-[10px] w-[10px]' strokeWidth={2.6} style={{ color: GOLD }} />
            </span>
            <span>{children}</span>
        </li>
    );
}

function SectionIntro({ number, title, description, children }: { number: string; title: string; description: string; children?: ReactNode }) {
    return (
        <div className='min-w-0 lg:pr-5'>
            <div className='flex items-center gap-3'>
                <span className='screener-serif page-section-number text-[43px] leading-none tracking-[-0.04em]' style={{ color: GOLD }}>
                    {number}
                </span>

                <span
                    className='mt-1 h-px w-9'
                    style={{
                        background: `linear-gradient(90deg, ${GOLD}, rgba(67,51,175,0.25))`,
                    }}
                />
            </div>

            <h2 className='screener-serif page-section-title mt-1 text-[28px] leading-[1.32] tracking-[-0.025em] text-[#f7f5ed] sm:text-[31px]'>{title}</h2>

            <p className='mt-3 max-w-[280px] text-[13px] leading-[1.55] text-[#d0d0cd] sm:text-[14px]'>{description}</p>

            {children}
        </div>
    );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={`overflow-hidden rounded-[12px] border ${className}`}
            style={{
                borderColor: BORDER,
                background: '#0C0F18',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02), 0 18px 40px rgba(0,0,0,0.20)',
            }}
        >
            {children}
        </div>
    );
}

function HeroArtwork() {
    return (
        <div className='relative mx-auto aspect-[530/389] w-full max-w-[570px]'>
            <div
                className='pointer-events-none absolute inset-[5%] blur-3xl'
                style={{
                    background: 'radial-gradient(circle, rgba(67,51,175,0.08) 0%, rgba(67,51,175,0.025) 50%, transparent 75%)',
                }}
            />

            <Image
                src='/images/stock-screener-hero-globe.webp'
                alt='Global stock screening'
                fill
                priority
                quality={100}
                sizes='(max-width: 1023px) 100vw, 570px'
                className='relative z-10 object-contain object-center'
            />

            <div className='pointer-events-none absolute inset-y-0 left-0 z-20 w-[3%] bg-gradient-to-r from-[#0C0F18] to-transparent' />
            <div className='pointer-events-none absolute inset-y-0 right-0 z-20 w-[2%] bg-gradient-to-l from-[#0C0F18] to-transparent' />
            <div className='pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[3%] bg-gradient-to-t from-[#0C0F18] to-transparent' />
        </div>
    );
}

function ScreenField({ label, operator, value }: { label: string; operator: string; value: string }) {
    return (
        <div className='grid grid-cols-[1.35fr_1.15fr_0.9fr_28px] overflow-hidden rounded-[4px] border border-[#414A5D] bg-[#000000]'>
            <div className='flex min-h-[37px] items-center px-3 text-[10px] text-[#d5d5d2]'>{label}</div>

            <button type='button' className='flex min-h-[37px] items-center justify-between border-l border-[#414A5D] px-3 text-[10px] text-[#d7d7d3]'>
                {operator}
                <ChevronDown className='h-3 w-3 text-[#8e8e88]' />
            </button>

            <button type='button' className='flex min-h-[37px] items-center justify-between border-l border-[#414A5D] px-3 text-[10px] text-[#e5e5df]'>
                {value}
                <ChevronDown className='h-3 w-3 text-[#8e8e88]' />
            </button>

            <button type='button' aria-label={`Remove ${label} filter`} className='flex items-center justify-center border-l border-[#414A5D]'>
                <X className='h-3 w-3' style={{ color: GOLD }} />
            </button>
        </div>
    );
}

function ScreenBuilder() {
    return (
        <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_190px]'>
            <Panel>
                <div className='px-4 pb-4 pt-4'>
                    <p className='text-center text-[11px] font-medium uppercase' style={{ color: GOLD }}>
                        Screen Builder
                    </p>

                    <div className='mt-3 space-y-2'>
                        <ScreenField label='Market Cap' operator='Greater Than' value='$2B' />
                        <ScreenField label='P/E Ratio (TTM)' operator='Less Than' value='20' />
                        <ScreenField label='ROE (TTM)' operator='Greater Than' value='15%' />
                        <ScreenField label='Revenue Growth (YoY)' operator='Greater Than' value='10%' />
                        <ScreenField label='50-Day MA' operator='Above' value='200-Day MA' />
                    </div>

                    <button
                        type='button'
                        className='mt-3 flex min-h-[34px] items-center gap-2 rounded-[4px] border bg-[#000000] px-3 text-[10px]'
                        style={{
                            color: GOLD_LIGHT,
                            borderColor: 'rgba(67,51,175,0.28)',
                        }}
                    >
                        <span className='text-[17px] leading-none'>+</span>
                        Add Filter
                    </button>
                </div>
            </Panel>

            <div className='grid gap-3'>
                <Panel>
                    <div className='px-4 py-4'>
                        <p className='text-[10px] font-medium uppercase' style={{ color: GOLD }}>
                            Matching Stocks
                        </p>

                        <div className='mt-2 flex items-center justify-between'>
                            <span className='text-[27px] font-light text-[#f4f3ed]'>248</span>

                            <button type='button' className='flex items-center gap-1.5 text-[9px] text-[#d1d1cd]'>
                                Update
                                <RefreshCw className='h-3 w-3' style={{ color: GOLD }} />
                            </button>
                        </div>

                        <div className='relative mt-4 h-[18px]'>
                            <div className='absolute left-0 right-0 top-1/2 border-t border-dashed border-[#4333AF]/35' />
                            {[5, 28, 50, 73, 95].map((position) => (
                                <span
                                    key={position}
                                    className='absolute top-1/2 h-[4px] w-[4px] -translate-y-1/2 rotate-45 bg-[#4333AF]'
                                    style={{ left: `${position}%` }}
                                />
                            ))}
                        </div>
                    </div>
                </Panel>

                <Panel>
                    <div className='px-4 py-4'>
                        <p className='text-[10px] font-medium uppercase' style={{ color: GOLD }}>
                            Quick Actions
                        </p>

                        <div className='mt-2 space-y-1'>
                            {[
                                { icon: Bookmark, label: 'Save Screen' },
                                { icon: Bell, label: 'Create Alert' },
                                { icon: Star, label: 'Add to Watchlist' },
                            ].map(({ icon: Icon, label }) => (
                                <button
                                    key={label}
                                    type='button'
                                    className='flex min-h-[30px] w-full items-center gap-2 border-b border-[#414A5D] text-left text-[10px] text-[#d5d5d2] last:border-b-0'
                                >
                                    <Icon className='h-3.5 w-3.5' style={{ color: GOLD }} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}

function RangeBar({ value }: { value: number }) {
    return (
        <div className='relative h-[14px] w-[58px]'>
            <div className='absolute left-0 right-0 top-1/2 h-px bg-[#4333AF]/80' />

            <div className='absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-[#4333AF]' style={{ left: `${Math.max(8, value - 10)}%` }} />

            <div
                className='absolute top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full border border-[#4333AF] bg-[#000000]'
                style={{ left: `${value}%` }}
            />
        </div>
    );
}

function ResultsPanel() {
    const columns = '.6fr 1.2fr .72fr .75fr .9fr .68fr .7fr .95fr .65fr';

    return (
        <Panel>
            <div className='px-4 pb-3 pt-4 sm:px-5'>
                <p className='text-[11px] font-medium uppercase' style={{ color: GOLD }}>
                    Screen Results
                </p>

                <div className='mt-3 hidden lg:block'>
                    <div className='grid border-y border-[#414A5D] py-2 text-[9px] uppercase text-[#a6a7a2]' style={{ gridTemplateColumns: columns }}>
                        <div>Symbol</div>
                        <div>Company</div>
                        <div>Price</div>
                        <div>Change %</div>
                        <div>Market Cap</div>
                        <div>P/E (TTM)</div>
                        <div>ROE (TTM)</div>
                        <div>Rev Growth (YoY)</div>
                        <div>52W Range</div>
                    </div>

                    {resultRows.map((row) => (
                        <div
                            key={row.symbol}
                            className='grid min-h-[39px] items-center border-b border-[#414A5D] text-[10px] text-[#d6d7d3]'
                            style={{ gridTemplateColumns: columns }}
                        >
                            <div className='font-semibold' style={{ color: GOLD }}>
                                {row.symbol}
                            </div>
                            <div>{row.company}</div>
                            <div>{row.price}</div>
                            <div style={{ color: GOLD }}>{row.change}</div>
                            <div>{row.marketCap}</div>
                            <div>{row.pe}</div>
                            <div>{row.roe}</div>
                            <div>{row.revenueGrowth}</div>
                            <RangeBar value={row.range} />
                        </div>
                    ))}
                </div>

                <div className='mt-2 lg:hidden'>
                    {resultRows.map((row) => (
                        <div key={row.symbol} className='border-b border-[#414A5D] py-3 last:border-b-0'>
                            <div className='flex items-start justify-between gap-4'>
                                <div>
                                    <p className='text-[13px] font-semibold' style={{ color: GOLD }}>
                                        {row.symbol}
                                    </p>
                                    <p className='mt-0.5 text-[11px] text-[#cacbc7]'>{row.company}</p>
                                </div>

                                <div className='text-right'>
                                    <p className='text-[12px] text-[#ededE8]'>{row.price}</p>
                                    <p className='mt-0.5 text-[11px]' style={{ color: GOLD }}>
                                        {row.change}
                                    </p>
                                </div>
                            </div>

                            <div className='mt-3 grid grid-cols-3 gap-3 text-[10px]'>
                                <div>
                                    <p className='uppercase text-[#777873]'>Market Cap</p>
                                    <p className='mt-1 text-[#c9cac6]'>{row.marketCap}</p>
                                </div>
                                <div>
                                    <p className='uppercase text-[#777873]'>P/E</p>
                                    <p className='mt-1 text-[#c9cac6]'>{row.pe}</p>
                                </div>
                                <div>
                                    <p className='uppercase text-[#777873]'>ROE</p>
                                    <p className='mt-1 text-[#c9cac6]'>{row.roe}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='flex items-center justify-between pt-3'>
                    <p className='text-[9px] text-[#8f908c]'>Showing 1 to 5 of 248 results</p>

                    <button type='button' className='group flex items-center gap-2 text-[10px]' style={{ color: GOLD }}>
                        View All Results
                        <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-1' />
                    </button>
                </div>
            </div>
        </Panel>
    );
}

function CircularGauge() {
    return (
        <div className='relative mx-auto h-[100px] w-[100px]'>
            <div
                className='absolute inset-0 rounded-full'
                style={{
                    background: 'conic-gradient(#4333AF 0deg 313deg, rgba(67,51,175,0.12) 313deg 360deg)',
                }}
            />

            <div className='absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-[#000000]'>
                <span className='text-[27px] leading-none text-[#f4f3ee]'>8.7</span>
                <span className='mt-1 text-[9px] text-[#b5b6b2]'>/10</span>
            </div>
        </div>
    );
}

function PerformanceRing() {
    return (
        <div className='relative mx-auto h-[82px] w-[82px] rounded-full border-[7px] border-[#4333AF]/15'>
            <div className='absolute inset-[-7px] rounded-full border-[7px] border-transparent border-r-[#4333AF] border-t-[#4333AF]' />
        </div>
    );
}

function AnalysisPanel() {
    return (
        <Panel>
            <div className='border-b border-[#414A5D] px-4 sm:px-5'>
                <div className='flex gap-5 overflow-x-auto'>
                    {['Overview', 'Financials', 'Charts', 'Ratios', 'Earnings', 'Ownership'].map((tab, index) => (
                        <button
                            key={tab}
                            type='button'
                            className='relative shrink-0 py-3 text-[10px] uppercase tracking-[0.02em]'
                            style={{
                                color: index === 0 ? GOLD_LIGHT : '#b2b3af',
                            }}
                        >
                            {tab}

                            {index === 0 && <span className='absolute bottom-0 left-0 right-0 h-[2px]' style={{ background: GOLD }} />}
                        </button>
                    ))}
                </div>
            </div>

            <div className='page-mobile-grid grid grid-cols-2 divide-y-0 sm:grid-cols-2 lg:grid-cols-[1.05fr_1fr_1fr_0.8fr] lg:divide-x'>
                <div className='min-h-[185px] px-5 py-4'>
                    <p className='text-[10px] uppercase text-[#d1d2ce]'>Performance (1Y)</p>

                    <div className='mt-2 flex items-end gap-3'>
                        <span className='text-[25px] leading-none' style={{ color: GOLD }}>
                            +42.7%
                        </span>
                        <span className='text-[8px] text-[#898a86]'>vs. S&amp;P 500 +12%</span>
                    </div>

                    <div className='mt-4 flex items-center justify-center'>
                        <PerformanceRing />
                    </div>
                </div>

                <div className='min-h-[185px] px-5 py-4'>
                    <p className='text-[10px] uppercase text-[#d1d2ce]'>Valuation</p>

                    <dl className='mt-3 space-y-3 text-[10px]'>
                        {[
                            ['P/E (TTM)', '28.5'],
                            ['P/B', '15.2'],
                            ['PEG (TTM)', '2.1'],
                            ['EV/EBITDA', '21.3'],
                            ['P/S (TTM)', '8.7'],
                        ].map(([label, value]) => (
                            <div key={label} className='flex justify-between gap-4'>
                                <dt className='text-[#a5a6a2]'>{label}</dt>
                                <dd className='text-[#dcddd9]'>{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className='min-h-[185px] px-5 py-4'>
                    <p className='text-[10px] uppercase text-[#d1d2ce]'>Financial Health</p>

                    <dl className='mt-3 space-y-3 text-[10px]'>
                        {[
                            ['ROE (TTM)', '162%'],
                            ['ROA (TTM)', '28%'],
                            ['Debt/Equity', '0.48'],
                            ['Current Ratio', '1.62'],
                            ['Gross Margin', '44%'],
                        ].map(([label, value]) => (
                            <div key={label} className='flex justify-between gap-4'>
                                <dt className='text-[#a5a6a2]'>{label}</dt>
                                <dd className='text-[#dcddd9]'>{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className='flex min-h-[185px] flex-col items-center justify-center px-4 py-4'>
                    <CircularGauge />

                    <p className='mt-2 text-center text-[10px] leading-[1.3] text-[#d4d4cf]'>
                        Financial
                        <br />
                        Score
                    </p>
                </div>
            </div>
        </Panel>
    );
}

const StockScreenerPage: NextPage = () => {
    return (
        <>
            <HeroSection />

            <main className='stock-screener-page min-h-screen overflow-hidden text-white' style={{ background: '#050608' }}>
                {/* HERO */}
                <section className='relative overflow-hidden border-b border-[#414A5D]'>
                    <div className='mx-auto grid w-full max-w-[1180px] items-center gap-7 px-5 pb-7 pt-5 sm:px-8 sm:pb-10 sm:pt-8 lg:grid-cols-[0.43fr_0.57fr] lg:gap-3 lg:px-9'>
                        <div className='relative z-10'>
                            <p className='text-[11px] font-medium uppercase tracking-[0.045em]' style={{ color: GOLD }}>
                                Screen. Analyze. Invest.
                            </p>

                            <h1 className='screener-serif page-hero-title mt-3 text-[55px] leading-[1.23] tracking-[-0.05em] sm:text-[71px] lg:text-[74px]'>
                                <span style={{ color: GOLD }}>Stock</span>
                                <br />
                                <span className='text-[#f4f3ed]'>Screener</span>
                            </h1>

                            <p className='mt-5 max-w-[420px] text-[15px] leading-[1.55] text-[#dedfda] sm:text-[16px]'>
                                Find the right stocks faster.
                                <br />
                                Powerful filters. Real-time data. Smarter decisions.
                            </p>

                            <div className='page-hero-features mt-8 grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-7'>
                                {heroFeatures.map(({ icon: Icon, title, body }) => (
                                    <div key={title}>
                                        <div className='flex h-[52px] w-[52px] items-center justify-center rounded-full border' style={{ borderColor: GOLD }}>
                                            <Icon className='h-6 w-6' strokeWidth={1.5} style={{ color: GOLD }} />
                                        </div>

                                        <h3 className='mt-3 text-[14px] font-medium text-[#f0f0ec] leading-[1.42]'>{title}</h3>

                                        <p className='mt-1.5 max-w-[135px] text-[10px] leading-[1.45] text-[#aaaBA7]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='page-hero-art relative flex min-h-[200px] items-center sm:min-h-[270px] lg:min-h-[390px]'>
                            <HeroArtwork />
                        </div>
                    </div>
                </section>

                <div className='mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-9'>
                    {/* 01 */}
                    <section className='grid gap-7 border-b border-[#414A5D] py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14'>
                        <SectionIntro
                            number='01'
                            title='Build Your Screen'
                            description='Create custom screens using hundreds of filters across fundamental, technical, and valuation metrics.'
                        >
                            <div className='mt-7 grid max-w-[300px] grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3'>
                                {screenCategories.map(({ icon: Icon, title, body }) => (
                                    <div key={title} className='text-center'>
                                        <Icon className='mx-auto h-8 w-8' strokeWidth={1.35} style={{ color: GOLD }} />

                                        <h3 className='mt-2 text-[9px] font-medium text-[#eeeeea] leading-[1.42]'>{title}</h3>

                                        <p className='mt-1 text-[7px] leading-[1.4] text-[#989994]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionIntro>

                        <ScreenBuilder />
                    </section>

                    {/* 02 */}
                    <section className='grid gap-7 border-b border-[#414A5D] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro number='02' title='Explore Results' description='Instantly view matching stocks with key metrics and visual insights.'>
                            <ul className='mt-5 space-y-2'>
                                <CheckItem>Real-time data &amp; metrics</CheckItem>
                                <CheckItem>Sortable &amp; customizable columns</CheckItem>
                                <CheckItem>Charts, heatmaps &amp; comparisons</CheckItem>
                                <CheckItem>Export &amp; share results</CheckItem>
                            </ul>
                        </SectionIntro>

                        <ResultsPanel />
                    </section>

                    {/* 03 */}
                    <section className='grid gap-7 border-b border-[#414A5D] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='03'
                            title='Analyze & Compare'
                            description='Dive deeper with interactive charts, ratios, and side-by-side comparisons.'
                        >
                            <div className='mt-7 grid max-w-[300px] grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3'>
                                {analyzeTools.map(({ icon: Icon, title, body }) => (
                                    <div key={title} className='text-center'>
                                        <Icon className='mx-auto h-8 w-8' strokeWidth={1.35} style={{ color: GOLD }} />

                                        <h3 className='mt-2 text-[9px] font-medium text-[#eeeeea] leading-[1.42]'>{title}</h3>

                                        <p className='mt-1 text-[7px] leading-[1.4] text-[#989994]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionIntro>

                        <AnalysisPanel />
                    </section>

                    {/* 04 */}
                    <section className='py-6'>
                        <div className='grid gap-8 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                            <SectionIntro
                                number='04'
                                title='Track Opportunities'
                                description='Stay ahead with alerts, watchlists, and market-moving insights.'
                            />

                            <div className='page-mobile-grid grid grid-cols-2 divide-y-0 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x'>
                                {opportunities.map(({ icon: Icon, title, body }) => (
                                    <div key={title} className='flex min-h-[135px] flex-col items-center px-5 py-4 text-center'>
                                        <div className='flex h-[50px] w-[50px] items-center justify-center rounded-full border' style={{ borderColor: GOLD }}>
                                            <Icon className='h-6 w-6' strokeWidth={1.4} style={{ color: GOLD }} />
                                        </div>

                                        <h3 className='mt-3 text-[10px] font-medium text-[#f1f1ed] leading-[1.42]'>{title}</h3>

                                        <p className='mt-2 max-w-[150px] text-[8px] leading-[1.45] text-[#a3a49f]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className='mt-4 flex flex-col gap-5 rounded-[10px] border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between'
                            style={{
                                borderColor: BORDER,
                                background: '#0C0F18',
                            }}
                        >
                            <div className='flex items-center gap-4'>
                                <div className='flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: GOLD }}>
                                    <TrendingUp className='h-5 w-5' strokeWidth={1.5} style={{ color: GOLD }} />
                                </div>

                                <div>
                                    <p className='text-[12px] text-[#ededE9]'>Powerful screening. Smarter investing.</p>
                                    <p className='mt-1 text-[10px] text-[#b2b3af]'>Find opportunities others miss.</p>
                                </div>
                            </div>

                            <ComingSoonTrigger
                                ariaLabel='Get started'
                                className='group flex h-[48px] w-[200px] shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-[5px] bg-[#4333AF] px-5 text-[11px] font-medium uppercase tracking-[0.03em] text-white shadow-[0_0_24px_rgba(228,174,37,0.22)] transition-all duration-200 hover:bg-[#4333AF]'
                            >
                                Get Started
                                <ArrowRight className='h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1' />
                            </ComingSoonTrigger>
                        </div>
                    </section>
                </div>
            </main>

            <style jsx global>{`
                .stock-screener-page {
                    font-family: 'Roboto', Arial, Helvetica, sans-serif;
                    background-color: ${PAGE_BG};
                    -webkit-font-smoothing: antialiased;
                    text-rendering: geometricPrecision;
                }

                .stock-screener-page h1,
                .stock-screener-page h2,
                .stock-screener-page h3,
                .stock-screener-page h4,
                .stock-screener-page h5,
                .stock-screener-page h6 {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                    overflow-wrap: normal;
                    word-break: normal;
                }

                .stock-screener-page .screener-serif {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                }

                .stock-screener-page button,
                .stock-screener-page a {
                    -webkit-tap-highlight-color: transparent;
                }

                .stock-screener-page *,
                .stock-screener-page *::before,
                .stock-screener-page *::after {
                    box-sizing: border-box;
                    min-width: 0;
                }

                @media (max-width: 639px) {
                    .stock-screener-page {
                        overflow-wrap: normal;
                        word-break: normal;
                    }

                    .stock-screener-page .page-hero-title {
                        font-size: clamp(1.9rem, 8.6vw, 2.25rem) !important;
                        line-height: 1.26 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .stock-screener-page .page-section-number {
                        font-size: 1.95rem !important;
                        line-height: 1 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .stock-screener-page .page-section-title {
                        font-size: clamp(1rem, 5vw, 1.22rem) !important;
                        line-height: 1.36 !important;
                        letter-spacing: -0.01em !important;
                    }

                    .stock-screener-page .page-hero-features {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                        gap: 0.85rem !important;
                        margin-top: 1.35rem !important;
                    }

                    .stock-screener-page .page-hero-features > * {
                        min-width: 0;
                    }

                    .stock-screener-page .page-hero-features > * > div:first-child {
                        width: 2.75rem !important;
                        height: 2.75rem !important;
                    }

                    .stock-screener-page .page-hero-features h3 {
                        margin-top: 0.55rem !important;
                        font-size: 0.64rem !important;
                        line-height: 1.43 !important;
                    }

                    .stock-screener-page .page-hero-features p {
                        margin-top: 0.35rem !important;
                        font-size: 0.5rem !important;
                        line-height: 1.35 !important;
                    }

                    .stock-screener-page .page-hero-art {
                        min-height: 11.5rem !important;
                        margin-top: 0.25rem !important;
                    }

                    .stock-screener-page .page-mobile-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 0.75rem !important;
                    }

                    .stock-screener-page .page-mobile-grid > * {
                        min-height: 0 !important;
                        border-left: 0 !important;
                        border-right: 0 !important;
                        border-top: 0 !important;
                        border-bottom: 0 !important;
                    }

                    .stock-screener-page .page-compact-card {
                        min-height: 0 !important;
                        padding: 0.9rem 0.65rem !important;
                    }

                    .stock-screener-page p,
                    .stock-screener-page li,
                    .stock-screener-page td,
                    .stock-screener-page th,
                    .stock-screener-page dd,
                    .stock-screener-page dt {
                        overflow-wrap: normal;
                        word-break: normal;
                    }
                }
            `}</style>
        </>
    );
};

export default StockScreenerPage;
