'use client';

import { AuthModalTrigger } from '@/components/AuthModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    FilePen,
    FileText,
    Globe,
    Loader2,
    Lock,
    MessageSquare,
    Monitor,
    Newspaper,
    Shield,
    Star,
    UserCheck,
    X,
    Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Terms Slides ─────────────────────────────────────────────────────────────
type TermsSlide = {
    id: string;
    accent: string;
    Icon: any;
    badge: string;
    titleGrad: string;
    titlePlain: string;
    gradAtEnd?: boolean;
    summary: string;
    link: string;
    bullets: string[];
};

const UNIFIED_CARD_HEIGHT = 580;

const BASE_TERMS_SLIDES: TermsSlide[] = [
    {
        id: 'gdpr',
        accent: '#4cc7e8',
        Icon: Globe,
        badge: 'Legal — GDPR',
        titleGrad: 'GDPR',
        titlePlain: ' & Privacy',
        summary:
            'Do not collect or store personal data of referred users without proper consent and a lawful basis. You may not spam or send unsolicited messages. Any data you handle must be processed in accordance with our Privacy Policy and GDPR requirements. Contact us if you have questions about compliance.',
        link: '/gdpr',
        bullets: ['No unsolicited messaging or spam', 'Handle personal data with proper consent', 'Comply with GDPR in your jurisdiction'],
    },
    {
        id: 'terms',
        accent: '#2c7bbe',
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
        accent: '#4cc7e8',
        Icon: Shield,
        badge: 'Privacy Policy',
        titleGrad: 'Privacy',
        titlePlain: ' Policy',
        summary:
            'We collect only the data necessary to operate the platform and process payments. Your data is never sold to third parties. You have the right to access, correct, or delete your personal data at any time. All data is stored securely in compliance with applicable privacy laws.',
        link: '/privacy',
        bullets: ['Data collected only to operate the service', 'Your data is never sold to third parties', 'Right to access, correct, or delete your data'],
    },
    {
        id: 'risk-disclosure',
        accent: '#2c7bbe',
        Icon: AlertTriangle,
        badge: 'Risk Disclosure',
        titleGrad: 'Risk',
        titlePlain: ' Disclosure',
        summary:
            'Black Snow provides educational content, market information, analytics, and simulated trading tools for learning and informational purposes only. Trading involves substantial risk, market data may be delayed or inaccurate, and simulated or past results do not guarantee future outcomes.',
        link: '/riskdisclosure',
        bullets: [
            'No financial, investment, legal, tax, or accounting advice',
            'Trading can result in substantial loss of capital',
            'Simulated and past results do not guarantee future performance',
        ],
    },
    {
        id: 'cookie-policy',
        accent: '#4cc7e8',
        Icon: Shield,
        badge: 'Cookie Policy',
        titleGrad: 'Cookie',
        titlePlain: ' Policy',
        summary:
            'Black Snow uses cookies and similar technologies to keep the site secure, remember preferences, understand performance and usage, and support marketing measurement where enabled. You can manage cookies through browser settings and available preference controls.',
        link: '/cookies',
        bullets: [
            'Necessary cookies support security and core functionality',
            'Analytics and functional cookies help improve the experience',
            'Cookie choices can be managed through browser or preference controls',
        ],
    },
    {
        id: 'independent-contractor',
        accent: '#2c7bbe',
        Icon: UserCheck,
        badge: 'Independent Contractor',
        titleGrad: 'Independent',
        titlePlain: ' Contractor',
        summary:
            'Black Snow works with experienced independent contractors on educational content, market analysis, and strategy-related projects. Contractors retain flexibility over their schedules and projects while being expected to bring relevant expertise, analytical skill, integrity, and professional standards.',
        link: '/independentContract',
        bullets: [
            'Flexible, autonomous project-based collaboration',
            'Relevant trading, market, or analytical experience is expected',
            'Contractors are responsible for delivering professional, high-quality work',
        ],
    },
    {
        id: 'affiliate-agreement',
        accent: '#4cc7e8',
        Icon: FileText,
        badge: 'Affiliate Agreement',
        titleGrad: 'Affiliate',
        titlePlain: ' Agreement',
        summary:
            'Affiliates must promote Black Snow professionally, ethically, and lawfully. Commissions apply only to qualifying sales under the Program terms, required disclosures must be clear, and prohibited conduct such as self-referrals, spam, misleading claims, cookie stuffing, or unauthorized brand use may result in termination.',
        link: '/affiliateagreement',
        bullets: [
            'Promotions must be lawful, accurate, and properly disclosed',
            'Commissions apply only to qualifying sales under Program terms',
            'Spam, self-referrals, misleading claims, and other prohibited tactics are not allowed',
        ],
    },
    {
        id: 'no-financial-advice',
        accent: '#2c7bbe',
        Icon: AlertTriangle,
        badge: 'No Financial Advice',
        titleGrad: 'No Financial',
        titlePlain: ' Advice',
        summary:
            'Black Snow content, market analysis, trading strategies, simulations, newsletters, and related resources are provided for educational and informational purposes only. They are not personalized financial, investment, tax, legal, or other professional advice.',
        link: '/nofinancialadvice',
        bullets: [
            'Educational and informational content only',
            'No recommendations to buy, sell, hold, or trade securities',
            'Users remain responsible for their own financial and trading decisions',
        ],
    },
    {
        id: 'subscription-policy',
        accent: '#4cc7e8',
        Icon: FileText,
        badge: 'Subscription Policy',
        titleGrad: 'Subscription',
        titlePlain: ' Policy',
        summary:
            'Paid subscriptions are billed in advance and automatically renew unless canceled before the renewal date. Cancellation stops future renewals while access generally continues through the current paid period, and refunds are normally not provided for partial periods unless required by law or granted at our discretion.',
        link: '/subscriptionpolicy',
        bullets: [
            'Subscriptions renew automatically until canceled',
            'Cancellation generally preserves access through the paid period',
            'Failed payments or policy violations may suspend or terminate access',
        ],
    },
    {
        id: 'earnings-disclosure',
        accent: '#2c7bbe',
        Icon: AlertTriangle,
        badge: 'Earnings Disclosure',
        titleGrad: 'Earnings',
        titlePlain: ' Disclosure',
        summary:
            'Any references to profits, past performance, testimonials, strategies, or simulated results are illustrative and educational only. Results are not guaranteed or necessarily typical, and hypothetical performance may not reflect real-world factors such as slippage, commissions, liquidity, or execution conditions.',
        link: '/earningsdisclosure',
        bullets: [
            'No earnings, profit, or performance guarantees',
            'Past and simulated results are not indicative of future results',
            'Trading involves substantial risk and outcomes vary by user and market conditions',
        ],
    },
];

