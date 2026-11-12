// FAQ
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FAQItem {
    id: number;
    title: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
}

function FAQ() {
    const [openItems, setOpenItems] = useState<number[]>([]);
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFAQs = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/v1/faq', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) throw new Error('Failed to fetch FAQs');

                const data = await response.json();
                if (data.success && data.data?.faqs) {
                    setFaqs(data.data.faqs.filter((faq: FAQItem) => !faq.deleted));
                }
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFAQs();
    }, []);

    const toggleItem = (id: number) => {
        setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Hero Section */}
            <section className='relative pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-8 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-7xl text-center'>
                    <div className='inline-block'>
                        <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight text-white mb-4 sm:mb-5'>
                            <span className=' text-[#4333AF] '>Frequently</span>
                            <br />
                            <span className='text-white'>Asked Questions</span>
                        </h1>

                        {/* <div className='w-full h-1 sm:h-2 bg-[#4333AF] rounded-full mx-auto mb-4 mb:5'></div> */}
                    </div>

                    <p className='text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                        Find answers to the most common questions about our platform, products, and services.
                    </p>
                </div>
            </section>

            {/* FAQ Items */}
            <section className='relative pb-10 sm:pb-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-6xl'>
                    {isLoading ? (
                        <div className='flex justify-center items-center py-20'>
                            <div className='dot-spinner'>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                            </div>
                        </div>
                    ) : faqs.length === 0 ? (
                        <div className='text-center py-16 text-gray-400 text-lg font-medium'>No FAQs available at the moment.</div>
                    ) : (
                        <div className='space-y-6'>
                            {faqs.map((faq, index) => (
                                <div key={faq.id} className='group animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
                                    <Card className='bg-[#0C0F18] border-2 border-[#414A5D] hover:border-[#4333AF]/50 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl transform hover:scale-[1.02]'>
                                        <CardHeader className='p-6 sm:p-8 cursor-pointer' onClick={() => toggleItem(faq.id)}>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center space-x-4'>
                                                    <div className='w-14 h-14 sm:w-16 sm:h-16 bg-[#4333AF] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
                                                        <HelpCircle className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                                                    </div>
                                                    <CardTitle className='text-lg sm:text-xl font-bold text-white group-hover:text-[#4333AF] transition-colors duration-300'>
                                                        {faq.title}
                                                    </CardTitle>
                                                </div>
                                                <div className='w-10 h-10 bg-[#4333AF]/15 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300'>
                                                    {openItems.includes(faq.id) ? (
                                                        <ChevronUp className='w-5 h-5 sm:w-6 sm:h-6 text-[#4333AF]' />
                                                    ) : (
                                                        <ChevronDown className='w-5 h-5 sm:w-6 sm:h-6 text-[#4333AF]' />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {openItems.includes(faq.id) && (
                                            <CardContent className='px-6 sm:px-8 pb-6 sm:pb-8 pt-0'>
                                                <div className='ml-0 sm:ml-20'>
                                                    <div className='bg-black rounded-2xl p-5 sm:p-6 border border-[#414A5D] group-hover:border-[#4333AF]/50 transition-all duration-300'>
                                                        <p className='text-sm sm:text-base text-gray-300 leading-relaxed'>{faq.text}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}

                                        {/* Subtle hover glow */}
                                        <div className='absolute inset-0 bg-[#4333AF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl blur-3xl'></div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Optional CTA */}
            <section className='relative px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-4xl text-center mb-4'>
                    <p className='text-lg sm:text-xl text-gray-300 mb-4 sm:mb-5'>Still have questions?</p>
                    <button
                        onClick={() => (window.location.href = '/support')}
                        className='inline-flex items-center bg-[#4333AF] hover:bg-[#38299B] text-white font-bold py-4 px-10 rounded-lg shadow-2xl shadow-[#4333AF]/40 transition-all duration-300 transform hover:scale-105'
                    >
                        Contact Support
                    </button>
                </div>
            </section>
        </div>
    );
}

export { FAQ };
