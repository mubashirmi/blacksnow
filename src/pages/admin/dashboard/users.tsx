import { AlertCircle, Info, Loader2, Lock, Mail, Plus, ShieldCheck, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function SalesProfilePage() {
    // Email users table
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create user modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ email: '', fullName: '' });
    const [formErrors, setFormErrors] = useState<{ email?: string; fullName?: string }>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Credentials gate
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [checkingCredentials, setCheckingCredentials] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // generic, used by credentials check
    const [credentialsData, setCredentialsData] = useState<{ email: string; appPassword: string }>({
        email: '',
        appPassword: '',
    });
    const [credentialsErrors, setCredentialsErrors] = useState<{ email?: string; appPassword?: string }>({});

    useEffect(() => {
        (async () => {
            const ok = await checkMarketingCredentials();
            if (ok) {
                fetchUsers();
            } else {
                setLoading(false); // don't leave page spinner up if blocked by credentials
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const id = Number(localStorage.getItem('adminId'));
            if (!id) {
                // if no id, bounce to login
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const response = await fetch(`/api/v2/email-users?authId=${id}`);
            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            const sanitizedUsers: any[] = (data.emailUser ? [data.emailUser] : []).map((user) => ({
                ...user,
                fullName: user.fullName || 'Unknown',
            }));
            console.log(sanitizedUsers);
            setUsers(data.emailUser || []);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // ---------- Credentials: Check + Validate + Save ----------
    const checkMarketingCredentials = async (): Promise<boolean> => {
        try {
            setCheckingCredentials(true);
            setIsLoading(true);

            const adminId = Number(localStorage.getItem('adminId'));
            if (!adminId) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return false;
            }

            const response = await fetch(`/api/v2/marketingCredentials?adminId=${adminId}`);

            if (!response.ok) {
                // Not found or server rejected; require setup
                setShowCredentialsModal(true);
                return false;
            }

            const data = await response.json();
            const ok =
                data &&
                data.policy &&
                typeof data.policy.email === 'string' &&
                data.policy.email.trim() &&
                typeof data.policy.appPassword === 'string' &&
                data.policy.appPassword.trim();

            if (ok) {
                setShowCredentialsModal(false);
                return true;
            } else {
                setShowCredentialsModal(true);
                return false;
            }
        } catch (e) {
            console.error('Failed to check marketing credentials:', e);
            setShowCredentialsModal(true);
            return false;
        } finally {
            setIsLoading(false);
            setCheckingCredentials(false);
        }
    };

    const validateCredentialsForm = () => {
        const errs: { email?: string; appPassword?: string } = {};
        const email = credentialsData.email.trim();
        const appPassword = credentialsData.appPassword.trim();

        if (!email) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errs.email = 'Invalid email format';
        }

        // Accept either:
        // - 16+ alphanumeric (no spaces), OR
        // - 4 groups of 4 (alnum) separated by spaces e.g. "xbsr gbiv sizp twwe"
        const noSpacePattern = /^[a-zA-Z0-9]{16,}$/;
        const groupedPattern = /^[a-zA-Z0-9]{4}(?:\s[a-zA-Z0-9]{4}){3}$/;

        if (!appPassword) {
            errs.appPassword = 'App password is required';
        } else if (!(noSpacePattern.test(appPassword) || groupedPattern.test(appPassword))) {
            errs.appPassword = 'Use a valid app password format (16+ chars or 4×4 groups)';
        }

        setCredentialsErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCredentialsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentialsData((prev) => ({ ...prev, [name]: value }));
        if (credentialsErrors[name as keyof typeof credentialsErrors]) {
            setCredentialsErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCredentialsSubmit = async () => {
        if (!validateCredentialsForm()) return;

        try {
            setError(null);
            setSubmitting(true);
            const adminId = Number(localStorage.getItem('adminId'));
            if (!adminId) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            // Save credentials
            const response = await fetch('/api/v2/marketingCredentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: adminId,
                    email: credentialsData.email.trim(),
                    appPassword: credentialsData.appPassword.trim(),
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to save credentials');
            }

            // Hide modal and continue normal flow
            setShowCredentialsModal(false);

            // If the user was trying to open the create modal, open it now
            setIsModalOpen(true);

            // If we haven't loaded users yet, do it now
            if (!users.length) {
                fetchUsers();
            }
        } catch (e: any) {
            setError(e.message || 'Failed to save credentials');
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- Create User Form ----------
    const validateForm = () => {
        const errors: any = {};

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            errors.fullName = 'Name must be at least 2 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            setError(null);
            const id = Number(localStorage.getItem('adminId'));
            if (!id) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/v2/email-users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    fullName: formData.fullName.trim(),
                    authId: id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create user');
            }

            setSuccess(true);
            setFormData({ email: '', fullName: '' });
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
                fetchUsers();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if ((formErrors as any)[name]) {
            setFormErrors((prev: any) => ({ ...prev, [name]: '' }));
        }
    };

    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter' && !submitting) {
            handleSubmit();
        }
    };

    const openModal = async () => {
        // Gate the modal behind credentials
        const ok = await checkMarketingCredentials();
        if (!ok) {
            // Credentials modal will show; don't open create-user modal yet
            return;
        }
        setIsModalOpen(true);
        setFormData({ email: '', fullName: '' });
        setFormErrors({});
        setError(null);
        setSuccess(false);
    };

    if (loading || checkingCredentials || isLoading) {
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
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8'>
            <div className='max-w-6xl mx-auto'>
                {/* Card */}
                <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                    <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h1 className='text-2xl font-bold text-white'>Email Users</h1>
                                <p className='text-white/70 text-sm'>Manage your email users</p>
                            </div>
                            <button
                                onClick={openModal}
                                className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm cursor-pointer'
                            >
                                <span className='inline-flex items-center gap-2'>
                                    <Plus className='w-4 h-4' />
                                    Add Email User
                                </span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className='mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                            <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                            <div className='flex-1'>
                                <p className='text-red-800 font-medium'>Error</p>
                                <p className='text-red-600 text-sm'>{error}</p>
                            </div>
                        </div>
                    )}

                    <div className='p-6'>
                        {users.length === 0 ? (
                            <div className='text-center py-16'>
                                <User className='w-16 h-16 text-slate-300 mx-auto mb-4' />
                                <h3 className='text-xl font-semibold text-slate-700 mb-2'>No email users found</h3>
                                <p className='text-slate-500'>Create your first email user to get started</p>
                            </div>
                        ) : (
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='border-b border-slate-200'>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>SR #</th>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Full Name</th>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Email</th>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user: any, index: number) => (
                                            <tr
                                                key={user.id ?? `${user.email}-${index}`}
                                                className='border-b border-slate-100 hover:bg-slate-50 transition-colors'
                                            >
                                                <td className='py-4 px-6'>
                                                    <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm'>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className='py-4 px-6'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold'>
                                                            {typeof user.fullName === 'string' && user.fullName.trim()
                                                                ? user.fullName.charAt(0).toUpperCase()
                                                                : '?'}
                                                        </div>
                                                        <span className='font-medium text-slate-800'>{user.fullName || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className='py-4 px-6'>
                                                    <div className='flex items-center gap-2 text-slate-600'>
                                                        <Mail className='w-4 h-4 text-slate-400' />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className='py-4 px-6'>
                                                    <span className='text-slate-600 text-sm'>
                                                        {user.createdAt
                                                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                  year: 'numeric',
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                              })
                                                            : '--'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Credentials Modal (Gate) */}
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
                                            Save &amp; Continue
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

            {/* Create User Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden'>
                        <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center justify-between'>
                            <h2 className='text-lg font-bold text-white'>Create New User</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='text-white/90 hover:text-white rounded-lg p-1 transition-colors'
                                disabled={submitting}
                            >
                                <X className='w-5 h-5' />
                            </button>
                        </div>

                        <div className='p-6 space-y-5'>
                            {success && (
                                <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3'>
                                    <div className='w-5 h-5 rounded-full bg-green-500 flex items-center justify-center'>
                                        <svg className='w-3 h-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                                        </svg>
                                    </div>
                                    <p className='text-green-800 font-medium'>User created successfully!</p>
                                </div>
                            )}

                            {error && (
                                <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                                    <p className='text-red-800 text-sm'>{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor='fullName' className='block text-sm font-semibold text-slate-700 mb-2'>
                                    Full Name
                                </label>
                                <input
                                    type='text'
                                    id='fullName'
                                    name='fullName'
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                    placeholder='Enter full name'
                                    disabled={submitting}
                                />
                                {formErrors.fullName && <p className='text-red-600 text-sm mt-1'>{formErrors.fullName}</p>}
                            </div>

                            <div>
                                <label htmlFor='email' className='block text-sm font-semibold text-slate-700 mb-2'>
                                    Email Address
                                </label>
                                <input
                                    type='email'
                                    id='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                    placeholder='user@example.com'
                                    disabled={submitting}
                                />
                                {formErrors.email && <p className='text-red-600 text-sm mt-1'>{formErrors.email}</p>}
                            </div>

                            <div className='flex gap-3 pt-4'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors'
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className='flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer'
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className='w-5 h-5 animate-spin' />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create User'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
