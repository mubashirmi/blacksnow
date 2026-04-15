'use client';

import { CheckCircle2, ChevronLeft, ChevronRight, CreditCard, DollarSign, FileCheck, LineChart, Link2, Mail, Repeat, Share2, Wallet, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type Slide = {
    id: string;
    accent: string;
    badge: string;
    title: string;
    description: string;
    bullets: string[];
    Icon: any;
};

type LightningGoldSlideshowProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const SLIDES: Slide[] = [
    {
        id: 'lightning-gold',
        accent: '#f5b335',
        badge: 'Lightning Gold — $250/Month | 75% Commission',
        title: 'Scale Faster With Higher Commissions',
        description: 'Earn higher commissions with fewer sales and maximize your income potential using the same powerful system.',
        bullets: ['Join', 'Send Links', 'Campaigns', 'Earn', 'Billing', 'Track', 'Connect Stripe'],
        Icon: Wallet,
    },
    {
        id: 'send-affiliate-links',
        accent: '#5EDC7A',
        badge: 'Step 1 — Send Affiliate Links',
        title: 'Share Links Across Any Platform',
        description: 'Share your affiliate links across platforms and turn simple sharing into consistent traffic and opportunities.',
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
        accent: '#F5A623',
        badge: 'Step 2 — Email & SMS Campaigns',
        title: 'Launch Multi-Channel Campaigns',
        description: 'Launch campaigns that reach leads instantly across multiple channels while increasing engagement consistently.',
        bullets: [
            'Launch email and SMS campaigns easily',
            'Reach leads instantly with built-in tools',
            'Promote offers directly from your dashboard',
            'Increase engagement with consistent outreach',
        ],
        Icon: Mail,
    },
    {
        id: 'earn-commissions-bonus-referrals',
        accent: '#E86FA3',
        badge: 'Step 3 — Earn Commissions, Bonus & Referrals',
        title: 'Build Multiple Income Streams',
        description: 'Earn commissions while unlocking bonuses and referral-based rewards inside one connected system.',
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
        accent: '#9B59B6',
        badge: 'Step 4 — Earn MRR & ARR',
        title: 'Grow Income That Compounds',
        description: 'Build recurring income that grows monthly and compounds yearly while referrals stay active.',
        bullets: [
            'Earn recurring monthly income (MRR)',
            'Build long-term yearly income (ARR)',
            'Get paid as customers stay subscribed',
            'Create predictable, compounding earnings',
        ],
        Icon: Repeat,
    },
    {
        id: 'billing-payout-schedules',
        accent: '#4cc7e8',
        badge: 'Step 5 — Billing & Payout Schedules',
        title: 'Know Exactly When You Get Paid',
        description: 'Understand when you earn and when payouts are processed with clear and consistent payment timelines.',
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
        accent: '#2c7bbe',
        badge: 'Step 6 — KPI Metrics',
        title: 'Track What Performs Best',
        description: 'Track your performance and use real data to improve results and scale your income faster.',
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
        accent: '#635bff',
        badge: 'Step 7 — Connect Stripe Account',
        title: 'Receive Payouts Securely',
        description: 'Connect your Stripe account to receive payouts quickly and securely while maintaining full control of your income.',
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
        <div className='flex items-center gap-3'>
            {Array.from({ length: total }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onDot(index)}
                    className='rounded-full transition-all duration-300'
                    style={{
                        width: index === current ? 20 : 6,
                        height: 6,
                        backgroundColor: index === current ? accent : index < current ? `${accent}55` : 'rgba(255,255,255,0.12)',
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
    );
}

export function LightningGoldSlideshow({ open, onOpenChange }: LightningGoldSlideshowProps) {
    const [mounted, setMounted] = useState(false);
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState<'next' | 'prev'>('next');
    const [animating, setAnimating] = useState(false);
    const [inView, setInView] = useState(false);

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
            if (event.key === 'Escape') onOpenChange(false);
            if (event.key === 'ArrowRight' && current < SLIDES.length - 1) handleNext();
            if (event.key === 'ArrowLeft' && current > 0) handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    if (!mounted || !open) return null;

    const slide = SLIDES[current];
    const { Icon, accent, badge, title, description, bullets } = slide;
    const isLastSlide = current === SLIDES.length - 1;

    const close = () => {
        setInView(false);
        setTimeout(() => onOpenChange(false), 350);
    };

    const goTo = (next: number, direction: 'next' | 'prev') => {
        if (animating || next < 0 || next > SLIDES.length - 1) return;
        setDir(direction);
        setAnimating(true);
        setTimeout(() => {
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

    const slideAnim: React.CSSProperties = {
        transition: 'opacity 0.26s ease, transform 0.26s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '-20px' : '20px'})` : 'translateX(0)',
    };

    const modalEnter: React.CSSProperties = {
        transition: 'opacity 0.35s ease, transform 0.35s ease, border-color 0.5s ease, box-shadow 0.5s ease',
        opacity: inView ? 1 : 0,
        transform: inView ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(20px)',
        backgroundColor: '#080b12',
        borderColor: `${accent}45`,
        boxShadow: `0 0 70px ${accent}22, 0 30px 80px rgba(0,0,0,0.75)`,
    };

    const rightRailSteps = ['Join', 'Send Links', 'Campaigns', 'Earn', 'Billing', 'Track', 'Connect Stripe'];

    return (
        <>
            <div
                onClick={close}
                className='fixed inset-0 z-[9990] bg-black/78 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                <div
                    className='pointer-events-auto hidden lg:flex w-full max-w-3xl relative rounded-3xl border-2 overflow-hidden flex-col'
                    style={{ ...modalEnter, minHeight: 480 }}
                >
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    <div
                        className='absolute top-0 left-0 right-0 h-60 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 40% 0%, ${accent}14 0%, transparent 65%)` }}
                    />

                    <button
                        onClick={close}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                        aria-label='Close slideshow'
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='flex flex-1 min-h-0'>
                        <div className='flex-1 flex flex-col justify-between px-9 pt-9 pb-7 min-w-0'>
                            <div style={slideAnim}>
                                <div className='flex items-center gap-3 mb-5'>
                                    <div
                                        className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase'
                                        style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                                    >
                                        <Icon className='w-3.5 h-3.5' />
                                        {badge}
                                    </div>
                                    <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
                                        Slide {current + 1} of {SLIDES.length}
                                    </span>
                                </div>

                                <h2 className='text-3xl font-black text-white leading-tight mb-3'>
                                    <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                                        {title}
                                    </span>
                                </h2>
                                <div className='h-0.5 rounded-full mb-4 w-14' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                                <p className='text-gray-400 text-sm leading-relaxed mb-5 max-w-sm'>{description}</p>

                                <div className='rounded-2xl p-4 mb-5 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <FileCheck className='w-4 h-4' style={{ color: accent }} />
                                        <p className='text-xs font-bold uppercase tracking-wide' style={{ color: accent }}>
                                            Key Highlights
                                        </p>
                                    </div>

                                    <ul className='space-y-2.5'>
                                        {bullets.map((bullet, index) => (
                                            <li key={index} className='flex items-start gap-2.5'>
                                                <CheckCircle2 className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                                <span className='text-white/70 text-sm leading-snug'>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className='flex items-center gap-3 mt-8'>
                                <ProgressDots current={current} total={SLIDES.length} accent={accent} onDot={(i) => goTo(i, i > current ? 'next' : 'prev')} />
                                <div className='flex items-center gap-2 ml-auto'>
                                    <button
                                        onClick={handlePrev}
                                        disabled={current === 0}
                                        className='w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105'
                                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                        <ChevronLeft className='w-4 h-4 text-white' />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className='h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-white transition-all hover:scale-105'
                                        style={{
                                            background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`,
                                            border: `1px solid ${accent}60`,
                                            boxShadow: `0 2px 12px ${accent}30`,
                                        }}
                                    >
                                        {isLastSlide ? 'Done' : 'Next'}
                                        {!isLastSlide && <ChevronRight className='w-3.5 h-3.5' />}
                                    </button>
                                    <span className='text-xs text-white/25'>
                                        {current + 1}/{SLIDES.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div
                            className='w-[1px] self-stretch my-8'
                            style={{ background: `linear-gradient(to bottom, transparent, ${accent}30, transparent)` }}
                        />

                        <div className='w-[220px] flex-shrink-0 flex flex-col items-center justify-center gap-4 p-6' style={slideAnim}>
                            <div
                                className='w-24 h-24 rounded-2xl flex items-center justify-center'
                                style={{ backgroundColor: `${accent}18`, border: `2px solid ${accent}30`, boxShadow: `0 0 40px ${accent}20` }}
                            >
                                <Icon className='w-12 h-12' style={{ color: accent }} />
                            </div>

                            <div className='text-center'>
                                <p className='text-xs font-semibold mb-1' style={{ color: accent }}>
                                    Lightning Gold Flow
                                </p>
                                <p className='text-white/30 text-xs'>
                                    Step {current + 1} of {SLIDES.length}
                                </p>
                            </div>

                            <div className='flex flex-col gap-2 w-full mt-2'>
                                {rightRailSteps.map((step, index) => {
                                    const active = current === 0 ? index === 0 : current - 1 >= index;
                                    return (
                                        <div key={step} className='flex items-center gap-2'>
                                            <div
                                                className='w-1.5 h-1.5 rounded-full flex-shrink-0'
                                                style={{ backgroundColor: active ? accent : 'rgba(255,255,255,0.15)' }}
                                            />
                                            <span className='text-xs' style={{ color: active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className='pointer-events-auto flex lg:hidden w-full max-w-sm relative rounded-3xl border-2 overflow-hidden flex-col'
                    style={{ ...modalEnter }}
                >
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    <div
                        className='absolute top-0 left-0 right-0 h-44 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}14 0%, transparent 70%)` }}
                    />

                    <button
                        onClick={close}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                        aria-label='Close slideshow'
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='relative z-10 px-6 pt-8 pb-4' style={slideAnim}>
                        <div className='flex items-center gap-2 flex-wrap mb-4'>
                            <div
                                className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase'
                                style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                            >
                                <Icon className='w-3 h-3' />
                                {badge}
                            </div>
                            <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
                                {current + 1}/{SLIDES.length}
                            </span>
                        </div>

                        <h2 className='text-2xl font-black text-white leading-tight mb-2'>
                            <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                                {title}
                            </span>
                        </h2>
                        <div className='h-0.5 rounded-full mb-3 w-10' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                        <p className='text-gray-400 text-xs leading-relaxed mb-3'>{description}</p>

                        <div className='rounded-xl p-3 mb-3 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                            <div className='flex items-center gap-2 mb-2'>
                                <FileCheck className='w-3.5 h-3.5' style={{ color: accent }} />
                                <p className='text-xs font-bold uppercase' style={{ color: accent }}>
                                    Key Highlights
                                </p>
                            </div>

                            <ul className='space-y-1.5'>
                                {bullets.map((bullet, index) => (
                                    <li key={index} className='flex items-start gap-2'>
                                        <CheckCircle2 className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                        <span className='text-white/65 text-xs leading-snug'>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className='relative z-10 px-6 pb-5'>
                        <div className='flex items-center gap-2'>
                            <ProgressDots current={current} total={SLIDES.length} accent={accent} onDot={(i) => goTo(i, i > current ? 'next' : 'prev')} />
                            <div className='flex items-center gap-1.5 ml-auto'>
                                <button
                                    onClick={handlePrev}
                                    disabled={current === 0}
                                    className='w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-20'
                                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <ChevronLeft className='w-4 h-4 text-white' />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className='h-9 px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-bold text-white transition-all'
                                    style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`, border: `1px solid ${accent}60` }}
                                >
                                    {isLastSlide ? 'Done' : 'Next'}
                                    {!isLastSlide && <ChevronRight className='w-3.5 h-3.5' />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LightningGoldSlideshow;
