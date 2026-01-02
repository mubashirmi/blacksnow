import { UPDATE_SUB, USER } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { useGlobalState } from '@/store';
import { hasLength, isEmail, matchesField, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { fetchUserAttributes, signIn, signUp } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
};

const validate = {
    email: isEmail(),
    password: hasLength({ min: 8 }, 'Passwords must be at least 8 characters.'),
    confirmPassword: matchesField('password', 'Passwords do not match.'),
};

const useRegister = (props) => {
    const { user } = props;
    const { showLoading, hideLoading } = useGlobalState();
    const router = useRouter();
    const { restGet, restPut } = useRest();
    const form = useForm({ initialValues, validate });
    const { getInputProps, onSubmit } = form;

    useEffect(() => {
        form.setValues({
            email: user.email,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        const handleCheckLoggedInStatus = async () => {
            try {
                const attributes = await fetchUserAttributes();
                if (attributes) {
                    // @ts-ignore
                    const email = encodeURIComponent(attributes.email);
                    const { status, data } = await restGet(`${USER}?userEmail=${email}`);
                    if (status === 200) {
                        const { roleId } = data.data;
                        if (roleId === 1) {
                            router.push('/admin/dashboard/sales');
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
                }
            } catch (e) {
                // Doesn't matter if we get here
            }
        };

        handleCheckLoggedInStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRegister = async (values: any) => {
        showLoading();
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
            await restPut(UPDATE_SUB, values, false);
            router.push('/emailMarketing/dashboard');
        } catch (error: any) {
            notifications.show({ title: 'Account', message: error.message, color: 'red' });
        }
        hideLoading();
    };

    return {
        handleRegister,
        getInputProps,
        onSubmit,
    };
};

export default useRegister;
