'use client';

import {
    BarChart3,
    BookOpen,
    BookUser,
    CalendarCheck,
    ChevronDown,
    CreditCard,
    FileSpreadsheet,
    FileText,
    HelpCircle,
    LinkIcon,
    ListRestart,
    LogOut,
    LucideMessageSquarePlus,
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
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // ✅ Auto logout (10 min inactivity)
    const AUTO_LOGOUT_MS = 10 * 60 * 1000;
    const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const doLogout = () => {
        try {
            // Clear admin_token cookie
            document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

            // Clear storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('userId');
                localStorage.removeItem('adminId');
                localStorage.removeItem('roles');
                localStorage.removeItem('pausedRoles');
                localStorage.removeItem('id');
                localStorage.removeItem('adminId');
                localStorage.removeItem('firstName');
                localStorage.removeItem('lastName');
                localStorage.removeItem('email');
                localStorage.removeItem('referredby');
            }
        } catch (e) {
            // never break UI
            console.error('Logout error:', e);
        } finally {
            // Redirect
            router.replace('/');
        }
    };

    // ✅ Manual logout: open modal
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        doLogout();
    };

    // ✅ reset timer on activity
    const resetAutoLogoutTimer = () => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        logoutTimerRef.current = setTimeout(() => {
            // Auto logout without modal
            doLogout();
            // eslint-disable-next-line
        }, AUTO_LOGOUT_MS);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        resetAutoLogoutTimer();
        // eslint-disable-next-line
        const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        const onActivity = () => resetAutoLogoutTimer();
        events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

        const onVisibility = () => {
            // when user returns to tab, reset
            if (document.visibilityState === 'visible') resetAutoLogoutTimer();
        };
        document.addEventListener('visibilitychange', onVisibility);

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowLogoutModal(false);
        };
        window.addEventListener('keydown', onEsc);

        return () => {
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            events.forEach((ev) => window.removeEventListener(ev, onActivity));
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('keydown', onEsc);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // (Optional) reset timer on route change too (safe)
    useEffect(() => {
        resetAutoLogoutTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const navigationItems = [
        {
            title: 'KPI Metrics',
            url: '/admin/dashboard/kpi',
            icon: TrendingUp,
        },
        {
            title: 'Subscribers',
            icon: Users,
            children: [
                { title: 'Newsletter', url: '/admin/dashboard/newsletter', icon: Mail },
                { title: 'Email Marketing', url: '/admin/dashboard/marketingSubscribers', icon: Users },
                { title: 'Business Invoice', url: '/admin/dashboard/businessInvoiceUsers', icon: ReceiptText },
                { title: 'Digital Billboard', url: '/admin/dashboard/digitalBillboardUsers', icon: Monitor },
            ],
        },
        { title: 'Sales', url: '/admin/dashboard/sales', icon: BarChart3 },
        { title: 'Billing Cycles', url: '/admin/dashboard/billingCycles', icon: ListRestart },
        { title: 'Affiliates', url: '/admin/dashboard/affiliates', icon: Users },
        {
            title: 'CRM',
            icon: Mail,
            children: [
                { title: 'Email Upload', url: '/admin/dashboard/users', icon: Users },
                { title: 'Email Automation', url: '/admin/dashboard/automation', icon: LinkIcon },
                { title: 'Email Campaign', url: '/admin/dashboard/campaign', icon: Target },
                { title: 'Email KPI', url: '/admin/dashboard/emailkpi', icon: Mail },
                { title: 'Email Schedules', url: '/admin/dashboard/emailSchedule', icon: CalendarCheck },
            ],
        },
        {
            title: 'Invoice/Contract',
            icon: FileSpreadsheet,
            children: [
                { title: 'Contract', url: '/admin/dashboard/invoicecontractdashboard/contract', icon: LinkIcon },
                // { title: 'Signed Contracts', url: '/admin/dashboard/invoicecontractdashboard/signedContracts', icon: FilePenLine },
                { title: 'Invoices', url: '/admin/dashboard/invoicecontractdashboard/invoice', icon: StickyNote },
                { title: 'Subscriptions', url: '/admin/dashboard/invoicecontractdashboard/subscription', icon: CreditCard },
                { title: 'Receipts', url: '/admin/dashboard/invoicecontractdashboard/receipts', icon: ReceiptText },
            ],
        },
        { title: 'Requisition', url: '/admin/dashboard/requisition', icon: FileText },
        { title: 'Consultation', url: '/admin/dashboard/consultations', icon: BookUser },
        { title: 'Feedback', url: '/admin/dashboard/feedbacks', icon: LucideMessageSquarePlus },
        // { title: 'Business Invoice', url: '/admin/dashboard/businessInvoiceContract', icon: FilePen },
        { title: 'Digital Billboard', url: '/admin/dashboard/billboard', icon: Monitor },
        { title: 'Blog', url: '/admin/dashboard/blog', icon: BookOpen },
        { title: 'Notes', url: '/admin/dashboard/notes', icon: StickyNote },
        { title: 'FAQ', url: '/admin/dashboard/faq', icon: HelpCircle },
        { title: 'Legal', url: '/admin/dashboard/legal', icon: Scale },
    ];

    return (
        <div className='h-full flex flex-col'>
            {/* ✅ Logout Confirmation Modal */}
            {mounted &&
                showLogoutModal &&
                createPortal(
                    <div className='fixed inset-0 z-[2147483647] flex items-center justify-center'>
                        <div
                            className='absolute inset-0 z-[2147483647] bg-black/40 backdrop-blur-md transition-all duration-500 ease-in-out opacity-100'
                            onClick={cancelLogout}
                        />

                        <div className='relative z-[2147483647] bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-2xl p-6 w-96 transform transition-all duration-500 ease-in-out scale-100 opacity-100'>
                            <h2 className='text-2xl font-black bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent mb-4'>
                                Confirm Logout
                            </h2>

                            <p className='text-gray-300 mb-6'>Are you sure you want to logout?</p>

                            <div className='flex justify-end space-x-4'>
                                <button
                                    onClick={cancelLogout}
                                    className='bg-transparent border-2 border-[#2c7bbe] text-[#2c7bbe] hover:bg-[#2c7bbe] cursor-pointer hover:text-white transition-all duration-300 font-bold py-2 px-4 rounded-xl'
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={confirmLogout}
                                    className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white font-bold py-2 px-4 rounded-xl transform hover:scale-105 transition-all duration-300 cursor-pointer'
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

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
                                px-4 py-1 cursor-pointer
                                text-sm font-medium
                                text-[#0b0b0b]/80
                                border border-[#0b0b0b]/30
                                bg-transparent
                                rounded-xl
                                transition
                                hover:bg-[#0b0b0b]
                                hover:text-white
                            '
                        >
                            Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Content */}
            <div className='flex-1 overflow-y-auto p-4'>
                <div className='space-y-1'>
                    {navigationItems.map((item) => {
                        const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0;

                        const isActive = (item as any).url
                            ? pathname === (item as any).url || ((item as any).url !== '/admin/dashboard' && pathname?.startsWith((item as any).url))
                            : false;

                        const isChildActive = hasChildren
                            ? (item as any).children.some((child: any) => pathname === child.url || pathname?.startsWith(child.url))
                            : false;

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
                                            {(item as any).children.map((child: any) => {
                                                const childActive = pathname === child.url || pathname?.startsWith(child.url);

                                                return (
                                                    <Link
                                                        key={child.title}
                                                        href={child.url}
                                                        className={`
                                                            flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium
                                                            ${
                                                                childActive
                                                                    ? 'bg-gray-800 text-white shadow-md'
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                                            }
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

                        return (
                            <Link
                                key={(item as any).title}
                                href={(item as any).url}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                                    ${isActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                                `}
                            >
                                <item.icon className='w-4 h-4' />
                                <span>{(item as any).title}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Footer */}
            <div className='p-4 border-t border-gray-100'>
                <button
                    onClick={handleLogoutClick}
                    className='flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium cursor-pointer'
                >
                    <LogOut className='w-4 h-4' />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
