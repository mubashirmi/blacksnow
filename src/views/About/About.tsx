'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Building2, CheckCircle, ChevronLeft, ChevronRight, ShieldCheck, Target, Users } from 'lucide-react';
import { Michroma } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const michroma = Michroma({ subsets: ['latin'], weight: '400' });

const slides = [
    {
        icon: Building2,
        title: 'Our Beginning',
        kicker: 'Black Snow Holdings',
        description:
            'Black Snow started in 2024 as an investment firm, focused on delivering intangible products in the finance, investment, and asset sectors.',
        features: [
            'Founded in 2024',
            'Finance and investment focus',
            'Educational resources',
            'A growing client base',
            'Market research',
            'Investment strategies',
        ],
        panelTitle: 'A foundation for growth',
        panelBody:
            'Our work began with a client-first approach and a focus on helping people better understand financial markets, strategies, and diversification.',
        panelPoints: ['Research-led learning', 'Practical market education', 'Long-term client relationships'],
        action: 'Explore Our Pricing',
        href: '/pricing',
    },
    {
        icon: Brain,
        title: 'Growth Mindset',
        kicker: 'Core Value 01',
        description: 'We believe that people and organizations grow through dedication, learning, and a willingness to take on new challenges.',
        features: [
            'Learn continuously',
            'Embrace new challenges',
            'Improve through feedback',
            'Stay open to new ideas',
            'Learn from setbacks',
            'Develop practical skills',
        ],
        panelTitle: 'Always improving',
        panelBody:
            'This mindset shapes how we approach new ideas, solve problems, learn from setbacks, and improve the experience we deliver to our customers.',
        panelPoints: ['Problem-solving', 'Innovation', 'Adaptability'],
        action: 'Our Core Values',
        href: '#core-values',
    },
    {
        icon: Users,
        title: 'Diversity',
        kicker: 'Core Value 02',
        description: 'Different backgrounds and perspectives make teams more creative, more thoughtful, and better equipped to serve a broad community.',
        features: [
            'Respect different perspectives',
            'Encourage collaboration',
            'Create an inclusive culture',
            'Value individual contributions',
            'Encourage equal opportunity',
            'Welcome new ideas',
        ],
        panelTitle: 'Stronger together',
        panelBody:
            'We want people to feel respected and able to contribute. A wide range of ideas helps us build a more thoughtful and collaborative environment.',
        panelPoints: ['Respect', 'Collaboration', 'Opportunity'],
        action: 'Explore Our Platform',
        href: '/',
    },
    {
        icon: Target,
        title: 'Delivering Value',
        kicker: 'Core Value 03',
        description: 'Our goal is to provide useful, thoughtfully developed products and resources that respond to the needs of our clients and partners.',
        features: [
            'Put clients first',
            'Build with care',
            'Maintain integrity',
            'Aim for lasting value',
            'Prioritize clear guidance',
            'Support sustainable growth',
        ],
        panelTitle: 'Meaningful solutions',
        panelBody:
            'From learning materials for day trading, options, and chart reading to digital tools, we focus on making financial concepts more approachable.',
        panelPoints: ['Useful resources', 'Clear experiences', 'Consistent service'],
        action: 'See What We Offer',
        href: '/pricing',
    },
];
const valueCards = [
    { icon: Brain, title: 'Growth Mindset', description: 'We learn, adapt, and keep improving.' },
    { icon: Users, title: 'Diversity', description: 'Different perspectives make us stronger.' },
    { icon: Target, title: 'Client Value', description: 'Delivering practical solutions with care.' },
    { icon: ShieldCheck, title: 'Integrity', description: 'Building relationships on trust and clarity.' },
];

