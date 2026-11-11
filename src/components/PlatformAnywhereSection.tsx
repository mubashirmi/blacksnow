import type { ReactNode } from 'react';

/**
 * Self-contained vector icons for the platform comparison section.
 * Using native SVGs avoids undefined-component runtime errors caused by
 * icons that may not exist in the application's installed lucide-react version.
 */
type IconProps = {
    className?: string;
    color?: string;
    fill?: string;
    strokeWidth?: number;
};
type IconName =
    | 'bar-chart'
    | 'bell'
    | 'check'
    | 'database'
    | 'file'
    | 'grid'
    | 'hand'
    | 'dashboard'
    | 'send'
    | 'settings'
    | 'sliders'
    | 'user'
    | 'users'
    | 'wifi'
    | 'zap';

const iconShapes: Record<IconName, ReactNode> = {
    'bar-chart': (
        <>
            <path d='M3 3v18h18' />
            <path d='M7 17v-4M12 17V7M17 17v-8' />
        </>
    ),
    bell: (
        <>
            <path d='M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9' />
            <path d='M10 21h4' />
        </>
    ),
    check: <path d='m5 12 4 4L19 6' />,
    database: (
        <>
            <ellipse cx='12' cy='5' rx='9' ry='3' />
            <path d='M3 5v7c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12v7c0 1.7 4 3 9 3s9-1.3 9-3v-7' />
        </>
    ),
    file: (
        <>
            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z' />
            <path d='M14 2v6h6M8 13h8M8 17h8' />
        </>
    ),
    grid: (
        <>
            <rect x='3' y='3' width='8' height='8' rx='1' />
            <rect x='13' y='3' width='8' height='8' rx='1' />
            <rect x='3' y='13' width='8' height='8' rx='1' />
            <rect x='13' y='13' width='8' height='8' rx='1' />
        </>
    ),
    hand: (
        <>
            <path d='M8 13V6a2 2 0 0 1 4 0v5-1a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v5c0 4-2 6-6 6h-3c-2 0-3-1-4-3l-3-5a2 2 0 0 1 3-2l3 3' />
        </>
    ),
    dashboard: (
        <>
            <rect x='3' y='3' width='8' height='8' rx='1.5' />
            <rect x='13' y='3' width='8' height='5' rx='1.5' />
            <rect x='13' y='10' width='8' height='11' rx='1.5' />
            <rect x='3' y='13' width='8' height='8' rx='1.5' />
        </>
    ),
    send: (
        <>
            <path d='m22 2-7 20-4-9-9-4Z' />
            <path d='M22 2 11 13' />
        </>
    ),
    settings: (
        <>
            <path
                d='m10 2-.6 2.1-2 .9-2-.9L3 6.5l1.1 2-1 2.1L1 11v3l2.1.4 1 2.1-1.1 2L5.5 21l2-.9 2 .9.5 2h4l.5-2 2-.9 2 .9 2.5-2.5-1.1-2 1-2.1L23 14v-3l-2.1-.4-1-2.1 1.1-2L18.5 4l-2 .9-2-.9L14 2Z'
                transform='translate(0 -1) scale(1 .96)'
            />
            <circle cx='12' cy='12' r='3' />
        </>
    ),
    sliders: (
        <>
            <path d='M4 7h7m4 0h5M4 17h3m4 0h9' />
            <circle cx='13' cy='7' r='2' />
            <circle cx='9' cy='17' r='2' />
        </>
    ),
    user: (
        <>
            <circle cx='12' cy='8' r='4' />
            <path d='M4 21a8 8 0 0 1 16 0' />
        </>
    ),
    users: (
        <>
            <circle cx='9' cy='8' r='3' />
            <path d='M3 21v-2a6 6 0 0 1 12 0v2' />
            <path d='M16 5.5a3 3 0 0 1 0 5.5M19 21v-2a5 5 0 0 0-3-4.6' />
        </>
    ),
    wifi: (
        <>
            <path d='M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0' />
            <circle cx='12' cy='20' r='1' fill='currentColor' stroke='none' />
        </>
    ),
    zap: <path d='m13 2-10 12h8l-1 8 11-12h-8Z' />,
};

