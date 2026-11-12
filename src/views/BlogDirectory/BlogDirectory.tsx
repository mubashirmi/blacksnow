'use client';

// import { AuthModalTrigger } from '@/components/AuthModal';
import ShareBanner from '@/components/ShareBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import lottie from 'lottie-web';
import { Calendar, Clock, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function BlogDirectory() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('/api/v1/blog');
                const result = await response.json();
                if (result.success && result.data) {
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

    console.log(error);

    // const LottieAnimation = ({ src, loop = true, autoplay = true, style }) => {
    //     const containerRef = useRef<HTMLDivElement>(null);
    //     useEffect(() => {
    //         if (containerRef.current) {
    //             const animation = lottie.loadAnimation({
    //                 container: containerRef.current,
    //                 renderer: 'svg',
    //                 loop,
    //                 autoplay,
    //                 path: src,
    //             });
    //             return () => animation.destroy();
    //         }
    //     }, [src, loop, autoplay]);

    //     return <div ref={containerRef} style={style} />;
    // };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const estimateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const text = content.replace(/<[^>]+>/g, '');
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    };

    const formatViews = (views: number) => {
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

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            <ShareBanner />
            {/* Hero Section */}
            <section className='relative pt-24 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl text-center'>
                    {/* underline = exact heading width */}
                    <div className='inline-block'>
                        <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-white mb-4 sm:mb-5'>
                            <span className=' text-[#4333AF] '>Blog&nbsp;</span>
                            <span className='text-white'>Directory</span>
                        </h1>
                        {/* <div className='w-full h-1 sm:h-2 bg-[#4333AF] rounded-full'></div> */}
                    </div>
                </div>
            </section>

            {/* Blog Cards Grid */}
            <section className='relative pt-9 pb-10 sm:pb-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl'>
                    {blogs.length === 0 ? (
                        <div className='text-center py-24'>
                            <h2 className='text-3xl font-bold text-white mb-4'>No Blogs Available</h2>
                            <p className='text-gray-400 text-lg'>Check back soon for new insights and strategies.</p>
                        </div>
                    ) : (
                        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
                            {blogs.map((blog: any, index) => (
                                <div key={blog.id} className='group animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
                                    <Card className='bg-[#0C0F18] border-2 border-[#414A5D] hover:border-[#4333AF]/50 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl transform hover:scale-[1.03] hover:-translate-y-1'>
                                        {/* Blog Image */}
                                        <div className='relative h-48 overflow-hidden'>
                                            <Image
                                                src={blog.headerImage || '/placeholder-blog.jpg'}
                                                alt={blog.title}
                                                width={600}
                                                height={400}
                                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                                            />
                                            <div className='absolute inset-0 bg-gradient-to-t from-[#050608]/80 via-[#050608]/20 to-transparent'></div>

                                            {/* Category Badge */}
                                            <div className='absolute top-4 left-4'>
                                                <Badge className='uppercase bg-[#4333AF] text-white font-bold text-xs px-3 py-1 rounded-full'>
                                                    {blog.category || 'INSIGHTS'}
                                                </Badge>
                                            </div>

                                            {/* Views */}
                                            <div className='absolute top-4 right-4 bg-[#050608]/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1.5'>
                                                <Eye className='w-3.5 h-3.5 text-gray-300' />
                                                <span className='text-gray-300 text-xs font-semibold'>{formatViews(blog.views || 0)}</span>
                                            </div>
                                        </div>

                                        <CardHeader className='p-6 sm:p-7'>
                                            <CardTitle className='text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#4333AF] transition-colors duration-300'>
                                                {blog.title}
                                            </CardTitle>
                                            <CardDescription className='text-sm sm:text-base text-gray-400 line-clamp-3 leading-relaxed'>
                                                {blog.postContent?.replace(/<[^>]+>/g, '').substring(0, 140)}...
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className='p-6 sm:p-7 pt-0 space-y-5'>
                                            {/* Meta Info */}
                                            <div className='flex items-center justify-between text-xs sm:text-sm text-gray-400'>
                                                <div className='flex items-center space-x-3'>
                                                    <div className='flex items-center space-x-1'>
                                                        <Calendar className='w-4 h-4' />
                                                        <span>{formatDate(blog.createdAt)}</span>
                                                    </div>
                                                    <div className='flex items-center space-x-1'>
                                                        <Clock className='w-4 h-4' />
                                                        <span>{estimateReadTime(blog.postContent || '')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <Button
                                                asChild
                                                className='w-full bg-[#4333AF] hover:bg-[#38299B] text-white font-bold py-5 sm:py-6 text-base transition-all duration-300 transform hover:scale-105 rounded-2xl'
                                            >
                                                <Link href={`/blog/${blog.id}`} className='flex items-center justify-center'>
                                                    Read Full Article
                                                </Link>
                                            </Button>
                                        </CardContent>

                                        {/* Hover Glow */}
                                        <div className='absolute inset-0 bg-[#4333AF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-3xl'></div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export { BlogDirectory };
