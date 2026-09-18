import HeroSection from '@/components/MainHeroSection';
import {
    ArrowRight,
    BarChart3,
    Bell,
    CalendarDays,
    Check,
    ChevronDown,
    Grid2X2,
    LineChart,
    List,
    MoreVertical,
    Search,
    SlidersHorizontal,
    Star,
    Target,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';
import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

type WatchlistRow = {
    symbol: string;
    company: string;
    price: string;
    change: string;
    positive: boolean;
    volume: string;
    badge: string;
    badgeBg: string;
    badgeColor: string;
    chart: number[];
    alert: boolean;
};

type AlertRow = {
    symbol: string;
    title: string;
    subtitle: string;
    time: string;
    positive?: boolean;
    event?: boolean;
    badge: string;
    badgeBg: string;
    badgeColor: string;
    chart?: number[];
};

const ORANGE = '#f25a20';
const ORANGE_BRIGHT = '#ff671f';
const ORANGE_LIGHT = '#ff8a4c';
const GREEN = '#78b84b';
const RED = '#e4473d';
const PAGE_BG = '#050607';
const BORDER = 'rgba(242,90,32,0.21)';

const watchlistRows: WatchlistRow[] = [
    {
        symbol: 'NVDA',
        company: 'NVIDIA Corporation',
        price: '$950.02',
        change: '+7.42%',
        positive: true,
        volume: '68.4M',
        badge: 'N',
        badgeBg: '#76b900',
        badgeColor: '#071005',
        chart: [21, 24, 22, 29, 27, 33, 30, 35, 37, 34, 39, 42],
        alert: true,
    },
    {
        symbol: 'AAPL',
        company: 'Apple Inc.',
        price: '$182.63',
        change: '+1.35%',
        positive: true,
        volume: '52.1M',
        badge: '●',
        badgeBg: '#f3f3f3',
        badgeColor: '#121212',
        chart: [20, 23, 22, 25, 24, 30, 28, 31, 30, 35, 33, 38],
        alert: true,
    },
    {
        symbol: 'MSFT',
        company: 'Microsoft Corp.',
        price: '$415.90',
        change: '+0.89%',
        positive: true,
        volume: '28.7M',
        badge: 'M',
        badgeBg: '#2589d8',
        badgeColor: '#ffffff',
        chart: [24, 22, 26, 24, 27, 28, 26, 31, 29, 33, 32, 35],
        alert: false,
    },
    {
        symbol: 'TSLA',
        company: 'Tesla, Inc.',
        price: '$173.24',
        change: '-0.72%',
        positive: false,
        volume: '112.6M',
        badge: 'T',
        badgeBg: '#d8453e',
        badgeColor: '#ffffff',
        chart: [39, 37, 34, 35, 32, 31, 29, 30, 27, 28, 25, 23],
        alert: true,
    },
    {
        symbol: 'AMZN',
        company: 'Amazon.com, Inc.',
        price: '$188.55',
        change: '+0.45%',
        positive: true,
        volume: '39.8M',
        badge: 'a',
        badgeBg: '#111111',
        badgeColor: '#ffffff',
        chart: [23, 25, 24, 26, 27, 29, 28, 30, 31, 30, 34, 35],
        alert: false,
    },
    {
        symbol: 'SPY',
        company: 'SPDR S&P 500 ETF',
        price: '$517.38',
        change: '+0.32%',
        positive: true,
        volume: '64.2M',
        badge: 'S',
        badgeBg: '#d7ba83',
        badgeColor: '#5f431e',
        chart: [20, 22, 23, 23, 26, 25, 28, 28, 30, 31, 32, 34],
        alert: false,
    },
];

const heroFeatures: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: Star,
        title: 'Track',
        body: 'Add and monitor your favorite assets.',
    },
    {
        icon: Bell,
        title: 'Alert',
        body: 'Get notified on price moves that matter.',
    },
    {
        icon: TrendingUp,
        title: 'Analyze',
        body: 'Make smarter decisions with real-time data.',
    },
];

