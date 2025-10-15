import { Accordion, Button, Container, Grid, Group, Modal, Text, TextInput, Textarea, Title, useMantineTheme } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface FAQType {
    id: number;
    title: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
}

const FAQ = () => {
    const theme = useMantineTheme();
    const [displayFAQs, setDisplayFAQs] = useState<FAQType[]>([]);
    const [accordionOpened, setAccordionOpened] = useState<string | null>(null);
    const [showFAQDelete, setShowFAQDelete] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
    const [newFAQ, setNewFAQ] = useState({ title: '', text: '' });

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            const response = await fetch(`/api/v1/faq`);
            const data = await response.json();
            if (data.success) {
                setDisplayFAQs(data.data.faqs);
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        }
    };

    const createFAQ = async (e: any) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/v1/faq`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newFAQ),
            });
            const data = await response.json();
            if (data.success) {
                setNewFAQ({ title: '', text: '' }); // Reset form
                await fetchFAQs(); // Fetch updated FAQs
            }
        } catch (error) {
            console.error('Error creating FAQ:', error);
        }
    };

    const deleteFAQ = async (faqId: number) => {
        try {
            const response = await fetch(`/api/v1/faq/?id=${faqId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setShowFAQDelete(false);
                setFaqToDelete(null);
                await fetchFAQs(); // Fetch updated FAQs after deletion
            }
        } catch (error) {
            console.error('Error deleting FAQ:', error);
        }
    };

    const handleAccordionChange = (value: string | null) => {
        setAccordionOpened(value);
    };

    const handleIconClick = (faqId: number) => {
        setShowFAQDelete(true);
        setFaqToDelete(faqId);
    };

    const handleCancelClick = () => {
        setShowFAQDelete(false);
        setFaqToDelete(null);
    };

    const handleInputChange = (e: any) => {
        setNewFAQ({ ...newFAQ, [e.target.name]: e.target.value });
    };

    return (
        <Container fluid className='min-h-screen bg-gray-50 py-12'>
            <Title order={1} mb={40} ta='center' fw={700}>
                FAQ Dashboard
            </Title>
            <Grid gutter='xl'>
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <form onSubmit={createFAQ} className='bg-white p-6 rounded-xl shadow-lg'>
                        <TextInput
                            mt={20}
                            placeholder='Enter FAQ title'
                            size='lg'
                            radius='md'
                            name='title'
                            value={newFAQ.title}
                            onChange={handleInputChange}
                            required
                            classNames={{ input: 'border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50' }}
                        />
                        <Textarea
                            mt={20}
                            placeholder='Enter FAQ description'
                            size='lg'
                            radius='md'
                            name='text'
                            value={newFAQ.text}
                            onChange={handleInputChange}
                            required
                            minRows={5}
                            classNames={{ input: 'border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50' }}
                        />
                        <Button mt={20} w={150} type='submit' size='md' radius='md' className='hover:bg-indigo-500 transition-all duration-200'>
                            Create FAQ
                        </Button>
                    </form>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 7 }}>
                    {displayFAQs && displayFAQs.length > 0 ? (
                        <Accordion
                            variant='separated'
                            radius='md'
                            chevronPosition='left'
                            mb={100}
                            chevronSize={24}
                            value={accordionOpened}
                            onChange={handleAccordionChange}
                            classNames={{
                                root: 'space-y-4',
                                item: 'bg-white rounded-xl shadow-md',
                                control: 'hover:bg-indigo-50 transition-colors duration-200',
                                content: 'bg-gray-50',
                            }}
                        >
                            {displayFAQs.map((faq) => (
                                <Accordion.Item key={faq.id} value={faq.id.toString()} mih={50} mt={25}>
                                    <Accordion.Control>
                                        <Group justify='space-between' pr={20}>
                                            <Title order={3} fw={600}>
                                                {faq.title}
                                            </Title>
                                            <IconTrash
                                                size={24}
                                                color={theme.colors.red[6]}
                                                onClick={() => handleIconClick(faq.id)}
                                                className='cursor-pointer hover:text-red-700 transition-colors duration-200'
                                            />
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Text fz='lg' ml={35} c={theme.colors.gray[7]} lineClamp={4}>
                                            {faq.text}
                                        </Text>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    ) : (
                        <Text ta='center' c={theme.colors.gray[6]} fz='lg' mt={50}>
                            No FAQs available.
                        </Text>
                    )}
                </Grid.Col>
            </Grid>

            {/* Delete Confirmation Modal */}
            <Modal
                opened={showFAQDelete}
                onClose={handleCancelClick}
                title={
                    <Title order={3} c={theme.colors.red[7]}>
                        Confirm Deletion
                    </Title>
                }
                centered
                radius='md'
                size='sm'
                classNames={{
                    content: 'bg-white shadow-xl',
                    header: 'border-b border-gray-200',
                }}
            >
                <Text mb={20} c={theme.colors.gray[7]}>
                    Are you sure you want to delete this FAQ?
                </Text>
                <Group justify='flex-end'>
                    <Button variant='outline' color='gray' onClick={handleCancelClick} radius='md' className='hover:bg-gray-100 transition-all duration-200'>
                        Cancel
                    </Button>
                    <Button
                        color='red'
                        onClick={() => faqToDelete !== null && deleteFAQ(faqToDelete)}
                        radius='md'
                        className='hover:bg-red-700 transition-all duration-200'
                    >
                        Delete
                    </Button>
                </Group>
            </Modal>
        </Container>
    );
};

export { FAQ };
