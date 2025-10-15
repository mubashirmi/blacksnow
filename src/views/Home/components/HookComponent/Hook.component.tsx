import { ArrowDivider, PaperBox } from '@/components';
import { Button, Container, Flex, Grid, Group, Image, List, Stack, Text, Title, rem, useMantineTheme } from '@mantine/core';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useRouter } from 'next/router';

type Props = {
    handleShowRSVPForm: () => void;
};

const HookComponent = ({ handleShowRSVPForm }: Props) => {
    const theme = useMantineTheme();
    const router = useRouter();

    return (
        <Container size='xl' my={100}>
            <Grid>
                <Grid.Col span={5}>
                    <Stack>
                        <Title c={theme.colors.customColor[1]}>Build and Prospect a Master Stock List</Title>
                        <Text fz={24} mt={'md'} c={theme.colors.customColor[1]}>
                            Enrich your stock Market Trading experience by following and setting alerts for Market Movers
                        </Text>
                        <List
                            fz={20}
                            spacing={'lg'}
                            c={theme.colors.customColor[1]}
                            icon={<IconCircleCheckFilled style={{ color: 'black', width: rem(25), height: rem(25) }} />}
                        >
                            <List.Item>Learn To Create Options Trading Lists</List.Item>
                            <List.Item>Learn To Research Emerging Markets</List.Item>
                            <List.Item>Learn To Identify Stock Market Press Release Source</List.Item>
                            <List.Item>Learn To Set Price Movement Indicators</List.Item>
                            <List.Item>Learn To Observe Major Stock Indicators</List.Item>
                            <List.Item>Learn To Maintain Your Risk</List.Item>
                            <List.Item>Learn Limit Sell, Stop Loss, and Paper Trading</List.Item>
                        </List>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={6} offset={1}>
                    <Image src={'/hook.gif'} alt='extension' />
                </Grid.Col>
            </Grid>
            <Group mt={20}>
                <Button bg={theme.colors.customColor[2]} w={150} radius='md' onClick={handleShowRSVPForm}>
                    RSVP
                </Button>
                <Button bg={theme.colors.customColor[2]} w={150} radius='md' onClick={() => router.push('/rsvp')}>
                    Learn More
                </Button>
            </Group>
            <Stack mt={100}>
                <Title c={theme.colors.customColor[1]} mb={50} ta={'center'}>
                    Covered Calls Vs Protective Puts
                </Title>
                <Flex>
                    <PaperBox
                        header={
                            <>
                                <Text fz={24} mt={'md'} c={theme.colors.customColor[1]}>
                                    Covered Calls
                                </Text>
                                <Stack gap={'md'} c={theme.colors.customColor[1]} pr={20}>
                                    <Text fz={20} c={theme.colors.customColor[1]}>
                                        <Text component='span' fw='bold' fz={20}>
                                            Profit
                                        </Text>{' '}
                                        From Stock Price Increase
                                    </Text>
                                    <Text fz={20} c={theme.colors.customColor[1]}>
                                        <Text component='span' fw='bold' fz={20}>
                                            Right to Buy:
                                        </Text>{' '}
                                        Call options give the holder the right (but not the obligation) to buy the underlying asset at a specified strike price
                                        before expiration
                                    </Text>
                                    <Text fz={20} c={theme.colors.customColor[1]}>
                                        <Text component='span' fw='bold' fz={20}>
                                            Leverage Potential:
                                        </Text>{' '}
                                        Investors use calls to gain leveraged exposure to stock price increases, potentially leading to higher percentage
                                        returns than buying the stock outright
                                    </Text>
                                    <Text fz={20} c={theme.colors.customColor[1]}>
                                        <Text component='span' fw='bold' fz={20}>
                                            Bullish Strategy:
                                        </Text>{' '}
                                        Calls are typically used in bullish strategies, allowing investors to profit from anticipated price increases in the
                                        underlying asset
                                    </Text>
                                </Stack>
                            </>
                        }
                        width={450}
                        withBorder
                        color={'green'}
                    />
                    <Stack gap={150} mt={200}>
                        <ArrowDivider direction={'left'} color={'green'} />
                        <ArrowDivider direction={'right'} color={'red'} />
                    </Stack>
                    <PaperBox
                        header={
                            <>
                                <Text fz={24} mt={'sm'} ta={'center'} c={theme.colors.customColor[1]}>
                                    Protective Puts
                                </Text>
                                <Stack gap={'lg'} pr={20}>
                                    <Text fz={20} c={theme.colors.customColor[1]}>
                                        <Text component='span' fw='bold' fz={20}>
                                            Profit
                                        </Text>{' '}
                                        From Stock Price Decrease
                                    </Text>
                                    <Text fz={20} c={theme.colors.customColor[1]}>
                                        <Text component='span' fw='bold' fz={20}>
                                            Right to Sell:
                                        </Text>{' '}
                                        Put options provide the holder the right (but not the obligation) to sell the underlying asset at a specified strike
                                        price before expiration
                                    </Text>
                                    <Text fz={20} c={theme.colors.customColor[1]}>
                                        <Text component='span' fw='bold' fz={20}>
                                            Hedging Tool:
                                        </Text>{' '}
                                        Puts are commonly used as a hedging strategy to protect against declines in asset prices, helping to offset potential
                                        losses in a portfolio
                                    </Text>
                                    <Text fz={20} c={theme.colors.customColor[1]}>
                                        <Text component='span' fw='bold' fz={20}>
                                            Bearish Strategy:
                                        </Text>{' '}
                                        Investors use puts to profit from anticipated decreases in the underlying asset&apos;s price, making them a useful tool
                                        in bearish market conditions
                                    </Text>
                                </Stack>
                            </>
                        }
                        withBorder
                        color={'red'}
                        width={450}
                    />
                </Flex>
            </Stack>
        </Container>
    );
};

export { HookComponent };
