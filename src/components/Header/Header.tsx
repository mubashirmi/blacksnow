import useHeader from '@/components/Header/useHeader';
import useRSVPForm from '@/components/RSVPForm/useRSVPForm';
import { Button, Container, Flex, Group, Image, Title, useMantineTheme } from '@mantine/core';
import { RSVPForm } from '../RSVPForm';

const Header = () => {
    const theme = useMantineTheme();
    const { router, isLoggedIn, handleRouteToDashboard } = useHeader();
    const { handleCloseRSVPForm, showRSVPForm, handleShowRSVPForm } = useRSVPForm();

    return (
        <Container bg={'black'} h={'100%'} fluid>
            <Container size='xl' h={'100%'}>
                <Group align='center' h={'100%'} justify={'space-between'}>
                    <Flex gap={30} align='center'>
                        <Group onClick={() => router.push('/')} gap={'xs'} style={{ cursor: 'pointer' }}>
                            <Image src={'/logo.svg'} alt={'Logo'} fit={'contain'} w={40} />
                            <Title c={'white'}>Black Snow</Title>
                        </Group>
                    </Flex>
                    <Flex gap={30}>
                        <Button onClick={handleShowRSVPForm} w={150} bg={theme.colors.customColor[2]} c={'white'}>
                            RSVP
                        </Button>
                        {isLoggedIn ? (
                            <Button w={150} onClick={handleRouteToDashboard} bg={theme.colors.customColor[2]} c={'white'}>
                                Dashboard
                            </Button>
                        ) : (
                            <Button w={150} onClick={() => router.push('/login')} bg={theme.colors.customColor[2]} c={'white'}>
                                Login
                            </Button>
                        )}
                    </Flex>
                </Group>
            </Container>
            <RSVPForm showRSVPForm={showRSVPForm} handleCloseRSVPForm={handleCloseRSVPForm} />
        </Container>
    );
};

export { Header };