export function About() {
    const [activeSlide, setActiveSlide] = useState(0);
    return (
        <div className='relative min-h-screen isolate overflow-hidden bg-[#050608] text-white'>
            <section className='relative z-10 px-4 pb-8 pt-12 sm:px-6 sm:pt-16 md:px-8 lg:pb-10'>
                <div className='mx-auto max-w-[1380px]'>
                    <div className='grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14'>
                        <div className='relative isolate z-10 animate-slide-in-left'>
                            <h1
                                className={`${michroma.className} max-w-3xl text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.32] min-[1100px]:leading-[1.34] tracking-tight text-white`}
                            >
                                <span className='whitespace-nowrap'>
                                    Our <span className='text-[#4333AF]'>Story.</span>
                                </span>
                            </h1>
                            <div className='mt-7 max-w-xl space-y-3 text-sm leading-6 text-gray-300 sm:text-base sm:leading-7'>
                                <p>
                                    <span className='font-semibold text-[#4333AF]'>Black Snow started in 2024</span> as an investment firm. Our story consists
                                    of providing the best intangible products in the{' '}
                                    <span className='font-semibold text-[#4333AF]'>finance, investment and asset</span>
                                    sector for a growing client base which strives toward diversification.
                                </p>
                                <p>
                                    Our client-based focus presents us with a problem which we solve in our online course materials. We provide solutions for{' '}
                                    <span className='font-semibold text-[#4333AF]'>Daytrading, Options, and Chart Reading</span>. As a result, we have
                                    researched and spent quality time to achieve, maintain, and get results for our client base.
                                </p>
                            </div>
                            <div className='mt-8 flex flex-wrap gap-4'>
                                <Button
                                    onClick={() => document.getElementById('core-values')?.scrollIntoView({ behavior: 'smooth' })}
                                    className='h-12 min-w-[190px] rounded-xl border border-[#414A5D] bg-[#4333AF] px-7 text-base font-semibold text-white transition-all duration-300 hover:bg-[#38299B] hover:scale-[1.02]'
                                >
                                    Learn More <ArrowRight className='ml-2 h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                        <div className='relative min-h-[300px] overflow-visible animate-slide-in-right sm:min-h-[420px] lg:min-h-[470px]'>
                            <div
                                aria-hidden='true'
                                className='pointer-events-none absolute left-1/2 top-[48%] z-0 h-[490px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(67,51,175,0.24)_0%,rgba(67,51,175,0.16)_36%,rgba(5,6,8,0)_77%)] blur-[52px] sm:h-[620px] sm:w-[790px] lg:left-[60%] lg:top-[52%] lg:h-[660px] lg:w-[900px] lg:blur-[65px]'
                            />
                            <div className='bs-info-hero-card relative z-20 top-4 mx-auto h-[255px] w-full max-w-[350px] overflow-hidden rounded-[28px] border border-[#414A5D] bg-[#0C0F18] shadow-[0_32px_110px_-38px_rgba(67,51,175,0.42),0_22px_46px_-25px_rgba(0,0,0,0.85)] sm:top-6 sm:h-[310px] sm:max-w-[470px] lg:absolute lg:left-1/2 lg:top-16 lg:h-[335px] lg:w-full lg:max-w-[530px]'>
                                <div
                                    aria-hidden='true'
                                    className='pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_1px_0_rgba(67,51,175,0.13),inset_0_0_65px_rgba(67,51,175,0.05)]'
                                />
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <div className='relative h-[72%] w-[82%] sm:h-[76%] sm:w-[84%]'>
                                        <Image
                                            src='/logocolored.png'
                                            alt='Black Snow Holdings logo'
                                            fill
                                            priority
                                            sizes='(max-width: 640px) 350px, 500px'
                                            className='object-contain'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section id='our-story' className='relative z-10 overflow-hidden px-4 pb-10 sm:px-6 md:px-8'>
                <div className='relative mx-auto max-w-[1380px]'>
                    <div className='relative w-full overflow-hidden rounded-[28px] border border-[#414A5D] bg-[#0C0F18] shadow-[0_28px_110px_-40px_rgba(67,51,175,0.25),0_20px_65px_-35px_rgba(0,0,0,0.8)]'>
                        <div className='bs-info-slider-track relative z-10 flex w-full min-w-0' style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                            {slides.map((slide) => {
                                const SlideIcon = slide.icon;
                                return (
                                    <div key={slide.title} className='w-full min-w-full shrink-0 overflow-hidden'>
                                        <div className='grid w-full min-w-0 grid-cols-1 gap-6 px-4 pb-24 pt-6 sm:px-7 sm:pb-24 sm:pt-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)] lg:gap-8 lg:px-10 lg:pb-20 lg:pt-10 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.72fr)] xl:px-12 h-full lg:h-[480px] xl:h-[440px] lg:grid-rows-[minmax(0,1fr)]'>
                                            <div className='grid min-w-0 gap-5 md:grid-cols-[104px_1fr] md:gap-6 lg:min-h-0 lg:overflow-y-auto'>
                                                <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#414A5D] bg-[#0A0D14] sm:h-24 sm:w-24 md:mx-0'>
                                                    <SlideIcon className='h-9 w-9 text-[#4333AF] sm:h-11 sm:w-11' strokeWidth={1.8} />
                                                </div>
                                                <div className='flex min-w-0 flex-col text-center md:text-left'>
                                                    <p className='mb-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#4333AF]'>{slide.kicker}</p>
                                                    <h2
                                                        className={`${michroma.className} break-words text-xl leading-[1.32] tracking-[-0.02em] text-white sm:text-3xl lg:text-[clamp(1.5rem,2.25vw,2.25rem)]`}
                                                    >
                                                        {slide.title}
                                                    </h2>
                                                    <p className='mx-auto mt-3 max-w-2xl break-words text-sm leading-7 text-gray-300 sm:text-base md:mx-0'>
                                                        {slide.description}
                                                    </p>
                                                    <div className='mt-5 grid min-w-0 gap-3 sm:grid-cols-2 lg:flex-1 lg:auto-rows-fr'>
                                                        {slide.features.map((feature) => (
                                                            <div
                                                                key={feature}
                                                                className='flex min-w-0 items-center gap-3 rounded-xl border border-[#414A5D] bg-[#0A0D14] px-3 py-2.5 lg:gap-2 lg:px-2 lg:py-2 xl:gap-3 xl:px-3 xl:py-2.5 transition-colors duration-300 hover:border-[#4333AF]/50'
                                                            >
                                                                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#414A5D]'>
                                                                    <CheckCircle className='h-4 w-4 text-[#4333AF]' />
                                                                </span>
                                                                <span className='min-w-0 break-words text-left text-sm leading-6 text-gray-100 sm:text-base lg:text-sm lg:leading-5 xl:text-base xl:leading-6'>
                                                                    {feature}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flex w-full min-w-0 flex-col rounded-[24px] lg:min-h-0 lg:overflow-y-auto border border-[#414A5D] bg-[#0A0D14] px-4 py-5 shadow-[0_12px_48px_-26px_rgba(67,51,175,0.13)] sm:px-6 sm:py-6 lg:px-5 lg:py-4 xl:px-6'>
                                                <h3 className={`${michroma.className} text-base leading-[1.45] text-white sm:text-lg`}>{slide.panelTitle}</h3>
                                                <p className='mt-2 text-sm leading-5 text-gray-300'>{slide.panelBody}</p>
                                                <div className='mt-3 space-y-2 pb-4'>
                                                    {slide.panelPoints.map((point) => (
                                                        <div key={point} className='flex items-start gap-3 text-sm text-gray-200'>
                                                            <CheckCircle className='mt-0.5 h-4 w-4 shrink-0 text-[#4333AF]' />
                                                            {point}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Link
                                                    href={slide.href}
                                                    className='mt-4 flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#4333AF] px-3 py-2 text-center text-sm font-black leading-snug text-white transition-colors duration-300 hover:bg-[#38299B] lg:mt-auto'
                                                >
                                                    {slide.action}
                                                    <ArrowRight className='h-5 w-5 shrink-0' />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className='pointer-events-none absolute inset-x-0 bottom-5 z-20 flex items-center justify-between px-5 sm:px-7 lg:px-10'>
                            <button
                                type='button'
                                onClick={() => setActiveSlide((current) => (current - 1 + slides.length) % slides.length)}
                                className='pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#414A5D] bg-[#050608] text-gray-200 transition-colors duration-300 hover:border-[#4333AF]/50 hover:bg-[#0C0F18] hover:text-white'
                                aria-label='Previous slide'
                            >
                                <ChevronLeft className='h-5 w-5 text-[#4333AF]' />
                            </button>
                            <div className='pointer-events-auto hidden items-center justify-center gap-2 sm:flex'>
                                {slides.map((slide, index) => (
                                    <button
                                        key={slide.title}
                                        type='button'
                                        onClick={() => setActiveSlide(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            activeSlide === index ? 'w-8 bg-[#4333AF]' : 'w-2 bg-[#4333AF]/45 hover:bg-[#4333AF]/70'
                                        }`}
                                        aria-label={`Show ${slide.title}`}
                                        aria-current={activeSlide === index ? 'true' : undefined}
                                    />
                                ))}
                            </div>
                            <button
                                type='button'
                                onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
                                className='pointer-events-auto flex h-10 items-center gap-1 rounded-full border border-[#414A5D] bg-[#050608] px-4 text-sm font-semibold text-gray-200 transition-colors duration-300 hover:border-[#4333AF]/50 hover:bg-[#0C0F18] hover:text-white'
                                aria-label='Next slide'
                            >
                                Next <ChevronRight className='h-4 w-4 text-[#4333AF]' />
                            </button>
                        </div>
                    </div>
                    <div id='core-values' className='mt-10 flex items-center gap-4'>
                        <div className='h-px flex-1 bg-[#4333AF]/35' />
                        <p className={`${michroma.className} text-center text-[11px] leading-[1.6] uppercase tracking-[0.5em] text-[#4333AF]`}>
                            Built On Strong Values
                        </p>
                        <div className='h-px flex-1 bg-[#4333AF]/35' />
                    </div>
                    <div className='mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                        {valueCards.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className='rounded-2xl border border-[#414A5D] bg-[#0C0F18] shadow-[0_14px_55px_-30px_rgba(67,51,175,0.16)] transition-colors duration-300 hover:border-[#4333AF]/50 hover:bg-[#0C0F18]/80'
                            >
                                <div className='flex items-center gap-5 p-6'>
                                    <Icon className='h-12 w-12 shrink-0 text-[#4333AF]' aria-hidden='true' />
                                    <div>
                                        <h3 className={`${michroma.className} text-sm leading-6 text-white`}>{title}</h3>
                                        <p className='mt-2 text-sm leading-6 text-gray-400'>{description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <style jsx global>{`
                .bs-info-hero-card {
                    --bs-info-card-x: 0;
                    transform: translateX(var(--bs-info-card-x));
                    transform-style: preserve-3d;
                    animation: bs-info-float 5.5s ease-in-out infinite;
                }
                @media (min-width: 1024px) {
                    .bs-info-hero-card {
                        --bs-info-card-x: -50%;
                    }
                }
                .bs-info-slider-track {
                    transition: transform 780ms cubic-bezier(0.22, 1, 0.36, 1);
                    will-change: transform;
                }
                @media (prefers-reduced-motion: reduce) {
                    .bs-info-hero-card {
                        animation: none;
                    }
                    .bs-info-slider-track {
                        transition: none;
                    }
                }
                @keyframes bs-info-float {
                    0%,
                    100% {
                        transform: translateX(var(--bs-info-card-x)) translateY(0);
                    }
                    50% {
                        transform: translateX(var(--bs-info-card-x)) translateY(-12px);
                    }
                }
            `}</style>
        </div>
    );
}
