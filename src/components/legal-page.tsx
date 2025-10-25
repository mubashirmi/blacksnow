'use client';

import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LegalPage() {
    const pathname = usePathname();
    const [content, setContent] = useState<string>('Loading...');
    const [title, setTitle] = useState<string>('Legal Information');

    useEffect(() => {
        const apiMap: Record<string, { url: string; key: string; title: string }> = {
            '/gdpr': { url: '/api/v2/gdpr', key: 'gdpr.gdpr', title: 'GDPR' },
            '/affiliateagreement': {
                url: '/api/v2/affiliate-agreement',
                key: 'agreement.affiliateAgreement',
                title: 'Affiliate Agreement',
            },
            '/terms': { url: '/api/v2/terms', key: 'terms.terms', title: 'Terms & Policy' },
            '/riskdisclosure': {
                url: '/api/v2/risk-disclosure',
                key: 'disclosure.riskDisclosure',
                title: 'Risk Disclosure',
            },
            '/privacy': {
                url: '/api/v2/privacy-policy',
                key: 'policy.privacyPolicy',
                title: 'Privacy Policy',
            },
        };

        const match = apiMap[pathname];
        if (!match) {
            setContent('Content not found.');
            return;
        }

        setTitle(match.title);

        fetch(match.url)
            .then((res) => res.json())
            .then((data) => {
                // support nested key like "gdpr.gdpr"
                const keys = match.key.split('.');
                let value: any = data;
                for (const k of keys) {
                    value = value?.[k];
                }
                setContent(value || 'No content available.');
            })
            .catch(() => setContent('Failed to load content.'));
    }, [pathname]);

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Header */}
            <div className='relative z-10 pt-20 pb-10 px-6'>
                <div className='container mx-auto max-w-4xl text-center'>
                    <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'> LEGAL INFORMATION </Badge>
                    <h1 className='text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 animate-slide-in-up delay-200'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>{title}</span>
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className='relative z-10 px-6 pb-24'>
                <div className='container mx-auto max-w-4xl'>
                    <div className='bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 rounded-3xl p-12 shadow-xl shadow-[#2c7bbe]/10 animate-slide-in-up relative'>
                        {/* Top Border */}
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-t-3xl'></div>

                        <div className='prose prose-invert prose-lg max-w-none'>
                            <p className='text-gray-300 leading-relaxed text-lg whitespace-pre-line'>{content}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
