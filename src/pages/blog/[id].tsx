import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import lottie from 'lottie-web';
import { ArrowLeft, ArrowRight, Calendar, Clock, Eye, Mail, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

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

    const LottieAnimation = ({ src, loop = true, autoplay = true, style }) => {
        const containerRef = useRef<HTMLDivElement>(null);
        useEffect(() => {
            if (containerRef.current) {
                const animation = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop,
                    autoplay,
                    path: src,
                });
                return () => animation.destroy();
            }
        }, [src, loop, autoplay]);

        return <div ref={containerRef} style={style} />;
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
                <Button
                    asChild
                    className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold transition-all duration-300'
                >
                    <Link href='/blogdirectory'>Back to Blog</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Header */}
            <div className='relative z-10 pt-24 pb-12 px-6'>
                <div className='container mx-auto max-w-4xl'>
                    <Button
                        asChild
                        className='mb-6 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold transition-all duration-300'
                    >
                        <Link href='/blogdirectory'>
                            <ArrowLeft className='w-4 h-4 mr-2' />
                            Back to Blog
                        </Link>
                    </Button>

                    <Card className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 hover:border-[#4cc7e8]/40 transition-all duration-500 rounded-3xl overflow-hidden shadow-xl shadow-[#2c7bbe]/10'>
                        {/* Top Border */}
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>

                        {/* Blog Image */}
                        {blogPost.headerImage && (
                            <div className='relative overflow-hidden'>
                                <Image src={blogPost.headerImage} alt={blogPost.title} width={1200} height={400} className='w-full h-64 md:h-96 object-cover' />
                                <div className='absolute inset-0 bg-gradient-to-t from-[#050608]/60 via-transparent to-transparent'></div>

                                {/* Category Badge */}
                                <div className='absolute top-4 left-4'>
                                    <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white border-0 font-bold'>
                                        {blogPost.category}
                                    </Badge>
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

                        <CardContent className='p-6 prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-[#4cc7e8] max-w-none'>
                            <p className='text-gray-300'>{blogPost.postContent}</p>
                        </CardContent>

                        {/* Floating Elements */}
                        <div className='absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse'></div>
                    </Card>
                </div>
            </div>
            {/* Final CTA */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        <div>
                            <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                START YOUR CAMPAIGN TODAY
                            </Badge>
                            <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Transform</span>
                                <br />
                                Your Marketing?
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-5'>
                                Join thousands of successful businesses who have chosen our email marketing platform to drive engagement, increase conversions,
                                and grow their revenue.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4'>
                                <Link href={'/login'}>
                                    <Button
                                        size='lg'
                                        className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px]'
                                    >
                                        <Mail className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Join Now
                                        <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </Link>
                                <Link href={'/pricing'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] bg-transparent'
                                    >
                                        <Settings className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className='flex justify-center'>
                            <div className='relative'>
                                <div className='absolute inset-0 w-96 h-96 bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-full blur-2xl'></div>
                                <div className='relative w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center shadow-2xl backdrop-blur-xl p-8'>
                                    <LottieAnimation src='/animations/emailmarketingicon.json' loop={true} autoplay={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
