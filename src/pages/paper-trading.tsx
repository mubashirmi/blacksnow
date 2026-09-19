import ComingSoonTrigger from '@/components/ComingSoonTrigger';
import HeroSection from '@/components/MainHeroSection';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    BrainCircuit,
    Check,
    Clock3,
    Grid2X2,
    LineChart,
    ShieldCheck,
    Target,
    Trophy,
    UserPlus,
    WalletCards,
    type LucideIcon,
} from 'lucide-react';
import type { NextPage } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';

type StrategyRow = {
    strategy: string;
    pnl: string;
    positive: boolean;
    winRate: string;
    trades: string;
    profitFactor: string;
};

const GREEN = '#7fbd3f';
const GREEN_BRIGHT = '#88c844';
const GOLD = '#e2ad3c';
const GOLD_LIGHT = '#f0c55d';
const PAGE_BG = '#050705';
const BORDER = 'rgba(224,173,60,0.20)';

const strategyRows: StrategyRow[] = [
    {
        strategy: 'Momentum Breakout',
        pnl: '+$4,320.00',
        positive: true,
        winRate: '62.5%',
        trades: '48',
        profitFactor: '1.85',
    },
    {
        strategy: 'Trend Following',
        pnl: '+$2,780.00',
        positive: true,
        winRate: '58.3%',
        trades: '36',
        profitFactor: '1.62',
    },
    {
        strategy: 'Mean Reversion',
        pnl: '-$1,120.00',
        positive: false,
        winRate: '41.7%',
        trades: '24',
        profitFactor: '0.78',
    },
    {
        strategy: 'VWAP Pullback',
        pnl: '+$1,980.00',
        positive: true,
        winRate: '55.6%',
        trades: '27',
        profitFactor: '1.34',
    },
];

const heroFeatures: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
}> = [
    {
        icon: BarChart3,
        title: 'Practice',
        description: 'Simulate real markets with real-time data.',
    },
    {
        icon: BookOpen,
        title: 'Learn',
        description: 'Improve your strategies and trading decisions.',
    },
    {
        icon: ShieldCheck,
        title: 'Confident',
        description: 'Trade with virtual funds, before using real capital.',
    },
];

const confidenceBenefits: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
}> = [
    {
        icon: Target,
        title: 'Risk-Free Practice',
        description: 'No financial risk while you learn and grow.',
    },
    {
        icon: BrainCircuit,
        title: 'Improve Discipline',
        description: 'Build consistent habits and stick to your plan.',
    },
    {
        icon: BarChart3,
        title: 'Track Progress',
        description: 'Detailed analytics to measure improvement.',
    },
    {
        icon: Trophy,
        title: 'Prepare to Succeed',
        description: 'Gain the experience you need to go live.',
    },
];

const startSteps: Array<{
    icon: LucideIcon;
    number: string;
    title: string;
    description: string;
}> = [
    {
        icon: UserPlus,
        number: '01',
        title: 'Create Account',
        description: 'Sign up in seconds and choose paper trading.',
    },
    {
        icon: WalletCards,
        number: '02',
        title: 'Get Virtual Funds',
        description: 'Receive $100,000 in virtual capital to start trading.',
    },
    {
        icon: BarChart3,
        number: '03',
        title: 'Start Trading',
        description: 'Place trades and test your strategies in real market conditions.',
    },
    {
        icon: LineChart,
        number: '04',
        title: 'Analyze & Improve',
        description: 'Review performance and keep refining your approach.',
    },
];

function CheckItem({ children }: { children: ReactNode }) {
    return (
        <li className='flex items-start gap-2.5 text-[13px] leading-[1.5] text-[#d0d1ce] sm:text-[14px]'>
            <span className='mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: GREEN }}>
                <Check className='h-[11px] w-[11px]' strokeWidth={2.7} style={{ color: GREEN }} />
            </span>
            <span>{children}</span>
        </li>
    );
}