const monitoringTools: Array<{
    icon: LucideIcon;
    title: string;
}> = [
    { icon: TrendingUp, title: 'Live Prices' },
    { icon: BarChart3, title: 'Advanced Charts' },
    { icon: List, title: 'News & Events' },
    { icon: Grid2X2, title: 'Multiple Views' },
];

const alertTools: Array<{
    icon: LucideIcon;
    title: string;
}> = [
    { icon: Bell, title: 'Price Alerts' },
    { icon: TrendingUp, title: 'Change Alerts' },
    { icon: CalendarDays, title: 'Event Alerts' },
    { icon: SlidersHorizontal, title: 'Custom Rules' },
];

const actionSteps: Array<{
    icon: LucideIcon;
    number: string;
    title: string;
    body: string;
}> = [
    {
        icon: Search,
        number: '01',
        title: 'Monitor',
        body: 'Track your assets and market movements.',
    },
    {
        icon: Bell,
        number: '02',
        title: 'Get Alerts',
        body: 'Receive real-time alerts on important events.',
    },
    {
        icon: BarChart3,
        number: '03',
        title: 'Analyze',
        body: 'Analyze trends and find high-potential opportunities.',
    },
    {
        icon: Target,
        number: '04',
        title: 'Take Action',
        body: 'Execute your strategy with confidence.',
    },
];

const alertRows: AlertRow[] = [
    {
        symbol: 'NVDA',
        title: 'NVDA is up +7%',
        subtitle: 'Price above $940.00',
        time: 'Just now',
        positive: true,
        badge: 'N',
        badgeBg: '#76b900',
        badgeColor: '#071005',
        chart: [20, 22, 25, 24, 29, 31, 30, 35, 38, 39, 42],
    },
    {
        symbol: 'TSLA',
        title: 'TSLA is down -3%',
        subtitle: 'Price below $170.00',
        time: '15m ago',
        positive: false,
        badge: 'T',
        badgeBg: '#d8453e',
        badgeColor: '#ffffff',
        chart: [42, 39, 40, 36, 34, 32, 30, 29, 26, 25, 23],
    },
    {
        symbol: 'AAPL',
        title: 'AAPL Earnings Today',
        subtitle: 'After market close',
        time: '1h ago',
        event: true,
        badge: '●',
        badgeBg: '#f3f3f3',
        badgeColor: '#111111',
    },
    {
        symbol: 'SPY',
        title: 'SPY Change Alert',
        subtitle: 'Change above +0.30%',
        time: '2h ago',
        positive: true,
        badge: 'S',
        badgeBg: '#d7ba83',
        badgeColor: '#65471f',
        chart: [20, 22, 24, 23, 25, 27, 29, 30, 29, 32, 34],
    },
];

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={`overflow-hidden rounded-[12px] border ${className}`}
            style={{
                borderColor: BORDER,
                background: 'linear-gradient(180deg, rgba(9,10,10,0.98) 0%, rgba(6,7,7,0.98) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02), 0 18px 42px rgba(0,0,0,0.22)',
            }}
        >
            {children}
        </div>
    );
}

function SectionIntro({ number, title, description, children }: { number: string; title: string; description: string; children?: ReactNode }) {
    return (
        <div className='min-w-0 lg:pr-5'>
            <div className='flex items-center gap-3'>
                <span className='watchlist-serif text-[43px] leading-none tracking-[-0.04em]' style={{ color: ORANGE_LIGHT }}>
                    {number}
                </span>

                <span
                    className='mt-1 h-px w-9'
                    style={{
                        background: `linear-gradient(90deg, ${ORANGE}, rgba(242,90,32,0.22))`,
                    }}
                />
            </div>

            <h2 className='watchlist-serif mt-1 text-[28px] leading-[1.05] tracking-[-0.025em] text-[#f4f1ed] sm:text-[31px]'>{title}</h2>

            <p className='mt-3 max-w-[280px] text-[13px] leading-[1.55] text-[#d0d0ce] sm:text-[14px]'>{description}</p>

            {children}
        </div>
    );
}

