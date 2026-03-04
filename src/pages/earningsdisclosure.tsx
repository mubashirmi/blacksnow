'use client';

import { Badge } from '@/components/ui/badge';

export default function EarningsDisclosurePage() {
    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Header */}
            <div className='relative z-10 pt-20 pb-10 px-6'>
                <div className='container mx-auto max-w-4xl text-center'>
                    <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                        LEGAL INFORMATION
                    </Badge>
                    <h1 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 animate-slide-in-up delay-200'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Earnings Disclosure</span>
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className='relative z-10 px-6 pb-24'>
                <div className='container mx-auto max-w-4xl'>
                    <div className='bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 rounded-3xl p-12 shadow-xl shadow-[#2c7bbe]/10 animate-slide-in-up relative'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-t-3xl' />

                        <div className='prose prose-invert prose-lg max-w-none space-y-5'>
                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>Black Snow Holdings Earnings Disclosure</span>
                                <br />
                                <span className='text-gray-500 text-sm'>Last updated: February 2026</span>
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>No Earnings Guarantees – Important Disclosure</span>
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                Black Snow Holdings provides educational materials, trading strategies, market insights, paper trading simulations, and related
                                resources to help individuals learn about day trading, options, chart reading, and market analysis. Any references to past
                                performance, profits (including claims like &quot;$12.8M+ in profits&quot; generated through our framework), or results are for
                                illustrative and educational purposes only.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>Key Points</span>
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                Past performance is not indicative of future results. Trading and investing involve substantial risk of loss and are not
                                suitable for everyone. You could lose more than your initial investment.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                The trading strategies, examples, testimonials, or performance figures shared on our website, newsletters, courses, or marketing
                                materials may not be typical. Most individual traders lose money, and only a small percentage achieve consistent profitability.
                                Results depend on many factors, including market conditions, skill, discipline, risk management, starting capital, and
                                experience.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                No representation is made that following our education, strategies, or using our tools (e.g., stock screener, paper trading
                                simulator) will lead to profits, avoid losses, or achieve any specific financial outcome.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                Hypothetical or simulated performance results have inherent limitations. They do not represent actual trading and may not
                                account for real-world factors like slippage, commissions, liquidity issues, or emotional decisions. Simulated results are not
                                necessarily indicative of future performance.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                Any earnings or income statements should not be considered guarantees or promises. We do not promise, guarantee, or imply any
                                specific level of earnings or profit.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                Trading securities, options, and other financial instruments carries a high level of risk and is not appropriate for all
                                individuals. Only risk capital you can afford to lose should be used for trading. Consult a qualified financial advisor before
                                making any investment decisions.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                This disclosure applies to all content on blacksnowholdings.com and associated materials.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
