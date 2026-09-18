import HeroSection from '@/components/MainHeroSection';
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    BarChart3,
    Bell,
    Check,
    ClipboardList,
    Flame,
    Percent,
    Search,
    Target,
    TrendingUp,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

type MoverRow = {
    symbol: string;
    company: string;
    price: string;
    change: string;
    volume: string;
    positive: boolean;
    badge: string;
    badgeBg: string;
    badgeColor: string;
};

type AlertRow = {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    time: string;
    direction: 'up' | 'down' | 'volume' | 'sector';
    chart: number[];
};

const RED = '#e54848';
const RED_BRIGHT = '#ff5151';
const ORANGE = '#d69b51';
const ORANGE_LIGHT = '#e3ae67';
// const GREEN = '#72b447';
const PAGE_BG = '#050606';
const BORDER = 'rgba(214,155,81,0.20)';

const gainers: MoverRow[] = [
    {
        symbol: 'NVDA',
        company: 'NVIDIA Corporation',
        price: '$950.02',
        change: '+7.42%',
        volume: '68.4M',
        positive: true,
        badge: 'N',
        badgeBg: '#76b900',
        badgeColor: '#071004',
    },
    {
        symbol: 'AMD',
        company: 'Advanced Micro Devices',
        price: '$170.58',
        change: '+6.21%',
        volume: '45.7M',
        positive: true,
        badge: 'A',
        badgeBg: '#f1f1f1',
        badgeColor: '#181818',
    },
    {
        symbol: 'SMCI',
        company: 'Super Micro Computer',
        price: '$915.30',
        change: '+5.18%',
        volume: '32.1M',
        positive: true,
        badge: 'S',
        badgeBg: '#e9eef4',
        badgeColor: '#315f8f',
    },
    {
        symbol: 'MU',
        company: 'Micron Technology',
        price: '$128.79',
        change: '+4.73%',
        volume: '28.6M',
        positive: true,
        badge: 'M',
        badgeBg: '#315f9c',
        badgeColor: '#ffffff',
    },
    {
        symbol: 'TSM',
        company: 'Taiwan Semiconductor',
        price: '$162.42',
        change: '+4.25%',
        volume: '21.3M',
        positive: true,
        badge: 'T',
        badgeBg: '#f6f6f6',
        badgeColor: '#cf2b2b',
    },
];

const losers: MoverRow[] = [
    {
        symbol: 'SPOT',
        company: 'Spotify Technology',
        price: '$291.26',
        change: '-4.21%',
        volume: '12.7M',
        positive: false,
        badge: 'S',
        badgeBg: '#1ed760',
        badgeColor: '#061109',
    },
    {
        symbol: 'PYPL',
        company: 'PayPal Holdings',
        price: '$61.83',
        change: '-3.18%',
        volume: '15.3M',
        positive: false,
        badge: 'P',
        badgeBg: '#1677c8',
        badgeColor: '#ffffff',
    },
    {
        symbol: 'SNAP',
        company: 'Snap Inc.',
        price: '$12.34',
        change: '-2.89%',
        volume: '18.9M',
        positive: false,
        badge: 'S',
        badgeBg: '#fffc00',
        badgeColor: '#111111',
    },
    {
        symbol: 'F',
        company: 'Ford Motor Company',
        price: '$11.02',
        change: '-2.45%',
        volume: '24.5M',
        positive: false,
        badge: 'F',
        badgeBg: '#1d4f8f',
        badgeColor: '#ffffff',
    },
    {
        symbol: 'RIVN',
        company: 'Rivian Automotive',
        price: '$9.21',
        change: '-2.12%',
        volume: '21.3M',
        positive: false,
        badge: 'R',
        badgeBg: '#9a6e18',
        badgeColor: '#fff0b9',
    },
];

