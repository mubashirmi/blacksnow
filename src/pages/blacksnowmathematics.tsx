'use client';

import { Button } from '@/components/ui/button';
import { Calculator, ChevronDown, Home, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { useCallback, useMemo, useState, type ElementType, type ReactElement, type ReactNode } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────
type ChartPoint = {
    year: string;
    amount: number;
};

type CalculatorKey = 'investment' | 'mortgage' | 'loan' | 'retirement';

type CalculatorShellProps = {
    title: string;
    Icon: ElementType;
    gradient: string;
    chartData: ChartPoint[];
    children: ReactNode;
    showSelector?: boolean;
    selectedKey?: CalculatorKey;
    onSelectedKeyChange?: (key: CalculatorKey) => void;
};

// ─── Formatters / helpers ────────────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(Number.isFinite(n) ? n : 0);

function safeNumber(value: string | number, fallback = 0) {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function clampYears(value: string | number, fallback = 1, max = 60) {
    const years = Math.floor(safeNumber(value, fallback));
    if (!Number.isFinite(years) || years < 1) return fallback;
    return Math.min(years, max);
}

function compactCurrency(value: any) {
    const n = safeNumber(value, 0);
    const abs = Math.abs(n);

    if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;

    return `$${n.toFixed(0)}`;
}

function getPayment(principal: number, annualRate: number, months: number) {
    if (principal <= 0 || months <= 0) return 0;

    const monthlyRate = annualRate / 100 / 12;

    if (monthlyRate === 0) return principal / months;

    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function buildBalanceChart(principal: number, annualRate: number, years: number) {
    const safePrincipal = Math.max(0, principal);
    const totalMonths = Math.max(1, years * 12);
    const monthlyRate = annualRate / 100 / 12;
    const payment = getPayment(safePrincipal, annualRate, totalMonths);
    const data: ChartPoint[] = [{ year: '0', amount: safePrincipal }];

    let balance = safePrincipal;

    for (let month = 1; month <= totalMonths; month += 1) {
        if (monthlyRate === 0) {
            balance = Math.max(0, balance - payment);
        } else {
            const interest = balance * monthlyRate;
            const principalPayment = payment - interest;
            balance = Math.max(0, balance - principalPayment);
        }

        if (month % 12 === 0 || month === totalMonths) {
            data.push({
                year: String(Math.ceil(month / 12)),
                amount: balance,
            });
        }
    }

    return data;
}

// ─── Shared input ─────────────────────────────────────────────────────────────
function Field({ label, prefix, value, onChange }: { label: string; prefix?: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className='block text-[10px] font-bold text-[#7b7f9d] mb-1.5 uppercase tracking-[0.18em]'>{label}</label>

            <div className='flex items-center gap-2 rounded-xl border border-[#2c7bbe]/30 bg-[#050608] px-3 py-2.5 focus-within:border-[#4cc7e8]/70 transition-colors duration-200'>
                {prefix && <span className='text-gray-400 font-semibold text-sm flex-shrink-0'>{prefix}</span>}

                <input
                    type='number'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='w-full bg-transparent outline-none text-white font-semibold text-sm tabular-nums placeholder-gray-600'
                />
            </div>
        </div>
    );
}

// ─── Result row ───────────────────────────────────────────────────────────────
function ResultRow({ label, value }: { label: string; value: string }) {
    return (
        <div className='flex items-center justify-between py-2 border-b border-[#2c7bbe]/10 last:border-0'>
            <span className='text-gray-400 text-xs'>{label}</span>
            <span className='text-[#4cc7e8] font-bold text-xs tabular-nums'>{value}</span>
        </div>
    );
}

function ChartBox({ data }: { data: ChartPoint[] }) {
    return (
        <div className='h-28 md:h-40 lg:h-56 rounded-xl border border-[#252944] bg-gradient-to-br from-[#3c4158] via-[#222637] to-[#12141e] overflow-hidden p-2 lg:p-4'>
            <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={data} margin={{ top: 8, right: 10, left: -16, bottom: 2 }}>
                    <CartesianGrid stroke='rgba(255,255,255,0.08)' strokeDasharray='3 3' />

                    <XAxis
                        dataKey='year'
                        tick={{ fontSize: 9, fill: '#b7bed8' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.16)' }}
                        tickLine={{ stroke: 'rgba(255,255,255,0.16)' }}
                        interval='preserveStartEnd'
                        label={{
                            value: 'Years',
                            position: 'insideBottom',
                            offset: -2,
                            fill: '#9aa4c7',
                            fontSize: 9,
                        }}
                    />

                    <YAxis
                        tick={{ fontSize: 9, fill: '#b7bed8' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.16)' }}
                        tickLine={{ stroke: 'rgba(255,255,255,0.16)' }}
                        tickFormatter={compactCurrency}
                        width={44}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#050608',
                            border: '1px solid rgba(76,199,232,0.35)',
                            borderRadius: 12,
                            color: '#ffffff',
                        }}
                        labelStyle={{ color: '#ffffff' }}
                        formatter={(value: any) => [fmt(safeNumber(value)), 'Amount']}
                        labelFormatter={(label) => `Year ${label}`}
                    />

                    <Line
                        type='monotone'
                        dataKey='amount'
                        stroke='#F5A623'
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#F5A623', stroke: '#F5A623' }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function CalculatorShell({ title, Icon, gradient, chartData, children, showSelector, selectedKey, onSelectedKeyChange }: CalculatorShellProps) {
    const [selectorOpen, setSelectorOpen] = useState(false);

    return (
        <div className='w-full'>
            {/* Graph first */}
            <ChartBox data={chartData} />

            <div className='mt-4 flex items-center gap-3'>
                <div className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg shadow-black/30`}>
                    <Icon className='h-6 w-6 text-white' />
                </div>

                {showSelector && selectedKey && onSelectedKeyChange ? (
                    <div className='relative min-w-0 flex-1'>
                        <button
                            type='button'
                            onClick={() => setSelectorOpen((open) => !open)}
                            className='flex w-full items-center justify-between gap-3 rounded-xl border border-[#2c7bbe]/25 bg-[#050608] px-3 py-2 text-left transition-colors duration-200 hover:border-[#4cc7e8]/60'
                            aria-haspopup='listbox'
                            aria-expanded={selectorOpen}
                        >
                            <span className='min-w-0 truncate text-lg font-black text-white'>{title}</span>
                            <ChevronDown className={`h-5 w-5 shrink-0 text-[#F5A623] transition-transform duration-200 ${selectorOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {selectorOpen && (
                            <div
                                className='absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-[#2c7bbe]/35 bg-[#050608] shadow-2xl shadow-black/60'
                                role='listbox'
                            >
                                {CALCULATORS.map((calculator) => {
                                    const active = calculator.key === selectedKey;

                                    return (
                                        <button
                                            key={calculator.key}
                                            type='button'
                                            onClick={() => {
                                                onSelectedKeyChange(calculator.key);
                                                setSelectorOpen(false);
                                            }}
                                            className={`block w-full px-3 py-3 text-left text-sm font-bold transition-colors duration-200 ${
                                                active ? 'bg-[#F5A623] text-[#050608]' : 'text-white hover:bg-[#2c7bbe]/20'
                                            }`}
                                            role='option'
                                            aria-selected={active}
                                        >
                                            {calculator.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <h2 className='text-lg md:text-xl font-black text-white'>{title}</h2>
                )}
            </div>

            <div className='my-4 h-px bg-[#2c7bbe]/20' />

            {/* Calculations after graph */}
            {children}
        </div>
    );
}

// ─── Investment Calculator ───────────────────────────────────────────────────
function InvestmentCalc({
    showSelector,
    selectedKey,
    onSelectedKeyChange,
}: {
    showSelector?: boolean;
    selectedKey?: CalculatorKey;
    onSelectedKeyChange?: (key: CalculatorKey) => void;
}) {
    const [amount, setAmount] = useState('10000');
    const [years, setYears] = useState('5');
    const [rate, setRate] = useState('7');
    const [result, setResult] = useState<{ future: number; gain: number; pct: number } | null>(null);

    const chartData = useMemo(() => {
        const p = Math.max(0, safeNumber(amount));
        const r = safeNumber(rate) / 100;
        const n = clampYears(years, 5, 60);

        return Array.from({ length: n + 1 }, (_, index) => ({
            year: String(index),
            amount: p * Math.pow(1 + r, index),
        }));
    }, [amount, years, rate]);

    const calculate = useCallback(() => {
        const future = chartData[chartData.length - 1]?.amount ?? 0;
        const p = Math.max(0, safeNumber(amount));

        setResult({
            future,
            gain: future - p,
            pct: p ? ((future - p) / p) * 100 : 0,
        });
    }, [amount, chartData]);

    return (
        <CalculatorShell
            title='Investment Calculator'
            Icon={TrendingUp}
            gradient='from-[#F5A623] to-[#f0941a]'
            chartData={chartData}
            showSelector={showSelector}
            selectedKey={selectedKey}
            onSelectedKeyChange={onSelectedKeyChange}
        >
            <div className='space-y-3'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
                    <Field label='Amount' prefix='$' value={amount} onChange={setAmount} />
                    <Field label='Years' value={years} onChange={setYears} />
                    <Field label='Rate (%)' value={rate} onChange={setRate} />
                </div>

                <Button
                    onClick={calculate}
                    className='w-full rounded-xl bg-gradient-to-r from-[#F5A623] to-[#f0941a] hover:from-[#f0941a] hover:to-[#F5A623] text-[#050608] font-bold py-5 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]'
                >
                    <Calculator className='w-4 h-4 mr-2' />
                    Calculate
                </Button>

                {result && (
                    <div className='rounded-xl border border-[#2c7bbe]/20 bg-[#050608] p-3'>
                        <ResultRow label='Estimated Value' value={fmt(result.future)} />
                        <ResultRow label='Total Gain' value={fmt(result.gain)} />
                        <ResultRow label='Return' value={`${result.pct.toFixed(1)}%`} />
                    </div>
                )}
            </div>
        </CalculatorShell>
    );
}

// ─── Mortgage Calculator ─────────────────────────────────────────────────────
function MortgageCalc({
    showSelector,
    selectedKey,
    onSelectedKeyChange,
}: {
    showSelector?: boolean;
    selectedKey?: CalculatorKey;
    onSelectedKeyChange?: (key: CalculatorKey) => void;
}) {
    const [homePrice, setHomePrice] = useState('400000');
    const [downPayment, setDownPayment] = useState('40000');
    const [term, setTerm] = useState('30');
    const [rate, setRate] = useState('6.5');
    const [result, setResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);

    const principal = useMemo(() => Math.max(0, safeNumber(homePrice) - safeNumber(downPayment)), [homePrice, downPayment]);
    const years = useMemo(() => clampYears(term, 30, 60), [term]);
    const chartData = useMemo(() => buildBalanceChart(principal, safeNumber(rate), years), [principal, rate, years]);

    const calculate = useCallback(() => {
        const months = years * 12;
        const monthly = getPayment(principal, safeNumber(rate), months);
        const total = monthly * months;

        setResult({
            monthly,
            total,
            interest: Math.max(0, total - principal),
        });
    }, [principal, rate, years]);

    return (
        <CalculatorShell
            title='Mortgage Calculator'
            Icon={Home}
            gradient='from-[#E74C3C] to-[#c0392b]'
            chartData={chartData}
            showSelector={showSelector}
            selectedKey={selectedKey}
            onSelectedKeyChange={onSelectedKeyChange}
        >
            <div className='space-y-3'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                    <Field label='Home Price' prefix='$' value={homePrice} onChange={setHomePrice} />
                    <Field label='Down Payment' prefix='$' value={downPayment} onChange={setDownPayment} />
                    <Field label='Term (Years)' value={term} onChange={setTerm} />
                    <Field label='Rate (%)' value={rate} onChange={setRate} />
                </div>

                <Button
                    onClick={calculate}
                    className='w-full rounded-xl bg-gradient-to-r from-[#E74C3C] to-[#c0392b] hover:from-[#c0392b] hover:to-[#E74C3C] text-white font-bold py-5 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]'
                >
                    <Calculator className='w-4 h-4 mr-2' />
                    Calculate
                </Button>

                {result && (
                    <div className='rounded-xl border border-[#2c7bbe]/20 bg-[#050608] p-3'>
                        <ResultRow label='Monthly Payment' value={fmt(result.monthly)} />
                        <ResultRow label='Total Payment' value={fmt(result.total)} />
                        <ResultRow label='Total Interest' value={fmt(result.interest)} />
                    </div>
                )}
            </div>
        </CalculatorShell>
    );
}

// ─── Loan Calculator ─────────────────────────────────────────────────────────
function LoanCalc({
    showSelector,
    selectedKey,
    onSelectedKeyChange,
}: {
    showSelector?: boolean;
    selectedKey?: CalculatorKey;
    onSelectedKeyChange?: (key: CalculatorKey) => void;
}) {
    const [loanAmount, setLoanAmount] = useState('20000');
    const [term, setTerm] = useState('4');
    const [rate, setRate] = useState('9');
    const [result, setResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);

    const principal = useMemo(() => Math.max(0, safeNumber(loanAmount)), [loanAmount]);
    const years = useMemo(() => clampYears(term, 4, 60), [term]);
    const chartData = useMemo(() => buildBalanceChart(principal, safeNumber(rate), years), [principal, rate, years]);

    const calculate = useCallback(() => {
        const months = years * 12;
        const monthly = getPayment(principal, safeNumber(rate), months);
        const total = monthly * months;

        setResult({
            monthly,
            total,
            interest: Math.max(0, total - principal),
        });
    }, [principal, rate, years]);

    return (
        <CalculatorShell
            title='Loan Calculator'
            Icon={Wallet}
            gradient='from-[#2ECC71] to-[#27ae60]'
            chartData={chartData}
            showSelector={showSelector}
            selectedKey={selectedKey}
            onSelectedKeyChange={onSelectedKeyChange}
        >
            <div className='space-y-3'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
                    <Field label='Loan Amount' prefix='$' value={loanAmount} onChange={setLoanAmount} />
                    <Field label='Term (Years)' value={term} onChange={setTerm} />
                    <Field label='Rate (%)' value={rate} onChange={setRate} />
                </div>

                <Button
                    onClick={calculate}
                    className='w-full rounded-xl bg-gradient-to-r from-[#2ECC71] to-[#27ae60] hover:from-[#27ae60] hover:to-[#2ECC71] text-[#050608] font-bold py-5 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]'
                >
                    <Calculator className='w-4 h-4 mr-2' />
                    Calculate
                </Button>

                {result && (
                    <div className='rounded-xl border border-[#2c7bbe]/20 bg-[#050608] p-3'>
                        <ResultRow label='Monthly Payment' value={fmt(result.monthly)} />
                        <ResultRow label='Total Repayment' value={fmt(result.total)} />
                        <ResultRow label='Total Interest' value={fmt(result.interest)} />
                    </div>
                )}
            </div>
        </CalculatorShell>
    );
}

// ─── Retirement Calculator ───────────────────────────────────────────────────
function RetirementCalc({
    showSelector,
    selectedKey,
    onSelectedKeyChange,
}: {
    showSelector?: boolean;
    selectedKey?: CalculatorKey;
    onSelectedKeyChange?: (key: CalculatorKey) => void;
}) {
    const [currentAge, setCurrentAge] = useState('35');
    const [retirementAge, setRetirementAge] = useState('65');
    const [monthlySavings, setMonthlySavings] = useState('500');
    const [roi, setRoi] = useState('7');
    const [result, setResult] = useState<{ nest: number; contributions: number; growth: number } | null>(null);

    const years = useMemo(() => {
        const current = safeNumber(currentAge, 35);
        const retirement = safeNumber(retirementAge, 65);

        return Math.max(1, Math.min(60, Math.floor(retirement - current)));
    }, [currentAge, retirementAge]);

    const chartData = useMemo(() => {
        const monthlyRate = safeNumber(roi) / 100 / 12;
        const pmt = Math.max(0, safeNumber(monthlySavings));

        return Array.from({ length: years + 1 }, (_, year) => {
            const months = year * 12;
            const amount = monthlyRate === 0 ? pmt * months : pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

            return {
                year: String(year),
                amount,
            };
        });
    }, [monthlySavings, roi, years]);

    const calculate = useCallback(() => {
        const nest = chartData[chartData.length - 1]?.amount ?? 0;
        const contributions = Math.max(0, safeNumber(monthlySavings)) * years * 12;

        setResult({
            nest,
            contributions,
            growth: nest - contributions,
        });
    }, [chartData, monthlySavings, years]);

    return (
        <CalculatorShell
            title='Retirement Calculator'
            Icon={PiggyBank}
            gradient='from-[#2c7bbe] to-[#4cc7e8]'
            chartData={chartData}
            showSelector={showSelector}
            selectedKey={selectedKey}
            onSelectedKeyChange={onSelectedKeyChange}
        >
            <div className='space-y-3'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                    <Field label='Current Age' value={currentAge} onChange={setCurrentAge} />
                    <Field label='Retirement Age' value={retirementAge} onChange={setRetirementAge} />
                    <Field label='Monthly Savings' prefix='$' value={monthlySavings} onChange={setMonthlySavings} />
                    <Field label='ROI (%)' value={roi} onChange={setRoi} />
                </div>

                <Button
                    onClick={calculate}
                    className='w-full rounded-xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold py-5 shadow-lg shadow-[#2c7bbe]/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]'
                >
                    <Calculator className='w-4 h-4 mr-2' />
                    Calculate
                </Button>

                {result && (
                    <div className='rounded-xl border border-[#2c7bbe]/20 bg-[#050608] p-3'>
                        <ResultRow label='Retirement Nest Egg' value={fmt(result.nest)} />
                        <ResultRow label='Total Contributions' value={fmt(result.contributions)} />
                        <ResultRow label='Investment Growth' value={fmt(result.growth)} />
                    </div>
                )}
            </div>
        </CalculatorShell>
    );
}

// ─── Calculator config ───────────────────────────────────────────────────────
const CALCULATORS: {
    key: CalculatorKey;
    label: string;
    Component: (props: { showSelector?: boolean; selectedKey?: CalculatorKey; onSelectedKeyChange?: (key: CalculatorKey) => void }) => ReactElement;
}[] = [
    { key: 'investment', label: 'Investment Calculator', Component: InvestmentCalc },
    { key: 'mortgage', label: 'Mortgage Calculator', Component: MortgageCalc },
    { key: 'loan', label: 'Loan Calculator', Component: LoanCalc },
    { key: 'retirement', label: 'Retirement Calculator', Component: RetirementCalc },
];

function MobilePhoneFrame({ children }: { children: ReactNode }) {
    return (
        <div className='relative w-full max-w-[330px] rounded-[44px] border-[18px] border-[#4a4c78] bg-[#08090e] px-3 py-5 shadow-[0_30px_80px_rgba(0,0,0,0.65)]'>
            <div className='absolute -left-[23px] top-[92px] h-9 w-[7px] rounded-l-md bg-[#4a4c78]' />
            <div className='absolute -left-[23px] top-[145px] h-9 w-[7px] rounded-l-md bg-[#4a4c78]' />
            <div className='absolute -right-[23px] top-[118px] h-12 w-[7px] rounded-r-md bg-[#4a4c78]' />

            {children}
        </div>
    );
}

function DesktopWideFrame({ children }: { children: ReactNode }) {
    return (
        <div className='relative w-full rounded-[44px] border-[18px] border-[#4a4c78] bg-[#08090e] p-6 lg:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.7)]'>
            <div className='absolute -left-[23px] top-[120px] h-14 w-[7px] rounded-l-md bg-[#4a4c78]' />
            <div className='absolute -left-[23px] top-[195px] h-14 w-[7px] rounded-l-md bg-[#4a4c78]' />
            <div className='absolute -right-[23px] top-[150px] h-20 w-[7px] rounded-r-md bg-[#4a4c78]' />

            {children}
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function BlackSnowMathematics() {
    const [selectedCalculator, setSelectedCalculator] = useState<CalculatorKey>('investment');
    const ActiveCalculator = CALCULATORS.find((calculator) => calculator.key === selectedCalculator)?.Component ?? InvestmentCalc;

    return (
        <div className='min-h-screen bg-[#050608] px-4 py-8 lg:px-8 lg:py-12'>
            {/* Mobile version remains the same */}
            <div className='lg:hidden flex justify-center'>
                <MobilePhoneFrame>
                    <h1 className='text-center text-[#2cbbff] text-sm font-semibold mb-3'>Black Snow Mathematics</h1>

                    <ActiveCalculator showSelector selectedKey={selectedCalculator} onSelectedKeyChange={setSelectedCalculator} />
                </MobilePhoneFrame>
            </div>

            {/* Desktop version: same dropdown calculator flow as mobile, only larger */}
            <div className='hidden lg:block max-w-7xl mx-auto'>
                <DesktopWideFrame>
                    <h1 className='text-center text-[#2cbbff] text-2xl font-semibold mb-6'>Black Snow Mathematics</h1>

                    <div className='rounded-3xl border border-[#2c7bbe]/30 bg-[#050608]/70 p-6 lg:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.35)]'>
                        <ActiveCalculator showSelector selectedKey={selectedCalculator} onSelectedKeyChange={setSelectedCalculator} />
                    </div>
                </DesktopWideFrame>
            </div>

            {/* Remove number spinners */}
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
