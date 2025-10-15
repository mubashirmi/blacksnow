import { TermsAndConditionsLabel } from '@/components';
import { Icon } from '@aws-amplify/ui-react';
import { Button, Checkbox, FileInput, Group, Image, Modal, Stack, TextInput, Title, useMantineTheme } from '@mantine/core';

type props = {
    handleUploadImage: any;
    getInputProps: any;
    onSubmit: any;
    handleApply: any;
    showApplyModal: any;
    showApplyModalHandlers: any;
    formErrors: any;
    firstNum: number;
    secondNum: number;
    regenerateCaptcha: any;
};

const ApplyModal = ({
    handleUploadImage,
    getInputProps,
    onSubmit,
    handleApply,
    showApplyModal,
    showApplyModalHandlers,
    formErrors,
    firstNum,
    secondNum,
    regenerateCaptcha,
}: props) => {
    const theme = useMantineTheme();
    return (
        <Modal
            opened={showApplyModal}
            onClose={() => showApplyModalHandlers.setFalse()}
            withCloseButton={false}
            styles={{
                content: { borderRadius: '10px', boxShadow: '5px 5px 5px #2727277F', background: theme.colors.customColor[0] },
            }}
            centered
        >
            <Group c={'black'} p={10} justify={'center'} align={'start'} gap={0}>
                <Group mx={'auto'} pl={12}>
                    <Image src={'/logo_black.svg'} alt={'black ice logo'} w={40} />
                    <Title>Careers</Title>
                </Group>
                <Icon color={'black'} className={'click'} onClick={() => showApplyModalHandlers.setFalse()} />
            </Group>
            <form onSubmit={onSubmit(handleApply)}>
                <Stack gap={'none'} px={30} pb={30} pt={10}>
                    <TextInput
                        placeholder='First Name'
                        radius={10}
                        {...getInputProps('firstName')}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)', color: 'white' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                        error={formErrors.firstName}
                    />
                    <TextInput
                        placeholder='Last Name'
                        radius={10}
                        {...getInputProps('lastName')}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)', color: 'white' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                        error={formErrors.lastName}
                    />
                    <TextInput
                        type='email'
                        placeholder='Email'
                        radius={10}
                        {...getInputProps('email')}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)', color: 'white' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                        error={formErrors.email}
                    />
                    <TextInput
                        placeholder={'Phone Number'}
                        radius={10}
                        {...getInputProps('phone')}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)', color: 'white' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                        error={formErrors.phone}
                    />
                    <FileInput
                        placeholder={'Select Resume'}
                        radius={10}
                        accept='application/msword, text/plain, application/pdf'
                        onChange={handleUploadImage}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)', color: 'white' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                    />
                    <Group mt={10} w={'100%'} justify={'space-between'}>
                        <TextInput
                            placeholder={`What is ${firstNum} + ${secondNum}?`}
                            radius={10}
                            {...getInputProps('captchaAnswer')}
                            error={formErrors.captchaAnswer}
                            styles={{
                                root: { flexGrow: 1 },
                                input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)', color: 'white' },
                            }}
                            className={'whiteTextInput'}
                        />
                        <Button onClick={regenerateCaptcha} size='xs' bg={theme.colors.customColor[2]}>
                            Refresh
                        </Button>
                    </Group>
                    <Checkbox label={<TermsAndConditionsLabel />} {...getInputProps('termsAgreed')} />
                    <Button mt='md' radius='md' type={'submit'} bg={theme.colors.customColor[2]}>
                        Apply
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};

export { ApplyModal };
