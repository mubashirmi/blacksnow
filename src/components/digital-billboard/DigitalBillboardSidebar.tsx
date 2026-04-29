'use client';

import { Button } from '@/components/ui/button';
import axios from 'axios';
import { AlertTriangle, BellOff, CheckCircle, ChevronDown, List, Loader2, LogOut, Monitor, PlusSquare, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { destroyCookie, parseCookies } from 'nookies';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ActiveKey = 'list' | 'create' | 'edit';

const UNSUBSCRIBE_PRODUCT = {
    id: 'DigitalBillboard',
    label: 'Digital Billboard',
};

export function DigitalBillboardSidebar({
    activeKey,
    canCreateMore,
    onShowList,
    onCreate,
    onLogout,
    closeMobile,
}: {
    activeKey: ActiveKey;
    canCreateMore: boolean;
    onShowList: () => void;
    onCreate: () => void;
    onLogout: () => void;
    closeMobile: () => void;
}) {
    const router = useRouter();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(false);
    const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = useState(false);
    const [unsubscribeResult, setUnsubscribeResult] = useState<{
        open: boolean;
        type: 'success' | 'error';
        message: string;
    }>({
        open: false,
        type: 'success',
        message: '',
    });

    const unsubscribeRedirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (unsubscribeRedirectTimerRef.current) {
                clearTimeout(unsubscribeRedirectTimerRef.current);
            }
        };
    }, []);

    const navigationItems = useMemo(
        () => [
            {
                title: 'Digital Billboard',
                icon: Monitor,
                children: [
                    { title: 'My Billboards', icon: List, key: 'list' as const, onClick: onShowList },
                    { title: 'Create Billboard', icon: PlusSquare, key: 'create' as const, onClick: onCreate, disabled: !canCreateMore },
                ],
            },
        ],
        [onShowList, onCreate, canCreateMore]
    );

    const toggleMenu = (title: string) => setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));

    const clearSession = useCallback(() => {
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
        }
    }, []);

    const performDashboardLogout = useCallback(() => {
        clearSession();

        setShowLogoutConfirm(false);
        setShowUnsubscribeConfirm(false);
        setUnsubscribeResult((prev) => ({ ...prev, open: false }));

        closeMobile?.();
        onLogout?.();

        router.push('/');
    }, [clearSession, closeMobile, onLogout, router]);

    const cancelLogout = () => setShowLogoutConfirm(false);

    const confirmLogout = () => {
        performDashboardLogout();
    };

    const confirmUnsubscribe = useCallback(async () => {
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
                    performDashboardLogout();
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
    }, [isLoadingUnsubscribe, performDashboardLogout]);

    const closeResultModal = () => {
        if (unsubscribeResult.type === 'success') {
            performDashboardLogout();
            return;
        }

        setUnsubscribeResult((prev) => ({ ...prev, open: false }));
    };

    return (
        <div className='h-full flex flex-col'>
            {/* Header */}
            <div className='p-6 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                    <div className='relative transform hover:scale-105 transition-transform duration-300'>
                        <Link href='/' onClick={closeMobile}>
                            <Image src='/logoblack.png' alt='Black Snow Logo' width={80} height={80} className='object-contain drop-shadow-md' />
                        </Link>
                    </div>

                    <div>
                        <span className='font-bold text-xl text-gray-800 ml-1'>Black Snow</span>

                        <button
                            type='button'
                            className='items-center gap-2 px-2 py-1 cursor-pointer text-sm font-medium text-[#0b0b0b]/80 border border-[#0b0b0b]/30 bg-transparent rounded-xl transition hover:bg-[#0b0b0b] hover:text-white'
                        >
                            Digital Billboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div className='flex-1 overflow-y-auto p-4'>
                <div className='space-y-1'>
                    {navigationItems.map((item) => {
                        const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0;

                        if (hasChildren) {
                            const title = item.title;
                            const isChildActive = (item as any).children.some((c: any) => c.key === activeKey);
                            const isOpen = openMenus[title] ?? isChildActive;

                            return (
                                <div key={title} className='space-y-1'>
                                    <button
                                        type='button'
                                        onClick={() => toggleMenu(title)}
                                        className={`
                                            w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                                            ${isChildActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                                        `}
                                    >
                                        <span className='flex items-center gap-3'>
                                            <item.icon className='w-4 h-4' />
                                            <span>{title}</span>
                                        </span>

                                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isOpen && (
                                        <div className='ml-4 space-y-1'>
                                            {(item as any).children.map((child: any) => {
                                                const childActive = child.key === activeKey;
                                                const disabled = Boolean(child.disabled);

                                                return (
                                                    <button
                                                        key={child.title}
                                                        type='button'
                                                        onClick={() => {
                                                            if (disabled) return;
                                                            child.onClick?.();
                                                            closeMobile();
                                                        }}
                                                        disabled={disabled}
                                                        className={`
                                                            w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-left
                                                            ${
                                                                childActive
                                                                    ? 'bg-gray-800 text-white shadow-md'
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                                            }
                                                            ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-600' : ''}
                                                        `}
                                                    >
                                                        <child.icon className='w-4 h-4' />
                                                        <span>{child.title}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className='p-4 border-t border-gray-100 space-y-2'>
                <button
                    onClick={() => setShowUnsubscribeConfirm(true)}
                    className='flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium cursor-pointer'
                >
                    <BellOff className='w-4 h-4' />
                    <span>Unsubscribe</span>
                </button>

                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className='flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium cursor-pointer'
                >
                    <LogOut className='w-4 h-4' />
                    <span>Logout</span>
                </button>
            </div>

            {/* Logout confirmation modal */}
            {showLogoutConfirm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center'>
                    <div className='absolute inset-0 bg-black/20 backdrop-blur-md transition-all duration-500 ease-in-out opacity-100' onClick={cancelLogout} />

                    <div className='relative z-50 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-2xl p-6 w-96 transform transition-all duration-500 ease-in-out scale-100 opacity-100'>
                        <h2 className='text-2xl font-black bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent mb-4'>Confirm Logout</h2>

                        <p className='text-gray-300 mb-6'>Are you sure you want to logout?</p>

                        <div className='flex justify-end space-x-4'>
                            <Button
                                onClick={cancelLogout}
                                className='bg-transparent border-2 border-[#2c7bbe] text-[#2c7bbe] hover:bg-[#2c7bbe] cursor-pointer hover:text-white transition-all duration-300 font-bold py-2 px-4 rounded-xl'
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={confirmLogout}
                                className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white font-bold py-2 px-4 rounded-xl transform hover:scale-105 transition-all duration-300 cursor-pointer'
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unsubscribe confirmation modal */}
            {showUnsubscribeConfirm && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center px-4'>
                    <div
                        className='absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-500 ease-in-out opacity-100'
                        onClick={() => !isLoadingUnsubscribe && setShowUnsubscribeConfirm(false)}
                    />

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
                                <Button
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
                                </Button>

                                <Button
                                    type='button'
                                    disabled={isLoadingUnsubscribe}
                                    onClick={() => setShowUnsubscribeConfirm(false)}
                                    className='w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black py-5 text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    Cancel
                                </Button>
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

                            <Button
                                type='button'
                                onClick={closeResultModal}
                                className={`mt-8 w-full rounded-2xl text-white font-black py-5 text-base shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
                                    unsubscribeResult.type === 'success'
                                        ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-600/30'
                                        : 'bg-red-700 hover:bg-red-800 shadow-red-600/40'
                                }`}
                            >
                                {unsubscribeResult.type === 'success' ? 'Continue' : 'Close'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
