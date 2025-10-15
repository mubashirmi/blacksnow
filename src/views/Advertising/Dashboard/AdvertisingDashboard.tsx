// import { Clock } from '@/components';
// import { ADVERTISER, GENERATE_IMAGE_URL } from '@/constants/apiRoutes';
// import useRest from '@/lib/hooks/useRest';
// import { Button, Container, Divider, Group, Image, Stack, Tabs, Text, TextInput, Title, rem, useMantineTheme } from '@mantine/core';
// import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
// import { useForm } from '@mantine/form';
// import { notifications } from '@mantine/notifications';
// import { IconLink, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
// import { signOut } from 'aws-amplify/auth';
// import { useRouter } from 'next/router';

// type Advertiser = {
//     id: number;
//     website: string;
//     podcast: string;
//     twitter: string;
//     youtube: string;
//     facebook: string;
//     companyName: string;
//     companyBlurb: string;
//     businessImage: string;
// };

// type Props = {
//     advertiser: Advertiser;
// };

// const AdvertisingDashboard = ({ advertiser }: Props) => {
//     const { restPut, restPost } = useRest();
//     const theme = useMantineTheme();
//     const router = useRouter();

//     const initialValues = {
//         website: advertiser.website || '',
//         twitter: advertiser.twitter || '',
//         youtube: advertiser.youtube || '',
//         facebook: advertiser.facebook || '',
//         companyName: advertiser.companyName || '',
//         companyBlur: advertiser.companyBlurb || '',
//         businessImage: advertiser.businessImage || '',
//     };

//     const form = useForm({ initialValues });
//     const { getInputProps, onSubmit } = form;
//     const iconStyle = { width: rem(25), height: rem(25) };
//     const handleLogout = async () => {
//         await signOut();
//         router.reload();
//     };

//     const handleSaveLinks = async (values) => {
//         const { status } = await restPut(`${ADVERTISER}/${advertiser.id}`, values, true);
//         if (status === 200) {
//             notifications.show({ title: 'Info Updated', message: 'Your information was updated.' });
//         } else {
//             notifications.show({ title: 'Error', color: 'red', message: 'There was an error updating your links.' });
//         }
//     };

//     const handleUploadImage = async (file) => {
//         const { name, type } = file[0];
//         try {
//             const objectKey = `public/companyLogos/${Date.now()}-${name}`;

//             const presignedUrlResponse = await restPost(GENERATE_IMAGE_URL, { type, objectKey }, true);

//             if (presignedUrlResponse.status !== 200) {
//                 notifications.show({
//                     title: 'Error',
//                     message: 'Failed to get upload URL',
//                     color: 'red',
//                 });
//                 return;
//             }

//             const { url, key } = await presignedUrlResponse.data;

//             const uploadResponse = await fetch(url, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': type,
//                 },
//                 body: file[0],
//             });

//             if (uploadResponse.status !== 200) {
//                 notifications.show({
//                     title: 'Error',
//                     message: 'Failed to upload image',
//                     color: 'red',
//                 });
//                 return;
//             }

//             const headerImageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;

//             form.setValues({
//                 businessImage: headerImageUrl,
//             });
//         } catch (e) {
//             notifications.show({ title: 'Error', color: 'red', message: 'Error uploading file' });
//         }
//     };

//     const handleFileRejected = () => {
//         notifications.show({ title: 'File upload', message: 'File Upload failed, please try again.', color: 'red' });
//     };

