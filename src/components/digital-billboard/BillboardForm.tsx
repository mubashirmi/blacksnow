import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL, EMPTY_FORM, MAX_BILLBOARDS } from '@/lib/digital-billboard/constants';
import type { BillboardFormValues, FormErrors } from '@/lib/digital-billboard/types';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

export function BillboardForm({
    mode,
    initialValues,
    usedCount,
    canCreateMore,
    onCancel,
    onSave,
}: {
    mode: 'create' | 'edit';
    initialValues?: BillboardFormValues;
    usedCount: number;
    canCreateMore: boolean;
    onCancel: () => void;
    onSave: (values: BillboardFormValues) => Promise<void>;
}) {
    const [formData, setFormData] = useState<BillboardFormValues>(initialValues ?? EMPTY_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [localError, setLocalError] = useState<string>('');

    useEffect(() => {
        setFormData(initialValues ?? EMPTY_FORM);
        setErrors({});
        setLocalError('');
    }, [initialValues]);

    const title = mode === 'create' ? 'Create Billboard' : 'Edit Billboard';
    const canSubmit = useMemo(() => !saving && !uploadingImage, [saving, uploadingImage]);

    const validate = (): boolean => {
        const next: FormErrors = {};
        if (!formData.fullName.trim()) next.fullName = 'Full name is required';
        if (!formData.companyName.trim()) next.companyName = 'Company name is required';
        if (!formData.description.trim()) next.description = 'Description is required';
        if (!formData.image) next.image = 'Image is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        setErrors((prev) => ({ ...prev, image: '' }));
        setLocalError('');

        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        fd.append('cloud_name', CLOUDINARY_CLOUD_NAME);

        try {
            const response = await axios.post(CLOUDINARY_UPLOAD_URL, fd);
            setFormData((prev) => ({ ...prev, image: response.data.secure_url }));
        } catch (error) {
            console.error('Error uploading image:', error);
            setErrors((prev) => ({ ...prev, image: 'Failed to upload image' }));
        } finally {
            setUploadingImage(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // eslint-disable-next-line
        const file = e.target.files?.[0];
        // eslint-disable-next-line
        if (file) void handleImageUpload(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (mode === 'create' && !canCreateMore) {
            setLocalError(`You can only create up to ${MAX_BILLBOARDS} billboards.`);
            return;
        }

        if (!validate()) return;

        setSaving(true);
        try {
            await onSave(formData);
        } catch (err) {
            console.error('Save failed:', err);
            setLocalError('Failed to save billboard. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
            <h2 className='text-2xl font-bold text-gray-900'>{title}</h2>
            <p className='text-gray-600 mt-1'>Required fields: Full Name, Company Name, Description, Image</p>

            {localError && <div className='mt-4 bg-red-50 text-red-700 border border-red-200 rounded-lg p-4'>{localError}</div>}

            <form onSubmit={handleSubmit} className='space-y-6 mt-6'>
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
                        <div className='mt-4 relative w-full max-w-md h-48'>
                            <Image src={formData.image} alt='Billboard' fill className='object-cover rounded-lg' sizes='(max-width: 768px) 100vw, 400px' />
                        </div>
                    )}
                    {errors.image && <p className='text-red-500 text-sm mt-1'>{errors.image}</p>}
                </div>

                <div className='flex gap-4'>
                    <button
                        type='submit'
                        disabled={!canSubmit}
                        className='flex-1 px-6 py-3 bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] text-white rounded-lg hover:from-[#2a8dcc] hover:to-[#4cc7e8] font-semibold duration-200 transition-all ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {saving ? 'Saving...' : mode === 'create' ? 'Submit Billboard' : 'Update Billboard'}
                    </button>
                    <button type='button' onClick={onCancel} className='px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'>
                        Cancel
                    </button>
                </div>

                {mode === 'create' && (
                    <p className='text-sm text-gray-600'>
                        {usedCount}/{MAX_BILLBOARDS} billboards used.
                    </p>
                )}
            </form>
        </div>
    );
}
