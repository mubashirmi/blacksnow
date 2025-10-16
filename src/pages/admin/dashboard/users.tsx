import { AlertCircle, Loader2, Mail, Plus, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SalesProfilePage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ email: '', fullName: '' });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
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
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            // Sanitize data to ensure fullName is a string
            const sanitizedUsers: any[] = (data.emailUser ? [data.emailUser] : []).map((user) => ({
                ...user,
                fullName: user.fullName || 'Unknown', // Fallback for missing fullName
            }));
            console.log(sanitizedUsers);
            setUsers(data.emailUser);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};

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
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError('User ID not found. Please login again.');
                return;
            }

            const response = await fetch('/api/v2/email-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    fullName: formData.fullName.trim(),
                    authId: parseInt(userId),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }

            setSuccess(true);
            setFormData({ email: '', fullName: '' });
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
                fetchUsers();
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !submitting) {
            handleSubmit();
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
        setFormData({ email: '', fullName: '' });
        setFormErrors({});
        setError(null);
        setSuccess(false);
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
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8'>
            <div className='max-w-6xl mx-auto'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-8'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h1 className='text-3xl font-bold text-white mb-2'>Email Users</h1>
                                <p className='text-blue-100'>Manage your email users</p>
                            </div>
                            <button
                                onClick={openModal}
                                className='bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl cursor-pointer'
                            >
                                <Plus className='w-5 h-5' />
                                Add Email User
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className='mx-8 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                            <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                            <div className='flex-1'>
                                <p className='text-red-800 font-medium'>Error</p>
                                <p className='text-red-600 text-sm'>{error}</p>
                            </div>
                        </div>
                    )}

                    <div className='p-8'>
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
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>ID</th>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Full Name</th>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Email</th>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, index) => (
                                            <tr key={user.id} className='border-b border-slate-100 hover:bg-slate-50 transition-colors'>
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
                                                    <span className='text-slate-600'>{user.authId}</span>
                                                </td>
                                                <td className='py-4 px-6'>
                                                    <span className='text-slate-600 text-sm'>
                                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
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

            {isModalOpen && (
                <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden'>
                        <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between'>
                            <h2 className='text-2xl font-bold text-white'>Create New User</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='text-white hover:bg-blue-500 rounded-lg p-2 transition-colors'
                                disabled={submitting}
                            >
                                <X className='w-6 h-6' />
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
                                    className='flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors'
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer'
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
