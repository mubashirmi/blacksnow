// // // import { Clock } from '@/components';
// // // import { Bulk, Campaign, Editor, KPI, Links } from '@/views/Affiliate/Dashboard/components';
// // // import { Button, Container, Divider, Tabs, TextInput, Title, rem, useMantineTheme } from '@mantine/core';
// // // import { IconAffiliate, IconGraph, IconLink, IconMail, IconPencil } from '@tabler/icons-react';
// // // import { signOut } from 'aws-amplify/auth';
// // // import { useRouter } from 'next/router';

// // // const AffiliateDashboard = (props) => {
// // //     const theme = useMantineTheme();
// // //     const router = useRouter();
// // //     const iconStyle = { width: rem(25), height: rem(25) };
// // //     const handleLogout = async () => {
// // //         await signOut();
// // //         router.reload();
// // //     };

// // //     return (
// // //         <Container fluid pb={50}>
// // //             <TextInput placeholder={'Your Name here'} w={200} />
// // //             <Clock />
// // //             <Title order={2} fz={45} ta={'center'} my={25}>
// // //                 Affiliate Dashboard Page
// // //             </Title>
// // //             <Divider mb={30} />
// // //             <Tabs defaultValue='links' variant='pills' radius={0} orientation='vertical' color={theme.colors.customColor[2]}>
// // //                 <Tabs.List>
// // //                     <Tabs.Tab value={'links'} leftSection={<IconLink style={iconStyle} />} mb={10}>
// // //                         Links
// // //                     </Tabs.Tab>
// // //                     <Tabs.Tab value={'editor'} leftSection={<IconPencil style={iconStyle} />} mb={10}>
// // //                         Editor
// // //                     </Tabs.Tab>
// // //                     <Tabs.Tab value={'bulk'} leftSection={<IconMail style={iconStyle} />} mb={10}>
// // //                         Bulk
// // //                     </Tabs.Tab>
// // //                     <Tabs.Tab value={'campaign'} leftSection={<IconAffiliate style={iconStyle} />} mb={10}>
// // //                         Campaign
// // //                     </Tabs.Tab>
// // //                     <Tabs.Tab value={'kpi'} leftSection={<IconGraph style={iconStyle} />} mb={10}>
// // //                         KPI
// // //                     </Tabs.Tab>
// // //                     <Button
// // //                         onClick={handleLogout}
// // //                         bg={theme.colors.customColor[2]}
// // //                         style={{
// // //                             background: theme.colors.customColor[2],
// // //                             height: '34px',
// // //                             borderRadius: '5px',
// // //                             color: 'white',
// // //                         }}
// // //                     >
// // //                         Logout
// // //                     </Button>
// // //                 </Tabs.List>
// // //                 <Divider orientation='vertical' mx={20} />
// // //                 <Tabs.Panel value={'links'} ml={20} mih={650}>
// // //                     <Links props={props} />
// // //                 </Tabs.Panel>
// // //                 <Tabs.Panel value={'editor'} ml={20} mih={650}>
// // //                     <Editor props={props} />
// // //                 </Tabs.Panel>
// // //                 <Tabs.Panel value={'bulk'} ml={20} mih={650}>
// // //                     <Bulk props={props} />
// // //                 </Tabs.Panel>
// // //                 <Tabs.Panel value={'campaign'} ml={20} mih={650}>
// // //                     <Campaign props={props} />
// // //                 </Tabs.Panel>
// // //                 <Tabs.Panel value={'kpi'} ml={20} mih={650}>
// // //                     <KPI props={props} />
// // //                 </Tabs.Panel>
// // //             </Tabs>
// // //         </Container>
// // //     );
// // // };

// // // export { AffiliateDashboard };
// // import { Clock } from '@/components';
// // import { Button, Container, Divider, Tabs, TextInput, Title, rem, useMantineTheme } from '@mantine/core';
// // import { IconAffiliate, IconGraph, IconLink, IconMail, IconPencil } from '@tabler/icons-react';
// // import { signOut } from 'aws-amplify/auth';
// // import { useRouter } from 'next/router';

// // // Mock sub-components with dummy data rendering
// // const Links = ({ links }) => (
// //   <div>
// //     <Title order={3}>Affiliate Links</Title>
// //     {links.map((link) => (
// //       <div key={link.id} style={{ margin: '10px 0' }}>
// //         <p><strong>Name:</strong> {link.name}</p>
// //         <p><strong>URL:</strong> <a href={link.url}>{link.url}</a></p>
// //         <p><strong>Status:</strong> {link.status}</p>
// //       </div>
// //     ))}
// //   </div>
// // );

