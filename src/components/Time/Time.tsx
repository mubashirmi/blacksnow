import { Group, Text } from '@mantine/core';
import moment from 'moment';
import { useEffect, useState } from 'react';

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Use type assertion to avoid TypeScript error
    const timeOptions = {
        hour: 'numeric' as const,
        minute: '2-digit' as const,
        second: '2-digit' as const,
        hour12: true, // Use 12-hour format (set to false for 24-hour)
    };

    return (
        <Group pl={5}>
            <Text fz={'12px'}>{moment(time).format('MMMM D, YYYY')}</Text>
            <Text fz={'12px'}>{time.toLocaleTimeString('en-US', timeOptions)}</Text>
        </Group>
    );
};

export { Clock };
