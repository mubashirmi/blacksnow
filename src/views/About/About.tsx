import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Target, Users } from 'lucide-react';
import Image from 'next/image';

function About() {
    return (
        <div className='relative isolate min-h-screen overflow-hidden bg-[#050608] text-white'>
            {/* Solid page background using the Black Snow surface hierarchy. */}

            <section className='relative z-10 py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center'>
                        <div className='space-y-8 sm:space-y-10 md:space-y-12 animate-slide-in-left'>
                            <div>
                                <div className='inline-block'>
                                    <h2 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-white'>
                                        Our <span className=' text-[#4333AF] '>Story</span>
                                    </h2>
                                </div>
                            </div>

                            <div className='space-y-4 sm:space-y-5'>
                                <p className='text-base sm:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    <span className='text-[#4333AF] font-semibold'>Black Snow started in 2024</span> as an investment firm. Our story consists
                                    of providing the best intangible products in the{' '}
                                    <span className='text-[#4333AF] font-semibold'>finance, investment and asset</span> sector for a growing client base which
                                    strives toward diversification.
                                </p>
                                <p className='text-base sm:text-lg text-gray-300 leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl'>
                                    Our client-based focus presents us with a problem which we solve in our online course materials. We provide solutions for{' '}
                                    <span className='text-[#4333AF] font-semibold'>Daytrading, Options, and Chart Reading</span>. As a result, we have
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
                                    className='group border-2 box-border cursor-pointer border-[#414A5D] bg-[#4333AF] hover:bg-[#38299B] text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#4333AF]/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-[300px]'
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>

                        <div className='relative w-full'>
                            <div className='relative w-full sm:w-96 h-96 rounded-3xl border border-[#414A5D] bg-[#0C0F18] shadow-[0_32px_110px_-38px_rgba(67,51,175,0.42),0_22px_46px_-25px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center justify-center mx-auto'>
                                <div className='relative h-[90%] w-[90%]'>
                                    <Image
                                        src='/logocolored.png'
                                        alt='Black Snow Logo'
                                        fill
                                        sizes='(max-width: 640px) 90vw, 346px'
                                        className='object-contain'
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='relative z-10 py-10 sm:py-16 px-4 sm:px-6 md:px-8' id='core-values'>
                <div className='container mx-auto max-w-8xl relative z-10'>
                    <div className='text-center mb-12 sm:mb-16'>
                        <h2 className='text-[clamp(1.65rem,7.6vw,2.25rem)] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 leading-[1.22]'>
                            Core <span className=' text-[#4333AF] '>Values</span>
                        </h2>
                        <p className='text-base sm:text-md md:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto'>
                            The principles that guide everything we do and shape our commitment to excellence.
                        </p>
                    </div>

                    <div className='space-y-8'>
                        {/* Growth Mindset */}
                        <Card className='group relative bg-[#0C0F18] border-2 border-[#414A5D] hover:border-[#4333AF]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'>
                            <CardContent className='p-8'>
                                <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 items-start space-x-6'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-16 h-16 bg-[#4333AF] rounded-2xl flex items-center justify-center shadow-lg'>
                                            <Brain className='w-8 h-8 text-white' />
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-2xl font-bold text-white leading-[1.28] group-hover:text-[#4333AF] transition-colors duration-300'>
                                            Growth Mindset
                                        </h3>
                                        <p className='text-gray-300 leading-relaxed text-base sm:text-md md:text-lg'>
                                            We champion a <span className='text-[#4333AF] font-semibold'>Growth Mindset</span> as the cornerstone of our
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
                        <Card className='group relative bg-[#0C0F18] border-2 border-[#414A5D] hover:border-[#4333AF]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'>
                            <CardContent className='p-8'>
                                <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 items-start space-x-6'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-16 h-16 bg-[#4333AF] rounded-2xl flex items-center justify-center shadow-lg'>
                                            <Users className='w-8 h-8 text-white' />
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-2xl font-bold text-white leading-[1.28] group-hover:text-[#4333AF] transition-colors duration-300'>
                                            Diversity
                                        </h3>
                                        <p className='text-gray-300 leading-relaxed text-base sm:text-md md:text-lg'>
                                            <span className='text-[#4333AF] font-semibold'>Diversity is at the heart</span> of Black Snow. We are proud of our
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
                        <Card className='group relative bg-[#0C0F18] border-2 border-[#414A5D] hover:border-[#4333AF]/50 transition-all duration-300 rounded-2xl transform hover:scale-105'>
                            <CardContent className='p-8'>
                                <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 items-start space-x-6'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-16 h-16 bg-[#4333AF] rounded-2xl flex items-center justify-center shadow-lg'>
                                            <Target className='w-8 h-8 text-white' />
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-2xl font-bold text-white leading-[1.28] group-hover:text-[#4333AF] transition-colors duration-300'>
                                            Value
                                        </h3>
                                        <p className='text-gray-300 leading-relaxed text-base sm:text-md md:text-lg'>
                                            Our core value is to <span className='text-[#4333AF] font-semibold'>deliver exceptional value</span> in everything
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
