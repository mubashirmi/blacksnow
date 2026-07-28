import axios from 'axios';
import { useRouter } from 'next/router';
import type React from 'react';
import { useEffect, useState } from 'react';
import InvoiceContractSidebar from './InvoiceContractSidebar';

interface UserData {
    id: number;
    adminStripeConnectId: string | null;
    [key: string]: unknown;
}

interface ApiResponse {
    message: string;
    data: UserData;
}

export default function InvoiceDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnectingStripe, setIsConnectingStripe] = useState(false);
    const [showStripeModal, setShowStripeModal] = useState(false);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let componentIsMounted = true;

        const checkAuthAndStripeConnection = async () => {
            try {
                setIsLoading(true);
                setError('');

                // Get roles from localStorage.
                const storedRoles = localStorage.getItem('roles');
                const parsedRoles = storedRoles ? JSON.parse(storedRoles) : [];

                const roles: string[] = Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles];

                // Get authentication values from cookies.
                const token = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('token='))
                    ?.split('=')[1];

                const cookieId = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('id='))
                    ?.split('=')[1];

                /*
                 * Keep the existing dashboard authentication condition.
                 * Redirect when no token, ID, or required role is available.
                 */
                if (!token && !cookieId && !roles.includes('EmailMarketing')) {
                    await router.push('/login');
                    return;
                }

                // Use localStorage userId first, then fall back to cookie ID.
                const storedUserId = localStorage.getItem('userId');
                const userIdValue = storedUserId || cookieId;

                if (!userIdValue) {
                    await router.push('/login');
                    return;
                }

                // Remove quotation marks if the ID was stored as a JSON string.
                const cleanedUserId = userIdValue.replace(/^"|"$/g, '');
                const userId = Number(cleanedUserId);

                if (!Number.isInteger(userId) || userId <= 0) {
                    console.error('Invalid user ID:', userIdValue);
                    await router.push('/login');
                    return;
                }

                try {
                    /*
                     * Check whether the user has completed
                     * Stripe Connect onboarding.
                     */
                    const response = await axios.get<ApiResponse>(`/api/v2/stripe-connect/?id=${userId}`, {
                        timeout: 10000,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!componentIsMounted) {
                        return;
                    }

                    /*
                     * A 204 response means the user exists,
                     * but Stripe onboarding is not completed.
                     */
                    if (response.status === 204) {
                        setUserData({
                            id: userId,
                            adminStripeConnectId: null,
                        });

                        setShowStripeModal(true);
                        setError('');
                        return;
                    }

                    // Store the user and check their Stripe Connect ID.
                    const fetchedUserData = response.data.data;

                    setUserData(fetchedUserData);

                    setShowStripeModal(!fetchedUserData?.adminStripeConnectId);
                } catch (apiError: any) {
                    if (!componentIsMounted) {
                        return;
                    }

                    console.error('Stripe connection status check failed:', apiError);

                    if (apiError.code === 'NETWORK_ERROR' || apiError.message === 'Network Error') {
                        setError('Unable to connect to the server. Please check your internet connection and try again.');
                    } else if (apiError.response?.status === 404) {
                        setError('Your account information could not be found. Please log in again.');
                    } else if (apiError.response?.status === 401) {
                        await router.push('/login');
                        return;
                    } else if (apiError.code === 'ECONNABORTED') {
                        setError('The request timed out. Please try again.');
                    } else {
                        setError(apiError.response?.data?.message || 'Failed to check your Stripe connection. Please try again.');
                    }
                }
            } catch (authError) {
                if (!componentIsMounted) {
                    return;
                }

                console.error('Auth check failed:', authError);
                await router.push('/login');
            } finally {
                if (componentIsMounted) {
                    setIsLoading(false);
                }
            }
        };

        checkAuthAndStripeConnection();

        return () => {
            componentIsMounted = false;
        };
    }, [router, retryCount]);

    const handleStripeConnect = async () => {
        try {
            setIsConnectingStripe(true);
            setError('');

            const storedUserId = localStorage.getItem('userId');

            const cookieId = document.cookie
                .split('; ')
                .find((row) => row.startsWith('id='))
                ?.split('=')[1];

            const userIdValue = storedUserId || cookieId;

            if (!userIdValue) {
                throw new Error('User ID not found');
            }

            const cleanedUserId = userIdValue.replace(/^"|"$/g, '');
            const userId = Number(cleanedUserId);

            if (!Number.isInteger(userId) || userId <= 0) {
                throw new Error('Invalid user ID');
            }

            const connectData = {
                id: userId,
                invoiceToolLink: 'https://blacksnowholdings.com/InvoiceContract',
                digitalBillboardLink: 'https://blacksnowholdings.com/advertising',
                emailMarketingLink: 'https://blacksnowholdings.com/emailMarketing',
            };

            const response = await axios.post('/api/v2/stripe-connect', connectData, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const onboardingUrl = response.data?.onboardingUrl;

            if (!onboardingUrl) {
                throw new Error('Stripe onboarding URL was not returned.');
            }

            // Redirect the user to Stripe Connect onboarding.
            window.location.href = onboardingUrl;
        } catch (stripeError: any) {
            console.error('Error connecting Stripe:', stripeError);

            if (stripeError.code === 'NETWORK_ERROR' || stripeError.message === 'Network Error') {
                setError('Unable to connect to Stripe. Please check your internet connection and try again.');
            } else if (stripeError.code === 'ECONNABORTED') {
                setError('The Stripe connection request timed out. Please try again.');
            } else {
                setError(stripeError.response?.data?.message || stripeError.message || 'Failed to connect your Stripe account. Please try again.');
            }
        } finally {
            setIsConnectingStripe(false);
        }
    };

    // Do not display the dashboard until authentication
    // and Stripe status have been checked.
    if (isLoading) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-gray-50'>
                <div className='dot-spinner'>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                </div>
            </div>
        );
    }

    // Display an error page when user information
    // could not be loaded.
    if (error && !userData) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-gray-50'>
                <div className='mx-4 max-w-md text-center'>
                    <div className='mb-4 text-lg text-red-600'>{error}</div>

                    <button
                        type='button'
                        onClick={() => setRetryCount((current) => current + 1)}
                        className='rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700'
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!userData) {
        return null;
    }

    const needsStripeConnection = !userData.adminStripeConnectId || showStripeModal;

    return (
        <div className='relative min-h-screen bg-gray-50'>
            {/* <EmailMarketingTourPopup onComplete={() => console.log('Tour complete')} /> */}

            <div className='flex pl-64'>
                <InvoiceContractSidebar />

                <main className='flex-1 p-8'>
                    <div className='mx-auto max-w-6xl'>
                        <h1 className='mb-8 text-center text-4xl font-bold'>Invoice Contract Dashboard</h1>

                        {children}
                    </div>
                </main>
            </div>

            {/* Stripe Connect blocking overlay */}
            {needsStripeConnection && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80'>
                    <div className='mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl'>
                        <div className='mb-6'>
                            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
                                <svg className='h-8 w-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2'
                                        d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                                    />
                                </svg>
                            </div>

                            <h2 className='mb-2 text-2xl font-bold text-gray-900'>Connect Stripe to Continue</h2>

                            <p className='text-gray-600'>
                                To access your Invoice Contract Dashboard and receive customer payments, you must connect your Stripe account first.
                            </p>
                        </div>

                        {error && (
                            <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-3'>
                                <p className='text-sm text-red-600'>{error}</p>
                            </div>
                        )}

                        <button
                            type='button'
                            onClick={handleStripeConnect}
                            disabled={isConnectingStripe}
                            className='w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50'
                        >
                            {isConnectingStripe ? (
                                <div className='flex items-center justify-center'>
                                    <svg
                                        className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>

                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    Connecting...
                                </div>
                            ) : (
                                'Connect Stripe Account'
                            )}
                        </button>

                        <p className='mt-4 text-xs text-gray-500'>Secure connection powered by Stripe</p>
                    </div>
                </div>
            )}
        </div>
    );
}
