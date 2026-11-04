'use client';

import AuthModal from '@/components/AuthModal';

import EmailCRMSlideshow from '@/components/EmailCRMSlideshow';

import { PricingComponent } from '@/components/PricingComponent';

import { ProductPricingOverview } from '@/components/ProductPricingOverview';

import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import lottie from 'lottie-web';

import {
    BarChart3,
    Calendar,
    ChevronDown,
    ChevronRight,
    Clock,
    Edit3,
    Globe,
    Mail,
    MailOpen,
    Megaphone,
    MousePointer2,
    Send,
    Target,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';

import { useRouter } from 'next/router';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { PointerEvent as ReactPointerEvent } from 'react';

/**

 * Interactive *demo* dashboard (real JSX, Tailwind and SVG; no screenshots/images).

 * Deterministic sample activity is grouped when users change the date range or chart interval.

 * Replace createSampleHistory() with API data to show real analytics.

 */

type DashboardRange = '7d' | '30d' | '90d' | '365d';

type DashboardInterval = 'Daily' | 'Weekly' | 'Monthly';

type DashboardDatum = {
    date: Date;

    sent: number;

    opens: number;

    clicks: number;

    conversions: number;

    subscribers: number;
};

type DashboardBucket = {
    key: string;

    start: Date;

    end: Date;

    sent: number;

    opens: number;
};

type DashboardSeries = 'sent' | 'opens';

const DASHBOARD_RANGES: { value: DashboardRange; label: string; days: number; defaultInterval: DashboardInterval }[] = [
    { value: '7d', label: 'Last 7 Days', days: 7, defaultInterval: 'Daily' },

    { value: '30d', label: 'Last 30 Days', days: 30, defaultInterval: 'Daily' },

    { value: '90d', label: 'Last 90 Days', days: 90, defaultInterval: 'Weekly' },

    { value: '365d', label: 'Last 12 Months', days: 365, defaultInterval: 'Monthly' },
];

const DASHBOARD_INTERVALS: Record<DashboardRange, DashboardInterval[]> = {
    '7d': ['Daily'],

    '30d': ['Daily', 'Weekly'],

    '90d': ['Daily', 'Weekly', 'Monthly'],

    '365d': ['Weekly', 'Monthly'],
};

const dashboardCampaigns = [
    { title: 'Product Launch', portion: 0.36, openRate: 0.342, theme: 'blue' },

    { title: 'Welcome Series', portion: 0.23, openRate: 0.418, theme: 'purple' },

    { title: 'Special Offer', portion: 0.15, openRate: 0.298, theme: 'gold' },
] as const;

const dashboardNumber = (value: number) => new Intl.NumberFormat('en-US').format(Math.round(value));

const dashboardCompact = (value: number) =>
    value >= 1000000
        ? `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
        : value >= 1000
        ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`
        : String(Math.round(value));

const dashboardDayLabel = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

function createSampleHistory(today: Date): DashboardDatum[] {
    // 730-day reproducible DEMO fixture, ending at the current UTC calendar day.

    // These are NOT user data or measurements fetched from a server.

    return Array.from({ length: 730 }, (_, i) => {
        const date = new Date(today.getTime() - (729 - i) * 86400000);

        const sent = Math.round(3150 + i * 1.55 + 630 * Math.sin(i * 0.31) + 260 * Math.cos(i * 0.93) + (i % 9 === 0 ? 440 : 0));

        const openRate = 0.326 + 0.023 * Math.sin(i * 0.19);

        const clickRate = 0.068 + 0.008 * Math.sin(i * 0.23 + 0.5);

        return {
            date,

            sent,

            opens: Math.round(sent * openRate),

            clicks: Math.round(sent * clickRate),

            conversions: Math.round(sent * (0.0067 + 0.0008 * Math.cos(i * 0.23))),

            subscribers: Math.round(12842 * Math.exp(-0.0035 * (729 - i))),
        };
    });
}

function groupDashboardHistory(days: DashboardDatum[], interval: DashboardInterval): DashboardBucket[] {
    const groups = new Map<string, DashboardBucket>();

    days.forEach((day) => {
        const date = day.date;

        const monday = new Date(date.getTime() - ((date.getUTCDay() + 6) % 7) * 86400000);

        const key =
            interval === 'Daily' ? date.toISOString().slice(0, 10) : interval === 'Weekly' ? monday.toISOString().slice(0, 10) : date.toISOString().slice(0, 7);

        const found = groups.get(key);

        if (found) {
            found.end = date;

            found.sent += day.sent;

            found.opens += day.opens;
        } else {
            groups.set(key, { key, start: date, end: date, sent: day.sent, opens: day.opens });
        }
    });

    return [...groups.values()];
}

function dashboardBucketLabel(bucket: DashboardBucket, interval: DashboardInterval): string {
    if (interval === 'Monthly') return bucket.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

    if (interval === 'Weekly') return `${dashboardDayLabel(bucket.start)} – ${dashboardDayLabel(bucket.end)}`;

    return dashboardDayLabel(bucket.start);
}

function dashboardSmoothPath(points: { x: number; y: number }[]): string {
    if (!points.length) return '';

    return points.slice(1).reduce((path, point, index) => {
        const previous = points[index];

        const midpoint = (point.x + previous.x) / 2;

        return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
    }, `M ${points[0].x} ${points[0].y}`);
}

function EmailMarketingDashboard() {
    const [range, setRange] = useState<DashboardRange>('30d');

    const [interval, setInterval] = useState<DashboardInterval>('Daily');

    const [visibleSeries, setVisibleSeries] = useState<Record<DashboardSeries, boolean>>({ sent: true, opens: true });

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const [today] = useState(() => {
        const now = new Date();

        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    });

    const demoHistory = useMemo(() => createSampleHistory(today), [today]);

    const selectedDays = DASHBOARD_RANGES.find((option) => option.value === range)!.days;

    const currentDays = useMemo(() => demoHistory.slice(-selectedDays), [demoHistory, selectedDays]);

    const previousDays = useMemo(() => demoHistory.slice(-selectedDays * 2, -selectedDays), [demoHistory, selectedDays]);

    const buckets = useMemo(() => groupDashboardHistory(currentDays, interval), [currentDays, interval]);

    const sumOf = (days: DashboardDatum[], field: 'sent' | 'opens' | 'clicks' | 'conversions') => days.reduce((sum, day) => sum + day[field], 0);

    const sent = sumOf(currentDays, 'sent');

    const opens = sumOf(currentDays, 'opens');

    const clicks = sumOf(currentDays, 'clicks');

    const conversions = sumOf(currentDays, 'conversions');

    const oldSent = sumOf(previousDays, 'sent');

    const oldOpens = sumOf(previousDays, 'opens');

    const oldClicks = sumOf(previousDays, 'clicks');

    const oldConversions = sumOf(previousDays, 'conversions');

    const openRate = sent ? (opens / sent) * 100 : 0;

    const clickRate = sent ? (clicks / sent) * 100 : 0;

    const oldOpenRate = oldSent ? (oldOpens / oldSent) * 100 : 0;

    const oldClickRate = oldSent ? (oldClicks / oldSent) * 100 : 0;

    const currentSubscribers = currentDays[currentDays.length - 1].subscribers;

    const pastSubscribers = previousDays[previousDays.length - 1].subscribers;

    const changePercent = (now: number, before: number) => `${now >= before ? '+' : ''}${(before ? (now / before - 1) * 100 : 0).toFixed(1)}%`;

    const metricCards = [
        { label: 'Emails Sent', value: dashboardNumber(sent), growth: changePercent(sent, oldSent), icon: Send, color: '#4333AF' },

        { label: 'Open Rate', value: `${openRate.toFixed(1)}%`, growth: changePercent(openRate, oldOpenRate), icon: MailOpen, color: '#4333AF' },

        { label: 'Click Rate', value: `${clickRate.toFixed(1)}%`, growth: changePercent(clickRate, oldClickRate), icon: MousePointer2, color: '#4333AF' },

        { label: 'Conversions', value: dashboardNumber(conversions), growth: changePercent(conversions, oldConversions), icon: Users, color: '#4333AF' },
    ];

    const maximum = Math.max(1, ...buckets.flatMap((bucket) => [visibleSeries.sent ? bucket.sent : 0, visibleSeries.opens ? bucket.opens : 0]));

    const magnitude = Math.pow(10, Math.floor(Math.log10(maximum)));

    const maximumAxis = Math.ceil(maximum / (magnitude / 2)) * (magnitude / 2);

    const toX = (index: number) => 42 + (index * 550) / Math.max(1, buckets.length - 1);

    const toY = (value: number) => 131 - (value / maximumAxis) * 104;

    const sentPoints = buckets.map((bucket, index) => ({ x: toX(index), y: toY(bucket.sent) }));

    const opensPoints = buckets.map((bucket, index) => ({ x: toX(index), y: toY(bucket.opens) }));

    const sentPath = dashboardSmoothPath(sentPoints);

    const opensPath = dashboardSmoothPath(opensPoints);

    const sentArea = `${sentPath} L 592 131 L 42 131 Z`;

    const opensArea = `${opensPath} L 592 131 L 42 131 Z`;

    const displayedIndex = Math.max(0, Math.min(buckets.length - 1, hoveredIndex ?? selectedIndex ?? Math.round((buckets.length - 1) * 0.66)));

    const highlighted = buckets[displayedIndex];

    const selectedX = toX(displayedIndex);

    const tooltipX = Math.max(46, Math.min(463, selectedX - 55));

    const tickIndices = [...new Set(Array.from({ length: 6 }, (_, i) => Math.round((i * (buckets.length - 1)) / 5)))];

    const firstSubscriber = currentDays[0].subscribers;

    const subscriberDiff = Math.max(1, currentSubscribers - firstSubscriber);

    const subscriberSamples = Array.from({ length: 14 }, (_, index) => {
        const point = currentDays[Math.round((index * (currentDays.length - 1)) / 13)];

        return 18 + ((point.subscribers - firstSubscriber) / subscriberDiff) * 82;
    });

    const subscriberGrowth = changePercent(currentSubscribers, pastSubscribers);

    const subscriberTickLabels = [0, 3, 6, 9, 13].map((i) => dashboardDayLabel(currentDays[Math.round((i * (currentDays.length - 1)) / 13)].date));

    const updateRange = (newRange: DashboardRange) => {
        setRange(newRange);

        setInterval(DASHBOARD_RANGES.find((option) => option.value === newRange)!.defaultInterval);

        setHoveredIndex(null);

        setSelectedIndex(null);
    };

    const toggleSeries = (series: DashboardSeries) => {
        const other: DashboardSeries = series === 'sent' ? 'opens' : 'sent';

        if (visibleSeries[series] && !visibleSeries[other]) return; // leave at least one line visible

        setVisibleSeries((existing) => ({ ...existing, [series]: !existing[series] }));
    };

    const selectPointerIndex = (event: ReactPointerEvent<SVGSVGElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();

        const x = ((event.clientX - rect.left) * 600) / rect.width;

        return Math.max(0, Math.min(buckets.length - 1, Math.round(((x - 42) / 550) * (buckets.length - 1))));
    };

    return (
        <div
            aria-label='Interactive sample email marketing dashboard'
            className='relative w-full min-w-0 max-w-[650px] rounded-[24px] border border-[#414A5D] bg-[#0C0F18] p-[7px] shadow-[0_0_30px_rgba(67,51,175,0.12),inset_0_0_0_1px_rgba(67,51,175,0.09)] sm:p-[10px] lg:max-w-none xl:mr-auto xl:w-[82%] xl:p-[7px]'
        >
            <div className='min-w-0 rounded-[19px] border border-[#414A5D] bg-[#0C0F18] p-[9px] sm:p-[15px] xl:p-[11px]'>
                {/* Native dropdown: keyboard and touch accessible; changes all demo statistics. */}

                <div className='mb-3 flex min-w-0 items-center justify-between gap-2 sm:mb-4 xl:mb-2.5'>
                    <div className='flex min-w-0 items-center gap-2 sm:gap-3 xl:gap-2'>
                        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] shadow-[0_0_16px_rgba(67,51,175,0.14)] sm:h-11 sm:w-11 xl:h-10 xl:w-10 bg-[#4333AF]'>
                            <Mail aria-hidden='true' className='h-5 w-5 text-white sm:h-6 sm:w-6 xl:h-5 xl:w-5' strokeWidth={1.7} />
                        </div>

                        <div className='min-w-0'>
                            <h2 className='truncate text-[13px] font-bold leading-tight tracking-wide text-white sm:text-base lg:text-sm xl:text-[15px]'>
                                Email Marketing
                            </h2>

                            <p className='mt-0.5 truncate text-[7px] font-bold uppercase leading-tight tracking-[0.17em] text-[#4333AF] sm:text-[9px] lg:text-[8px] xl:text-[8px]'>
                                Campaign Performance
                            </p>
                        </div>
                    </div>

                    <label className='relative shrink-0'>
                        <span className='sr-only'>Statistics date range</span>

                        <select
                            aria-label='Statistics date range'
                            value={range}
                            onChange={(event) => updateRange(event.target.value as DashboardRange)}
                            style={{ colorScheme: 'dark' }}
                            className='h-9 max-w-[120px] cursor-pointer appearance-none rounded-[9px] border border-[#414A5D] bg-[#0C0F18] py-2 pl-2 pr-6 text-[9px] text-[#d7e6f4] outline-none focus-visible:ring-2 focus-visible:ring-[#4333AF] sm:max-w-none sm:pl-3 sm:pr-7 sm:text-[11px] lg:text-[10px] xl:box-border xl:h-9 xl:min-w-[142px] xl:py-0 xl:text-[11px] xl:leading-5'
                        >
                            {DASHBOARD_RANGES.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <ChevronDown aria-hidden='true' className='pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#4333AF]' />
                    </label>
                </div>

                <div className='mb-2 grid grid-cols-4 gap-1.5 sm:mb-3 sm:gap-2 xl:mb-2 xl:gap-2.5'>
                    {metricCards.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <div
                                key={metric.label}
                                className='min-w-0 rounded-[9px] border border-[#414A5D] bg-[#0C0F18] px-[5px] py-[8px] sm:rounded-xl sm:px-3 sm:py-3 lg:px-2 xl:px-[10px] xl:py-[8px]'
                            >
                                <div className='mb-1 flex items-start justify-between gap-0.5 xl:mb-[3px]'>
                                    <span className='whitespace-nowrap text-[7px] leading-[1.1] text-[#a1b0c0] sm:text-[10px] lg:text-[8px] xl:text-[9px]'>
                                        {metric.label}
                                    </span>

                                    <Icon
                                        aria-hidden='true'
                                        className='h-[11px] w-[11px] shrink-0 sm:h-4 sm:w-4 lg:h-3 lg:w-3 xl:h-[13px] xl:w-[13px]'
                                        style={{ color: metric.color }}
                                        strokeWidth={1.65}
                                    />
                                </div>

                                {/* On phones these stay stacked, exactly as before. On wide

                                    screens the trend occupies the bottom-right of the value row. */}

                                <div className='xl:flex xl:min-w-0 xl:items-end xl:justify-between xl:gap-1.5'>
                                    <p className='whitespace-nowrap text-[12px] font-extrabold leading-tight tracking-tight text-white sm:text-lg lg:text-[15px] xl:text-[17px]'>
                                        {metric.value}
                                    </p>

                                    <p
                                        className={`mt-1 flex items-center whitespace-nowrap text-[8px] font-semibold leading-tight sm:text-[11px] lg:text-[9px] xl:mb-[1px] xl:mt-0 xl:shrink-0 xl:text-[9px] ${
                                            metric.growth.startsWith('-') ? 'text-[#ff888b]' : 'text-[#11ddae]'
                                        }`}
                                    >
                                        <TrendingUp
                                            aria-hidden='true'
                                            className={`mr-0.5 h-[9px] w-[9px] shrink-0 sm:h-3 sm:w-3 xl:h-[10px] xl:w-[10px] ${
                                                metric.growth.startsWith('-') ? 'rotate-180' : ''
                                            }`}
                                        />

                                        {metric.growth}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile keeps the original stacking; on extra-wide screens the graph

                    sits beside subscriber growth, with campaigns running across the bottom. */}

                <div className='xl:grid xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:items-stretch xl:gap-2.5'>
                    <div className='mb-2 min-w-0 rounded-[10px] border border-[#414A5D] bg-[#0C0F18] px-[7px] pb-1 pt-2 sm:mb-3 sm:rounded-xl sm:px-3 sm:pt-3 lg:px-2 xl:col-start-1 xl:row-start-1 xl:mb-0 xl:flex xl:flex-col xl:justify-between xl:px-[10px] xl:pb-0 xl:pt-[8px]'>
                        <div className='flex min-w-0 items-center justify-between gap-1.5'>
                            <h3 className='whitespace-nowrap text-[10px] font-bold text-[#edf5ff] sm:text-[13px] lg:text-[11px] xl:text-[12px]'>
                                Campaign Performance
                            </h3>

                            <div className='flex min-w-0 items-center gap-1 sm:gap-2'>
                                <button
                                    type='button'
                                    aria-pressed={visibleSeries.sent}
                                    onClick={() => toggleSeries('sent')}
                                    className={`flex items-center gap-1 whitespace-nowrap rounded text-[7px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4333AF] sm:text-[9px] lg:text-[8px] ${
                                        visibleSeries.sent ? 'text-[#b9c8d8]' : 'text-[#4333AF]'
                                    }`}
                                >
                                    <span className='h-[5px] w-[5px] rounded-full bg-[#4333AF] sm:h-[7px] sm:w-[7px]' /> Emails Sent
                                </button>

                                <button
                                    type='button'
                                    aria-pressed={visibleSeries.opens}
                                    onClick={() => toggleSeries('opens')}
                                    className={`flex items-center gap-1 whitespace-nowrap rounded text-[7px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4333AF] sm:text-[9px] lg:text-[8px] ${
                                        visibleSeries.opens ? 'text-[#b9c8d8]' : 'text-[#4333AF]'
                                    }`}
                                >
                                    <span className='h-[5px] w-[5px] rounded-full bg-[#4333AF] sm:h-[7px] sm:w-[7px]' /> Opens
                                </button>

                                <label className='relative hidden min-[390px]:block'>
                                    <span className='sr-only'>Graph interval</span>

                                    <select
                                        aria-label='Graph interval'
                                        value={interval}
                                        onChange={(event) => {
                                            setInterval(event.target.value as DashboardInterval);

                                            setHoveredIndex(null);

                                            setSelectedIndex(null);
                                        }}
                                        style={{ colorScheme: 'dark' }}
                                        className='w-[64px] cursor-pointer appearance-none rounded-md border border-[#414A5D] bg-[#0C0F18] py-1 pl-1.5 pr-4 text-[8px] text-[#c5d7e7] outline-none focus-visible:ring-2 focus-visible:ring-[#4333AF] sm:w-[77px] sm:text-[9px] lg:w-[65px] lg:text-[8px]'
                                    >
                                        {DASHBOARD_INTERVALS[range].map((choice) => (
                                            <option key={choice} value={choice}>
                                                {choice}
                                            </option>
                                        ))}
                                    </select>

                                    <ChevronDown
                                        aria-hidden='true'
                                        className='pointer-events-none absolute right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[#4333AF]'
                                    />
                                </label>
                            </div>
                        </div>

                        <svg
                            className='block h-auto w-full touch-pan-y focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4333AF] xl:h-[142px] 2xl:h-[148px]'
                            viewBox='0 0 600 163'
                            preserveAspectRatio='none'
                            role='img'
                            tabIndex={0}
                            aria-label={`Sample ${interval.toLowerCase()} chart for ${
                                DASHBOARD_RANGES.find((option) => option.value === range)!.label
                            }. Select a point with the pointer or arrow keys.`}
                            onPointerMove={(event) => {
                                if (event.pointerType !== 'touch') setHoveredIndex(selectPointerIndex(event));
                            }}
                            onPointerLeave={() => setHoveredIndex(null)}
                            onPointerDown={(event) => setSelectedIndex(selectPointerIndex(event))}
                            onKeyDown={(event) => {
                                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                                    event.preventDefault();

                                    setSelectedIndex(Math.max(0, Math.min(buckets.length - 1, displayedIndex + (event.key === 'ArrowRight' ? 1 : -1))));
                                }
                            }}
                        >
                            <defs>
                                <linearGradient id='email-crm-demo-area-blue' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='0%' stopColor='#4333AF' stopOpacity='0.34' />

                                    <stop offset='100%' stopColor='#4333AF' stopOpacity='0.015' />
                                </linearGradient>

                                <linearGradient id='email-crm-demo-area-purple' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='0%' stopColor='#4333AF' stopOpacity='0.28' />

                                    <stop offset='100%' stopColor='#4333AF' stopOpacity='0.015' />
                                </linearGradient>
                            </defs>

                            {[0, 1, 2, 3].map((tick) => {
                                const y = 131 - (tick * 104) / 3;

                                return (
                                    <g key={tick}>
                                        <line x1='42' y1={y} x2='592' y2={y} stroke='#152b3d' strokeWidth='1' opacity='0.8' />

                                        <text x='36' y={y + 4} textAnchor='end' fill='#aabccc' fontSize='11'>
                                            {dashboardCompact((maximumAxis * tick) / 3)}
                                        </text>
                                    </g>
                                );
                            })}

                            {tickIndices.map((index) => (
                                <g key={index}>
                                    <line x1={toX(index)} y1='27' x2={toX(index)} y2='131' stroke='#142537' strokeWidth='1' opacity='0.6' />

                                    <text
                                        x={toX(index)}
                                        y='154'
                                        textAnchor={index === 0 ? 'start' : index === buckets.length - 1 ? 'end' : 'middle'}
                                        fill='#aabccc'
                                        fontSize='11'
                                    >
                                        {interval === 'Monthly'
                                            ? dashboardBucketLabel(buckets[index], interval).replace(' 20', ' ')
                                            : dashboardDayLabel(buckets[index].start)}
                                    </text>
                                </g>
                            ))}

                            {visibleSeries.sent && (
                                <>
                                    <path d={sentArea} fill='url(#email-crm-demo-area-blue)' />

                                    <path d={sentPath} fill='none' stroke='#4333AF' strokeWidth='2.6' strokeLinecap='round' />
                                </>
                            )}

                            {visibleSeries.opens && (
                                <>
                                    <path d={opensArea} fill='url(#email-crm-demo-area-purple)' />

                                    <path d={opensPath} fill='none' stroke='#4333AF' strokeWidth='2.25' strokeLinecap='round' />
                                </>
                            )}

                            <line x1={selectedX} y1='27' x2={selectedX} y2='131' stroke='#c0eaff' strokeWidth='1' strokeDasharray='4 5' opacity='0.6' />

                            {visibleSeries.sent && (
                                <circle cx={selectedX} cy={sentPoints[displayedIndex].y} r='4.5' fill='#4333AF' stroke='#e6faff' strokeWidth='1.5' />
                            )}

                            {visibleSeries.opens && (
                                <circle cx={selectedX} cy={opensPoints[displayedIndex].y} r='4' fill='#4333AF' stroke='#e6dbff' strokeWidth='1.3' />
                            )}

                            <g transform={`translate(${tooltipX}, 18)`}>
                                <rect width='128' height='73' rx='9' fill='#07121e' stroke='#35526a' strokeWidth='1' />

                                <text x='11' y='17' fill='#e8f4ff' fontSize='11'>
                                    {dashboardBucketLabel(highlighted, interval)}
                                </text>

                                <circle cx='13' cy='32' r='4' fill='#4333AF' />

                                <text x='24' y='36' fill='#e2f0fb' fontSize='11'>
                                    {dashboardNumber(highlighted.sent)} Sent
                                </text>

                                <circle cx='13' cy='53' r='4' fill='#4333AF' />

                                <text x='24' y='57' fill='#e2f0fb' fontSize='11'>
                                    {dashboardNumber(highlighted.opens)} Opens
                                </text>
                            </g>
                        </svg>
                    </div>

                    <div className='grid min-w-0 grid-cols-2 gap-2 sm:gap-3 xl:contents'>
                        <div className='min-w-0 rounded-[10px] border border-[#414A5D] bg-[#0C0F18] p-[7px] sm:rounded-xl sm:p-3 lg:p-2 xl:col-span-2 xl:row-start-2 xl:p-[9px]'>
                            <div className='mb-1.5 flex items-center justify-between gap-1 xl:mb-1'>
                                <h3 className='truncate text-[10px] font-bold text-white sm:text-[13px] lg:text-[11px] xl:text-[12px]'>Top Campaigns</h3>

                                <ChevronRight aria-hidden='true' className='h-3.5 w-3.5 shrink-0 text-[#4333AF]' />
                            </div>

                            <div className='space-y-1.5 sm:space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-2.5 xl:gap-y-0 xl:space-y-0'>
                                {dashboardCampaigns.map((campaign) => {
                                    const sentForCampaign = Math.round(sent * campaign.portion);

                                    return (
                                        <div key={campaign.title} className='flex min-w-0 items-center gap-1.5'>
                                            <div
                                                className={`relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-[#414A5D] sm:h-9 sm:w-9 lg:h-7 lg:w-7 xl:h-[30px] xl:w-[30px] ${
                                                    campaign.theme === 'blue' ? ' ' : campaign.theme === 'purple' ? ' ' : ' '
                                                } bg-[#4333AF]`}
                                            >
                                                <div className='absolute inset-1 rounded-[3px] border border-[#414A5D]' />

                                                <Mail aria-hidden='true' className='relative h-3.5 w-3.5 text-white/70 sm:h-4 sm:w-4' strokeWidth={1.3} />
                                            </div>

                                            <div className='min-w-0 flex-1'>
                                                <p className='truncate text-[8px] font-semibold leading-tight text-[#eaf4ff] sm:text-[11px] lg:text-[9px] xl:text-[10px]'>
                                                    {campaign.title}
                                                </p>

                                                <p className='mt-0.5 truncate text-[6.5px] leading-tight text-[#91a5b8] sm:text-[9px] lg:text-[7px] xl:text-[8px]'>
                                                    {dashboardNumber(sentForCampaign)} sent | {(campaign.openRate * 100).toFixed(1)}% open
                                                </p>
                                            </div>

                                            <span className='shrink-0 rounded-full border border-[#414A5D] bg-[#083a2c] px-[4px] py-[2px] text-[6px] leading-none text-[#31e9b4] sm:px-2 sm:text-[8px] lg:px-1 lg:text-[7px] xl:py-[1px] xl:text-[7px]'>
                                                Active
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className='min-w-0 rounded-[10px] border border-[#414A5D] bg-[#0C0F18] p-[7px] sm:rounded-xl sm:p-3 lg:p-2 xl:col-start-2 xl:row-start-1 xl:flex xl:flex-col xl:justify-between xl:p-[9px]'>
                            <div className='flex items-center justify-between gap-1'>
                                <h3 className='truncate text-[10px] font-bold text-white sm:text-[13px] lg:text-[11px] xl:text-[12px]'>Subscriber Growth</h3>

                                <ChevronRight aria-hidden='true' className='h-3.5 w-3.5 shrink-0 text-[#4333AF]' />
                            </div>

                            <div className='mt-1 flex items-end justify-between gap-1'>
                                <div className='min-w-0'>
                                    <p className='text-[15px] font-extrabold leading-tight tracking-tight text-white sm:text-[22px] lg:text-[18px] xl:text-[21px]'>
                                        {dashboardNumber(currentSubscribers)}
                                    </p>

                                    <p className='whitespace-nowrap text-[6.5px] text-[#9fb1c4] sm:text-[9px] lg:text-[7px] xl:text-[8px]'>Total Subscribers</p>
                                </div>

                                <div className='shrink-0 text-right'>
                                    <p
                                        className={`whitespace-nowrap text-[9px] font-bold sm:text-[12px] lg:text-[10px] xl:text-[11px] ${
                                            subscriberGrowth.startsWith('-') ? 'text-[#ff888b]' : 'text-[#0fdf9d]'
                                        }`}
                                    >
                                        ↗ {subscriberGrowth}
                                    </p>

                                    <p className='whitespace-nowrap text-[6px] text-[#8197a9] sm:text-[8px] lg:text-[7px]'>vs. previous period</p>
                                </div>
                            </div>

                            <div className='relative mt-2 h-[45px] sm:mt-3 sm:h-[72px] lg:h-[53px] xl:mt-1.5 xl:h-[60px]'>
                                <div className='pointer-events-none absolute inset-0 flex flex-col justify-between'>
                                    {[0, 1, 2, 3].map((line) => (
                                        <div key={line} className='border-t border-[#414A5D]' />
                                    ))}
                                </div>

                                <div className='relative z-[1] flex h-full items-end gap-[3px] sm:gap-[4px]'>
                                    {subscriberSamples.map((height, index) => (
                                        <div
                                            key={index}
                                            className='min-w-0 flex-1 rounded-t-[2px] transition-[height] duration-300'
                                            style={{
                                                height: `${height}%`,

                                                background: `linear-gradient(to top, #4333AF, ${index > 10 ? '#4333AF' : index > 6 ? '#4333AF' : '#4333AF'})`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className='mt-1 flex justify-between gap-1 text-[6.5px] leading-tight text-[#8da2b7] sm:text-[9px] lg:text-[7px] xl:text-[8px] xl:mt-0.5'>
                                {subscriberTickLabels.map((label, index) => (
                                    <span key={index}>{label}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <p className='mt-2 text-right text-[8px] leading-none text-[#6f8ba0] sm:text-[9px] lg:text-[8px] xl:mt-1.5 xl:text-[8px]'>
                    Illustrative demo data • not live analytics
                </p>
            </div>
        </div>
    );
}

function EmailMarketing() {
    // eslint-disable-next-line
    const [userId, setUserId] = useState<string | null>(null);

    const [slideshowOpen, setSlideshowOpen] = useState(false);

    const [authOpen, setAuthOpen] = useState(false);

    const [pricingOpen, setPricingOpen] = useState(false);

    const [openPricingAfterAuth, setOpenPricingAfterAuth] = useState(false);

    const LottieAnimation = ({ src, loop = true, autoplay = true, className, style }) => {
        const containerRef = useRef<HTMLDivElement>(null);

        const router = useRouter();

        useEffect(() => {
            setUserId(localStorage.getItem('userId'));

            const trackRefIdClick = async () => {
                const { refId } = router.query;

                if (refId) {
                    localStorage.setItem('referredby', refId as string);

                    try {
                        const currentUrl = `https://blacksnowholdings.com/emailMarketing`;

                        const response = await fetch(`/api/v2/clicks/?id=${refId}`, {
                            method: 'PUT',

                            headers: { 'Content-Type': 'application/json' },

                            body: JSON.stringify({ productLink: currentUrl }),
                        });

                        if (response.ok) console.log('RefId click tracked successfully');
                        else console.error('Failed to track refId click');
                    } catch (error) {
                        console.error('Error tracking refId click:', error);
                    }
                }
            };

            if (router.isReady) trackRefIdClick();
        }, [router.isReady, router.query]);

        useEffect(() => {
            if (containerRef.current) {
                const animation = lottie.loadAnimation({
                    container: containerRef.current,

                    renderer: 'svg',

                    loop,

                    autoplay,

                    path: src,
                });

                return () => animation.destroy();
            }
        }, [src, loop, autoplay]);

        return <div ref={containerRef} className={className} style={style} />;
    };

    const handlePurchaseClick = () => {
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') || localStorage.getItem('id') : null;

        if (storedUserId) {
            setAuthOpen(false);

            setOpenPricingAfterAuth(false);

            setPricingOpen(true);

            return;
        }

        setPricingOpen(false);

        setOpenPricingAfterAuth(false);

        setAuthOpen(true);
    };

    const handleAuthSuccess = () => {
        setPricingOpen(false);

        setOpenPricingAfterAuth(true);

        setAuthOpen(false);

        return false;
    };

    useEffect(() => {
        if (authOpen || !openPricingAfterAuth) return;

        const timer = window.setTimeout(() => {
            setOpenPricingAfterAuth(false);

            setPricingOpen(true);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [authOpen, openPricingAfterAuth]);

    const features = [
        {
            title: 'Email Campaigns & Automated Sequence',

            description: 'Launch broadcast emails and build automated flows that follow your timing, rules, and goals.',

            icon: Edit3,

            color: 'bg-[#4333AF]',

            benefits: ['Drag-and-drop email builder', 'Professional templates library', 'Mobile-responsive designs', 'Brand customization tools'],
        },

        {
            title: 'Build SMS Campaigns & Sequences',

            description: 'Create SMS broadcasts and automated message sequences that complement your email strategy.',

            icon: Send,

            color: 'bg-[#4333AF]',

            benefits: ['Mass email distribution', 'SMS campaign management', 'Contact list segmentation', 'Delivery optimization'],
        },

        {
            title: 'SMS Chatbot',

            description: 'Guide customers efficiently with a responsive SMS chatbot.',

            icon: Calendar,

            color: 'bg-[#4333AF]',

            benefits: ['Advanced scheduling options', 'Time zone optimization', 'Automated drip campaigns', 'Behavioral triggers'],
        },

        {
            title: 'List Upload Tool',

            description: 'Upload and organize your contacts instantly for clean segmentation and targeted outreach.',

            icon: Users,

            color: 'bg-[#4333AF]',

            benefits: ['Team collaboration tools', 'Role-based permissions', 'Shared campaign access', 'No user limits'],
        },

        {
            title: 'Email KPIs Dashboard',

            description: 'Track performance with clear data: deliveries, opens, clicks, and engagement metrics.',

            icon: Users,

            color: 'bg-[#4333AF]',

            benefits: ['Team collaboration tools', 'Role-based permissions', 'Shared campaign access', 'No user limits'],
        },

        {
            title: 'Email Scheduling Overview',

            description: 'View all scheduled emails in one simple timeline so you know exactly what’s going out next.',

            icon: Users,

            color: 'bg-[#4333AF]',

            benefits: ['Team collaboration tools', 'Role-based permissions', 'Shared campaign access', 'No user limits'],
        },
    ];

    const additionalFeatures = [
        {
            title: 'Consistent Delivery',

            description: 'Delivers consistent results with a clean, high-deliverability framework.',

            icon: Globe,
        },

        {
            title: 'Simplified Automation',

            description: 'Simplifies automation so you can work faster with fewer steps.',

            icon: Zap,
        },

        {
            title: 'Email + SMS Platform',

            description: 'Handles both email and SMS inside one streamlined platform.',

            icon: Megaphone,
        },

        {
            title: 'Real Performance Data',

            description: 'Shows real performance data so you always know what’s working.',

            icon: BarChart3,
        },

        {
            title: 'Easy Segmentation',

            description: 'Makes list uploads and segmentation effortless.',

            icon: Target,
        },

        {
            title: 'Organized Scheduling',

            description: 'Keeps your entire messaging schedule organized and predictable.',

            icon: Clock,
        },
    ];

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hero Section: HTML/CSS dashboard on the left; existing JSON animation on the right. */}

            <section className='relative px-4 py-10 sm:px-6 sm:py-16 md:px-8 lg:py-11 xl:py-10'>
                <div className='relative z-10 mx-auto w-full max-w-[1660px]'>
                    <div className='grid min-w-0 grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,0.85fr)] xl:gap-9 2xl:gap-12'>
                        {/* LEFT: original heading, native JSX dashboard, then original CTAs */}

                        <div className='min-w-0 animate-slide-in-left'>
                            <h1 className='mb-5 text-[clamp(1.55rem,6.2vw,2.2rem)] font-black leading-[1.2] tracking-tight text-white sm:mb-7 sm:text-4xl md:text-5xl lg:text-4xl xl:mb-4 xl:text-[2.55rem]'>
                                Email <span className='text-[#4333AF]'>CRM Lite</span>
                            </h1>

                            <EmailMarketingDashboard />

                            {/* Existing actions and their handlers are unchanged. */}

                            <div className='mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:gap-4 xl:mt-4'>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    className='h-12 w-full min-w-0 flex-1 cursor-pointer rounded-lg border-2 px-5 text-base font-bold transition-all duration-300 hover:scale-[1.02] sm:h-14 sm:text-lg xl:h-[50px] xl:max-w-[295px] border-[#4333AF] bg-[#4333AF] text-white hover:bg-[#372990] hover:text-white hover:border-[#372990]'
                                >
                                    Purchase
                                </Button>

                                <Button
                                    onClick={() => setSlideshowOpen(true)}
                                    size='lg'
                                    className='group h-12 w-full min-w-0 flex-1 rounded-lg px-5 text-base font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] sm:h-14 sm:text-lg xl:h-[50px] xl:max-w-[295px] border-[#4333AF] bg-transparent text-[#4333AF] hover:bg-[#4333AF]/10 hover:text-[#8D81ED] hover:border-[#4333AF] shadow-[0_0_18px_rgba(67,51,175,0.12)]'
                                >
                                    Learn more
                                </Button>
                            </div>
                        </div>

                        {/* RIGHT: the existing JSON/Lottie hero animation, contained at every viewport. */}

                        <div className='relative flex min-w-0 animate-slide-in-right items-center justify-center'>
                            <div className='relative aspect-[6/5] w-full max-w-[760px] overflow-hidden rounded-2xl border border-[#414A5D] sm:rounded-3xl lg:max-w-[400px] xl:max-w-[440px] 2xl:max-w-[460px]'>
                                <LottieAnimation src='/animations/emailmarketing-herosection-page.json' className='h-full w-full' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ProductPricingOverview product='email-crm' onGetStarted={handlePurchaseClick} />

            {/* Main Features */}

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#0C0F18]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Powerful <span className='text-[#4333AF]'>Email CRM</span>
                            <br />
                            Lite Capabilities
                        </h2>

                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Everything you need to create, send, and optimize your email marketing campaigns for maximum impact and engagement.
                        </p>
                    </div>

                    <div className='grid lg:grid-cols-2 gap-6 sm:gap-8= items-stretch'>
                        {features.map((feature, index) => (
                            <div key={index} className='group animate-slide-in-left h-full' style={{ animationDelay: `${index * 200}ms` }}>
                                <Card className='relative overflow-hidden border-2 border-[#414A5D] hover:border-[#4333AF] transition-all duration-300 rounded-2xl h-full flex flex-col min-h-[260px] sm:min-h-[300px] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#4333AF]/15 bg-[#0C0F18]'>
                                    <div className={`absolute top-0 left-0 w-full h-[3px] ${feature.color} opacity-60`} />

                                    <div className='pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#4333AF]/10' />

                                    {/* TOP (Icon + Title) */}

                                    <CardHeader className=''>
                                        <div
                                            className={`w-16 h-16 sm:w-20 sm:h-20 ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            <feature.icon className='w-8 h-8 sm:w-9 sm:h-9 text-white' />
                                        </div>

                                        <CardTitle className='mt-6 text-2xl sm:text-3xl font-black text-white group-hover:text-[#4333AF] transition-colors duration-300 leading-tight'>
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>

                                    {/* BOTTOM (Description pinned) */}

                                    <CardContent className=''>
                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed max-w-md'>{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features */}

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#0C0F18]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-16 sm:mb-20'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Why Choose Our Digital <span className='text-[#4333AF]'>Email CRM Lite</span>
                        </h2>

                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Take your email marketing to the next level with advanced features designed for professional marketers and growing businesses.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
                        {additionalFeatures.map((feature, index) => (
                            <div key={index} className='group animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
                                <Card className='border-2 border-[#414A5D] hover:border-[#4333AF] transition-all duration-300 rounded-2xl transform hover:scale-105 h-full bg-[#0C0F18]'>
                                    <CardContent className='p-6 sm:p-8 text-center'>
                                        <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-[#4333AF] hover:bg-[#372990]'>
                                            <feature.icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                        </div>

                                        <h3 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 leading-[1.28] group-hover:text-[#4333AF] transition-colors duration-300'>
                                            {feature.title}
                                        </h3>

                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-[#0C0F18]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        <div>
                            <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                                Start <span className='text-[#4333AF]'>Automating</span>
                                <br />
                                Today
                            </h2>

                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-5'>
                                Get your email campaigns running in minutes with a fast, powerful CRM built for growth..
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4'>
                                <Button
                                    size='lg'
                                    onClick={handlePurchaseClick}
                                    className='border-2 px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] border-[#4333AF] bg-[#4333AF] text-white hover:bg-[#372990] hover:text-white hover:border-[#372990]'
                                >
                                    Purchase
                                </Button>

                                <Button
                                    size='lg'
                                    onClick={() => setSlideshowOpen(true)}
                                    className='group border-2 box-border px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] border-[#4333AF] bg-transparent text-[#4333AF] hover:bg-[#4333AF]/10 hover:text-[#8D81ED] hover:border-[#4333AF] shadow-[0_0_18px_rgba(67,51,175,0.12)]'
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>

                        <div className='flex justify-center'>
                            <div className='relative'>
                                <div className='absolute inset-0 w-96 h-96 rounded-full blur-2xl'></div>

                                <div className='relative w-80 h-80 sm:w-96 sm:h-96 rounded-3xl border border-[#414A5D] flex items-center justify-center shadow-2xl backdrop-blur-xl p-8 bg-[#0C0F18]'>
                                    <LottieAnimation src='/animations/emailmarketingicon.json' loop={true} autoplay={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <EmailCRMSlideshow open={slideshowOpen} onOpenChange={setSlideshowOpen} />

            {authOpen && (
                <AuthModal
                    open={authOpen}
                    onOpenChange={(open) => {
                        setAuthOpen(open);

                        if (open) setPricingOpen(false);
                    }}
                    defaultView='signup'
                    sourceRoute='/emailMarketing'
                    onSuccess={handleAuthSuccess}
                />
            )}

            {!authOpen && <PricingComponent name='EmailMarketing' asModal open={pricingOpen} onOpenChange={setPricingOpen} />}
        </div>
    );
}

export { EmailMarketing };
