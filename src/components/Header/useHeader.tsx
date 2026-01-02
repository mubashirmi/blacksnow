import { USER } from '@/constants/apiRoutes';
import { useBoolean } from '@/lib/hooks/useBoolean';
import useRest from '@/lib/hooks/useRest';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useHeader = () => {
    const { restGet } = useRest();
    const router = useRouter();
    const [isLoggedIn, loggedInHandlers] = useBoolean(false);

    useEffect(() => {
        const handleCheckLoggedInStatus = async () => {
            try {
                const { sub } = await fetchUserAttributes();
                if (sub) {
                    loggedInHandlers.setTrue();
                }
            } catch (e) {
                loggedInHandlers.setFalse();
            }
        };

        handleCheckLoggedInStatus();
    }, [loggedInHandlers]);

    const handleRouteToDashboard = async () => {
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
    };

    return {
        router,
        isLoggedIn,
        handleRouteToDashboard,
    };
};

export default useHeader;
