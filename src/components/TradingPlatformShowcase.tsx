import ComingSoonTrigger from '@/components/ComingSoonTrigger';
import PlatformAnywhereSection from '@/components/PlatformAnywhereSection';
import {
    ArrowRight,
    BarChart3,
    BookOpenText,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Filter,
    Globe2,
    Landmark,
    ListChecks,
    Newspaper,
    Rocket,
    Search,
    ShieldCheck,
    Target,
    TrendingUp,
    UserRound,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

const TOOL_PREVIEW_COLOR = '#6D83B2';
// const BLUE = '#4333AF';
// const BLUE_MID = '#4333AF';

const tools: Array<{ icon: LucideIcon; title: string; body: string; href: string; kind: 'line' | 'bars' | 'list' | 'globe' | 'curve' }> = [
    {
        icon: Rocket,
        title: 'Paper Trading',
        body: 'Trade with virtual money in real market conditions. Practice, test, and perfect your strategy risk-free.',
        href: '/paper-trading',
        kind: 'line',
    },
    {
        icon: Filter,
        title: 'Stock Screener',
        body: 'Find the best opportunities faster with advanced filters and real-time data across thousands of stocks.',
        href: '/stock-screener',
        kind: 'bars',
    },
    {
        icon: Search,
        title: 'Watchlist',
        body: 'Track the stocks that matter most to you. Customize, organize, and stay updated in real time.',
        href: '/watchlist',
        kind: 'list',
    },
    {
        icon: Zap,
        title: 'Market Movers',
        body: 'Stay ahead of the market with live updates on top gainers, losers, and volatile stocks right now.',
        href: '/market-movers',
        kind: 'bars',
    },
    {
        icon: Globe2,
        title: 'Global KPI',
        body: 'Track key global economic indicators and market benchmarks that impact your investments.',
        href: '/global-kpi',
        kind: 'globe',
    },
    {
        icon: TrendingUp,
        title: 'Economic Simulator',
        body: 'Model economic scenarios and see how changes in key variables could impact the markets.',
        href: '/economic-simulator',
        kind: 'curve',
    },
    {
        icon: BookOpenText,
        title: 'Research',
        body: 'Access institutional-grade market, company, earnings, and macro research in one place.',
        href: '/research',
        kind: 'line',
    },
    {
        icon: CalendarDays,
        title: 'Calendars',
        body: 'Track economic releases, dividends, IPOs, and earnings before they move the market.',
        href: '/market-moving-calendars',
        kind: 'bars',
    },
];

const audiences: Array<{ icon: LucideIcon; title: string; body: string }> = [
    { icon: UserRound, title: 'Beginner Traders', body: 'Learn the markets with paper trading, simple analytics, and guided tools built for new traders.' },
    { icon: BarChart3, title: 'Active Traders', body: 'Find opportunities faster, track multiple watchlists, and execute your strategies with confidence.' },
    { icon: Landmark, title: 'Investors', body: 'Make long-term decisions with global KPIs, market insights, and economic scenario modeling.' },
    { icon: Clock3, title: 'Day Traders', body: 'Monitor real-time market movers, set alerts, and act on high-probability opportunities.' },
    { icon: TrendingUp, title: 'Swing Traders', body: 'Use advanced screening and market analytics to identify strong trends and swing opportunities.' },
    { icon: Newspaper, title: 'Researchers', body: 'Access powerful data, economic indicators, and simulation tools to support deeper market research.' },
];

type ExecutionSlide = {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    accent: string;
    tag: string;
    compactTitle?: boolean;
    details: Array<{ title: string; text: string }>;
    tape: Array<{ label: string; value: string; side: string; delta: string }>;
};

const executionSlides: ExecutionSlide[] = [
    {
        id: 'paper-trading',
        title: 'Paper Trading',
        subtitle: 'Practice the market. Build confidence before capital.',
        href: '/paper-trading',
        accent: '#4333AF',
        tag: 'Paper floor',
        details: [
            { title: 'Workflow', text: 'Build complete paper tickets with size, side, entries, exits, and risk controls.' },
            { title: 'Practice', text: 'Trade with virtual funds against realistic market movement without risking capital.' },
            { title: 'Review', text: 'Measure results, identify mistakes, and refine the strategy before going live.' },
            { title: 'Improve', text: 'Review trade results and risk decisions to make each practice session more useful.' },
        ],
        tape: [
            { label: 'NVDA', value: '950.02', side: 'BUY', delta: '+7.42%' },
            { label: 'AAPL', value: '187.32', side: 'BUY', delta: '+1.25%' },
            { label: 'TSLA', value: '173.24', side: 'SELL', delta: '-0.72%' },
            { label: 'MSFT', value: '389.45', side: 'BUY', delta: '+0.73%' },
            { label: 'AMZN', value: '188.55', side: 'BUY', delta: '+0.45%' },
        ],
    },
    {
        id: 'stock-screener',
        title: 'Stock Screener',
        subtitle: 'Filter the noise. Surface the setups that matter.',
        href: '/stock-screener',
        accent: '#4333AF',
        tag: 'Screen builder',
        details: [
            { title: 'Screen', text: 'Filter thousands of stocks using fundamental, technical, valuation, and ownership criteria.' },
            { title: 'Compare', text: 'Bring the strongest matches side by side with the metrics that matter most.' },
            { title: 'Act', text: 'Save screens, create alerts, and move qualified opportunities into your watchlist.' },
            { title: 'Repeat', text: 'Reuse your saved filters and alerts to keep screening for similar opportunities.' },
        ],
        tape: [
            { label: 'AAPL', value: '187.32', side: 'MATCH', delta: '92%' },
            { label: 'NVDA', value: '1,102.50', side: 'MATCH', delta: '96%' },
            { label: 'AVGO', value: '1,553.78', side: 'MATCH', delta: '88%' },
            { label: 'AMD', value: '156.48', side: 'MATCH', delta: '84%' },
            { label: 'MSFT', value: '389.45', side: 'MATCH', delta: '90%' },
        ],
    },
    {
        id: 'watchlist',
        title: 'Watchlist',
        subtitle: 'Keep the right names close and the right alerts closer.',
        href: '/watchlist',
        accent: '#4333AF',
        tag: 'Live watch',
        details: [
            { title: 'Track', text: 'Monitor favorite assets with live prices, compact charts, volume, and daily change.' },
            { title: 'Organize', text: 'Group assets by strategy, theme, sector, or conviction so the list stays actionable.' },
            { title: 'Alert', text: 'Set price, percentage, volume, and event alerts for the moves that matter.' },
            { title: 'Review', text: 'Revisit watchlists regularly as prices, volume, and market conditions change.' },
        ],
        tape: [
            { label: 'NVDA', value: '950.02', side: 'ALERT', delta: '+7.42%' },
            { label: 'AAPL', value: '182.63', side: 'WATCH', delta: '+1.35%' },
            { label: 'MSFT', value: '415.90', side: 'WATCH', delta: '+0.89%' },
            { label: 'TSLA', value: '173.24', side: 'ALERT', delta: '-0.72%' },
            { label: 'SPY', value: '517.38', side: 'WATCH', delta: '+0.32%' },
        ],
    },
    {
        id: 'market-movers',
        title: 'Market Movers',
        subtitle: 'See what is moving now—and understand why.',
        href: '/market-movers',
        accent: '#4333AF',
        tag: 'Live movers',
        details: [
            { title: 'Scan', text: 'Surface the strongest gainers, losers, unusual volume, and most active names in real time.' },
            { title: 'Drivers', text: 'Connect the move to catalysts, volume behavior, sector context, and market impact.' },
            { title: 'Action', text: 'Turn fast-moving market information into alerts and a focused next step.' },
            { title: 'Follow', text: 'Monitor whether unusual activity continues and adjust your market watch accordingly.' },
        ],
        tape: [
            { label: 'NVDA', value: '950.02', side: 'GAINER', delta: '+7.42%' },
            { label: 'AMD', value: '170.58', side: 'GAINER', delta: '+6.21%' },
            { label: 'SMCI', value: '915.30', side: 'GAINER', delta: '+5.18%' },
            { label: 'SPOT', value: '291.26', side: 'LOSER', delta: '-4.21%' },
            { label: 'PYPL', value: '61.83', side: 'LOSER', delta: '-3.18%' },
        ],
    },
    {
        id: 'global-kpi',
        title: 'Global KPI',
        subtitle: 'Read the macro picture before positioning around it.',
        href: '/global-kpi',
        accent: '#4333AF',
        tag: 'Macro pulse',
        details: [
            { title: 'Monitor', text: 'Track the indicators that describe growth, satisfaction, efficiency, and market expansion.' },
            { title: 'Compare', text: 'Read performance across periods and markets without losing the global context.' },
            { title: 'Context', text: 'Use KPI movement to frame broader investment and operating decisions with better perspective.' },
            { title: 'Evaluate', text: 'Review shifting indicators over time to see how the broader economic picture develops.' },
        ],
        tape: [
            { label: 'Revenue', value: '$2.45B', side: 'YOY', delta: '+18.6%' },
            { label: 'Satisfaction', value: '92%', side: 'YOY', delta: '+7%' },
            { label: 'Efficiency', value: '87%', side: 'YOY', delta: '+6%' },
            { label: 'Markets', value: '24', side: 'NEW', delta: '+4' },
            { label: 'Quality', value: '91%', side: 'KPI', delta: '+3%' },
        ],
    },
    {
        id: 'economic-simulator',
        title: 'Economic Simulator',
        subtitle: 'Model the change. See the impact before it happens.',
        href: '/economic-simulator',
        accent: '#4333AF',
        tag: 'Scenario lab',
        compactTitle: true,
        details: [
            { title: 'Build', text: 'Define sectors, agents, policies, and parameters inside a structured economic model.' },
            { title: 'Simulate', text: 'Run policy changes and external shocks across multiple scenarios and time horizons.' },
            { title: 'Analyze', text: 'Compare growth, inflation, unemployment, and debt outcomes before making decisions.' },
            { title: 'Refine', text: 'Adjust assumptions and rerun scenarios to better understand potential outcomes.' },
        ],
        tape: [
            { label: 'GDP', value: '3.8%', side: 'EXPANSION', delta: '+1.5pp' },
            { label: 'Inflation', value: '2.4%', side: 'MODEL', delta: '+0.3pp' },
            { label: 'Unemployment', value: '5.1%', side: 'MODEL', delta: '-0.4pp' },
            { label: 'Debt / GDP', value: '68.7', side: 'MODEL', delta: '-2.8pp' },
            { label: 'Horizon', value: '10Y', side: 'RUN', delta: 'ACTIVE' },
        ],
    },
    {
        id: 'research',
        title: 'Research',
        subtitle: 'Turn deeper research into clearer market decisions.',
        href: '/research',
        accent: '#4333AF',
        tag: 'Research desk',
        details: [
            { title: 'Markets', text: 'Follow macro forces, rates, commodities, currencies, sectors, and global market themes.' },
            { title: 'Companies', text: 'Go deeper on fundamentals, valuation, estimates, earnings, and competitive positioning.' },
            { title: 'Events', text: 'Stay ahead of earnings, catalysts, corporate events, and the research that surrounds them.' },
            { title: 'Synthesize', text: 'Bring market, company, and event research together to support a clearer decision.' },
        ],
        tape: [
            { label: 'US Economy', value: 'Neutral', side: 'OUTLOOK', delta: 'Stable' },
            { label: 'Global Markets', value: 'Positive', side: 'OUTLOOK', delta: 'Up' },
            { label: 'Rates', value: 'Neutral', side: 'OUTLOOK', delta: 'Q3' },
            { label: 'Commodities', value: 'Positive', side: 'OUTLOOK', delta: 'Firm' },
            { label: 'Currencies', value: 'Neutral', side: 'OUTLOOK', delta: 'USD' },
        ],
    },
    {
        id: 'market-calendars',
        title: 'Calendars',
        subtitle: 'Know the date. Know the event. Know the impact.',
        href: '/market-moving-calenders',
        accent: '#4333AF',
        tag: 'Event calendar',
        compactTitle: true,
        details: [
            { title: 'Economic', text: 'Track releases, central-bank decisions, employment, inflation, GDP, PMI, and more.' },
            { title: 'Earnings', text: 'Stay ahead of report dates, estimates, pre-market releases, and after-hours events.' },
            { title: 'Corporate', text: 'Follow dividends, ex-dates, IPOs, new listings, and other market-moving milestones.' },
            { title: 'Plan', text: 'Organize upcoming events into a calendar so you can prepare before key dates arrive.' },
        ],
        tape: [
            { label: 'Retail Sales', value: 'May 16', side: 'HIGH', delta: '0.4%' },
            { label: 'Industrial Prod.', value: 'May 16', side: 'MED', delta: '0.1%' },
            { label: 'Building Permits', value: 'May 17', side: 'MED', delta: '1.5%' },
            { label: 'Consumer Sent.', value: 'May 17', side: 'HIGH', delta: '67.4' },
            { label: 'Fed Chair', value: 'May 17', side: 'HIGH', delta: '—' },
        ],
    },
];

function MiniLine({ id = 'line' }: { id?: string }) {
    return (
        <svg viewBox='0 0 220 90' className='h-20 w-full' preserveAspectRatio='none' aria-hidden='true'>
            <defs>
                <linearGradient id={`${id}-fill`} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor={TOOL_PREVIEW_COLOR} stopOpacity='.32' />
                    <stop offset='100%' stopColor={TOOL_PREVIEW_COLOR} stopOpacity='0' />
                </linearGradient>
            </defs>
            {[18, 42, 66].map((y) => (
                <line key={y} x1='0' y1={y} x2='220' y2={y} stroke='rgba(67,51,175,.08)' strokeDasharray='3 4' />
            ))}
            <path d='M0 72 L20 66 L38 72 L58 51 L78 57 L98 36 L118 47 L138 27 L158 39 L178 19 L198 30 L220 10 L220 90 L0 90 Z' fill={`url(#${id}-fill)`} />
            <polyline
                points='0,72 20,66 38,72 58,51 78,57 98,36 118,47 138,27 158,39 178,19 198,30 220,10'
                fill='none'
                stroke={TOOL_PREVIEW_COLOR}
                strokeWidth='2.7'
                vectorEffect='non-scaling-stroke'
            />
        </svg>
    );
}

function MiniBars() {
    return (
        <div className='flex h-20 items-end justify-center gap-2'>
            {[34, 52, 42, 77, 48, 88, 63].map((h, i) => (
                <div key={i} className='w-3 rounded-t-[2px] bg-[#6D83B2]' style={{ height: `${h}%` }} />
            ))}
        </div>
    );
}

function MiniList() {
    return (
        <div className='relative h-20 w-full'>
            <ListChecks className='absolute right-0 top-0 h-7 w-7 text-[#6D83B2]' strokeWidth={1.8} aria-hidden='true' />
            <div className='absolute inset-x-0 bottom-0 space-y-[2px] text-[9px] sm:text-[10px]'>
                {[
                    ['AAPL', '193.42', '+1.92%'],
                    ['MSFT', '415.65', '+1.21%'],
                    ['NVDA', '1,037.21', '+4.36%'],
                    ['TSLA', '248.56', '+2.87%'],
                ].map(([s, p, c]) => (
                    <div key={s} className='grid grid-cols-[1fr_auto_auto] items-center gap-2'>
                        <span className='font-semibold text-white'>{s}</span>
                        <span className='text-white/65'>{p}</span>
                        <span className='text-[#414A5D]'>{c}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Preview({ kind, id }: { kind: (typeof tools)[number]['kind']; id: string }) {
    if (kind === 'bars') return <MiniBars />;
    if (kind === 'list') return <MiniList />;
    if (kind === 'globe')
        return (
            <div className='relative flex h-20 items-center justify-center'>
                <Globe2 className='h-20 w-20 text-[#6D83B2]' strokeWidth={1.5} />
                <span className='absolute left-[38%] top-[25%] h-2 w-2 rounded-full bg-[#6D83B2]' />
                <span className='absolute right-[30%] top-[48%] h-2 w-2 rounded-full bg-[#6D83B2]' />
            </div>
        );
    if (kind === 'curve') return <MiniLine id={`${id}-curve`} />;
    return <MiniLine id={id} />;
}

function SimplePricingStrip() {
    const benefits = ['All 8 tools included', 'Real-time data & updates', 'Advanced analytics', 'Cancel anytime'];

    return (
        <div className='overflow-hidden rounded-xl border border-[#414A5D] bg-[#0C0F18] shadow-[0_18px_55px_rgba(0,0,0,.32)]'>
            <div className='grid md:grid-cols-2 xl:grid-cols-[1.45fr_1fr_1fr_1.05fr]'>
                <div className='flex flex-col justify-center border-b border-[#414A5D] p-5 sm:p-6 md:border-r xl:border-b-0'>
                    <div className='space-y-3'>
                        {benefits.map((item) => (
                            <div key={item} className='flex items-center gap-3 text-sm text-white/72'>
                                <Check className='h-5 w-5 shrink-0 text-[#4333AF]' strokeWidth={1.8} />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center border-b border-[#414A5D] p-5 text-center sm:p-6 md:border-r xl:border-b-0'>
                    <p className='text-[11px] font-bold uppercase tracking-[.08em] text-white/78'>Monthly Plan</p>

                    <div className='mt-3 flex items-end justify-center gap-2'>
                        <span className='text-[clamp(2.25rem,8vw,3.05rem)] font-semibold leading-none text-white'>$49</span>
                        <span className='pb-1 text-sm text-white/72'>/month</span>
                    </div>

                    <ComingSoonTrigger
                        ariaLabel='Start monthly free trial'
                        className='mt-6 flex min-h-11 w-full max-w-[270px] items-center justify-center rounded-md px-5 text-xs font-bold uppercase tracking-[.025em] text-white shadow-[0_0_24px_rgba(67,51,175,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 bg-[#4333AF] hover:bg-[#372990]'
                    >
                        Start Free Trial
                    </ComingSoonTrigger>
                </div>

                <div className='flex flex-col items-center justify-center border-b border-[#414A5D] p-5 text-center sm:p-6 md:border-b-0 md:border-r xl:border-b-0'>
                    <p className='text-[11px] font-bold uppercase tracking-[.08em] text-white/78'>Annual Plan</p>

                    <div className='mt-3 flex items-end justify-center gap-2'>
                        <span className='text-[clamp(2.25rem,8vw,3.05rem)] font-semibold leading-none text-white'>$499</span>
                        <span className='pb-1 text-sm text-white/72'>/year</span>
                    </div>

                    <ComingSoonTrigger
                        ariaLabel='Start annual free trial'
                        className='mt-5 flex min-h-11 w-full max-w-[270px] items-center justify-center rounded-md px-5 text-xs font-bold uppercase tracking-[.025em] text-white shadow-[0_0_24px_rgba(67,51,175,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 bg-[#4333AF] hover:bg-[#372990]'
                    >
                        Start Free Trial
                    </ComingSoonTrigger>
                </div>

                <div className='flex flex-col items-center justify-center p-5 text-center sm:p-6'>
                    <Image
                        src='/logocolored.png'
                        alt='Black Snow'
                        width={90}
                        height={90}
                        className='h-[72px] w-[72px] object-contain sm:h-[84px] sm:w-[84px]'
                    />

                    <p className='mt-3 text-[10px] font-bold uppercase leading-5 tracking-[.08em] text-white sm:text-[11px]'>
                        Built for traders.
                        <br />
                        Backed by technology.
                        <br />
                        Driven by results.
                    </p>
                </div>
            </div>
        </div>
    );
}

// These eight self-contained illustrations are presentation-only previews.
// They deliberately do not place trades, create alerts, or modify account data.
function ShowcasePreviewFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={`relative h-full min-h-[310px] min-w-0 overflow-hidden rounded-xl border border-[#414A5D] bg-[#080A11] p-3 text-white sm:p-4 ${className}`}
        >
            <div
                className='pointer-events-none absolute inset-0'
                style={{ background: 'radial-gradient(ellipse at 85% 8%, rgba(67,51,175,0.10), transparent 52%)' }}
            />
            <div className='relative z-10 h-full min-w-0'>{children}</div>
        </div>
    );
}

function ShowcaseMiniTrend({ values, id, height = 74 }: { values: number[]; id: string; height?: number }) {
    const high = Math.max(...values) + 8;
    const low = Math.min(...values) - 8;
    const points = values.map((v, i) => `${(i / (values.length - 1)) * 320},${88 - ((v - low) / (high - low)) * 75}`);
    const path = `M ${points.join(' L ')}`;
    return (
        <svg
            viewBox='0 0 320 100'
            preserveAspectRatio='none'
            className='block w-full'
            style={{ height }}
            role='img'
            aria-label='Illustrative market trend chart'
        >
            <defs>
                <linearGradient id={`preview-${id}`} x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor='#4333AF' stopOpacity='.38' />
                    <stop offset='100%' stopColor='#4333AF' stopOpacity='.015' />
                </linearGradient>
            </defs>
            {[22, 44, 66, 88].map((y) => (
                <line key={y} x1='0' x2='320' y1={y} y2={y} stroke='#414A5D' strokeOpacity='.45' strokeWidth='.7' />
            ))}
            {[0, 80, 160, 240, 320].map((x) => (
                <line key={x} x1={x} x2={x} y1='8' y2='92' stroke='#414A5D' strokeOpacity='.3' strokeWidth='.7' />
            ))}
            <path d={`${path} L 320 95 L 0 95 Z`} fill={`url(#preview-${id})`} />
            <path d={path} fill='none' stroke='#8D81ED' strokeWidth='2.5' vectorEffect='non-scaling-stroke' strokeLinecap='round' strokeLinejoin='round' />
            {points.length > 0 &&
                (() => {
                    const [cx, cy] = points[points.length - 1].split(',');
                    return <circle cx={cx} cy={cy} r='4' fill='#B9B2FF' stroke='#4333AF' strokeWidth='1.5' />;
                })()}
        </svg>
    );
}

function ExecutionPreview({ slide }: { slide: ExecutionSlide }) {
    if (slide.id === 'paper-trading') {
        return (
            <ShowcasePreviewFrame className='lg:p-2'>
                <div className='flex h-full flex-col gap-2.5 lg:gap-1.5'>
                    <div className='rounded-xl border border-[#414A5D] bg-[#0C0F18] p-3 lg:p-2'>
                        <div className='flex items-start justify-between gap-3'>
                            <div>
                                <p className='text-[10px] text-white/65 sm:text-xs'>Paper Account Value</p>
                                <p className='mt-0.5 text-xl font-extrabold tracking-tight text-white sm:text-2xl lg:text-xl'>$100,000.00</p>
                            </div>
                            <div className='text-right'>
                                <p className='text-[10px] uppercase tracking-[.08em] text-white/60'>Day P&amp;L</p>
                                <p className='mt-1 whitespace-nowrap text-xs font-bold text-[#A99FFF] sm:text-sm'>+$1,250.00 (+1.26%)</p>
                            </div>
                        </div>
                        <div className='mt-1.5 lg:mt-1'>
                            <ShowcaseMiniTrend id='paper' values={[22, 38, 59, 57, 49, 67, 56, 49, 63, 82, 75, 96]} height={52} />
                        </div>
                        <div className='mt-1 flex items-center justify-between gap-1 text-[9px] sm:text-[10px]'>
                            {['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'].map((period) => (
                                <span
                                    key={period}
                                    className={`rounded-full px-2.5 py-1 lg:px-2 lg:py-0.5 ${
                                        period === '1D' ? 'bg-[#4333AF] font-semibold text-white' : 'text-white/55'
                                    }`}
                                >
                                    {period}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className='min-h-0 flex-1 rounded-xl border border-[#414A5D] bg-[#0C0F18] p-2.5 sm:p-3 lg:p-2'>
                        <div className='grid grid-cols-2 gap-1 rounded-full border border-[#414A5D] bg-[#080A11] p-0.5 text-center text-[11px]'>
                            <span className='rounded-full bg-[#4333AF] py-1 font-bold text-white lg:py-0.5'>Buy</span>
                            <span className='py-1 text-white/65 lg:py-0.5'>Sell</span>
                        </div>
                        <div className='mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 lg:mt-1.5 lg:gap-y-1'>
                            {[
                                ['Order Type', 'Market  ▾'],
                                ['Quantity', '−       100       +'],
                                ['Time in Force', 'Day  ▾'],
                                ['Estimated Cost', '$17,872.00'],
                            ].map(([label, value]) => (
                                <div key={label} className='min-w-0'>
                                    <p className='mb-0.5 text-[9px] text-white/55'>{label}</p>
                                    <div className='truncate rounded-md border border-[#414A5D] bg-[#080A11] px-2 py-1.5 text-center text-[10px] text-white/90 lg:py-1'>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className='mt-2 rounded-full bg-[#4333AF] py-1.5 text-center text-xs font-semibold text-white lg:mt-1.5 lg:py-1'>Buy</div>
                        <p className='mt-1 text-center text-[9px] text-[#A99FFF] lg:mt-0.5'>Buying Power: $100,000.00</p>
                    </div>
                </div>
            </ShowcasePreviewFrame>
        );
    }

    if (slide.id === 'stock-screener') {
        return (
            <ShowcasePreviewFrame>
                <div className='flex h-full flex-col'>
                    <div className='flex items-center justify-between border-b border-[#414A5D] pb-2'>
                        <div>
                            <p className='text-[10px] font-bold uppercase tracking-[.14em] text-white/90'>Advanced Stock Screener</p>
                            <p className='mt-0.5 text-[9px] text-white/45'>Fundamentals · Technicals · Valuation</p>
                        </div>
                        <span className='rounded-full bg-[#4333AF]/15 px-2 py-1 text-[10px] font-bold text-[#A99FFF]'>248 MATCHES</span>
                    </div>
                    <div className='mt-2.5 grid grid-cols-2 gap-2'>
                        {[
                            ['Market Cap', 'Above $2B'],
                            ['P/E Ratio', 'Below 20'],
                            ['Relative Volume', 'Above 1.5×'],
                            ['Price Trend', 'Above 50D MA'],
                        ].map(([label, value]) => (
                            <div key={label} className='rounded-lg border border-[#414A5D] bg-[#0C0F18] px-2.5 py-2'>
                                <p className='text-[9px] text-white/50'>{label}</p>
                                <p className='mt-1 text-[11px] font-semibold text-[#A99FFF]'>{value}</p>
                            </div>
                        ))}
                    </div>
                    <div className='mt-3 flex items-center justify-between'>
                        <p className='text-[10px] font-bold uppercase tracking-[.09em] text-white/85'>Top Screen Matches</p>
                        <span className='text-[9px] text-[#A99FFF]'>Score / 100</span>
                    </div>
                    <div className='mt-1.5 min-h-0 flex-1 divide-y divide-[#414A5D]/65'>
                        {[
                            ['NVDA', 'NVIDIA', 96],
                            ['AAPL', 'Apple', 92],
                            ['MSFT', 'Microsoft', 90],
                            ['AVGO', 'Broadcom', 88],
                        ].map(([ticker, name, score]) => (
                            <div key={ticker} className='grid grid-cols-[46px_1fr_65px] items-center gap-2 py-[7px] text-[10px]'>
                                <span className='font-bold text-white'>{ticker}</span>
                                <span className='truncate text-white/55'>{name}</span>
                                <div className='flex items-center gap-1.5'>
                                    <div className='h-1.5 flex-1 rounded-full bg-[#414A5D]'>
                                        <div className='h-full rounded-full bg-[#6D5DD5]' style={{ width: `${score}%` }} />
                                    </div>
                                    <span className='font-bold text-[#A99FFF]'>{score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ShowcasePreviewFrame>
        );
    }

    if (slide.id === 'watchlist') {
        return (
            <ShowcasePreviewFrame>
                <div className='flex h-full flex-col'>
                    <div className='flex items-center justify-between border-b border-[#414A5D] pb-2.5'>
                        <div>
                            <p className='text-[10px] font-bold uppercase tracking-[.14em] text-white/90'>My Watchlist</p>
                            <p className='mt-0.5 text-[9px] text-white/45'>Track your favorite assets in one place</p>
                        </div>
                        <span className='rounded-full border border-[#4333AF]/50 px-2.5 py-1 text-[10px] text-[#A99FFF]'>24 Assets</span>
                    </div>
                    <div className='mt-2 grid grid-cols-[52px_1fr_74px_65px] gap-2 border-b border-[#414A5D]/60 pb-2 text-[9px] uppercase text-white/40'>
                        <span>Symbol</span>
                        <span>Trend</span>
                        <span className='text-right'>Last</span>
                        <span className='text-right'>Day</span>
                    </div>
                    <div className='flex-1 divide-y divide-[#414A5D]/55'>
                        {[
                            ['NVDA', [22, 30, 24, 45, 39, 66, 61, 78], '$950.02', '+7.42%'],
                            ['AAPL', [40, 32, 49, 46, 55, 58, 67, 65], '$182.63', '+1.35%'],
                            ['MSFT', [24, 33, 31, 45, 42, 51, 63, 72], '$415.90', '+0.89%'],
                            ['TSLA', [68, 62, 57, 61, 48, 53, 39, 34], '$173.24', '-0.72%'],
                            ['SPY', [32, 35, 43, 40, 51, 55, 58, 64], '$517.38', '+0.32%'],
                        ].map(([symbol, values, price, delta]) => (
                            <div key={symbol as string} className='grid grid-cols-[52px_1fr_74px_65px] items-center gap-2 py-2'>
                                <span className='text-[11px] font-bold text-white'>{symbol as string}</span>
                                <div className='h-7 min-w-0'>
                                    <ShowcaseMiniTrend id={`watch-${symbol}`} values={values as number[]} height={28} />
                                </div>
                                <span className='text-right text-[10px] text-white/85'>{price as string}</span>
                                <span className='text-right text-[10px] font-semibold text-[#A99FFF]'>{delta as string}</span>
                            </div>
                        ))}
                    </div>
                    <div className='mt-2 flex items-center justify-between rounded-lg border border-[#414A5D] bg-[#0C0F18] px-3 py-2 text-[10px]'>
                        <span className='text-white/70'>Price alerts &amp; custom lists</span>
                        <span className='font-semibold text-[#A99FFF]'>ACTIVE ●</span>
                    </div>
                </div>
            </ShowcasePreviewFrame>
        );
    }

    if (slide.id === 'market-movers') {
        return (
            <ShowcasePreviewFrame>
                <div className='flex h-full flex-col'>
                    <div className='flex items-center justify-between border-b border-[#414A5D] pb-2.5'>
                        <p className='text-[10px] font-bold uppercase tracking-[.14em] text-white/90'>Market Movers</p>
                        <span className='text-[9px] text-[#A99FFF]'>U.S. Market Snapshot</span>
                    </div>
                    <div className='mt-3 grid grid-cols-2 gap-3'>
                        {[
                            {
                                label: 'TOP GAINERS',
                                items: [
                                    ['NVDA', '+7.42%', 92],
                                    ['AMD', '+6.21%', 81],
                                    ['SMCI', '+5.18%', 68],
                                ],
                            },
                            {
                                label: 'TOP LOSERS',
                                items: [
                                    ['SPOT', '-4.21%', 72],
                                    ['PYPL', '-3.18%', 54],
                                    ['SNAP', '-2.89%', 46],
                                ],
                            },
                        ].map((group) => (
                            <div key={group.label} className='min-w-0 rounded-lg border border-[#414A5D] bg-[#0C0F18] p-2.5'>
                                <p className='mb-3 text-[9px] font-bold tracking-[.1em] text-[#A99FFF]'>{group.label}</p>
                                <div className='space-y-3'>
                                    {group.items.map(([ticker, change, strength]) => (
                                        <div key={ticker as string}>
                                            <div className='flex items-center justify-between gap-1 text-[10px]'>
                                                <span className='font-bold text-white'>{ticker}</span>
                                                <span className='text-[#A99FFF]'>{change}</span>
                                            </div>
                                            <div className='mt-1.5 h-1 rounded-full bg-[#414A5D]/70'>
                                                <div className='h-full rounded-full bg-[#6D5DD5]' style={{ width: `${strength}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='mt-3 flex items-center justify-between'>
                        <p className='text-[10px] font-bold uppercase text-white/80'>Unusual Volume</p>
                        <p className='text-[9px] text-white/45'>Relative activity</p>
                    </div>
                    <div className='mt-2 flex min-h-0 flex-1 items-end gap-2 rounded-lg border border-[#414A5D] bg-[#0C0F18] px-3 pb-2 pt-3'>
                        {[35, 58, 44, 77, 53, 89, 63, 97, 71, 83, 60, 91, 72, 100, 78].map((value, index) => (
                            <div
                                key={index}
                                className='flex-1 rounded-t-sm bg-[#6554D0]'
                                style={{ height: `${value}%`, opacity: index === 13 ? 1 : 0.35 + value / 190 }}
                            />
                        ))}
                    </div>
                    <p className='mt-1.5 text-right text-[9px] text-white/45'>Illustrative volume</p>
                </div>
            </ShowcasePreviewFrame>
        );
    }

    if (slide.id === 'global-kpi') {
        return (
            <ShowcasePreviewFrame>
                <div className='flex h-full flex-col'>
                    <div className='flex items-center justify-between border-b border-[#414A5D] pb-2'>
                        <p className='text-[10px] font-bold uppercase tracking-[.14em] text-white/90'>Global Economic KPI</p>
                        <span className='text-[9px] text-[#A99FFF]'>MACRO OVERVIEW</span>
                    </div>
                    <div className='mt-3 grid grid-cols-2 gap-2'>
                        {[
                            ['GDP Growth', '3.1%', '+0.4 pp'],
                            ['Inflation', '2.8%', '-0.2 pp'],
                            ['Unemployment', '4.0%', '-0.1 pp'],
                            ['Policy Rate', '4.75%', 'UNCHANGED'],
                        ].map(([label, value, delta]) => (
                            <div key={label} className='rounded-lg border border-[#414A5D] bg-[#0C0F18] p-2.5'>
                                <p className='text-[9px] uppercase tracking-[.07em] text-white/45'>{label}</p>
                                <div className='mt-1.5 flex items-end justify-between gap-1'>
                                    <span className='text-lg font-bold text-white'>{value}</span>
                                    <span className='pb-0.5 text-[9px] text-[#A99FFF]'>{delta}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='mt-3 flex items-center justify-between'>
                        <p className='text-[10px] font-semibold uppercase text-white/80'>Growth Trend</p>
                        <span className='text-[9px] text-white/45'>Last 12 periods</span>
                    </div>
                    <div className='mt-1.5 flex-1 rounded-lg border border-[#414A5D] bg-[#0C0F18] px-2 pt-2'>
                        <ShowcaseMiniTrend id='kpi' values={[32, 41, 38, 55, 49, 60, 56, 66, 63, 71, 76, 86]} height={72} />
                    </div>
                    <div className='mt-2 flex items-center justify-between text-[9px] text-white/50'>
                        <span>United States · EU · Asia</span>
                        <span className='text-[#A99FFF]'>Compare countries ↗</span>
                    </div>
                </div>
            </ShowcasePreviewFrame>
        );
    }

    if (slide.id === 'economic-simulator') {
        return (
            <ShowcasePreviewFrame>
                <div className='flex h-full flex-col'>
                    <div className='flex items-center justify-between'>
                        <p className='text-[10px] font-bold uppercase tracking-[.13em] text-white/90'>Supply &amp; Demand Simulator</p>
                        <span className='rounded-full border border-[#4333AF]/50 px-2 py-1 text-[9px] text-[#A99FFF]'>SCENARIO 02</span>
                    </div>
                    <svg
                        viewBox='0 0 440 266'
                        preserveAspectRatio='xMidYMid meet'
                        className='mt-2 block min-h-0 w-full flex-1'
                        role='img'
                        aria-label='Economic simulation of supply and demand shifts with equilibrium points'
                    >
                        <defs>
                            <filter id='execution-economic-glow' x='-30%' y='-30%' width='160%' height='160%'>
                                <feGaussianBlur stdDeviation='3' />
                            </filter>
                        </defs>
                        <path d='M43 8 V240 H432' fill='none' stroke='white' strokeWidth='1.5' strokeOpacity='.8' />
                        <text x='18' y='16' fill='white' fontSize='16' fontWeight='600'>
                            P
                        </text>
                        <text x='426' y='259' fill='white' fontSize='16' fontWeight='600'>
                            Q
                        </text>
                        <text x='17' y='154' transform='rotate(-90 17 154)' fill='white' fontSize='13'>
                            Price
                        </text>
                        <text x='207' y='262' fill='white' fontSize='13'>
                            Quantity
                        </text>
                        <path
                            d='M60 36 Q157 154 403 226'
                            fill='none'
                            stroke='#6D5DD5'
                            strokeWidth='9'
                            strokeOpacity='.18'
                            filter='url(#execution-economic-glow)'
                        />
                        <path d='M60 36 Q157 154 403 226' fill='none' stroke='#9B8DFF' strokeWidth='2.5' />
                        <path
                            d='M60 226 Q223 194 402 35'
                            fill='none'
                            stroke='#6D5DD5'
                            strokeWidth='9'
                            strokeOpacity='.2'
                            filter='url(#execution-economic-glow)'
                        />
                        <path d='M60 226 Q223 194 402 35' fill='none' stroke='#9B8DFF' strokeWidth='2.5' />
                        <path
                            d='M198 20 Q227 163 377 200'
                            fill='none'
                            stroke='#6D5DD5'
                            strokeWidth='9'
                            strokeOpacity='.18'
                            filter='url(#execution-economic-glow)'
                        />
                        <path d='M198 20 Q227 163 377 200' fill='none' stroke='#6D5DD5' strokeWidth='2.5' />
                        <g stroke='white' strokeOpacity='.6' strokeDasharray='4 4' strokeWidth='1'>
                            <line x1='215' x2='215' y1='142' y2='240' />
                            <line x1='43' x2='215' y1='142' y2='142' />
                            <line x1='276' x2='276' y1='103' y2='240' />
                            <line x1='43' x2='276' y1='103' y2='103' />
                        </g>
                        <g fill='white' stroke='#8D81ED' strokeWidth='2'>
                            <circle cx='215' cy='142' r='5' />
                            <circle cx='276' cy='103' r='5' />
                        </g>
                        <g fontSize='13' fontWeight='600' fill='#B5AAFF'>
                            <text x='116' y='49'>
                                D
                            </text>
                            <text x='270' y='25'>
                                D1
                            </text>
                            <text x='318' y='81'>
                                S
                            </text>
                        </g>
                        <g fontSize='12' fill='white'>
                            <text x='223' y='136'>
                                E1
                            </text>
                            <text x='283' y='115'>
                                E2
                            </text>
                        </g>
                    </svg>
                    <div className='flex items-center justify-between gap-2 text-[9px] text-white/55'>
                        <span>Baseline equilibrium</span>
                        <span className='text-[#A99FFF]'>Demand shift → New equilibrium</span>
                    </div>
                </div>
            </ShowcasePreviewFrame>
        );
    }

    if (slide.id === 'research') {
        return (
            <ShowcasePreviewFrame>
                <div className='flex h-full flex-col'>
                    <div className='flex items-center justify-between border-b border-[#414A5D] pb-2'>
                        <p className='text-[10px] font-bold uppercase tracking-[.11em] text-white/90 sm:text-[11px]'>Single Stock Research</p>
                        <span className='rounded-full bg-[#4333AF]/20 px-2.5 py-0.5 text-[10px] font-medium text-[#A99FFF]'>AAPL</span>
                    </div>
                    <div className='mt-2.5 border-b border-[#414A5D]/65 pb-2.5'>
                        <p className='text-[10px] font-medium uppercase tracking-[.08em] text-white/80'>Consensus Rating</p>
                        <div className='mt-2 flex h-3 overflow-hidden rounded-sm bg-[#414A5D]'>
                            <div className='w-[65%] bg-[#4333AF]' />
                            <div className='w-[25%] bg-[#8D81ED]/65' />
                            <div className='w-[10%] bg-[#414A5D]' />
                        </div>
                        <div className='mt-1.5 flex justify-between text-[9px] text-white/70 sm:text-[10px]'>
                            <span>Buy 65%</span>
                            <span>Hold 25%</span>
                            <span>Sell 10%</span>
                        </div>
                    </div>
                    <div className='mt-2.5 border-b border-[#414A5D]/65 pb-2.5'>
                        <p className='text-[10px] font-medium uppercase tracking-[.08em] text-white/80'>Price Target</p>
                        <div className='relative mt-3 h-1 rounded-full bg-[#414A5D]'>
                            <div className='h-full w-1/2 rounded-full bg-[#4333AF]' />
                            <div className='absolute left-1/2 top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A99FFF] shadow-[0_0_8px_rgba(141,129,237,.7)]' />
                        </div>
                        <div className='mt-2 grid grid-cols-3 gap-2 text-[10px] text-white/90'>
                            <div>
                                $150
                                <br />
                                <span className='text-[9px] text-white/45'>Low</span>
                            </div>
                            <div className='text-center text-sm font-bold'>
                                $195
                                <br />
                                <span className='text-[9px] font-normal text-white/45'>Current</span>
                            </div>
                            <div className='text-right'>
                                $220
                                <br />
                                <span className='text-[9px] text-white/45'>High</span>
                            </div>
                        </div>
                    </div>
                    <div className='mt-2.5 min-h-0 flex-1'>
                        <p className='text-[10px] font-medium uppercase tracking-[.08em] text-white/80'>Earnings Trend</p>
                        <svg
                            viewBox='0 0 360 98'
                            preserveAspectRatio='none'
                            className='mt-1 h-[78px] w-full'
                            role='img'
                            aria-label='Illustrative earnings trend rising across four quarters'
                        >
                            {[28, 50, 72].map((y) => (
                                <line key={y} x1='18' x2='353' y1={y} y2={y} stroke='#414A5D' strokeOpacity='.4' strokeDasharray='2 5' />
                            ))}
                            <g fill='#4333AF' fillOpacity='.8'>
                                <rect x='48' y='62' width='28' height='25' />
                                <rect x='140' y='49' width='28' height='38' />
                                <rect x='230' y='43' width='28' height='44' />
                                <rect x='320' y='31' width='28' height='56' />
                            </g>
                            <polyline points='62,52 154,33 244,25 334,14' fill='none' stroke='#9B8DFF' strokeWidth='2.3' vectorEffect='non-scaling-stroke' />
                            {[
                                ['62', '52'],
                                ['154', '33'],
                                ['244', '25'],
                                ['334', '14'],
                            ].map(([cx, cy], i) => (
                                <circle key={i} cx={cx} cy={cy} r='3.3' fill='#B9B2FF' stroke='#4333AF' strokeWidth='1' />
                            ))}
                            {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                                <text key={q} x={62 + i * 91} y='97' textAnchor='middle' fontSize='11' fill='rgba(255,255,255,.55)'>
                                    {q}
                                </text>
                            ))}
                        </svg>
                    </div>
                </div>
            </ShowcasePreviewFrame>
        );
    }

    // Advanced market calendar: rows and calendar outlines follow the supplied reference.
    return (
        <ShowcasePreviewFrame>
            <div className='flex h-full flex-col'>
                <div className='flex items-center justify-between border-b border-[#414A5D] pb-2'>
                    <p className='text-[10px] font-bold uppercase tracking-[.12em] text-white/80'>Advanced Market Calendar</p>
                    <span className='text-[9px] font-medium text-[#A99FFF]'>UPCOMING</span>
                </div>
                <div className='min-h-0 flex-1 divide-y divide-[#414A5D]/60'>
                    {[
                        ['Upcoming Earnings', '05/02  AMC  EPS: 1.52'],
                        ['Dividend Date', '05/10  $0.70'],
                        ['Ex-Dividend', '05/10  $0.70'],
                        ['Analyst Estimates', '05/10  $0.70'],
                        ['Conference Calls', '05/03  10:00 AM EST'],
                        ['Key Events', 'Rate Decision  05/11'],
                    ].map(([label, detail]) => (
                        <div key={label} className='flex items-center justify-between gap-2 py-2'>
                            <div className='min-w-0'>
                                <p className='text-[10px] font-semibold text-[#A99FFF] sm:text-[11px]'>{label}</p>
                                <p className='mt-0.5 truncate text-[10px] text-white/90 sm:text-[11px]'>{detail}</p>
                            </div>
                            <span className='shrink-0 rounded-full border border-[#8D81ED] px-2.5 py-1 text-[9px] text-white/85 sm:text-[10px]'>
                                <span className='font-bold text-[#A99FFF]'>+</span> Calendar
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </ShowcasePreviewFrame>
    );
}

// The hero dashboard uses illustrative paper-trading data, not a live brokerage feed.
type PaperDeskPeriod = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

type PaperDeskPeriodData = {
    change: number;
    changePercent: string;
    labels: string[];
    totalTrades: number;
    profitableTrades: number;
    avgGain: string;
    avgLoss: string;
    seed: number;
};

const PAPER_DESK_ACCOUNT_VALUE = 125743.18;
const PAPER_DESK_RANGES: PaperDeskPeriod[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
const PAPER_DESK_DATA: Record<PaperDeskPeriod, PaperDeskPeriodData> = {
    '1D': {
        change: 3218.42,
        changePercent: '+2.62%',
        labels: ['9:30', '10:30', '11:30', '12:30', '1:30', '2:30', '4:00'],
        totalTrades: 8,
        profitableTrades: 6,
        avgGain: '+2.38%',
        avgLoss: '-1.12%',
        seed: 2,
    },
    '1W': {
        change: 5134.27,
        changePercent: '+4.26%',
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        totalTrades: 18,
        profitableTrades: 13,
        avgGain: '+2.25%',
        avgLoss: '-1.04%',
        seed: 4,
    },
    '1M': {
        change: 8150.93,
        changePercent: '+6.93%',
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        totalTrades: 34,
        profitableTrades: 25,
        avgGain: '+2.19%',
        avgLoss: '-1.08%',
        seed: 6,
    },
    '3M': {
        change: 12445.36,
        changePercent: '+10.98%',
        labels: ['Aug', 'Sep', 'Oct'],
        totalTrades: 62,
        profitableTrades: 44,
        avgGain: '+2.23%',
        avgLoss: '-1.10%',
        seed: 8,
    },
    '1Y': {
        change: 17432.1,
        changePercent: '+16.09%',
        labels: ['Nov', 'Jan', 'Mar', 'May', 'Jul', 'Sep', 'Oct'],
        totalTrades: 111,
        profitableTrades: 76,
        avgGain: '+2.14%',
        avgLoss: '-1.06%',
        seed: 10,
    },
    ALL: {
        change: 19532.4,
        changePercent: '+18.42%',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        totalTrades: 128,
        profitableTrades: 87,
        avgGain: '+2.14%',
        avgLoss: '-1.08%',
        seed: 12,
    },
};

const PAPER_DESK_ALLOCATIONS = [
    { label: 'Stocks', percent: 67, color: '#4333AF' },
    { label: 'ETFs', percent: 15, color: '#4333AF' },
    { label: 'Cash', percent: 10, color: '#9183dd' },
    { label: 'Options', percent: 3, color: '#aeb4cd' },
    { label: 'Bonds', percent: 5, color: '#737ea6' },
];

const PAPER_DESK_HOLDINGS = [
    { symbol: 'NVDA', amount: 22418.6, change: '+4.36%' },
    { symbol: 'AAPL', amount: 18932.4, change: '+1.92%' },
    { symbol: 'MSFT', amount: 11245.3, change: '+2.18%' },
    { symbol: 'AMZN', amount: 8412.15, change: '+1.64%' },
    { symbol: 'TSLA', amount: 6904.22, change: '+3.21%' },
];

const PAPER_DESK_SECTORS = [
    { label: 'Technology', percent: 42, color: '#414A5D' },
    { label: 'Financials', percent: 18, color: '#414A5D' },
    { label: 'Healthcare', percent: 14, color: '#414A5D' },
    { label: 'Energy', percent: 8, color: '#414A5D' },
    { label: 'Other', percent: 18, color: '#414A5D' },
];

function paperDeskMoney(amount: number) {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PaperDeskPerformanceChart({ period, data }: { period: PaperDeskPeriod; data: PaperDeskPeriodData }) {
    const left = 54;
    const right = 646;
    const top = 10;
    const bottom = 110;
    const startValue = PAPER_DESK_ACCOUNT_VALUE - data.change;
    const floor = Math.floor((startValue - data.change * 0.18) / 1000) * 1000;
    const ceiling = Math.ceil((PAPER_DESK_ACCOUNT_VALUE + data.change * 0.18) / 1000) * 1000;
    const points = Array.from({ length: 82 }, (_, index) => {
        const t = index / 81;
        // Deterministic illustrative volatility. The first/last chart values always
        // reconcile to the selected period's change and today's account balance.
        const fade = Math.sin(Math.PI * t);
        const wave =
            (Math.sin(index * 0.42 + data.seed) * 0.38 + Math.sin(index * 0.17 + data.seed * 0.6) * 0.43 + Math.sin(index * 1.19 + data.seed * 1.8) * 0.11) *
            fade;
        const value = startValue + data.change * (t + wave * 0.105);
        return {
            x: left + t * (right - left),
            y: bottom - ((value - floor) / (ceiling - floor)) * (bottom - top),
        };
    });
    const strokePath = points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
    const areaPath = `${strokePath} L${right} ${bottom} L${left} ${bottom} Z`;
    const last = points[points.length - 1];
    const labelCount = data.labels.length;

    return (
        <svg
            viewBox='0 0 675 147'
            preserveAspectRatio='none'
            className='block h-auto w-full xl:h-[78px]'
            role='img'
            aria-label={`Illustrative ${period} account performance: ${paperDeskMoney(startValue)} to ${paperDeskMoney(PAPER_DESK_ACCOUNT_VALUE)}, change ${
                data.changePercent
            }`}
        >
            <defs>
                <linearGradient id='paper-desk-performance-fill' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#414A5D' stopOpacity='.55' />
                    <stop offset='100%' stopColor='#414A5D' stopOpacity='.015' />
                </linearGradient>
                <filter id='paper-desk-point-glow' x='-300%' y='-300%' width='700%' height='700%'>
                    <feGaussianBlur stdDeviation='3' />
                </filter>
            </defs>
            {[5, 4].map((tickCount) =>
                Array.from({ length: tickCount }, (_, index) => {
                    const y = top + ((bottom - top) * index) / (tickCount - 1);
                    const value = ceiling - ((ceiling - floor) * index) / (tickCount - 1);
                    return (
                        <g key={`horizontal-${tickCount}-${index}`} className={tickCount === 4 ? 'hidden xl:block' : 'xl:hidden'}>
                            <line x1={left} y1={y} x2={right} y2={y} stroke='#414A5D' strokeOpacity='.46' strokeWidth='.8' />
                            <text x={left - 12} y={y + 4} textAnchor='end' fontSize='11' fill='#8493a8'>
                                {`${Math.round(value / 1000)}K`}
                            </text>
                        </g>
                    );
                })
            )}
            {data.labels.map((label, index) => {
                const x = left + (index / Math.max(labelCount - 1, 1)) * (right - left);
                return (
                    <g key={`${label}-${index}`}>
                        <line x1={x} y1={top} x2={x} y2={bottom} stroke='#414A5D' strokeOpacity='.25' strokeWidth='.8' />
                        <text x={x} y='138' textAnchor='middle' fontSize={labelCount > 8 ? 10 : 11} fill='#8595aa'>
                            {label}
                        </text>
                    </g>
                );
            })}
            <path d={areaPath} fill='url(#paper-desk-performance-fill)' />
            <path
                d={strokePath}
                fill='none'
                stroke='#414A5D'
                strokeWidth='2.5'
                strokeLinejoin='round'
                strokeLinecap='round'
                vectorEffect='non-scaling-stroke'
            />
            <circle cx={last.x} cy={last.y} r='8' fill='#414A5D' opacity='.7' filter='url(#paper-desk-point-glow)' />
            <circle cx={last.x} cy={last.y} r='3.5' fill='#414A5D' stroke='#414A5D' strokeWidth='1.2' />
        </svg>
    );
}

function PaperDeskHoldingLogo({ symbol }: { symbol: string }) {
    if (symbol === 'MSFT') {
        return (
            <span className='grid h-[18px] w-[18px] shrink-0 xl:h-[12px] xl:w-[12px] grid-cols-2 gap-[2px] xl:gap-[1px]' aria-hidden='true'>
                <span className='bg-[#f25022]' />
                <span className='bg-[#7fba00]' />
                <span className='bg-[#4333AF]' />
                <span className='bg-[#ffb900]' />
            </span>
        );
    }
    const styles: Record<string, string> = {
        NVDA: 'bg-[#78b900] text-[#09120b]',
        AAPL: 'bg-white text-[#10151e]',
        AMZN: 'bg-[#131920] text-white',
        TSLA: 'bg-[#ec2438] text-white',
    };
    return (
        <span
            aria-hidden='true'
            className={`flex h-[19px] w-[19px] shrink-0 xl:h-[12px] xl:w-[12px] items-center justify-center rounded-[4px] text-[13px] xl:text-[9px] font-black leading-none ${
                styles[symbol] ?? 'bg-[#183044] text-white'
            }`}
        >
            {symbol === 'NVDA' ? '◉' : symbol === 'AAPL' ? '●' : symbol === 'AMZN' ? 'a' : 'T'}
        </span>
    );
}

function PaperDeskDashboard() {
    const [period, setPeriod] = useState<PaperDeskPeriod>('1D');
    const selected = PAPER_DESK_DATA[period];
    const winRate = Math.round((selected.profitableTrades / selected.totalTrades) * 100);
    const panelClass = 'min-w-0 h-full rounded-[13px] border border-[#414A5D] bg-[#0A0D14] p-3 sm:p-4 lg:p-3 xl:rounded-[8px] xl:p-[7px]';

    return (
        <div className='relative w-full overflow-hidden rounded-[22px] border border-[#414A5D] bg-[#0C0F18] p-2.5 text-white xl:min-h-[520px] xl:h-auto xl:p-[8px] shadow-[0_22px_76px_rgba(0,0,0,.5),0_0_48px_rgba(67,51,175,.075)] sm:p-3'>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_30%,rgba(12,50,90,.16),transparent_58%)]' />
            <div className='relative space-y-2.5 sm:space-y-3 lg:space-y-2 xl:space-y-[6px]'>
                <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-3 px-2 py-2 sm:px-3 sm:py-2.5 xl:h-[36px] xl:flex-nowrap xl:gap-y-0 xl:px-2 xl:py-0'>
                    <div className='flex min-w-0 items-center gap-2.5 sm:gap-3'>
                        <Image
                            src='/logocolored.png'
                            alt='Black Snow'
                            width={49}
                            height={49}
                            className='h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12 xl:h-8 xl:w-8'
                        />
                        <div className='min-w-0'>
                            <p className='whitespace-nowrap text-[13px] font-extrabold uppercase tracking-[.22em] text-[#6D83B2] sm:text-[16px] xl:text-[12px]'>
                                BLACK SNOW
                            </p>
                            <p className='mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[.14em] text-[#4333AF] sm:text-[12px] xl:text-[9px]'>
                                PAPER DESK ANALYTICS
                            </p>
                        </div>
                    </div>
                    <div className='flex shrink-0 items-center gap-0.5 sm:gap-1' role='group' aria-label='Account performance timeframe'>
                        {PAPER_DESK_RANGES.map((range) => (
                            <button
                                key={range}
                                type='button'
                                aria-label={`Show ${range} account performance`}
                                aria-pressed={period === range}
                                onClick={() => setPeriod(range)}
                                className={`flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[8px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF] sm:h-9 sm:min-w-9 sm:px-2 sm:text-[11px] xl:h-7 xl:min-w-7 xl:px-1 xl:text-[9px] ${
                                    period === range
                                        ? 'border-[#414A5D] bg-[#0b2535] text-white shadow-[0_0_12px_rgba(39,191,239,.14)]'
                                        : 'border-transparent text-[#8a93a6] hover:border-[#414A5D] hover:bg-[#0b2333] hover:text-white'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='grid gap-2.5 sm:gap-3 lg:gap-2 xl:gap-[6px] min-[520px]:grid-cols-2 min-[520px]:grid-rows-4'>
                    <div className='col-span-1 grid grid-cols-3 items-center rounded-[13px] border border-[#414A5D] bg-[#0A0D14] px-1.5 py-3 sm:px-2 sm:py-3.5 xl:px-1 xl:py-[3px] min-[520px]:col-span-2'>
                        <div className='min-w-0 px-2 sm:px-4 xl:px-3'>
                            <p className='text-[9px] text-[#9ca6b8] sm:text-[12px] xl:text-[9px]'>Account Value</p>
                            <p className='mt-1 whitespace-nowrap xl:mt-0 text-[clamp(12px,2.25vw,20px)] xl:text-[15px] font-bold tracking-[-.025em] text-white'>
                                {paperDeskMoney(PAPER_DESK_ACCOUNT_VALUE)}
                            </p>
                        </div>
                        <div className='min-w-0 border-x border-[#414A5D] px-2 sm:px-4 xl:px-3'>
                            <p className='text-[9px] text-[#9ca6b8] sm:text-[12px] xl:text-[9px]'>Total Return</p>
                            <p className='mt-1 whitespace-nowrap xl:mt-0 text-[clamp(13px,2.2vw,20px)] xl:text-[15px] font-bold leading-tight text-[#fff]'>
                                +18.42%
                            </p>
                            {/* <p className='mt-0.5 whitespace-nowrap text-[10px] text-[#4333AF] sm:text-[12px] xl:mt-0 xl:text-[9px]'>+$19,532.40</p> */}
                        </div>
                        <div className='min-w-0 px-2 sm:px-4 xl:px-3' aria-live='polite' aria-atomic='true'>
                            <p className='text-[9px] text-[#9ca6b8] sm:text-[12px] xl:text-[9px]'>{period === '1D' ? "Today's P&L" : `${period} P&L`}</p>
                            <p className='mt-1 whitespace-nowrap xl:mt-0 text-[clamp(12px,2.2vw,20px)] xl:text-[15px] font-bold leading-tight text-[#fff]'>
                                +{paperDeskMoney(selected.change)}
                            </p>
                            {/* <p className='mt-0.5 text-[10px] text-[#4333AF] sm:text-[12px] xl:mt-0 xl:text-[9px]'>{selected.changePercent}</p> */}
                        </div>
                    </div>

                    <div className={`${panelClass} col-span-1 min-[520px]:col-span-2`}>
                        <div className='mb-1.5 flex items-center justify-between gap-3'>
                            <h3 className='text-[12px] font-bold uppercase tracking-[.015em] text-[#4333AF] sm:text-[14px] xl:text-[10px] xl:leading-[12px]'>
                                Account Performance
                            </h3>
                            <TrendingUp
                                className='h-[17px] w-[17px] shrink-0 text-[#4333AF] sm:h-5 sm:w-5 xl:h-3 xl:w-3'
                                strokeWidth={1.8}
                                aria-hidden='true'
                            />
                        </div>
                        <PaperDeskPerformanceChart period={period} data={selected} />
                    </div>

                    <div className='contents'>
                        <div className={panelClass}>
                            <div className='mb-2.5 flex items-center justify-between xl:mb-[8px]'>
                                <h3 className='text-[12px] font-bold uppercase tracking-[.01em] text-[#4333AF] sm:text-[14px] xl:text-[10px] xl:leading-[12px]'>
                                    Asset Allocation
                                </h3>
                                <TrendingUp className='h-[17px] w-[17px] shrink-0 text-[#4333AF] xl:h-3 xl:w-3' aria-hidden='true' />
                            </div>
                            <div className='flex items-center justify-between gap-2'>
                                <div
                                    className='relative aspect-square w-[42%] max-w-[150px] shrink-0 rounded-full xl:w-[60px]'
                                    style={{
                                        background: 'conic-gradient(#4333AF 0% 67%, #4333AF 67% 82%, #9183dd 82% 92%, #aeb4cd 92% 95%, #737ea6 95% 100%)',
                                    }}
                                >
                                    <div className='absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-[#05111c] text-center shadow-[inset_0_0_10px_rgba(0,0,0,.3)]'>
                                        <span className='text-[clamp(11px,1.65vw,17px)] font-bold xl:text-[9px]'>$125.7K</span>
                                        <span className='mt-0.5 text-[10px] text-[#9ca7b7] sm:text-[11px] xl:mt-0 xl:text-[9px]'>Total</span>
                                    </div>
                                </div>
                                <div className='min-w-0 flex-1 space-y-2 xl:space-y-[1px]'>
                                    {PAPER_DESK_ALLOCATIONS.map(({ label, percent, color }) => (
                                        <div
                                            key={label}
                                            className='flex items-center gap-2 text-[10px] sm:text-[11px] xl:gap-1 xl:text-[9px] xl:leading-[12px]'
                                        >
                                            <span className='h-3 w-3 shrink-0 rounded-full xl:h-2 xl:w-2' style={{ backgroundColor: color }} />
                                            <span className='min-w-0 flex-1 text-[#b0b8ca]'>{label}</span>
                                            <span className='font-medium tabular-nums text-white'>{percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={panelClass}>
                            <div className='mb-2.5 flex items-center justify-between xl:mb-[8px]'>
                                <h3 className='text-[12px] font-bold uppercase tracking-[.01em] text-[#4333AF] sm:text-[14px] xl:text-[10px] xl:leading-[12px]'>
                                    Top Holdings
                                </h3>
                                <TrendingUp className='h-[17px] w-[17px] shrink-0 text-[#4333AF] xl:h-3 xl:w-3' aria-hidden='true' />
                            </div>
                            <div className='space-y-2 xl:space-y-[4px]'>
                                {PAPER_DESK_HOLDINGS.map(({ symbol, amount, change }) => (
                                    <div
                                        key={symbol}
                                        className='grid grid-cols-[19px_minmax(0,1fr)_auto_auto] items-center gap-x-2.5 text-[10px] sm:text-[11px] xl:grid-cols-[13px_minmax(0,1fr)_auto_auto] xl:gap-x-1.5 xl:text-[9px] xl:leading-[12px]'
                                    >
                                        <PaperDeskHoldingLogo symbol={symbol} />
                                        <span className='font-medium text-[#e0e7f3]'>{symbol}</span>
                                        <span className='whitespace-nowrap tabular-nums text-[#dde1e9]'>{paperDeskMoney(amount)}</span>
                                        <span className='w-[49px] whitespace-nowrap xl:w-[41px] text-right tabular-nums text-[#2ad9ab]'>{change}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={panelClass}>
                            <div className='mb-2.5 flex items-center justify-between xl:mb-[8px]'>
                                <h3 className='text-[12px] font-bold uppercase tracking-[.01em] text-[#4333AF] sm:text-[14px] xl:text-[10px] xl:leading-[12px]'>
                                    Sector Exposure
                                </h3>
                                <TrendingUp className='h-[17px] w-[17px] shrink-0 text-[#4333AF] xl:h-3 xl:w-3' aria-hidden='true' />
                            </div>
                            <div className='space-y-2 xl:space-y-[4px]'>
                                {PAPER_DESK_SECTORS.map(({ label, percent, color }) => (
                                    <div
                                        key={label}
                                        className='grid grid-cols-[minmax(0,1fr)_minmax(46px,1.1fr)_32px] items-center gap-2 text-[10px] sm:text-[11px] xl:gap-1 xl:text-[9px] xl:leading-[12px]'
                                    >
                                        <span className='truncate text-[#aab4c7]'>{label}</span>
                                        <span className='h-3 overflow-hidden rounded-full bg-[#162b3c] xl:h-[6px]'>
                                            <span className='block h-full rounded-full' style={{ width: `${percent}%`, backgroundColor: color }} />
                                        </span>
                                        <span className='text-right tabular-nums text-[#e9edf6]'>{percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={panelClass}>
                            <div className='mb-2.5 flex items-center justify-between xl:mb-[8px]'>
                                <h3 className='text-[12px] font-bold uppercase tracking-[.01em] text-[#4333AF] sm:text-[14px] xl:text-[10px] xl:leading-[12px]'>
                                    Paper Trading Stats
                                </h3>
                                <TrendingUp className='h-[17px] w-[17px] shrink-0 text-[#4333AF] xl:h-3 xl:w-3' aria-hidden='true' />
                            </div>
                            <div
                                className='divide-y divide-[#153047]/55 text-[11px] sm:text-[12px] xl:text-[9px] xl:leading-[11px]'
                                aria-live='polite'
                                aria-atomic='true'
                            >
                                {[
                                    ['Win Rate', `${winRate}%`, 'positive'],
                                    ['Total Trades', `${selected.totalTrades}`, 'normal'],
                                    ['Profitable Trades', `${selected.profitableTrades}`, 'normal'],
                                    ['Avg. Gain', selected.avgGain, 'positive'],
                                    ['Losing Trades', `${selected.totalTrades - selected.profitableTrades}`, 'normal'],
                                ].map(([label, value, sentiment]) => (
                                    <div key={label} className='flex items-center justify-between gap-3 py-[5px] first:pt-0 last:pb-0 xl:py-[3px]'>
                                        <span className='text-[#aab4c7]'>{label}</span>
                                        <span
                                            className={`font-medium tabular-nums ${
                                                sentiment === 'positive' ? 'text-[#4333AF]' : sentiment === 'negative' ? 'text-[#fa5468]' : 'text-[#f2f6fd]'
                                            }`}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <p className='px-1 pb-0.5 text-right text-[9px] xl:hidden tracking-[.02em] text-[#698296]'>
                    Illustrative paper account · Simulated performance
                </p>
            </div>
        </div>
    );
}

export default function TradingPlatformShowcase({ useSharedBackground = false }: { useSharedBackground?: boolean } = {}) {
    // Keep main slide and sub-slide indexes together to advance atomically.
    const [executionPosition, setExecutionPosition] = useState({ executionIndex: 0, executionDetailIndex: 0 });
    const { executionIndex, executionDetailIndex } = executionPosition;

    const activeExecutionSlide = executionSlides[executionIndex];
    const activeExecutionDetail = activeExecutionSlide.details[executionDetailIndex];

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const timer = window.setInterval(() => {
            setExecutionPosition((current) => {
                const nextDetail = current.executionDetailIndex + 1;
                if (nextDetail >= executionSlides[current.executionIndex].details.length) {
                    return {
                        executionIndex: (current.executionIndex + 1) % executionSlides.length,
                        executionDetailIndex: 0,
                    };
                }
                return { ...current, executionDetailIndex: nextDetail };
            });
        }, 3600);
        return () => window.clearInterval(timer);
    }, []);

    const showExecutionSlide = (index: number) => {
        setExecutionPosition({ executionIndex: (index + executionSlides.length) % executionSlides.length, executionDetailIndex: 0 });
    };

    const previousExecutionSlide = () => {
        showExecutionSlide((executionIndex - 1 + executionSlides.length) % executionSlides.length);
    };

    const nextExecutionSlide = () => {
        showExecutionSlide((executionIndex + 1) % executionSlides.length);
    };

    return (
        <section
            className={`trading-platform-showcase relative overflow-x-clip ${
                useSharedBackground ? 'bg-transparent' : 'bg-[#050608]'
            } px-4 py-10 text-white sm:px-6 sm:py-16 md:px-8 lg:py-20`}
        >
            {!useSharedBackground && (
                <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_6%,rgba(67,51,175,.08),transparent_24%),radial-gradient(circle_at_10%_42%,rgba(67,51,175,.07),transparent_30%),linear-gradient(180deg,#050608_0%,#07101a_48%,#050608_100%)]' />
            )}
            <div className='relative mx-auto max-w-[1180px]'>
                <div className='grid items-center gap-8 sm:gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-10'>
                    <div>
                        <div className='inline-flex max-w-full items-center gap-2 rounded-full border border-[#414A5D] bg-[#0C0F18] px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] text-[#4333AF] sm:px-3.5 sm:text-[10px] sm:tracking-[.12em]'>
                            <Zap className='h-3.5 w-3.5' />
                            All-in-one trading intelligence platform
                        </div>
                        <h2 className='showcase-display mt-5 text-[clamp(1.5rem,8.5vw,2.3rem)] font-black leading-[1.15] tracking-[-.035em] text-white'>
                            Smarter Tools.
                            <br />
                            <span className='text-[#4333AF]'>Stronger</span> Decisions.
                        </h2>
                        <p className='mt-4 max-w-xl text-sm leading-6 text-white/72 sm:mt-5 sm:text-base sm:leading-7'>
                            Black Snow gives you everything you need to analyze markets, test strategies, and stay ahead — all in one powerful dashboard.
                        </p>
                        <div className='mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row'>
                            <ComingSoonTrigger
                                ariaLabel='Start 30-day free trial'
                                className='group flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#4333AF] px-6 text-sm font-black text-white shadow-[0_0_30px_rgba(67,51,175,.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#372990] hover:shadow-[0_8px_26px_rgba(67,51,175,.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF]'
                            >
                                Start 30-Day Free Trial
                                <ArrowRight className='h-4 w-4' />
                            </ComingSoonTrigger>

                            <ComingSoonTrigger
                                ariaLabel='View live demo'
                                className='group flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#414A5D] bg-[#050608] px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4333AF] hover:bg-[#0C0F18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF]'
                            >
                                View Live Demo
                                <Target className='h-4 w-4 text-[#4333AF]' />
                            </ComingSoonTrigger>
                        </div>
                        <div className='mt-5 grid gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3'>
                            {[
                                [CircleDollarSign, 'No Credit Card Required'],
                                [Clock3, '30-Day Full Access'],
                                [ShieldCheck, 'Cancel Anytime, Keep Learning'],
                            ].map(([Icon, text]) => {
                                const I = Icon as LucideIcon;
                                return (
                                    <div
                                        key={text as string}
                                        className='flex items-center gap-3 rounded-lg border border-[#414A5D] bg-white/[.015] px-3 py-2.5 sm:border-0 sm:bg-transparent sm:p-0'
                                    >
                                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#414A5D] sm:h-9 sm:w-9'>
                                            <I className='h-4 w-4 text-[#4333AF]' />
                                        </div>
                                        <p className='text-[11px] leading-4 text-white/65 sm:text-xs sm:leading-5'>{text as string}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='relative min-w-0'>
                        <div className='pointer-events-none absolute -inset-8 rounded-full bg-[#4333AF]/8 blur-3xl' />
                        <PaperDeskDashboard />
                    </div>
                </div>

                <div id='black-snow-tools' className='mt-12 scroll-mt-24 sm:mt-16'>
                    <div className='flex items-center gap-4'>
                        <div className='h-px flex-1  bg-[#4333AF]' />
                        <div className='text-center'>
                            <h2 className='showcase-section-title text-[clamp(1.35rem,5vw,2rem)] font-black text-white'>
                                Eight Powerful Tools. One Unified Platform.
                            </h2>
                            <p className='mt-2 text-xs text-white/45 sm:text-sm'>Everything you need to research, simulate, and master the markets.</p>
                        </div>
                        <div className='h-px flex-1  bg-[#4333AF]' />
                    </div>
                    <div className='mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                        {tools.map((tool, index) => {
                            const Icon = tool.icon;
                            return (
                                <Link
                                    key={tool.title}
                                    href={tool.href}
                                    className='group grid overflow-hidden rounded-xl border border-[#414A5D] bg-[#0C0F18] transition hover:-translate-y-1 hover:border-[#4333AF] sm:min-h-[190px] md:grid-cols-[1.07fr_.93fr]'
                                >
                                    <div className='flex flex-col p-4 sm:p-5'>
                                        <div className='flex items-center gap-3'>
                                            <span
                                                aria-hidden='true'
                                                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#414A5D]/70 bg-[#0A0D14]'
                                            >
                                                <Icon className='h-6 w-6 text-[#4333AF] sm:h-7 sm:w-7' strokeWidth={2} />
                                            </span>
                                            <h3 className='showcase-subheading text-sm font-black uppercase tracking-[.02em] text-[#6D83B2]'>{tool.title}</h3>
                                        </div>
                                        <p className='mt-3 text-xs leading-5 text-white/65 sm:text-sm sm:leading-6'>{tool.body}</p>
                                        <div className='mt-auto flex items-center gap-2 pt-4 text-[10px] font-bold uppercase tracking-[.04em] text-[#6D83B2]'>
                                            Learn More <ArrowRight className='h-3.5 w-3.5 text-[#6D83B2]' />
                                        </div>
                                    </div>
                                    <div className='hidden min-h-[125px] items-center justify-center border-t border-[#414A5D] bg-[#0A0D14] p-4 sm:flex md:border-l md:border-t-0'>
                                        <Preview kind={tool.kind} id={`tool-${index}`} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className='mt-9 rounded-2xl border border-[#414A5D] bg-[#0C0F18] p-4 sm:mt-12 sm:p-5'>
                    <div className='text-center'>
                        <h2 className='showcase-section-title text-[clamp(1.4rem,5vw,2rem)] font-black text-white'>Who Is Black Snow For?</h2>
                        <p className='mt-2 text-sm text-white/45'>Powerful tools for every type of market participant.</p>
                    </div>
                    <div className='mt-5 grid gap-3 sm:mt-6 sm:flex sm:snap-x sm:snap-mandatory sm:overflow-x-auto sm:pb-2 xl:grid xl:grid-cols-6 xl:overflow-visible'>
                        {audiences.map(({ icon: Icon, title, body }) => (
                            <article
                                key={title}
                                className='flex items-start gap-4 rounded-xl border border-[#414A5D] bg-[#0A0D14] px-4 py-4 text-left sm:block sm:min-w-[245px] sm:snap-start sm:py-5 sm:text-center xl:min-w-0'
                            >
                                <Icon className='h-9 w-9 shrink-0 text-[#4333AF] sm:mx-auto sm:h-10 sm:w-10' strokeWidth={1.35} />
                                <div className='min-w-0'>
                                    <h3 className='showcase-subheading text-[12px] font-black uppercase leading-5 text-white sm:mt-4'>{title}</h3>
                                    <p className='mt-1.5 text-xs leading-5 text-white/58 sm:mt-3'>{body}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                <div className='mt-9 sm:mt-12'>
                    <div className='text-center'>
                        <h2 className='showcase-section-title text-[clamp(1.4rem,5vw,2rem)] font-black text-white'>From Insight to Execution</h2>
                        <p className='mt-2 text-sm text-white/45'>Explore the eight Black Snow tools through one unified market workflow.</p>
                    </div>

                    <div className='relative mt-7 overflow-hidden rounded-[18px] border border-[#414A5D] bg-[#0C0F18] shadow-[0_26px_80px_rgba(0,0,0,.42)] sm:mt-8'>
                        <div
                            className='pointer-events-none absolute inset-0 opacity-70'
                            style={{
                                background: `radial-gradient(circle at 15% 30%, ${activeExecutionSlide.accent}10, transparent 34%), radial-gradient(circle at 76% 52%, ${activeExecutionSlide.accent}0b, transparent 34%)`,
                            }}
                        />

                        <div className='relative z-10 p-5 sm:p-7 lg:p-8'>
                            <div className='flex items-center justify-between gap-4'>
                                <div className='flex min-w-0 items-center gap-3'>
                                    <Image src='/logocolored.png' alt='Black Snow' width={30} height={30} className='h-7 w-7 shrink-0 object-contain' />
                                    <span className='truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6D83B2] sm:text-[11px]'>
                                        Black Snow
                                    </span>
                                </div>

                                <div className='text-[11px] font-medium tracking-[0.08em] text-white/36'>
                                    <span style={{ color: activeExecutionSlide.accent }}>{String(executionIndex + 1).padStart(2, '0')}</span>
                                    <span className='px-1.5'>/</span>
                                    <span>{String(executionSlides.length).padStart(2, '0')}</span>
                                </div>
                            </div>

                            <div className='mt-8 grid h-[610px] content-start gap-8 sm:h-[640px] lg:h-[360px] lg:grid-cols-[1.08fr_.92fr] lg:content-center lg:items-center lg:gap-10'>
                                <div className='min-w-0 self-start lg:self-center'>
                                    <h3 className='showcase-display showcase-execution-title block w-full whitespace-nowrap text-[clamp(0.95rem,3.4vw,1.8rem)] uppercase leading-[1.28] tracking-[-0.035em] text-white sm:text-[clamp(1.2rem,2.6vw,2rem)] lg:text-[clamp(1.3rem,2vw,2rem)]'>
                                        {activeExecutionSlide.title}
                                    </h3>

                                    <div className='mt-7 min-h-[118px]'>
                                        <div className='flex items-center justify-between gap-4'>
                                            <p className='text-[9px] font-medium uppercase tracking-[0.2em] text-white/36'>
                                                {String(executionDetailIndex + 1).padStart(2, '0')} /{' '}
                                                {String(activeExecutionSlide.details.length).padStart(2, '0')}
                                            </p>

                                            <div className='flex items-center gap-1.5'>
                                                <button
                                                    type='button'
                                                    aria-label='Previous content'
                                                    onClick={() =>
                                                        setExecutionPosition((current) => ({
                                                            ...current,
                                                            executionDetailIndex:
                                                                (current.executionDetailIndex - 1 + activeExecutionSlide.details.length) %
                                                                activeExecutionSlide.details.length,
                                                        }))
                                                    }
                                                    className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#414A5D] text-white/55 transition-all duration-200 hover:border-[#4333AF] hover:bg-[#4333AF]/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4333AF]'
                                                >
                                                    <ChevronLeft className='h-3.5 w-3.5' />
                                                </button>
                                                <button
                                                    type='button'
                                                    aria-label='Next content'
                                                    onClick={() =>
                                                        setExecutionPosition((current) => ({
                                                            ...current,
                                                            executionDetailIndex: (current.executionDetailIndex + 1) % activeExecutionSlide.details.length,
                                                        }))
                                                    }
                                                    className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#414A5D] text-white/55 transition-all duration-200 hover:border-[#4333AF] hover:bg-[#4333AF]/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4333AF]'
                                                >
                                                    <ChevronRight className='h-3.5 w-3.5' />
                                                </button>
                                            </div>
                                        </div>

                                        <div className='mt-3'>
                                            <h4 className='showcase-subheading text-sm font-semibold uppercase tracking-[0.03em] text-white sm:text-base'>
                                                {activeExecutionDetail.title}
                                            </h4>
                                            <p className='mt-2 max-w-xl text-xs leading-[1.45rem] text-white/68 sm:text-sm sm:leading-[1.6rem]'>
                                                {activeExecutionDetail.text}
                                            </p>
                                        </div>

                                        <div className='mt-5 flex max-w-[230px] gap-3'>
                                            {activeExecutionSlide.details.map((detail, index) => (
                                                <button
                                                    key={detail.title}
                                                    type='button'
                                                    aria-label={`Show ${detail.title}`}
                                                    onClick={() => setExecutionPosition((current) => ({ ...current, executionDetailIndex: index }))}
                                                    className='h-[3px] flex-1 cursor-pointer rounded-full bg-white/15 transition-all duration-200 hover:scale-y-150 hover:brightness-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4333AF]'
                                                    style={{
                                                        backgroundColor: index === executionDetailIndex ? activeExecutionSlide.accent : 'rgba(255,255,255,.16)',
                                                        boxShadow: index === executionDetailIndex ? `0 0 12px ${activeExecutionSlide.accent}70` : 'none',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <ExecutionPreview slide={activeExecutionSlide} />
                            </div>

                            <div className='mt-7 flex flex-col gap-5 border-t border-[#414A5D] pt-5 sm:flex-row sm:items-center sm:justify-between'>
                                <div className='grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[390px]'>
                                    <Link
                                        href={activeExecutionSlide.href}
                                        className='showcase-execution-action group flex h-10 min-w-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#4333AF] bg-[#4333AF] px-2 text-[8px] font-semibold uppercase leading-none tracking-[0.04em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#372990] hover:shadow-[0_8px_20px_rgba(67,51,175,.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF] min-[390px]:text-[9px] sm:px-5 sm:text-[10px] sm:tracking-[0.08em]'
                                    >
                                        <span className='showcase-execution-label truncate'>View {activeExecutionSlide.title}</span>
                                        <ArrowRight className='h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1' />
                                    </Link>

                                    <ComingSoonTrigger
                                        ariaLabel={`Get started with ${activeExecutionSlide.title}`}
                                        className='showcase-execution-action group flex h-10 min-w-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#4333AF] bg-transparent px-2 text-[8px] font-semibold uppercase leading-none tracking-[0.04em] text-[#4333AF] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4333AF] hover:bg-[#4333AF]/10 hover:text-[#8D81ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF] min-[390px]:text-[9px] sm:px-5 sm:text-[10px] sm:tracking-[0.08em]'
                                        style={{
                                            boxShadow: '0 0 18px rgba(67,51,175,0.12)',
                                        }}
                                    >
                                        <span className='showcase-execution-label showcase-execution-label-secondary'>Get Started</span>
                                        <ArrowRight className='h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1' />
                                    </ComingSoonTrigger>
                                </div>

                                <div className='flex items-center justify-between gap-3 sm:justify-end'>
                                    <button
                                        type='button'
                                        onClick={previousExecutionSlide}
                                        aria-label='Previous tool'
                                        className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#414A5D] text-white/50 transition-all duration-200 hover:border-[#4333AF] hover:bg-[#4333AF]/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4333AF]'
                                    >
                                        <ChevronLeft className='h-4 w-4' />
                                    </button>

                                    <div className='flex items-center gap-2'>
                                        {executionSlides.map((slide, index) => (
                                            <button
                                                key={slide.id}
                                                type='button'
                                                aria-label={`Show ${slide.title}`}
                                                onClick={() => showExecutionSlide(index)}
                                                className='h-2.5 cursor-pointer rounded-full transition-all duration-300 hover:scale-125 hover:brightness-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4333AF]'
                                                style={{
                                                    width: index === executionIndex ? '24px' : '10px',
                                                    backgroundColor: index === executionIndex ? activeExecutionSlide.accent : 'rgba(255,255,255,.26)',
                                                    boxShadow: index === executionIndex ? `0 0 12px ${activeExecutionSlide.accent}80` : 'none',
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type='button'
                                        onClick={nextExecutionSlide}
                                        aria-label='Next tool'
                                        className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#414A5D] text-white/50 transition-all duration-200 hover:border-[#4333AF] hover:bg-[#4333AF]/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4333AF]'
                                    >
                                        <ChevronRight className='h-4 w-4' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── DESKTOP & MOBILE SHOWCASE — directly below the execution carousel ─── */}
                <div className='platform-anywhere-scope'>
                    <PlatformAnywhereSection />
                </div>

                <div className='mt-8'>
                    <h2 className='showcase-section-title mb-6 text-center text-[clamp(1.4rem,5vw,2rem)] font-black text-white'>
                        Simple Pricing. Maximum Value.
                    </h2>
                    <SimplePricingStrip />
                </div>
            </div>

            <style jsx global>{`
                .trading-platform-showcase {
                    font-family: 'Roboto', Arial, Helvetica, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }

                .trading-platform-showcase .showcase-display,
                .trading-platform-showcase .showcase-section-title,
                .trading-platform-showcase .showcase-subheading {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                    overflow-wrap: normal;
                    word-break: normal;
                }

                .trading-platform-showcase .showcase-execution-action {
                    cursor: pointer;
                    font-family: 'Roboto', Arial, Helvetica, sans-serif !important;
                    font-weight: 700 !important;
                    font-size: 8px !important;
                    line-height: 1 !important;
                }

                .trading-platform-showcase .showcase-execution-action .showcase-execution-label {
                    font-family: 'Roboto', Arial, Helvetica, sans-serif !important;
                    font-size: inherit !important;
                    font-weight: 700 !important;
                    line-height: 1 !important;
                    letter-spacing: inherit !important;
                    text-transform: uppercase;
                    -webkit-font-smoothing: antialiased;
                    text-rendering: optimizeLegibility;
                }

                /* Purple type can appear optically thinner than white at small sizes. */
                .trading-platform-showcase .showcase-execution-action .showcase-execution-label-secondary {
                    -webkit-text-stroke: 0.18px currentColor;
                }

                @media (min-width: 390px) {
                    .trading-platform-showcase .showcase-execution-action {
                        font-size: 9px !important;
                    }
                }

                @media (min-width: 640px) {
                    .trading-platform-showcase .showcase-execution-action {
                        font-size: 10px !important;
                    }
                }

                .trading-platform-showcase * {
                    min-width: 0;
                }

                .trading-platform-showcase ::-webkit-scrollbar {
                    height: 5px;
                }

                .trading-platform-showcase ::-webkit-scrollbar-thumb {
                    background: rgba(67, 51, 175, 0.28);
                    border-radius: 999px;
                }

                @media (max-width: 639px) {
                    .trading-platform-showcase .showcase-display {
                        font-size: clamp(1.85rem, 8.5vw, 2.3rem) !important;
                        line-height: 1.18 !important;
                        letter-spacing: -0.015em !important;
                    }

                    .trading-platform-showcase .showcase-execution-title {
                        font-size: clamp(0.95rem, 3.4vw, 1.8rem) !important;
                        line-height: 1.3 !important;
                        letter-spacing: -0.035em !important;
                    }

                    .trading-platform-showcase .showcase-section-title {
                        font-size: clamp(1.05rem, 5vw, 1.28rem) !important;
                        line-height: 1.35 !important;
                    }

                    .trading-platform-showcase p {
                        overflow-wrap: normal;
                        word-break: normal;
                    }
                }
            `}</style>
        </section>
    );
}
