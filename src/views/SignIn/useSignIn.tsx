// import { USER } from '@/constants/apiRoutes';
// import { useBoolean } from '@/lib/hooks/useBoolean';
// import useRest from '@/lib/hooks/useRest';
// import { isEmail, isNotEmpty, useForm } from '@mantine/form';
// import { notifications } from '@mantine/notifications';
// import { fetchUserAttributes, signIn } from 'aws-amplify/auth';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';

// const initialValues = {
//     username: '',
//     password: '',
// };

// const validate = {
//     username: isEmail(),
//     password: isNotEmpty(),
// };

// const useSignIn = () => {
//     const { restGet } = useRest();
//     const router = useRouter();
//     const [signUp, signUpHandlers] = useBoolean(false);
//     const form = useForm({ initialValues, validate });
//     const { getInputProps, onSubmit } = form;
//     const [signUpStep, setSignUpStep] = useState('email');
//     const [showForgotPassword, setShowForgotPassword] = useState(false);
//     const [incorrectAttempt, setIncorrectAttempt] = useState(0);

//     useEffect(() => {
//         const handleCheckLoggedInStatus = async () => {
//             try {
//                                             router.push('/admin/dashboard');

//                 // const attributes = await fetchUserAttributes();
//                 // if (attributes) {
//                 //     // @ts-ignore
//                 //     const email = encodeURIComponent(attributes.email);
//                 //     const { status, data } = await restGet(`${USER}?userEmail=${email}`);
//                 //     if (status === 200) {
//                 //         const { roleId } = data.data;
//                 //         if (roleId === 1) {
//                 //             router.push('/admin/dashboard');
//                 //         } else if (roleId === 2) {
//                 //             router.push('/sales/dashboard');
//                 //         } else if (roleId === 3) {
//                 //             router.push('/affiliate/dashboard');
//                 //         } else if (roleId === 4) {
//                 //             router.push('/advertising/dashboard');
//                 //         } else {
//                 //             router.push('/');
//                 //         }
//                 //     }
//                 // }
//             } catch (e) {
//                 // Doesn't matter if we get here
//             }
//         };

//         handleCheckLoggedInStatus();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     const handleLogin = async (values: any) => {
//         const { username, password } = values;
//         try {
//             await signIn({ username, password });
//             router.reload();
//         } catch (e) {
//             if (incorrectAttempt < 2) {
//                 setIncorrectAttempt((prevState) => prevState + 1);
//                 notifications.show({ title: 'Login', message: 'Wrong username or password', color: 'red' });
//             } else {
//                 setShowForgotPassword(true);
//                 notifications.show({ title: 'Login', message: 'Wrong username or password, please reset', color: 'red' });
//             }
//         }
//     };

//     const routeToHome = () => {
//         router.push('/');
//     };

//     return {
//         handleLogin,
//         getInputProps,
//         onSubmit,
//         routeToHome,
//         signUp,
//         signUpHandlers,
//         signUpStep,
//         setSignUpStep,
//         showForgotPassword,
//     };
// };

// export default useSignIn;

import { useBoolean } from '@/lib/hooks/useBoolean';
// import useRest from '@/lib/hooks/useRest';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useState } from 'react';

const initialValues = {
    username: '',
    password: '',
};

const validate = {
    username: isEmail(),
    password: isNotEmpty(),
};

const useSignIn = () => {
    // const { restGet } = useRest();
    const router = useRouter();
    const [signUp, signUpHandlers] = useBoolean(false);
    const form = useForm({ initialValues, validate });
    const { getInputProps, onSubmit } = form;
    const [signUpStep, setSignUpStep] = useState('email');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [incorrectAttempt, setIncorrectAttempt] = useState(0);

    const handleLogin = async (values: any) => {
        const { username, password } = values;
        try {
            // Here, we mock a successful login for any username and password
            // Normally, you'd call the AWS Cognito signIn method, but we skip it here
            console.log('Login Successful:', username, password);

            // Simulate the user being authenticated and redirect to a page (e.g., /dashboard)
            router.push('/sales/dashboard'); // You can change the path as needed
        } catch (e) {
            if (incorrectAttempt < 2) {
                setIncorrectAttempt((prevState) => prevState + 1);
                alert('Wrong username or password');
            } else {
                setShowForgotPassword(true);
                alert('Wrong username or password, please reset');
            }
        }
    };

    const routeToHome = () => {
        router.push('/');
    };

    return {
        handleLogin,
        getInputProps,
        onSubmit,
        routeToHome,
        signUp,
        signUpHandlers,
        signUpStep,
        setSignUpStep,
        showForgotPassword,
    };
};

export default useSignIn;
