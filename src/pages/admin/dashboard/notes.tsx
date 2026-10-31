'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Mail, Maximize2, Minimize2, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

// First send the email; then create the note with the existing notes API.
const SEND_NOTE_EMAIL_ENDPOINT = '/api/v1/notes-for-users';

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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    // If email succeeds but note creation fails, retries only create the note.
    const [emailSent, setEmailSent] = useState(false);
    const [editorNotice, setEditorNotice] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [errors, setErrors] = useState<{ title?: string; content?: string; authorName?: string }>({});
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setIsLoading(true);
                const id = Number(localStorage.getItem('adminId'));
                const response = await fetch(`/api/v1/notes?id=${id}`, {
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
        const newErrors: { title?: string; content?: string } = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        else if (title.length < 3) newErrors.title = 'Title must be at least 3 characters long';
        else if (title.length > 100) newErrors.title = 'Title cannot exceed 100 characters';
        if (!content.trim()) newErrors.content = 'Content is required';
        else if (content.length < 10) newErrors.content = 'Content must be at least 10 characters long';
        else if (content.length > 1000) newErrors.content = 'Content cannot exceed 1000 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleCreateNote = async () => {
        setAlert(null);
        if (!validateForm()) return;
        try {
            setIsCreating(true);
            const id = localStorage.getItem('adminId');
            const response = await fetch(`/api/v1/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    authorName: ' ',
                    deleted: false,
                    authId: Number(id),
                }),
            });
            if (!response.ok) throw new Error('Failed to create note');
            const newNote = await response.json();
            setNotes((prevNotes) => [...prevNotes, newNote.data]);
            setAlert({ type: 'success', message: 'Note created successfully!' });
            setTitle('');
            setContent('');
            setErrors({});
            closeNoteModal();
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
    const closeNoteModal = useCallback(() => {
        if (isCreating || isSendingEmail) return;
        setIsModalOpen(false);
        setIsEmailModalOpen(false);
        setIsFullscreen(false);
        setRecipientEmail('');
        setEmailError('');
        setEditorNotice(null);
    }, [isCreating, isSendingEmail]);
    const openNoteModal = () => {
        setEmailSent(false);
        setEditorNotice(null);
        setEmailError('');
        setIsFullscreen(false);
        setIsModalOpen(true);
    };
    const openEmailModal = () => {
        setEmailError('');
        setEditorNotice(null);
        setIsEmailModalOpen(true);
    };
    const sendEmail = async () => {
        if (isSendingEmail) return;
        setEmailError('');
        setEditorNotice(null);
        setAlert(null);
        if (!validateForm()) {
            setEmailError('Please enter a valid title and note content before sending.');
            return;
        }
        const email = recipientEmail.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Please enter a valid recipient email address.');
            return;
        }
        const noteTitle = title.trim();
        const noteContent = content.trim();
        let hasSentEmail = emailSent;
        try {
            // Keep one loader running for the entire two-request workflow.
            setIsSendingEmail(true);
            // Step 1: Send email. If it was already sent in a previous attempt,
            // don't send another one when retrying the note creation.
            if (!hasSentEmail) {
                const emailResponse = await fetch(SEND_NOTE_EMAIL_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        authId: 5,
                        email,
                        title: noteTitle,
                        content: noteContent,
                        authorName: 'Black Snow Support',
                    }),
                });
                const emailResult = await emailResponse.json().catch(() => null);
                if (!emailResponse.ok || emailResult?.success === false) {
                    throw new Error(emailResult?.message || 'Failed to send email.');
                }
                hasSentEmail = true;
                setEmailSent(true);
            }
            // Step 2: Only after the email succeeds, create the note using
            // exactly the same endpoint and fields as Create Note.
            const adminId = Number(localStorage.getItem('adminId'));
            const noteResponse = await fetch('/api/v1/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: noteTitle,
                    content: noteContent,
                    authorName: ' ',
                    deleted: false,
                    authId: adminId,
                }),
            });
            const newNote = await noteResponse.json().catch(() => null);
            if (!noteResponse.ok || newNote?.success === false) {
                throw new Error(newNote?.message || 'Failed to create note.');
            }
            if (newNote?.data) {
                setNotes((prevNotes) => [...prevNotes, newNote.data]);
            }
            setAlert({ type: 'success', message: 'Email sent and note created successfully!' });
            setTitle('');
            setContent('');
            setErrors({});
            setRecipientEmail('');
            setEmailSent(false);
            setIsEmailModalOpen(false);
            setIsModalOpen(false);
            setIsFullscreen(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Please try again.';
            if (hasSentEmail) {
                // The email is already delivered: a retry must not send it twice.
                const noteError = `Email sent, but note creation failed: ${message} Click "Retry Create Note" to save it without resending the email.`;
                setEmailError(noteError);
                setAlert({ type: 'error', message: noteError });
            } else {
                setEmailError(message);
            }
        } finally {
            setIsSendingEmail(false);
        }
    };
    useEffect(() => {
        if (!isModalOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            if (isEmailModalOpen) {
                if (!isSendingEmail) setIsEmailModalOpen(false);
            } else {
                closeNoteModal();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isModalOpen, isEmailModalOpen, isSendingEmail, closeNoteModal]);
    return (
        <div className='space-y-6'>
            {alert && (
                <div className={`p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{alert.message}</div>
            )}
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex justify-between items-center'>
                    <h2 className='text-2xl font-bold text-white'>Notes</h2>
                    <Button
                        onClick={openNoteModal}
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
                                    {/* <th className='text-left py-3 px-4 font-medium text-slate-700'>Author</th> */}
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
                                            {/* <td className='py-4 px-4 text-slate-600'>{note.authorName}</td> */}
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
            {/* Note editor: original size or fullscreen. */}
            {isModalOpen && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${isFullscreen ? 'p-0' : 'p-3 sm:p-5'}`}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isEmailModalOpen) closeNoteModal();
                    }}
                >
                    <div
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='note-editor-heading'
                        className={`flex min-h-0 flex-col overflow-hidden border border-slate-500 bg-white shadow-2xl ${
                            isFullscreen ? 'h-[100dvh] w-screen max-w-none rounded-none' : 'max-h-[calc(100dvh-1.5rem)] w-full max-w-xl rounded-[18px]'
                        }`}
                    >
                        <div className='flex shrink-0 items-center justify-between gap-3 bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 sm:px-5'>
                            <div className='flex min-w-0 items-center gap-3'>
                                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1'>
                                    <Image src='/logocolored.png' alt='Black Snow logo' width={36} height={36} className='h-full w-full object-contain' />
                                </div>
                                <h3
                                    id='note-editor-heading'
                                    className='min-w-0 truncate text-base font-semibold text-white sm:text-lg'
                                    title={title.trim() || 'Untitled Note'}
                                >
                                    {title.trim() || 'Untitled Note'}
                                </h3>
                            </div>
                            <div className='flex shrink-0 items-center gap-1 sm:gap-2'>
                                <button
                                    type='button'
                                    onClick={() => setIsFullscreen((current) => !current)}
                                    className='rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white'
                                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                    title={isFullscreen ? 'Restore window size' : 'Fullscreen'}
                                >
                                    {isFullscreen ? <Minimize2 className='h-5 w-5' /> : <Maximize2 className='h-5 w-5' />}
                                </button>
                                <button
                                    type='button'
                                    onClick={closeNoteModal}
                                    className='rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white'
                                    aria-label='Close editor'
                                >
                                    <X className='h-5 w-5' />
                                </button>
                            </div>
                        </div>
                        <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6'>
                            {editorNotice && (
                                <div role='status' className='rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800'>
                                    {editorNotice}
                                </div>
                            )}
                            <div className='shrink-0'>
                                <label htmlFor='note-title-input' className='sr-only'>
                                    Title
                                </label>
                                <input
                                    id='note-title-input'
                                    type='text'
                                    value={title}
                                    maxLength={100}
                                    onChange={(event) => {
                                        setTitle(event.target.value);
                                        setErrors((prev) => ({ ...prev, title: undefined }));
                                    }}
                                    placeholder='Enter note title'
                                    className={`w-full rounded-lg border px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.title ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                />
                                {errors.title && <p className='mt-1 text-sm text-red-500'>{errors.title}</p>}
                            </div>
                            <div className='flex min-h-0 flex-1 flex-col'>
                                <label htmlFor='note-content-input' className='sr-only'>
                                    Content
                                </label>
                                <textarea
                                    id='note-content-input'
                                    value={content}
                                    maxLength={1000}
                                    onChange={(event) => {
                                        setContent(event.target.value);
                                        setErrors((prev) => ({ ...prev, content: undefined }));
                                    }}
                                    placeholder='Enter note content'
                                    rows={isFullscreen ? 16 : 7}
                                    className={`w-full resize-y rounded-lg border px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isFullscreen ? 'min-h-[50dvh] flex-1' : 'min-h-[192px]'
                                    } ${errors.content ? 'border-red-500' : 'border-slate-200'}`}
                                />
                                {errors.content && <p className='mt-1 text-sm text-red-500'>{errors.content}</p>}
                            </div>
                        </div>
                        <div className='flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 px-4 py-4 sm:px-6'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={openEmailModal}
                                disabled={isCreating || isSendingEmail}
                                className='cursor-pointer rounded-lg border-blue-200 px-4 py-2 text-blue-700 hover:bg-blue-50'
                            >
                                <Mail className='mr-2 h-4 w-4' />
                                Send Email
                            </Button>
                            <Button
                                type='button'
                                onClick={handleCreateNote}
                                disabled={isCreating || isSendingEmail}
                                className='cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-60'
                            >
                                {isCreating ? 'Creating...' : 'Create Note'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Email dialog: send the email, then automatically create the note. */}
            {isModalOpen && isEmailModalOpen && (
                <div
                    className='fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4'
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isSendingEmail) setIsEmailModalOpen(false);
                    }}
                >
                    <div
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='send-note-email-heading'
                        className='w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'
                    >
                        <div className='flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4'>
                            <h3 id='send-note-email-heading' className='text-lg font-semibold text-white'>
                                Send Note by Email
                            </h3>
                            <button
                                type='button'
                                onClick={() => setIsEmailModalOpen(false)}
                                disabled={isSendingEmail}
                                aria-label='Close email dialog'
                                className='rounded-md p-1 text-white/90 hover:bg-white/10 disabled:opacity-50'
                            >
                                <X className='h-5 w-5' />
                            </button>
                        </div>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                // eslint-disable-next-line
                                void sendEmail();
                            }}
                            className='space-y-4 p-5'
                        >
                            <div className='rounded-lg border border-slate-100 bg-slate-50 px-3 py-2'>
                                <p className='text-xs text-slate-500'>Note</p>
                                <p className='truncate text-sm font-semibold text-slate-900'>{title.trim() || 'Untitled Note'}</p>
                            </div>
                            <div>
                                <label htmlFor='note-recipient-email' className='mb-1.5 block text-sm font-medium text-slate-700'>
                                    Recipient Email
                                </label>
                                <input
                                    id='note-recipient-email'
                                    type='email'
                                    autoFocus
                                    required
                                    autoComplete='email'
                                    disabled={isSendingEmail || emailSent}
                                    value={recipientEmail}
                                    onChange={(event) => {
                                        setRecipientEmail(event.target.value);
                                        setEmailError('');
                                    }}
                                    placeholder='recipient@example.com'
                                    className='w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                />
                            </div>
                            {emailError && (
                                <p role='alert' className='text-sm text-red-600'>
                                    {emailError}
                                </p>
                            )}
                            <div className='flex justify-end border-t border-slate-100 pt-4'>
                                <Button
                                    type='submit'
                                    disabled={isSendingEmail}
                                    className='cursor-pointer rounded-lg bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 disabled:opacity-60'
                                >
                                    {isSendingEmail ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Mail className='mr-2 h-4 w-4' />}
                                    {isSendingEmail ? (emailSent ? 'Creating Note...' : 'Sending Email...') : emailSent ? 'Retry Create Note' : 'Send Email'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
