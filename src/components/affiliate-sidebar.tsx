'use client';

import { BarChart3, LinkIcon, LogOut, StickyNote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

const navigationItems = [
    { title: 'Notes', url: '/affiliate/dashboard/notes', icon: StickyNote },
    { title: 'Links', url: '/affiliate/dashboard/links', icon: LinkIcon },
    { title: 'KPI', url: '/affiliate/dashboard/kpi', icon: BarChart3 },
];

export function AffiliateSidebar(props: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // ✅ Auto logout (10 min inactivity)
    const AUTO_LOGOUT_MS = 10 * 60 * 1000;
    const logoutTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const doLogout = React.useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('roles');
                localStorage.removeItem('userId');
                localStorage.removeItem('affiliateId'); // (safe extra)
                document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            }
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            router.replace('/');
        }
    }, [router]);

    const resetAutoLogoutTimer = React.useCallback(() => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        logoutTimerRef.current = setTimeout(() => {
            // Auto logout without modal
            doLogout();
        }, AUTO_LOGOUT_MS);
        // eslint-disable-next-line
    }, [doLogout]);

    React.useEffect(() => {
        resetAutoLogoutTimer();
        // eslint-disable-next-line
        const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        const onActivity = () => resetAutoLogoutTimer();

        events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

        const onVisibility = () => {
            if (document.visibilityState === 'visible') resetAutoLogoutTimer();
        };
        document.addEventListener('visibilitychange', onVisibility);

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };
        window.addEventListener('keydown', onEsc);

        return () => {
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            events.forEach((ev) => window.removeEventListener(ev, onActivity));
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('keydown', onEsc);
        };
    }, [resetAutoLogoutTimer]);

    // optional: reset timer when route changes
    React.useEffect(() => {
        resetAutoLogoutTimer();
    }, [pathname, resetAutoLogoutTimer]);

    const handleLogout = () => {
        setIsModalOpen(false);
        doLogout();
    };

    return (
        <aside {...props} className='fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col' aria-label='Sidebar'>
            {/* Header / Brand */}
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
                                px-2 py-1 cursor-pointer h-8 whitespace-nowrap
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
                            Affiliate
                        </button>
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

            {/* Logout Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4'>
                    <div className='w-[320px] overflow-hidden rounded-2xl bg-white shadow-2xl'>
                        <div className='px-6 pt-5 pb-4 text-center'>
                            <h2 className='text-[20px] font-semibold text-[#ff3b30]'>Logout</h2>
                            <p className='mt-2 text-[14px] text-black/60'>Are you sure you want to logout?</p>
                        </div>

                        <div className='h-px bg-black/10' />

                        <div className='flex'>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='h-12 w-[50%] text-[18px] text-black/60 active:bg-black/5 transition cursor-pointer'
                            >
                                Cancel
                            </button>

                            <div className='w-px bg-black/10' />

                            <button
                                onClick={handleLogout}
                                className='h-12 text-[18px] w-[50%] cursor-pointer font-semibold text-[#007aff] active:bg-black/5 transition'
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