//     return (
//         <Container fluid pb={50}>
//             <TextInput placeholder={'Your Name here'} w={200} />
//             <Clock />
//             <Title order={2} fz={45} ta={'center'} my={25}>
//                 Advertising Dashboard Page
//             </Title>
//             <Divider mb={30} />
//             <Tabs defaultValue='links' variant='pills' radius={0} orientation='vertical' color={theme.colors.customColor[2]}>
//                 <Tabs.List>
//                     <Tabs.Tab value={'links'} leftSection={<IconLink style={iconStyle} />} mb={10}>
//                         Links
//                     </Tabs.Tab>
//                     <Button
//                         onClick={handleLogout}
//                         bg={theme.colors.customColor[2]}
//                         style={{
//                             background: theme.colors.customColor[2],
//                             height: '34px',
//                             borderRadius: '5px',
//                             color: 'white',
//                         }}
//                     >
//                         Logout
//                     </Button>
//                 </Tabs.List>
//                 <Divider orientation='vertical' mx={20} />
//                 <Tabs.Panel value={'links'} ml={20} mih={650}>
//                     <Title mb={10}>Digital Billboard</Title>
//                     <form onSubmit={onSubmit(handleSaveLinks)}>
//                         <Stack>
//                             <TextInput {...getInputProps('website')} label={'Website'} size={'lg'} radius={10} />
//                             <TextInput {...getInputProps('twitter')} label={'Twitter/X'} size={'lg'} radius={10} />
//                             <TextInput {...getInputProps('youtube')} label={'Youtube'} size={'lg'} radius={10} />
//                             <TextInput {...getInputProps('facebook')} label={'Facebook'} size={'lg'} radius={10} />
//                             <TextInput {...getInputProps('linkedIn')} label={'LinkedIn'} size={'lg'} radius={10} />
//                             <TextInput {...getInputProps('instagram')} label={'Instagram'} size={'lg'} radius={10} />
//                             <TextInput {...getInputProps('companyName')} label={'Company Name'} size={'lg'} radius={10} />
//                             {(advertiser?.businessImage || form.values.businessImage) && (
//                                 <Image src={form.values.businessImage || advertiser.businessImage} alt={'Business Image'} h={300} w={300} fit={'contain'} />
//                             )}
//                             <Dropzone
//                                 onReject={handleFileRejected}
//                                 onDrop={(file) => handleUploadImage(file)}
//                                 maxSize={25 * 1024 ** 2}
//                                 accept={IMAGE_MIME_TYPE}
//                                 maxFiles={1}
//                             >
//                                 <Group justify='center' gap='xl' mih={220} style={{ pointerEvents: 'none' }}>
//                                     <Dropzone.Accept>
//                                         <IconUpload size={52} color='var(--mantine-color-blue-6)' stroke={1.5} />
//                                     </Dropzone.Accept>
//                                     <Dropzone.Reject>
//                                         <IconX size={52} color='var(--mantine-color-red-6)' stroke={1.5} />
//                                     </Dropzone.Reject>
//                                     <Dropzone.Idle>
//                                         <IconPhoto size={52} color='var(--mantine-color-dimmed)' stroke={1.5} />
//                                     </Dropzone.Idle>

//                                     <div>
//                                         <Text size='xl' inline>
//                                             Drag images here or click to select a file
//                                         </Text>
//                                         <Text size='sm' c='dimmed' inline mt={7}>
//                                             Attach an image, the image should not exceed 25mb
//                                         </Text>
//                                     </div>
//                                 </Group>
//                             </Dropzone>
//                             <Button type={'submit'} w={200} bg={theme.colors.customColor[2]}>
//                                 Save Links
//                             </Button>
//                         </Stack>
//                     </form>
//                 </Tabs.Panel>
//             </Tabs>
//         </Container>
//     );
// };

// export { AdvertisingDashboard };

import { Clock } from '@/components';
import { ADVERTISER, GENERATE_IMAGE_URL } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { Button, Container, Divider, Group, Image, Stack, Tabs, Text, TextInput, Title, rem, useMantineTheme } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconLink, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/router';

type Advertiser = {
    id: number;
    website: string;
    podcast: string;
    twitter: string;
    youtube: string;
    facebook: string;
    companyName: string;
    companyBlurb: string;
    businessImage: string;
};

