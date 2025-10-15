import { Accordion, Button, Container, Group, List, Text, Title, useMantineTheme } from '@mantine/core';
import { useEffect, useState } from 'react';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    salesPersonFirstName: string;
    salesPersonLastName: string;
}

interface Event {
    id: number;
    date: string;
    time: string;
    limit: number;
    SignUp?: User[]; // Marking it as optional, so it can be undefined
}

const UpcomingEvents = () => {
    const theme = useMantineTheme();
    const [eventsWithSignUps, setEventsWithSignUps] = useState<Event[]>([]); // Initialize as empty array for events
    const [loading, setLoading] = useState<boolean>(true); // Boolean state for loading
    const [error, setError] = useState<string | null>(null); // Allowing string or null for errors

    // Fetch events from the backend
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch the events from your API (replace with your API URL)
                const response = await fetch('/api/v1/calendar'); // Update this URL as per your backend route
                const data = await response.json();

                // Check if the data is in the expected format
                if (data && data.success && Array.isArray(data.data)) {
                    setEventsWithSignUps(data.data); // Assuming the API response contains a "data" key with event information
                } else {
                    setError('Failed to fetch events'); // Set error if response is not as expected
                }
            } catch (e) {
                setError('An error occurred while fetching events'); // Handle any errors during fetch
            } finally {
                setLoading(false); // Hide the loading indicator after the fetch is done
            }
        };

        fetchEvents();
    }, []); // Empty dependency array ensures this runs once when the component mounts

    // Dummy handler functions
    const handleSelectAllEmails = (event: Event) => {
        const emails = event.SignUp?.map((user) => user.email).join(', ') || ''; // Ensure SignUp is defined
        alert(`Emails: ${emails}`);
    };

    const handleRemoveUser = (user: User) => {
        const updatedEvents = eventsWithSignUps.map((event) => ({
            ...event,
            SignUp: event.SignUp?.filter((u) => u.email !== user.email) || [], // Ensure SignUp is defined
        }));
        setEventsWithSignUps(updatedEvents);
        alert(`${user.firstName} ${user.lastName} has been removed.`);
    };

    if (loading) {
        return <Text align='center'>Loading events...</Text>; // Show loading state
    }

    if (error) {
        return (
            <Text align='center' color='red'>
                {error}
            </Text>
        ); // Show error if fetching fails
    }

    return (
        <Container fluid>
            <Title mb={20} ta={'center'} c={theme.colors.customColor[4]}>
                Upcoming Events
            </Title>
            <Accordion variant='separated' radius={10} chevronPosition='left' mb={100} chevronSize='xl'>
                {eventsWithSignUps.map((event) => (
                    <Accordion.Item key={event.id} value={event.id.toString()}>
                        <Accordion.Control>{event.date}</Accordion.Control>
                        <Accordion.Panel>
                            <Text mb={20}>Time: {event.time}</Text>
                            <Text mb={20}>Limit: {event.limit}</Text>

                            <Button onClick={() => handleSelectAllEmails(event)} mb={20} bg={theme.colors.customColor[2]}>
                                Copy All Emails
                            </Button>

                            {event.SignUp && event.SignUp.length === 0 ? (
                                <Text>No users signed up yet.</Text>
                            ) : (
                                <List>
                                    <Group>
                                        {(event.SignUp || []).map(
                                            (
                                                user,
                                                index // Default to empty array if SignUp is undefined
                                            ) => (
                                                <List.Item key={index} mb={25}>
                                                    <Text>
                                                        {user.firstName} {user.lastName}
                                                    </Text>
                                                    <Text>Email: {user.email}</Text>
                                                    <Text>Phone: {user.phone}</Text>
                                                    <Text>
                                                        Sales Person: {user.salesPersonFirstName} {user.salesPersonLastName}
                                                    </Text>
                                                    <Button bg='red' c='white' onClick={() => handleRemoveUser(user)}>
                                                        Remove User
                                                    </Button>
                                                </List.Item>
                                            )
                                        )}
                                    </Group>
                                </List>
                            )}
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Container>
    );
};

export { UpcomingEvents };
