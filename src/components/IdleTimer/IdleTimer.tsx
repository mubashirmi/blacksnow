import { useBoolean } from '@/lib/hooks/useBoolean';
import { useGlobalState } from '@/store';
import { Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

const timeout = 1800_000;
const promptBeforeIdle = 60_000;

const modalStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    content: {
        borderRadius: 30,
    },
    body: {
        padding: 30,
        background: 'linear-gradient(to bottom, #2c6dd5 0%, #00ffff 100%)',
    },
};

const IdleTimer = () => {
    const router = useRouter();
    const [remaining, setRemaining] = useState<number>(timeout);
    const [modalOpen, modalOpenHandlers] = useBoolean(false);
    const { setIsLoggedIn } = useGlobalState();

    const handleStillHere = () => {
        activate();
        modalOpenHandlers.setFalse();
    };

    const onIdle = () => {
        modalOpenHandlers.setFalse();
        signOut().then(() => {
            setIsLoggedIn(false);
            router.push('/');
        });
    };

    const onPrompt = () => {
        modalOpenHandlers.setTrue();
    };

    const { getRemainingTime, activate } = useIdleTimer({
        onIdle,
        onPrompt,
        timeout,
        promptBeforeIdle,
        throttle: 500,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining(Math.ceil(getRemainingTime() / 1000));
        }, 500);

        return () => {
            clearInterval(interval);
        };
    });

    return (
        <Modal maw={1012} size='sm' opened={modalOpen} onClose={() => modalOpenHandlers.setFalse()} withCloseButton={false} styles={modalStyles} centered>
            <Group grow>
                <Stack align='center' gap={80}>
                    <Title order={3} c={'white'}>
                        Session Expiring
                    </Title>
                    <Text fw={700} fz={18} ta='center' m={0} c={'white'}>
                        You will be logged out automatically in {remaining} seconds due to inactivity.
                    </Text>
                    <Button onClick={handleStillHere} className={'whiteTextButton'}>
                        Keep me logged in
                    </Button>
                </Stack>
            </Group>
        </Modal>
    );
};

export { IdleTimer };
