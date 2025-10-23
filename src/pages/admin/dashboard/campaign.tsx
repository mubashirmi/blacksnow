import { AlertCircle, Calendar, CheckCircle2, Info, Loader2, Lock, Mail, Send, ShieldCheck, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function SalesCampaignPage() {
    const [emailUsers, setEmailUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Campaign form
    const [formData, setFormData] = useState({
        subject: '',
        text: '',
        fromName: '',
        selectedUsers: [] as number[],
        runAt: '',
    });
    const [formErrors, setFormErrors] = useState<any>({});

    // Credentials gate
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [checkingCredentials, setCheckingCredentials] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // for credentials flow
    const [credentialsData, setCredentialsData] = useState<{ email: string; appPassword: string }>({
        email: '',
        appPassword: '',
    });
    const [credentialsErrors, setCredentialsErrors] = useState<{ email?: string; appPassword?: string }>({});

    useEffect(() => {
        (async () => {
            const ok = await checkMarketingCredentials();
            if (ok) {
                fetchEmailUsers();
            } else {
                setLoading(false); // don't leave main spinner up if gated by credentials
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchEmailUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const id = Number(localStorage.getItem('adminId'));
            if (!id) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }
            const response = await fetch(`/api/v2/email-users?authId=${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch email users');
            }
            const data = await response.json();
            const users = Array.isArray(data.emailUser) ? data.emailUser : data.emailUser ? [data.emailUser] : [];
            setEmailUsers(users.filter(Boolean));
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

            setShowCredentialsModal(!ok);
            return !!ok;
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

        // Accept 16+ alphanum OR 4 groups of 4 alphanum separated by spaces
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

            setShowCredentialsModal(false);

            // If we haven't loaded users yet, do it now
            if (!emailUsers.length) {
                fetchEmailUsers();
            }
        } catch (e: any) {
            setError(e.message || 'Failed to save credentials');
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- Campaign Form ----------
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if ((formErrors as any)[name]) {
            setFormErrors((prev: any) => ({ ...prev, [name]: '' }));
        }
    };

    const handleUserToggle = (userId: number) => {
        setFormData((prev) => ({
            ...prev,
            selectedUsers: prev.selectedUsers.includes(userId) ? prev.selectedUsers.filter((id) => id !== userId) : [...prev.selectedUsers, userId],
        }));
        if ((formErrors as any).selectedUsers) {
            setFormErrors((prev: any) => ({ ...prev, selectedUsers: '' }));
        }
    };

    const handleSelectAll = () => {
        if (formData.selectedUsers.length === emailUsers.length) {
            setFormData((prev) => ({ ...prev, selectedUsers: [] }));
        } else {
            setFormData((prev) => ({ ...prev, selectedUsers: emailUsers.map((u: any) => u.id) }));
        }
    };

    const formatDateTimeForAPI = (dateTimeString: string) => {
        if (!dateTimeString) return '';

        const [datePart, timePart] = dateTimeString.split('T');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');

        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hours, 10), parseInt(minutes, 10), 0);

        const offset = -date.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(offset) / 60);
        const offsetMinutes = Math.abs(offset) % 60;
        const offsetSign = offset >= 0 ? '+' : '-';

        const paddedMonth = String(date.getMonth() + 1).padStart(2, '0');
        const paddedDay = String(date.getDate()).padStart(2, '0');
        const paddedHours = String(date.getHours()).padStart(2, '0');
        const paddedMinutes = String(date.getMinutes()).padStart(2, '0');
        const paddedSeconds = String(date.getSeconds()).padStart(2, '0');

        return `${date.getFullYear()}-${paddedMonth}-${paddedDay}T${paddedHours}:${paddedMinutes}:${paddedSeconds}${offsetSign}${String(offsetHours).padStart(
            2,
            '0'
        )}:${String(offsetMinutes).padStart(2, '0')}`;
    };

    const validateForm = () => {
        const errors: any = {};

        if (!formData.fromName.trim()) {
            errors.fromName = 'From name is required';
        }

        if (!formData.subject.trim()) {
            errors.subject = 'Subject is required';
        }

        if (!formData.text.trim()) {
            errors.text = 'Email message is required';
        }

        if (formData.selectedUsers.length === 0) {
            errors.selectedUsers = 'Please select at least one recipient';
        }

        if (!formData.runAt) {
            errors.runAt = 'Please select a date and time';
        } else {
            const selectedDate = new Date(formData.runAt);
            const now = new Date();
            if (selectedDate < now) {
                errors.runAt = 'Please select a future date and time';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        // Ensure credentials exist before allowing submit
        const credsOk = await checkMarketingCredentials();
        if (!credsOk) return;

        if (!validateForm()) return;

        try {
            setSubmitting(true);
            setError(null);
            const id = Number(localStorage.getItem('adminId'));
            if (!id) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const payload = {
                adminId: id,
                subject: formData.subject.trim(),
                text: formData.text.trim(),
                fromName: formData.fromName.trim(),
                ids: formData.selectedUsers,
                runAt: formatDateTimeForAPI(formData.runAt),
                timeInterval: '0',
                repeated: false,
            };

            const response = await fetch('/api/v2/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create campaign');
            }

            setSuccess(true);
            setFormData({
                subject: '',
                text: '',
                fromName: '',
                selectedUsers: [],
                runAt: '',
            });

            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
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
        <div className='max-w-4xl mx-auto rounded-xl overflow-hidden'>
            {/* Header */}
            <div className='bg-gradient-to-r from-slate-800 to-slate-700 p-8'>
                <div className='flex items-center gap-4'>
                    <div className='w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center'>
                        <Mail className='w-8 h-8 text-slate-700' />
                    </div>
                    <div>
                        <h1 className='text-3xl font-bold text-white mb-1'>Create Email Campaign</h1>
                        <p className='text-slate-100'>Schedule and send email campaigns to your users</p>
                    </div>
                </div>
            </div>

            {success && (
                <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mt-4'>
                    <CheckCircle2 className='w-5 h-5 text-green-600 flex-shrink-0' />
                    <div>
                        <p className='text-green-800 font-medium'>Campaign Created Successfully!</p>
                        <p className='text-green-700 text-sm'>Your email campaign has been scheduled and will be sent at the specified time.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mt-4'>
                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                    <div>
                        <p className='text-red-800 font-medium'>Error</p>
                        <p className='text-red-600 text-sm'>{error}</p>
                    </div>
                </div>
            )}

            <div className='bg-white shadow-lg border border-slate-200 p-8 space-y-6'>
                <div>
                    <label className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                        <Mail className='w-4 h-4' />
                        From Name
                    </label>
                    <input
                        type='text'
                        name='fromName'
                        value={formData.fromName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                            formErrors.fromName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                        placeholder='e.g., Demo Store, Your Company'
                        disabled={submitting}
                    />
                    {formErrors.fromName && <p className='text-red-600 text-sm mt-1'>{formErrors.fromName}</p>}
                </div>

                <div>
                    <label className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                        <Mail className='w-4 h-4' />
                        Email Subject
                    </label>
                    <input
                        type='text'
                        name='subject'
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                            formErrors.subject ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                        placeholder='e.g., Big Sale Tomorrow'
                        disabled={submitting}
                    />
                    {formErrors.subject && <p className='text-red-600 text-sm mt-1'>{formErrors.subject}</p>}
                </div>

                <div>
                    <label className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                        <Mail className='w-4 h-4' />
                        Email Message
                    </label>
                    <textarea
                        name='text'
                        value={formData.text}
                        onChange={handleInputChange}
                        rows={6}
                        className={`w-full px-4 py-3 rounded-lg border ${
                            formErrors.text ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all resize-none`}
                        placeholder='Write your email message here...'
                        disabled={submitting}
                    />
                    {formErrors.text && <p className='text-red-600 text-sm mt-1'>{formErrors.text}</p>}
                </div>

                <div>
                    <label className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                        <Calendar className='w-4 h-4' />
                        Schedule Date & Time
                    </label>
                    <input
                        type='datetime-local'
                        name='runAt'
                        value={formData.runAt}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                            formErrors.runAt ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                        disabled={submitting}
                    />
                    {formErrors.runAt && <p className='text-red-600 text-sm mt-1'>{formErrors.runAt}</p>}
                </div>

                <div>
                    <div className='flex items-center justify-between mb-3'>
                        <label className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
                            <Users className='w-4 h-4' />
                            Select Recipients ({formData.selectedUsers.length} selected)
                        </label>
                        <button
                            type='button'
                            onClick={handleSelectAll}
                            className='text-sm text-slate-700 hover:text-slate-800 font-medium'
                            disabled={submitting}
                        >
                            {formData.selectedUsers.length === emailUsers.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    {emailUsers.length === 0 ? (
                        <div className='border border-slate-200 rounded-lg p-6 text-center'>
                            <Users className='w-12 h-12 text-slate-300 mx-auto mb-2' />
                            <p className='text-slate-600'>No email users found</p>
                            <p className='text-slate-500 text-sm'>Please add email users first</p>
                        </div>
                    ) : (
                        <div
                            className={`border ${
                                formErrors.selectedUsers ? 'border-red-300 bg-red-50' : 'border-slate-200'
                            } rounded-lg divide-y divide-slate-200 max-h-64 overflow-y-auto`}
                        >
                            {emailUsers.map((user: any) => (
                                <label key={user.id} className='flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors'>
                                    <input
                                        type='checkbox'
                                        checked={formData.selectedUsers.includes(user.id)}
                                        onChange={() => handleUserToggle(user.id)}
                                        className='w-5 h-5 text-slate-600 rounded focus:ring-2 focus:ring-slate-500'
                                        disabled={submitting}
                                    />
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-sm font-semibold'>
                                                {typeof user.fullName === 'string' && user.fullName.trim() ? user.fullName.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p className='font-medium text-slate-800'>{user.fullName || 'Unknown'}</p>
                                                <p className='text-sm text-slate-600'>{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                    {formErrors.selectedUsers && <p className='text-red-600 text-sm mt-1'>{formErrors.selectedUsers}</p>}
                </div>

                <div className='pt-4'>
                    <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={submitting || emailUsers.length === 0}
                        className='w-full px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-lg font-semibold hover:from-slate-700 hover:to-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer'
                    >
                        {submitting ? (
                            <>
                                <Loader2 className='w-5 h-5 animate-spin' />
                                Creating Campaign...
                            </>
                        ) : (
                            <>
                                <Send className='w-5 h-5' />
                                Create & Schedule Campaign
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Credentials Modal Gate */}
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
        </div>
    );
}
