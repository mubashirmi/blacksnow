'use client';

import { BarChart3, CheckCircle, ChevronLeft, Layers, LayoutDashboard, Monitor, Share2, Sparkles, Users, X, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'bs_digital_billboard_tour_v1';

type Slide = {
    id: string;
    accent: string;
    Icon: any;
    badge: string;
    title: string;
    titleGrad?: string;
    titlePlain?: string;
    gradAtEnd?: boolean;
    desc: string;
    bullets?: string[];
};

const SLIDES: Slide[] = [
    {
        id: 'welcome',
        accent: '#a855f7',
        Icon: Monitor,
        badge: 'Digital Billboard',
        title: 'Your Billboard Is Live',
        titleGrad: 'Billboard',
        titlePlain: 'Your ',
        gradAtEnd: true,
        desc: 'Welcome to your Digital Billboard dashboard. Your ads are already running 24/7, funneling traffic to your offer automatically — no design team, no manual work, no downtime.',
        bullets: [
            'High-visibility ad placement running nonstop right now',
            'Live analytics tracking every impression and click',
            'Run up to 4 billboard campaigns simultaneously',
            'Built-in Email & SMS share buttons expand your reach automatically',
        ],
    },
    {
        id: 'placement',
        accent: '#a855f7',
        Icon: LayoutDashboard,
        badge: 'Ad Placement',
        title: 'High-Visibility Placement',
        titleGrad: 'High-Visibility',
        titlePlain: ' Placement',
        desc: 'Your ads appear in premium online locations that drive real clicks and measurable visibility. No settings to configure — plug in your offer and the system handles distribution automatically.',
        bullets: [
            'Premium ad positions that capture active buyer intent',
            'Automatic traffic distribution — no manual targeting needed',
            'Always-on exposure without a marketing or design team',
            'Built for speed and clarity from the moment you launch',
        ],
    },
    {
        id: 'analytics',
        accent: '#7c3aed',
        Icon: BarChart3,
        badge: 'Live Analytics',
        title: 'Real-Time Analytics Dashboard',
        titleGrad: 'Real-Time',
        titlePlain: ' Analytics Dashboard',
        desc: 'Track impressions, clicks, and engagement as they happen. Your analytics dashboard gives you complete clarity on exactly how every campaign is performing at all times.',
        bullets: [
            'Live impressions, clicks, and engagement metrics',
            "Per-campaign breakdown so you know what's working",
            'Automatic optimization keeps performance consistent',
            'Full visibility — no guessing, no blind spots',
        ],
    },
    {
        id: 'setup',
        accent: '#06b6d4',
        Icon: Zap,
        badge: 'Zero Maintenance',
        title: 'Simple Setup, Zero Maintenance',
        titleGrad: 'Zero Maintenance',
        titlePlain: 'Simple Setup, ',
        desc: 'Upload your content once and let the system run itself. The entire platform is designed for quick launch and hands-off operation — ideal for business owners who want results without the workload.',
        bullets: [
            'One-time upload — the system runs continuously after that',
            'No ongoing maintenance, editing, or monitoring required',
            'Fast setup designed for non-technical business owners',
            'Reliable, hands-off exposure that keeps buyers engaged',
        ],
    },
    {
        id: 'multi-billboard',
        accent: '#a855f7',
        Icon: Layers,
        badge: 'Up to 4 Campaigns',
        title: 'Run Up to 4 Billboards',
        titleGrad: '4 Billboards',
        titlePlain: 'Run Up to ',
        desc: 'Launch multiple billboard campaigns simultaneously for different products, offers, or target audiences. Maximize your digital real estate and expand your reach across more buyers at once.',
        bullets: [
            'Up to 4 active billboard campaigns running at the same time',
            'Promote different products, offers, or audiences per billboard',
            'Each campaign has its own analytics and performance tracking',
            'Scale exposure by filling all 4 slots with targeted offers',
        ],
    },
    {
        id: 'share-buttons',
        accent: '#0ea5e9',
        Icon: Share2,
        badge: 'Email & SMS Share',
        title: 'Built-In Share Buttons',
        titleGrad: 'Share Buttons',
        titlePlain: 'Built-In ',
        desc: 'Every billboard includes Email and SMS share buttons that let viewers instantly forward your offer to others. Your reach expands through organic referrals — automatically, with zero extra effort.',
        bullets: [
            'Email & SMS share buttons embedded in every billboard',
            'Viewers can forward your offer to their contacts instantly',
            'Organic referral reach with no extra cost or setup',
            'Premium share tools ensure real traffic and real attention',
        ],
    },
    {
        id: 'team-access',
        accent: '#7c3aed',
        Icon: Users,
        badge: 'Team Access',
        title: 'Add Multiple Users',
        titleGrad: 'Multiple Users',
        titlePlain: 'Add ',
        desc: 'Invite team members into the platform with controlled access levels. Built for larger businesses and collaborative teams who need to manage billboard campaigns together.',
        bullets: [
            'Invite teammates with controlled platform access',
            'Collaborate on campaigns without sharing credentials',
            'Ideal for agencies, marketing teams, and growing businesses',
            'Manage all users from a single centralized account',
        ],
    },
    {
        id: 'getting-started',
        accent: '#a855f7',
        Icon: Sparkles,
        badge: 'Getting Started',
        title: "You're Ready to Run",
        titleGrad: 'Ready',
        titlePlain: "You're ",
        gradAtEnd: true,
        desc: 'Your Digital Billboard dashboard is fully active. Launch your first campaign in minutes — upload your content, set your offer, and let the system drive traffic around the clock.',
        bullets: [
            'Step 1 — Go to Campaigns and create your first billboard',
            'Step 2 — Upload your ad content and enter your offer details',
            'Step 3 — Launch and watch impressions start rolling in live',
            'Step 4 — Monitor clicks and performance in the Analytics tab',
        ],
    },
];

// ── Progress Dots ─────────────────────────────────────────────
function ProgressDots({ current, total, accent, onDot }: { current: number; total: number; accent: string; onDot: (i: number) => void }) {
    return (
        <div className='flex items-center gap-1'>
            {Array.from({ length: total }).map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => onDot(idx)}
                    className='rounded-full transition-all duration-300'
                    style={{
                        width: idx === current ? 20 : 6,
                        height: 6,
                        backgroundColor: idx === current ? accent : idx < current ? `${accent}55` : 'rgba(255,255,255,0.12)',
                    }}
                />
            ))}
        </div>
    );
}