const alertRows: AlertRow[] = [
    {
        icon: ArrowUp,
        title: 'NVDA is up +7%',
        subtitle: 'Price above $940.00',
        time: '2m ago',
        direction: 'up',
        chart: [22, 25, 24, 29, 31, 30, 35, 37, 40, 43, 46],
    },
    {
        icon: ArrowDown,
        title: 'SPOT is down -4%',
        subtitle: 'Price below $295.00',
        time: '5m ago',
        direction: 'down',
        chart: [45, 41, 43, 38, 36, 34, 31, 29, 28, 24, 22],
    },
    {
        icon: BarChart3,
        title: 'High volume in TSLA',
        subtitle: 'Volume above 100M',
        time: '8m ago',
        direction: 'volume',
        chart: [20, 21, 23, 25, 24, 30, 28, 36, 32, 39, 43],
    },
    {
        icon: TrendingUp,
        title: 'Tech sector up +2%',
        subtitle: 'XLK above +2%',
        time: '12m ago',
        direction: 'sector',
        chart: [21, 25, 23, 28, 31, 30, 34, 36, 39, 41, 44],
    },
];

const heroFeatures: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: BarChart3,
        title: 'Real-Time',
        body: 'Live updates on top gainers and losers.',
    },
    {
        icon: Zap,
        title: 'Powerful Insights',
        body: "Understand what's driving market movement.",
    },
    {
        icon: Bell,
        title: 'Stay Ahead',
        body: 'Never miss an opportunity or risk again.',
    },
];

const sectionOneTools: Array<{
    icon: LucideIcon;
    title: string;
}> = [
    { icon: ArrowUp, title: 'Top Gainers' },
    { icon: ArrowDown, title: 'Top Losers' },
    { icon: Flame, title: 'Most Active' },
    { icon: Percent, title: 'Unusual Volume' },
];

const alertTools: Array<{
    icon: LucideIcon;
    title: string;
}> = [
    { icon: Bell, title: 'Price Alerts' },
    { icon: Percent, title: 'Percent Change' },
    { icon: BarChart3, title: 'Volume Spikes' },
    { icon: ClipboardList, title: 'Sector Moves' },
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
        title: 'Scan Movers',
        body: "See what's moving in real time.",
    },
    {
        icon: ClipboardList,
        number: '02',
        title: 'Analyze Drivers',
        body: 'Understand the news, data, and catalysts.',
    },
    {
        icon: Bell,
        number: '03',
        title: 'Set Alerts',
        body: 'Get notified on the moves that matter.',
    },
    {
        icon: Target,
        number: '04',
        title: 'Take Action',
        body: 'Act with confidence and stay ahead.',
    },
];

function SectionIntro({ number, title, description, children }: { number: string; title: string; description: string; children?: ReactNode }) {
    return (
        <div className='min-w-0 lg:pr-5'>
            <div className='flex items-center gap-3'>
                <span className='movers-serif page-section-number text-[43px] leading-none tracking-[-0.04em]' style={{ color: ORANGE_LIGHT }}>
                    {number}
                </span>

                <span
                    className='mt-1 h-px w-9'
                    style={{
                        background: `linear-gradient(90deg, ${ORANGE}, rgba(214,155,81,0.22))`,
                    }}
                />
            </div>

            <h2 className='movers-serif page-section-title mt-1 text-[28px] leading-[1.05] tracking-[-0.025em] text-[#f4f2ed] sm:text-[31px]'>{title}</h2>

            <p className='mt-3 max-w-[270px] text-[13px] leading-[1.55] text-[#d0d0ce] sm:text-[14px]'>{description}</p>

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
                background: 'linear-gradient(180deg, rgba(8,9,9,0.98) 0%, rgba(5,6,6,0.98) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.018), 0 18px 40px rgba(0,0,0,0.22)',
            }}
        >
            {children}
        </div>
    );
}

function CheckItem({ children }: { children: ReactNode }) {
    return (
        <li className='flex items-start gap-2.5 text-[13px] leading-[1.48] text-[#d3d3d0] sm:text-[14px]'>
            <span className='mt-[2px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: ORANGE }}>
                <Check className='h-[10px] w-[10px]' strokeWidth={2.5} style={{ color: ORANGE }} />
            </span>
            <span>{children}</span>
        </li>
    );
}

