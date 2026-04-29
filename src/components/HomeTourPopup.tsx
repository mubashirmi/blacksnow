'use client';

import { LottieAnimation } from '@/components/lottie-animation';
import { CheckCircle, ChevronLeft, FileText, Mail, Monitor, Rocket, X, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'bs_tour_seen_v1';

const SLIDES = [
    {
        badge: 'Create Invoices',
        Icon: FileText,
        accent: '#4cc7e8',
        titleGrad: 'Business',
        titlePlain: ' Invoice',
        desc: 'Clean, fast billing on a single dashboard. Every payment tracked, organized, and stored so you always know where your money stands.',
        bullets: ['Create unlimited invoices & contracts', 'Real-time payment tracking', 'Professional client-facing layout'],
        lottie: '/animations/invoivecontracticon.json',
    },
    {
        badge: 'Premium Advertising',
        Icon: Monitor,
        accent: '#2c7bbe',
        titleGrad: 'Digital',
        titlePlain: ' Billboards',
        desc: 'Position your business in front of active buyers 24/7. Every impression monitored and optimized — no design team required.',
        bullets: ['Always-on automated exposure', 'Optimized visibility, maximum reach', 'Simple setup, reliable results'],
        lottie: '/animations/billboardherosection.json',
    },
    {
        badge: 'Email Marketing',
        Icon: Mail,
        accent: '#4cc7e8',
        titleGrad: 'CRM',
        titlePlain: 'Email / SMS ',
        gradAtEnd: true,
        desc: 'Launch campaigns and automated sequences in minutes. Email and SMS unified into one high-deliverability dashboard.',
        bullets: ['Instant list upload & campaign launch', 'SMS + Email in one dashboard', 'No complex workflows needed'],
        lottie: '/animations/emailmarketing-herosection-page.json',
    },
    {
        badge: 'Lightning Silver',
        Icon: Zap,
        accent: '#5EDC7A',
        titleGrad: 'Lightning',
        titlePlain: ' Silver',
        desc: 'Start free and earn 25% lifetime commissions on every active subscriber — monthly and annual, for as long as they stay.',
        bullets: ['25% lifetime recurring commissions', 'Paid on monthly & annual plans', 'Built-in performance tracking'],
        lottie: '/animations/coinsdollarjump.json',
    },
    {
        badge: 'Lightning Gold',
        Icon: Rocket,
        accent: '#F5A623',
        titleGrad: 'Lightning',
        titlePlain: ' Gold',
        desc: 'Scale faster with 75% lifetime commissions at $250/month. Same traffic, dramatically higher recurring payouts.',
        bullets: ['75% lifetime recurring commissions', 'Convert traffic into max payouts', 'Priority affiliate support'],
        lottie: '/animations/rocketicon.json',
    },
];

function ProgressDots({ current, total, accent, onDot }: { current: number; total: number; accent: string; onDot: (i: number) => void }) {
    return (
        <div className='flex items-center gap-1.5'>
            {Array.from({ length: total }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onDot(i)}
                    className='rounded-full transition-all duration-500'
                    style={{
                        width: i === current ? 24 : 7,
                        height: 7,
                        backgroundColor: i === current ? accent : 'rgba(255,255,255,0.15)',
                    }}
                />
            ))}
        </div>
    );
}

