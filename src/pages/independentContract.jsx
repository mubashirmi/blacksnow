'use client';

import { CheckCircle } from 'lucide-react';

const BENEFITS = [
    {
        title: 'Flexibility and Autonomy',
        body: "As an independent contractor, you have the freedom to work on projects that match your expertise, whether it's creating educational content, analyzing market data, or advising on trading strategies. Set your own hours and work remotely, aligning with our fully responsive platform that supports mobile, tablet, and desktop compatibility for seamless collaboration.",
    },
    {
        title: 'Competitive Compensation',
        body: 'Leverage our elite framework, which has generated over $12.8M in profits, to access performance-based earnings. Contractors benefit from revenue-sharing models on courses, tools like our paper trading simulator and stock screener, and exclusive access to real-time market data for your contributions.',
    },
    {
        title: 'Professional Development',
        body: 'Join a network that champions a growth mindset. Gain exposure to cutting-edge trading tools, weekly market intelligence, and sectors like A.I., EV, and Tech. We provide resources for continuous learning, including our coming-soon stock screener and watchlist features, to help you evolve from contributor to industry leader.',
    },
    {
        title: 'Diverse and Inclusive Network',
        body: 'We value diversity in our contractor community, welcoming varied perspectives to drive innovation. This inclusive environment fosters creativity and ensures that our solutions reflect a broad range of experiences, enhancing the quality of our trading education and client outcomes.',
    },
];

const REQUIREMENTS = [
    'Proven experience in day trading, options trading, chart analysis, or related financial fields.',
    'Strong analytical skills with the ability to interpret market data and develop actionable strategies.',
    'Commitment to excellence and integrity in delivering high-quality, client-centered content or services.',
    'Familiarity with digital tools for remote collaboration; experience with simulated trading platforms is a plus.',
];

export default function IndependentContractorPage() {
    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Header */}
            <div className='relative z-10 pt-20 pb-10 px-6'>
                <div className='container mx-auto max-w-4xl text-center'>
                    <h1 className='text-2xl lg:text-6xl font-black text-white mb-4 sm:mb-5 animate-slide-in-up delay-200'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Independent Contractor</span>
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className='relative z-10 px-6 pb-24'>
                <div className='container mx-auto max-w-4xl space-y-8'>
                    {/* ── Intro card ── */}
                    <div className='bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 rounded-3xl p-10 shadow-xl shadow-[#2c7bbe]/10 animate-slide-in-up relative'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-t-3xl' />
                        <h2 className='text-xl font-bold text-white mb-4'>Our Commitment to Independent Contractors</h2>
                        <p className='text-gray-300 leading-relaxed text-base mb-4'>
                            At Black Snow Holdings, we empower independent contractors to thrive in the dynamic world of finance and investment. As a
                            forward-thinking investment firm founded in 2024, we recognize the value of flexible, expert-driven collaborations that align with
                            our client-focused approach. Independent contractors play a key role in expanding our offerings, from developing online course
                            materials on day trading, options, and chart reading to providing specialized market insights and strategy consultations.
                        </p>
                        <p className='text-gray-300 leading-relaxed text-base'>
                            Our independent contractor program is designed for experienced professionals who share our passion for diversification, innovation,
                            and delivering exceptional results. By partnering with us, you contribute to solving real-world trading challenges while enjoying
                            the autonomy to manage your schedule and projects.
                        </p>
                    </div>

                    {/* ── Core Benefits ── */}
                    <div className='bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 rounded-3xl p-10 shadow-xl shadow-[#2c7bbe]/10 animate-slide-in-up relative'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-t-3xl' />

                        <div className='mb-8'>
                            <h2 className='text-xl font-bold text-white mb-2'>Core Benefits</h2>
                            <p className='text-gray-400 text-sm'>
                                The advantages that define our independent contractor opportunities and support your professional growth.
                            </p>
                        </div>

                        <div className='space-y-6'>
                            {BENEFITS.map((benefit, idx) => (
                                <div key={idx} className='flex gap-4'>
                                    <div
                                        className='flex-shrink-0 w-2 rounded-full mt-1'
                                        style={{ background: 'linear-gradient(180deg, #2c7bbe, #4cc7e8)', minHeight: 20 }}
                                    />
                                    <div>
                                        <h3 className='text-white font-semibold text-base mb-1'>{benefit.title}</h3>
                                        <p className='text-gray-300 leading-relaxed text-sm'>{benefit.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Requirements ── */}
                    <div className='bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 rounded-3xl p-10 shadow-xl shadow-[#2c7bbe]/10 animate-slide-in-up relative'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-t-3xl' />

                        <div className='mb-8'>
                            <h2 className='text-xl font-bold text-white mb-2'>Requirements and Qualifications</h2>
                            <p className='text-gray-400 text-sm'>
                                To ensure mutual success, we seek independent contractors who embody our core values of growth, diversity, and value.
                            </p>
                        </div>

                        <ul className='space-y-4'>
                            {REQUIREMENTS.map((req, idx) => (
                                <li key={idx} className='flex items-start gap-3'>
                                    <CheckCircle className='w-5 h-5 text-[#4cc7e8] flex-shrink-0 mt-0.5' strokeWidth={2.5} />
                                    <span className='text-gray-300 leading-relaxed text-sm'>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
