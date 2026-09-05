'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, Upload, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

function PostBlog() {
    const [formData, setFormData] = useState({
        title: '',
        postContent: '',
        category: '',
        headerImageUrl: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const cloudinaryWidgetRef = useRef<any>(null);
    const postContentRef = useRef<HTMLDivElement>(null);

    // Initialize Cloudinary widget
    useEffect(() => {
        const script = document.createElement('script');

        script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
        script.async = true;

        document.body.appendChild(script);

        script.onload = () => {
            cloudinaryWidgetRef.current = (window as any).cloudinary.createUploadWidget(
                {
                    cloudName: 'dpl3j2r3f',
                    uploadPreset: 'gptfrontend',
                    sources: ['local'],
                    multiple: false,
                    resourceType: 'image',
                    clientAllowedFormats: ['jpg', 'png', 'jpeg'],
                    maxFileSize: 5000000,
                },
                (error: any, result: any) => {
                    if (!error && result && result.event === 'success') {
                        setFormData((prev) => ({
                            ...prev,
                            headerImageUrl: result.info.secure_url,
                        }));

                        setAlert({
                            type: 'success',
                            message: 'Image uploaded successfully!',
                        });
                    } else if (error) {
                        setAlert({
                            type: 'error',
                            message: 'Failed to upload image. Please try again.',
                        });
                    }
                }
            );
        };

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = () => {
        if (cloudinaryWidgetRef.current) {
            cloudinaryWidgetRef.current.open();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        setAlert(null);

        try {
            const response = await fetch('/api/v1/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create blog post');
            }

            setAlert({
                type: 'success',
                message: 'Blog post created successfully!',
            });

            // Reset React form state
            setFormData({
                title: '',
                postContent: '',
                category: '',
                headerImageUrl: '',
            });

            // Reset the contentEditable editor
            if (postContentRef.current) {
                postContentRef.current.innerHTML = '';
            }
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to create blog post. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-2xl font-bold text-gray-800 mb-6'>Post Blog</h2>

                {alert && (
                    <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        {alert.type === 'success' ? <CheckCircle className='h-4 w-4 text-green-600' /> : <XCircle className='h-4 w-4 text-red-600' />}

                        <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>{alert.message}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Category */}
                    <div>
                        <Label htmlFor='category' className='text-sm font-medium text-gray-700'>
                            Category
                        </Label>

                        <Input
                            id='category'
                            name='category'
                            value={formData.category}
                            onChange={handleInputChange}
                            className='mt-1'
                            placeholder='Enter category'
                            required
                        />
                    </div>

                    {/* Article Title */}
                    <div>
                        <Label htmlFor='title' className='text-sm font-medium text-gray-700'>
                            Article Title
                        </Label>

                        <Input
                            id='title'
                            name='title'
                            value={formData.title}
                            onChange={handleInputChange}
                            className='mt-1'
                            placeholder='Enter article title'
                            required
                        />
                    </div>

                    {/* Upload Header Image */}
                    <div>
                        <Label className='text-sm font-medium text-gray-700'>Upload Header Image</Label>

                        <div className='mt-1 flex items-center space-x-4'>
                            <Button type='button' onClick={handleImageUpload} className='bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md'>
                                <Upload className='mr-2 h-4 w-4' />
                                Choose Image
                            </Button>

                            {formData.headerImageUrl && (
                                <div className='text-sm text-gray-600'>
                                    Image URL: <span className='font-medium'>{formData.headerImageUrl}</span>
                                </div>
                            )}
                        </div>

                        <p className='text-xs text-gray-500 mt-1'>Upload a single image (JPG, PNG, JPEG, max 5MB)</p>
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                        <Label htmlFor='postContent' className='text-sm font-medium text-gray-700'>
                            Post Content
                        </Label>

                        <div className='mt-1'>
                            {/* Rich Text Toolbar */}
                            <div className='border border-gray-300 rounded-t-md bg-gray-50 p-2 flex flex-wrap gap-1'>
                                <button type='button' className='p-1 rounded hover:bg-gray-200 text-sm font-bold' onClick={() => document.execCommand('bold')}>
                                    B
                                </button>

                                <button type='button' className='p-1 rounded hover:bg-gray-200 text-sm italic' onClick={() => document.execCommand('italic')}>
                                    I
                                </button>

                                <button
                                    type='button'
                                    className='p-1 rounded hover:bg-gray-200 text-sm underline'
                                    onClick={() => document.execCommand('underline')}
                                >
                                    U
                                </button>

                                <div className='w-px h-6 bg-gray-300 mx-1' />

                                <button type='button' className='p-1 rounded hover:bg-gray-200 text-sm' onClick={() => document.execCommand('justifyLeft')}>
                                    ⬅
                                </button>

                                <button type='button' className='p-1 rounded hover:bg-gray-200 text-sm' onClick={() => document.execCommand('justifyCenter')}>
                                    ⬌
                                </button>

                                <button type='button' className='p-1 rounded hover:bg-gray-200 text-sm' onClick={() => document.execCommand('justifyRight')}>
                                    ➡
                                </button>

                                <div className='w-px h-6 bg-gray-300 mx-1' />

                                <button
                                    type='button'
                                    className='p-1 rounded hover:bg-gray-200 text-sm'
                                    onClick={() => document.execCommand('insertUnorderedList')}
                                >
                                    • List
                                </button>

                                <button
                                    type='button'
                                    className='p-1 rounded hover:bg-gray-200 text-sm'
                                    onClick={() => document.execCommand('insertOrderedList')}
                                >
                                    1. List
                                </button>
                            </div>

                            {/* Content Editor */}
                            <div
                                id='postContent'
                                ref={postContentRef}
                                contentEditable
                                className='min-h-[300px] p-4 border border-t-0 border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                style={{
                                    whiteSpace: 'pre-wrap',
                                }}
                                onInput={(e) => {
                                    const content = e.currentTarget.innerHTML;

                                    setFormData((prev) => ({
                                        ...prev,
                                        postContent: content,
                                    }));
                                }}
                                suppressContentEditableWarning
                            />
                        </div>

                        <p className='text-xs text-gray-500 mt-1'>Use the toolbar above to format your content</p>
                    </div>

                    {/* Submit Button */}
                    <div className='flex justify-start'>
                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-8 py-2 rounded-md font-medium'
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Creating Blog...
                                </>
                            ) : (
                                'Create Blog'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export { PostBlog };
