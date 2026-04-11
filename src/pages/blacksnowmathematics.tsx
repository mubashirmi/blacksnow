'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2, Calculator, Globe2, Home, Layers, MonitorSmartphone, PiggyBank, ShieldCheck, TrendingUp, Wallet, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

// ─── Shared input — styled to match the dark card surface ────────────────────
function Field({ label, prefix, value, onChange }: { label: string; prefix?: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className='block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-widest'>{label}</label>
            <div className='flex items-center gap-2 rounded-xl border border-[#2c7bbe]/30 bg-[#050608] px-4 py-3 focus-within:border-[#4cc7e8]/60 transition-colors duration-200'>
                {prefix && <span className='text-gray-500 font-semibold text-sm flex-shrink-0'>{prefix}</span>}
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
            <span className='text-gray-400 text-sm'>{label}</span>
            <span className='text-[#4cc7e8] font-bold text-sm tabular-nums'>{value}</span>
        </div>
    );
}

// ─── Investment Calculator ─────────────────────────────────────────────────────
function InvestmentCalc() {
    const [amount, setAmount] = useState('10000');
    const [years, setYears] = useState('5');
    const [rate, setRate] = useState('7');
    const [result, setResult] = useState<{ future: number; gain: number; pct: number } | null>(null);

    const calculate = useCallback(() => {
        const p = parseFloat(amount) || 0;
        const r = parseFloat(rate) / 100;
        const n = parseFloat(years) || 0;
        const future = p * Math.pow(1 + r, n);
        setResult({ future, gain: future - p, pct: p ? ((future - p) / p) * 100 : 0 });
    }, [amount, years, rate]);

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <Field label='Amount' prefix='$' value={amount} onChange={setAmount} />
                <Field label='Years' value={years} onChange={setYears} />
                <Field label='Rate (%)' value={rate} onChange={setRate} />
            </div>
            <Button
                onClick={calculate}
                className='w-full bg-gradient-to-r from-[#F5A623] to-[#f0941a] hover:from-[#f0941a] hover:to-[#F5A623] text-[#050608] font-bold py-5 transition-all duration-300 transform hover:scale-[1.02] rounded-xl'
            >
                <Calculator className='w-4 h-4 mr-2' /> Calculate
            </Button>
            {result && (
                <div className='rounded-xl border border-[#2c7bbe]/20 bg-[#050608] p-4 mt-2 space-y-0'>
                    <ResultRow label='Estimated Value' value={fmt(result.future)} />
                    <ResultRow label='Total Gain' value={fmt(result.gain)} />
                    <ResultRow label='Return' value={`${result.pct.toFixed(1)}%`} />
                </div>
            )}
        </div>
    );
}

// ─── Mortgage Calculator ───────────────────────────────────────────────────────
function MortgageCalc() {
    const [homePrice, setHomePrice] = useState('400000');
    const [downPayment, setDownPayment] = useState('40000');
    const [term, setTerm] = useState('30');
    const [rate, setRate] = useState('6.5');
    const [result, setResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);

    const calculate = useCallback(() => {
        const principal = (parseFloat(homePrice) || 0) - (parseFloat(downPayment) || 0);
        const monthlyRate = (parseFloat(rate) || 0) / 100 / 12;
        const months = (parseFloat(term) || 0) * 12;
        if (monthlyRate === 0) {
            setResult({ monthly: principal / months, total: principal, interest: 0 });
            return;
        }
        const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const total = monthly * months;
        setResult({ monthly, total, interest: total - principal });
    }, [homePrice, downPayment, term, rate]);

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Field label='Home Price' prefix='$' value={homePrice} onChange={setHomePrice} />
                <Field label='Down Payment' prefix='$' value={downPayment} onChange={setDownPayment} />
                <Field label='Term (Years)' value={term} onChange={setTerm} />
                <Field label='Rate (%)' value={rate} onChange={setRate} />
            </div>
            <Button
                onClick={calculate}
                className='w-full bg-gradient-to-r from-[#E74C3C] to-[#c0392b] hover:from-[#c0392b] hover:to-[#E74C3C] text-white font-bold py-5 transition-all duration-300 transform hover:scale-[1.02] rounded-xl'
            >
                <Calculator className='w-4 h-4 mr-2' /> Calculate
            </Button>
            {result && (
                <div className='rounded-xl border border-[#2c7bbe]/20 bg-[#050608] p-4 mt-2'>
                    <ResultRow label='Monthly Payment' value={fmt(result.monthly)} />
                    <ResultRow label='Total Payment' value={fmt(result.total)} />
                    <ResultRow label='Total Interest' value={fmt(result.interest)} />
                </div>
            )}
        </div>
    );
}

