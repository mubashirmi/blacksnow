import ComingSoonTrigger from '@/components/ComingSoonTrigger';
import HeroSection from '@/components/MainHeroSection';
import {
    ArrowRight,
    BarChart3,
    Bell,
    CalendarDays,
    Check,
    CircleDollarSign,
    Clock3,
    Flag,
    ShieldCheck,
    Target,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';
import type { NextPage } from 'next';
import type { ReactNode } from 'react';

type Impact = 'High' | 'Medium';

interface EconomicRow {
    date: string;
    event: string;
    impact: Impact;
    actual: string;
    forecast: string;
    previous: string;
}

interface DividendRow {
    date: string;
    company: string;
    exDate: string;
    payDate: string;
    dividend: string;
    yield: string;
}

interface IpoRow {
    company: string;
    ticker: string;
    exchange: string;
    ipoDate: string;
    priceRange: string;
    status: string;
}

interface EarningsRow {
    date: string;
    company: string;
    ticker: string;
    time: string;
    epsEstimate: string;
    marketCap: string;
}

const ACCENT = '#ef4d8b';
const ACCENT_SOFT = '#ff75a8';
const PAGE_BACKGROUND = '#060709';
// const PANEL_BACKGROUND = '#090b0e';
const BORDER = 'rgba(255,255,255,0.17)';

const economicRows: EconomicRow[] = [
    {
        date: 'May 16, 2024',
        event: 'Retail Sales (MoM)',
        impact: 'High',
        actual: '0.4%',
        forecast: '0.2%',
        previous: '0.7%',
    },
    {
        date: 'May 16, 2024',
        event: 'Industrial Production (MoM)',
        impact: 'Medium',
        actual: '0.1%',
        forecast: '0.2%',
        previous: '-0.1%',
    },
    {
        date: 'May 17, 2024',
        event: 'Building Permits (MoM)',
        impact: 'Medium',
        actual: '1.5%',
        forecast: '1.3%',
        previous: '-2.7%',
    },
    {
        date: 'May 17, 2024',
        event: 'U. of Michigan Consumer Sentiment',
        impact: 'High',
        actual: '67.4',
        forecast: '68.0',
        previous: '77.2',
    },
    {
        date: 'May 17, 2024',
        event: 'Fed Chair Powell Speaks',
        impact: 'High',
        actual: '—',
        forecast: '—',
        previous: '—',
    },
];

const dividendRows: DividendRow[] = [
    {
        date: 'May 20, 2024',
        company: 'Coca-Cola (KO)',
        exDate: 'May 10',
        payDate: 'May 31',
        dividend: '$0.46',
        yield: '2.91%',
    },
    {
        date: 'May 21, 2024',
        company: 'Microsoft (MSFT)',
        exDate: 'May 09',
        payDate: 'May 23',
        dividend: '$0.75',
        yield: '0.73%',
    },
    {
        date: 'May 22, 2024',
        company: 'AT&T (T)',
        exDate: 'May 08',
        payDate: 'Jun 03',
        dividend: '$0.28',
        yield: '6.28%',
    },
    {
        date: 'May 24, 2024',
        company: 'NVIDIA (NVDA)',
        exDate: 'May 21',
        payDate: 'May 24',
        dividend: '$0.04',
        yield: '0.04%',
    },
    {
        date: 'May 31, 2024',
        company: 'Tesla (TSLA)',
        exDate: 'May 24',
        payDate: 'Jun 10',
        dividend: '$0.00',
        yield: '—',
    },
];

const ipoRows: IpoRow[] = [
    {
        company: 'Redwood Analytics',
        ticker: 'RWOD',
        exchange: 'NASDAQ',
        ipoDate: 'May 21, 2024',
        priceRange: '$18 – $21',
        status: 'Upcoming',
    },
    {
        company: 'Summit Therapeutics',
        ticker: 'SMMT',
        exchange: 'NASDAQ',
        ipoDate: 'May 22, 2024',
        priceRange: '$15 – $17',
        status: 'Upcoming',
    },
    {
        company: 'BlueWave Energy',
        ticker: 'BWAV',
        exchange: 'NYSE',
        ipoDate: 'May 23, 2024',
        priceRange: '$20 – $23',
        status: 'Upcoming',
    },
    {
        company: 'NextGen Logistics',
        ticker: 'NXGN',
        exchange: 'NASDAQ',
        ipoDate: 'May 30, 2024',
        priceRange: '$16 – $18',
        status: 'Filing',
    },
    {
        company: 'Pioneer Metals',
        ticker: 'PMTS',
        exchange: 'NYSE',
        ipoDate: 'Jun 03, 2024',
        priceRange: '$12 – $14',
        status: 'Filing',
    },
];

const earningsRows: EarningsRow[] = [
    {
        date: 'May 21, 2024',
        company: 'NVIDIA',
        ticker: 'NVDA',
        time: 'After Close',
        epsEstimate: '$5.59',
        marketCap: '$2.2T',
    },
    {
        date: 'May 22, 2024',
        company: 'Walmart',
        ticker: 'WMT',
        time: 'Before Open',
        epsEstimate: '$0.60',
        marketCap: '$500B',
    },
    {
        date: 'May 23, 2024',
        company: 'Apple',
        ticker: 'AAPL',
        time: 'After Close',
        epsEstimate: '$1.50',
        marketCap: '$2.9T',
    },
    {
        date: 'May 23, 2024',
        company: 'Cintas',
        ticker: 'CTAS',
        time: 'Before Open',
        epsEstimate: '$1.13',
        marketCap: '$78B',
    },
    {
        date: 'May 24, 2024',
        company: 'Palo Alto Networks',
        ticker: 'PANW',
        time: 'After Close',
        epsEstimate: '$0.84',
        marketCap: '$95B',
    },
];

const heroFeatures: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: CalendarDays,
        title: 'Economic',
        body: 'Track economic releases and indicator events.',
    },
    {
        icon: CircleDollarSign,
        title: 'Dividends',
        body: 'Stay ahead of dividend payments and ex-dates.',
    },
    {
        icon: Flag,
        title: 'IPOs',
        body: 'Discover upcoming IPOs and new market opportunities.',
    },
    {
        icon: BarChart3,
        title: 'Earnings',
        body: 'Follow earnings reports and company results.',
    },
];

