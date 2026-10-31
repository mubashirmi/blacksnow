'use client';

import { Cookie, X } from 'lucide-react';
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
            {/* Mobile backdrop */}
            <div
                className='fixed inset-0 z-[9998] bg-black/30 sm:hidden transition-opacity duration-350'
                style={{ opacity: visible ? 1 : 0 }}
                onClick={() => close('rejected')}
            />

            {/* Banner */}
            <div
                className='fixed inset-x-0 bottom-0 z-[9999] transition-transform duration-350 ease-out'
                style={{
                    transform: visible ? 'translateY(0)' : 'translateY(100%)',
                }}
            >
                {/* MOBILE - UNCHANGED */}
                <div className='sm:hidden'>
                    <div className='rounded-t-3xl bg-[#0d0f14] border-t border-x border-[#2c7bbe]/25 shadow-2xl shadow-black/60 px-5 pt-3 pb-7'>
                        {/* Drag handle */}
                        <div className='w-10 h-1 rounded-full bg-white/20 mx-auto mb-5' />

                        {/* Heading */}
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='w-10 h-10 flex-shrink-0 rounded-xl border border-[#4cc7e8]/40 flex items-center justify-center bg-transparent'>
                                <Cookie size={20} strokeWidth={1.7} className='text-[#4cc7e8]' />
                            </div>

                            <h3 className='text-white font-semibold text-base tracking-tight'>Cookie Policy</h3>
                        </div>

                        {/* Text */}
                        <div className='mb-5'>
                            <p className='text-white/75 text-sm leading-[22px]'>
                                We use cookie technologies for verification, personalization, and advertising purposes.
                            </p>

                            <p className='text-white/65 text-sm leading-[22px] mt-1'>
                                Learn more in our{' '}
                                <Link href='/privacy' className='text-[#4cc7e8] hover:underline'>
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </div>

                        {/* Accept All */}
                        <button
                            onClick={() => close('accepted')}
                            className='w-full cursor-pointer py-3.5 rounded-2xl bg-gradient-to-r from-[#1a2a3a] to-[#1e3044] hover:from-[#2c7bbe]/40 hover:to-[#4cc7e8]/30 text-white font-bold text-base transition-all duration-300 border border-white/10'
                        >
                            Accept All
                        </button>

                        {/* Reject All */}
                        <button
                            onClick={() => close('rejected')}
                            className='w-full cursor-pointer py-3.5 mt-1 text-white/70 hover:text-white font-semibold text-sm transition-colors duration-200'
                        >
                            Reject All
                        </button>
                    </div>
                </div>

                {/* DESKTOP */}
                <div className='hidden sm:block'>
                    <div className='mx-4 mb-4 lg:mx-auto lg:w-[calc(100%-5rem)] lg:max-w-[900px] rounded-2xl bg-[#0d0f14] border border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/15 backdrop-blur-xl px-6 py-5'>
                        {/* Main row - vertically centered */}
                        <div className='flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8'>
                            {/* LEFT SECTION */}
                            <div className='flex-1 min-w-0'>
                                {/* Heading */}
                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='w-10 h-10 flex-shrink-0 rounded-xl border border-[#4cc7e8]/40 flex items-center justify-center bg-transparent'>
                                        <Cookie size={20} strokeWidth={1.7} className='text-[#4cc7e8]' />
                                    </div>

                                    <h3 className='text-white font-semibold text-base tracking-tight'>Cookie Policy</h3>
                                </div>

                                {/* First line */}
                                <p className='text-sm text-white/75 leading-relaxed lg:whitespace-nowrap'>
                                    We use cookie technologies for verification, personalization, and advertising purposes.
                                </p>

                                {/* Second line */}
                                <p className='text-sm text-white/60 leading-relaxed mt-1'>
                                    Learn more in our{' '}
                                    <Link href='/privacy' className='text-[#4cc7e8] hover:underline'>
                                        Privacy Policy
                                    </Link>
                                    .
                                </p>
                            </div>

                            {/* RIGHT SECTION - CENTERED */}
                            <div className='flex items-center justify-end gap-2.5 flex-shrink-0 lg:self-center'>
                                {/* Smaller Accept button */}
                                <button
                                    onClick={() => close('accepted')}
                                    className='cursor-pointer px-4 py-2 rounded-lg bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-bold text-xs shadow-lg shadow-[#2c7bbe]/30 transition-all duration-300 hover:scale-[1.03] whitespace-nowrap'
                                >
                                    Accept All
                                </button>

                                {/* Smaller Reject button */}
                                <button
                                    onClick={() => close('rejected')}
                                    className='cursor-pointer px-4 py-2 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-semibold text-xs transition-all duration-200 whitespace-nowrap'
                                >
                                    Reject All
                                </button>

                                {/* Larger Close button */}
                                <button
                                    onClick={() => close('rejected')}
                                    className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer'
                                    aria-label='Close'
                                >
                                    <X className='h-5 w-5 text-white/60' />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
