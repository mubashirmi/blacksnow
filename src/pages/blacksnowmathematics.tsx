'use client';

import { Calculator, ChevronDown, Home, PiggyBank, TrendingUp, Wallet, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type CalculatorKey = 'investment' | 'mortgage' | 'loan' | 'retirement';
type SeriesKey = 'amount' | 'secondary';
type FieldDef = { key: string; placeholder: string; frequency?: boolean; step?: string };
type ChartPoint = { year: number; amount: number; secondary: number };
type ResultItem = { label: string; value: string };
type Calculation = { chart: ChartPoint[]; results: ResultItem[]; error?: string };

type CalculatorDef = {
    key: CalculatorKey;
    label: string;
    icon: LucideIcon;
    accent: string;
    primaryLabel: string;
    secondaryLabel: string;
    fields: FieldDef[];
};

const CALCULATORS: CalculatorDef[] = [
    {
        key: 'investment',
        label: 'Investment Calculator',
        icon: TrendingUp,
        accent: '#e7e9ed',
        primaryLabel: 'Total',
        secondaryLabel: 'Gain',
        fields: [
            { key: 'principal', placeholder: 'Principal' },
            { key: 'years', placeholder: 'Years', step: '1' },
            { key: 'rate', placeholder: 'Rate (%)' },
            { key: 'contributionPercent', placeholder: 'Contribution (%)' },
            { key: 'frequency', placeholder: 'Frequency', frequency: true },
            { key: 'contributionFrequency', placeholder: 'Contribution Frequency', frequency: true },
        ],
    },
    {
        key: 'mortgage',
        label: 'Mortgage Calculator',
        icon: Home,
        accent: '#e7e9ed',
        primaryLabel: 'Balance',
        secondaryLabel: 'Principal Paid',
        fields: [
            { key: 'homePrice', placeholder: 'Home Price' },
            { key: 'downPayment', placeholder: 'Down Payment' },
            { key: 'term', placeholder: 'Term (Years)', step: '1' },
            { key: 'rate', placeholder: 'Rate (%)' },
        ],
    },
    {
        key: 'loan',
        label: 'Loan Calculator',
        icon: Wallet,
        accent: '#e7e9ed',
        primaryLabel: 'Balance',
        secondaryLabel: 'Principal Paid',
        fields: [
            { key: 'loanAmount', placeholder: 'Loan Amount' },
            { key: 'term', placeholder: 'Term (Years)', step: '1' },
            { key: 'rate', placeholder: 'Rate (%)' },
            { key: 'paymentFrequency', placeholder: 'Frequency', frequency: true },
        ],
    },
    {
        key: 'retirement',
        label: 'Retirement Calculator',
        icon: PiggyBank,
        accent: '#e7e9ed',
        primaryLabel: 'Total',
        secondaryLabel: 'Contributions',
        fields: [
            { key: 'currentAge', placeholder: 'Current Age', step: '1' },
            { key: 'retirementAge', placeholder: 'Retirement Age', step: '1' },
            { key: 'savings', placeholder: 'Savings' },
            { key: 'savingsFrequency', placeholder: 'Savings Frequency', frequency: true },
            { key: 'roi', placeholder: 'ROI (%)' },
        ],
    },
];

// Empty field values are intentional: names remain visible as placeholders.
// Until all required inputs have been supplied the chart displays a sample projection.
const EMPTY_VALUES: Record<CalculatorKey, Record<string, string>> = {
    investment: { principal: '', years: '', rate: '', contributionPercent: '', frequency: '', contributionFrequency: '' },
    mortgage: { homePrice: '', downPayment: '', term: '', rate: '' },
    loan: { loanAmount: '', term: '', rate: '', paymentFrequency: '' },
    retirement: { currentAge: '', retirementAge: '', savings: '', savingsFrequency: '', roi: '' },
};
const EXAMPLE_VALUES: Record<CalculatorKey, Record<string, string>> = {
    investment: { principal: '10000', years: '5', rate: '7', contributionPercent: '2', frequency: '12', contributionFrequency: '12' },
    mortgage: { homePrice: '400000', downPayment: '40000', term: '30', rate: '6.5' },
    loan: { loanAmount: '20000', term: '4', rate: '9', paymentFrequency: '12' },
    retirement: { currentAge: '35', retirementAge: '65', savings: '500', savingsFrequency: '12', roi: '7' },
};
// Preserve a two-column arrangement on small screens.
const MOBILE_FIELD_ORDER: Record<CalculatorKey, Record<string, string>> = {
    investment: {
        principal: 'order-1',
        years: 'order-2',
        rate: 'order-3',
        contributionPercent: 'order-4',
        frequency: 'order-5',
        contributionFrequency: 'order-6',
    },
    mortgage: { homePrice: 'order-1', downPayment: 'order-2', term: 'order-3', rate: 'order-4' },
    loan: { loanAmount: 'order-1', paymentFrequency: 'order-2', term: 'order-3', rate: 'order-4' },
    retirement: { currentAge: 'order-1', retirementAge: 'order-2', savings: 'order-3', savingsFrequency: 'order-4', roi: 'order-5' },
};
const FREQUENCIES = [
    { label: 'Annually', value: '1' },
    { label: 'Quarterly', value: '4' },
    { label: 'Monthly', value: '12' },
    { label: 'Daily', value: '365' },
];

const money = (number: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(number);

function compactMoney(value: number) {
    const absolute = Math.abs(value);
    if (absolute >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`;
    if (absolute >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
    return `$${Math.round(value)}`;
}

function paymentPerPeriod(balance: number, annualRate: number, periods: number, periodsPerYear: number) {
    if (balance <= 0 || periods <= 0) return 0;
    const periodRate = annualRate / 100 / periodsPerYear;
    if (!periodRate) return balance / periods;
    return (balance * periodRate) / (1 - Math.pow(1 + periodRate, -periods));
}

/** Returns a point at time zero and at the end of each year. */
function repaymentProjection(principal: number, annualRate: number, years: number, periodsPerYear = 12) {
    const periods = years * periodsPerYear;
    const installment = paymentPerPeriod(principal, annualRate, periods, periodsPerYear);
    const periodRate = annualRate / 100 / periodsPerYear;
    let balance = principal;
    const chart: ChartPoint[] = [{ year: 0, amount: principal, secondary: 0 }];

    for (let period = 1; period <= periods; period++) {
        balance = Math.max(0, balance * (1 + periodRate) - installment);
        if (period % periodsPerYear === 0) {
            // Eliminate tiny floating point balances on the last payment.
            if (period === periods) balance = 0;
            chart.push({ year: period / periodsPerYear, amount: balance, secondary: principal - balance });
        }
    }
    return { chart, installment, total: installment * periods, interest: installment * periods - principal };
}

/**
 * Recurring deposits are made at the beginning of each selected interval.
 * Growth between contribution dates uses the effective equivalent of the
 * selected compounding frequency, so mid-period deposits do not receive a
 * full period of interest they have not yet earned.
 */
function recurringProjection(
    initial: number,
    annualRate: number,
    years: number,
    compoundingFrequency: number,
    contributionPerPeriod: number,
    contributionFrequency: number,
    firstYear = 0,
    secondaryType: 'gain' | 'contributions' = 'gain'
) {
    const periodBase = 1 + annualRate / 100 / compoundingFrequency;
    const growthFactor = (fractionOfYear: number) => Math.pow(periodBase, fractionOfYear * compoundingFrequency);
    let balance = initial;
    let contributed = 0;
    const chart: ChartPoint[] = [{ year: firstYear, amount: initial, secondary: 0 }];

    for (let year = 1; year <= years; year++) {
        // Contributions are deposited at the start of each interval. At the
        // year boundary, that means the year's first deposit is made at t = 0.
        for (let payment = 0; payment < contributionFrequency; payment++) {
            if (payment) balance *= growthFactor(1 / contributionFrequency);
            balance += contributionPerPeriod;
            contributed += contributionPerPeriod;
        }
        balance *= growthFactor(1 / contributionFrequency);
        const growth = balance - initial - contributed;
        chart.push({
            year: firstYear + year,
            amount: balance,
            secondary: secondaryType === 'gain' ? growth : contributed,
        });
    }

    return { chart, ending: balance, contributions: contributed, gain: balance - initial - contributed };
}

function validate(key: CalculatorKey, fields: Record<string, string>): string | undefined {
    const definition = CALCULATORS.find((item) => item.key === key)!;
    if (definition.fields.some((field) => !fields[field.key]?.trim())) return `Please complete all ${definition.fields.length} fields.`;
    if (definition.fields.some((field) => !Number.isFinite(Number(fields[field.key])))) return 'Enter valid numbers.';
    if (definition.fields.some((field) => Number(fields[field.key]) < 0)) return 'Values cannot be negative.';

    const annualRate = Number(fields[key === 'retirement' ? 'roi' : 'rate']);
    if (annualRate > 100) return 'The annual rate must be between 0% and 100%.';

    if (key === 'investment' || key === 'mortgage' || key === 'loan') {
        const years = Number(fields[key === 'investment' ? 'years' : 'term']);
        if (!Number.isInteger(years) || years < 1 || years > 60) return 'Enter a whole number of years between 1 and 60.';
    }
    if (key === 'investment' && Number(fields.principal) <= 0) return 'Principal must be greater than zero.';
    if (key === 'mortgage' && Number(fields.homePrice) <= 0) return 'Home price must be greater than zero.';
    if (key === 'mortgage' && Number(fields.downPayment) > Number(fields.homePrice)) return 'Down payment cannot exceed home price.';
    if (key === 'loan' && Number(fields.loanAmount) <= 0) return 'Loan amount must be greater than zero.';
    if (key === 'investment' && ![1, 4, 12, 365].includes(Number(fields.frequency))) return 'Choose a compounding frequency.';
    if (key === 'investment' && ![1, 4, 12, 365].includes(Number(fields.contributionFrequency))) return 'Choose a contribution frequency.';
    if (key === 'investment' && Number(fields.contributionPercent) > 100) return 'Contribution must be between 0% and 100% of the initial principal.';
    if (key === 'loan' && ![1, 4, 12, 365].includes(Number(fields.paymentFrequency))) return 'Choose a payment frequency.';
    if (key === 'retirement' && ![1, 4, 12, 365].includes(Number(fields.savingsFrequency))) return 'Choose a savings frequency.';

    if (key === 'retirement') {
        const current = Number(fields.currentAge);
        const retirement = Number(fields.retirementAge);
        if (!Number.isInteger(current) || !Number.isInteger(retirement) || current < 1 || retirement > 110)
            return 'Enter valid whole-number ages between 1 and 110.';
        if (retirement <= current) return 'Retirement age must be greater than current age.';
        if (retirement - current > 60) return 'The retirement period cannot exceed 60 years.';
    }
    return undefined;
}

function calculateProjection(key: CalculatorKey, fields: Record<string, string>): Calculation {
    const invalid = validate(key, fields);
    if (invalid) return { chart: [], results: [], error: invalid };
    const number = (field: string) => Number(fields[field]);

    if (key === 'investment') {
        const principal = number('principal');
        const contributionPerPeriod = (principal * number('contributionPercent')) / 100;
        const { chart, ending, contributions, gain } = recurringProjection(
            principal,
            number('rate'),
            number('years'),
            number('frequency'),
            contributionPerPeriod,
            number('contributionFrequency')
        );
        return {
            chart,
            results: [
                { label: 'Estimated Value', value: money(ending) },
                { label: 'Total Contributions', value: money(contributions) },
                { label: 'Total Gain (Growth)', value: money(gain) },
                { label: 'Return on Invested Amount', value: `${((gain / (principal + contributions)) * 100).toFixed(1)}%` },
            ],
        };
    }

    if (key === 'mortgage' || key === 'loan') {
        const principal = key === 'mortgage' ? number('homePrice') - number('downPayment') : number('loanAmount');
        const periodsPerYear = key === 'mortgage' ? 12 : number('paymentFrequency');
        const { chart, installment, total, interest } = repaymentProjection(principal, number('rate'), number('term'), periodsPerYear);
        const label =
            periodsPerYear === 1 ? 'Annual Payment' : periodsPerYear === 4 ? 'Quarterly Payment' : periodsPerYear === 365 ? 'Daily Payment' : 'Monthly Payment';
        return {
            chart,
            results: [
                { label, value: money(installment) },
                { label: key === 'mortgage' ? 'Total Payment' : 'Total Repayment', value: money(total) },
                { label: 'Total Interest', value: money(Math.max(0, interest)) },
            ],
        };
    }

    const currentAge = number('currentAge');
    const retirementAge = number('retirementAge');
    const { chart, ending, contributions, gain } = recurringProjection(
        0,
        number('roi'),
        retirementAge - currentAge,
        12,
        number('savings'),
        number('savingsFrequency'),
        currentAge,
        'contributions'
    );
    return {
        chart,
        results: [
            { label: 'Retirement Nest Egg', value: money(ending) },
            { label: 'Total Contributions', value: money(contributions) },
            { label: 'Investment Growth', value: money(gain) },
        ],
    };
}

// Keep six evenly spaced, readable labels like the reference graph.
function verticalTicks(chart: ChartPoint[], series: SeriesKey) {
    const max = Math.max(0, ...chart.map((point) => point[series]));
    if (max === 0) return [0, 1, 2, 3, 4, 5];
    const target = max / 5;
    const power = 10 ** Math.floor(Math.log10(target));
    const normalized = target / power;
    const multiple = [1, 2, 2.5, 5, 10].find((candidate) => candidate >= normalized) ?? 10;
    const step = multiple * power;
    return Array.from({ length: 8 }, (_, index) => Number((index * step).toPrecision(12)));
}

function horizontalTicks(chart: ChartPoint[]) {
    if (!chart.length) return [];
    const first = chart[0].year;
    const last = chart[chart.length - 1].year;
    const segments = Math.min(6, last - first);
    if (segments <= 0) return [first];
    return [...new Set(Array.from({ length: segments + 1 }, (_, index) => Math.round(first + ((last - first) * index) / segments)))];
}

// Preview values recreate the ascending white line from the supplied screenshot.
// Calculated values use the precise financial projections above instead.
const REFERENCE_PREVIEW: ChartPoint[] = Array.from({ length: 6 }, (_, year) => ({
    year,
    amount: 5300 + year * 1700,
    secondary: year * 1700,
}));

function NumericField({ field, value, onChange }: { field: FieldDef; value: string; onChange: (value: string) => void }) {
    const style =
        'h-[54px] w-full min-w-0 rounded-[6px] border border-[#323e50] bg-[#0a1523] px-3 sm:px-[15px] ' +
        'text-[14px] sm:text-[15px] font-normal text-[#e4e7ec] outline-none transition-colors ' +
        'placeholder:text-[#e0e3e9] focus:border-[#81dfe6] focus:ring-1 focus:ring-[#81dfe6]/20';

    if (field.frequency) {
        return (
            <select
                aria-label={field.placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`${style} cursor-pointer ${value ? '' : 'text-[#e0e3e9]'}`}
            >
                <option value='' disabled>
                    {field.placeholder}
                </option>
                {FREQUENCIES.map((frequency) => (
                    <option key={frequency.value} value={frequency.value} className='bg-[#0a1523] text-white'>
                        {frequency.label}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <input
            aria-label={field.placeholder}
            type='number'
            inputMode='decimal'
            min='0'
            step={field.step ?? 'any'}
            placeholder={field.placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={style}
        />
    );
}

function ChartPanel({
    chart,
    series,
    isRetirement,
    referencePreview,
}: {
    chart: ChartPoint[];
    series: SeriesKey;
    isRetirement: boolean;
    referencePreview: boolean;
}) {
    const normalTicks = useMemo(() => verticalTicks(chart, series), [chart, series]);
    const yTicks = referencePreview && series === 'amount' ? [0, 3200, 6400, 9600, 12800, 16000] : normalTicks;
    const xTicks = useMemo(() => horizontalTicks(chart), [chart]);
    const axisColor = '#9ca3af';
    const lineColor = '#e8eaee';

    return (
        <section aria-label='Financial projection chart'>
            {/* Upper status strip, with the cyan dot and muted right-aligned mode. */}
            <div className='flex h-[14px] items-center justify-between px-[6px] text-[10px] font-semibold tracking-[0.035em]'>
                <span className='inline-flex items-center gap-[7px] text-[#81dadd]'>
                    <span className='relative inline-flex h-[10px] w-[10px] shrink-0 items-center justify-center'>
                        <span className='absolute inset-0 rounded-full bg-[#7ceaf0] opacity-65 motion-safe:animate-ping' />
                        <span className='relative h-[9px] w-[9px] rounded-full bg-[#7ceaf0] shadow-[0_0_10px_rgba(124,234,240,0.55)] motion-safe:animate-pulse' />
                    </span>
                    POWER LIVE
                </span>
                <span className='text-[10px] font-medium text-[#858895]'>MODE LOW</span>
            </div>

            <div className='mt-[8px] h-[220px] w-full sm:h-[280px]'>
                <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={chart} margin={{ top: 8, right: 18, bottom: 3, left: 14 }}>
                        <CartesianGrid stroke='rgba(135,150,172,0.105)' strokeDasharray='2 2' />
                        <XAxis
                            dataKey='year'
                            type='number'
                            scale='linear'
                            domain={[chart[0].year, chart[chart.length - 1].year]}
                            allowDataOverflow
                            ticks={xTicks}
                            height={21}
                            tickMargin={7}
                            tickLine={false}
                            axisLine={{ stroke: '#273446', strokeWidth: 1 }}
                            tick={{ fontSize: 10, fill: axisColor }}
                        />
                        <YAxis
                            domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                            ticks={yTicks}
                            tickFormatter={compactMoney}
                            width={76}
                            tickMargin={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: axisColor }}
                        />
                        <Tooltip
                            cursor={{ stroke: '#b5c0d0', strokeOpacity: 0.3, strokeDasharray: '3 3' }}
                            contentStyle={{
                                backgroundColor: '#101b2a',
                                border: '1px solid #354153',
                                borderRadius: 7,
                                color: '#e7e9ed',
                                fontSize: 12,
                            }}
                            labelStyle={{ color: '#c6ced9' }}
                            itemStyle={{ color: lineColor }}
                            formatter={(value) => money(Number(value ?? 0))}
                            labelFormatter={(value) => `${isRetirement ? 'Age' : 'Year'} ${value}`}
                        />
                        <Line
                            name='Value'
                            type='linear'
                            dataKey={series}
                            stroke={lineColor}
                            strokeWidth={2.2}
                            dot={{ r: 3.3, fill: lineColor, stroke: lineColor, strokeWidth: 0 }}
                            activeDot={{ r: 4.5, fill: '#fff', stroke: '#0b1726', strokeWidth: 1.5 }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

/**
 * BLACK SNOW — financial calculator, styled to match the supplied reference.
 * Keep Tailwind CSS, lucide-react and recharts installed as in the original app.
 */
export default function BlackSnowMathematics() {
    const [selectedKey, setSelectedKey] = useState<CalculatorKey>('investment');
    const [values, setValues] = useState<Record<CalculatorKey, Record<string, string>>>(EMPTY_VALUES);
    const [displaySeries, setDisplaySeries] = useState<Record<CalculatorKey, SeriesKey>>({
        investment: 'amount',
        mortgage: 'amount',
        loan: 'amount',
        retirement: 'amount',
    });
    const [results, setResults] = useState<Partial<Record<CalculatorKey, ResultItem[]>>>({});
    const [error, setError] = useState('');
    const [calculatorOpen, setCalculatorOpen] = useState(false);

    const selected = CALCULATORS.find((item) => item.key === selectedKey)!;
    const Icon = selected.icon;
    const fields = values[selectedKey];
    const referencePreview = selectedKey === 'investment' && selected.fields.every((field) => !fields[field.key]);
    const projection = useMemo(() => {
        if (referencePreview) return { chart: REFERENCE_PREVIEW, results: [] as ResultItem[] };
        // Preview intermediate field changes with defaults. On Calculate, all required values are needed.
        const previewFields = {
            ...EXAMPLE_VALUES[selectedKey],
            ...Object.fromEntries(Object.entries(values[selectedKey]).filter(([, value]) => value !== '')),
        };
        const preview = calculateProjection(selectedKey, previewFields);
        // Invalid partially typed values should show the example chart, never
        // leave Recharts without an X-axis domain while the user is editing.
        return preview.error ? calculateProjection(selectedKey, EXAMPLE_VALUES[selectedKey]) : preview;
    }, [selectedKey, values, referencePreview]);
    const series = displaySeries[selectedKey];

    function selectCalculator(key: CalculatorKey) {
        setSelectedKey(key);
        setCalculatorOpen(false);
        setError('');
    }

    function updateValue(key: string, value: string) {
        setValues((previous) => ({
            ...previous,
            [selectedKey]: { ...previous[selectedKey], [key]: value },
        }));
        setResults((previous) => ({ ...previous, [selectedKey]: undefined }));
        setError('');
    }

    function calculate() {
        const calculated = calculateProjection(selectedKey, fields);
        if (calculated.error) {
            setError(calculated.error);
            setResults((previous) => ({ ...previous, [selectedKey]: undefined }));
            return;
        }
        setError('');
        setResults((previous) => ({ ...previous, [selectedKey]: calculated.results }));
    }

    function clear() {
        setValues((previous) => ({ ...previous, [selectedKey]: { ...EMPTY_VALUES[selectedKey] } }));
        setResults((previous) => ({ ...previous, [selectedKey]: undefined }));
        setDisplaySeries((previous) => ({ ...previous, [selectedKey]: 'amount' }));
        setError('');
    }

    return (
        <div
            className='relative min-h-screen text-[#e5e7ec]'
            style={{
                fontFamily: 'Arial, Helvetica, sans-serif',
                background: 'linear-gradient(115deg, #08121e 0%, #08101f 70%, #09111f 100%)',
            }}
        >
            {/* Fine, subdued line along the upper edge as in the screenshot. */}
            <div aria-hidden='true' className='pointer-events-none absolute inset-x-0 top-[5px] h-px bg-[#212a37]/50' />

            <main className='flex min-h-screen items-center justify-center px-3 py-8 sm:px-6 sm:py-12'>
                <div
                    className='w-full max-w-[960px] rounded-[24px] border border-[#2c3545] px-4 pb-7 pt-5 shadow-[0_22px_68px_rgba(0,0,0,0.24)] sm:px-7 sm:pt-6 lg:px-9'
                    style={{ background: 'linear-gradient(145deg, #131c29 0%, #0b1523 46%, #07101e 100%)' }}
                >
                    <ChartPanel chart={projection.chart} series={series} isRetirement={selectedKey === 'retirement'} referencePreview={referencePreview} />

                    {results[selectedKey] && (
                        <div role='status' aria-live='polite' className='mt-4 rounded-[7px] border border-[#344154] bg-[#0a1523] px-4 py-2'>
                            {results[selectedKey]!.map((item) => (
                                <div
                                    key={item.label}
                                    className='flex items-center justify-between gap-3 border-b border-[#2a3545] py-2.5 text-sm last:border-0'
                                >
                                    <span className='text-[#c4ccd8]'>{item.label}</span>
                                    <strong className='text-right tabular-nums text-[#e7e9ed]'>{item.value}</strong>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Calculator selector and chart series. */}
                    <div className='mt-[13px] grid grid-cols-2 gap-[18px] max-[530px]:grid-cols-1'>
                        <div className='relative min-w-0'>
                            <button
                                type='button'
                                onClick={() => setCalculatorOpen((open) => !open)}
                                aria-label='Choose a calculator'
                                aria-expanded={calculatorOpen}
                                aria-haspopup='listbox'
                                className='flex h-[51px] w-full min-w-0 items-center gap-[17px] rounded-[6px] border border-[#384254] bg-gradient-to-br from-[#18202c] to-[#0d1726] px-[13px] text-left text-[#daddE5] transition-colors hover:border-[#536073] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#81dfe6]'
                            >
                                <Icon aria-hidden='true' className='h-[19px] w-[19px] shrink-0 text-[#737e90]' />
                                <span className='min-w-0 flex-1 truncate text-[16px]'>{selected.label}</span>
                                <ChevronDown
                                    aria-hidden='true'
                                    className={`h-4 w-4 shrink-0 text-[#7f8a9a] transition-transform ${calculatorOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {calculatorOpen && (
                                <div
                                    role='listbox'
                                    aria-label='Available calculators'
                                    className='absolute inset-x-0 top-[calc(100%+5px)] z-20 overflow-hidden rounded-[7px] border border-[#344255] bg-[#101b2a] shadow-2xl'
                                >
                                    {CALCULATORS.map((calculator) => {
                                        const OptionIcon = calculator.icon;
                                        return (
                                            <button
                                                key={calculator.key}
                                                type='button'
                                                role='option'
                                                aria-selected={selectedKey === calculator.key}
                                                onClick={() => selectCalculator(calculator.key)}
                                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#e0e5ea] transition-colors hover:bg-[#253246] ${
                                                    selectedKey === calculator.key ? 'bg-[#1e2a3d]' : ''
                                                }`}
                                            >
                                                <OptionIcon aria-hidden='true' className='h-4 w-4 text-[#99a4b4]' />
                                                {calculator.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <label className='min-w-0'>
                            <span className='sr-only'>Chart data to display</span>
                            <select
                                aria-label='Chart data to display'
                                value={series}
                                onChange={(event) =>
                                    setDisplaySeries((previous) => ({
                                        ...previous,
                                        [selectedKey]: event.target.value as SeriesKey,
                                    }))
                                }
                                className='h-[51px] w-full appearance-none rounded-[6px] border border-[#334053] bg-[#091523] px-[15px] text-[17px] text-[#e1e4e9] outline-none focus:border-[#81dfe6]'
                            >
                                <option value='amount'>{selected.primaryLabel}</option>
                                <option value='secondary'>{selected.secondaryLabel}</option>
                            </select>
                        </label>
                    </div>

                    {/* Investment: one desktop row. Principal + Years: 50%; Rate + Frequency: 25%; Contribution + Frequency: 25%. */}
                    {selectedKey === 'investment' ? (
                        <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-[2fr_1fr_1fr] lg:gap-3'>
                            {(
                                [
                                    ['principal', 'years'],
                                    ['rate', 'frequency'],
                                    ['contributionPercent', 'contributionFrequency'],
                                ] as const
                            ).map((pair, groupIndex) => (
                                <div
                                    key={pair[0]}
                                    className={`grid min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:gap-2 ${groupIndex === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                                >
                                    {pair.map((fieldKey) => {
                                        const field = selected.fields.find((item) => item.key === fieldKey)!;
                                        const shortLabel = fieldKey === 'contributionFrequency' ? 'Frequency' : field.placeholder;
                                        return (
                                            <div key={fieldKey} className='min-w-0'>
                                                <label
                                                    className='mb-1.5 block truncate text-[11px] font-medium tracking-[0.01em] text-[#b2bdca]'
                                                    title={field.placeholder}
                                                >
                                                    {shortLabel}
                                                </label>
                                                <NumericField field={field} value={fields[field.key]} onChange={(value) => updateValue(field.key, value)} />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className={`mt-5 grid grid-cols-2 gap-3 sm:gap-4 ${
                                selectedKey === 'retirement'
                                    ? 'sm:grid-cols-3 min-[850px]:grid-cols-[.85fr_.85fr_1fr_.95fr_.78fr]'
                                    : 'sm:grid-cols-4 min-[700px]:grid-cols-[1.15fr_1.05fr_.85fr_.8fr]'
                            }`}
                        >
                            {selected.fields.map((field) => (
                                <div
                                    key={`${selectedKey}-${field.key}`}
                                    className={`min-w-0 ${MOBILE_FIELD_ORDER[selectedKey][field.key]} min-[531px]:order-none`}
                                >
                                    <label className='mb-1.5 block truncate text-[11px] font-medium tracking-[0.01em] text-[#b2bdca]' title={field.placeholder}>
                                        {field.placeholder}
                                    </label>
                                    <NumericField field={field} value={fields[field.key]} onChange={(value) => updateValue(field.key, value)} />
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedKey === 'investment' && (
                        <p className='mt-2 text-xs leading-relaxed text-[#aab4c1]'>
                            Contribution (%) is calculated from the initial principal and added at the selected contribution frequency, at the beginning of each
                            interval.
                        </p>
                    )}
                    {selectedKey === 'retirement' && (
                        <p className='mt-2 text-xs leading-relaxed text-[#aab4c1]'>
                            Savings is the amount contributed each selected period. Retirement growth uses a monthly compounded annual ROI.
                        </p>
                    )}
                    <div className='mt-[16px] grid grid-cols-2 gap-[15px]'>
                        <button
                            type='button'
                            // eslint-disable-next-line
                            onClick={calculate}
                            className='flex h-[48px] items-center justify-center gap-[13px] rounded-[6px] border border-[#354052] bg-gradient-to-br from-[#1b2330] to-[#151e2b] text-[16px] text-[#e6e8ee] transition-colors hover:border-[#536579] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#81dfe6]'
                        >
                            <Calculator aria-hidden='true' className='h-[19px] w-[19px] text-[#858d9a]' />
                            Calculate
                        </button>
                        <button
                            type='button'
                            // eslint-disable-next-line
                            onClick={clear}
                            className='h-[48px] rounded-[6px] border border-[#344053] bg-[#091523] text-[16px] text-[#e5e7ed] transition-colors hover:border-[#536579] hover:bg-[#152133] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#81dfe6]'
                        >
                            Clear
                        </button>
                    </div>

                    {error && (
                        <p role='alert' className='mt-3 text-sm text-[#fda4af]'>
                            {error}
                        </p>
                    )}
                </div>
            </main>

            <style jsx global>{`
                input[type='number']::-webkit-inner-spin-button,
                input[type='number']::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type='number'] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
}
