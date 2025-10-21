import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, Clock, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function BlogDirectory() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('/api/v1/blog');
                const result = await response.json();
                if (result.success) {
                    setBlogs(result.data);
                } else {
                    setError('Failed to fetch blog data');
                }
            } catch (err) {
                setError('An error occurred while fetching blogs');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // Helper function to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Helper function to estimate read time based on content length
    const estimateReadTime = (content) => {
        const wordsPerMinute = 200;
        const text = content.replace(/<[^>]+>/g, ''); // Strip HTML tags
        const wordCount = text.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    };

    // Helper function to format views
    const formatViews = (views) => {
        return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString();
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-[#050608] flex items-center justify-center'>
                <div className='dot-spinner scale-150'>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='min-h-screen bg-[#050608] flex items-center justify-center'>
                <p className='text-red-400 text-lg font-semibold'>{error}</p>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Header */}
            <div className='relative z-10 pt-24 pb-20 px-6'>
                <div className='container mx-auto max-w-7xl text-center'>
                    <h1 className='text-5xl lg:text-7xl font-black text-white mb-6 animate-slide-in-up delay-200'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Blog</span>
                        <br />
                        <span className='text-white'>Directory</span>
                    </h1>
                </div>
            </div>

            {/* Blog Cards Grid */}
            <div className='relative z-10 px-6 pb-32'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {blogs.map((blog, index) => (
                            <div key={blog.id} className='group relative animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
                                {/* Glowing Background Effect */}
                                <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60'></div>

                                <Card className='relative bg-gradient-to-br from-[#050608]/95睹0 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 hover:border-[#4cc7e8]/40 transition-all duration-500 rounded-3xl overflow-hidden transform hover:scale-105 hover:-translate-y-2 shadow-xl shadow-[#2c7bbe]/10 group'>
                                    {/* Top Border */}
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>

                                    {/* Blog Image */}
                                    <div className='relative overflow-hidden'>
                                        <Image
                                            src={blog.headerImage}
                                            alt={blog.title}
                                            width={400}
                                            height={300}
                                            className='w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500'
                                        />
                                        <div className='absolute inset-0 bg-gradient-to-t from-[#050608]/60 vulnerabilities via-transparent to-transparent'></div>

                                        {/* Category Badge */}
                                        <div className='absolute top-4 left-4'>
                                            <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white border-0 font-bold'>
                                                {blog.category}
                                            </Badge>
                                        </div>

                                        {/* Views Badge */}
                                        <div className='absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2'>
                                            <Eye className='w-3 h-3 text-white' />
                                            <span className='text-white text-xs font-semibold'>{formatViews(blog.views)}</span>
                                        </div>
                                    </div>

                                    <CardHeader className='p-6'>
                                        <CardTitle className='text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                            {blog.title}
                                        </CardTitle>
                                        <CardDescription className='text-gray-300 leading-relaxed line-clamp-3'>
                                            {blog.postContent.replace(/<[^>]+>/g, '')}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className='p-6 pt-0'>
                                        {/* Author and Date Info */}
                                        <div className='flex items-center justify-between mb-6 text-sm'>
                                            <div className='flex items-center space-x-4 text-gray-400'>
                                                <div className='flex items-center space-x-1'>
                                                    <Calendar className='w-3 h-3' />
                                                    <span className='text-xs'>{formatDate(blog.createdAt)}</span>
                                                </div>
                                                <div className='flex items-center space-x-1'>
                                                    <Clock className='w-3 h-3' />
                                                    <span className='text-xs'>{estimateReadTime(blog.postContent)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Read More Button */}
                                        <Button
                                            asChild
                                            className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold transition-all duration-300 group/btn'
                                        >
                                            <Link href={`/blog/${blog.id}`}>
                                                Read Full Article
                                                <ArrowRight className='w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300' />
                                            </Link>
                                        </Button>
                                    </CardContent>

                                    {/* Floating Elements */}
                                    <div className='absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse'></div>
                                </Card>
                            </div>
                        ))}
                        {blogs[0] ? <></> : <h1 className='text-center leading-11 text-white font-medium text-4xl'>Currently, there is no blog uploaded</h1>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export { BlogDirectory };
