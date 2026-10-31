import ComingSoonTrigger from '@/components/ComingSoonTrigger';
import HeroSection from '@/components/MainHeroSection';
import { ArrowRight, ArrowUp, BarChart3, Globe2, Settings, ShieldCheck, Star, Truck } from 'lucide-react';
import type { NextPage } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';

const BLUE = '#1768ff';
const BLUE_BRIGHT = '#2d7cff';
const GOLD = '#e6a91e';
const GOLD_LIGHT = '#f2ba2e';
// const GREEN = '#26a65b';
const PAGE_BG = '#040506';

function SectionNumber({ number }: { number: string }) {
    return (
        <div>
            <div className='h-[3px] w-11 rounded-full bg-[#1768ff]' />

            <p className='page-section-number mt-2 text-[49px] font-light leading-none tracking-[-0.045em] text-[#1768ff] sm:text-[55px]'>{number}</p>
        </div>
    );
}

function MetricIncrease({ value, text }: { value: string; text: string }) {
    return (
        <div className='flex items-center gap-2'>
            <ArrowUp className='h-5 w-5 fill-[#26a65b] text-[#26a65b]' strokeWidth={1} />

            <div>
                <p className='text-[17px] leading-none text-[#eeeeeb]'>{value}</p>
                <p className='mt-1 text-[12px] text-[#c0c1bd]'>{text}</p>
            </div>
        </div>
    );
}

function RevenueChart() {
    const points = [
        [48, 167],
        [148, 140],
        [249, 114],
        [348, 88],
        [448, 57],
        [548, 25],
    ];

    return (
        <div className='relative h-[275px] w-full sm:h-[320px]'>
            <svg viewBox='0 0 600 315' preserveAspectRatio='none' className='absolute inset-0 h-full w-full' aria-hidden='true'>
                <defs>
                    <linearGradient id='kpiRevenueFill' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor={BLUE} stopOpacity='0.46' />
                        <stop offset='100%' stopColor={BLUE} stopOpacity='0' />
                    </linearGradient>

                    <filter id='kpiBlueGlow' x='-100%' y='-100%' width='300%' height='300%'>
                        <feGaussianBlur stdDeviation='4' result='blur' />
                        <feMerge>
                            <feMergeNode in='blur' />
                            <feMergeNode in='SourceGraphic' />
                        </feMerge>
                    </filter>
                </defs>

                {[25, 90, 155, 220].map((y) => (
                    <line key={y} x1='43' y1={y} x2='580' y2={y} stroke='rgba(255,255,255,0.08)' strokeDasharray='2 3' />
                ))}

                <line x1='43' y1='25' x2='43' y2='220' stroke='rgba(255,255,255,0.30)' />
                <line x1='43' y1='220' x2='580' y2='220' stroke='rgba(255,255,255,0.30)' />

                <path d='M48 167 L148 140 L249 114 L348 88 L448 57 L548 25 L548 220 L48 220 Z' fill='url(#kpiRevenueFill)' />

                <polyline points='48,167 148,140 249,114 348,88 448,57 548,25' fill='none' stroke={BLUE} strokeWidth='3' vectorEffect='non-scaling-stroke' />

                {points.map(([cx, cy]) => (
                    <g key={`${cx}-${cy}`} filter='url(#kpiBlueGlow)'>
                        <circle cx={cx} cy={cy} r='8' fill='#ffffff' stroke={BLUE} strokeWidth='4' />
                    </g>
                ))}
            </svg>

            <div className='pointer-events-none absolute bottom-[46px] left-0 top-[10px] flex w-9 flex-col justify-between text-[12px] text-[#e3e3df] sm:text-[14px]'>
                <span>3B</span>
                <span>2B</span>
                <span>1B</span>
                <span>0</span>
            </div>

            <div className='absolute bottom-2 left-[47px] right-[6%] flex justify-between text-[13px] text-[#dededb] sm:text-[15px]'>
                <span>Q1</span>
                <span>Q2</span>
                <span>Q3</span>
                <span>Q4</span>
            </div>
        </div>
    );
}

