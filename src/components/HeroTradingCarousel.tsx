import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

type HeroSlide = {
    id: string;
    title: string;
    subtitle: string;
    workflow: string[];
    features: string[];
};

// Compact copy of the same eight tools featured in TradingPlatformShowcase.
// The purple palette follows the supplied hero-carousel reference image.
const slides: HeroSlide[] = [
    {
        id: 'paper-trading',
        title: 'Paper Trading',
        subtitle: 'Practice your strategy. Build confidence.',
        workflow: [
            'Build a paper order with quantity, side, and time-in-force.',
            'Trade with virtual funds in realistic market conditions.',
            'Review entries, exits, and session performance.',
            'Refine your approach before putting capital at risk.',
        ],
        features: ['Order book', 'Options practice', 'Session P/L', 'Paper floor', 'No live capital'],
    },
    {
        id: 'stock-screener',
        title: 'Stock Screener',
        subtitle: 'Filter the noise. Find your next setup.',
        workflow: [
            'Screen stocks by price, volume, fundamentals, and technicals.',
            'Compare matching companies side by side.',
            'Save your filters to return to the same opportunities.',
            'Set alerts when your criteria are met.',
        ],
        features: ['Advanced filters', 'Stock comparison', 'Saved screens', 'Alerts'],
    },
    {
        id: 'watchlist',
        title: 'Watchlist',
        subtitle: 'Keep the right names and alerts close.',
        workflow: [
            'Build a personalized list of the assets you follow.',
            'Check price movements, volume, and daily changes.',
            'Organize stocks by strategy, sector, or theme.',
            'Create alerts for the market moves that matter.',
        ],
        features: ['Live prices', 'Custom lists', 'Price alerts', 'Market trends'],
    },
    {
        id: 'market-movers',
        title: 'Market Movers',
        subtitle: 'See what is moving and why.',
        workflow: [
            'Spot the strongest gainers, losers, and unusual volume.',
            'Review the activity behind fast-moving stocks.',
            'Check catalysts and broader sector context.',
            'Turn promising movement into a focused watchlist.',
        ],
        features: ['Top gainers', 'Top losers', 'Volume spikes', 'Market catalysts'],
    },
    {
        id: 'global-kpi',
        title: 'Global KPI',
        subtitle: 'Understand the bigger economic picture.',
        workflow: [
            'Monitor major economic indicators across markets.',
            'Compare data across countries and time periods.',
            'Follow changes in growth, inflation, and employment.',
            'Use macro trends to add context to your decisions.',
        ],
        features: ['GDP', 'Inflation', 'Employment', 'Country comparison'],
    },
    {
        id: 'economic-simulator',
        title: 'Economic Simulator',
        subtitle: 'Model the change. Understand the impact.',
        workflow: [
            'Build an economic scenario using your own inputs.',
            'Adjust supply, demand, policies, and assumptions.',
            'Run simulations across different time horizons.',
            'Compare simulated outcomes to explore what changes.',
        ],
        features: ['Scenario builder', 'Interactive models', 'Policy changes', 'Simulations'],
    },
    {
        id: 'research',
        title: 'Research',
        subtitle: 'Turn deeper research into clearer decisions.',
        workflow: [
            'Explore market trends, rates, sectors, and commodities.',
            'Review company fundamentals and financial results.',
            'Follow earnings, catalysts, and corporate events.',
            'Bring research together before planning your next move.',
        ],
        features: ['Market research', 'Company insights', 'Earnings', 'Macro analysis'],
    },
    {
        id: 'market-calendars',
        title: 'Calendars',
        subtitle: 'Know the date. Know the event.',
        workflow: [
            'Check upcoming economic announcements and releases.',
            'Review earnings dates and reporting windows.',
            'Track dividends, IPOs, and corporate milestones.',
            'Plan ahead for events that may move the market.',
        ],
        features: ['Economic events', 'Earnings dates', 'Dividends', 'IPOs'],
    },
];

type HeroTradingCarouselProps = {
    onSubscribe: () => void;
    disabled?: boolean;
    checkingAccess?: boolean;
};

