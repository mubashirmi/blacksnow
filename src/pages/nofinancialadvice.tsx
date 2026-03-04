'use client';

import { Badge } from '@/components/ui/badge';

export default function NoFinancialAdvicePage() {
    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Header */}
            <div className='relative z-10 pt-20 pb-10 px-6'>
                <div className='container mx-auto max-w-4xl text-center'>
                    <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                        LEGAL INFORMATION
                    </Badge>
                    <h1 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 animate-slide-in-up delay-200'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>No Financial Advice</span>
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
                                <span className='font-bold text-white'>Black Snow Holdings No Financial Advice Disclaimer</span>
                                <br />
                                <span className='text-gray-500 text-sm'>Last updated: February 2026</span>
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>For Educational and Informational Purposes Only – Not Financial Advice</span>
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                Black Snow Holdings operates this website to provide general education, information, market data analysis, trading strategies,
                                paper trading simulations, newsletters, and resources related to day trading, options trading, chart reading, and financial
                                markets.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>Important:</span>
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                Nothing on this website, in our newsletters, courses, blog posts, emails, social media, or any other communications constitutes
                                personalized investment, financial, tax, legal, or other professional advice.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                The content is intended for educational and informational purposes only and should not be relied upon as the basis for
                                investment, trading, or financial decisions.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                We are not registered investment advisors, brokers, or financial planners. We do not provide recommendations to buy, sell, hold,
                                or trade any securities, options, ETFs, or other financial instruments.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                All trading and investing involve significant risk of loss. Past performance does not guarantee future results. Market
                                conditions can change rapidly, and you are solely responsible for your own trading and investment decisions.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                Before acting on any information from our site or materials, consult a qualified, licensed financial advisor, investment
                                professional, or other relevant expert who can assess your individual financial situation, goals, risk tolerance, and needs.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                Black Snow Holdings, its owners, employees, contributors, or affiliates are not liable for any losses, damages, or consequences
                                (direct, indirect, incidental, or consequential) arising from the use of our content, tools, or services, whether due to errors,
                                omissions, market movements, or otherwise.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                By accessing or using our website or services, you acknowledge and agree to this disclaimer.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                If you have questions, contact{' '}
                                <a href='mailto:support@blacksnowholdings.com' className='text-[#4cc7e8] hover:underline'>
                                    support@blacksnowholdings.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