const bottomBenefits: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: Target,
        title: 'Anticipate Moves',
        body: "Know what's coming before it impacts the market.",
    },
    {
        icon: Bell,
        title: 'Stay Prepared',
        body: 'Plan trades and strategies with confidence.',
    },
    {
        icon: Clock3,
        title: 'Save Time',
        body: 'All key events in one place—easy to filter and track.',
    },
    {
        icon: ShieldCheck,
        title: 'Reduce Risk',
        body: 'Avoid surprises and manage positions smarter.',
    },
    {
        icon: TrendingUp,
        title: 'Improve Results',
        body: 'Better timing leads to better decisions and performance.',
    },
];

function CheckItem({ children }: { children: ReactNode }) {
    return (
        <li className='flex items-start gap-2.5 text-[13px] leading-[1.45] text-[#d2d2d5] sm:text-[14px]'>
            <span className='mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: ACCENT }}>
                <Check className='h-[11px] w-[11px]' strokeWidth={2.5} style={{ color: ACCENT }} />
            </span>
            <span>{children}</span>
        </li>
    );
}

function SectionIntro({ number, title, description, bullets }: { number: string; title: string; description: ReactNode; bullets: string[] }) {
    return (
        <div className='min-w-0 py-1 lg:pr-5'>
            <div className='flex items-center gap-3'>
                <span className='calendar-serif page-section-number text-[43px] leading-none tracking-[-0.03em]' style={{ color: ACCENT }}>
                    {number}
                </span>
                <span className='mt-1 h-px w-8 bg-[#ef4d8b]/85 sm:w-10' />
            </div>

            <h2 className='calendar-serif page-section-title mt-1 text-[28px] leading-[1.04] tracking-[-0.025em] text-[#f6f4f4] sm:text-[31px]'>{title}</h2>

            <p className='mt-3 max-w-[250px] text-[13px] leading-[1.45] text-[#d3d3d6] sm:text-[14px]'>{description}</p>

            <ul className='mt-4 space-y-2'>
                {bullets.map((bullet) => (
                    <CheckItem key={bullet}>{bullet}</CheckItem>
                ))}
            </ul>
        </div>
    );
}

