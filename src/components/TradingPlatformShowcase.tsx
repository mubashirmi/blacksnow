import {
    ArrowRight,
    BarChart2,
    CalendarDays,
    Check,
    CheckCircle2,
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
import { useRouter } from 'next/router';
import { useMemo, useRef, useState } from 'react';

type BillingPeriod = 'monthly' | 'yearly';

type Product = {
    id: string;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    description: string;
    features: string[];
    icon: LucideIcon;
    redirectRoute: string;
};

type DashboardItem = {
    title: string;
    label: string;
    value: string;
    change?: string;
    positive?: boolean;
    type: 'line' | 'bars' | 'list';
};

const ACCENT = '#4cc7e8';
// const ACCENT_DARK = '#2c7bbe';
// const ACCENT_MID = '#2a8dcc';
// const BACKGROUND = '#050608';
// const PANEL = '#07101a';
// const PANEL_ALT = '#0B1320';

const products: Product[] = [
    {
        id: 'NewsLetter',
        name: 'Newsletter',
        monthlyPrice: 10,
        yearlyPrice: 50,
        description: 'Weekly premium market insights',
        features: [
            'Weekly Stock Picks',
            'Macro Market Updates',
            'Latest Blog Articles',
            'Exclusive Financial Insights',
            'Portfolio Strategy Notes',
            'Market Data Briefings',
        ],
        icon: Newspaper,
        redirectRoute: '/',
    },
    {
        id: 'InvoiceTool',
        name: 'Invoice & Contract',
        monthlyPrice: 25,
        yearlyPrice: 250,
        description: 'All-in-one contracts, signatures, and invoices—made simple',
        features: ['Instant Invoice Builder', 'Email Delivery', 'Invoice Dashboard', 'Create Invoice Contracts', 'Add Multiple Users', 'Recurring Invoices'],
        icon: FilePen,
        redirectRoute: '/InvoiceContract',
    },
    {
        id: 'DigitalBillboard',
        name: 'Digital Billboard',
        monthlyPrice: 150,
        yearlyPrice: 600,
        description: 'Premium advertising placement across our platform',
        features: [
            'Billboard Creator',
            'Email & SMS Share Buttons',
            'Lead Capture Form',
            'Create Invoice Contracts',
            'Add Multiple Users',
            'Create Up to 4 Billboards',
        ],
        icon: Monitor,
        redirectRoute: '/advertising',
    },
    {
        id: 'Sales',
        name: 'Email CRM',
        monthlyPrice: 500,
        yearlyPrice: 4000,
        description: 'Comprehensive communication platform for your business',
        features: [
            'Email Campaigns & Automated Sequences',
            'SMS Campaigns & Sequences',
            'SMS Chatbot',
            'Email KPIs Dashboard',
            'Email Scheduling',
            'List Upload Tools',
        ],
        icon: MessageSquare,
        redirectRoute: '/emailMarketing',
    },
];

const dashboardItems: DashboardItem[] = [
    {
        title: 'Market Movers',
        label: 'Top Gainers',
        value: 'NVDA',
        change: '+4.36%',
        positive: true,
        type: 'list',
    },
    {
        title: 'Global KPI',
        label: 'S&P 500',
        value: '5,278.63',
        change: '+1.23%',
        positive: true,
        type: 'line',
    },
    {
        title: 'Economic Simulator',
        label: 'Interest Rate Change',
        value: '+0.25%',
        change: '+2.14%',
        positive: true,
        type: 'line',
    },
    {
        title: 'Watchlist',
        label: 'AAPL',
        value: '190.42',
        change: '+1.92%',
        positive: true,
        type: 'list',
    },
    {
        title: 'Paper Trading',
        label: 'Account Value',
        value: '$125,743.18',
        change: '+8.75%',
        positive: true,
        type: 'line',
    },
    {
        title: 'Stock Screener',
        label: 'Results',
        value: '128',
        change: 'Matches',
        positive: true,
        type: 'bars',
    },
];

const platformTools: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
    route: string;
    preview: 'line' | 'bars' | 'list' | 'globe' | 'curves';
}> = [
    {
        icon: Rocket,
        title: 'Paper Trading',
        description: 'Trade with virtual money in real market conditions. Practice, test, and perfect your strategy risk-free.',
        route: '/paper-trading',
        preview: 'line',
    },
    {
        icon: Filter,
        title: 'Stock Screener',
        description: 'Find the best opportunities faster with advanced filters and real-time data across thousands of stocks.',
        route: '/stock-screener',
        preview: 'bars',
    },
    {
        icon: Search,
        title: 'Watchlist',
        description: 'Track the stocks that matter most to you. Customize, organize, and stay updated in real time.',
        route: '/watchlist',
        preview: 'list',
    },
    {
        icon: Zap,
        title: 'Market Movers',
        description: 'Stay ahead of the market with live updates on top gainers, losers, and volatile stocks right now.',
        route: '/market-movers',
        preview: 'bars',
    },
    {
        icon: Globe2,
        title: 'Global KPI',
        description: 'Track key global economic indicators and market benchmarks that impact your investments.',
        route: '/global-kpi',
        preview: 'globe',
    },
    {
        icon: TrendingUp,
        title: 'Economic Simulator',
        description: 'Model economic scenarios and see how changes in key variables could impact the markets.',
        route: '/economic-simulator',
        preview: 'curves',
    },
];