function CheckItem({ children }: { children: ReactNode }) {
    return (
        <li className='flex items-start gap-2.5 text-[13px] leading-[1.48] text-[#d2d2cf] sm:text-[14px]'>
            <span className='mt-[2px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: ORANGE }}>
                <Check className='h-[10px] w-[10px]' strokeWidth={2.5} style={{ color: ORANGE }} />
            </span>

            <span>{children}</span>
        </li>
    );
}

function HeroArtwork() {
    return (
        <div className='relative mx-auto aspect-[650/382] w-full max-w-[650px]'>
            <div
                className='pointer-events-none absolute inset-[5%] blur-3xl'
                style={{
                    background: 'radial-gradient(ellipse, rgba(242,90,32,0.11), rgba(242,90,32,0.025) 52%, transparent 76%)',
                }}
            />

            <Image
                src='/images/watchlist-hero-globe.webp'
                alt='Watchlist global monitoring dashboard'
                fill
                priority
                quality={100}
                sizes='(max-width: 1023px) 100vw, 650px'
                className='relative z-10 object-contain object-center'
            />

            <div className='pointer-events-none absolute inset-y-0 left-0 z-20 w-[2%] bg-gradient-to-r from-[#050607] to-transparent' />
            <div className='pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[3%] bg-gradient-to-t from-[#050607] to-transparent' />
        </div>
    );
}

function CompanyBadge({ badge, background, color }: { badge: string; background: string; color: string }) {
    return (
        <span
            className='flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold'
            style={{
                background,
                color,
            }}
        >
            {badge}
        </span>
    );
}

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
    const width = 130;
    const height = 35;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;

    const path = points
        .map((value, index) => {
            const x = (index / (points.length - 1)) * width;
            const y = height - 4 - ((value - min) / range) * (height - 8);
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio='none' className='h-[30px] w-full' aria-hidden='true'>
            <polyline points={path} fill='none' stroke={positive ? GREEN : RED} strokeWidth='1.5' vectorEffect='non-scaling-stroke' />
        </svg>
    );
}

