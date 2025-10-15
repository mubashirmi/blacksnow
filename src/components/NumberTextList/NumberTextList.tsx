import { SECTION_GAP } from '@/constants/applicationTypes';
import { Center, Container, Divider, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { IconCircleNumber1, IconCircleNumber2, IconCircleNumber3, IconCircleNumber4, IconCircleNumber5, IconCircleNumber6 } from '@tabler/icons-react';

const NumberTextList = () => {
    return (
        <Container size={'xl'} mb={SECTION_GAP}>
            <Center mb={'xl'}>
                <Title mb={'xl'}>Long Term Investment</Title>
            </Center>
            <Stack>
                <Grid>
                    <Grid.Col span={8}>
                        <Group>
                            <IconCircleNumber1 size={28} />
                            <Text fz={28}>Dividend Reimbursement</Text>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Stack>
                            <Text>This is a line of text</Text>
                            <Text>This is a line of text</Text>
                        </Stack>
                    </Grid.Col>
                </Grid>
                <Divider size={'xs'} />
                <Grid>
                    <Grid.Col span={8}>
                        <Group>
                            <IconCircleNumber2 size={28} />
                            <Text fz={28}>Mutual Funds</Text>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Stack>
                            <Text>This is a line of text</Text>
                            <Text>This is a line of text</Text>
                            <Text>This is a line of text</Text>
                        </Stack>
                    </Grid.Col>
                </Grid>
                <Divider size={'xs'} />
                <Grid>
                    <Grid.Col span={8}>
                        <Group>
                            <IconCircleNumber3 size={28} />
                            <Text fz={28}>401k Roth IRA</Text>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Stack>
                            <Text>This is a line of text</Text>
                            <Text>This is a line of text</Text>
                        </Stack>
                    </Grid.Col>
                </Grid>
                <Divider size={'xs'} />
                <Grid>
                    <Grid.Col span={8}>
                        <Group>
                            <IconCircleNumber4 size={28} />
                            <Text fz={28}>Buy Treasury Bonds</Text>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Stack>
                            <Text>This is a line of text</Text>
                        </Stack>
                    </Grid.Col>
                </Grid>
                <Divider size={'xs'} />
                <Grid>
                    <Grid.Col span={8}>
                        <Group>
                            <IconCircleNumber5 size={28} />
                            <Text fz={28}>Portfolio Diversity</Text>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Stack>
                            <Text>This is a line of text</Text>
                            <Text>This is a line of text</Text>
                            <Text>This is a line of text</Text>
                        </Stack>
                    </Grid.Col>
                </Grid>
                <Divider size={'xs'} />
                <Grid>
                    <Grid.Col span={8}>
                        <Group>
                            <IconCircleNumber6 size={28} />
                            <Text fz={28}>Precious Metals</Text>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Stack>
                            <Text>This is a line of text</Text>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Stack>
        </Container>
    );
};

export { NumberTextList };