const audiences: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
}> = [
    {
        icon: UserRound,
        title: 'Beginner Traders',
        description: 'Learn the markets with paper trading, simple analytics, and guided tools built for new traders.',
    },
    {
        icon: BarChart2,
        title: 'Active Traders',
        description: 'Find opportunities faster, track multiple watchlists, and execute your strategies with confidence.',
    },
    {
        icon: Landmark,
        title: 'Investors',
        description: 'Make long-term decisions with global KPIs, market insights, and economic scenario modeling.',
    },
    {
        icon: Clock3,
        title: 'Day Traders',
        description: 'Monitor real-time market movers, set alerts, and act on high-probability opportunities.',
    },
    {
        icon: TrendingUp,
        title: 'Swing Traders',
        description: 'Use advanced screening and market analytics to identify strong trends and swing opportunities.',
    },
    {
        icon: Newspaper,
        title: 'Researchers',
        description: 'Access powerful data, economic indicators, and simulation tools to support deeper market research.',
    },
];

const workflow: Array<{
    icon: LucideIcon;
    number: string;
    title: string;
    description: string;
}> = [
    {
        icon: Zap,
        number: '1',
        title: 'Market Movers',
        description: "Spot what's moving right now",
    },
    {
        icon: Filter,
        number: '2',
        title: 'Stock Screener',
        description: 'Find high-potential opportunities',
    },
    {
        icon: Search,
        number: '3',
        title: 'Watchlist',
        description: 'Monitor and track your top picks',
    },
    {
        icon: Rocket,
        number: '4',
        title: 'Paper Trading',
        description: 'Test your strategies risk-free',
    },
    {
        icon: LineChart,
        number: '5',
        title: 'Economic Simulator',
        description: 'Model scenarios and plan ahead',
    },
    {
        icon: Target,
        number: '6',
        title: 'Better Decisions',
        description: 'Execute with confidence and discipline',
    },
];

function MiniLineChart({ id, compact = false }: { id: string; compact?: boolean }) {
    return (
        <svg viewBox='0 0 220 100' className={compact ? 'h-[54px] w-full' : 'h-[82px] w-full'} preserveAspectRatio='none' aria-hidden='true'>
            <defs>
                <linearGradient id={`${id}-area`} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor={ACCENT} stopOpacity='0.32' />
                    <stop offset='100%' stopColor={ACCENT} stopOpacity='0' />
                </linearGradient>

                <filter id={`${id}-glow`}>
                    <feGaussianBlur stdDeviation='2' result='blur' />
                    <feMerge>
                        <feMergeNode in='blur' />
                        <feMergeNode in='SourceGraphic' />
                    </feMerge>
                </filter>
            </defs>

            {[20, 45, 70].map((y) => (
                <line key={y} x1='0' y1={y} x2='220' y2={y} stroke='rgba(76,199,232,0.07)' strokeDasharray='2 4' />
            ))}

            <path
                d='M0 80 L18 72 L32 78 L47 58 L62 66 L77 43 L92 54 L108 37 L123 48 L139 29 L154 41 L169 22 L184 34 L200 14 L220 20 L220 100 L0 100 Z'
                fill={`url(#${id}-area)`}
            />

            <path
                d='M0 80 L18 72 L32 78 L47 58 L62 66 L77 43 L92 54 L108 37 L123 48 L139 29 L154 41 L169 22 L184 34 L200 14 L220 20'
                fill='none'
                stroke={ACCENT}
                strokeWidth='2'
                vectorEffect='non-scaling-stroke'
                filter={`url(#${id}-glow)`}
            />
        </svg>
    );
}

