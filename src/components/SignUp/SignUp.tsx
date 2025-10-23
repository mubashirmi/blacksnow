import { TermsAndConditionsLabel } from '@/components';
import { REGISTER, USER } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { useGlobalState } from '@/store';
import { Button, Checkbox, Group, Image, Modal, PasswordInput, Stack, Switch, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import { hasLength, isEmail, isNotEmpty, matchesField, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import { fetchUserAttributes, signIn, signUp } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type props = {
    showSignUp: boolean;
    defaultSelected?: string;
    onCloseHandler: () => void;
};

const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    captchaAnswer: '',
    termsAgreed: false,
    firstNum: Math.floor(Math.random() * 10),
    secondNum: Math.floor(Math.random() * 10),
};

const validate = {
    firstName: isNotEmpty('First name is required'),
    lastName: isNotEmpty('Last name is required'),
    email: isEmail('Please enter a valid email'),
    termsAgreed: isNotEmpty(),
    password: hasLength({ min: 8 }, 'Passwords must be at least 8 characters.'),
    confirmPassword: matchesField('password', 'Passwords do not match.'),
    captchaAnswer: (value: string, values: any) => {
        const correctAnswer = values.firstNum + values.secondNum;
        if (!value) {
            return 'Please solve the CAPTCHA';
        }
        if (parseInt(value) !== correctAnswer) {
            return 'Incorrect CAPTCHA answer. Please try again.';
        }
        return null;
    },
};

const SignUp = ({ showSignUp, onCloseHandler, defaultSelected = '' }: props) => {
    const theme = useMantineTheme();
    const { showLoading, hideLoading } = useGlobalState();
    const { restGet, restPost } = useRest();
    const router = useRouter();
    const form = useForm({ initialValues, validate });
    const { getInputProps, onSubmit, setFieldValue, values } = form;
    const [monthYear, setMonthYear] = useState<boolean>(false);

    const regenerateCaptcha = () => {
        const newFirstNum = Math.floor(Math.random() * 10);
        const newSecondNum = Math.floor(Math.random() * 10);
        setFieldValue('firstNum', newFirstNum);
        setFieldValue('secondNum', newSecondNum);
        setFieldValue('captchaAnswer', '');
    };

    useEffect(() => {
        if (defaultSelected) {
            setFieldValue('roleId', defaultSelected);
        }
    }, [defaultSelected, setFieldValue]);

    const handleCheckLoggedInStatus = async () => {
        try {
            const attributes = await fetchUserAttributes();
            if (attributes) {
                return attributes;
            } else {
                return false;
            }
        } catch (e) {
            // Doesn't matter if we get here
        }
    };

    const handleRegister = async (values: any) => {
        showLoading();
        const userAttributes = await handleCheckLoggedInStatus();
        if (userAttributes) {
            notifications.show({ title: 'User Error', color: 'red', message: 'User is already logged in, routing to dashboard...' });
            // @ts-ignore
            const email = encodeURIComponent(userAttributes.email);
            const { status, data } = await restGet(`${USER}?userEmail=${email}`);
            if (status === 200) {
                const { roleId } = data.data;
                if (roleId === 1) {
                    router.push('/admin/dashboard');
                } else if (roleId === 2) {
                    router.push('/emailMarketing/dashboard');
                } else if (roleId === 3) {
                    router.push('/affiliate/dashboard');
                } else if (roleId === 4) {
                    router.push('/advertising/dashboard');
                } else {
                    router.push('/');
                }
            }
        } else {
            const { email, password } = values;
            try {
                await signUp({
                    username: email,
                    password,
                    options: {
                        userAttributes: {
                            email,
                        },
                    },
                });
                await signIn({ username: email, password });
                const { sub } = await fetchUserAttributes();
                values.sub = sub;
                const { status, data } = await restPost(REGISTER, values, false);
                if (status === 200) {
                    const { roleId } = data.data;
                    if (roleId === 1) {
                        router.push('/admin/dashboard');
                    } else if (roleId === 2) {
                        router.push('/emailMarketing/dashboard');
                    } else if (roleId === 3) {
                        router.push('/affiliate/dashboard');
                    } else if (roleId === 4) {
                        router.push('/advertising/dashboard');
                    } else {
                        router.push('/');
                    }
                }
            } catch (error: any) {
                notifications.show({ title: 'Account', message: error.message, color: 'red' });
            }
        }
        hideLoading();
    };

    return (
        <Modal
            opened={showSignUp}
            onClose={onCloseHandler}
            withCloseButton={false}
            styles={{
                content: { borderRadius: '10px', boxShadow: '5px 5px 5px #2727277F', background: theme.colors.customColor[0] },
            }}
            centered
        >
            <Group c={'white'} p={10} justify={'center'} align={'start'} gap={0}>
                <Group mx={'auto'} pl={12}>
                    <Image src={'/logo_black.svg'} alt={'black ice logo'} w={40} />
                    <Title c={'black'}>{defaultSelected === '3' ? 'Affiliate' : defaultSelected === '4' ? 'Advertise' : 'Sign Up'}</Title>
                </Group>
                <IconX color={'black'} className={'click'} onClick={onCloseHandler} />
            </Group>
            {defaultSelected === '4' ? (
                monthYear ? (
                    <Text fz={16} c='black' ta='center'>
                        $600/Year
                    </Text>
                ) : (
                    <Text fz={16} c='black' ta='center'>
                        $150/Month
                    </Text>
                )
            ) : null}
            <form onSubmit={onSubmit(handleRegister)}>
                <Stack gap={'none'} p={30}>
                    <TextInput
                        placeholder='First Name'
                        radius={10}
                        {...getInputProps('firstName')}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                        error={form.errors.firstName}
                    />
                    <TextInput
                        placeholder='Last Name'
                        radius={10}
                        {...getInputProps('lastName')}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                        error={form.errors.lastName}
                    />
                    <TextInput
                        type='email'
                        placeholder='Email'
                        radius={10}
                        {...getInputProps('email')}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                        error={form.errors.email}
                    />
                    <PasswordInput
                        placeholder='Password'
                        radius={10}
                        {...getInputProps('password')}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                        error={form.errors.password}
                    />
                    <PasswordInput
                        placeholder='Confirm Password'
                        radius={10}
                        {...getInputProps('confirmPassword')}
                        styles={{
                            root: { flexGrow: 1 },
                            input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)' },
                        }}
                        className={'whiteTextInput'}
                        w={'100%'}
                        error={form.errors.confirmPassword}
                    />
                    <Group mt={10} w={'100%'} justify={'space-between'}>
                        <TextInput
                            w={50}
                            placeholder={`What is ${values.firstNum} + ${values.secondNum}?`}
                            radius={10}
                            {...getInputProps('captchaAnswer')}
                            error={form.errors.captchaAnswer}
                            styles={{
                                root: { flexGrow: 1 },
                                input: { background: 'transparent', border: 'none', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)' },
                            }}
                            className={'whiteTextInput'}
                        />
                        <Button onClick={regenerateCaptcha} size='xs' bg={theme.colors.customColor[2]}>
                            Refresh
                        </Button>
                        {defaultSelected === '4' && (
                            <Switch
                                size={'xl'}
                                checked={monthYear}
                                onChange={(e) => setMonthYear(e.currentTarget.checked)}
                                onLabel={'Yearly'}
                                offLabel={'Monthly'}
                            />
                        )}
                    </Group>
                    <Checkbox label={<TermsAndConditionsLabel />} {...getInputProps('termsAgreed')} />
                    <Button mt='md' radius='md' type='submit' bg={theme.colors.customColor[2]}>
                        Register
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};

export { SignUp };
