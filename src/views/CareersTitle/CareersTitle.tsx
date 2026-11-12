'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import lottie from 'lottie-web';
import {
    Award,
    Briefcase,
    Building2,
    CalendarDays,
    CheckCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Globe,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Shield,
    Star,
    Target,
    User,
    UserCheck,
    Users,
    X,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react';

type LottieAnimationProps = {
    src: string;
    loop: boolean;
    autoplay: boolean;
    style?: CSSProperties;
};

type TalentTab = 'us' | 'global';

type ConsultationFormState = {
    companyName: string;
    location: string;
    jobTitle: string;
    fullName: string;
    email: string;
    phone: string;
    numOfPositions: string;
    dateTime: string;
    termsAccepted: boolean;
};

const talentTabs: Array<{ key: TalentTab; label: string }> = [
    { key: 'us', label: 'U.S. Talent Acquisition' },
    { key: 'global', label: 'Global Workforce (BPO)' },
];

const talentServiceContent: Record<
    TalentTab,
    {
        eyebrow: string;
        headline: string;
        sections: Array<{ title: string; body: string }>;
        keyPoints: string[];
        pricingTitle: string;
        pricing: string[];
        buttonLabel: string;
    }
> = {
    us: {
        eyebrow: 'U.S. Talent Acquisition',
        headline: 'Hire Top U.S. Talent — Built for Performance',
        sections: [
            {
                title: 'Full-Cycle Recruitment',
                body: 'We source, conduct background checks, and place high-performance professionals across sales, operations, and technical roles. Our streamlined hiring system eliminates delays and ensures every candidate is aligned with your business goals from day one.',
            },
            {
                title: 'Client Relationship Focus',
                body: 'We operate as a direct extension of your team—providing clear communication, fast updates, and a consistent hiring experience built on transparency, responsiveness, and long-term partnership.',
            },
        ],
        keyPoints: [
            'Pre-vetted, high-quality candidates',
            'Faster time-to-hire',
            'Role-specific recruiting',
            'Performance-aligned placements',
            'Flexible hiring',
            'Background checks included',
        ],
        pricingTitle: 'Consultation Fee:',
        pricing: ['$249.99'],
        buttonLabel: 'Schedule Consultation',
    },
    global: {
        eyebrow: 'Global Workforce (BPO)',
        headline: 'Scale Globally — Employee Outsourcing and Payroll',
        sections: [
            {
                title: 'International Outsourcing',
                body: 'Access a global workforce of qualified professionals across customer support, admin, lead generation, and back-office roles. We source and connect you with talent internationally, giving you flexibility and cost efficiency at scale.',
            },
            {
                title: 'Payroll Compliance',
                body: 'We handle international payroll, contracts, and compliance—ensuring your global hires are paid correctly and legally, without the complexity of managing cross-border regulations.',
            },
        ],
        keyPoints: ['Workforce outsourcing', 'International candidate sourcing', 'Payroll & compliance handled', 'Flexible team structures', 'Fast onboarding'],
        pricingTitle: 'Consultation Fee:',
        pricing: ['$249.99'],
        buttonLabel: 'Schedule Consultation',
    },
};

const initialConsultationForm: ConsultationFormState = {
    companyName: '',
    location: '',
    jobTitle: '',
    fullName: '',
    email: '',
    phone: '',
    numOfPositions: '',
    dateTime: '',
    termsAccepted: false,
};

const UNIFIED_CARD_HEIGHT = 580;

type TermsSlide = {
    id: string;
    accent: string;
    Icon: LucideIcon;
    badge: string;
    titleGrad: string;
    titlePlain: string;
    gradAtEnd?: boolean;
    summary: string;
    link: string;
    bullets: string[];
};

const TERMS_SLIDES: TermsSlide[] = [
    {
        id: 'terms',
        accent: '#4333AF',
        Icon: FileText,
        badge: 'Terms & Conditions',
        titleGrad: 'Terms',
        titlePlain: ' & Conditions',
        summary:
            'By using our platform you agree to our Terms & Conditions. These outline your rights and responsibilities, acceptable use policies, intellectual property rules, and procedures for resolving disputes. We reserve the right to update these terms with reasonable notice.',
        link: '/terms',
        bullets: ['Governs platform and tool usage', 'Outlines acceptable use and IP policies', 'Dispute resolution procedures included'],
    },
    {
        id: 'privacy',
        accent: '#4333AF',
        Icon: Shield,
        badge: 'Privacy Policy',
        titleGrad: 'Privacy',
        titlePlain: ' Policy',
        summary:
            'We collect only the data necessary to operate the platform and process payments. Your data is never sold to third parties. You have the right to access, correct, or delete your personal data at any time. All data is stored securely in compliance with applicable privacy laws.',
        link: '/privacy',
        bullets: ['Data collected only to operate the service', 'Your data is never sold to third parties', 'Right to access, correct, or delete your data'],
    },
];

function TermsSlideModal({ open, onOpenChange, onComplete }: { open: boolean; onOpenChange: (value: boolean) => void; onComplete: () => void }) {
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState<'next' | 'prev'>('next');
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            setCurrent(0);
            setDir('next');
            setAnimating(false);
        }
    }, [open]);

    const goTo = (next: number, direction: 'next' | 'prev') => {
        if (animating) return;

        setDir(direction);
        setAnimating(true);

        window.setTimeout(() => {
            setCurrent(next);
            setAnimating(false);
        }, 220);
    };

    const handleNext = () => {
        if (animating) return;

        if (current < TERMS_SLIDES.length - 1) {
            goTo(current + 1, 'next');
            return;
        }

        onComplete();
        onOpenChange(false);
    };

    const handlePrev = () => {
        if (animating || current === 0) return;
        goTo(current - 1, 'prev');
    };

    const slide = TERMS_SLIDES[current];
    const { accent, badge, titleGrad, titlePlain, gradAtEnd, summary, link, bullets } = slide;
    const isLast = current === TERMS_SLIDES.length - 1;

    const slideAnim: CSSProperties = {
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '-18px' : '18px'})` : 'translateX(0)',
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[540px] p-0 border-0 bg-transparent shadow-none [&>button]:hidden'>
                <DialogTitle className='sr-only'>{badge}</DialogTitle>

                <div
                    className='relative rounded-[32px] border overflow-hidden flex flex-col bg-[#0C0F18]'
                    style={{
                        minHeight: UNIFIED_CARD_HEIGHT,
                        height: UNIFIED_CARD_HEIGHT,
                        borderColor: `${accent}35`,
                        boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 40px ${accent}10`,
                    }}
                >
                    <div className='absolute inset-0 pointer-events-none' style={{ backgroundColor: 'transparent' }} />

                    <button
                        type='button'
                        onClick={() => onOpenChange(false)}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                        aria-label='Close terms modal'
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='relative z-10 flex flex-1 flex-col px-7 pt-8 pb-6' style={slideAnim}>
                        {/* <div
                            className='inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase mb-5'
                            style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                        >
                            <Icon className='w-3.5 h-3.5' />
                            {badge}
                        </div> */}

                        <h2 className='text-[28px] font-black text-white leading-[1.24] mb-3'>
                            {gradAtEnd ? (
                                <>
                                    {titlePlain}
                                    <span className='text-[#4333AF] ' style={{ color: '#4333AF' }}>
                                        {titleGrad}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className='text-[#4333AF] ' style={{ color: '#4333AF' }}>
                                        {titleGrad}
                                    </span>
                                    {titlePlain}
                                </>
                            )}
                        </h2>

                        <div className='h-px rounded-full mb-5 w-full bg-white/10' />

                        <div className='rounded-2xl p-4 mb-5 border' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                            <p className='text-[11px] font-bold uppercase tracking-[0.18em] mb-2' style={{ color: accent }}>
                                Summary
                            </p>

                            <p className='text-white/65 text-sm leading-relaxed'>{summary}</p>

                            <a
                                href={link}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-1 mt-3 text-xs font-semibold hover:underline'
                                style={{ color: accent }}
                            >
                                Read full document →
                            </a>
                        </div>

                        <div className='flex-1'>
                            <ul className='space-y-3'>
                                {bullets.map((bullet, index) => (
                                    <li key={`${slide.id}-${index}`} className='flex items-start gap-2.5'>
                                        <CheckCircle className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                        <span className='text-white/72 text-sm leading-snug'>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className='pt-6 flex items-center justify-between'>
                            <div className='flex items-center gap-1.5'>
                                {TERMS_SLIDES.map((_, index) => (
                                    <div
                                        key={index}
                                        className='rounded-full transition-all duration-300'
                                        style={{
                                            width: index === current ? 20 : 6,
                                            height: 6,
                                            backgroundColor: index === current ? accent : index < current ? `${accent}55` : 'rgba(255,255,255,0.12)',
                                        }}
                                    />
                                ))}
                            </div>
                            <div>
                                <span
                                    className='rounded-xl px-3 py-1 text-xs font-bold text-white/70'
                                    style={{ backgroundColor: `${accent}14`, border: `1px solid ${accent}35` }}
                                >
                                    Slide{current + 1}/{TERMS_SLIDES.length}
                                </span>
                            </div>

                            <div className='flex items-center gap-2'>
                                <button
                                    type='button'
                                    onClick={handlePrev}
                                    disabled={current === 0}
                                    className='w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105'
                                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    aria-label='Previous terms slide'
                                >
                                    <ChevronLeft className='w-4 h-4 text-white' />
                                </button>

                                <button
                                    type='button'
                                    onClick={handleNext}
                                    className='h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-white transition-all hover:scale-105'
                                    style={{
                                        backgroundColor: accent,
                                        border: `1px solid ${accent}60`,
                                        boxShadow: `0 2px 12px ${accent}30`,
                                    }}
                                >
                                    {isLast ? 'I Understand ✓' : 'Next'}
                                    {!isLast && <ChevronRight className='w-3.5 h-3.5' />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function LottieAnimation({ src, loop, autoplay, style }: LottieAnimationProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return undefined;

        const animation = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay,
            path: src,
        });

        return () => animation.destroy();
    }, [src, loop, autoplay]);

    return <div ref={containerRef} style={style} />;
}

