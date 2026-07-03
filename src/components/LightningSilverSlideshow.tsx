'use client';

import { CheckCircle2, ChevronLeft, CreditCard, DollarSign, FileCheck, LineChart, Link2, Mail, Repeat, Share2, Wallet, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type SlideVariant = 'standard' | 'legal' | 'acknowledge';

type Slide = {
    id: string;
    variant?: SlideVariant;
    cover?: boolean;
    accent?: string;
    title: string;
    description: string;
    bullets: string[];
    panelTitle?: string;
    panelSummary?: string;
    legalLink?: string;
    Icon: any;
};

type LightningSilverSlideshowProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const SILVER_ACCENT = '#8d96c2';

const SLIDES: Slide[] = [
    {
        id: 'lightning-silver',
        variant: 'standard',
        cover: true,
        accent: SILVER_ACCENT,
        title: 'Lightning Silver',
        description: '',
        bullets: [],
        Icon: Wallet,
    },
    {
        id: 'send-affiliate-links',
        variant: 'standard',
        accent: SILVER_ACCENT,
        title: 'SEND AFFILIATE LINKS',
        description: 'Share your affiliate links across platforms and reach unlimited people. Turn simple sharing into consistent traffic and opportunities.',
        bullets: [
            'Share your affiliate links anywhere',
            'Use SMS, email, or social platforms',
            'Built-in share tools for fast distribution',
            'Reach unlimited potential customers',
        ],
        Icon: Share2,
    },
    {
        id: 'email-sms-campaigns',
        variant: 'standard',
        accent: SILVER_ACCENT,
        title: 'EMAIL & SMS CAMPAIGNS',
        description: 'Launch campaigns that reach leads instantly across multiple channels. Promote offers directly while increasing engagement consistently.',
        bullets: [
            'Launch email and SMS campaigns easily',
            'Reach leads instantly with built-in tools',
            'Promote offers directly from your dashboard',
            'Increase engagement with consistent outreach',
        ],
        Icon: Mail,
    },
    {
        id: 'earn-commissions-bonus',
        variant: 'standard',
        accent: SILVER_ACCENT,
        title: 'COMMISSIONS & BONUS',
        description: 'Earn commissions while unlocking bonuses and referral-based rewards. Build multiple income streams inside one connected system.',
        bullets: [
            'Earn commissions on every sale you generate',
            'Unlock bonus payouts as you grow',
            'Get rewarded with Free Emails and SMS by sending affiliate referrals',
            'Stack multiple income streams inside one system',
        ],
        Icon: DollarSign,
    },
    {
        id: 'earn-mrr-arr',
        variant: 'standard',
        accent: SILVER_ACCENT,
        title: 'EARN MRR & ARR',
        description: 'Build recurring income that grows monthly and compounds yearly. Get paid continuously as your referrals stay active over time.',
        bullets: [
            'Earn recurring monthly income (MRR)',
            'Build long-term yearly income (ARR)',
            'Get paid as customers stay subscribed',
            'Create predictable, compounding earnings',
        ],
        Icon: Repeat,
    },
    {
        id: 'payout-schedules',
        variant: 'standard',
        accent: SILVER_ACCENT,
        title: 'PAYOUT SCHEDULES',
        description: 'Understand exactly when you earn and when payouts are processed. Track your income with clear and consistent payment timelines.',
        bullets: [
            'Clear monthly and yearly billing structure',
            'Track when commissions are earned and paid',
            'Consistent payout schedules you can rely on',
            'Full visibility into your earnings timeline',
        ],
        Icon: CreditCard,
    },
    {
        id: 'kpi-metrics',
        variant: 'standard',
        accent: SILVER_ACCENT,
        title: 'KPI METRICS',
        description: 'Track your performance and see what strategies are working best. Use real data to improve results and scale your income faster.',
        bullets: [
            'Track clicks, conversions, and sales',
            'Monitor your performance in real time',
            'Identify what’s working and scale it',
            'Make data-driven decisions to grow faster',
        ],
        Icon: LineChart,
    },
    {
        id: 'connect-stripe-account',
        variant: 'standard',
        accent: SILVER_ACCENT,
        title: 'CONNECT STRIPE ACCOUNT',
        description:
            'Connect your Stripe account to receive payouts quickly and securely. Get paid automatically while maintaining full control of your income.',
        bullets: [
            'Connect your Stripe account for payouts',
            'Receive earnings directly and securely',
            'Manage your income with full transparency',
            'Get paid automatically as you earn',
        ],
        Icon: Link2,
    },
];

function ProgressDots({ current, total, accent, onDot }: { current: number; total: number; accent: string; onDot: (index: number) => void }) {
    return (
        <div className='flex items-center gap-1.5 sm:gap-2'>
            {Array.from({ length: total }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onDot(index)}
                    className='rounded-full transition-all duration-300'
                    style={{
                        width: index === current ? 18 : 5,
                        height: 5,
                        backgroundColor: index === current ? accent : index < current ? `${accent}55` : 'rgba(255,255,255,0.12)',
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
    );
}

function InfoPanel({ slide, accent }: { slide: Slide; accent: string }) {
    return (
        <div className='rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-3 lg:mb-5 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
            <div className='flex items-center justify-between gap-2 lg:gap-3 mb-2 lg:mb-3'>
                <div className='flex items-center gap-2'>
                    <FileCheck className='w-3.5 h-3.5 lg:w-4 lg:h-4' style={{ color: accent }} />
                    <p className='text-xs font-bold uppercase tracking-wide' style={{ color: accent }}>
                        {slide.panelTitle ?? 'Key Highlights'}
                    </p>
                </div>

                {slide.legalLink ? (
                    <a
                        href={slide.legalLink}
                        className='text-[10px] lg:text-[11px] font-semibold px-2 lg:px-2.5 py-1 rounded-full border transition-all hover:scale-[1.02]'
                        style={{ color: accent, borderColor: `${accent}35`, backgroundColor: `${accent}12` }}
                    >
                        Review
                    </a>
                ) : null}
            </div>

            {slide.panelSummary ? <p className='text-white/60 text-[11px] lg:text-xs leading-relaxed mb-2.5 lg:mb-3'>{slide.panelSummary}</p> : null}

            <ul className='space-y-1.5 lg:space-y-2.5'>
                {slide.bullets.map((bullet, index) => (
                    <li key={index} className='flex items-start gap-2 lg:gap-2.5'>
                        <CheckCircle2 className='w-3.5 h-3.5 lg:w-4 lg:h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                        <span className='text-white/65 lg:text-white/70 text-xs lg:text-sm leading-snug'>{bullet}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function LightningSilverSlideshow({ open, onOpenChange }: LightningSilverSlideshowProps) {
    const [mounted, setMounted] = useState(false);
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState<'next' | 'prev'>('next');
    const [animating, setAnimating] = useState(false);
    const [inView, setInView] = useState(false);

    const slide = SLIDES[current];
    const accent = slide.accent ?? SILVER_ACCENT;
    const isLastSlide = current === SLIDES.length - 1;
    const description = slide.description;

    const close = () => {
        setInView(false);
        window.setTimeout(() => onOpenChange(false), 350);
    };

    const goTo = (next: number, direction: 'next' | 'prev') => {
        if (animating || next < 0 || next > SLIDES.length - 1 || next === current) return;
        setDir(direction);
        setAnimating(true);
        window.setTimeout(() => {
            setCurrent(next);
            setAnimating(false);
        }, 260);
    };

    const handleNext = () => {
        if (isLastSlide) {
            close();
            return;
        }

        goTo(current + 1, 'next');
    };

    const handlePrev = () => {
        if (current === 0) return;
        goTo(current - 1, 'prev');
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (open) {
            setCurrent(0);
            requestAnimationFrame(() => setInView(true));
        } else {
            setInView(false);
        }
    }, [open, mounted]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!open) return;
            if (event.key === 'Escape') close();
            if (event.key === 'ArrowRight' && current < SLIDES.length - 1) handleNext();
            if (event.key === 'ArrowLeft' && current > 0) handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, current, animating, isLastSlide]);

    if (!mounted || !open) return null;

    const slideAnim: React.CSSProperties = {
        transition: 'opacity 0.26s ease, transform 0.26s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '-20px' : '20px'})` : 'translateX(0)',
    };

    const scrollAreaStyle = {
        ...slideAnim,
        '--glass-scrollbar-thumb': `${accent}99`,
        '--glass-scrollbar-thumb-strong': accent,
        '--glass-scrollbar-glow': `${accent}33`,
        scrollbarColor: `${accent}99 rgba(255,255,255,0.06)`,
        scrollbarWidth: 'thin',
    } as React.CSSProperties;

    const modalEnter: React.CSSProperties = {
        transition: 'opacity 0.35s ease, transform 0.35s ease, border-color 0.5s ease, box-shadow 0.5s ease',
        opacity: inView ? 1 : 0,
        transform: inView ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(20px)',
        background: 'linear-gradient(180deg, rgba(7,9,13,0.68) 0%, rgba(10,12,18,0.52) 45%, rgba(6,8,12,0.68) 100%)',
        WebkitBackdropFilter: 'blur(7px) saturate(145%)',
        backdropFilter: 'blur(7px) saturate(145%)',
        borderColor: `${accent}45`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 35px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)`,
    };

    const glassShine: React.CSSProperties = {
        background:
            'radial-gradient(circle at top, rgba(255,255,255,0.07) 0%, transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.055) 0%, transparent 38%, rgba(255,255,255,0.025) 100%)',
    };

    const bottomGlass: React.CSSProperties = {
        background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 100%)',
    };

    const renderTitle = () => (
        <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #f4f6ff)` }}>
            {slide.title}
        </span>
    );

    return (
        <>
            <style>{`

                @media (max-width: 639px) {
                    .glass-slideshow-modal {
                        height: min(400px, calc(100vh - 2rem)) !important;
                    }
                }

                .glass-slideshow-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: var(--glass-scrollbar-thumb) rgba(255, 255, 255, 0.06);
                }

                .glass-slideshow-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .glass-slideshow-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.045);
                    border-radius: 999px;
                    margin: 14px 0;
                }

                .glass-slideshow-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, var(--glass-scrollbar-thumb-strong), var(--glass-scrollbar-thumb));
                    border: 2px solid rgba(7, 9, 13, 0.42);
                    border-radius: 999px;
                    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16), 0 0 10px var(--glass-scrollbar-glow);
                }

                .glass-slideshow-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, var(--glass-scrollbar-thumb-strong), rgba(255, 255, 255, 0.34));
                }
            `}</style>
            <div
                onClick={close}
                className='fixed inset-0 z-[9990] bg-black/78 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                <div
                    className='glass-slideshow-modal pointer-events-auto flex w-full max-w-sm lg:max-w-2xl relative rounded-3xl border-2 overflow-hidden flex-col backdrop-blur-[7px]'
                    style={{ ...modalEnter, height: 'min(455px, calc(100vh - 2rem))' }}
                >
                    <div className='absolute inset-0 pointer-events-none' style={glassShine} />
                    <div className='absolute inset-x-0 bottom-0 h-40 pointer-events-none' style={bottomGlass} />

                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    <div
                        className='absolute top-0 left-0 right-0 h-44 lg:h-60 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}14 0%, transparent 70%)` }}
                    />

                    <button
                        onClick={close}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                        aria-label='Close slideshow'
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='relative z-10 flex flex-col flex-1 min-h-0'>
                        <div
                            className='glass-slideshow-scrollbar px-6 lg:px-9 pt-7 lg:pt-8 pb-3 min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]'
                            style={scrollAreaStyle}
                        >
                            {slide.cover ? (
                                <div className='min-h-full flex items-center justify-center py-16'>
                                    <div className='relative text-center px-4'>
                                        <div
                                            className='absolute -inset-12 rounded-full blur-3xl opacity-40 pointer-events-none'
                                            style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 65%)` }}
                                        />
                                        <h1 className='relative whitespace-nowrap tracking-tight text-[clamp(2rem,7vw,3rem)] lg:text-6xl font-black leading-tight'>
                                            {renderTitle()}
                                        </h1>
                                        <div
                                            className='relative mx-auto mt-5 h-0.5 w-24 rounded-full'
                                            style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className='whitespace-nowrap tracking-tight text-[clamp(0.95rem,3.8vw,1.15rem)] lg:text-3xl font-black text-white leading-tight mb-2 lg:mb-3'>
                                        {renderTitle()}
                                    </h2>
                                    <div
                                        className='h-0.5 rounded-full mb-3 lg:mb-4 w-10 lg:w-14'
                                        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
                                    />

                                    {description ? (
                                        <p className='text-gray-400 text-xs lg:text-sm leading-relaxed mb-3 lg:mb-5 max-w-lg'>{description}</p>
                                    ) : null}

                                    <InfoPanel slide={slide} accent={accent} />
                                </>
                            )}
                        </div>

                        <div className='relative z-10 px-6 lg:px-9 pb-4 lg:pb-5 pt-2'>
                            <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:gap-3'>
                                <div className='justify-self-start'>
                                    <ProgressDots
                                        current={current}
                                        total={SLIDES.length}
                                        accent={accent}
                                        onDot={(i) => goTo(i, i > current ? 'next' : 'prev')}
                                    />
                                </div>

                                <span
                                    className='justify-self-center whitespace-nowrap text-xs font-semibold px-2 py-0.5 rounded-md'
                                    style={{ color: accent, backgroundColor: `${accent}18` }}
                                >
                                    Slide {current + 1}/{SLIDES.length}
                                </span>

                                <div className='flex items-center gap-1.5 lg:gap-2 justify-self-end'>
                                    <button
                                        onClick={handlePrev}
                                        disabled={current === 0}
                                        className='w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105'
                                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                        aria-label='Previous slide'
                                    >
                                        <ChevronLeft className='w-4 h-4 text-white' />
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        className='h-8 lg:h-9 px-3 lg:px-4 rounded-xl flex items-center justify-center gap-1 lg:gap-1.5 text-xs font-bold text-white transition-all hover:scale-105'
                                        style={{
                                            background: `linear-gradient(135deg, ${accent}dd, ${accent}88)`,
                                            border: `1px solid ${accent}60`,
                                            boxShadow: `0 2px 12px ${accent}30`,
                                        }}
                                    >
                                        {isLastSlide ? 'Done' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LightningSilverSlideshow;