function SectionIntro({ number, title, description, children }: { number: string; title: string; description: string; children?: ReactNode }) {
    return (
        <div className='min-w-0 lg:pr-5'>
            <div className='flex items-center gap-3'>
                <span className='paper-serif text-[44px] leading-none tracking-[-0.04em]' style={{ color: GREEN }}>
                    {number}
                </span>

                <span
                    className='mt-1 h-px w-9'
                    style={{
                        background: `linear-gradient(90deg, ${GOLD}, rgba(226,173,60,0.3))`,
                    }}
                />
            </div>

            <h2 className='paper-serif mt-1 text-[27px] leading-[1.06] tracking-[-0.025em] text-[#f5f3ed] sm:text-[31px]'>{title}</h2>

            <p className='mt-3 max-w-[275px] text-[13px] leading-[1.6] text-[#d0d0cd] sm:text-[14px]'>{description}</p>

            {children}
        </div>
    );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={`overflow-hidden rounded-[13px] border ${className}`}
            style={{
                borderColor: BORDER,
                background: 'linear-gradient(180deg, rgba(9,11,9,0.98) 0%, rgba(6,8,7,0.98) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.025), 0 18px 45px rgba(0,0,0,0.20)',
            }}
        >
            {children}
        </div>
    );
}

function HeroArtwork() {
    return (
        <div className='relative mx-auto aspect-[564/330] w-full max-w-[610px]'>
            <div
                className='pointer-events-none absolute inset-[8%] blur-3xl'
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(110,171,54,0.11), rgba(223,170,58,0.04) 43%, transparent 72%)',
                }}
            />

            <Image
                src='/images/paper-trading-hero-map.webp'
                alt='Global paper trading market simulation'
                fill
                priority
                quality={100}
                sizes='(max-width: 1023px) 100vw, 610px'
                className='relative z-10 object-contain object-center'
            />

            <div className='pointer-events-none absolute inset-y-0 left-0 z-20 w-[3%] bg-gradient-to-r from-[#050705] to-transparent' />
            <div className='pointer-events-none absolute inset-y-0 right-0 z-20 w-[2%] bg-gradient-to-l from-[#050705] to-transparent' />
            <div className='pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[4%] bg-gradient-to-t from-[#050705] to-transparent' />
        </div>
    );
}

function PerformanceChart() {
    return (
        <div className='relative h-[175px] w-full sm:h-[205px]'>
            <svg viewBox='0 0 610 205' preserveAspectRatio='none' className='absolute inset-0 h-full w-full' aria-hidden='true'>
                <defs>
                    <linearGradient id='paperAreaGradient' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor={GREEN_BRIGHT} stopOpacity='0.42' />
                        <stop offset='70%' stopColor={GREEN_BRIGHT} stopOpacity='0.12' />
                        <stop offset='100%' stopColor={GREEN_BRIGHT} stopOpacity='0' />
                    </linearGradient>
                </defs>

                {[32, 76, 120, 164].map((y) => (
                    <line key={y} x1='52' y1={y} x2='600' y2={y} stroke='rgba(255,255,255,0.08)' strokeDasharray='2 3' />
                ))}

                <path
                    d='M58 160
                       L100 142
                       L142 126
                       L184 141
                       L226 118
                       L268 96
                       L310 95
                       L352 76
                       L394 93
                       L436 77
                       L478 75
                       L520 65
                       L562 43
                       L596 49
                       L596 184
                       L58 184 Z'
                    fill='url(#paperAreaGradient)'
                />

                <path
                    d='M58 160
                       L100 142
                       L142 126
                       L184 141
                       L226 118
                       L268 96
                       L310 95
                       L352 76
                       L394 93
                       L436 77
                       L478 75
                       L520 65
                       L562 43
                       L596 49'
                    fill='none'
                    stroke={GREEN_BRIGHT}
                    strokeWidth='2'
                    vectorEffect='non-scaling-stroke'
                />

                {[
                    [58, 160],
                    [100, 142],
                    [142, 126],
                    [184, 141],
                    [226, 118],
                    [268, 96],
                    [310, 95],
                    [352, 76],
                    [394, 93],
                    [436, 77],
                    [478, 75],
                    [520, 65],
                    [562, 43],
                    [596, 49],
                ].map(([cx, cy]) => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r='4' fill='#10150d' stroke='#a9d975' strokeWidth='1.5' />
                ))}
            </svg>

            <div className='pointer-events-none absolute left-0 top-[3px] flex h-[calc(100%-25px)] w-[42px] flex-col justify-between text-[10px] text-[#b3b6b0]'>
                <span>$102K</span>
                <span>$100K</span>
                <span>$98K</span>
                <span>$96K</span>
            </div>

            <div className='absolute bottom-0 left-[52px] right-0 flex justify-between text-[10px] text-[#b7bab5] sm:text-[11px]'>
                <span>May 6</span>
                <span>May 7</span>
                <span>May 8</span>
                <span>May 9</span>
                <span>May 10</span>
                <span className='hidden sm:inline'>May 13</span>
                <span>May 14</span>
            </div>
        </div>
    );
}

