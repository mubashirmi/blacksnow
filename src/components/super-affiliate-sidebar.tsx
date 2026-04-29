'use client';

import axios from 'axios';
import { AlertTriangle, BarChart3, BellOff, CheckCircle, LinkIcon, Loader2, LogOut, StickyNote, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { destroyCookie, parseCookies } from 'nookies';
import * as React from 'react';

const navigationItems = [
    { title: 'Notes', url: '/superAffiliate/dashboard/notes', icon: StickyNote },
    { title: 'Links', url: '/superAffiliate/dashboard/links', icon: LinkIcon },
    { title: 'KPI', url: '/superAffiliate/dashboard/kpi', icon: BarChart3 },
];

const UNSUBSCRIBE_PRODUCT = {
    id: 'LightningGold',
    label: 'Lightning Gold',
};

export function SuperAffiliateSidebar(props: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = React.useState(false);
    const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = React.useState(false);
    const [unsubscribeResult, setUnsubscribeResult] = React.useState<{
        open: boolean;
        type: 'success' | 'error';
        message: string;
    }>({
        open: false,
        type: 'success',
        message: '',
    });

    // ✅ Auto logout (10 min inactivity)
    const AUTO_LOGOUT_MS = 10 * 60 * 1000;
    const logoutTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const unsubscribeRedirectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearSession = React.useCallback(() => {
        destroyCookie(null, 'id');
        destroyCookie(null, 'token');
        destroyCookie(null, 'admin_token');
        destroyCookie(null, 'firstName');
        destroyCookie(null, 'lastName');
        destroyCookie(null, 'adminId');

        if (typeof window !== 'undefined') {
            localStorage.removeItem('userId');
            localStorage.removeItem('id');
            localStorage.removeItem('adminId');
            localStorage.removeItem('roles');
            localStorage.removeItem('referredby');
            localStorage.removeItem('affiliateId');
            localStorage.removeItem('superAffiliateId');
        }
    }, []);

    const doLogout = React.useCallback(() => {
        try {
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }

            if (unsubscribeRedirectTimerRef.current) {
                clearTimeout(unsubscribeRedirectTimerRef.current);
            }

            clearSession();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            setIsModalOpen(false);
            setShowUnsubscribeConfirm(false);
            setUnsubscribeResult((prev) => ({ ...prev, open: false }));
            router.replace('/');
        }
    }, [clearSession, router]);

    const resetAutoLogoutTimer = React.useCallback(() => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        logoutTimerRef.current = setTimeout(() => {
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
            if (e.key === 'Escape') {
                setIsModalOpen(false);

                if (!isLoadingUnsubscribe) {
                    setShowUnsubscribeConfirm(false);
                }
            }
        };

        window.addEventListener('keydown', onEsc);

        return () => {
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (unsubscribeRedirectTimerRef.current) clearTimeout(unsubscribeRedirectTimerRef.current);

            events.forEach((ev) => window.removeEventListener(ev, onActivity));
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('keydown', onEsc);
        };
    }, [resetAutoLogoutTimer, isLoadingUnsubscribe]);

    React.useEffect(() => {
        resetAutoLogoutTimer();
    }, [pathname, resetAutoLogoutTimer]);

    const handleLogout = () => {
        setIsModalOpen(false);
        doLogout();
    };

    const confirmUnsubscribe = React.useCallback(async () => {
        if (isLoadingUnsubscribe) return;

        const cookies = parseCookies();
        const id = cookies.id;

        if (!id) {
            setShowUnsubscribeConfirm(false);
            setUnsubscribeResult({
                open: true,
                type: 'error',
                message: 'User session was not found. Please sign in again and try to unsubscribe.',
            });
            return;
        }

        setIsLoadingUnsubscribe(true);

        try {
            const response = await axios.post(`/api/v2/cancel-subscription?id=${encodeURIComponent(id)}`, {
                product: UNSUBSCRIBE_PRODUCT.id,
            });

            if (response.status === 200) {
                setShowUnsubscribeConfirm(false);
                setUnsubscribeResult({
                    open: true,
                    type: 'success',
                    message: response.data?.message || `${UNSUBSCRIBE_PRODUCT.label} subscription cancelled successfully. You will be logged out now.`,
                });

                if (unsubscribeRedirectTimerRef.current) {
                    clearTimeout(unsubscribeRedirectTimerRef.current);
                }

                unsubscribeRedirectTimerRef.current = setTimeout(() => {
                    doLogout();
                }, 3000);

                return;
            }

            setShowUnsubscribeConfirm(false);
            setUnsubscribeResult({
                open: true,
                type: 'error',
                message: response.data?.message || `Unable to unsubscribe from ${UNSUBSCRIBE_PRODUCT.label}. Please try again.`,
            });
        } catch (error: any) {
            console.error('Error unsubscribing:', error);

            setShowUnsubscribeConfirm(false);
            setUnsubscribeResult({
                open: true,
                type: 'error',
                message: error?.response?.data?.message || `Unable to unsubscribe from ${UNSUBSCRIBE_PRODUCT.label}. Please try again or contact support.`,
            });
        } finally {
            setIsLoadingUnsubscribe(false);
        }
    }, [doLogout, isLoadingUnsubscribe]);

    const closeResultModal = () => {
        if (unsubscribeResult.type === 'success') {
            doLogout();
            return;
        }

        setUnsubscribeResult((prev) => ({ ...prev, open: false }));
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
                            type='button'
                            className='
                                px-2 py-1 cursor-pointer h-8 whitespace-nowrap
                                text-sm font-semibold
                                text-[#0b0b0b]/80
                                border border-[#0b0b0b]/30
                                rounded-xl
                                transition
                                bg-[#ffd500]
                            '
                        >
                            Lightning Gold
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

            {/* Footer */}
            <div className='p-4 border-t border-gray-100 space-y-2'>
                <button
                    className='w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium cursor-pointer'
                    type='button'
                    onClick={() => setShowUnsubscribeConfirm(true)}
                >
                    <BellOff className='w-4 h-4' />
                    <span>Unsubscribe</span>
                </button>

                <button
                    className='w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium cursor-pointer'
                    type='button'
                    onClick={() => setIsModalOpen(true)}
                >
                    <LogOut className='w-4 h-4' />
                    <span>Logout</span>
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

            {/* Unsubscribe confirmation modal */}
            {showUnsubscribeConfirm && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center px-4'>
                    <div className='absolute inset-0 bg-black/40 backdrop-blur-md' onClick={() => !isLoadingUnsubscribe && setShowUnsubscribeConfirm(false)} />

                    <div className='relative z-[61] w-full max-w-md overflow-hidden rounded-[32px] border border-red-500/35 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] shadow-2xl shadow-red-500/20'>
                        <div className='absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-800 via-red-500 to-red-800' />

                        <button
                            type='button'
                            disabled={isLoadingUnsubscribe}
                            onClick={() => setShowUnsubscribeConfirm(false)}
                            className='absolute right-4 top-4 z-20 w-10 h-10 rounded-2xl flex items-center justify-center bg-black/45 border border-red-500/35 hover:border-red-500/70 hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50'
                        >
                            <X className='w-5 h-5 text-red-400' />
                        </button>

                        <div className='px-7 py-8 text-center'>
                            <div className='mx-auto h-16 w-16 rounded-2xl border border-red-500/35 bg-red-500/10 flex items-center justify-center mb-5 shadow-xl shadow-red-500/20'>
                                <AlertTriangle className='h-8 w-8 text-red-400' />
                            </div>

                            <h2 className='text-2xl font-black text-white mb-3'>Confirm Unsubscribe</h2>

                            <p className='text-gray-300 text-sm leading-relaxed'>
                                Are you sure you want to unsubscribe from <span className='font-black text-red-300'>{UNSUBSCRIBE_PRODUCT.label}</span>?
                            </p>

                            <div className='mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-left'>
                                <p className='text-sm font-bold text-white'>Before you continue</p>
                                <p className='text-xs text-white/50 leading-relaxed mt-1'>
                                    Your subscription will be cancelled and you will be logged out after successful unsubscribe.
                                </p>
                            </div>

                            <div className='mt-7 flex flex-col gap-3'>
                                <button
                                    type='button'
                                    disabled={isLoadingUnsubscribe}
                                    onClick={confirmUnsubscribe}
                                    className='w-full rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black py-5 text-base shadow-md shadow-red-600/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    {isLoadingUnsubscribe ? (
                                        <span className='flex items-center justify-center gap-2'>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Unsubscribing...
                                        </span>
                                    ) : (
                                        'Yes, Unsubscribe'
                                    )}
                                </button>

                                <button
                                    type='button'
                                    disabled={isLoadingUnsubscribe}
                                    onClick={() => setShowUnsubscribeConfirm(false)}
                                    className='w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black py-5 text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Unsubscribe result modal */}
            {unsubscribeResult.open && (
                <div className='fixed inset-0 z-[70] flex items-center justify-center px-4'>
                    <div className='absolute inset-0 bg-black/40 backdrop-blur-md' onClick={closeResultModal} />

                    <div className='relative z-[71] w-full max-w-md overflow-hidden rounded-[32px] border border-red-500/35 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] shadow-2xl shadow-red-500/20'>
                        <div className='absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-800 via-red-500 to-red-800' />

                        <button
                            type='button'
                            onClick={closeResultModal}
                            className='absolute right-4 top-4 z-20 w-10 h-10 rounded-2xl flex items-center justify-center bg-black/45 border border-red-500/35 hover:border-red-500/70 hover:bg-red-500/10 transition-all duration-300'
                        >
                            <X className='w-5 h-5 text-red-400' />
                        </button>

                        <div className='px-7 py-10 text-center'>
                            <div
                                className={`mx-auto h-20 w-20 rounded-3xl border flex items-center justify-center mb-6 shadow-xl ${
                                    unsubscribeResult.type === 'success'
                                        ? 'border-emerald-400/35 bg-emerald-400/10 shadow-emerald-500/20'
                                        : 'border-red-500/35 bg-red-500/10 shadow-red-500/20'
                                }`}
                            >
                                {unsubscribeResult.type === 'success' ? (
                                    <CheckCircle className='h-10 w-10 text-emerald-300' />
                                ) : (
                                    <X className='h-10 w-10 text-red-400' />
                                )}
                            </div>

                            <h2 className='text-2xl font-black text-white mb-3'>
                                {unsubscribeResult.type === 'success' ? 'Unsubscribed Successfully' : 'Unsubscribe Failed'}
                            </h2>

                            <p className='text-gray-300 text-sm leading-relaxed'>{unsubscribeResult.message}</p>

                            <button
                                type='button'
                                onClick={closeResultModal}
                                className={`mt-8 w-full rounded-2xl text-white font-black py-5 text-base shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
                                    unsubscribeResult.type === 'success'
                                        ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-600/30'
                                        : 'bg-red-700 hover:bg-red-800 shadow-red-600/40'
                                }`}
                            >
                                {unsubscribeResult.type === 'success' ? 'Continue' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
