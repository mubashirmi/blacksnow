'use client';

import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    ChevronLeft,
    CreditCard,
    FileText,
    Gift,
    Globe,
    Mail,
    Shield,
    Sparkles,
    TrendingUp,
    UserCheck,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bs_silver_dashboard_tour_v1';

// ── Types ────────────────────────────────────────────────────
type SlideVariant = 'intro' | 'feature' | 'table' | 'legal' | 'acknowledge';

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
    tableData?: { product: string; monthly: string; annual: string }[];
    legalTitle?: string;
    legalSummary?: string;
    legalLink?: string;
    isLast?: boolean;
};

const SLIDES: Slide[] = [
    // ── FEATURE SLIDES ──
    {
        id: 'welcome',
        variant: 'intro',
        accent: '#4cc7e8',
        Icon: Zap,
        badge: 'Lightning Silver',
        title: 'Welcome to Your Dashboard',
        titleGrad: 'Lightning Silver',
        titlePlain: 'Welcome to ',
        gradAtEnd: true,
        desc: 'Your Lightning Silver affiliate dashboard is live. This quick tour walks you through everything — your commissions, referral bonuses, built-in marketing tools, and real-time analytics.',
        bullets: [
            'Earn 25% lifetime commissions on every referral',
            '$100/month bonus for every 10 products sold',
            'Built-in Email & SMS CRM — no extra tools needed',
            'Real-time KPI dashboard to track all your growth',
        ],
    },
    {
        id: 'commissions',
        variant: 'feature',
        accent: '#C0C0C0',
        Icon: CreditCard,
        badge: 'Commissions',
        title: '25% Lifetime Commissions',
        titleGrad: '25%',
        titlePlain: ' Lifetime Commissions',
        desc: 'Earn 25% on every active subscriber you refer — paid monthly or annually for as long as they stay subscribed. No income cap, no expiry. Your earnings compound as your audience grows.',
        bullets: [
            'Commissions apply to both monthly & annual plans',
            'Paid automatically on every billing cycle',
            'No cap — earnings grow with every new referral',
            'Commissions continue for the full lifetime of the subscription',
        ],
    },
    {
        id: 'commission-table',
        variant: 'table',
        accent: '#5EDC7A',
        Icon: TrendingUp,
        badge: 'Commission Breakdown',
        title: 'Your Earning Rates',
        titleGrad: 'Earning',
        titlePlain: 'Your ',
        gradAtEnd: true,
        desc: "Here's exactly what you earn per product referral at the 25% Silver tier. These rates apply to every active subscriber as long as their subscription remains active.",
        tableData: [
            { product: 'Newsletter', monthly: '$2.50 / mo', annual: '$12.50 / yr' },
            { product: 'Business Invoice', monthly: '$5 / mo', annual: '$50 / yr' },
            { product: 'Digital Billboard', monthly: '$37.50 / mo', annual: '$150 / yr' },
            { product: 'Email/SMS CRM', monthly: '$125 / mo', annual: '$1,000 / yr' },
        ],
        bullets: ['All commissions are recurring — not one-time', 'Annual plans pay out a higher lump sum per cycle'],
    },
    {
        id: 'referral-bonus',
        variant: 'feature',
        accent: '#F5A623',
        Icon: Gift,
        badge: 'Referral Bonus',
        title: '$100/Month Referral Bonus',
        titleGrad: '$100/Month',
        titlePlain: ' Referral Bonus',
        desc: 'On top of standard commissions, Lightning pays a stacking $100/month bonus for every 10 products sold. These bonuses are ongoing and multiply as you grow.',
        bullets: [
            'Earn $100/month for every 10 products sold',
            'Bonuses stack on top of your standard commissions',
            'Paid on an ongoing basis while customers stay active',
            'More referrals = more bonus tiers — no ceiling',
        ],
    },
    {
        id: 'crm',
        variant: 'feature',
        accent: '#4cc7e8',
        Icon: Mail,
        badge: 'Built-In CRM',
        title: 'Email & SMS CRM Included',
        titleGrad: 'Email & SMS CRM',
        titlePlain: ' Included',
        desc: 'Promote your affiliate links directly from the dashboard using the built-in Email and SMS CRM. No need for third-party marketing software — everything is in one place.',
        bullets: [
            'Send email & SMS campaigns from your dashboard',
            'Promote affiliate links without external tools',
            'Built-in audience management and segmentation',
            'Earn commissions on CRM subscriptions you refer',
        ],
    },
    {
        id: 'kpi',
        variant: 'feature',
        accent: '#9B59B6',
        Icon: BarChart3,
        badge: 'KPI Dashboard',
        title: 'Real-Time Analytics',
        titleGrad: 'Real-Time',
        titlePlain: ' Analytics',
        desc: 'Your KPI dashboard gives you full visibility into every metric that matters — referrals, conversions, traffic, commissions earned, and growth trends — updated live.',
        bullets: [
            'Live tracking of clicks, referrals, and conversions',
            'Commission history with full payout breakdown',
            'Traffic and growth trends over time',
            'All data in one centralized view — no spreadsheets',
        ],
    },
    {
        id: 'getting-started',
        variant: 'feature',
        accent: '#5EDC7A',
        Icon: Sparkles,
        badge: 'Getting Started',
        title: "You're Ready to Earn",
        titleGrad: 'Ready',
        titlePlain: "You're ",
        gradAtEnd: true,
        desc: 'Your dashboard is fully set up. Head to your referral links, copy your unique tracking URL, and start sharing across your channels right now.',
        bullets: [
            'Step 1 — Copy your unique referral link from the dashboard',
            'Step 2 — Share it via email, social media, or your website',
            'Step 3 — Track every click and conversion in real time',
            'Step 4 — Get paid automatically each commission cycle',
        ],
    },

    // ── LEGAL SLIDES ──
    {
        id: 'legal-affiliate',
        variant: 'legal',
        accent: '#4cc7e8',
        Icon: FileText,
        badge: 'Legal — Affiliate Agreement',
        title: 'Affiliate Agreement',
        titleGrad: 'Affiliate',
        titlePlain: ' Agreement',
        desc: 'By joining our affiliate program, you agree to our Affiliate Agreement which governs your participation, commission structure, and conduct.',
        legalTitle: 'Key Terms',
        legalSummary:
            'You will promote Black Snow Holdings services honestly and in compliance with applicable laws. Commission rates and payout schedules are defined in your tier. We reserve the right to modify terms with 30 days notice. Misuse of the program may result in termination and forfeiture of pending commissions.',
        legalLink: '/affiliateagreement',
        bullets: ['Honest, compliant promotion required', 'Commission rates fixed per tier at sign-up', '30-day notice for material term changes'],
    },
    {
        id: 'legal-contractor',
        variant: 'legal',
        accent: '#F5A623',
        Icon: UserCheck,
        badge: 'Legal — Independent Contractor',
        title: 'Independent Contractor',
        titleGrad: 'Independent',
        titlePlain: ' Contractor',
        desc: 'As an affiliate you operate as an independent contractor — not an employee of Black Snow Holdings. This agreement defines that relationship.',
        legalTitle: 'What This Means',
        legalSummary:
            'You are solely responsible for your own taxes, insurance, and business expenses. You have full flexibility to set your schedule and choose your promotional methods. Black Snow Holdings does not direct your day-to-day activities and provides no employee benefits.',
        legalLink: '/independentcontract',
        bullets: ['You are self-employed — not a BSH employee', 'Responsible for your own taxes and expenses', 'Full autonomy over your promotional methods'],
    },
    {
        id: 'legal-earnings',
        variant: 'legal',
        accent: '#E74C3C',
        Icon: AlertTriangle,
        badge: 'Legal — Earnings Disclosure',
        title: 'Earnings Disclosure',
        titleGrad: 'Earnings',
        titlePlain: ' Disclosure',
        desc: 'Income from our affiliate program varies significantly. Results depend on your effort, audience, and promotional strategy — not all affiliates earn the same.',
        legalTitle: 'Important Disclosure',
        legalSummary:
            'Any income figures referenced are illustrative only and not guarantees. Most affiliates earn modest amounts. Past performance of other affiliates does not predict your results. Only risk capital and time you can afford to invest should be committed to affiliate promotion.',
        legalLink: '/earningsdisclosure',
        bullets: ['No earnings are guaranteed', 'Results vary based on effort and audience', 'Illustrative figures are not typical results'],
    },
    {
        id: 'legal-gdpr',
        variant: 'legal',
        accent: '#2c7bbe',
        Icon: Globe,
        badge: 'Legal — GDPR',
        title: 'GDPR & Privacy',
        titleGrad: 'GDPR',
        titlePlain: ' & Privacy',
        desc: 'When promoting our services you must handle any personal data in compliance with GDPR and applicable privacy laws in your jurisdiction.',
        legalTitle: 'Your Obligations',
        legalSummary:
            'Do not collect or store personal data of referred users without proper consent and a lawful basis. You may not spam or send unsolicited messages. Any data you handle must be processed in accordance with our Privacy Policy and GDPR requirements.',
        legalLink: '/gdpr',
        bullets: ['No unsolicited messaging or spam', 'Handle personal data with proper consent', 'Comply with GDPR in your jurisdiction'],
    },
    {
        id: 'legal-terms',
        variant: 'legal',
        accent: '#9B59B6',
        Icon: FileText,
        badge: 'Legal — Terms & Conditions',
        title: 'Terms & Conditions',
        titleGrad: 'Terms',
        titlePlain: ' & Conditions',
        desc: 'Our Terms & Conditions govern your use of the Black Snow Holdings platform, affiliate tools, and all associated services.',
        legalTitle: 'Key Terms',
        legalSummary:
            'By using our platform you agree to our Terms & Conditions. These outline your rights and responsibilities, acceptable use policies, intellectual property rules, and procedures for resolving disputes. We reserve the right to update these terms with reasonable notice.',
        legalLink: '/terms',
        bullets: ['Governs platform and affiliate tool usage', 'Outlines acceptable use and IP policies', 'Dispute resolution procedures included'],
    },
    {
        id: 'legal-privacy',
        variant: 'legal',
        accent: '#1ABC9C',
        Icon: Shield,
        badge: 'Legal — Privacy Policy',
        title: 'Privacy Policy',
        titleGrad: 'Privacy',
        titlePlain: ' Policy',
        desc: 'Our Privacy Policy explains how Black Snow Holdings collects, uses, and protects your personal information as an affiliate partner.',
        legalTitle: 'What We Cover',
        legalSummary:
            'We collect only the data necessary to operate the affiliate program and pay commissions. Your data is never sold to third parties. You have the right to access, correct, or delete your personal data at any time. All data is stored securely in compliance with applicable privacy laws.',
        legalLink: '/privacy',
        bullets: ['Data collected only to operate the program', 'Your data is never sold to third parties', 'Right to access, correct, or delete your data'],
    },

    // ── FINAL ACKNOWLEDGE SLIDE ──
    {
        id: 'acknowledge',
        variant: 'acknowledge',
        accent: '#5EDC7A',
        Icon: Shield,
        badge: 'Legal Acknowledgement',
        title: "You're Almost In",
        titleGrad: 'Almost',
        titlePlain: "You're ",
        gradAtEnd: true,
        desc: 'By proceeding you confirm you have read and agree to all the legal documents listed below. You understand that earnings are not guaranteed and you operate as an independent contractor.',
        isLast: true,
        bullets: [
            'Affiliate Agreement',
            'Independent Contractor Agreement',
            'Earnings Disclosure',
            'GDPR & Privacy Policy',
            'Terms & Conditions',
            'Privacy Policy',
        ],
    },
];