export default function HeroTradingCarousel({ onSubscribe, disabled = false, checkingAccess = false }: HeroTradingCarouselProps) {
    // Keep the tool and its four workflow steps in one state so autoplay
    // advances to the next tool exactly when step four finishes.
    const [position, setPosition] = useState({ slideIndex: 0, workflowIndex: 0 });
    const { slideIndex, workflowIndex } = position;
    const slide = slides[slideIndex];

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const timer = window.setInterval(() => {
            setPosition((current) => {
                const nextWorkflowIndex = current.workflowIndex + 1;
                if (nextWorkflowIndex >= slides[current.slideIndex].workflow.length) {
                    return {
                        slideIndex: (current.slideIndex + 1) % slides.length,
                        workflowIndex: 0,
                    };
                }
                return { ...current, workflowIndex: nextWorkflowIndex };
            });
        }, 4000);
        return () => window.clearInterval(timer);
    }, []);

    const selectSlide = (index: number) => {
        setPosition({ slideIndex: (index + slides.length) % slides.length, workflowIndex: 0 });
    };

    const words = slide.title.split(' ');
    const accentWord = words.pop() || slide.title;
    const firstWords = words.join(' ');
    // Economic Simulator is longer than the other tool names.
    // Fit it on ONE line instead of allowing the card/hero to jump in height.
    const compactTitle = slide.id === 'economic-simulator';

    return (
        <div
            role='region'
            aria-roledescription='carousel'
            aria-label='Explore Black Snow trading tools'
            className='relative w-full min-w-0 rounded-[20px] border border-[#414A5D] bg-[#0C0F18] px-4 py-3.5 text-white shadow-[0_14px_38px_rgba(0,0,0,.35)] sm:px-5 sm:py-4'
        >
            <div aria-live='polite' aria-atomic='true' className='min-w-0'>
                <h2
                    className={[
                        'flex min-h-[46px] min-w-0 items-center whitespace-nowrap py-[6px] font-black uppercase leading-[1.2] tracking-[-0.045em]',
                        compactTitle
                            ? 'text-[clamp(1.05rem,4.2vw,1.6rem)] min-[1100px]:text-[clamp(1.2rem,1.85vw,1.6rem)]'
                            : 'text-[clamp(1.25rem,5vw,2.1rem)] min-[1100px]:text-[clamp(1.5rem,2.15vw,2.15rem)]',
                    ].join(' ')}
                >
                    {firstWords && <span className='shrink-0 text-white'>{firstWords}&nbsp;</span>}
                    <span className='min-w-0 text-[#4333AF]'>{accentWord}</span>
                </h2>
                <p className='mt-1 h-[36px] overflow-hidden text-[12px] font-semibold leading-[17px] text-[#f1eff6] sm:h-[22px] sm:text-[13px] sm:leading-[18px]'>
                    {slide.subtitle}
                </p>
            </div>

            <div className='mt-2'>
                <p className='text-[10px] font-extrabold uppercase leading-4 tracking-[.16em] text-[#4333AF]'>Workflow</p>
                <p className='mt-0.5 h-[48px] overflow-hidden text-[11px] leading-[16px] text-[#e2dfe8] sm:h-[32px] sm:text-[12px] min-[1100px]:h-[24px]'>
                    {slide.workflow[workflowIndex]}
                </p>
                <div className='mt-2 grid grid-cols-4 gap-2' aria-label='Workflow steps'>
                    {slide.workflow.map((step, index) => (
                        <button
                            key={index}
                            type='button'
                            onClick={() => setPosition((current) => ({ ...current, workflowIndex: index }))}
                            aria-label={`Show workflow step ${index + 1}: ${step}`}
                            aria-pressed={index === workflowIndex}
                            className='h-[5px] rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF]'
                            style={{ backgroundColor: index === workflowIndex ? '#4333AF' : '#302d3c' }}
                        />
                    ))}
                </div>
            </div>

            <div className='mt-2.5'>
                <p className='text-[10px] font-extrabold uppercase leading-4 tracking-[.16em] text-[#4333AF]'>Features</p>
                <p className='mt-0.5 h-[48px] overflow-hidden text-[11px] leading-[16px] text-[#e2dfe8] sm:h-[32px] sm:text-[12px]'>
                    {slide.features.map((feature, index) => (
                        <span key={feature}>
                            {index > 0 && <span className='px-1.5 text-white/65'>•</span>}
                            {feature}
                        </span>
                    ))}
                </p>
            </div>

            <div className='mt-3 flex items-center gap-2 sm:gap-2.5'>
                <button
                    type='button'
                    onClick={() => selectSlide(slideIndex - 1)}
                    aria-label='Previous trading tool'
                    className='flex h-10 w-11 shrink-0 items-center justify-center rounded-xl border border-[#414A5D] bg-[#0C0F18] text-white transition-colors hover:bg-[#4333AF]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF]'
                >
                    <ChevronLeft className='h-5 w-5' strokeWidth={3} />
                </button>

                <button
                    type='button'
                    onClick={onSubscribe}
                    disabled={disabled}
                    className='flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-[#414A5D] bg-[#0C0F18] px-2 text-[13px] font-black uppercase tracking-[0.035em] text-white transition-colors hover:bg-[#4333AF]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]'
                >
                    {checkingAccess ? 'Checking…' : 'Subscribe'}
                    {!checkingAccess && <ArrowRight className='h-4 w-4' strokeWidth={3} />}
                </button>

                <button
                    type='button'
                    onClick={() => selectSlide(slideIndex + 1)}
                    aria-label='Next trading tool'
                    className='flex h-10 w-11 shrink-0 items-center justify-center rounded-xl border border-[#414A5D] bg-[#0C0F18] text-white transition-colors hover:bg-[#4333AF]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF]'
                >
                    <ChevronRight className='h-5 w-5' strokeWidth={3} />
                </button>
            </div>

            <div className='mt-2.5 grid grid-cols-8 gap-1.5 sm:gap-2' aria-label='Choose a trading tool'>
                {slides.map((item, index) => (
                    <button
                        key={item.id}
                        type='button'
                        onClick={() => selectSlide(index)}
                        aria-label={`Show ${item.title} (${index + 1} of ${slides.length})`}
                        aria-current={index === slideIndex ? 'true' : undefined}
                        className='h-[6px] min-w-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4333AF]'
                        style={{ backgroundColor: index === slideIndex ? '#4333AF' : '#302d3c' }}
                    />
                ))}
            </div>
        </div>
    );
}
