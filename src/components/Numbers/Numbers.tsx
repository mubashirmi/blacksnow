import { Divider, Grid, Paper, Stack, Text, Title, useMantineTheme } from '@mantine/core';

const Numbers = () => {
    const theme = useMantineTheme();
    return (
        <Paper
            shadow='lg'
            p='xl'
            radius='lg'
            styles={{
                root: { backgroundColor: theme.colors.customBlue[7] },
            }}
        >
            <Grid py={50} px={20}>
                <Grid.Col span={5}>
                    <Stack gap={'lg'}>
                        <Text c={'white'} fz={'xl'}>
                            400%
                            <Text c={'white'} fz={'xl'} span opacity={0.5}>
                                {' '}
                                This is one text
                            </Text>
                        </Text>
                        <Divider opacity={0.5} />
                        <Text c={'white'} fz={'xl'} span>
                            1000000+
                            <Text c={'white'} fz={'xl'} span opacity={0.5}>
                                {' '}
                                This is another text here
                            </Text>
                        </Text>
                        <Divider opacity={0.5} />
                        <Text c={'white'} fz={'xl'}>
                            10x
                            <Text c={'white'} fz={'xl'} span opacity={0.5}>
                                {' '}
                                Maybe another text here if needed
                            </Text>
                        </Text>
                    </Stack>
                </Grid.Col>
                <Divider orientation='vertical' size='xs' opacity={0.5} mx={'xl'} />
                <Grid.Col span={5}>
                    <Title c={'white'}>Here is some really cool statement about something or another, maybe about some client or something</Title>
                </Grid.Col>
            </Grid>
        </Paper>
    );
};

export { Numbers };
