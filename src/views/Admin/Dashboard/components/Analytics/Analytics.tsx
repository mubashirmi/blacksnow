// import useAnalytics from '@/views/Admin/Dashboard/components/Analytics/useAnalytics';
// import { LineChart } from '@mantine/charts';
// import { Accordion, Container, Group, Stack, Title } from '@mantine/core';

// type Props = {
//     props: any;
// };

// const Analytics = ({ props }: Props) => {
//     const {
//         totalRSVPCount,
//         totalRSVPEarnings,
//         totalNewsletter,
//         newsLetterEarnings,
//         monthlyBillboardCount,
//         totalSalesTeamCount,
//         totalSalesTeamEarnings,
//         totalEarnings,
//         totalAffiliateCount,
//         totalAffiliateEarnings,
//         transformedUsers,
//     } = useAnalytics(props);

//     return (
//         <Container fluid>
//             <Accordion variant='separated' radius={10} chevronPosition={'left'} mb={100} chevronSize={'xl'}>
//                 <Accordion.Item key={'rsvp'} value={'rsvp'}>
//                     <Accordion.Control>RSVP</Accordion.Control>
//                     <Accordion.Panel>
//                         <Group>
//                             <Stack w={'45%'}>
//                                 <Title ml={50} mt='xl' mb='xs'>
//                                     Total RSVP Count
//                                 </Title>
//                                 <LineChart h={300} data={totalRSVPCount} dataKey='date' series={transformedUsers} curveType='linear' />
//                             </Stack>
//                             <Stack w={'45%'}>
//                                 <Title ml={50} mt='xl' mb='xs'>
//                                     Total RSVP Earnings
//                                 </Title>
//                                 <LineChart h={300} data={totalRSVPEarnings} dataKey='date' series={transformedUsers} curveType='linear' />
//                             </Stack>
//                         </Group>
//                     </Accordion.Panel>
//                 </Accordion.Item>

//                 <Accordion.Item key={'newsletter'} value={'newsletter'}>
//                     <Accordion.Control>Newsletter</Accordion.Control>
//                     <Accordion.Panel>
//                         <Group>
//                             <Stack w={'45%'}>
//                                 <Title ml={50} mt='xl' mb='xs'>
//                                     Total Newsletter Count
//                                 </Title>
//                                 <LineChart h={300} data={totalNewsletter} dataKey='date' series={transformedUsers} curveType='linear' />
//                             </Stack>
//                             <Stack w={'45%'}>
//                                 <Title ml={50} mt='xl' mb='xs'>
//                                     Total Newsletter Earnings
//                                 </Title>
//                                 <LineChart h={300} data={newsLetterEarnings} dataKey='date' series={transformedUsers} curveType='linear' />
//                             </Stack>
//                         </Group>
//                     </Accordion.Panel>
//                 </Accordion.Item>

//                 <Accordion.Item key={'billboard'} value={'billboard'}>
//                     <Accordion.Control>Billboard</Accordion.Control>
//                     <Accordion.Panel>
//                         <Title ml={50} mt='xl' mb='xs'>
//                             Billboard Count
//                         </Title>
//                         <LineChart h={300} data={monthlyBillboardCount} dataKey='date' series={transformedUsers} curveType='linear' />
//                     </Accordion.Panel>
//                 </Accordion.Item>

//                 <Accordion.Item key={'affiliate'} value={'affiliate'}>
//                     <Accordion.Control>Affiliate</Accordion.Control>
//                     <Accordion.Panel>
//                         <Group>
//                             <Stack w={'45%'}>
//                                 <Title ml={50} mt='xl' mb='xs'>
//                                     Total Affiliate Count
//                                 </Title>
//                                 <LineChart h={300} data={totalAffiliateCount} dataKey='date' series={transformedUsers} curveType='linear' />
//                             </Stack>
//                             <Stack w={'45%'}>
//                                 <Title ml={50} mt='xl' mb='xs'>
//                                     Total Affiliate Earnings
//                                 </Title>
//                                 <LineChart h={300} data={totalAffiliateEarnings} dataKey='date' series={transformedUsers} curveType='linear' />
//                             </Stack>
//                         </Group>
//                     </Accordion.Panel>
//                 </Accordion.Item>

//                 <Accordion.Item key={'sales'} value={'sales'}>
//                     <Accordion.Control>Sales</Accordion.Control>
//                     <Accordion.Panel>
//                         <Group>
//                             <Stack w={'45%'}>
//                                 <Title ml={50} mt='xl' mb='xs'>
//                                     Total Sales Count
//                                 </Title>
//                                 <LineChart h={300} data={totalSalesTeamCount} dataKey='date' series={transformedUsers} curveType='linear' />
//                             </Stack>
//                             <Stack w={'45%'}>
//                                 <Title ml={50} mt='xl' mb='xs'>
//                                     Total Sales Earnings
//                                 </Title>
//                                 <LineChart h={300} data={totalSalesTeamEarnings} dataKey='date' series={transformedUsers} curveType='linear' />
//                             </Stack>
//                         </Group>
//                     </Accordion.Panel>
//                 </Accordion.Item>

