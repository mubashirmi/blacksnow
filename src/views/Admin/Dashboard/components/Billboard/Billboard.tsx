// import { ADVERTISER } from '@/constants/apiRoutes';
// import useRest from '@/lib/hooks/useRest';
// import { Accordion, Button, Container, Grid, Group, Image, Text, Title } from '@mantine/core';
// import { useState } from 'react';

// type User = {
//     id: number;
//     email: string;
//     firstName: string;
//     lastName: string;
// };

// type Advertisers = {
//     id: number;
//     approved: boolean;
//     website: string;
//     podcast: string;
//     twitter: string;
//     youtube: string;
//     facebook: string;
//     companyName: string;
//     companyBlurb: string;
//     businessImage: string;
//     User: User;
// };

// type Props = {
//     props: {
//         advertisers: Advertisers[];
//     };
// };

// const Billboard = ({ props }: Props) => {
//     const { restPost } = useRest();
//     const { advertisers } = props;
//     const [awaitingAdvertisers, setAwaitingAdvertisers] = useState(
//         advertisers?.filter((advertiser) => advertiser.approved === null || advertiser.approved === undefined)
//     );
//     const [approvedAdvertisers, setApprovedAdvertisers] = useState(advertisers?.filter((advertiser) => advertiser.approved === true));
//     const [deniedAdvertisers, setDeniedAdvertisers] = useState(advertisers?.filter((advertiser) => advertiser.approved === false));

//     const handleApproveAdvertiser = async (id) => {
//         const response = await restPost(`${ADVERTISER}/${id}`, { approved: true }, true);
//         if (response.status === 200) {
//             const updatedAdvertiser = response.data.data;
//             setDeniedAdvertisers((prevAdvertisers) => prevAdvertisers.filter((advertiser) => advertiser.id !== updatedAdvertiser.id));
//             setAwaitingAdvertisers((prevAdvertisers) => prevAdvertisers.filter((advertiser) => advertiser.id !== updatedAdvertiser.id));
//             setApprovedAdvertisers((prevAdvertisers) => [...prevAdvertisers, updatedAdvertiser]);
//         }
//     };

//     const handleDenyAdvertiser = async (id) => {
//         const response = await restPost(`${ADVERTISER}/${id}`, { approved: false }, true);
//         if (response.status === 200) {
//             const updatedAdvertiser = response.data.data;
//             setApprovedAdvertisers((prevAdvertisers) => prevAdvertisers.filter((advertiser) => advertiser.id !== updatedAdvertiser.id));
//             setAwaitingAdvertisers((prevAdvertisers) => prevAdvertisers.filter((advertiser) => advertiser.id !== updatedAdvertiser.id));
//             setDeniedAdvertisers((prevAdvertisers) => [...prevAdvertisers, updatedAdvertiser]);
//         }
//     };

