import { useRouter } from 'next/router';
import type React from 'react';
import { useEffect } from 'react';
import InvoiceContractSidebar from './InvoiceContractSidebar';

export default function InvoiceDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Get roles from localStorage
                const storedRoles = localStorage.getItem('roles');
                const roles = storedRoles ? JSON.parse(storedRoles) : [];

                // Check if token and role exist in cookies
                const token = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('token='))
                    ?.split('=')[1];
                const id = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('id='))
                    ?.split('=')[1];

                if (!token && !id && !roles.includes('EmailMarketing')) {
                    router.push('/login');
                    return;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/login');
            }
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* <EmailMarketingTourPopup onComplete={() => console.log('Tour complete')} /> */}
            <div className='flex pl-64'>
                <InvoiceContractSidebar />
                <main className='flex-1 p-8'>
                    <div className='max-w-6xl mx-auto'>
                        <h1 className='text-4xl font-bold text-center mb-8'>Invoice Contract Dashboard</h1>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