// // const Editor = ({ content }) => (
// //   <div>
// //     <Title order={3}>Content Editor</Title>
// //     <p><strong>Title:</strong> {content.title}</p>
// //     <p><strong>Body:</strong> {content.body}</p>
// //   </div>
// // );

// // const Bulk = ({ emails }) => (
// //   <div>
// //     <Title order={3}>Bulk Email Campaigns</Title>
// //     {emails.map((email) => (
// //       <div key={email.id} style={{ margin: '10px 0' }}>
// //         <p><strong>Subject:</strong> {email.subject}</p>
// //         <p><strong>Recipients:</strong> {email.recipients}</p>
// //         <p><strong>Status:</strong> {email.status}</p>
// //       </div>
// //     ))}
// //   </div>
// // );

// // const Campaign = ({ campaigns }) => (
// //   <div>
// //     <Title order={3}>Campaigns</Title>
// //     {campaigns.map((campaign) => (
// //       <div key={campaign.id} style={{ margin: '10px 0' }}>
// //         <p><strong>Name:</strong> {campaign.name}</p>
// //         <p><strong>Start Date:</strong> {campaign.startDate}</p>
// //         <p><strong>Clicks:</strong> {campaign.clicks}</p>
// //       </div>
// //     ))}
// //   </div>
// // );

// // const KPI = ({ kpis }) => (
// //   <div>
// //     <Title order={3}>Key Performance Indicators</Title>
// //     {kpis.map((kpi) => (
// //       <div key={kpi.id} style={{ margin: '10px 0' }}>
// //         <p><strong>Metric:</strong> {kpi.metric}</p>
// //         <p><strong>Value:</strong> {kpi.value}</p>
// //         <p><strong>Period:</strong> {kpi.period}</p>
// //       </div>
// //     ))}
// //   </div>
// // );

// // const AffiliateDashboard = () => {
// //   const theme = useMantineTheme();
// //   const router = useRouter();
// //   const iconStyle = { width: rem(25), height: rem(25) };

// //   // Dummy data for each sub-component
// //   const dummyLinks = [
// //     { id: 1, name: 'Product A', url: 'https://example.com/aff/product-a', status: 'Active' },
// //     { id: 2, name: 'Product B', url: 'https://example.com/aff/product-b', status: 'Pending' },
// //     { id: 3, name: 'Product C', url: 'https://example.com/aff/product-c', status: 'Expired' },
// //   ];

// //   const dummyEditorContent = {
// //     title: 'Sample Campaign Content',
// //     body: 'This is a sample content for the affiliate campaign editor.',
// //   };

// //   const dummyEmails = [
// //     { id: 1, subject: 'Summer Sale Promo', recipients: 1000, status: 'Sent' },
// //     { id: 2, subject: 'New Product Launch', recipients: 500, status: 'Draft' },
// //   ];

// //   const dummyCampaigns = [
// //     { id: 1, name: 'Summer Campaign', startDate: '2025-06-01', clicks: 150 },
// //     { id: 2, name: 'Winter Promo', startDate: '2025-12-01', clicks: 300 },
// //   ];

// //   const dummyKpis = [
// //     { id: 1, metric: 'Conversion Rate', value: '2.5%', period: 'June 2025' },
// //     { id: 2, metric: 'Total Revenue', value: '$5,000', period: 'June 2025' },
// //     { id: 3, metric: 'Click-Through Rate', value: '10%', period: 'June 2025' },
// //   ];

// //   const handleLogout = async () => {
// //     await signOut();
// //     router.reload();
// //   };

