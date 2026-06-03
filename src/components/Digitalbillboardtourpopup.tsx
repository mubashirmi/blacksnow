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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
    const { accent, titleGrad, titlePlain, gradAtEnd, desc, bullets } = slide;
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
            <div
                onClick={() => close(false)}
                className='fixed inset-0 z-[9990] bg-black/78 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                <div
                    className='pointer-events-auto flex w-full max-w-sm lg:max-w-2xl relative rounded-3xl border-2 overflow-hidden flex-col backdrop-blur-[7px]'
                    style={{ ...modalEnter, height: 'min(500px, calc(100vh - 2rem))' }}
                >
                    <div
                        className='absolute inset-0 pointer-events-none'
                        style={{
                            background:
                                'radial-gradient(circle at top, rgba(255,255,255,0.07) 0%, transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.055) 0%, transparent 38%, rgba(255,255,255,0.025) 100%)',
                        }}
                    />
                    <div
                        className='absolute inset-x-0 bottom-0 h-40 pointer-events-none'
                        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 100%)' }}
                    />

                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    <div
                        className='absolute top-0 left-0 right-0 h-44 lg:h-60 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}14 0%, transparent 70%)` }}
                    />

                    <button
                        onClick={() => close(false)}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                        aria-label='Close slideshow'
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='relative z-10 flex flex-col flex-1 min-h-0'>
                        <div className='px-6 lg:px-9 pt-8 lg:pt-9 pb-4 min-h-0 flex-1 overflow-y-auto' style={slideAnim}>
                            <h2 className='text-2xl lg:text-3xl font-black text-white leading-tight mb-2 lg:mb-3'>
                                <GradTitle />
                            </h2>
                            <div
                                className='h-0.5 rounded-full mb-3 lg:mb-4 w-10 lg:w-14'
                                style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
                            />

                            <p className='text-gray-400 text-xs lg:text-sm leading-relaxed mb-3 lg:mb-5 max-w-lg'>{desc}</p>

                            {bullets && bullets.length > 0 && (
                                <div
                                    className='rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-3 lg:mb-5 border'
                                    style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}
                                >
                                    <div className='flex items-center gap-2 mb-2 lg:mb-3'>
                                        <CheckCircle className='w-3.5 h-3.5 lg:w-4 lg:h-4' style={{ color: accent }} />
                                        <p className='text-xs font-bold uppercase tracking-wide' style={{ color: accent }}>
                                            Key Highlights
                                        </p>
                                    </div>

                                    <ul className='space-y-1.5 lg:space-y-2.5'>
                                        {bullets.map((bullet, index) => (
                                            <li key={index} className='flex items-start gap-2 lg:gap-2.5'>
                                                <CheckCircle
                                                    className='w-3.5 h-3.5 lg:w-4 lg:h-4 mt-0.5 flex-shrink-0'
                                                    style={{ color: accent }}
                                                    strokeWidth={2.5}
                                                />
                                                <span className='text-white/65 lg:text-white/70 text-xs lg:text-sm leading-snug'>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className='relative z-10 px-6 lg:px-9 pb-5 lg:pb-7 pt-2'>
                            <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:gap-3'>
                                <div className='justify-self-start'>
                                    <ProgressDots current={current} total={SLIDES.length} accent={accent} onDot={handleDot} />
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
                                            background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`,
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