function Panel({ title, children, cta }: { title: string; children: ReactNode; cta: string }) {
    return (
        <div
            className='overflow-hidden rounded-[13px] border'
            style={{
                borderColor: BORDER,
                background: 'linear-gradient(180deg, rgba(11,13,16,0.98) 0%, rgba(7,9,12,0.98) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.015)',
            }}
        >
            <div className='px-4 pb-2 pt-4 sm:px-5'>
                <p className='text-[12px] font-medium uppercase tracking-[0.02em]' style={{ color: ACCENT_SOFT }}>
                    {title}
                </p>
            </div>

            <div className='px-3 sm:px-4'>{children}</div>

            <div className='flex justify-center px-4 pb-2.5 pt-1.5'>
                <button
                    type='button'
                    className='group flex items-center gap-2 text-[12px] transition-opacity hover:opacity-80 sm:text-[13px]'
                    style={{ color: ACCENT }}
                >
                    {cta}
                    <ArrowRight className='h-4 w-4 transition-transform duration-200 group-hover:translate-x-1' />
                </button>
            </div>
        </div>
    );
}

function ImpactBadge({ impact }: { impact: Impact }) {
    return (
        <span
            className='inline-flex rounded-[4px] border px-2 py-[2px] text-[10px] leading-4'
            style={{
                color: impact === 'High' ? '#ff6b9f' : '#d982f1',
                borderColor: impact === 'High' ? 'rgba(239,77,139,0.44)' : 'rgba(187,95,212,0.38)',
                background: impact === 'High' ? 'rgba(239,77,139,0.09)' : 'rgba(160,70,190,0.08)',
            }}
        >
            {impact}
        </span>
    );
}

function DesktopTable({ headings, children, gridTemplate }: { headings: string[]; children: ReactNode; gridTemplate: string }) {
    return (
        <div className='hidden sm:block'>
            <div className='grid items-center border-b border-white/[0.08] px-2 py-2 text-[11px] text-[#b8b8bd]' style={{ gridTemplateColumns: gridTemplate }}>
                {headings.map((heading) => (
                    <div key={heading} className='min-w-0 px-1'>
                        {heading}
                    </div>
                ))}
            </div>
            {children}
        </div>
    );
}

function DesktopRow({ children, gridTemplate }: { children: ReactNode; gridTemplate: string }) {
    return (
        <div
            className='grid min-h-[35px] items-center border-b border-white/[0.07] px-2 py-1.5 text-[11px] leading-[1.2] text-[#d4d4d7] last:border-b-0'
            style={{ gridTemplateColumns: gridTemplate }}
        >
            {children}
        </div>
    );
}

function Cell({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`min-w-0 px-1 ${className}`}>{children}</div>;
}

