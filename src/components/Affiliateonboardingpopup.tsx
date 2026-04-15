'use client';

import { CheckCircle, ChevronLeft, ChevronRight, CreditCard, Mail, Rocket, TrendingUp, X, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'bs_affiliate_tour_seen_v1';

// ── Types ────────────────────────────────────────────────────
type SlideVariant = 'intro' | 'howto' | 'legal' | 'acknowledge';

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
    // legal-specific
    legalTitle?: string;
    legalSummary?: string;
    legalLink?: string;
    // acknowledge slide
    isLast?: boolean;
};

// ── All slides ────────────────────────────────────────────────
const SLIDES: Slide[] = [
    // ── INSTRUCTION SLIDES ──
    {
        id: 'welcome',
        variant: 'intro',
        accent: '#4cc7e8',
        Icon: Zap,
        badge: 'Affiliate Program',
        title: 'Welcome to Black Snow Affiliates',
        titleGrad: 'Black Snow',
        titlePlain: ' Affiliates',
        desc: 'Earn real income by sharing what you already believe in. Our affiliate program gives you two powerful tiers — choose the one that fits your goals.',
        bullets: [
            'Lightning Silver — 25% lifetime commissions, free to join',
            'Lightning Gold — 75% lifetime commissions, $250/month',
            'Email/SMS CRM — promote & earn on every active referral',
        ],
    },
    {
        id: 'how-silver',
        variant: 'howto',
        accent: '#5EDC7A',
        Icon: Zap,
        badge: 'Lightning Silver — Basic',
        title: 'How Basic Affiliate Works',
        titleGrad: 'Basic',
        titlePlain: ' Affiliate',
        desc: 'Start earning immediately with no upfront cost. Share your referral link and earn 25% on every subscription payment your referrals make.',
        bullets: [
            'Sign up free — no purchase required',
            'Get a unique referral link instantly',
            'Earn 25% on monthly & annual plans — forever',
            'Commissions paid as long as your referral stays active',
        ],
    },
    {
        id: 'how-gold',
        variant: 'howto',
        accent: '#F5A623',
        Icon: Rocket,
        badge: 'Lightning Gold — Superior',
        title: 'How Superior Affiliate Works',
        titleGrad: 'Superior',
        titlePlain: ' Affiliate',
        desc: 'Unlock 75% lifetime commissions with a $250/month Gold membership. Triple your earning rate from the same traffic and referrals.',
        bullets: [
            'Upgrade to Gold for $250/month',
            'Earn 75% on every referral subscription',
            'Same effort — 3× the recurring payout',
            'Priority support and performance dashboard',
        ],
    },
    {
        id: 'how-crm',
        variant: 'howto',
        accent: '#4cc7e8',
        Icon: Mail,
        badge: 'Email / SMS CRM',
        title: 'Promote the CRM & Earn',
        titleGrad: 'CRM',
        titlePlain: 'Promote the ',
        gradAtEnd: true,
        desc: 'Refer clients to our Email/SMS CRM tool and earn commissions on their active subscriptions. A natural upsell alongside your affiliate promotion.',
        bullets: [
            'Promote the CRM alongside affiliate plans',
            'Earn on every active CRM subscriber you refer',
            'Simple one-link sharing — no technical setup',
            'Track all CRM referral earnings in one dashboard',
        ],
    },
    {
        id: 'how-paid',
        variant: 'howto',
        accent: '#2c7bbe',
        Icon: CreditCard,
        badge: 'Payouts',
        title: 'Getting Paid',
        titleGrad: 'Getting',
        titlePlain: ' Paid',
        desc: "Commissions are calculated automatically and paid out on a regular schedule. Connect your Stripe account and you're ready to receive.",
        bullets: [
            'Connect your Stripe account in the dashboard',
            'Commissions calculated automatically each cycle',
            'Track earnings, clicks, and conversions in real time',
            'Withdraw anytime your balance meets the minimum',
        ],
    },
    {
        id: 'how-start',
        variant: 'howto',
        accent: '#5EDC7A',
        Icon: TrendingUp,
        badge: 'Getting Started',
        title: 'Start in 3 Simple Steps',
        titleGrad: 'Simple',
        titlePlain: 'Start in 3 ',
        gradAtEnd: true,
        desc: 'Getting started takes under 5 minutes. Sign up, copy your link, and start sharing. Everything else is handled for you.',
        bullets: [
            'Step 1 — Create or log in to your account',
            'Step 2 — Choose Silver (free) or Gold ($250/mo)',
            'Step 3 — Copy your link and start promoting',
        ],
    },

    // ── LEGAL SLIDES ──
    // {
    //     id: 'legal-affiliate',
    //     variant: 'legal',
    //     accent: '#4cc7e8',
    //     Icon: FileText,
    //     badge: 'Legal — Affiliate Agreement',
    //     title: 'Affiliate Agreement',
    //     titleGrad: 'Affiliate',
    //     titlePlain: ' Agreement',
    //     desc: 'By joining our affiliate program, you agree to our Affiliate Agreement which governs your participation, commission structure, and conduct.',
    //     legalTitle: 'Key Terms',
    //     legalSummary:
    //         'You will promote Black Snow Holdings services honestly and in compliance with applicable laws. Commission rates and payout schedules are defined in your tier. We reserve the right to modify terms with 30 days notice. Misuse of the program may result in termination and forfeiture of pending commissions.',
    //     legalLink: '/affiliateagreement',
    //     bullets: ['Honest, compliant promotion required', 'Commission rates fixed per tier at sign-up', '30-day notice for material term changes'],
    // },
    // {
    //     id: 'legal-contractor',
    //     variant: 'legal',
    //     accent: '#F5A623',
    //     Icon: UserCheck,
    //     badge: 'Legal — Independent Contractor',
    //     title: 'Independent Contractor',
    //     titleGrad: 'Independent',
    //     titlePlain: ' Contractor',
    //     desc: 'As an affiliate you operate as an independent contractor — not an employee of Black Snow Holdings. This agreement defines that relationship.',
    //     legalTitle: 'What This Means',
    //     legalSummary:
    //         'You are solely responsible for your own taxes, insurance, and business expenses. You have full flexibility to set your schedule and choose your promotional methods. Black Snow Holdings does not direct your day-to-day activities and provides no employee benefits.',
    //     legalLink: '/independentcontract',
    //     bullets: ['You are self-employed — not a BSH employee', 'Responsible for your own taxes and expenses', 'Full autonomy over your promotional methods'],
    // },
    // {
    //     id: 'legal-earnings',
    //     variant: 'legal',
    //     accent: '#E74C3C',
    //     Icon: AlertTriangle,
    //     badge: 'Legal — Earnings Disclosure',
    //     title: 'Earnings Disclosure',
    //     titleGrad: 'Earnings',
    //     titlePlain: ' Disclosure',
    //     desc: 'Income from our affiliate program varies significantly. Results depend on your effort, audience, and promotional strategy — not all affiliates earn the same.',
    //     legalTitle: 'Important Disclosure',
    //     legalSummary:
    //         'Any income figures referenced are illustrative only and not guarantees. Most affiliates earn modest amounts. Past performance of other affiliates does not predict your results. Only risk capital and time you can afford to invest should be committed to affiliate promotion.',
    //     legalLink: '/earningsdisclosure',
    //     bullets: ['No earnings are guaranteed', 'Results vary based on effort and audience', 'Illustrative figures are not typical results'],
    // },
    // {
    //     id: 'legal-gdpr',
    //     variant: 'legal',
    //     accent: '#2c7bbe',
    //     Icon: Globe,
    //     badge: 'Legal — GDPR',
    //     title: 'GDPR & Privacy',
    //     titleGrad: 'GDPR',
    //     titlePlain: ' & Privacy',
    //     desc: 'When promoting our services you must handle any personal data in compliance with GDPR and applicable privacy laws in your jurisdiction.',
    //     legalTitle: 'Your Obligations',
    //     legalSummary:
    //         'Do not collect or store personal data of referred users without proper consent and a lawful basis. You may not spam or send unsolicited messages. Any data you handle must be processed in accordance with our Privacy Policy and GDPR requirements. Contact us if you have questions about compliance.',
    //     legalLink: '/gdpr',
    //     bullets: ['No unsolicited messaging or spam', 'Handle personal data with proper consent', 'Comply with GDPR in your jurisdiction'],
    // },
    // {
    //     id: 'legal-terms',
    //     variant: 'legal',
    //     accent: '#9B59B6',
    //     Icon: FileText,
    //     badge: 'Legal — Terms & Conditions',
    //     title: 'Terms & Conditions',
    //     titleGrad: 'Terms',
    //     titlePlain: ' & Conditions',
    //     desc: 'Our Terms & Conditions govern your use of the Black Snow Holdings platform, affiliate tools, and all associated services.',
    //     legalTitle: 'Key Terms',
    //     legalSummary:
    //         'By using our platform you agree to our Terms & Conditions. These outline your rights and responsibilities, acceptable use policies, intellectual property rules, and procedures for resolving disputes. We reserve the right to update these terms with reasonable notice.',
    //     legalLink: '/terms',
    //     bullets: ['Governs platform and affiliate tool usage', 'Outlines acceptable use and IP policies', 'Dispute resolution procedures included'],
    // },
    // {
    //     id: 'legal-privacy',
    //     variant: 'legal',
    //     accent: '#1ABC9C',
    //     Icon: Shield,
    //     badge: 'Legal — Privacy Policy',
    //     title: 'Privacy Policy',
    //     titleGrad: 'Privacy',
    //     titlePlain: ' Policy',
    //     desc: 'Our Privacy Policy explains how Black Snow Holdings collects, uses, and protects your personal information as an affiliate partner.',
    //     legalTitle: 'What We Cover',
    //     legalSummary:
    //         'We collect only the data necessary to operate the affiliate program and pay commissions. Your data is never sold to third parties. You have the right to access, correct, or delete your personal data at any time. All data is stored securely in compliance with applicable privacy laws.',
    //     legalLink: '/privacy',
    //     bullets: ['Data collected only to operate the program', 'Your data is never sold to third parties', 'Right to access, correct, or delete your data'],
    // },
    // {
    //     id: 'acknowledge',
    //     variant: 'acknowledge',
    //     accent: '#5EDC7A',
    //     Icon: Shield,
    //     badge: 'Legal Acknowledgement',
    //     title: "You're Almost In",
    //     titleGrad: 'Almost',
    //     titlePlain: "You're ",
    //     gradAtEnd: true,
    //     desc: 'By proceeding you confirm you have read and agree to all the legal documents listed below. You understand that earnings are not guaranteed and you operate as an independent contractor.',
    //     isLast: true,
    //     bullets: [
    //         'Affiliate Agreement',
    //         'Independent Contractor Agreement',
    //         'Earnings Disclosure',
    //         'GDPR & Privacy Policy',
    //         'Terms & Conditions',
    //         'Privacy Policy',
    //     ],
    // },
];

