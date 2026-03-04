// pages/_app.tsx
import { CoreLayout } from '@/components';
import AdminLayout from '@/components/AdminLayout';
import AffiliateLayout from '@/components/AffiliateDashboardLayout';
import EmailMarketingLayout from '@/components/EmailMarketingLayout';
import SalesDashboardLayout from '@/components/SalesDashboardLayout';
import SuperAffiliateLayout from '@/components/SuperAffiliateDashboardLayout';
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
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import '../styles/globalStyles.css';

type NextPageWithLayout = AppProps['Component'] & {
    getLayout?: (page: ReactElement) => ReactNode;
};

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
            sessionStorage.setItem('previousRoute', router.asPath);
        };
        router.events.on('routeChangeStart', handleRouteChange);
        return () => router.events.off('routeChangeStart', handleRouteChange);
    }, [router]);

    useEffect(() => {
        document.body.style.minHeight = router.pathname === '/login' ? '100px' : '100vh';
    }, [router.pathname]);

    // Default layout logic (your existing routing logic)
    const defaultLayout = (page: ReactElement) => {
        const isAdminRoute = router.pathname.startsWith('/admin');
        const isEmailMarketingRoute = router.pathname.startsWith('/emailMarketing/dashboard');
        const isAffiliateRoute = router.pathname.startsWith('/affiliate/dashboard');
        const isSuperAffiliateRoute = router.pathname.startsWith('/superAffiliate/dashboard');
        const isSalesRoute = router.pathname.startsWith('/sales/dashboard');

        if (isAdminRoute) return <AdminLayout>{page}</AdminLayout>;
        if (isEmailMarketingRoute) return <EmailMarketingLayout>{page}</EmailMarketingLayout>;
        if (isSalesRoute) return <SalesDashboardLayout>{page}</SalesDashboardLayout>;
        if (isAffiliateRoute) return <AffiliateLayout>{page}</AffiliateLayout>;
        if (isSuperAffiliateRoute) return <SuperAffiliateLayout>{page}</SuperAffiliateLayout>;
        return <CoreLayout>{page}</CoreLayout>;
    };

    const PageComponent = Component as NextPageWithLayout;
    const getLayout = PageComponent.getLayout ?? defaultLayout;

    return (
        <>
            <Head>
                <title>Black Snow</title>
                <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
            </Head>

            <MantineProvider theme={mantineTheme}>
                {/* ✅ Put Notifications once */}
                <Notifications position='top-right' />

                {/* ✅ Page decides layout if getLayout exists */}
                {getLayout(<PageComponent {...pageProps} />)}
            </MantineProvider>
        </>
    );
}
