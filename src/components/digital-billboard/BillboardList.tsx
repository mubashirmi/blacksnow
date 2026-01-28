import type { BillboardData } from '@/lib/digital-billboard/types';
import { getStatusPillClasses } from '@/lib/digital-billboard/utils';
import Image from 'next/image';

export function BillboardList({ billboards, onCreate, onEdit }: { billboards: BillboardData[]; onCreate: () => void; onEdit: (bb: BillboardData) => void }) {
    if (billboards.length === 0) {
        return (
            <div className='bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100'>
                <h2 className='text-2xl font-bold text-gray-900'>No billboards yet</h2>
                <p className='text-gray-600 mt-2'>Create your first digital billboard to get started.</p>
                <button
                    onClick={onCreate}
                    className='mt-6 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc]'
                >
                    Advertise your billboard
                </button>
            </div>
        );
    }

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {billboards.map((bb) => (
                <div key={bb.id} className='bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100'>
                    <div className='relative h-48'>
                        <Image src={bb.image} alt={bb.companyName} fill className='object-cover' sizes='(max-width: 1024px) 100vw, 50vw' />
                    </div>

                    <div className='p-6'>
                        <div className='flex items-start justify-between gap-3'>
                            <div>
                                <h3 className='text-xl font-bold text-gray-900'>{bb.companyName}</h3>
                                <p className='text-gray-600'>{bb.fullName}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusPillClasses(bb.status)}`}>
                                {bb.status === 'NotApproved' ? 'Pending' : bb.status}
                            </span>
                        </div>

                        <p className='text-gray-700 mt-4 line-clamp-3'>{bb.description}</p>

                        <div className='mt-5 flex gap-3'>
                            <button
                                onClick={() => onEdit(bb)}
                                className='flex-1 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc]'
                            >
                                Edit
                            </button>

                            {bb.website && (
                                <a
                                    href={bb.website}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='px-4 py-2 rounded-lg font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors'
                                >
                                    Visit
                                </a>
                            )}
                        </div>

                        {bb.status === 'Rejected' && <p className='mt-3 text-sm text-red-600'>This billboard was rejected. Edit it and resubmit.</p>}
                        {bb.status === 'NotApproved' && <p className='mt-3 text-sm text-blue-600'>This billboard is pending admin approval.</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}