//     return (
//         <Container fluid>
//             <Title mb={20} ta={'center'}>
//                 Billboard
//             </Title>
//             <Title order={3}>Awaiting</Title>
//             <Accordion variant='separated' radius={10} chevronPosition={'left'} mb={100} chevronSize={'xl'}>
//                 {awaitingAdvertisers && awaitingAdvertisers.length > 0 ? (
//                     awaitingAdvertisers.map((advertiser) => (
//                         <Accordion.Item key={`awaiting${advertiser.id.toString()}`} value={advertiser.id.toString()}>
//                             <Accordion.Control>
//                                 {advertiser.User.firstName} {advertiser.User.lastName}
//                             </Accordion.Control>
//                             <Accordion.Panel>
//                                 <Grid>
//                                     <Grid.Col span={5}>
//                                         <Text mb={10}>Website: {advertiser.website} </Text>
//                                         <Text mb={10}>Podcast: {advertiser.podcast}</Text>
//                                         <Text mb={10}>Twitter/X: {advertiser.twitter}</Text>
//                                         <Text mb={10}>Youtube: {advertiser.youtube}</Text>
//                                         <Text mb={10}>Facebook: {advertiser.facebook}</Text>
//                                         <Group>
//                                             <Button mb={20} bg={'red'} onClick={() => handleDenyAdvertiser(advertiser.id)}>
//                                                 Deny
//                                             </Button>
//                                             <Button mb={20} bg={'green'} onClick={() => handleApproveAdvertiser(advertiser.id)}>
//                                                 Approve
//                                             </Button>
//                                         </Group>
//                                     </Grid.Col>
//                                     <Grid.Col span={6} offset={1}>
//                                         <Image src={advertiser.businessImage} alt={'Business Image'} height={300} fit={'contain'} />
//                                         <Text>Company Name: {advertiser.companyName}</Text>
//                                         <Text>Description: {advertiser.companyBlurb}</Text>
//                                     </Grid.Col>
//                                 </Grid>
//                             </Accordion.Panel>
//                         </Accordion.Item>
//                     ))
//                 ) : (
//                     <Text>No one awaiting</Text>
//                 )}
//             </Accordion>
//             <Title order={3}>Approved</Title>
//             <Accordion variant='separated' radius={10} chevronPosition={'left'} mb={100} chevronSize={'xl'}>
//                 {approvedAdvertisers && approvedAdvertisers.length > 0 ? (
//                     approvedAdvertisers.map((advertiser) => (
//                         <Accordion.Item key={`approved${advertiser.id.toString()}`} value={advertiser.id.toString()}>
//                             <Accordion.Control>
//                                 {advertiser.User.firstName} {advertiser.User.lastName}
//                             </Accordion.Control>
//                             <Accordion.Panel>
//                                 <Grid>
//                                     <Grid.Col span={5}>
//                                         <Text mb={10}>Website: {advertiser.website} </Text>
//                                         <Text mb={10}>Podcast: {advertiser.podcast}</Text>
//                                         <Text mb={10}>Twitter/X: {advertiser.twitter}</Text>
//                                         <Text mb={10}>Youtube: {advertiser.youtube}</Text>
//                                         <Text mb={10}>Facebook: {advertiser.facebook}</Text>
//                                         <Group>
//                                             <Button mb={20} bg={'red'} onClick={() => handleDenyAdvertiser(advertiser.id)}>
//                                                 Deny
//                                             </Button>
//                                         </Group>
//                                     </Grid.Col>
//                                     <Grid.Col span={6} offset={1}>
//                                         <Image src={advertiser.businessImage} alt={'Business Image'} height={300} width={300} fit={'contain'} />
//                                         <Text>Company Name: {advertiser.companyName}</Text>
//                                         <Text>Description: {advertiser.companyBlurb}</Text>
//                                     </Grid.Col>
//                                 </Grid>
//                             </Accordion.Panel>
//                         </Accordion.Item>
//                     ))
//                 ) : (
//                     <Text>No one approved</Text>
//                 )}
//             </Accordion>
//             <Title order={3}>Denied</Title>
//             <Accordion variant='separated' radius={10} chevronPosition={'left'} mb={100} chevronSize={'xl'}>
//                 {deniedAdvertisers && deniedAdvertisers.length > 0 ? (
//                     deniedAdvertisers.map((advertiser) => (
//                         <Accordion.Item key={`denied${advertiser.id.toString()}`} value={advertiser.id.toString()}>
//                             <Accordion.Control>
//                                 {advertiser.User.firstName} {advertiser.User.lastName}
//                             </Accordion.Control>
//                             <Accordion.Panel>
//                                 <Grid>
//                                     <Grid.Col span={5}>
//                                         <Text mb={10}>Website: {advertiser.website} </Text>
//                                         <Text mb={10}>Podcast: {advertiser.podcast}</Text>
//                                         <Text mb={10}>Twitter/X: {advertiser.twitter}</Text>
//                                         <Text mb={10}>Youtube: {advertiser.youtube}</Text>
//                                         <Text mb={10}>Facebook: {advertiser.facebook}</Text>
//                                         <Group>
//                                             <Button mb={20} bg={'green'} onClick={() => handleApproveAdvertiser(advertiser.id)}>
//                                                 Approve
//                                             </Button>
//                                         </Group>
//                                     </Grid.Col>
//                                     <Grid.Col span={6} offset={1}>
//                                         <Image src={advertiser.businessImage} alt={'Business Image'} height={300} width={300} fit={'contain'} />
//                                         <Text>Company Name: {advertiser.companyName}</Text>
//                                         <Text>Description: {advertiser.companyBlurb}</Text>
//                                     </Grid.Col>
//                                 </Grid>
//                             </Accordion.Panel>
//                         </Accordion.Item>
//                     ))
//                 ) : (
//                     <Text>No one awaiting</Text>
//                 )}
//             </Accordion>
//         </Container>
//     );
// };

// export { Billboard };

import { Accordion, Button, Container, Grid, Group, Image, Text, Title } from '@mantine/core';
import { useState } from 'react';

type User = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
};

type Advertisers = {
    id: number;
    approved: boolean | null;
    website: string;
    podcast: string;
    twitter: string;
    youtube: string;
    facebook: string;
    companyName: string;
    companyBlurb: string;
    businessImage: string;
    User: User;
};

