import { SubscribeForm } from '@/components/SubscribeToNewsletter/components';
import useSubscribeToNewsletter from '@/components/SubscribeToNewsletter/useSubscribeToNewsletter';
import classes from '@/views/Home/Home.module.css';
import { Button, Center, Container, Grid, Group, Paper, Stack, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import dynamic from 'next/dynamic';
import 'swiper/css';
import { Autoplay, Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import growthChartJSON from './growthChartJSON.json';

const Lottie = dynamic(() => import('lottie-react'), {
    ssr: false,
});

const SplashComponent = () => {
    const theme = useMantineTheme();
    const { showSubscribeForm, showSubscribeFormHandlers, email, handleSetEmail, onSubmit, getInputProps, firstNum, secondNum, regenerateCaptcha, formErrors } =
        useSubscribeToNewsletter();

    const carouselWords = ['Day Trades', 'Swing Trades', 'Stock Options', 'Long-Term Investment', 'Stock Lists', 'Market Data', 'Chart Patterns', 'Indicators'];

    return (
        <Paper
            mih={900}
            radius={0}
            styles={{
                root: { backgroundColor: theme.colors.customColor[0] },
            }}
        >
            <Container size='xl'>
                <SubscribeForm
                    showSubscribeForm={showSubscribeForm}
                    showSubscribeFormHandlers={showSubscribeFormHandlers}
                    email={email}
                    handleSetEmail={handleSetEmail}
                    onSubmit={onSubmit}
                    getInputProps={getInputProps}
                    firstNum={firstNum}
                    secondNum={secondNum}
                    regenerateCaptcha={regenerateCaptcha}
                    formErrors={formErrors}
                />
                <Center mih={750}>
                    <Grid align={'center'}>
                        <Grid.Col span={6}>
                            <Stack>
                                <Title c={theme.colors.customColor[4]} fz={55}>
                                    Investment strategies for everyone on the internet
                                </Title>
                                <Group>
                                    <Text fz={38} c={theme.colors.customColor[4]} fw={'bold'}>
                                        Learn:
                                    </Text>
                                    <Swiper
                                        direction='vertical'
                                        slidesPerView={'auto'}
                                        spaceBetween={10}
                                        loop={true}
                                        mousewheel={true}
                                        autoplay={{
                                            delay: 1500,
                                            disableOnInteraction: false,
                                        }}
                                        modules={[Mousewheel, Autoplay]}
                                        style={{ height: '62px', width: '510px' }}
                                    >
                                        {carouselWords.map((word, index) => (
                                            <SwiperSlide key={index}>
                                                <Text
                                                    fz={40}
                                                    fw={500}
                                                    c={theme.colors.customColor[3]}
                                                    style={{
                                                        background: 'black',
                                                        borderRadius: '10px',
                                                        display: 'inline-block',
                                                        padding: '0 15px',
                                                    }}
                                                >
                                                    {word}
                                                </Text>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </Group>
                                <TextInput
                                    classNames={{ input: classes.textInput }}
                                    styles={{
                                        section: { paddingRight: 10 },
                                    }}
                                    mt='md'
                                    rightSectionWidth='xl'
                                    size={'xl'}
                                    rightSection={
                                        <Button
                                            size={'lg'}
                                            style={{ backgroundColor: 'transparent !important' }}
                                            onClick={() => showSubscribeFormHandlers.setTrue()}
                                            bg={theme.colors.customColor[2]}
                                        >
                                            Subscribe
                                        </Button>
                                    }
                                    placeholder='Join our Newsletter'
                                    radius={10}
                                    onChange={(event) => handleSetEmail(event)}
                                />
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={5.5} offset={0.5}>
                            <Stack align='center'>
                                <div style={{ width: 800, height: 800 }}>
                                    <Lottie animationData={growthChartJSON} loop={true} />
                                </div>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Center>
            </Container>
        </Paper>
    );
};

export { SplashComponent };
