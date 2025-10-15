import { AlertCircle, Calendar, CheckCircle, Clock, Loader2, Mail, Send, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Automation() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        subject: '',
        text: '',
        fromName: '',
        selectedUsers: [],
        runAtDate: '',
        runAtTime: '',
        timeInterval: '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError('User ID not found. Please login again.');
                return;
            }

            const response = await fetch(`/api/v2/email-users?authId=56`);

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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleUserSelection = (userId) => {
        setFormData((prev) => {
            const selectedUsers = prev.selectedUsers.includes(userId) ? prev.selectedUsers.filter((id) => id !== userId) : [...prev.selectedUsers, userId];

            return { ...prev, selectedUsers };
        });

        if (formErrors.selectedUsers) {
            setFormErrors((prev) => ({ ...prev, selectedUsers: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};

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
        }

        if (!formData.timeInterval) {
            errors.timeInterval = 'Time interval is required';
        } else if (isNaN(formData.timeInterval) || parseInt(formData.timeInterval) < 1) {
            errors.timeInterval = 'Time interval must be a positive number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const formatDateTime = (date, time) => {
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
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            setError(null);
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError('User ID not found. Please login again.');
                return;
            }

            const runAt = formatDateTime(formData.runAtDate, formData.runAtTime);

            const payload = {
                adminId: parseInt(userId),
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
                const errorData = await response.json();
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
        <div className='min-h-screen p-8'>
            <div className='max-w-4xl mx-auto'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='bg-gradient-to-r from-purple-600 to-blue-600 p-8'>
                        <div className='flex items-center gap-4'>
                            <div className='w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center'>
                                <Mail className='w-8 h-8 text-purple-700' />
                            </div>
                            <div>
                                <h1 className='text-3xl font-bold text-white mb-1'>Email Automation</h1>
                                <p className='text-purple-100'>Schedule and automate your email campaigns</p>
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
                                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
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
                                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
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
                                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none`}
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
                                            {users.map((user) => (
                                                <label
                                                    key={user.id}
                                                    className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors'
                                                >
                                                    <input
                                                        type='checkbox'
                                                        checked={formData.selectedUsers.includes(user.id)}
                                                        onChange={() => handleUserSelection(user.id)}
                                                        className='w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500'
                                                        disabled={submitting}
                                                    />
                                                    <div className='flex-1'>
                                                        <p className='font-medium text-slate-800'>{user.fullName}</p>
                                                        <p className='text-sm text-slate-500'>{user.email}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {formErrors.selectedUsers && <p className='text-red-600 text-sm mt-1'>{formErrors.selectedUsers}</p>}
                                {formData.selectedUsers.length > 0 && (
                                    <p className='text-sm text-slate-600 mt-2'>{formData.selectedUsers.length} user(s) selected</p>
                                )}
                            </div>

                            <div className='border-t border-slate-200 pt-6'>
                                <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                                    <Clock className='w-5 h-5 text-purple-600' />
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
                                            } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
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
                                            } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
                                            disabled={submitting}
                                        />
                                        {formErrors.runAtTime && <p className='text-red-600 text-sm mt-1'>{formErrors.runAtTime}</p>}
                                    </div>
                                </div>

                                <div className='bg-purple-50 rounded-lg p-4'>
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
                                            } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
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
                                    className='flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer'
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
        </div>
    );
}
