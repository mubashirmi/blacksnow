import { AuthModalTrigger } from '@/components/AuthModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import lottie from 'lottie-web';
import { ArrowRight, Award, BookOpen, Brain, Shield, Star, Target, Users, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';

function About() {
    // Make sure your LottieAnimation component looks something like this:
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
        <div className='min-h-screen bg-[#050608]'>
            {/* Hero Section */}
            <section className='relative pt-20 pb-7 px-8'>
                <div className='container mx-auto max-w-6xl relative z-10'>
                    <div className='text-center'>
                        <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-8 px-8 py-3 text-sm font-bold'>ABOUT BLACK SNOW</Badge>
                        <h1 className='text-6xl lg:text-7xl font-black text-white mb-8 leading-tight'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>About Us</span>
                        </h1>
                        <div className='w-32 h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mx-auto'></div>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className='relative py-20 px-8'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        <div className='space-y-8'>
                            <div>
                                <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-6 py-2 text-sm font-bold'>OUR JOURNEY</Badge>
                                <h2 className='text-5xl lg:text-6xl font-black text-white mb-8 leading-tight'>
                                    Our <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Story</span>
                                </h2>
                            </div>

                            <div className='space-y-6'>
                                <p className='text-xl text-gray-300 leading-relaxed'>
                                    <span className='text-[#4cc7e8] font-semibold'>Black Snow started in 2024</span> as an investment firm. Our story consists
                                    of providing the best intangible products in the{' '}
                                    <span className='text-[#2c7bbe] font-semibold'>finance, investment and asset</span> sector for a growing client base which
                                    strives toward diversification.
                                </p>
                                <p className='text-xl text-gray-300 leading-relaxed'>
                                    Our client-based focus presents us with a problem which we solve in our online course materials. We provide solutions for{' '}
                                    <span className='text-[#4cc7e8] font-semibold'>Daytrading, Options, and Chart Reading</span>. As a result, we have
                                    researched and spent quality time to achieve, maintain, and get results for our client base.
                                </p>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-6 pt-8'>
                                <Button
                                    onClick={() => {
                                        document.getElementById('core-values')?.scrollIntoView({
                                            behavior: 'smooth',
                                        });
                                    }}
                                    size='lg'
                                    className='group cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-12 py-6 text-lg font-bold shadow-xl transition-all duration-300'
                                >
                                    <BookOpen className='w-6 h-6 mr-3' />
                                    Learn More
                                    <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                </Button>

                                {/* Replaced /login?signup with AuthModal in Sign Up mode; role -> "Sales" via sourceRoute="/sales" */}
                                <AuthModalTrigger buttonText='Join Us' defaultView='signup' sourceRoute='/sales'>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 w-full sm:w-fit cursor-pointer border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-12 py-6 text-lg font-bold transition-all duration-300 bg-transparent'
                                    >
                                        <Users className='w-6 h-6 mr-3' />
                                        Join Us
                                    </Button>
                                </AuthModalTrigger>
                            </div>
                        </div>

                        {/* Simplified Illustration */}
                        <div className='relative'>
                            <div className='relative w-96 h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 shadow-2xl backdrop-blur-xl flex items-center justify-center mx-auto'>
                                <svg
                                    className='w-64 h-64 text-[#4cc7e8]'
                                    viewBox='0 0 200 200'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='3'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                >
                                    <ellipse cx='100' cy='140' rx='40' ry='30' />
                                    <circle cx='100' cy='80' r='35' />
                                    <circle cx='100' cy='80' r='45' fill='none' strokeDasharray='5,5' />
                                    <circle cx='90' cy='75' r='3' fill='currentColor' />
                                    <circle cx='110' cy='75' r='3' fill='currentColor' />
                                    <path d='M95 85 Q100 90 105 85' />
                                    <line x1='80' y1='170' x2='80' y2='190' />
                                    <line x1='95' y1='170' x2='95' y2='190' />
                                    <line x1='105' y1='170' x2='105' y2='190' />
                                    <line x1='120' y1='170' x2='120' y2='190' />
                                    <path d='M140 140 Q160 130 170 120' />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section
                className='relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'
                id='core-values'
            >
                <div className='container mx-auto max-w-[90rem]'>
                    <div className='text-center mb-12 sm:mb-16 md:mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-4 sm:mb-6 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold animate-fade-in'>
                            OUR FOUNDATION
                        </Badge>
                        <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 animate-slide-in-up'>
                            Core <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Values</span>
                        </h2>
                        <p className='text-base sm:text-lg md:text-xl text-gray-300 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto animate-slide-in-up delay-200'>
                            The principles that guide everything we do and shape our commitment to excellence.
                        </p>
                    </div>

                    <div className='space-y-8 sm:space-y-10 md:space-y-12'>
                        {/* Growth Mindset */}
                        <Card className='group relative bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-2xl sm:rounded-3xl overflow-hidden transform hover:scale-100 sm:hover:scale-105 animate-fade-in-up'>
                            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe]'></div>
                            <CardContent className='p-6 sm:p-8 md:p-12'>
                                <div className='flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6 md:space-x-8'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
                                            <Brain className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-2xl sm:text-3xl md:text-4xl font-black text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            Growth Mindset
                                        </h3>
                                        <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                            We champion a <span className='text-[#4cc7e8] font-semibold'>Growth Mindset</span> as the cornerstone of our
                                            success. We believe that abilities and intelligence can be developed through dedication and hard work. This mindset
                                            drives our approach to problem-solving, innovation, and continuous improvement. By embracing challenges and learning
                                            from failures, we foster a challenging learning environment where creativity thrives, and everyone is encouraged to
                                            reach their full potential. Our commitment to a Growth Mindset ensures that we are always evolving and adapting to
                                            meet the needs of our clients and stay ahead in a dynamic marketplace.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Diversity */}
                        <Card className='group relative bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 border-[#4cc7e8]/30 hover:border-[#2c7bbe]/50 transition-all duration-500 rounded-2xl sm:rounded-3xl overflow-hidden transform hover:scale-100 sm:hover:scale-105 animate-fade-in-up delay-200'>
                            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8]'></div>
                            <CardContent className='p-6 sm:p-8 md:p-12'>
                                <div className='flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6 md:space-x-8'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
                                            <Users className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-2xl sm:text-3xl md:text-4xl font-black text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            Diversity
                                        </h3>
                                        <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                            <span className='text-[#4cc7e8] font-semibold'>Diversity is at the heart</span> of Black Snow. We are proud of our
                                            inclusive culture, where a wide range of perspectives and experiences come together to drive innovation and success.
                                            We value and respect differences in race, gender, ethnicity, sexual orientation, disability, and more, recognizing
                                            that diverse teams are stronger and more creative. By fostering an environment of respect and equality, we ensure
                                            that everyone has the opportunity to contribute and excel, creating a richer and more collaborative workplace.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Value */}
                        <Card className='group relative bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 border-[#2a8dcc]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-2xl sm:rounded-3xl overflow-hidden transform hover:scale-100 sm:hover:scale-105 animate-fade-in-up delay-400'>
                            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4cc7e8] to-[#2a8dcc]'></div>
                            <CardContent className='p-6 sm:p-8 md:p-12'>
                                <div className='flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6 md:space-x-8'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#4cc7e8] to-[#2a8dcc] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
                                            <Target className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-2xl sm:text-3xl md:text-4xl font-black text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            Value
                                        </h3>
                                        <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed'>
                                            Our core value is to <span className='text-[#4cc7e8] font-semibold'>deliver exceptional value</span> in everything
                                            we do. We are committed to providing high-quality services that not only meet but exceed our clients&apos;
                                            expectations. By focusing on personalization, integrity, and excellence, we aim to build long-term relationships
                                            based on trust and mutual success. Whether through innovative marketing strategies, practical career development
                                            opportunities, or insightful content, we strive to make a meaningful difference and drive sustainable growth for our
                                            clients and partners.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className='relative py-32 px-8'>
                <div className='container mx-auto max-w-6xl'>
                    <div className='text-center mb-20'>
                        <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-6 py-2 text-sm font-bold'>OUR IMPACT</Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-6'>
                            By the <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Numbers</span>
                        </h2>
                    </div>

                    <div className='grid md:grid-cols-4 gap-8'>
                        {[
                            { value: '2024', label: 'Founded', icon: Star, color: 'from-[#4cc7e8] to-[#2c7bbe]' },
                            { value: '75K+', label: 'Active Clients', icon: Users, color: 'from-[#2c7bbe] to-[#4cc7e8]' },
                            { value: '99.2%', label: 'Success Rate', icon: Award, color: 'from-[#4cc7e8] to-[#2a8dcc]' },
                            { value: '24/7', label: 'Support', icon: Shield, color: 'from-[#2a8dcc] to-[#2c7bbe]' },
                        ].map((stat, index) => (
                            <Card
                                key={index}
                                className='group relative bg-[#050608]/90 border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-2xl'
                            >
                                <CardContent className='p-8 text-center'>
                                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                        <stat.icon className='w-8 h-8 text-white' />
                                    </div>
                                    <div className='text-4xl font-black text-[#4cc7e8] mb-2'>{stat.value}</div>
                                    <div className='text-gray-400 font-semibold'>{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section with Handshake Animation */}
            <section className='relative py-32 px-8 bg-[#0a0b0f]'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        <div className='space-y-8'>
                            <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-8 py-3 text-sm font-bold'>JOIN OUR MISSION</Badge>
                            <h2 className='text-5xl lg:text-6xl font-black text-white mb-6'>
                                Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Transform</span>
                                <br />
                                Your Future?
                            </h2>
                            <p className='text-xl text-gray-300 leading-relaxed'>
                                Join thousands of successful traders who have chosen Black Snow to accelerate their trading journey and achieve consistent
                                profitability.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-6 pt-8'>
                                <AuthModalTrigger buttonText='Get Started' defaultView='signup' sourceRoute='/sales'>
                                    <Button
                                        size='lg'
                                        className='group cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-12 py-6 text-lg font-bold shadow-xl transition-all duration-300'
                                    >
                                        <Zap className='w-6 h-6 mr-3' />
                                        Get Started
                                        <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </AuthModalTrigger>
                            </div>
                        </div>

                        {/* Handshake Animation */}
                        <div className='relative flex items-center justify-center'>
                            <div className='relative bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 shadow-2xl backdrop-blur-xl flex items-center justify-center overflow-hidden'>
                                <LottieAnimation src='/animations/handshakeivon.json' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export { About };
