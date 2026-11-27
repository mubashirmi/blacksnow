'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
    ArrowRight,
    Award,
    Briefcase,
    Building2,
    CalendarDays,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
    Globe,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Shield,
    ShieldCheck,
    Star,
    Target,
    User,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { Michroma } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react';

const michroma = Michroma({ subsets: ['latin'], weight: '400' });

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

const slides = [
    {
        icon: Briefcase,
        title: 'Career Opportunities',
        kicker: 'For Job Seekers',
        description: 'Discover career opportunities across the United States and explore roles in a wide variety of professional fields.',
        features: [
            'Opportunities across U.S. states',
            'Sales and finance positions',
            'Healthcare and technical roles',
            'Remote-first career interests',
            'Trucking and warehouse roles',
            'Software and AI careers',
        ],
        panelTitle: 'Find your next move',
        panelBody: 'Explore available opportunities and find paths that fit your skills and experience.',
        panelPoints: ['Browse job openings', 'Explore different industries', 'Plan your next step'],
        action: 'See Career Opportunities',
        href: '/careeroptions',
        service: null,
    },
    {
        icon: Target,
        title: 'Recruitment Agency',
        kicker: 'For Employers',
        description: 'Connect your organization with qualified candidates through our recruitment and hiring support services.',
        features: ['Candidate sourcing', 'Role-specific matching', 'Recruitment support', '30-day guarantee', 'International hiring', 'Compliance support'],
        panelTitle: 'Recruitment solutions',
        panelBody: 'Our team works with employers to find candidates aligned with the role and the organization.',
        panelPoints: ['Recruitment assistance', 'Employer-focused process', 'Talent across industries'],
        action: 'Explore Recruitment',
        href: '/recruitmentagency',
        service: null,
    },
    {
        icon: Users,
        title: 'U.S. Talent Acquisition',
        kicker: 'Consultation Service',
        description: 'Source and place professionals for sales, operations, and technical roles with focused recruiting and clear communication.',
        features: [
            'Full-cycle recruitment',
            'Background checks',
            'Role-specific recruiting',
            'Performance-focused placement',
            'Pre-vetted candidates',
            'Faster time-to-hire',
        ],
        panelTitle: 'Schedule a consultation',
        panelBody: 'Review your recruiting goals with our team and discuss your talent requirements.',
        panelPoints: ['U.S. candidate sourcing', 'Dedicated recruiting guidance', 'Consultation fee: $249.99'],
        action: 'Schedule Consultation',
        href: '',
        service: 'us' as TalentTab,
    },
    {
        icon: Globe,
        title: 'Global Workforce (BPO)',
        kicker: 'Consultation Service',
        description: 'Explore international sourcing, workforce outsourcing, and payroll support for distributed teams.',
        features: [
            'International sourcing',
            'Workforce outsourcing',
            'Payroll coordination',
            'Flexible team structures',
            'Fast onboarding',
            'Contracts and compliance',
        ],
        panelTitle: 'Plan global hiring',
        panelBody: 'Review international hiring needs, outsourcing arrangements, and payroll administration options.',
        panelPoints: ['Global recruiting support', 'Payroll and contracts', 'Consultation fee: $249.99'],
        action: 'Schedule Consultation',
        href: '',
        service: 'global' as TalentTab,
    },
];
const valueCards = [
    { icon: Briefcase, title: 'Career Paths', description: 'Explore opportunities across industries.' },
    { icon: Users, title: 'Talent Matching', description: 'Recruitment that considers your goals.' },
    { icon: Globe, title: 'Global Workforce', description: 'International sourcing and team support.' },
    { icon: ShieldCheck, title: 'Trusted Process', description: 'Clear steps for employers and candidates.' },
];

