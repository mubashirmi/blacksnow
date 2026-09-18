import {
    ArrowRight,
    BarChart3,
    Check,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    FilePen,
    Filter,
    Globe2,
    Landmark,
    LineChart,
    LockKeyhole,
    MessageSquare,
    Monitor,
    Newspaper,
    Rocket,
    Search,
    ShieldCheck,
    Target,
    TrendingUp,
    UserRound,
    Users,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

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
];

const audiences: Array<{ icon: LucideIcon; title: string; body: string }> = [
    { icon: UserRound, title: 'Beginner Traders', body: 'Learn the markets with paper trading, simple analytics, and guided tools built for new traders.' },
    { icon: BarChart3, title: 'Active Traders', body: 'Find opportunities faster, track multiple watchlists, and execute your strategies with confidence.' },
    { icon: Landmark, title: 'Investors', body: 'Make long-term decisions with global KPIs, market insights, and economic scenario modeling.' },
    { icon: Clock3, title: 'Day Traders', body: 'Monitor real-time market movers, set alerts, and act on high-probability opportunities.' },
    { icon: TrendingUp, title: 'Swing Traders', body: 'Use advanced screening and market analytics to identify strong trends and swing opportunities.' },
    { icon: Newspaper, title: 'Researchers', body: 'Access powerful data, economic indicators, and simulation tools to support deeper market research.' },
];

const workflow: Array<{ icon: LucideIcon; title: string; body: string }> = [
    { icon: Zap, title: 'Market Movers', body: "Spot what's moving right now" },
    { icon: Filter, title: 'Stock Screener', body: 'Find high-potential opportunities' },
    { icon: Search, title: 'Watchlist', body: 'Monitor and track your top picks' },
    { icon: Rocket, title: 'Paper Trading', body: 'Test your strategies risk-free' },
    { icon: LineChart, title: 'Economic Simulator', body: 'Model scenarios and plan ahead' },
    { icon: Target, title: 'Better Decisions', body: 'Execute with confidence and discipline' },
];

