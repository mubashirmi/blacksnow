'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, Edit, Eye, Grid, Image as ImageIcon, Plus, RefreshCw, Table, Tag, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type Blog = {
    id: number;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
    title: string;
    slug: string;
    postContent: string;
    category: string;
    views: number;
    headerImage?: string;
    featured: boolean;
};

type EditForm = {
    title: string;
    postContent: string;
    category: string;
    featured: boolean;
    headerImage: string;
};

type AlertType = {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    id: string;
};

export default function BlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const [editForm, setEditForm] = useState<EditForm>({
        title: '',
        postContent: '',
        category: '',
        featured: false,
        headerImage: '',
    });
    const [alerts, setAlerts] = useState<AlertType[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const addAlert = (type: AlertType['type'], message: string) => {
        const id = Date.now().toString();
        setAlerts((prev) => [...prev, { type, message, id }]);
        setTimeout(() => {
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        }, 5000);
    };

    const fetchBlogs = useCallback(
        async (showRefresh = false) => {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(null);
            try {
                const res = await fetch('/api/v1/blog', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                    },
                    cache: 'no-store',
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch blogs (${res.status})`);
                }

                const json = await res.json();
                const data = json?.data;

                if (!Array.isArray(data)) {
                    throw new Error('Unexpected response format');
                }

                const activeBlogs = data.filter((blog: Blog) => !blog.deleted);
                setBlogs(activeBlogs);

                if (showRefresh) {
                    addAlert('success', `Refreshed! Found ${activeBlogs.length} blog posts`);
                }
            } catch (e: any) {
                const errorMessage = e?.message || 'Failed to load blogs.';
                setError(errorMessage);
                addAlert('error', errorMessage);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [addAlert]
    );

    useEffect(() => {
        fetchBlogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/v1/blog?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('Failed to delete blog');

            setBlogs((prev) => prev.filter((blog) => blog.id !== id));
            addAlert('success', 'Blog post deleted successfully!');
        } catch (e: any) {
            addAlert('error', e?.message || 'Failed to delete blog post.');
            fetchBlogs(true);
        } finally {
            setDeletingId(null);
        }
    };

    const startEdit = (blog: Blog) => {
        setEditingBlog(blog);
        setEditForm({
            title: blog.title,
            postContent: blog.postContent,
            category: blog.category,
            featured: blog.featured,
            headerImage: blog.headerImage || '',
        });
    };

    const cancelEdit = () => {
        setEditingBlog(null);
        setEditForm({
            title: '',
            postContent: '',
            category: '',
            featured: false,
            headerImage: '',
        });
    };

    const handleUpdate = async () => {
        if (!editingBlog) return;

        if (!editForm.title.trim() || !editForm.postContent.trim()) {
            addAlert('error', 'Title and content are required');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/v1/blog?id=${editingBlog.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editForm.title.trim(),
                    postContent: editForm.postContent.trim(),
                    category: editForm.category.trim(),
                    featured: editForm.featured,
                    headerImage: editForm.headerImage.trim() || undefined,
                }),
            });

            if (!res.ok) throw new Error('Failed to update blog');

            addAlert('success', 'Blog post updated successfully!');
            cancelEdit();
            fetchBlogs(true);
        } catch (e: any) {
            addAlert('error', e?.message || 'Failed to update blog post.');
        } finally {
            setSaving(false);
        }
    };

    const truncateText = (text: string, maxLength: number) => (text.length <= maxLength ? text : text.substring(0, maxLength) + '...');
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    // Loading skeletons
    const GridSkeleton = () => (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className='overflow-hidden animate-pulse'>
                    <div className='h-48 bg-slate-200' />
                    <div className='p-5 space-y-3'>
                        <div className='h-4 bg-slate-200 rounded w-1/3' />
                        <div className='h-6 bg-slate-200 rounded' />
                        <div className='space-y-2'>
                            <div className='h-3 bg-slate-200 rounded' />
                            <div className='h-3 bg-slate-200 rounded w-2/3' />
                        </div>
                        <div className='flex justify-between pt-2'>
                            <div className='h-8 bg-slate-200 rounded w-1/3' />
                            <div className='h-8 bg-slate-200 rounded w-1/3' />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );

    const TableSkeleton = () => (
        <div className='space-y-3'>
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className='flex items-center space-x-4 p-4 bg-white rounded-lg border animate-pulse'>
                    <div className='flex-1 space-y-2'>
                        <div className='h-4 bg-slate-200 rounded w-3/4' />
                        <div className='h-3 bg-slate-200 rounded w-1/4' />
                    </div>
                    <div className='h-8 bg-slate-200 rounded w-24' />
                    <div className='h-8 bg-slate-200 rounded w-24' />
                </div>
            ))}
        </div>
    );

    return (
        <div className='min-h-screen bg-slate-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Alerts */}
                <div className='fixed top-4 right-4 z-50 space-y-2 max-w-md'>
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-lg shadow-lg border-l-4 ${
                                alert.type === 'success'
                                    ? 'bg-green-50 border-green-400 text-green-800'
                                    : alert.type === 'error'
                                    ? 'bg-red-50 border-red-400 text-red-800'
                                    : alert.type === 'warning'
                                    ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                                    : 'bg-blue-50 border-blue-400 text-blue-800'
                            }`}
                        >
                            <div className='flex items-start'>
                                <AlertCircle
                                    className={`w-5 h-5 mr-2 mt-0.5 ${
                                        alert.type === 'success'
                                            ? 'text-green-400'
                                            : alert.type === 'error'
                                            ? 'text-red-400'
                                            : alert.type === 'warning'
                                            ? 'text-yellow-400'
                                            : 'text-blue-400'
                                    }`}
                                />
                                <p className='text-sm font-medium flex-1'>{alert.message}</p>
                                <button
                                    onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                                    className='ml-4 text-slate-400 hover:text-slate-600'
                                >
                                    <X className='w-4 h-4' />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Main Card with shared header --- */}
                <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                    {/* Gradient header */}
                    <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                            <div>
                                <h1 className='text-2xl font-bold text-white'>Blog Management</h1>
                                <p className='text-white/70 text-sm'>Create, edit, and manage your blog posts</p>
                            </div>
                            <div className='flex items-center gap-3'>
                                {/* kept as-is (hidden with opacity-0 in your original) */}
                                <Button onClick={() => fetchBlogs(true)} disabled={refreshing} variant='outline' className='opacity-0'>
                                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </Button>
                                <Link href='/admin/postblog'>
                                    <Button className='bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-6'>
                                        <Plus className='w-4 h-4 mr-2' />
                                        New Post
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className='p-6'>
                        {/* Stats & Controls */}
                        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                            <div className='flex items-center space-x-4 mb-4 sm:mb-0'>
                                <div className='bg-white rounded-lg px-4 py-2 shadow-sm border'>
                                    <p className='text-sm text-slate-600'>Total Posts</p>
                                    <p className='text-2xl font-bold text-slate-900'>{blogs.length}</p>
                                </div>
                                <div className='bg-white rounded-lg px-4 py-2 shadow-sm border'>
                                    <p className='text-sm text-slate-600'>Featured</p>
                                    <p className='text-2xl font-bold text-slate-900'>{blogs.filter((b) => b.featured).length}</p>
                                </div>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size='sm'
                                    onClick={() => setViewMode('grid')}
                                    className='cursor-pointer'
                                >
                                    <Grid className='w-4 h-4 mr-2' />
                                    Grid
                                </Button>
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'outline'}
                                    size='sm'
                                    onClick={() => setViewMode('table')}
                                    className='cursor-pointer'
                                >
                                    <Table className='w-4 h-4 mr-2' />
                                    Table
                                </Button>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && !refreshing && (viewMode === 'grid' ? <GridSkeleton /> : <TableSkeleton />)}

                        {/* Error */}
                        {!loading && error && (
                            <div className='text-center py-12'>
                                <AlertCircle className='w-12 h-12 text-red-400 mx-auto mb-4' />
                                <h3 className='text-lg font-semibold text-slate-900 mb-2'>Unable to load blogs</h3>
                                <p className='text-slate-600 mb-6 max-w-md mx-auto'>{error}</p>
                                <Button onClick={() => fetchBlogs()} className='cursor-pointer'>
                                    <RefreshCw className='w-4 h-4 mr-2' />
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {/* Empty */}
                        {!loading && !error && blogs.length === 0 && (
                            <div className='text-center py-16'>
                                <div className='w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                                    <ImageIcon className='w-10 h-10 text-slate-400' />
                                </div>
                                <h3 className='text-xl font-semibold text-slate-900 mb-2'>No blog posts yet</h3>
                                <p className='text-slate-600 mb-6 max-w-md mx-auto'>
                                    Get started by creating your first blog post to share with your audience.
                                </p>
                                <Link href='/admin/postblog'>
                                    <Button size='lg' className='cursor-pointer'>
                                        <Plus className='w-5 h-5 mr-2' />
                                        Create First Post
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Grid View */}
                        {!loading && !error && blogs.length > 0 && viewMode === 'grid' && (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {blogs.map((blog) => (
                                    <Card key={blog.id} className='overflow-hidden hover:shadow-lg transition-all duration-200 border-slate-200 group'>
                                        {/* Image */}
                                        <div className='h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden'>
                                            {blog.headerImage ? (
                                                <Image
                                                    width={100}
                                                    height={100}
                                                    src={blog.headerImage}
                                                    alt={blog.title}
                                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                                                />
                                            ) : (
                                                <div className='w-full h-full flex items-center justify-center text-slate-400'>
                                                    <ImageIcon className='w-12 h-12' />
                                                </div>
                                            )}
                                            {blog.featured && (
                                                <div className='absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm'>
                                                    Featured
                                                </div>
                                            )}
                                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200' />
                                        </div>

                                        {/* Content */}
                                        <div className='p-5'>
                                            <div className='flex items-center justify-between mb-3'>
                                                <div className='flex items-center gap-2'>
                                                    <Tag className='w-4 h-4 text-blue-600' />
                                                    <span className='text-sm text-blue-600 font-medium'>{blog.category || 'Uncategorized'}</span>
                                                </div>
                                                <span className='text-xs text-slate-500'>{formatDate(blog.createdAt)}</span>
                                            </div>

                                            <Link href={`/blog/${blog.slug}`}>
                                                <h3 className='font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                                                    {blog.title}
                                                </h3>
                                            </Link>

                                            <p className='text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed'>
                                                {truncateText(blog.postContent.replace(/<[^>]*>/g, ''), 120)}
                                            </p>

                                            <div className='flex items-center justify-between pt-4 border-t border-slate-100'>
                                                <div className='flex items-center gap-1 text-xs text-slate-500'>
                                                    <Eye className='w-3 h-3' />
                                                    {blog.views} views
                                                </div>

                                                <div className='flex gap-2'>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        onClick={() => startEdit(blog)}
                                                        disabled={deletingId === blog.id}
                                                        className='cursor-pointer h-8 px-3'
                                                    >
                                                        <Edit className='w-3 h-3' />
                                                    </Button>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        onClick={() => handleDelete(blog.id)}
                                                        disabled={deletingId === blog.id}
                                                        className='cursor-pointer h-8 px-3 text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300'
                                                    >
                                                        {deletingId === blog.id ? (
                                                            <RefreshCw className='w-3 h-3 animate-spin' />
                                                        ) : (
                                                            <Trash2 className='w-3 h-3' />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Table View */}
                        {!loading && !error && blogs.length > 0 && viewMode === 'table' && (
                            <div className='overflow-hidden border border-slate-200 rounded-lg'>
                                <table className='w-full'>
                                    <thead className='bg-slate-50 border-b border-slate-200'>
                                        <tr>
                                            <th className='text-left py-4 px-6 font-semibold text-slate-700'>Title</th>
                                            <th className='text-left py-4 px-6 font-semibold text-slate-700'>Category</th>
                                            <th className='text-left py-4 px-6 font-semibold text-slate-700'>Created</th>
                                            <th className='text-left py-4 px-6 font-semibold text-slate-700'>Views</th>
                                            <th className='text-left py-4 px-6 font-semibold text-slate-700'>Status</th>
                                            <th className='text-right py-4 px-6 font-semibold text-slate-700'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-200'>
                                        {blogs.map((blog) => (
                                            <tr key={blog.id} className='hover:bg-slate-50 transition-colors'>
                                                <td className='py-4 px-6'>
                                                    <div>
                                                        <Link
                                                            href={`/blog/${blog.slug}`}
                                                            className='font-medium text-slate-900 hover:text-blue-600 hover:underline'
                                                        >
                                                            {blog.title}
                                                        </Link>
                                                        <p className='text-sm text-slate-500 mt-1 line-clamp-2'>
                                                            {truncateText(blog.postContent.replace(/<[^>]*>/g, ''), 80)}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className='py-4 px-6'>
                                                    <span className='text-slate-700'>{blog.category || '—'}</span>
                                                </td>
                                                <td className='py-4 px-6 text-slate-600 text-sm'>{formatDate(blog.createdAt)}</td>
                                                <td className='py-4 px-6'>
                                                    <div className='flex items-center gap-1 text-slate-600'>
                                                        <Eye className='w-4 h-4' />
                                                        {blog.views}
                                                    </div>
                                                </td>
                                                <td className='py-4 px-6'>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            blog.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        {blog.featured ? 'Featured' : 'Standard'}
                                                    </span>
                                                </td>
                                                <td className='py-4 px-6'>
                                                    <div className='flex justify-end gap-2'>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => startEdit(blog)}
                                                            disabled={deletingId === blog.id}
                                                            className='cursor-pointer h-8 w-8 p-0'
                                                        >
                                                            <Edit className='w-4 h-4' />
                                                        </Button>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => handleDelete(blog.id)}
                                                            disabled={deletingId === blog.id}
                                                            className='cursor-pointer h-8 w-8 p-0 text-red-600 hover:bg-red-50'
                                                        >
                                                            {deletingId === blog.id ? (
                                                                <RefreshCw className='w-4 h-4 animate-spin' />
                                                            ) : (
                                                                <Trash2 className='w-4 h-4' />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingBlog && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
                    <Card className='w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 rounded-xl shadow-2xl'>
                        {/* Unified gradient header */}
                        <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between'>
                            <h3 className='text-xl font-bold text-white'>Edit Blog Post</h3>
                            <button
                                onClick={cancelEdit}
                                disabled={saving}
                                className='text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors'
                            >
                                <X className='w-5 h-5' />
                            </button>
                        </div>

                        <div className='flex-1 overflow-y-auto p-6 bg-white'>
                            <div className='space-y-6'>
                                <div>
                                    <label className='block text-sm font-medium text-slate-700 mb-2'>Title *</label>
                                    <Input
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        placeholder='Enter blog title...'
                                        disabled={saving}
                                    />
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-slate-700 mb-2'>Category</label>
                                        <Input
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            placeholder='e.g., Technology, Business'
                                            disabled={saving}
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-slate-700 mb-2'>Header Image URL</label>
                                        <Input
                                            value={editForm.headerImage}
                                            onChange={(e) => setEditForm({ ...editForm, headerImage: e.target.value })}
                                            placeholder='https://example.com/image.jpg'
                                            disabled={saving}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-slate-700 mb-2'>Content *</label>
                                    <Textarea
                                        value={editForm.postContent}
                                        onChange={(e) => setEditForm({ ...editForm, postContent: e.target.value })}
                                        placeholder='Write your blog content here...'
                                        rows={12}
                                        disabled={saving}
                                        className='resize-none'
                                    />
                                </div>

                                <div className='flex items-center gap-3 p-4 bg-slate-50 rounded-lg'>
                                    <input
                                        type='checkbox'
                                        id='featured'
                                        checked={editForm.featured}
                                        onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                                        disabled={saving}
                                        className='w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500'
                                    />
                                    <label htmlFor='featured' className='text-sm font-medium text-slate-700'>
                                        Mark as Featured Post
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className='border-t border-slate-200 p-6 bg-slate-50'>
                            <div className='flex gap-3 justify-end'>
                                <Button onClick={cancelEdit} variant='outline' disabled={saving} className='cursor-pointer'>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdate}
                                    disabled={saving || !editForm.title.trim() || !editForm.postContent.trim()}
                                    className='cursor-pointer bg-blue-500 hover:bg-blue-600 min-w-24 text-white'
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className='w-4 h-4 mr-2' />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
