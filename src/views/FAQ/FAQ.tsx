'use client';

import { Badge } from '@/components/ui/badge';
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
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch FAQs');
                }

                const data = await response.json();
                if (data.success && data.data && data.data.faqs) {
                    setFaqs(data.data.faqs.filter((faq: FAQItem) => !faq.deleted));
                } else {
                    throw new Error('Invalid response format');
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
            {/* Header */}
            <div className='relative z-10 pb-12 sm:pb-16 pt-16 sm:pt-20 md:pt-24 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-4xl text-center'>
                    <Badge className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white mb-6 px-8 py-3 text-sm font-bold'> SUPPORT CENTER </Badge>
                    <h1 className='text-5xl lg:text-6xl font-black text-white mb-6 animate-slide-in-up delay-200'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Frequently</span>
                        <br />
                        <span className='text-white'>Asked Questions</span>
                    </h1>
                </div>
            </div>

            {/* FAQ Items */}
            <div className='relative z-10 px-6 pb-32'>
                <div className='container mx-auto max-w-4xl'>
                    {isLoading ? (
                        <div className='w-full flex justify-center items-center'>
                            <div className='dot-spinner'>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                            </div>
                        </div>
                    ) : faqs.length === 0 ? (
                        <div className='text-center py-12 text-gray-300 text-lg'>No FAQs available.</div>
                    ) : (
                        <div className='space-y-6'>
                            {faqs.map((faq, index) => (
                                <div key={faq.id} className='group relative animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
                                    {/* Glowing Background Effect */}
                                    <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60'></div>

                                    <Card className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 hover:border-[#4cc7e8]/40 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl shadow-[#2c7bbe]/10'>
                                        {/* Top Border */}
                                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>

                                        <CardHeader className='p-8 cursor-pointer' onClick={() => toggleItem(faq.id)}>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center space-x-4'>
                                                    <div className='w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-lg'>
                                                        <HelpCircle className='w-6 h-6 text-white' />
                                                    </div>
                                                    <CardTitle className='text-xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                        {faq.title}
                                                    </CardTitle>
                                                </div>
                                                <div className='w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-lg flex items-center justify-center'>
                                                    {openItems.includes(faq.id) ? (
                                                        <ChevronUp className='w-5 h-5 text-[#4cc7e8]' />
                                                    ) : (
                                                        <ChevronDown className='w-5 h-5 text-[#4cc7e8]' />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {openItems.includes(faq.id) && (
                                            <CardContent className='px-8 pb-8'>
                                                <div className='ml-16'>
                                                    <div className='bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl p-6 border border-[#4cc7e8]/20'>
                                                        <p className='text-gray-300 leading-relaxed text-lg'>{faq.text}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}

                                        {/* Floating Elements */}
                                        <div className='absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse'></div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export { FAQ };
