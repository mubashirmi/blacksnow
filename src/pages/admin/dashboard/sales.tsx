'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';

type UserRow = {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive';
};

export default function SalesPage() {
    const [salesData, setSalesData] = useState<UserRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Create user modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});

    const validateForm = () => {
        const errs: Partial<typeof form> = {};
        if (!form.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';

        if (!form.firstName.trim()) errs.firstName = 'First name is required';
        if (!form.lastName.trim()) errs.lastName = 'Last name is required';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 6) errs.password = 'Min 6 characters';

        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/v2/get-all-user-data');
            // Filter users who have "Sales" in their roles array
            const filteredData = response.data.filter((user: any) => user.roles && user.roles.includes('Sales'));

            const formattedData: UserRow[] = filteredData.map((user: any) => ({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.roles.join(', '),
                status: 'Active',
            }));
            setSalesData(formattedData);
            setSuccess('Data loaded successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError('Failed to fetch user data. Please try again later.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError(null);
        if (!validateForm()) return;

        setCreateLoading(true);
        try {
            await axios.post('/api/v2/signup', {
                email: form.email.trim(),
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                password: form.password,
                role: 'Sales',
            });

            // Reset form and close modal
            setForm({ email: '', firstName: '', lastName: '', password: '' });
            setIsCreateOpen(false);
            setSuccess('User created successfully!');
            setTimeout(() => setSuccess(null), 3000);

            // Refresh table data immediately
            await fetchData();
        } catch (err: any) {
            setCreateError(err?.response?.data?.message || 'Failed to create user. Please try again.');
        } finally {
            setCreateLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className='space-y-6'>
            <style>{`
                .dot-spinner {
                    --uib-size: 2.8rem;
                    --uib-speed: .9s;
                    --uib-color: #3b82f6;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    height: var(--uib-size);
                    width: var(--uib-size);
                }

                .dot-spinner__dot {
                    position: absolute;
                    top: 0;
                    left: 0;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    height: 100%;
                    width: 100%;
                }

                .dot-spinner__dot::before {
                    content: '';
                    height: 20%;
                    width: 20%;
                    border-radius: 50%;
                    background-color: var(--uib-color);
                    transform: scale(0);
                    opacity: 0.5;
                    animation: pulse0112 calc(var(--uib-speed) * 1.111) ease-in-out infinite;
                    box-shadow: 0 0 20px rgba(18, 31, 53, 0.3);
                }

                .dot-spinner__dot:nth-child(2) {
                    transform: rotate(45deg);
                }

                .dot-spinner__dot:nth-child(2)::before {
                    animation-delay: calc(var(--uib-speed) * -0.875);
                }

                .dot-spinner__dot:nth-child(3) {
                    transform: rotate(90deg);
                }

                .dot-spinner__dot:nth-child(3)::before {
                    animation-delay: calc(var(--uib-speed) * -0.75);
                }

                .dot-spinner__dot:nth-child(4) {
                    transform: rotate(135deg);
                }

                .dot-spinner__dot:nth-child(4)::before {
                    animation-delay: calc(var(--uib-speed) * -0.625);
                }

                .dot-spinner__dot:nth-child(5) {
                    transform: rotate(180deg);
                }

                .dot-spinner__dot:nth-child(5)::before {
                    animation-delay: calc(var(--uib-speed) * -0.5);
                }

                @keyframes pulse0112 {
                    0%,
                    100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }

                    50% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>

            {isLoading && (
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='dot-spinner'>
                        <div className='dot-spinner__dot'></div>
                        <div className='dot-spinner__dot'></div>
                        <div className='dot-spinner__dot'></div>
                        <div className='dot-spinner__dot'></div>
                        <div className='dot-spinner__dot'></div>
                    </div>
                </div>
            )}

            {/* Success Alert */}
            {success && (
                <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative' role='alert'>
                    <span className='block sm:inline'>{success}</span>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' role='alert'>
                    <span className='block sm:inline'>{error}</span>
                </div>
            )}

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='mb-6 flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-800'>Sales</h2>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className='inline-flex items-center rounded-md bg-stone-800 duration-200 ease-in-out transition-all px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 cursor-pointer'
                    >
                        + Create User
                    </button>
                </div>

                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead>
                            <tr className='border-b border-gray-200'>
                                <th className='text-left py-3 px-4 font-medium text-gray-700'>Sr #</th>
                                <th className='text-left py-3 px-4 font-medium text-gray-700'>First Name</th>
                                <th className='text-left py-3 px-4 font-medium text-gray-700'>Last Name</th>
                                <th className='text-left py-3 px-4 font-medium text-gray-700'>Email</th>
                                {/* <th className='text-left py-3 px-4 font-medium text-gray-700'>Role</th> */}
                                <th className='text-left py-3 px-4 font-medium text-gray-700'>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData.map((person, index) => (
                                <tr key={index} className='border-b border-gray-100 hover:bg-gray-50'>
                                    <td className='py-3 px-4 text-gray-600'>{index + 1}</td>
                                    <td className='py-3 px-4'>{person.firstName}</td>
                                    <td className='py-3 px-4'>{person.lastName}</td>
                                    <td className='py-3 px-4 text-blue-600'>{person.email}</td>
                                    {/* <td className='py-3 px-4'>{person.role}</td> */}
                                    <td className='py-3 px-4'>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                person.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {person.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {salesData.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className='py-6 px-4 text-center text-gray-500'>
                                        No sales users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {isCreateOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center'>
                    <div className='absolute inset-0 bg-black/50' onClick={() => !createLoading && setIsCreateOpen(false)} />
                    <div className='relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
                        <div className='mb-4 flex items-center justify-between'>
                            <h3 className='text-lg font-semibold text-gray-800'>Create User</h3>
                            <button onClick={() => !createLoading && setIsCreateOpen(false)} className='text-gray-500 hover:text-gray-700' aria-label='Close'>
                                ✕
                            </button>
                        </div>

                        {createError && <div className='mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{createError}</div>}

                        <form onSubmit={handleCreateUser} className='space-y-4'>
                            <div>
                                <label className='mb-1 block text-sm font-medium text-gray-700'>Email</label>
                                <input
                                    type='email'
                                    className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        formErrors.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    value={form.email}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                    disabled={createLoading}
                                    placeholder='jane.doe@example.com'
                                />
                                {formErrors.email && <p className='mt-1 text-xs text-red-600'>{formErrors.email}</p>}
                            </div>

                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                <div>
                                    <label className='mb-1 block text-sm font-medium text-gray-700'>First Name</label>
                                    <input
                                        type='text'
                                        className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                            formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        value={form.firstName}
                                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                                        disabled={createLoading}
                                        placeholder='Jane'
                                    />
                                    {formErrors.firstName && <p className='mt-1 text-xs text-red-600'>{formErrors.firstName}</p>}
                                </div>
                                <div>
                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Last Name</label>
                                    <input
                                        type='text'
                                        className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                            formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        value={form.lastName}
                                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                                        disabled={createLoading}
                                        placeholder='Doe'
                                    />
                                    {formErrors.lastName && <p className='mt-1 text-xs text-red-600'>{formErrors.lastName}</p>}
                                </div>
                            </div>

                            <div>
                                <label className='mb-1 block text-sm font-medium text-gray-700'>Password</label>
                                <input
                                    type='password'
                                    className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        formErrors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    value={form.password}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                    disabled={createLoading}
                                    placeholder='••••••••'
                                />
                                {formErrors.password && <p className='mt-1 text-xs text-red-600'>{formErrors.password}</p>}
                            </div>

                            <div className='mt-2 flex items-center justify-end gap-2'>
                                <button
                                    type='button'
                                    className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 cursor-pointer'
                                    onClick={() => setIsCreateOpen(false)}
                                    disabled={createLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className='inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70 cursor-pointer'
                                    disabled={createLoading}
                                >
                                    {createLoading ? (
                                        <>
                                            <svg className='mr-2 h-4 w-4 animate-spin' viewBox='0 0 24 24'>
                                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
