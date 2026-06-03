'use client';

import { BarChart3, Bot, Calendar, CheckCircle, ChevronLeft, Layers, Mail, MessageSquare, Sparkles, Upload, X } from 'lucide-react';
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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
        accent: '#4cc7e8',
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

// function StepIndicator({ current, total, accent }: { current: number; total: number; accent: string }) {
//     // const sections = [{ label: 'Platform Tour', count: total, range: [0, total - 1] }];
//     return (
//         <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
//             Platform Tour
//         </span>
//     );
// }

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
