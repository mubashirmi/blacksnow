// pages/_app.tsx
import { CoreLayout } from '@/components';
import AdminLayout from '@/components/AdminLayout';
import AffiliateLayout from '@/components/AffiliateDashboardLayout';
import AutoLogout from '@/components/AutoLogout';
import EmailMarketingLayout from '@/components/EmailMarketingLayout';
import PageChangeLoader from '@/components/PageChangeLoader';
import SalesDashboardLayout from '@/components/SalesDashboardLayout';
import SuperAffiliateLayout from '@/components/SuperAffiliateDashboardLayout';
import InvoiceDashboardLayout from '@/components/invoicecontract/DashboardLayout';
import '@/components/legal/legal-rich-text.css';
import { mantineTheme } from '@/constants/mantineTheme';
import '@aws-amplify/ui-react/styles.css';
import '@mantine/charts/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import 'mantine-react-table/styles.css';
import type { AppProps } from 'next/app';
import { Michroma } from 'next/font/google';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import '../styles/globalStyles.css';

const michroma = Michroma({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-michroma',
    display: 'swap',
});

type NextPageWithLayout = AppProps['Component'] & {
    getLayout?: (page: ReactElement) => ReactNode;
};

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

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

    const defaultLayout = (page: ReactElement) => {
        const isAdminRoute = router.pathname.startsWith('/admin');
        const isEmailMarketingRoute = router.pathname.startsWith('/emailMarketing/dashboard');
        const isAffiliateRoute = router.pathname.startsWith('/affiliate/dashboard');
        const isSuperAffiliateRoute = router.pathname.startsWith('/superAffiliate/dashboard');
        const isSalesRoute = router.pathname.startsWith('/sales/dashboard');
        const isInvoiceRoute = router.pathname.startsWith('/invoicecontractdashboard');

        if (isAdminRoute) return <AdminLayout>{page}</AdminLayout>;
        if (isEmailMarketingRoute) return <EmailMarketingLayout>{page}</EmailMarketingLayout>;
        if (isSalesRoute) return <SalesDashboardLayout>{page}</SalesDashboardLayout>;
        if (isAffiliateRoute) return <AffiliateLayout>{page}</AffiliateLayout>;
        if (isSuperAffiliateRoute) return <SuperAffiliateLayout>{page}</SuperAffiliateLayout>;
        if (isInvoiceRoute) return <InvoiceDashboardLayout>{page}</InvoiceDashboardLayout>;

        return <CoreLayout>{page}</CoreLayout>;
    };

    const PageComponent = Component as NextPageWithLayout;
    const getLayout = PageComponent.getLayout ?? defaultLayout;

    const theme = createTheme({
        ...mantineTheme,
        headings: {
            ...mantineTheme.headings,
            fontFamily: 'var(--font-michroma), sans-serif',
        },
    });

    return (
        <>
            <AutoLogout />
            <Head>
                <title>Black Snow</title>
                <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
            </Head>

            <MantineProvider theme={theme}>
                <PageChangeLoader logoSrc='/logocolored.png' duration={3000} />

                <Notifications position='top-right' />

                <div className={`${michroma.variable} michroma-heading-scope`}>{getLayout(<PageComponent {...pageProps} />)}</div>

                <style jsx global>{`
                    .michroma-heading-scope h1,
                    .michroma-heading-scope h2,
                    .michroma-heading-scope h3,
                    .michroma-heading-scope h4,
                    .michroma-heading-scope h5,
                    .michroma-heading-scope h6,
                    .michroma-heading-scope .mantine-Title-root,
                    .michroma-heading-scope [class*='mantine-Title-root'],
                    .michroma-heading-scope .headingFont {
                        font-family: var(--font-michroma), sans-serif !important;
                    }
                `}</style>
            </MantineProvider>
        </>
    );
}