// ─── Terms Slide Modal ────────────────────────────────────────────────────────
function TermsSlideModal({
    open,
    onOpenChange,
    onComplete,
    slides,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onComplete: () => void;
    slides: TermsSlide[];
}) {
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
        setTimeout(() => {
            setCurrent(next);
            setAnimating(false);
        }, 220);
    };

    const handleNext = () => {
        if (animating) return;

        if (current < slides.length - 1) {
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

    const slide = slides[current];
    const { accent, badge, titleGrad, titlePlain, gradAtEnd, summary, link, bullets } = slide;
    const isLast = current === slides.length - 1;

    const slideAnim: React.CSSProperties = {
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${dir === 'next' ? '-18px' : '18px'})` : 'translateX(0)',
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-[540px] max-h-[calc(100dvh-1rem)] p-0 border-0 bg-transparent shadow-none [&>button]:hidden'>
                <DialogTitle className='sr-only'>{badge}</DialogTitle>

                <style>{`
                    .legal-slide-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(255,255,255,0.16) transparent;
                    }

                    .legal-slide-scrollbar::-webkit-scrollbar {
                        width: 5px;
                    }

                    .legal-slide-scrollbar::-webkit-scrollbar-track {
                        background: rgba(0,0,0,0.10);
                        border-radius: 999px;
                    }

                    .legal-slide-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.14);
                        border-radius: 999px;
                    }

                    .legal-slide-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255,255,255,0.22);
                    }
                `}</style>

                <div
                    className='relative rounded-[24px] border overflow-hidden flex flex-col bg-[#07090d] sm:rounded-[32px]'
                    style={{
                        minHeight: UNIFIED_CARD_HEIGHT,
                        height: UNIFIED_CARD_HEIGHT,
                        borderColor: `${accent}35`,
                        boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 40px ${accent}10`,
                    }}
                >
                    <div
                        className='absolute inset-0 pointer-events-none'
                        style={{
                            background: `radial-gradient(circle at top, ${accent}18 0%, transparent 36%)`,
                        }}
                    />
                    <div
                        className='absolute top-0 left-0 right-0 h-[2px]'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />

                    <button
                        type='button'
                        onClick={() => onOpenChange(false)}
                        className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110'
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <X className='w-4 h-4 text-white/60' />
                    </button>

                    <div className='relative z-10 flex h-full min-h-0 flex-1 flex-col px-4 pt-6 pb-4 sm:px-7 sm:pt-8 sm:pb-6' style={slideAnim}>
                        {/* <div
                            className='inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase mb-5'
                            style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
                        >
                            <Icon className='w-3.5 h-3.5' />
                            {badge}
                        </div> */}

                        <h2 className='pr-10 text-[24px] font-black leading-tight text-white sm:text-[28px] mb-3'>
                            {gradAtEnd ? (
                                <>
                                    {titlePlain}
                                    <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #4cc7e8)` }}>
                                        {titleGrad}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className='bg-clip-text text-transparent' style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #4cc7e8)` }}>
                                        {titleGrad}
                                    </span>
                                    {titlePlain}
                                </>
                            )}
                        </h2>

                        <div className='mb-4 h-px w-full rounded-full bg-white/10 sm:mb-5' />

                        <div className='legal-slide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1'>
                            <div className='mb-4 rounded-2xl border p-4 sm:mb-5' style={{ backgroundColor: `${accent}08`, borderColor: `${accent}25` }}>
                                <p className='text-[11px] font-bold uppercase tracking-[0.18em] mb-2' style={{ color: accent }}>
                                    Summary
                                </p>
                                <p className='text-[13px] leading-relaxed text-white/65 sm:text-sm'>{summary}</p>

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

                            <div>
                                <ul className='space-y-3'>
                                    {bullets.map((b, i) => (
                                        <li key={i} className='flex items-start gap-2.5'>
                                            <CheckCircle className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} strokeWidth={2.5} />
                                            <span className='text-white/72 text-sm leading-snug'>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className='grid flex-shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 pt-4 sm:pt-6'>
                            <div className='flex flex-shrink-0 items-center gap-1.5 justify-self-start' aria-label={`Slide ${current + 1} of ${slides.length}`}>
                                {current > 0 && (
                                    <div
                                        className='h-1.5 w-1.5 flex-shrink-0 rounded-full transition-all duration-300'
                                        style={{ backgroundColor: `${accent}55` }}
                                    />
                                )}

                                <div className='h-1.5 w-5 flex-shrink-0 rounded-full transition-all duration-300' style={{ backgroundColor: accent }} />

                                {current < slides.length - 1 && (
                                    <div
                                        className='h-1.5 w-1.5 flex-shrink-0 rounded-full transition-all duration-300'
                                        style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                                    />
                                )}
                            </div>

                            <span
                                className='justify-self-center whitespace-nowrap rounded-xl px-2 py-1 text-[10px] font-bold text-white/70 sm:px-3 sm:text-xs'
                                style={{ backgroundColor: `${accent}14`, border: `1px solid ${accent}35` }}
                            >
                                Slide {current + 1}/{slides.length}
                            </span>

                            <div className='flex flex-shrink-0 items-center gap-1.5 justify-self-end sm:gap-2'>
                                <button
                                    type='button'
                                    onClick={handlePrev}
                                    disabled={current === 0}
                                    className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-20 hover:scale-105'
                                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    aria-label='Previous terms slide'
                                >
                                    <ChevronLeft className='h-4 w-4 text-white' />
                                </button>

                                <button
                                    type='button'
                                    onClick={handleNext}
                                    className={`flex h-9 flex-shrink-0 items-center justify-center gap-1 rounded-xl font-bold text-white transition-all hover:scale-[1.01] sm:hover:scale-105 ${
                                        isLast ? 'min-w-[112px] px-3 text-[10px] sm:min-w-[120px] sm:text-xs' : 'min-w-[70px] px-3 text-xs'
                                    }`}
                                    style={{
                                        background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
                                        border: `1px solid ${accent}60`,
                                        boxShadow: `0 2px 12px ${accent}30`,
                                    }}
                                >
                                    <span className='whitespace-nowrap'>{isLast ? 'I Understand ✓' : 'Next'}</span>
                                    {!isLast && <ChevronRight className='h-3.5 w-3.5 flex-shrink-0' />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Products ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
    {
        id: 'NewsLetter',
        apiName: 'NewsLetter',
        name: 'Newsletter',
        monthlyPrice: 9.99,
        yearlyPrice: 49.99,
        description: 'Weekly premium market insights',
        features: [
            'Weekly Stock Picks',
            'Macro Market Updates',
            'Latest Blog Articles',
            'Exclusive Financial Insights',
            'Portfolio Strategy Notes',
            'Market Data Briefings',
        ],
        icon: Newspaper,
        color: 'from-[#4cc7e8] to-[#2c7bbe]',
        available: true,
        popular: true,
        productLink: 'https://blacksnowholdings.com',
        productComission: '100',
        hasSubscription: true,
        monthlyOnly: false,
    },
    {
        id: 'InvoiceTool',
        apiName: 'InvoiceTool',
        name: 'Invoice & Contract',
        monthlyPrice: 24.99,
        yearlyPrice: 249.99,
        description: 'All-in-one contracts, signatures, and invoices—made simple',
        features: ['Instant Invoice Builder', 'Email Delivery', 'Invoice Dashboard', 'Create Invoice Contracts', 'Add Multiple Users', 'Recurring Invoices'],
        icon: FilePen,
        color: 'from-[#2c7bbe] to-[#4cc7e8]',
        available: true,
        popular: false,
        productLink: 'https://blacksnowholdings.com/InvoiceContract',
        productComission: '10',
        hasSubscription: true,
        monthlyOnly: false,
    },
    {
        id: 'DigitalBillboard',
        apiName: 'DigitalBillboard',
        name: 'Digital Billboard',
        monthlyPrice: 149.99,
        yearlyPrice: 599.99,
        description: 'Premium advertising placement across our platform',
        features: [
            'Billboard Creator',
            'Email & SMS Share Buttons',
            'Lead Capture Form',
            'Create Invoice Contracts',
            'Add Multiple Users',
            'Create Up to 4 Billboards',
        ],
        icon: Monitor,
        color: 'from-[#4cc7e8] to-[#2a8dcc]',
        available: true,
        popular: false,
        productLink: 'https://blacksnowholdings.com/advertising',
        productComission: '150',
        hasSubscription: true,
        monthlyOnly: false,
    },
    {
        id: 'Sales',
        apiName: 'EmailMarketing',
        name: 'Email CRM',
        monthlyPrice: 249.99,
        yearlyPrice: 1999.99,
        description: 'Comprehensive communication platform for your business',
        features: [
            'Email Campaigns & Automated Sequences',
            'SMS Campaigns & Sequences',
            'SMS Chatbot',
            'Email KPIs Dashboard',
            'Email Scheduling',
            'List Upload Tools',
        ],
        icon: MessageSquare,
        color: 'from-[#2a8dcc] to-[#2c7bbe]',
        available: true,
        popular: false,
        productLink: 'https://blacksnowholdings.com/emailMarketing',
        productComission: '100',
        hasSubscription: true,
        monthlyOnly: false,
    },
    {
        id: 'LightningSilver',
        apiName: 'LightningSilver',
        name: 'Lightning Silver',
        monthlyPrice: 9.99,
        yearlyPrice: 59.99,
        description:
            'Earn 25% lifetime commissions on every active subscriber you refer—automated payouts, KPI tracking, and Email & SMS CRM tools to help you grow consistently.',
        features: [
            '25% lifetime commissions (monthly + annual referrals)',
            'Automated payouts with no income cap',
            'Subscriber referral bonuses',
            'Commission table (monthly + annual) in one view',
            'KPI performance dashboard',
            'Email & SMS CRM included to promote offers',
        ],
        icon: Zap,
        color: 'from-[#4cc7e8] to-[#2c7bbe]',
        available: true,
        popular: false,
        productLink: 'https://blacksnowholdings.com/lightningSilver',
        productComission: '100',
        hasSubscription: true,
        monthlyOnly: true,
    },
    {
        id: 'LightningGold',
        apiName: 'LightningGold',
        name: 'Lightning Gold',
        monthlyPrice: 99.99,
        yearlyPrice: 2999.99,
        description:
            'Earn 75% lifetime commissions on every active subscriber you refer—automated payouts, KPI tracking, and Email & SMS CRM tools to maximize every sale.',
        features: [
            '75% lifetime commissions (monthly + annual referrals)',
            'Automated payouts with no income cap',
            'Subscriber referral bonuses',
            'Commission table (monthly + annual) in one view',
            'KPI performance dashboard',
            'Email & SMS CRM included to promote offers',
        ],
        icon: Star,
        color: 'from-[#fbbf24] to-[#f59e0b]',
        available: true,
        popular: false,
        productLink: 'https://blacksnowholdings.com/lightningGold',
        productComission: '100',
        hasSubscription: true,
        monthlyOnly: true,
    },
];

type BillingPeriod = 'monthly' | 'yearly';

type PricingComponentProps = {
    name: string;
    defaultBillingPeriod?: BillingPeriod;
    className?: string;
    asModal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function PricingComponent({ name, defaultBillingPeriod = 'monthly', className = '', asModal = false, open, onOpenChange }: PricingComponentProps) {
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);
    const [purchasedProducts, setPurchasedProducts] = useState<Record<string, string>>({});
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultBillingPeriod);

    const isPurchaseInFlightRef = useRef(false);

    // ── Terms state ──
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsCompleted, setTermsCompleted] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);

    const [internalOpen, setInternalOpen] = useState(false);
    const modalOpen = open ?? internalOpen;
    const setModalOpen = onOpenChange ?? setInternalOpen;

    const product = useMemo(() => {
        return PRODUCTS.find((p) => p.apiName === name || p.id === name) || null;
    }, [name]);

    // ── Per-product accent color ──
    const productAccent = useMemo(() => {
        if (!product) return null;
        if (product.id === 'SuperAffiliate') return '#ffd500';
        if (product.id === 'LightningSilver') return '#8d96c2';
        return null;
    }, [product]);

    const selectedTermsSlides = useMemo(() => BASE_TERMS_SLIDES, []);

    useEffect(() => {
        setShowTermsModal(false);
        setTermsCompleted(false);
        setTermsChecked(false);
    }, [product?.id]);

    useEffect(() => {
        setIsClient(true);

        const cookies = parseCookies();
        const id = cookies.id;
        if (!id) return;

        axios
            .get(`/api/v2/get-user-product-info/?id=${id}`)
            .then((response) => {
                if (response?.data?.message === 'No product found') setPurchasedProducts({});
                else setPurchasedProducts(response?.data?.data || {});
            })
            .catch((error) => {
                console.error('Error fetching product info:', error);
            });
    }, []);

    // ── Force monthly billing for monthlyOnly products ──
    const effectiveBillingPeriod: BillingPeriod = product?.monthlyOnly ? 'monthly' : billingPeriod;

    const getProductPrice = useCallback(
        (p: any) => {
            if (!p?.hasSubscription) return `$${p?.price}`;
            const period = p.monthlyOnly ? 'monthly' : billingPeriod;
            return period === 'monthly' ? `$${p?.monthlyPrice}` : `$${p?.yearlyPrice}`;
        },
        [billingPeriod]
    );

    const getProductPeriod = useCallback(
        (p: any) => {
            if (!p?.hasSubscription) return `/ ${p?.period}`;
            const period = p.monthlyOnly ? 'monthly' : billingPeriod;
            return period === 'monthly' ? '/Month' : '/Year';
        },
        [billingPeriod]
    );

    const getSavingsPercentage = useCallback((p: any) => {
        if (!p?.hasSubscription) return 0;
        const monthlyCost = p.monthlyPrice * 12;
        const yearlyCost = p.yearlyPrice;
        return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
    }, []);

    const fetchUserEmail = useCallback(async (userId: string) => {
        setIsLoadingEmail(true);
        try {
            const response = await axios.get(`/api/v2/getUserMail/?id=${userId}`);
            return response?.data?.email || null;
        } catch (error) {
            console.error('Error fetching:', error);
            return null;
        } finally {
            setIsLoadingEmail(false);
        }
    }, []);

    const handlePurchase = useCallback(
        async (p: any) => {
            if (!isClient || !p) return;

            const userId = localStorage.getItem('userId');
            if (!userId) {
                setShowSignupModal(true);
                return;
            }

            if (isPurchaseInFlightRef.current || isLoadingEmail) return;

            isPurchaseInFlightRef.current = true;
            setIsPurchasing(true);

            let role;
            switch (p.id) {
                case 'NewsLetter':
                    role = 'NewsLetter';
                    break;
                case 'InvoiceTool':
                    role = 'InvoiceTool';
                    break;
                case 'DigitalBillboard':
                    role = 'DigitalBillboard';
                    break;
                case 'LightningGold':
                    role = 'LightningGold';
                    break;
                case 'LightningSilver':
                    role = 'LightningSilver';
                    break;
                case 'Sales':
                    role = 'EmailMarketing';
                    break;
                default:
                    role = p.id;
            }

            try {
                localStorage.setItem('productLink', p.productLink);
                localStorage.setItem('comission', p.productComission);

                const email = await fetchUserEmail(userId);
                if (!email) {
                    isPurchaseInFlightRef.current = false;
                    setIsPurchasing(false);
                    return;
                }

                let productType = p.id;
                if (p.id === 'Sales') productType = 'EmailMarketing';

                const requestBody: any = {
                    id: Number(userId),
                    email,
                    productType,
                };

                if (p.hasSubscription) requestBody.period = effectiveBillingPeriod;

                const stripeResponse = await axios.post('/api/v1/stripe', requestBody);
                const checkoutUrl = stripeResponse?.data?.data;

                if (!checkoutUrl) {
                    throw new Error('Stripe checkout URL not found');
                }

                localStorage.setItem(
                    'pendingPurchase',
                    JSON.stringify({
                        productId: p.id,
                        apiName: productType,
                        role,
                        productLink: p.productLink,
                        comission: p.productComission,
                    })
                );

                window.location.href = checkoutUrl;
            } catch (error) {
                console.error('Error in handlePurchase:', error);
                isPurchaseInFlightRef.current = false;
                setIsPurchasing(false);
            }
        },
        [effectiveBillingPeriod, fetchUserEmail, isClient, isLoadingEmail]
    );
    // eslint-disable-next-line
    const handleUnsubscribe = useCallback((p: any) => {
        setSelectedProduct(p);
        setShowConfirmModal(true);
    }, []);

    const confirmUnsubscribe = useCallback(async () => {
        if (isLoadingUnsubscribe || !selectedProduct) return;

        const cookies = parseCookies();
        const id = cookies.id;
        if (!id) return;

        setIsLoadingUnsubscribe(true);
        try {
            const response = await axios.post(`/api/v2/cancel-subscription?id=${id}`, {
                product: selectedProduct.id,
            });

            if (response.status === 200) {
                setShowConfirmModal(false);
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    router.push('/');
                }, 3000);
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        } finally {
            setIsLoadingUnsubscribe(false);
        }
    }, [isLoadingUnsubscribe, selectedProduct, router]);

    if (!product) return null;

    const productStatus = purchasedProducts[product.apiName];
    const isPurchased = productStatus === 'Purchased';
    const isPaused = productStatus === 'Paused';
    const savings = getSavingsPercentage(product);
    const displayPeriod = getProductPeriod(product).replace('/', '').trim();

    // ── Resolve button accent for subtle glass glow ──
    const btnFrom = productAccent ?? '#2c7bbe';
    const btnTo = productAccent ?? '#4cc7e8';
    const isPurchaseButtonLoading = isPurchasing || isLoadingEmail;

    const CheckoutCard = ({ inModal }: { inModal: boolean }) => (
        <div className={`w-full ${!inModal ? 'mt-8 sm:mt-10 max-w-md mx-auto' : ''}`}>
            <div
                className={`relative rounded-[32px] border overflow-hidden flex flex-col backdrop-blur-[7px] ${
                    isPurchased ? 'border-emerald-400/25' : isPaused ? 'border-amber-400/35' : productAccent ? '' : 'border-white/10'
                } ${product.available ? '' : 'opacity-70'} ${inModal ? 'w-full' : ''}`}
                style={{
                    minHeight: UNIFIED_CARD_HEIGHT,
                    height: UNIFIED_CARD_HEIGHT,
                    background: 'linear-gradient(180deg, rgba(7,9,13,0.68) 0%, rgba(10,12,18,0.52) 45%, rgba(6,8,12,0.68) 100%)',
                    WebkitBackdropFilter: 'blur(8px) saturate(145%)',
                    backdropFilter: 'blur(8px) saturate(145%)',
                    boxShadow: isPurchased
                        ? '0 24px 60px rgba(0,0,0,0.7), 0 0 35px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)'
                        : isPaused
                        ? '0 24px 60px rgba(0,0,0,0.7), 0 0 35px rgba(245,158,11,0.16), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)'
                        : productAccent
                        ? `0 24px 60px rgba(0,0,0,0.7), 0 0 35px ${productAccent}22, inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)`
                        : '0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)',
                    borderColor: isPurchased
                        ? 'rgba(16,185,129,0.25)'
                        : isPaused
                        ? 'rgba(245,158,11,0.42)'
                        : productAccent
                        ? `${productAccent}30`
                        : 'rgba(255,255,255,0.10)',
                }}
            >
                {/* Top accent line */}
                {/* <div
                    className={`absolute top-0 left-0 w-full h-[3px] ${!productAccent && !isPurchased ? `bg-gradient-to-r ${product.color}` : ''}`}
                    style={
                        isPurchased
                            ? { background: 'linear-gradient(to right, #34d399, #10b981)' }
                            : productAccent
                                ? { background: `linear-gradient(90deg, transparent, ${productAccent}, transparent)` }
                                : undefined
                    }
                /> */}

                <div className='relative flex flex-1 flex-col px-6 py-6 sm:px-8 sm:py-7'>
                    <div className='relative grid grid-cols-[56px_minmax(0,1fr)_56px] items-start gap-3'>
                        {product.popular && (
                            <div className='absolute -top-1 right-0'>
                                <Badge className='uppercase bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-3 py-1 text-[10px] tracking-wide'>
                                    Popular
                                </Badge>
                            </div>
                        )}

                        <div className='h-14 w-14 rounded-2xl flex items-center justify-center justify-self-start'>
                            <Image src='/logocolored.png' alt='Logo' width={42} height={42} className='object-contain w-full h-full' />
                        </div>

                        <div className='min-w-0 flex flex-col items-center justify-center text-center pt-1'>
                            <h3 className='text-[24px] font-extrabold text-white leading-tight tracking-tight'>{product.name}</h3>
                        </div>

                        <div aria-hidden='true' className='h-14 w-14' />
                    </div>

                    {/* Billing toggle — hidden for monthlyOnly products */}
                    {product.hasSubscription && !product.monthlyOnly && (
                        <div className='mt-5 flex justify-center'>
                            <div className='flex w-full max-w-[220px] rounded-full border border-white/12 bg-white/5 p-1 shadow-inner'>
                                <button
                                    type='button'
                                    onClick={() => setBillingPeriod('monthly')}
                                    className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                        billingPeriod === 'monthly' ? 'bg-white/10 text-white shadow' : 'text-white/55 hover:text-white/85'
                                    }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setBillingPeriod('yearly')}
                                    className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                        billingPeriod === 'yearly' ? 'bg-white/10 text-white shadow' : 'text-white/55 hover:text-white/85'
                                    }`}
                                >
                                    Annual
                                </button>
                            </div>
                        </div>
                    )}

                    <div className='mt-6 flex flex-col items-center text-center'>
                        <div className='text-[46px] sm:text-[52px] leading-none font-black tracking-tight text-white'>{getProductPrice(product)}</div>
                        <div className='mt-2 text-sm font-bold tracking-wide text-white/75'>{displayPeriod}</div>

                        {billingPeriod === 'yearly' && product.hasSubscription && !product.monthlyOnly && savings > 0 && (
                            <div className='mt-3 inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300'>
                                Save {savings}% with yearly billing
                            </div>
                        )}
                    </div>

                    <div className='mt-6 h-px w-full bg-white/10' />

                    <div className='flex-1' />

                    <div className='mt-auto'>
                        <div className='flex items-start gap-3 text-sm text-white/60'>
                            <button
                                type='button'
                                disabled={!termsCompleted}
                                onClick={() => termsCompleted && setTermsChecked(!termsChecked)}
                                className='mt-0.5 h-5 w-5 flex-shrink-0 rounded-md border flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed'
                                style={{
                                    backgroundColor: termsChecked ? productAccent ?? '#4cc7e8' : 'transparent',
                                    borderColor: termsChecked
                                        ? productAccent ?? '#4cc7e8'
                                        : termsCompleted
                                        ? 'rgba(255,255,255,0.35)'
                                        : 'rgba(255,255,255,0.15)',
                                    opacity: termsCompleted ? 1 : 0.5,
                                }}
                            >
                                {termsChecked && <CheckCircle className='h-3.5 w-3.5 text-[#080b12]' strokeWidth={3} />}
                            </button>

                            <p className='leading-relaxed text-white/62'>
                                I agree to{' '}
                                <button
                                    type='button'
                                    onClick={() => setShowTermsModal(true)}
                                    className='text-sm font-semibold underline underline-offset-2 transition-colors hover:text-white'
                                    style={{ color: '#93c5fd' }}
                                >
                                    Terms and Conditions
                                </button>
                                {!termsCompleted && <span className='ml-1.5 text-xs text-white/35 italic'>(click to review)</span>}
                            </p>
                        </div>

                        <div className='mt-6'>
                            {product.available ? (
                                isPurchased ? (
                                    <Button
                                        size='lg'
                                        className='w-full rounded-xl border border-green-400/20 bg-green-500/15 text-green-200 py-6 font-bold transition cursor-not-allowed'
                                        disabled
                                    >
                                        Already Subscribed
                                    </Button>
                                ) : (
                                    <>
                                        {isPaused && (
                                            <div className='mb-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-center'>
                                                <p className='text-sm font-semibold text-amber-200'>Your {product.name} subscription is currently paused.</p>
                                                <p className='mt-1 text-xs text-amber-100/65'>Purchase it again to restore access.</p>
                                            </div>
                                        )}

                                        <Button
                                            size='lg'
                                            className={`w-full cursor-pointer rounded-xl border py-6 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-[7px] hover:scale-[1.01] active:scale-[0.99] ${
                                                isPaused ? 'text-amber-100' : 'text-white/75'
                                            }`}
                                            style={
                                                isPaused
                                                    ? {
                                                          background: 'linear-gradient(180deg, rgba(245,158,11,0.24) 0%, rgba(120,53,15,0.32) 100%)',
                                                          borderColor: 'rgba(251,191,36,0.55)',
                                                          WebkitBackdropFilter: 'blur(7px) saturate(145%)',
                                                          backdropFilter: 'blur(7px) saturate(145%)',
                                                          boxShadow:
                                                              'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.30), 0 14px 34px rgba(245,158,11,0.16)',
                                                      }
                                                    : {
                                                          background: `linear-gradient(180deg, rgba(42,47,53,0.54) 0%, rgba(15,18,23,0.66) 100%), radial-gradient(circle at top left, ${btnFrom}22 0%, transparent 45%), radial-gradient(circle at bottom right, ${btnTo}18 0%, transparent 42%)`,
                                                          borderColor: 'rgba(255,255,255,0.10)',
                                                          WebkitBackdropFilter: 'blur(7px) saturate(145%)',
                                                          backdropFilter: 'blur(7px) saturate(145%)',
                                                          boxShadow:
                                                              'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.38), 0 14px 34px rgba(0,0,0,0.42)',
                                                      }
                                            }
                                            onClick={() => handlePurchase(product)}
                                            disabled={isPurchaseButtonLoading || !termsChecked}
                                            title={!termsChecked ? 'Please agree to Terms and Conditions first' : undefined}
                                        >
                                            {isPurchaseButtonLoading ? (
                                                <>
                                                    <Loader2 className='h-5 w-5 mr-2 opacity-80 animate-spin' />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <DollarSign className='h-5 w-5 mr-2 opacity-70' />
                                                    {isPaused ? 'Purchase Again' : 'Purchase'}
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )
                            ) : (
                                <div className='w-full py-2 text-center'>
                                    <span className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-bold text-white/70'>
                                        <Clock className='h-5 w-5' />
                                        Coming Soon
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className='mt-4 flex items-center justify-center gap-2 text-xs text-white/40'>
                            <Lock className='h-4 w-4' />
                            Secure Stripe Checkout
                        </div>

                        {product.available && <p className='mt-3 text-center text-[11px] text-white/35'>VAT & local taxes may apply</p>}
                    </div>
                </div>
            </div>
        </div>
    );

    // ─── Modal Mode ───────────────────────────────────────────────────────────
    if (asModal) {
        return (
            <div className={className}>
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className='sm:max-w-[540px] p-0 border-0 bg-transparent shadow-none'>
                        <button
                            onClick={() => setModalOpen(false)}
                            className='absolute right-4 top-4 w-10 h-10 bg-black/40 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition z-10'
                            aria-label='Close'
                        >
                            <X className='w-5 h-5 text-white/70' />
                        </button>

                        <CheckoutCard inModal={true} />
                    </DialogContent>
                </Dialog>

                {/* ── Terms Slide Modal ── */}
                <TermsSlideModal
                    open={showTermsModal}
                    onOpenChange={setShowTermsModal}
                    onComplete={() => {
                        setTermsCompleted(true);
                    }}
                    slides={selectedTermsSlides}
                />

                {/* Signup Modal */}
                <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
                    <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-2xl'>
                        <button
                            onClick={() => setShowSignupModal(false)}
                            className='absolute right-4 top-4 w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                        >
                            <X className='w-5 h-5 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                        </button>

                        <DialogHeader className='space-y-6 text-center'>
                            <div className='flex flex-col items-center'>
                                <div className='w-16 h-16 mb-4 p-2 border-2 border-[#2c7bbe] rounded-2xl flex items-center justify-center shadow-xl'>
                                    <Image
                                        src='/logocolored.png'
                                        alt='Black Snow Logo'
                                        width={100}
                                        height={100}
                                        className='object-contain drop-shadow-2xl'
                                        priority
                                    />
                                </div>
                                <DialogTitle className='text-2xl font-black text-white'>Signup Required</DialogTitle>
                                <DialogDescription className='text-[#4cc7e8] font-semibold mt-2'>
                                    You can&apos;t access this feature until you sign up.
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className='py-4'>
                            <AuthModalTrigger
                                buttonText='Signup Now'
                                defaultView='signin'
                                sourceRoute={router.asPath?.split('?')[0] || router.pathname}
                                onSuccess={() => {
                                    setShowSignupModal(false);
                                    setModalOpen(true);
                                    return false;
                                }}
                            >
                                <Button className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold py-6 text-lg shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-2xl'>
                                    Signup Now
                                </Button>
                            </AuthModalTrigger>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Confirm Unsubscribe Modal */}
                <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                    <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-2xl'>
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className='absolute right-4 top-4 w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                        >
                            <X className='w-5 h-5 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                        </button>

                        <DialogHeader className='space-y-6'>
                            <div className='flex items-center space-x-4'>
                                <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl'>
                                    <Calendar className='w-6 h-6 text-white' />
                                </div>
                                <div>
                                    <DialogTitle className='text-2xl font-black text-white'>Confirm Unsubscribe</DialogTitle>
                                    <DialogDescription className='text-red-400 font-semibold'>
                                        Are you sure you want to unsubscribe from {selectedProduct?.name}?
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className='py-4 space-y-4'>
                            <p className='text-gray-300 text-center'>This action cannot be undone.</p>
                            <Button
                                onClick={confirmUnsubscribe}
                                className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-6 text-lg shadow-2xl shadow-red-500/40 transition-all duration-300 transform hover:scale-105 rounded-2xl'
                                disabled={isLoadingUnsubscribe}
                            >
                                {isLoadingUnsubscribe ? 'Processing...' : 'Confirm Unsubscribe'}
                                <ArrowRight className='w-5 h-5 ml-3 opacity-80' />
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Success Modal */}
                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-3xl backdrop-blur-2xl'>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className='absolute right-4 top-4 w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                        >
                            <X className='w-5 h-5 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                        </button>

                        <DialogHeader className='space-y-6 text-center'>
                            <div className='flex flex-col items-center'>
                                <div className='w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl mb-4'>
                                    <CheckCircle className='w-8 h-8 text-white' />
                                </div>
                                <DialogTitle className='text-2xl font-black text-white'>Unsubscribed Successfully</DialogTitle>
                                <DialogDescription className='text-green-400 font-semibold'>You have been removed from the plan.</DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className='py-4 text-center'>
                            <p className='text-gray-300'>Redirecting to home page...</p>
                        </div>
                    </DialogContent>
                </Dialog>

                <style jsx global>{`
                    @keyframes slide-in-up {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-slide-in-up {
                        animation: slide-in-up 0.5s ease-out forwards;
                        animation-fill-mode: both;
                    }
                    button,
                    .transition-all {
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 300ms;
                    }
                `}</style>
            </div>
        );
    }

    // ─── Inline Mode ──────────────────────────────────────────────────────────
    return (
        <div className={`w-full ${className}`}>
            <CheckoutCard inModal={false} />

            {/* ── Terms Slide Modal (inline mode) ── */}
            <TermsSlideModal
                open={showTermsModal}
                onOpenChange={setShowTermsModal}
                onComplete={() => {
                    setTermsCompleted(true);
                }}
                slides={selectedTermsSlides}
            />
        </div>
    );
}
