import { ChevronDown, List, LogOut, Monitor, PlusSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type ActiveKey = 'list' | 'create' | 'edit';

export function DigitalBillboardSidebar({
    activeKey,
    canCreateMore,
    onShowList,
    onCreate,
    onLogout,
    closeMobile,
}: {
    activeKey: ActiveKey;
    canCreateMore: boolean;
    onShowList: () => void;
    onCreate: () => void;
    onLogout: () => void;
    closeMobile: () => void;
}) {
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const navigationItems = useMemo(
        () => [
            {
                title: 'Digital Billboard',
                icon: Monitor,
                children: [
                    { title: 'My Billboards', icon: List, key: 'list' as const, onClick: onShowList },
                    { title: 'Create Billboard', icon: PlusSquare, key: 'create' as const, onClick: onCreate, disabled: !canCreateMore },
                ],
            },
            // Optional: real route links if you want
            // { title: 'Pricing', icon: Tag, href: '/pricing' },
        ],
        [onShowList, onCreate, canCreateMore]
    );

    const toggleMenu = (title: string) => setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));

    return (
        <div className='h-full flex flex-col'>
            {/* Header */}
            <div className='p-6 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                    <div className='relative transform hover:scale-105 transition-transform duration-300'>
                        <Link href='/' onClick={closeMobile}>
                            <Image src='/logoblack.png' alt='Black Snow Logo' width={80} height={80} className='object-contain drop-shadow-md' />
                        </Link>
                    </div>
                    <div>
                        <span className='font-bold text-xl text-gray-800 ml-1'>Black Snow</span>
                        <button
                            type='button'
                            className='items-center gap-2 px-2 py-1 cursor-pointer text-sm font-medium text-[#0b0b0b]/80 border border-[#0b0b0b]/30 bg-transparent rounded-xl transition hover:bg-[#0b0b0b] hover:text-white'
                        >
                            Digital Billboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div className='flex-1 overflow-y-auto p-4'>
                <div className='space-y-1'>
                    {navigationItems.map((item) => {
                        const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0;

                        if (hasChildren) {
                            const title = item.title;
                            const isChildActive = (item as any).children.some((c: any) => c.key === activeKey);
                            const isOpen = openMenus[title] ?? isChildActive;

                            return (
                                <div key={title} className='space-y-1'>
                                    <button
                                        type='button'
                                        onClick={() => toggleMenu(title)}
                                        className={`
                      w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                      ${isChildActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                    `}
                                    >
                                        <span className='flex items-center gap-3'>
                                            <item.icon className='w-4 h-4' />
                                            <span>{title}</span>
                                        </span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isOpen && (
                                        <div className='ml-4 space-y-1'>
                                            {(item as any).children.map((child: any) => {
                                                const childActive = child.key === activeKey;
                                                const disabled = Boolean(child.disabled);

                                                return (
                                                    <button
                                                        key={child.title}
                                                        type='button'
                                                        onClick={() => {
                                                            if (disabled) return;
                                                            child.onClick?.();
                                                            closeMobile();
                                                        }}
                                                        disabled={disabled}
                                                        className={`
                              w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-left
                              ${childActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                              ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-600' : ''}
                            `}
                                                    >
                                                        <child.icon className='w-4 h-4' />
                                                        <span>{child.title}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className='p-4 border-t border-gray-100'>
                <button
                    onClick={() => {
                        onLogout();
                        closeMobile();
                    }}
                    className='flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium'
                >
                    <LogOut className='w-4 h-4' />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
