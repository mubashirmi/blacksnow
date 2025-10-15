import { Center, Container, Grid, Image, Stack, Text, Title } from '@mantine/core';

const SplashComponent = () => {
    return (
        <Container fluid>
            <Container size='xl'>
                <Center mih={750}>
                    <Grid align={'center'}>
                        <Grid.Col span={6}>
                            <Stack>
                                <Title c={'black'} fz={55}>
                                    Our Story
                                </Title>
                                <Text c={'black'} fz={18} lh={1.5}>
                                    Black Snow started in 2024 as an Investment firm. Our story consists of providing the best intangible products in the
                                    finance, investment and asset sector for a growing client base which strives toward diversification. Our Journey started
                                    with reaching out to clients and customers who wanted to learn more about Stocks, Bonds, and Options.
                                </Text>
                                <Text c={'black'} fz={18} lh={1.5}>
                                    Our client-based focus presented us with a problem which we solve in our online course materials. We provide solutions for
                                    Daytrading, Options, and Chart Reading. As a result, we have researched and spent quality time to achieve, maintain, and get
                                    results for our client base.
                                </Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={4} offset={2}>
                            <Image src={'./logo_black.svg'} alt={'logo'} />
                        </Grid.Col>
                    </Grid>
                </Center>
            </Container>
        </Container>
    );
};

export { SplashComponent };
