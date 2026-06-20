import { AffiliateSidebar } from '@/components/affiliate-sidebar';
import axios from 'axios';
import { useRouter } from 'next/router';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { LightningSilverTourPopup } from './Lightningsilvertourpopup';

interface UserData {
    id: number;
    createdAt: string;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    roles: string[];
    adminStripeConnectId: string | null;
    referredById: number | null;
}

interface ApiResponse {
    message: string;
    data: UserData;
}

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isConnectingStripe, setIsConnectingStripe] = useState(false);
    const [error, setError] = useState<string>('');
    const [showStripeModal, setShowStripeModal] = useState(false);
    const [hasCheckedAccess, setHasCheckedAccess] = useState(false);
    const router = useRouter();

    const checkUserAccess = useCallback(async () => {
        // Prevent multiple simultaneous calls
        if (isLoading && hasCheckedAccess) {
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            // Get roles from localStorage
            const storedRoles = localStorage.getItem('roles');
            const roles = storedRoles ? JSON.parse(storedRoles) : [];
            const userId = localStorage.getItem('userId');

            // Only update userRoles if they've actually changed
            setUserRoles((prevRoles) => {
                if (JSON.stringify(prevRoles) !== JSON.stringify(roles)) {
                    return roles;
                }
                return prevRoles;
            });

            // Redirect if user doesn't have Affiliate role
            if (roles.length > 0 && !roles.includes('LightningSilver')) {
                router.push('/affiliate');
                return;
            }

            // Redirect if no roles found (user not logged in)
            if (roles.length === 0 || !userId) {
                router.push('/affiliate');
                return;
            }

            // Fetch user data to check Stripe connection
            try {
                const response = await axios.get<ApiResponse>(`/api/v2/stripe-connect/?id=${userId}`, {
                    timeout: 10000, // 10 second timeout
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Handle 204 status code - user exists but not onboarded to Stripe
                if (response.status === 204) {
                    setShowStripeModal(true);
                    setError(''); // Don't show error, just show modal

                    // Create a minimal user data object so the component can render
                    const storedEmail = localStorage.getItem('email') || '';
                    const storedFirstName = localStorage.getItem('firstName') || '';
                    const storedLastName = localStorage.getItem('lastName') || '';

                    setUserData({
                        id: userId ? parseInt(userId) : 0,
                        createdAt: '',
                        updatedAt: '',
                        email: storedEmail,
                        firstName: storedFirstName,
                        lastName: storedLastName,
                        password: '',
                        roles,
                        adminStripeConnectId: null, // This will trigger the modal
                        referredById: null,
                    });
                } else {
                    // Normal 200 response - user found and has data
                    setUserData(response.data.data);
                    setShowStripeModal(false);
                }
            } catch (apiError: any) {
                console.error('API Error:', apiError);

                // Handle different error types
                if (apiError.code === 'NETWORK_ERROR' || apiError.message === 'Network Error') {
                    setError('Unable to connect to server. Please check your internet connection and try again.');
                } else if (apiError.response?.status === 404) {
                    setError('User not found. Please try again.');
                } else if (apiError.response?.status === 401) {
                    // Unauthorized - redirect to affiliate page
                    router.push('/affiliate');
                    return;
                } else if (apiError.code === 'ECONNABORTED') {
                    setError('Request timed out. Please try again.');
                } else {
                    setError(apiError.response?.data?.message || 'Failed to load user data. Please try again.');
                }
            }

            setHasCheckedAccess(true);
        } catch (error: any) {
            console.error('Error in checkUserAccess:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasCheckedAccess, router, setIsLoading, setError, setUserRoles, setUserData, setShowStripeModal, setHasCheckedAccess]);

    useEffect(() => {
        // Only run once on mount or if dependencies change
        if (!hasCheckedAccess) {
            checkUserAccess();
        }
    }, [checkUserAccess, hasCheckedAccess]);

    const handleStripeConnect = async () => {
        try {
            setIsConnectingStripe(true);
            setError('');

            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw new Error('User ID not found');
            }

            const connectData = {
                id: parseInt(userId),
                invoiceToolLink: 'https://blacksnowholdings.com/InvoiceContract',
                digitalBillboardLink: 'https://blacksnowholdings.com/advertising',
                emailMarketingLink: 'https://blacksnowholdings.com/emailMarketing',
            };

            const response = await axios.post('/api/v2/stripe-connect', connectData, {
                timeout: 15000, // 15 second timeout for Stripe connection
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            window.location.href = response.data.onboardingUrl;

            // If successful, refresh user data to check Stripe connection status
            // setHasCheckedAccess(false); // Reset to allow re-checking
            // await checkUserAccess();
        } catch (error: any) {
            console.error('Error connecting Stripe:', error);
            if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
                setError('Unable to connect to Stripe service. Please check your internet connection and try again.');
            } else if (error.code === 'ECONNABORTED') {
                setError('Stripe connection timed out. Please try again.');
            } else {
                setError(error?.response?.data?.message || 'Failed to connect Stripe. Please try again.');
            }
        } finally {
            setIsConnectingStripe(false);
        }
    };

    // Show loading while checking roles and fetching user data
    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
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

    // Show error state (only for non-404 errors)
    if (error && !userData) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='text-center max-w-md mx-4'>
                    <div className='text-lg text-red-600 mb-4'>{error}</div>
                    <button
                        onClick={() => {
                            setHasCheckedAccess(false);
                            checkUserAccess();
                        }}
                        className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Only render if user has Affiliate role
    if (!userRoles.includes('LightningSilver') || !userData) {
        return null; // This will be handled by the redirect in useEffect
    }

    // Show Stripe Connect overlay if user doesn't have adminStripeConnectId OR if showStripeModal is true
    const needsStripeConnection = !userData.adminStripeConnectId || showStripeModal;

    return (
        <div className='min-h-screen bg-gray-50 relative'>
            <LightningSilverTourPopup onComplete={() => console.log('Tour complete')} />
            {/* Fixed Sidebar */}
            <AffiliateSidebar />

            {/* Page content (also shifted right by the sidebar width) */}
            <main className='pl-64'>
                <div className='p-6 bg-gray-50'>{children}</div>
            </main>

            {/* Stripe Connect Overlay */}
            {needsStripeConnection && (
                <div className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50'>
                    <div className='bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl'>
                        <div className='mb-6'>
                            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2'
                                        d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                                    />
                                </svg>
                            </div>
                            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Connect Stripe for Payouts</h2>
                            <p className='text-gray-600'>
                                To access your affiliate dashboard and receive payouts, you need to connect your Stripe account first.
                            </p>
                        </div>

                        {error && (
                            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                                <p className='text-red-600 text-sm'>{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleStripeConnect}
                            disabled={isConnectingStripe}
                            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg'
                        >
                            {isConnectingStripe ? (
                                <div className='flex items-center justify-center'>
                                    <svg
                                        className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
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

                        <p className='text-xs text-gray-500 mt-4'>Secure connection powered by Stripe</p>
                    </div>
                </div>
            )}
        </div>
    );
}
