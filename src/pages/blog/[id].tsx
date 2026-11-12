// Single blog
import ShareBanner from '@/components/ShareBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    postContent: string;
    category: string;
    views: number;
    headerImage: string;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
    featured: boolean;
}

export default function BlogPostPage() {
    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = router.query;

    // Helper function to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Helper function to estimate read time
    const estimateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const text = content.replace(/<[^>]+>/g, ''); // Strip HTML tags
        const wordCount = text.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    };

    // Helper function to format views
    const formatViews = (views: number) => {
        return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString();
    };

    useEffect(() => {
        const fetchBlogPost = async () => {
            setLoading(true);
            try {
                if (!id || typeof id !== 'string') {
                    setError('No blog post ID provided');
                    setLoading(false);
                    return;
                }
                const response = await fetch(`/api/v1/blog?id=${id}`);
                const data = await response.json();

                if (data.success && data.data) {
                    setBlogPost(data.data);
                } else {
                    setError(data.message || 'Blog post not found');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch blog post');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogPost();
    }, [id]);

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

    if (error || !blogPost) {
        return (
            <div className='min-h-screen bg-[#050608] flex items-center justify-center'>
                <div className='text-red-400 text-lg font-semibold p-6'>{error || 'Blog post not found'}</div>
                <Button asChild className='bg-[#4333AF] hover:bg-[#38299B] text-white font-bold transition-all duration-300'>
                    <Link href='/blogdirectory'>Back to Blog</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Header */}
            <ShareBanner />
            <div className='relative z-10 pt-24 pb-12 px-6'>
                <div className='container mx-auto max-w-4xl'>
                    <Button asChild className='mb-6 bg-[#4333AF] hover:bg-[#38299B] text-white font-bold transition-all duration-300'>
                        <Link href='/blogdirectory'>
                            <ArrowLeft className='w-4 h-4 mr-2' />
                            Back to Blog
                        </Link>
                    </Button>

                    <Card className='relative bg-[#0C0F18] backdrop-blur-2xl border-2 border-[#414A5D] hover:border-[#4333AF]/50 transition-all duration-500 rounded-3xl overflow-hidden shadow-xl shadow-[#4333AF]/10'>
                        {/* Top Border */}

                        {/* Blog Image */}
                        {blogPost.headerImage && (
                            <div className='relative overflow-hidden'>
                                <Image src={blogPost.headerImage} alt={blogPost.title} width={1200} height={400} className='w-full h-64 md:h-96 object-cover' />
                                <div className='absolute inset-0 bg-gradient-to-t from-[#050608]/60 via-transparent to-transparent'></div>

                                {/* Category Badge */}
                                <div className='absolute top-4 left-4'>
                                    <Badge className='uppercase bg-[#4333AF] text-white border-0 font-bold'>{blogPost.category}</Badge>
                                </div>

                                {/* Views Badge */}
                                <div className='absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2'>
                                    <Eye className='w-3 h-3 text-white' />
                                    <span className='text-white text-xs font-semibold'>{formatViews(blogPost.views)}</span>
                                </div>
                            </div>
                        )}

                        <CardHeader className='p-6'>
                            <CardTitle className='text-3xl md:text-4xl font-bold text-white mb-4'>{blogPost.title}</CardTitle>
                            <div className='flex items-center justify-between text-sm text-gray-400'>
                                <div className='flex items-center space-x-4'>
                                    <div className='flex items-center space-x-1'>
                                        <Calendar className='w-3 h-3' />
                                        <span className='text-xs'>{formatDate(blogPost.createdAt)}</span>
                                    </div>
                                    <div className='flex items-center space-x-1'>
                                        <Clock className='w-3 h-3' />
                                        <span className='text-xs'>{estimateReadTime(blogPost.postContent)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className='p-6 prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-[#4333AF] max-w-none'>
                            <p className='text-gray-300'>{blogPost.postContent}</p>
                        </CardContent>

                        {/* Floating Elements */}
                        <div className='absolute -top-2 -right-2 w-6 h-6 bg-[#4333AF] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse'></div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
