import { SalesSidebar } from '@/components/sales-sidebar';
import { AlertCircle, Info, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/router';
import type React from 'react';
import { useEffect, useState } from 'react';

export default function SalesDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [credentialsData, setCredentialsData] = useState({ email: '', appPassword: '' });
    const [credentialsErrors, setCredentialsErrors] = useState<{ email?: string; appPassword?: string }>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkingCredentials, setCheckingCredentials] = useState(false);

    // eslint-disable-next-line no-use-before-define
    const checkMarketingCredentials = async () => {
        try {
            setCheckingCredentials(true);
            const userId = localStorage.getItem('userId');

            if (!userId) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/v2/marketingCredentials?adminId=${userId}`);

            if (!response.ok) {
                // If credentials don't exist, show modal
                setShowCredentialsModal(true);
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            if (data.policy && data.policy.email && data.policy.appPassword) {
                // Credentials exist, allow access
                setShowCredentialsModal(false);
                setIsLoading(false);
            } else {
                // Credentials incomplete, show modal
                setShowCredentialsModal(true);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Failed to check marketing credentials:', error);
            setShowCredentialsModal(true);
            setIsLoading(false);
        } finally {
            setCheckingCredentials(false);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Get roles from localStorage
                const storedRoles = localStorage.getItem('roles');
                const roles = storedRoles ? JSON.parse(storedRoles) : [];

                // Check if token and role exist in cookies
                const token = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('token='))
                    ?.split('=')[1];
                const id = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('id='))
                    ?.split('=')[1];

                if (!token && !id && !roles.includes('Sales')) {
                    router.push('/login');
                    return;
                }

                // Check marketing credentials
                await checkMarketingCredentials();
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/login');
            }
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const validateCredentialsForm = () => {
        const errors: { email?: string; appPassword?: string } = {};

        if (!credentialsData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentialsData.email)) {
            errors.email = 'Invalid email format';
        }

        if (!credentialsData.appPassword.trim()) {
            errors.appPassword = 'App password is required';
        } else if (credentialsData.appPassword.trim().length < 10) {
            errors.appPassword = 'App password must be at least 10 characters';
        }

        setCredentialsErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCredentialsSubmit = async () => {
        if (!validateCredentialsForm()) return;

        try {
            setSubmitting(true);
            setError(null);
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError('User ID not found. Please login again.');
                return;
            }

            const response = await fetch('/api/v2/marketingCredentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentialsData.email.trim(),
                    appPassword: credentialsData.appPassword.trim(),
                    id: parseInt(userId),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save credentials');
            }

            // Success - close modal and reload
            setShowCredentialsModal(false);
            setCredentialsData({ email: '', appPassword: '' });
            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCredentialsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentialsData((prev) => ({ ...prev, [name]: value }));
        if (credentialsErrors[name as keyof typeof credentialsErrors]) {
            setCredentialsErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    if (isLoading || checkingCredentials) {
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

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='flex pl-64'>
                <SalesSidebar />
                <main className='flex-1 p-8'>
                    <div className='max-w-6xl mx-auto'>
                        <h1 className='text-4xl font-bold text-center mb-8'>Sales Dashboard</h1>
                        {children}
                    </div>
                </main>
            </div>

            {/* Marketing Credentials Modal */}
            {showCredentialsModal && (
                <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden'>
                        <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6'>
                            <div className='flex items-center gap-3'>
                                <ShieldCheck className='w-8 h-8 text-white' />
                                <div>
                                    <h2 className='text-2xl font-bold text-white'>Email Credentials Required</h2>
                                    <p className='text-blue-100 text-sm'>Setup required to send marketing emails</p>
                                </div>
                            </div>
                        </div>

                        <div className='p-6 space-y-5'>
                            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                                <div className='flex items-start gap-3'>
                                    <Info className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                                    <div>
                                        <p className='text-blue-900 font-medium mb-1'>Why we need this</p>
                                        <p className='text-blue-800 text-sm'>
                                            We need your email app password to send marketing campaigns from your account. This ensures emails are sent directly
                                            from your email address.
                                        </p>
                                        <p className='text-blue-800 text-sm mt-2'>
                                            <strong>Note:</strong> An app password is different from your regular email password. Generate one from your email
                                            provider&apos;s security settings.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                                    <p className='text-red-800 text-sm'>{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor='email' className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                                    <Mail className='w-4 h-4' />
                                    Email Address
                                </label>
                                <input
                                    type='email'
                                    id='email'
                                    name='email'
                                    value={credentialsData.email}
                                    onChange={handleCredentialsInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        credentialsErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                    placeholder='your.email@gmail.com'
                                    disabled={submitting}
                                />
                                {credentialsErrors.email && <p className='text-red-600 text-sm mt-1'>{credentialsErrors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor='appPassword' className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                                    <Lock className='w-4 h-4' />
                                    App Password
                                </label>
                                <input
                                    type='text'
                                    id='appPassword'
                                    name='appPassword'
                                    value={credentialsData.appPassword}
                                    onChange={handleCredentialsInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        credentialsErrors.appPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono`}
                                    placeholder='xbsr gbiv sizp twwe'
                                    disabled={submitting}
                                />
                                {credentialsErrors.appPassword && <p className='text-red-600 text-sm mt-1'>{credentialsErrors.appPassword}</p>}
                                <p className='text-slate-500 text-xs mt-1'>Enter the app password exactly as provided by your email provider</p>
                            </div>

                            <div className='pt-4'>
                                <button
                                    type='button'
                                    onClick={handleCredentialsSubmit}
                                    disabled={submitting}
                                    className='w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl'
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className='w-5 h-5 animate-spin' />
                                            Saving Credentials...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className='w-5 h-5' />
                                            Save & Continue
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className='bg-slate-50 rounded-lg p-4 text-center'>
                                <p className='text-slate-600 text-xs'>
                                    Your credentials are securely stored and encrypted. We never share your information with third parties.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
