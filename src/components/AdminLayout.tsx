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
                {/* <header className='bg-white border-b border-gray-200 px-6 py-4 shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-6'>
                            <div className='flex items-center gap-3'>
                                <div className='relative transform hover:scale-105 transition-transform duration-300'>
                                    <Image src='/logoblack.png' alt='Black Snow Logo' width={40} height={40} className='object-contain drop-shadow-md' />
                                </div>
                                <span className='text-2xl font-bold text-gray-800'>Black Snow</span>
                            </div>
                            <input
                                type='text'
                                placeholder='Your Name here'
                                className='px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all'
                            />
                        </div>
                        <div className='flex gap-3'>
                            <Link href='/rsvp'>
                                <button className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm font-medium'>
                                    RSVP
                                </button>
                            </Link>
                            <Link href='/login'>
                                <button className='px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-sm font-medium'>
                                    Login
                                </button>
                            </Link>
                        </div>
                    </div>
                </header> */}
                <div className='flex-1 overflow-auto'>
                    {/* <header className='flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-6 bg-white shadow-sm'>
                        <h1 className='text-2xl font-bold text-gray-800'>Admin Dashboard</h1>
                    </header> */}
                    <div className='flex-1 p-6 bg-gray-50'>{children}</div>
                </div>
            </div>
        </div>
    );
}
