'use client';

import { CheckCircle2, ChevronLeft, Eye, FileCheck, FileText, Globe, Globe2, Link2, Monitor, MousePointerClick, Rocket, Shield, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type SlideVariant = 'standard' | 'legal';

type Slide = {
    id: string;
    variant?: SlideVariant;
    accent: string;
    badge: string;
    title: string;
    titleGrad?: string;
    titlePlain?: string;
    gradAtEnd?: boolean;
    description?: string;
    desc?: string;
    bullets: string[];
    legalTitle?: string;
    legalSummary?: string;
    legalLink?: string;
    railLabel: string;
    Icon: any;
};

type DigitalBillboardSlideshowProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const SLIDES: Slide[] = [
    {
        id: 'digital-billboard',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Digital Billboard',
        title: 'Put Your Business in Front of Daily Traffic',
        description: 'Turn visibility into consistent attention and long-term growth with one simple digital billboard system.',
        bullets: ['Get Seen', 'Get Clicks', 'Build Your Hub', 'Expand Reach', 'Grow Presence'],
        railLabel: 'Intro',
        Icon: Eye,
    },
    {
        id: 'website-advertising',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Step 1 — Website Advertising',
        title: 'Stay Visible Where People Already Browse',
        description: 'Position your brand where people are already browsing and engaging so awareness builds continuously.',
        bullets: [
            'Place your business in front of daily traffic',
            'Increase brand visibility across high-traffic pages',
            'Stay consistently in front of potential customers',
            'Build awareness without ongoing effort',
        ],
        railLabel: 'Get Seen',
        Icon: Monitor,
    },
    {
        id: 'get-clicks',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Step 2 — Get Clicks',
        title: 'Turn Visibility Into Real Engagement',
        description: 'Convert attention into action from users who are ready to click, explore, and respond right away.',
        bullets: [
            'Turn visibility into real engagement',
            'Attract targeted users ready to take action',
            'Drive clicks directly to your offer or page',
            'Built-in share buttons expand your reach instantly',
        ],
        railLabel: 'Get Clicks',
        Icon: MousePointerClick,
    },
    {
        id: 'link-tree',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Step 3 — Link Tree',
        title: 'Build One Central Link Hub',
        description: 'Create one central place for all your links and social platforms so visitors can explore everything you offer.',
        bullets: [
            'Create your own link hub',
            'Add all your social media in one place',
            'Centralize your offers, links, and content',
            'Give visitors one place to access everything',
        ],
        railLabel: 'Link Hub',
        Icon: Link2,
    },
    {
        id: 'expand-reach',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Step 4 — Expand Reach',
        title: 'Keep Traffic Flowing Automatically',
        description: 'Drive consistent traffic to your offers, pages, and digital content while keeping your pipeline active.',
        bullets: [
            'Generate consistent daily visitor flow',
            'Support product launches and promotions',
            'Boost exposure for any business or offer',
            'Keep your pipeline full automatically',
        ],
        railLabel: 'Expand',
        Icon: Rocket,
    },
    {
        id: 'grow-presence',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Step 5 — Grow Presence',
        title: 'Build a Presence That Compounds',
        description: 'Strengthen your online presence across major platforms and turn visitors into long-term followers over time.',
        bullets: [
            'Strengthen your online brand across platforms',
            'Turn visitors into long-term followers',
            'Increase engagement across all your links',
            'Build a digital presence that compounds over time',
        ],
        railLabel: 'Presence',
        Icon: Globe2,
    },
    {
        id: 'legal-gdpr',
        variant: 'legal',
        accent: '#4cc7e8',
        Icon: Globe,
        badge: 'Legal — GDPR',
        title: 'GDPR & Privacy',
        titleGrad: 'GDPR',
        titlePlain: ' & Privacy',
        desc: 'When promoting our services you must handle any personal data in compliance with GDPR and applicable privacy laws in your jurisdiction.',
        legalTitle: 'Your Obligations',
        legalSummary:
            'Do not collect or store personal data of referred users without proper consent and a lawful basis. You may not spam or send unsolicited messages. Any data you handle must be processed in accordance with our Privacy Policy and GDPR requirements. Contact us if you have questions about compliance.',
        legalLink: '/gdpr',
        bullets: ['No unsolicited messaging or spam', 'Handle personal data with proper consent', 'Comply with GDPR in your jurisdiction'],
        railLabel: 'GDPR',
    },
    {
        id: 'legal-terms',
        variant: 'legal',
        accent: '#4cc7e8',
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
        railLabel: 'Terms',
    },
    {
        id: 'legal-privacy',
        variant: 'legal',
        accent: '#4cc7e8',
        Icon: Shield,
        badge: 'Legal — Privacy Policy',
        title: 'Privacy Policy',
        titleGrad: 'Privacy',
        titlePlain: ' Policy',
        desc: 'How we collect, use, and protect your affiliate data.',
        legalTitle: 'What We Cover',
        legalSummary:
            'We use only the data needed to operate the affiliate program, process payouts, and protect your account. Your data is never sold, and you can request access, correction, or deletion at any time.',
        legalLink: '/privacy',
        bullets: ['Data collected only to operate the program', 'Your data is never sold to third parties', 'Right to access, correct, or delete your data'],
        railLabel: 'Privacy',
    },
];

function ProgressDots({ current, total, accent, onDot }: { current: number; total: number; accent: string; onDot: (index: number) => void }) {
    return (
        <div className='flex items-center gap-3 flex-wrap'>
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
                        {slide.variant === 'legal' ? slide.legalTitle ?? 'Summary' : 'Key Highlights'}
                    </p>
                </div>

                {slide.variant === 'legal' && slide.legalLink ? (
                    <a
                        href={slide.legalLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all hover:scale-[1.02]'
                        style={{ color: accent, borderColor: `${accent}35`, backgroundColor: `${accent}12` }}
                    >
                        Review
                    </a>
                ) : null}
            </div>

            {slide.variant === 'legal' && slide.legalSummary ? <p className='text-white/60 text-xs leading-relaxed mb-3'>{slide.legalSummary}</p> : null}

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

export function DigitalBillboardSlideshow({ open, onOpenChange }: DigitalBillboardSlideshowProps) {
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

    const close = () => {
        setInView(false);
        setTimeout(() => onOpenChange(false), 350);
    };

    const goTo = (next: number, direction: 'next' | 'prev') => {
        if (animating || next < 0 || next > SLIDES.length - 1 || next === current) return;
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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!open) return;
            if (event.key === 'Escape') close();
            if (event.key === 'ArrowRight' && current < SLIDES.length - 1) handleNext();
            if (event.key === 'ArrowLeft' && current > 0) handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line
    }, [open, current, animating]);

    if (!mounted || !open) return null;

    const slide = SLIDES[current];
    const accent = slide.accent;
    const isLastSlide = current === SLIDES.length - 1;
    const rightRailSteps = SLIDES.map((item) => item.railLabel);
    const description = slide.description ?? slide.desc ?? '';

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

    const glassShine: React.CSSProperties = {
        background:
            'radial-gradient(circle at top, rgba(255,255,255,0.07) 0%, transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.055) 0%, transparent 38%, rgba(255,255,255,0.025) 100%)',
    };

    const bottomGlass: React.CSSProperties = {
        background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 100%)',
    };

    const renderTitle = () => {
        if (slide.titleGrad && slide.titlePlain) {
            if (slide.gradAtEnd) {
                return (
                    <>
                        {slide.titlePlain}
                        <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                            {slide.titleGrad}
                        </span>
                    </>
                );
            }

            return (
                <>
                    <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                        {slide.titleGrad}
                    </span>
                    {slide.titlePlain}
                </>
            );
        }

        return (
            <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                {slide.title}
            </span>
        );
    };

    return (
        <>
            <div
                onClick={close}
                className='fixed inset-0 z-[9990] bg-black/78 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                <div
                    className='pointer-events-auto hidden lg:flex w-full max-w-3xl relative rounded-3xl border-2 overflow-hidden flex-col backdrop-blur-[7px]'
                    style={{ ...modalEnter, height: 'min(575px, calc(100vh - 3rem))' }}
                >
                    <div className='absolute inset-0 pointer-events-none' style={glassShine} />
                    <div className='absolute inset-x-0 bottom-0 h-40 pointer-events-none' style={bottomGlass} />

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

                    <div className='relative z-10 flex flex-1 min-h-0'>
                        <div className='flex-1 flex flex-col justify-between px-9 pt-9 pb-7 min-w-0 min-h-0'>
                            <div className='min-h-0 flex-1 overflow-y-auto pr-2' style={slideAnim}>
                                {/* <div className='flex items-center gap-3 mb-5'>
                                    <div
                                        className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase'
                                        style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                                    >
                                        <slide.Icon className='w-3.5 h-3.5' />
                                        {slide.badge}
                                    </div>
                                    <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
                                        Slide {current + 1} of {SLIDES.length}
                                    </span>
                                </div> */}

                                <h2 className='text-3xl font-black text-white leading-tight mb-3'>{renderTitle()}</h2>
                                <div className='h-0.5 rounded-full mb-4 w-14' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                                <p className='text-gray-400 text-sm leading-relaxed mb-5 max-w-lg'>{description}</p>

                                <InfoPanel slide={slide} accent={accent} />
                            </div>

                            <div className='flex items-center gap-3 mt-8 pt-4 border-t border-white/10'>
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
                                    </button>
                                    {/* <span className='text-xs text-white/25'>
                                        {current + 1}/{SLIDES.length}
                                    </span> */}
                                </div>
                            </div>
                        </div>

                        <div
                            className='w-[1px] self-stretch my-8'
                            style={{ background: `linear-gradient(to bottom, transparent, ${accent}30, transparent)` }}
                        />

                        <div className='w-[220px] flex-shrink-0 flex flex-col items-center justify-center gap-4 p-6 min-h-0' style={slideAnim}>
                            <div
                                className='w-24 h-24 rounded-2xl flex items-center justify-center'
                                style={{ backgroundColor: `${accent}18`, border: `2px solid ${accent}30`, boxShadow: `0 0 40px ${accent}20` }}
                            >
                                <slide.Icon className='w-12 h-12' style={{ color: accent }} />
                            </div>

                            <div className='text-center'>
                                <p className='text-xs font-semibold mb-1' style={{ color: accent }}>
                                    Digital Billboard Flow
                                </p>
                                <p className='text-white/30 text-xs'>
                                    Slide {current + 1} of {SLIDES.length}
                                </p>
                            </div>

                            <div className='flex flex-col gap-2 w-full mt-2 overflow-y-auto pr-1'>
                                {rightRailSteps.map((step, index) => {
                                    const active = index <= current;

                                    return (
                                        <div key={`${step}-${index}`} className='flex items-center gap-2'>
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
                    className='pointer-events-auto flex lg:hidden w-full max-w-sm relative rounded-3xl border-2 overflow-hidden flex-col backdrop-blur-[7px]'
                    style={{ ...modalEnter, height: 'min(475px, calc(100vh - 2rem))' }}
                >
                    <div className='absolute inset-0 pointer-events-none' style={glassShine} />
                    <div className='absolute inset-x-0 bottom-0 h-40 pointer-events-none' style={bottomGlass} />

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
                        {/* <div className='flex items-center gap-2 flex-wrap mb-4'>
                            <div
                                className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase'
                                style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                            >
                                <slide.Icon className='w-3 h-3' />
                                {slide.badge}
                            </div>
                            <span className='text-xs font-semibold px-2 py-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
                                {current + 1}/{SLIDES.length}
                            </span>
                        </div> */}

                        <h2 className='text-2xl font-black text-white leading-tight mb-2'>{renderTitle()}</h2>
                        <div className='h-0.5 rounded-full mb-3 w-10' style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                        <p className='text-gray-400 text-xs leading-relaxed mb-4'>{description}</p>

                        <div className='rounded-xl p-3 mb-3 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                            <div className='flex items-center justify-between gap-2 mb-2'>
                                <div className='flex items-center gap-2'>
                                    <FileCheck className='w-3.5 h-3.5' style={{ color: accent }} />
                                    <p className='text-xs font-bold uppercase' style={{ color: accent }}>
                                        {slide.variant === 'legal' ? slide.legalTitle ?? 'Summary' : 'Key Highlights'}
                                    </p>
                                </div>

                                {slide.variant === 'legal' && slide.legalLink ? (
                                    <a
                                        href={slide.legalLink}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-[10px] font-semibold px-2 py-1 rounded-full border'
                                        style={{ color: accent, borderColor: `${accent}35`, backgroundColor: `${accent}12` }}
                                    >
                                        Review
                                    </a>
                                ) : null}
                            </div>

                            {slide.variant === 'legal' && slide.legalSummary ? (
                                <p className='text-white/60 text-[11px] leading-relaxed mb-2.5'>{slide.legalSummary}</p>
                            ) : null}

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

                    <div className='relative z-10 px-6 pb-5'>
                        <div className='flex justify-end w-full mb-2'>
                            <span className='text-sm font-semibold px-2 py-0.5 mr-0.5 rounded-md' style={{ color: accent, backgroundColor: `${accent}18` }}>
                                Slide {current + 1}/{SLIDES.length}
                            </span>
                        </div>
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
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DigitalBillboardSlideshow;
