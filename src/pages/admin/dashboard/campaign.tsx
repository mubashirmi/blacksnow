import { AlertCircle, Calendar, CheckCircle2, Loader2, Mail, Send, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SalesCampaignPage() {
    const [emailUsers, setEmailUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        text: '',
        fromName: '',
        selectedUsers: [],
        runAt: '',
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchEmailUsers();
    }, []);

    const fetchEmailUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError('User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/v2/email-users?authId=56`);

            if (!response.ok) {
                throw new Error('Failed to fetch email users');
            }

            const data = await response.json();
            const users = Array.isArray(data.emailUser) ? data.emailUser : [data.emailUser];
            setEmailUsers(users.filter((u) => u));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleUserToggle = (userId) => {
        setFormData((prev) => ({
            ...prev,
            selectedUsers: prev.selectedUsers.includes(userId) ? prev.selectedUsers.filter((id) => id !== userId) : [...prev.selectedUsers, userId],
        }));
        if (formErrors.selectedUsers) {
            setFormErrors((prev) => ({ ...prev, selectedUsers: '' }));
        }
    };

    const handleSelectAll = () => {
        if (formData.selectedUsers.length === emailUsers.length) {
            setFormData((prev) => ({ ...prev, selectedUsers: [] }));
        } else {
            setFormData((prev) => ({ ...prev, selectedUsers: emailUsers.map((u) => u.id) }));
        }
    };

    const formatDateTimeForAPI = (dateTimeString) => {
        if (!dateTimeString) return '';

        // datetime-local returns format: "2025-09-24T13:38"
        // We need to parse it as local time, not UTC
        const [datePart, timePart] = dateTimeString.split('T');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');

        // Create date object in local timezone
        const date = new Date(
            parseInt(year),
            parseInt(month) - 1, // months are 0-indexed
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
            0 // seconds
        );

        // Get timezone offset in minutes and convert to hours:minutes format
        const offset = -date.getTimezoneOffset(); // Negative because getTimezoneOffset returns opposite sign
        const offsetHours = Math.floor(Math.abs(offset) / 60);
        const offsetMinutes = Math.abs(offset) % 60;
        const offsetSign = offset >= 0 ? '+' : '-';

        // Format with padded zeros
        const paddedMonth = String(date.getMonth() + 1).padStart(2, '0');
        const paddedDay = String(date.getDate()).padStart(2, '0');
        const paddedHours = String(date.getHours()).padStart(2, '0');
        const paddedMinutes = String(date.getMinutes()).padStart(2, '0');
        const paddedSeconds = String(date.getSeconds()).padStart(2, '0');

        // Return in exact format: "2025-09-24T13:38:16+05:00"
        return `${date.getFullYear()}-${paddedMonth}-${paddedDay}T${paddedHours}:${paddedMinutes}:${paddedSeconds}${offsetSign}${String(offsetHours).padStart(
            2,
            '0'
        )}:${String(offsetMinutes).padStart(2, '0')}`;
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.subject.trim()) {
            errors.subject = 'Subject is required';
        }

        if (!formData.text.trim()) {
            errors.text = 'Email message is required';
        }

        if (!formData.fromName.trim()) {
            errors.fromName = 'From name is required';
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
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            setError(null);
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError('User ID not found. Please login again.');
                return;
            }

            const payload = {
                adminId: parseInt(userId),
                subject: formData.subject.trim(),
                text: formData.text.trim(),
                fromName: formData.fromName.trim(),
                ids: formData.selectedUsers,
                runAt: formatDateTimeForAPI(formData.runAt),
            };

            const response = await fetch('/api/v2/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
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

            setTimeout(() => {
                setSuccess(false);
            }, 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
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
        <div className='max-w-4xl mx-auto space-y-6'>
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl'>
                <div className='flex items-center gap-3 mb-2'>
                    <Mail className='w-8 h-8' />
                    <h1 className='text-3xl font-bold'>Create Email Campaign</h1>
                </div>
                <p className='text-blue-100'>Schedule and send email campaigns to your users</p>
            </div>

            {success && (
                <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3'>
                    <CheckCircle2 className='w-5 h-5 text-green-600 flex-shrink-0' />
                    <div>
                        <p className='text-green-800 font-medium'>Campaign Created Successfully!</p>
                        <p className='text-green-700 text-sm'>Your email campaign has been scheduled and will be sent at the specified time.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                    <div>
                        <p className='text-red-800 font-medium'>Error</p>
                        <p className='text-red-600 text-sm'>{error}</p>
                    </div>
                </div>
            )}

            <div className='bg-white rounded-xl shadow-lg border border-slate-200 p-8 space-y-6'>
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
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
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
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
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
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none`}
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
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
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
                        <button type='button' onClick={handleSelectAll} className='text-sm text-blue-600 hover:text-blue-700 font-medium' disabled={submitting}>
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
                            {emailUsers.map((user) => (
                                <label key={user.id} className='flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors'>
                                    <input
                                        type='checkbox'
                                        checked={formData.selectedUsers.includes(user.id)}
                                        onChange={() => handleUserToggle(user.id)}
                                        className='w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                                        disabled={submitting}
                                    />
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold'>
                                                {user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className='font-medium text-slate-800'>{user.fullName}</p>
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
                        className='w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer'
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
        </div>
    );
}
