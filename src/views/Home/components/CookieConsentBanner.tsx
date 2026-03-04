'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bs_cookie_consent_v1';

export function CookieConsentBanner() {
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (!saved) {
            setOpen(true);
            // slight delay so the slide-up animation plays on mount
            setTimeout(() => setVisible(true), 50);
        }
    }, []);

    const close = (value: 'accepted' | 'rejected') => {
        setVisible(false);
        setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, value);
            } catch {}
            setOpen(false);
        }, 350);
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop — subtle dim on mobile */}
            <div
                className='fixed inset-0 z-[9998] bg-black/30 sm:hidden transition-opacity duration-350'
                style={{ opacity: visible ? 1 : 0 }}
                onClick={() => close('rejected')}
            />

            {/* Banner */}
            <div
                className='fixed inset-x-0 bottom-0 z-[9999] transition-transform duration-350 ease-out'
                style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
            >
                {/* ── Mobile (< sm): full bottom sheet ── */}
                <div className='sm:hidden'>
                    <div className='rounded-t-3xl bg-[#0d0f14] border-t border-x border-[#2c7bbe]/25 shadow-2xl shadow-black/60 px-6 pt-3 pb-8'>
                        {/* Drag handle */}
                        <div className='w-10 h-1 rounded-full bg-white/20 mx-auto mb-5' />

                        {/* Text */}
                        <p className='text-white/80 text-base leading-relaxed mb-6'>
                            To create a seamless experience and for website quality and improvement purposes, we use cookie technologies for verification and
                            quality purposes, to personalize the content presented, and to provide advertising that may be of specific interest to you. Learn
                            our{' '}
                            <Link href='/privacy' className='text-[#4cc7e8] hover:underline'>
                                Privacy Policy
                            </Link>{' '}
                            here.
                        </p>

                        {/* Accept All — filled pill */}
                        <button
                            onClick={() => close('accepted')}
                            className='w-full cursor-pointer py-4 rounded-2xl bg-gradient-to-r from-[#1a2a3a] to-[#1e3044] hover:from-[#2c7bbe]/40 hover:to-[#4cc7e8]/30 text-white font-bold text-lg transition-all duration-300 border border-white/10'
                        >
                            Accept All
                        </button>

                        {/* Reject All — plain text */}
                        <button
                            onClick={() => close('rejected')}
                            className='w-full cursor-pointer py-4 mt-1 text-white/70 hover:text-white font-semibold text-base transition-colors duration-200'
                        >
                            Reject All
                        </button>
                    </div>
                </div>

                {/* ── Desktop (≥ sm): floating bar ── */}
                <div className='hidden sm:block'>
                    <div className='mx-4 mb-4 lg:mx-auto lg:max-w-3xl rounded-2xl bg-[#0d0f14] border border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/15 backdrop-blur-xl px-6 py-5'>
                        <div className='flex items-start gap-4'>
                            {/* Text */}
                            <p className='flex-1 text-sm text-white/75 leading-relaxed'>
                                To create a seamless experience and for website quality and improvement purposes, we use cookie technologies for verification,
                                personalization, and advertising purposes. Learn our{' '}
                                <Link href='/privacy' className='text-[#4cc7e8] hover:underline'>
                                    Privacy Policy
                                </Link>
                                .
                            </p>

                            {/* Buttons */}
                            <div className='flex items-center gap-3 flex-shrink-0'>
                                <button
                                    onClick={() => close('accepted')}
                                    className='cursor-pointer px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-bold text-sm shadow-lg shadow-[#2c7bbe]/30 transition-all duration-300 hover:scale-[1.03] whitespace-nowrap'
                                >
                                    Accept All
                                </button>
                                <button
                                    onClick={() => close('rejected')}
                                    className='cursor-pointer px-6 py-2.5 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-semibold text-sm transition-all duration-200 whitespace-nowrap'
                                >
                                    Reject All
                                </button>
                                <button
                                    onClick={() => close('rejected')}
                                    className='flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition'
                                    aria-label='Close'
                                >
                                    <X className='h-4 w-4 text-white/60' />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
