'use client';

import { BarChart3, Bot, Calendar, CheckCircle, ChevronLeft, ChevronRight, Layers, Mail, MessageSquare, Sparkles, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'bs_email_marketing_tour_v1';

type SlideVariant = 'intro' | 'feature';

type Slide = {
    id: string;
    variant: SlideVariant;
    accent: string;
    Icon: any;
    badge: string;
    title: string;
    titleGrad?: string;
    titlePlain?: string;
    gradAtEnd?: boolean;
    desc: string;
    bullets?: string[];
    highlight?: { label: string; value: string }[];
};

const SLIDES: Slide[] = [
    {
        id: 'welcome',
        variant: 'intro',
        accent: '#4cc7e8',
        Icon: Mail,
        badge: 'Email/SMS CRM',
        title: 'Your CRM Dashboard',
        titleGrad: 'CRM',
        titlePlain: 'Your ',
        gradAtEnd: true,
        desc: 'Welcome to your combined Email & SMS CRM. Launch campaigns, build automated sequences, manage your contact lists, and track real-time performance — all from one clean dashboard.',
        bullets: [
            'Email campaigns & automated sequences ready to launch',
            'SMS broadcasts and chatbot built in — no extra tools',
            'Upload contact lists instantly for clean segmentation',
            'Live KPI dashboard tracking opens, clicks & delivery',
        ],
    },
    {
        id: 'email-campaigns',
        variant: 'feature',
        accent: '#4cc7e8',
        Icon: Mail,
        badge: 'Email Campaigns',
        title: 'Email Campaigns & Sequences',
        titleGrad: 'Email Campaigns',
        titlePlain: ' & Sequences',
        desc: 'Send broadcast emails to your full list or build multi-step automated sequences that follow your own timing, rules, and goals. No technical setup required — launch in minutes.',
        bullets: [
            'Broadcast emails to your entire list with one click',
            'Build automated flows triggered by time or actions',
            'Set custom rules, delays, and branching conditions',
            'High-deliverability framework keeps you out of spam',
        ],
    },
    {
        id: 'sms-campaigns',
        variant: 'feature',
        accent: '#2c7bbe',
        Icon: MessageSquare,
        badge: 'SMS Campaigns',
        title: 'SMS Broadcasts & Sequences',
        titleGrad: 'SMS',
        titlePlain: ' Broadcasts & Sequences',
        desc: 'Build SMS campaigns that run alongside your email flows. Create broadcast messages or automated SMS sequences that complement your email strategy inside the same platform.',
        bullets: [
            'Send SMS broadcasts to segmented contact groups',
            'Build automated SMS sequences with custom timing',
            'Combine SMS and email in one unified outreach flow',
            'Track SMS delivery and response rates in real time',
        ],
    },
    {
        id: 'sms-chatbot',
        variant: 'feature',
        accent: '#9B59B6',
        Icon: Bot,
        badge: 'SMS Chatbot',
        title: 'Automated SMS Chatbot',
        titleGrad: 'SMS Chatbot',
        titlePlain: 'Automated ',
        desc: 'Guide customers through conversations automatically with a responsive SMS chatbot. Answer queries, qualify leads, and move contacts through your funnel — without manual effort.',
        bullets: [
            'Responds to inbound SMS messages automatically',
            'Guide customers through pre-built conversation flows',
            'Qualify leads and route contacts based on replies',
            'Works 24/7 alongside your campaigns with no downtime',
        ],
    },
    {
        id: 'list-upload',
        variant: 'feature',
        accent: '#1ABC9C',
        Icon: Upload,
        badge: 'List Management',
        title: 'Instant List Upload & Segmentation',
        titleGrad: 'Instant',
        titlePlain: ' List Upload & Segmentation',
        desc: 'Upload your contact lists instantly and organize them into clean segments for targeted outreach. No formatting headaches — your contacts are ready to message within seconds.',
        bullets: [
            'Upload CSV or spreadsheet contact lists instantly',
            'Segment contacts by tags, behavior, or custom fields',
            'Clean deduplication removes duplicate contacts automatically',
            'Assign contacts to campaigns or sequences immediately after upload',
        ],
    },
    {
        id: 'kpi',
        variant: 'feature',
        accent: '#F5A623',
        Icon: BarChart3,
        badge: 'KPI Dashboard',
        title: 'Email KPIs & Performance Data',
        titleGrad: 'KPIs',
        titlePlain: 'Email ',
        gradAtEnd: true,
        desc: "Your KPI dashboard shows exactly what's working — deliveries, opens, clicks, and engagement metrics updated in real time. Always know your campaign performance at a glance.",
        bullets: [
            'Track delivery rate, open rate, and click-through rate',
            'View engagement metrics per campaign and per contact',
            'Real performance data — no vanity metrics',
            'Export reports for analysis or client reporting',
        ],
    },
    {
        id: 'scheduling',
        variant: 'feature',
        accent: '#E74C3C',
        Icon: Calendar,
        badge: 'Email Scheduling',
        title: 'Scheduling Overview',
        titleGrad: 'Scheduling',
        titlePlain: ' Overview',
        desc: 'See every scheduled email and SMS in one clear timeline. Know exactly what goes out next, when it sends, and to which segment — keeping your messaging organized and predictable.',
        bullets: [
            'Visual timeline of all upcoming scheduled messages',
            'See campaign name, send time, and recipient segment',
            'Edit or reschedule sends directly from the overview',
            'Never double-send or miss a campaign window again',
        ],
    },
    {
        id: 'platform',
        variant: 'feature',
        accent: '#4cc7e8',
        Icon: Layers,
        badge: 'One Platform',
        title: 'Email + SMS in One Place',
        titleGrad: 'Email + SMS',
        titlePlain: ' in One Place',
        desc: 'Everything lives in a single streamlined platform. No switching between tools, no integrations to maintain — your email campaigns, SMS flows, chatbot, lists, and analytics are all here.',
        bullets: [
            'Email and SMS managed from one unified dashboard',
            'No third-party integrations or external tools needed',
            'Simplified automation with fewer steps and less friction',
            'Built for fast deployment — start messaging in minutes',
        ],
    },
    {
        id: 'getting-started',
        variant: 'feature',
        accent: '#4cc7e8',
        Icon: Sparkles,
        badge: 'Getting Started',
        title: "You're Ready to Send",
        titleGrad: 'Ready',
        titlePlain: "You're ",
        gradAtEnd: true,
        desc: 'Your Email/SMS CRM is fully set up. Upload your first list, build a campaign, and launch your first email or SMS broadcast in just a few minutes.',
        bullets: [
            'Step 1 — Upload your contact list using the List Upload tool',
            'Step 2 — Create your first email or SMS campaign',
            'Step 3 — Schedule or send immediately to your segment',
            'Step 4 — Monitor opens, clicks, and delivery in the KPI dashboard',
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

function StepIndicator({ current, total, accent }: { current: number; total: number; accent: string }) {
    // const sections = [{ label: 'Platform Tour', count: total, range: [0, total - 1] }];
    return (
        <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
            Platform Tour
        </span>
    );
}

// ── Main Component ────────────────────────────────────────────
export function EmailMarketingTourPopup({ onComplete }: { onComplete?: () => void }) {
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
        backgroundColor: '#080c10',
        borderColor: `${accent}45`,
        boxShadow: `0 0 80px ${accent}20, 0 0 30px #2c7bbe12, 0 30px 80px rgba(0,0,0,0.80)`,
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

    const nextLabel = isLastSlide ? 'Go to Dashboard →' : 'Next';

    // Feature icon grid for right panel
    const featureIcons = [
        { Icon: Mail, label: 'Email' },
        { Icon: MessageSquare, label: 'SMS' },
        { Icon: Bot, label: 'Chatbot' },
        { Icon: BarChart3, label: 'KPIs' },
        { Icon: Upload, label: 'Lists' },
        { Icon: Calendar, label: 'Schedule' },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => close(false)}
                className='fixed inset-0 z-[9990] bg-black/82 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                {/* ══ DESKTOP ══ */}
                <div
                    className='pointer-events-auto hidden lg:flex w-full max-w-3xl relative rounded-3xl border-2 overflow-hidden flex-col'
                    style={{ ...modalEnter, minHeight: 500 }}
                >
                    {/* Dual-tone shimmer top bar */}
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, #2c7bbe, ${accent}, transparent)` }}
                    />
                    {/* Ambient glow */}
                    <div
                        className='absolute top-0 left-0 right-0 h-64 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 40% 0%, ${accent}12 0%, #2c7bbe08 50%, transparent 70%)` }}
                    />

                    {/* Product badge top-left */}
                    <div
                        className='absolute top-4 left-6 z-20 hidden lg:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold'
                        style={{
                            background: `linear-gradient(135deg, ${accent}20, #2c7bbe10)`,
                            border: `1px solid ${accent}40`,
                            color: accent,
                        }}
                    >
                        <Mail className='w-3 h-3' />
                        Email/SMS CRM
                    </div>

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
                                {/* Badge row */}
                                <div className='flex items-center gap-3 mb-5'>
                                    <div
                                        className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase'
                                        style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                                    >
                                        <Icon className='w-3.5 h-3.5' />
                                        {badge}
                                    </div>
                                    <StepIndicator current={current} total={SLIDES.length} accent={accent} />
                                </div>

                                {/* Title */}
                                <h2 className='text-3xl font-black text-white leading-tight mb-3'>
                                    <GradTitle />
                                </h2>
                                <div
                                    className='h-0.5 rounded-full mb-4 w-14'
                                    style={{ background: `linear-gradient(90deg, ${accent}, #2c7bbe, transparent)` }}
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
                                            background: `linear-gradient(135deg, ${accent}cc, #2c7bbe99)`,
                                            border: `1px solid ${accent}60`,
                                            boxShadow: `0 2px 14px ${accent}30`,
                                        }}
                                    >
                                        {nextLabel}
                                        {!isLastSlide && <ChevronRight className='w-3.5 h-3.5' />}
                                    </button>
                                    <span className='text-xs text-white/25'>
                                        {current + 1}/{SLIDES.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div
                            className='w-[1px] self-stretch my-8'
                            style={{ background: `linear-gradient(to bottom, transparent, ${accent}30, #2c7bbe20, transparent)` }}
                        />

                        {/* RIGHT panel */}
                        <div className='w-[220px] flex-shrink-0 flex flex-col items-center justify-center gap-5 p-6' style={slideAnim}>
                            {/* Main icon */}
                            <div
                                className='w-24 h-24 rounded-2xl flex items-center justify-center'
                                style={{
                                    backgroundColor: `${accent}15`,
                                    border: `2px solid ${accent}30`,
                                    boxShadow: `0 0 50px ${accent}22, 0 0 20px #2c7bbe10`,
                                }}
                            >
                                <Icon className='w-12 h-12' style={{ color: accent }} />
                            </div>

                            {/* Step counter */}
                            <div className='text-center'>
                                <p className='text-xs font-semibold mb-1' style={{ color: accent }}>
                                    Platform Tour
                                </p>
                                <p className='text-white/30 text-xs'>
                                    Step {current + 1} of {SLIDES.length}
                                </p>
                            </div>

                            {/* Feature icon grid */}
                            <div className='grid grid-cols-3 gap-2 w-full mt-1'>
                                {featureIcons.map(({ Icon: FIcon, label }, i) => {
                                    const slideForFeature = i + 1; // slides 1-6 map to feature icons
                                    const isActive = current === slideForFeature;
                                    const isDone = current > slideForFeature;
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
                                                className='text-[9px] font-medium'
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
                        style={{ background: `linear-gradient(90deg, transparent, #2c7bbe, ${accent}, transparent)` }}
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
                        <div className='h-0.5 rounded-full mb-3 w-10' style={{ background: `linear-gradient(90deg, ${accent}, #2c7bbe, transparent)` }} />
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
                                        background: `linear-gradient(135deg, ${accent}cc, #2c7bbe99)`,
                                        border: `1px solid ${accent}60`,
                                    }}
                                >
                                    {isLastSlide ? 'Go ✓' : 'Next'}
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
