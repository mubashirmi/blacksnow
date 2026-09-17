import { BarChart2, Calendar, CheckCircle, DollarSign, Globe, List, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// ─── Strategy Panels Data ───────────────────────────────────────────────────
const strategyPanels = [
    {
        id: 'market-at-glance',
        href: '/market-movers',
        label: 'Major Indexes',
        accent: '#5EDC7A',
        HeaderIcon: TrendingUp,
        headerSubtitle: 'Market at a Glance',
        title: 'Market Movers',
        description: `Track indices, currencies, metals, and crypto ahead.\nIdentify capital flow and position before market moves.`,
        bullets: ['Track major indices performance', 'Monitor sector capital rotation', 'Identify gainers losers sentiment'],
        cta: 'View Market Overview',
        discoveryContent: `Get a real-time snapshot of the broader market across major indices, currencies, metals, and crypto. Market at a Glance helps you quickly understand where capital is flowing, which assets are gaining momentum, and how sentiment is shifting across global markets. Instead of piecing together scattered information, you can monitor the full landscape in one place and identify opportunities before they fully develop.`,
        discoveryCta: 'Open Market Overview',
    },
    {
        id: 'paper-trading',
        href: '/paper-trading',
        label: 'Paper Trading',
        accent: '#F5A623',
        HeaderIcon: DollarSign,
        headerSubtitle: 'Stock Market Simulator',
        title: 'Generate Consistent Profits',
        description: `Practice trading in a risk-free environment using real market data.\nDevelop strategies, test your skills, and build confidence before transitioning to a live account.`,
        bullets: ['Test trading strategies risk-free', 'Gain experience with real market data', 'Build confidence for live trading'],
        cta: 'Start Paper Trading',
        discoveryContent: `Practice real strategies with zero risk across stock trading, options trading, and crypto using a simulation environment that mirrors live market behavior. Execute trades, test position sizing, and refine entries and exits without putting real capital on the line. This gives you space to build confidence while developing consistency across multiple asset classes. Every move is tracked so you can analyze performance, identify strengths, and correct mistakes before stepping into live markets.`,
        discoveryCta: 'Launch Paper Trading',
    },
    {
        id: 'stock-screener',
        href: '/stock-screener',
        label: 'Stock Screener',
        accent: '#c45002',
        HeaderIcon: BarChart2,
        headerSubtitle: 'Market Analysis Tool',
        title: 'Find Your Next Trade',
        description: `Discover top stock opportunities with advanced screening tools.\nIdentify trends, filter by metrics, and spot winning setups in the market.`,
        bullets: ['Search for stocks with precise criteria', 'Analyze fundamental & technical data', 'Uncover trade opportunities fast'],
        cta: 'Start Screening',
        discoveryContent: `Instantly surface high-potential opportunities using customizable filters for volume, momentum, price action, and fundamentals. Instead of scanning hundreds of charts, the screener narrows the market down to only stocks that meet your exact criteria. This saves time and removes guesswork from your daily routine. You stay focused on quality setups while eliminating unnecessary noise from your workflow.`,
        discoveryCta: 'Open Stock Screener',
    },
    {
        id: 'watchlist',
        href: '/watchlist',
        label: 'Watchlist',
        accent: '#E74C3C',
        HeaderIcon: List,
        headerSubtitle: 'Track Stock Performance',
        title: 'Monitor Your Favorites',
        description: `Keep an eye on your top stocks. Easily organize and track price movements.\nStay informed and react quickly to market changes.`,
        bullets: ['Create and manage a personalized watchlist', 'Get real-time price updates and alerts', 'Track performance in one convenient view'],
        cta: 'Start Watching',
        discoveryContent: `Track your favorite assets in one centralized dashboard built for speed and clarity. Monitor real-time price movement, volume changes, and trend shifts throughout the trading day. Your watchlist becomes your daily command center for planning entries and managing opportunities. With everything organized in one place, you're always prepared when momentum appears.`,
        discoveryCta: 'Build Your Watchlist',
    },
    {
        id: 'economic-kpis',
        href: '/global-kpi',
        label: 'Global KPI',
        accent: '#4A90D9',
        HeaderIcon: Globe,
        headerSubtitle: 'World Economic KPI Dashboard',
        title: 'Explore Key Economic KPIs',
        description: `Access economic health metrics, analyze global trends,\ncompare countries, and stay informed on key long-term indicators.`,
        bullets: ['View GDP, inflation, unemployment & more', 'Compare country data for informed decisions', 'Track economic trends across the world'],
        cta: 'Explore KPIs',
        discoveryContent: `Gain a macro-level edge by monitoring the economic forces that drive market cycles and sector rotation. Our global KPI dashboard aggregates real-time data on GDP growth, inflation rates, central bank policy, and employment trends across major economies. Understanding these indicators helps you anticipate broader market movements, position ahead of macro shifts, and make more informed long-term investment decisions grounded in economic reality.`,
        discoveryCta: 'Explore Global KPIs',
    },
    {
        id: 'economic-simulator',
        href: '/economic-simulator',
        label: 'Economic Simulator',
        accent: '#5F32C8',
        HeaderIcon: BarChart2,
        headerSubtitle: 'Supply and Demand',
        title: 'Interactive Charts',
        description: `Explore advanced economic models with dynamic visuals and rigorous theory.\nUsers can manipulate charts using toggle switches for insights, equilibrium analysis, and growth.`,
        bullets: ['Interactive toggles for chart control', 'Access advanced economic models', 'Build core market understanding'],
        cta: 'Explore Simulator',
        discoveryContent: `Interact with economic models through dynamic charts designed to make complex theory easier to understand. Adjust variables, use toggle controls, and explore how changes in supply, demand, equilibrium, and growth affect outcomes in real time. The simulator turns static concepts into hands-on learning, helping users build stronger intuition around market mechanics, price behavior, and economic relationships through clear visual feedback.`,
        discoveryCta: 'Open Economic Simulator',
    },
    {
        id: 'market-calendars',
        href: '/market-moving-calenders',
        label: 'Market Calendars',
        accent: '#D32F2F',
        HeaderIcon: Calendar,
        headerSubtitle: 'Market Moving Calendars',
        title: 'Market Moving Calendars',
        description: `All the key dates that drive markets—in one place.\nAnticipate moves, stay prepared, and improve results.`,
        bullets: [
            'Track economic releases and indicator events',
            'Stay ahead of dividend payments and ex-dates',
            'Discover upcoming IPOs and earnings reports',
        ],
        cta: 'Explore All Calendars',
        discoveryContent: `All the key dates that drive markets—in one place. Track economic releases, dividends, IPOs, and earnings reports to anticipate moves before they impact the market. Stay prepared, save time with all key events in one place, reduce risk, and improve results through better timing.`,
        discoveryCta: 'Explore All Calendars',
    },
    {
        id: 'research',
        href: '/research',
        label: 'Research',
        accent: '#1976D2',
        HeaderIcon: Globe,
        headerSubtitle: 'Research',
        title: 'Institutional-Grade Research',
        description: `Institutional-grade research and intelligence to help you outperform the market.\nDeeper research, better insights, smarter decisions.`,
        bullets: [
            'Comprehensive markets, companies, and economics in one place',
            'Data-driven real-time analytics and expert research',
            'Independent, unbiased research designed to help you think for yourself',
        ],
        cta: 'Explore Research',
        discoveryContent: `Deeper research, better insights, smarter decisions. Institutional-grade research and intelligence to help you outperform the market. Enjoy comprehensive coverage, data-driven real-time analytics, actionable takeaways, and global perspectives to research smarter and gain the edge you need to stay ahead.`,
        discoveryCta: 'Explore Research',
    },
];

// Bolds the first word of each bullet
const BSBullets = ({ accent, items, large = false }: { accent: string; items: string[]; large?: boolean }) => (
    <div className={large ? 'space-y-5 md:space-y-7' : 'space-y-4'}>
        {items.map((text, idx) => {
            const spaceIdx = text.indexOf(' ');
            const boldPart = spaceIdx !== -1 ? text.slice(0, spaceIdx) : text;
            const restPart = spaceIdx !== -1 ? text.slice(spaceIdx) : '';
            return (
                <div key={idx} className='flex items-start gap-3 md:gap-4'>
                    <CheckCircle
                        strokeWidth={3}
                        className={large ? 'h-6 w-6 md:h-7 md:w-7 mt-0.5 flex-shrink-0' : 'h-5 w-5 mt-0.5 flex-shrink-0'}
                        style={{ color: accent }}
                    />
                    <div className={large ? 'text-lg md:text-xl lg:text-2xl text-white/80 leading-snug' : 'text-base md:text-lg text-white/80 leading-snug'}>
                        <span className='font-bold text-white'>{boldPart}</span>
                        {restPart}
                    </div>
                </div>
            );
        })}
    </div>
);

export default function DataDrivenMarketHub() {
    const [panelTabs, setPanelTabs] = useState<Record<string, 'Details' | 'Discovery'>>(Object.fromEntries(strategyPanels.map((p) => [p.id, 'Details'])));

    return (
        <section className='relative py-16 px-4 sm:px-6 md:px-8 bg-[#0B1320] overflow-hidden'>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]' />

            <div className='container mx-auto max-w-7xl relative z-10'>
                {/* Section Heading */}
                <div className='text-center mb-12'>
                    <h2 className='text-[clamp(1.38rem,5.8vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-[1.22] sm:leading-tight'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent whitespace-nowrap'>
                            Explore Data-Driven
                        </span>
                        <br />
                        <span className='whitespace-nowrap'>
                            <span className='text-white'>Market </span>
                            <span className='relative inline-block'>
                                <span className='bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] bg-clip-text text-transparent'>
                                    Intelligence Hub
                                </span>
                            </span>
                        </span>
                    </h2>
                    <p className='text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed font-light mt-6'>
                        Master every tool in your trading arsenal. Explore each strategy and discover how it works.
                    </p>
                </div>

                {/* Stacked panels */}
                <div className='flex flex-col gap-8'>
                    {strategyPanels.map((panel) => {
                        const { HeaderIcon, accent, id } = panel;
                        const activeTab = panelTabs[id] ?? 'Details';

                        return (
                            <div
                                key={id}
                                className='relative rounded-3xl overflow-hidden border border-white/10 flex flex-col'
                                style={{
                                    background: 'linear-gradient(135deg, #0d1117 0%, #0B1320 50%, #0d1117 100%)',
                                    boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.6), 0 0 80px ${accent}18`,
                                }}
                            >
                                {/* Glow accent line at top */}
                                <div
                                    className='absolute top-0 left-0 right-0 h-[2px]'
                                    style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                                />
                                <div
                                    className='pointer-events-none absolute inset-0'
                                    style={{ background: `radial-gradient(ellipse at 20% 30%, ${accent}0d 0%, transparent 55%)` }}
                                />

                                {/* Header + Tabs Row */}
                                <div className='relative z-10 flex flex-col gap-6 px-5 sm:px-10 md:px-14 lg:px-16 pt-8 md:pt-10 lg:pt-12 pb-0'>
                                    <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
                                        <div className='flex items-center gap-4 sm:gap-5 min-w-0'>
                                            <div
                                                className='flex items-center justify-center rounded-2xl h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 flex-shrink-0'
                                                style={{ backgroundColor: accent }}
                                            >
                                                <HeaderIcon className='h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 lg:h-16 lg:w-16' style={{ color: '#0B1320' }} />
                                            </div>
                                            <div className='min-w-0'>
                                                <div className='text-2xl sm:text-4xl md:text-5xl lg:text-6xl lg:mb-2 font-bold text-white leading-tight'>
                                                    {panel.label}
                                                </div>
                                                <div className='text-sm sm:text-lg md:text-xl lg:text-2xl font-medium leading-snug' style={{ color: accent }}>
                                                    {panel.headerSubtitle}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reference-style Tabs */}
                                        <div className='w-full lg:w-auto lg:flex-shrink-0'>
                                            <div className='relative flex items-end gap-6 sm:gap-8 md:gap-10 overflow-x-auto'>
                                                {(['Details', 'Discovery'] as const).map((tab) => {
                                                    const isActive = activeTab === tab;

                                                    return (
                                                        <button
                                                            key={tab}
                                                            onClick={() => setPanelTabs((prev) => ({ ...prev, [id]: tab }))}
                                                            className='relative flex-shrink-0 px-0 py-2 sm:py-3 text-center transition-all duration-200'
                                                            style={{ background: 'transparent', border: 'none', outline: 'none' }}
                                                        >
                                                            <span
                                                                className='block text-[13px] sm:text-[15px] md:text-lg font-black uppercase tracking-[0.08em] sm:tracking-[0.12em] transition-all duration-200'
                                                                style={{
                                                                    color: isActive ? accent : 'rgba(187, 204, 230, 0.72)',
                                                                    textShadow: isActive ? `0 0 12px ${accent}55` : 'none',
                                                                }}
                                                            >
                                                                {tab}
                                                            </span>

                                                            <span
                                                                className='absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-all duration-300'
                                                                style={{
                                                                    background: isActive ? accent : 'transparent',
                                                                    boxShadow: isActive ? `0 0 10px ${accent}` : 'none',
                                                                    opacity: isActive ? 1 : 0,
                                                                    transform: isActive ? 'scaleX(1)' : 'scaleX(0.55)',
                                                                }}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thin separator line below header/tabs */}
                                <div
                                    className='relative z-10 mx-5 sm:mx-10 md:mx-14 lg:mx-16 mt-5 md:mt-6 h-px'
                                    style={{ background: 'rgba(255,255,255,0.07)' }}
                                />

                                {/* Tab Content */}
                                <div className='relative z-10 px-5 sm:px-10 md:px-14 lg:px-16 py-8 md:py-12 lg:py-16'>
                                    <div className='grid'>
                                        {/* ── DETAILS TAB ── */}
                                        <div
                                            aria-hidden={activeTab !== 'Details'}
                                            className={`col-start-1 row-start-1 flex flex-col transition-all duration-300 ${
                                                activeTab === 'Details'
                                                    ? 'visible opacity-100 translate-x-0'
                                                    : 'invisible opacity-0 translate-x-4 pointer-events-none'
                                            }`}
                                        >
                                            <div>
                                                <h3 className='text-2xl md:text-5xl lg:text-6xl font-extralight text-white leading-[1.22] md:leading-tight mb-6 md:mb-8'>
                                                    {panel.title}
                                                </h3>

                                                <div className='space-y-2 md:space-y-3'>
                                                    {panel.description.split('\n').map((line, i) => (
                                                        <p key={i} className='text-base sm:text-xl md:text-2xl text-white/45 leading-relaxed'>
                                                            {line}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className='flex flex-col xl:flex-row xl:items-end justify-between gap-8 md:gap-12 mt-8 md:mt-12 lg:mt-16'>
                                                <BSBullets accent={accent} items={panel.bullets} large />

                                                <div className='flex-shrink-0'>
                                                    <Link
                                                        href={panel.href}
                                                        className='w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 rounded-full inline-flex items-center justify-center gap-3 font-semibold text-white text-base md:text-lg lg:text-xl whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95'
                                                        style={{
                                                            background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
                                                            border: `2px solid ${accent}`,
                                                            boxShadow: `0 0 28px ${accent}45`,
                                                        }}
                                                    >
                                                        {panel.cta}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── DISCOVERY TAB ── */}
                                        <div
                                            aria-hidden={activeTab !== 'Discovery'}
                                            className={`col-start-1 row-start-1 flex flex-col gap-8 md:gap-12 transition-all duration-300 ${
                                                activeTab === 'Discovery'
                                                    ? 'visible opacity-100 translate-x-0'
                                                    : 'invisible opacity-0 translate-x-4 pointer-events-none'
                                            }`}
                                        >
                                            <p className='text-base sm:text-xl md:text-2xl text-white/70 leading-relaxed'>{panel.discoveryContent}</p>

                                            <div className='flex-shrink-0'>
                                                <Link
                                                    href={panel.href}
                                                    className='w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 rounded-full inline-flex items-center justify-center gap-3 font-semibold text-white text-base md:text-lg lg:text-xl whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95'
                                                    style={{
                                                        background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
                                                        border: `2px solid ${accent}`,
                                                        boxShadow: `0 0 28px ${accent}45`,
                                                    }}
                                                >
                                                    {panel.discoveryCta}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