const products = [
    {
        id: 'newsletter',
        name: 'Newsletter',
        icon: Newspaper,
        monthly: 10,
        yearly: 50,
        description: 'Weekly premium market insights',
        href: '/',
        features: [
            'Weekly Stock Picks',
            'Macro Market Updates',
            'Latest Blog Articles',
            'Exclusive Financial Insights',
            'Portfolio Strategy Notes',
            'Market Data Briefings',
        ],
    },
    {
        id: 'invoice',
        name: 'Invoice & Contract',
        icon: FilePen,
        monthly: 25,
        yearly: 250,
        description: 'All-in-one contracts, signatures, and invoices—made simple',
        href: '/InvoiceContract',
        features: ['Instant Invoice Builder', 'Email Delivery', 'Invoice Dashboard', 'Create Invoice Contracts', 'Add Multiple Users', 'Recurring Invoices'],
    },
    {
        id: 'billboard',
        name: 'Digital Billboard',
        icon: Monitor,
        monthly: 150,
        yearly: 600,
        description: 'Premium advertising placement across our platform',
        href: '/advertising',
        features: [
            'Billboard Creator',
            'Email & SMS Share Buttons',
            'Lead Capture Form',
            'Create Invoice Contracts',
            'Add Multiple Users',
            'Create Up to 4 Billboards',
        ],
    },
    {
        id: 'crm',
        name: 'Email CRM',
        icon: MessageSquare,
        monthly: 500,
        yearly: 4000,
        description: 'Comprehensive communication platform for your business',
        href: '/emailMarketing',
        features: [
            'Email Campaigns & Automated Sequences',
            'SMS Campaigns & Sequences',
            'SMS Chatbot',
            'Email KPIs Dashboard',
            'Email Scheduling',
            'List Upload Tools',
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

function PricingSlider() {
    const [active, setActive] = useState(0);
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
    const product = products[active];
    const Icon = product.icon;
    const saving = useMemo(() => Math.round(((product.monthly * 12 - product.yearly) / (product.monthly * 12)) * 100), [product]);

    const previous = () => setActive((i) => (i - 1 + products.length) % products.length);
    const next = () => setActive((i) => (i + 1) % products.length);

    return (
        <div className='relative overflow-hidden rounded-2xl border border-[#2c7bbe]/25 bg-[#07111b]/86 shadow-[0_22px_60px_rgba(0,0,0,.35)]'>
            <div className='flex flex-col gap-4 border-b border-[#2c7bbe]/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7'>
                <div>
                    <p className='text-[11px] font-bold uppercase tracking-[.16em] text-[#4cc7e8]'>Product Pricing</p>
                    <p className='mt-1 text-sm text-white/55'>Swipe or use the arrows to compare products.</p>
                </div>
                <div className='inline-flex w-fit rounded-full border border-[#2c7bbe]/30 bg-[#050608] p-1'>
                    {(['monthly', 'yearly'] as const).map((item) => (
                        <button
                            key={item}
                            type='button'
                            onClick={() => setBilling(item)}
                            className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
                                billing === item ? 'bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white' : 'text-white/45'
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className='grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[1.45fr_.55fr] lg:px-9 lg:pb-9'>
                <div className='grid grid-cols-[56px_1fr] gap-4 sm:grid-cols-[84px_1fr] sm:gap-5'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-xl border border-[#4cc7e8]/30 bg-[#4cc7e8]/[.035] sm:h-20 sm:w-20 sm:rounded-2xl'>
                        <Icon className='h-6 w-6 text-[#4cc7e8] sm:h-9 sm:w-9' strokeWidth={1.6} />
                    </div>
                    <div>
                        <div className='flex flex-wrap items-center gap-3'>
                            <h3 className='showcase-subheading text-xl font-black text-white sm:text-2xl'>{product.name}</h3>
                            {billing === 'yearly' && saving > 0 && (
                                <span className='rounded-full border border-[#4cc7e8]/25 bg-[#4cc7e8]/[.06] px-3 py-1 text-[10px] font-bold text-[#4cc7e8]'>
                                    SAVE {saving}%
                                </span>
                            )}
                        </div>
                        <p className='mt-2 text-sm leading-6 text-white/58'>{product.description}</p>
                        <div className='mt-5 grid gap-2 sm:grid-cols-2'>
                            {product.features.map((feature) => (
                                <div key={feature} className='flex items-start gap-2 rounded-lg border border-[#2c7bbe]/12 bg-white/[.018] px-3 py-2'>
                                    <Check className='mt-0.5 h-4 w-4 shrink-0 text-[#4cc7e8]' />
                                    <span className='text-xs leading-5 text-white/72'>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='flex flex-col justify-center border-t border-[#2c7bbe]/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0'>
                    <p className='text-[10px] uppercase tracking-[.14em] text-white/40'>{billing === 'monthly' ? 'Monthly plan' : 'Annual plan'}</p>
                    <div className='mt-3 flex items-end gap-2'>
                        <span className='text-4xl font-black text-white sm:text-5xl'>${billing === 'monthly' ? product.monthly : product.yearly}</span>
                        <span className='pb-1 text-sm text-white/45'>/{billing === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    <Link
                        href={product.href}
                        className='mt-6 flex h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-sm font-black text-white transition hover:scale-[1.015]'
                    >
                        Get Started <ArrowRight className='h-4 w-4' />
                    </Link>
                    <div className='mt-4 flex items-center gap-2 text-[11px] text-white/42'>
                        <LockKeyhole className='h-4 w-4 text-[#4cc7e8]' />
                        Secure payments. Cancel anytime.
                    </div>
                </div>
            </div>

            <div className='flex items-center justify-between border-t border-[#2c7bbe]/15 px-5 py-4 sm:px-7 lg:hidden'>
                <button
                    type='button'
                    onClick={previous}
                    aria-label='Previous product'
                    className='flex h-10 w-10 items-center justify-center rounded-full border border-[#4cc7e8]/25 bg-[#050608]/90 text-[#4cc7e8]'
                >
                    <ChevronLeft className='h-5 w-5' />
                </button>
                <div className='flex items-center gap-2'>
                    {products.map((p, i) => (
                        <button
                            key={p.id}
                            type='button'
                            onClick={() => setActive(i)}
                            aria-label={`Show ${p.name}`}
                            className={`h-2 rounded-full transition-all ${i === active ? 'w-8 bg-[#4cc7e8]' : 'w-2 bg-[#2c7bbe]/40'}`}
                        />
                    ))}
                </div>
                <button
                    type='button'
                    onClick={next}
                    aria-label='Next product'
                    className='flex h-10 w-10 items-center justify-center rounded-full border border-[#4cc7e8]/25 bg-[#050608]/90 text-[#4cc7e8]'
                >
                    <ChevronRight className='h-5 w-5' />
                </button>
            </div>

            <div className='absolute bottom-5 right-6 hidden items-center gap-3 lg:flex'>
                <button
                    type='button'
                    onClick={previous}
                    aria-label='Previous product'
                    className='flex h-9 w-9 items-center justify-center rounded-full border border-[#4cc7e8]/25 text-[#4cc7e8]'
                >
                    <ChevronLeft className='h-4 w-4' />
                </button>
                <div className='flex gap-2'>
                    {products.map((p, i) => (
                        <button
                            key={p.id}
                            type='button'
                            onClick={() => setActive(i)}
                            aria-label={`Show ${p.name}`}
                            className={`h-2 rounded-full ${i === active ? 'w-7 bg-[#4cc7e8]' : 'w-2 bg-[#2c7bbe]/40'}`}
                        />
                    ))}
                </div>
                <button
                    type='button'
                    onClick={next}
                    aria-label='Next product'
                    className='flex h-9 w-9 items-center justify-center rounded-full border border-[#4cc7e8]/25 text-[#4cc7e8]'
                >
                    <ChevronRight className='h-4 w-4' />
                </button>
            </div>
        </div>
    );
}

export default function TradingPlatformShowcase() {
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
                            <Link
                                href='/signup'
                                className='flex min-h-12 items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-6 text-sm font-black text-white shadow-[0_0_30px_rgba(76,199,232,.16)]'
                            >
                                Start 30-Day Free Trial <ArrowRight className='h-4 w-4' />
                            </Link>
                            <a
                                href='#black-snow-tools'
                                className='flex min-h-12 items-center justify-center gap-3 rounded-lg border border-[#4cc7e8]/35 bg-[#050608]/60 px-6 text-sm font-bold text-white'
                            >
                                View Live Demo <Target className='h-4 w-4 text-[#4cc7e8]' />
                            </a>
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
                            <div className='grid grid-cols-2 gap-2 p-3 sm:gap-2.5 xl:grid-cols-3'>
                                <DashboardTile title='Market Movers' value='NVDA' change='+4.36%' type='list' id='d1' />
                                <DashboardTile title='Global KPI' value='5,278.63' change='+1.23%' type='line' id='d2' />
                                <DashboardTile title='Economic Simulator' value='+0.25%' change='+2.14%' type='line' id='d3' />
                                <DashboardTile title='Watchlist' value='AAPL' change='+1.92%' type='list' id='d4' />
                                <DashboardTile title='Paper Trading' value='$125,743.18' change='+8.75%' type='line' id='d5' />
                                <DashboardTile title='Stock Screener' value='128' change='Matches' type='bars' id='d6' />
                            </div>
                        </div>
                    </div>
                </div>

                <div id='black-snow-tools' className='mt-12 scroll-mt-24 sm:mt-16'>
                    <div className='flex items-center gap-4'>
                        <div className='h-px flex-1 bg-gradient-to-r from-transparent to-[#2c7bbe]/40' />
                        <div className='text-center'>
                            <h2 className='showcase-section-title text-[clamp(1.35rem,5vw,2rem)] font-black text-white'>
                                Six Powerful Tools. One Unified Platform.
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
                        <p className='mt-2 text-sm text-white/45'>A seamless workflow designed to help you make smarter, data-driven decisions.</p>
                    </div>
                    <div className='mt-6 grid gap-3 sm:mt-7 sm:flex sm:snap-x sm:snap-mandatory sm:gap-4 sm:overflow-x-auto sm:pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible'>
                        {workflow.map(({ icon: Icon, title, body }, index) => (
                            <div
                                key={title}
                                className='relative flex items-center gap-4 rounded-xl border border-[#2c7bbe]/18 bg-[#07101a]/42 px-4 py-3.5 text-left sm:block sm:min-w-[150px] sm:snap-start sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-center lg:min-w-0'
                            >
                                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#2c7bbe]/40 bg-[#07101a] sm:mx-auto sm:h-16 sm:w-16'>
                                    <Icon className='h-6 w-6 text-[#4cc7e8] sm:h-7 sm:w-7' strokeWidth={1.45} />
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[10px] font-black uppercase text-white sm:mt-3'>
                                        {index + 1}. {title}
                                    </p>
                                    <p className='mt-1 text-[11px] leading-4 text-white/45 sm:text-[10px]'>{body}</p>
                                </div>
                                {index < workflow.length - 1 && <ArrowRight className='absolute -right-3 top-6 hidden h-5 w-5 text-[#2c7bbe] lg:block' />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='mt-8 overflow-hidden rounded-xl border border-[#2c7bbe]/22 bg-[#07101a]/65'>
                    <div className='grid grid-cols-2 divide-x divide-y divide-[#2c7bbe]/15 md:grid-cols-5 md:divide-y-0'>
                        {[
                            [Users, '50K+', 'Active Traders'],
                            [TrendingUp, '6', 'Powerful Tools'],
                            [Globe2, '150+', 'Global Markets'],
                            [Clock3, '99.9%', 'Platform Uptime'],
                            [ShieldCheck, 'Bank-Level', 'Security'],
                        ].map(([Icon, value, label], index) => {
                            const I = Icon as LucideIcon;
                            return (
                                <div
                                    key={label as string}
                                    className={`flex min-h-[82px] items-center justify-center gap-3 px-3 ${index === 4 ? 'col-span-2 md:col-span-1' : ''}`}
                                >
                                    <I className='h-7 w-7 text-[#4cc7e8]' />
                                    <div>
                                        <p className='text-lg font-black text-[#4cc7e8]'>{value as string}</p>
                                        <p className='mt-1 text-[10px] text-white/45'>{label as string}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className='mt-8'>
                    <div className='mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
                        <div>
                            <h2 className='showcase-section-title text-[clamp(1.45rem,5vw,2.1rem)] font-black text-white'>
                                Simple Pricing.{' '}
                                <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Maximum Value.</span>
                            </h2>
                            <p className='mt-2 text-sm text-white/45'>Explore the products already available across Black Snow.</p>
                        </div>
                        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                            {['Flexible plans', 'Real-time updates', 'Secure access', 'Cancel anytime'].map((item) => (
                                <div key={item} className='flex items-center gap-2 text-xs text-white/65'>
                                    <Check className='h-4 w-4 text-[#4cc7e8]' />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <PricingSlider />
                </div>

                <div className='mt-7 flex flex-col gap-5 rounded-xl border border-[#2c7bbe]/25 bg-[#07101a]/72 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7'>
                    <div className='flex items-start gap-4 sm:items-center'>
                        <Rocket className='mt-0.5 h-9 w-9 shrink-0 text-[#4cc7e8] sm:mt-0 sm:h-10 sm:w-10' strokeWidth={1.35} />
                        <div>
                            <h3 className='showcase-subheading text-lg font-black text-white'>Ready to Take Control of the Markets?</h3>
                            <p className='mt-1 text-xs leading-5 text-white/45 sm:text-sm'>Join traders using Black Snow to gain an edge every day.</p>
                        </div>
                    </div>
                    <Link
                        href='/signup'
                        className='flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-7 text-sm font-black text-white sm:w-auto'
                    >
                        Start Your 30-Day Free Trial <ArrowRight className='h-4 w-4' />
                    </Link>
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
