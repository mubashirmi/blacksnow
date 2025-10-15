import { Divider, Group, useMantineTheme } from '@mantine/core';
import { IconCircle, IconCircleArrowLeft, IconCircleArrowRight } from '@tabler/icons-react';

type Props = {
    width?: number;
    direction: string;
    color: string;
};

const ArrowDivider = ({ width = 100, direction = 'right', color }: Props) => {
    const theme = useMantineTheme();

    const arrowIcon =
        direction === 'right' ? (
            <IconCircleArrowRight size={30} color={color} />
        ) : direction === 'left' ? (
            <IconCircleArrowLeft size={30} color={color} />
        ) : null;

    return (
        <Group gap={0} justify='space-between'>
            <IconCircle size={10} stroke={5} color={color} />
            <Divider c={theme.colors.blue[7]} color={color} h={3} w={width} />
            {arrowIcon}
            <Divider c={theme.colors.blue[7]} color={color} h={3} w={width} />
            <IconCircle size={10} stroke={5} color={color} />
        </Group>
    );
};

export { ArrowDivider };
