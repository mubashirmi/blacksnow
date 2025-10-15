import { useEffect, useState } from 'react';

type BlogPost = {
    id: number;
    title: string;
    category: string;
    createdAt: string;
    slug: string;
    postContent: string;
    headerImage: string;
    views: number;
};

type BlogProps = {
    blogs: BlogPost[];
};

const Blog = ({ blogs }: BlogProps) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentBlog, setCurrentBlog] = useState<BlogPost | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [newBlog, setNewBlog] = useState<BlogPost>({
        id: 0,
        title: '',
        category: '',
        createdAt: '',
        slug: '',
        postContent: '',
        headerImage: '',
        views: 0,
    });

    useEffect(() => {
        if (currentBlog) {
            setNewBlog(currentBlog);
        }
    }, [currentBlog]);

    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'createdAt', label: 'Date' },
        { key: 'views', label: 'Views' },
        { key: 'actions', label: 'Actions' },
    ];

    const handleSort = (columnKey: keyof BlogPost) => {
        // const sortedData = [...blogs].sort((a, b) => {
        //     const valA = a[columnKey];
        //     const valB = b[columnKey];

        //     if (typeof valA === 'string' && typeof valB === 'string') {
        //         return valA.localeCompare(valB);
        //     }

        //     if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        //     if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        //     return 0;
        // });
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    const handleEditBlog = (blog: BlogPost) => {
        setCurrentBlog(blog);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setNewBlog((prevBlog) => ({
            ...prevBlog,
            [name]: value,
        }));
    };

    const handleSaveBlog = async (e: any) => {
        e.preventDefault();
        if (currentBlog) {
            await updateBlog(currentBlog.id, newBlog);
        } else {
            await createBlog(newBlog);
        }
        setIsModalOpen(false);
        setCurrentBlog(null);
    };

    const createBlog = async (blog: BlogPost) => {
        const response = await fetch('/api/v1/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blog),
        });
        const data = await response.json();
        console.log(data);
    };

    const updateBlog = async (id: number, blog: BlogPost) => {
        const response = await fetch(`/api/v1/blog?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blog),
        });
        const data = await response.json();
        console.log(data);
    };

    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className='max-w-6xl mx-auto'>
                <h1 className='text-4xl font-extrabold text-center mb-10 text-gray-900 tracking-tight'>Blog Dashboard</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className='mb-8 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50'
                >
                    Create New Blog
                </button>

                {/* Table */}
                <div className='overflow-x-auto bg-white rounded-xl shadow-lg'>
                    <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-indigo-50'>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} className='py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
                                        <button
                                            onClick={() => handleSort(col.key as keyof BlogPost)}
                                            className='hover:text-indigo-600 transition-colors duration-200 flex items-center'
                                        >
                                            {col.label}
                                            <span className='ml-2'>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                            {blogs.length > 0 ? (
                                blogs.map((blog, index) => (
                                    <tr
                                        key={blog.id}
                                        className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50`}
                                    >
                                        <td className='py-4 px-6 text-gray-800'>{blog.title}</td>
                                        <td className='py-4 px-6 text-gray-600'>{blog.category}</td>
                                        <td className='py-4 px-6 text-gray-600'>{new Date(blog.createdAt).toLocaleDateString()}</td>
                                        <td className='py-4 px-6 text-gray-600'>{blog.views}</td>
                                        <td className='py-4 px-6'>
                                            <button
                                                onClick={() => handleEditBlog(blog)}
                                                className='bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50'
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className='py-4 px-6 text-center text-gray-500'>
                                        No blogs available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal for creating/editing blog */}
                {isModalOpen && (
                    <div className='fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50'>
                        <div className='bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100'>
                            <h3 className='text-2xl font-bold mb-6 text-gray-900'>{currentBlog ? 'Edit Blog' : 'Create Blog'}</h3>
                            <form onSubmit={handleSaveBlog}>
                                <div className='mb-5'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Title</label>
                                    <input
                                        type='text'
                                        name='title'
                                        value={newBlog.title}
                                        onChange={handleInputChange}
                                        required
                                        className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200'
                                        placeholder='Enter blog title'
                                    />
                                </div>
                                <div className='mb-5'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Category</label>
                                    <input
                                        type='text'
                                        name='category'
                                        value={newBlog.category}
                                        onChange={handleInputChange}
                                        required
                                        className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200'
                                        placeholder='Enter category'
                                    />
                                </div>
                                <div className='mb-5'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Content</label>
                                    <textarea
                                        name='postContent'
                                        value={newBlog.postContent}
                                        onChange={handleInputChange}
                                        required
                                        className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200'
                                        rows={6}
                                        placeholder='Write your blog content here'
                                    ></textarea>
                                </div>
                                <div className='mb-5'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Header Image URL</label>
                                    <input
                                        type='url'
                                        name='headerImage'
                                        value={newBlog.headerImage}
                                        onChange={handleInputChange}
                                        className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200'
                                        placeholder='Enter image URL'
                                    />
                                </div>
                                <div className='flex justify-end space-x-4'>
                                    <button
                                        type='submit'
                                        className='bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50'
                                    >
                                        {currentBlog ? 'Save Changes' : 'Create Post'}
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setCurrentBlog(null);
                                        }}
                                        className='bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export { Blog };