function CareersTitle() {
    const [activeSlide, setActiveSlide] = useState(0);
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
        <div className='relative min-h-screen isolate overflow-hidden bg-[#050608] text-white'>
            <TermsSlideModal open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen} onComplete={handleTermsComplete} />

            <section className='relative z-10 px-4 pb-8 pt-12 sm:px-6 sm:pt-16 md:px-8 lg:pb-10'>
                <div className='mx-auto max-w-[1380px]'>
                    <div className='grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14'>
                        <div className='relative isolate z-10 animate-slide-in-left'>
                            <h1
                                className={`${michroma.className} max-w-3xl text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.32] min-[1100px]:leading-[1.34] tracking-tight text-white`}
                            >
                                <span className='block lg:whitespace-nowrap'>Careers.</span>
                                <span className='block text-[#4333AF] lg:whitespace-nowrap'>Grow With Us.</span>
                            </h1>
                            <p className='mt-7 max-w-xl text-base leading-8 text-gray-300 sm:text-lg'>
                                Explore career opportunities, connect with qualified professionals, and discover talent services designed for organizations of
                                different sizes.
                            </p>
                            <div className='mt-8 flex flex-wrap items-center gap-4'>
                                <Link
                                    href='/careeroptions'
                                    className='flex h-14 items-center justify-center gap-3 rounded-full bg-[#4333AF] px-6 text-base font-semibold text-white transition-colors hover:bg-[#38299B]'
                                >
                                    Browse Opportunities <ArrowRight className='h-5 w-5 shrink-0' />
                                </Link>
                                <Link
                                    href='#career-paths'
                                    className='flex h-14 items-center justify-center gap-3 rounded-full border border-[#414A5D] bg-[#0C0F18] px-6 text-base font-semibold text-white transition-colors hover:border-[#4333AF]/50'
                                >
                                    Explore Talent Services
                                </Link>
                            </div>
                        </div>
                        <div className='relative isolate flex min-w-0 items-center justify-center animate-slide-in-right lg:min-h-[470px]'>
                            <div
                                aria-hidden='true'
                                className='pointer-events-none absolute left-1/2 top-1/2 z-0 h-[calc(100%_+_120px)] w-[calc(100%_+_160px)] min-h-[490px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[44px] sm:min-h-[620px] sm:blur-[52px] lg:min-h-[660px] lg:w-[900px]'
                                style={{
                                    background:
                                        'radial-gradient(ellipse at center, rgba(67,51,175,0.36) 0%, rgba(67,51,175,0.23) 36%, rgba(67,51,175,0.10) 58%, rgba(5,6,8,0) 80%)',
                                }}
                            />
                            <div className='relative z-20 w-full min-w-0 max-w-[530px] rounded-[28px] bg-[#0C0F18] p-5 sm:p-7 border border-[#414A5D] shadow-[0_32px_110px_-38px_rgba(67,51,175,0.42),0_22px_46px_-25px_rgba(0,0,0,0.85)]'>
                                <h3 className='text-xl sm:text-2xl font-bold text-white mb-5 flex items-center leading-[1.35]'>
                                    <Globe className='w-8 h-8 shrink-0 text-[#4333AF] mr-3' />
                                    Global Opportunities
                                </h3>

                                <div className='grid grid-cols-2 gap-4 mb-5'>
                                    <div className='text-center'>
                                        <div className='text-3xl sm:text-4xl font-black text-[#4333AF] mb-2'>50+</div>
                                        <div className='text-sm text-gray-400 font-semibold'>States Covered</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-3xl sm:text-4xl font-black text-[#4333AF] mb-2'>15+</div>
                                        <div className='text-sm text-gray-400 font-semibold'>Industries</div>
                                    </div>
                                </div>

                                <div className='space-y-3'>
                                    {[
                                        { icon: CheckCircle, text: 'Remote-First Opportunities', color: 'text-[#4333AF]' },
                                        { icon: Star, text: 'Competitive Compensation', color: 'text-[#4333AF]' },
                                        { icon: Award, text: 'Career Growth Programs', color: 'text-[#4333AF]' },
                                        { icon: Users, text: 'Global Team Collaboration', color: 'text-[#4333AF]' },
                                    ].map((item, index) => (
                                        <div key={index} className='flex items-center space-x-3 p-2.5 rounded-xl bg-[#0A0D14] border border-[#414A5D]'>
                                            <item.icon className={`w-5 h-5 shrink-0 ${item.color}`} />
                                            <span className='min-w-0 break-words text-sm sm:text-base text-gray-300 font-medium'>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section id='career-paths' className='relative z-10 overflow-hidden px-4 pb-10 sm:px-6 md:px-8'>
                <div className='relative mx-auto max-w-[1380px]'>
                    <div className='relative w-full overflow-hidden rounded-[28px] border border-[#414A5D] bg-[#0C0F18] shadow-[0_28px_110px_-40px_rgba(67,51,175,0.25),0_20px_65px_-35px_rgba(0,0,0,0.8)]'>
                        <div className='bs-info-slider-track relative z-10 flex w-full min-w-0' style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                            {slides.map((slide) => {
                                const SlideIcon = slide.icon;
                                return (
                                    <div key={slide.title} className='w-full min-w-full shrink-0 overflow-hidden'>
                                        <div className='grid w-full min-w-0 grid-cols-1 gap-6 px-4 pb-24 pt-6 sm:px-7 sm:pb-24 sm:pt-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)] lg:gap-8 lg:px-10 lg:pb-20 lg:pt-10 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.72fr)] xl:px-12 h-full lg:h-[480px] xl:h-[440px] lg:grid-rows-[minmax(0,1fr)]'>
                                            <div className='grid min-w-0 gap-5 md:grid-cols-[104px_1fr] md:gap-6 lg:min-h-0 lg:overflow-y-auto'>
                                                <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#414A5D] bg-[#0A0D14] sm:h-24 sm:w-24 md:mx-0'>
                                                    <SlideIcon className='h-9 w-9 text-[#4333AF] sm:h-11 sm:w-11' strokeWidth={1.8} />
                                                </div>
                                                <div className='flex min-w-0 flex-col text-center md:text-left'>
                                                    <p className='mb-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#4333AF]'>{slide.kicker}</p>
                                                    <h2
                                                        className={`${michroma.className} break-words text-xl leading-[1.32] tracking-[-0.02em] text-white sm:text-3xl lg:text-[clamp(1.5rem,2.25vw,2.25rem)]`}
                                                    >
                                                        {slide.title}
                                                    </h2>
                                                    <p className='mx-auto mt-3 max-w-2xl break-words text-sm leading-7 text-gray-300 sm:text-base md:mx-0'>
                                                        {slide.description}
                                                    </p>
                                                    <div className='mt-5 grid min-w-0 gap-3 sm:grid-cols-2 lg:flex-1 lg:auto-rows-fr'>
                                                        {slide.features.map((feature) => (
                                                            <div
                                                                key={feature}
                                                                className='flex min-w-0 items-center gap-3 rounded-xl border border-[#414A5D] bg-[#0A0D14] px-3 py-2.5 lg:gap-2 lg:px-2 lg:py-2 xl:gap-3 xl:px-3 xl:py-2.5 transition-colors duration-300 hover:border-[#4333AF]/50'
                                                            >
                                                                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#414A5D]'>
                                                                    <CheckCircle className='h-4 w-4 text-[#4333AF]' />
                                                                </span>
                                                                <span className='min-w-0 break-words text-left text-sm leading-6 text-gray-100 sm:text-base lg:text-sm lg:leading-5 xl:text-base xl:leading-6'>
                                                                    {feature}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flex w-full min-w-0 flex-col rounded-[24px] lg:min-h-0 lg:overflow-y-auto border border-[#414A5D] bg-[#0A0D14] px-4 py-5 shadow-[0_12px_48px_-26px_rgba(67,51,175,0.13)] sm:px-6 sm:py-6 lg:px-5 lg:py-4 xl:px-6'>
                                                <h3 className={`${michroma.className} text-base leading-[1.45] text-white sm:text-lg`}>{slide.panelTitle}</h3>
                                                <p className='mt-2 text-sm leading-5 text-gray-300'>{slide.panelBody}</p>
                                                <div className='mt-3 space-y-2 pb-4'>
                                                    {slide.panelPoints.map((point) => (
                                                        <div key={point} className='flex items-start gap-3 text-sm text-gray-200'>
                                                            <CheckCircle className='mt-0.5 h-4 w-4 shrink-0 text-[#4333AF]' />
                                                            {point}
                                                        </div>
                                                    ))}
                                                </div>
                                                {slide.service ? (
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setActiveTalentTab(slide.service as TalentTab);
                                                            openConsultationModal();
                                                        }}
                                                        className='mt-4 flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#4333AF] px-3 py-2 text-center text-sm font-black leading-snug text-white transition-colors duration-300 hover:bg-[#38299B] lg:mt-auto'
                                                    >
                                                        {slide.action}
                                                        <ArrowRight className='h-5 w-5 shrink-0' />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={slide.href}
                                                            className='mt-4 flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#4333AF] px-3 py-2 text-center text-sm font-black leading-snug text-white transition-colors duration-300 hover:bg-[#38299B] lg:mt-auto'
                                                        >
                                                            {slide.action}
                                                            <ArrowRight className='h-5 w-5 shrink-0' />
                                                        </Link>
                                                        {slide.href === '/recruitmentagency' && (
                                                            <Link
                                                                href='/consultation'
                                                                className='mt-2 flex min-h-10 w-full shrink-0 items-center justify-center rounded-xl border border-[#414A5D] px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:border-[#4333AF]'
                                                            >
                                                                Consultation
                                                            </Link>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className='pointer-events-none absolute inset-x-0 bottom-5 z-20 flex items-center justify-between px-5 sm:px-7 lg:px-10'>
                            <button
                                type='button'
                                onClick={() => setActiveSlide((current) => (current - 1 + slides.length) % slides.length)}
                                className='pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#414A5D] bg-[#050608] text-gray-200 transition-colors duration-300 hover:border-[#4333AF]/50 hover:bg-[#0C0F18] hover:text-white'
                                aria-label='Previous slide'
                            >
                                <ChevronLeft className='h-5 w-5 text-[#4333AF]' />
                            </button>
                            <div className='pointer-events-auto hidden items-center justify-center gap-2 sm:flex'>
                                {slides.map((slide, index) => (
                                    <button
                                        key={slide.title}
                                        type='button'
                                        onClick={() => setActiveSlide(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            activeSlide === index ? 'w-8 bg-[#4333AF]' : 'w-2 bg-[#4333AF]/45 hover:bg-[#4333AF]/70'
                                        }`}
                                        aria-label={`Show ${slide.title}`}
                                        aria-current={activeSlide === index ? 'true' : undefined}
                                    />
                                ))}
                            </div>
                            <button
                                type='button'
                                onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
                                className='pointer-events-auto flex h-10 items-center gap-1 rounded-full border border-[#414A5D] bg-[#050608] px-4 text-sm font-semibold text-gray-200 transition-colors duration-300 hover:border-[#4333AF]/50 hover:bg-[#0C0F18] hover:text-white'
                                aria-label='Next slide'
                            >
                                Next <ChevronRight className='h-4 w-4 text-[#4333AF]' />
                            </button>
                        </div>
                    </div>
                    <div className='mt-10 flex items-center gap-4'>
                        <div className='h-px flex-1 bg-[#4333AF]/35' />
                        <p className={`${michroma.className} text-center text-[11px] leading-[1.6] uppercase tracking-[0.5em] text-[#4333AF]`}>
                            Built For Better Careers
                        </p>
                        <div className='h-px flex-1 bg-[#4333AF]/35' />
                    </div>
                    <div className='mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                        {valueCards.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className='rounded-2xl border border-[#414A5D] bg-[#0C0F18] shadow-[0_14px_55px_-30px_rgba(67,51,175,0.16)] transition-colors duration-300 hover:border-[#4333AF]/50 hover:bg-[#0C0F18]/80'
                            >
                                <div className='flex items-center gap-5 p-6'>
                                    <Icon className='h-12 w-12 shrink-0 text-[#4333AF]' aria-hidden='true' />
                                    <div>
                                        <h3 className={`${michroma.className} text-sm leading-6 text-white`}>{title}</h3>
                                        <p className='mt-2 text-sm leading-6 text-gray-400'>{description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
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
                                        {consultationErrors.companyName && <p className='mt-1 text-xs text-red-300'>{consultationErrors.companyName}</p>}
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
                                        {consultationErrors.numOfPositions && <p className='mt-1 text-xs text-red-300'>{consultationErrors.numOfPositions}</p>}
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
            <style jsx global>{`
                .bs-info-hero-card {
                    --bs-info-card-x: 0;
                    transform-style: preserve-3d;
                    animation: bs-info-float 5.5s ease-in-out infinite;
                }
                @media (min-width: 1024px) {
                    .bs-info-hero-card {
                        --bs-info-card-x: -50%;
                    }
                }
                .bs-info-slider-track {
                    transition: transform 780ms cubic-bezier(0.22, 1, 0.36, 1);
                    will-change: transform;
                }
                @media (prefers-reduced-motion: reduce) {
                    .bs-info-hero-card {
                        animation: none;
                    }
                    .bs-info-slider-track {
                        transition: none;
                    }
                }
                @keyframes bs-info-float {
                    0%,
                    100% {
                        transform: translateX(var(--bs-info-card-x)) translateY(0);
                    }
                    50% {
                        transform: translateX(var(--bs-info-card-x)) translateY(-12px);
                    }
                }
            `}</style>
        </div>
    );
}

export { CareersTitle };
