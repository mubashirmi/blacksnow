// import useRequisition from '@/views/Admin/Dashboard/components/Requistion/useRequisition';
// import {
//     Accordion,
//     Anchor,
//     Button,
//     Container,
//     Divider,
//     FileInput,
//     Grid,
//     Group,
//     NumberInput,
//     Stack,
//     Text,
//     Textarea,
//     TextInput,
//     Title,
//     useMantineTheme,
// } from '@mantine/core';
// import { IconTrash } from '@tabler/icons-react';

// type Props = {
//     props: any;
// };

// const Requisition = ({ props }: Props) => {
//     const theme = useMantineTheme();
//     const {
//         handleUploadImage,
//         getInputProps,
//         onSubmit,
//         handleCreateJob,
//         currentCareers,
//         handleDownloadResume,
//         showJobDelete,
//         consultations,
//         accordionOpened,
//         handleIconClick,
//         handleCancelClick,
//         handleDeleteClick,
//         handleAccordionChange,
//         handleDeleteApplicant,
//         showConsultationDelete,
//         handleRequestIconClick,
//         handleCancelRequestClick,
//         handleDeleteRequestClick,
//         handleConsultationAccordionChange,
//         consultationAccordion,
//     } = useRequisition(props);

//     return (
//         <Container fluid>
//             <Title mb={20} ta={'center'} c={theme.colors.customColor[4]}>
//                 Requisition
//             </Title>
//             <form onSubmit={onSubmit(handleCreateJob)}>
//                 <Stack w={'50%'}>
//                     <TextInput placeholder={'Job Title'} size={'lg'} radius={10} {...getInputProps('title')} />
//                     <Textarea rows={5} resize='vertical' placeholder={'Description'} size={'lg'} radius={10} {...getInputProps('description')} />
//                     <TextInput placeholder={'Location'} size={'lg'} radius={10} {...getInputProps('location')} />
//                     <NumberInput placeholder={'Salary'} size={'lg'} radius={10} {...getInputProps('salary')} />
//                     <FileInput placeholder={'Select Image'} size={'lg'} radius={10} onChange={handleUploadImage} />
//                     <Group>
//                         <Button type='submit' bg={theme.colors.customColor[2]}>
//                             Create Career
//                         </Button>
//                     </Group>
//                 </Stack>
//             </form>
//             <Divider my={40} />
//             <Title mb={20} ta={'center'} c={theme.colors.customColor[4]}>
//                 Careers
//             </Title>
//             <Accordion
//                 variant='separated'
//                 radius={10}
//                 chevronPosition={'left'}
//                 mb={100}
//                 chevronSize={'xl'}
//                 value={accordionOpened}
//                 onChange={handleAccordionChange}
//             >
//                 {currentCareers.map((career) => (
//                     <Accordion.Item key={career.id} value={career.id.toString()}>
//                         <Accordion.Control>
//                             <Group>
//                                 {career.title}
//                                 {accordionOpened === career.id.toString() &&
//                                     (showJobDelete ? (
//                                         <Group>
//                                             <Button onClick={(e) => handleDeleteClick(e, career.id)}>Delete Job</Button>
//                                             <Button onClick={handleCancelClick}>Cancel</Button>
//                                         </Group>
//                                     ) : (
//                                         <IconTrash color={'red'} onClick={handleIconClick} style={{ marginLeft: 20 }} />
//                                     ))}
//                             </Group>
//                         </Accordion.Control>
//                         <Accordion.Panel>
//                             <Grid>
//                                 {career.Applicants.map((user, index) => (
//                                     <Grid.Col key={index} mb={25} span={2}>
//                                         <Stack gap={0}>
//                                             <Text>
//                                                 {user.firstName} {user.lastName}
//                                             </Text>
//                                             <Text>{user.email}</Text>
//                                             <Text>{user.phone}</Text>
//                                             <Anchor onClick={() => handleDownloadResume(user)}>Download Resume</Anchor>
//                                             <Anchor c={'red'} onClick={() => handleDeleteApplicant(user.id, career.id)}>
//                                                 Delete Applicant
//                                             </Anchor>
//                                         </Stack>
//                                     </Grid.Col>
//                                 ))}
//                             </Grid>
//                         </Accordion.Panel>
//                     </Accordion.Item>
//                 ))}
//             </Accordion>
//             <Title mb={20} ta={'center'} c={theme.colors.customColor[4]}>
//                 Recruitment Agency Inquiries
//             </Title>
//             <Accordion
//                 variant='separated'
//                 radius={10}
//                 chevronPosition={'left'}
//                 mb={100}
//                 chevronSize={'xl'}
//                 value={consultationAccordion}
//                 onChange={handleConsultationAccordionChange}
//             >
//                 {consultations.map((consultation) => (
//                     <Accordion.Item key={consultation.id} value={consultation.id.toString()}>
//                         <Accordion.Control>
//                             <Group>
//                                 Company: {consultation.companyName}
//                                 {consultationAccordion === consultation.id.toString() &&
//                                     (showConsultationDelete ? (
//                                         <Group>
//                                             <Button onClick={(e) => handleDeleteRequestClick(e, consultation.id)}>Delete Request</Button>
//                                             <Button onClick={handleCancelRequestClick}>Cancel</Button>
//                                         </Group>
//                                     ) : (
//                                         <IconTrash color={'red'} onClick={handleRequestIconClick} style={{ marginLeft: 20 }} />
//                                     ))}
//                             </Group>
//                         </Accordion.Control>
//                         <Accordion.Panel>
//                             <Text>Requested Date/Time: {consultation.dateTime}</Text>
//                             <Text>Contact: {consultation.name}</Text>
//                             <Text>Title: {consultation.title}</Text>
//                             <Text>Phone: {consultation.phone}</Text>
//                             <Text>Email: {consultation.email}</Text>
//                             <Text>Location: {consultation.location}</Text>
//                             <Text>Number of Positions: {consultation.numOfPositions}</Text>
//                         </Accordion.Panel>
//                     </Accordion.Item>
//                 ))}
//             </Accordion>
//         </Container>
//     );
// };

