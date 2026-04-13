import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import lottie from 'lottie-web';
import { ArrowRight, Brain, Target, Users } from 'lucide-react';
import Image from 'next/image';
// import { useEffect, useRef } from 'react';

function About() {
    // Make sure your LottieAnimation component looks something like this:
    // const LottieAnimation = ({ src, loop, autoplay, style }) => {
    //     const containerRef = useRef(null);

    //     useEffect(() => {
    //         if (containerRef.current) {
    //             const animation = lottie.loadAnimation({
    //                 container: containerRef.current,
    //                 renderer: 'svg',
    //                 loop,
    //                 autoplay,
    //                 path: src,
    //             });

    //             return () => animation.destroy(); // Cleanup
    //         }
    //     }, [src, loop, autoplay]);

    //     return <div ref={containerRef} style={style} />;
    // };

    return (
        <div className='min-h-screen bg-[#050608]'>
            {/* Our Story Section - Adjusted to match Billboard hero spacing */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        <div className='space-y-7 sm:space-y-8 md:space-y-10 animate-slide-in-left'>
                            <div>
                                <div className='w-full'>
                                    <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                        OUR JOURNEY
                                    </Badge>
                                </div>

                                {/* ✅ wrapper makes width = heading text width */}
                                <div className='inline-block'>
                                    <h2 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight'>
                                        Our <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Story</span>
                                    </h2>

                                    {/* ✅ line now matches heading width */}
                                    {/* <div className='w-full h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full'></div> */}
                                </div>
                            </div>

                            <div className='space-y-4 sm:space-y-5'>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    <span className='text-[#4cc7e8] font-semibold'>Black Snow started in 2024</span> as an investment firm. Our story consists
                                    of providing the best intangible products in the{' '}
                                    <span className='text-[#2c7bbe] font-semibold'>finance, investment and asset</span> sector for a growing client base which
                                    strives toward diversification.
                                </p>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Our client-based focus presents us with a problem which we solve in our online course materials. We provide solutions for{' '}
                                    <span className='text-[#4cc7e8] font-semibold'>Daytrading, Options, and Chart Reading</span>. As a result, we have
                                    researched and spent quality time to achieve, maintain, and get results for our client base.
                                </p>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2'>
                                <Button
                                    onClick={() => {
                                        document.getElementById('core-values')?.scrollIntoView({
                                            behavior: 'smooth',
                                        });
                                    }}
                                    size='lg'
                                    className='group border-2 box-border cursor-pointer border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full max-w-[320px] sm:min-w-[300px]'
                                >
                                    {/* <BookOpen className='w-5 h-5 sm:w-6 sm:h-6 mr-3' /> */}
                                    Learn More
                                    {/* <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' /> */}
                                </Button>
                                {/* <AuthModalTrigger>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 box-border cursor-pointer border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                    >
                                        <Users className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Join Us
                                    </Button>
                                </AuthModalTrigger> */}
                            </div>
                        </div>

                        {/* Simplified Illustration */}
                        <div className='relative w-full'>
                            <div className='relative w-full sm:w-96 h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 shadow-2xl backdrop-blur-xl flex items-center justify-center mx-auto'>
                                <Image width={100} height={100} src='/logocolored.png' alt='Black Snow Logo' className='w-[90%]' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section - Adjusted to match Features section spacing */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]' id='core-values'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-20'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            OUR FOUNDATION
                        </Badge>
                        <h2 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6'>
                            Core <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Values</span>
                        </h2>
                        <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
                            The principles that guide everything we do and shape our commitment to excellence.
                        </p>
                    </div>

                    <div className='space-y-8'>
                        {/* Growth Mindset */}
                        <Card className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'>
                            <CardContent className='p-8'>
                                <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 items-start space-x-6'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-16 h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center shadow-lg'>
                                            <Brain className='w-8 h-8 text-white' />
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-2xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            Growth Mindset
                                        </h3>
                                        <p className='text-gray-300 leading-relaxed'>
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
                        <Card className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'>
                            <CardContent className='p-8'>
                                <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 items-start space-x-6'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-16 h-16 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-lg'>
                                            <Users className='w-8 h-8 text-white' />
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-2xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>Diversity</h3>
                                        <p className='text-gray-300 leading-relaxed'>
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
                        <Card className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'>
                            <CardContent className='p-8'>
                                <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 items-start space-x-6'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-16 h-16 bg-gradient-to-r from-[#4cc7e8] to-[#2a8dcc] rounded-2xl flex items-center justify-center shadow-lg'>
                                            <Target className='w-8 h-8 text-white' />
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-2xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>Value</h3>
                                        <p className='text-gray-300 leading-relaxed'>
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

            {/* Call to Action Section - Adjusted to match Billboard CTA spacing */}
            {/* <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-16 items-center'>
                        <div className='space-y-8'>
                            <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                JOIN OUR MISSION
                            </Badge>
                            <h2 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Transform</span>
                                <br />
                                Your Future?
                            </h2>
                            <p className='text-xl text-gray-300 leading-relaxed'>
                                Join thousands of successful traders who have chosen Black Snow to accelerate their trading journey and achieve consistent
                                profitability.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-5 pt-8'>
                                <AuthModalTrigger
                                    buttonText='Get Started'
                                    defaultView='signup'
                                    sourceRoute='/about'
                                    redirectAfterLogin='/about'
                                    redirectAfterSignup='/pricing'
                                >
                                    <Button
                                        size='lg'
                                        className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] cursor-pointer hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-12 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300 w-full sm:w-[300px]'
                                    >
                                        Get Started
                                        <ArrowRight className='w-5 h-5 ml-3' />
                                    </Button>
                                </AuthModalTrigger>
                            </div>
                        </div>

                        <div className='flex items-center justify-center'>
                            <div className='w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center backdrop-blur-xl'>
                                <div className='relative bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 shadow-2xl backdrop-blur-xl flex items-center justify-center overflow-hidden'>
                                    <LottieAnimation src='/animations/handshakeivon.json' loop={true} autoplay={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}
        </div>
    );
}

export { About };
