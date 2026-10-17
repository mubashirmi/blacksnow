import ComingSoonTrigger from '@/components/ComingSoonTrigger';
import HeroSection from '@/components/MainHeroSection';
import { ArrowRight, BarChart3, Bell, Check, Download, Globe2, Lightbulb, LineChart, PieChart, Search, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { NextPage } from 'next';
import type { ReactNode } from 'react';

// const ACCENT = '#f2f2f0';
// const GREEN = '#82b94b';
// const ORANGE = '#b17a49';
const PAGE_BG = '#05080d';
// const PANEL_BG = '#071018';
const BORDER = 'rgba(255,255,255,0.15)';

interface ResearchSnapshotRow {
    topic: string;
    latestInsight: string;
    outlook: 'Neutral' | 'Positive';
}

interface CompanyRow {
    company: string;
    ticker: string;
    rating: 'Buy' | 'Hold';
    price: string;
    target: string;
    upside: string;
    brand: 'apple' | 'microsoft' | 'nvidia' | 'amazon' | 'meta';
}

interface EarningsRow {
    company: string;
    ticker: string;
    date: string;
    eps: string;
    revenue: string;
    time: string;
    brand: 'tesla' | 'nvidia' | 'microsoft' | 'apple' | 'amazon';
}

const researchPillars: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: Search,
        title: 'Comprehensive',
        body: 'Markets, companies, economics, and industries in one place.',
    },
    {
        icon: BarChart3,
        title: 'Data-Driven',
        body: 'Real-time data, advanced analytics, and expert research.',
    },
    {
        icon: Lightbulb,
        title: 'Actionable',
        body: 'Turn insights into ideas with clear takeaways.',
    },
    {
        icon: Globe2,
        title: 'Global Perspective',
        body: 'Stay informed with global coverage and macroeconomic views.',
    },
    {
        icon: ShieldCheck,
        title: 'Independent',
        body: 'Unbiased research designed to help you think for yourself.',
    },
];

const snapshotRows: ResearchSnapshotRow[] = [
    {
        topic: 'U.S. Economy',
        latestInsight: 'Inflation cooling, but services remain sticky.',
        outlook: 'Neutral',
    },
    {
        topic: 'Global Markets',
        latestInsight: 'Global growth remains resilient in 2024.',
        outlook: 'Positive',
    },
    {
        topic: 'Interest Rates',
        latestInsight: 'Rate cuts expected to begin Q3.',
        outlook: 'Neutral',
    },
    {
        topic: 'Commodities',
        latestInsight: 'Supply tightness supports higher prices.',
        outlook: 'Positive',
    },
    {
        topic: 'Currencies',
        latestInsight: 'USD strength may moderate ahead.',
        outlook: 'Neutral',
    },
];

const companyRows: CompanyRow[] = [
    {
        company: 'Apple Inc.',
        ticker: 'AAPL',
        rating: 'Buy',
        price: '$187.20',
        target: '$215.00',
        upside: '+14.8%',
        brand: 'apple',
    },
    {
        company: 'Microsoft Corp.',
        ticker: 'MSFT',
        rating: 'Buy',
        price: '$412.78',
        target: '$475.00',
        upside: '+15.1%',
        brand: 'microsoft',
    },
    {
        company: 'NVIDIA Corp.',
        ticker: 'NVDA',
        rating: 'Buy',
        price: '$949.50',
        target: '$1,150.00',
        upside: '+21.1%',
        brand: 'nvidia',
    },
    {
        company: 'Amazon.com Inc.',
        ticker: 'AMZN',
        rating: 'Hold',
        price: '$179.35',
        target: '$195.00',
        upside: '+8.7%',
        brand: 'amazon',
    },
    {
        company: 'Meta Platforms',
        ticker: 'META',
        rating: 'Buy',
        price: '$485.32',
        target: '$560.00',
        upside: '+15.4%',
        brand: 'meta',
    },
];