const AdvertisingDashboard = () => {
    const { restPut, restPost } = useRest();
    const theme = useMantineTheme();
    const router = useRouter();

    // Dummy data
    const dummyAdvertiser: Advertiser = {
        id: 1,
        website: 'https://example.com',
        podcast: 'https://example.com/podcast',
        twitter: 'https://x.com/example',
        youtube: 'https://youtube.com/@example',
        facebook: 'https://facebook.com/example',
        companyName: 'Example Corp',
        companyBlurb: 'We provide excellent services.',
        businessImage: 'https://example.com/logo.png',
    };

    const initialValues = {
        website: dummyAdvertiser.website || '',
        twitter: dummyAdvertiser.twitter || '',
        youtube: dummyAdvertiser.youtube || '',
        facebook: dummyAdvertiser.facebook || '',
        companyName: dummyAdvertiser.companyName || '',
        companyBlurb: dummyAdvertiser.companyBlurb || '',
        businessImage: dummyAdvertiser.businessImage || '',
    };

    const form = useForm({ initialValues });
    const { getInputProps, onSubmit } = form;
    const iconStyle = { width: rem(25), height: rem(25) };

    const handleLogout = async () => {
        await signOut();
        router.reload();
    };

    const handleSaveLinks = async (values) => {
        const { status } = await restPut(`${ADVERTISER}/${dummyAdvertiser.id}`, values, true);
        if (status === 200) {
            notifications.show({ title: 'Info Updated', message: 'Your information was updated.' });
        } else {
            notifications.show({ title: 'Error', color: 'red', message: 'There was an error updating your links.' });
        }
    };

    const handleUploadImage = async (file) => {
        const { name, type } = file[0];
        try {
            const objectKey = `public/companyLogos/${Date.now()}-${name}`;
            const presignedUrlResponse = await restPost(GENERATE_IMAGE_URL, { type, objectKey }, true);

            if (presignedUrlResponse.status !== 200) {
                notifications.show({
                    title: 'Error',
                    message: 'Failed to get upload URL',
                    color: 'red',
                });
                return;
            }

            const { url, key } = await presignedUrlResponse.data;

            const uploadResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': type,
                },
                body: file[0],
            });

            if (uploadResponse.status !== 200) {
                notifications.show({
                    title: 'Error',
                    message: 'Failed to upload image',
                    color: 'red',
                });
                return;
            }

            const headerImageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;

            form.setValues({
                businessImage: headerImageUrl,
            });
        } catch (e) {
            notifications.show({ title: 'Error', color: 'red', message: 'Error uploading file' });
        }
    };

    const handleFileRejected = () => {
        notifications.show({ title: 'File upload', message: 'File Upload failed, please try again.', color: 'red' });
    };

    return (
        <Container fluid pb={50}>
            <TextInput placeholder={'Your Name here'} w={200} />
            <Clock />
            <Title order={2} fz={45} ta={'center'} my={25}>
                Advertising Dashboard Page
            </Title>
            <Divider mb={30} />
            <Tabs defaultValue='links' variant='pills' radius={0} orientation='vertical' color={theme.colors.customColor[2]}>
                <Tabs.List>
                    <Tabs.Tab value={'links'} leftSection={<IconLink style={iconStyle} />} mb={10}>
                        Links
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
                <Tabs.Panel value={'links'} ml={20} mih={650}>
                    <Title mb={10}>Digital Billboard</Title>
                    <form onSubmit={onSubmit(handleSaveLinks)}>
                        <Stack>
                            <TextInput {...getInputProps('website')} label={'Website'} size={'lg'} radius={10} />
                            <TextInput {...getInputProps('twitter')} label={'Twitter/X'} size={'lg'} radius={10} />
                            <TextInput {...getInputProps('youtube')} label={'Youtube'} size={'lg'} radius={10} />
                            <TextInput {...getInputProps('facebook')} label={'Facebook'} size={'lg'} radius={10} />
                            <TextInput {...getInputProps('linkedIn')} label={'LinkedIn'} size={'lg'} radius={10} />
                            <TextInput {...getInputProps('instagram')} label={'Instagram'} size={'lg'} radius={10} />
                            <TextInput {...getInputProps('companyName')} label={'Company Name'} size={'lg'} radius={10} />
                            {(dummyAdvertiser?.businessImage || form.values.businessImage) && (
                                <Image
                                    src={form.values.businessImage || dummyAdvertiser.businessImage}
                                    alt={'Business Image'}
                                    h={300}
                                    w={300}
                                    fit={'contain'}
                                />
                            )}
                            <Dropzone
                                onReject={handleFileRejected}
                                onDrop={(file) => handleUploadImage(file)}
                                maxSize={25 * 1024 ** 2}
                                accept={IMAGE_MIME_TYPE}
                                maxFiles={1}
                            >
                                <Group justify='center' gap='xl' mih={220} style={{ pointerEvents: 'none' }}>
                                    <Dropzone.Accept>
                                        <IconUpload size={52} color='var(--mantine-color-blue-6)' stroke={1.5} />
                                    </Dropzone.Accept>
                                    <Dropzone.Reject>
                                        <IconX size={52} color='var(--mantine-color-red-6)' stroke={1.5} />
                                    </Dropzone.Reject>
                                    <Dropzone.Idle>
                                        <IconPhoto size={52} color='var(--mantine-color-dimmed)' stroke={1.5} />
                                    </Dropzone.Idle>
                                    <div>
                                        <Text size='xl' inline>
                                            Drag images here or click to select a file
                                        </Text>
                                        <Text size='sm' c='dimmed' inline mt={7}>
                                            Attach an image, the image should not exceed 25mb
                                        </Text>
                                    </div>
                                </Group>
                            </Dropzone>
                            <Button type={'submit'} w={200} bg={theme.colors.customColor[2]}>
                                Save Links
                            </Button>
                        </Stack>
                    </form>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
};

export { AdvertisingDashboard };
