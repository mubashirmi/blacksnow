// import { Button, Container, Grid, NumberInput, Stack, TextInput, Title, useMantineTheme } from '@mantine/core';
// import { DatePicker, TimeInput } from '@mantine/dates';
// import useCalendarEvents from './useCalendarEvents';

// type Props = {
//     props: any;
// };

// const CalendarEvents = ({ props }: Props) => {
//     const theme = useMantineTheme();
//     const { currentDisplayDate, getDayProps, handleSelectDate, handleCreateUpdateEvent, isCurrentEvent, handleRemoveEvent, getInputProps, onSubmit } =
//         useCalendarEvents(props);
//     return (
//         <Container fluid>
//             <Title mb={40} ta={'center'} c={theme.colors.customColor[4]}>
//                 Manage Events
//             </Title>
//             <Grid>
//                 <Grid.Col span={6}>
//                     <Stack align={'center'}>
//                         <DatePicker size='xl' numberOfColumns={1} onChange={handleSelectDate} getDayProps={getDayProps} />
//                     </Stack>
//                 </Grid.Col>
//                 <Grid.Col span={5}>
//                     <form onSubmit={onSubmit(handleCreateUpdateEvent)}>
//                         <Stack gap={20}>
//                             <TextInput label='Date' disabled value={currentDisplayDate} radius={10} />
//                             <TimeInput label='Start Time' {...getInputProps('time')} radius={10} />
//                             <NumberInput label='Number of Seats' {...getInputProps('limit')} radius={10} />
//                             <Button size={'lg'} type='submit' bg={theme.colors.customColor[2]}>
//                                 {isCurrentEvent ? 'Update Event' : 'Create Event'}
//                             </Button>
//                             {isCurrentEvent ? (
//                                 <Button size={'lg'} bg={'red'} c={'white'} onClick={handleRemoveEvent}>
//                                     Remove Event
//                                 </Button>
//                             ) : (
//                                 <></>
//                             )}
//                         </Stack>
//                     </form>
//                 </Grid.Col>
//             </Grid>
//         </Container>
//     );
// };

// export { CalendarEvents };

import { Button, Container, Grid, NumberInput, Stack, TextInput, Title, useMantineTheme } from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import { useState } from 'react';

const CalendarEvents = () => {
    const theme = useMantineTheme();

    // Dummy Data
    const dummyCurrentDate = '2025-06-18'; // The current date
    const dummyEvent = {
        time: '10:00',
        limit: 50,
    };

    const [currentDisplayDate, setCurrentDisplayDate] = useState(dummyCurrentDate);
    const [eventData, setEventData] = useState(dummyEvent);
    const [isCurrentEvent, setIsCurrentEvent] = useState(false); // For testing: Change this to simulate existing event

    const handleSelectDate = (date: any) => {
        setCurrentDisplayDate(date.toISOString().split('T')[0]);
    };

    const handleCreateUpdateEvent = (values: any) => {
        // console.log('Event Created/Updated:', values);
        // Here you can handle form submission, e.g., sending the data to an API or updating state
    };

    const handleRemoveEvent = () => {
        // console.log('Event Removed');
        setIsCurrentEvent(false); // Simulate event removal by changing the state
    };

    const getInputProps = (field: string) => ({
        value: eventData[field],
        onChange: (e: any) => setEventData((prev) => ({ ...prev, [field]: e.target.value })),
    });

    const onSubmit = (callback: Function) => (e: any) => {
        e.preventDefault();
        callback(eventData);
    };

    return (
        <Container fluid>
            <Title mb={40} ta={'center'} c={theme.colors.customColor[4]}>
                Manage Events
            </Title>
            <Grid>
                <Grid.Col span={6}>
                    <Stack align={'center'}>
                        <DatePicker size='xl' numberOfColumns={1} value={new Date(currentDisplayDate)} onChange={handleSelectDate} />
                    </Stack>
                </Grid.Col>
                <Grid.Col span={5}>
                    <form onSubmit={onSubmit(handleCreateUpdateEvent)}>
                        <Stack gap={20}>
                            <TextInput label='Date' disabled value={currentDisplayDate} radius={10} />
                            <TimeInput label='Start Time' {...getInputProps('time')} radius={10} />
                            <NumberInput label='Number of Seats' {...getInputProps('limit')} radius={10} />
                            <Button size={'lg'} type='submit' bg={theme.colors.customColor[2]}>
                                {isCurrentEvent ? 'Update Event' : 'Create Event'}
                            </Button>
                            {isCurrentEvent ? (
                                <Button size={'lg'} bg={'red'} c={'white'} onClick={handleRemoveEvent}>
                                    Remove Event
                                </Button>
                            ) : (
                                <></>
                            )}
                        </Stack>
                    </form>
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export { CalendarEvents };
