import { AuthProvider } from '@/lib/auth';
import { ArrowRight, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { HamburgerMenu } from '../hamburger-menu';

function CoreLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <header className='fixed top-0 left-0 w-full z-50 bg-[#050608] border-b border-b-[#2c7bbe] min-h-[64px] sm:min-h-[80px] flex items-center'>
                <div className='container mx-auto px-4 sm:px-6 md:px-8 w-full'>
                    <div className='flex items-center justify-between relative'>
                        {/* Logo */}
                        <Link href={'/'} className='md:mr-auto flex items-center'>
                            {/* Icon - positioned to left of centered text on mobile */}
                            <div className='flex items-center justify-center h-[38px] w-[38px] md:h-12 md:w-12 absolute left-1/2 -translate-x-[calc(100%+110px)] md:static md:translate-x-0 md:mr-2'>
                                <Image
                                    src='/logocolored.png'
                                    alt='Black Snow Logo'
                                    width={40}
                                    height={40}
                                    className='object-contain h-full w-auto drop-shadow-2xl'
                                    priority
                                />
                            </div>
                            {/* Text - perfectly centered on mobile */}
                            <div className='h-8 md:h-9 flex items-center absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0'>
                                <span className='text-[28px] md:text-[30px] lg:text-[44px] uppercase font-extralight md:font-light text-[#4cc7e8] fontArchivoBlack whitespace-nowrap leading-none'>
                                    Black Snow
                                </span>
                            </div>
                        </Link>

                        {/* Hamburger Menu */}
                        <div className='ml-auto md:ml-0'>
                            <HamburgerMenu />
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className='pt-16 sm:pt-20'>{children}</main>

            {/* Footer */}
            <footer className='relative bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-t border-[#2c7bbe]/20 pt-12 pb-7 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-7xl relative z-10'>
                    <div className='grid lg:grid-cols-5 gap-8 sm:gap-12'>
                        <div className='space-y-8 col-span-2'>
                            <div className='flex items-center space-x-4'>
                                <div className='relative group'>
                                    <div className='relative transform group-hover:scale-105 transition-transform duration-300'>
                                        <Image
                                            src='/logocolored.png'
                                            alt='Black Snow Logo'
                                            width={170}
                                            height={170}
                                            className='object-contain drop-shadow-2xl'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='flex space-x-4'>
                                {[
                                    { icon: Facebook, href: '#' },
                                    { icon: Instagram, href: '#' },
                                    { icon: Twitter, href: '#' },
                                    { icon: Linkedin, href: '#' },
                                ].map((social, index) => (
                                    <Link
                                        key={index}
                                        href={social.href}
                                        className='w-10 h-10 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-xl flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group transform hover:scale-110'
                                    >
                                        <social.icon className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className='space-y-5'>
                            <h4 className='text-lg sm:text-xl font-black text-[#4cc7e8]'>Company</h4>
                            <div className='space-y-3'>
                                {[
                                    { name: 'Our Story', href: '/about' },
                                    { name: 'Careers', href: '/careers' },
                                    { name: 'Blogs', href: '/blogdirectory' },
                                    { name: 'FAQ', href: '/faq' },
                                    { name: 'Pricing', href: '/pricing' },
                                    { name: 'Support', href: '/support' },
                                ].map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        className='block text-gray-300 hover:text-[#4cc7e8] transition-colors duration-300 font-semibold group'
                                    >
                                        <span className='flex items-center'>
                                            {link.name}
                                            <ArrowRight className='w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300' />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className='space-y-5'>
                            <h4 className='text-lg sm:text-xl font-black text-[#4cc7e8]'>Resources</h4>
                            <div className='space-y-3'>
                                {[
                                    { name: 'Affiliate Program', href: '/affiliate' },
                                    { name: 'Webinar RSVP', href: '/rsvp' },
                                    { name: 'Digital Billboard', href: '/advertising' },
                                    { name: 'Email/SMS Marketing', href: '/emailMarketing' },
                                    { name: 'Consultation', href: '/consultation' },
                                ].map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        className='block text-gray-300 hover:text-[#4cc7e8] transition-colors duration-300 font-semibold group'
                                    >
                                        <span className='flex items-center'>
                                            {link.name}
                                            <ArrowRight className='w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300' />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className='space-y-5'>
                            <h4 className='text-lg sm:text-xl font-black text-[#4cc7e8]'>Legal</h4>
                            <div className='space-y-3'>
                                {[
                                    { name: 'Affiliate Agreement', href: '/affiliateagreement' },
                                    { name: 'Investment Risk Disclosure', href: '/riskdisclosure' },
                                    { name: 'Terms & Conditions', href: '/terms' },
                                    { name: 'Privacy Policy', href: '/privacy' },
                                    { name: 'GDPR', href: '/gdpr' },
                                ].map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        className='block text-gray-300 hover:text-[#4cc7e8] transition-colors duration-300 font-semibold group'
                                    >
                                        <span className='flex items-center'>
                                            {link.name}
                                            <ArrowRight className='w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300' />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className='text-gray-400 font-semibold text-center mt-12 text-sm sm:text-base'>© 2024 Black Snow. All rights reserved.</p>
                </div>
            </footer>
        </AuthProvider>
    );
}

export { CoreLayout };
