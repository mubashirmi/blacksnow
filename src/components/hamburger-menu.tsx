'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { destroyCookie } from 'nookies';
import { useEffect, useState } from 'react';

const menuItems = [
    {
        category: 'Company',
        items: [
            { name: 'Our Story', href: '/about' },
            { name: 'Careers', href: '/careers' },
            { name: 'Blogs', href: '/blogdirectory' },
            { name: 'FAQ', href: '/faq' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'Support', href: '/support' },
        ],
    },
    {
        category: 'Resources',
        items: [
            { name: 'Affiliate Program', href: '/affiliate' },
            { name: 'Webinar RSVP', href: '/rsvp' },
            { name: 'Digital Billboard', href: '/advertising' },
            { name: 'Email/SMS Marketing', href: '/emailMarketing' },
            { name: 'Consultation', href: '/consultation' },
        ],
    },
];

// Accept userId as a prop to ensure consistency
export function HamburgerMenu({ userId }: { userId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [userid, setUserid] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();

    // Prevent body scroll when menu is open
    useEffect(() => {
        const iid = localStorage.getItem('userId');
        setUserid(iid);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setShowLogoutModal(false);
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        destroyCookie(null, 'id');
        destroyCookie(null, 'token');
        localStorage.removeItem('userId');
        localStorage.removeItem('roles');
        localStorage.removeItem('referredby');
        setShowLogoutModal(false);
        setIsOpen(false);
        router.push('/');
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <div>
            {/* Hamburger Button */}
            <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsOpen(!isOpen)}
                className='relative z-50 w-16 h-12 text-[#4cc7e8] hover:bg-[#2c7bbe]/20 transition-all duration-300 cursor-pointer'
                aria-label='Toggle menu'
            >
                <div className='w-6 h-6 flex flex-col justify-center items-center'>
                    <span
                        className={`block h-0.5 w-8 bg-current transform transition-all duration-300 ease-in-out ${
                            isOpen ? 'rotate-45 translate-y-1.5 opacity-0' : '-translate-y-[6px]'
                        }`}
                    />
                    <span className={`block h-0.5 w-8 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                    <span
                        className={`block h-0.5 w-8 bg-current transform transition-all duration-300 ease-in-out ${
                            isOpen ? '-rotate-45 -translate-y-1.5 opacity-0' : 'translate-y-[6px]'
                        }`}
                    />
                </div>
            </Button>

            {/* Menu Overlay */}
            <div className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => {
                        setIsOpen(false);
                        setShowLogoutModal(false);
                    }}
                />

                {/* Menu Panel */}
                <div
                    className={`absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-l border-[#2c7bbe]/30 shadow-2xl transform transition-all duration-500 ease-in-out ${
                        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}
                >
                    {/* Header */}
                    <div className='flex items-center justify-between p-6 border-b border-[#2c7bbe]/20'>
                        <h2
                            className={`text-2xl font-black bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent transform transition-all duration-700 delay-200 ${
                                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                            }`}
                        >
                            Menu
                        </h2>
                    </div>

                    {/* Menu Content */}
                    <div className='p-6 space-y-8 overflow-y-auto h-full pb-72'>
                        {menuItems.map((section, sectionIndex) => (
                            <div
                                key={sectionIndex}
                                className={`transform transition-all duration-700 ease-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                                style={{
                                    transitionDelay: isOpen ? `${300 + sectionIndex * 100}ms` : '0ms',
                                }}
                            >
                                <h3 className='text-lg font-black text-[#4cc7e8] mb-4 relative'>
                                    {section.category}
                                    <div className='absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full' />
                                </h3>
                                <div className='space-y-2'>
                                    {section.items.map((item, itemIndex) => (
                                        <Link
                                            key={itemIndex}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`block text-gray-300 hover:text-[#4cc7e8] transition-all duration-300 font-medium py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-[#2c7bbe]/10 hover:to-[#4cc7e8]/10 border border-transparent hover:border-[#2c7bbe]/20 group transform ${
                                                isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                                            }`}
                                            style={{
                                                transitionDelay: isOpen ? `${400 + sectionIndex * 100 + itemIndex * 50}ms` : '0ms',
                                            }}
                                        >
                                            <span className='flex items-center justify-between'>
                                                {item.name}
                                                <div className='w-2 h-2 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300' />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 p-6 border-t border-[#2c7bbe]/20 bg-gradient-to-t from-[#050608] to-[#171d29]/70 transform transition-all duration-700 delay-500 ${
                            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                        }`}
                    >
                        <div className='space-y-4'>
                            <div className='text-center'>
                                <div className='text-lg font-black bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Black Snow</div>
                                <div className='text-sm text-gray-400 mt-1'>Professional Trading Solutions</div>
                            </div>
                            <Link href='/rsvp'>
                                <Button className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-bold py-3 rounded-xl transform hover:scale-105 transition-all duration-300 cursor-pointer mb-2.5'>
                                    RSVP
                                </Button>
                            </Link>
                            {/* Login/Logout Button */}
                            <div
                                className={`transform transition-all duration-700 ease-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                                style={{
                                    transitionDelay: isOpen ? `${500 + menuItems.length * 100}ms` : '0ms',
                                }}
                            >
                                {userid ? (
                                    <Button
                                        onClick={handleLogout}
                                        className='w-full bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white font-bold py-3 rounded-xl transform hover:scale-105 transition-all duration-300 cursor-pointer'
                                    >
                                        Logout
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        className='w-full bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white font-bold py-3 rounded-xl transform hover:scale-105 transition-all duration-300 cursor-pointer'
                                    >
                                        <Link href='/login?signup' onClick={() => setIsOpen(false)}>
                                            Sign Up
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logout Confirmation Modal */}
                {showLogoutModal && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center'>
                        <div
                            className='absolute inset-0 bg-black/20 backdrop-blur-md transition-all duration-500 ease-in-out opacity-100'
                            onClick={cancelLogout}
                        />
                        <div className='relative z-50 bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl rounded-2xl p-6 w-96 transform transition-all duration-500 ease-in-out scale-100 opacity-100'>
                            <h2 className='text-2xl font-black bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent mb-4'>
                                Confirm Logout
                            </h2>
                            <p className='text-gray-300 mb-6'>Are you sure you want to logout?</p>
                            <div className='flex justify-end space-x-4'>
                                <Button
                                    onClick={cancelLogout}
                                    className='bg-transparent border-2 border-[#2c7bbe] text-[#2c7bbe] hover:bg-[#2c7bbe] cursor-pointer hover:text-white transition-all duration-300 font-bold py-2 px-4 rounded-xl'
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmLogout}
                                    className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] text-white font-bold py-2 px-4 rounded-xl transform hover:scale-105 transition-all duration-300 cursor-pointer'
                                >
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
