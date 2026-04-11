'use client';

import { Mail, MessageSquareText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ShareBannerProps = {
    title?: string;
    description?: string;
    className?: string;
};

function isIOSUA(ua: string) {
    return /iPad|iPhone|iPod/.test(ua);
}

export default function ShareBanner({ title, description, className }: ShareBannerProps) {
    const [smsHref, setSmsHref] = useState<string>('');
    const [emailHref, setEmailHref] = useState<string>('');
    const [visible, setVisible] = useState(true);

    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
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

    useEffect(() => {
        const handleScroll = () => {
            if (ticking.current) return;
            ticking.current = true;

            requestAnimationFrame(() => {
                const currentY = window.scrollY;
                // Hide when scrolling down, show when scrolling up
                setVisible(currentY <= lastScrollY.current || currentY < 10);
                lastScrollY.current = currentY;
                ticking.current = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!smsHref || !emailHref) return null;

    return (
        <div
            className={[
                'fixed bottom-5 left-1/2 -translate-x-1/2 z-50',
                'border border-white/10 bg-black/70 backdrop-blur-md',
                'rounded-2xl shadow-lg shadow-black/40',
                'transition-all duration-500 ease-in-out',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none',
                className || '',
            ].join(' ')}
        >
            <div className='flex items-center gap-2 px-3 py-2.5'>
                {/* SMS */}
                <a
                    href={smsHref}
                    className='inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors'
                    aria-label='Share via SMS'
                    title='Share via SMS'
                >
                    <MessageSquareText className='w-4 h-4' />
                    SMS
                </a>

                {/* Email */}
                <a
                    href={emailHref}
                    className='inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-black transition-colors'
                    aria-label='Share via Email'
                    title='Share via Email'
                >
                    <Mail className='w-4 h-4' />
                    Email
                </a>
            </div>
        </div>
    );
}
