import ComingSoonTrigger from '@/components/ComingSoonTrigger';
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

const CYAN = '#4cc7e8';
// const BLUE = '#2c7bbe';
// const BLUE_MID = '#2a8dcc';

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
        title: 'Market Moving Calendars',
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
        accent: '#72B83F',
        tag: 'Paper floor',
        details: [
            { title: 'Workflow', text: 'Build complete paper tickets with size, side, entries, exits, and risk controls.' },
            { title: 'Practice', text: 'Trade with virtual funds against realistic market movement without risking capital.' },
            { title: 'Review', text: 'Measure results, identify mistakes, and refine the strategy before going live.' },
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
        accent: '#E4AE25',
        tag: 'Screen builder',
        details: [
            { title: 'Screen', text: 'Filter thousands of stocks using fundamental, technical, valuation, and ownership criteria.' },
            { title: 'Compare', text: 'Bring the strongest matches side by side with the metrics that matter most.' },
            { title: 'Act', text: 'Save screens, create alerts, and move qualified opportunities into your watchlist.' },
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
        accent: '#F25A20',
        tag: 'Live watch',
        details: [
            { title: 'Track', text: 'Monitor favorite assets with live prices, compact charts, volume, and daily change.' },
            { title: 'Organize', text: 'Group assets by strategy, theme, sector, or conviction so the list stays actionable.' },
            { title: 'Alert', text: 'Set price, percentage, volume, and event alerts for the moves that matter.' },
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
        accent: '#E54848',
        tag: 'Live movers',
        details: [
            { title: 'Scan', text: 'Surface the strongest gainers, losers, unusual volume, and most active names in real time.' },
            { title: 'Drivers', text: 'Connect the move to catalysts, volume behavior, sector context, and market impact.' },
            { title: 'Action', text: 'Turn fast-moving market information into alerts and a focused next step.' },
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
        accent: '#1768FF',
        tag: 'Macro pulse',
        details: [
            { title: 'Monitor', text: 'Track the indicators that describe growth, satisfaction, efficiency, and market expansion.' },
            { title: 'Compare', text: 'Read performance across periods and markets without losing the global context.' },
            { title: 'Context', text: 'Use KPI movement to frame broader investment and operating decisions with better perspective.' },
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
        accent: '#7038D7',
        tag: 'Scenario lab',
        compactTitle: true,
        details: [
            { title: 'Build', text: 'Define sectors, agents, policies, and parameters inside a structured economic model.' },
            { title: 'Simulate', text: 'Run policy changes and external shocks across multiple scenarios and time horizons.' },
            { title: 'Analyze', text: 'Compare growth, inflation, unemployment, and debt outcomes before making decisions.' },
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
        accent: '#2C7BBE',
        tag: 'Research desk',
        details: [
            { title: 'Markets', text: 'Follow macro forces, rates, commodities, currencies, sectors, and global market themes.' },
            { title: 'Companies', text: 'Go deeper on fundamentals, valuation, estimates, earnings, and competitive positioning.' },
            { title: 'Events', text: 'Stay ahead of earnings, catalysts, corporate events, and the research that surrounds them.' },
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
        accent: '#E44786',
        tag: 'Event calendar',
        compactTitle: true,
        details: [
            { title: 'Economic', text: 'Track releases, central-bank decisions, employment, inflation, GDP, PMI, and more.' },
            { title: 'Earnings', text: 'Stay ahead of report dates, estimates, pre-market releases, and after-hours events.' },
            { title: 'Corporate', text: 'Follow dividends, ex-dates, IPOs, new listings, and other market-moving milestones.' },
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
                    <stop offset='0%' stopColor={CYAN} stopOpacity='.32' />
                    <stop offset='100%' stopColor={CYAN} stopOpacity='0' />
                </linearGradient>
            </defs>
            {[18, 42, 66].map((y) => (
                <line key={y} x1='0' y1={y} x2='220' y2={y} stroke='rgba(76,199,232,.08)' strokeDasharray='3 4' />
            ))}
            <path d='M0 72 L20 66 L38 72 L58 51 L78 57 L98 36 L118 47 L138 27 L158 39 L178 19 L198 30 L220 10 L220 90 L0 90 Z' fill={`url(#${id}-fill)`} />
            <polyline
                points='0,72 20,66 38,72 58,51 78,57 98,36 118,47 138,27 158,39 178,19 198,30 220,10'
                fill='none'
                stroke={CYAN}
                strokeWidth='2'
                vectorEffect='non-scaling-stroke'
            />
        </svg>
    );
}

function MiniBars() {
    return (
        <div className='flex h-20 items-end justify-center gap-2'>
            {[34, 52, 42, 77, 48, 88, 63].map((h, i) => (
                <div key={i} className='w-3 rounded-t-[2px] bg-gradient-to-t from-[#2c7bbe] to-[#4cc7e8]' style={{ height: `${h}%` }} />
            ))}
        </div>
    );
}

function MiniList() {
    return (
        <div className='space-y-2.5 py-2 text-[11px]'>
            {[
                ['AAPL', '193.42', '+1.92%'],
                ['MSFT', '415.65', '+1.21%'],
                ['NVDA', '1,037.21', '+4.36%'],
                ['TSLA', '248.56', '+2.87%'],
            ].map(([s, p, c]) => (
                <div key={s} className='grid grid-cols-[1fr_auto_auto] gap-3'>
                    <span className='font-semibold text-white'>{s}</span>
                    <span className='text-white/65'>{p}</span>
                    <span className='text-[#62db9b]'>{c}</span>
                </div>
            ))}
        </div>
    );
}

function Preview({ kind, id }: { kind: (typeof tools)[number]['kind']; id: string }) {
    if (kind === 'bars') return <MiniBars />;
    if (kind === 'list') return <MiniList />;
    if (kind === 'globe')
        return (
            <div className='relative flex h-20 items-center justify-center'>
                <Globe2 className='h-20 w-20 text-[#4cc7e8]/45' strokeWidth={0.8} />
                <span className='absolute left-[38%] top-[25%] h-2 w-2 rounded-full bg-[#4cc7e8] shadow-[0_0_15px_rgba(76,199,232,.9)]' />
                <span className='absolute right-[30%] top-[48%] h-2 w-2 rounded-full bg-[#4cc7e8] shadow-[0_0_15px_rgba(76,199,232,.9)]' />
            </div>
        );
    if (kind === 'curve') return <MiniLine id={`${id}-curve`} />;
    return <MiniLine id={id} />;
}

function DashboardTile({ title, value, change, type, id }: { title: string; value: string; change: string; type: 'line' | 'bars' | 'list'; id: string }) {
    return (
        <div className='rounded-xl border border-[#2c7bbe]/20 bg-[#050b12]/92 p-3'>
            <div className='flex items-center justify-between gap-2'>
                <p className='text-[9px] font-bold uppercase tracking-[.04em] text-[#4cc7e8]'>{title}</p>
                <TrendingUp className='h-3 w-3 text-[#4cc7e8]' />
            </div>
            <div className='mt-2 flex items-end justify-between gap-2'>
                <p className='text-sm font-bold text-white'>{value}</p>
                <p className='text-[9px] text-[#62db9b]'>{change}</p>
            </div>
            <div className='dashboard-tile-preview mt-1 hidden sm:block'>
                {type === 'bars' ? <MiniBars /> : type === 'list' ? <MiniList /> : <MiniLine id={id} />}
            </div>
        </div>
    );
}

function SimplePricingStrip() {
    const benefits = ['All 6 tools included', 'Real-time data & updates', 'Advanced analytics', 'Cancel anytime'];

    return (
        <div className='overflow-hidden rounded-xl border border-[#2c7bbe]/25 bg-[#07111b]/78 shadow-[0_18px_55px_rgba(0,0,0,.32)]'>
            <div className='grid md:grid-cols-2 xl:grid-cols-[1.45fr_1fr_1fr_1.05fr]'>
                <div className='border-b border-[#2c7bbe]/18 p-5 sm:p-6 md:border-r xl:border-b-0'>
                    <h2 className='showcase-section-title text-[clamp(1.1rem,4vw,1.6rem)] text-white'>Simple Pricing. Maximum Value.</h2>

                    <div className='mt-5 space-y-3'>
                        {benefits.map((item) => (
                            <div key={item} className='flex items-center gap-3 text-sm text-white/72'>
                                <Check className='h-5 w-5 shrink-0 text-[#4cc7e8]' strokeWidth={1.8} />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center border-b border-[#2c7bbe]/18 p-5 text-center sm:p-6 md:border-r xl:border-b-0'>
                    <p className='text-[11px] font-bold uppercase tracking-[.08em] text-white/78'>Monthly Plan</p>

                    <div className='mt-3 flex items-end justify-center gap-2'>
                        <span className='text-[clamp(2.25rem,8vw,3.05rem)] font-semibold leading-none text-white'>$49</span>
                        <span className='pb-1 text-sm text-white/72'>/month</span>
                    </div>

                    <ComingSoonTrigger
                        ariaLabel='Start monthly free trial'
                        className='mt-6 flex min-h-11 w-full max-w-[270px] items-center justify-center rounded-md bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-5 text-xs font-bold uppercase tracking-[.025em] text-[#031018] shadow-[0_0_24px_rgba(76,199,232,.12)] transition hover:brightness-110'
                    >
                        Start Free Trial
                    </ComingSoonTrigger>
                </div>

                <div className='flex flex-col items-center justify-center border-b border-[#2c7bbe]/18 p-5 text-center sm:p-6 md:border-b-0 md:border-r xl:border-b-0'>
                    <p className='text-[11px] font-bold uppercase tracking-[.08em] text-white/78'>Annual Plan</p>

                    <div className='mt-3 flex items-end justify-center gap-2'>
                        <span className='text-[clamp(2.25rem,8vw,3.05rem)] font-semibold leading-none text-white'>$499</span>
                        <span className='pb-1 text-sm text-white/72'>/year</span>
                    </div>

                    <p className='mt-2 text-[10px] text-white/55'>Save 15% with annual billing</p>

                    <ComingSoonTrigger
                        ariaLabel='Start annual free trial'
                        className='mt-5 flex min-h-11 w-full max-w-[270px] items-center justify-center rounded-md bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-5 text-xs font-bold uppercase tracking-[.025em] text-[#031018] shadow-[0_0_24px_rgba(76,199,232,.12)] transition hover:brightness-110'
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

                    <p className='mt-3 text-[10px] font-bold uppercase leading-5 tracking-[.08em] text-[#4cc7e8] sm:text-[11px]'>
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

function PreviewShell({ slide, children }: { slide: ExecutionSlide; children: ReactNode }) {
    return (
        <div className='relative min-h-[270px] overflow-hidden rounded-xl border border-white/[0.055] bg-black/10 p-4 sm:min-h-[320px] sm:p-5'>
            <div
                className='pointer-events-none absolute inset-0 opacity-70'
                style={{
                    background: `radial-gradient(circle at 58% 48%, ${slide.accent}16, transparent 52%)`,
                }}
            />
            <div className='relative z-10'>{children}</div>
        </div>
    );
}

function ExecutionPreview({ slide }: { slide: ExecutionSlide }) {
    const accent = slide.accent;

    if (slide.id === 'paper-trading') {
        return (
            <PreviewShell slide={slide}>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-[9px] uppercase tracking-[0.16em] text-white/35'>Paper Account</p>
                        <p className='mt-1 text-2xl font-semibold text-white'>$100,000.00</p>
                    </div>
                    <div className='text-right'>
                        <p className='text-[9px] uppercase tracking-[0.16em] text-white/35'>Day P&amp;L</p>
                        <p className='mt-1 text-sm font-semibold text-[#72B83F]'>+$1,250.00</p>
                    </div>
                </div>

                <div className='mt-5 grid grid-cols-2 gap-3'>
                    {[
                        ['Buying Power', '$100,000'],
                        ['Net Liq', '$100,000'],
                        ['Margin Used', '$0.00'],
                        ['Cash', '$100,000'],
                    ].map(([label, value]) => (
                        <div key={label} className='rounded-lg border border-white/[0.07] bg-white/[0.018] p-3'>
                            <p className='text-[9px] uppercase tracking-[0.1em] text-white/32'>{label}</p>
                            <p className='mt-1 text-xs font-semibold text-white/85'>{value}</p>
                        </div>
                    ))}
                </div>

                <div className='mt-5 rounded-lg border border-white/[0.07] bg-white/[0.018] p-3'>
                    <div className='flex items-center justify-between'>
                        <span className='text-[10px] font-semibold text-white/75'>Order Ticket</span>
                        <span className='rounded-full px-2 py-1 text-[9px]' style={{ color: accent, background: `${accent}14` }}>
                            PAPER
                        </span>
                    </div>
                    <div className='mt-3 grid grid-cols-3 gap-2 text-center'>
                        {[
                            ['Symbol', 'NVDA'],
                            ['Side', 'BUY'],
                            ['Qty', '25'],
                        ].map(([label, value]) => (
                            <div key={label} className='rounded-md border border-white/[0.06] px-2 py-2'>
                                <p className='text-[8px] uppercase text-white/30'>{label}</p>
                                <p className='mt-1 text-[10px] font-semibold text-white'>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </PreviewShell>
        );
    }

    if (slide.id === 'stock-screener') {
        return (
            <PreviewShell slide={slide}>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-[9px] uppercase tracking-[0.16em] text-white/35'>Screen Builder</p>
                        <p className='mt-1 text-lg font-semibold text-white'>Precision Filters</p>
                    </div>
                    <div className='text-right'>
                        <p className='text-[9px] uppercase text-white/30'>Matches</p>
                        <p className='mt-1 text-2xl font-semibold' style={{ color: accent }}>
                            248
                        </p>
                    </div>
                </div>

                <div className='mt-5 space-y-2'>
                    {[
                        ['Market Cap', 'Greater Than', '$2B'],
                        ['P/E Ratio', 'Less Than', '20'],
                        ['ROE', 'Greater Than', '15%'],
                        ['Revenue Growth', 'Greater Than', '10%'],
                        ['50-Day MA', 'Above', '200-Day MA'],
                    ].map(([metric, op, value]) => (
                        <div
                            key={metric}
                            className='grid grid-cols-[1.15fr_.9fr_.75fr] items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.018] px-3 py-2.5 text-[9px] sm:text-[10px]'
                        >
                            <span className='font-medium text-white/75'>{metric}</span>
                            <span className='text-white/38'>{op}</span>
                            <span className='text-right font-semibold' style={{ color: accent }}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </PreviewShell>
        );
    }

    if (slide.id === 'watchlist') {
        return (
            <PreviewShell slide={slide}>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-[9px] uppercase tracking-[0.16em] text-white/35'>My Watchlist</p>
                        <p className='mt-1 text-lg font-semibold text-white'>Live Monitoring</p>
                    </div>
                    <span className='rounded-full px-2.5 py-1 text-[9px]' style={{ color: accent, background: `${accent}14` }}>
                        24 ASSETS
                    </span>
                </div>

                <div className='mt-5 divide-y divide-white/[0.07] border-y border-white/[0.07]'>
                    {[
                        ['NVDA', 'NVIDIA', '$950.02', '+7.42%'],
                        ['AAPL', 'Apple', '$182.63', '+1.35%'],
                        ['MSFT', 'Microsoft', '$415.90', '+0.89%'],
                        ['TSLA', 'Tesla', '$173.24', '-0.72%'],
                        ['SPY', 'S&P 500 ETF', '$517.38', '+0.32%'],
                    ].map(([symbol, name, price, change]) => (
                        <div key={symbol} className='grid grid-cols-[.7fr_1.2fr_.85fr_.75fr] items-center gap-2 py-3 text-[9px] sm:text-[10px]'>
                            <span className='font-semibold text-white'>{symbol}</span>
                            <span className='truncate text-white/42'>{name}</span>
                            <span className='text-right text-white/72'>{price}</span>
                            <span className={`text-right font-semibold ${change.startsWith('-') ? 'text-[#ef6666]' : 'text-[#62db9b]'}`}>{change}</span>
                        </div>
                    ))}
                </div>
            </PreviewShell>
        );
    }

    if (slide.id === 'market-movers') {
        return (
            <PreviewShell slide={slide}>
                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <p className='text-[9px] uppercase tracking-[0.16em]' style={{ color: accent }}>
                            Top Gainers
                        </p>
                        <div className='mt-3 space-y-2'>
                            {[
                                ['NVDA', '+7.42%'],
                                ['AMD', '+6.21%'],
                                ['SMCI', '+5.18%'],
                            ].map(([symbol, change]) => (
                                <div
                                    key={symbol}
                                    className='flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.018] px-3 py-3'
                                >
                                    <span className='text-[10px] font-semibold text-white'>{symbol}</span>
                                    <span className='text-[10px] font-semibold text-[#62db9b]'>{change}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className='text-[9px] uppercase tracking-[0.16em] text-[#ef6666]'>Top Losers</p>
                        <div className='mt-3 space-y-2'>
                            {[
                                ['SPOT', '-4.21%'],
                                ['PYPL', '-3.18%'],
                                ['SNAP', '-2.89%'],
                            ].map(([symbol, change]) => (
                                <div
                                    key={symbol}
                                    className='flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.018] px-3 py-3'
                                >
                                    <span className='text-[10px] font-semibold text-white'>{symbol}</span>
                                    <span className='text-[10px] font-semibold text-[#ef6666]'>{change}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='mt-5 rounded-lg border border-white/[0.07] bg-white/[0.018] p-3'>
                    <div className='flex items-center justify-between'>
                        <span className='text-[9px] uppercase tracking-[0.14em] text-white/35'>Most Active</span>
                        <span className='text-[10px] font-semibold' style={{ color: accent }}>
                            TSLA
                        </span>
                    </div>
                    <p className='mt-2 text-xs text-white/65'>112.6M volume · options activity elevated</p>
                </div>
            </PreviewShell>
        );
    }

    if (slide.id === 'global-kpi') {
        return (
            <PreviewShell slide={slide}>
                <p className='text-[9px] uppercase tracking-[0.16em] text-white/35'>Performance Overview</p>

                <div className='mt-4 grid grid-cols-2 gap-3'>
                    {[
                        ['Revenue Growth', '$2.45B', '+18.6%'],
                        ['Customer Satisfaction', '92%', '+7%'],
                        ['Operational Efficiency', '87%', '+6%'],
                        ['New Markets', '24', '+4'],
                    ].map(([label, value, delta]) => (
                        <div key={label} className='rounded-lg border border-white/[0.06] bg-white/[0.018] p-3'>
                            <p className='text-[8px] uppercase leading-4 tracking-[0.08em] text-white/32'>{label}</p>
                            <div className='mt-2 flex items-end justify-between gap-2'>
                                <span className='text-lg font-semibold text-white'>{value}</span>
                                <span className='text-[9px] font-semibold text-[#62db9b]'>{delta}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='mt-5 space-y-3'>
                    {[
                        ['Process', 87],
                        ['Utilization', 82],
                        ['Quality', 91],
                    ].map(([label, value]) => (
                        <div key={label as string}>
                            <div className='flex items-center justify-between text-[9px]'>
                                <span className='text-white/48'>{label}</span>
                                <span className='font-semibold text-white/78'>{value}%</span>
                            </div>
                            <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]'>
                                <div className='h-full rounded-full' style={{ width: `${value}%`, background: accent }} />
                            </div>
                        </div>
                    ))}
                </div>
            </PreviewShell>
        );
    }

    if (slide.id === 'economic-simulator') {
        return (
            <PreviewShell slide={slide}>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-[9px] uppercase tracking-[0.16em] text-white/35'>Scenario Controls</p>
                        <p className='mt-1 text-lg font-semibold text-white'>Expansionary Policy</p>
                    </div>
                    <span className='rounded-full px-2.5 py-1 text-[9px]' style={{ color: accent, background: `${accent}14` }}>
                        10 YEARS
                    </span>
                </div>

                <div className='mt-5 grid grid-cols-2 gap-3'>
                    {[
                        ['Fiscal Stimulus', '2.0% GDP'],
                        ['Rate Change', '-1.00 pp'],
                        ['Inflation', '2.4%'],
                        ['Unemployment', '5.1%'],
                    ].map(([label, value]) => (
                        <div key={label} className='rounded-lg border border-white/[0.06] bg-white/[0.018] p-3'>
                            <p className='text-[8px] uppercase tracking-[0.08em] text-white/32'>{label}</p>
                            <p className='mt-2 text-sm font-semibold' style={{ color: accent }}>
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className='mt-5 rounded-lg border border-white/[0.07] bg-white/[0.018] p-3'>
                    <p className='text-[9px] uppercase tracking-[0.14em] text-white/35'>Model Structure</p>
                    <div className='mt-3 grid grid-cols-3 gap-2 text-center text-[9px]'>
                        {['Households', 'Markets', 'Central Bank'].map((item) => (
                            <div
                                key={item}
                                className='rounded-md border px-2 py-3'
                                style={{ borderColor: `${accent}36`, color: item === 'Markets' ? accent : 'rgba(255,255,255,.72)' }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </PreviewShell>
        );
    }

    if (slide.id === 'research') {
        return (
            <PreviewShell slide={slide}>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-[9px] uppercase tracking-[0.16em] text-white/35'>Market Research Snapshot</p>
                        <p className='mt-1 text-lg font-semibold text-white'>Latest Intelligence</p>
                    </div>
                    <span className='rounded-full px-2.5 py-1 text-[9px]' style={{ color: accent, background: `${accent}14` }}>
                        5 TOPICS
                    </span>
                </div>

                <div className='mt-5 divide-y divide-white/[0.07] border-y border-white/[0.07]'>
                    {[
                        ['U.S. Economy', 'Inflation cooling', 'Neutral'],
                        ['Global Markets', 'Growth resilient', 'Positive'],
                        ['Interest Rates', 'Cuts expected Q3', 'Neutral'],
                        ['Commodities', 'Supply tightness', 'Positive'],
                        ['Currencies', 'USD may moderate', 'Neutral'],
                    ].map(([topic, insight, outlook]) => (
                        <div key={topic} className='grid grid-cols-[1fr_1.25fr_.65fr] items-center gap-2 py-3 text-[9px] sm:text-[10px]'>
                            <span className='font-medium text-white/82'>{topic}</span>
                            <span className='truncate text-white/42'>{insight}</span>
                            <span className='text-right font-semibold' style={{ color: outlook === 'Positive' ? '#72B83F' : accent }}>
                                {outlook}
                            </span>
                        </div>
                    ))}
                </div>
            </PreviewShell>
        );
    }

    return (
        <PreviewShell slide={slide}>
            <div className='flex items-center justify-between'>
                <div>
                    <p className='text-[9px] uppercase tracking-[0.16em] text-white/35'>Upcoming Market Events</p>
                    <p className='mt-1 text-lg font-semibold text-white'>Calendar Snapshot</p>
                </div>
                <span className='rounded-full px-2.5 py-1 text-[9px]' style={{ color: accent, background: `${accent}14` }}>
                    TODAY
                </span>
            </div>

            <div className='mt-5 divide-y divide-white/[0.07] border-y border-white/[0.07]'>
                {[
                    ['May 16', 'Retail Sales (MoM)', 'HIGH'],
                    ['May 16', 'Industrial Production', 'MED'],
                    ['May 17', 'Building Permits', 'MED'],
                    ['May 17', 'Consumer Sentiment', 'HIGH'],
                    ['May 17', 'Fed Chair Powell', 'HIGH'],
                ].map(([date, event, impact]) => (
                    <div key={`${date}-${event}`} className='grid grid-cols-[.7fr_1.6fr_.55fr] items-center gap-2 py-3 text-[9px] sm:text-[10px]'>
                        <span className='text-white/42'>{date}</span>
                        <span className='truncate font-medium text-white/82'>{event}</span>
                        <span
                            className='rounded-full px-2 py-1 text-center text-[8px] font-semibold'
                            style={{
                                color: impact === 'HIGH' ? accent : 'rgba(255,255,255,.62)',
                                background: impact === 'HIGH' ? `${accent}12` : 'rgba(255,255,255,.035)',
                            }}
                        >
                            {impact}
                        </span>
                    </div>
                ))}
            </div>
        </PreviewShell>
    );
}

export default function TradingPlatformShowcase() {
    const [executionIndex, setExecutionIndex] = useState(0);
    const [executionDetailIndex, setExecutionDetailIndex] = useState(0);

    const activeExecutionSlide = executionSlides[executionIndex];
    const activeExecutionDetail = activeExecutionSlide.details[executionDetailIndex];

    useEffect(() => {
        const timer = window.setInterval(() => {
            setExecutionDetailIndex((current) => (current + 1) % activeExecutionSlide.details.length);
        }, 3600);

        return () => window.clearInterval(timer);
    }, [executionIndex, activeExecutionSlide.details.length]);

    const showExecutionSlide = (index: number) => {
        setExecutionIndex(index);
        setExecutionDetailIndex(0);
    };

    const previousExecutionSlide = () => {
        showExecutionSlide((executionIndex - 1 + executionSlides.length) % executionSlides.length);
    };

    const nextExecutionSlide = () => {
        showExecutionSlide((executionIndex + 1) % executionSlides.length);
    };

    return (
        <section className='trading-platform-showcase relative overflow-x-clip bg-[#050608] px-4 py-10 text-white sm:px-6 sm:py-16 md:px-8 lg:py-20'>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_6%,rgba(76,199,232,.08),transparent_24%),radial-gradient(circle_at_10%_42%,rgba(44,123,190,.07),transparent_30%),linear-gradient(180deg,#050608_0%,#07101a_48%,#050608_100%)]' />
            <div className='relative mx-auto max-w-[1180px]'>
                <div className='grid items-center gap-8 sm:gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-10'>
                    <div>
                        <div className='inline-flex max-w-full items-center gap-2 rounded-full border border-[#4cc7e8]/25 bg-[#4cc7e8]/[.045] px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] text-[#4cc7e8] sm:px-3.5 sm:text-[10px] sm:tracking-[.12em]'>
                            <Zap className='h-3.5 w-3.5' />
                            All-in-one trading intelligence platform
                        </div>
                        <h2 className='showcase-display mt-5 text-[clamp(1.5rem,8.5vw,2.3rem)] font-black leading-[1.15] tracking-[-.035em] text-white'>
                            Smarter Tools.
                            <br />
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#39a3cb] to-[#2c7bbe] bg-clip-text text-transparent'>Stronger</span>{' '}
                            Decisions.
                        </h2>
                        <p className='mt-4 max-w-xl text-sm leading-6 text-white/72 sm:mt-5 sm:text-base sm:leading-7'>
                            Black Snow gives you everything you need to analyze markets, test strategies, and stay ahead — all in one powerful dashboard.
                        </p>
                        <div className='mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row'>
                            <ComingSoonTrigger
                                ariaLabel='Start 30-day free trial'
                                className='flex min-h-12 items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-6 text-sm font-black text-white shadow-[0_0_30px_rgba(76,199,232,.16)]'
                            >
                                Start 30-Day Free Trial
                                <ArrowRight className='h-4 w-4' />
                            </ComingSoonTrigger>

                            <ComingSoonTrigger
                                ariaLabel='View live demo'
                                className='flex min-h-12 items-center justify-center gap-3 rounded-lg border border-[#4cc7e8]/35 bg-[#050608]/60 px-6 text-sm font-bold text-white'
                            >
                                View Live Demo
                                <Target className='h-4 w-4 text-[#4cc7e8]' />
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
                                        className='flex items-center gap-3 rounded-lg border border-[#2c7bbe]/14 bg-white/[.015] px-3 py-2.5 sm:border-0 sm:bg-transparent sm:p-0'
                                    >
                                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#4cc7e8]/25 sm:h-9 sm:w-9'>
                                            <I className='h-4 w-4 text-[#4cc7e8]' />
                                        </div>
                                        <p className='text-[11px] leading-4 text-white/65 sm:text-xs sm:leading-5'>{text as string}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='relative'>
                        <div className='absolute -inset-8 rounded-full bg-[#2c7bbe]/8 blur-3xl' />
                        <div className='relative overflow-hidden rounded-2xl border border-[#2c7bbe]/28 bg-[#050a11]/94 shadow-[0_25px_80px_rgba(0,0,0,.45),0_0_55px_rgba(44,123,190,.08)]'>
                            <div className='flex flex-col gap-3 border-b border-[#2c7bbe]/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
                                <div className='flex items-center gap-3'>
                                    <Image src='/logocolored.png' alt='Black Snow' width={34} height={34} className='h-8 w-8 object-contain' />
                                    <div>
                                        <p className='text-[10px] font-bold uppercase tracking-[.22em] text-white'>Black Snow</p>
                                        <p className='mt-0.5 text-[7px] uppercase tracking-[.13em] text-[#4cc7e8]'>Intelligence Platform</p>
                                    </div>
                                </div>
                                <div className='grid w-full grid-cols-2 gap-3 rounded-lg border border-[#2c7bbe]/12 bg-white/[.015] px-3 py-2 text-[8px] sm:flex sm:w-auto sm:gap-5 sm:border-0 sm:bg-transparent sm:p-0'>
                                    <div>
                                        <p className='text-white/35'>Account Value</p>
                                        <p className='mt-0.5 font-semibold text-white'>$125,743.18</p>
                                    </div>
                                    <div>
                                        <p className='text-white/35'>Today&apos;s P&amp;L</p>
                                        <p className='mt-0.5 font-semibold text-[#62db9b]'>+$3,218.42</p>
                                    </div>
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-2 p-3 sm:gap-2.5 xl:grid-cols-4'>
                                <DashboardTile title='Market Movers' value='NVDA' change='+4.36%' type='list' id='d1' />
                                <DashboardTile title='Global KPI' value='5,278.63' change='+1.23%' type='line' id='d2' />
                                <DashboardTile title='Economic Simulator' value='+0.25%' change='+2.14%' type='line' id='d3' />
                                <DashboardTile title='Watchlist' value='AAPL' change='+1.92%' type='list' id='d4' />
                                <DashboardTile title='Paper Trading' value='$125,743.18' change='+8.75%' type='line' id='d5' />
                                <DashboardTile title='Stock Screener' value='128' change='Matches' type='bars' id='d6' />
                                <DashboardTile title='Research' value='24 Reports' change='Updated' type='line' id='d7' />
                                <DashboardTile title='Market Calendars' value='8 Events' change='Today' type='bars' id='d8' />
                            </div>
                        </div>
                    </div>
                </div>

                <div id='black-snow-tools' className='mt-12 scroll-mt-24 sm:mt-16'>
                    <div className='flex items-center gap-4'>
                        <div className='h-px flex-1 bg-gradient-to-r from-transparent to-[#2c7bbe]/40' />
                        <div className='text-center'>
                            <h2 className='showcase-section-title text-[clamp(1.35rem,5vw,2rem)] font-black text-white'>
                                Eight Powerful Tools. One Unified Platform.
                            </h2>
                            <p className='mt-2 text-xs text-white/45 sm:text-sm'>Everything you need to research, simulate, and master the markets.</p>
                        </div>
                        <div className='h-px flex-1 bg-gradient-to-l from-transparent to-[#2c7bbe]/40' />
                    </div>
                    <div className='mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                        {tools.map((tool, index) => {
                            const Icon = tool.icon;
                            return (
                                <Link
                                    key={tool.title}
                                    href={tool.href}
                                    className='group grid overflow-hidden rounded-xl border border-[#2c7bbe]/20 bg-[#07101a]/72 transition hover:-translate-y-1 hover:border-[#4cc7e8]/45 sm:min-h-[190px] md:grid-cols-[1.07fr_.93fr]'
                                >
                                    <div className='flex flex-col p-4 sm:p-5'>
                                        <div className='flex items-center gap-3'>
                                            <Icon className='h-6 w-6 text-[#4cc7e8] sm:h-7 sm:w-7' strokeWidth={1.45} />
                                            <h3 className='showcase-subheading text-sm font-black uppercase tracking-[.02em] text-white'>{tool.title}</h3>
                                        </div>
                                        <p className='mt-3 text-xs leading-5 text-white/65 sm:text-sm sm:leading-6'>{tool.body}</p>
                                        <div className='mt-auto flex items-center gap-2 pt-4 text-[10px] font-bold uppercase tracking-[.04em] text-[#4cc7e8]'>
                                            Learn More <ArrowRight className='h-3.5 w-3.5' />
                                        </div>
                                    </div>
                                    <div className='hidden min-h-[125px] items-center justify-center border-t border-[#2c7bbe]/10 bg-[#050a11]/70 p-4 sm:flex md:border-l md:border-t-0'>
                                        <Preview kind={tool.kind} id={`tool-${index}`} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className='mt-9 rounded-2xl border border-[#2c7bbe]/28 bg-[#07101a]/50 p-4 sm:mt-12 sm:p-5'>
                    <div className='text-center'>
                        <h2 className='showcase-section-title text-[clamp(1.4rem,5vw,2rem)] font-black text-white'>Who Is Black Snow For?</h2>
                        <p className='mt-2 text-sm text-white/45'>Powerful tools for every type of market participant.</p>
                    </div>
                    <div className='mt-5 grid gap-3 sm:mt-6 sm:flex sm:snap-x sm:snap-mandatory sm:overflow-x-auto sm:pb-2 xl:grid xl:grid-cols-6 xl:overflow-visible'>
                        {audiences.map(({ icon: Icon, title, body }) => (
                            <article
                                key={title}
                                className='flex items-start gap-4 rounded-xl border border-[#2c7bbe]/25 bg-[#07101a]/62 px-4 py-4 text-left sm:block sm:min-w-[245px] sm:snap-start sm:py-5 sm:text-center xl:min-w-0'
                            >
                                <Icon className='h-9 w-9 shrink-0 text-[#4cc7e8] sm:mx-auto sm:h-10 sm:w-10' strokeWidth={1.35} />
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

                    <div className='relative mt-7 overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#090b0f]/95 shadow-[0_26px_80px_rgba(0,0,0,.42)] sm:mt-8'>
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
                                    <span className='truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-[11px]'>
                                        Black Snow
                                    </span>
                                </div>

                                <div className='text-[11px] font-medium tracking-[0.08em] text-white/36'>
                                    <span style={{ color: activeExecutionSlide.accent }}>{String(executionIndex + 1).padStart(2, '0')}</span>
                                    <span className='px-1.5'>/</span>
                                    <span>{String(executionSlides.length).padStart(2, '0')}</span>
                                </div>
                            </div>

                            <div className='mt-8 grid h-[610px] content-start gap-8 sm:h-[640px] lg:h-[360px] lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-10'>
                                <div className='min-w-0'>
                                    <h3
                                        className={`showcase-display uppercase leading-[1.02] tracking-[-0.04em] text-white ${
                                            activeExecutionSlide.compactTitle ? 'text-[clamp(1.75rem,6.8vw,3.65rem)]' : 'text-[clamp(2.1rem,8vw,4.65rem)]'
                                        }`}
                                    >
                                        {activeExecutionSlide.title}
                                    </h3>

                                    <p
                                        className='mt-3 text-[clamp(1rem,3.7vw,1.35rem)] font-medium leading-snug'
                                        style={{ color: activeExecutionSlide.accent }}
                                    >
                                        {activeExecutionSlide.subtitle}
                                    </p>

                                    <div className='mt-7 min-h-[118px] sm:mt-8'>
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
                                                        setExecutionDetailIndex(
                                                            (executionDetailIndex - 1 + activeExecutionSlide.details.length) %
                                                                activeExecutionSlide.details.length
                                                        )
                                                    }
                                                    className='flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:text-white'
                                                >
                                                    <ChevronLeft className='h-3.5 w-3.5' />
                                                </button>
                                                <button
                                                    type='button'
                                                    aria-label='Next content'
                                                    onClick={() => setExecutionDetailIndex((executionDetailIndex + 1) % activeExecutionSlide.details.length)}
                                                    className='flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:text-white'
                                                >
                                                    <ChevronRight className='h-3.5 w-3.5' />
                                                </button>
                                            </div>
                                        </div>

                                        <div className='mt-3'>
                                            <h4 className='showcase-subheading text-sm font-semibold uppercase tracking-[0.03em] text-white sm:text-base'>
                                                {activeExecutionDetail.title}
                                            </h4>
                                            <p className='mt-2 max-w-xl text-xs leading-5 text-white/68 sm:text-sm sm:leading-6'>
                                                {activeExecutionDetail.text}
                                            </p>
                                        </div>

                                        <div className='mt-5 flex max-w-[230px] gap-3'>
                                            {activeExecutionSlide.details.map((detail, index) => (
                                                <button
                                                    key={detail.title}
                                                    type='button'
                                                    aria-label={`Show ${detail.title}`}
                                                    onClick={() => setExecutionDetailIndex(index)}
                                                    className='h-[3px] flex-1 rounded-full bg-white/15 transition-all'
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

                            <div className='mt-7 flex flex-col gap-5 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between'>
                                <div className='grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[390px]'>
                                    <Link
                                        href={activeExecutionSlide.href}
                                        className='group flex h-10 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/18 px-2 text-[8px] font-semibold uppercase leading-none tracking-[0.04em] text-white transition hover:border-white/32 min-[390px]:text-[9px] sm:px-5 sm:text-[10px] sm:tracking-[0.08em]'
                                    >
                                        <span className='truncate text-[inherit] leading-none'>View {activeExecutionSlide.title}</span>
                                        <ArrowRight className='h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1' />
                                    </Link>

                                    <ComingSoonTrigger
                                        ariaLabel={`Get started with ${activeExecutionSlide.title}`}
                                        className='group flex h-10 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-2 text-[8px] font-semibold uppercase leading-none tracking-[0.04em] text-white transition hover:brightness-110 min-[390px]:text-[9px] sm:px-5 sm:text-[10px] sm:tracking-[0.08em]'
                                        style={{
                                            background: activeExecutionSlide.accent,
                                            boxShadow: `0 0 20px ${activeExecutionSlide.accent}30`,
                                        }}
                                    >
                                        <span className='text-[inherit] leading-none'>Get Started</span>
                                        <ArrowRight className='h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1' />
                                    </ComingSoonTrigger>
                                </div>

                                <div className='flex items-center justify-between gap-3 sm:justify-end'>
                                    <button
                                        type='button'
                                        onClick={previousExecutionSlide}
                                        aria-label='Previous tool'
                                        className='flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/25 hover:text-white'
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
                                                className='h-2.5 rounded-full transition-all duration-300'
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
                                        className='flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/25 hover:text-white'
                                    >
                                        <ChevronRight className='h-4 w-4' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-8'>
                    <SimplePricingStrip />
                </div>

                <div className='mt-7 flex flex-col gap-5 rounded-xl border border-[#2c7bbe]/25 bg-[#07101a]/72 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7'>
                    <div className='flex items-start gap-4 sm:items-center'>
                        <Rocket className='mt-0.5 h-9 w-9 shrink-0 text-[#4cc7e8] sm:mt-0 sm:h-10 sm:w-10' strokeWidth={1.35} />
                        <div>
                            <h3 className='showcase-subheading text-lg font-black text-white'>Ready to Take Control of the Markets?</h3>
                            <p className='mt-1 text-xs leading-5 text-white/45 sm:text-sm'>Join traders using Black Snow to gain an edge every day.</p>
                        </div>
                    </div>
                    <ComingSoonTrigger
                        ariaLabel='Start your 30-day free trial'
                        className='flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-7 text-sm font-black text-white sm:w-auto'
                    >
                        Start Your 30-Day Free Trial
                        <ArrowRight className='h-4 w-4' />
                    </ComingSoonTrigger>
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

                .trading-platform-showcase * {
                    min-width: 0;
                }

                .trading-platform-showcase ::-webkit-scrollbar {
                    height: 5px;
                }

                .trading-platform-showcase ::-webkit-scrollbar-thumb {
                    background: rgba(76, 199, 232, 0.28);
                    border-radius: 999px;
                }

                @media (max-width: 639px) {
                    .trading-platform-showcase .showcase-display {
                        font-size: clamp(1.85rem, 8.5vw, 2.3rem) !important;
                        line-height: 1.18 !important;
                        letter-spacing: -0.015em !important;
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