// ── Sub-components ────────────────────────────────────────────
function ProgressDots({ current, total, accent, onDot }: { current: number; total: number; accent: string; onDot: (i: number) => void }) {
    const groups = [
        { label: 'Instructions', range: [0, 5] },
        { label: 'Legal', range: [6, 11] },
        { label: 'Confirm', range: [12, 12] },
    ];

    return (
        <div className='flex items-center gap-3'>
            {groups.map((g, gi) => (
                <div key={gi} className='flex items-center gap-1'>
                    {Array.from({ length: g.range[1] - g.range[0] + 1 }).map((_, i) => {
                        const idx = g.range[0] + i;
                        return (
                            <button
                                key={idx}
                                onClick={() => onDot(idx)}
                                className='rounded-full transition-all duration-400'
                                style={{
                                    width: idx === current ? 20 : 6,
                                    height: 6,
                                    backgroundColor: idx === current ? accent : idx < current ? `${accent}55` : 'rgba(255,255,255,0.12)',
                                }}
                            />
                        );
                    })}
                    {gi < groups.length - 1 && <div className='w-3 h-px bg-white/10 mx-1' />}
                </div>
            ))}
        </div>
    );
}

function SectionLabel({ current }: { current: number }) {
    const label = current <= 5 ? 'Instructions' : current <= 11 ? 'Legal Review' : 'Confirm';
    const colors: Record<string, string> = { Instructions: '#4cc7e8', 'Legal Review': '#F5A623', Confirm: '#5EDC7A' };
    return (
        <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: colors[label], backgroundColor: `${colors[label]}18` }}>
            {label}
        </span>
    );
}