// ─── Loan Calculator ───────────────────────────────────────────────────────────
function LoanCalc() {
    const [loanAmount, setLoanAmount] = useState('20000');
    const [term, setTerm] = useState('4');
    const [rate, setRate] = useState('9');
    const [result, setResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);

    const calculate = useCallback(() => {
        const principal = parseFloat(loanAmount) || 0;
        const monthlyRate = (parseFloat(rate) || 0) / 100 / 12;
        const months = (parseFloat(term) || 0) * 12;
        if (monthlyRate === 0) {
            setResult({ monthly: principal / months, total: principal, interest: 0 });
            return;
        }
        const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const total = monthly * months;
        setResult({ monthly, total, interest: total - principal });
    }, [loanAmount, term, rate]);

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <Field label='Loan Amount' prefix='$' value={loanAmount} onChange={setLoanAmount} />
                <Field label='Term (Years)' value={term} onChange={setTerm} />
                <Field label='Rate (%)' value={rate} onChange={setRate} />
            </div>
            <Button
                onClick={calculate}
                className='w-full bg-gradient-to-r from-[#2ECC71] to-[#27ae60] hover:from-[#27ae60] hover:to-[#2ECC71] text-[#050608] font-bold py-5 transition-all duration-300 transform hover:scale-[1.02] rounded-xl'
            >
                <Calculator className='w-4 h-4 mr-2' /> Calculate
            </Button>
            {result && (
                <div className='rounded-xl border border-[#2c7bbe]/20 bg-[#050608] p-4 mt-2'>
                    <ResultRow label='Monthly Payment' value={fmt(result.monthly)} />
                    <ResultRow label='Total Repayment' value={fmt(result.total)} />
                    <ResultRow label='Total Interest' value={fmt(result.interest)} />
                </div>
            )}
        </div>
    );
}

// ─── Retirement Calculator ─────────────────────────────────────────────────────
function RetirementCalc() {
    const [currentAge, setCurrentAge] = useState('35');
    const [retirementAge, setRetirementAge] = useState('65');
    const [monthlySavings, setMonthlySavings] = useState('500');
    const [roi, setRoi] = useState('7');
    const [result, setResult] = useState<{ nest: number; contributions: number; growth: number } | null>(null);

    const calculate = useCallback(() => {
        const years = (parseFloat(retirementAge) || 65) - (parseFloat(currentAge) || 35);
        const months = years * 12;
        const monthlyRate = (parseFloat(roi) || 0) / 100 / 12;
        const pmt = parseFloat(monthlySavings) || 0;
        const nest = monthlyRate === 0 ? pmt * months : pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const contributions = pmt * months;
        setResult({ nest, contributions, growth: nest - contributions });
    }, [currentAge, retirementAge, monthlySavings, roi]);

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Field label='Current Age' value={currentAge} onChange={setCurrentAge} />
                <Field label='Retirement Age' value={retirementAge} onChange={setRetirementAge} />
                <Field label='Monthly Savings' prefix='$' value={monthlySavings} onChange={setMonthlySavings} />
                <Field label='ROI (%)' value={roi} onChange={setRoi} />
            </div>
            <Button
                onClick={calculate}
                className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold py-5 shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-[1.02] rounded-xl'
            >
                <Calculator className='w-4 h-4 mr-2' /> Calculate
            </Button>
            {result && (
                <div className='rounded-xl border border-[#2c7bbe]/20 bg-[#050608] p-4 mt-2'>
                    <ResultRow label='Retirement Nest Egg' value={fmt(result.nest)} />
                    <ResultRow label='Total Contributions' value={fmt(result.contributions)} />
                    <ResultRow label='Investment Growth' value={fmt(result.growth)} />
                </div>
            )}
        </div>
    );
}

// ─── Calculator card config ───────────────────────────────────────────────────
const CALCULATORS = [
    {
        label: 'Investment Calculator',
        subtitle: 'Estimate compound growth on your capital over time.',
        Icon: TrendingUp,
        gradient: 'from-[#F5A623] to-[#f0941a]',
        Component: InvestmentCalc,
    },
    {
        label: 'Mortgage Calculator',
        subtitle: 'Break down your home loan into clear monthly payments.',
        Icon: Home,
        gradient: 'from-[#E74C3C] to-[#c0392b]',
        Component: MortgageCalc,
    },
    {
        label: 'Loan Calculator',
        subtitle: 'See exactly what you owe monthly on any loan.',
        Icon: Wallet,
        gradient: 'from-[#2ECC71] to-[#27ae60]',
        Component: LoanCalc,
    },
    {
        label: 'Retirement Calculator',
        subtitle: 'Project your long-term savings and retirement nest egg.',
        Icon: PiggyBank,
        gradient: 'from-[#2c7bbe] to-[#4cc7e8]',
        Component: RetirementCalc,
    },
];

