'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const menuItems = [
    {
        category: 'Company',
        items: [
            { name: 'Our Story', href: '/about' },
            { name: 'Careers', href: '/careers' },
            { name: 'Blogs', href: '/blogdirectory' },
            { name: 'FAQ', href: '/faq' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'Support', href: '/support' },
        ],
    },
    {
        category: 'Resources',
        items: [
            { name: 'Affiliate Program', href: '/affiliate' },
            { name: 'Business Invoice', href: '/InvoiceContract' },
            { name: 'Digital Billboard', href: '/advertising' },
            { name: 'Email CRM Lite', href: '/emailMarketing' },
        ],
    },
    {
        category: 'Trading Tool Kit',
        items: [
            { name: 'Paper Trading', href: '/paper-trading' },
            { name: 'Stock Screener', href: '/stock-screener' },
            { name: 'Watchlist', href: '/watchlist' },
            { name: 'Market Movers', href: '/market-movers' },
            { name: 'Global KPI', href: '/global-kpi' },
            { name: 'Economic Simulator', href: '/economic-simulator' },
            { name: 'Calendars', href: '/market-moving-calenders' },
            { name: 'Research', href: '/research' },
        ],
    },
];

const roleDashboardMap: Record<
    'LightningSilver' | 'Sales' | 'InvoiceTool' | 'Admin' | 'DigitalBillboard' | 'EmailMarketing' | 'LightningGold',
    { label: string; path: string }
> = {
    LightningSilver: {
        label: 'Lightning Silver Dashboard',
        path: '/affiliate/dashboard/kpi',
    },

    LightningGold: {
        label: 'Lightning Gold Dashboard',
        path: '/superAffiliate/dashboard/kpi',
    },

    Sales: {
        label: 'Sales Dashboard',
        path: '/sales/dashboard/links',
    },

    InvoiceTool: {
        label: 'Invoice Dashboard',
        path: '/invoicecontractdashboard/contract',
    },

    EmailMarketing: {
        label: 'Email CRM Lite Dashboard',
        path: '/emailMarketing/dashboard/users',
    },

    DigitalBillboard: {
        label: 'Digital Billboard Dashboard',
        path: '/digitalBillboard/dashboard',
    },

    Admin: {
        label: 'Admin Dashboard',
        path: '/admin/dashboard/sales',
    },
};

const ROLE_PRIORITY: (keyof typeof roleDashboardMap)[] = ['Sales', 'DigitalBillboard', 'EmailMarketing', 'InvoiceTool', 'LightningSilver', 'LightningGold'];

