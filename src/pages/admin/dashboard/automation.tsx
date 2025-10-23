import { AlertCircle, Calendar, CheckCircle, Clock, Info, Loader2, Lock, Mail, Send, ShieldCheck, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function Automation() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<any>({});

    // Credentials gate
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [checkingCredentials, setCheckingCredentials] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // for credentials flow spinners
    const [credentialsData, setCredentialsData] = useState<{ email: string; appPassword: string }>({
        email: '',
        appPassword: '',
    });
    const [credentialsErrors, setCredentialsErrors] = useState<{ email?: string; appPassword?: string }>({});

    const [formData, setFormData] = useState({
        subject: '',
        text: '',
        fromName: '',
        selectedUsers: [] as number[],
        runAtDate: '',
        runAtTime: '',
        timeInterval: '',
    });

    useEffect(() => {
        (async () => {
            const ok = await checkMarketingCredentials();
            if (ok) {
                fetchUsers();
            } else {
                setLoading(false); // don't leave page spinner if gated by credentials
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
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }
            const response = await fetch(`/api/v2/email-users?authId=${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();

            if (Array.isArray(data.emailUser)) {
                setUsers(data.emailUser);
            } else if (data.emailUser) {
                setUsers([data.emailUser]);
            } else {
                setUsers([]);
            }
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

        // Accept 16+ alphanum OR 4 groups of 4 alphanum separated by spaces (e.g., "xbsr gbiv sizp twwe")
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

            // If we haven't loaded users yet, do it now so the page is ready
            if (!users.length) {
                fetchUsers();
            }
        } catch (e: any) {
            setError(e.message || 'Failed to save credentials');
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- Form ----------
    const handleInputChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if ((formErrors as any)[name]) {
            setFormErrors((prev: any) => ({ ...prev, [name]: '' }));
        }
    };

    const handleUserSelection = (userId: number) => {
        setFormData((prev) => {
            const selectedUsers = prev.selectedUsers.includes(userId) ? prev.selectedUsers.filter((id) => id !== userId) : [...prev.selectedUsers, userId];

            return { ...prev, selectedUsers };
        });

        if ((formErrors as any).selectedUsers) {
            setFormErrors((prev: any) => ({ ...prev, selectedUsers: '' }));
        }
    };

    const validateForm = () => {
        const errors: any = {};

        if (!formData.subject.trim()) {
            errors.subject = 'Subject is required';
        }

        if (!formData.text.trim()) {
            errors.text = 'Email text is required';
        }

        if (!formData.fromName.trim()) {
            errors.fromName = 'From name is required';
        }

        if (formData.selectedUsers.length === 0) {
            errors.selectedUsers = 'Please select at least one user';
        }

        if (!formData.runAtDate) {
            errors.runAtDate = 'Date is required';
        }

        if (!formData.runAtTime) {
            errors.runAtTime = 'Time is required';
        } else if (formData.runAtDate) {
            // ensure future datetime
            const dt = new Date(`${formData.runAtDate}T${formData.runAtTime}`);
            if (dt < new Date()) {
                errors.runAtTime = 'Please choose a future time';
            }
        }

        if (!formData.timeInterval) {
            errors.timeInterval = 'Time interval is required';
        } else if (isNaN(Number(formData.timeInterval)) || parseInt(formData.timeInterval, 10) < 1) {
            errors.timeInterval = 'Time interval must be a positive number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const formatDateTime = (date: string, time: string) => {
        const dateTime = new Date(`${date}T${time}`);
        const offset = -dateTime.getTimezoneOffset();
        const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
        const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
        const offsetSign = offset >= 0 ? '+' : '-';

        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const day = String(dateTime.getDate()).padStart(2, '0');
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        const seconds = String(dateTime.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
    };

    const handleSubmit = async () => {
        // Gate submit behind credentials
        const credsOk = await checkMarketingCredentials();
        if (!credsOk) return;

        if (!validateForm()) return;

        try {
            setSubmitting(true);
            setError(null);

            const runAt = formatDateTime(formData.runAtDate, formData.runAtTime);
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
                runAt,
                repeated: true,
                timeInterval: formData.timeInterval,
            };

            const response = await fetch('/api/v2/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create automation');
            }

            setSuccess(true);
            setFormData({
                subject: '',
                text: '',
                fromName: '',
                selectedUsers: [],
                runAtDate: '',
                runAtTime: '',
                timeInterval: '',
            });

            setTimeout(() => {
                setSuccess(false);
            }, 5000);
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
        <div className='min-h-screen p-8'>
            <div className='max-w-4xl mx-auto'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='bg-gradient-to-r from-slate-800 to-slate-700 p-8'>
                        <div className='flex items-center gap-4'>
                            <div className='w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center'>
                                <Mail className='w-8 h-8 text-slate-700' />
                            </div>
                            <div>
                                <h1 className='text-3xl font-bold text-white mb-1'>Email Automation</h1>
                                <p className='text-slate-100'>Schedule and automate your email campaigns</p>
                            </div>
                        </div>
                    </div>

                    <div className='p-8'>
                        {success && (
                            <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3'>
                                <CheckCircle className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' />
                                <div>
                                    <p className='text-green-800 font-semibold'>Automation created successfully!</p>
                                    <p className='text-green-600 text-sm mt-1'>Your email campaign has been scheduled.</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                                <div>
                                    <p className='text-red-800 font-semibold'>Error</p>
                                    <p className='text-red-600 text-sm'>{error}</p>
                                </div>
                            </div>
                        )}

                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label htmlFor='fromName' className='block text-sm font-semibold text-slate-700 mb-2'>
                                        From Name
                                    </label>
                                    <input
                                        type='text'
                                        id='fromName'
                                        name='fromName'
                                        value={formData.fromName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            formErrors.fromName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                        } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                        placeholder='e.g., Demo Store'
                                        disabled={submitting}
                                    />
                                    {formErrors.fromName && <p className='text-red-600 text-sm mt-1'>{formErrors.fromName}</p>}
                                </div>

                                <div>
                                    <label htmlFor='subject' className='block text-sm font-semibold text-slate-700 mb-2'>
                                        Email Subject
                                    </label>
                                    <input
                                        type='text'
                                        id='subject'
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
                            </div>

                            <div>
                                <label htmlFor='text' className='block text-sm font-semibold text-slate-700 mb-2'>
                                    Email Content
                                </label>
                                <textarea
                                    id='text'
                                    name='text'
                                    value={formData.text}
                                    onChange={handleInputChange}
                                    rows={5}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.text ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all resize-none`}
                                    placeholder='Enter your email message here...'
                                    disabled={submitting}
                                />
                                {formErrors.text && <p className='text-red-600 text-sm mt-1'>{formErrors.text}</p>}
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 mb-3'>
                                    <Users className='w-4 h-4 inline mr-2' />
                                    Select Recipients
                                </label>
                                <div
                                    className={`border ${
                                        formErrors.selectedUsers ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } rounded-lg p-4 max-h-60 overflow-y-auto`}
                                >
                                    {users.length === 0 ? (
                                        <p className='text-slate-500 text-center py-4'>No users available</p>
                                    ) : (
                                        <div className='space-y-2'>
                                            {users.map((user: any) => (
                                                <label
                                                    key={user.id}
                                                    className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors'
                                                >
                                                    <input
                                                        type='checkbox'
                                                        checked={formData.selectedUsers.includes(user.id)}
                                                        onChange={() => handleUserSelection(user.id)}
                                                        className='w-5 h-5 text-slate-600 rounded focus:ring-2 focus:ring-slate-500'
                                                        disabled={submitting}
                                                    />
                                                    <div className='flex-1'>
                                                        <p className='font-medium text-slate-800'>{user.fullName || 'Unknown'}</p>
                                                        <p className='text-sm text-slate-500'>{user.email}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {formErrors.selectedUsers && <p className='text-red-600 text-sm mt-1'>{formErrors.selectedUsers}</p>}
                                {formData.selectedUsers.length > 0 && !formErrors.selectedUsers && (
                                    <p className='text-sm text-slate-600 mt-2'>{formData.selectedUsers.length} user(s) selected</p>
                                )}
                            </div>

                            <div className='border-t border-slate-200 pt-6'>
                                <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                                    <Clock className='w-5 h-5 text-slate-800' />
                                    Schedule Settings
                                </h3>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                                    <div>
                                        <label htmlFor='runAtDate' className='block text-sm font-semibold text-slate-700 mb-2'>
                                            <Calendar className='w-4 h-4 inline mr-2' />
                                            Date
                                        </label>
                                        <input
                                            type='date'
                                            id='runAtDate'
                                            name='runAtDate'
                                            value={formData.runAtDate}
                                            onChange={handleInputChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                formErrors.runAtDate ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                            disabled={submitting}
                                        />
                                        {formErrors.runAtDate && <p className='text-red-600 text-sm mt-1'>{formErrors.runAtDate}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor='runAtTime' className='block text-sm font-semibold text-slate-700 mb-2'>
                                            <Clock className='w-4 h-4 inline mr-2' />
                                            Time
                                        </label>
                                        <input
                                            type='time'
                                            id='runAtTime'
                                            name='runAtTime'
                                            value={formData.runAtTime}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                formErrors.runAtTime ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                            disabled={submitting}
                                        />
                                        {formErrors.runAtTime && <p className='text-red-600 text-sm mt-1'>{formErrors.runAtTime}</p>}
                                    </div>
                                </div>

                                <div className='bg-slate-100 rounded-lg p-4'>
                                    <div className='mb-3'>
                                        <p className='font-semibold text-slate-800 mb-1'>Repeat Email Campaign</p>
                                        <p className='text-sm text-slate-600'>This email will be sent automatically at regular intervals</p>
                                    </div>

                                    <div>
                                        <label htmlFor='timeInterval' className='block text-sm font-semibold text-slate-700 mb-2'>
                                            Repeat Every (days)
                                        </label>
                                        <input
                                            type='number'
                                            id='timeInterval'
                                            name='timeInterval'
                                            value={formData.timeInterval}
                                            onChange={handleInputChange}
                                            min='1'
                                            className={`w-full md:w-48 px-4 py-3 rounded-lg border ${
                                                formErrors.timeInterval ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                            placeholder='e.g., 3'
                                            disabled={submitting}
                                        />
                                        {formErrors.timeInterval && <p className='text-red-600 text-sm mt-1'>{formErrors.timeInterval}</p>}
                                        {formData.timeInterval && !formErrors.timeInterval && (
                                            <p className='text-sm text-slate-600 mt-2'>Email will be sent every {formData.timeInterval} day(s)</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className='flex gap-4 pt-6'>
                                <button
                                    type='button'
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className='flex-1 px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-lg font-semibold hover:from-slate-700 hover:to-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer'
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className='w-5 h-5 animate-spin' />
                                            Creating Automation...
                                        </>
                                    ) : (
                                        <>
                                            <Send className='w-5 h-5' />
                                            Create Automation
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
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
                                <label htmlFor='cred-email' className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                                    <Mail className='w-4 h-4' />
                                    Email Address
                                </label>
                                <input
                                    type='email'
                                    id='cred-email'
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