function AccountOverview() {
    return (
        <Panel>
            <div className='px-5 pb-4 pt-4 sm:px-6 sm:pb-5'>
                <p className='text-[12px] font-medium uppercase tracking-[0.02em]' style={{ color: GOLD_LIGHT }}>
                    Paper Account Overview
                </p>

                <div className='mt-3 border-t border-white/[0.09] pt-3'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-0'>
                        <div className='sm:border-r sm:border-white/[0.10] sm:pr-7'>
                            <p className='text-[11px] text-[#b9bbb7]'>Account Balance</p>

                            <p className='mt-1 text-[25px] font-light tracking-[-0.025em] text-[#f5f3ef] sm:text-[27px]'>$100,000.00</p>
                        </div>

                        <div className='sm:pl-7'>
                            <p className='text-[11px] text-[#b9bbb7]'>Day P&amp;L</p>

                            <p className='mt-1 text-[23px] font-light tracking-[-0.025em] sm:text-[25px]' style={{ color: GREEN_BRIGHT }}>
                                +$1,250.00 <span className='text-[14px] sm:text-[15px]'>(1.25%)</span>
                            </p>
                        </div>
                    </div>

                    <div className='mt-3 grid grid-cols-2 border-y border-white/[0.09] py-3 sm:grid-cols-4'>
                        {[
                            ['Buying Power', '$100,000.00'],
                            ['Net Liq', '$100,000.00'],
                            ['Margin Used', '$0.00'],
                            ['Cash', '$100,000.00'],
                        ].map(([label, value], index) => (
                            <div
                                key={label}
                                className={`min-w-0 py-1 ${index !== 3 ? 'sm:border-r sm:border-white/[0.09]' : ''} ${
                                    index % 2 === 0 ? 'pr-3' : 'pl-3 sm:px-4'
                                }`}
                            >
                                <p className='text-[10px] text-[#aeb1ac]'>{label}</p>
                                <p className='mt-1 text-[12px] text-[#ecece8]'>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className='mt-4'>
                        <PerformanceChart />
                    </div>
                </div>
            </div>
        </Panel>
    );
}

function StrategyPanel() {
    const columns = '1.7fr 1.15fr 1fr .8fr 1fr';

    return (
        <Panel>
            <div className='px-4 pb-3 pt-4 sm:px-6'>
                <p className='text-[12px] font-medium uppercase tracking-[0.02em]' style={{ color: GOLD_LIGHT }}>
                    Strategy Performance
                </p>

                <div className='mt-3 hidden sm:block'>
                    <div className='grid border-y border-white/[0.08] py-2 text-[11px] text-[#c0c0bd]' style={{ gridTemplateColumns: columns }}>
                        <div>Strategy</div>
                        <div>Total P&amp;L</div>
                        <div>Win Rate</div>
                        <div>Trades</div>
                        <div className='text-right'>Profit Factor</div>
                    </div>

                    {strategyRows.map((row) => (
                        <div
                            key={row.strategy}
                            className='grid min-h-[39px] items-center border-b border-white/[0.07] text-[12px] text-[#dededb]'
                            style={{ gridTemplateColumns: columns }}
                        >
                            <div>{row.strategy}</div>

                            <div
                                style={{
                                    color: row.positive ? GREEN_BRIGHT : '#d14949',
                                }}
                            >
                                {row.pnl}
                            </div>

                            <div>{row.winRate}</div>
                            <div>{row.trades}</div>
                            <div className='text-right'>{row.profitFactor}</div>
                        </div>
                    ))}
                </div>

                <div className='mt-2 sm:hidden'>
                    {strategyRows.map((row) => (
                        <div key={row.strategy} className='border-b border-white/[0.08] py-3 last:border-b-0'>
                            <div className='flex items-center justify-between gap-3'>
                                <p className='text-[13px] text-[#efefeb]'>{row.strategy}</p>

                                <p
                                    className='text-[12px]'
                                    style={{
                                        color: row.positive ? GREEN_BRIGHT : '#d14949',
                                    }}
                                >
                                    {row.pnl}
                                </p>
                            </div>

                            <div className='mt-2 grid grid-cols-3 gap-3'>
                                <div>
                                    <p className='text-[9px] uppercase text-[#73766f]'>Win Rate</p>
                                    <p className='mt-1 text-[11px] text-[#cacbc7]'>{row.winRate}</p>
                                </div>

                                <div>
                                    <p className='text-[9px] uppercase text-[#73766f]'>Trades</p>
                                    <p className='mt-1 text-[11px] text-[#cacbc7]'>{row.trades}</p>
                                </div>

                                <div>
                                    <p className='text-[9px] uppercase text-[#73766f]'>Profit Factor</p>
                                    <p className='mt-1 text-[11px] text-[#cacbc7]'>{row.profitFactor}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='flex justify-center pt-3'>
                    <button
                        type='button'
                        className='group flex items-center gap-2 text-[12px] transition-opacity hover:opacity-80'
                        style={{ color: GREEN_BRIGHT }}
                    >
                        View All Strategies
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </button>
                </div>
            </div>
        </Panel>
    );
}

const PaperTradingPage: NextPage = () => {
    return (
        <>
            <HeroSection />

            <main
                className='paper-trading-page min-h-screen overflow-hidden text-white'
                style={{
                    background:
                        'radial-gradient(circle at 76% 8%, rgba(99,139,42,0.045), transparent 26%), linear-gradient(180deg, #050705 0%, #060806 50%, #040604 100%)',
                }}
            >
                {/* HERO */}
                <section className='relative overflow-hidden border-b border-white/[0.10]'>
                    <div
                        className='pointer-events-none absolute inset-0 opacity-[0.14]'
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                        }}
                    />

                    <div className='relative mx-auto grid w-full max-w-[1180px] items-center gap-8 px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 lg:grid-cols-[0.43fr_0.57fr] lg:gap-3 lg:px-9'>
                        <div className='relative z-10'>
                            <p className='text-[11px] font-medium uppercase tracking-[0.055em] sm:text-[12px]' style={{ color: GOLD_LIGHT }}>
                                Practice. Learn. Trade confidently.
                            </p>

                            <h1 className='paper-serif page-hero-title mt-3 text-[51px] leading-[0.95] tracking-[-0.045em] sm:text-[64px] lg:text-[67px]'>
                                <span style={{ color: GREEN }}>Paper</span> <span className='text-[#f5f3ed]'>Trading</span>
                            </h1>

                            <div className='mt-5 h-[2px] w-[53px]' style={{ background: GOLD }} />

                            <p className='mt-5 max-w-[380px] text-[16px] leading-[1.55] text-[#dfdfdb] sm:text-[18px]'>
                                Build skills, test strategies, and gain
                                <br className='hidden sm:block' /> confidence—risk free.
                            </p>

                            <div className='page-hero-features mt-8 grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-0'>
                                {heroFeatures.map(({ icon: Icon, title, description }, index) => (
                                    <div
                                        key={title}
                                        className={`min-w-0 ${index > 0 ? 'sm:border-l sm:border-white/[0.13] sm:pl-8' : ''} ${index < 2 ? 'sm:pr-8' : ''}`}
                                    >
                                        <div className='flex h-[55px] w-[55px] items-center justify-center rounded-full border' style={{ borderColor: GOLD }}>
                                            <Icon className='h-7 w-7' strokeWidth={1.65} style={{ color: GOLD_LIGHT }} />
                                        </div>

                                        <h3 className='mt-3 text-[14px] font-medium' style={{ color: GOLD_LIGHT }}>
                                            {title}
                                        </h3>

                                        <p className='mt-2 max-w-[135px] text-[10px] leading-[1.45] text-[#b7b8b3] sm:text-[11px]'>{description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='page-hero-art relative flex min-h-[200px] items-center sm:min-h-[260px] lg:min-h-[350px]'>
                            <HeroArtwork />
                        </div>
                    </div>
                </section>

                <div className='mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-9'>
                    {/* SECTION 1 */}
                    <section className='grid gap-7 border-b border-white/[0.10] py-6 lg:grid-cols-[295px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='01'
                            title='Real Market Experience'
                            description='Trade in a live market environment with real-time data and advanced charting tools—just like real trading.'
                        >
                            <div className='mt-8 grid max-w-[285px] grid-cols-3 gap-3'>
                                {[
                                    {
                                        icon: Clock3,
                                        label: 'Real-time Data',
                                    },
                                    {
                                        icon: BarChart3,
                                        label: 'Advanced Charts',
                                    },
                                    {
                                        icon: Grid2X2,
                                        label: 'Full Platform Access',
                                    },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className='text-center'>
                                        <Icon className='mx-auto h-9 w-9' strokeWidth={1.4} style={{ color: GOLD_LIGHT }} />
                                        <p className='mt-3 text-[9px] leading-[1.35] text-[#cbccc8] sm:text-[10px]'>{label}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionIntro>

                        <AccountOverview />
                    </section>

                    {/* SECTION 2 */}
                    <section className='grid gap-7 border-b border-white/[0.10] py-6 lg:grid-cols-[295px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='02'
                            title='Test & Refine Strategies'
                            description='Experiment with different strategies and market conditions to find what works best for you.'
                        >
                            <ul className='mt-5 space-y-2'>
                                <CheckItem>Backtest Ideas</CheckItem>
                                <CheckItem>Compare Approaches</CheckItem>
                                <CheckItem>Optimize Performance</CheckItem>
                            </ul>
                        </SectionIntro>

                        <StrategyPanel />
                    </section>

                    {/* SECTION 3 */}
                    <section className='grid gap-7 border-b border-white/[0.10] py-6 lg:grid-cols-[295px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='03'
                            title='Build Confidence'
                            description='Develop discipline and confidence to make smarter decisions when real money is on the line.'
                        />

                        <div className='page-mobile-grid grid grid-cols-2 divide-y-0 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x'>
                            {confidenceBenefits.map(({ icon: Icon, title, description }) => (
                                <div
                                    key={title}
                                    className='page-compact-card flex min-h-[180px] flex-col items-center px-5 py-5 text-center sm:border-b sm:border-white/[0.08] lg:border-b-0'
                                >
                                    <Icon className='h-12 w-12' strokeWidth={1.25} style={{ color: GREEN_BRIGHT }} />

                                    <h3 className='mt-4 text-[11px] font-semibold uppercase tracking-[0.025em]' style={{ color: GOLD_LIGHT }}>
                                        {title}
                                    </h3>

                                    <p className='mt-3 max-w-[145px] text-[10px] leading-[1.5] text-[#b7b9b4]'>{description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section className='grid gap-8 py-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10'>
                        <SectionIntro
                            number='04'
                            title='Simple to Get Started'
                            description='Open a paper trading account in minutes and start practicing your edge today.'
                        />

                        <div className='relative'>
                            <div className='absolute left-[12%] right-[12%] top-[42px] hidden border-t border-dashed lg:block' style={{ borderColor: GOLD }} />

                            <div className='page-mobile-grid relative grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'>
                                {startSteps.map(({ icon: Icon, number, title, description }) => (
                                    <div key={number} className='relative flex flex-col items-center text-center'>
                                        <div
                                            className='relative z-10 flex h-[76px] w-[76px] items-center justify-center rounded-full border bg-[#060806]'
                                            style={{ borderColor: GREEN }}
                                        >
                                            <Icon className='h-9 w-9' strokeWidth={1.35} style={{ color: GREEN_BRIGHT }} />
                                        </div>

                                        <p className='mt-2 text-[20px]' style={{ color: GREEN_BRIGHT }}>
                                            {number}
                                        </p>

                                        <h3 className='mt-1 text-[13px] font-medium text-[#f1f0ec]'>{title}</h3>

                                        <p className='mt-1.5 max-w-[175px] text-[10px] leading-[1.45] text-[#babbb7]'>{description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className='pb-6'>
                        <div
                            className='flex flex-col gap-5 rounded-[13px] border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7'
                            style={{
                                borderColor: 'rgba(181,170,82,0.35)',
                                background: 'linear-gradient(180deg, rgba(10,12,9,0.98), rgba(6,8,6,0.98))',
                            }}
                        >
                            <div className='flex items-center gap-5'>
                                <div className='flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: GREEN }}>
                                    <BarChart3 className='h-6 w-6' strokeWidth={1.5} style={{ color: GREEN_BRIGHT }} />
                                </div>

                                <div>
                                    <p className='text-[12px] font-semibold uppercase tracking-[0.025em]' style={{ color: GOLD_LIGHT }}>
                                        Practice today. Trade tomorrow.
                                    </p>

                                    <p className='mt-1 text-[11px] text-[#bcbdb8] sm:text-[12px]'>Paper trading is the first step to real trading success.</p>
                                </div>
                            </div>

                            <ComingSoonTrigger
                                className='group flex min-h-[48px] w-full items-center justify-center gap-7 rounded-[5px] border px-8 text-[13px] font-medium uppercase tracking-[0.025em] transition-all hover:bg-[#e2ad3c]/[0.05] sm:w-[300px]'
                                style={{
                                    color: GOLD_LIGHT,
                                    borderColor: GOLD,
                                }}
                            >
                                Get Started
                                <ArrowRight className='h-5 w-5 transition-transform duration-200 group-hover:translate-x-1' />
                            </ComingSoonTrigger>
                        </div>
                    </section>
                </div>
            </main>

            <style jsx global>{`
                .paper-trading-page {
                    font-family: 'Roboto', Arial, Helvetica, sans-serif;
                    background-color: ${PAGE_BG};
                    -webkit-font-smoothing: antialiased;
                    text-rendering: geometricPrecision;
                }

                .paper-trading-page h1,
                .paper-trading-page h2,
                .paper-trading-page h3,
                .paper-trading-page h4,
                .paper-trading-page h5,
                .paper-trading-page h6 {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                    overflow-wrap: normal;
                    word-break: normal;
                }

                .paper-trading-page .paper-serif {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                }

                .paper-trading-page button,
                .paper-trading-page a {
                    -webkit-tap-highlight-color: transparent;
                }

                .paper-trading-page *,
                .paper-trading-page *::before,
                .paper-trading-page *::after {
                    box-sizing: border-box;
                    min-width: 0;
                }

                @media (max-width: 639px) {
                    .paper-trading-page {
                        overflow-wrap: normal;
                        word-break: normal;
                    }

                    .paper-trading-page .page-hero-title {
                        font-size: clamp(1.9rem, 8.6vw, 2.25rem) !important;
                        line-height: 1.13 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .paper-trading-page .page-section-number {
                        font-size: 1.95rem !important;
                        line-height: 1 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .paper-trading-page .page-section-title {
                        font-size: clamp(1rem, 5vw, 1.22rem) !important;
                        line-height: 1.3 !important;
                        letter-spacing: -0.01em !important;
                    }

                    .paper-trading-page .page-hero-features {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                        gap: 0.85rem !important;
                        margin-top: 1.35rem !important;
                    }

                    .paper-trading-page .page-hero-features > * {
                        min-width: 0;
                    }

                    .paper-trading-page .page-hero-features > * > div:first-child {
                        width: 2.75rem !important;
                        height: 2.75rem !important;
                    }

                    .paper-trading-page .page-hero-features h3 {
                        margin-top: 0.55rem !important;
                        font-size: 0.64rem !important;
                        line-height: 1.35 !important;
                    }

                    .paper-trading-page .page-hero-features p {
                        margin-top: 0.35rem !important;
                        font-size: 0.5rem !important;
                        line-height: 1.35 !important;
                    }

                    .paper-trading-page .page-hero-art {
                        min-height: 11.5rem !important;
                        margin-top: 0.25rem !important;
                    }

                    .paper-trading-page .page-mobile-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 0.75rem !important;
                    }

                    .paper-trading-page .page-mobile-grid > * {
                        min-height: 0 !important;
                        border-left: 0 !important;
                        border-right: 0 !important;
                        border-top: 0 !important;
                        border-bottom: 0 !important;
                    }

                    .paper-trading-page .page-compact-card {
                        min-height: 0 !important;
                        padding: 0.9rem 0.65rem !important;
                    }

                    .paper-trading-page p,
                    .paper-trading-page li,
                    .paper-trading-page td,
                    .paper-trading-page th,
                    .paper-trading-page dd,
                    .paper-trading-page dt {
                        overflow-wrap: normal;
                        word-break: normal;
                    }
                }
            `}</style>
        </>
    );
};

export default PaperTradingPage;
