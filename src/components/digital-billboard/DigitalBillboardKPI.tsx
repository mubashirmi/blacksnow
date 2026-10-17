import { Activity, BarChart3, MousePointerClick, RefreshCw, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type KPIPeriod = 'weekly' | 'monthly' | 'yearly';
type KPIMetric = 'digitalBillboards' | 'clicks';

type KPIPoint = {
    label: string;
    clicks: number;
    digitalBillboards: number;
};

type KPIPeriodData = {
    data: KPIPoint[];
    totals: {
        clicks: number;
        digitalBillboards: number;
    };
};

type KPIResponse = {
    success: boolean;
    period: string;
    periods: Record<KPIPeriod, KPIPeriodData>;
};

type DigitalBillboardKPIProps = {
    userId: string;
};

const PERIOD_OPTIONS: { key: KPIPeriod; title: string; label: string; bucket: string }[] = [
    { key: 'weekly', title: 'Weekly', label: 'Week', bucket: 'days' },
    { key: 'monthly', title: 'Monthly', label: 'Month', bucket: 'months' },
    { key: 'yearly', title: 'Yearly', label: 'Year', bucket: 'years' },
];

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

function safeNumber(value: unknown): number {
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: unknown): string {
    return numberFormat.format(safeNumber(value));
}

function HorizontalCursor(props: any) {
    const { points, width } = props || {};
    if (!points?.length || typeof width !== 'number') return null;
    const y = points[0]?.y;
    if (typeof y !== 'number') return null;
    return <line x1={0} x2={width} y1={y} y2={y} stroke='rgba(17, 24, 39, 0.35)' strokeDasharray='4 4' />;
}

function isValidKPIResponse(payload: KPIResponse): boolean {
    return (
        payload?.success === true &&
        !!payload.periods &&
        PERIOD_OPTIONS.every(({ key }) => Array.isArray(payload.periods[key]?.data) && !!payload.periods[key]?.totals)
    );
}

function SummaryCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: typeof Activity }) {
    return (
        <div className='min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
            <div className='mb-4 flex items-start justify-between gap-3'>
                <span className='text-sm font-medium text-gray-500'>{title}</span>
                <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600'>
                    <Icon size={17} strokeWidth={1.8} aria-hidden='true' />
                </span>
            </div>
            <div className='text-3xl font-bold tracking-tight text-gray-900 tabular-nums'>{value}</div>
            <p className='mt-2 text-xs leading-relaxed text-gray-500'>{description}</p>
        </div>
    );
}

function MiniDistribution({ values }: { values: number[] }) {
    const max = Math.max(...values, 0);
    return (
        <div className='mt-4 flex h-9 w-full items-end gap-1.5' aria-hidden='true'>
            {values.length ? (
                values.map((rawValue, index) => {
                    const value = Math.max(0, safeNumber(rawValue));
                    const height = max === 0 || value === 0 ? 3 : Math.max(5, (value / max) * 36);
                    return (
                        <div key={index} className='flex min-w-0 flex-1 items-end'>
                            <div className={`w-full rounded-t-sm ${value > 0 ? 'bg-blue-500' : 'bg-gray-200'}`} style={{ height: `${height}px` }} />
                        </div>
                    );
                })
            ) : (
                <div className='h-[3px] w-full rounded-full bg-gray-200' />
            )}
        </div>
    );
}

/**
 * User-side KPI dashboard. Uses only the weekly, monthly and yearly values supplied
 * by GET /api/digital-billboard/kpi?userId=<id>&period=all.
 * It intentionally does not calculate CTR, growth percentages or all-time totals
 * because impressions, previous-period data and lifetime totals are not provided.
 */
