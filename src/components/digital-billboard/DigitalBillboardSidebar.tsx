'use client';

import { Button } from '@/components/ui/button';
import axios from 'axios';
import { AlertTriangle, BellOff, CheckCircle, ChevronDown, List, Loader2, LogOut, MessageSquare, Monitor, PlusSquare, Star, X } from 'lucide-react';
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

// TODO: Add the real pause-subscription API endpoint supplied by your backend.
const PAUSE_SUBSCRIPTION_API = '/api/v2/pause-subscription';

type ToolRole = 'EmailMarketing' | 'DigitalBillboard' | 'LightningGold' | 'LightningSilver' | 'InvoiceTool';

type FeedbackStatusResponse = {
    user?: {
        id?: number | string;
        firstName?: string;
        lastName?: string;
        email?: string;
        roles?: string[];
    };
    totalFeedbacks?: number;
    toolsGivenFeedback?: string[];
    toolsWithoutFeedback?: string[];
    feedbacks?: any[];
};

const DASHBOARD_ROUTES: Record<ToolRole, { label: string; url: string }> = {
    EmailMarketing: { label: 'Email Marketing', url: '/emailMarketing/dashboard/users' },
    DigitalBillboard: { label: 'Digital Billboard', url: '/digitalBillboard/dashboard' },
    LightningGold: { label: 'Lightning Gold', url: '/superAffiliate/dashboard/kpi' },
    LightningSilver: { label: 'Lightning Silver', url: '/affiliate/dashboard/kpi' },
    InvoiceTool: { label: 'Invoice Contract', url: '/invoicecontractdashboard/contract' },
};

const isDashboardRole = (role: string): role is ToolRole => Object.prototype.hasOwnProperty.call(DASHBOARD_ROUTES, role);