function MiniBars() {
    const bars = [28, 52, 38, 74, 45, 86, 63];

    return (
        <div className='flex h-[72px] items-end justify-center gap-2 px-3'>
            {bars.map((height, index) => (
                <div
                    key={index}
                    className='w-[10px] rounded-t-[2px] bg-gradient-to-t from-[#2c7bbe] to-[#4cc7e8] shadow-[0_0_12px_rgba(76,199,232,0.22)]'
                    style={{ height: `${height}%` }}
                />
            ))}
        </div>
    );
}

function MiniStockList() {
    return (
        <div className='space-y-2.5 px-1 py-1'>
            {[
                ['AAPL', '193.42', '+1.92%'],
                ['MSFT', '415.65', '+1.21%'],
                ['NVDA', '1,037.21', '+4.36%'],
                ['TSLA', '248.56', '+2.87%'],
            ].map(([symbol, price, change]) => (
                <div key={symbol} className='grid grid-cols-[1fr_auto_auto] items-center gap-3 text-[10px]'>
                    <span className='font-semibold text-white'>{symbol}</span>

                    <span className='text-white/65'>{price}</span>

                    <span className='text-[#5EDC7A]'>{change}</span>
                </div>
            ))}
        </div>
    );
}

function MiniGlobe() {
    return (
        <div className='relative flex h-[78px] items-center justify-center overflow-hidden'>
            <Globe2 className='h-[72px] w-[72px] text-[#2c7bbe]/45' strokeWidth={0.8} />

            {[
                ['31%', '28%'],
                ['55%', '43%'],
                ['67%', '63%'],
                ['40%', '68%'],
            ].map(([left, top], index) => (
                <span
                    key={index}
                    className='absolute h-2 w-2 rounded-full bg-[#4cc7e8] shadow-[0_0_12px_rgba(76,199,232,0.9)]'
                    style={{
                        left,
                        top,
                    }}
                />
            ))}
        </div>
    );
}

function CurvePreview() {
    return (
        <svg viewBox='0 0 220 85' className='h-[75px] w-full' preserveAspectRatio='none' aria-hidden='true'>
            {[22, 45, 68].map((y) => (
                <line key={y} x1='0' y1={y} x2='220' y2={y} stroke='rgba(76,199,232,0.07)' />
            ))}

            <path d='M0 70 C42 65, 76 54, 105 43 C140 29, 170 18, 220 7' fill='none' stroke='#4cc7e8' strokeWidth='2' />

            <path d='M0 68 C45 67, 84 62, 119 50 C158 36, 180 25, 220 18' fill='none' stroke='#2c7bbe' strokeWidth='2' />
        </svg>
    );
}

function ToolPreview({ type, id }: { type: 'line' | 'bars' | 'list' | 'globe' | 'curves'; id: string }) {
    if (type === 'bars') {
        return <MiniBars />;
    }

    if (type === 'list') {
        return <MiniStockList />;
    }

    if (type === 'globe') {
        return <MiniGlobe />;
    }

    if (type === 'curves') {
        return <CurvePreview />;
    }

    return <MiniLineChart id={id} />;
}

