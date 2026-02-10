'use client';

// import { AuthModalTrigger } from '@/components/AuthModal';
import ShareBanner from '@/components/ShareBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import lottie from 'lottie-web';
import { ArrowRight, Calendar, Clock, Eye } from 'lucide-react';
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
                    <div>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                            INSIGHTS & STRATEGIES
                        </Badge>
                    </div>

                    {/* underline = exact heading width */}
                    <div className='inline-block'>
                        <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Blog&nbsp;</span>
                            <span className='text-white'>Directory</span>
                        </h1>

                        <div className='w-full h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full'></div>
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
                                    <Card className='bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl transform hover:scale-[1.03] hover:-translate-y-1'>
                                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>

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
                                                <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white font-bold text-xs px-3 py-1 rounded-full'>
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
                                            <CardTitle className='text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#4cc7e8] transition-colors duration-300'>
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
                                                className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold py-5 sm:py-6 text-base transition-all duration-300 transform hover:scale-105 rounded-2xl shadow-lg shadow-[#2c7bbe]/40'
                                            >
                                                <Link href={`/blog/${blog.id}`} className='flex items-center justify-center'>
                                                    Read Full Article
                                                    <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
                                                </Link>
                                            </Button>
                                        </CardContent>

                                        {/* Hover Glow */}
                                        <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-3xl'></div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Final CTA */}
            {/* <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
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
                                <AuthModalTrigger
                                    buttonText='Get Start'
                                    defaultView='signup'
                                    sourceRoute='/blogdirectory'
                                    redirectAfterLogin='/blogdirectory'
                                    redirectAfterSignup='/pricing'
                                >
                                    <Button
                                        size='lg'
                                        className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px]'
                                    >
                                        <Mail className='w-5 h-5 sm:w-6 sm:h-6 mr-3' />
                                        Join Now
                                        <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                                    </Button>
                                </AuthModalTrigger>

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
            </section> */}
        </div>
    );
}

export { BlogDirectory };