function makeIcon(name: IconName) {
    return function InlineIcon({ className, color = 'currentColor', fill = 'none', strokeWidth = 2 }: IconProps) {
        return (
            <svg
                className={className}
                viewBox='0 0 24 24'
                width='24'
                height='24'
                color={color}
                fill={fill}
                stroke='currentColor'
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
                focusable='false'
            >
                {iconShapes[name]}
            </svg>
        );
    };
}

type LucideIcon = ReturnType<typeof makeIcon>;
const BarChart3 = makeIcon('bar-chart');
const Bell = makeIcon('bell');
const Check = makeIcon('check');
const Database = makeIcon('database');
const FileText = makeIcon('file');
const Grid2X2 = makeIcon('grid');
const HandPointer = makeIcon('hand');
const LayoutDashboard = makeIcon('dashboard');
const Send = makeIcon('send');
const Settings = makeIcon('settings');
const SlidersHorizontal = makeIcon('sliders');
const UserRound = makeIcon('user');
const Users = makeIcon('users');
const Wifi = makeIcon('wifi');
const Zap = makeIcon('zap');

const BRAND_PURPLE = '#4333AF';
const CARD_BORDER = '#414A5D';
const CARD_BACKGROUND = '#0C0F18';

type Feature = { label: string; Icon: LucideIcon };
type Benefit = { label: string; note: string; progress: number };

const desktopFeatures: Feature[] = [
    { label: 'Full Dashboard', Icon: LayoutDashboard },
    { label: 'Advanced Tools', Icon: Settings },
    { label: 'Bulk Management', Icon: Database },
    { label: 'Multi-Tasking', Icon: Grid2X2 },
    { label: 'Complete Settings', Icon: SlidersHorizontal },
];

const mobileFeatures: Feature[] = [
    { label: 'Access Anywhere', Icon: Wifi },
    { label: 'Real-Time Notifications', Icon: Bell },
    { label: 'Quick Actions', Icon: Zap },
    { label: 'Touch Optimized', Icon: HandPointer },
    { label: 'Same Account All Devices', Icon: UserRound },
];

// Bar lengths are visual illustrations, not measured platform statistics.
const desktopBenefits: Benefit[] = [
    { label: 'Larger Workspace', progress: 73, note: 'More room to work.' },
    { label: 'Greater Productivity', progress: 67, note: 'Get more done.' },
    { label: 'Advanced Data Management', progress: 55, note: 'Handle large volumes.' },
    { label: 'Best for Power Users', progress: 70, note: 'Ideal for in-depth work.' },
];

const mobileBenefits: Benefit[] = [
    { label: 'Work from Anywhere', progress: 77, note: 'Stay connected.' },
    { label: 'Quick Access', progress: 52, note: 'Focus on what matters.' },
    { label: 'Stay Updated in Real-Time', progress: 68, note: 'Never miss an opportunity.' },
    { label: 'Same Account, All Devices', progress: 49, note: 'One seamless experience.' },
];

function MountainMark({ className = '' }: { className?: string }) {
    return (
        <svg viewBox='0 0 58 36' className={className} fill='none' aria-hidden='true'>
            <path d='M2 29 17 12l7 8L34 4l22 25-17-11-8 9-10-7-8 8-4-4-7 5Z' fill='currentColor' opacity='.88' />
            <path d='m17 12 6 9 10-17-5 13-6 9-5-14ZM34 4l22 25-18-12-4-13Z' fill='white' opacity='.4' />
        </svg>
    );
}

