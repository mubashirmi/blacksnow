import { Button, Center, Group, Image, Paper, Stack, Title, useMantineTheme } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useRouter } from 'next/router';

const CallToAction = () => {
    const theme = useMantineTheme();
    const router = useRouter();
    return (
        <Paper
            shadow='lg'
            p='xl'
            radius={0}
            styles={{
                root: { backgroundColor: theme.colors.customColor[0] },
            }}
        >
            <Stack py={'xl'} gap={'xl'}>
                <Center>
                    <Group onClick={() => router.push('/')} gap={'xs'}>
                        <Image src={'./logo_black.svg'} alt={'Logo'} fit={'contain'} w={40} />
                        <Title c='black'>BLACK SNOW</Title>
                    </Group>
                </Center>
                <Center>
                    <Title c={'black'}>Schedule your Webinar Today</Title>
                </Center>
                <Center>
                    <Button size={'xl'} radius={'md'} rightSection={<IconArrowRight />} onClick={() => router.push('/rsvp')} bg={theme.colors.customColor[2]}>
                        Get Started
                    </Button>
                </Center>
            </Stack>
        </Paper>
    );
};

export { CallToAction };