const earningsRows: EarningsRow[] = [
    {
        company: 'Tesla, Inc.',
        ticker: 'TSLA',
        date: 'May 22, 2024',
        eps: '$0.61',
        revenue: '$21.45B',
        time: 'After Close',
        brand: 'tesla',
    },
    {
        company: 'NVIDIA Corp.',
        ticker: 'NVDA',
        date: 'May 23, 2024',
        eps: '$5.19',
        revenue: '$24.66B',
        time: 'After Close',
        brand: 'nvidia',
    },
    {
        company: 'Microsoft Corp.',
        ticker: 'MSFT',
        date: 'May 30, 2024',
        eps: '$2.82',
        revenue: '$61.02B',
        time: 'After Close',
        brand: 'microsoft',
    },
    {
        company: 'Apple Inc.',
        ticker: 'AAPL',
        date: 'Jun 06, 2024',
        eps: '$1.25',
        revenue: '$89.23B',
        time: 'After Close',
        brand: 'apple',
    },
    {
        company: 'Amazon.com Inc.',
        ticker: 'AMZN',
        date: 'Jun 07, 2024',
        eps: '$0.98',
        revenue: '$143.12B',
        time: 'After Close',
        brand: 'amazon',
    },
];

const researchTools: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
}> = [
    {
        icon: Search,
        title: 'Stock Screener',
        body: 'Find opportunities that fit your criteria.',
    },
    {
        icon: PieChart,
        title: 'Financials Explorer',
        body: 'Analyze financials with depth.',
    },
    {
        icon: LineChart,
        title: 'Charting Suite',
        body: 'Advanced charts & technical analysis.',
    },
    {
        icon: Bell,
        title: 'Alerts & Watchlists',
        body: 'Track what matters in real time.',
    },
    {
        icon: Download,
        title: 'Data Export',
        body: 'Export data for your own analysis.',
    },
];

function CheckItem({ children }: { children: ReactNode }) {
    return (
        <li className='flex items-start gap-2.5 text-[13px] leading-[1.45] text-[#d3d8de] sm:text-[14px]'>
            <span className='mt-[1px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border border-[#dce2e8]/80'>
                <Check className='h-[10px] w-[10px]' strokeWidth={2.5} />
            </span>
            <span>{children}</span>
        </li>
    );
}

function SectionIntro({ number, title, description, bullets }: { number: string; title: string; description: string; bullets: string[] }) {
    return (
        <div className='min-w-0 lg:pr-5'>
            <div className='flex items-center gap-3'>
                <span className='research-serif page-section-number text-[43px] leading-none tracking-[-0.03em] text-[#eceae8]'>{number}</span>
                <span className='mt-1 h-px w-9 bg-[#d9d9d9]/70' />
            </div>

            <h2 className='research-serif page-section-title mt-1 text-[28px] leading-[1.05] tracking-[-0.025em] text-[#f7f4f0] sm:text-[31px]'>{title}</h2>

            <p className='mt-3 max-w-[270px] text-[13px] leading-[1.5] text-[#c6c9cd] sm:text-[14px]'>{description}</p>

            <ul className='mt-4 space-y-2'>
                {bullets.map((bullet) => (
                    <CheckItem key={bullet}>{bullet}</CheckItem>
                ))}
            </ul>
        </div>
    );
}

function Panel({ title, children, cta }: { title?: string; children: ReactNode; cta?: string }) {
    return (
        <div
            className='overflow-hidden rounded-[12px] border'
            style={{
                borderColor: BORDER,
                background: 'linear-gradient(180deg, rgba(8,17,25,0.98) 0%, rgba(5,11,17,0.98) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.018), 0 18px 35px rgba(0,0,0,0.15)',
            }}
        >
            {title && (
                <div className='px-4 pb-2 pt-4 sm:px-5'>
                    <p className='text-[12px] font-medium uppercase tracking-[0.015em] text-[#f0f0ee]'>{title}</p>
                </div>
            )}

            <div className='px-3 sm:px-4'>{children}</div>

            {cta && (
                <div className='flex justify-center px-4 pb-3 pt-2'>
                    <button
                        type='button'
                        className='group flex items-center gap-2 text-[12px] text-[#e5e5e4] transition-opacity hover:opacity-75 sm:text-[13px]'
                    >
                        {cta}
                        <ArrowRight className='h-4 w-4 transition-transform duration-200 group-hover:translate-x-1' />
                    </button>
                </div>
            )}
        </div>
    );
}

