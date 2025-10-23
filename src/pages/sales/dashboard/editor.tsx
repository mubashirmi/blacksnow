'use client';

import { Bold, Code, Eye, ImageIcon, Italic, Link, List, Save, Type } from 'lucide-react';
import { useState } from 'react';

export default function ContentEditor() {
    const [title, setTitle] = useState('Sample Campaign Content');
    const [content, setContent] = useState('This is a sample content for the affiliate campaign editor.');
    const [previewMode, setPreviewMode] = useState(false);

    const handleSave = () => {
        // Handle save logic
        console.log('Saving content:', { title, content });
    };

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-3xl font-bold text-gray-900'>Content Editor</h2>
                    <p className='text-gray-600 mt-1'>Create and edit your affiliate campaign content</p>
                </div>
                <div className='flex items-center gap-3'>
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            previewMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Eye className='w-4 h-4' />
                        {previewMode ? 'Edit' : 'Preview'}
                    </button>
                    <button
                        onClick={handleSave}
                        className='flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors'
                    >
                        <Save className='w-4 h-4' />
                        Save
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Editor Panel */}
                <div className='lg:col-span-2 space-y-6'>
                    {/* Title Input */}
                    <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Campaign Title</label>
                        <input
                            type='text'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                            placeholder='Enter campaign title...'
                        />
                    </div>

                    {/* Toolbar */}
                    {!previewMode && (
                        <div className='bg-white rounded-lg border border-gray-200 p-4 shadow-sm'>
                            <div className='flex items-center gap-2 flex-wrap'>
                                <button className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'>
                                    <Bold className='w-4 h-4' />
                                </button>
                                <button className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'>
                                    <Italic className='w-4 h-4' />
                                </button>
                                <div className='w-px h-6 bg-gray-300 mx-2'></div>
                                <button className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'>
                                    <List className='w-4 h-4' />
                                </button>
                                <button className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'>
                                    <Link className='w-4 h-4' />
                                </button>
                                <button className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'>
                                    <ImageIcon className='w-4 h-4' />
                                </button>
                                <div className='w-px h-6 bg-gray-300 mx-2'></div>
                                <button className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'>
                                    <Code className='w-4 h-4' />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content Editor */}
                    <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
                        <div className='p-4 border-b border-gray-200'>
                            <div className='flex items-center gap-2'>
                                <Type className='w-4 h-4 text-gray-500' />
                                <span className='text-sm font-medium text-gray-700'>Content Body</span>
                            </div>
                        </div>
                        <div className='p-6'>
                            {previewMode ? (
                                <div className='prose max-w-none'>
                                    <h1 className='text-2xl font-bold text-gray-900 mb-4'>{title}</h1>
                                    <div className='text-gray-700 leading-relaxed whitespace-pre-wrap'>{content}</div>
                                </div>
                            ) : (
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className='w-full h-96 px-0 py-0 border-0 resize-none focus:outline-none focus:ring-0 text-gray-700 leading-relaxed'
                                    placeholder='Start writing your campaign content...'
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className='space-y-6'>
                    {/* Campaign Settings */}
                    <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Campaign Settings</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Campaign Type</label>
                                <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'>
                                    <option>Email Campaign</option>
                                    <option>Social Media</option>
                                    <option>Blog Post</option>
                                    <option>Newsletter</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Target Audience</label>
                                <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'>
                                    <option>All Subscribers</option>
                                    <option>Premium Users</option>
                                    <option>New Users</option>
                                    <option>Active Traders</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Schedule</label>
                                <input
                                    type='datetime-local'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Stats */}
                    <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Content Stats</h3>
                        <div className='space-y-3'>
                            <div className='flex justify-between'>
                                <span className='text-sm text-gray-600'>Word Count</span>
                                <span className='text-sm font-medium text-gray-900'>{content.split(' ').filter((word) => word.length > 0).length}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-sm text-gray-600'>Character Count</span>
                                <span className='text-sm font-medium text-gray-900'>{content.length}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-sm text-gray-600'>Reading Time</span>
                                <span className='text-sm font-medium text-gray-900'>
                                    {Math.ceil(content.split(' ').filter((word) => word.length > 0).length / 200)} min
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Templates */}
                    <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Recent Templates</h3>
                        <div className='space-y-2'>
                            <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
                                Summer Sale Template
                            </button>
                            <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
                                Product Launch Template
                            </button>
                            <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
                                Newsletter Template
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