export function DigitalBillboardKPI({ userId }: DigitalBillboardKPIProps) {
    const [responseData, setResponseData] = useState<KPIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [metric, setMetric] = useState<KPIMetric>('digitalBillboards');
    const [period, setPeriod] = useState<KPIPeriod>('monthly');

    useEffect(() => {
        if (!userId) {
            setResponseData(null);
            setLoading(false);
            setError('User session was not found. Please sign in again.');
            return;
        }

        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const apiResponse = await fetch(`/api/digital-billboard/kpi?userId=${encodeURIComponent(userId)}&period=all`, {
                    method: 'GET',
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!apiResponse.ok) {
                    throw new Error(`Unable to load KPI data (${apiResponse.status})`);
                }

                const json = (await apiResponse.json()) as KPIResponse;
                if (!isValidKPIResponse(json)) {
                    throw new Error('The KPI API returned an unexpected response.');
                }

                if (!controller.signal.aborted) setResponseData(json);
            } catch (err: unknown) {
                if (controller.signal.aborted) return;
                setError(err instanceof Error ? err.message : 'Unable to load KPI data');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        // eslint-disable-next-line
        void load();
        return () => controller.abort();
    }, [userId, refreshKey]);

    const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

    const selectedPeriod = responseData?.periods[period];
    const selectedOption = PERIOD_OPTIONS.find((option) => option.key === period)!;
    const metricLabel = metric === 'clicks' ? 'Clicks' : 'Digital Billboards';
    const totalClicks = safeNumber(selectedPeriod?.totals.clicks);
    const totalBillboards = safeNumber(selectedPeriod?.totals.digitalBillboards);

    const chartData = useMemo(
        () =>
            (selectedPeriod?.data ?? []).map((item) => ({
                period: item.label,
                value: safeNumber(item[metric]),
            })),
        [selectedPeriod, metric]
    );

    const peak = useMemo(() => {
        if (!chartData.length) return null;
        const highest = chartData.reduce((best, current) => (current.value > best.value ? current : best), chartData[0]);
        return highest.value > 0 ? highest : null;
    }, [chartData]);

    const activeBucketCount = useMemo(() => chartData.filter((point) => point.value > 0).length, [chartData]);

    return (
        <div className='space-y-6'>
            {/* Page heading */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-[28px]'>Digital Billboard KPI</h1>
                    <p className='mt-1 text-sm text-gray-500'>Your billboard performance at a glance</p>
                </div>
                <button
                    type='button'
                    onClick={refresh}
                    disabled={loading}
                    className='inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} aria-hidden='true' />
                    Refresh data
                </button>
            </div>

            {error && (
                <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700' role='alert'>
                    {error}{' '}
                    {!loading && (
                        <button type='button' onClick={refresh} className='font-semibold underline underline-offset-2'>
                            Try again
                        </button>
                    )}
                </div>
            )}

            {/* Key figures: always scoped to the selected time range */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                <SummaryCard
                    title='Digital Billboards'
                    value={responseData ? formatNumber(totalBillboards) : '—'}
                    description={`${selectedOption.title} billboard count`}
                    icon={BarChart3}
                />
                <SummaryCard
                    title='Total Clicks'
                    value={responseData ? formatNumber(totalClicks) : '—'}
                    description={`${selectedOption.title} click count`}
                    icon={MousePointerClick}
                />
                <SummaryCard
                    title={`Peak ${metric === 'clicks' ? 'Clicks' : 'Billboard Activity'}`}
                    value={responseData ? (peak ? formatNumber(peak.value) : '0') : '—'}
                    description={
                        responseData
                            ? peak
                                ? `Highest in ${selectedOption.label.toLowerCase()}: ${peak.period}`
                                : 'No recorded activity in this period'
                            : 'Most active interval'
                    }
                    icon={TrendingUp}
                />
                <SummaryCard
                    title='Active Intervals'
                    value={responseData ? `${activeBucketCount} / ${chartData.length}` : '—'}
                    description={`${selectedOption.bucket} with ${metric === 'clicks' ? 'click' : 'billboard'} activity`}
                    icon={Activity}
                />
            </div>

            {/* One line at a time, matching the admin KPI chart behavior */}
            <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
                <div className='mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                    <div>
                        <h2 className='text-lg font-semibold text-gray-800'>Performance Overview</h2>
                        <p className='mt-0.5 text-sm text-gray-500'>See your {metricLabel.toLowerCase()} across the selected timeframe</p>
                    </div>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                        <select
                            value={metric}
                            onChange={(event) => setMetric(event.target.value as KPIMetric)}
                            className='min-h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                            aria-label='Select performance metric'
                        >
                            <option value='digitalBillboards'>Digital Billboards</option>
                            <option value='clicks'>Clicks</option>
                        </select>
                        <select
                            value={period}
                            onChange={(event) => setPeriod(event.target.value as KPIPeriod)}
                            className='min-h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                            aria-label='Select performance timeframe'
                        >
                            <option value='weekly'>Weekly</option>
                            <option value='monthly'>Monthly</option>
                            <option value='yearly'>Yearly</option>
                        </select>
                    </div>
                </div>

                <div className='mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-gray-100 pb-4'>
                    <span className='text-3xl font-bold text-gray-900 tabular-nums'>{responseData ? formatNumber(selectedPeriod?.totals[metric]) : '—'}</span>
                    <span className='text-sm text-gray-500'>
                        {selectedOption.title} {metricLabel.toLowerCase()}
                    </span>
                </div>

                {loading && !responseData ? (
                    <div className='flex h-[300px] items-center justify-center text-sm text-gray-400'>Loading performance data...</div>
                ) : !responseData ? (
                    <div className='flex h-[300px] items-center justify-center text-sm text-gray-400'>No KPI data available</div>
                ) : chartData.length === 0 ? (
                    <div className='flex h-[300px] items-center justify-center text-sm text-gray-400'>No activity in this period</div>
                ) : (
                    <div className={`min-w-0 ${loading ? 'opacity-60' : ''}`}>
                        <ResponsiveContainer width='100%' height={300}>
                            <LineChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                                <XAxis dataKey='period' tick={{ fontSize: 12, fill: '#64748b' }} minTickGap={15} tickLine={false} axisLine={false} />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatNumber}
                                />
                                <Tooltip
                                    cursor={<HorizontalCursor />}
                                    formatter={(value: any) => [formatNumber(value), metricLabel]}
                                    labelFormatter={(label) => `${selectedOption.label}: ${label}`}
                                    contentStyle={{ borderColor: '#e5e7eb', borderRadius: '8px', fontSize: 13 }}
                                />
                                <Legend iconType='line' wrapperStyle={{ paddingTop: 8, fontSize: 13 }} />
                                <Line
                                    type='linear'
                                    dataKey='value'
                                    name={metricLabel}
                                    stroke='#3b82f6'
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6', stroke: '#3b82f6', strokeWidth: 1 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Three API-supplied timeframe summaries; click to update main chart */}
            <div className='space-y-4'>
                <div>
                    <h2 className='text-lg font-semibold text-gray-800'>Period Breakdown</h2>
                    <p className='mt-0.5 text-sm text-gray-500'>
                        A quick comparison of your weekly, monthly and yearly activity. Choose a period to view it above.
                    </p>
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {PERIOD_OPTIONS.map((option) => {
                        const periodData = responseData?.periods[option.key];
                        const values = periodData?.data.map((point) => safeNumber(point[metric])) ?? [];
                        const active = period === option.key;
                        const activeIntervals = values.filter((value) => value > 0).length;
                        return (
                            <button
                                key={option.key}
                                type='button'
                                onClick={() => setPeriod(option.key)}
                                aria-pressed={active}
                                className={`min-w-0 rounded-xl border p-5 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                    active ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50/70'
                                }`}
                            >
                                <div className='flex items-center justify-between gap-2'>
                                    <h3 className='text-sm font-semibold text-gray-800'>{option.title} Snapshot</h3>
                                    <span
                                        className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                                            active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {active ? 'Selected' : `View ${option.label.toLowerCase()}`}
                                    </span>
                                </div>
                                <div className='mt-5 grid grid-cols-2 gap-3'>
                                    <div>
                                        <p className='text-xs text-gray-500'>Billboards</p>
                                        <p className='mt-1 text-2xl font-bold tracking-tight text-gray-900 tabular-nums'>
                                            {responseData ? formatNumber(periodData?.totals.digitalBillboards) : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500'>Clicks</p>
                                        <p className='mt-1 text-2xl font-bold tracking-tight text-gray-900 tabular-nums'>
                                            {responseData ? formatNumber(periodData?.totals.clicks) : '—'}
                                        </p>
                                    </div>
                                </div>
                                <MiniDistribution values={values} />
                                <p className='mt-2 text-xs text-gray-500'>
                                    {responseData
                                        ? `${activeIntervals} of ${values.length} ${option.bucket} with ${metric === 'clicks' ? 'click' : 'billboard'} activity`
                                        : 'Loading period activity...'}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