// ── Progress Dots ─────────────────────────────────────────────
function ProgressDots({ current, total, accent, onDot }) {
    const groups = [
        { label: 'Dashboard Tour', range: [0, 6] },
        { label: 'Legal', range: [7, 12] },
        { label: 'Confirm', range: [13, 13] },
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
                                className='rounded-full transition-all duration-300'
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

function SectionLabel({ current }) {
    const label = current <= 6 ? 'Dashboard Tour' : current <= 12 ? 'Legal Review' : 'Confirm';
    const colors = { 'Dashboard Tour': '#4cc7e8', 'Legal Review': '#F5A623', Confirm: '#5EDC7A' };
    return (
        <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: colors[label], backgroundColor: `${colors[label]}18` }}>
            {label}
        </span>
    );
}

// ── Commission Table sub-component ───────────────────────────
function CommissionTable({ tableData, accent }) {
    return (
        <div className='rounded-xl overflow-hidden border mt-1' style={{ borderColor: `${accent}30` }}>
            <div className='grid grid-cols-3 text-xs font-bold uppercase px-3 py-2' style={{ backgroundColor: `${accent}18`, color: accent }}>
                <span>Product</span>
                <span>Monthly</span>
                <span>Annual</span>
            </div>
            {tableData.map((row, i) => (
                <div
                    key={i}
                    className='grid grid-cols-3 text-xs px-3 py-2 border-t'
                    style={{
                        borderColor: `${accent}15`,
                        backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    }}
                >
                    <span className='text-white/80 font-medium'>{row.product}</span>
                    <span style={{ color: accent }}>{row.monthly}</span>
                    <span style={{ color: accent }}>{row.annual}</span>
                </div>
            ))}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────
export function LightningSilverTourPopup({ onComplete }) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState('next');
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

    const goTo = (next, direction) => {
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
    const handleDot = (i) => {
        if (i === current || animating) return;
        goTo(i, i > current ? 'next' : 'prev');
    };

    const slide = SLIDES[current];
    const { Icon, accent, badge, titleGrad, titlePlain, gradAtEnd, desc, bullets, variant, legalSummary, legalLink, tableData } = slide;
    const isLastSlide = current === SLIDES.length - 1;
    const isNextDisabled = isLastSlide && !agreed;

    const slideAnim = {
        transition: 'opacity 0.26s ease, transform 0.26s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '-20px' : '20px'})` : 'translateX(0)',
    };

    const modalEnter = {
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

    const nextLabel = isLastSlide ? (agreed ? 'Enter Dashboard' : 'Agree & continue') : current === 6 ? 'Review Legal →' : 'Next';

    // ── Silver tier badge (top-right corner decoration) ──────
    // const SilverBadge = () => (
    //     <div
    //         className='absolute top-4 left-6 z-20 hidden lg:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold'
    //         style={{
    //             background: 'linear-gradient(135deg, #C0C0C020, #80808010)',
    //             border: '1px solid #C0C0C040',
    //             color: '#C0C0C0',
    //         }}
    //     >
    //         <Zap className='w-3 h-3' />
    //         Lightning Silver
    //     </div>
    // );

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => close(false)}
                className='fixed inset-0 z-[9990] bg-black/80 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                {/* ══ DESKTOP ══ */}
                <div
                    className='pointer-events-auto hidden lg:flex w-full max-w-3xl relative rounded-3xl border-2 overflow-hidden flex-col'
                    style={{ ...modalEnter, minHeight: 500 }}
                >
                    {/* Shimmer top bar */}
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    {/* Ambient glow */}
                    <div
                        className='absolute top-0 left-0 right-0 h-64 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 40% 0%, ${accent}12 0%, transparent 65%)` }}
                    />

                    {/* <SilverBadge /> */}

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
                                {/* <div className='flex items-center gap-3 mb-5'>
                                    <div
                                        className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase'
                                        style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                                    >
                                        <Icon className='w-3.5 h-3.5' />
                                        {badge}
                                    </div>
                                    <SectionLabel current={current} />
                                </div> */}

                                {/* Title */}
                                <h2 className='text-3xl font-black text-white leading-tight mb-3'>
                                    <GradTitle />
                                </h2>
                                <div className='h-0.5 rounded-full mb-4 w-14' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                                {/* Desc */}
                                <p className='text-gray-400 text-sm leading-relaxed mb-5 max-w-sm'>{desc}</p>

                                {/* Commission table */}
                                {variant === 'table' && tableData && <CommissionTable tableData={tableData} accent={accent} />}

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
                                    <ul className={`space-y-2.5 ${variant === 'table' ? 'mt-3' : ''}`}>
                                        {bullets.map((b, i) => (
                                            <li key={i} className='flex items-start gap-2.5'>
                                                <CheckCircle className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                                <span className='text-white/70 text-sm leading-snug'>
                                                    {isLastSlide ? (
                                                        <a
                                                            href={
                                                                [
                                                                    '/affiliateagreement',
                                                                    '/independentcontract',
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
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}
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
                            style={{ background: `linear-gradient(to bottom, transparent, ${accent}30, transparent)` }}
                        />

                        {/* RIGHT — icon panel */}
                        <div className='w-[220px] flex-shrink-0 flex flex-col items-center justify-center gap-4 p-6' style={slideAnim}>
                            <div
                                className='w-24 h-24 rounded-2xl flex items-center justify-center'
                                style={{
                                    backgroundColor: `${accent}18`,
                                    border: `2px solid ${accent}30`,
                                    boxShadow: `0 0 40px ${accent}20`,
                                }}
                            >
                                <Icon className='w-12 h-12' style={{ color: accent }} />
                            </div>
                            <div className='text-center'>
                                <p className='text-xs font-semibold mb-1' style={{ color: accent }}>
                                    {current <= 6 ? 'Dashboard Tour' : current <= 12 ? 'Legal Review' : 'Final Step'}
                                </p>
                                <p className='text-white/30 text-xs'>
                                    Slide {current + 1} of {SLIDES.length}
                                </p>
                            </div>
                            {/* Section markers */}
                            <div className='flex flex-col gap-2 w-full mt-2'>
                                {[
                                    { label: '7 feature slides', done: current >= 7, active: current <= 6 },
                                    { label: '6 legal documents', done: current >= 13, active: current >= 7 && current <= 12 },
                                    { label: 'Confirmation', done: false, active: current === 13 },
                                ].map((s, i) => (
                                    <div key={i} className='flex items-center gap-2'>
                                        <div
                                            className='w-1.5 h-1.5 rounded-full flex-shrink-0'
                                            style={{
                                                backgroundColor: s.done ? accent : s.active ? accent : 'rgba(255,255,255,0.15)',
                                            }}
                                        />
                                        <span
                                            className='text-xs'
                                            style={{
                                                color: s.done || s.active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                                            }}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
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

                        {/* Mobile commission table */}
                        {variant === 'table' && tableData && (
                            <div className='mb-3'>
                                <CommissionTable tableData={tableData} accent={accent} />
                            </div>
                        )}

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

                    {/* Mobile nav */}
                    <div className='relative z-10 px-6 pb-5'>
                        <div className='flex items-center gap-2'>
                            <ProgressDots current={current} total={SLIDES.length} accent={accent} onDot={handleDot} />
                            <div className='flex items-center gap-1.5 ml-auto'>
                                <button
                                    onClick={handlePrev}
                                    disabled={current === 0}
                                    className='w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-20'
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <ChevronLeft className='w-4 h-4 text-white' />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={isNextDisabled}
                                    className='h-9 px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed'
                                    style={{
                                        background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`,
                                        border: `1px solid ${accent}60`,
                                    }}
                                >
                                    {isLastSlide ? (agreed ? 'Agree' : '—') : 'Next'}
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
