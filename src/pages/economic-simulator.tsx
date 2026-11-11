import ComingSoonTrigger from '@/components/ComingSoonTrigger';
import HeroSection from '@/components/MainHeroSection';
import {
    ArrowRight,
    BarChart3,
    Building2,
    Check,
    CircleDollarSign,
    Database,
    FileText,
    Gauge,
    Globe2,
    Landmark,
    LineChart,
    PanelsTopLeft,
    Settings,
    ShieldCheck,
    ShoppingCart,
    SlidersHorizontal,
    Target,
    UserRound,
    Users,
    type LucideIcon,
} from 'lucide-react';
import type { NextPage } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';

type ModelNode = {
    icon: LucideIcon;
    label: string;
};

type ScenarioRow = {
    name: string;
    color: string;
    growth: string;
    inflation: string;
    unemployment: string;
    debt: string;
};

const PURPLE = '#4333AF';
const PURPLE_BRIGHT = '#4333AF';
const PURPLE_SOFT = '#4333AF';
const GOLD = '#4333AF';
const GOLD_LIGHT = '#4333AF';
const GREEN = '#4333AF';
const PAGE_BG = '#050608';
const BORDER = '#414A5D';

const modelLeft: ModelNode[] = [
    { icon: UserRound, label: 'Households' },
    { icon: Building2, label: 'Firms' },
    { icon: Landmark, label: 'Government' },
];

const modelRight: ModelNode[] = [
    { icon: Globe2, label: 'Rest of World' },
    { icon: Landmark, label: 'Central Bank' },
    { icon: Database, label: 'Financial Sector' },
];

const modelFeatures: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: Landmark,
        title: 'Sectors',
        body: 'Define industries and markets.',
    },
    {
        icon: Users,
        title: 'Agents',
        body: 'Households, firms, government.',
    },
    {
        icon: CircleDollarSign,
        title: 'Policies',
        body: 'Taxes, spending, interest rates.',
    },
    {
        icon: Settings,
        title: 'Parameters',
        body: 'Adjust model assumptions.',
    },
];

const resultTools: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: PanelsTopLeft,
        title: 'Dashboards',
        body: 'Interactive visual insights',
    },
    {
        icon: Gauge,
        title: 'KPIs',
        body: 'Track key macro indicators',
    },
    {
        icon: FileText,
        title: 'Reports',
        body: 'Export and share detailed results',
    },
    {
        icon: SlidersHorizontal,
        title: 'Compare',
        body: 'Side-by-side scenario comparison',
    },
];

const decisionTools: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: Target,
        title: 'Test Policies',
        body: 'Evaluate the potential impact before implementation.',
    },
    {
        icon: ShieldCheck,
        title: 'Manage Risks',
        body: 'Identify vulnerabilities and downside risks.',
    },
    {
        icon: Globe2,
        title: 'Plan Ahead',
        body: 'Prepare for different futures with confidence.',
    },
    {
        icon: Check,
        title: 'Support Decisions',
        body: 'Back decisions with data-driven insights.',
    },
];

const scenarioRows: ScenarioRow[] = [
    {
        name: 'Baseline',
        color: '#4333AF',
        growth: '2.3',
        inflation: '2.1',
        unemployment: '5.3',
        debt: '71.5',
    },
    {
        name: 'Expansionary Policy',
        color: 'rgba(67,51,175,0.78)',
        growth: '3.8',
        inflation: '2.4',
        unemployment: '5.1',
        debt: '68.7',
    },
    {
        name: 'Austerity',
        color: 'rgba(67,51,175,0.55)',
        growth: '0.7',
        inflation: '1.6',
        unemployment: '6.2',
        debt: '65.9',
    },
    {
        name: 'Recession Shock',
        color: '#414A5D',
        growth: '-2.1',
        inflation: '1.2',
        unemployment: '7.8',
        debt: '75.3',
    },
];

