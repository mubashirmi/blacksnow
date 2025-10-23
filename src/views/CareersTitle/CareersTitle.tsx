import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import lottie from 'lottie-web';
import { ArrowRight, Award, Calendar, CheckCircle, Globe, Search, Star, Target, UserCheck, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

function CareersTitle() {
    const LottieAnimation = ({ src, loop, autoplay, style }) => {
        const containerRef = useRef(null);

        useEffect(() => {
            if (containerRef.current) {
                const animation = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop,
                    autoplay,
                    path: src,
                });

                return () => animation.destroy(); // Cleanup
            }
        }, [src, loop, autoplay]);

        return <div ref={containerRef} style={style} />;
    };

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Hero Section */}
            {/* <section className='relative pt-20 pb-7 px-8'>
                <div className='container mx-auto max-w-6xl relative z-10'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-8 px-8 py-3 text-sm font-bold animate-fade-in'>
                            JOIN OUR TEAM
                        </Badge>
                        <h1 className='text-6xl lg:text-7xl font-black text-white mb-6 leading-tight animate-slide-in-up'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Careers</span>
                        </h1>
                        <div className='w-40 h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mx-auto animate-slide-in-up delay-200'></div>
                    </div>
                </div>
            </section> */}

            {/* Job Seekers Section */}
            <section className='relative py-32 px-8'>
                <div className='container mx-auto max-w-[90rem]'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        <div className='space-y-8 animate-slide-in-left'>
                            <div>
                                <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-6 py-2 text-sm font-bold'>
                                    FOR JOB SEEKERS
                                </Badge>
                                <h2 className='text-4xl lg:text-5xl font-black text-white mb-6 leading-tight'>
                                    Reshape Your{' '}
                                    <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Career Future</span>
                                </h2>
                                <p className='text-xl text-gray-300 leading-relaxed'>
                                    Join us in reshaping the future for employee job search across all 50 States in the United States. Black Snow is committed
                                    to helping you find employment through a series of job posts across many different markets.
                                </p>
                            </div>

                            <div className='space-y-4'>
                                <p className='text-lg text-gray-300 leading-relaxed'>
                                    Our Recruiters work diligently to match your experience and credentials to jobs in{' '}
                                    <span className='text-[#4cc7e8] font-semibold'>Sales, Finance, Trucking, Warehouse, Medicine</span>,{' '}
                                    <span className='text-[#2c7bbe] font-semibold'>Dental, Nursing, Pharmacy, Web Development</span>,{' '}
                                    <span className='text-[#4cc7e8] font-semibold'>A.I., Retail</span> and much more.
                                </p>
                                <p className='text-lg text-gray-300 leading-relaxed'>
                                    We are a growing global organization prioritizing{' '}
                                    <span className='text-[#4cc7e8] font-semibold'>Full-time remote careers</span> with our company and job opportunities with
                                    our contracted customers.
                                </p>
                            </div>

                            <Link href={'/careeroptions'}>
                                <Button
                                    size='lg'
                                    className='group bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-12 py-6 text-lg font-bold shadow-2xl shadow-[#2c7bbe]/40 transition-all cursor-pointer duration-300 transform hover:scale-105'
                                >
                                    <Search className='w-6 h-6 mr-3' />
                                    See Career Opportunities
                                    <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                </Button>
                            </Link>
                        </div>

                        <div className='relative animate-slide-in-right'>
                            <div className='bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl p-10 border border-[#2c7bbe]/30 shadow-xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                                <h3 className='text-2xl font-bold text-white mb-8 flex items-center'>
                                    <Globe className='w-8 h-8 text-[#4cc7e8] mr-3' />
                                    Global Opportunities
                                </h3>

                                <div className='grid grid-cols-2 gap-6 mb-8'>
                                    <div className='text-center'>
                                        <div className='text-4xl font-black text-[#4cc7e8] mb-2'>50+</div>
                                        <div className='text-gray-400 font-semibold'>States Covered</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-4xl font-black text-[#2c7bbe] mb-2'>15+</div>
                                        <div className='text-gray-400 font-semibold'>Industries</div>
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    {[
                                        { icon: CheckCircle, text: 'Remote-First Opportunities', color: 'text-green-400' },
                                        { icon: Star, text: 'Competitive Compensation', color: 'text-yellow-400' },
                                        { icon: Award, text: 'Career Growth Programs', color: 'text-[#4cc7e8]' },
                                        { icon: Users, text: 'Global Team Collaboration', color: 'text-[#2c7bbe]' },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className='flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 border border-[#2c7bbe]/20'
                                        >
                                            <item.icon className={`w-5 h-5 ${item.color}`} />
                                            <span className='text-gray-300 font-medium'>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recruitment Agency Section */}
            <section className='relative py-32 px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-[90rem]'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center'>
                        <div className='space-y-6 sm:space-y-8 animate-slide-in-right'>
                            <div>
                                <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-6 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold'>
                                    FOR EMPLOYERS
                                </Badge>
                                <h2 className='text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight'>
                                    <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Recruitment Agency</span>
                                    <br />
                                    Inquiry
                                </h2>
                            </div>

                            <div className='space-y-4 sm:space-y-6'>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                    We take pride in helping you find the best candidates nationwide and around the world. Let us assist you in talent discovery
                                    as well as finding candidates that match your company criteria, work experience, and credentials.
                                </p>
                                <p className='text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed'>
                                    Whether you are a <span className='text-[#4cc7e8] font-semibold'>small business or corporation</span> we provide quality
                                    candidates with a complimentary <span className='text-[#2c7bbe] font-semibold'>30-day guarantee</span>.
                                </p>
                                <p className='text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed'>
                                    Our industry-leading team of <span className='text-[#4cc7e8] font-semibold'>global HR experts</span> can help you enter new
                                    markets in minutes, search for candidates, and hire international employees all while maintaining full compliance. Take
                                    advantage of some of the competitive rates that we have to offer today.
                                </p>
                            </div>
                            <div className='flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0'>
                                <Link href={'/recruitmentagency'}>
                                    <Button
                                        size='lg'
                                        className='group cursor-pointer bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] hover:from-[#2c7bbe] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#4cc7e8]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto'
                                    >
                                        <Calendar className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        See Opportunities
                                        <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </Link>
                                <Link href={'/consultation'}>
                                    <Button
                                        size='lg'
                                        className='group cursor-pointer bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] hover:from-[#2c7bbe] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-xl shadow-[#4cc7e8]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto'
                                    >
                                        <Calendar className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Consultation
                                        <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className='relative animate-slide-in-left'>
                            <div className='bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-[#4cc7e8]/30 shadow-2xl shadow-[#4cc7e8]/20 backdrop-blur-2xl'>
                                <h3 className='text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 flex items-center'>
                                    <Target className='w-6 h-6 sm:w-8 sm:h-8 text-[#4cc7e8] mr-3' />
                                    Recruitment Excellence
                                </h3>

                                <div className='grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8'>
                                    <div className='text-center'>
                                        <div className='text-3xl sm:text-4xl font-black text-[#4cc7e8] mb-2'>30</div>
                                        <div className='text-sm sm:text-base text-gray-400 font-semibold'>Day Guarantee</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-3xl sm:text-4xl font-black text-[#2c7bbe] mb-2'>24/7</div>
                                        <div className='text-sm sm:text-base text-gray-400 font-semibold'>Global Support</div>
                                    </div>
                                </div>

                                <div className='space-y-3 sm:space-y-4'>
                                    {[
                                        { icon: UserCheck, text: 'Quality Candidate Matching', color: 'text-green-400' },
                                        { icon: Zap, text: 'Rapid Market Entry', color: 'text-yellow-400' },
                                        { icon: Globe, text: 'International Hiring', color: 'text-[#4cc7e8]' },
                                        { icon: Award, text: 'Full Compliance Support', color: 'text-[#2c7bbe]' },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className='flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[#4cc7e8]/5 to-[#2c7bbe]/5 border border-[#4cc7e8]/20'
                                        >
                                            <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                                            <span className='text-sm sm:text-base text-gray-300 font-medium'>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section with Lottie Animation */}
            <section className='relative py-32 px-8'>
                <div className='container mx-auto max-w-[90rem]'>
                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        <div className='space-y-8'>
                            <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white px-6 py-2'>READY TO GET STARTED?</Badge>
                            <h2 className='text-5xl font-bold text-white'>
                                Join the <span className='text-[#4cc7e8]'>Black Snow</span>
                                <br />
                                Revolution
                            </h2>
                            <p className='text-xl text-gray-300 leading-relaxed'>
                                Whether you&apos;re looking for your next career opportunity or seeking top talent for your organization, we&apos;re here to
                                make it happen. Be a first mover in your career journey.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <Link href={'/careeroptions'}>
                                    <Button className='cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:opacity-90 px-8 py-3'>
                                        <Search className='w-5 h-5 mr-2' />
                                        Browse Jobs
                                        <ArrowRight className='w-4 h-4 ml-2' />
                                    </Button>
                                </Link>
                                <Link href={'/recruitmentagency'}>
                                    <Button
                                        variant='outline'
                                        className='border-[#4cc7e8] cursor-pointer text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 py-3 bg-transparent'
                                    >
                                        <Users className='w-5 h-5 mr-2' />
                                        Hire Talent
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Lottie Animation */}
                        <div className='flex justify-center'>
                            <div className='relative'>
                                <div className='relative bg-[#0a0b0f]/50 rounded-2xl p-8 border border-[#2c7bbe]/30 backdrop-blur-sm'>
                                    <LottieAnimation src='/animations/careericon.json' loop={true} autoplay={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export { CareersTitle };
