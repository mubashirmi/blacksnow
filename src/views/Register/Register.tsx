// import { SECTION_GAP } from '@/constants/applicationTypes';
// import useRegister from '@/views/Register/useRegister';
// import { Button, Container, PasswordInput, Stack, TextInput, Title, useMantineTheme } from '@mantine/core';

// const Register = (props) => {
//     const theme = useMantineTheme();
//     const { handleRegister, getInputProps, onSubmit } = useRegister(props);
//     return (
//         <Container fluid>
//             <Container mt={SECTION_GAP} size={'lg'}>
//                 <form onSubmit={onSubmit(handleRegister)}>
//                     <Stack gap={'xl'}>
//                         <Title ta={'center'}>Register</Title>
//                         <TextInput
//                             placeholder={'Email'}
//                             size={'lg'}
//                             styles={{ input: { border: '1px solid black' } }}
//                             radius={10}
//                             {...getInputProps('email')}
//                             disabled
//                         />
//                         <PasswordInput
//                             placeholder='Password'
//                             styles={{ input: { border: '1px solid black' } }}
//                             radius={10}
//                             size='lg'
//                             {...getInputProps('password')}
//                         />
//                         <PasswordInput
//                             styles={{ input: { border: '1px solid black' } }}
//                             placeholder='Verify Password'
//                             radius={10}
//                             size='lg'
//                             mb={20}
//                             {...getInputProps('confirmPassword')}
//                         />
//                         <Button size={'lg'} bg={theme.colors.customColor[2]} c={'white'} type='submit'>
//                             Register
//                         </Button>
//                     </Stack>
//                 </form>
//             </Container>
//         </Container>
//     );
// };

// export { Register };

import { SECTION_GAP } from '@/constants/applicationTypes';
import useRegister from '@/views/Register/useRegister';
import { Button, Container, PasswordInput, Stack, TextInput, Title, useMantineTheme } from '@mantine/core';

const Register = () => {
    const theme = useMantineTheme();
    const { handleRegister, getInputProps, onSubmit } = useRegister({
        user: {
            email: 'user@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
        },
    });
    return (
        <Container fluid>
            <Container mt={SECTION_GAP} size={'lg'}>
                <form onSubmit={onSubmit(handleRegister)}>
                    <Stack gap={'xl'}>
                        <Title ta={'center'}>Register</Title>
                        <TextInput
                            placeholder={'Email'}
                            size={'lg'}
                            styles={{ input: { border: '1px solid black' } }}
                            radius={10}
                            {...getInputProps('email')}
                            disabled
                        />
                        <PasswordInput
                            placeholder='Password'
                            styles={{ input: { border: '1px solid black' } }}
                            radius={10}
                            size='lg'
                            {...getInputProps('password')}
                        />
                        <PasswordInput
                            styles={{ input: { border: '1px solid black' } }}
                            placeholder='Verify Password'
                            radius={10}
                            size='lg'
                            mb={20}
                            {...getInputProps('confirmPassword')}
                        />
                        <Button size={'lg'} bg={theme.colors.customColor[2]} c={'white'} type='submit'>
                            Register
                        </Button>
                    </Stack>
                </form>
            </Container>
        </Container>
    );
};

export { Register };
