'use client';

import {
    BarChart3,
    BookOpen,
    CalendarCheck,
    ChevronDown,
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
import { useState } from 'react';
export function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (title) => {
        setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
    };
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

    // const navigationItems = [
    //     {
    //         title: 'KPI',
    //         url: '/admin/dashboard/kpi',
    //         icon: TrendingUp,
    //     },
    //     {
    //         title: 'Sales',
    //         url: '/admin/dashboard/sales',
    //         icon: BarChart3,
    //     },
    //     {
    //         title: 'Affiliates',
    //         url: '/admin/dashboard/affiliates',
    //         icon: Users,
    //     },
    //     {
    //         title: 'Email Users',
    //         url: '/admin/dashboard/marketingSubscribers',
    //         icon: Users,
    //     },
    //     {
    //         title: 'Invoice Tool Users',
    //         url: '/admin/dashboard/marketingSubscribers',
    //         icon: Users,
    //     },
    //     {
    //         title: 'Digital Billboard',
    //         url: '/admin/dashboard/billboard',
    //         icon: Monitor,
    //     },
    //     {
    //         title: 'Newsletter',
    //         url: '/admin/dashboard/newsletter',
    //         icon: Mail,
    //     },
    //     {
    //         title: 'Contract',
    //         url: '/admin/dashboard/contract',
    //         icon: FilePen,
    //     },
    //     {
    //         title: 'Email Upload',
    //         url: '/admin/dashboard/users',
    //         icon: Users,
    //     },
    //     {
    //         title: 'Email Compose',
    //         url: '/admin/dashboard/automation',
    //         icon: LinkIcon,
    //     },
    //     {
    //         title: 'Email Campaign',
    //         url: '/admin/dashboard/campaign',
    //         icon: Target,
    //     },
    //     {
    //         title: 'Email KPI',
    //         url: '/admin/dashboard/emailkpi',
    //         icon: Mail,
    //     },
    //     {
    //         title: 'Email Schedules',
    //         url: '/admin/dashboard/emailSchedule',
    //         icon: CalendarCheck,
    //     },

    //     {
    //         title: 'Requisition',
    //         url: '/admin/dashboard/requisition',
    //         icon: FileText,
    //     },
    //     {
    //         title: 'Invoice',
    //         url: '/admin/dashboard/invoice',
    //         icon: ReceiptText,
    //     },
    //     {
    //         title: 'Blog',
    //         url: '/admin/dashboard/blog',
    //         icon: BookOpen,
    //     },
    //     {
    //         title: 'Notes',
    //         url: '/admin/dashboard/notes',
    //         icon: StickyNote,
    //     },
    //     {
    //         title: 'FAQ',
    //         url: '/admin/dashboard/faq',
    //         icon: HelpCircle,
    //     },
    //     {
    //         title: 'Legal',
    //         url: '/admin/dashboard/legal',
    //         icon: Scale,
    //     },
    // ];
    const navigationItems = [
        {
            title: 'KPI Metrics',
            url: '/admin/dashboard/kpi',
            icon: TrendingUp,
        },

        // Subscribers Group
        {
            title: 'Subscribers',
            icon: Users,
            children: [
                {
                    title: 'Newsletter',
                    url: '/admin/dashboard/newsletter',
                    icon: Mail,
                },
                {
                    title: 'Email Users',
                    url: '/admin/dashboard/marketingSubscribers',
                    icon: Users,
                },
                {
                    title: 'Digital Billboard',
                    url: '/admin/dashboard/billboard',
                    icon: Monitor,
                },
            ],
        },

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

        // CRM Group (Combine Email Tabs)
        {
            title: 'CRM',
            icon: Mail,
            children: [
                {
                    title: 'Email Upload',
                    url: '/admin/dashboard/users',
                    icon: Users,
                },
                {
                    title: 'Email Automation',
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
            ],
        },

        {
            title: 'Requisition',
            url: '/admin/dashboard/requisition',
            icon: FileText,
        },
        {
            title: 'Invoice',
            url: '/admin/dashboard/invoice',
            icon: ReceiptText,
        },
        {
            title: 'Contract',
            url: '/admin/dashboard/contract',
            icon: FilePen,
        },
        {
            title: 'Invoice Tool Users',
            url: '/admin/dashboard/marketingSubscribers', // keep as-is since that's what you had
            icon: Users,
        },
        {
            title: 'Blog',
            url: '/admin/dashboard/blog',
            icon: BookOpen,
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

        // Not mentioned by client => push to end
    ];

    return (
        <div className='h-full flex flex-col'>
            {/* Sidebar Header */}
            <div className='p-6 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                    <div className='relative transform hover:scale-105 transition-transform duration-300'>
                        <Link href={'/'}>
                            <Image src='/logoblack.png' alt='Black Snow Logo' width={80} height={80} className='object-contain drop-shadow-md' />
                        </Link>
                    </div>
                    <div>
                        <span className='font-bold text-xl text-gray-800 ml-1'>Black Snow</span>
                        <button
                            className='
     items-center gap-2
    px-2 py-1 cursor-pointer
    text-sm font-medium
    text-[#0b0b0b]/80
    border border-[#0b0b0b]/30
    bg-transparent
    rounded-xl      /* not too round */
    transition
    hover:bg-[#0b0b0b]
    hover:text-white
  '
                        >
                            Admin Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Content */}
            <div className='flex-1 overflow-y-auto p-4'>
                <div className='space-y-1'>
                    {navigationItems.map((item) => {
                        const hasChildren = Array.isArray(item.children) && item.children.length > 0;

                        const isActive = item.url ? pathname === item.url || (item.url !== '/admin/dashboard' && pathname?.startsWith(item.url)) : false;

                        const isChildActive = hasChildren ? item.children.some((child) => pathname === child.url || pathname?.startsWith(child.url)) : false;

                        const isOpen = openMenus[item.title] ?? isChildActive;

                        if (hasChildren) {
                            return (
                                <div key={item.title} className='space-y-1'>
                                    <button
                                        type='button'
                                        onClick={() => toggleMenu(item.title)}
                                        className={`
                    w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                    ${isChildActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                  `}
                                    >
                                        <span className='flex items-center gap-3'>
                                            <item.icon className='w-4 h-4' />
                                            <span>{item.title}</span>
                                        </span>

                                        <ChevronDown className={`w-4 h-4 cursor-pointer transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isOpen && (
                                        <div className='ml-4 space-y-1'>
                                            {item.children.map((child) => {
                                                const childActive = pathname === child.url || pathname?.startsWith(child.url);

                                                return (
                                                    <Link
                                                        key={child.title}
                                                        href={child.url}
                                                        className={`
                            flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium
                            ${childActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                          `}
                                                    >
                                                        <child.icon className='w-4 h-4' />
                                                        <span>{child.title}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Normal item
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
