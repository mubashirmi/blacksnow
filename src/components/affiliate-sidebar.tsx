'use client';

import { BarChart3, LinkIcon, LogOut, StickyNote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

const navigationItems = [
    { title: 'KPI', url: '/affiliate/dashboard/kpi', icon: BarChart3 },
    { title: 'Links', url: '/affiliate/dashboard/links', icon: LinkIcon },
    { title: 'Notes', url: '/affiliate/dashboard/notes', icon: StickyNote },
];

export function AffiliateSidebar(props: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.removeItem('roles');
        localStorage.removeItem('userId');
        router.push('/');
    };

    return (
        <aside {...props} className='fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col' aria-label='Sidebar'>
            {/* Header / Brand */}
            <div className='p-6 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                    <div className='relative transform hover:scale-105 transition-transform duration-300'>
                        <Image src='/logoblack.png' alt='Black Snow Logo' width={40} height={40} className='object-contain drop-shadow-md' />
                    </div>
                    <div>
                        <span className='font-bold text-xl text-gray-800'>Black Snow</span>
                        <p className='text-gray-500 text-sm'>Affiliate Panel</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className='p-4 overflow-y-auto flex-1'>
                <ul className='space-y-1'>
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.url;
                        const ItemIcon = item.icon;
                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.url}
                                    className={[
                                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium',
                                        isActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800',
                                    ].join(' ')}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <ItemIcon className='w-4 h-4' />
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer / Logout */}
            <div className='p-4 border-t border-gray-100'>
                <button
                    className='w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium cursor-pointer'
                    type='button'
                    onClick={() => setIsModalOpen(true)}
                >
                    <LogOut className='w-4 h-4' />
                    <span>Logout </span>
                </button>
            </div>
            {isModalOpen && (
                <div className='fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50'>
                    <div className='bg-white rounded-lg p-6 w-96'>
                        <h2 className='text-lg font-semibold mb-4'>Confirm Logout</h2>
                        <p className='text-gray-600 mb-6'>Are you sure you want to logout?</p>
                        <div className='flex justify-end gap-4'>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='px-4 py-2 text-sm cursor-pointer font-medium text-gray-700 hover:bg-gray-100 rounded-md'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className='px-4 py-2 text-sm font-medium text-white bg-slate-500 hover:bg-slate-600 rounded-md cursor-pointer'
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