function BrandMark({ brand }: { brand: CompanyRow['brand'] | EarningsRow['brand'] }) {
    if (brand === 'apple') {
        return <span className='flex h-5 w-5 items-center justify-center text-[16px] leading-none text-white'>●</span>;
    }

    if (brand === 'microsoft') {
        return (
            <span className='grid h-[15px] w-[15px] grid-cols-2 gap-[1px]'>
                <span className='bg-[#f35325]' />
                <span className='bg-[#81bc06]' />
                <span className='bg-[#05a6f0]' />
                <span className='bg-[#ffba08]' />
            </span>
        );
    }

    if (brand === 'nvidia') {
        return <span className='flex h-[16px] w-[18px] items-center justify-center rounded-[2px] bg-[#78a943] text-[8px] font-bold text-black'>N</span>;
    }

    if (brand === 'amazon') {
        return <span className='flex h-5 w-5 items-center justify-center text-[17px] font-bold lowercase text-white'>a</span>;
    }

    if (brand === 'meta') {
        return <span className='flex h-5 w-6 items-center justify-center text-[15px] font-bold text-[#477ad8]'>∞</span>;
    }

    if (brand === 'tesla') {
        return <span className='flex h-5 w-5 items-center justify-center text-[16px] font-bold text-[#db3236]'>T</span>;
    }

    return null;
}

function OutlookBadge({ outlook }: { outlook: ResearchSnapshotRow['outlook'] }) {
    return (
        <span
            className='inline-flex rounded-[3px] px-1.5 py-[2px] text-[10px] leading-[1.2]'
            style={{
                color: outlook === 'Positive' ? '#8bc34a' : '#d2d2d2',
                background: outlook === 'Positive' ? 'rgba(112,165,65,0.09)' : 'rgba(255,255,255,0.05)',
                border: outlook === 'Positive' ? '1px solid rgba(112,165,65,0.22)' : '1px solid rgba(255,255,255,0.10)',
            }}
        >
            {outlook}
        </span>
    );
}

function DesktopRow({ children, columns }: { children: ReactNode; columns: string }) {
    return (
        <div
            className='grid min-h-[35px] items-center border-b border-white/[0.07] px-2 py-1.5 text-[11px] leading-[1.25] text-[#d6d9dc] last:border-b-0'
            style={{ gridTemplateColumns: columns }}
        >
            {children}
        </div>
    );
}

function Cell({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`min-w-0 px-1 ${className}`}>{children}</div>;
}

