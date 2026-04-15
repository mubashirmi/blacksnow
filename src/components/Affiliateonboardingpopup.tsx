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
    legalTitle?: string;
    legalSummary?: string;
    legalLink?: string;
    isLast?: boolean;
};

// ── All slides ────────────────────────────────────────────────
const SLIDES: Slide[] = [
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
];

function ProgressDots({ current, total, accent, onDot }: { current: number; total: number; accent: string; onDot: (i: number) => void }) {
    return (
        <div className='flex items-center gap-1.5'>
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

function SectionLabel() {
    return (
        <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: '#4cc7e8', backgroundColor: '#4cc7e818' }}>
            Instructions
        </span>
    );
}

type AffiliateOnboardingPopupProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete?: () => void;
};

export function AffiliateOnboardingPopup({ open, onOpenChange, onComplete }: AffiliateOnboardingPopupProps) {
    const [mounted, setMounted] = useState(false);
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState<'next' | 'prev'>('next');
    const [animating, setAnimating] = useState(false);
    const [inView, setInView] = useState(false);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) {
            setInView(false);
            return;
        }

        setCurrent(0);
        setAgreed(false);

        const t = setTimeout(() => {
            setInView(true);
        }, 30);

        return () => clearTimeout(t);
    }, [open]);

    if (!mounted || !open) return null;

    const close = (completed = false) => {
        setInView(false);
        setTimeout(() => {
            onOpenChange(false);

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

    const nextLabel = isLastSlide ? (agreed ? 'I Agree & Continue' : 'Agree & Continue') : 'Next';

    return (
        <>
            <div
                onClick={() => close(false)}
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
                        onClick={() => close(false)}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
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
                                    <SectionLabel />
                                </div>

                                <h2 className='text-3xl font-black text-white leading-tight mb-3'>
                                    <GradTitle />
                                </h2>
                                <div className='h-0.5 rounded-full mb-4 w-14' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                                <p className='text-gray-400 text-sm leading-relaxed mb-5 max-w-sm'>{desc}</p>

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
                                            I have read and agree to the affiliate terms.
                                        </span>
                                    </label>
                                )}
                            </div>

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
                                    Instructions
                                </p>
                                <p className='text-white/30 text-xs'>
                                    Step {current + 1} of {SLIDES.length}
                                </p>
                            </div>

                            <div className='flex flex-col gap-2 w-full mt-2'>
                                {SLIDES.map((s, i) => (
                                    <div key={s.id} className='flex items-center gap-2'>
                                        <div
                                            className='w-1.5 h-1.5 rounded-full flex-shrink-0'
                                            style={{ backgroundColor: i <= current ? accent : 'rgba(255,255,255,0.15)' }}
                                        />
                                        <span className='text-xs' style={{ color: i <= current ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}>
                                            {s.badge}
                                        </span>
                                    </div>
                                ))}
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
                            <SectionLabel />
                        </div>

                        <h2 className='text-2xl font-black text-white leading-tight mb-2'>
                            <GradTitle />
                        </h2>
                        <div className='h-0.5 rounded-full mb-3 w-10' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                        <p className='text-gray-400 text-xs leading-relaxed mb-3'>{desc}</p>

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
                                <span className='text-white/55 text-xs leading-relaxed'>I have read and agree to all the legal documents.</span>
                            </label>
                        )}
                    </div>

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