function DashboardTile({ item, index }: { item: DashboardItem; index: number }) {
    return (
        <div className='relative min-w-0 overflow-hidden rounded-xl border border-[#2c7bbe]/20 bg-[#050a11]/85 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]'>
            <div className='pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#4cc7e8]/30 to-transparent' />

            <div className='flex items-center justify-between gap-2'>
                <p className='truncate text-[8px] font-bold uppercase tracking-[0.06em] text-[#4cc7e8] sm:text-[9px]'>{item.title}</p>

                <TrendingUp className='h-3 w-3 shrink-0 text-[#4cc7e8]' />
            </div>

            <div className='mt-3'>
                <p className='text-[8px] text-white/45'>{item.label}</p>

                <div className='mt-1 flex flex-wrap items-end justify-between gap-2'>
                    <p className='text-[14px] font-bold text-white sm:text-[16px]'>{item.value}</p>

                    {item.change && <p className={`text-[9px] ${item.positive ? 'text-[#5EDC7A]' : 'text-red-400'}`}>{item.change}</p>}
                </div>
            </div>

            <div className='mt-2'>
                {item.type === 'line' && <MiniLineChart id={`dashboard-${index}`} compact />}

                {item.type === 'bars' && <MiniBars />}

                {item.type === 'list' && (
                    <div className='mt-2 space-y-1.5'>
                        {['NVDA', 'META', 'TSLA', 'AMZN'].map((symbol, rowIndex) => (
                            <div key={symbol} className='flex items-center justify-between text-[8px]'>
                                <span className='text-white/65'>{symbol}</span>

                                <span className='text-[#5EDC7A]'>+{(4.36 - rowIndex * 0.49).toFixed(2)}%</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Benefit({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
    return (
        <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#4cc7e8]/25 bg-[#4cc7e8]/[0.04]'>
                <Icon className='h-4 w-4 text-[#4cc7e8]' />
            </div>

            <p className='text-xs leading-5 text-gray-300'>{title}</p>
        </div>
    );
}

function ToolCard({
    icon: Icon,
    title,
    description,
    route,
    preview,
    index,
}: (typeof platformTools)[number] & {
    index: number;
}) {
    return (
        <Link
            href={route}
            className='group relative grid min-h-[205px] overflow-hidden rounded-2xl border border-[#2c7bbe]/20 bg-[#07101a]/70 transition-all duration-300 hover:-translate-y-1 hover:border-[#4cc7e8]/45 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35),0_0_30px_rgba(76,199,232,0.07)] md:grid-cols-[1.08fr_.92fr]'
        >
            <div className='relative z-10 flex flex-col p-5 sm:p-6'>
                <div className='flex items-center gap-3'>
                    <Icon className='h-7 w-7 text-[#4cc7e8]' strokeWidth={1.5} />

                    <h3 className='text-[15px] font-black uppercase tracking-[0.02em] text-white'>{title}</h3>
                </div>

                <p className='mt-4 text-sm leading-6 text-gray-300'>{description}</p>

                <div className='mt-auto flex items-center gap-2 pt-5 text-[11px] font-bold uppercase tracking-[0.04em] text-[#4cc7e8]'>
                    Learn More
                    <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5' />
                </div>
            </div>

            <div className='relative flex min-h-[140px] items-center justify-center border-t border-[#2c7bbe]/10 bg-[#050a11]/60 p-5 md:border-l md:border-t-0'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,199,232,0.07),transparent_70%)]' />

                <div className='relative w-full'>
                    <ToolPreview type={preview} id={`tool-preview-${index}`} />
                </div>
            </div>
        </Link>
    );
}

function PersonaCard({ icon: Icon, title, description }: (typeof audiences)[number]) {
    return (
        <div className='group relative flex min-h-[240px] flex-col items-center rounded-xl border border-[#2c7bbe]/25 bg-[#07101a]/60 px-4 py-6 text-center transition-all duration-300 hover:border-[#4cc7e8]/45 hover:bg-[#0a1420]'>
            <div className='flex h-14 w-14 items-center justify-center'>
                <Icon className='h-11 w-11 text-[#4cc7e8]' strokeWidth={1.35} />
            </div>

            <h3 className='mt-4 text-[13px] font-black uppercase text-white'>{title}</h3>

            <p className='mt-3 text-xs leading-[1.65] text-gray-300'>{description}</p>
        </div>
    );
}

function WorkflowItem({ item, index }: { item: (typeof workflow)[number]; index: number }) {
    const Icon = item.icon;

    return (
        <div className='relative flex min-w-0 flex-col items-center text-center'>
            <div
                className={`relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full border bg-[#07101a] shadow-[0_0_25px_rgba(76,199,232,0.08)] ${
                    index === workflow.length - 1 ? 'border-[#4cc7e8]/70' : 'border-[#2c7bbe]/40'
                }`}
            >
                <Icon className='h-8 w-8 text-[#4cc7e8]' strokeWidth={1.5} />
            </div>

            <p className='mt-4 text-[11px] font-black uppercase leading-5 text-white'>
                {item.number}. {item.title}
            </p>

            <p className='mt-1.5 max-w-[150px] text-[10px] leading-4 text-gray-400'>{item.description}</p>

            {index !== workflow.length - 1 && <ArrowRight className='absolute -right-4 top-7 hidden h-6 w-6 text-[#2c7bbe] lg:block' />}
        </div>
    );
}

function StatCard({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
    return (
        <div className='flex min-h-[88px] items-center justify-center gap-4 px-4'>
            <Icon className='h-8 w-8 shrink-0 text-[#4cc7e8]' strokeWidth={1.35} />

            <div>
                <p className='text-2xl font-black text-[#4cc7e8]'>{value}</p>

                <p className='mt-1 text-[10px] text-gray-400'>{label}</p>
            </div>
        </div>
    );
}

function PricingSlider() {
    const router = useRouter();

    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
    const [activeIndex, setActiveIndex] = useState(0);

    const touchStart = useRef<number | null>(null);

    const activeProduct = products[activeIndex];
    // const ProductIcon = activeProduct.icon;
    // eslint-disable-next-line
    const savings = useMemo(() => {
        const monthlyAnnual = activeProduct.monthlyPrice * 12;

        return Math.round(((monthlyAnnual - activeProduct.yearlyPrice) / monthlyAnnual) * 100);
    }, [activeProduct]);

    const next = () => {
        setActiveIndex((current) => (current === products.length - 1 ? 0 : current + 1));
    };

    const previous = () => {
        setActiveIndex((current) => (current === 0 ? products.length - 1 : current - 1));
    };
    // eslint-disable-next-line
    const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        touchStart.current = event.changedTouches[0]?.clientX ?? null;
    };
    // eslint-disable-next-line
    const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStart.current === null) {
            return;
        }

        const end = event.changedTouches[0]?.clientX ?? touchStart.current;

        const difference = touchStart.current - end;

        if (Math.abs(difference) > 45) {
            if (difference > 0) {
                next();
            } else {
                previous();
            }
        }

        touchStart.current = null;
    };
    // eslint-disable-next-line
    const displayedPrice = billingPeriod === 'monthly' ? activeProduct.monthlyPrice : activeProduct.yearlyPrice;

    return (
        <div className='relative overflow-hidden rounded-2xl border border-[#2c7bbe]/25 bg-[#07101a]/75 shadow-[0_18px_60px_rgba(0,0,0,0.3)]'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_72%_0%,rgba(76,199,232,0.08),transparent_35%)]' />

            <div className='relative border-b border-[#2c7bbe]/15 px-5 py-4 sm:px-7'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <p className='text-xs font-bold uppercase tracking-[0.16em] text-[#4cc7e8]'>Product Pricing</p>

                        <p className='mt-1 text-sm text-gray-400'>Choose the product and billing period that works for you.</p>
                    </div>

                    <div className='inline-flex w-fit items-center rounded-full border border-[#2c7bbe]/30 bg-[#050608] p-1'>
                        <button
                            type='button'
                            onClick={() => setBillingPeriod('monthly')}
                            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                                billingPeriod === 'monthly' ? 'bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white' : 'text-gray-400'
                            }`}
                        >
                            Monthly
                        </button>

                        <button
                            type='button'
                            onClick={() => setBillingPeriod('yearly')}
                            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                                billingPeriod === 'yearly' ? 'bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white' : 'text-gray-400'
                            }`}
                        >
                            Yearly
                        </button>
                    </div>
                </div>
            </div>

            <div className='relative overflow-hidden' onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <div
                    className='flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
                    style={{
                        transform: `translateX(-${activeIndex * 100}%)`,
                    }}
                >
                    {products.map((product) => {
                        const Icon = product.icon;

                        const productSavings = Math.round(((product.monthlyPrice * 12 - product.yearlyPrice) / (product.monthlyPrice * 12)) * 100);

                        const price = billingPeriod === 'monthly' ? product.monthlyPrice : product.yearlyPrice;

                        return (
                            <div key={product.id} className='w-full min-w-full shrink-0'>
                                <div className='grid min-h-[360px] gap-7 px-5 pb-20 pt-7 sm:px-7 lg:grid-cols-[1.35fr_.65fr] lg:px-10 lg:py-9'>
                                    <div className='grid gap-5 sm:grid-cols-[82px_minmax(0,1fr)]'>
                                        <div className='flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-[#4cc7e8]/30 bg-[#4cc7e8]/[0.035] shadow-[0_0_28px_rgba(76,199,232,0.10)]'>
                                            <Icon className='h-8 w-8 text-[#4cc7e8]' strokeWidth={1.6} />
                                        </div>

                                        <div className='min-w-0'>
                                            <div className='flex flex-wrap items-center gap-3'>
                                                <h3 className='text-xl font-black text-white sm:text-2xl'>{product.name}</h3>

                                                {billingPeriod === 'yearly' && productSavings > 0 && (
                                                    <span className='rounded-full border border-[#4cc7e8]/25 bg-[#4cc7e8]/[0.06] px-3 py-1 text-[10px] font-bold text-[#4cc7e8]'>
                                                        SAVE {productSavings}%
                                                    </span>
                                                )}
                                            </div>

                                            <p className='mt-2 text-sm leading-6 text-gray-400'>{product.description}</p>

                                            <div className='mt-5 grid gap-2 sm:grid-cols-2'>
                                                {product.features.map((feature) => (
                                                    <div
                                                        key={feature}
                                                        className='flex items-start gap-2 rounded-lg border border-[#2c7bbe]/12 bg-white/[0.018] px-3 py-2'
                                                    >
                                                        <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-[#4cc7e8]' />

                                                        <span className='text-xs leading-5 text-gray-300'>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex flex-col justify-center border-t border-[#2c7bbe]/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0'>
                                        <p className='text-xs uppercase tracking-[0.12em] text-gray-500'>
                                            {billingPeriod === 'monthly' ? 'Monthly plan' : 'Annual plan'}
                                        </p>

                                        <div className='mt-3 flex items-end gap-2'>
                                            <span className='text-4xl font-black tracking-tight text-white sm:text-5xl'>${price}</span>

                                            <span className='pb-1 text-sm text-gray-400'>/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                                        </div>

                                        {billingPeriod === 'yearly' && productSavings > 0 && (
                                            <p className='mt-3 text-xs font-semibold text-[#4cc7e8]'>Save {productSavings}% with annual billing</p>
                                        )}

                                        <button
                                            type='button'
                                            onClick={() => router.push(product.redirectRoute)}
                                            className='mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-sm font-black text-white shadow-[0_0_28px_rgba(76,199,232,0.18)] transition-all duration-300 hover:scale-[1.015] hover:from-[#4cc7e8] hover:to-[#2c7bbe]'
                                        >
                                            Get Started
                                            <ArrowRight className='h-4 w-4' />
                                        </button>

                                        <div className='mt-4 flex items-center gap-2 text-[11px] text-gray-500'>
                                            <LockKeyhole className='h-4 w-4 text-[#4cc7e8]' />
                                            Secure payments. Cancel anytime.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className='absolute inset-x-5 bottom-5 flex items-center justify-between sm:inset-x-7'>
                    <button
                        type='button'
                        onClick={previous}
                        className='flex h-10 w-10 items-center justify-center rounded-full border border-[#4cc7e8]/25 bg-[#050608]/90 text-[#4cc7e8] transition-all hover:border-[#4cc7e8]/60'
                        aria-label='Previous pricing product'
                    >
                        <ChevronLeft className='h-5 w-5' />
                    </button>

                    <div className='flex items-center gap-2'>
                        {products.map((product, index) => (
                            <button
                                key={product.id}
                                type='button'
                                onClick={() => setActiveIndex(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-[#4cc7e8]' : 'w-2 bg-[#2c7bbe]/40'}`}
                                aria-label={`Show ${product.name}`}
                            />
                        ))}
                    </div>

                    <button
                        type='button'
                        onClick={next}
                        className='flex h-10 w-10 items-center justify-center rounded-full border border-[#4cc7e8]/25 bg-[#050608]/90 text-[#4cc7e8] transition-all hover:border-[#4cc7e8]/60'
                        aria-label='Next pricing product'
                    >
                        <ChevronRight className='h-5 w-5' />
                    </button>
                </div>
            </div>
        </div>
    );
}

export function TradingPlatformShowcase() {
    return (
        <section className='relative overflow-hidden bg-[#050608] px-4 py-14 text-white sm:px-6 sm:py-20 md:px-8'>
            {/* Background */}
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_7%,rgba(76,199,232,0.08),transparent_25%),radial-gradient(circle_at_15%_44%,rgba(44,123,190,0.06),transparent_28%),linear-gradient(180deg,#050608_0%,#07101a_45%,#050608_100%)]' />

            <div
                className='pointer-events-none absolute inset-0 opacity-[0.03]'
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(76,199,232,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(76,199,232,0.22) 1px, transparent 1px)',
                    backgroundSize: '54px 54px',
                }}
            />

            <div className='relative z-10 mx-auto max-w-[1380px]'>
                {/* ─────────────────────────────────────
                    HERO / UNIFIED DASHBOARD
                ───────────────────────────────────── */}
                <div className='grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12'>
                    <div>
                        <div className='inline-flex items-center gap-2 rounded-full border border-[#4cc7e8]/25 bg-[#4cc7e8]/[0.045] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4cc7e8]'>
                            <Zap className='h-3.5 w-3.5' />
                            All-in-one trading intelligence platform
                        </div>

                        <h2 className='mt-6 text-[clamp(2rem,7vw,3.35rem)] font-black leading-[1.08] tracking-tight text-white'>
                            Smarter Tools.
                            <br />
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2a8dcc] to-[#2c7bbe] bg-clip-text text-transparent'>Stronger</span>{' '}
                            Decisions.
                        </h2>

                        <p className='mt-5 max-w-xl text-sm leading-7 text-gray-300 sm:text-base'>
                            Black Snow gives you everything you need to analyze markets, test strategies, and stay ahead — all in one powerful dashboard.
                        </p>

                        <div className='mt-7 flex flex-col gap-3 sm:flex-row'>
                            <Link
                                href='/signup'
                                className='group flex h-13 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-7 text-sm font-black text-white shadow-[0_0_30px_rgba(76,199,232,0.18)] transition-all duration-300 hover:scale-[1.02] hover:from-[#4cc7e8] hover:to-[#2c7bbe]'
                            >
                                Start 30-Day Free Trial
                                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                            </Link>

                            <Link
                                href='#platform-tools'
                                className='flex h-13 items-center justify-center gap-3 rounded-xl border border-[#4cc7e8]/35 bg-[#050608]/60 px-7 text-sm font-bold text-white transition-all hover:border-[#4cc7e8]/65 hover:bg-[#4cc7e8]/[0.04]'
                            >
                                View Live Demo
                                <Target className='h-4 w-4 text-[#4cc7e8]' />
                            </Link>
                        </div>

                        <div className='mt-6 grid gap-4 sm:grid-cols-3'>
                            <Benefit icon={CircleDollarSign} title='No Credit Card Required' />

                            <Benefit icon={CalendarDays} title='30-Day Full Access' />

                            <Benefit icon={ShieldCheck} title='Cancel Anytime, Keep Learning' />
                        </div>
                    </div>

                    {/* Dashboard Mockup — intentionally NO sidebar */}
                    <div className='relative'>
                        <div className='absolute -inset-8 rounded-full bg-[#2c7bbe]/8 blur-3xl' />

                        <div className='relative overflow-hidden rounded-2xl border border-[#2c7bbe]/28 bg-[#050a11]/90 shadow-[0_25px_80px_rgba(0,0,0,0.45),0_0_55px_rgba(44,123,190,0.08)]'>
                            <div className='flex flex-col gap-4 border-b border-[#2c7bbe]/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
                                <div className='flex items-center gap-3'>
                                    <Image src='/logocolored.png' alt='Black Snow' width={34} height={34} className='h-8 w-8 object-contain' />

                                    <div>
                                        <p className='text-[10px] font-bold uppercase tracking-[0.22em] text-white'>Black Snow</p>

                                        <p className='mt-0.5 text-[7px] uppercase tracking-[0.13em] text-[#4cc7e8]'>Intelligence Platform</p>
                                    </div>
                                </div>

                                <div className='flex gap-6'>
                                    <div>
                                        <p className='text-[7px] text-white/35'>Account Value</p>

                                        <p className='mt-0.5 text-[9px] font-semibold text-white'>$125,743.18</p>
                                    </div>

                                    <div>
                                        <p className='text-[7px] text-white/35'>Today&apos;s P&amp;L</p>

                                        <p className='mt-0.5 text-[9px] font-semibold text-[#5EDC7A]'>+$3,218.42</p>
                                    </div>
                                </div>
                            </div>

                            <div className='grid gap-2.5 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3'>
                                {dashboardItems.map((item, index) => (
                                    <DashboardTile key={item.title} item={item} index={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────
                    SIX TOOLS
                ───────────────────────────────────── */}
                <div id='platform-tools' className='mt-16 scroll-mt-24 sm:mt-20'>
                    <div className='flex items-center gap-5'>
                        <div className='h-px flex-1 bg-gradient-to-r from-transparent to-[#2c7bbe]/40' />

                        <div className='text-center'>
                            <h2 className='text-[clamp(1.35rem,5vw,2rem)] font-black text-white'>Six Powerful Tools. One Unified Platform.</h2>

                            <p className='mt-2 text-xs text-gray-400 sm:text-sm'>Everything you need to research, simulate, and master the markets.</p>
                        </div>

                        <div className='h-px flex-1 bg-gradient-to-l from-transparent to-[#2c7bbe]/40' />
                    </div>

                    <div className='mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
                        {platformTools.map((tool, index) => (
                            <ToolCard key={tool.title} {...tool} index={index} />
                        ))}
                    </div>
                </div>

                {/* ─────────────────────────────────────
                    WHO IS IT FOR
                ───────────────────────────────────── */}
                <div className='mt-14 rounded-2xl border border-[#2c7bbe]/30 bg-[#07101a]/45 p-4 sm:mt-18 sm:p-5'>
                    <div className='text-center'>
                        <h2 className='text-[clamp(1.45rem,5vw,2rem)] font-black text-white'>Who Is Black Snow For?</h2>

                        <p className='mt-2 text-sm text-gray-400'>Powerful tools for every type of market participant.</p>
                    </div>

                    <div className='mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6'>
                        {audiences.map((audience) => (
                            <PersonaCard key={audience.title} {...audience} />
                        ))}
                    </div>
                </div>

                {/* ─────────────────────────────────────
                    WORKFLOW
                ───────────────────────────────────── */}
                <div className='mt-14 sm:mt-18'>
                    <div className='text-center'>
                        <h2 className='text-[clamp(1.45rem,5vw,2rem)] font-black text-white'>From Insight to Execution</h2>

                        <p className='mt-2 text-sm text-gray-400'>A seamless workflow designed to help you make smarter, data-driven decisions.</p>
                    </div>

                    <div className='mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-6'>
                        {workflow.map((item, index) => (
                            <WorkflowItem key={item.number} item={item} index={index} />
                        ))}
                    </div>
                </div>

                {/* ─────────────────────────────────────
                    STATS
                ───────────────────────────────────── */}
                <div className='mt-10 overflow-hidden rounded-xl border border-[#2c7bbe]/22 bg-[#07101a]/65'>
                    <div className='grid grid-cols-1 divide-y divide-[#2c7bbe]/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:grid-cols-3 lg:grid-cols-5'>
                        <StatCard icon={Users} value='50K+' label='Active Traders' />

                        <StatCard icon={TrendingUp} value='6' label='Powerful Tools' />

                        <StatCard icon={Globe2} value='150+' label='Global Markets' />

                        <StatCard icon={Clock3} value='99.9%' label='Platform Uptime' />

                        <div className='flex min-h-[88px] items-center justify-center gap-4 px-4'>
                            <ShieldCheck className='h-8 w-8 text-[#4cc7e8]' />

                            <div>
                                <p className='text-base font-black text-white'>Bank-Level</p>

                                <p className='mt-1 text-[10px] text-gray-400'>Security</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────
                    PRICING
                ───────────────────────────────────── */}
                <div className='mt-10'>
                    <div className='mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
                        <div>
                            <h2 className='text-[clamp(1.5rem,5vw,2.2rem)] font-black text-white'>
                                Simple Pricing.{' '}
                                <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Maximum Value.</span>
                            </h2>

                            <p className='mt-2 text-sm text-gray-400'>Explore the products already available across Black Snow.</p>
                        </div>

                        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                            {['Flexible plans', 'Real-time updates', 'Secure access', 'Cancel anytime'].map((item) => (
                                <div key={item} className='flex items-center gap-2 text-xs text-gray-300'>
                                    <Check className='h-4 w-4 text-[#4cc7e8]' />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <PricingSlider />
                </div>

                {/* ─────────────────────────────────────
                    FINAL CTA
                ───────────────────────────────────── */}
                <div className='mt-8 flex flex-col gap-5 rounded-2xl border border-[#2c7bbe]/25 bg-[#07101a]/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7'>
                    <div className='flex items-center gap-5'>
                        <div className='relative flex h-14 w-14 shrink-0 items-center justify-center'>
                            <div className='absolute inset-0 rounded-full bg-[#4cc7e8]/10 blur-lg' />

                            <Rocket className='relative h-10 w-10 text-[#4cc7e8]' strokeWidth={1.4} />
                        </div>

                        <div>
                            <h3 className='text-lg font-black text-white sm:text-xl'>Ready to Take Control of the Markets?</h3>

                            <p className='mt-1 text-xs leading-5 text-gray-400 sm:text-sm'>Join traders using Black Snow to gain an edge every day.</p>
                        </div>
                    </div>

                    <Link
                        href='/signup'
                        className='group flex min-h-[50px] w-full items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] px-8 text-sm font-black text-white shadow-[0_0_30px_rgba(76,199,232,0.18)] transition-all duration-300 hover:scale-[1.015] hover:from-[#4cc7e8] hover:to-[#2c7bbe] sm:w-auto'
                    >
                        Start Your 30-Day Free Trial
                        <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default TradingPlatformShowcase;
