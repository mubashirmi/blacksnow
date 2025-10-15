// import { ApplyModal } from '@/views/CareerDetails/components/ApplyModal';
// import useCareerDetails from '@/views/CareerDetails/useCareerDetails';
// import { StorageImage } from '@aws-amplify/ui-react-storage';
// import { Button, Center, Container, Stack, Text, Title, useMantineTheme } from '@mantine/core';

// const CareerDetails = (props: any) => {
//     const {
//         handleUploadImage,
//         getInputProps,
//         onSubmit,
//         handleApply,
//         showApplyModal,
//         showApplyModalHandlers,
//         description,
//         image,
//         location,
//         salary,
//         title,
//         values,
//         hasApplied,
//         formErrors,
//         firstNum,
//         secondNum,
//         regenerateCaptcha,
//     } = useCareerDetails(props);
//     const theme = useMantineTheme();
//     return (
//         <Container fluid pb={100} mih={'100vh'}>
//             <Container size={'xl'} mt={50}>
//                 <ApplyModal
//                     handleUploadImage={handleUploadImage}
//                     getInputProps={getInputProps}
//                     onSubmit={onSubmit}
//                     handleApply={handleApply}
//                     showApplyModal={showApplyModal}
//                     showApplyModalHandlers={showApplyModalHandlers}
//                     formErrors={formErrors}
//                     firstNum={firstNum}
//                     secondNum={secondNum}
//                     regenerateCaptcha={regenerateCaptcha}
//                 />
//                 {hasApplied ? (
//                     <>
//                         <Title ta={'center'} mt={200} mb={20} c={theme.colors.customColor[1]}>
//                             Confirmation
//                         </Title>
//                         <Center>
//                             <Stack>
//                                 <Text ta='center' fz={27} fw={600} c={theme.colors.customColor[1]}>
//                                     Your application has been received!
//                                 </Text>
//                                 <Text ta='center' fz={18} c={theme.colors.customColor[1]}>
//                                     Thank you {values.firstName} for your application. We will be in touch with you soon!
//                                 </Text>
//                             </Stack>
//                         </Center>
//                     </>
//                 ) : (
//                     <>
//                         <StorageImage alt='career-image' path={image} width={'50%'} />
//                         <Title mt={50} c={theme.colors.customColor[1]}>
//                             {title}
//                         </Title>
//                         <Text mt={20} c={theme.colors.customColor[1]}>
//                             {location}
//                         </Text>
//                         <Text mt={20} c={theme.colors.customColor[1]}>
//                             {salary}
//                         </Text>
//                         <Text mt={20} c={theme.colors.customColor[1]}>
//                             {description}
//                         </Text>
//                         <Button w={150} bg={theme.colors.customColor[2]} onClick={() => showApplyModalHandlers.setTrue()} mt={20}>
//                             Click to Apply
//                         </Button>
//                     </>
//                 )}
//             </Container>
//         </Container>
//     );
// };

// export { CareerDetails };

import { ApplyModal } from '@/views/CareerDetails/components/ApplyModal';
import useCareerDetails from '@/views/CareerDetails/useCareerDetails';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { Button, Center, Container, Stack, Text, Title, useMantineTheme } from '@mantine/core';

const CareerDetails = () => {
    const {
        handleUploadImage,
        getInputProps,
        onSubmit,
        handleApply,
        showApplyModal,
        showApplyModalHandlers,
        description,
        image,
        location,
        salary,
        title,
        values,
        hasApplied,
        formErrors,
        firstNum,
        secondNum,
        regenerateCaptcha,
    } = useCareerDetails({
        career: {
            id: '1',
            title: 'Senior Software Engineer',
            description:
                'Join our dynamic team to develop cutting-edge software solutions. You will be responsible for designing, coding, and maintaining high-quality applications.',
            location: 'San Francisco, CA',
            salary: '$120,000 - $150,000 per year',
            image: 'careers/senior-software-engineer.jpg',
        },
        values: { firstName: 'John' },
        hasApplied: false,
    });
    const theme = useMantineTheme();
    return (
        <Container fluid pb={100} mih={'100vh'}>
            <Container size={'xl'} mt={50}>
                <ApplyModal
                    handleUploadImage={handleUploadImage}
                    getInputProps={getInputProps}
                    onSubmit={onSubmit}
                    handleApply={handleApply}
                    showApplyModal={showApplyModal}
                    showApplyModalHandlers={showApplyModalHandlers}
                    formErrors={formErrors}
                    firstNum={firstNum}
                    secondNum={secondNum}
                    regenerateCaptcha={regenerateCaptcha}
                />
                {hasApplied ? (
                    <>
                        <Title ta={'center'} mt={200} mb={20} c={theme.colors.customColor[1]}>
                            Confirmation
                        </Title>
                        <Center>
                            <Stack>
                                <Text ta='center' fz={27} fw={600} c={theme.colors.customColor[1]}>
                                    Your application has been received!
                                </Text>
                                <Text ta='center' fz={18} c={theme.colors.customColor[1]}>
                                    Thank you {values.firstName} for your application. We will be in touch with you soon!
                                </Text>
                            </Stack>
                        </Center>
                    </>
                ) : (
                    <>
                        <StorageImage alt='career-image' path={image} width={'50%'} />
                        <Title mt={50} c={theme.colors.customColor[1]}>
                            {title}
                        </Title>
                        <Text mt={20} c={theme.colors.customColor[1]}>
                            {location}
                        </Text>
                        <Text mt={20} c={theme.colors.customColor[1]}>
                            {salary}
                        </Text>
                        <Text mt={20} c={theme.colors.customColor[1]}>
                            {description}
                        </Text>
                        <Button w={150} bg={theme.colors.customColor[2]} onClick={() => showApplyModalHandlers.setTrue()} mt={20}>
                            Click to Apply
                        </Button>
                    </>
                )}
            </Container>
        </Container>
    );
};

export { CareerDetails };