export function HamburgerMenu({ userId }: { userId?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const [userid, setUserid] = useState<string | null>(userId ?? null);

    const [adminId, setAdminId] = useState<string | null>(null);

    const [dashboards, setDashboards] = useState<{ label: string; path: string }[]>([]);

    const router = useRouter();

    /*
     * Logged-in state:
     *
     * Normal user -> userId exists
     * Admin -> adminId exists
     */
    const isLoggedIn = Boolean(userid || adminId);

    /*
     * Normal product dashboard.
     *
     * This is only true when the user actually has
     * one of the subscribed/product roles.
     */
    const hasProductDashboard = Boolean(userid) && dashboards.length > 0;

    /*
     * Admin dashboard remains independent from
     * normal product subscriptions.
     */
    const hasAdminDashboard = Boolean(adminId);

    /*
     * Footer rules:
     *
     * 1. Logged out:
     *    Show footer with Sign in.
     *
     * 2. Logged in + subscribed product:
     *    Show footer with Dashboard.
     *
     * 3. Admin:
     *    Show footer with Admin Dashboard.
     *
     * 4. Logged in + NO product + NO admin:
     *    Hide footer completely.
     */
    const shouldShowFooter = !isLoggedIn || hasProductDashboard || hasAdminDashboard;

    // Load user/admin IDs, roles and control body scrolling.
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId') || userId || null;

        const storedAdminId = localStorage.getItem('adminId') || null;

        setUserid(storedUserId);
        setAdminId(storedAdminId);

        const storedRoles = localStorage.getItem('roles');

        if (storedUserId && storedRoles) {
            try {
                const parsedRoles: string[] = JSON.parse(storedRoles);

                const roleSet = new Set(parsedRoles);

                const availableDashboards: {
                    label: string;
                    path: string;
                }[] = [];

                ROLE_PRIORITY.forEach((role) => {
                    if (roleSet.has(role)) {
                        const dashboard = roleDashboardMap[role];

                        if (dashboard && !availableDashboards.some((item) => item.path === dashboard.path)) {
                            availableDashboards.push(dashboard);
                        }
                    }
                });

                setDashboards(availableDashboards);
            } catch (error) {
                console.error('Error parsing roles from localStorage', error);

                setDashboards([]);
            }
        } else {
            setDashboards([]);
        }

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, userId]);

    // Close menu on Escape.
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleDashboardClick = () => {
        if (!userid || dashboards.length === 0) {
            return;
        }

        /*
         * dashboards are already sorted using ROLE_PRIORITY,
         * so the first one is the highest-priority dashboard.
         */
        setIsOpen(false);
        router.push(dashboards[0].path);
    };

    const goToDashboard = (path: string) => {
        setIsOpen(false);
        router.push(path);
    };

    return (
        <div>
            {/* Hamburger Button */}
            <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsOpen(!isOpen)}
                className='relative z-50 h-12 w-16 cursor-pointer text-[#f4f4f4] transition-all duration-300 hover:bg-[#2c7bbe]/20'
                aria-label='Toggle menu'
            >
                <div className='flex h-6 w-6 flex-col items-center justify-center'>
                    <span
                        className={`block h-0.5 w-8 transform bg-current transition-all duration-300 ease-in-out ${
                            isOpen ? 'translate-y-1.5 rotate-45 opacity-0' : '-translate-y-[6px]'
                        }`}
                    />

                    <span className={`block h-0.5 w-8 transform bg-current transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`} />

                    <span
                        className={`block h-0.5 w-8 transform bg-current transition-all duration-300 ease-in-out ${
                            isOpen ? '-translate-y-1.5 -rotate-45 opacity-0' : 'translate-y-[6px]'
                        }`}
                    />
                </div>
            </Button>

            {/* Menu Overlay */}
            <div className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsOpen(false)}
                />

                {/* Menu Panel */}
                <div
                    className={`absolute right-0 top-0 flex h-full w-80 flex-col border-l border-[#2c7bbe]/30 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] shadow-2xl transition-all duration-500 ease-in-out ${
                        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}
                >
                    {/* =====================================================
                        HEADER
                        Fixed height: 96px
                        Footer uses exactly the same height.
                    ====================================================== */}
                    <div className='flex h-24 shrink-0 items-center justify-start border-b border-[#2c7bbe]/20 px-6'>
                        <Link
                            href='/'
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-center gap-2 transform transition-all duration-700 delay-100 ${
                                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                            }`}
                        >
                            {/*
                                text-2xl = 24px
                                Logo = 24px

                                Therefore the logo is exactly the same
                                visual size as the Black Snow heading.
                            */}
                            <Image width={27} height={27} src='/logocolored.png' alt='Black Snow' className='h-[27px] w-[27px] shrink-0 object-contain' />

                            <span className='text-2xl font-black leading-none text-white'>Black Snow</span>
                        </Link>
                    </div>

                    {/* =====================================================
                        SCROLLABLE MENU CONTENT
                    ====================================================== */}
                    <div className='min-h-0 flex-1 overflow-y-auto p-6'>
                        <div className='space-y-8'>
                            {menuItems.map((section, sectionIndex) => (
                                <div
                                    key={section.category}
                                    className={`transform transition-all duration-700 ease-out ${
                                        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}
                                    style={{
                                        transitionDelay: isOpen ? `${300 + sectionIndex * 100}ms` : '0ms',
                                    }}
                                >
                                    <h3 className='relative mb-4 text-lg font-black text-[#4cc7e8]'>
                                        {section.category}

                                        <div className='absolute -bottom-1 left-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe]' />
                                    </h3>

                                    <div className='space-y-2'>
                                        {section.items.map((item, itemIndex) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`group block transform rounded-xl border border-transparent px-4 py-3 font-medium text-gray-300 transition-all duration-300 hover:border-[#2c7bbe]/20 hover:bg-gradient-to-r hover:from-[#2c7bbe]/10 hover:to-[#4cc7e8]/10 hover:text-[#4cc7e8] ${
                                                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                                                }`}
                                                style={{
                                                    transitionDelay: isOpen ? `${400 + sectionIndex * 100 + itemIndex * 50}ms` : '0ms',
                                                }}
                                            >
                                                <span className='flex items-center justify-between'>
                                                    {item.name}

                                                    <div className='h-2 w-2 rounded-full bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] opacity-0 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100' />
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* =====================================================
                        FOOTER

                        IMPORTANT:
                        Footer does NOT render at all when:
                        - user is logged in
                        - user has no subscribed dashboard
                        - user is not an admin

                        Header = h-24
                        Footer = h-24
                    ====================================================== */}
                    {shouldShowFooter && (
                        <div
                            className={`flex h-24 shrink-0 items-center justify-center border-t border-[#2c7bbe]/20 bg-[#050608] px-6 transform transition-all duration-700 delay-500 ${
                                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                        >
                            <div className='flex w-full flex-col items-center justify-center gap-2'>
                                {/* -------------------------------------
                                    PRODUCT DASHBOARD

                                    Only appears when the user actually
                                    owns/subscribes to a product role.
                                -------------------------------------- */}
                                {hasProductDashboard && (
                                    <Button
                                        onClick={handleDashboardClick}
                                        className='h-10 w-full max-w-[272px] cursor-pointer rounded-xl bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] px-6 text-2xl font-black leading-none text-white transition-all duration-300 hover:scale-[1.02]'
                                    >
                                        Dashboard
                                    </Button>
                                )}

                                {/* -------------------------------------
                                    ADMIN DASHBOARD
                                -------------------------------------- */}
                                {hasAdminDashboard && (
                                    <Button
                                        variant='outline'
                                        onClick={() => goToDashboard(roleDashboardMap.Admin.path)}
                                        className='h-10 w-full max-w-[272px] cursor-pointer border-[#2c7bbe]/40 bg-transparent px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#2c7bbe]/10 hover:text-white'
                                    >
                                        {roleDashboardMap.Admin.label}
                                    </Button>
                                )}

                                {/* -------------------------------------
                                    SIGN IN

                                    Appears ONLY when completely
                                    logged out.

                                    A logged-in user with no subscription
                                    will NOT see this button.
                                -------------------------------------- */}
                                {!isLoggedIn && (
                                    <Button
                                        asChild
                                        className='h-10 w-full max-w-[272px] cursor-pointer rounded-xl bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] px-6 !text-2xl !font-normal leading-none text-white transition-all duration-300 hover:scale-[1.02]'
                                    >
                                        <Link href='/login' onClick={() => setIsOpen(false)} className='!font-normal'>
                                            Sign in
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
