import { CoreLayout } from '@/components';
import AdminLayout from '@/components/AdminLayout'; // Import your AdminLayout
import AffiliateLayout from '@/components/AffiliateDashboardLayout';
import SalesLayout from '@/components/SalesDashboardLayout';
import { mantineTheme } from '@/constants/mantineTheme';
import { useGlobalState } from '@/store';
import '@aws-amplify/ui-react/styles.css';
import '@mantine/charts/styles.css';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import 'mantine-react-table/styles.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '../styles/globalStyles.css';

// Amplify.configure(amplifyConfig, { ssr: true });

export default function App({ Component, pageProps }: AppProps) {
    const { showLoading, hideLoading } = useGlobalState();
    const router = useRouter();

    useEffect(() => {
        const handleStart = () => showLoading();
        const handleComplete = () => hideLoading();

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router, showLoading, hideLoading]);

    useEffect(() => {
        const handleRouteChange = () => {
            // Store the current route as the previous route
            sessionStorage.setItem('previousRoute', router.asPath);
        };

        router.events.on('routeChangeStart', handleRouteChange);

        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, [router]);

    useEffect(() => {
        if (router.pathname === '/login') {
            document.body.style.minHeight = '100px';
        } else {
            document.body.style.minHeight = '100vh';
        }
    }, [router.pathname]);

    // Determine if the current route is an admin route
    const isAdminRoute = router.pathname.startsWith('/admin');
    const isSalesRoute = router.pathname.startsWith('/sales/dashboard');
    const isAffiliateRoute = router.pathname.startsWith('/affiliate/dashboard');

    return (
        <>
            <Head>
                <title>Black Snow</title>
                <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
            </Head>
            <MantineProvider theme={mantineTheme}>
                {isAdminRoute ? (
                    <AdminLayout>
                        <Notifications position='top-right' />
                        <Component {...pageProps} />
                    </AdminLayout>
                ) : isSalesRoute ? (
                    <SalesLayout>
                        <Notifications position='top-right' />
                        <Component {...pageProps} />
                    </SalesLayout>
                ) : isAffiliateRoute ? (
                    <AffiliateLayout>
                        <Notifications position='top-right' />
                        <Component {...pageProps} />
                    </AffiliateLayout>
                ) : (
                    <CoreLayout>
                        <Notifications position='top-right' />
                        <Component {...pageProps} />
                    </CoreLayout>
                )}
            </MantineProvider>
        </>
    );
}
