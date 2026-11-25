'use client';

import AuthModal from '@/components/AuthModal';
import { PricingComponent } from '@/components/PricingComponent';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import lottie from 'lottie-web';
import {
    ArrowRight,
    BookOpenText,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Globe2,
    Mail,
    Newspaper,
    ShieldCheck,
    Target,
    TrendingUp,
    X,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { parseCookies } from 'nookies';
import { useEffect, useRef, useState } from 'react';

const ANIMATIONS = {
    hero: '/animations/newslettercta.json',
    cta: '/animations/newsletterherosection.json',
} as const;

function NewsletterAnimation({
    src,
    fallback: Fallback,
    className = 'h-full w-full',
    fallbackClassName = 'h-20 w-20 text-[#8350E0]',
}: {
    src: string;
    fallback: LucideIcon;
    className?: string;
    fallbackClassName?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;
        let instance: ReturnType<typeof lottie.loadAnimation> | null = null;
        const controller = new AbortController();
        setReady(false);

        // The path is intentionally blank until you paste in your own JSON file.
        // Do not request the current page as if it were animation JSON.
        if (!src.trim())
            return () => {
                mounted = false;
                controller.abort();
            };

        (async () => {
            try {
                const response = await fetch(src, { signal: controller.signal });
                if (!response.ok || !mounted || !containerRef.current) return;
                const animationData = await response.json();
                if (!mounted || !containerRef.current) return;
                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                instance = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop: !reduceMotion,
                    autoplay: !reduceMotion,
                    animationData,
                });
                instance.addEventListener('DOMLoaded', () => {
                    if (!mounted) return;
                    if (reduceMotion) instance?.goToAndStop(0, true);
                    setReady(true);
                });
            } catch {
                // The JSON is optional, so keep the static icon visible.
            }
        })();

        return () => {
            mounted = false;
            controller.abort();
            instance?.destroy();
        };
    }, [src]);

    return (
        <div className={`relative flex shrink-0 items-center justify-center ${className}`}>
            <Fallback
                aria-hidden='true'
                className={`absolute transition-opacity duration-300 ${fallbackClassName} ${ready ? 'opacity-0' : 'opacity-100'}`}
                strokeWidth={1.55}
            />
            <div ref={containerRef} aria-hidden='true' className={`h-full w-full transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
}

const FEATURES: Array<{ title: string; description: string; icon: LucideIcon }> = [
    {
        title: 'Weekly Stock Picks',
        description: 'Follow selected stocks and the research context behind each idea, with the themes and risks worth watching.',
        icon: Target,
    },
    {
        title: 'Macro Market Updates',
        description: 'Understand the economic stories shaping markets, including interest rates, inflation, and major policy announcements.',
        icon: Globe2,
    },
    {
        title: 'Latest Blog Articles',
        description: 'Stay connected with newly published Black Snow articles and useful market education in one weekly email.',
        icon: Newspaper,
    },
    {
        title: 'Exclusive Financial Insights',
        description: 'Go beyond the headline with clear explanations of market movements, sector themes, and noteworthy developments.',
        icon: TrendingUp,
    },
    {
        title: 'Portfolio Strategy Notes',
        description: 'Explore educational ideas around diversification, risk awareness, and building a thoughtful investment process.',
        icon: BookOpenText,
    },
    {
        title: 'Market Data Briefings',
        description: 'See the earnings dates, economic releases, and scheduled events that deserve a place on your market calendar.',
        icon: CalendarDays,
    },
];

const STEPS = [
    { number: '01', title: 'Create Your Account', description: 'Sign in or create your Black Snow account to begin your subscription.' },
    { number: '02', title: 'Choose Your Plan', description: 'Select monthly or annual Newsletter access through the existing Black Snow checkout.' },
    { number: '03', title: 'Get the Weekly Brief', description: 'Receive market updates, stock research themes, and key events in a single email.' },
    { number: '04', title: 'Explore with Confidence', description: 'Read the analysis, open useful resources, and plan what you want to research next.' },
];

const PRICING_HIGHLIGHTS: Array<{ icon: LucideIcon; value: string; description: string; detail: string }> = [
    { icon: Mail, value: '$9.99 / mo', description: 'Newsletter monthly access.', detail: 'Cancel according to the subscription policy.' },
    { icon: CalendarDays, value: '$49.99 / yr', description: 'Annual Newsletter option.', detail: 'Same content, annual billing.' },
    { icon: Clock3, value: 'Weekly', description: 'Curated market newsletter.', detail: 'Insights delivered to your inbox.' },
    { icon: Newspaper, value: '6 Topics', description: 'Stock ideas, macro updates, and more.', detail: 'One organized weekly briefing.' },
];

const PREVIEW_SLIDES = [
    {
        title: 'Market Overview',
        description: 'The bigger market picture, explained without unnecessary noise.',
        items: ['Macro developments and policy context', 'Key releases to watch this week', 'Important market themes and risks'],
    },
    {
        title: 'Stock Research',
        description: 'Selected companies and research questions for a more focused watchlist.',
        items: ['Companies in focus and why they matter', 'Sector trends and notable catalysts', 'Research considerations and risk factors'],
    },
    {
        title: 'Events & Insights',
        description: 'A compact view of the week ahead, with reading that adds context.',
        items: ['Earnings, dividends, and economic dates', 'Fresh Black Snow articles', 'Portfolio and financial education notes'],
    },
];

function NewsletterPreviewModal({ open, onOpenChange }: { open: boolean; onOpenChange: (next: boolean) => void }) {
    const [index, setIndex] = useState(0);
    const current = PREVIEW_SLIDES[index];

    useEffect(() => {
        if (open) setIndex(0);
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-3xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl sm:rounded-3xl border border-[#414A5D] bg-[#0C0F18] p-5 text-white sm:p-8 [&>button]:hidden'>
                <button
                    type='button'
                    onClick={() => onOpenChange(false)}
                    aria-label='Close newsletter preview'
                    className='absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-[#414A5D] bg-[#0A0D14] text-white transition-colors hover:border-[#8350E0]'
                >
                    <X className='h-5 w-5' />
                </button>
                <DialogHeader className='pr-9 text-left'>
                    <DialogTitle className='text-2xl font-black text-white sm:text-3xl'>
                        Inside the <span className='text-[#8350E0]'>Newsletter</span>
                    </DialogTitle>
                    <DialogDescription className='text-sm text-gray-300 sm:text-base'>An illustrative preview of the content you can expect.</DialogDescription>
                </DialogHeader>

                <div className='mt-4 rounded-2xl border border-[#414A5D] bg-[#0A0D14] p-5 sm:p-7'>
                    <div className='mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-[#414A5D] pb-4'>
                        <span className='text-xs font-bold uppercase tracking-[0.15em] text-[#8350E0]'>Black Snow / Weekly Brief</span>
                        <span className='text-xs text-gray-400'>
                            0{index + 1} / 0{PREVIEW_SLIDES.length}
                        </span>
                    </div>
                    <h3 className='mb-3 text-xl font-bold text-white sm:text-2xl'>{current.title}</h3>
                    <p className='mb-5 text-sm leading-relaxed text-gray-300 sm:text-base'>{current.description}</p>
                    <div className='space-y-3'>
                        {current.items.map((item) => (
                            <div key={item} className='flex items-start gap-3 rounded-lg border border-[#414A5D] bg-[#0C0F18] px-4 py-3'>
                                <Check className='mt-0.5 h-4 w-4 shrink-0 text-[#8350E0]' />
                                <span className='text-sm text-gray-300'>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='flex items-center justify-between gap-3 pt-1'>
                    <button
                        type='button'
                        onClick={() => setIndex((value) => (value + PREVIEW_SLIDES.length - 1) % PREVIEW_SLIDES.length)}
                        className='flex h-11 w-11 items-center justify-center rounded-xl border border-[#414A5D] text-white hover:border-[#8350E0]'
                        aria-label='Previous preview slide'
                    >
                        <ChevronLeft className='h-5 w-5' />
                    </button>
                    <div className='flex items-center gap-2' aria-label='Preview pagination'>
                        {PREVIEW_SLIDES.map((slide, number) => (
                            <button
                                key={slide.title}
                                type='button'
                                aria-label={`Go to preview ${number + 1}`}
                                aria-current={index === number ? 'true' : undefined}
                                onClick={() => setIndex(number)}
                                className={`h-2 rounded-full transition-all ${index === number ? 'w-7 bg-[#8350E0]' : 'w-2 bg-[#414A5D]'}`}
                            />
                        ))}
                    </div>
                    <button
                        type='button'
                        onClick={() => setIndex((value) => (value + 1) % PREVIEW_SLIDES.length)}
                        className='flex h-11 w-11 items-center justify-center rounded-xl border border-[#414A5D] text-white hover:border-[#8350E0]'
                        aria-label='Next preview slide'
                    >
                        <ChevronRight className='h-5 w-5' />
                    </button>
                </div>
                <p className='text-center text-xs leading-relaxed text-gray-400'>
                    Example content only. This is not a published issue or personalized investment advice.
                </p>
            </DialogContent>
        </Dialog>
    );
}

export default function Newsletter() {
    const [authOpen, setAuthOpen] = useState(false);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [openPricingAfterAuth, setOpenPricingAfterAuth] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const handlePurchaseClick = () => {
        const cookies = parseCookies();
        const storedId = typeof window !== 'undefined' ? localStorage.getItem('userId') || localStorage.getItem('id') : null;
        if (cookies.id || storedId) {
            setAuthOpen(false);
            setOpenPricingAfterAuth(false);
            setPricingOpen(true);
        } else {
            setPricingOpen(false);
            setOpenPricingAfterAuth(false);
            setAuthOpen(true);
        }
    };

    const handleAuthSuccess = () => {
        setPricingOpen(false);
        setOpenPricingAfterAuth(true);
        setAuthOpen(false);
        return false;
    };

    useEffect(() => {
        if (authOpen || !openPricingAfterAuth) return;
        const timer = window.setTimeout(() => {
            setOpenPricingAfterAuth(false);
            setPricingOpen(true);
        }, 250);
        return () => window.clearTimeout(timer);
    }, [authOpen, openPricingAfterAuth]);

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hero: same layout, spacing, typography, button order and animation frame as Digital Billboards / Business Invoice. */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        <div className='space-y-10 animate-slide-in-left'>
                            <div>
                                <div className='inline-block'>
                                    <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-white mb-4 sm:mb-5'>
                                        <span className='text-[#8350E0]'>Black Snow</span> Newsletter
                                    </h1>
                                </div>
                                <p className='text-md sm:text-lg text-gray-300 leading-relaxed max-w-2xl'>
                                    Stay connected to the market with the Black Snow Newsletter. Get weekly stock research ideas, macroeconomic updates,
                                    financial insights, portfolio strategy notes, and important market events brought together in one clear, easy-to-read
                                    briefing. Less time sorting through headlines, more time understanding what matters.
                                </p>
                            </div>
                            <div className='flex flex-col sm:flex-row sm:flex-wrap lg:flex-col 2xl:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    className='border-2 cursor-pointer px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-[calc(50%_-_0.75rem)] lg:w-full lg:max-w-[300px] 2xl:w-[300px] border-[#8350E0] bg-[#8350E0] text-white hover:bg-[#693DB6] hover:text-white hover:border-[#693DB6]'
                                >
                                    Purchase
                                </Button>
                                <Button
                                    size='lg'
                                    onClick={() => setPreviewOpen(true)}
                                    className='group border-2 box-border cursor-pointer px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-[calc(50%_-_0.75rem)] lg:w-full lg:max-w-[300px] 2xl:w-[300px] bg-transparent shadow-[0_0_18px_rgba(131,80,224,0.12)] !border-white !bg-transparent hover:!border-[#8350E0] text-[#8350E0]'
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>
                        <div className='relative animate-slide-in-right min-w-0'>
                            <div className='relative flex items-center justify-center w-full h-full'>
                                <div className='flex items-center justify-center w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] aspect-square rounded-2xl sm:rounded-3xl border border-[#414A5D]'>
                                    <div className='w-[90%] aspect-square sm:w-full'>
                                        <NewsletterAnimation
                                            src={ANIMATIONS.hero}
                                            fallback={Mail}
                                            className='w-full h-full'
                                            fallbackClassName='h-32 w-32 sm:h-40 sm:w-40 text-[#8350E0]'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing overview: same visual system and four-across summary as existing product pages. */}
            <section aria-label='Newsletter pricing overview' className='relative bg-[#050608] px-4 py-14 sm:px-6 sm:py-20 lg:px-8'>
                <div className='mx-auto w-full max-w-7xl'>
                    <header className='mb-9 text-center sm:mb-12'>
                        <p className='mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#8350E0] sm:text-sm'>Pricing</p>
                        <h2 className='text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl'>What’s included</h2>
                        <p className='mt-4 text-base text-zinc-400 sm:text-lg'>Weekly market insights, with monthly or annual billing.</p>
                        <span className='mt-5 inline-flex max-w-full items-center justify-center rounded-full border border-[#414A5D] px-5 py-2 text-sm font-medium text-[#8350E0] sm:text-base'>
                            Newsletter
                        </span>
                    </header>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5'>
                        {PRICING_HIGHLIGHTS.map(({ icon: Icon, value, description, detail }) => (
                            <article
                                key={value}
                                className='flex h-full min-w-0 flex-col rounded-2xl border border-[#414A5D] bg-[#0C0F18] px-5 py-6 sm:px-6 sm:py-7 lg:px-4 xl:px-5 2xl:px-6'
                            >
                                <div className='flex min-h-12 min-w-0 items-center gap-3 lg:gap-2 xl:gap-3'>
                                    <span
                                        aria-hidden='true'
                                        className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#414A5D] bg-[#8350E0]/10 text-[#8350E0] lg:h-9 lg:w-9 xl:h-11 xl:w-11'
                                    >
                                        <Icon className='h-6 w-6 lg:h-5 lg:w-5 xl:h-6 xl:w-6' strokeWidth={1.8} />
                                    </span>
                                    <h3 className='min-w-0 whitespace-nowrap text-[clamp(1rem,4vw,1.35rem)] font-bold leading-tight tracking-tight text-white sm:text-[clamp(1rem,2.6vw,1.35rem)] lg:text-[clamp(0.875rem,1.5vw,1.125rem)] xl:text-[clamp(1rem,1.5vw,1.25rem)]'>
                                        {value}
                                    </h3>
                                </div>
                                <span aria-hidden='true' className='mt-6 mb-4 h-[2px] w-11 bg-[#8350E0]' />
                                <p className='text-sm leading-relaxed text-zinc-300 sm:text-[0.95rem]'>{description}</p>
                                <p className='mt-1 text-sm leading-relaxed text-zinc-400 sm:text-[0.95rem]'>{detail}</p>
                            </article>
                        ))}
                    </div>
                    <div className='mt-9 flex justify-center sm:mt-11'>
                        <button
                            type='button'
                            onClick={handlePurchaseClick}
                            className='inline-flex min-h-14 w-full max-w-[330px] cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#8350E0] px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#693DB6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8350E0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050608] sm:text-lg'
                        >
                            Get started <ArrowRight className='h-5 w-5' aria-hidden='true' />
                        </button>
                    </div>
                </div>
            </section>

            {/* Same numbered, four-column step cards as Business Invoice. */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            How It <span className='text-[#8350E0]'>Works</span>
                        </h2>
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>Get informed in four simple steps</p>
                    </div>
                    <div className='relative grid auto-rows-fr items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8'>
                        {STEPS.map(({ number, title, description }, index) => (
                            <div key={number} className='group relative h-full min-w-0'>
                                <div className='relative flex h-full min-h-[230px] flex-col rounded-2xl border border-[#414A5D] bg-[#0C0F18] p-6 transition-[border-color,box-shadow] duration-300 hover:shadow-lg hover:shadow-[#8350E0]/15 sm:p-8 lg:min-h-[250px]'>
                                    <div className='absolute -top-4 -right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#8350E0] shadow-lg shadow-[#8350E0]/15 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14'>
                                        <span className='text-lg font-black text-white sm:text-xl'>{number}</span>
                                    </div>
                                    <div className='mt-6 sm:mt-8'>
                                        <h3 className='mb-3 text-xl font-bold leading-[1.28] text-white transition-colors duration-300 group-hover:text-[#8350E0] sm:mb-4 sm:text-2xl'>
                                            {title}
                                        </h3>
                                        <p className='text-sm leading-relaxed text-gray-400 sm:text-base'>{description}</p>
                                    </div>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        aria-hidden='true'
                                        className='pointer-events-none absolute left-full top-1/2 z-20 hidden h-0.5 w-8 -translate-y-1/2 bg-[#8350E0] lg:block'
                                    >
                                        <span className='absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#8350E0] shadow-md'>
                                            <ArrowRight className='h-4 w-4 text-white' />
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature grid matches the layout, heading sizes, typography and hover styling from the existing product pages. */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Newsletter <span className='text-[#8350E0]'>Features</span>
                        </h2>
                        <p className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto'>
                            Six helpful ways to stay informed, all in one weekly briefing.
                        </p>
                    </div>
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
                        {FEATURES.map((feature, index) => (
                            <div key={feature.title} className='group animate-slide-in-up' style={{ animationDelay: `${index * 90}ms` }}>
                                <Card className='h-full rounded-2xl border-2 border-[#414A5D] bg-[#0C0F18] transition-all duration-300 hover:border-[#8350E0] hover:scale-[1.02]'>
                                    <CardContent className='p-6 sm:p-8'>
                                        <div className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8350E0] shadow-lg sm:mb-6 sm:h-16 sm:w-16'>
                                            <feature.icon className='h-7 w-7 text-white sm:h-8 sm:w-8' strokeWidth={1.8} aria-hidden='true' />
                                        </div>
                                        <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 leading-[1.28] group-hover:text-[#8350E0] transition-colors duration-300'>
                                            {feature.title}
                                        </h3>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* One additional section: a simple split layout, as used for the product benefit sections. */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        <div className='space-y-6 sm:space-y-8'>
                            <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                The Weekly <span className='text-[#8350E0]'>Brief</span>
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                One organized email brings together research ideas, relevant financial news, market context, and key dates. It is designed to
                                help you spend less time searching and more time learning about the markets.
                            </p>
                            <div className='space-y-4'>
                                {[
                                    'Stock and sector themes worth reviewing',
                                    'Economic updates in straightforward language',
                                    'Upcoming events and research reading',
                                ].map((item) => (
                                    <div key={item} className='flex items-start gap-3 text-sm text-gray-300 sm:text-base'>
                                        <span className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#414A5D] bg-[#0C0F18]'>
                                            <Check className='h-4 w-4 text-[#8350E0]' />
                                        </span>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                size='lg'
                                onClick={() => setPreviewOpen(true)}
                                className='border-2 cursor-pointer px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 hover:scale-105 w-full sm:w-[300px] bg-transparent shadow-[0_0_18px_rgba(131,80,224,0.12)] !border-white !bg-transparent hover:!border-[#8350E0] text-[#8350E0]'
                            >
                                Learn More
                            </Button>
                        </div>
                        <div className='flex items-center justify-center'>
                            <div className='w-full max-w-[500px] rounded-3xl border border-[#414A5D] bg-[#0C0F18] p-5 sm:p-7'>
                                <div className='mb-5 flex items-center gap-3 border-b border-[#414A5D] pb-4'>
                                    <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8350E0]'>
                                        <Mail className='h-5 w-5 text-white' />
                                    </div>
                                    <div>
                                        <p className='text-[11px] font-bold uppercase tracking-[0.1em] text-[#8350E0]'>Black Snow</p>
                                        <p className='text-lg font-bold text-white'>Newsletter Preview</p>
                                    </div>
                                </div>
                                {['Weekly Stock Picks', 'Macro Market Updates', 'Market Data Briefings', 'Latest Articles'].map((item, index) => (
                                    <div
                                        key={item}
                                        className={`flex items-center justify-between gap-3 py-4 ${index !== 3 ? 'border-b border-[#414A5D]' : ''}`}
                                    >
                                        <div className='flex items-center gap-3'>
                                            <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#414A5D] bg-[#0A0D14] text-xs font-bold text-[#8350E0]'>{`0${
                                                index + 1
                                            }`}</span>
                                            <span className='text-sm font-semibold text-white sm:text-base'>{item}</span>
                                        </div>
                                        <ArrowRight className='h-4 w-4 shrink-0 text-[#8350E0]' />
                                    </div>
                                ))}
                                <p className='mt-4 text-xs text-gray-400'>
                                    Illustrative preview. Not a published issue or personalized investment recommendation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing CTA: same left-text/right-animation layout and button styling as the other products. */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        <div className='space-y-6 sm:space-y-8'>
                            <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                Stay Ahead with <span className='text-[#8350E0]'>Black Snow</span>
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                Join the Black Snow Newsletter for regular market insights, stock research themes, and helpful educational resources. Monthly
                                access is $9.99, or choose annual access for $49.99. You can confirm your plan during checkout.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2'>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    className='group border-2 box-border cursor-pointer px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] border-[#8350E0] bg-[#8350E0] text-white hover:bg-[#693DB6] hover:border-[#693DB6]'
                                >
                                    Purchase
                                </Button>
                                <Link href='/subscriptionpolicy' className='flex w-full sm:w-[300px]'>
                                    <span className='flex min-h-[52px] w-full items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 text-base font-medium transition-all duration-300 hover:scale-105 hover:border-[#8350E0] text-[#8350E0] sm:text-lg'>
                                        Subscription Policy
                                    </span>
                                </Link>
                            </div>
                            <div className='flex items-start gap-2 text-xs text-gray-400'>
                                <ShieldCheck className='mt-0.5 h-4 w-4 shrink-0 text-[#8350E0]' /> Educational and informational content only. No performance
                                guarantees.
                            </div>
                        </div>
                        <div className='flex items-center justify-center'>
                            <div className='flex h-80 w-full max-w-[400px] items-center justify-center rounded-3xl border border-[#414A5D] bg-[#0C0F18] backdrop-blur-xl sm:h-96'>
                                <NewsletterAnimation
                                    src={ANIMATIONS.cta}
                                    fallback={Mail}
                                    className='h-[85%] w-[85%]'
                                    fallbackClassName='h-28 w-28 sm:h-36 sm:w-36 text-[#8350E0]'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <NewsletterPreviewModal open={previewOpen} onOpenChange={setPreviewOpen} />
            {authOpen && (
                <AuthModal
                    open={authOpen}
                    onOpenChange={(next) => {
                        setAuthOpen(next);
                        if (next) setPricingOpen(false);
                    }}
                    defaultView='signup'
                    sourceRoute='/newsletter'
                    onSuccess={handleAuthSuccess}
                />
            )}
            {!authOpen && <PricingComponent name='NewsLetter' asModal open={pricingOpen} onOpenChange={setPricingOpen} />}
        </div>
    );
}