function HeroArtwork() {
    return (
        <div className='relative mx-auto aspect-[584/375] w-full max-w-[610px]'>
            <div
                className='pointer-events-none absolute inset-[8%] blur-3xl'
                style={{
                    background: 'radial-gradient(ellipse, rgba(230,54,54,0.14) 0%, rgba(230,54,54,0.03) 48%, transparent 75%)',
                }}
            />

            <Image
                src='/images/market-movers-hero-map.webp'
                alt='Global market movers network'
                fill
                priority
                quality={100}
                sizes='(max-width: 1023px) 100vw, 610px'
                className='relative z-10 object-contain object-center'
            />

            <div className='pointer-events-none absolute inset-y-0 left-0 z-20 w-[2%] bg-gradient-to-r from-[#050606] to-transparent' />
            <div className='pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[3%] bg-gradient-to-t from-[#050606] to-transparent' />
        </div>
    );
}

function CompanyBadge({ row }: { row: MoverRow }) {
    return (
        <div
            className='flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold'
            style={{
                background: row.badgeBg,
                color: row.badgeColor,
            }}
        >
            {row.badge}
        </div>
    );
}

function MoverTable({ title, rows, positive }: { title: string; rows: MoverRow[]; positive: boolean }) {
    return (
        <div className='min-w-0 px-4 py-4 sm:px-5'>
            <div className='flex items-center gap-2'>
                <span className='text-[10px] font-medium uppercase tracking-[0.02em]' style={{ color: RED_BRIGHT }}>
                    {title}
                </span>

                <span className='flex h-[15px] w-[15px] items-center justify-center rounded-full border' style={{ borderColor: RED }}>
                    {positive ? (
                        <ArrowUp className='h-[9px] w-[9px]' style={{ color: RED }} />
                    ) : (
                        <ArrowDown className='h-[9px] w-[9px]' style={{ color: RED }} />
                    )}
                </span>
            </div>

            <div className='mt-3 grid grid-cols-[1.55fr_.7fr_.72fr_.65fr] border-b border-white/[0.07] pb-2 text-[9px] text-[#a9aaa7]'>
                <span>Symbol</span>
                <span>Price</span>
                <span>Change %</span>
                <span className='text-right'>Volume</span>
            </div>

            {rows.map((row) => (
                <div
                    key={row.symbol}
                    className='grid min-h-[44px] grid-cols-[1.55fr_.7fr_.72fr_.65fr] items-center border-b border-white/[0.06] last:border-b-0'
                >
                    <div className='flex min-w-0 items-center gap-2'>
                        <CompanyBadge row={row} />

                        <div className='min-w-0'>
                            <p className='text-[11px] font-medium text-[#ecece8]'>{row.symbol}</p>
                            <p className='truncate text-[7px] text-[#939490]'>{row.company}</p>
                        </div>
                    </div>

                    <span className='text-[10px] text-[#d8d8d4]'>{row.price}</span>

                    <span className='text-[10px]' style={{ color: RED }}>
                        {row.change}
                    </span>

                    <span className='text-right text-[10px] text-[#d8d8d4]'>{row.volume}</span>
                </div>
            ))}
        </div>
    );
}

function MoversPanel() {
    return (
        <Panel>
            <div className='grid grid-cols-1 divide-y divide-white/[0.09] md:grid-cols-2 md:divide-x md:divide-y-0'>
                <MoverTable title='Top Gainers' rows={gainers} positive />
                <MoverTable title='Top Losers' rows={losers} positive={false} />
            </div>

            <div className='flex justify-center border-t border-white/[0.07] py-2.5'>
                <button type='button' className='group flex items-center gap-2 text-[11px]' style={{ color: RED }}>
                    View Full Market Movers
                    <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                </button>
            </div>
        </Panel>
    );
}