function DesktopArtwork() {
    return (
        <div
            className='relative mx-auto flex w-full max-w-[315px] flex-col items-center justify-center pt-2'
            aria-label='Desktop illustration of the Black Snow trading dashboard'
            role='img'
        >
            <div className='relative w-[92%] rounded-[9px] border-[5px] border-[#4333AF] bg-[#0C0F18] p-[7px] shadow-[0_0_16px_rgba(67,51,175,.22),inset_0_0_0_2px_#414A5D] sm:border-[6px]'>
                <div className='grid aspect-[1.8/1] grid-cols-[18%_1fr] gap-2 overflow-hidden bg-[#07090E] p-2'>
                    <div className='space-y-2 border-r border-[#414A5D] pr-2'>
                        <MountainMark className='mb-3 h-5 w-full text-[#4333AF]' />
                        <div className='h-1.5 w-full rounded-sm bg-[#4333AF]' />
                        {[70, 86, 68, 80, 53].map((width, index) => (
                            <div key={index} className='h-1 rounded-sm bg-[#414A5D]' style={{ width: `${width}%` }} />
                        ))}
                    </div>
                    <div className='flex min-w-0 flex-col gap-2'>
                        <div className='h-2 w-[72%] rounded-sm bg-[#414A5D]' />
                        <div className='grid min-h-0 flex-1 grid-cols-[1.15fr_.85fr] gap-2'>
                            <div className='flex items-end justify-around gap-1 rounded-sm bg-[#121521] px-2 pb-2 pt-3'>
                                {[35, 49, 69, 90].map((height, index) => (
                                    <div key={index} className='w-[16%] rounded-t-[1px] bg-[#4333AF]' style={{ height: `${height}%` }} />
                                ))}
                            </div>
                            <div className='grid place-items-center rounded-sm bg-[#121521]'>
                                <div
                                    className='aspect-square w-[60%] rounded-full'
                                    style={{ background: 'conic-gradient(#4333AF 0 30%, #34278F 30% 76%, #414A5D 76% 100%)' }}
                                >
                                    <div className='m-[27%] aspect-square rounded-full bg-[#121521]' />
                                </div>
                            </div>
                        </div>
                        <div className='grid h-[28%] grid-cols-2 gap-2'>
                            {[0, 1].map((index) => (
                                <div key={index} className='space-y-1 rounded-sm bg-[#121521] px-2 py-1.5'>
                                    <div className='h-1 w-[60%] rounded-full bg-[#414A5D]' />
                                    <div className='flex gap-1'>
                                        <i className='h-1.5 w-1.5 rounded-full bg-[#4333AF]' />
                                        <i className='h-1 w-[58%] rounded-full bg-[#414A5D]' />
                                    </div>
                                    <div className='flex gap-1'>
                                        <i className='h-1.5 w-1.5 rounded-full bg-[#4333AF]' />
                                        <i className='h-1 w-[46%] rounded-full bg-[#414A5D]' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className='h-[17px] w-[13%] bg-[#4333AF]' />
            <div className='h-[7px] w-[31%] rounded-t-[4px] bg-[#414A5D]' />
        </div>
    );
}

function DeviceTile({ Icon, label }: { Icon: LucideIcon; label: string }) {
    return (
        <div className='flex min-h-0 flex-col items-center justify-center gap-1 rounded-[5px] bg-[#151829] p-1 text-center'>
            <Icon className='h-[clamp(13px,2vw,22px)] w-[clamp(13px,2vw,22px)] text-[#4333AF]' fill='currentColor' strokeWidth={1.7} />
            <span className='text-[7px] leading-tight text-white/80 sm:text-[8px]'>{label}</span>
        </div>
    );
}

function MobileArtwork() {
    return (
        <div
            className='relative mx-auto flex w-full max-w-[315px] items-center justify-end pb-1 pt-4'
            aria-label='Tablet and smartphone illustration of the Black Snow platform'
            role='img'
        >
            <div className='w-[79%] rounded-[12px] border-[6px] border-[#4333AF] bg-[#0C0F18] p-[7px] shadow-[0_0_15px_rgba(67,51,175,.28)] sm:border-[8px]'>
                <div className='grid aspect-[1.4/1] grid-cols-2 grid-rows-2 gap-1.5 rounded-md bg-[#080A10] p-1.5'>
                    <DeviceTile Icon={BarChart3} label='Analytics' />
                    <DeviceTile Icon={Send} label='Campaigns' />
                    <DeviceTile Icon={FileText} label='Invoices' />
                    <DeviceTile Icon={Users} label='Account' />
                </div>
            </div>
            <div className='absolute bottom-0 left-0 w-[30%] rounded-[12px] border-[3px] border-[#4333AF] bg-[#0C0F18] p-[4px] shadow-[0_0_0_2px_#414A5D,0_0_14px_rgba(67,51,175,.24)]'>
                <div className='relative rounded-[6px] bg-[#080A10] p-1 pt-3'>
                    <span className='absolute left-1/2 top-[3px] h-[3px] w-5 -translate-x-1/2 rounded-full bg-[#414A5D]' />
                    <MountainMark className='mx-auto mb-2 h-6 w-[78%] text-[#4333AF]' />
                    {[BarChart3, Send, FileText, Users].map((Icon, index) => (
                        <div key={index} className='mb-1 flex h-[22px] items-center gap-2 rounded-[3px] bg-[#151829] px-2 last:mb-0'>
                            <Icon className='h-3.5 w-3.5 text-[#4333AF]' fill='currentColor' strokeWidth={1.6} />
                            <div className='h-1 w-[45%] rounded-full bg-[#414A5D]' />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FeatureStrip({ items, accent, mobile }: { items: Feature[]; accent: string; mobile: boolean }) {
    return (
        <div className='overflow-hidden rounded-[7px] border bg-[#080A10]' style={{ borderColor: CARD_BORDER }}>
            <p className='border-b px-4 py-1.5 text-[9px] font-bold uppercase tracking-[.25em] text-white/85' style={{ borderColor: CARD_BORDER }}>
                Key Features
            </p>
            <div className='grid grid-cols-5 py-2 sm:py-3'>
                {items.map(({ label, Icon }, index) => (
                    <div
                        key={label}
                        className={`flex min-w-0 flex-col items-center justify-start gap-1.5 px-0.5 text-center ${
                            index > 0 ? 'border-l border-[#414A5D]/65' : ''
                        }`}
                    >
                        <Icon
                            className='h-5 w-5 sm:h-7 sm:w-7'
                            color={CARD_BORDER}
                            fill={mobile && index !== 3 ? CARD_BORDER : 'none'}
                            strokeWidth={mobile ? 2 : 2.5}
                        />
                        <span className='flex min-h-[36px] max-w-[90px] items-start justify-center text-[9px] leading-[1.25] text-white/90 sm:text-[10px]'>
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BenefitStrip({ items, accent }: { items: Benefit[]; accent: string }) {
    return (
        <div className='mt-2 overflow-hidden rounded-[7px] border bg-[#080A10]' style={{ borderColor: CARD_BORDER }}>
            <p className='border-b px-4 py-1.5 text-[9px] font-bold uppercase tracking-[.25em] text-white/85' style={{ borderColor: CARD_BORDER }}>
                Top Benefits
            </p>
            <div className='space-y-1.5 px-2.5 py-2.5 sm:px-3'>
                {items.map(({ label, note, progress }) => (
                    <div
                        key={label}
                        className='grid grid-cols-[17px_minmax(0,1fr)_minmax(70px,.8fr)] items-center gap-2 text-[9px] sm:grid-cols-[18px_minmax(0,1.15fr)_minmax(75px,1.25fr)_minmax(0,.95fr)] sm:text-[10px]'
                    >
                        <div className='flex h-[17px] w-[17px] items-center justify-center rounded-full' style={{ background: CARD_BORDER }}>
                            <Check className='h-3 w-3 text-white' strokeWidth={3} />
                        </div>
                        <span className='truncate text-white/90' title={label}>
                            {label}
                        </span>
                        <div className='h-[13px] rounded-full border bg-black/35 p-[1px]' style={{ borderColor: CARD_BORDER }}>
                            <div
                                className='h-full rounded-full'
                                style={{
                                    width: `${progress}%`,
                                    background: CARD_BORDER,
                                    boxShadow: '0 0 6px rgba(65,74,93,.22)',
                                }}
                            />
                        </div>
                        <span className='hidden truncate pl-1 text-white/60 sm:block' title={note}>
                            {note}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PlatformCard({ mode }: { mode: 'desktop' | 'mobile' }) {
    const isMobile = mode === 'mobile';
    const accent = BRAND_PURPLE;
    const heading = isMobile ? 'Mobile & Tablet' : 'Desktop';
    return (
        <article
            className='relative flex min-w-0 flex-col rounded-[13px] border p-2 shadow-[inset_0_0_26px_rgba(0,0,0,.2)] sm:p-2.5'
            style={{ borderColor: CARD_BORDER, background: CARD_BACKGROUND }}
        >
            <div className='mb-2 flex h-[39px] min-w-0 items-center gap-2 sm:gap-3'>
                <div className='relative flex h-full shrink-0 items-center pl-4 pr-7 sm:pl-5 sm:pr-8' style={{ filter: `drop-shadow(0 0 4px ${accent}30)` }}>
                    <div
                        className='absolute inset-0 border'
                        style={{ clipPath: 'polygon(0 0,88% 0,100% 100%,0 100%)', background: `${accent}13`, borderColor: CARD_BORDER }}
                    />
                    <span
                        className='relative whitespace-nowrap text-[11px] font-bold uppercase tracking-[.15em] text-white sm:text-[13px] sm:tracking-[.25em]'
                        style={{ fontFamily: 'var(--font-michroma), sans-serif' }}
                    >
                        {heading}
                    </span>
                </div>
                <div className='h-px min-w-3 max-w-16 flex-1' style={{ background: accent }} />
                <span className='hidden whitespace-nowrap text-[7px] font-semibold uppercase tracking-[.15em] text-white/55 min-[390px]:block sm:text-[8px] sm:tracking-[.2em]'>
                    {isMobile ? 'Freedom Anywhere.' : 'Full Power. Total Control.'}
                </span>
            </div>

            <div
                className='grid min-h-[190px] grid-cols-[.9fr_1.4fr] items-center gap-1 overflow-hidden rounded-[9px] border px-3 py-3 sm:min-h-[200px] sm:grid-cols-[.85fr_1.35fr] sm:px-4'
                style={{ borderColor: CARD_BORDER, background: '#080A10' }}
            >
                <div className='min-w-0'>
                    <h3 className='text-[20px] font-black leading-[1.3] tracking-tight text-white sm:text-[24px]'>
                        Built for
                        <br />
                        <span style={{ color: accent }}>{isMobile ? 'Your Life.' : 'Deep Work.'}</span>
                    </h3>
                    <p className='mt-3 max-w-[200px] text-[10px] leading-[1.65] text-white/75 sm:text-xs'>
                        {isMobile
                            ? 'All the essential tools, optimized for on-the-go productivity.'
                            : 'Experience the complete Black Snow platform with maximum screen space and advanced tools.'}
                    </p>
                </div>
                {isMobile ? <MobileArtwork /> : <DesktopArtwork />}
            </div>

            <div className='mt-2 flex flex-1 flex-col'>
                <FeatureStrip items={isMobile ? mobileFeatures : desktopFeatures} accent={accent} mobile={isMobile} />
                <BenefitStrip items={isMobile ? mobileBenefits : desktopBenefits} accent={accent} />
            </div>
        </article>
    );
}

/** A compact, responsive two-panel section placed after the From Insight to Execution carousel. */
export function PlatformAnywhereSection() {
    return (
        <section aria-labelledby='platform-anywhere-title' className='relative mt-10 sm:mt-14'>
            <header className='mb-5 text-center sm:mb-6'>
                <div className='flex items-center justify-center gap-3'>
                    <span className='hidden h-px w-12 bg-[#4333AF] sm:block md:w-20' />
                    <h2
                        id='platform-anywhere-title'
                        className='text-[clamp(1.18rem,3vw,2.05rem)] uppercase leading-[1.35] tracking-[.015em] text-white'
                        style={{ fontFamily: 'var(--font-michroma), sans-serif', fontWeight: 400 }}
                    >
                        Same Platform. <span className='text-[#4333AF]'>More Ways</span> <span className='text-[#4333AF]'>to Win.</span>
                    </h2>
                    <span className='hidden h-px w-12 bg-[#4333AF] sm:block md:w-20' />
                </div>
                <p className='mt-1.5 text-[9px] font-semibold uppercase tracking-[.24em] text-white/55 sm:text-[11px] sm:tracking-[.42em]'>
                    Powerful tools. Anywhere you work.
                </p>
            </header>
            <div className='grid items-stretch gap-3 lg:grid-cols-2 lg:gap-4'>
                <PlatformCard mode='desktop' />
                <PlatformCard mode='mobile' />
            </div>
        </section>
    );
}

export default PlatformAnywhereSection;