// ── Feature icon grid for right panel ────────────────────────
const FEATURE_ICONS = [
    { Icon: LayoutDashboard, label: 'Placement' },
    { Icon: BarChart3, label: 'Analytics' },
    { Icon: Zap, label: 'Setup' },
    { Icon: Layers, label: '4 Campaigns' },
    { Icon: Share2, label: 'Share' },
    { Icon: Users, label: 'Team' },
];

// ── Main Component ────────────────────────────────────────────
export function DigitalBillboardTourPopup({ onComplete }: { onComplete?: () => void }) {
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
        }, 1200);
        return () => clearTimeout(t);
    }, []);

    if (!mounted || !open) return null;

    const close = (completed = false) => {
        setInView(false);
        setTimeout(() => {
            setOpen(false);
            try {
                if (completed) localStorage.setItem(STORAGE_KEY, '1');
            } catch {}
            if (completed && onComplete) onComplete();
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
            close(true);
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

    const slide = SLIDES[current];
    const { Icon, accent, badge, titleGrad, titlePlain, gradAtEnd, desc, bullets } = slide;
    const isLastSlide = current === SLIDES.length - 1;

    const slideAnim: React.CSSProperties = {
        transition: 'opacity 0.26s ease, transform 0.26s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '-20px' : '20px'})` : 'translateX(0)',
    };

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

    const GradTitle = () =>
        gradAtEnd ? (
            <>
                {titlePlain}
                <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #7c3aed)` }}>
                    {titleGrad}
                </span>
            </>
        ) : (
            <>
                <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #7c3aed)` }}>
                    {titleGrad}
                </span>
                {titlePlain}
            </>
        );

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => close(false)}
                className='fixed inset-0 z-[9990] bg-black/83 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                {/* ══ DESKTOP ══ */}
                <div
                    className='pointer-events-auto hidden lg:flex w-full max-w-3xl relative rounded-3xl border-2 overflow-hidden flex-col'
                    style={{ ...modalEnter, minHeight: 500 }}
                >
                    {/* Purple shimmer top bar */}
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, #7c3aed, ${accent}, transparent)` }}
                    />
                    {/* Ambient glow */}
                    <div
                        className='absolute top-0 left-0 right-0 h-64 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 40% 0%, ${accent}14 0%, #7c3aed08 50%, transparent 70%)` }}
                    />

                    {/* Close */}
                    <button
                        onClick={() => close(false)}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='flex flex-1 min-h-0'>
                        {/* LEFT */}
                        <div className='flex-1 flex flex-col justify-between px-9 pt-10 pb-7 min-w-0'>
                            <div style={slideAnim}>
                                {/* Badge row
                                <div className='flex items-center gap-3 mb-5'>
                                    <div
                                        className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase'
                                        style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                                    >
                                        <Icon className='w-3.5 h-3.5' />
                                        {badge}
                                    </div>
                                    <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
                                        Platform Tour
                                    </span>
                                </div> */}

                                {/* Title */}
                                <h2 className='text-3xl font-black text-white leading-tight mb-3'>
                                    <GradTitle />
                                </h2>
                                <div
                                    className='h-0.5 rounded-full mb-4 w-14'
                                    style={{ background: `linear-gradient(90deg, ${accent}, #7c3aed, transparent)` }}
                                />

                                {/* Desc */}
                                <p className='text-gray-400 text-sm leading-relaxed mb-5 max-w-sm'>{desc}</p>

                                {/* Bullets */}
                                {bullets && (
                                    <ul className='space-y-2.5'>
                                        {bullets.map((b, i) => (
                                            <li key={i} className='flex items-start gap-2.5'>
                                                <CheckCircle className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                                <span className='text-white/70 text-sm leading-snug'>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Nav row */}
                            <div className='flex items-center gap-3 mt-8'>
                                <ProgressDots current={current} total={SLIDES.length} accent={accent} onDot={handleDot} />
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
                                            background: `linear-gradient(135deg, ${accent}cc, #7c3aed99)`,
                                            border: `1px solid ${accent}60`,
                                            boxShadow: `0 2px 14px ${accent}30`,
                                        }}
                                    >
                                        {isLastSlide ? 'Go to Dashboard' : 'Next'}
                                        {/* {!isLastSlide && <ChevronRight className='w-3.5 h-3.5' />} */}
                                    </button>
                                    {/* <span className='text-xs text-white/25'>
                                        {current + 1}/{SLIDES.length}
                                    </span> */}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div
                            className='w-[1px] self-stretch my-8'
                            style={{ background: `linear-gradient(to bottom, transparent, ${accent}30, #7c3aed20, transparent)` }}
                        />

                        {/* RIGHT panel */}
                        <div className='w-[220px] flex-shrink-0 flex flex-col items-center justify-center gap-5 p-6' style={slideAnim}>
                            {/* Main icon with pulse ring */}
                            <div className='relative'>
                                {/* Outer pulse ring */}
                                <div
                                    className='absolute inset-0 rounded-2xl'
                                    style={{
                                        border: `1px solid ${accent}20`,
                                        transform: 'scale(1.15)',
                                        animation: 'none',
                                    }}
                                />
                                <div
                                    className='w-24 h-24 rounded-2xl flex items-center justify-center'
                                    style={{
                                        backgroundColor: `${accent}15`,
                                        border: `2px solid ${accent}35`,
                                        boxShadow: `0 0 50px ${accent}25, 0 0 20px #7c3aed12`,
                                    }}
                                >
                                    <Icon className='w-12 h-12' style={{ color: accent }} />
                                </div>
                            </div>

                            {/* Step counter */}
                            <div className='text-center'>
                                <p className='text-xs font-semibold mb-1' style={{ color: accent }}>
                                    Platform Tour
                                </p>
                                <p className='text-white/30 text-xs'>
                                    Slide {current + 1} of {SLIDES.length}
                                </p>
                            </div>

                            {/* Feature icon grid — slides 1-6 map to features */}
                            <div className='grid grid-cols-3 gap-2 w-full mt-1'>
                                {FEATURE_ICONS.map(({ Icon: FIcon, label }, i) => {
                                    const slideIdx = i + 1;
                                    const isActive = current === slideIdx;
                                    const isDone = current > slideIdx;
                                    return (
                                        <div
                                            key={i}
                                            className='flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300'
                                            style={{
                                                backgroundColor: isActive ? `${accent}20` : isDone ? `${accent}08` : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${isActive ? `${accent}50` : isDone ? `${accent}20` : 'rgba(255,255,255,0.06)'}`,
                                            }}
                                        >
                                            <FIcon
                                                className='w-4 h-4'
                                                style={{
                                                    color: isActive ? accent : isDone ? `${accent}80` : 'rgba(255,255,255,0.2)',
                                                }}
                                            />
                                            <span
                                                className='text-[9px] font-medium text-center leading-tight'
                                                style={{
                                                    color: isActive ? 'rgba(255,255,255,0.8)' : isDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)',
                                                }}
                                            >
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ MOBILE ══ */}
                <div
                    className='pointer-events-auto flex lg:hidden w-full max-w-sm relative rounded-3xl border-2 overflow-hidden flex-col'
                    style={{ ...modalEnter }}
                >
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, #7c3aed, ${accent}, transparent)` }}
                    />
                    <div
                        className='absolute top-0 left-0 right-0 h-44 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}14 0%, transparent 70%)` }}
                    />

                    <button
                        onClick={() => close(false)}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
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
                                Platform Tour
                            </span>
                        </div>

                        <h2 className='text-2xl font-black text-white leading-tight mb-2'>
                            <GradTitle />
                        </h2>
                        <div className='h-0.5 rounded-full mb-3 w-10' style={{ background: `linear-gradient(90deg, ${accent}, #7c3aed, transparent)` }} />
                        <p className='text-gray-400 text-xs leading-relaxed mb-3'>{desc}</p>

                        {bullets && (
                            <ul className='space-y-1.5'>
                                {bullets.map((b, i) => (
                                    <li key={i} className='flex items-start gap-2'>
                                        <CheckCircle className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                        <span className='text-white/65 text-xs leading-snug'>{b}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Mobile nav */}
                    <div className='relative z-10 px-6 pb-5'>
                        <div className='flex items-center gap-2'>
                            <ProgressDots current={current} total={SLIDES.length} accent={accent} onDot={handleDot} />
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
                                    style={{
                                        background: `linear-gradient(135deg, ${accent}cc, #7c3aed99)`,
                                        border: `1px solid ${accent}60`,
                                    }}
                                >
                                    {isLastSlide ? 'Go' : 'Next'}
                                    {/* {!isLastSlide && <ChevronRight className='w-3.5 h-3.5' />} */}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