function SectionIntro({ number, title, description, children }: { number: string; title: string; description: string; children?: ReactNode }) {
    return (
        <div className='min-w-0 lg:pr-5'>
            <div className='flex items-center gap-3'>
                <span className='simulator-serif page-section-number text-[43px] leading-none tracking-[-0.04em]' style={{ color: PURPLE_SOFT }}>
                    {number}
                </span>

                <span
                    className='mt-1 h-px w-10'
                    style={{
                        background: `linear-gradient(90deg, ${PURPLE_BRIGHT}, rgba(67,51,175,0.18))`,
                    }}
                />
            </div>

            <h2 className='simulator-serif page-section-title mt-1 text-[28px] leading-[1.32] tracking-[-0.025em] text-[#f4f1ee] sm:text-[31px]'>{title}</h2>

            <p className='mt-3 max-w-[285px] text-[13px] leading-[1.55] text-[#d0d0d2] sm:text-[14px]'>{description}</p>

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
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02), 0 18px 42px rgba(0,0,0,0.22)',
            }}
        >
            {children}
        </div>
    );
}

function CheckItem({ children }: { children: ReactNode }) {
    return (
        <li className='flex items-start gap-2.5 text-[13px] leading-[1.48] text-[#d2d1d4] sm:text-[14px]'>
            <span className='mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full' style={{ background: PURPLE }}>
                <Check className='h-[11px] w-[11px] text-white' strokeWidth={2.8} />
            </span>

            <span>{children}</span>
        </li>
    );
}

function HeroArtwork() {
    return (
        <div className='relative mx-auto aspect-[625/400] w-full max-w-[640px]'>
            <div
                className='pointer-events-none absolute inset-[6%] blur-3xl'
                style={{
                    background: 'radial-gradient(ellipse, rgba(67,51,175,0.10), rgba(67,51,175,0.025) 48%, transparent 75%)',
                }}
            />

            <Image
                src='/images/economic-simulator-hero-globe.webp'
                alt='Interactive global economic simulator'
                fill
                priority
                quality={100}
                sizes='(max-width: 1023px) 100vw, 640px'
                className='relative z-10 object-contain object-center'
            />

            <div className='pointer-events-none absolute inset-y-0 left-0 z-20 w-[2%] bg-gradient-to-r from-[#050608] to-transparent' />
            <div className='pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[3%] bg-gradient-to-t from-[#050608] to-transparent' />
        </div>
    );
}

