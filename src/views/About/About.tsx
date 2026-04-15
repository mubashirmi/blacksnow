import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Target, Users } from 'lucide-react';
import Image from 'next/image';

function About() {
    return (
        <div className='min-h-screen bg-[#050608]'>
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        <div className='space-y-8 sm:space-y-10 md:space-y-12 animate-slide-in-left'>
                            <div>
                                <div className='inline-block'>
                                    <h2 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight'>
                                        Our <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Story</span>
                                    </h2>
                                </div>
                            </div>

                            <div className='space-y-4 sm:space-y-5'>
                                <p className='text-base sm:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    <span className='text-[#4cc7e8] font-semibold'>Black Snow started in 2024</span> as an investment firm. Our story consists
                                    of providing the best intangible products in the{' '}
                                    <span className='text-[#2c7bbe] font-semibold'>finance, investment and asset</span> sector for a growing client base which
                                    strives toward diversification.
                                </p>
                                <p className='text-base sm:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Our client-based focus presents us with a problem which we solve in our online course materials. We provide solutions for{' '}
                                    <span className='text-[#4cc7e8] font-semibold'>Daytrading, Options, and Chart Reading</span>. As a result, we have
                                    researched and spent quality time to achieve, maintain, and get results for our client base.
                                </p>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2'>
                                <Button
                                    onClick={() => {
                                        document.getElementById('core-values')?.scrollIntoView({
                                            behavior: 'smooth',
                                        });
                                    }}
                                    size='lg'
                                    className='group border-2 box-border cursor-pointer border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>

                        <div className='relative w-full'>
                            <div className='relative w-full sm:w-96 h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 shadow-2xl backdrop-blur-xl flex items-center justify-center mx-auto'>
                                <Image width={100} height={100} src='/logocolored.png' alt='Black Snow Logo' className='w-[90%]' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]' id='core-values'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='text-center mb-12 sm:mb-16'>
                        <h2 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5'>
                            Core <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Values</span>
                        </h2>
                        <p className='text-base sm:text-md md:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto'>
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
                                        <p className='text-gray-300 leading-relaxed text-base sm:text-md md:text-lg'>
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
                                        <p className='text-gray-300 leading-relaxed text-base sm:text-md md:text-lg'>
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
                                        <p className='text-gray-300 leading-relaxed text-base sm:text-md md:text-lg'>
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
        </div>
    );
}

export { About };
