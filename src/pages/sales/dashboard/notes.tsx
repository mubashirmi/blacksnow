'use client';

import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Note {
    id?: number;
    title: string;
    authorName: string;
    content: string;
    createdAt?: string;
    deleted?: boolean;
}

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [errors, setErrors] = useState<{ title?: string; content?: string; authorName?: string }>({});
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setIsLoading(true);
                const authId = Number(localStorage.getItem('userId'));
                const response = await fetch(`/api/v1/notes?id=${authId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) throw new Error('Failed to fetch notes');

                const data = await response.json();
                if (data.success && data.data) {
                    setNotes(data.data.filter((note: Note) => !note.deleted));
                } else {
                    throw new Error('Invalid response format');
                }
            } catch {
                setAlert({ type: 'error', message: 'Failed to load notes. Please try again.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, []);

    const validateForm = () => {
        const newErrors: { title?: string; content?: string; authorName?: string } = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        else if (title.length < 3) newErrors.title = 'Title must be at least 3 characters long';
        else if (title.length > 100) newErrors.title = 'Title cannot exceed 100 characters';

        if (!content.trim()) newErrors.content = 'Content is required';
        else if (content.length < 10) newErrors.content = 'Content must be at least 10 characters long';
        else if (content.length > 1000) newErrors.content = 'Content cannot exceed 1000 characters';

        if (!authorName.trim()) newErrors.authorName = 'Author name is required';
        else if (authorName.length < 2) newErrors.authorName = 'Author name must be at least 2 characters long';
        else if (authorName.length > 50) newErrors.authorName = 'Author name cannot exceed 50 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateNote = async () => {
        setAlert(null);
        if (!validateForm()) return;

        try {
            setIsCreating(true);
            const authId = Number(localStorage.getItem('userId'));
            const response = await fetch('/api/v1/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    authorName: authorName.trim(),
                    deleted: false,
                    authId,
                }),
            });

            if (!response.ok) throw new Error('Failed to create note');

            const newNote = await response.json();
            setNotes((prevNotes) => [...prevNotes, newNote.data]);
            setAlert({ type: 'success', message: 'Note created successfully!' });
            setTitle('');
            setContent('');
            setAuthorName('');
            setErrors({});
            setIsModalOpen(false);
        } catch {
            setAlert({ type: 'error', message: 'Failed to create note. Please try again.' });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: number | undefined, title: string) => {
        if (!id) {
            setAlert({ type: 'error', message: 'Cannot delete note: Invalid ID.' });
            return;
        }

        setAlert(null);
        setIsDeleting(id);
        try {
            const response = await fetch(`/api/v1/notes/?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Failed to delete note');

            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
            setAlert({ type: 'success', message: `Note "${title}" deleted successfully!` });
        } catch {
            setAlert({ type: 'error', message: `Failed to delete note "${title}". Please try again.` });
        } finally {
            setIsDeleting(null);
        }
    };

    // Close modal on Escape
    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsModalOpen(false);
    }, []);

    useEffect(() => {
        if (!isModalOpen) return;
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isModalOpen, onKeyDown]);

    return (
        <div className='space-y-6'>
            {alert && (
                <div className={`p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{alert.message}</div>
            )}

            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex justify-between items-center'>
                    <h2 className='text-2xl font-bold text-white'>Notes</h2>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 cursor-pointer'
                    >
                        Add New Note
                    </Button>
                </div>

                <div className='p-6'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead>
                                <tr className='border-b border-slate-200'>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Title</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Author</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Date</th>
                                    <th className='text-left py-3 px-4 font-medium text-slate-700'>Content</th>
                                    <th className='text-center py-3 px-4 font-medium text-slate-700'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className='py-4 px-4 text-slate-600 text-center'>
                                            Loading notes...
                                        </td>
                                    </tr>
                                ) : notes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className='py-4 px-4 text-slate-600 text-center'>
                                            No notes available.
                                        </td>
                                    </tr>
                                ) : (
                                    notes.map((note, index) => (
                                        <tr key={note.id || index} className='border-b border-slate-100 hover:bg-slate-50 transition-colors'>
                                            <td className='py-4 px-4 text-slate-800 font-medium'>{note.title}</td>
                                            <td className='py-4 px-4 text-slate-600'>{note.authorName}</td>
                                            <td className='py-4 px-4 text-slate-600'>
                                                {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className='py-4 px-4 text-slate-600 max-w-md'>
                                                <div className='truncate' title={note.content}>
                                                    {note.content}
                                                </div>
                                            </td>
                                            <td className='py-4 px-4 text-center'>
                                                <Button
                                                    onClick={() => handleDelete(note.id, note.title)}
                                                    variant='destructive'
                                                    size='sm'
                                                    className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-sm transition-all duration-200'
                                                    disabled={isDeleting === note.id}
                                                >
                                                    {isDeleting === note.id ? (
                                                        <svg
                                                            className='animate-spin w-4 h-4 mr-1 text-white'
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            fill='none'
                                                            viewBox='0 0 24 24'
                                                        >
                                                            <circle
                                                                className='opacity-25'
                                                                cx='12'
                                                                cy='12'
                                                                r='10'
                                                                stroke='currentColor'
                                                                strokeWidth='4'
                                                            ></circle>
                                                            <path
                                                                className='opacity-75'
                                                                fill='currentColor'
                                                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                            ></path>
                                                        </svg>
                                                    ) : (
                                                        <Trash2 className='w-4 h-4 mr-1' />
                                                    )}
                                                    {isDeleting === note.id ? 'Deleting...' : 'Delete'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal with matching dark gradient header */}
            {isModalOpen && (
                <div
                    className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'
                    onClick={() => setIsModalOpen(false)} // close on overlay click
                >
                    <div
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='create-note-title'
                        className='bg-white rounded-[18px] shadow-2xl w-full max-w-md border border-slate-500 overflow-hidden'
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                    >
                        {/* Header matches the page header */}
                        <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 flex items-center justify-between rounded-t-2xl'>
                            <h3 id='create-note-title' className='text-lg font-semibold text-white'>
                                Create New Note
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='text-white/90 hover:text-white transition-colors cursor-pointer'
                                aria-label='Close'
                            >
                                <X className='w-5 h-5' />
                            </button>
                        </div>

                        {/* Body */}
                        <div className='p-6 space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Title</label>
                                <input
                                    type='text'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder='Enter note title'
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.title ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                />
                                {errors.title && <p className='text-red-500 text-sm mt-1'>{errors.title}</p>}
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Author Name</label>
                                <input
                                    type='text'
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder='Enter author name'
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.authorName ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                />
                                {errors.authorName && <p className='text-red-500 text-sm mt-1'>{errors.authorName}</p>}
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Content</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder='Enter note content'
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.content ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                />
                                {errors.content && <p className='text-red-500 text-sm mt-1'>{errors.content}</p>}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className='px-6 pb-6 flex justify-end gap-2'>
                            <Button
                                onClick={() => setIsModalOpen(false)}
                                className='bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg cursor-pointer'
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateNote}
                                className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60 cursor-pointer'
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
                                    'Create Note'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
