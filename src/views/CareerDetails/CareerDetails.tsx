import { Badge } from '@/components/ui/badge';
import { ApplyModal } from '@/views/CareerDetails/components/ApplyModal';
import useCareerDetails from '@/views/CareerDetails/useCareerDetails';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { Button, Center, Container, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import lottie from 'lottie-web';
import { ArrowRight, Mail, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const CareerDetails = () => {
    const {
        handleUploadImage,
        getInputProps,
        onSubmit,
        handleApply,
        showApplyModal,
        showApplyModalHandlers,
        description,
        image,
        location,
        salary,
        title,
        values,
        hasApplied,
        formErrors,
        firstNum,
        secondNum,
        regenerateCaptcha,
    } = useCareerDetails({
        career: {
            id: '1',
            title: 'Senior Software Engineer',
            description:
                'Join our dynamic team to develop cutting-edge software solutions. You will be responsible for designing, coding, and maintaining high-quality applications.',
            location: 'San Francisco, CA',
            salary: '$120,000 - $150,000 per year',
            image: 'careers/senior-software-engineer.jpg',
        },
        values: { firstName: 'John' },
        hasApplied: false,
    });
    const theme = useMantineTheme();

    const LottieAnimation = ({ src, loop = true, autoplay = true, style }) => {
        const containerRef = useRef<HTMLDivElement>(null);
        useEffect(() => {
            if (containerRef.current) {
                const animation = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop,
                    autoplay,
                    path: src,
                });
                return () => animation.destroy();
            }
        }, [src, loop, autoplay]);

        return <div ref={containerRef} style={style} />;
    };

    return (
        <div className='bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
            <Container fluid pb={100} mih={'100vh'}>
                <Container size={'xl'} mt={50}>
                    <ApplyModal
                        handleUploadImage={handleUploadImage}
                        getInputProps={getInputProps}
                        onSubmit={onSubmit}
                        handleApply={handleApply}
                        showApplyModal={showApplyModal}
                        showApplyModalHandlers={showApplyModalHandlers}
                        formErrors={formErrors}
                        firstNum={firstNum}
                        secondNum={secondNum}
                        regenerateCaptcha={regenerateCaptcha}
                    />
                    {hasApplied ? (
                        <>
                            <Title ta={'center'} mt={200} mb={20} c={theme.colors.customColor[1]}>
                                Confirmation
                            </Title>
                            <Center>
                                <Stack>
                                    <Text ta='center' fz={27} fw={600} c={theme.colors.customColor[1]}>
                                        Your application has been received!
                                    </Text>
                                    <Text ta='center' fz={18} c={theme.colors.customColor[1]}>
                                        Thank you {values.firstName} for your application. We will be in touch with you soon!
                                    </Text>
                                </Stack>
                            </Center>
                        </>
                    ) : (
                        <>
                            <StorageImage alt='career-image' path={image} width={'50%'} />
                            <Title mt={50} c={theme.colors.customColor[1]}>
                                {title}
                            </Title>
                            <Text mt={20} c={theme.colors.customColor[1]}>
                                {location}
                            </Text>
                            <Text mt={20} c={theme.colors.customColor[1]}>
                                {salary}
                            </Text>
                            <Text mt={20} c={theme.colors.customColor[1]}>
                                {description}
                            </Text>
                            <Button w={150} bg={theme.colors.customColor[2]} onClick={() => showApplyModalHandlers.setTrue()} mt={20}>
                                Click to Apply
                            </Button>
                        </>
                    )}
                </Container>
                {/* Final CTA */}
                <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 '>
                    <div className='container mx-auto max-w-8xl'>
                        <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                            <div>
                                <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                    START YOUR CAMPAIGN TODAY
                                </Badge>
                                <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                                    Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Transform</span>
                                    <br />
                                    Your Marketing?
                                </h2>
                                <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-5'>
                                    Join thousands of successful businesses who have chosen our email marketing platform to drive engagement, increase
                                    conversions, and grow their revenue.
                                </p>
                                <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4'>
                                    <Link href={'/login'}>
                                        <Button
                                            size='lg'
                                            className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px]'
                                        >
                                            <Mail className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                            Join Now
                                            <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                        </Button>
                                    </Link>
                                    <Link href={'/pricing'}>
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] bg-transparent'
                                        >
                                            <Settings className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                            Learn More
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className='flex justify-center'>
                                <div className='relative'>
                                    <div className='absolute inset-0 w-96 h-96 bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-full blur-2xl'></div>
                                    <div className='relative w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center shadow-2xl backdrop-blur-xl p-8'>
                                        <LottieAnimation src='/animations/emailmarketingicon.json' loop={true} autoplay={true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Container>
        </div>
    );
};

export { CareerDetails };