//                 <Accordion.Item key={'totals'} value={'totals'}>
//                     <Accordion.Control>Totals</Accordion.Control>
//                     <Accordion.Panel>
//                         <Title ml={50} mt='xl' mb='xs'>
//                             Total Earnings
//                         </Title>
//                         <LineChart h={300} data={totalEarnings} dataKey='date' series={transformedUsers} curveType='linear' />
//                     </Accordion.Panel>
//                 </Accordion.Item>
//             </Accordion>
//         </Container>
//     );
// };

// export { Analytics };
import { LineChart } from '@mantine/charts';
import { Accordion, Container, Group, Stack, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

const Analytics = () => {
    const [isClient, setIsClient] = useState(false);

    // Dummy data
    const dummyData = {
        totalRSVPCount: [
            { date: '2023-01-01', value: 50 },
            { date: '2023-02-01', value: 60 },
            { date: '2023-03-01', value: 70 },
        ],
        totalRSVPEarnings: [
            { date: '2023-01-01', value: 500 },
            { date: '2023-02-01', value: 600 },
            { date: '2023-03-01', value: 700 },
        ],
        totalNewsletter: [
            { date: '2023-01-01', value: 30 },
            { date: '2023-02-01', value: 40 },
            { date: '2023-03-01', value: 50 },
        ],
        newsLetterEarnings: [
            { date: '2023-01-01', value: 300 },
            { date: '2023-02-01', value: 400 },
            { date: '2023-03-01', value: 500 },
        ],
        monthlyBillboardCount: [
            { date: '2023-01-01', value: 10 },
            { date: '2023-02-01', value: 15 },
            { date: '2023-03-01', value: 20 },
        ],
        totalSalesTeamCount: [
            { date: '2023-01-01', value: 100 },
            { date: '2023-02-01', value: 110 },
            { date: '2023-03-01', value: 120 },
        ],
        totalSalesTeamEarnings: [
            { date: '2023-01-01', value: 1000 },
            { date: '2023-02-01', value: 1200 },
            { date: '2023-03-01', value: 1300 },
        ],
        totalEarnings: [
            { date: '2023-01-01', value: 3000 },
            { date: '2023-02-01', value: 3500 },
            { date: '2023-03-01', value: 4000 },
        ],
        totalAffiliateCount: [
            { date: '2023-01-01', value: 20 },
            { date: '2023-02-01', value: 25 },
            { date: '2023-03-01', value: 30 },
        ],
        totalAffiliateEarnings: [
            { date: '2023-01-01', value: 200 },
            { date: '2023-02-01', value: 250 },
            { date: '2023-03-01', value: 300 },
        ],
        transformedUsers: [
            { date: '2023-01-01', value: 500 },
            { date: '2023-02-01', value: 550 },
            { date: '2023-03-01', value: 600 },
        ],
    };

    // Create the series data with 'name' and 'color' properties
    const series = [
        {
            name: 'RSVP Count',
            color: '#4c6ef5',
            data: dummyData.totalRSVPCount.map((item) => ({ ...item, name: 'RSVP Count' })),
        },
        {
            name: 'RSVP Earnings',
            color: '#f03e3e',
            data: dummyData.totalRSVPEarnings.map((item) => ({ ...item, name: 'RSVP Earnings' })),
        },
        {
            name: 'Newsletter Count',
            color: '#40c057',
            data: dummyData.totalNewsletter.map((item) => ({ ...item, name: 'Newsletter Count' })),
        },
        {
            name: 'Newsletter Earnings',
            color: '#7950f2',
            data: dummyData.newsLetterEarnings.map((item) => ({ ...item, name: 'Newsletter Earnings' })),
        },
        {
            name: 'Billboard Count',
            color: '#fd7e14',
            data: dummyData.monthlyBillboardCount.map((item) => ({ ...item, name: 'Billboard Count' })),
        },
        {
            name: 'Sales Team Count',
            color: '#82c91e',
            data: dummyData.totalSalesTeamCount.map((item) => ({ ...item, name: 'Sales Team Count' })),
        },
        {
            name: 'Sales Team Earnings',
            color: '#ff6347',
            data: dummyData.totalSalesTeamEarnings.map((item) => ({ ...item, name: 'Sales Team Earnings' })),
        },
        {
            name: 'Total Earnings',
            color: '#228be6',
            data: dummyData.totalEarnings.map((item) => ({ ...item, name: 'Total Earnings' })),
        },
        {
            name: 'Affiliate Count',
            color: '#12b886',
            data: dummyData.totalAffiliateCount.map((item) => ({ ...item, name: 'Affiliate Count' })),
        },
        {
            name: 'Affiliate Earnings',
            color: '#fab005',
            data: dummyData.totalAffiliateEarnings.map((item) => ({ ...item, name: 'Affiliate Earnings' })),
        },
    ];

    // Only run the chart rendering on the client-side
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null; // Return nothing until client-side rendering
    }

    return (
        <Container fluid>
            <Accordion variant='separated' radius={10} chevronPosition='left' mb={100} chevronSize='xl'>
                {/* RSVP Section */}
                <Accordion.Item key='rsvp' value='rsvp'>
                    <Accordion.Control>RSVP</Accordion.Control>
                    <Accordion.Panel>
                        <Group>
                            <Stack w={'45%'}>
                                <Title ml={50} mt='xl' mb='xs'>
                                    Total RSVP Count
                                </Title>
                                <LineChart h={300} data={dummyData.totalRSVPCount} dataKey='date' series={series[0].data} curveType='linear' />
                            </Stack>
                            <Stack w={'45%'}>
                                <Title ml={50} mt='xl' mb='xs'>
                                    Total RSVP Earnings
                                </Title>
                                <LineChart h={300} data={dummyData.totalRSVPEarnings} dataKey='date' series={series[1].data} curveType='linear' />
                            </Stack>
                        </Group>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Newsletter Section */}
                <Accordion.Item key='newsletter' value='newsletter'>
                    <Accordion.Control>Newsletter</Accordion.Control>
                    <Accordion.Panel>
                        <Group>
                            <Stack w={'45%'}>
                                <Title ml={50} mt='xl' mb='xs'>
                                    Total Newsletter Count
                                </Title>
                                <LineChart h={300} data={dummyData.totalNewsletter} dataKey='date' series={series[2].data} curveType='linear' />
                            </Stack>
                            <Stack w={'45%'}>
                                <Title ml={50} mt='xl' mb='xs'>
                                    Total Newsletter Earnings
                                </Title>
                                <LineChart h={300} data={dummyData.newsLetterEarnings} dataKey='date' series={series[3].data} curveType='linear' />
                            </Stack>
                        </Group>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Billboard Section */}
                <Accordion.Item key='billboard' value='billboard'>
                    <Accordion.Control>Billboard</Accordion.Control>
                    <Accordion.Panel>
                        <Title ml={50} mt='xl' mb='xs'>
                            Billboard Count
                        </Title>
                        <LineChart h={300} data={dummyData.monthlyBillboardCount} dataKey='date' series={series[4].data} curveType='linear' />
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Affiliate Section */}
                <Accordion.Item key='affiliate' value='affiliate'>
                    <Accordion.Control>Affiliate</Accordion.Control>
                    <Accordion.Panel>
                        <Group>
                            <Stack w={'45%'}>
                                <Title ml={50} mt='xl' mb='xs'>
                                    Total Affiliate Count
                                </Title>
                                <LineChart h={300} data={dummyData.totalAffiliateCount} dataKey='date' series={series[8].data} curveType='linear' />
                            </Stack>
                            <Stack w={'45%'}>
                                <Title ml={50} mt='xl' mb='xs'>
                                    Total Affiliate Earnings
                                </Title>
                                <LineChart h={300} data={dummyData.totalAffiliateEarnings} dataKey='date' series={series[9].data} curveType='linear' />
                            </Stack>
                        </Group>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Sales Section */}
                <Accordion.Item key='sales' value='sales'>
                    <Accordion.Control>Sales</Accordion.Control>
                    <Accordion.Panel>
                        <Group>
                            <Stack w={'45%'}>
                                <Title ml={50} mt='xl' mb='xs'>
                                    Total Sales Count
                                </Title>
                                <LineChart h={300} data={dummyData.totalSalesTeamCount} dataKey='date' series={series[5].data} curveType='linear' />
                            </Stack>
                            <Stack w={'45%'}>
                                <Title ml={50} mt='xl' mb='xs'>
                                    Total Sales Earnings
                                </Title>
                                <LineChart h={300} data={dummyData.totalSalesTeamEarnings} dataKey='date' series={series[6].data} curveType='linear' />
                            </Stack>
                        </Group>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Totals Section */}
                <Accordion.Item key='totals' value='totals'>
                    <Accordion.Control>Totals</Accordion.Control>
                    <Accordion.Panel>
                        <Title ml={50} mt='xl' mb='xs'>
                            Total Earnings
                        </Title>
                        <LineChart h={300} data={dummyData.totalEarnings} dataKey='date' series={series[7].data} curveType='linear' />
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
};

export { Analytics };