const FEATURES = [
    { Icon: ShieldCheck, label: 'Risk Management Engine', desc: 'Quantify exposure and size positions precisely before entering any trade.' },
    { Icon: Zap, label: 'Instant Trade Calculations', desc: 'Results in milliseconds — no waiting, no page reloads, no friction.' },
    { Icon: BarChart2, label: 'Profit & Loss Forecasting', desc: 'Project P&L across scenarios so you know your downside before you commit.' },
    { Icon: Globe2, label: 'Multi-Market Support', desc: 'Works across equities, crypto, FX, and fixed income instruments.' },
    { Icon: MonitorSmartphone, label: 'Mobile & Desktop Compatible', desc: 'Fully responsive — calculate from your desk or on the move.' },
    { Icon: Layers, label: 'Strategy Validation', desc: 'Stress-test your plan against different rate and time assumptions.' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlackSnowMathematics() {
    return (
        <div className='min-h-screen bg-[#050608]'>
            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        {/* Left — copy */}
                        <div className='space-y-7 sm:space-y-8 md:space-y-10 animate-slide-in-left'>
                            <div>
                                <div className='w-full'></div>
                                <div className='inline-block'>
                                    <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight'>
                                        Black Snow{' '}
                                        <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Mathematics</span>
                                    </h1>
                                </div>
                            </div>

                            <div className='space-y-4 sm:space-y-5'>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Analyze price movement, position sizing, risk exposure, and profit potential in seconds.{' '}
                                    <span className='text-[#4cc7e8] font-semibold'>Black Snow Mathematics</span> transforms raw numbers into actionable trading
                                    insights.
                                </p>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Helping you <span className='text-[#2c7bbe] font-semibold'>plan smarter trades, manage risk precisely,</span> and execute
                                    with confidence across any market — all from one place.
                                </p>
                            </div>
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2'>
                                <Button
                                    onClick={() => document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth' })}
                                    size='lg'
                                    className='group border-2 box-border cursor-pointer border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full max-w-[320px] sm:min-w-[300px]'
                                >
                                    Open Calculators
                                </Button>
                            </div>
                        </div>

                        {/* Right — stats grid */}
                        <div className='relative w-full'>
                            <div className='grid grid-cols-2 gap-4'>
                                {[
                                    { label: 'Investment', example: '$14,025', sub: 'Estimated Value', color: 'from-[#F5A623] to-[#f0941a]', Icon: TrendingUp },
                                    { label: 'Mortgage', example: '$2,147', sub: 'Monthly Payment', color: 'from-[#E74C3C] to-[#c0392b]', Icon: Home },
                                    { label: 'Loan', example: '$497', sub: 'Monthly Payment', color: 'from-[#2ECC71] to-[#27ae60]', Icon: Wallet },
                                    { label: 'Retirement', example: '$892K', sub: 'Nest Egg', color: 'from-[#2c7bbe] to-[#4cc7e8]', Icon: PiggyBank },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className='bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 rounded-2xl p-5 sm:p-6 transition-all duration-300 transform hover:scale-105'
                                    >
                                        <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
                                            <stat.Icon className='w-5 h-5 text-white' />
                                        </div>
                                        <p className='text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1'>{stat.label}</p>
                                        <p className='text-2xl sm:text-3xl font-black text-white tabular-nums leading-tight'>{stat.example}</p>
                                        <p className='text-xs text-gray-500 mt-1'>{stat.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CALCULATORS ──────────────────────────────────────────────── */}
            <section id='calculators' className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-12 sm:mb-16 md:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            CALCULATORS
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6'>
                            Run the <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Numbers</span>
                        </h2>
                        <p className='text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Four calculators built for traders, investors, and business owners. Enter your numbers and get an accurate breakdown instantly.
                        </p>
                    </div>

                    <div className='space-y-8'>
                        {CALCULATORS.map(({ label, subtitle, Icon, gradient, Component }) => (
                            <Card
                                key={label}
                                className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl'
                            >
                                <CardContent className='p-6 sm:p-8'>
                                    <div className='flex flex-col sm:flex-row items-start gap-5 sm:gap-6 mb-6'>
                                        {/* Icon — same style as Core Values icon boxes */}
                                        <div className='flex-shrink-0'>
                                            <div
                                                className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                                            >
                                                <Icon className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className='text-xl sm:text-2xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                {label}
                                            </h3>
                                            <p className='text-gray-400 mt-1 text-sm sm:text-base leading-relaxed'>{subtitle}</p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className='w-full h-px bg-[#2c7bbe]/15 mb-6' />

                                    <Component />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────────────────────── */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-12 sm:mb-16 md:mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            WHAT&apos;S INSIDE
                        </Badge>
                        <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6'>
                            Built for <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Traders</span>
                        </h2>
                        <p className='text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                            Every feature is designed around real trading decisions — not generic finance tools.
                        </p>
                    </div>

                    <div className='space-y-8'>
                        {FEATURES.map(({ Icon, label, desc }) => (
                            <Card
                                key={label}
                                className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'
                            >
                                <CardContent className='p-8'>
                                    <div className='flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-6'>
                                        <div className='flex-shrink-0'>
                                            <div className='w-16 h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center shadow-lg'>
                                                <Icon className='w-8 h-8 text-white' />
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <h3 className='text-xl sm:text-2xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                {label}
                                            </h3>
                                            <p className='text-gray-300 leading-relaxed text-base sm:text-lg'>{desc}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

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

// export { BlackSnowMathematics };
