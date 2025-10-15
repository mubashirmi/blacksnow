import { Button, Container, Group, Stack, useMantineTheme } from '@mantine/core';

type Props = {
    props: any;
};

const Links = ({ props }: Props) => {
    // TODO: Show an alert that the link has been copied
    // tODO: Copy the link on button click to the users clipboard
    // TODO: This is the same functionality that needs to replicated to the affiliate dashboard as well
    const theme = useMantineTheme();
    return (
        <Container fluid>
            <Stack justify={'center'}>
                <Group w={200}>
                    <Button size='md' radius={0} w={200} color={theme.colors.customColor[2]}>
                        Newsletter Link
                    </Button>
                </Group>
                <Group w={200}>
                    <Button size='md' radius={0} w={200} color={theme.colors.customColor[2]}>
                        RSVP Link
                    </Button>
                </Group>
                <Group w={200}>
                    <Button size='md' radius={0} w={200} color={theme.colors.customColor[2]}>
                        Digital Billboard Link
                    </Button>
                </Group>
            </Stack>
        </Container>
    );
};

export { Links };
