import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { DigitalBillboardTourPopup } from '../Digitalbillboardtourpopup';

type DashboardLayoutProps = {
    Sidebar: React.ComponentType<{ closeMobile: () => void }>;
    children: React.ReactNode;
};

export function DashboardLayout({ Sidebar, children }: DashboardLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobile = () => setMobileOpen(false);
    const openMobile = () => setMobileOpen(true);

    return (
        <div className='min-h-screen bg-gray-50'>
            <DigitalBillboardTourPopup onComplete={() => console.log('Tour complete')} />
            {/* Mobile top bar */}
            <div className='md:hidden sticky top-0 z-40 bg-white border-b border-gray-100'>
                <div className='px-4 py-3 flex items-center justify-between'>
                    <button onClick={openMobile} className='inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700'>
                        <Menu className='w-4 h-4' />
                        Menu
                    </button>
                    <span className='font-semibold text-gray-800'>Dashboard</span>
                    <div className='w-[76px]' />
                </div>
            </div>

            <div className='flex'>
                {/* ✅ Desktop sidebar (fixed) */}
                <aside className='hidden md:block fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-100 z-30'>
                    <div className='h-full overflow-y-auto'>
                        <Sidebar closeMobile={closeMobile} />
                    </div>
                </aside>

                {/* Mobile sidebar overlay */}
                {mobileOpen && (
                    <div className='md:hidden fixed inset-0 z-50'>
                        <div className='absolute inset-0 bg-black/40' onClick={closeMobile} />
                        <div className='absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl'>
                            <div className='p-3 border-b border-gray-100 flex items-center justify-between'>
                                <span className='font-semibold text-gray-800'>Menu</span>
                                <button onClick={closeMobile} className='p-2 rounded-lg hover:bg-gray-50'>
                                    <X className='w-5 h-5 text-gray-700' />
                                </button>
                            </div>

                            <div className='h-full overflow-y-auto'>
                                <Sidebar closeMobile={closeMobile} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Main content shifted because sidebar is fixed */}
                <main className='flex-1 p-4 md:p-10 md:ml-72 min-h-screen'>{children}</main>
            </div>
        </div>
    );
}