const hasToolName = (list: string[] | undefined, toolName: string) =>
    Array.isArray(list) && list.some((item) => String(item).toLowerCase() === toolName.toLowerCase());

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

    const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatusResponse | null>(null);
    const [isStatusLoading, setIsStatusLoading] = useState(false);
    const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackReview, setFeedbackReview] = useState('');
    const [feedbackStars, setFeedbackStars] = useState('5');
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [showPauseConfirm, setShowPauseConfirm] = useState(false);
    const [isLoadingPause, setIsLoadingPause] = useState(false);
    const [pauseResult, setPauseResult] = useState<{
        open: boolean;
        type: 'success' | 'error';
        message: string;
    }>({
        open: false,
        type: 'success',
        message: '',
    });

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

    const fetchFeedbackStatus = useCallback(async () => {
        const cookies = parseCookies();
        const id = cookies.id;

        if (!id) return;

        setIsStatusLoading(true);

        try {
            const response = await axios.get(`/api/v5/tool-feedback/status?authId=${encodeURIComponent(id)}`);
            setFeedbackStatus(response.data || null);
        } catch (error) {
            console.error('Error fetching feedback status:', error);
        } finally {
            setIsStatusLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedbackStatus();
    }, [fetchFeedbackStatus]);

    const dashboardRoles = useMemo(() => {
        const roles = feedbackStatus?.user?.roles;
        return Array.isArray(roles) ? roles.filter(isDashboardRole) : [];
    }, [feedbackStatus]);

    const dashboardOptions = useMemo(
        () => dashboardRoles.filter((role) => role !== UNSUBSCRIBE_PRODUCT.id).map((role) => ({ role, ...DASHBOARD_ROUTES[role] })),
        [dashboardRoles]
    );

    const showDashboardButton = dashboardRoles.length > 1 && dashboardOptions.length > 0;

    const showFeedbackButton = useMemo(() => {
        if (!feedbackStatus || isStatusLoading) return false;

        const alreadyGiven = hasToolName(feedbackStatus.toolsGivenFeedback, UNSUBSCRIBE_PRODUCT.id);
        const needsFeedback = hasToolName(feedbackStatus.toolsWithoutFeedback, UNSUBSCRIBE_PRODUCT.id);

        return needsFeedback && !alreadyGiven;
    }, [feedbackStatus, isStatusLoading]);

    const openFeedbackModal = () => {
        setFeedbackReview('');
        setFeedbackStars('5');
        setFeedbackError(null);
        setShowFeedbackModal(true);
    };

    const submitFeedback = useCallback(async () => {
        if (isSubmittingFeedback) return;

        const cookies = parseCookies();
        const id = cookies.id;
        const review = feedbackReview.trim();

        if (!id) {
            setFeedbackError('User session was not found. Please sign in again and try to submit feedback.');
            return;
        }

        if (!review) {
            setFeedbackError('Please write your review before submitting.');
            return;
        }

        const confirmed = window.confirm('Are you sure you want to submit this feedback? Please recheck your review and stars before confirming.');
        if (!confirmed) return;

        setIsSubmittingFeedback(true);
        setFeedbackError(null);

        try {
            await axios.post('/api/v5/tool-feedback', {
                authId: id,
                review,
                stars: feedbackStars,
                toolName: UNSUBSCRIBE_PRODUCT.id,
            });

            setShowFeedbackModal(false);
            setFeedbackSuccess('Feedback submitted successfully!');
            setTimeout(() => setFeedbackSuccess(null), 3000);
            await fetchFeedbackStatus();
        } catch (error: any) {
            setFeedbackError(error?.response?.data?.message || 'Unable to submit feedback. Please try again.');
        } finally {
            setIsSubmittingFeedback(false);
        }
    }, [feedbackReview, feedbackStars, fetchFeedbackStatus, isSubmittingFeedback]);

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

    const readLocalStorageArray = (key: string): string[] => {
        if (typeof window === 'undefined') return [];

        try {
            const parsed = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
        } catch {
            return [];
        }
    };

    const moveCurrentRoleToPausedRoles = () => {
        const currentRole = UNSUBSCRIBE_PRODUCT.id;
        const roles = readLocalStorageArray('roles');
        const pausedRoles = readLocalStorageArray('pausedRoles');

        const updatedRoles = roles.filter((role) => role !== currentRole);
        const updatedPausedRoles = pausedRoles.includes(currentRole) ? pausedRoles : [...pausedRoles, currentRole];

        localStorage.setItem('roles', JSON.stringify(updatedRoles));
        localStorage.setItem('pausedRoles', JSON.stringify(updatedPausedRoles));

        return updatedRoles;
    };

    const confirmPause = useCallback(async () => {
        if (isLoadingPause) return;

        const cookies = parseCookies();
        const id = cookies.id;

        if (!id) {
            setShowPauseConfirm(false);
            setPauseResult({
                open: true,
                type: 'error',
                message: 'User session was not found. Please sign in again and try to pause this subscription.',
            });
            return;
        }

        if (!PAUSE_SUBSCRIPTION_API.trim()) {
            setShowPauseConfirm(false);
            setPauseResult({
                open: true,
                type: 'error',
                message: 'Pause API endpoint is not configured. Add the endpoint in PAUSE_SUBSCRIPTION_API.',
            });
            return;
        }

        setIsLoadingPause(true);

        try {
            const response = await axios.patch(`${PAUSE_SUBSCRIPTION_API}?authId=${encodeURIComponent(id)}&product=${UNSUBSCRIBE_PRODUCT.id}`);

            if (response.status >= 200 && response.status < 300) {
                const remainingRoles = moveCurrentRoleToPausedRoles();
                setShowPauseConfirm(false);
                setPauseResult({
                    open: true,
                    type: 'success',
                    message: response.data?.message || `${UNSUBSCRIBE_PRODUCT.label} subscription paused successfully.`,
                });

                const nextRole = remainingRoles.find(isDashboardRole);
                if (nextRole) {
                    router.replace(DASHBOARD_ROUTES[nextRole].url);
                } else {
                    router.replace('/');
                }
                return;
            }

            throw new Error(response.data?.message || 'Unable to pause subscription.');
        } catch (error: any) {
            console.error('Error pausing subscription:', error);
            setShowPauseConfirm(false);
            setPauseResult({
                open: true,
                type: 'error',
                message: error?.response?.data?.message || error?.message || `Unable to pause ${UNSUBSCRIBE_PRODUCT.label}. Please try again.`,
            });
        } finally {
            setIsLoadingPause(false);
        }
        // eslint-disable-next-line
    }, [isLoadingPause, router]);

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
                    {showDashboardButton && (
                        <div className='relative'>
                            <button
                                type='button'
                                onClick={() => setDashboardDropdownOpen((prev) => !prev)}
                                className='w-full text-left flex items-center border border-gray-300 mb-2 justify-between gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 font-medium cursor-pointer'
                            >
                                <span className='flex items-center gap-3'>
                                    <Monitor className='w-4 h-4' />
                                    <span>Dashboard</span>
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${dashboardDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dashboardDropdownOpen && (
                                <div className='mt-1 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden'>
                                    {dashboardOptions.map((item) => (
                                        <button
                                            key={item.role}
                                            type='button'
                                            onClick={() => {
                                                setDashboardDropdownOpen(false);
                                                closeMobile?.();
                                                router.push(item.url);
                                            }}
                                            className='w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer'
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
                    className='w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 bg-amber-200 border-[1px] border-amber-300  hover:bg-amber-400/70 hover:text-amber-700 transition-all duration-200 font-medium cursor-pointer'
                    type='button'
                    onClick={() => setShowPauseConfirm(true)}
                >
                    <BellOff className='w-4 h-4' />
                    <span>Pause</span>
                </button>

                {feedbackSuccess && (
                    <div className='mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700'>{feedbackSuccess}</div>
                )}

                {showFeedbackButton && (
                    <div className='space-y-2'>
                        {showFeedbackButton && (
                            <button
                                type='button'
                                onClick={openFeedbackModal}
                                className='w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium cursor-pointer'
                            >
                                <MessageSquare className='w-4 h-4' />
                                <span>Feedback</span>
                            </button>
                        )}
                    </div>
                )}

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

            {/* Pause subscription confirmation modal */}
            {showPauseConfirm && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center px-4'>
                    <div className='absolute inset-0 bg-black/40 backdrop-blur-md' onClick={() => !isLoadingPause && setShowPauseConfirm(false)} />

                    <div className='relative z-[61] w-full max-w-md overflow-hidden rounded-[32px] border border-amber-500/35 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] shadow-2xl shadow-amber-500/20'>
                        <button
                            type='button'
                            disabled={isLoadingPause}
                            onClick={() => setShowPauseConfirm(false)}
                            className='absolute right-4 top-4 z-20 w-10 h-10 rounded-2xl flex items-center justify-center bg-black/45 border border-amber-500/35 hover:border-amber-500/70 hover:bg-amber-500/10 transition-all duration-300 disabled:opacity-50'
                        >
                            <X className='w-5 h-5 text-amber-400' />
                        </button>

                        <div className='px-7 py-8 text-center'>
                            <div className='mx-auto h-16 w-16 rounded-2xl border border-amber-500/35 bg-amber-500/10 flex items-center justify-center mb-5'>
                                <AlertTriangle className='h-8 w-8 text-amber-400' />
                            </div>

                            <h2 className='text-2xl font-black text-white mb-3'>Pause Subscription</h2>
                            <p className='text-gray-300 text-sm leading-relaxed'>
                                Are you sure you want to pause the subscription of{' '}
                                <span className='font-black text-amber-300'>{UNSUBSCRIBE_PRODUCT.label}</span>?
                            </p>

                            <div className='mt-7 flex flex-col gap-3'>
                                <button
                                    type='button'
                                    disabled={isLoadingPause}
                                    onClick={confirmPause}
                                    className='w-full rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black py-5 text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    {isLoadingPause ? (
                                        <span className='flex items-center justify-center gap-2'>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Pausing...
                                        </span>
                                    ) : (
                                        'Yes, Pause Subscription'
                                    )}
                                </button>

                                <button
                                    type='button'
                                    disabled={isLoadingPause}
                                    onClick={() => setShowPauseConfirm(false)}
                                    className='w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black py-5 text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pause result modal */}
            {pauseResult.open && (
                <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-md px-4'>
                    <div className='w-full max-w-md rounded-[28px] border border-white/10 bg-[#08090c] p-7 text-center shadow-2xl'>
                        {pauseResult.type === 'success' ? (
                            <CheckCircle className='mx-auto h-14 w-14 text-emerald-400' />
                        ) : (
                            <AlertTriangle className='mx-auto h-14 w-14 text-red-400' />
                        )}
                        <h2 className='mt-4 text-2xl font-black text-white'>{pauseResult.type === 'success' ? 'Subscription Paused' : 'Pause Failed'}</h2>
                        <p className='mt-3 text-sm leading-relaxed text-white/60'>{pauseResult.message}</p>
                        <button
                            type='button'
                            onClick={() => setPauseResult((prev) => ({ ...prev, open: false }))}
                            className='mt-6 w-full rounded-2xl bg-white py-4 font-black text-black hover:bg-white/90'
                        >
                            Close
                        </button>
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

            {/* Feedback modal */}
            {showFeedbackModal && (
                <div className='fixed inset-0 z-[80] flex items-center justify-center px-4'>
                    <div className='absolute inset-0 bg-black/40 backdrop-blur-md' onClick={() => !isSubmittingFeedback && setShowFeedbackModal(false)} />

                    <div
                        className='relative rounded-[32px] z-[81] border w-full max-w-[540px] overflow-hidden backdrop-blur-2xl'
                        style={{
                            borderColor: 'rgba(255,255,255,0.1)',
                            background: `
    linear-gradient(
      180deg,
      rgba(14, 17, 21, 0.74) 0%,
      rgba(8, 11, 15, 0.68) 45%,
      rgba(16, 19, 23, 0.72) 100%
    ),
    radial-gradient(
      circle at 50% 115%,
      rgba(255, 255, 255, 0.09) 0%,
      rgba(255, 255, 255, 0.025) 34%,
      transparent 62%
    ),
    radial-gradient(
      circle at 50% -10%,
      rgba(0, 194, 255, 0.08) 0%,
      transparent 42%
    )
  `,
                            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                            backdropFilter: 'blur(20px) saturate(160%)',
                            boxShadow: '0 28px 80px rgba(0,0,0,0.78), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)',
                        }}
                    >
                        {/* <div className='absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16)_0%,transparent_38%)]' /> */}
                        {/* <div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent' /> */}

                        <button
                            type='button'
                            disabled={isSubmittingFeedback}
                            onClick={() => setShowFeedbackModal(false)}
                            className='absolute right-4 top-4 z-20 w-10 h-10 rounded-2xl flex items-center justify-center bg-black/45 border border-emerald-400/25 hover:border-emerald-400/60 hover:bg-emerald-400/10 transition-all duration-300 disabled:opacity-50'
                            aria-label='Close feedback modal'
                        >
                            <X className='w-5 h-5 text-emerald-200/80' />
                        </button>

                        <div className='relative z-10 px-7 py-8'>
                            <div className='mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-700/35 bg-emerald-400/10 shadow-xl shadow-emerald-700/20'>
                                <Image src='/logocolored.png' alt='Black Snow Logo' width={58} height={58} className='object-contain drop-shadow-2xl' />
                            </div>

                            <h2 className='text-center text-3xl font-black text-white mb-2'>Feedback</h2>
                            <p className='text-center text-sm text-white/50 mb-7'>Share your {UNSUBSCRIBE_PRODUCT.label} experience.</p>

                            {feedbackError && (
                                <div className='mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200'>{feedbackError}</div>
                            )}

                            <div className='space-y-4'>
                                <div className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-[7px]'>
                                    <div className='mb-4 flex items-center justify-between gap-3'>
                                        <label className='block text-sm font-black text-white'>Review</label>
                                        <span className='rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300'>
                                            {feedbackStars}/5 Stars
                                        </span>
                                    </div>

                                    <div className='flex items-center justify-center gap-2'>
                                        {Array.from({ length: 5 }, (_, index) => {
                                            const starValue = index + 1;
                                            const selected = Number(feedbackStars) >= starValue;

                                            return (
                                                <button
                                                    key={starValue}
                                                    type='button'
                                                    disabled={isSubmittingFeedback}
                                                    onClick={() => setFeedbackStars(String(starValue))}
                                                    className={`rounded-xl p-1.5 transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        selected
                                                            ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.45)]'
                                                            : 'text-white/20 hover:text-emerald-200/70'
                                                    }`}
                                                    aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
                                                >
                                                    <Star className='h-9 w-9' fill={selected ? 'currentColor' : 'none'} strokeWidth={2} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-[7px]'>
                                    <label className='mb-3 block text-sm font-black text-white'>Feedback</label>
                                    <textarea
                                        value={feedbackReview}
                                        onChange={(e) => setFeedbackReview(e.target.value)}
                                        disabled={isSubmittingFeedback}
                                        rows={5}
                                        placeholder='Write your feedback here...'
                                        className='w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10 disabled:opacity-60'
                                    />
                                </div>
                            </div>

                            <div className='mt-7 flex flex-col gap-3'>
                                <button
                                    type='button'
                                    disabled={isSubmittingFeedback}
                                    onClick={submitFeedback}
                                    className='w-full rounded-2xl border border-emerald-400/40 bg-emerald-500/90 hover:bg-emerald-500 text-white font-black py-5 text-base shadow-md shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    {isSubmittingFeedback ? (
                                        <span className='flex items-center justify-center gap-2'>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Submitting...
                                        </span>
                                    ) : (
                                        'Submit Feedback'
                                    )}
                                </button>

                                <button
                                    type='button'
                                    disabled={isSubmittingFeedback}
                                    onClick={() => setShowFeedbackModal(false)}
                                    className='w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black py-5 text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
