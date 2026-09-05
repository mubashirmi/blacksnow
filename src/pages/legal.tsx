'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ArrowRight, BookOpen, Lock, Scale, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define the list of legal sections with their API endpoints, keys, titles, and icons
const LEGAL_SECTIONS = [
    {
        id: 'gdpr',
        title: 'GDPR',
        icon: ShieldCheck,
        apiUrl: '/api/v2/gdpr',
        apiKey: 'gdpr.gdpr',
        description: 'Our commitment to data protection and your rights under GDPR.',
    },
    {
        id: 'affiliate-agreement',
        title: 'Affiliate Agreement',
        icon: BookOpen,
        apiUrl: '/api/v2/affiliate-agreement',
        apiKey: 'agreement.affiliateAgreement',
        description: 'Terms governing our affiliate partnership program.',
    },
    {
        id: 'terms',
        title: 'Terms & Conditions',
        icon: Scale,
        apiUrl: '/api/v2/terms',
        apiKey: 'terms.terms',
        description: 'The rules and guidelines for using our platform.',
    },
    {
        id: 'risk-disclosure',
        title: 'Risk Disclosure',
        icon: AlertTriangle,
        apiUrl: '/api/v2/risk-disclosure',
        apiKey: 'disclosure.riskDisclosure',
        description: 'Important information about the risks involved in trading.',
    },
    {
        id: 'privacy',
        title: 'Privacy Policy',
        icon: Lock,
        apiUrl: '/api/v2/privacy-policy',
        apiKey: 'policy.privacyPolicy',
        description: 'How we collect, use, and protect your personal information.',
    },
];

export default function LegalHubPage() {
    const searchParams = useSearchParams();
    const [sections, setSections] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // Fetch all documents on mount
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const results = await Promise.all(
                    LEGAL_SECTIONS.map(async (section) => {
                        const res = await fetch(section.apiUrl);
                        const data = await res.json();
                        // Navigate the nested key (e.g., 'gdpr.gdpr')
                        const keys = section.apiKey.split('.');
                        let value: any = data;
                        for (const k of keys) {
                            value = value?.[k];
                        }
                        return { id: section.id, content: value || 'No content available.' };
                    })
                );

                const contentMap: Record<string, string> = {};
                results.forEach(({ id, content }) => {
                    contentMap[id] = content;
                });
                setSections(contentMap);
            } catch (error) {
                console.error('Failed to fetch legal sections:', error);
                // Set fallback content or handle error state
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    // Scroll to the requested section after data has loaded
    useEffect(() => {
        if (loading) return;

        const sectionParam = searchParams.get('section');
        const hash = window.location.hash.replace('#', '');

        const targetId = sectionParam || hash;
        if (targetId) {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [loading, searchParams]);

    if (loading) {
        return (
            <div className='min-h-screen bg-[#050608] flex items-center justify-center'>
                <div className='text-white text-xl'>Loading legal documents…</div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#050608]'>
            {/* HERO */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-6xl relative z-10'>
                    <div className='space-y-6'>
                        <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold'>
                            Legal Center
                        </Badge>

                        <h1 className='text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight'>
                            Legal <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Documents</span>
                        </h1>

                        <p className='text-base sm:text-lg text-gray-300 max-w-3xl leading-relaxed'>
                            Everything you need to know about your rights, our terms, and how we protect your data.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTIONS */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-6xl'>
                    <div className='grid gap-6 sm:gap-8'>
                        {LEGAL_SECTIONS.map((section) => (
                            <div key={section.id} id={section.id} className='scroll-mt-24'>
                                <Card className='group relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl'>
                                    <CardContent className='p-6 sm:p-8'>
                                        <div className='flex flex-col sm:flex-row gap-5 items-start'>
                                            <div className='flex-shrink-0'>
                                                <div className='w-14 h-14 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-2xl flex items-center justify-center shadow-lg'>
                                                    <section.icon className='w-7 h-7 text-white' />
                                                </div>
                                            </div>

                                            <div className='space-y-3'>
                                                <h2 className='text-2xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                    {section.title}
                                                </h2>
                                                <p className='text-gray-400 text-sm'>{section.description}</p>
                                                <div className='prose prose-invert max-w-none'>
                                                    <p className='text-gray-300 leading-relaxed whitespace-pre-line'>{sections[section.id]}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}

                        {/* CONTACT / HELP */}
                        <Card className='relative bg-gradient-to-br from-[#050608] to-[#0a0b0f] border-2 border-[#2c7bbe]/30 rounded-2xl'>
                            <CardContent className='p-6 sm:p-8'>
                                <div className='flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between'>
                                    <div className='space-y-2'>
                                        <h3 className='text-2xl font-bold text-white'>Questions?</h3>
                                        <p className='text-gray-300 leading-relaxed max-w-2xl'>
                                            If you have any questions about these legal documents, please contact our support team.
                                        </p>
                                    </div>
                                    <div className='flex flex-col sm:flex-row gap-3'>
                                        <a
                                            href='mailto:support@blacksnow.com'
                                            className='inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 border border-[#4cc7e8]/40 bg-transparent rounded-md transition hover:bg-[#4cc7e8] hover:text-[#050608]'
                                        >
                                            Email Support
                                            <ArrowRight className='w-4 h-4' />
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
}