function MobileDataCard({ fields }: { fields: Array<{ label: string; value: ReactNode }> }) {
    return (
        <div className='border-b border-white/[0.08] px-1 py-3 last:border-b-0'>
            <dl className='grid grid-cols-2 gap-x-4 gap-y-2.5'>
                {fields.map((field) => (
                    <div key={field.label} className='min-w-0'>
                        <dt className='mb-0.5 text-[10px] uppercase tracking-[0.06em] text-[#727982]'>{field.label}</dt>
                        <dd className='break-words text-[12px] leading-[1.35] text-[#dde0e3]'>{field.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function WorldMapArtwork() {
    const cities = [
        [92, 138],
        [131, 112],
        [161, 157],
        [229, 121],
        [286, 94],
        [323, 139],
        [361, 108],
        [401, 161],
        [451, 126],
        [503, 178],
        [552, 132],
    ];

    return (
        <div className='relative mx-auto aspect-[1.82/1] w-full max-w-[680px]'>
            <div
                className='absolute inset-[8%] opacity-80 blur-3xl'
                style={{
                    background: 'radial-gradient(ellipse, rgba(66,107,145,0.18) 0%, rgba(17,34,50,0.05) 50%, transparent 75%)',
                }}
            />

            <svg viewBox='0 0 640 350' className='absolute inset-0 h-full w-full' aria-hidden='true'>
                <defs>
                    <pattern id='researchDots' width='5' height='5' patternUnits='userSpaceOnUse'>
                        <circle cx='1.2' cy='1.2' r='1' fill='#8a9daf' fillOpacity='0.55' />
                    </pattern>

                    <filter id='researchGlow' x='-100%' y='-100%' width='300%' height='300%'>
                        <feGaussianBlur stdDeviation='3.5' result='blur' />
                        <feMerge>
                            <feMergeNode in='blur' />
                            <feMergeNode in='SourceGraphic' />
                        </feMerge>
                    </filter>
                </defs>

                <path
                    d='M40 107l22-18 36-13 24 7 31-15 47 4 25 19-5 22-25 7-18 22-41 5-18 22-36-8-9-29-25-8-8-17zm199-36 42-16 48 7 25 19 37 10 21 25-7 29-32 11-26 24-38-8-24-25-26-6-22-24 2-46zm43 128 29-12 35 10 18 29-6 33-19 15-5 31-30 19-27-17-6-37-20-22 13-28 18-21zm133-24 32-14 46 6 27 24-4 29-26 14-12 26-37 8-28-18-6-32 8-43zm91-105 35-8 35 14 18 26-11 22-31 5-20 20-27-13-6-31 7-35z'
                    fill='url(#researchDots)'
                    opacity='0.9'
                />

                <path d='M101 137 Q210 34 323 138' fill='none' stroke='#a8c2d8' strokeOpacity='0.28' strokeWidth='1' />
                <path d='M127 111 Q315 10 502 177' fill='none' stroke='#a8c2d8' strokeOpacity='0.24' strokeWidth='1' />
                <path d='M160 157 Q315 69 451 126' fill='none' stroke='#a8c2d8' strokeOpacity='0.28' strokeWidth='1' />
                <path d='M286 94 Q420 70 552 132' fill='none' stroke='#a8c2d8' strokeOpacity='0.25' strokeWidth='1' />
                <path d='M92 138 Q230 190 401 161' fill='none' stroke='#a8c2d8' strokeOpacity='0.2' strokeWidth='1' />

                {cities.map(([cx, cy]) => (
                    <g key={`${cx}-${cy}`} filter='url(#researchGlow)'>
                        <circle cx={cx} cy={cy} r='2.6' fill='#ffffff' />
                        <circle cx={cx} cy={cy} r='6.5' fill='#8ec5f2' fillOpacity='0.18' />
                    </g>
                ))}
            </svg>
        </div>
    );
}

function SnapshotPanel() {
    const columns = '1.1fr .55fr 2fr .45fr';

    return (
        <Panel title='Market Research Snapshot' cta='View Full Market Research'>
            <div className='hidden sm:block'>
                <div className='grid border-b border-white/[0.08] px-2 py-2 text-[11px] text-[#b8bec4]' style={{ gridTemplateColumns: columns }}>
                    <Cell>Topic</Cell>
                    <Cell>View</Cell>
                    <Cell>Latest Insight</Cell>
                    <Cell>Outlook</Cell>
                </div>

                {snapshotRows.map((row) => (
                    <DesktopRow key={row.topic} columns={columns}>
                        <Cell className='text-[#eff1f2]'>{row.topic}</Cell>
                        <Cell>
                            <BarChart3 className='h-4 w-4 text-[#aeb4ba]' strokeWidth={1.5} />
                        </Cell>
                        <Cell>{row.latestInsight}</Cell>
                        <Cell>
                            <OutlookBadge outlook={row.outlook} />
                        </Cell>
                    </DesktopRow>
                ))}
            </div>

            <div className='sm:hidden'>
                {snapshotRows.map((row) => (
                    <MobileDataCard
                        key={row.topic}
                        fields={[
                            { label: 'Topic', value: row.topic },
                            { label: 'Outlook', value: <OutlookBadge outlook={row.outlook} /> },
                            { label: 'Latest Insight', value: row.latestInsight },
                            {
                                label: 'View',
                                value: <BarChart3 className='h-4 w-4 text-[#c7ccd1]' />,
                            },
                        ]}
                    />
                ))}
            </div>
        </Panel>
    );
}

function CompanyPanel() {
    const columns = '1.65fr .65fr .65fr .85fr .85fr .65fr';

    return (
        <Panel title='Top Researched Companies' cta='View All Company Research'>
            <div className='hidden sm:block'>
                <div className='grid border-b border-white/[0.08] px-2 py-2 text-[11px] text-[#b8bec4]' style={{ gridTemplateColumns: columns }}>
                    {['Company', 'Ticker', 'Rating', 'Price', 'Target', 'Upside'].map((heading) => (
                        <Cell key={heading}>{heading}</Cell>
                    ))}
                </div>

                {companyRows.map((row) => (
                    <DesktopRow key={row.ticker} columns={columns}>
                        <Cell>
                            <div className='flex items-center gap-2'>
                                <BrandMark brand={row.brand} />
                                <span>{row.company}</span>
                            </div>
                        </Cell>
                        <Cell>{row.ticker}</Cell>
                        <Cell className={row.rating === 'Buy' ? 'text-[#82b94b]' : 'text-[#b17a49]'}>{row.rating}</Cell>
                        <Cell>{row.price}</Cell>
                        <Cell>{row.target}</Cell>
                        <Cell className='text-[#82b94b]'>{row.upside}</Cell>
                    </DesktopRow>
                ))}
            </div>

            <div className='sm:hidden'>
                {companyRows.map((row) => (
                    <MobileDataCard
                        key={row.ticker}
                        fields={[
                            {
                                label: 'Company',
                                value: (
                                    <span className='flex items-center gap-2'>
                                        <BrandMark brand={row.brand} />
                                        {row.company}
                                    </span>
                                ),
                            },
                            { label: 'Ticker', value: row.ticker },
                            {
                                label: 'Rating',
                                value: <span className={row.rating === 'Buy' ? 'text-[#82b94b]' : 'text-[#b17a49]'}>{row.rating}</span>,
                            },
                            { label: 'Price', value: row.price },
                            { label: 'Target', value: row.target },
                            {
                                label: 'Upside',
                                value: <span className='text-[#82b94b]'>{row.upside}</span>,
                            },
                        ]}
                    />
                ))}
            </div>
        </Panel>
    );
}

function EarningsPanel() {
    const columns = '1.55fr .65fr 1fr .7fr .95fr .75fr';

    return (
        <Panel title='Upcoming Earnings' cta='View Full Earnings Calendar'>
            <div className='hidden sm:block'>
                <div className='grid border-b border-white/[0.08] px-2 py-2 text-[11px] text-[#b8bec4]' style={{ gridTemplateColumns: columns }}>
                    {['Company', 'Ticker', 'Date', 'EPS Est.', 'Revenue Est.', 'Time'].map((heading) => (
                        <Cell key={heading}>{heading}</Cell>
                    ))}
                </div>

                {earningsRows.map((row) => (
                    <DesktopRow key={row.ticker} columns={columns}>
                        <Cell>
                            <div className='flex items-center gap-2'>
                                <BrandMark brand={row.brand} />
                                <span>{row.company}</span>
                            </div>
                        </Cell>
                        <Cell>{row.ticker}</Cell>
                        <Cell>{row.date}</Cell>
                        <Cell>{row.eps}</Cell>
                        <Cell>{row.revenue}</Cell>
                        <Cell>{row.time}</Cell>
                    </DesktopRow>
                ))}
            </div>

            <div className='sm:hidden'>
                {earningsRows.map((row) => (
                    <MobileDataCard
                        key={row.ticker}
                        fields={[
                            {
                                label: 'Company',
                                value: (
                                    <span className='flex items-center gap-2'>
                                        <BrandMark brand={row.brand} />
                                        {row.company}
                                    </span>
                                ),
                            },
                            { label: 'Ticker', value: row.ticker },
                            { label: 'Date', value: row.date },
                            { label: 'EPS Est.', value: row.eps },
                            { label: 'Revenue Est.', value: row.revenue },
                            { label: 'Time', value: row.time },
                        ]}
                    />
                ))}
            </div>
        </Panel>
    );
}

const ResearchPage: NextPage = () => {
    return (
        <>
            <HeroSection />

            <main
                className='research-page min-h-screen overflow-hidden text-white'
                style={{
                    background:
                        'radial-gradient(circle at 70% 8%, rgba(41,73,99,0.08), transparent 28%), linear-gradient(180deg, #04070b 0%, #071019 48%, #04070b 100%)',
                }}
            >
                <section className='relative overflow-hidden border-b border-white/[0.09]'>
                    <div
                        className='pointer-events-none absolute inset-0 opacity-20'
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
                            backgroundSize: '44px 44px',
                        }}
                    />

                    <div className='relative mx-auto grid w-full max-w-[1180px] items-start gap-7 px-5 pb-5 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-[0.41fr_0.59fr] lg:gap-3 lg:px-9'>
                        <div className='relative z-10'>
                            <p className='text-[11px] font-medium uppercase tracking-[0.03em] text-[#f1f2f1] sm:text-[12px]'>
                                Deeper research. Better insights. Smarter decisions.
                            </p>

                            <h1 className='page-hero-title mt-3 text-[60px] font-semibold leading-[0.92] tracking-[-0.055em] text-[#f7f6f4] sm:text-[75px] lg:text-[78px]'>
                                Research
                            </h1>

                            <div className='mt-5 h-[3px] w-[58px] bg-[#e8e8e5]' />

                            <p className='mt-5 max-w-[420px] text-[16px] leading-[1.55] text-[#d7dade] sm:text-[18px]'>
                                Institutional-grade research and intelligence
                                <br className='hidden sm:block' /> to help you outperform the market.
                            </p>

                            <div className='page-hero-features mt-7 grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-5'>
                                {researchPillars.map(({ icon: Icon, title, body }) => (
                                    <div key={title} className='min-w-0'>
                                        <div className='flex h-[56px] w-[56px] items-center justify-center rounded-full border border-[#d7dce1]/80'>
                                            <Icon className='h-7 w-7 text-[#f2f4f6]' strokeWidth={1.6} />
                                        </div>

                                        <h3 className='mt-3 text-[11px] font-medium leading-[1.25] text-[#f2f2f1]'>{title}</h3>

                                        <p className='mt-2 max-w-[125px] text-[9px] leading-[1.45] text-[#aeb4ba] sm:text-[10px]'>{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='page-hero-art relative flex min-h-[210px] items-center sm:min-h-[280px] lg:min-h-[360px]'>
                            <WorldMapArtwork />
                        </div>
                    </div>
                </section>

                <div className='mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-9'>
                    <section className='grid gap-6 border-b border-white/[0.09] py-5 sm:py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='01'
                            title='Market Research'
                            description='Understand the forces that move markets.'
                            bullets={[
                                'Economic & macro analysis',
                                'Equity, fixed income, FX, commodities',
                                'Sector trends & global markets',
                                'Central bank & policy insights',
                            ]}
                        />
                        <SnapshotPanel />
                    </section>

                    <section className='grid gap-6 border-b border-white/[0.09] py-5 sm:py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='02'
                            title='Company Research'
                            description='Deep insights on companies that matter.'
                            bullets={[
                                'Financials & fundamentals',
                                'Earnings intelligence & estimates',
                                'Valuation & peer comparisons',
                                'Business model & competitive analysis',
                            ]}
                        />
                        <CompanyPanel />
                    </section>

                    <section className='grid gap-6 border-b border-white/[0.09] py-5 sm:py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='03'
                            title='Earnings & Events'
                            description='Stay ahead of key catalysts.'
                            bullets={[
                                'Earnings calendars & analysis',
                                'Conference calls & transcripts',
                                'Surprise history & estimates',
                                'Key corporate events',
                            ]}
                        />
                        <EarningsPanel />
                    </section>

                    <section className='grid gap-7 py-5 sm:py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16'>
                        <SectionIntro
                            number='04'
                            title='Research Tools'
                            description='Powerful tools for smarter research.'
                            bullets={['Advanced screening & filters', 'Financial modeling & ratios', 'Charting & technicals', 'Watchlists & alerts']}
                        />

                        <div>
                            <Panel>
                                <div className='page-mobile-grid grid grid-cols-2 divide-y-0 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x'>
                                    {researchTools.map(({ icon: Icon, title, body }) => (
                                        <div
                                            key={title}
                                            className='page-compact-card flex min-h-[150px] flex-col items-center px-5 py-5 text-center sm:border-b sm:border-white/[0.08] lg:border-b-0'
                                        >
                                            <Icon className='h-10 w-10 text-[#f1f3f4]' strokeWidth={1.4} />

                                            <h3 className='mt-4 text-[12px] font-medium text-[#f4f4f2]'>{title}</h3>

                                            <p className='mt-2 max-w-[140px] text-[10px] leading-[1.45] text-[#aab0b5]'>{body}</p>
                                        </div>
                                    ))}
                                </div>
                            </Panel>

                            <div
                                className='mt-5 flex flex-col gap-4 rounded-[12px] border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'
                                style={{
                                    borderColor: BORDER,
                                    background: 'linear-gradient(180deg, rgba(8,17,25,0.98), rgba(5,11,17,0.98))',
                                }}
                            >
                                <div className='flex items-center gap-4'>
                                    <BarChart3 className='h-9 w-9 shrink-0 text-[#f0f2f3]' strokeWidth={1.5} />

                                    <div>
                                        <p className='research-serif text-[19px] leading-[1.1] text-[#f5f3ef]'>
                                            Better Research. Better Insights. Better Results.
                                        </p>
                                        <p className='mt-1 text-[11px] text-[#aeb3b8]'>Research smarter and gain the edge you need to stay ahead.</p>
                                    </div>
                                </div>

                                <ComingSoonTrigger
                                    ariaLabel='Get started'
                                    className='group flex h-[48px] w-[200px] shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-[5px] bg-[#2c7bbe] px-5 text-[11px] font-medium uppercase tracking-[0.03em] text-white shadow-[0_0_24px_rgba(44,123,190,0.20)] transition-all duration-200 hover:bg-[#4cc7e8]'
                                >
                                    Get Started
                                    <ArrowRight className='h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1' />
                                </ComingSoonTrigger>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <style jsx global>{`
                .research-page {
                    font-family: 'Roboto', Arial, Helvetica, sans-serif;
                    background-color: ${PAGE_BG};
                    -webkit-font-smoothing: antialiased;
                    text-rendering: geometricPrecision;
                }

                .research-page h1,
                .research-page h2,
                .research-page h3,
                .research-page h4,
                .research-page h5,
                .research-page h6 {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                    overflow-wrap: normal;
                    word-break: normal;
                }

                .research-page .research-serif {
                    font-family: var(--font-michroma), sans-serif !important;
                    font-weight: 400 !important;
                }

                .research-page button,
                .research-page a {
                    -webkit-tap-highlight-color: transparent;
                }

                .research-page *,
                .research-page *::before,
                .research-page *::after {
                    box-sizing: border-box;
                    min-width: 0;
                }

                @media (max-width: 639px) {
                    .research-page {
                        overflow-wrap: normal;
                        word-break: normal;
                    }

                    .research-page .page-hero-title {
                        font-size: clamp(1.9rem, 8.6vw, 2.25rem) !important;
                        line-height: 1.13 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .research-page .page-section-number {
                        font-size: 1.95rem !important;
                        line-height: 1 !important;
                        letter-spacing: -0.02em !important;
                    }

                    .research-page .page-section-title {
                        font-size: clamp(1rem, 5vw, 1.22rem) !important;
                        line-height: 1.3 !important;
                        letter-spacing: -0.01em !important;
                    }

                    .research-page .page-hero-features {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                        gap: 0.85rem !important;
                        margin-top: 1.35rem !important;
                    }

                    .research-page .page-hero-features > * {
                        min-width: 0;
                    }

                    .research-page .page-hero-features > * > div:first-child {
                        width: 2.75rem !important;
                        height: 2.75rem !important;
                    }

                    .research-page .page-hero-features h3 {
                        margin-top: 0.55rem !important;
                        font-size: 0.64rem !important;
                        line-height: 1.35 !important;
                    }

                    .research-page .page-hero-features p {
                        margin-top: 0.35rem !important;
                        font-size: 0.5rem !important;
                        line-height: 1.35 !important;
                    }

                    .research-page .page-hero-art {
                        min-height: 11.5rem !important;
                        margin-top: 0.25rem !important;
                    }

                    .research-page .page-mobile-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 0.75rem !important;
                    }

                    .research-page .page-mobile-grid > * {
                        min-height: 0 !important;
                        border-left: 0 !important;
                        border-right: 0 !important;
                        border-top: 0 !important;
                        border-bottom: 0 !important;
                    }

                    .research-page .page-compact-card {
                        min-height: 0 !important;
                        padding: 0.9rem 0.65rem !important;
                    }

                    .research-page p,
                    .research-page li,
                    .research-page td,
                    .research-page th,
                    .research-page dd,
                    .research-page dt {
                        overflow-wrap: normal;
                        word-break: normal;
                    }
                }
            `}</style>
        </>
    );
};

export default ResearchPage;
