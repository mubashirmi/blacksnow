import { Stack, Text } from '@mantine/core';
import { ReactNode } from 'react';

type Props = {
    text?: string;
    title: string;
    icon: ReactNode;
};

const IconTextStack = ({ text = '', title, icon }: Props) => {
    return (
        <Stack align={'center'} w={'100%'}>
            {icon}
            <Text ta={'center'} fz={24}>
                {title}
            </Text>
            {text ? <Text ta={'center'}>{text}</Text> : <></>}
        </Stack>
    );
};

export { IconTextStack };
