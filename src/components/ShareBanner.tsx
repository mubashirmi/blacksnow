'use client';

import { Mail, MessageSquareText } from 'lucide-react';
import { useEffect, useState } from 'react';

type ShareBannerProps = {
    title?: string;
    description?: string;
    /** extra classes if you want */
    className?: string;
};

function isIOSUA(ua: string) {
    return /iPad|iPhone|iPod/.test(ua);
}

export default function ShareBanner({ title, description, className }: ShareBannerProps) {
    const [smsHref, setSmsHref] = useState<string>('');
    const [emailHref, setEmailHref] = useState<string>('');

    useEffect(() => {
        // ✅ Only runs on client (avoids SSR issues)
        const url = window.location.href;
        const ua = navigator.userAgent || '';

        const t = (title || '').trim();
        const d = (description || '').trim();

        const shareText = [t ? `Check this out: ${t}` : 'Check this out!', d || null, url].filter(Boolean).join('\n');

        const body = encodeURIComponent(shareText);

        const sms = isIOSUA(ua) ? `sms:&body=${body}` : `sms:?&body=${body}`;

        const subject = encodeURIComponent(t ? `Shared: ${t}` : 'Shared link');
        const email = `mailto:?subject=${subject}&body=${body}`;

        setSmsHref(sms);
        setEmailHref(email);
    }, [title, description]);

    // Don’t render until client computed URLs (prevents hydration weirdness)
    if (!smsHref || !emailHref) return null;

    return (
        <div
            className={[
                'fixed inset-x-0 shadow-sm bottom-0 left-0 z-50 border rounded-2xl ml-3 mb-3 border-white/10 bg-black/75 backdrop-blur w-max',
                className || '',
            ].join(' ')}
        >
            <div className='max-w-min px-4 py-3'>
                <div className='flex w-full gap-3'>
                    {/* ✅ SMS LEFT (GREEN) */}
                    <a
                        href={smsHref}
                        className='flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 font-bold bg-green-500 hover:bg-green-600 text-white transition'
                        aria-label='Share via SMS'
                        title='Share via SMS'
                    >
                        <MessageSquareText className='w-5 h-5' />
                        SMS
                    </a>

                    {/* ✅ EMAIL RIGHT (YELLOW) */}
                    <a
                        href={emailHref}
                        className='flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 font-bold bg-yellow-400 hover:bg-yellow-500 text-black transition'
                        aria-label='Share via Email'
                        title='Share via Email'
                    >
                        <Mail className='w-5 h-5' />
                        Email
                    </a>
                </div>
            </div>
        </div>
    );
}
