import { Paper, Stack, Text } from '@mantine/core';
import { ReactNode } from 'react';

type Props = {
    text?: string;
    textTwo?: string;
    textThree?: string;
    title?: string;
    alignment?: string;
    titleColor?: string;
    header?: ReactNode;
    color?: string;
    withBorder?: boolean;
    width?: number;
};
const PaperBox = ({
    text = '',
    textTwo = '',
    textThree = '',
    title,
    alignment = 'center',
    titleColor = 'black',
    header = '',
    color = '',
    withBorder = false,
    width = 300,
}: Props) => {
    return (
        <Paper style={{ boxShadow: '0 4px 16px rgba(76, 88, 132, .08)', border: withBorder ? `2px solid ${color}` : '' }} radius={'lg'} p={'xl'}>
            <Stack justify={'center'} mih={75} align={alignment} w={width}>
                {header || <></>}
                <Text fz={28} fw={700} c={titleColor}>
                    {title}
                </Text>
                {text ? <Text fw={300}>{text}</Text> : <></>}
                {textTwo ? <Text fw={300}>{textTwo}</Text> : <></>}
                {textThree ? <Text fw={300}>{textThree}</Text> : <></>}
            </Stack>
        </Paper>
    );
};

export { PaperBox };