// //   return (
// //     <Container fluid pb={50}>
// //       <TextInput placeholder={'Your Name here'} w={200} />
// //       <Clock />
// //       <Title order={2} fz={45} ta={'center'} my={25}>
// //         Affiliate Dashboard Page
// //       </Title>
// //       <Divider mb={30} />
// //       <Tabs defaultValue="links" variant="pills" radius={0} orientation="vertical" color={theme.colors.customColor[2]}>
// //         <Tabs.List>
// //           <Tabs.Tab value="links" leftSection={<IconLink style={iconStyle} />} mb={10}>
// //             Links
// //           </Tabs.Tab>
// //           <Tabs.Tab value="editor" leftSection={<IconPencil style={iconStyle} />} mb={10}>
// //             Editor
// //           </Tabs.Tab>
// //           <Tabs.Tab value="bulk" leftSection={<IconMail style={iconStyle} />} mb={10}>
// //             Bulk
// //           </Tabs.Tab>
// //           <Tabs.Tab value="campaign" leftSection={<IconAffiliate style={iconStyle} />} mb={10}>
// //             Campaign
// //           </Tabs.Tab>
// //           <Tabs.Tab value="kpi" leftSection={<IconGraph style={iconStyle} />} mb={10}>
// //             KPI
// //           </Tabs.Tab>
// //           <Button
// //             onClick={handleLogout}
// //             bg={theme.colors.customColor[2]}
// //             style={{
// //               background: theme.colors.customColor[2],
// //               height: '34px',
// //               borderRadius: '5px',
// //               color: 'white',
// //             }}
// //           >
// //             Logout
// //           </Button>
// //         </Tabs.List>
// //         <Divider orientation="vertical" mx={20} />
// //         <Tabs.Panel value="links" ml={20} mih={650}>
// //           <Links links={dummyLinks} />
// //         </Tabs.Panel>
// //         <Tabs.Panel value="editor" ml={20} mih={650}>
// //           <Editor content={dummyEditorContent} />
// //         </Tabs.Panel>
// //         <Tabs.Panel value="bulk" ml={20} mih={650}>
// //           <Bulk emails={dummyEmails} />
// //         </Tabs.Panel>
// //         <Tabs.Panel value="campaign" ml={20} mih={650}>
// //           <Campaign campaigns={dummyCampaigns} />
// //         </Tabs.Panel>
// //         <Tabs.Panel value="kpi" ml={20} mih={650}>
// //           <KPI kpis={dummyKpis} />
// //         </Tabs.Panel>
// //       </Tabs>
// //     </Container>
// //   );
// // };

// // export { AffiliateDashboard };

// import { Clock } from '@/components';
// import { Button, Container, Divider, Tabs, TextInput, Title, rem, useMantineTheme } from '@mantine/core';
// import { IconAffiliate, IconGraph, IconLink, IconMail, IconPencil } from '@tabler/icons-react';
// import { signOut } from 'aws-amplify/auth';
// import { useRouter } from 'next/router';
// import React from 'react';

// // Define interfaces for sub-component props
// interface Link {
//   id: number;
//   name: string;
//   url: string;
//   status: string;
// }

// interface EditorContent {
//   title: string;
//   body: string;
// }

// interface Email {
//   id: number;
//   subject: string;
//   recipients: number;
//   status: string;
// }

// interface Campaign {
//   id: number;
//   name: string;
//   startDate: string;
//   clicks: number;
// }

// interface Kpi {
//   id: number;
//   metric: string;
//   value: string;
//   period: string;
// }

// interface LinksProps {
//   links: Link[];
// }

// interface EditorProps {
//   content: EditorContent;
// }

// interface BulkProps {
//   emails: Email[];
// }

// interface CampaignProps {
//   campaigns: Campaign[];
// }

// interface KpiProps {
//   kpis: Kpi[];
// }

// // Mock sub-components with dummy data rendering
// const Links: React.FC<LinksProps> = ({ links }) => (
//   <div>
//     <Title order={3}>Affiliate Links</Title>
//     {links.map((link) => (
//       <div key={link.id} style={{ margin: '10px 0' }}>
//         <p><strong>Name:</strong> {link.name}</p>
//         <p><strong>URL:</strong> <a href={link.url}>{link.url}</a></p>
//         <p><strong>Status:</strong> {link.status}</p>
//       </div>
//     ))}
//   </div>
// );

// const Editor: React.FC<EditorProps> = ({ content }) => (
//   <div>
//     <Title order={3}>Content Editor</Title>
//     <p><strong>Title:</strong> {content.title}</p>
//     <p><strong>Body:</strong> {content.body}</p>
//   </div>
// );

// const Bulk: React.FC<BulkProps> = ({ emails }) => (
//   <div>
//     <Title order={3}>Bulk Email Campaigns</Title>
//     {emails.map((email) => (
//       <div key={email.id} style={{ margin: '10px 0' }}>
//         <p><strong>Subject:</strong> {email.subject}</p>
//         <p><strong>Recipients:</strong> {email.recipients}</p>
//         <p><strong>Status:</strong> {email.status}</p>
//       </div>
//     ))}
//   </div>
// );