function MobileDataCard({
    fields,
}: {
    fields: Array<{
        label: string;
        value: ReactNode;
    }>;
}) {
    return (
        <div className='border-b border-white/[0.08] px-1 py-3 last:border-b-0'>
            <dl className='grid grid-cols-2 gap-x-4 gap-y-2.5'>
                {fields.map((field) => (
                    <div key={field.label} className='min-w-0'>
                        <dt className='mb-0.5 text-[10px] uppercase tracking-[0.06em] text-[#74747b]'>{field.label}</dt>
                        <dd className='break-words text-[12px] leading-[1.35] text-[#dddddf]'>{field.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function HeroArtwork() {
    const calendarCells = Array.from({ length: 35 }, (_, index) => index);

    return (
        <div className='relative mx-auto aspect-[1.28/1] w-full max-w-[570px] lg:max-w-none'>
            <div
                className='absolute left-[3%] top-[5%] h-[73%] w-[73%] rounded-full opacity-70 blur-3xl'
                style={{
                    background: 'radial-gradient(circle, rgba(239,77,139,0.17) 0%, rgba(239,77,139,0.02) 48%, transparent 72%)',
                }}
            />

            <svg viewBox='0 0 620 500' className='absolute inset-0 h-full w-full overflow-visible' aria-hidden='true'>
                <defs>
                    <radialGradient id='calendarGlobe' cx='44%' cy='42%' r='58%'>
                        <stop offset='0%' stopColor='#ef4d8b' stopOpacity='0.22' />
                        <stop offset='70%' stopColor='#ef4d8b' stopOpacity='0.045' />
                        <stop offset='100%' stopColor='#ef4d8b' stopOpacity='0' />
                    </radialGradient>

                    <filter id='pinkGlow' x='-100%' y='-100%' width='300%' height='300%'>
                        <feGaussianBlur stdDeviation='4' result='blur' />
                        <feMerge>
                            <feMergeNode in='blur' />
                            <feMergeNode in='SourceGraphic' />
                        </feMerge>
                    </filter>

                    <clipPath id='globeClip'>
                        <circle cx='260' cy='218' r='142' />
                    </clipPath>

                    <pattern id='dotPattern' width='6' height='6' patternUnits='userSpaceOnUse'>
                        <circle cx='1.4' cy='1.4' r='1.1' fill='#ff8db7' fillOpacity='0.76' />
                    </pattern>
                </defs>

                <ellipse
                    cx='273'
                    cy='218'
                    rx='245'
                    ry='151'
                    fill='none'
                    stroke='#ef4d8b'
                    strokeOpacity='0.38'
                    strokeWidth='1.2'
                    transform='rotate(-16 273 218)'
                />
                <ellipse cx='278' cy='220' rx='250' ry='93' fill='none' stroke='#ef4d8b' strokeOpacity='0.24' strokeWidth='1' transform='rotate(11 278 220)' />
                <ellipse
                    cx='274'
                    cy='215'
                    rx='199'
                    ry='255'
                    fill='none'
                    stroke='#ef4d8b'
                    strokeOpacity='0.32'
                    strokeWidth='1.2'
                    transform='rotate(61 274 215)'
                />

                <circle cx='260' cy='218' r='142' fill='url(#calendarGlobe)' stroke='#f46d9f' strokeOpacity='0.45' strokeWidth='1.2' />

                <g clipPath='url(#globeClip)'>
                    <ellipse cx='260' cy='218' rx='138' ry='48' fill='none' stroke='#f787af' strokeOpacity='0.26' />
                    <ellipse cx='260' cy='218' rx='138' ry='93' fill='none' stroke='#f787af' strokeOpacity='0.18' />
                    <ellipse cx='260' cy='218' rx='68' ry='142' fill='none' stroke='#f787af' strokeOpacity='0.2' />
                    <ellipse cx='260' cy='218' rx='116' ry='142' fill='none' stroke='#f787af' strokeOpacity='0.15' />

                    <path
                        d='M149 146c19-23 46-41 77-53l19 9 13 19 25 5 7 21-12 12-20-7-13 14-11 32-22 13-23-15-12-27-23-7-19-17 14-3zm145-49 28 12 21 23 23 10 7 23-15 24-30 4-18-13-23 1-15-21 10-24-5-21 17-18zm-88 148 28-13 30 10 20 21-4 28-25 10-14 35-27 8-25-25 5-31-12-21 24-22zm117 20 25-16 30 6 16 27-8 23-23 5-18 26-29-8-3-35 10-28z'
                        fill='url(#dotPattern)'
                        opacity='0.84'
                    />
                </g>

                {[
                    [90, 179],
                    [151, 88],
                    [309, 64],
                    [420, 91],
                    [498, 177],
                    [88, 304],
                    [185, 353],
                    [351, 337],
                    [519, 286],
                ].map(([cx, cy]) => (
                    <g key={`${cx}-${cy}`} filter='url(#pinkGlow)'>
                        <circle cx={cx} cy={cy} r='3.3' fill='#fff' />
                        <circle cx={cx} cy={cy} r='7.5' fill='#ef4d8b' fillOpacity='0.26' />
                    </g>
                ))}
            </svg>

            <div
                className='absolute bottom-[7%] right-[0%] h-[70%] w-[53%] origin-bottom-right rotate-[7deg] rounded-[10px] border border-[#cc668c]/60 p-[7px]'
                style={{
                    background: 'linear-gradient(145deg, #32151f 0%, #141217 36%, #090b0e 100%)',
                    boxShadow: '-16px 18px 35px rgba(0,0,0,0.68), 0 0 25px rgba(239,77,139,0.12), inset 0 1px 0 rgba(255,255,255,0.09)',
                }}
            >
                <div className='absolute -bottom-[3%] -right-[12%] h-[60%] w-[16%] -skew-y-[18deg] border-b border-r border-[#754453]/65 bg-[#121014]' />

                <div className='absolute -top-[10px] left-[7%] right-[7%] flex justify-between'>
                    {Array.from({ length: 8 }, (_, index) => (
                        <div
                            key={index}
                            className='relative h-[28px] w-[9px] rounded-full border border-[#d8a0b3]/70'
                            style={{
                                background: 'linear-gradient(90deg,#171318,#5a3b47,#151217)',
                                boxShadow: '0 2px 3px rgba(0,0,0,0.6)',
                            }}
                        />
                    ))}
                </div>

                <div className='h-full rounded-[6px] border border-white/[0.045] bg-[#121216]/95 px-[6%] pb-[7%] pt-[14%]'>
                    <div className='grid grid-cols-7 text-center text-[6px] font-medium uppercase text-[#e0a9bc] sm:text-[7px]'>
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>

                    <div className='mt-[5%] grid h-[76%] grid-cols-7 grid-rows-5 border-l border-t border-white/[0.07]'>
                        {calendarCells.map((cell) => (
                            <div key={cell} className='relative border-b border-r border-white/[0.07]'>
                                {cell === 7 && (
                                    <CalendarDays
                                        className='absolute left-1/2 top-1/2 h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2'
                                        style={{ color: ACCENT }}
                                    />
                                )}
                                {cell === 10 && (
                                    <CircleDollarSign
                                        className='absolute left-1/2 top-1/2 h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2'
                                        style={{ color: ACCENT }}
                                    />
                                )}
                                {cell === 19 && (
                                    <Flag className='absolute left-1/2 top-1/2 h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2' style={{ color: ACCENT }} />
                                )}
                                {cell === 33 && (
                                    <BarChart3
                                        className='absolute left-1/2 top-1/2 h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2'
                                        style={{ color: ACCENT }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EconomicPanel() {
    const columns = '1.1fr 2fr .8fr .75fr .9fr .8fr';

    return (
        <Panel title='Upcoming Economic Events' cta='View Full Economic Calendar'>
            <DesktopTable headings={['Date', 'Event', 'Impact', 'Actual', 'Forecast', 'Previous']} gridTemplate={columns}>
                {economicRows.map((row) => (
                    <DesktopRow key={`${row.date}-${row.event}`} gridTemplate={columns}>
                        <Cell>{row.date}</Cell>
                        <Cell>{row.event}</Cell>
                        <Cell>
                            <ImpactBadge impact={row.impact} />
                        </Cell>
                        <Cell>{row.actual}</Cell>
                        <Cell>{row.forecast}</Cell>
                        <Cell>{row.previous}</Cell>
                    </DesktopRow>
                ))}
            </DesktopTable>

            <div className='sm:hidden'>
                {economicRows.map((row) => (
                    <MobileDataCard
                        key={`${row.date}-${row.event}`}
                        fields={[
                            { label: 'Event', value: row.event },
                            { label: 'Impact', value: <ImpactBadge impact={row.impact} /> },
                            { label: 'Date', value: row.date },
                            { label: 'Actual', value: row.actual },
                            { label: 'Forecast', value: row.forecast },
                            { label: 'Previous', value: row.previous },
                        ]}
                    />
                ))}
            </div>
        </Panel>
    );
}

function DividendPanel() {
    const columns = '1.05fr 1.7fr 1fr 1fr .85fr .7fr';

    return (
        <Panel title='Upcoming Dividend Payouts' cta='View Full Dividend Calendar'>
            <DesktopTable headings={['Date', 'Company', 'Ex-Date', 'Pay Date', 'Dividend', 'Yield']} gridTemplate={columns}>
                {dividendRows.map((row) => (
                    <DesktopRow key={`${row.date}-${row.company}`} gridTemplate={columns}>
                        <Cell>{row.date}</Cell>
                        <Cell>{row.company}</Cell>
                        <Cell>{row.exDate}</Cell>
                        <Cell>{row.payDate}</Cell>
                        <Cell>{row.dividend}</Cell>
                        <Cell>{row.yield}</Cell>
                    </DesktopRow>
                ))}
            </DesktopTable>

            <div className='sm:hidden'>
                {dividendRows.map((row) => (
                    <MobileDataCard
                        key={`${row.date}-${row.company}`}
                        fields={[
                            { label: 'Company', value: row.company },
                            { label: 'Dividend', value: row.dividend },
                            { label: 'Date', value: row.date },
                            { label: 'Ex-Date', value: row.exDate },
                            { label: 'Pay Date', value: row.payDate },
                            { label: 'Yield', value: row.yield },
                        ]}
                    />
                ))}
            </div>
        </Panel>
    );
}

function IpoPanel() {
    const columns = '1.75fr .75fr 1fr 1.15fr 1fr 1fr';

    return (
        <Panel title='Upcoming IPOs' cta='View Full IPO Calendar'>
            <DesktopTable headings={['Company', 'Ticker', 'Exchange', 'IPO Date', 'Price Range', 'Status']} gridTemplate={columns}>
                {ipoRows.map((row) => (
                    <DesktopRow key={row.company} gridTemplate={columns}>
                        <Cell>{row.company}</Cell>
                        <Cell>{row.ticker}</Cell>
                        <Cell>{row.exchange}</Cell>
                        <Cell>{row.ipoDate}</Cell>
                        <Cell>{row.priceRange}</Cell>
                        <Cell>{row.status}</Cell>
                    </DesktopRow>
                ))}
            </DesktopTable>

            <div className='sm:hidden'>
                {ipoRows.map((row) => (
                    <MobileDataCard
                        key={row.company}
                        fields={[
                            { label: 'Company', value: row.company },
                            { label: 'Ticker', value: row.ticker },
                            { label: 'Exchange', value: row.exchange },
                            { label: 'IPO Date', value: row.ipoDate },
                            { label: 'Price Range', value: row.priceRange },
                            { label: 'Status', value: row.status },
                        ]}
                    />
                ))}
            </div>
        </Panel>
    );
}

function EarningsPanel() {
    const columns = '1.1fr 1.55fr .8fr 1fr 1fr 1fr';

    return (
        <Panel title='Upcoming Earnings Reports' cta='View Full Earnings Calendar'>
            <DesktopTable headings={['Date', 'Company', 'Ticker', 'Time', 'EPS Estimate', 'Market Cap']} gridTemplate={columns}>
                {earningsRows.map((row) => (
                    <DesktopRow key={`${row.date}-${row.ticker}`} gridTemplate={columns}>
                        <Cell>{row.date}</Cell>
                        <Cell>{row.company}</Cell>
                        <Cell>{row.ticker}</Cell>
                        <Cell>{row.time}</Cell>
                        <Cell>{row.epsEstimate}</Cell>
                        <Cell>{row.marketCap}</Cell>
                    </DesktopRow>
                ))}
            </DesktopTable>

            <div className='sm:hidden'>
                {earningsRows.map((row) => (
                    <MobileDataCard
                        key={`${row.date}-${row.ticker}`}
                        fields={[
                            { label: 'Company', value: row.company },
                            { label: 'Ticker', value: row.ticker },
                            { label: 'Date', value: row.date },
                            { label: 'Time', value: row.time },
                            { label: 'EPS Estimate', value: row.epsEstimate },
                            { label: 'Market Cap', value: row.marketCap },
                        ]}
                    />
                ))}
            </div>
        </Panel>
    );
}

const MarketMovingCalendarsPage: NextPage = () => {
    return (
        <>
            <HeroSection />

            <main
                className='market-calendars-page min-h-screen overflow-hidden text-white'
                style={{
                    background:
                        'radial-gradient(circle at 72% 11%, rgba(239,77,139,0.035), transparent 24%), linear-gradient(180deg, #050609 0%, #07090c 48%, #050608 100%)',
                }}
            >
                <section className='relative overflow-hidden border-b border-white/[0.09]'>
                    <div
                        className='pointer-events-none absolute inset-0 opacity-30'
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
                            backgroundSize: '44px 44px',
                        }}
                    />

                    <div className='relative mx-auto grid w-full max-w-[1180px] items-center gap-7 px-5 pb-6 pt-8 sm:px-8 sm:pb-9 sm:pt-10 lg:grid-cols-[0.43fr_0.57fr] lg:gap-3 lg:px-9 lg:pb-5'>
                        <div className='relative z-10'>
                            <p className='text-[11px] font-semibold uppercase tracking-[0.035em] sm:text-[13px]' style={{ color: ACCENT_SOFT }}>
                                Know the date. Know the impact.
                            </p>

                            <h1 className='calendar-serif page-hero-title mt-2 max-w-[530px] text-[47px] leading-[0.93] tracking-[-0.045em] text-[#f5f3f3] sm:text-[61px] lg:text-[64px]'>
                                Market Moving
                                <br />
                                <span style={{ color: ACCENT }}>Calendars</span>
                            </h1>

                            <div className='mt-3 h-[2px] w-12 sm:mt-4 sm:w-14' style={{ background: ACCENT }} />

                            <p className='mt-4 max-w-[360px] text-[16px] leading-[1.45] text-[#dfdfe2] sm:text-[18px]'>
                                All the key dates that drive markets—
                                <br className='hidden sm:block' /> in one place.
                            </p>

                            <div className='page-hero-features mt-7 grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-4 lg:mt-8'>
                                {heroFeatures.map(({ icon: Icon, title, body }) => (
                                    <div key={title} className='min-w-0'>
                                        <div
                                            className='flex h-[50px] w-[50px] items-center justify-center rounded-full border sm:h-[54px] sm:w-[54px]'
                                            style={{ borderColor: ACCENT }}
                                        >
                                            <Icon className='h-6 w-6' strokeWidth={1.8} style={{ color: ACCENT }} />
                                        </div>

                                        <h3 className='mt-3 text-[13px] font-medium sm:text-[14px]' style={{ color: ACCENT_SOFT }}>
                                            {title}
                                        </h3>

                                        <p className='mt-1 max-w-[125px] text-[10px] leading-[1.4] text-[#aaaab0] sm:text-[11px]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='page-hero-art relative -mb-3 lg:-mr-6 lg:-mt-2'>
                            <HeroArtwork />
                        </div>
                    </div>
                </section>

                <div className='mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-9'>
                    <section className='grid gap-6 border-b border-white/[0.09] py-5 sm:py-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='01'
                            title='Economic Calendar'
                            description='Track key economic releases and indicator events that influence markets and drive volatility.'
                            bullets={['Central bank decisions', 'Inflation & employment data', 'GDP, PMI, retail sales & more', 'Filter by impact & country']}
                        />
                        <EconomicPanel />
                    </section>

                    <section className='grid gap-6 border-b border-white/[0.09] py-5 sm:py-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='02'
                            title='Dividend Calendar'
                            description='Never miss a dividend payment. Track ex-dates, pay dates, and estimated yields.'
                            bullets={[
                                'Ex-dividend & pay dates',
                                'Dividend amounts & yields',
                                'Filter by stock, sector, or yield',
                                'Build a high-yield watchlist',
                            ]}
                        />
                        <DividendPanel />
                    </section>

                    <section className='grid gap-6 border-b border-white/[0.09] py-5 sm:py-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='03'
                            title='IPO Calendar'
                            description='Discover upcoming IPOs and follow new listings from announcement to market debut.'
                            bullets={['Upcoming IPOs & pricing', 'Exchange, sector & valuation', 'Track offering updates', 'Filter by date or industry']}
                        />
                        <IpoPanel />
                    </section>

                    <section className='grid gap-6 py-5 sm:py-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='04'
                            title='Earnings Calendar'
                            description='Stay informed on earnings reports and company results that can move markets.'
                            bullets={['Earnings dates & times', 'Pre-market & after-hours', 'EPS estimates & surprises', 'Track by symbol or sector']}
                        />
                        <EarningsPanel />
                    </section>
                </div>

                <section className='mx-auto w-full max-w-[1180px] px-5 pb-6 sm:px-8 lg:px-9'>
                    <div className='border-y border-white/[0.09] py-5'>
                        <p className='mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.025em] sm:text-[12px]' style={{ color: ACCENT_SOFT }}>
                            Better information. Better timing. Better results.
                        </p>

                        <div className='page-mobile-grid grid grid-cols-2 gap-y-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0'>
                            {bottomBenefits.map(({ icon: Icon, title, body }, index) => (
                                <div
                                    key={title}
                                    className={`flex min-w-0 gap-3 lg:px-5 ${index !== bottomBenefits.length - 1 ? 'lg:border-r lg:border-white/[0.1]' : ''}`}
                                >
                                    <div
                                        className='flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border'
                                        style={{ borderColor: ACCENT }}
                                    >
                                        <Icon className='h-[22px] w-[22px]' strokeWidth={1.8} style={{ color: ACCENT }} />
                                    </div>

                                    <div className='min-w-0'>
                                        <h3 className='text-[11px] font-medium leading-[1.25]' style={{ color: ACCENT_SOFT }}>
                                            {title}
                                        </h3>
                                        <p className='mt-1 text-[9px] leading-[1.4] text-[#a8a8ad] sm:text-[10px]'>{body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className='mt-5 flex flex-col gap-4 rounded-[13px] border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'
                        style={{
                            borderColor: BORDER,
                            background: 'linear-gradient(180deg, rgba(10,12,15,0.96), rgba(7,9,11,0.96))',
                        }}
                    >
                        <div className='flex items-center gap-4'>
                            <div className='flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border' style={{ borderColor: ACCENT }}>
                                <CalendarDays className='h-[24px] w-[24px]' style={{ color: ACCENT }} />
                            </div>

                            <div>
                                <p className='text-[12px] font-semibold uppercase tracking-[0.02em]' style={{ color: ACCENT_SOFT }}>
                                    Be informed. Stay ahead.
                                </p>
                                <p className='mt-1 text-[11px] text-[#b6b6bb] sm:text-[12px]'>Track what moves markets with our powerful calendars.</p>
                            </div>
                        </div>

                        <ComingSoonTrigger
                            className='group flex min-h-[44px] w-full items-center justify-center gap-5 rounded-[4px] px-7 text-[12px] font-semibold uppercase tracking-[0.03em] text-[#151014] transition-all duration-200 hover:brightness-110 sm:w-[365px]'
                            style={{
                                background: 'linear-gradient(90deg, #ef4d8b 0%, #f45e99 100%)',
                                boxShadow: '0 0 24px rgba(239,77,139,0.11)',
                            }}
                        >
                            Explore All Calendars
                            <ArrowRight className='h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1' />
                        </ComingSoonTrigger>
                    </div>
                </section>
            </main>

            <style jsx global>{`
                .market-calendars-page {
                    font-family: 'Roboto', Arial, Helvetica, sans-serif;
                    background-color: ${PAGE_BACKGROUND};
                    -webkit-font-smoothing: antialiased;
                    text-rendering: geometricPrecision;
                }

                .market-calendars-page h1,
                .market-calendars-page h2,
                .market-calendars-page h3,
                .market-calendars-page h4,
                .market-calendars-page h5,
                .market-calendars-page h6 {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                    overflow-wrap: normal;
                    word-break: normal;
                }

                .market-calendars-page .calendar-serif {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                }

                .market-calendars-page button,
                .market-calendars-page a {
                    -webkit-tap-highlight-color: transparent;
                }

                .market-calendars-page *,
                .market-calendars-page *::before,
                .market-calendars-page *::after {
                    box-sizing: border-box;
                    min-width: 0;
                }

                @media (max-width: 639px) {
                    .market-calendars-page {
                        overflow-wrap: normal;
                        word-break: normal;
                    }

                    .market-calendars-page .page-hero-title {
                        font-size: clamp(1.9rem, 8.6vw, 2.25rem) !important;
                        line-height: 1.13 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .market-calendars-page .page-section-number {
                        font-size: 1.95rem !important;
                        line-height: 1 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .market-calendars-page .page-section-title {
                        font-size: clamp(1rem, 5vw, 1.22rem) !important;
                        line-height: 1.3 !important;
                        letter-spacing: -0.01em !important;
                    }

                    .market-calendars-page .page-hero-features {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                        gap: 0.85rem !important;
                        margin-top: 1.35rem !important;
                    }

                    .market-calendars-page .page-hero-features > * {
                        min-width: 0;
                    }

                    .market-calendars-page .page-hero-features > * > div:first-child {
                        width: 2.75rem !important;
                        height: 2.75rem !important;
                    }

                    .market-calendars-page .page-hero-features h3 {
                        margin-top: 0.55rem !important;
                        font-size: 0.64rem !important;
                        line-height: 1.35 !important;
                    }

                    .market-calendars-page .page-hero-features p {
                        margin-top: 0.35rem !important;
                        font-size: 0.5rem !important;
                        line-height: 1.35 !important;
                    }

                    .market-calendars-page .page-hero-art {
                        min-height: 11.5rem !important;
                        margin-top: 0.25rem !important;
                    }

                    .market-calendars-page .page-mobile-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 0.75rem !important;
                    }

                    .market-calendars-page .page-mobile-grid > * {
                        min-height: 0 !important;
                        border-left: 0 !important;
                        border-right: 0 !important;
                        border-top: 0 !important;
                        border-bottom: 0 !important;
                    }

                    .market-calendars-page .page-compact-card {
                        min-height: 0 !important;
                        padding: 0.9rem 0.65rem !important;
                    }

                    .market-calendars-page p,
                    .market-calendars-page li,
                    .market-calendars-page td,
                    .market-calendars-page th,
                    .market-calendars-page dd,
                    .market-calendars-page dt {
                        overflow-wrap: normal;
                        word-break: normal;
                    }
                }
            `}</style>
        </>
    );
};

export default MarketMovingCalendarsPage;
