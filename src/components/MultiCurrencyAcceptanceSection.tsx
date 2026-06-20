import { CreditCard, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const multiCurrencyCards = [
    {
        label: 'Multi-Currency Support',
        title: 'Accept 135+ Currencies',
        icon: CreditCard,
        body: `Accept payments in 135+ currencies while giving customers a seamless checkout experience worldwide. Expand beyond local markets, increase recurring revenue potential, and grow a connected international subscriber base with secure recurring billing built for long-term business scaling fast.`,
    },
    {
        label: 'International Subscribers',
        title: 'Scale Global Revenue',
        icon: Users,
        body: `Build recurring revenue across multiple countries using one connected platform designed for global scaling, international billing, and long-term subscriber growth. Manage worldwide customers while increasing Recurring Revenue and Annual Recurring Revenue through subscription payments fast.`,
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

export function MultiCurrencyAcceptanceSection() {
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
                    <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight'>
                        Global Multi-Currency <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>Acceptance</span>
                    </h2>

                    <p className='text-sm sm:text-base text-gray-400 max-w-3xl mx-auto'>
                        Expand beyond local markets while growing recurring revenue through a globally connected subscriber base.
                    </p>
                </div>

                {/* <div
                    className='relative rounded-2xl border border-white/10 p-6 sm:p-8 mb-6 lg:mb-7 overflow-hidden'
                    style={{
                        background: 'linear-gradient(180deg, rgba(13,17,23,0.98) 0%, rgba(11,19,32,0.98) 100%)',
                        boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                    }}
                >
                    <div
                        className='absolute top-0 left-0 right-0 h-[1px]'
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />

                    <div className='grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-10 items-center'>
                        <div
                            className='relative rounded-2xl border border-white/10 min-h-[230px] sm:min-h-[300px] flex items-center justify-center overflow-hidden'
                            style={{
                                background: `radial-gradient(circle at center, ${accent}18 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.55) 100%)`,
                            }}
                        >
                            <div
                                className='absolute inset-0 opacity-40'
                                style={{
                                    backgroundImage: `linear-gradient(${accent}14 1px, transparent 1px), linear-gradient(90deg, ${accent}14 1px, transparent 1px)`,
                                    backgroundSize: '32px 32px',
                                }}
                            />

                            <Globe2 className='relative z-10 w-28 h-28 sm:w-40 sm:h-40' style={{ color: accent }} />

                            <div
                                className='absolute w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-3xl opacity-20'
                                style={{ backgroundColor: accent }}
                            />
                        </div>

                        <div>
                            <p className='text-[11px] font-bold tracking-[0.22em] uppercase mb-3' style={{ color: accent }}>
                                Worldwide Billing
                            </p>

                            <h3 className='text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4'>
                                Sell Globally. Bill Seamlessly.
                            </h3>

                            <p className='text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl'>
                                Accept international customers, support global subscription payments, and build a stronger recurring
                                revenue system across multiple countries through one connected platform.
                            </p>
                        </div>
                    </div>
                </div> */}

                <div className='grid md:grid-cols-2 gap-5 lg:gap-6'>
                    {multiCurrencyCards.map(({ label, title, icon: Icon, body }) => (
                        <div
                            key={title}
                            className='relative rounded-2xl border border-white/10 p-6 sm:p-7 transition-all duration-300 hover:border-white/15'
                            style={{
                                background: 'linear-gradient(180deg, rgba(13,17,23,0.98) 0%, rgba(11,19,32,0.98) 100%)',
                                boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                            }}
                        >
                            <div
                                className='absolute top-0 left-0 right-0 h-[1px]'
                                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                            />

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