function NavRow({
    current,
    total,
    accent,
    onPrev,
    onNext,
    onDot,
}: {
    current: number;
    total: number;
    accent: string;
    onPrev: () => void;
    onNext: () => void;
    onDot: (i: number) => void;
}) {
    return (
        <div className='flex items-center gap-3'>
            <ProgressDots current={current} total={total} accent={accent} onDot={onDot} />
            <div className='flex items-center gap-2 ml-auto'>
                <button
                    onClick={onPrev}
                    disabled={current === 0}
                    className='w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-20 hover:scale-105'
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ChevronLeft className='w-4 h-4 text-white' />
                </button>
                <button
                    onClick={onNext}
                    className='h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-white transition-all duration-200 hover:scale-105'
                    style={{
                        background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`,
                        border: `1px solid ${accent}60`,
                        boxShadow: `0 2px 12px ${accent}30`,
                    }}
                >
                    {current === total - 1 ? 'Done' : 'Next'}
                    {/* {current < total - 1 && <ChevronRight className='w-3.5 h-3.5' />} */}
                </button>
                <span className='text-xs text-white/25'>
                    {current + 1}/{total}
                </span>
            </div>
        </div>
    );
}

export function HomeTourPopup() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState<'next' | 'prev'>('next');
    const [animating, setAnimating] = useState(false);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        setMounted(true);
        const seen = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (seen) return;
        const t = setTimeout(() => {
            setOpen(true);
            setTimeout(() => setInView(true), 30);
        }, 3000);
        return () => clearTimeout(t);
    }, []);

    if (!mounted || !open) return null;

    const close = () => {
        setInView(false);
        setTimeout(() => {
            setOpen(false);
            try {
                localStorage.setItem(STORAGE_KEY, '1');
            } catch {}
        }, 350);
    };

    const goTo = (next: number, direction: 'next' | 'prev') => {
        if (animating) return;
        setDir(direction);
        setAnimating(true);
        setTimeout(() => {
            setCurrent(next);
            setAnimating(false);
        }, 260);
    };

    const handleNext = () => {
        if (current === SLIDES.length - 1) {
            close();
            return;
        }
        goTo(current + 1, 'next');
    };
    const handlePrev = () => {
        if (current === 0) return;
        goTo(current - 1, 'prev');
    };
    const handleDot = (i: number) => {
        if (i === current || animating) return;
        goTo(i, i > current ? 'next' : 'prev');
    };

    const { Icon, accent, badge, titleGrad, titlePlain, gradAtEnd, desc, bullets, lottie } = SLIDES[current];

    const slideAnim: React.CSSProperties = {
        transition: 'opacity 0.26s ease, transform 0.27s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '-20px' : '20px'})` : 'translateX(0)',
    };

    const lottieAnim: React.CSSProperties = {
        transition: 'opacity 0.26s ease, transform 0.26s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '20px' : '-20px'}) scale(0.95)` : 'translateX(0) scale(1)',
    };

    const modalEnter: React.CSSProperties = {
        transition: 'opacity 0.35s ease, transform 0.35s ease, border-color 0.6s ease, box-shadow 0.6s ease',
        opacity: inView ? 1 : 0,
        transform: inView ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(20px)',
    };

    const Title = () =>
        gradAtEnd ? (
            <>
                {titlePlain}
                <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                    {titleGrad}
                </span>
            </>
        ) : (
            <>
                <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                    {titleGrad}
                </span>
                {titlePlain}
            </>
        );

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={close}
                className='fixed inset-0 z-[9990] bg-black/75 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                {/* ════════════════════════════════════════
                    DESKTOP  (lg+) — left text + right Lottie
                ════════════════════════════════════════ */}
                <div
                    className='pointer-events-auto hidden lg:flex w-full max-w-5xl xl:max-w-6xl relative rounded-3xl border-2 overflow-hidden'
                    style={{
                        ...modalEnter,
                        backgroundColor: '#080b12',
                        borderColor: `${accent}40`,
                        boxShadow: `0 0 90px ${accent}20, 0 0 200px ${accent}08, 0 30px 80px rgba(0,0,0,0.8)`,
                        minHeight: 520,
                    }}
                >
                    {/* Top shimmer */}
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    {/* Left glow */}
                    <div
                        className='absolute top-0 left-0 bottom-0 w-1/2 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 0% 30%, ${accent}10 0%, transparent 65%)` }}
                    />
                    {/* Right glow */}
                    <div
                        className='absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 100% 60%, ${accent}14 0%, transparent 60%)` }}
                    />

                    {/* Close */}
                    <button
                        onClick={close}
                        className='absolute top-5 right-5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    {/* LEFT — text content */}
                    <div className='flex-1 flex flex-col justify-between px-10 xl:px-14 pt-10 pb-8 min-w-0'>
                        <div style={slideAnim}>
                            {/* Badge */}
                            <div
                                className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase mb-6'
                                style={{
                                    backgroundColor: `${accent}18`,
                                    border: `1px solid ${accent}40`,
                                    color: accent,
                                }}
                            >
                                <Icon className='w-3.5 h-3.5' />
                                {badge}
                            </div>

                            {/* Title */}
                            <h2 className='text-4xl xl:text-5xl font-black text-white leading-tight mb-4'>
                                <Title />
                            </h2>

                            {/* Accent line */}
                            <div className='h-0.5 rounded-full mb-5 w-16' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                            {/* Description */}
                            <p className='text-gray-400 text-sm xl:text-base leading-relaxed mb-6 max-w-sm xl:max-w-md'>{desc}</p>

                            {/* Bullets */}
                            <ul className='space-y-3'>
                                {bullets.map((b, i) => (
                                    <li key={i} className='flex items-start gap-3'>
                                        <CheckCircle className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                        <span className='text-white/70 text-sm xl:text-base leading-snug'>{b}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Nav */}
                        <div className='mt-10'>
                            <NavRow current={current} total={SLIDES.length} accent={accent} onPrev={handlePrev} onNext={handleNext} onDot={handleDot} />
                        </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='w-[1px] self-stretch my-10' style={{ background: `linear-gradient(to bottom, transparent, ${accent}35, transparent)` }} />

                    {/* RIGHT — Lottie panel */}
                    <div className='w-[380px] xl:w-[440px] flex-shrink-0 flex flex-col items-center justify-center p-8 xl:p-10 relative' style={lottieAnim}>
                        {/* Lottie glow orb behind */}
                        <div
                            className='absolute inset-0 pointer-events-none'
                            style={{
                                background: `radial-gradient(ellipse at center, ${accent}18 0%, ${accent}08 40%, transparent 70%)`,
                            }}
                        />

                        {/* Outer ring */}
                        <div
                            className='relative w-full flex items-center justify-center rounded-2xl p-2'
                            style={{
                                border: `1px solid ${accent}25`,
                                background: `linear-gradient(135deg, ${accent}08, transparent 60%)`,
                                boxShadow: `inset 0 0 40px ${accent}08`,
                            }}
                        >
                            {/* Inner subtle ring */}
                            <div
                                className='w-full flex items-center justify-center rounded-xl'
                                style={{
                                    background: `radial-gradient(ellipse at center, ${accent}10 0%, transparent 70%)`,
                                    minHeight: 280,
                                }}
                            >
                                <LottieAnimation src={lottie} className='w-[280px] h-[280px] xl:w-[320px] xl:h-[320px]' loop autoplay />
                            </div>
                        </div>

                        {/* Slide label below lottie */}
                        <div className='mt-5 text-xs font-semibold tracking-widest uppercase opacity-40 text-white'>{badge}</div>
                    </div>
                </div>

                {/* ════════════════════════════════════════
                    MOBILE  (< lg) — single column, compact
                ════════════════════════════════════════ */}
                <div
                    className='pointer-events-auto flex lg:hidden w-full max-w-sm relative rounded-3xl border-2 overflow-hidden flex-col'
                    style={{
                        ...modalEnter,
                        backgroundColor: '#080b12',
                        borderColor: `${accent}40`,
                        boxShadow: `0 0 50px ${accent}20, 0 20px 60px rgba(0,0,0,0.7)`,
                    }}
                >
                    {/* Top shimmer */}
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    {/* Glow */}
                    <div
                        className='absolute top-0 left-0 right-0 h-40 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}14 0%, transparent 70%)` }}
                    />

                    {/* Close */}
                    <button
                        onClick={close}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    {/* Content */}
                    <div className='relative z-10 px-6 pt-8 pb-4' style={slideAnim}>
                        <div
                            className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase mb-4'
                            style={{
                                backgroundColor: `${accent}18`,
                                border: `1px solid ${accent}40`,
                                color: accent,
                            }}
                        >
                            <Icon className='w-3.5 h-3.5' />
                            {badge}
                        </div>
                        <h2 className='text-3xl font-black text-white leading-tight mb-2'>
                            <Title />
                        </h2>
                        <div className='h-0.5 rounded-full mb-3 w-12' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                        <p className='text-gray-400 text-sm leading-relaxed mb-4'>{desc}</p>
                        <ul className='space-y-2'>
                            {bullets.map((b, i) => (
                                <li key={i} className='flex items-start gap-2.5'>
                                    <CheckCircle className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                    <span className='text-white/65 text-xs leading-snug'>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Nav */}
                    <div className='relative z-10 px-6 pb-6'>
                        <NavRow current={current} total={SLIDES.length} accent={accent} onPrev={handlePrev} onNext={handleNext} onDot={handleDot} />
                    </div>
                </div>
            </div>
        </>
    );
}
