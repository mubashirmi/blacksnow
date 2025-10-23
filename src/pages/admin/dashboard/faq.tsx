'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FAQ {
    id: number;
    title: string;
    text: string;
}

export default function FAQPage() {
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const fetchFAQs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/v1/faq', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch FAQs');
            }
            const data = await response.json();
            if (data.success && data.data?.faqs) {
                const cleaned: FAQ[] = (data.data.faqs as Array<FAQ & { deleted?: boolean }>)
                    .filter((f) => !f.deleted)
                    .map((f) => ({ id: f.id, title: f.title, text: f.text }));
                setFaqs(cleaned);
            } else {
                throw new Error('Invalid response format');
            }
        } catch {
            setAlert({ type: 'error', message: 'Failed to load FAQs. Please try again.' });
            setFaqs([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, []);

    const validateForm = () => {
        const newErrors: { title?: string; description?: string } = {};
        if (!title.trim()) newErrors.title = 'Question is required';
        else if (title.trim().length < 5) newErrors.title = 'Question must be at least 5 characters long';
        else if (title.trim().length > 100) newErrors.title = 'Question cannot exceed 100 characters';

        if (!description.trim()) newErrors.description = 'Answer is required';
        else if (description.trim().length < 10) newErrors.description = 'Answer must be at least 10 characters long';
        else if (description.trim().length > 1000) newErrors.description = 'Answer cannot exceed 1000 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const extractCreatedFaq = (payload: any): FAQ | null => {
        const d = payload?.data ?? payload;
        const faq = d?.faq ?? d;
        if (!faq || typeof faq !== 'object') return null;
        if (faq.id == null || faq.title == null || faq.text == null) return null;
        return { id: faq.id, title: faq.title, text: faq.text };
    };

    const handleCreateFAQ = async () => {
        setAlert(null);
        if (!validateForm()) return;

        try {
            setIsCreating(true);
            const response = await fetch('/api/v1/faq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    text: description.trim(),
                }),
            });

            if (!response.ok) throw new Error('Failed to create FAQ');

            const payload = await response.json();
            const created = extractCreatedFaq(payload);

            if (created) {
                setFaqs((prev) => [created, ...prev]);
            } else {
                await fetchFAQs();
            }

            setAlert({ type: 'success', message: 'FAQ created successfully!' });
            setTitle('');
            setDescription('');
            setErrors({});
            // optional: keep the list fresh
            fetchFAQs();
        } catch {
            setAlert({ type: 'error', message: 'Failed to create FAQ. Please try again.' });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteFAQ = async (id: number) => {
        setAlert(null);
        setDeletingId(id);

        try {
            const response = await fetch(`/api/v1/faq?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Failed to delete FAQ');

            // Optimistic update: remove from list immediately
            setFaqs((prev) => prev.filter((faq) => faq.id !== id));

            // Close the expanded FAQ if it was the one being deleted
            if (expandedFAQ === id) {
                setExpandedFAQ(null);
            }

            setAlert({ type: 'success', message: 'FAQ deleted successfully!' });
        } catch {
            setAlert({ type: 'error', message: 'Failed to delete FAQ. Please try again.' });
            fetchFAQs();
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className='space-y-6'>
            {alert && (
                <div className={`p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{alert.message}</div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Create FAQ Card — matches the Notes/Newsletter card structure */}
                <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                    <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4'>
                        <h2 className='text-xl font-bold text-white'>Create New FAQ</h2>
                    </div>
                    <div className='p-6 space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>Question</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Enter FAQ question'
                                className={`border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : ''}`}
                            />
                            {errors.title && <p className='text-red-500 text-sm mt-1'>{errors.title}</p>}
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>Answer</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='Enter FAQ answer'
                                rows={4}
                                className={`border-slate-200 h-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.description ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.description && <p className='text-red-500 text-sm mt-1'>{errors.description}</p>}
                        </div>
                        <Button
                            onClick={handleCreateFAQ}
                            className='w-full bg-blue-500 cursor-pointer hover:bg-blue-600 text-white rounded-lg disabled:opacity-60'
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <svg className='animate-spin w-4 h-4 mr-2' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create FAQ'
                            )}
                        </Button>
                    </div>
                </div>

                {/* Existing FAQs Card — same structure + header actions */}
                <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                    <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                        <h2 className='text-xl font-bold text-white'>Existing FAQs</h2>
                    </div>

                    <div className='p-6'>
                        {isLoading ? (
                            <div className='space-y-2'>
                                <div className='h-10 w-full animate-pulse rounded bg-slate-200' />
                                <div className='h-10 w-full animate-pulse rounded bg-slate-200' />
                                <div className='h-10 w-full animate-pulse rounded bg-slate-200' />
                            </div>
                        ) : faqs.length === 0 ? (
                            <div className='text-slate-600'>No FAQs available.</div>
                        ) : (
                            <div className='space-y-3'>
                                {faqs.map((faq) => (
                                    <div key={faq.id} className='border border-slate-200 rounded-lg overflow-hidden'>
                                        <div className='flex items-center justify-between p-4'>
                                            <button
                                                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                                className='flex-1 flex items-center justify-between text-left hover:bg-slate-50 transition-colors -m-4 p-4 rounded-l-lg'
                                            >
                                                <span className='font-medium text-slate-800'>{faq.title}</span>
                                                {expandedFAQ === faq.id ? (
                                                    <ChevronDown className='w-4 h-4 text-slate-500' />
                                                ) : (
                                                    <ChevronRight className='w-4 h-4 text-slate-500' />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFAQ(faq.id)}
                                                disabled={deletingId === faq.id}
                                                className='ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                                title='Delete FAQ'
                                            >
                                                {deletingId === faq.id ? (
                                                    <svg className='animate-spin w-4 h-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                                        <path
                                                            className='opacity-75'
                                                            fill='currentColor'
                                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                        ></path>
                                                    </svg>
                                                ) : (
                                                    <Trash2 className='w-4 h-4' />
                                                )}
                                            </button>
                                        </div>
                                        {expandedFAQ === faq.id && (
                                            <div className='px-4 pb-4 text-slate-600 border-t border-slate-100'>
                                                <p className='pt-3'>{faq.text}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
