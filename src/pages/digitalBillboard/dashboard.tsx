import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

interface BillboardData {
    id: number;
    fullName: string;
    website: string;
    podcast: string;
    twitter: string;
    youTube: string;
    facebook: string;
    image: string;
    companyName: string;
    description: string;
    status: 'Approved' | 'NotApproved' | 'Rejected';
    authId: number;
}

interface FormData {
    fullName: string;
    website: string;
    podcast: string;
    twitter: string;
    youTube: string;
    facebook: string;
    image: string;
    companyName: string;
    description: string;
}

interface Errors {
    [key: string]: string;
}

export default function DigitalBillboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [billboardData, setBillboardData] = useState<BillboardData | null>(null);
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        website: '',
        podcast: '',
        twitter: '',
        youTube: '',
        facebook: '',
        image: '',
        companyName: '',
        description: '',
    });
    const [errors, setErrors] = useState<Errors>({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        checkAuthAndFetchData();
        // eslint-disable-next-line no-use-before-define
    }, []);

    const checkAuthAndFetchData = async () => {
        // Check userId in localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
            router.push('/login');
            return;
        }

        // Check roles in localStorage
        const rolesStr = localStorage.getItem('roles');
        if (!rolesStr) {
            router.push('/pricing');
            return;
        }

        try {
            const roles: string[] = JSON.parse(rolesStr);
            if (!roles.includes('DigitalBillboard')) {
                router.push('/pricing');
                return;
            }
        } catch (error) {
            console.error('Error parsing roles:', error);
            router.push('/pricing');
            return;
        }

        // Check digital billboard status
        try {
            const statusRes = await axios.get(`/api/v2/get-digital-billboard-status?id=${userId}`);

            if (statusRes.data.status !== true || statusRes.data.message !== 'Digital billboard exist') {
                setStatusMessage('waiting_approval');
                setLoading(false);
                return;
            }

            // Fetch billboard data
            const billboardRes = await axios.get(`/api/v2/digital-billboard?id=${userId}`);
            const data: BillboardData = billboardRes.data.data;

            setBillboardData(data);
            setFormData({
                fullName: data.fullName,
                website: data.website,
                podcast: data.podcast,
                twitter: data.twitter,
                youTube: data.youTube,
                facebook: data.facebook,
                image: data.image,
                companyName: data.companyName,
                description: data.description,
            });

            if (data.status === 'NotApproved') {
                setStatusMessage('pending_approval');
            } else if (data.status === 'Rejected') {
                setStatusMessage('rejected');
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching billboard data:', error);
            setStatusMessage('waiting_approval');
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        const formDataImg = new FormData();
        formDataImg.append('file', file);
        formDataImg.append('upload_preset', 'gptfrontend');
        formDataImg.append('cloud_name', 'dpl3j2r3f');

        try {
            const response = await axios.post('https://api.cloudinary.com/v1_1/dpl3j2r3f/image/upload', formDataImg);
            setFormData((prev) => ({
                ...prev,
                image: response.data.secure_url,
            }));
            setErrors((prev) => ({ ...prev, image: '' }));
        } catch (error) {
            console.error('Error uploading image:', error);
            setErrors((prev) => ({ ...prev, image: 'Failed to upload image' }));
        } finally {
            setUploadingImage(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.image) newErrors.image = 'Image is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            setLoading(true);
            const response = await axios.put(`/api/v2/digital-billboard?id=${userId}`, {
                ...formData,
                status: 'NotApproved',
            });

            setBillboardData(response.data.data);
            setIsEditing(false);
            setStatusMessage('pending_approval');
            alert('Billboard updated successfully! Pending admin approval.');
        } catch (error) {
            console.error('Error updating billboard:', error);
            alert('Failed to update billboard. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center  bg-[#050608]'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
                    <p className='mt-4 text-gray-600'>Loading...</p>
                </div>
            </div>
        );
    }

    if (statusMessage === 'waiting_approval') {
        return (
            <div className='min-h-screen flex items-center justify-center  bg-[#050608] px-4'>
                <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
                    <div className='mb-4'>
                        <svg className='mx-auto h-16 w-16 text-yellow-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>Waiting for Approval</h1>
                    <p className='text-gray-600'>
                        Please wait for admin&apos;s approval for your digital billboard. You will be notified once it&apos;s approved.
                    </p>
                </div>
            </div>
        );
    }

    if (statusMessage === 'pending_approval' && !isEditing) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
                <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
                    <div className='mb-4'>
                        <svg className='mx-auto h-16 w-16 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>Pending Approval</h1>
                    <p className='text-gray-600 mb-4'>Your digital billboard is currently under review by the admin. Please wait for approval.</p>
                    <button onClick={() => router.push('/')} className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (statusMessage === 'rejected' && !isEditing) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
                <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
                    <div className='mb-4'>
                        <svg className='mx-auto h-16 w-16 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                        </svg>
                    </div>
                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>Billboard Rejected</h1>
                    <p className='text-gray-600 mb-6'>Your digital billboard has been rejected by the admin. Please edit and resubmit for approval.</p>
                    <button onClick={() => setIsEditing(true)} className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                        Edit Billboard
                    </button>
                </div>
            </div>
        );
    }

    if (isEditing || statusMessage === 'rejected') {
        return (
            <div className='min-h-screen bg-[#050608] py-20 px-4'>
                <div className='max-w-3xl mx-auto'>
                    <div className='bg-white rounded-lg shadow-lg p-8'>
                        <h1 className='text-3xl font-bold text-gray-900 mb-6'>Edit Digital Billboard</h1>

                        <form onSubmit={handleSubmit} className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name *</label>
                                    <input
                                        type='text'
                                        name='fullName'
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    />
                                    {errors.fullName && <p className='text-red-500 text-sm mt-1'>{errors.fullName}</p>}
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Company Name *</label>
                                    <input
                                        type='text'
                                        name='companyName'
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    />
                                    {errors.companyName && <p className='text-red-500 text-sm mt-1'>{errors.companyName}</p>}
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Website</label>
                                    <input
                                        type='text'
                                        name='website'
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Podcast</label>
                                    <input
                                        type='text'
                                        name='podcast'
                                        value={formData.podcast}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Twitter</label>
                                    <input
                                        type='text'
                                        name='twitter'
                                        value={formData.twitter}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>YouTube</label>
                                    <input
                                        type='text'
                                        name='youTube'
                                        value={formData.youTube}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Facebook</label>
                                    <input
                                        type='text'
                                        name='facebook'
                                        value={formData.facebook}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Description *</label>
                                <textarea
                                    name='description'
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                />
                                {errors.description && <p className='text-red-500 text-sm mt-1'>{errors.description}</p>}
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Billboard Image *</label>
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handleFileChange}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                />
                                {uploadingImage && <p className='text-blue-500 text-sm mt-1'>Uploading image...</p>}
                                {formData.image && (
                                    <Image
                                        width={100}
                                        height={100}
                                        src={formData.image}
                                        alt='Billboard'
                                        className='mt-4 w-full max-w-md h-48 object-cover rounded-lg'
                                    />
                                )}
                                {errors.image && <p className='text-red-500 text-sm mt-1'>{errors.image}</p>}
                            </div>

                            <div className='flex gap-4'>
                                <button
                                    type='submit'
                                    disabled={uploadingImage || loading}
                                    className='flex-1 px-6 py-3 bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] text-white rounded-lg hover:from-[#2a8dcc] hover:to-[#4cc7e8] font-semibold duration-200 transition-all ease-in-out cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed'
                                >
                                    {loading ? 'Updating...' : 'Update Billboard'}
                                </button>
                                {billboardData?.status === 'Approved' && (
                                    <button
                                        type='button'
                                        onClick={() => setIsEditing(false)}
                                        className='px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Display approved billboard
    return (
        <div className='min-h-screen  bg-[#050608] py-20 px-4'>
            <div className='max-w-4xl mx-auto'>
                <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
                    {/* Header */}
                    <div className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] px-8 py-6'>
                        <div className='flex justify-between items-center'>
                            <h1 className='text-3xl font-bold text-white'>Digital Billboard</h1>
                            <span className='px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold'>{billboardData?.status}</span>
                        </div>
                    </div>

                    {/* Image */}
                    <div className='relative h-64 md:h-96'>
                        <Image width={100} height={100} src={billboardData?.image} alt={billboardData?.companyName} className='w-full h-full object-cover' />
                    </div>

                    {/* Content */}
                    <div className='p-8'>
                        <div className='mb-6'>
                            <h2 className='text-2xl font-bold text-gray-900 mb-2'>{billboardData?.companyName}</h2>
                            <p className='text-gray-600'>{billboardData?.fullName}</p>
                        </div>

                        <div className='mb-6'>
                            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Description</h3>
                            <p className='text-gray-700 leading-relaxed'>{billboardData?.description}</p>
                        </div>

                        {/* Social Links */}
                        <div className='border-t border-gray-200 pt-6'>
                            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Connect With Us</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {billboardData?.website && (
                                    <a
                                        href={billboardData.website}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                                    >
                                        <span className='font-medium text-gray-700'>🌐 Website:</span>
                                        <span className='text-blue-600 truncate'>{billboardData.website}</span>
                                    </a>
                                )}
                                {billboardData?.podcast && (
                                    <a
                                        href={billboardData.podcast}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                                    >
                                        <span className='font-medium text-gray-700'>🎙️ Podcast:</span>
                                        <span className='text-blue-600 truncate'>{billboardData.podcast}</span>
                                    </a>
                                )}
                                {billboardData?.twitter && (
                                    <a
                                        href={billboardData.twitter}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                                    >
                                        <span className='font-medium text-gray-700'>🐦 Twitter:</span>
                                        <span className='text-blue-600 truncate'>{billboardData.twitter}</span>
                                    </a>
                                )}
                                {billboardData?.youTube && (
                                    <a
                                        href={billboardData.youTube}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                                    >
                                        <span className='font-medium text-gray-700'>📺 YouTube:</span>
                                        <span className='text-blue-600 truncate'>{billboardData.youTube}</span>
                                    </a>
                                )}
                                {billboardData?.facebook && (
                                    <a
                                        href={billboardData.facebook}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                                    >
                                        <span className='font-medium text-gray-700'>👍 Facebook:</span>
                                        <span className='text-blue-600 truncate'>{billboardData.facebook}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className='mt-8'>
                            <button
                                onClick={() => setIsEditing(true)}
                                className='w-full px-6 py-3 bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] text-white rounded-lg hover:from-[#2a8dcc] hover:to-[#4cc7e8] font-semibold duration-200 transition-all ease-in-out cursor-pointer'
                            >
                                Edit Billboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