function Sparkline({ values, bars = false }: { values: number[]; bars?: boolean }) {
    const width = 170;
    const height = 48;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const points = values
        .map((value, index) => {
            const x = (index / (values.length - 1)) * width;
            const y = height - 6 - ((value - min) / range) * (height - 14);
            return `${x},${y}`;
        })
        .join(' ');

    if (bars) {
        return (
            <svg viewBox={`0 0 ${width} ${height}`} className='h-[48px] w-full' aria-hidden='true'>
                {values.map((value, index) => {
                    const barHeight = 8 + ((value - min) / range) * 28;

                    return (
                        <rect
                            key={index}
                            x={(index / values.length) * width + 2}
                            y={height - barHeight}
                            width={Math.max(2, width / values.length - 4)}
                            height={barHeight}
                            rx='1'
                            fill={RED}
                        />
                    );
                })}
            </svg>
        );
    }

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className='h-[48px] w-full' aria-hidden='true'>
            <polyline points={points} fill='none' stroke={RED} strokeWidth='2' vectorEffect='non-scaling-stroke' />
        </svg>
    );
}

function DriverCard({
    label,
    symbol,
    company,
    price,
    change,
    positive,
    volume,
    average,
    catalyst,
    badge,
    badgeBg,
    badgeColor,
    chart,
    bars = false,
}: {
    label: string;
    symbol: string;
    company: string;
    price: string;
    change: string;
    positive: boolean;
    volume: string;
    average: string;
    catalyst: string;
    badge: string;
    badgeBg: string;
    badgeColor: string;
    chart: number[];
    bars?: boolean;
}) {
    return (
        <Panel>
            <div className='px-4 pb-4 pt-4'>
                <p className='text-[10px] font-medium uppercase tracking-[0.02em]' style={{ color: RED_BRIGHT }}>
                    {label}
                </p>

                <div className='mt-3 flex items-center gap-3'>
                    <div
                        className='flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold'
                        style={{ background: badgeBg, color: badgeColor }}
                    >
                        {badge}
                    </div>

                    <div>
                        <p className='text-[17px] leading-none text-[#f1f1ed]'>{symbol}</p>
                        <p className='mt-1 text-[8px] text-[#9d9e9a]'>{company}</p>
                    </div>
                </div>

                <div className='mt-4 flex items-center justify-between border-b border-white/[0.07] pb-3'>
                    <span className='text-[19px] text-[#ededE9]'>{price}</span>

                    <span className='text-[18px]' style={{ color: RED }}>
                        {change}
                    </span>
                </div>

                <div className='grid grid-cols-2 border-b border-white/[0.07] py-3'>
                    <div>
                        <p className='text-[8px] text-[#858682]'>Volume</p>
                        <p className='mt-1 text-[12px] text-[#e2e2de]'>{volume}</p>
                    </div>

                    <div>
                        <p className='text-[8px] text-[#858682]'>vs. Avg.</p>
                        <p className='mt-1 text-[12px]' style={{ color: positive ? RED : '#d8d8d4' }}>
                            {average}
                        </p>
                    </div>
                </div>

                <div className='pt-3'>
                    <p className='text-[8px] text-[#858682]'>Top Catalyst</p>
                    <p className='mt-1 min-h-[38px] text-[9px] leading-[1.45] text-[#c4c5c1]'>{catalyst}</p>

                    <div className='mt-1'>
                        <Sparkline values={chart} bars={bars} />
                    </div>
                </div>
            </div>
        </Panel>
    );
}

function AlertIcon({ alert }: { alert: AlertRow }) {
    const Icon = alert.icon;

    return (
        <span className='flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: RED }}>
            <Icon className='h-[14px] w-[14px]' style={{ color: RED }} />
        </span>
    );
}

