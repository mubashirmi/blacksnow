'use client';

import {
    BarChart3,
    BookOpen,
    CalendarCheck,
    FilePen,
    FileText,
    HelpCircle,
    LinkIcon,
    LogOut,
    Mail,
    Monitor,
    ReceiptText,
    Scale,
    StickyNote,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';

export function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleAdminLogout = () => {
        // Clear admin_token cookie
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

        // (Optional) clear any admin-related localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userId');
            localStorage.removeItem('roles');
            localStorage.removeItem('referredby');
        }

        // Redirect to login
        router.push('/');
    };

    const navigationItems = [
        {
            title: 'Sales',
            url: '/admin/dashboard/sales',
            icon: BarChart3,
        },
        {
            title: 'Affiliates',
            url: '/admin/dashboard/affiliates',
            icon: Users,
        },
        {
            title: 'Email Users',
            url: '/admin/dashboard/marketingSubscribers',
            icon: Users,
        },
        {
            title: 'Invoice Tool Users',
            url: '/admin/dashboard/marketingSubscribers',
            icon: Users,
        },
        {
            title: 'KPI',
            url: '/admin/dashboard/kpi',
            icon: TrendingUp,
        },
        {
            title: 'Digital Billboard',
            url: '/admin/dashboard/billboard',
            icon: Monitor,
        },
        {
            title: 'Requisition',
            url: '/admin/dashboard/requisition',
            icon: FileText,
        },
        {
            title: 'Newsletter',
            url: '/admin/dashboard/newsletter',
            icon: Mail,
        },
        {
            title: 'Blog',
            url: '/admin/dashboard/blog',
            icon: BookOpen,
        },
        {
            title: 'Contract',
            url: '/admin/dashboard/contract',
            icon: FilePen,
        },
        {
            title: 'Invoice',
            url: '/admin/dashboard/invoice',
            icon: ReceiptText,
        },
        {
            title: 'Email Upload',
            url: '/admin/dashboard/users',
            icon: Users,
        },
        {
            title: 'Email Compose',
            url: '/admin/dashboard/automation',
            icon: LinkIcon,
        },
        {
            title: 'Email Campaign',
            url: '/admin/dashboard/campaign',
            icon: Target,
        },
        {
            title: 'Email KPI',
            url: '/admin/dashboard/emailkpi',
            icon: Mail,
        },
        {
            title: 'Email Schedules',
            url: '/admin/dashboard/emailSchedule',
            icon: CalendarCheck,
        },
        {
            title: 'Notes',
            url: '/admin/dashboard/notes',
            icon: StickyNote,
        },
        {
            title: 'FAQ',
            url: '/admin/dashboard/faq',
            icon: HelpCircle,
        },
        {
            title: 'Legal',
            url: '/admin/dashboard/legal',
            icon: Scale,
        },
    ];

    return (
        <div className='h-full flex flex-col'>
            {/* Sidebar Header */}
            <div className='p-6 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                    <div className='relative transform hover:scale-105 transition-transform duration-300'>
                        <Link href={'/'}>
                            <Image src='/logoblack.png' alt='Black Snow Logo' width={40} height={40} className='object-contain drop-shadow-md' />
                        </Link>
                    </div>
                    <div>
                        <span className='font-bold text-xl text-gray-800'>Black Snow</span>
                        <p className='text-gray-500 text-sm'>Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Sidebar Content */}
            <div className='flex-1 overflow-y-auto p-4'>
                <div className='space-y-1'>
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.url || (item.url !== '/admin/dashboard' && pathname?.startsWith(item.url));

                        return (
                            <Link
                                key={item.title}
                                href={item.url}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                                    ${isActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                                `}
                            >
                                <item.icon className='w-4 h-4' />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Footer */}
            <div className='p-4 border-t border-gray-100'>
                <button
                    onClick={handleAdminLogout}
                    className='flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium cursor-pointer'
                >
                    <LogOut className='w-4 h-4' />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
