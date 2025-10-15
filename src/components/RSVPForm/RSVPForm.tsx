import { TermsAndConditionsLabel } from '@/components';
import useRSVPForm from '@/components/RSVPForm/useRSVPForm';
import { Button, Checkbox, Flex, Group, Image, Modal, Select, Stack, Text, TextInput, Title, useMantineTheme } from '@mantine/core';

type Props = {
    showRSVPForm: any;
    handleCloseRSVPForm: any;
};

const RSVPForm = ({ showRSVPForm, handleCloseRSVPForm }: Props) => {
    const theme = useMantineTheme();
    const { getInputProps, onSubmit, calendarDropdownOptions, handleCreateEvent } = useRSVPForm();

    return (
        <Modal
            opened={showRSVPForm}
            onClose={handleCloseRSVPForm}
            withCloseButton={false}
            styles={{
                content: {
                    borderRadius: '10px',
                    boxShadow: '5px 5px 5px #2727277F',
                    background: theme.colors.customColor[0],
                },
            }}
            centered
        >
            <form onSubmit={onSubmit(handleCreateEvent)} style={{ width: '100%' }}>
                <Flex justify={'center'}>
                    <Stack px={40} py={20} maw={500}>
                        <Group mx={'auto'} pl={12}>
                            <Image src={'/logo_black.svg'} alt={'black ice logo'} w={40} />
                            <Title c={'black'}>RSVP</Title>
                        </Group>
                        <Text fz={16} c={'black'} ta={'center'}>
                            $500
                        </Text>
                        <TextInput
                            title={'First Name'}
                            placeholder={'First Name'}
                            styles={{
                                input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)' },
                            }}
                            className={'whiteTextInput'}
                            radius={10}
                            {...getInputProps('firstName')}
                            mt={10}
                        />
                        <TextInput
                            title={'Last Name'}
                            placeholder={'Last Name'}
                            styles={{
                                input: {
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
                                    color: theme.colors.customColor[1],
                                },
                            }}
                            className={'whiteTextInput'}
                            radius={10}
                            {...getInputProps('lastName')}
                        />
                        <TextInput
                            title={'Phone Number'}
                            placeholder={'Phone Number'}
                            styles={{
                                input: {
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
                                    color: theme.colors.customColor[1],
                                },
                            }}
                            className={'whiteTextInput'}
                            radius={10}
                            {...getInputProps('phone')}
                        />
                        <TextInput
                            title={'Email'}
                            placeholder={'Email'}
                            styles={{
                                input: {
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
                                    color: theme.colors.customColor[1],
                                },
                            }}
                            className={'whiteTextInput'}
                            radius={10}
                            {...getInputProps('email')}
                        />
                        <Select
                            data={calendarDropdownOptions}
                            title={'Date'}
                            placeholder={'Date'}
                            styles={{
                                input: {
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
                                    color: theme.colors.customColor[1],
                                },
                            }}
                            className={'whiteTextInput'}
                            radius={10}
                            {...getInputProps('date')}
                        />
                        <Checkbox label={<TermsAndConditionsLabel />} {...getInputProps('termsAgreed')} />
                        <Button bg={theme.colors.customColor[2]} c={'white'} type={'submit'} mt={'md'}>
                            Continue to Payment
                        </Button>
                    </Stack>
                </Flex>
            </form>
        </Modal>
    );
};

export { RSVPForm };