function AlertsPanel() {
    return (
        <Panel>
            <div className='px-4 pb-2 pt-4 sm:px-5'>
                <p className='text-[10px] font-medium uppercase text-[#eeeeea]'>Recent Market Movers Alerts</p>

                <div className='mt-2'>
                    {alertRows.map((alert) => (
                        <div
                            key={alert.title}
                            className='grid min-h-[56px] grid-cols-[minmax(0,1fr)_100px] items-center gap-3 border-b border-white/[0.07] last:border-b-0 sm:grid-cols-[1.5fr_1fr_.45fr_20px]'
                        >
                            <div className='flex min-w-0 items-center gap-3'>
                                <AlertIcon alert={alert} />

                                <div className='min-w-0'>
                                    <p className='truncate text-[11px] text-[#ededE9]'>{alert.title}</p>
                                    <p className='mt-0.5 truncate text-[9px] text-[#93948f]'>{alert.subtitle}</p>
                                </div>
                            </div>

                            <div className='hidden sm:block'>
                                <Sparkline values={alert.chart} />
                            </div>

                            <div className='text-right sm:text-left'>
                                <p className='text-[9px] text-[#d7d7d3]'>Triggered</p>
                                <p className='mt-0.5 text-[8px] text-[#8f908c]'>{alert.time}</p>
                            </div>

                            <span className='hidden h-[8px] w-[8px] rounded-full bg-[#f33939] shadow-[0_0_9px_rgba(243,57,57,0.7)] sm:block' />
                        </div>
                    ))}
                </div>

                <div className='flex justify-center border-t border-white/[0.05] py-2'>
                    <button type='button' className='group flex items-center gap-2 text-[10px]' style={{ color: RED }}>
                        View All Alerts
                        <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-1' />
                    </button>
                </div>
            </div>
        </Panel>
    );
}

