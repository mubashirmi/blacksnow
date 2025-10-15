import { Button, Container, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';

type Props = {
    props: any;
};

const Links = ({ props }: Props) => {
    const theme = useMantineTheme();

    const handleCopyLink = async () => {
        try {
            await window.navigator.clipboard.writeText(props.user.Affiliate.link);
            notifications.show({ title: 'Link', message: 'Link copied to clipboard' });
        } catch (error) {
            notifications.show({ title: 'Error', color: 'red', message: 'Error copying link' });
        }
    };

    return (
        <Container fluid>
            <Title mb={40} ta={'center'}>
                Links
            </Title>
            <Stack justify={'center'}>
                <Group>
                    <Text>{props.user.Affiliate.link}</Text>
                    <Button w={150} bg={theme.colors.customColor[2]} onClick={handleCopyLink}>
                        Copy Link
                    </Button>
                </Group>
            </Stack>
        </Container>
    );
};

export { Links };
