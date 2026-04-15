'use client';

import {
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    DollarSign,
    FileCheck,
    FileText,
    Globe,
    LineChart,
    Link2,
    Mail,
    Repeat,
    Share2,
    Shield,
    UserCheck,
    Wallet,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type SlideVariant = 'standard' | 'legal' | 'acknowledge';

type Slide = {
    id: string;
    variant?: SlideVariant;
    accent?: string;
    badge: string;
    title: string;
    description: string;
    bullets: string[];
    panelTitle?: string;
    panelSummary?: string;
    legalLink?: string;
    railLabel: string;
    Icon: any;
};

type LightningGoldSlideshowProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const GOLD_ACCENT = '#f5b335';

const SLIDES: Slide[] = [
    {
        id: 'lightning-gold',
        variant: 'standard',
        accent: GOLD_ACCENT,
        badge: 'Lightning Gold — $250/Month | 75% Commission',
        title: 'Scale Faster With Higher Commissions',
        description: 'Earn higher commissions with fewer sales and maximize your income potential using the same powerful system.',
        bullets: ['Join', 'Send Links', 'Campaigns', 'Earn', 'Billing', 'Track', 'Connect Stripe'],
        railLabel: 'Intro',
        Icon: Wallet,
    },
    {
        id: 'send-affiliate-links',
        variant: 'standard',
        accent: GOLD_ACCENT,
        badge: 'Step 1 — Send Affiliate Links',
        title: 'Share Links Across Any Platform',
        description: 'Share your affiliate links across platforms and turn simple sharing into consistent traffic and opportunities.',
        bullets: [
            'Share your affiliate links anywhere',
            'Use SMS, email, or social platforms',
            'Built-in share tools for fast distribution',
            'Reach unlimited potential customers',
        ],
        railLabel: 'Send Links',
        Icon: Share2,
    },
    {
        id: 'email-sms-campaigns',
        variant: 'standard',
        accent: GOLD_ACCENT,
        badge: 'Step 2 — Email & SMS Campaigns',
        title: 'Launch Multi-Channel Campaigns',
        description: 'Launch campaigns that reach leads instantly across multiple channels while increasing engagement consistently.',
        bullets: [
            'Launch email and SMS campaigns easily',
            'Reach leads instantly with built-in tools',
            'Promote offers directly from your dashboard',
            'Increase engagement with consistent outreach',
        ],
        railLabel: 'Campaigns',
        Icon: Mail,
    },
    {
        id: 'earn-commissions-bonus-referrals',
        variant: 'standard',
        accent: GOLD_ACCENT,
        badge: 'Step 3 — Earn Commissions, Bonus & Referrals',
        title: 'Build Multiple Income Streams',
        description: 'Earn commissions while unlocking bonuses and referral-based rewards inside one connected system.',
        bullets: [
            'Earn commissions on every sale you generate',
            'Unlock bonus payouts as you grow',
            'Get rewarded with Free Emails and SMS by sending affiliate referrals',
            'Stack multiple income streams inside one system',
        ],
        railLabel: 'Earn',
        Icon: DollarSign,
    },
    {
        id: 'earn-mrr-arr',
        variant: 'standard',
        accent: GOLD_ACCENT,
        badge: 'Step 4 — Earn MRR & ARR',
        title: 'Grow Income That Compounds',
        description: 'Build recurring income that grows monthly and compounds yearly while referrals stay active.',
        bullets: [
            'Earn recurring monthly income (MRR)',
            'Build long-term yearly income (ARR)',
            'Get paid as customers stay subscribed',
            'Create predictable, compounding earnings',
        ],
        railLabel: 'MRR & ARR',
        Icon: Repeat,
    },
    {
        id: 'billing-payout-schedules',
        variant: 'standard',
        accent: GOLD_ACCENT,
        badge: 'Step 5 — Billing & Payout Schedules',
        title: 'Know Exactly When You Get Paid',
        description: 'Understand when you earn and when payouts are processed with clear and consistent payment timelines.',
        bullets: [
            'Clear monthly and yearly billing structure',
            'Track when commissions are earned and paid',
            'Consistent payout schedules you can rely on',
            'Full visibility into your earnings timeline',
        ],
        railLabel: 'Billing',
        Icon: CreditCard,
    },
    {
        id: 'kpi-metrics',
        variant: 'standard',
        accent: GOLD_ACCENT,
        badge: 'Step 6 — KPI Metrics',
        title: 'Track What Performs Best',
        description: 'Track your performance and use real data to improve results and scale your income faster.',
        bullets: [
            'Track clicks, conversions, and sales',
            'Monitor your performance in real time',
            'Identify what’s working and scale it',
            'Make data-driven decisions to grow faster',
        ],
        railLabel: 'KPI',
        Icon: LineChart,
    },
    {
        id: 'connect-stripe-account',
        variant: 'standard',
        accent: GOLD_ACCENT,
        badge: 'Step 7 — Connect Stripe Account',
        title: 'Receive Payouts Securely',
        description: 'Connect your Stripe account to receive payouts quickly and securely while maintaining full control of your income.',
        bullets: [
            'Connect your Stripe account for payouts',
            'Receive earnings directly and securely',
            'Manage your income with full transparency',
            'Get paid automatically as you earn',
        ],
        railLabel: 'Stripe',
        Icon: Link2,
    },
    {
        id: 'legal-affiliate',
        variant: 'legal',
        accent: GOLD_ACCENT,
        badge: 'Legal — Affiliate Agreement',
        title: 'Affiliate Agreement',
        description:
            'By joining our affiliate program, you agree to our Affiliate Agreement which governs your participation, commission structure, and conduct.',
        panelTitle: 'Key Terms',
        panelSummary:
            'You will promote Black Snow Holdings services honestly and in compliance with applicable laws. Commission rates and payout schedules are defined in your tier. We reserve the right to modify terms with 30 days notice. Misuse of the program may result in termination and forfeiture of pending commissions.',
        legalLink: '/affiliateagreement',
        bullets: ['Honest, compliant promotion required', 'Commission rates fixed per tier at sign-up', '30-day notice for material term changes'],
        railLabel: 'Affiliate',
        Icon: FileText,
    },
    {
        id: 'legal-contractor',
        variant: 'legal',
        accent: GOLD_ACCENT,
        badge: 'Legal — Independent Contractor',
        title: 'Independent Contractor',
        description:
            'As an affiliate you operate as an independent contractor — not an employee of Black Snow Holdings. This agreement defines that relationship.',
        panelTitle: 'What This Means',
        panelSummary:
            'You are solely responsible for your own taxes, insurance, and business expenses. You have full flexibility to set your schedule and choose your promotional methods. Black Snow Holdings does not direct your day-to-day activities and provides no employee benefits.',
        legalLink: '/independentcontract',
        bullets: ['You are self-employed — not a BSH employee', 'Responsible for your own taxes and expenses', 'Full autonomy over your promotional methods'],
        railLabel: 'Contractor',
        Icon: UserCheck,
    },
    {
        id: 'legal-earnings',
        variant: 'legal',
        accent: GOLD_ACCENT,
        badge: 'Legal — Earnings Disclosure',
        title: 'Earnings Disclosure',
        description:
            'Income from our affiliate program varies significantly. Results depend on your effort, audience, and promotional strategy — not all affiliates earn the same.',
        panelTitle: 'Important Disclosure',
        panelSummary:
            'Any income figures referenced are illustrative only and not guarantees. Most affiliates earn modest amounts. Past performance of other affiliates does not predict your results. Only risk capital and time you can afford to invest should be committed to affiliate promotion.',
        legalLink: '/earningsdisclosure',
        bullets: ['No earnings are guaranteed', 'Results vary based on effort and audience', 'Illustrative figures are not typical results'],
        railLabel: 'Earnings',
        Icon: AlertTriangle,
    },
    {
        id: 'legal-gdpr',
        variant: 'legal',
        accent: GOLD_ACCENT,
        badge: 'Legal — GDPR',
        title: 'GDPR & Privacy',
        description: 'When promoting our services you must handle any personal data in compliance with GDPR and applicable privacy laws in your jurisdiction.',
        panelTitle: 'Your Obligations',
        panelSummary:
            'Do not collect or store personal data of referred users without proper consent and a lawful basis. You may not spam or send unsolicited messages. Any data you handle must be processed in accordance with our Privacy Policy and GDPR requirements. Contact us if you have questions about compliance.',
        legalLink: '/gdpr',
        bullets: ['No unsolicited messaging or spam', 'Handle personal data with proper consent', 'Comply with GDPR in your jurisdiction'],
        railLabel: 'GDPR',
        Icon: Globe,
    },
    {
        id: 'legal-terms',
        variant: 'legal',
        accent: GOLD_ACCENT,
        badge: 'Legal — Terms & Conditions',
        title: 'Terms & Conditions',
        description: 'Our Terms & Conditions govern your use of the Black Snow Holdings platform, affiliate tools, and all associated services.',
        panelTitle: 'Key Terms',
        panelSummary:
            'By using our platform you agree to our Terms & Conditions. These outline your rights and responsibilities, acceptable use policies, intellectual property rules, and procedures for resolving disputes. We reserve the right to update these terms with reasonable notice.',
        legalLink: '/terms',
        bullets: ['Governs platform and affiliate tool usage', 'Outlines acceptable use and IP policies', 'Dispute resolution procedures included'],
        railLabel: 'Terms',
        Icon: FileText,
    },
    {
        id: 'legal-privacy',
        variant: 'legal',
        accent: GOLD_ACCENT,
        badge: 'Legal — Privacy Policy',
        title: 'Privacy Policy',
        description: 'Our Privacy Policy explains how Black Snow Holdings collects, uses, and protects your personal information as an affiliate partner.',
        panelTitle: 'What We Cover',
        panelSummary:
            'We collect only the data necessary to operate the affiliate program and pay commissions. Your data is never sold to third parties. You have the right to access, correct, or delete your personal data at any time. All data is stored securely in compliance with applicable privacy laws.',
        legalLink: '/privacy',
        bullets: ['Data collected only to operate the program', 'Your data is never sold to third parties', 'Right to access, correct, or delete your data'],
        railLabel: 'Privacy',
        Icon: Shield,
    },
    {
        id: 'acknowledge',
        variant: 'acknowledge',
        accent: GOLD_ACCENT,
        badge: 'Legal Acknowledgement',
        title: "You're Almost In",
        description:
            'By proceeding you confirm you have read and agree to all the legal documents listed below. You understand that earnings are not guaranteed and you operate as an independent contractor.',
        panelTitle: 'Confirmation Checklist',
        panelSummary:
            'Please review the documents below before moving forward. Your acknowledgement confirms acceptance of the legal framework for participating in the affiliate program.',
        bullets: [
            'Affiliate Agreement',
            'Independent Contractor Agreement',
            'Earnings Disclosure',
            'GDPR & Privacy Policy',
            'Terms & Conditions',
            'Privacy Policy',
        ],
        railLabel: 'Acknowledge',
        Icon: Shield,
    },
];

function ProgressDots({ current, total, accent, onDot }: { current: number; total: number; accent: string; onDot: (index: number) => void }) {
    return (
        <div className='flex items-center gap-2.5 flex-wrap'>
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

function InfoPanel({ slide, accent }: { slide: Slide; accent: string }) {
    return (
        <div className='rounded-2xl p-4 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
            <div className='flex items-center justify-between gap-3 mb-3'>
                <div className='flex items-center gap-2'>
                    <FileCheck className='w-4 h-4' style={{ color: accent }} />
                    <p className='text-xs font-bold uppercase tracking-wide' style={{ color: accent }}>
                        {slide.panelTitle ?? 'Key Highlights'}
                    </p>
                </div>

                {slide.legalLink ? (
                    <a
                        href={slide.legalLink}
                        className='text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all hover:scale-[1.02]'
                        style={{ color: accent, borderColor: `${accent}35`, backgroundColor: `${accent}12` }}
                    >
                        Review
                    </a>
                ) : null}
            </div>

            {slide.panelSummary ? <p className='text-white/60 text-xs leading-relaxed mb-3'>{slide.panelSummary}</p> : null}

            <ul className='space-y-2.5'>
                {slide.bullets.map((bullet, index) => (
                    <li key={index} className='flex items-start gap-2.5'>
                        <CheckCircle2 className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                        <span className='text-white/70 text-sm leading-snug'>{bullet}</span>
                    </li>
                ))}
            </ul>
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

    const isLastSlide = current === SLIDES.length - 1;

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
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!open) return;
            if (event.key === 'Escape') close();
            if (event.key === 'ArrowRight' && current < SLIDES.length - 1) handleNext();
            if (event.key === 'ArrowLeft' && current > 0) handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, current, animating, isLastSlide]);

    const slide = SLIDES[current];
    const { Icon } = slide;
    const accent = slide.accent ?? GOLD_ACCENT;

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

    const rightRailSteps = useMemo(() => SLIDES.map((item) => item.railLabel), []);

    if (!mounted || !open) return null;

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
                    style={{ ...modalEnter, height: 'min(560px, calc(100vh - 3rem))' }}
                >
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    <div
                        className='absolute top-0 left-0 right-0 h-60 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 40% 0%, ${accent}16 0%, transparent 65%)` }}
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
                        <div className='flex-1 flex flex-col px-9 pt-9 pb-7 min-w-0 min-h-0'>
                            <div className='min-h-0 flex-1 overflow-y-auto pr-2' style={slideAnim}>
                                <div className='flex items-center gap-3 mb-5 flex-wrap'>
                                    <div
                                        className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase'
                                        style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                                    >
                                        <Icon className='w-3.5 h-3.5' />
                                        {slide.badge}
                                    </div>
                                    <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
                                        Slide {current + 1} of {SLIDES.length}
                                    </span>
                                </div>

                                <h2 className='text-3xl font-black text-white leading-tight mb-3'>
                                    <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #fff1c4)` }}>
                                        {slide.title}
                                    </span>
                                </h2>
                                <div className='h-0.5 rounded-full mb-4 w-14' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                                <p className='text-gray-400 text-sm leading-relaxed mb-5 max-w-lg'>{slide.description}</p>

                                <InfoPanel slide={slide} accent={accent} />
                            </div>

                            <div className='flex items-center gap-3 mt-6 pt-4 border-t border-white/10'>
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
                                            background: `linear-gradient(135deg, ${accent}dd, ${accent}88)`,
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

                        <div className='w-[230px] flex-shrink-0 flex flex-col items-center justify-center gap-4 p-6 min-h-0' style={slideAnim}>
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

                            <div className='flex flex-col gap-2 w-full mt-2 overflow-y-auto pr-1'>
                                {rightRailSteps.map((step, index) => {
                                    const active = index <= current;
                                    return (
                                        <div key={step} className='flex items-center gap-2'>
                                            <div
                                                className='w-1.5 h-1.5 rounded-full flex-shrink-0'
                                                style={{ backgroundColor: active ? accent : 'rgba(255,255,255,0.15)' }}
                                            />
                                            <span className='text-xs' style={{ color: active ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.24)' }}>
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
                    style={{ ...modalEnter, height: 'min(620px, calc(100vh - 2rem))' }}
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

                    <div className='relative z-10 px-6 pt-8 pb-4 min-h-0 flex-1 overflow-y-auto' style={slideAnim}>
                        <div className='flex items-center gap-2 flex-wrap mb-4'>
                            <div
                                className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase'
                                style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                            >
                                <Icon className='w-3 h-3' />
                                {slide.badge}
                            </div>
                            <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
                                {current + 1}/{SLIDES.length}
                            </span>
                        </div>

                        <h2 className='text-2xl font-black text-white leading-tight mb-2'>
                            <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #fff1c4)` }}>
                                {slide.title}
                            </span>
                        </h2>
                        <div className='h-0.5 rounded-full mb-3 w-10' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                        <p className='text-gray-400 text-xs leading-relaxed mb-4'>{slide.description}</p>

                        <div className='rounded-xl p-3 mb-3 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                            <div className='flex items-center justify-between gap-2 mb-2'>
                                <div className='flex items-center gap-2'>
                                    <FileCheck className='w-3.5 h-3.5' style={{ color: accent }} />
                                    <p className='text-xs font-bold uppercase' style={{ color: accent }}>
                                        {slide.panelTitle ?? 'Key Highlights'}
                                    </p>
                                </div>
                                {slide.legalLink ? (
                                    <a
                                        href={slide.legalLink}
                                        className='text-[10px] font-semibold px-2 py-1 rounded-full border'
                                        style={{ color: accent, borderColor: `${accent}35`, backgroundColor: `${accent}12` }}
                                    >
                                        Review
                                    </a>
                                ) : null}
                            </div>

                            {slide.panelSummary ? <p className='text-white/60 text-[11px] leading-relaxed mb-2.5'>{slide.panelSummary}</p> : null}

                            <ul className='space-y-1.5'>
                                {slide.bullets.map((bullet, index) => (
                                    <li key={index} className='flex items-start gap-2'>
                                        <CheckCircle2 className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                        <span className='text-white/65 text-xs leading-snug'>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className='relative z-10 px-6 pb-5 pt-1 border-t border-white/10'>
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
                                    style={{ background: `linear-gradient(135deg, ${accent}dd, ${accent}88)`, border: `1px solid ${accent}60` }}
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
