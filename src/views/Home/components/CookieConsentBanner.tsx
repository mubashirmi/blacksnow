// ✅ Create this file: /components/CookieConsentBanner.tsx
'use client';

import { Cookie, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bs_cookie_consent_v1';

export function CookieConsentBanner() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // show only if not already accepted/rejected
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (!saved) setOpen(true);
    }, []);

    const close = (value: 'accepted' | 'rejected') => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {}
        setOpen(false);
    };

    if (!open) return null;

    return (
        <div className='fixed min-w-full inset-x-0 bottom-0 z-[9999]'>
            <div
                className='
          mx-auto 
          border border-[#2c7bbe]/30
          bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608]
          shadow-2xl shadow-[#2c7bbe]/20
          backdrop-blur-2xl
        '
            >
                <div className='p-4 sm:p-5'>
                    <div className='flex items-start gap-3'>
                        {/* icon */}
                        <div className='mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] shadow-lg'>
                            <Cookie className='h-5 w-5 text-white' />
                        </div>

                        {/* text */}
                        <div className='min-w-0 flex-1'>
                            <div className='flex items-start justify-between gap-3'>
                                <div>
                                    <p className='text-white font-black text-base sm:text-lg'>We use cookies</p>
                                    <p className='mt-1 text-sm sm:text-base text-gray-300 leading-relaxed'>
                                        We use cookies to improve performance, personalize your experience, and analyze traffic. You can accept or reject
                                        non-essential cookies. Read our{' '}
                                        <Link href='/cookie-policy' className='text-[#4cc7e8] underline underline-offset-2 hover:text-white transition'>
                                            Cookie Policy
                                        </Link>
                                        .
                                    </p>
                                </div>

                                {/* close (X) */}
                                <button
                                    onClick={() => close('rejected')}
                                    className='
                    flex h-9 w-9 items-center justify-center
                    rounded-xl
                    border border-white/10
                    bg-white/5
                    hover:bg-white/10
                    transition
                  '
                                    aria-label='Close cookie banner'
                                >
                                    <X className='h-4 w-4 text-white/80' />
                                </button>
                            </div>

                            {/* buttons */}
                            <div className='mt-4 flex flex-col sm:flex-row gap-3 sm:items-center'>
                                {/* Accept */}
                                <button
                                    onClick={() => close('accepted')}
                                    className='
                    w-full sm:w-auto cursor-pointer
                    px-5 py-3
                    rounded-md
                    font-black text-white
                    bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8]
                    hover:from-[#4cc7e8] hover:to-[#2c7bbe]
                    shadow-xl shadow-[#2c7bbe]/30
                    transition-all duration-300
                    transform hover:scale-[1.02]
                  '
                                >
                                    Accept
                                </button>

                                {/* Reject (hollow) */}
                                <button
                                    onClick={() => close('rejected')}
                                    className='
                    w-full sm:w-auto cursor-pointer
                    px-5 py-3
                    rounded-md
                    font-black
                    text-[#4cc7e8]
                    border-2 border-[#4cc7e8]/60
                    bg-transparent
                    hover:bg-[#4cc7e8]
                    hover:text-[#050608]
                    transition-all duration-300
                    transform hover:scale-[1.02]
                  '
                                >
                                    Reject
                                </button>

                                <p className='text-xs text-white/50 sm:ml-auto'>You can change this anytime in your browser settings.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