export function AffiliateOnboardingPopup({ onComplete }: { onComplete?: () => void }) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState<'next' | 'prev'>('next');
    const [animating, setAnimating] = useState(false);
    const [inView, setInView] = useState(false);
    const [agreed, setAgreed] = useState(false);

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
    const { Icon, accent, badge, titleGrad, titlePlain, gradAtEnd, desc, bullets, variant, legalSummary, legalLink } = slide;
    const isLastSlide = current === SLIDES.length - 1;
    const isNextDisabled = isLastSlide && !agreed;

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

    // Nav button label
    const nextLabel = isLastSlide ? (agreed ? 'I Agree & Continue' : 'Please agree to continue') : current === 5 ? 'Review Legal →' : 'Next';

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => close(false)}
                className='fixed inset-0 z-[9990] bg-black/78 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                {/* ══════════════════════════════════════════
                    DESKTOP (lg+)
                ══════════════════════════════════════════ */}
                <div
                    className='pointer-events-auto hidden lg:flex w-full max-w-3xl relative rounded-3xl border-2 overflow-hidden flex-col'
                    style={{ ...modalEnter, minHeight: 480 }}
                >
                    {/* Shimmer top bar */}
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    {/* Glow */}
                    <div
                        className='absolute top-0 left-0 right-0 h-60 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 40% 0%, ${accent}14 0%, transparent 65%)` }}
                    />

                    {/* Close */}
                    <button
                        onClick={() => close(false)}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    {/* Body */}
                    <div className='flex flex-1 min-h-0'>
                        {/* LEFT */}
                        <div className='flex-1 flex flex-col justify-between px-9 pt-9 pb-7 min-w-0'>
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
                                    <SectionLabel current={current} />
                                </div>

                                {/* Title */}
                                <h2 className='text-3xl font-black text-white leading-tight mb-3'>
                                    <GradTitle />
                                </h2>
                                <div className='h-0.5 rounded-full mb-4 w-14' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                                {/* Desc */}
                                <p className='text-gray-400 text-sm leading-relaxed mb-5 max-w-sm'>{desc}</p>

                                {/* Legal summary box */}
                                {variant === 'legal' && legalSummary && (
                                    <div className='rounded-2xl p-4 mb-5 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                                        <p className='text-xs font-bold uppercase mb-2' style={{ color: accent }}>
                                            Summary
                                        </p>
                                        <p className='text-white/60 text-xs leading-relaxed'>{legalSummary}</p>
                                        {legalLink && (
                                            <a
                                                href={legalLink}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='inline-flex items-center gap-1 mt-3 text-xs font-semibold hover:underline'
                                                style={{ color: accent }}
                                            >
                                                Read full document →
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Bullets */}
                                {bullets && (
                                    <ul className='space-y-2.5'>
                                        {bullets.map((b, i) => (
                                            <li key={i} className='flex items-start gap-2.5'>
                                                <CheckCircle className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                                <span className='text-white/70 text-sm leading-snug'>
                                                    {isLastSlide ? (
                                                        <a
                                                            href={
                                                                [
                                                                    '/affiliateagreement',
                                                                    '/independentContract',
                                                                    '/earningsdisclosure',
                                                                    '/gdpr',
                                                                    '/terms',
                                                                    '/privacy',
                                                                ][i]
                                                            }
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='hover:underline'
                                                            style={{ color: accent }}
                                                        >
                                                            {b}
                                                        </a>
                                                    ) : (
                                                        b
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Acknowledge checkbox */}
                                {isLastSlide && (
                                    <label className='flex items-start gap-3 mt-6 cursor-pointer group'>
                                        <div
                                            onClick={() => setAgreed(!agreed)}
                                            className='w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 cursor-pointer'
                                            style={{
                                                backgroundColor: agreed ? accent : 'transparent',
                                                border: `2px solid ${agreed ? accent : 'rgba(255,255,255,0.25)'}`,
                                            }}
                                        >
                                            {agreed && <CheckCircle className='w-3 h-3 text-[#080b12]' strokeWidth={3} />}
                                        </div>
                                        <span className='text-white/60 text-xs leading-relaxed group-hover:text-white/80 transition-colors'>
                                            I have read and agree to the Affiliate Agreement, Independent Contractor Agreement, Earnings Disclosure, GDPR
                                            Policy, Terms & Conditions, and Privacy Policy. I understand that earnings are not guaranteed and I act as an
                                            independent contractor.
                                        </span>
                                    </label>
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
                                        disabled={isNextDisabled}
                                        className='h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
                                        style={{
                                            background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`,
                                            border: `1px solid ${accent}60`,
                                            boxShadow: `0 2px 12px ${accent}30`,
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
                            style={{ background: `linear-gradient(to bottom, transparent, ${accent}30, transparent)` }}
                        />

                        {/* RIGHT — icon panel */}
                        <div className='w-[220px] flex-shrink-0 flex flex-col items-center justify-center gap-4 p-6' style={slideAnim}>
                            {/* Large icon */}
                            <div
                                className='w-24 h-24 rounded-2xl flex items-center justify-center'
                                style={{ backgroundColor: `${accent}18`, border: `2px solid ${accent}30`, boxShadow: `0 0 40px ${accent}20` }}
                            >
                                <Icon className='w-12 h-12' style={{ color: accent }} />
                            </div>
                            {/* Section progress */}
                            <div className='text-center'>
                                <p className='text-xs font-semibold mb-1' style={{ color: accent }}>
                                    {current <= 5 ? 'Instructions' : current <= 11 ? 'Legal Review' : 'Final Step'}
                                </p>
                                <p className='text-white/30 text-xs'>
                                    Step {current + 1} of {SLIDES.length}
                                </p>
                            </div>
                            {/* Mini section markers */}
                            <div className='flex flex-col gap-2 w-full mt-2'>
                                {[
                                    { label: '6 instruction slides', done: current >= 6, active: current <= 5 },
                                    { label: '6 legal documents', done: current >= 12, active: current >= 6 && current <= 11 },
                                    { label: 'Confirmation', done: false, active: current === 12 },
                                ].map((s, i) => (
                                    <div key={i} className='flex items-center gap-2'>
                                        <div
                                            className='w-1.5 h-1.5 rounded-full flex-shrink-0'
                                            style={{ backgroundColor: s.done ? accent : s.active ? accent : 'rgba(255,255,255,0.15)' }}
                                        />
                                        <span className='text-xs' style={{ color: s.done || s.active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}>
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    MOBILE (< lg)
                ══════════════════════════════════════════ */}
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
                        onClick={() => close(false)}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='relative z-10 px-6 pt-8 pb-4' style={slideAnim}>
                        {/* Badge + section */}
                        <div className='flex items-center gap-2 flex-wrap mb-4'>
                            <div
                                className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase'
                                style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                            >
                                <Icon className='w-3 h-3' />
                                {badge}
                            </div>
                            <SectionLabel current={current} />
                        </div>

                        <h2 className='text-2xl font-black text-white leading-tight mb-2'>
                            <GradTitle />
                        </h2>
                        <div className='h-0.5 rounded-full mb-3 w-10' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                        <p className='text-gray-400 text-xs leading-relaxed mb-3'>{desc}</p>

                        {/* Legal summary */}
                        {variant === 'legal' && legalSummary && (
                            <div className='rounded-xl p-3 mb-3 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                                <p className='text-xs font-bold uppercase mb-1' style={{ color: accent }}>
                                    Summary
                                </p>
                                <p className='text-white/55 text-xs leading-relaxed'>{legalSummary}</p>
                                {legalLink && (
                                    <a
                                        href={legalLink}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='inline-flex items-center gap-1 mt-2 text-xs font-semibold hover:underline'
                                        style={{ color: accent }}
                                    >
                                        Read full →
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Bullets */}
                        {bullets && (
                            <ul className='space-y-1.5'>
                                {bullets.map((b, i) => (
                                    <li key={i} className='flex items-start gap-2'>
                                        <CheckCircle className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                        <span className='text-white/65 text-xs leading-snug'>
                                            {isLastSlide ? (
                                                <a
                                                    href={
                                                        ['/affiliateagreement', '/independentcontract', '/earningsdisclosure', '/gdpr', '/terms', '/privacy'][i]
                                                    }
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='hover:underline'
                                                    style={{ color: accent }}
                                                >
                                                    {b}
                                                </a>
                                            ) : (
                                                b
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Acknowledge */}
                        {isLastSlide && (
                            <label className='flex items-start gap-2.5 mt-4 cursor-pointer'>
                                <div
                                    onClick={() => setAgreed(!agreed)}
                                    className='w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer'
                                    style={{
                                        backgroundColor: agreed ? accent : 'transparent',
                                        border: `2px solid ${agreed ? accent : 'rgba(255,255,255,0.25)'}`,
                                    }}
                                >
                                    {agreed && <CheckCircle className='w-3 h-3 text-[#080b12]' strokeWidth={3} />}
                                </div>
                                <span className='text-white/55 text-xs leading-relaxed'>
                                    I have read and agree to all the legal documents. I understand earnings are not guaranteed and I act as an independent
                                    contractor.
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Nav */}
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
                                    disabled={isNextDisabled}
                                    className='h-9 px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed'
                                    style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`, border: `1px solid ${accent}60` }}
                                >
                                    {isLastSlide ? (agreed ? 'Agree ✓' : '—') : 'Next'}
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
