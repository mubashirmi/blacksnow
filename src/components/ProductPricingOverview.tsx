import {
    ArrowRight,
    BarChart3,
    BellRing,
    LayoutDashboard,
    Mail,
    Megaphone,
    Monitor,
    Percent,
    Plus,
    Receipt,
    Workflow,
    Zap,
    type LucideIcon,
} from 'lucide-react';

type ProductKey = 'business-invoice' | 'digital-billboard' | 'email-crm' | 'lightning-silver' | 'lightning-gold';
type ThemeKey = 'purple' | 'silver' | 'gold';

type Highlight = {
    icon: LucideIcon;
    value: string;
    description: string;
    detail: string;
};

type ProductOverview = {
    name: string;
    theme: ThemeKey;
    highlights: [Highlight, Highlight, Highlight, Highlight];
};

// Display-only plan information. Ensure the actual PricingComponent / checkout
// configuration and backend billing prices match the amounts shown here.
// The per-extra-email price is retained from the supplied mockup and should
// be checked against the billing rules before production deployment.
const PRODUCT_OVERVIEWS: Record<ProductKey, ProductOverview> = {
    'business-invoice': {
        name: 'Business Invoice',
        theme: 'purple',
        highlights: [
            { icon: Receipt, value: '$24.99 / mo', description: 'Unlimited invoices and contracts.', detail: 'Cancel anytime.' },
            { icon: LayoutDashboard, value: '1 Dashboard', description: 'Track invoices and payments.', detail: 'Included with the plan.' },
            { icon: BellRing, value: 'Auto Reminders', description: 'Automatic payment follow-ups.', detail: 'Spend less time chasing invoices.' },
            { icon: Percent, value: '8%', description: 'Platform fee.', detail: 'On collected payments only.' },
        ],
    },
    'digital-billboard': {
        name: 'Digital Billboard',
        theme: 'purple',
        highlights: [
            { icon: Monitor, value: '$149.99 / mo', description: 'Full digital billboard access.', detail: 'Cancel anytime.' },
            { icon: LayoutDashboard, value: '1 Dashboard', description: 'Manage your billboard campaigns.', detail: 'Included with the plan.' },
            { icon: Megaphone, value: '4 Campaigns', description: 'Run up to four billboards.', detail: 'Promote multiple offers at once.' },
            { icon: BarChart3, value: 'Proof of play', description: 'See what ran and when.', detail: 'Included with the plan.' },
        ],
    },
    'email-crm': {
        name: 'Email CRM Lite',
        theme: 'purple',
        highlights: [
            { icon: Mail, value: '$249.99 / mo', description: '50,000 emails included.', detail: 'Cancel anytime.' },
            { icon: LayoutDashboard, value: '1 Dashboard', description: 'Track campaigns and performance.', detail: 'Included with the plan.' },
            { icon: Workflow, value: 'Unlimited', description: 'Email automations and campaigns.', detail: 'Create workflows and follow-ups.' },
            { icon: Plus, value: '$0.005', description: 'Per additional email.', detail: 'After 50,000 emails.' },
        ],
    },
    'lightning-silver': {
        name: 'Lightning Silver',
        theme: 'silver',
        highlights: [
            { icon: Zap, value: '$9.99 / mo', description: 'Lightning Silver membership.', detail: 'Cancel anytime.' },
            { icon: Percent, value: '25%', description: 'Lifetime commissions on', detail: 'monthly and annual subscriptions.' },
            { icon: Mail, value: 'Email Marketing', description: 'Built-in email marketing tools.', detail: 'Create and manage campaigns.' },
            { icon: LayoutDashboard, value: '1 Dashboard', description: 'Track your referral earnings.', detail: 'Included with the plan.' },
        ],
    },
    'lightning-gold': {
        name: 'Lightning Gold',
        theme: 'gold',
        highlights: [
            { icon: Zap, value: '$99.99 / mo', description: 'Lightning Gold membership.', detail: 'Cancel anytime.' },
            { icon: Percent, value: '75%', description: 'Lifetime commissions on', detail: 'monthly and annual subscriptions.' },
            { icon: Mail, value: 'Email Marketing', description: 'Built-in email marketing tools.', detail: 'Create and manage campaigns.' },
            { icon: LayoutDashboard, value: '1 Dashboard', description: 'Track your referral earnings.', detail: 'Included with the plan.' },
        ],
    },
};

const THEMES: Record<
    ThemeKey,
    {
        label: string;
        border: string;
        icon: string;
        underline: string;
        button: string;
    }