// const Campaign: React.FC<CampaignProps> = ({ campaigns }) => (
//   <div>
//     <Title order={3}>Campaigns</Title>
//     {campaigns.map((campaign) => (
//       <div key={campaign.id} style={{ margin: '10px 0' }}>
//         <p><strong>Name:</strong> {campaign.name}</p>
//         <p><strong>Start Date:</strong> {campaign.startDate}</p>
//         <p><strong>Clicks:</strong> {campaign.clicks}</p>
//       </div>
//     ))}
//   </div>
// );

// const Kpi: React.FC<KpiProps> = ({ kpis }) => (
//   <div>
//     <Title order={3}>Key Performance Indicators</Title>
//     {kpis.map((kpi) => (
//       <div key={kpi.id} style={{ margin: '10px 0' }}>
//         <p><strong>Metric:</strong> {kpi.metric}</p>
//         <p><strong>Value:</strong> {kpi.value}</p>
//         <p><strong>Period:</strong> {kpi.period}</p>
//       </div>
//     ))}
//   </div>
// );

// const AffiliateDashboard = () => {
//   const theme = useMantineTheme();
//   const router = useRouter();
//   const iconStyle = { width: rem(25), height: rem(25) };

//   // Dummy data for each sub-component
//   const dummyLinks: Link[] = [
//     { id: 1, name: 'Product A', url: 'https://example.com/aff/product-a', status: 'Active' },
//     { id: 2, name: 'Product B', url: 'https://example.com/aff/product-b', status: 'Pending' },
//     { id: 3, name: 'Product C', url: 'https://example.com/aff/product-c', status: 'Expired' },
//   ];

//   const dummyEditorContent: EditorContent = {
//     title: 'Sample Campaign Content',
//     body: 'This is a sample content for the affiliate campaign editor.',
//   };

//   const dummyEmails: Email[] = [
//     { id: 1, subject: 'Summer Sale Promo', recipients: 1000, status: 'Sent' },
//     { id: 2, subject: 'New Product Launch', recipients: 500, status: 'Draft' },
//   ];

//   const dummyCampaigns: Campaign[] = [
//     { id: 1, name: 'Summer Campaign', startDate: '2025-06-01', clicks: 150 },
//     { id: 2, name: 'Winter Promotion', startDate: '2025-12-01', clicks: 300 },
//   ];

//   const dummyKpis: Kpi[] = [
//     { id: 1, metric: 'Conversion Rate', value: '2.5%', period: 'June 2025' },
//     { id: 2, metric: 'Total Revenue', value: '$5,000', period: 'June 2025' },
//     { id: 3, metric: 'Click-Through Rate', value: '10%', period: 'June 2025' },
//   ];

//   const handleLogout = async () => {
//     await signOut();
//     router.reload();
//   };

//   return (
//     <Container fluid pb={50}>
//       <TextInput placeholder={'Your Name here'} w={200} />
//       <Clock />
//       <Title order={2} fz={45} ta={'center'} my={25}>
//         Affiliate Dashboard Page
//       </Title>
//       <Divider mb={30} />
//       <Tabs defaultValue="links" variant="pills" radius={0} orientation="vertical" color={theme.colors.customColor[2]}>
//         <Tabs.List>
//           <Tabs.Tab value="links" leftSection={<IconLink style={iconStyle} />} mb={10}>
//             Links
//           </Tabs.Tab>
//           <Tabs.Tab value="editor" leftSection={<IconPencil style={iconStyle} />} mb={10}>
//             Editor
//           </Tabs.Tab>
//           <Tabs.Tab value="bulk" leftSection={<IconMail style={iconStyle} />} mb={10}>
//             Bulk
//           </Tabs.Tab>
//           <Tabs.Tab value="campaign" leftSection={<IconAffiliate style={iconStyle} />} mb={10}>
//             Campaign
//           </Tabs.Tab>
//           <Tabs.Tab value="kpi" leftSection={<IconGraph style={iconStyle} />} mb={10}>
//             KPI
//           </Tabs.Tab>
//           <Button
//             onClick={handleLogout}
//             bg={theme.colors.customColor[2]}
//             style={{
//               background: theme.colors.customColor[2],
//               height: '34px',
//               borderRadius: '5px',
//               color: 'white',
//             }}
//           >
//             Logout
//           </Button>
//         </Tabs.List>
//         <Divider orientation="vertical" mx={20} />
//         <Tabs.Panel value="links" ml={20} mih={650}>
//           <Links links={dummyLinks} />
//         </Tabs.Panel>
//         <Tabs.Panel value="editor" ml={20} mih={650}>
//           <Editor content={dummyEditorContent} />
//         </Tabs.Panel>
//         <Tabs.Panel value="bulk" ml={20} mih={650}>
//           <Bulk emails={dummyEmails} />
//         </Tabs.Panel>
//         <Tabs.Panel value="campaign" ml={20} mih={650}>
//           <Campaign campaigns={dummyCampaigns} />
//         </Tabs.Panel>
//         <Tabs.Panel value="kpi" ml={20} mih={650}>
//           <Kpi kpis={dummyKpis} />
//         </Tabs.Panel>
//       </Tabs>
//     </Container>
//   );
// };