function WatchlistTable() {
    const columns = '.75fr 1.5fr .8fr .8fr 1.15fr .75fr .35fr';

    return (
        <Panel>
            <div className='px-4 pb-3 pt-3 sm:px-5'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <p className='text-[11px] font-medium uppercase tracking-[0.02em]' style={{ color: ORANGE_LIGHT }}>
                        My Watchlist
                    </p>

                    <div className='flex items-center gap-2'>
                        <button type='button' className='flex h-8 w-8 items-center justify-center rounded-[4px] border border-white/[0.10]'>
                            <Grid2X2 className='h-4 w-4 text-[#c9cac6]' />
                        </button>

                        <button type='button' className='flex h-8 w-8 items-center justify-center rounded-[4px] border border-white/[0.10]'>
                            <List className='h-4 w-4 text-[#c9cac6]' />
                        </button>

                        <button type='button' className='flex h-8 items-center gap-4 rounded-[4px] border border-white/[0.10] px-3 text-[9px] text-[#d2d2cf]'>
                            Custom View
                            <ChevronDown className='h-3 w-3' />
                        </button>

                        <MoreVertical className='h-4 w-4 text-[#9a9b97]' />
                    </div>
                </div>

                <div className='mt-3 hidden lg:block'>
                    <div className='grid border-y border-white/[0.07] py-2 text-[9px] text-[#a2a39f]' style={{ gridTemplateColumns: columns }}>
                        <span>Symbol</span>
                        <span>Company</span>
                        <span>Price</span>
                        <span>Change %</span>
                        <span>Chart (1D)</span>
                        <span>Volume</span>
                        <span>Alert</span>
                    </div>

                    {watchlistRows.map((row) => (
                        <div
                            key={row.symbol}
                            className='grid min-h-[46px] items-center border-b border-white/[0.06] text-[10px] text-[#d9dad6]'
                            style={{ gridTemplateColumns: columns }}
                        >
                            <div className='flex items-center gap-2'>
                                <CompanyBadge badge={row.badge} background={row.badgeBg} color={row.badgeColor} />

                                <span className='font-medium'>{row.symbol}</span>
                            </div>

                            <span>{row.company}</span>
                            <span>{row.price}</span>

                            <span
                                style={{
                                    color: row.positive ? GREEN : RED,
                                }}
                            >
                                {row.change}
                            </span>

                            <div className='pr-3'>
                                <Sparkline points={row.chart} positive={row.positive} />
                            </div>

                            <span>{row.volume}</span>

                            <Bell
                                className='h-4 w-4'
                                strokeWidth={1.45}
                                style={{
                                    color: row.alert ? ORANGE : '#8c8d89',
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className='mt-2 lg:hidden'>
                    {watchlistRows.map((row) => (
                        <div key={row.symbol} className='border-b border-white/[0.07] py-3 last:border-b-0'>
                            <div className='flex items-center justify-between gap-4'>
                                <div className='flex items-center gap-2'>
                                    <CompanyBadge badge={row.badge} background={row.badgeBg} color={row.badgeColor} />

                                    <div>
                                        <p className='text-[12px] font-medium text-[#eeeeea]'>{row.symbol}</p>
                                        <p className='mt-0.5 text-[9px] text-[#949591]'>{row.company}</p>
                                    </div>
                                </div>

                                <div className='text-right'>
                                    <p className='text-[12px] text-[#e4e5e1]'>{row.price}</p>

                                    <p
                                        className='mt-0.5 text-[10px]'
                                        style={{
                                            color: row.positive ? GREEN : RED,
                                        }}
                                    >
                                        {row.change}
                                    </p>
                                </div>
                            </div>

                            <div className='mt-2 grid grid-cols-[1fr_80px] items-end gap-4'>
                                <Sparkline points={row.chart} positive={row.positive} />

                                <p className='text-right text-[9px] text-[#a8a9a5]'>Vol. {row.volume}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='flex flex-col items-center justify-between gap-2 pt-2 sm:flex-row'>
                    <button type='button' className='text-[10px]' style={{ color: ORANGE }}>
                        + Add Asset
                    </button>

                    <button type='button' className='group flex items-center gap-2 text-[10px]' style={{ color: ORANGE }}>
                        View Full Watchlist
                        <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-1' />
                    </button>
                </div>
            </div>
        </Panel>
    );
}

function MiniChart({ positive, values }: { positive: boolean; values: number[] }) {
    return (
        <div className='mt-3 h-[52px]'>
            <Sparkline points={values} positive={positive} />
        </div>
    );
}

function WatchlistCard({
    icon,
    title,
    assets,
    performance,
    positive,
    values,
    active = false,
}: {
    icon: LucideIcon;
    title: string;
    assets: string;
    performance: string;
    positive: boolean;
    values: number[];
    active?: boolean;
}) {
    const Icon = icon;

    return (
        <div
            className='rounded-[8px] border px-4 py-4'
            style={{
                borderColor: active ? ORANGE : 'rgba(255,255,255,0.10)',
                background: active ? 'linear-gradient(180deg,rgba(242,90,32,0.055),rgba(9,10,10,0.98))' : '#090a0a',
                boxShadow: active ? '0 0 18px rgba(242,90,32,0.08)' : 'none',
            }}
        >
            <div className='flex items-center gap-2'>
                <Icon className='h-5 w-5' strokeWidth={1.4} style={{ color: ORANGE_LIGHT }} />

                <div>
                    <p className='text-[11px] font-medium text-[#eeeeea]'>{title}</p>
                    <p className='mt-0.5 text-[8px] text-[#868783]'>{assets}</p>
                </div>
            </div>

            <div className='mt-5 flex items-center justify-between'>
                <span className='text-[8px] text-[#969793]'>Today</span>

                <span className='text-[10px]' style={{ color: positive ? GREEN : RED }}>
                    {performance}
                </span>
            </div>

            <MiniChart positive={positive} values={values} />
        </div>
    );
}

function AlertStatusIcon({ event, positive }: { event?: boolean; positive?: boolean }) {
    if (event) {
        return (
            <span className='flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: ORANGE }}>
                <CalendarDays className='h-4 w-4' style={{ color: ORANGE }} />
            </span>
        );
    }

    return (
        <span className='flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: positive ? GREEN : RED }}>
            <TrendingUp
                className={`h-4 w-4 ${positive ? '' : 'rotate-180'}`}
                style={{
                    color: positive ? GREEN : RED,
                }}
            />
        </span>
    );
}

function AlertsPanel() {
    return (
        <Panel>
            <div className='px-4 pb-3 pt-4 sm:px-5'>
                <div className='flex items-center justify-between gap-4'>
                    <p className='text-[11px] font-medium uppercase' style={{ color: ORANGE_LIGHT }}>
                        Recent Alerts
                    </p>

                    <button type='button' className='group flex items-center gap-2 text-[9px]' style={{ color: ORANGE }}>
                        View All Alerts
                        <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-1' />
                    </button>
                </div>

                <div className='mt-2'>
                    {alertRows.map((row) => (
                        <div
                            key={row.title}
                            className='grid min-h-[58px] grid-cols-[minmax(0,1fr)_65px] items-center gap-4 border-b border-white/[0.07] last:border-b-0 sm:grid-cols-[1.3fr_.65fr_.3fr_10px]'
                        >
                            <div className='flex min-w-0 items-center gap-3'>
                                <AlertStatusIcon event={row.event} positive={row.positive} />

                                <CompanyBadge badge={row.badge} background={row.badgeBg} color={row.badgeColor} />

                                <div className='min-w-0'>
                                    <p className='truncate text-[11px] text-[#efefeb]'>{row.title}</p>

                                    <p className='mt-0.5 truncate text-[9px] text-[#939490]'>{row.subtitle}</p>
                                </div>
                            </div>

                            <div className='hidden sm:block'>
                                {row.chart ? (
                                    <Sparkline points={row.chart} positive={Boolean(row.positive)} />
                                ) : (
                                    <div className='text-center text-[15px] text-[#999a96]'>—</div>
                                )}
                            </div>

                            <p className='text-right text-[9px] text-[#aaaBA7]'>{row.time}</p>

                            <span
                                className='hidden h-[8px] w-[8px] rounded-full sm:block'
                                style={{
                                    background: ORANGE,
                                    boxShadow: '0 0 8px rgba(242,90,32,0.65)',
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </Panel>
    );
}

const WatchlistPage: NextPage = () => {
    return (
        <>
            <HeroSection />

            <main
                className='watchlist-page min-h-screen overflow-hidden text-white'
                style={{
                    background:
                        'radial-gradient(circle at 75% 9%,rgba(242,90,32,0.04),transparent 27%),linear-gradient(180deg,#040505 0%,#060707 52%,#040505 100%)',
                }}
            >
                {/* HERO */}
                <section id='overview' className='relative overflow-hidden border-b border-white/[0.10]'>
                    <div className='mx-auto grid w-full max-w-[1180px] items-center gap-8 px-5 pb-7 pt-5 sm:px-8 sm:pb-9 sm:pt-7 lg:grid-cols-[0.40fr_0.60fr] lg:gap-2 lg:px-9'>
                        <div className='relative z-10'>
                            <p className='text-[11px] font-medium uppercase tracking-[0.055em]' style={{ color: ORANGE_LIGHT }}>
                                Track what matters.
                            </p>

                            <h1 className='watchlist-serif mt-3 text-[56px] leading-[0.91] tracking-[-0.05em] sm:text-[71px] lg:text-[74px]'>
                                <span style={{ color: ORANGE_BRIGHT }}>Watchlist.</span>

                                <br />

                                <span className='text-[#f4f1ed]'>Stay ahead.</span>
                            </h1>

                            <p className='mt-5 max-w-[410px] text-[16px] leading-[1.55] text-[#dededb] sm:text-[17px]'>
                                Monitor your favorite assets in real time
                                <br className='hidden sm:block' /> and never miss a market move.
                            </p>

                            <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-7'>
                                {heroFeatures.map(({ icon: Icon, title, body }) => (
                                    <div key={title}>
                                        <div className='flex h-[53px] w-[53px] items-center justify-center rounded-full border' style={{ borderColor: ORANGE }}>
                                            <Icon
                                                className='h-6 w-6'
                                                strokeWidth={1.45}
                                                style={{
                                                    color: ORANGE_LIGHT,
                                                }}
                                            />
                                        </div>

                                        <h3 className='mt-3 text-[13px] font-medium text-[#eeeeea]'>{title}</h3>

                                        <p className='mt-1.5 max-w-[140px] text-[10px] leading-[1.45] text-[#aaaba7]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='relative flex min-h-[270px] items-center lg:min-h-[390px]'>
                            <HeroArtwork />
                        </div>
                    </div>
                </section>

                <div className='mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-9'>
                    {/* SECTION 01 */}
                    <section id='features' className='grid gap-7 border-b border-white/[0.10] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='01'
                            title='Real-Time Monitoring'
                            description='Stay updated with live prices, charts, and market changes as they happen.'
                        >
                            <div className='mt-8 grid max-w-[285px] grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3'>
                                {monitoringTools.map(({ icon: Icon, title }) => (
                                    <div key={title} className='text-center'>
                                        <Icon
                                            className='mx-auto h-8 w-8'
                                            strokeWidth={1.35}
                                            style={{
                                                color: ORANGE_LIGHT,
                                            }}
                                        />

                                        <p className='mt-2 text-[9px] leading-[1.25] text-[#c5c6c2]'>{title}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionIntro>

                        <WatchlistTable />
                    </section>

                    {/* SECTION 02 */}
                    <section className='grid gap-7 border-b border-white/[0.10] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro number='02' title='Organize & Customize' description='Create watchlists that fit your strategy and stay organized.'>
                            <ul className='mt-5 space-y-2'>
                                <CheckItem>Create multiple watchlists</CheckItem>
                                <CheckItem>Drag &amp; drop to organize</CheckItem>
                                <CheckItem>Custom columns &amp; layouts</CheckItem>
                                <CheckItem>Share &amp; collaborate</CheckItem>
                            </ul>
                        </SectionIntro>

                        <Panel>
                            <div className='px-4 pb-4 pt-4 sm:px-5'>
                                <div className='flex items-center justify-between gap-4'>
                                    <p className='text-[11px] font-medium uppercase' style={{ color: ORANGE_LIGHT }}>
                                        My Watchlists
                                    </p>

                                    <button type='button' className='text-[10px]' style={{ color: ORANGE }}>
                                        + New Watchlist
                                    </button>
                                </div>

                                <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                                    <WatchlistCard
                                        icon={Star}
                                        title='Tech Leaders'
                                        assets='8 assets'
                                        performance='+1.62%'
                                        positive
                                        active
                                        values={[20, 22, 21, 25, 24, 28, 27, 31, 34, 36, 39]}
                                    />

                                    <WatchlistCard
                                        icon={TrendingUp}
                                        title='High Growth'
                                        assets='12 assets'
                                        performance='+2.34%'
                                        positive
                                        values={[19, 22, 21, 26, 25, 29, 31, 30, 36, 39, 43]}
                                    />

                                    <WatchlistCard
                                        icon={BarChart3}
                                        title='Dividends'
                                        assets='15 assets'
                                        performance='-0.18%'
                                        positive={false}
                                        values={[39, 38, 36, 37, 34, 33, 31, 32, 30, 29, 27]}
                                    />

                                    <WatchlistCard
                                        icon={LineChart}
                                        title='Commodities'
                                        assets='6 assets'
                                        performance='+0.78%'
                                        positive
                                        values={[20, 21, 22, 25, 24, 27, 28, 30, 32, 34, 38]}
                                    />
                                </div>
                            </div>
                        </Panel>
                    </section>

                    {/* SECTION 03 */}
                    <section id='alerts' className='grid gap-7 border-b border-white/[0.10] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro number='03' title='Smart Alerts' description='Set intelligent alerts and never miss important market events.'>
                            <div className='mt-8 grid max-w-[285px] grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3'>
                                {alertTools.map(({ icon: Icon, title }) => (
                                    <div key={title} className='text-center'>
                                        <Icon
                                            className='mx-auto h-8 w-8'
                                            strokeWidth={1.35}
                                            style={{
                                                color: ORANGE_LIGHT,
                                            }}
                                        />

                                        <p className='mt-2 text-[9px] leading-[1.25] text-[#c5c6c2]'>{title}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionIntro>

                        <AlertsPanel />
                    </section>

                    {/* SECTION 04 */}
                    <section className='py-6'>
                        <div className='grid gap-8 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                            <SectionIntro
                                number='04'
                                title='From Watchlist to Action'
                                description='Turn insights into confident trades and smarter decisions.'
                            />

                            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3'>
                                {actionSteps.map(({ icon: Icon, number, title, body }) => (
                                    <div key={number} className='flex flex-col items-center text-center'>
                                        <div
                                            className='flex h-[52px] w-[52px] items-center justify-center rounded-full border'
                                            style={{
                                                borderColor: ORANGE,
                                            }}
                                        >
                                            <Icon
                                                className='h-6 w-6'
                                                strokeWidth={1.4}
                                                style={{
                                                    color: ORANGE_LIGHT,
                                                }}
                                            />
                                        </div>

                                        <p className='mt-2 text-[9px] text-[#bdbeba]'>{number}</p>

                                        <h3 className='mt-1 text-[10px] font-medium text-[#eeeeea]'>{title}</h3>

                                        <p className='mt-1.5 max-w-[140px] text-[8px] leading-[1.45] text-[#a0a19d]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className='mt-5 flex flex-col gap-5 rounded-[11px] border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6'
                            style={{
                                borderColor: BORDER,
                                background: 'linear-gradient(180deg,rgba(9,9,9,0.98),rgba(5,6,6,0.98))',
                            }}
                        >
                            <div className='flex items-center gap-4'>
                                <div
                                    className='flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border'
                                    style={{ borderColor: ORANGE }}
                                >
                                    <Star className='h-6 w-6' strokeWidth={1.45} style={{ color: ORANGE_LIGHT }} />
                                </div>

                                <div>
                                    <p className='text-[12px] text-[#eeeeea]'>Stay ahead. Track smarter. Act with confidence.</p>

                                    <p className='mt-1 text-[10px] text-[#aaaba7]'>Your watchlist is your edge in the market.</p>
                                </div>
                            </div>

                            <Link
                                href='/signup'
                                className='group flex min-h-[46px] w-full items-center justify-center gap-7 rounded-[4px] px-8 text-[12px] font-medium uppercase tracking-[0.025em] text-white sm:w-[290px]'
                                style={{
                                    background: 'linear-gradient(90deg,#f25a20 0%,#ff6d1f 100%)',
                                    boxShadow: '0 0 22px rgba(242,90,32,0.16)',
                                }}
                            >
                                Create Watchlist
                                <ArrowRight className='h-5 w-5 transition-transform duration-200 group-hover:translate-x-1' />
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            <style jsx global>{`
                .watchlist-page {
                    font-family: 'Roboto', Arial, Helvetica, sans-serif;
                    background-color: ${PAGE_BG};
                    -webkit-font-smoothing: antialiased;
                    text-rendering: geometricPrecision;
                }



                .watchlist-page button,
                .watchlist-page a {
                    -webkit-tap-highlight-color: transparent;
                }

                html {
                    scroll-behavior: smooth;
                }

                @media (max-width: 639px) {
                    .watchlist-page {
                        overflow-wrap: anywhere;
                    }

                .watchlist-page .watchlist-serif {
                    font-family: var(--font-michroma), sans-serif !important;
                }}
                }
            `}</style>
        </>
    );
};

export default WatchlistPage;