function SatisfactionChart() {
    return (
        <div className='flex flex-col items-center gap-8 md:flex-row md:justify-center'>
            <div className='kpi-donut relative h-[220px] w-[220px] sm:h-[275px] sm:w-[275px]'>
                <div
                    className='absolute inset-0 rounded-full'
                    style={{
                        background: 'conic-gradient(#e6a91e 0deg 331deg, #1768ff 331deg 353deg, #aeb1b7 353deg 360deg)',
                    }}
                />

                <div className='absolute inset-[29px] flex items-center justify-center rounded-full bg-[#050607]'>
                    <div className='text-center'>
                        <div className='mx-auto h-11 w-11 rounded-t-full border-2 border-white border-b-0' />
                        <div className='mx-auto -mt-1 h-7 w-20 rounded-t-full border-2 border-white border-b-0' />

                        <div className='mt-1 flex justify-center'>
                            <Star className='h-7 w-7 text-[#1768ff]' />
                            <Star className='-ml-2 h-7 w-7 text-[#1768ff]' />
                            <Star className='-ml-2 h-7 w-7 text-[#1768ff]' />
                        </div>
                    </div>
                </div>
            </div>

            <div className='space-y-5'>
                {[
                    { value: '92%', label: 'Satisfied', color: GOLD },
                    { value: '6%', label: 'Neutral', color: BLUE },
                    { value: '2%', label: 'Dissatisfied', color: '#aeb1b7' },
                ].map((item) => (
                    <div key={item.label} className='flex items-start gap-4'>
                        <span className='mt-1.5 h-4 w-4 shrink-0 rounded-full' style={{ background: item.color }} />

                        <div>
                            <p className='text-[24px] leading-none text-[#f1f1ee]'>{item.value}</p>
                            <p className='mt-1 text-[16px] text-[#dadad6]'>{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EfficiencyRow({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
    return (
        <div className='grid grid-cols-[42px_92px_minmax(0,1fr)_48px] items-center gap-3'>
            <div className='flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#1768ff]'>{icon}</div>

            <p className='text-[15px] text-[#e5e5e2]'>{label}</p>

            <div className='relative h-[18px] rounded-[4px] bg-[#101218]'>
                <div
                    className='absolute inset-y-0 left-0 rounded-[4px]'
                    style={{
                        width: `${value}%`,
                        background: 'linear-gradient(90deg,#d99210,#f1b522)',
                        boxShadow: '5px 0 12px rgba(23,104,255,0.55)',
                    }}
                />

                <div className='absolute -right-2 top-1/2 h-[25px] w-[18px] -translate-y-1/2 bg-[#1768ff]/15 blur-[5px]' />
            </div>

            <p className='text-right text-[16px] text-[#eeeeea]'>{value}%</p>
        </div>
    );
}

function GlobalKpiPageContent() {
    return (
        <main
            className='global-kpi-page min-h-screen overflow-hidden text-white'
            style={{
                background:
                    'radial-gradient(circle at 70% 8%,rgba(23,104,255,0.035),transparent 25%),linear-gradient(180deg,#040506 0%,#050607 55%,#030405 100%)',
            }}
        >
            {/* HERO */}
            <section className='border-b border-white/[0.12]'>
                <div className='mx-auto grid w-full max-w-[1180px] items-center gap-8 px-5 pb-7 pt-8 sm:px-8 sm:pb-9 sm:pt-10 lg:grid-cols-[0.39fr_0.61fr] lg:gap-3 lg:px-9'>
                    <div>
                        <p className='text-[11px] font-medium uppercase tracking-[0.06em] sm:text-[12px]' style={{ color: GOLD_LIGHT }}>
                            Performance Overview
                        </p>

                        <h1 className='page-hero-title mt-3 text-[56px] font-semibold leading-[0.95] tracking-[-0.045em] text-[#f4f3ef] sm:text-[68px] lg:text-[71px]'>
                            GLOBAL <span style={{ color: BLUE }}>KPI</span>
                        </h1>

                        <div className='mt-5 h-[3px] w-[70px] bg-[#e6a91e]' />

                        <p className='mt-6 max-w-[380px] text-[17px] leading-[1.55] text-[#dcdcd8] sm:text-[19px]'>
                            Key performance metrics driving
                            <br className='hidden sm:block' /> global success and sustainable growth.
                        </p>

                        <div className='mt-8 flex items-center gap-5'>
                            <div className='flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full border border-[#1768ff]'>
                                <BarChart3 className='h-7 w-7 text-white' strokeWidth={1.5} />
                            </div>

                            <div>
                                <p className='text-[17px] text-[#ededE9]'>Data driven. People focused.</p>
                                <p className='mt-1 text-[17px]' style={{ color: BLUE_BRIGHT }}>
                                    Future ready.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='page-hero-art relative min-h-[200px] sm:min-h-[270px] lg:min-h-[350px]'>
                        <div
                            className='pointer-events-none absolute inset-[8%] blur-3xl'
                            style={{
                                background: 'radial-gradient(ellipse,rgba(23,104,255,0.10),transparent 70%)',
                            }}
                        />

                        <Image
                            src='/images/global-kpi-hero-map.png'
                            alt='Global KPI network'
                            fill
                            priority
                            quality={100}
                            sizes='(max-width:1023px) 100vw, 650px'
                            className='object-contain object-center'
                        />
                    </div>
                </div>
            </section>

            {/* REVENUE */}
            <section className='border-b border-white/[0.12]'>
                <div className='mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[0.36fr_0.64fr] lg:gap-12 lg:px-9'>
                    <div>
                        <SectionNumber number='01' />

                        <h2 className='page-section-title mt-3 text-[25px] font-semibold uppercase tracking-[0.025em] text-[#f0f0ec] sm:text-[28px]'>
                            Revenue Growth
                        </h2>

                        <p className='mt-4 max-w-[340px] text-[15px] leading-[1.6] text-[#d1d1ce] sm:text-[16px]'>
                            Strong top-line performance
                            <br />
                            driving consistent year-over-year growth.
                        </p>

                        <div className='mt-7 h-px max-w-[335px] bg-white/[0.14]' />

                        <div className='mt-7 flex flex-wrap items-end gap-8'>
                            <p className='text-[50px] font-light leading-none tracking-[-0.04em] text-[#f2f1ed] sm:text-[56px]'>$2.45B</p>

                            <MetricIncrease value='18.6%' text='vs. Last Year' />
                        </div>
                    </div>

                    <RevenueChart />
                </div>
            </section>

            {/* SATISFACTION */}
            <section className='border-b border-white/[0.12]'>
                <div className='mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[0.36fr_0.64fr] lg:gap-12 lg:px-9'>
                    <div>
                        <SectionNumber number='02' />

                        <h2 className='page-section-title mt-3 text-[25px] font-semibold uppercase tracking-[0.015em] text-[#f0f0ec] sm:text-[27px]'>
                            Customer Satisfaction
                        </h2>

                        <p className='mt-4 max-w-[345px] text-[15px] leading-[1.6] text-[#d1d1ce] sm:text-[16px]'>
                            Exceptional experiences delivered
                            <br />
                            to customers worldwide.
                        </p>

                        <div className='mt-8 flex items-center gap-10'>
                            <p className='text-[52px] font-light leading-none tracking-[-0.04em]' style={{ color: BLUE }}>
                                92%
                            </p>

                            <MetricIncrease value='7%' text='vs. Last Year' />
                        </div>
                    </div>

                    <SatisfactionChart />
                </div>
            </section>

            {/* EFFICIENCY */}
            <section className='border-b border-white/[0.12]'>
                <div className='mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[0.36fr_0.64fr] lg:gap-12 lg:px-9'>
                    <div>
                        <SectionNumber number='03' />

                        <h2 className='page-section-title mt-3 text-[25px] font-semibold uppercase tracking-[0.018em] text-[#f0f0ec] sm:text-[27px]'>
                            Operational Efficiency
                        </h2>

                        <p className='mt-4 max-w-[340px] text-[15px] leading-[1.6] text-[#d1d1ce] sm:text-[16px]'>
                            Optimizing processes to improve
                            <br />
                            quality, speed, and cost efficiency.
                        </p>

                        <div className='mt-7 flex items-center gap-10'>
                            <p className='text-[52px] font-light leading-none tracking-[-0.04em]' style={{ color: BLUE }}>
                                87%
                            </p>

                            <MetricIncrease value='6%' text='vs. Last Year' />
                        </div>
                    </div>

                    <div className='flex flex-col justify-center gap-5 py-4'>
                        <EfficiencyRow icon={<Settings className='h-5 w-5 text-white' strokeWidth={1.5} />} label='Process' value={87} />

                        <EfficiencyRow icon={<BarChart3 className='h-5 w-5 text-white' strokeWidth={1.5} />} label='Utilization' value={82} />

                        <EfficiencyRow icon={<ShieldCheck className='h-5 w-5 text-white' strokeWidth={1.5} />} label='Quality' value={91} />

                        <EfficiencyRow icon={<Truck className='h-5 w-5 text-white' strokeWidth={1.5} />} label='Delivery' value={85} />

                        <div className='ml-[145px] mr-[47px] mt-1 flex justify-between border-t border-white/[0.25] pt-2 text-[14px] text-[#dededb]'>
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* MARKET EXPANSION */}
            <section>
                <div className='mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[0.32fr_0.68fr] lg:gap-9 lg:px-9'>
                    <div>
                        <SectionNumber number='04' />

                        <h2 className='page-section-title mt-3 text-[25px] font-semibold uppercase tracking-[0.025em] text-[#f0f0ec] sm:text-[27px]'>
                            Market Expansion
                        </h2>

                        <p className='mt-4 max-w-[320px] text-[15px] leading-[1.6] text-[#d1d1ce] sm:text-[16px]'>
                            Expanding our global footprint
                            <br />
                            and entering high-potential markets.
                        </p>

                        <div className='mt-7 flex items-center gap-5'>
                            <span className='text-[51px] font-light leading-none' style={{ color: BLUE }}>
                                24
                            </span>

                            <span className='text-[15px] leading-[1.35] text-[#e1e1dd]'>
                                New Markets
                                <br />
                                Entered
                            </span>
                        </div>
                    </div>

                    <div className='relative aspect-[664/255] min-h-[210px] w-full'>
                        <Image
                            src='/images/global-kpi-hero-map.png'
                            alt='Global market expansion'
                            fill
                            quality={100}
                            sizes='(max-width:1023px) 100vw, 700px'
                            className='object-contain object-center'
                        />
                    </div>
                </div>

                <div className='mx-auto flex w-full max-w-[1180px] flex-col items-center justify-between gap-5 px-5 pb-7 sm:px-8 md:flex-row lg:px-9'>
                    <div className='flex items-center gap-4'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full border border-[#1768ff]'>
                            <Globe2 className='h-5 w-5 text-white' strokeWidth={1.4} />
                        </div>

                        <p className='text-center text-[11px] uppercase tracking-[0.24em] text-[#c4c5c2] md:text-left sm:text-[12px]'>
                            Data Driven. People Focused. <span style={{ color: BLUE_BRIGHT }}>Future Ready.</span>
                        </p>
                    </div>

                    <ComingSoonTrigger
                        ariaLabel='Get started'
                        className='group flex h-[48px] w-[200px] shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-[5px] bg-[#1768ff] px-5 text-[11px] font-medium uppercase tracking-[0.03em] text-white shadow-[0_0_24px_rgba(23,104,255,0.22)] transition-all duration-200 hover:bg-[#2d7cff]'
                    >
                        Get Started
                        <ArrowRight className='h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1' />
                    </ComingSoonTrigger>
                </div>
            </section>
        </main>
    );
}

const GlobalKpiPage: NextPage = () => (
    <>
        <HeroSection />
        <GlobalKpiPageContent />

        <style jsx global>{`
            .global-kpi-page {
                font-family: 'Roboto', Arial, Helvetica, sans-serif;
                background-color: ${PAGE_BG};
                -webkit-font-smoothing: antialiased;
                text-rendering: geometricPrecision;
            }

            .global-kpi-page h1,
            .global-kpi-page h2,
            .global-kpi-page h3,
            .global-kpi-page h4,
            .global-kpi-page h5,
            .global-kpi-page h6 {
                font-family: var(--font-michroma), sans-serif !important;
                font-weight: 400 !important;
                overflow-wrap: normal;
                word-break: normal;
            }

            .global-kpi-page button,
            .global-kpi-page a {
                -webkit-tap-highlight-color: transparent;
            }

            .global-kpi-page *,
            .global-kpi-page *::before,
            .global-kpi-page *::after {
                box-sizing: border-box;
                min-width: 0;
            }

            @media (max-width: 639px) {
                .global-kpi-page {
                    overflow-wrap: normal;
                    word-break: normal;
                }

                .global-kpi-page .page-hero-title {
                    font-size: clamp(1.9rem, 8.6vw, 2.25rem) !important;
                    line-height: 1.13 !important;
                    letter-spacing: -0.02em !important;
                }

                .global-kpi-page .page-section-number {
                    font-size: 1.95rem !important;
                    line-height: 1 !important;
                    letter-spacing: -0.02em !important;
                }

                .global-kpi-page .page-section-title {
                    font-size: clamp(1rem, 5vw, 1.22rem) !important;
                    line-height: 1.3 !important;
                    letter-spacing: -0.01em !important;
                }

                .global-kpi-page .page-hero-features {
                    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    gap: 0.85rem !important;
                    margin-top: 1.35rem !important;
                }

                .global-kpi-page .page-hero-features > * {
                    min-width: 0;
                }

                .global-kpi-page .page-hero-features > * > div:first-child {
                    width: 2.75rem !important;
                    height: 2.75rem !important;
                }

                .global-kpi-page .page-hero-features h3 {
                    margin-top: 0.55rem !important;
                    font-size: 0.64rem !important;
                    line-height: 1.35 !important;
                }

                .global-kpi-page .page-hero-features p {
                    margin-top: 0.35rem !important;
                    font-size: 0.5rem !important;
                    line-height: 1.35 !important;
                }

                .global-kpi-page .page-hero-art {
                    min-height: 11.5rem !important;
                    margin-top: 0.25rem !important;
                }

                .global-kpi-page .page-mobile-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    gap: 0.75rem !important;
                }

                .global-kpi-page .page-mobile-grid > * {
                    min-height: 0 !important;
                    border-left: 0 !important;
                    border-right: 0 !important;
                    border-top: 0 !important;
                    border-bottom: 0 !important;
                }

                .global-kpi-page .page-compact-card {
                    min-height: 0 !important;
                    padding: 0.9rem 0.65rem !important;
                }

                .global-kpi-page .kpi-donut {
                    transform: scale(0.9);
                    transform-origin: center;
                }

                .global-kpi-page p,
                .global-kpi-page li,
                .global-kpi-page td,
                .global-kpi-page th,
                .global-kpi-page dd,
                .global-kpi-page dt {
                    overflow-wrap: normal;
                    word-break: normal;
                }
            }
        `}</style>
    </>
);

export default GlobalKpiPage;