// export { Requisition };

import {
    Accordion,
    Anchor,
    Button,
    Container,
    Divider,
    FileInput,
    Grid,
    Group,
    NumberInput,
    Stack,
    Text,
    TextInput,
    Textarea,
    Title,
    useMantineTheme,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

const Requisition = () => {
    const theme = useMantineTheme();

    // Dummy Data for Careers and Consultations
    const dummyCareers = [
        {
            id: 1,
            title: 'Software Engineer',
            Applicants: [
                { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '123-456-7890' },
                { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '098-765-4321' },
            ],
        },
        {
            id: 2,
            title: 'Product Manager',
            Applicants: [{ id: 3, firstName: 'Mark', lastName: 'Johnson', email: 'mark.johnson@example.com', phone: '112-233-4455' }],
        },
    ];

    const dummyConsultations = [
        {
            id: 1,
            companyName: 'Tech Solutions',
            dateTime: '2023-06-01 10:00 AM',
            name: 'Alice Green',
            title: 'Consulting on Software Development',
            phone: '555-1234',
            email: 'alice.green@techsolutions.com',
            location: 'New York',
            numOfPositions: 3,
        },
        {
            id: 2,
            companyName: 'BizCorp',
            dateTime: '2023-06-05 2:00 PM',
            name: 'Bob Brown',
            title: 'Consulting on Marketing Strategy',
            phone: '555-5678',
            email: 'bob.brown@bizcorp.com',
            location: 'Los Angeles',
            numOfPositions: 2,
        },
    ];

    // State for managing the accordion values and data
    const [accordionOpened, setAccordionOpened] = useState<string | null>(null);
    const [consultationAccordion, setConsultationAccordion] = useState<string | null>(null);
    const [showJobDelete, setShowJobDelete] = useState(false);
    const [showConsultationDelete, setShowConsultationDelete] = useState(false);

    const handleAccordionChange = (value: string | null) => setAccordionOpened(value);
    const handleConsultationAccordionChange = (value: string | null) => setConsultationAccordion(value);

    const handleIconClick = () => setShowJobDelete(true);
    const handleCancelClick = () => setShowJobDelete(false);
    const handleDeleteClick = (event: any, id: number) => {
        console.log('Delete job:', id);
    };

    const handleRequestIconClick = () => setShowConsultationDelete(true);
    const handleCancelRequestClick = () => setShowConsultationDelete(false);
    const handleDeleteRequestClick = (event: any, id: number) => {
        console.log('Delete consultation request:', id);
    };

    const handleDownloadResume = (user: any) => {
        console.log('Downloading resume for:', user);
    };

    const handleDeleteApplicant = (userId: number, careerId: number) => {
        console.log('Deleting applicant:', userId, 'for career:', careerId);
    };

    return (
        <Container fluid>
            <Title mb={20} ta={'center'} c={theme.colors.customColor[4]}>
                Requisition
            </Title>

            {/* Create Job Form */}
            <form>
                <Stack w={'50%'}>
                    <TextInput placeholder={'Job Title'} size={'lg'} radius={10} />
                    <Textarea rows={5} resize='vertical' placeholder={'Description'} size={'lg'} radius={10} />
                    <TextInput placeholder={'Location'} size={'lg'} radius={10} />
                    <NumberInput placeholder={'Salary'} size={'lg'} radius={10} />
                    <FileInput placeholder={'Select Image'} size={'lg'} radius={10} />
                    <Group>
                        <Button type='submit' bg={theme.colors.customColor[2]}>
                            Create Career
                        </Button>
                    </Group>
                </Stack>
            </form>
            <Divider my={40} />

            {/* Careers Accordion */}
            <Title mb={20} ta={'center'} c={theme.colors.customColor[4]}>
                Careers
            </Title>
            <Accordion
                variant='separated'
                radius={10}
                chevronPosition={'left'}
                mb={100}
                chevronSize={'xl'}
                value={accordionOpened}
                onChange={handleAccordionChange}
            >
                {dummyCareers.map((career) => (
                    <Accordion.Item key={career.id} value={career.id.toString()}>
                        <Accordion.Control>
                            <Group>
                                {career.title}
                                {accordionOpened === career.id.toString() &&
                                    (showJobDelete ? (
                                        <Group>
                                            <Button onClick={(e) => handleDeleteClick(e, career.id)}>Delete Job</Button>
                                            <Button onClick={handleCancelClick}>Cancel</Button>
                                        </Group>
                                    ) : (
                                        <IconTrash color={'red'} onClick={handleIconClick} style={{ marginLeft: 20 }} />
                                    ))}
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Grid>
                                {career.Applicants.map((user, index) => (
                                    <Grid.Col key={index} mb={25} span={2}>
                                        <Stack gap={0}>
                                            <Text>
                                                {user.firstName} {user.lastName}
                                            </Text>
                                            <Text>{user.email}</Text>
                                            <Text>{user.phone}</Text>
                                            <Anchor onClick={() => handleDownloadResume(user)}>Download Resume</Anchor>
                                            <Anchor c={'red'} onClick={() => handleDeleteApplicant(user.id, career.id)}>
                                                Delete Applicant
                                            </Anchor>
                                        </Stack>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>

            {/* Recruitment Agency Inquiries Accordion */}
            <Title mb={20} ta={'center'} c={theme.colors.customColor[4]}>
                Recruitment Agency Inquiries
            </Title>
            <Accordion
                variant='separated'
                radius={10}
                chevronPosition={'left'}
                mb={100}
                chevronSize={'xl'}
                value={consultationAccordion}
                onChange={handleConsultationAccordionChange}
            >
                {dummyConsultations.map((consultation) => (
                    <Accordion.Item key={consultation.id} value={consultation.id.toString()}>
                        <Accordion.Control>
                            <Group>
                                Company: {consultation.companyName}
                                {consultationAccordion === consultation.id.toString() &&
                                    (showConsultationDelete ? (
                                        <Group>
                                            <Button onClick={(e) => handleDeleteRequestClick(e, consultation.id)}>Delete Request</Button>
                                            <Button onClick={handleCancelRequestClick}>Cancel</Button>
                                        </Group>
                                    ) : (
                                        <IconTrash color={'red'} onClick={handleRequestIconClick} style={{ marginLeft: 20 }} />
                                    ))}
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Text>Requested Date/Time: {consultation.dateTime}</Text>
                            <Text>Contact: {consultation.name}</Text>
                            <Text>Title: {consultation.title}</Text>
                            <Text>Phone: {consultation.phone}</Text>
                            <Text>Email: {consultation.email}</Text>
                            <Text>Location: {consultation.location}</Text>
                            <Text>Number of Positions: {consultation.numOfPositions}</Text>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Container>
    );
};

export { Requisition };