// export { AffiliateDashboard };

import { Button, Container, Divider, Tabs, TextInput, Title, rem, useMantineTheme } from '@mantine/core';
import { IconAffiliate, IconGraph, IconLink, IconMail, IconPencil } from '@tabler/icons-react';
import { signOut } from 'aws-amplify/auth';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React from 'react';

// Dynamically import Clock with SSR disabled
const Clock = dynamic(() => import('@/components').then((mod) => mod.Clock), { ssr: false });

// Define interfaces for sub-component props
interface Link {
    id: number;
    name: string;
    url: string;
    status: string;
}

interface EditorContent {
    title: string;
    body: string;
}

interface Email {
    id: number;
    subject: string;
    recipients: number;
    status: string;
}

// interface Campaign {
//     id: number;
//     name: string;
//     startDate: string;
//     clicks: number;
// }

// interface Kpi {
//     id: number;
//     metric: string;
//     value: string;
//     period: string;
// }

interface LinksProps {
    links: Link[];
}

interface EditorProps {
    content: EditorContent;
}

interface BulkProps {
    emails: Email[];
}

// interface CampaignProps {
//     campaigns: Campaign[];
// }

// interface KpiProps {
//     kpis: Kpi[];
// }

// Mock sub-components with dummy data rendering
const Links: React.FC<LinksProps> = ({ links }) => (
    <div>
        <Title order={3}>Affiliate Links</Title>
        {links.map((link) => (
            <div key={link.id} style={{ margin: '10px 0' }}>
                <p>
                    <strong>Name:</strong> {link.name}
                </p>
                <p>
                    <strong>URL:</strong> <a href={link.url}>{link.url}</a>
                </p>
                <p>
                    <strong>Status:</strong> {link.status}
                </p>
            </div>
        ))}
    </div>
);

const Editor: React.FC<EditorProps> = ({ content }) => (
    <div>
        <Title order={3}>Content Editor</Title>
        <p>
            <strong>Title:</strong> {content.title}
        </p>
        <p>
            <strong>Body:</strong> {content.body}
        </p>
    </div>
);

const Bulk: React.FC<BulkProps> = ({ emails }) => (
    <div>
        <Title order={3}>Bulk Email Campaigns</Title>
        {emails.map((email) => (
            <div key={email.id} style={{ margin: '10px 0' }}>
                <p>
                    <strong>Subject:</strong> {email.subject}
                </p>
                <p>
                    <strong>Recipients:</strong> {email.recipients}
                </p>
                <p>
                    <strong>Status:</strong> {email.status}
                </p>
            </div>
        ))}
    </div>
);

// const AffiliateCampaign: React.FC<CampaignProps> = ({ campaigns }) => (
//     <div>
//         <Title order={3}>Campaigns</Title>
//         {campaigns.map((campaign) => (
//             <div key={campaign.id} style={{ margin: '10px 0' }}>
//                 <p>
//                     <strong>Name:</strong> {campaign.name}
//                 </p>
//                 <p>
//                     <strong>Start Date:</strong> {campaign.startDate}
//                 </p>
//                 <p>
//                     <strong>Clicks:</strong> {campaign.clicks}
//                 </p>
//             </div>
//         ))}
//     </div>
// );