const Billboard = () => {
    // Dummy Data for Advertisers
    const dummyData: Advertisers[] = [
        {
            id: 1,
            approved: null,
            website: 'https://affiliateA.com',
            podcast: 'Affiliate A Podcast',
            twitter: 'https://twitter.com/affiliateA',
            youtube: 'https://youtube.com/affiliateA',
            facebook: 'https://facebook.com/affiliateA',
            companyName: 'Affiliate A Co.',
            companyBlurb: 'This is a short description of Affiliate A.',
            businessImage: 'https://via.placeholder.com/150',
            User: { id: 1, email: 'affiliateA@example.com', firstName: 'John', lastName: 'Doe' },
        },
        {
            id: 2,
            approved: null,
            website: 'https://affiliateB.com',
            podcast: 'Affiliate B Podcast',
            twitter: 'https://twitter.com/affiliateB',
            youtube: 'https://youtube.com/affiliateB',
            facebook: 'https://facebook.com/affiliateB',
            companyName: 'Affiliate B Co.',
            companyBlurb: 'This is a short description of Affiliate B.',
            businessImage: 'https://via.placeholder.com/150',
            User: { id: 2, email: 'affiliateB@example.com', firstName: 'Jane', lastName: 'Smith' },
        },
        {
            id: 3,
            approved: true,
            website: 'https://affiliateC.com',
            podcast: 'Affiliate C Podcast',
            twitter: 'https://twitter.com/affiliateC',
            youtube: 'https://youtube.com/affiliateC',
            facebook: 'https://facebook.com/affiliateC',
            companyName: 'Affiliate C Co.',
            companyBlurb: 'This is a short description of Affiliate C.',
            businessImage: 'https://via.placeholder.com/150',
            User: { id: 3, email: 'affiliateC@example.com', firstName: 'Mark', lastName: 'Johnson' },
        },
        {
            id: 4,
            approved: false,
            website: 'https://affiliateD.com',
            podcast: 'Affiliate D Podcast',
            twitter: 'https://twitter.com/affiliateD',
            youtube: 'https://youtube.com/affiliateD',
            facebook: 'https://facebook.com/affiliateD',
            companyName: 'Affiliate D Co.',
            companyBlurb: 'This is a short description of Affiliate D.',
            businessImage: 'https://via.placeholder.com/150',
            User: { id: 4, email: 'affiliateD@example.com', firstName: 'Alice', lastName: 'Brown' },
        },
    ];

    // State for different categories of advertisers
    const [awaitingAdvertisers, setAwaitingAdvertisers] = useState(dummyData.filter((advertiser) => advertiser.approved === null));
    const [approvedAdvertisers, setApprovedAdvertisers] = useState(dummyData.filter((advertiser) => advertiser.approved === true));
    const [deniedAdvertisers, setDeniedAdvertisers] = useState(dummyData.filter((advertiser) => advertiser.approved === false));

    const handleApproveAdvertiser = (id: number) => {
        const updatedAdvertiser = dummyData.find((advertiser) => advertiser.id === id);
        if (updatedAdvertiser) {
            setDeniedAdvertisers(deniedAdvertisers.filter((advertiser) => advertiser.id !== id));
            setAwaitingAdvertisers(awaitingAdvertisers.filter((advertiser) => advertiser.id !== id));
            setApprovedAdvertisers([...approvedAdvertisers, updatedAdvertiser]);
        }
    };

    const handleDenyAdvertiser = (id: number) => {
        const updatedAdvertiser = dummyData.find((advertiser) => advertiser.id === id);
        if (updatedAdvertiser) {
            setApprovedAdvertisers(approvedAdvertisers.filter((advertiser) => advertiser.id !== id));
            setAwaitingAdvertisers(awaitingAdvertisers.filter((advertiser) => advertiser.id !== id));
            setDeniedAdvertisers([...deniedAdvertisers, updatedAdvertiser]);
        }
    };

    return (
        <Container fluid>
            <Title mb={20} ta={'center'}>
                Billboard
            </Title>

            {/* Awaiting Section */}
            <Title order={3}>Awaiting</Title>
            <Accordion variant='separated' radius={10} chevronPosition='left' mb={100} chevronSize='xl'>
                {awaitingAdvertisers && awaitingAdvertisers.length > 0 ? (
                    awaitingAdvertisers.map((advertiser) => (
                        <Accordion.Item key={advertiser.id.toString()} value={advertiser.id.toString()}>
                            <Accordion.Control>
                                {advertiser.User.firstName} {advertiser.User.lastName}
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Grid>
                                    <Grid.Col span={5}>
                                        <Text mb={10}>Website: {advertiser.website}</Text>
                                        <Text mb={10}>Podcast: {advertiser.podcast}</Text>
                                        <Text mb={10}>Twitter: {advertiser.twitter}</Text>
                                        <Text mb={10}>Youtube: {advertiser.youtube}</Text>
                                        <Text mb={10}>Facebook: {advertiser.facebook}</Text>
                                        <Group>
                                            <Button mb={20} bg='red' onClick={() => handleDenyAdvertiser(advertiser.id)}>
                                                Deny
                                            </Button>
                                            <Button mb={20} bg='green' onClick={() => handleApproveAdvertiser(advertiser.id)}>
                                                Approve
                                            </Button>
                                        </Group>
                                    </Grid.Col>
                                    <Grid.Col span={6} offset={1}>
                                        <Image src={advertiser.businessImage} alt='Business Image' height={300} fit='contain' />
                                        <Text>Company Name: {advertiser.companyName}</Text>
                                        <Text>Description: {advertiser.companyBlurb}</Text>
                                    </Grid.Col>
                                </Grid>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))
                ) : (
                    <Text>No one awaiting</Text>
                )}
            </Accordion>

            {/* Approved Section */}
            <Title order={3}>Approved</Title>
            <Accordion variant='separated' radius={10} chevronPosition='left' mb={100} chevronSize='xl'>
                {approvedAdvertisers && approvedAdvertisers.length > 0 ? (
                    approvedAdvertisers.map((advertiser) => (
                        <Accordion.Item key={advertiser.id.toString()} value={advertiser.id.toString()}>
                            <Accordion.Control>
                                {advertiser.User.firstName} {advertiser.User.lastName}
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Grid>
                                    <Grid.Col span={5}>
                                        <Text mb={10}>Website: {advertiser.website}</Text>
                                        <Text mb={10}>Podcast: {advertiser.podcast}</Text>
                                        <Text mb={10}>Twitter: {advertiser.twitter}</Text>
                                        <Text mb={10}>Youtube: {advertiser.youtube}</Text>
                                        <Text mb={10}>Facebook: {advertiser.facebook}</Text>
                                        <Group>
                                            <Button mb={20} bg='red' onClick={() => handleDenyAdvertiser(advertiser.id)}>
                                                Deny
                                            </Button>
                                        </Group>
                                    </Grid.Col>
                                    <Grid.Col span={6} offset={1}>
                                        <Image src={advertiser.businessImage} alt='Business Image' height={300} fit='contain' />
                                        <Text>Company Name: {advertiser.companyName}</Text>
                                        <Text>Description: {advertiser.companyBlurb}</Text>
                                    </Grid.Col>
                                </Grid>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))
                ) : (
                    <Text>No one approved</Text>
                )}
            </Accordion>

            {/* Denied Section */}
            <Title order={3}>Denied</Title>
            <Accordion variant='separated' radius={10} chevronPosition='left' mb={100} chevronSize='xl'>
                {deniedAdvertisers && deniedAdvertisers.length > 0 ? (
                    deniedAdvertisers.map((advertiser) => (
                        <Accordion.Item key={advertiser.id.toString()} value={advertiser.id.toString()}>
                            <Accordion.Control>
                                {advertiser.User.firstName} {advertiser.User.lastName}
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Grid>
                                    <Grid.Col span={5}>
                                        <Text mb={10}>Website: {advertiser.website}</Text>
                                        <Text mb={10}>Podcast: {advertiser.podcast}</Text>
                                        <Text mb={10}>Twitter: {advertiser.twitter}</Text>
                                        <Text mb={10}>Youtube: {advertiser.youtube}</Text>
                                        <Text mb={10}>Facebook: {advertiser.facebook}</Text>
                                        <Group>
                                            <Button mb={20} bg='green' onClick={() => handleApproveAdvertiser(advertiser.id)}>
                                                Approve
                                            </Button>
                                        </Group>
                                    </Grid.Col>
                                    <Grid.Col span={6} offset={1}>
                                        <Image src={advertiser.businessImage} alt='Business Image' height={300} fit='contain' />
                                        <Text>Company Name: {advertiser.companyName}</Text>
                                        <Text>Description: {advertiser.companyBlurb}</Text>
                                    </Grid.Col>
                                </Grid>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))
                ) : (
                    <Text>No one denied</Text>
                )}
            </Accordion>
        </Container>
    );
};

export { Billboard };