function CareersTitle() {
    const [activeTalentTab, setActiveTalentTab] = useState<TalentTab>('us');
    const [consultationForm, setConsultationForm] = useState<ConsultationFormState>(initialConsultationForm);
    const [consultationErrors, setConsultationErrors] = useState<Record<string, string>>({});
    const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false);
    const [consultationMessage, setConsultationMessage] = useState<string | null>(null);
    const [consultationSuccess, setConsultationSuccess] = useState<string | null>(null);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

    const activeTalentService = talentServiceContent[activeTalentTab];

    const openConsultationModal = () => {
        setConsultationErrors({});
        setConsultationMessage(null);
        setConsultationSuccess(null);
        setIsConsultationModalOpen(true);
    };

    const clearFieldError = (fieldName: string) => {
        setConsultationErrors((currentErrors) => {
            if (!currentErrors[fieldName]) return currentErrors;

            const nextErrors = { ...currentErrors };
            delete nextErrors[fieldName];
            return nextErrors;
        });
    };

    const handleConsultationChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        setConsultationForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
        clearFieldError(name);
        setConsultationMessage(null);
        setConsultationSuccess(null);
    };

    const handleConsultationCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;

        if (name === 'termsAccepted' && checked) {
            setIsTermsModalOpen(true);
            return;
        }

        setConsultationForm((currentForm) => ({
            ...currentForm,
            [name]: checked,
        }));
        clearFieldError(name);
        setConsultationMessage(null);
        setConsultationSuccess(null);
    };

    const handleTermsComplete = () => {
        setConsultationForm((currentForm) => ({
            ...currentForm,
            termsAccepted: true,
        }));
        clearFieldError('termsAccepted');
        setConsultationMessage(null);
        setConsultationSuccess(null);
    };

    const validateConsultationForm = () => {
        const nextErrors: Record<string, string> = {};
        const positionsCount = Number(consultationForm.numOfPositions);
        const selectedDate = new Date(consultationForm.dateTime);

        if (!consultationForm.companyName.trim()) nextErrors.companyName = 'Company name is required.';
        if (!consultationForm.location.trim()) nextErrors.location = 'Location is required.';
        if (!consultationForm.jobTitle.trim()) nextErrors.jobTitle = 'Job title is required.';
        if (!consultationForm.fullName.trim()) nextErrors.fullName = 'Full name is required.';
        if (!consultationForm.email.trim()) nextErrors.email = 'Work email is required.';
        if (!consultationForm.phone.trim()) nextErrors.phone = 'Phone number is required.';
        if (!consultationForm.numOfPositions || Number.isNaN(positionsCount) || positionsCount < 1) {
            nextErrors.numOfPositions = 'Number of positions is required.';
        }
        if (!consultationForm.dateTime || Number.isNaN(selectedDate.getTime())) nextErrors.dateTime = 'Date and time are required.';
        if (!consultationForm.termsAccepted) nextErrors.termsAccepted = 'Please review and accept the Terms and Conditions.';

        setConsultationErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleScheduleConsultation = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setConsultationMessage(null);
        setConsultationSuccess(null);

        if (!validateConsultationForm()) {
            setConsultationMessage('Please fill all fields and accept the Terms and Conditions.');
            return;
        }

        setIsSubmittingConsultation(true);

        try {
            const response = await fetch('http://localhost:3000/api/v5/consultation/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    fullName: consultationForm.fullName.trim(),
                    companyName: consultationForm.companyName.trim(),
                    location: consultationForm.location.trim(),
                    jobTitle: consultationForm.jobTitle.trim(),
                    email: consultationForm.email.trim(),
                    phone: consultationForm.phone.trim(),
                    numOfPositions: Number(consultationForm.numOfPositions),
                    dateTime: new Date(consultationForm.dateTime).toISOString(),
                }),
            });

            const result: any = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(result?.message || 'Unable to create checkout session. Please try again.');
            }

            const checkoutUrl =
                result?.checkout?.url ||
                result?.url ||
                result?.checkoutUrl ||
                result?.sessionUrl ||
                result?.data?.checkout?.url ||
                result?.data?.url ||
                result?.data?.checkoutUrl ||
                result?.data?.sessionUrl ||
                result?.session?.url;

            if (!checkoutUrl) {
                throw new Error('Checkout session was created, but no checkout URL was returned.');
            }

            setConsultationSuccess(result?.message || 'Checkout session created. Redirecting...');
            window.location.href = checkoutUrl;
            return;
        } catch (error) {
            setConsultationMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmittingConsultation(false);
        }
    };

    return (
        <div className='relative isolate min-h-screen overflow-hidden bg-[#050608] text-white'>
            {/* Solid page background using the Black Snow surface hierarchy. */}

            <TermsSlideModal open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen} onComplete={handleTermsComplete} />
            {/* Job Seekers Section */}
            <section className='relative z-10 py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        <div className='animate-slide-in-left'>
                            <div>
                                {/* ✅ wrapper makes width = heading text width */}
                                <div className='inline-block'>
                                    <h2 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-white mb-4 sm:mb-5'>
                                        Careers
                                    </h2>
                                </div>
                            </div>

                            <div className='space-y-4 sm:space-y-5 mb-8 sm:mb-10'>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Join us in reshaping the future for employee job search across all 50 States in the United States. Black Snow is committed
                                    to helping you find employment through a series of job posts across many different markets.
                                </p>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Our Recruiters work diligently to match your experience and credentials to jobs in{' '}
                                    <span className='text-[#4333AF] font-semibold'>Sales, Finance, Trucking, Warehouse, Medicine</span>,{' '}
                                    <span className='text-[#4333AF] font-semibold'>Dental, Nursing, Pharmacy, Web Development</span>,{' '}
                                    <span className='text-[#4333AF] font-semibold'>A.I., Retail</span> and much more.
                                </p>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    We are a growing global organization prioritizing{' '}
                                    <span className='text-[#4333AF] font-semibold'>Full-time remote careers</span> with our company and job opportunities with
                                    our contracted customers.
                                </p>
                            </div>

                            <div className='hidden lg:flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2'>
                                <Link href={'/careeroptions'}>
                                    <Button
                                        size='lg'
                                        className='group bg-[#4333AF] hover:bg-[#38299B] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-[0_4px_14px_rgba(67,51,175,0.16)] transition-all cursor-pointer duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    >
                                        See Career Opportunities
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className='relative animate-slide-in-right'>
                            <div className='bg-[#0C0F18] rounded-3xl p-10 border border-[#414A5D] shadow-xl shadow-black/30 backdrop-blur-2xl'>
                                <h3 className='text-2xl font-bold text-white mb-8 flex items-center leading-[1.28]'>
                                    <Globe className='w-8 h-8 text-[#4333AF] mr-3' />
                                    Global Opportunities
                                </h3>

                                <div className='grid grid-cols-2 gap-6 mb-8'>
                                    <div className='text-center'>
                                        <div className='text-4xl font-black text-[#4333AF] mb-2'>50+</div>
                                        <div className='text-gray-400 font-semibold'>States Covered</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-4xl font-black text-[#4333AF] mb-2'>15+</div>
                                        <div className='text-gray-400 font-semibold'>Industries</div>
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    {[
                                        { icon: CheckCircle, text: 'Remote-First Opportunities', color: 'text-[#4333AF]' },
                                        { icon: Star, text: 'Competitive Compensation', color: 'text-[#4333AF]' },
                                        { icon: Award, text: 'Career Growth Programs', color: 'text-[#4333AF]' },
                                        { icon: Users, text: 'Global Team Collaboration', color: 'text-[#4333AF]' },
                                    ].map((item, index) => (
                                        <div key={index} className='flex items-center space-x-3 p-3 rounded-xl bg-black border border-[#414A5D]'>
                                            <item.icon className={`w-5 h-5 ${item.color}`} />
                                            <span className='text-gray-300 font-medium'>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='flex mt-7 lg:hidden flex-col sm:flex-row gap-4 sm:gap-5 pt-2'>
                                <Link href={'/careeroptions'}>
                                    <Button
                                        size='lg'
                                        className='group bg-[#4333AF] hover:bg-[#38299B] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-[0_4px_14px_rgba(67,51,175,0.16)] transition-all cursor-pointer duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    >
                                        See Career Opportunities
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recruitment Agency Section */}
            <section className='relative z-10 py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        <div className='animate-slide-in-right'>
                            <div>
                                {/* ✅ wrapper makes width = heading text width */}
                                <div className='inline-block'>
                                    <h2 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                        <span className=' text-[#4333AF] '>Recruitment Agency</span>
                                        <br className='sm:block hidden' />
                                        &nbsp;Inquiry
                                    </h2>
                                </div>
                            </div>

                            <div className='space-y-4 sm:space-y-5  mb-8 sm:mb-10'>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    We take pride in helping you find the best candidates nationwide and around the world. Let us assist you in talent discovery
                                    as well as finding candidates that match your company criteria, work experience, and credentials.
                                </p>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Whether you are a <span className='text-[#4333AF] font-semibold'>small business or corporation</span> we provide quality
                                    candidates with a complimentary <span className='text-[#4333AF] font-semibold'>30-day guarantee</span>.
                                </p>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Our industry-leading team of <span className='text-[#4333AF] font-semibold'>global HR experts</span> can help you enter new
                                    markets in minutes, search for candidates, and hire international employees all while maintaining full compliance. Take
                                    advantage of some of the competitive rates that we have to offer today.
                                </p>
                            </div>
                            <div className='hidden lg:flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2'>
                                <Link href={'/recruitmentagency'}>
                                    <Button
                                        size='lg'
                                        className='group cursor-pointer bg-[#4333AF] hover:bg-[#38299B] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-[0_4px_14px_rgba(67,51,175,0.16)] transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    >
                                        See Opportunities
                                    </Button>
                                </Link>
                                <Link href={'/consultation'}>
                                    <Button
                                        size='lg'
                                        className='group cursor-pointer bg-[#4333AF] hover:bg-[#38299B] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-[0_4px_14px_rgba(67,51,175,0.16)] transition-all duration-300 transform hover:scale-105 w-full sm:w-auto'
                                    >
                                        Consultation
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className='relative animate-slide-in-left'>
                            <div className='bg-[#0C0F18] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-[#414A5D] shadow-2xl shadow-black/30 backdrop-blur-2xl'>
                                <h3 className='text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 flex items-center leading-[1.28]'>
                                    <Target className='w-6 h-6 sm:w-8 sm:h-8 text-[#4333AF] mr-3' />
                                    Recruitment Excellence
                                </h3>

                                <div className='grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8'>
                                    <div className='text-center'>
                                        <div className='text-3xl sm:text-4xl font-black text-[#4333AF] mb-2'>30</div>
                                        <div className='text-sm sm:text-base text-gray-400 font-semibold'>Day Guarantee</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-3xl sm:text-4xl font-black text-[#4333AF] mb-2'>24/7</div>
                                        <div className='text-sm sm:text-base text-gray-400 font-semibold'>Global Support</div>
                                    </div>
                                </div>

                                <div className='space-y-3 sm:space-y-4'>
                                    {[
                                        { icon: UserCheck, text: 'Quality Candidate Matching', color: 'text-[#4333AF]' },
                                        { icon: Zap, text: 'Rapid Market Entry', color: 'text-[#4333AF]' },
                                        { icon: Globe, text: 'International Hiring', color: 'text-[#4333AF]' },
                                        { icon: Award, text: 'Full Compliance Support', color: 'text-[#4333AF]' },
                                    ].map((item, index) => (
                                        <div key={index} className='flex items-center space-x-3 p-3 rounded-xl bg-black border border-[#414A5D]'>
                                            <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                                            <span className='text-sm sm:text-base text-gray-300 font-medium'>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='lg:hidden mt-7 flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2'>
                                <Link href={'/recruitmentagency'}>
                                    <Button
                                        size='lg'
                                        className='group cursor-pointer bg-[#4333AF] hover:bg-[#38299B] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-[0_4px_14px_rgba(67,51,175,0.16)] transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    >
                                        See Opportunities
                                    </Button>
                                </Link>
                                <Link href={'/consultation'}>
                                    <Button
                                        size='lg'
                                        className='group cursor-pointer bg-[#4333AF] hover:bg-[#38299B] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-[0_4px_14px_rgba(67,51,175,0.16)] transition-all duration-300 transform hover:scale-105 w-full sm:w-auto'
                                    >
                                        Consultation
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Talent Acquisition / BPO Section */}
            <section className='relative z-10 py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='rounded-[2rem] border border-[#414A5D] bg-[#0C0F18] p-4 sm:p-6 md:p-10 shadow-2xl shadow-black/30'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8'>
                            {talentTabs.map((tab) => {
                                const isActive = activeTalentTab === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        type='button'
                                        onClick={() => setActiveTalentTab(tab.key)}
                                        className={`rounded-xl border px-5 py-3 text-sm sm:text-base font-bold transition-all duration-300 ${
                                            isActive
                                                ? 'border-[#414A5D] bg-[#4333AF] text-white shadow-sm shadow-[#4333AF]/15'
                                                : 'border-white/10 bg-transparent text-gray-300 hover:border-[#4333AF]/50 hover:text-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className='grid lg:grid-cols-2 gap-10 lg:gap-16 items-center'>
                            <div>
                                <p className='mb-4 text-sm font-extrabold uppercase tracking-[0.28em] text-[#4333AF]'>{activeTalentService.eyebrow}</p>
                                <h2 className='mb-6 max-w-2xl text-xl sm:text-2xl md:text-3xl lg:text-[2rem] xl:text-[2.25rem] font-black leading-[1.22] text-white'>
                                    {activeTalentService.headline}
                                </h2>

                                <div className='space-y-5'>
                                    {activeTalentService.sections.map((section) => (
                                        <div key={section.title}>
                                            <h3 className='mb-2 text-sm font-extrabold uppercase tracking-[0.18em] text-white leading-[1.3]'>
                                                {section.title}
                                            </h3>
                                            <p className='text-sm sm:text-base leading-relaxed text-gray-300'>{section.body}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className='mt-7'>
                                    <h3 className='mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white leading-[1.3]'>Key Points:</h3>
                                    <div className='grid sm:grid-cols-2 gap-3'>
                                        {activeTalentService.keyPoints.map((point) => (
                                            <div key={point} className='flex items-start gap-3 text-sm font-semibold text-gray-200'>
                                                <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-[#4333AF]' />
                                                <span>{point}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className='relative flex flex-col items-center justify-center gap-8'>
                                <div className='relative h-56 w-56 sm:h-64 sm:w-64'>
                                    <div className='absolute inset-8 rounded-full border-4 border-white/80' />
                                    <div className='absolute inset-0 flex items-center justify-center'>
                                        <div className='flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#050608]'>
                                            <User className='h-14 w-14 text-white' />
                                        </div>
                                    </div>
                                    {Array.from({ length: 8 }).map((_, index) => {
                                        const angle = (index * 45 * Math.PI) / 180;
                                        const x = Math.cos(angle) * 96;
                                        const y = Math.sin(angle) * 96;

                                        return (
                                            <span
                                                key={index}
                                                className='absolute h-8 w-8 rounded-full border-4 border-white bg-[#050608] shadow-lg shadow-black/30'
                                                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}
                                            />
                                        );
                                    })}
                                </div>

                                <div className='w-full max-w-sm rounded-2xl border-2 border-white/80 bg-black p-6 shadow-xl shadow-black/30'>
                                    <h3 className='mb-3 text-lg font-extrabold text-white'>{activeTalentService.pricingTitle}</h3>
                                    <div className='mb-5 space-y-2'>
                                        {activeTalentService.pricing.map((priceItem) => (
                                            <div key={priceItem} className='flex items-center gap-3 text-base font-semibold text-gray-200'>
                                                <span className='text-2xl leading-none text-white'>+</span>
                                                <span>{priceItem}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        type='button'
                                        onClick={openConsultationModal}
                                        className='w-full bg-[#4333AF] py-5 text-base font-extrabold text-white shadow-[0_4px_14px_rgba(67,51,175,0.16)] transition-all duration-300 hover:bg-[#38299B] '
                                    >
                                        {activeTalentService.buttonLabel}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Dialog open={isConsultationModalOpen} onOpenChange={setIsConsultationModalOpen}>
                        <DialogContent className='w-[calc(100vw-2rem)] max-w-6xl sm:max-w-6xl max-h-[92vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none [&>button]:hidden'>
                            <DialogTitle className='sr-only'>Schedule Consultation</DialogTitle>

                            <div
                                id='consultation-form'
                                className='relative overflow-hidden rounded-[1.75rem] border p-4 sm:p-6 md:p-12'
                                style={{
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    backgroundColor: '#0C0F18',
                                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                    backdropFilter: 'blur(20px) saturate(160%)',
                                    boxShadow: '0 28px 80px rgba(0,0,0,0.78), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)',
                                }}
                            >
                                <button
                                    type='button'
                                    onClick={() => setIsConsultationModalOpen(false)}
                                    className='absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:scale-110 hover:bg-white/10 hover:text-white'
                                    aria-label='Close consultation modal'
                                >
                                    <X className='h-4 w-4' />
                                </button>

                                <div className='pointer-events-none absolute inset-0 bg-transparent' />

                                <div className='relative z-10 grid gap-8 lg:grid-cols-[0.75fr_1.55fr] lg:gap-10 lg:items-center'>
                                    <div className='text-center lg:text-left'>
                                        <p className='mb-4 text-sm font-extrabold uppercase tracking-[0.28em] text-[#4333AF]'>{activeTalentService.eyebrow}</p>
                                        <h2 className='text-4xl sm:text-5xl font-black leading-[1.22] text-white'>
                                            Schedule
                                            <br />
                                            Consultation
                                        </h2>
                                        <p className='mx-auto lg:mx-0 mt-5 max-w-sm text-sm sm:text-base leading-relaxed text-gray-300'>
                                            Ready to find your perfect candidates? Book a free consultation with our experts.
                                        </p>
                                        <div className='mt-8'>
                                            <div className='text-5xl sm:text-6xl font-black text-white'>$249.99</div>
                                            <p className='mt-2 text-sm font-semibold text-gray-400'>One-Time Consultation</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleScheduleConsultation} noValidate>
                                        <div className='grid md:grid-cols-2 gap-4'>
                                            <div>
                                                <label className='relative block'>
                                                    <Building2 className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                                                    <input
                                                        name='companyName'
                                                        value={consultationForm.companyName}
                                                        onChange={handleConsultationChange}
                                                        placeholder='Company Name'
                                                        className={`w-full rounded-lg border bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#4333AF] focus:ring-2 focus:ring-[#4333AF]/20 ${
                                                            consultationErrors.companyName ? 'border-red-400/70' : 'border-white/10'
                                                        }`}
                                                    />
                                                </label>
                                                {consultationErrors.companyName && (
                                                    <p className='mt-1 text-xs text-red-300'>{consultationErrors.companyName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className='relative block'>
                                                    <MapPin className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                                                    <input
                                                        name='location'
                                                        value={consultationForm.location}
                                                        onChange={handleConsultationChange}
                                                        placeholder='Location'
                                                        className={`w-full rounded-lg border bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#4333AF] focus:ring-2 focus:ring-[#4333AF]/20 ${
                                                            consultationErrors.location ? 'border-red-400/70' : 'border-white/10'
                                                        }`}
                                                    />
                                                </label>
                                                {consultationErrors.location && <p className='mt-1 text-xs text-red-300'>{consultationErrors.location}</p>}
                                            </div>

                                            <div>
                                                <label className='relative block'>
                                                    <Briefcase className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                                                    <input
                                                        name='jobTitle'
                                                        value={consultationForm.jobTitle}
                                                        onChange={handleConsultationChange}
                                                        placeholder='Your Job Title'
                                                        className={`w-full rounded-lg border bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#4333AF] focus:ring-2 focus:ring-[#4333AF]/20 ${
                                                            consultationErrors.jobTitle ? 'border-red-400/70' : 'border-white/10'
                                                        }`}
                                                    />
                                                </label>
                                                {consultationErrors.jobTitle && <p className='mt-1 text-xs text-red-300'>{consultationErrors.jobTitle}</p>}
                                            </div>

                                            <div>
                                                <label className='relative block'>
                                                    <User className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                                                    <input
                                                        name='fullName'
                                                        value={consultationForm.fullName}
                                                        onChange={handleConsultationChange}
                                                        placeholder='Full Name'
                                                        className={`w-full rounded-lg border bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#4333AF] focus:ring-2 focus:ring-[#4333AF]/20 ${
                                                            consultationErrors.fullName ? 'border-red-400/70' : 'border-white/10'
                                                        }`}
                                                    />
                                                </label>
                                                {consultationErrors.fullName && <p className='mt-1 text-xs text-red-300'>{consultationErrors.fullName}</p>}
                                            </div>

                                            <div>
                                                <label className='relative block'>
                                                    <Mail className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                                                    <input
                                                        type='email'
                                                        name='email'
                                                        value={consultationForm.email}
                                                        onChange={handleConsultationChange}
                                                        placeholder='Work Email'
                                                        className={`w-full rounded-lg border bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#4333AF] focus:ring-2 focus:ring-[#4333AF]/20 ${
                                                            consultationErrors.email ? 'border-red-400/70' : 'border-white/10'
                                                        }`}
                                                    />
                                                </label>
                                                {consultationErrors.email && <p className='mt-1 text-xs text-red-300'>{consultationErrors.email}</p>}
                                            </div>

                                            <div>
                                                <label className='relative block'>
                                                    <Phone className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                                                    <input
                                                        type='tel'
                                                        name='phone'
                                                        value={consultationForm.phone}
                                                        onChange={handleConsultationChange}
                                                        placeholder='Phone Number'
                                                        className={`w-full rounded-lg border bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#4333AF] focus:ring-2 focus:ring-[#4333AF]/20 ${
                                                            consultationErrors.phone ? 'border-red-400/70' : 'border-white/10'
                                                        }`}
                                                    />
                                                </label>
                                                {consultationErrors.phone && <p className='mt-1 text-xs text-red-300'>{consultationErrors.phone}</p>}
                                            </div>

                                            <div>
                                                <label className='relative block'>
                                                    <Users className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                                                    <select
                                                        name='numOfPositions'
                                                        value={consultationForm.numOfPositions}
                                                        onChange={handleConsultationChange}
                                                        className={`w-full appearance-none rounded-lg border bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-[#4333AF] focus:ring-2 focus:ring-[#4333AF]/20 ${
                                                            consultationErrors.numOfPositions ? 'border-red-400/70' : 'border-white/10'
                                                        } ${consultationForm.numOfPositions ? 'text-white' : 'text-gray-500'}`}
                                                    >
                                                        <option value='' className='bg-[#0C0F18] text-gray-300'>
                                                            Number of positions
                                                        </option>
                                                        {[1, 2, 3, 4, 5, 10, 15, 20].map((positionCount) => (
                                                            <option key={positionCount} value={positionCount} className='bg-[#0C0F18] text-white'>
                                                                {positionCount}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                                {consultationErrors.numOfPositions && (
                                                    <p className='mt-1 text-xs text-red-300'>{consultationErrors.numOfPositions}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className='relative block'>
                                                    <CalendarDays className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                                                    <input
                                                        type='datetime-local'
                                                        name='dateTime'
                                                        value={consultationForm.dateTime}
                                                        onChange={handleConsultationChange}
                                                        className={`w-full rounded-lg border bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#4333AF] focus:ring-2 focus:ring-[#4333AF]/20 ${
                                                            consultationErrors.dateTime ? 'border-red-400/70' : 'border-white/10'
                                                        }`}
                                                    />
                                                </label>
                                                {consultationErrors.dateTime && <p className='mt-1 text-xs text-red-300'>{consultationErrors.dateTime}</p>}
                                            </div>
                                        </div>

                                        <div className='mt-5 space-y-3'>
                                            <div className='flex items-start gap-3 text-sm text-gray-300'>
                                                <input
                                                    type='checkbox'
                                                    name='termsAccepted'
                                                    checked={consultationForm.termsAccepted}
                                                    onChange={handleConsultationCheckboxChange}
                                                    className='mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#4333AF]'
                                                />
                                                <span>
                                                    I agree to the{' '}
                                                    <button
                                                        type='button'
                                                        onClick={() => setIsTermsModalOpen(true)}
                                                        className='text-white underline decoration-[#4333AF]/70 underline-offset-4 transition hover:text-[#4333AF]'
                                                    >
                                                        Terms and Conditions
                                                    </button>
                                                </span>
                                            </div>
                                            {consultationErrors.termsAccepted && <p className='text-xs text-red-300'>{consultationErrors.termsAccepted}</p>}
                                        </div>

                                        <div className='mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                                            <div className='min-h-6'>
                                                {consultationMessage && <p className='text-sm font-semibold text-red-300'>{consultationMessage}</p>}
                                                {consultationSuccess && <p className='text-sm font-semibold text-green-300'>{consultationSuccess}</p>}
                                            </div>

                                            <Button
                                                type='submit'
                                                disabled={isSubmittingConsultation}
                                                className='w-full sm:w-auto min-w-[250px] bg-[#4333AF] px-8 py-6 text-base font-extrabold text-white shadow-[0_4px_14px_rgba(67,51,175,0.16)] cursor-pointer transition-all duration-300 hover:bg-[#38299B] disabled:cursor-not-allowed disabled:opacity-70'
                                            >
                                                {isSubmittingConsultation ? (
                                                    <>
                                                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* <CalendarDays className='mr-2 h-5 w-5' /> */}
                                                        Schedule Consultation
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </section>

            {/* Call to Action Section with Lottie Animation */}
            <section className='relative z-10 py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        <div className='space-y-8'>
                            <h2 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                Join the <span className=' text-[#4333AF] '>Black Snow</span>
                                <br className='hidden sm:block' />
                                &nbsp;Revolution
                            </h2>
                            <p className='text-xl text-gray-300 leading-relaxed'>
                                Whether you&apos;re looking for your next career opportunity or seeking top talent for your organization, we&apos;re here to
                                make it happen. Be a first mover in your career journey.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-6 pt-8'>
                                <Link href={'/careeroptions'}>
                                    <Button className='border-2 box-border border-[#414A5D] bg-[#4333AF] hover:bg-[#38299B] text-white px-12 py-6 text-lg font-bold shadow-[0_4px_14px_rgba(67,51,175,0.16)] transform hover:scale-105 transition-all duration-300 w-full sm:w-[300px]'>
                                        Browse Jobs
                                    </Button>
                                </Link>
                                <Link href={'/recruitmentagency'}>
                                    <Button
                                        variant='outline'
                                        className='border-2 box-border border-[#414A5D] cursor-pointer text-white hover:bg-[#4333AF] hover:text-white px-12 py-6 text-lg font-bold shadow-[0_4px_14px_rgba(67,51,175,0.16)] transform hover:scale-105 transition-all duration-300 bg-transparent w-full sm:w-[300px]'
                                    >
                                        Hire Talent
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Lottie Animation */}
                        <div className='flex items-center justify-center'>
                            <div className='w-full h-80 sm:w-96 sm:h-96 bg-[#0C0F18] rounded-3xl border border-[#414A5D] flex items-center justify-center backdrop-blur-xl'>
                                <LottieAnimation src='/animations/careericon.json' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export { CareersTitle };