function ModelBox({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return (
        <div className='flex min-h-[48px] items-center gap-2 rounded-[6px] border border-[#414A5D] bg-[#000000] px-2 lg:min-h-[55px] lg:gap-3 lg:px-4'>
            <Icon className='h-6 w-6 shrink-0' strokeWidth={1.35} style={{ color: PURPLE_SOFT }} />

            <span className='text-[12px] text-[#e7e5e8]'>{label}</span>
        </div>
    );
}

function Connector({ flip = false }: { flip?: boolean }) {
    return (
        <div className='hidden items-center lg:flex'>
            <span className='h-px flex-1 border-t border-dashed' style={{ borderColor: PURPLE_SOFT }} />

            <span className='px-1 text-[15px]' style={{ color: PURPLE_SOFT }}>
                {flip ? '←' : '→'}
            </span>
        </div>
    );
}

function ModelStructure() {
    return (
        <Panel>
            <div className='px-5 pb-5 pt-4 sm:px-6'>
                <p className='text-center text-[11px] font-medium uppercase tracking-[0.02em]' style={{ color: PURPLE_SOFT }}>
                    Economic Model Structure
                </p>

                <div className='mt-4 grid gap-4 lg:grid-cols-[1fr_58px_1fr_58px_1fr]'>
                    <div className='grid grid-cols-3 gap-2 lg:block lg:space-y-3'>
                        {modelLeft.map((item) => (
                            <ModelBox key={item.label} icon={item.icon} label={item.label} />
                        ))}
                    </div>

                    <div className='hidden flex-col justify-around py-6 lg:flex'>
                        <Connector />
                        <Connector flip />
                        <Connector />
                    </div>

                    <div className='flex items-center'>
                        <div className='flex min-h-[125px] w-full flex-col items-center justify-center rounded-[8px] border border-[#414A5D] bg-[#000000] px-4 text-center'>
                            <ShoppingCart className='h-8 w-8' strokeWidth={1.3} style={{ color: PURPLE_SOFT }} />

                            <p className='mt-2 text-[11px] font-medium' style={{ color: PURPLE_SOFT }}>
                                Markets
                            </p>

                            <p className='mt-1 text-[9px] leading-[1.45] text-[#d1d0d2]'>
                                Goods · Labor · Capital
                                <br />
                                Financial
                            </p>
                        </div>
                    </div>

                    <div className='hidden flex-col justify-around py-6 lg:flex'>
                        <Connector />
                        <Connector flip />
                        <Connector />
                    </div>

                    <div className='grid grid-cols-3 gap-2 lg:block lg:space-y-3'>
                        {modelRight.map((item) => (
                            <ModelBox key={item.label} icon={item.icon} label={item.label} />
                        ))}
                    </div>
                </div>
            </div>
        </Panel>
    );
}

function ScenarioChart() {
    return (
        <div className='relative h-[245px] w-full'>
            <svg viewBox='0 0 560 245' preserveAspectRatio='none' className='absolute inset-0 h-full w-full' aria-hidden='true'>
                {[28, 72, 116, 160, 204].map((y) => (
                    <line key={y} x1='39' y1={y} x2='544' y2={y} stroke='rgba(255,255,255,0.08)' strokeDasharray='2 3' />
                ))}

                <line x1='39' y1='25' x2='39' y2='205' stroke='rgba(255,255,255,0.26)' />

                <line x1='39' y1='205' x2='544' y2='205' stroke='rgba(255,255,255,0.26)' />

                <polyline
                    points='45,119 91,82 137,75 183,70 229,58 275,58 321,45 367,42 413,32 459,40 505,36 540,26'
                    fill='none'
                    stroke='#4333AF'
                    strokeWidth='2'
                    vectorEffect='non-scaling-stroke'
                />

                <polyline
                    points='45,119 91,67 137,55 183,52 229,45 275,45 321,33 367,30 413,22 459,28 505,24 540,17'
                    fill='none'
                    stroke='#4333AF'
                    strokeWidth='2'
                    vectorEffect='non-scaling-stroke'
                />

                <polyline
                    points='45,119 91,112 137,110 183,111 229,114 275,116 321,119 367,121 413,123 459,124 505,124 540,124'
                    fill='none'
                    stroke='#4333AF'
                    strokeWidth='2'
                    vectorEffect='non-scaling-stroke'
                />

                <polyline
                    points='45,119 91,128 137,139 183,148 229,159 275,168 321,178 367,185 413,190 459,195 505,198 540,201'
                    fill='none'
                    stroke='#919196'
                    strokeWidth='2'
                    vectorEffect='non-scaling-stroke'
                />

                {[
                    [
                        '#4333AF',
                        [
                            [45, 119],
                            [91, 82],
                            [137, 75],
                            [183, 70],
                            [229, 58],
                            [275, 58],
                            [321, 45],
                            [367, 42],
                            [413, 32],
                            [459, 40],
                            [505, 36],
                            [540, 26],
                        ],
                    ],
                    [
                        '#4333AF',
                        [
                            [45, 119],
                            [91, 67],
                            [137, 55],
                            [183, 52],
                            [229, 45],
                            [275, 45],
                            [321, 33],
                            [367, 30],
                            [413, 22],
                            [459, 28],
                            [505, 24],
                            [540, 17],
                        ],
                    ],
                    [
                        '#4333AF',
                        [
                            [45, 119],
                            [91, 112],
                            [137, 110],
                            [183, 111],
                            [229, 114],
                            [275, 116],
                            [321, 119],
                            [367, 121],
                            [413, 123],
                            [459, 124],
                            [505, 124],
                            [540, 124],
                        ],
                    ],
                    [
                        '#919196',
                        [
                            [45, 119],
                            [91, 128],
                            [137, 139],
                            [183, 148],
                            [229, 159],
                            [275, 168],
                            [321, 178],
                            [367, 185],
                            [413, 190],
                            [459, 195],
                            [505, 198],
                            [540, 201],
                        ],
                    ],
                ].map(([color, coords]) =>
                    (coords as number[][]).map(([cx, cy]) => <circle key={`${color}-${cx}-${cy}`} cx={cx} cy={cy} r='2.3' fill={color as string} />)
                )}
            </svg>

            <div className='pointer-events-none absolute bottom-[35px] left-0 top-[12px] flex w-8 flex-col justify-between text-[9px] text-[#a9a8ab]'>
                <span>6</span>
                <span>3</span>
                <span>0</span>
                <span>-3</span>
                <span>-6</span>
            </div>

            <div className='absolute bottom-1 left-[40px] right-1 flex justify-between text-[9px] text-[#b9b8bb]'>
                <span>2024</span>
                <span>2026</span>
                <span>2028</span>
                <span>2030</span>
                <span>2032</span>
                <span>2034</span>
            </div>
        </div>
    );
}

function ScenarioControls() {
    return (
        <Panel className='h-full'>
            <div className='px-4 pb-4 pt-4'>
                <p className='text-[10px] font-medium uppercase' style={{ color: PURPLE_SOFT }}>
                    Scenario Controls
                </p>

                <div className='mt-4 space-y-3'>
                    <label className='block'>
                        <span className='mb-1 block text-[8px] text-[#b5b4b7]'>Scenario</span>

                        <div className='flex min-h-[35px] items-center justify-between rounded-[4px] border border-[#414A5D] bg-[#000000] px-3 text-[9px] text-[#e4e3e5]'>
                            Expansionary Policy
                            <span>⌄</span>
                        </div>
                    </label>

                    <label className='block'>
                        <span className='mb-1 block text-[8px] text-[#b5b4b7]'>Fiscal Stimulus</span>

                        <div className='grid grid-cols-[1fr_75px] overflow-hidden rounded-[4px] border border-[#414A5D] bg-[#000000]'>
                            <div className='flex min-h-[35px] items-center px-3 text-[10px]'>2.0</div>

                            <div className='flex items-center justify-center border-l border-[#414A5D] text-[8px] text-[#bdbcc0]'>% of GDP</div>
                        </div>
                    </label>

                    <label className='block'>
                        <span className='mb-1 block text-[8px] text-[#b5b4b7]'>Interest Rate Change</span>

                        <div className='grid grid-cols-[1fr_40px] overflow-hidden rounded-[4px] border border-[#414A5D] bg-[#000000]'>
                            <div className='flex min-h-[35px] items-center justify-between px-3 text-[10px]'>
                                -1.00
                                <span>⌄</span>
                            </div>

                            <div className='flex items-center justify-center border-l border-[#414A5D] text-[8px] text-[#bdbcc0]'>pp</div>
                        </div>
                    </label>

                    <label className='block'>
                        <span className='mb-1 block text-[8px] text-[#b5b4b7]'>Simulation Horizon</span>

                        <div className='flex min-h-[35px] items-center justify-between rounded-[4px] border border-[#414A5D] bg-[#000000] px-3 text-[9px]'>
                            10 Years
                            <span>⌄</span>
                        </div>
                    </label>

                    <button
                        type='button'
                        className='mt-1 min-h-[42px] w-full rounded-[4px] text-[10px] font-medium uppercase tracking-[0.025em] text-white'
                        style={{
                            background: 'linear-gradient(90deg,#4333AF 0%,#4333AF 100%)',
                            boxShadow: '0 0 18px rgba(67,51,175,0.2)',
                        }}
                    >
                        Run Simulation
                    </button>
                </div>
            </div>
        </Panel>
    );
}

function IndicatorSparkline({ color, points }: { color: string; points: string }) {
    return (
        <svg viewBox='0 0 100 30' preserveAspectRatio='none' className='mt-3 h-[30px] w-full' aria-hidden='true'>
            <polyline points={points} fill='none' stroke={color} strokeWidth='1.5' vectorEffect='non-scaling-stroke' />
        </svg>
    );
}

function IndicatorCard({
    label,
    value,
    comparison,
    comparisonColor,
    points,
}: {
    label: string;
    value: string;
    comparison: string;
    comparisonColor: string;
    points: string;
}) {
    return (
        <div className='min-w-0 border-b border-[#414A5D] px-4 py-4 sm:border-b-0 sm:border-r sm:last:border-r-0'>
            <p className='text-[8px] uppercase tracking-[0.02em] text-[#c3c2c6]'>{label}</p>

            <p className='mt-2 text-[24px] leading-none text-[#eeeeeb]'>{value}</p>

            <IndicatorSparkline color={PURPLE_BRIGHT} points={points} />

            <div className='mt-2 flex items-center justify-between gap-2 text-[8px]'>
                <span className='text-[#8e8d91]'>vs. Baseline</span>
                <span style={{ color: comparisonColor }}>{comparison}</span>
            </div>
        </div>
    );
}

function ResultsPanel() {
    return (
        <Panel>
            <div className='px-3 pb-3 pt-4'>
                <p className='px-2 text-[10px] font-medium uppercase' style={{ color: PURPLE_SOFT }}>
                    Key Economic Indicators
                </p>

                <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
                    <IndicatorCard
                        label='Inflation Rate (%)'
                        value='2.4'
                        comparison='+0.3 pp'
                        comparisonColor={GOLD}
                        points='0,22 15,20 30,21 45,16 60,18 75,10 88,14 100,8'
                    />

                    <IndicatorCard
                        label='Unemployment Rate (%)'
                        value='5.1'
                        comparison='-0.4 pp'
                        comparisonColor={GREEN}
                        points='0,20 14,23 28,20 42,22 56,17 70,18 84,12 100,9'
                    />

                    <IndicatorCard
                        label='Current Account (% GDP)'
                        value='-1.2'
                        comparison='+0.6 pp'
                        comparisonColor={GOLD}
                        points='0,22 14,18 28,17 42,14 56,10 70,6 84,7 100,5'
                    />

                    <IndicatorCard
                        label='Public Debt (% GDP)'
                        value='68.7'
                        comparison='-2.8 pp'
                        comparisonColor={GREEN}
                        points='0,19 14,20 28,18 42,17 56,13 70,14 84,8 100,5'
                    />
                </div>

                <div className='overflow-x-auto border-t border-[#414A5D]'>
                    <div className='min-w-[610px]'>
                        <div className='grid grid-cols-[1.7fr_repeat(4,.8fr)] py-2 text-[8px] uppercase text-[#9b9a9e]'>
                            <span>Scenario</span>
                            <span>Real GDP Growth (%)</span>
                            <span>Inflation (%)</span>
                            <span>Unemployment (%)</span>
                            <span>Public Debt (% GDP)</span>
                        </div>

                        {scenarioRows.map((row) => (
                            <div key={row.name} className='grid min-h-[27px] grid-cols-[1.7fr_repeat(4,.8fr)] items-center text-[9px] text-[#dad9dc]'>
                                <div className='flex items-center gap-2'>
                                    <span className='h-[8px] w-[8px] rounded-full' style={{ background: row.color }} />

                                    {row.name}
                                </div>

                                <span>{row.growth}</span>
                                <span>{row.inflation}</span>
                                <span>{row.unemployment}</span>
                                <span>{row.debt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Panel>
    );
}

const EconomicSimulatorPage: NextPage = () => {
    return (
        <>
            <HeroSection />

            <main className='economic-simulator-page min-h-screen overflow-hidden text-white' style={{ background: '#050608' }}>
                {/* HERO */}
                <section id='overview' className='relative overflow-hidden border-b border-[#414A5D]'>
                    <div className='mx-auto grid w-full max-w-[1180px] items-center gap-8 px-5 pb-7 pt-5 sm:px-8 sm:pb-9 sm:pt-7 lg:grid-cols-[0.41fr_0.59fr] lg:gap-2 lg:px-9'>
                        <div className='relative z-10'>
                            <p className='text-[11px] font-medium uppercase tracking-[0.055em]' style={{ color: GOLD_LIGHT }}>
                                Model. Simulate. Understand.
                            </p>

                            <h1 className='simulator-serif page-hero-title mt-3 text-[56px] leading-[1.23] tracking-[-0.05em] sm:text-[72px] lg:text-[75px]'>
                                <span className='text-[#f3f0ed]'>Economic</span>
                                <br />
                                <span style={{ color: PURPLE_BRIGHT }}>Simulator</span>
                            </h1>

                            <p className='mt-5 max-w-[400px] text-[16px] leading-[1.55] text-[#dedcdf] sm:text-[17px]'>
                                Explore economies. Test policies.
                                <br />
                                See the impact before it happens.
                            </p>

                            <div className='page-hero-features mt-8 grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-7'>
                                {[
                                    {
                                        icon: LineChart,
                                        title: 'Model',
                                        body: 'Build and customize economic models.',
                                    },
                                    {
                                        icon: SlidersHorizontal,
                                        title: 'Simulate',
                                        body: 'Run scenarios and compare outcomes.',
                                    },
                                    {
                                        icon: Target,
                                        title: 'Understand',
                                        body: 'Visualize results and make better decisions.',
                                    },
                                ].map(({ icon: Icon, title, body }) => (
                                    <div key={title}>
                                        <div className='flex h-[52px] w-[52px] items-center justify-center rounded-full border' style={{ borderColor: PURPLE }}>
                                            <Icon className='h-6 w-6' strokeWidth={1.45} style={{ color: PURPLE_SOFT }} />
                                        </div>

                                        <h3 className='mt-3 text-[13px] font-medium text-[#eeecef] leading-[1.42]'>{title}</h3>

                                        <p className='mt-1.5 max-w-[145px] text-[10px] leading-[1.45] text-[#a9a8ac]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='page-hero-art relative flex min-h-[200px] items-center sm:min-h-[280px] lg:min-h-[385px]'>
                            <HeroArtwork />
                        </div>
                    </div>
                </section>

                <div className='mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-9'>
                    {/* SECTION 01 */}
                    <section id='features' className='grid gap-7 border-b border-[#414A5D] py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-15'>
                        <SectionIntro
                            number='01'
                            title='Build Your Economy'
                            description='Create a custom economic model with key sectors, agents, and policy tools.'
                        >
                            <div className='mt-7 grid max-w-[300px] grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3'>
                                {modelFeatures.map(({ icon: Icon, title, body }) => (
                                    <div key={title} className='text-center'>
                                        <Icon className='mx-auto h-8 w-8' strokeWidth={1.35} style={{ color: PURPLE_SOFT }} />

                                        <h3 className='mt-2 text-[9px] font-medium text-[#ededee] leading-[1.42]'>{title}</h3>

                                        <p className='mt-1 text-[7px] leading-[1.4] text-[#99989c]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionIntro>

                        <ModelStructure />
                    </section>

                    {/* SECTION 02 */}
                    <section id='scenarios' className='grid gap-7 border-b border-[#414A5D] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='02'
                            title='Simulate Scenarios'
                            description='Run simulations to see how changes in policy or external shocks impact the economy.'
                        >
                            <ul className='mt-5 space-y-3'>
                                <CheckItem>Baseline &amp; custom scenarios</CheckItem>
                                <CheckItem>Shocks and policy experiments</CheckItem>
                                <CheckItem>Monte Carlo simulations</CheckItem>
                            </ul>
                        </SectionIntro>

                        <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_235px]'>
                            <Panel>
                                <div className='px-4 pb-3 pt-4'>
                                    <p className='text-[10px] font-medium uppercase' style={{ color: PURPLE_SOFT }}>
                                        Real GDP Growth (%)
                                    </p>

                                    <div className='mt-2'>
                                        <ScenarioChart />
                                    </div>

                                    <div className='flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-[8px] text-[#b4b3b7]'>
                                        {scenarioRows.map((row) => (
                                            <div key={row.name} className='flex items-center gap-1.5'>
                                                <span className='h-[3px] w-5' style={{ background: row.color }} />

                                                {row.name === 'Expansionary Policy' ? 'Expansion' : row.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Panel>

                            <ScenarioControls />
                        </div>
                    </section>

                    {/* SECTION 03 */}
                    <section id='results' className='grid gap-7 border-b border-[#414A5D] py-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='03'
                            title='Analyze Results'
                            description='Visualize key economic indicators and compare outcomes across scenarios.'
                        >
                            <div className='mt-7 grid max-w-[300px] grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3'>
                                {resultTools.map(({ icon: Icon, title, body }) => (
                                    <div key={title} className='text-center'>
                                        <Icon className='mx-auto h-8 w-8' strokeWidth={1.3} style={{ color: PURPLE_SOFT }} />

                                        <h3 className='mt-2 text-[9px] font-medium text-[#eeeeef] leading-[1.42]'>{title}</h3>

                                        <p className='mt-1 text-[7px] leading-[1.4] text-[#99989c]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionIntro>

                        <ResultsPanel />
                    </section>

                    {/* SECTION 04 */}
                    <section className='py-6'>
                        <div className='grid gap-8 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-16'>
                            <SectionIntro
                                number='04'
                                title='Make Better Decisions'
                                description='Use insights from simulations to design smarter policies and strategies.'
                            />

                            <div className='page-mobile-grid grid grid-cols-2 divide-y-0 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x'>
                                {decisionTools.map(({ icon: Icon, title, body }) => (
                                    <div key={title} className='flex min-h-[150px] flex-col items-center px-5 py-4 text-center'>
                                        <div className='flex h-[54px] w-[54px] items-center justify-center rounded-full border' style={{ borderColor: PURPLE }}>
                                            <Icon className='h-6 w-6' strokeWidth={1.4} style={{ color: PURPLE_SOFT }} />
                                        </div>

                                        <h3 className='mt-3 text-[10px] font-medium text-[#efedef] leading-[1.42]'>{title}</h3>

                                        <p className='mt-2 max-w-[145px] text-[8px] leading-[1.45] text-[#a4a3a7]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className='mt-5 flex flex-col gap-5 rounded-[11px] border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6'
                            style={{
                                borderColor: BORDER,
                                background: '#0C0F18',
                            }}
                        >
                            <div className='flex items-center gap-4'>
                                <div
                                    className='flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border'
                                    style={{ borderColor: PURPLE }}
                                >
                                    <BarChart3 className='h-6 w-6' strokeWidth={1.45} style={{ color: PURPLE_SOFT }} />
                                </div>

                                <div>
                                    <p className='text-[12px] font-medium' style={{ color: PURPLE_SOFT }}>
                                        Explore the economy. Shape the future.
                                    </p>

                                    <p className='mt-1 text-[10px] text-[#adaCB0]'>Powerful modeling. Realistic simulations. Smarter outcomes.</p>
                                </div>
                            </div>

                            <ComingSoonTrigger
                                ariaLabel='Get started'
                                className='group flex h-[48px] w-[200px] shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-[5px] bg-[#4333AF] px-5 text-[11px] font-medium uppercase tracking-[0.03em] text-white shadow-[0_0_24px_rgba(67,51,175,0.24)] transition-all duration-200 hover:bg-[#4333AF]'
                            >
                                Get Started
                                <ArrowRight className='h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1' />
                            </ComingSoonTrigger>
                        </div>
                    </section>
                </div>
            </main>

            <style jsx global>{`
                .economic-simulator-page {
                    font-family: 'Roboto', Arial, Helvetica, sans-serif;
                    background-color: ${PAGE_BG};
                    -webkit-font-smoothing: antialiased;
                    text-rendering: geometricPrecision;
                }

                .economic-simulator-page h1,
                .economic-simulator-page h2,
                .economic-simulator-page h3,
                .economic-simulator-page h4,
                .economic-simulator-page h5,
                .economic-simulator-page h6 {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                    overflow-wrap: normal;
                    word-break: normal;
                }

                .economic-simulator-page .simulator-serif {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                }

                .economic-simulator-page button,
                .economic-simulator-page a {
                    -webkit-tap-highlight-color: transparent;
                }

                .economic-simulator-page *,
                .economic-simulator-page *::before,
                .economic-simulator-page *::after {
                    box-sizing: border-box;
                    min-width: 0;
                }

                @media (max-width: 639px) {
                    .economic-simulator-page {
                        overflow-wrap: normal;
                        word-break: normal;
                    }

                    .economic-simulator-page .page-hero-title {
                        font-size: clamp(1.9rem, 8.6vw, 2.25rem) !important;
                        line-height: 1.26 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .economic-simulator-page .page-section-number {
                        font-size: 1.95rem !important;
                        line-height: 1 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .economic-simulator-page .page-section-title {
                        font-size: clamp(1rem, 5vw, 1.22rem) !important;
                        line-height: 1.36 !important;
                        letter-spacing: -0.01em !important;
                    }

                    .economic-simulator-page .page-hero-features {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                        gap: 0.85rem !important;
                        margin-top: 1.35rem !important;
                    }

                    .economic-simulator-page .page-hero-features > * {
                        min-width: 0;
                    }

                    .economic-simulator-page .page-hero-features > * > div:first-child {
                        width: 2.75rem !important;
                        height: 2.75rem !important;
                    }

                    .economic-simulator-page .page-hero-features h3 {
                        margin-top: 0.55rem !important;
                        font-size: 0.64rem !important;
                        line-height: 1.43 !important;
                    }

                    .economic-simulator-page .page-hero-features p {
                        margin-top: 0.35rem !important;
                        font-size: 0.5rem !important;
                        line-height: 1.35 !important;
                    }

                    .economic-simulator-page .page-hero-art {
                        min-height: 11.5rem !important;
                        margin-top: 0.25rem !important;
                    }

                    .economic-simulator-page .page-mobile-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 0.75rem !important;
                    }

                    .economic-simulator-page .page-mobile-grid > * {
                        min-height: 0 !important;
                        border-left: 0 !important;
                        border-right: 0 !important;
                        border-top: 0 !important;
                        border-bottom: 0 !important;
                    }

                    .economic-simulator-page .page-compact-card {
                        min-height: 0 !important;
                        padding: 0.9rem 0.65rem !important;
                    }

                    .economic-simulator-page p,
                    .economic-simulator-page li,
                    .economic-simulator-page td,
                    .economic-simulator-page th,
                    .economic-simulator-page dd,
                    .economic-simulator-page dt {
                        overflow-wrap: normal;
                        word-break: normal;
                    }
                }
            `}</style>
        </>
    );
};

export default EconomicSimulatorPage;
