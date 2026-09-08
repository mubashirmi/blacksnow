'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

type UserRow = {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive';
};

export default function MarketingSubscribersPage() {
    const [salesData, setSalesData] = useState<UserRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/v2/get-all-user-data');
            // Filter users who have "Sales" in their roles array
            const filteredData = response.data.filter((user: any) => user.roles && user.roles.includes('EmailMarketing'));

            const formattedData: UserRow[] = filteredData.map((user: any) => ({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.roles.join(', '),
                status: 'Active',
            }));
            setSalesData(formattedData);
            // setSuccess('Data loaded successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError('Failed to fetch user data. Please try again later.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
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
        .dot-spinner__dot { position: absolute; top: 0; left: 0; display: flex; align-items: center; justify-content: flex-start; height: 100%; width: 100%; }
        .dot-spinner__dot::before {
          content: ''; height: 20%; width: 20%; border-radius: 50%;
          background-color: var(--uib-color); transform: scale(0); opacity: 0.5;
          animation: pulse0112 calc(var(--uib-speed) * 1.111) ease-in-out infinite; box-shadow: 0 0 20px rgba(18,31,53,.3);
        }
        .dot-spinner__dot:nth-child(2) { transform: rotate(45deg); }
        .dot-spinner__dot:nth-child(2)::before { animation-delay: calc(var(--uib-speed) * -0.875); }
        .dot-spinner__dot:nth-child(3) { transform: rotate(90deg); }
        .dot-spinner__dot:nth-child(3)::before { animation-delay: calc(var(--uib-speed) * -0.75); }
        .dot-spinner__dot:nth-child(4) { transform: rotate(135deg); }
        .dot-spinner__dot:nth-child(4)::before { animation-delay: calc(var(--uib-speed) * -0.625); }
        .dot-spinner__dot:nth-child(5) { transform: rotate(180deg); }
        .dot-spinner__dot:nth-child(5)::before { animation-delay: calc(var(--uib-speed) * -0.5); }
        @keyframes pulse0112 {
          0%,100% { transform: scale(0); opacity: .5; }
          50% { transform: scale(1); opacity: 1; }
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

            {/* Card shell with dark gradient header (shared design) */}
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-white'>Email Marketing Subscribers</h2>
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
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Status</th>
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
                                        <td colSpan={6} className='py-6 px-4 text-center text-slate-500'>
                                            No Email Marketing subscribers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
