import type { BillboardData } from '@/lib/digital-billboard/types';
import { getStatusPillClasses } from '@/lib/digital-billboard/utils';
import { ExternalLink, X } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';

export function BillboardViewModal({
    open,
    billboard,
    onClose,
    onEdit,
}: {
    open: boolean;
    billboard: BillboardData | null;
    onClose: () => void;
    onEdit: (bb: BillboardData) => void;
}) {
    const publicUrl = useMemo(() => {
        if (!billboard?.id) return '';
        return `https://www.blacksnowholdings.com/billboards/${billboard.id}`;
    }, [billboard?.id]);

    if (!open || !billboard) return null;

    const canVisit = billboard.status === 'Approved';

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
            <div className='absolute inset-0 bg-black/20 backdrop-blur-md transition-all duration-300' onClick={onClose} />

            <div
                className='relative z-50 w-full max-w-3xl rounded-2xl overflow-hidden border-2 border-[#2c7bbe]/30 shadow-2xl bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className='flex items-start justify-between gap-4 p-6 border-b border-white/10'>
                    <div>
                        <h2 className='text-2xl font-black bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>
                            {billboard.companyName}
                        </h2>
                        <p className='text-gray-300 mt-1'>{billboard.fullName}</p>
                    </div>

                    <button onClick={onClose} className='p-2 rounded-xl hover:bg-white/10 transition' aria-label='Close'>
                        <X className='w-5 h-5 text-gray-200' />
                    </button>
                </div>

                {/* Body */}
                <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Image */}
                    <div className='relative w-full h-64 md:h-full min-h-[260px] rounded-2xl overflow-hidden border border-white/10'>
                        <Image src={billboard.image} alt={billboard.companyName} fill className='object-cover' sizes='(max-width: 768px) 100vw, 50vw' />
                    </div>

                    {/* Details */}
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between gap-3'>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusPillClasses(billboard.status)}`}>
                                {billboard.status === 'NotApproved' ? 'Pending' : billboard.status}
                            </span>

                            {canVisit ? (
                                <a
                                    href={publicUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white hover:scale-[1.02] transition'
                                >
                                    <ExternalLink className='w-4 h-4' />
                                    Visit Public Page
                                </a>
                            ) : (
                                <button
                                    disabled
                                    className='inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-white/10 text-gray-400 cursor-not-allowed'
                                >
                                    <ExternalLink className='w-4 h-4' />
                                    Visit Disabled
                                </button>
                            )}
                        </div>

                        <div>
                            <h3 className='text-white font-semibold'>Description</h3>
                            <p className='text-gray-300 mt-1 leading-relaxed'>{billboard.description}</p>
                        </div>

                        <div className='grid grid-cols-2 gap-3 text-sm'>
                            <div className='bg-white/5 border border-white/10 rounded-xl p-3'>
                                <p className='text-gray-400'>Website</p>
                                {billboard.website ? (
                                    <a className='text-[#4cc7e8] break-all' href={billboard.website} target='_blank' rel='noopener noreferrer'>
                                        {billboard.website}
                                    </a>
                                ) : (
                                    <p className='text-gray-300'>—</p>
                                )}
                            </div>

                            <div className='bg-white/5 border border-white/10 rounded-xl p-3'>
                                <p className='text-gray-400'>YouTube</p>
                                {billboard.youTube ? (
                                    <a className='text-[#4cc7e8] break-all' href={billboard.youTube} target='_blank' rel='noopener noreferrer'>
                                        {billboard.youTube}
                                    </a>
                                ) : (
                                    <p className='text-gray-300'>—</p>
                                )}
                            </div>

                            <div className='bg-white/5 border border-white/10 rounded-xl p-3'>
                                <p className='text-gray-400'>Twitter</p>
                                {billboard.twitter ? (
                                    <a className='text-[#4cc7e8] break-all' href={billboard.twitter} target='_blank' rel='noopener noreferrer'>
                                        {billboard.twitter}
                                    </a>
                                ) : (
                                    <p className='text-gray-300'>—</p>
                                )}
                            </div>

                            <div className='bg-white/5 border border-white/10 rounded-xl p-3'>
                                <p className='text-gray-400'>Facebook</p>
                                {billboard.facebook ? (
                                    <a className='text-[#4cc7e8] break-all' href={billboard.facebook} target='_blank' rel='noopener noreferrer'>
                                        {billboard.facebook}
                                    </a>
                                ) : (
                                    <p className='text-gray-300'>—</p>
                                )}
                            </div>
                        </div>

                        <div className='flex gap-3 pt-2'>
                            <button
                                onClick={() => onEdit(billboard)}
                                className='flex-1 px-4 py-3 rounded-xl font-bold bg-white/10 border border-white/15 text-white hover:bg-white/15 transition'
                            >
                                Edit Billboard
                            </button>
                            <button
                                onClick={onClose}
                                className='px-4 py-3 rounded-xl font-bold bg-transparent border-2 border-[#2c7bbe] text-[#2c7bbe] hover:bg-[#2c7bbe] hover:text-white transition'
                            >
                                Close
                            </button>
                        </div>

                        {billboard.status === 'Rejected' && <p className='text-sm text-red-400'>This billboard was rejected. Please edit and resubmit.</p>}
                        {billboard.status === 'NotApproved' && <p className='text-sm text-blue-300'>This billboard is pending admin approval.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
