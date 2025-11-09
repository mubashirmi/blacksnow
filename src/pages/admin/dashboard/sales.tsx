'use client';

import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

type UserRow = {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive';
};

export default function SalesPage() {
    const router = useRouter();
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
                id: user.id,
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

            {/* Card shell with dark gradient header (shared design) */}
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-white'>Sales</h2>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer'
                    >
                        + Create User
                    </button>
                </div>

                <div className='p-6'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead>
                                <tr className='border-b border-slate-200'>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Sr #</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>First Name</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Last Name</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Email</th>
                                    {/* <th className='text-left py-3 px-4 font-medium text-slate-700'>Role</th> */}
                                    {/* <th className='text-left py-3 px-4 font-medium text-slate-700'>Status</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {salesData.map((person, index) => (
                                    <tr key={index} className='border-b border-slate-100 hover:bg-slate-50 transition-colors'>
                                        <td className='py-3 px-4 text-slate-600'>{index + 1}</td>
                                        <td className='py-3 px-4'>{person.firstName}</td>
                                        <td className='py-3 px-4'>{person.lastName}</td>
                                        <td className='py-3 px-4 text-blue-600'>{person.email}</td>
                                        {/* <td className='py-3 px-4'>{person.role}</td> */}
                                        {/* <td className='py-3 px-4'>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${person.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {person.status}
                                            </span>
                                        </td> */}
                                        <td className='py-3 px-4'>
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        {
                                                            pathname: `/admin/dashboard/sales/kpi/${person.id}`,
                                                            query: { name: person.firstName + ' ' + person.lastName },
                                                        },
                                                        undefined,
                                                        { shallow: true }
                                                    )
                                                }
                                                className='rounded-lg text-white cursor-pointer py-2 px-5 bg-blue-400 hover:bg-blue-500 duration-200 ease-in-out transition-all'
                                            >
                                                View KPI
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {salesData.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={6} className='py-6 px-4 text-center text-slate-500'>
                                            No sales users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create User Modal — shared visual style, logic unchanged */}
            {isCreateOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center'>
                    <div className='absolute inset-0 bg-black/70' onClick={() => !createLoading && setIsCreateOpen(false)} />
                    <div className='relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden'>
                        {/* Dark gradient header */}
                        <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                            <h3 className='text-lg font-bold text-white'>Create User</h3>
                            <button
                                onClick={() => !createLoading && setIsCreateOpen(false)}
                                className='text-white/90 hover:text-white transition-colors'
                                aria-label='Close'
                            >
                                ✕
                            </button>
                        </div>

                        <div className='p-6'>
                            {createError && <div className='mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{createError}</div>}

                            <form onSubmit={handleCreateUser} className='space-y-4'>
                                <div>
                                    <label className='mb-1 block text-sm font-medium text-slate-700'>Email</label>
                                    <input
                                        type='email'
                                        className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            formErrors.email ? 'border-red-300' : 'border-slate-300'
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
                                        <label className='mb-1 block text-sm font-medium text-slate-700'>First Name</label>
                                        <input
                                            type='text'
                                            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                formErrors.firstName ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                            value={form.firstName}
                                            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                                            disabled={createLoading}
                                            placeholder='Jane'
                                        />
                                        {formErrors.firstName && <p className='mt-1 text-xs text-red-600'>{formErrors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className='mb-1 block text-sm font-medium text-slate-700'>Last Name</label>
                                        <input
                                            type='text'
                                            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                formErrors.lastName ? 'border-red-300' : 'border-slate-300'
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
                                    <label className='mb-1 block text-sm font-medium text-slate-700'>Password</label>
                                    <input
                                        type='password'
                                        className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            formErrors.password ? 'border-red-300' : 'border-slate-300'
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
                                        className='rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer'
                                        onClick={() => setIsCreateOpen(false)}
                                        disabled={createLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        className='inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70 cursor-pointer'
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
                </div>
            )}
        </div>
    );
}
