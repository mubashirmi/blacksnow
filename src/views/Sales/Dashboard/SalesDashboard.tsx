// import { Button, Container, Divider, Tabs, Title, rem, useMantineTheme } from '@mantine/core';
// import { IconAffiliate, IconGraph, IconLink, IconMail, IconPencil, IconUserScan } from '@tabler/icons-react';
// import { signOut } from 'aws-amplify/auth';
// import { useRouter } from 'next/router';
// import { Bulk, Campaign, Editor, KPI, Links } from './components';

// const SalesDashboard = (props) => {
//     const theme = useMantineTheme();
//     const router = useRouter();
//     const iconStyle = { width: rem(25), height: rem(25) };
//     const handleLogout = async () => {
//         await signOut();
//         router.reload();
//     };

//     return (
//         <Container fluid py={50}>
//             <Title order={2} fz={45} ta={'center'} my={25}>
//                 Sales Dashboard Page
//             </Title>
//             <Divider mb={30} />
//             <Tabs defaultValue='links' variant='pills' radius={0} orientation='vertical' color={theme.colors.customColor[2]}>
//                 <Tabs.List>
//                     <Tabs.Tab value={'links'} leftSection={<IconLink style={iconStyle} />} mb={10}>
//                         Links
//                     </Tabs.Tab>
//                     <Tabs.Tab value={'editor'} leftSection={<IconPencil style={iconStyle} />} mb={10}>
//                         Editor
//                     </Tabs.Tab>
//                     <Tabs.Tab value={'bulk'} leftSection={<IconMail style={iconStyle} />} mb={10}>
//                         Bulk
//                     </Tabs.Tab>
//                     <Tabs.Tab value={'campaign'} leftSection={<IconAffiliate style={iconStyle} />} mb={10}>
//                         Campaign
//                     </Tabs.Tab>
//                     <Tabs.Tab value={'kpi'} leftSection={<IconGraph style={iconStyle} />} mb={10}>
//                         KPI
//                     </Tabs.Tab>
//                     <Tabs.Tab value='profile' leftSection={<IconUserScan style={iconStyle} />} mb={10}>
//                         Profile
//                     </Tabs.Tab>
//                 </Tabs.List>
//                 <Divider orientation='vertical' mx={20} />
//                 <Tabs.Panel value={'links'} ml={20} mih={650}>
//                     <Links props={props} />
//                 </Tabs.Panel>
//                 <Tabs.Panel value={'editor'} ml={20} mih={650}>
//                     <Editor props={props} />
//                 </Tabs.Panel>
//                 <Tabs.Panel value={'bulk'} ml={20} mih={650}>
//                     <Bulk props={props} />
//                 </Tabs.Panel>
//                 <Tabs.Panel value={'campaign'} ml={20} mih={650}>
//                     <Campaign props={props} />
//                 </Tabs.Panel>
//                 <Tabs.Panel value={'kpi'} ml={20} mih={650}>
//                     <KPI props={props} />
//                 </Tabs.Panel>
//                 <Tabs.Panel value='profile' ml={20} mih={650}>
//                     <Button onClick={handleLogout} bg={theme.colors.customColor[2]}>
//                         Logout
//                     </Button>
//                 </Tabs.Panel>
//             </Tabs>
//         </Container>
//     );
// };

// export { SalesDashboard };

import { Button, Container, Divider, Tabs, Title, rem, useMantineTheme } from '@mantine/core';
import { IconAffiliate, IconGraph, IconLink, IconMail, IconPencil, IconUserScan } from '@tabler/icons-react';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { Bulk, Campaign, Editor, KPI, Links } from './components';

const SalesDashboard = () => {
    const theme = useMantineTheme();
    const router = useRouter();
    const iconStyle = { width: rem(25), height: rem(25) };
    const handleLogout = async () => {
        await signOut();
        router.reload();
    };

    const dummyProps = {
        links: [
            { id: '1', url: 'https://example.com/link1', title: 'Link 1', createdAt: '2025-06-01' },
            { id: '2', url: 'https://example.com/link2', title: 'Link 2', createdAt: '2025-06-02' },
        ],
        editor: {
            content: 'Sample editor content',
            settings: { theme: 'light', fontSize: 16 },
        },
        bulk: {
            emails: [
                { id: '1', address: 'user1@example.com', status: 'sent' },
                { id: '2', address: 'user2@example.com', status: 'pending' },
            ],
        },
        campaigns: [
            { id: '1', name: 'Campaign 1', status: 'Active', startDate: '2025-06-01' },
            { id: '2', name: 'Campaign 2', status: 'Paused', startDate: '2025-06-02' },
        ],
        kpi: {
            metrics: {
                clicks: 100,
                conversions: 10,
                revenue: 5000,
                impressions: 1000,
            },
        },
        user: { id: 'user1', email: 'user@example.com' },
    };

    return (
        <Container fluid py={50}>
            <Title order={2} fz={45} ta={'center'} my={25}>
                Sales Dashboard Page
            </Title>
            <Divider mb={30} />
            <Tabs defaultValue='links' variant='pills' radius={0} orientation='vertical' color={theme.colors.customColor[2]}>
                <Tabs.List>
                    <Tabs.Tab value={'links'} leftSection={<IconLink style={iconStyle} />} mb={10}>
                        Links
                    </Tabs.Tab>
                    <Tabs.Tab value={'editor'} leftSection={<IconPencil style={iconStyle} />} mb={10}>
                        Editor
                    </Tabs.Tab>
                    <Tabs.Tab value={'bulk'} leftSection={<IconMail style={iconStyle} />} mb={10}>
                        Bulk
                    </Tabs.Tab>
                    <Tabs.Tab value={'campaign'} leftSection={<IconAffiliate style={iconStyle} />} mb={10}>
                        Campaign
                    </Tabs.Tab>
                    <Tabs.Tab value={'kpi'} leftSection={<IconGraph style={iconStyle} />} mb={10}>
                        KPI
                    </Tabs.Tab>
                    <Tabs.Tab value='profile' leftSection={<IconUserScan style={iconStyle} />} mb={10}>
                        Profile
                    </Tabs.Tab>
                </Tabs.List>
                <Divider orientation='vertical' mx={20} />
                <Tabs.Panel value={'links'} ml={20} mih={650}>
                    <Links props={dummyProps} />
                </Tabs.Panel>
                <Tabs.Panel value={'editor'} ml={20} mih={650}>
                    <Editor props={dummyProps} />
                </Tabs.Panel>
                <Tabs.Panel value={'bulk'} ml={20} mih={650}>
                    <Bulk props={dummyProps} />
                </Tabs.Panel>
                <Tabs.Panel value={'campaign'} ml={20} mih={650}>
                    <Campaign props={dummyProps} />
                </Tabs.Panel>
                <Tabs.Panel value={'kpi'} ml={20} mih={650}>
                    <KPI props={dummyProps} />
                </Tabs.Panel>
                <Tabs.Panel value='profile' ml={20} mih={650}>
                    <Button onClick={handleLogout} bg={theme.colors.customColor[2]}>
                        Logout
                    </Button>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
};

export { SalesDashboard };
