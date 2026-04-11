'use client';

import { AuthModalTrigger } from '@/components/AuthModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Cookie, ExternalLink, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function Cookies() {
    const lastUpdated = 'January 18, 2026'; // change anytime

    const sections = [
        {
            icon: Cookie,
            title: 'What are cookies?',
            content: (
                <>
                    <p className='text-gray-300 leading-relaxed'>
                        Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you
                        signed in, and understand how visitors use the site.
                    </p>
                </>
            ),
        },
        {
            icon: ShieldCheck,
            title: 'How we use cookies',
            content: (
                <>
                    <p className='text-gray-300 leading-relaxed mb-4'>
                        Black Snow uses cookies to deliver a secure, reliable, and personalized experience, including:
                    </p>
                    <ul className='list-disc pl-6 space-y-2 text-gray-300'>
                        <li>Keeping the site secure and preventing fraud.</li>
                        <li>Remembering your preferences (like language or region).</li>
                        <li>Understanding site performance and usage to improve features.</li>
                        <li>Supporting marketing and campaign measurement (where applicable).</li>
                    </ul>
                </>
            ),
        },
        {
            icon: Settings,
            title: 'Types of cookies we use',
            content: (
                <>
                    <div className='space-y-4 text-gray-300'>
                        <div>
                            <p className='font-semibold text-white'>Strictly Necessary</p>
                            <p className='leading-relaxed'>Required for core functionality such as security, page navigation, and access to protected areas.</p>
                        </div>
                        <div>
                            <p className='font-semibold text-white'>Performance & Analytics</p>
                            <p className='leading-relaxed'>Help us measure traffic and usage patterns so we can improve our site and services.</p>
                        </div>
                        <div>
                            <p className='font-semibold text-white'>Functional</p>
                            <p className='leading-relaxed'>Remember your choices (like settings) to provide enhanced features and personalization.</p>
                        </div>
                        <div>
                            <p className='font-semibold text-white'>Marketing</p>
                            <p className='leading-relaxed'>Used to measure the effectiveness of campaigns and deliver relevant content (only where enabled).</p>
                        </div>
                    </div>
                </>
            ),
        },
        {
            icon: Settings,
            title: 'Managing your cookie preferences',
            content: (
                <>
                    <p className='text-gray-300 leading-relaxed mb-4'>
                        You can control cookies through your browser settings and (where available) our cookie preferences tool.
                    </p>
                    <ul className='list-disc pl-6 space-y-2 text-gray-300'>
                        <li>
                            Browser controls: You can block or delete cookies in your browser settings. Some features may not work properly if you disable
                            cookies.
                        </li>
                        <li>Opt-out: You may be able to opt out of analytics/marketing cookies depending on your region.</li>
                    </ul>

                    <div className='mt-6 flex flex-col sm:flex-row gap-3'>
                        {/* If you have a real cookie preferences modal/page, link it here */}
                        <Link
                            href='#cookie-preferences'
                            className='
                inline-flex items-center gap-2
                px-4 py-2
                text-sm font-medium
                text-white/90
                border border-[#4cc7e8]/40
                bg-transparent
                rounded-md
                transition
                hover:bg-[#4cc7e8]
                hover:text-[#050608]
              '
                        >
                            Manage Cookie Preferences <ArrowRight className='w-4 h-4' />
                        </Link>

                        <Link
                            href='https://www.allaboutcookies.org/'
                            target='_blank'
                            className='
                inline-flex items-center gap-2
                px-4 py-2
                text-sm font-medium
                text-white/70
                border border-white/15
                bg-transparent
                rounded-md
                transition
                hover:bg-white/10
                hover:text-white
              '
                        >
                            Learn more about cookies <ExternalLink className='w-4 h-4' />
                        </Link>
                    </div>
                </>
            ),
        },
        {
            icon: ExternalLink,
            title: 'Third-party cookies',
            content: (
                <>
                    <p className='text-gray-300 leading-relaxed'>
                        Some features may use trusted third-party services (for example analytics or embedded content). These providers may set cookies on your
                        device. We recommend reviewing their policies for details on how they handle cookies.
                    </p>
                </>
            ),
        },
        {
            icon: ShieldCheck,
            title: 'Updates to this Cookie Policy',
            content: (
                <>
                    <p className='text-gray-300 leading-relaxed'>
                        We may update this Cookie Policy from time to time to reflect changes in technology, law, or our services. When we do, we will update
                        the “Last Updated” date on this page.
                    </p>
                </>
            ),
        },
    ];

    return (
        <div className='min-h-screen bg-[#050608]'>
            {/* HERO */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-6xl relative z-10'>
                    <div className='space-y-6'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold'>
                            LEGAL
                        </Badge>

                        <h1 className='text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight'>
                            Cookie <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Policy</span>
                        </h1>

                        {/* <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full' /> */}

                        <p className='text-base sm:text-lg text-gray-300 max-w-3xl leading-relaxed'>
                            This Cookie Policy explains how <span className='text-[#4cc7e8] font-semibold'>Black Snow</span> uses cookies and similar
                            technologies to recognize you when you visit our website.
                        </p>

                        <div className='text-sm text-white/60'>
                            Last Updated: <span className='text-white/80'>{lastUpdated}</span>
                        </div>

                        {/* Hollow subheading button style (less round) */}
                        <div className='pt-2'>
                            <span
                                className='
                  inline-flex items-center gap-2
                  px-4 py-2
                  text-sm font-medium
                  text-white/80
                  border border-white/15
                  bg-transparent
                  rounded-md
                '
                            >
                                <Cookie className='w-4 h-4 text-[#4cc7e8]' />
                                Cookies & Tracking Technologies
                                <span className='text-base leading-none'>›</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-6xl'>
                    <div className='grid gap-6 sm:gap-8'>
                        {sections.map((s) => (
                            <Card
                                key={s.title}
                                className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl'
                            >
                                <CardContent className='p-6 sm:p-8'>
                                    <div className='flex flex-col sm:flex-row gap-5 items-start'>
                                        <div className='flex-shrink-0'>
                                            <div className='w-14 h-14 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center shadow-lg'>
                                                <s.icon className='w-7 h-7 text-white' />
                                            </div>
                                        </div>

                                        <div className='space-y-3'>
                                            <h2 className='text-2xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                {s.title}
                                            </h2>
                                            {s.content}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* CONTACT */}
                        <Card className='relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 rounded-2xl'>
                            <CardContent className='p-6 sm:p-8'>
                                <div className='flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between'>
                                    <div className='space-y-2'>
                                        <h3 className='text-2xl font-bold text-white'>Questions?</h3>
                                        <p className='text-gray-300 leading-relaxed max-w-2xl'>
                                            If you have questions about this Cookie Policy or how we use cookies, contact us and we’ll help you out.
                                        </p>
                                    </div>

                                    <div className='flex flex-col sm:flex-row gap-3'>
                                        <a
                                            href='mailto:support@blacksnow.com'
                                            className='
                        inline-flex items-center gap-2
                        px-4 py-2
                        text-sm font-medium
                        text-white/90
                        border border-[#4cc7e8]/40
                        bg-transparent
                        rounded-md
                        transition
                        hover:bg-[#4cc7e8]
                        hover:text-[#050608]
                      '
                                        >
                                            {/* <Mail className='w-4 h-4' /> */}
                                            Email Support
                                            <ArrowRight className='w-4 h-4' />
                                        </a>

                                        <AuthModalTrigger>
                                            <Button
                                                size='sm'
                                                className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold rounded-md px-5 py-5'
                                            >
                                                Get Started <ArrowRight className='w-4 h-4 ml-2' />
                                            </Button>
                                        </AuthModalTrigger>
                                    </div>
                                </div>

                                {/* Anchor for preference tool (hook your modal here later) */}
                                <div id='cookie-preferences' className='mt-8 border-t border-white/10 pt-6'>
                                    <p className='text-white/70 text-sm'>
                                        Cookie Preferences Tool: <span className='text-white/90'>Connect your cookie modal here when ready.</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
}
export { Cookies };
