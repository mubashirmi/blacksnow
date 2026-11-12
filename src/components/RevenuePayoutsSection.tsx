import { BarChart2, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

const revenueCards = [
    {
        label: 'Payouts',
        title: 'Global Payouts',
        icon: Globe,
        body: `Earn commissions through a payout system designed for accuracy and speed. Generate revenue globally with multi-currency support, while automated payouts and transparent reporting give you full visibility and control over your growing earnings.`,
    },
    {
        label: 'Revenue',
        title: 'MRR + ARR',
        icon: BarChart2,
        body: `Generate consistent monthly recurring revenue that builds predictability and stability over time. Annual recurring revenue expands earning potential through larger upfront customer commitments. Use the Earnings Estimator to project commissions with precision.`,
    },
];

const ROUTE_THEMES = {
    '/lightningGold': { accent: '#ffd500', gradient: 'from-[#ffd500] via-[#ffd500] to-[#ffd500]' },
    '/lightningSilver': { accent: '#8d96c2', gradient: 'from-[#8d96c2] via-[#8d96c2] to-[#8d96c2]' },
    default: { accent: '#4cc7e8', gradient: 'from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc]' },
};

function useRouteTheme() {
    const [pathname, setPathname] = useState('');

    useEffect(() => {
        setPathname(window.location.pathname);
    }, []);

    return ROUTE_THEMES[pathname] ?? ROUTE_THEMES.default;
}

export function RevenuePayoutsSection() {
    const { accent, gradient } = useRouteTheme();

    return (
        <section className='relative py-16 sm:py-24 px-4 sm:px-6 md:px-8 bg-[#050608] overflow-hidden'>
            <div
                className='pointer-events-none absolute inset-0'
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(44,123,190,0.06) 0%, transparent 60%)' }}
            />
            <div
                className='pointer-events-none absolute inset-0'
                style={{
                    backgroundImage: `linear-gradient(rgba(44,123,190,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(44,123,190,0.025) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />

            <div className='container mx-auto max-w-7xl relative z-10'>
                <div className='text-center mb-12 sm:mb-14'>
                    <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight'>
                        Revenue & <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>Payout Growth</span>
                    </h2>
                    <p className='text-sm sm:text-base text-gray-400 max-w-2xl mx-auto'>
                        Built to support scalable commissions, recurring revenue, and transparent earnings visibility.
                    </p>
                </div>

                <div className='grid md:grid-cols-2 gap-5 lg:gap-6'>
                    {revenueCards.map(({ label, title, icon: Icon, body }) => (
                        <div
                            key={title}
                            className='relative rounded-2xl border border-[#414A5D] p-6 sm:p-7 transition-all duration-300 hover:border-white/15'
                            style={{
                                background: 'linear-gradient(180deg, rgba(13,17,23,0.98) 0%, rgba(11,19,32,0.98) 100%)',
                                boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                            }}
                        >
                            {/* <div
                                className='absolute top-0 left-0 right-0 h-[1px]'
                                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                            /> */}

                            <div className='flex items-center gap-4 mb-5'>
                                <div
                                    className='w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0'
                                    style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}35` }}
                                >
                                    <Icon className='w-5 h-5' style={{ color: accent }} />
                                </div>

                                <div>
                                    <p className='text-[11px] font-bold tracking-[0.22em] uppercase' style={{ color: accent }}>
                                        {label}
                                    </p>
                                    <h3 className='text-xl sm:text-2xl font-bold text-white mt-1 leading-tight'>{title}</h3>
                                </div>
                            </div>

                            <div className='h-px w-14 mb-5' style={{ background: `${accent}55` }} />

                            <p className='text-gray-400 text-sm sm:text-base leading-relaxed'>{body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