const MarketMoversPage: NextPage = () => {
    return (
        <>
            <HeroSection />

            <main
                className='market-movers-page min-h-screen overflow-hidden text-white'
                style={{
                    background:
                        'radial-gradient(circle at 77% 10%, rgba(180,27,27,0.045), transparent 27%), linear-gradient(180deg, #040505 0%, #060707 52%, #040505 100%)',
                }}
            >
                {/* HERO */}
                <section className='relative overflow-hidden border-b border-white/[0.10]'>
                    <div className='mx-auto grid w-full max-w-[1180px] items-center gap-8 px-5 pb-7 pt-5 sm:px-8 sm:pb-9 sm:pt-7 lg:grid-cols-[0.42fr_0.58fr] lg:gap-2 lg:px-9'>
                        <div className='relative z-10'>
                            <p className='text-[11px] font-medium uppercase tracking-[0.055em]' style={{ color: ORANGE_LIGHT }}>
                                Track what moves the market.
                            </p>

                            <h1 className='movers-serif page-hero-title mt-3 text-[52px] leading-[0.94] tracking-[-0.045em] sm:text-[67px] lg:text-[70px]'>
                                <span style={{ color: RED }}>Market Movers.</span>
                                <br />
                                <span className='text-[#f4f2ed]'>Stay informed.</span>
                            </h1>

                            <p className='mt-5 max-w-[440px] text-[16px] leading-[1.5] text-[#dededb] sm:text-[17px]'>
                                Discover the biggest market movers in real time
                                <br className='hidden sm:block' /> and act on what matters most.
                            </p>

                            <div className='page-hero-features mt-8 grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-7'>
                                {heroFeatures.map(({ icon: Icon, title, body }) => (
                                    <div key={title}>
                                        <div className='flex h-[53px] w-[53px] items-center justify-center rounded-full border' style={{ borderColor: ORANGE }}>
                                            <Icon className='h-6 w-6' strokeWidth={1.5} style={{ color: ORANGE_LIGHT }} />
                                        </div>

                                        <h3 className='mt-3 text-[13px] font-medium text-[#eeeeea]'>{title}</h3>

                                        <p className='mt-1.5 max-w-[140px] text-[10px] leading-[1.45] text-[#aaaba7]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='page-hero-art relative flex min-h-[200px] items-center sm:min-h-[270px] lg:min-h-[380px]'>
                            <HeroArtwork />
                        </div>
                    </div>
                </section>

                <div className='mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-9'>
                    {/* SECTION 01 */}
                    <section className='grid gap-7 border-b border-white/[0.10] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro number='01' title="Today's Market Movers" description='See the stocks making the biggest moves right now.'>
                            <div className='mt-8 grid max-w-[280px] grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3'>
                                {sectionOneTools.map(({ icon: Icon, title }) => (
                                    <div key={title} className='text-center'>
                                        <div
                                            className='mx-auto flex h-[37px] w-[37px] items-center justify-center rounded-full border'
                                            style={{ borderColor: RED }}
                                        >
                                            <Icon className='h-[18px] w-[18px]' strokeWidth={1.5} style={{ color: ORANGE_LIGHT }} />
                                        </div>

                                        <p className='mt-2 text-[9px] leading-[1.25] text-[#c3c4c0]'>{title}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionIntro>

                        <MoversPanel />
                    </section>

                    {/* SECTION 02 */}
                    <section className='grid gap-7 border-b border-white/[0.10] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro number='02' title='Understand the Move' description="Explore what's driving the biggest market moves.">
                            <ul className='mt-5 space-y-2'>
                                <CheckItem>Price change and percentage</CheckItem>
                                <CheckItem>Volume vs. average</CheckItem>
                                <CheckItem>News and catalyst highlights</CheckItem>
                                <CheckItem>Sector and market impact</CheckItem>
                            </ul>
                        </SectionIntro>

                        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                            <DriverCard
                                label='Biggest Gainer'
                                symbol='NVDA'
                                company='NVIDIA Corporation'
                                price='$950.02'
                                change='+7.42%'
                                positive
                                volume='68.4M'
                                average='+215%'
                                catalyst='Strong earnings beat and raised guidance.'
                                badge='N'
                                badgeBg='#76b900'
                                badgeColor='#071004'
                                chart={[20, 23, 22, 26, 27, 31, 33, 35, 38, 41, 48]}
                            />

                            <DriverCard
                                label='Biggest Loser'
                                symbol='SPOT'
                                company='Spotify Technology'
                                price='$291.26'
                                change='-4.21%'
                                positive={false}
                                volume='12.7M'
                                average='+138%'
                                catalyst='Missed revenue estimates and lowered outlook.'
                                badge='S'
                                badgeBg='#1ed760'
                                badgeColor='#061109'
                                chart={[45, 43, 40, 41, 37, 35, 32, 30, 28, 25, 23]}
                            />

                            <DriverCard
                                label='Most Active'
                                symbol='TSLA'
                                company='Tesla, Inc.'
                                price='$173.24'
                                change='+1.18%'
                                positive
                                volume='112.6M'
                                average='+189%'
                                catalyst='High options activity and market momentum.'
                                badge='T'
                                badgeBg='#d64040'
                                badgeColor='#ffffff'
                                chart={[20, 27, 23, 31, 28, 35, 26, 37, 30, 34, 29]}
                                bars
                            />
                        </div>
                    </section>

                    {/* SECTION 03 */}
                    <section className='grid gap-7 border-b border-white/[0.10] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro number='03' title='Custom Alerts' description='Set custom alerts for moves that matter most to you.'>
                            <div className='mt-8 grid max-w-[280px] grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3'>
                                {alertTools.map(({ icon: Icon, title }) => (
                                    <div key={title} className='text-center'>
                                        <Icon className='mx-auto h-[27px] w-[27px]' strokeWidth={1.35} style={{ color: ORANGE_LIGHT }} />

                                        <p className='mt-2 text-[9px] leading-[1.25] text-[#c3c4c0]'>{title}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionIntro>

                        <AlertsPanel />
                    </section>

                    {/* SECTION 04 */}
                    <section className='py-6'>
                        <div className='grid gap-8 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                            <SectionIntro number='04' title='From Insight to Action' description='Turn market movement into smart decisions.' />

                            <div className='page-mobile-grid grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3'>
                                {actionSteps.map(({ icon: Icon, number, title, body }) => (
                                    <div key={number} className='flex flex-col items-center text-center'>
                                        <div className='flex h-[52px] w-[52px] items-center justify-center rounded-full border' style={{ borderColor: ORANGE }}>
                                            <Icon className='h-6 w-6' strokeWidth={1.4} style={{ color: ORANGE_LIGHT }} />
                                        </div>

                                        <p className='mt-2 text-[9px] text-[#bdbeba]'>{number}</p>

                                        <h3 className='mt-1 text-[10px] font-medium text-[#eeeeea]'>{title}</h3>

                                        <p className='mt-1.5 max-w-[130px] text-[8px] leading-[1.4] text-[#a0a19d]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className='mt-5 flex flex-col gap-5 rounded-[11px] border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6'
                            style={{
                                borderColor: BORDER,
                                background: 'linear-gradient(180deg, rgba(9,9,9,0.98), rgba(5,6,6,0.98))',
                            }}
                        >
                            <div className='flex items-center gap-4'>
                                <div className='flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: RED }}>
                                    <Target className='h-[24px] w-[24px]' strokeWidth={1.5} style={{ color: RED }} />
                                </div>

                                <div>
                                    <p className='text-[12px] text-[#eeeeea]'>Track what moves. Act with confidence.</p>

                                    <p className='mt-1 text-[10px] text-[#aaaba7]'>Market Movers keeps you one step ahead.</p>
                                </div>
                            </div>

                            <Link
                                href='#'
                                className='group flex min-h-[46px] w-full items-center justify-center gap-6 rounded-[4px] border px-7 text-[12px] font-medium uppercase tracking-[0.025em] transition-colors hover:bg-[#e54848]/[0.05] sm:w-[315px]'
                                style={{
                                    color: ORANGE_LIGHT,
                                    borderColor: ORANGE,
                                }}
                            >
                                Explore Market Movers
                                <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            <style jsx global>{`
                .market-movers-page {
                    font-family: 'Roboto', Arial, Helvetica, sans-serif;
                    background-color: ${PAGE_BG};
                    -webkit-font-smoothing: antialiased;
                    text-rendering: geometricPrecision;
                }

                .market-movers-page h1,
                .market-movers-page h2,
                .market-movers-page h3,
                .market-movers-page h4,
                .market-movers-page h5,
                .market-movers-page h6 {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                    overflow-wrap: normal;
                    word-break: normal;
                }

                .market-movers-page .movers-serif {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                }

                .market-movers-page button,
                .market-movers-page a {
                    -webkit-tap-highlight-color: transparent;
                }

                .market-movers-page *,
                .market-movers-page *::before,
                .market-movers-page *::after {
                    box-sizing: border-box;
                    min-width: 0;
                }

                @media (max-width: 639px) {
                    .market-movers-page {
                        overflow-wrap: normal;
                        word-break: normal;
                    }

                    .market-movers-page .page-hero-title {
                        font-size: clamp(1.9rem, 8.6vw, 2.25rem) !important;
                        line-height: 1.13 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .market-movers-page .page-section-number {
                        font-size: 1.95rem !important;
                        line-height: 1 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .market-movers-page .page-section-title {
                        font-size: clamp(1rem, 5vw, 1.22rem) !important;
                        line-height: 1.3 !important;
                        letter-spacing: -0.01em !important;
                    }

                    .market-movers-page .page-hero-features {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                        gap: 0.85rem !important;
                        margin-top: 1.35rem !important;
                    }

                    .market-movers-page .page-hero-features > * {
                        min-width: 0;
                    }

                    .market-movers-page .page-hero-features > * > div:first-child {
                        width: 2.75rem !important;
                        height: 2.75rem !important;
                    }

                    .market-movers-page .page-hero-features h3 {
                        margin-top: 0.55rem !important;
                        font-size: 0.64rem !important;
                        line-height: 1.35 !important;
                    }

                    .market-movers-page .page-hero-features p {
                        margin-top: 0.35rem !important;
                        font-size: 0.5rem !important;
                        line-height: 1.35 !important;
                    }

                    .market-movers-page .page-hero-art {
                        min-height: 11.5rem !important;
                        margin-top: 0.25rem !important;
                    }

                    .market-movers-page .page-mobile-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 0.75rem !important;
                    }

                    .market-movers-page .page-mobile-grid > * {
                        min-height: 0 !important;
                        border-left: 0 !important;
                        border-right: 0 !important;
                        border-top: 0 !important;
                        border-bottom: 0 !important;
                    }

                    .market-movers-page .page-compact-card {
                        min-height: 0 !important;
                        padding: 0.9rem 0.65rem !important;
                    }

                    .market-movers-page p,
                    .market-movers-page li,
                    .market-movers-page td,
                    .market-movers-page th,
                    .market-movers-page dd,
                    .market-movers-page dt {
                        overflow-wrap: normal;
                        word-break: normal;
                    }
                }
            `}</style>
        </>
    );
};

export default MarketMoversPage;
