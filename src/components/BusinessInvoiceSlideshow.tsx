'use client';

import { CheckCircle2, ChevronLeft, CreditCard, FileCheck, FileSignature, Receipt, Send, Upload, Wallet, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type SlideVariant = 'standard' | 'legal';

type Slide = {
    id: string;
    variant?: SlideVariant;
    cover?: boolean;
    accent: string;
    badge: string;
    title: string;
    titleGrad?: string;
    titlePlain?: string;
    gradAtEnd?: boolean;
    description?: string;
    desc?: string;
    bullets: string[];
    Icon: any;
    legalTitle?: string;
    legalSummary?: string;
    legalLink?: string;
};

type BusinessInvoiceSlideshowProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const SLIDES: Slide[] = [
    {
        id: 'business-invoice',
        variant: 'standard',
        cover: true,
        accent: '#4cc7e8',
        badge: 'Business Invoice',
        title: 'Business Invoice',
        description: '',
        bullets: [],
        Icon: Wallet,
    },
    {
        id: 'upload-contracts',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Upload Contracts',
        title: 'UPLOAD CONTRACTS',
        description:
            'Quickly upload contracts and keep everything organized in one place. Access your documents anytime while keeping everything secure and structured.',
        bullets: [
            'Upload agreements in seconds',
            'Store all client contracts in one place',
            'Secure and organized document management',
            'Access anytime from any device',
        ],
        Icon: Upload,
    },
    {
        id: 'send-contracts',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Send Contracts',
        title: 'SEND CONTRACTS',
        description: 'Send contracts instantly without printing or manual work involved. Track when clients receive and open documents for faster responses.',
        bullets: [
            'Send contracts instantly via email or link',
            'No printing or manual paperwork needed',
            'Track when clients receive and open',
            'Streamlined delivery for faster action',
        ],
        Icon: Send,
    },
    {
        id: 'get-signatures',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Get Signatures',
        title: 'GET SIGNATURES',
        description: 'Allow clients to sign contracts digitally from any device quickly. Remove delays and close agreements faster with instant approvals.',
        bullets: [
            'Collect legally binding e-signatures',
            'Clients sign from phone or desktop',
            'Eliminate delays and back-and-forth',
            'Close deals faster with instant approvals',
        ],
        Icon: FileSignature,
    },
    {
        id: 'send-invoices',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Send Invoices',
        title: 'SEND INVOICES',
        description: 'Create and send invoices immediately after agreements are completed. Keep billing simple, clear, and professional every single time.',
        bullets: [
            'Create professional invoices in seconds',
            'Customize pricing, services, and details',
            'Send immediately after contract signing',
            'Keep billing simple and consistent',
        ],
        Icon: Receipt,
    },
    {
        id: 'subscription-invoices',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Subscription Invoices',
        title: 'SUBSCRIPTION INVOICES',
        description: 'Automate recurring invoices and keep subscription billing organized every month. Send clean professional recurring invoices.',
        bullets: [
            'Create recurring subscription invoices in seconds',
            'Automate monthly or annual billing cycles',
            'Customize pricing, plans, and payment details',
            'Send invoices automatically on schedule',
            'Keep subscription billing simple and consistent',
        ],
        Icon: FileCheck,
    },
    {
        id: 'get-paid',
        variant: 'standard',
        accent: '#4cc7e8',
        badge: 'Get Paid',
        title: 'GET PAID',
        description:
            'Receive payments faster with a smooth and reliable payment process. Turn completed work into income without unnecessary delays or friction.',
        bullets: [
            'Accept payments quickly and securely',
            'Reduce delays with instant billing',
            'Track paid and unpaid invoices easily',
            'Turn completed work into revenue faster',
        ],
        Icon: CreditCard,
    },
];

function ProgressDots({ current, total, accent, onDot }: { current: number; total: number; accent: string; onDot: (index: number) => void }) {
    return (
        <div className='flex items-center gap-1.5 sm:gap-2'>
            {Array.from({ length: total }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onDot(index)}
                    className='rounded-full transition-all duration-300'
                    style={{
                        width: index === current ? 18 : 5,
                        height: 5,
                        backgroundColor: index === current ? accent : index < current ? `${accent}55` : 'rgba(255,255,255,0.12)',
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
    );
}

export function BusinessInvoiceSlideshow({ open, onOpenChange }: BusinessInvoiceSlideshowProps) {
    const [mounted, setMounted] = useState(false);
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState<'next' | 'prev'>('next');
    const [animating, setAnimating] = useState(false);
    const [inView, setInView] = useState(false);

    const slide = SLIDES[current];
    const { accent, title, description, desc, bullets, variant, legalTitle, legalSummary, legalLink, titleGrad, titlePlain, gradAtEnd, cover } = slide;
    const isLastSlide = current === SLIDES.length - 1;
    const slideDescription = description ?? desc ?? '';

    const close = () => {
        setInView(false);
        setTimeout(() => onOpenChange(false), 350);
    };

    const goTo = (next: number, direction: 'next' | 'prev') => {
        if (animating || next < 0 || next > SLIDES.length - 1) return;
        setDir(direction);
        setAnimating(true);
        setTimeout(() => {
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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!open) return;
            if (event.key === 'Escape') close();
            if (event.key === 'ArrowRight' && current < SLIDES.length - 1) handleNext();
            if (event.key === 'ArrowLeft' && current > 0) handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    if (!mounted || !open) return null;

    const slideAnim: React.CSSProperties = {
        transition: 'opacity 0.26s ease, transform 0.26s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '-20px' : '20px'})` : 'translateX(0)',
    };

    const scrollAreaStyle = {
        ...slideAnim,
        '--glass-scrollbar-thumb': 'rgba(10, 12, 18, 0.82)',
        '--glass-scrollbar-thumb-strong': 'rgba(0, 0, 0, 0.94)',
        '--glass-scrollbar-glow': 'rgba(0, 0, 0, 0.28)',
        scrollbarColor: 'rgba(10, 12, 18, 0.82) rgba(255,255,255,0.06)',
        scrollbarWidth: 'thin',
    } as React.CSSProperties;

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
        if (titleGrad && titlePlain) {
            if (gradAtEnd) {
                return (
                    <>
                        {titlePlain}
                        <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                            {titleGrad}
                        </span>
                    </>
                );
            }

            return (
                <>
                    <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                        {titleGrad}
                    </span>
                    {titlePlain}
                </>
            );
        }

        return (
            <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #2c7bbe)` }}>
                {title}
            </span>
        );
    };

    return (
        <>
            <style>{`

                @media (max-width: 639px) {
                    .glass-slideshow-modal {
                        height: min(400px, calc(100vh - 2rem)) !important;
                    }
                }

                .glass-slideshow-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: var(--glass-scrollbar-thumb) rgba(255, 255, 255, 0.06);
                }

                .glass-slideshow-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .glass-slideshow-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.045);
                    border-radius: 999px;
                    margin: 14px 0;
                }

                .glass-slideshow-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, var(--glass-scrollbar-thumb-strong), var(--glass-scrollbar-thumb));
                    border: 2px solid rgba(7, 9, 13, 0.42);
                    border-radius: 999px;
                    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16), 0 0 10px var(--glass-scrollbar-glow);
                }

                .glass-slideshow-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, rgba(0, 0, 0, 0.98), rgba(42, 45, 55, 0.88));
                }
            `}</style>
            <div
                onClick={close}
                className='fixed inset-0 z-[9990] bg-black/78 backdrop-blur-sm'
                style={{ transition: 'opacity 0.35s ease', opacity: inView ? 1 : 0 }}
            />

            <div className='fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none'>
                <div
                    className='glass-slideshow-modal pointer-events-auto flex w-full max-w-sm lg:max-w-2xl relative rounded-3xl border-2 overflow-hidden flex-col backdrop-blur-[7px]'
                    style={{ ...modalEnter, height: 'min(455px, calc(100vh - 2rem))' }}
                >
                    <div className='absolute inset-0 pointer-events-none' style={glassShine} />
                    <div className='absolute inset-x-0 bottom-0 h-40 pointer-events-none' style={bottomGlass} />

                    <div
                        className='absolute top-0 left-0 right-0 h-[2px] z-10'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />
                    <div
                        className='absolute top-0 left-0 right-0 h-44 lg:h-60 pointer-events-none'
                        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}14 0%, transparent 70%)` }}
                    />

                    <button
                        onClick={close}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                        aria-label='Close slideshow'
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='relative z-10 flex flex-col flex-1 min-h-0'>
                        <div
                            className='glass-slideshow-scrollbar px-6 lg:px-9 pt-7 lg:pt-8 pb-3 min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]'
                            style={scrollAreaStyle}
                        >
                            {cover ? (
                                <div className='min-h-full flex items-center justify-center py-16'>
                                    <div className='relative text-center px-4'>
                                        <div
                                            className='absolute -inset-12 rounded-full blur-3xl opacity-40 pointer-events-none'
                                            style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 65%)` }}
                                        />
                                        <h1 className='relative whitespace-nowrap tracking-tight text-[clamp(2rem,7vw,3rem)] lg:text-6xl font-black leading-tight'>
                                            {renderTitle()}
                                        </h1>
                                        <div
                                            className='relative mx-auto mt-5 h-0.5 w-24 rounded-full'
                                            style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className='whitespace-nowrap tracking-tight text-[clamp(0.95rem,3.8vw,1.15rem)] lg:text-3xl font-black text-white leading-tight mb-2 lg:mb-3'>
                                        {renderTitle()}
                                    </h2>
                                    <div
                                        className='h-0.5 rounded-full mb-3 lg:mb-4 w-10 lg:w-14'
                                        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
                                    />

                                    {slideDescription && (
                                        <p className='text-gray-400 text-xs lg:text-sm leading-relaxed mb-3 lg:mb-5 max-w-lg'>{slideDescription}</p>
                                    )}

                                    <div
                                        className='rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-3 lg:mb-5 border'
                                        style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}
                                    >
                                        <div className='flex items-center justify-between gap-2 lg:gap-3 mb-2 lg:mb-3'>
                                            <div className='flex items-center gap-2'>
                                                <FileCheck className='w-3.5 h-3.5 lg:w-4 lg:h-4' style={{ color: accent }} />
                                                <p className='text-xs font-bold uppercase tracking-wide' style={{ color: accent }}>
                                                    {variant === 'legal' ? legalTitle ?? 'Summary' : 'Key Highlights'}
                                                </p>
                                            </div>

                                            {variant === 'legal' && legalLink && (
                                                <a
                                                    href={legalLink}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-[10px] lg:text-[11px] font-semibold px-2 lg:px-2.5 py-1 rounded-full border transition-all hover:scale-[1.02]'
                                                    style={{ color: accent, borderColor: `${accent}35`, backgroundColor: `${accent}12` }}
                                                >
                                                    Review
                                                </a>
                                            )}
                                        </div>

                                        {variant === 'legal' && legalSummary && (
                                            <p className='text-white/60 text-[11px] lg:text-xs leading-relaxed mb-2.5 lg:mb-3'>{legalSummary}</p>
                                        )}

                                        <ul className='space-y-1.5 lg:space-y-2.5'>
                                            {bullets.map((bullet, index) => (
                                                <li key={index} className='flex items-start gap-2 lg:gap-2.5'>
                                                    <CheckCircle2
                                                        className='w-3.5 h-3.5 lg:w-4 lg:h-4 mt-0.5 flex-shrink-0'
                                                        style={{ color: accent }}
                                                        strokeWidth={2.5}
                                                    />
                                                    <span className='text-white/65 lg:text-white/70 text-xs lg:text-sm leading-snug'>{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className='relative z-10 px-6 lg:px-9 pb-4 lg:pb-5 pt-2'>
                            <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:gap-3'>
                                <div className='justify-self-start'>
                                    <ProgressDots
                                        current={current}
                                        total={SLIDES.length}
                                        accent={accent}
                                        onDot={(i) => goTo(i, i > current ? 'next' : 'prev')}
                                    />
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

export default BusinessInvoiceSlideshow;