> = {
    purple: {
        label: 'text-[#4333AF]',
        border: 'border-[#414A5D]',
        icon: 'text-[#4333AF] bg-[#4333AF]/10 border-[#414A5D]',
        underline: 'bg-[#4333AF]',
        button: 'bg-[#4333AF] text-white hover:bg-[#37299A] focus-visible:ring-[#4333AF]',
    },
    silver: {
        label: 'text-[#aeb6d6]',
        border: 'border-[#8d96c2]/50',
        icon: 'text-[#aeb6d6] bg-[#8d96c2]/10 border-[#8d96c2]/20',
        underline: 'bg-[#8d96c2]',
        button: 'bg-[#8d96c2] text-[#080a10] hover:bg-[#adb4d1] focus-visible:ring-[#8d96c2]',
    },
    gold: {
        label: 'text-[#ffd500]',
        border: 'border-[#ffd500]/40',
        icon: 'text-[#ffd500] bg-[#ffd500]/10 border-[#ffd500]/20',
        underline: 'bg-[#ffd500]',
        button: 'bg-[#ffd500] text-[#080a10] hover:bg-[#e2be00] focus-visible:ring-[#ffd500]',
    },
};

type ProductPricingOverviewProps = {
    product: ProductKey;
    onGetStarted: () => void;
};

/** A shared, responsive pricing summary shown immediately after each product hero. */
export function ProductPricingOverview({ product, onGetStarted }: ProductPricingOverviewProps) {
    const config = PRODUCT_OVERVIEWS[product];
    const colors = THEMES[config.theme];
    const isPurple = config.theme === 'purple';

    return (
        <section aria-label={`${config.name} pricing overview`} className='relative bg-[#050608] px-4 py-14 sm:px-6 sm:py-20 lg:px-8'>
            <div className='mx-auto w-full max-w-7xl'>
                <header className='mb-9 text-center sm:mb-12'>
                    <p className={`mb-3 text-xs font-bold uppercase tracking-[0.24em] sm:text-sm ${colors.label}`}>Pricing</p>
                    <h2 className='text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl'>What’s included</h2>
                    <p className='mt-4 text-base text-zinc-400 sm:text-lg'>One plan. No per-seat fees.</p>
                    <span
                        className={`mt-5 inline-flex max-w-full items-center justify-center rounded-full border px-5 py-2 text-sm font-medium sm:text-base ${colors.label} ${colors.border}`}
                    >
                        {config.name}
                    </span>
                </header>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5'>
                    {config.highlights.map(({ icon: Icon, value, description, detail }, index) => (
                        <article
                            key={`${product}-${index}`}
                            className={`flex h-full min-w-0 flex-col rounded-2xl border px-5 py-6 sm:px-6 sm:py-7 lg:px-4 xl:px-5 2xl:px-6 ${
                                isPurple ? 'border-[#414A5D] bg-[#0C0F18]' : 'border-[#30343c] bg-[#17191e]'
                            }`}
                        >
                            <div className='flex min-h-12 min-w-0 items-center gap-3 lg:gap-2 xl:gap-3'>
                                <span
                                    aria-hidden='true'
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border lg:h-9 lg:w-9 xl:h-11 xl:w-11 ${colors.icon}`}
                                >
                                    <Icon className='h-6 w-6 lg:h-5 lg:w-5 xl:h-6 xl:w-6' strokeWidth={1.8} />
                                </span>
                                <h3 className='min-w-0 whitespace-nowrap text-[clamp(1rem,4vw,1.35rem)] font-bold leading-tight tracking-tight text-white sm:text-[clamp(1rem,2.6vw,1.35rem)] lg:text-[clamp(0.875rem,1.5vw,1.125rem)] xl:text-[clamp(1rem,1.5vw,1.25rem)]'>
                                    {value}
                                </h3>
                            </div>
                            <span aria-hidden='true' className={`mt-6 mb-4 h-[2px] w-11 ${colors.underline}`} />
                            <p className='text-sm leading-relaxed text-zinc-300 sm:text-[0.95rem]'>{description}</p>
                            <p className='mt-1 text-sm leading-relaxed text-zinc-400 sm:text-[0.95rem]'>{detail}</p>
                        </article>
                    ))}
                </div>

                <div className='mt-9 flex justify-center sm:mt-11'>
                    <button
                        type='button'
                        onClick={onGetStarted}
                        className={`inline-flex min-h-14 w-full max-w-[330px] cursor-pointer items-center justify-center gap-3 rounded-xl px-8 py-3 text-base font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050608] sm:text-lg ${colors.button}`}
                    >
                        Get started
                        <ArrowRight className='h-5 w-5' aria-hidden='true' />
                    </button>
                </div>
            </div>
        </section>
    );
}
