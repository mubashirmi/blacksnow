import { AdminSidebar } from '@/components/admin-sidebar';
import { useRouter } from 'next/router';
import type React from 'react';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            // Check if admin_token exists in cookies
            const adminToken = document.cookie
                .split('; ')
                .find((row) => row.startsWith('admin_token='))
                ?.split('=')[1];

            if (!adminToken) {
                router.push('/login');
                return;
            }

            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 flex'>
            <div className='w-64 h-screen sticky top-0 bg-white border-r border-gray-200 shadow-lg'>
                <AdminSidebar />
            </div>
            <div className='flex-1 flex flex-col'>
                <div className='flex-1 overflow-auto'>
                    <div className='flex-1 p-6 bg-gray-50'>{children}</div>
                </div>
            </div>
        </div>
    );
}