// const AffiliateKpi: React.FC<KpiProps> = ({ kpis }) => (
//     <div>
//         <Title order={3}>Key Performance Indicators</Title>
//         {kpis.map((kpi) => (
//             <div key={kpi.id} style={{ margin: '10px 0' }}>
//                 <p>
//                     <strong>Metric:</strong> {kpi.metric}
//                 </p>
//                 <p>
//                     <strong>Value:</strong> {kpi.value}
//                 </p>
//                 <p>
//                     <strong>Period:</strong> {kpi.period}
//                 </p>
//             </div>
//         ))}
//     </div>
// );

const AffiliateDashboard = () => {
    const theme = useMantineTheme();
    const router = useRouter();
    const iconStyle = { width: rem(25), height: rem(25) };

    // Dummy data for each sub-component
    const dummyLinks: Link[] = [
        { id: 1, name: 'Product A', url: 'https://example.com/aff/product-a', status: 'Active' },
        { id: 2, name: 'Product B', url: 'https://example.com/aff/product-b', status: 'Pending' },
        { id: 3, name: 'Product C', url: 'https://example.com/aff/product-c', status: 'Expired' },
    ];

    const dummyEditorContent: EditorContent = {
        title: 'Sample Campaign Content',
        body: 'This is a sample content for the affiliate campaign editor.',
    };

    const dummyEmails: Email[] = [
        { id: 1, subject: 'Summer Sale Promo', recipients: 1000, status: 'Sent' },
        { id: 2, subject: 'New Product Launch', recipients: 500, status: 'Draft' },
    ];

    // const dummyCampaigns: Campaign[] = [
    //     { id: 1, name: 'Summer Campaign', startDate: '2025-06-01', clicks: 150 },
    //     { id: 2, name: 'Winter Promotion', startDate: '2025-12-01', clicks: 300 },
    // ];

    // const dummyKpis: Kpi[] = [
    //     { id: 1, metric: 'Conversion Rate', value: '2.5%', period: 'June 2025' },
    //     { id: 2, metric: 'Total Revenue', value: '$5,000', period: 'June 2025' },
    //     { id: 3, metric: 'Click-Through Rate', value: '10%', period: 'June 2025' },
    // ];

    const handleLogout = async () => {
        await signOut();
        router.reload();
    };

    return (
        <Container fluid pb={50}>
            <TextInput placeholder={'Your Name here'} w={200} />
            <Clock />
            <Title order={2} fz={45} ta={'center'} my={25}>
                Affiliate Dashboard Page
            </Title>
            <Divider mb={30} />
            <Tabs defaultValue='links' variant='pills' radius={0} orientation='vertical' color={theme.colors.customColor[2]}>
                <Tabs.List>
                    <Tabs.Tab value='links' leftSection={<IconLink style={iconStyle} />} mb={10}>
                        Links
                    </Tabs.Tab>
                    <Tabs.Tab value='editor' leftSection={<IconPencil style={iconStyle} />} mb={10}>
                        Editor
                    </Tabs.Tab>
                    <Tabs.Tab value='bulk' leftSection={<IconMail style={iconStyle} />} mb={10}>
                        Bulk
                    </Tabs.Tab>
                    <Tabs.Tab value='campaign' leftSection={<IconAffiliate style={iconStyle} />} mb={10}>
                        Campaign
                    </Tabs.Tab>
                    <Tabs.Tab value='kpi' leftSection={<IconGraph style={iconStyle} />} mb={10}>
                        KPI
                    </Tabs.Tab>
                    <Button
                        onClick={handleLogout}
                        bg={theme.colors.customColor[2]}
                        style={{
                            background: theme.colors.customColor[2],
                            height: '34px',
                            borderRadius: '5px',
                            color: 'white',
                        }}
                    >
                        Logout
                    </Button>
                </Tabs.List>
                <Divider orientation='vertical' mx={20} />
                <Tabs.Panel value='links' ml={20} mih={650}>
                    <Links links={dummyLinks} />
                </Tabs.Panel>
                <Tabs.Panel value='editor' ml={20} mih={650}>
                    <Editor content={dummyEditorContent} />
                </Tabs.Panel>
                <Tabs.Panel value='bulk' ml={20} mih={650}>
                    <Bulk emails={dummyEmails} />
                </Tabs.Panel>
                {/* <Tabs.Panel value='campaign' ml={20} mih={650}>
                    <Campaign campaigns={dummyCampaigns} />
                </Tabs.Panel>
                <Tabs.Panel value='kpi' ml={20} mih={650}>
                    <Kpi kpis={dummyKpis} />
                </Tabs.Panel> */}
            </Tabs>
        </Container>
    );
};

export { AffiliateDashboard };
