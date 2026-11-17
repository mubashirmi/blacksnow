import Image from 'next/image';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ComingSoonTriggerProps = {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    ariaLabel?: string;
};

export default function ComingSoonTrigger({ children, className = '', style, ariaLabel = 'Open coming soon dialog' }: ComingSoonTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <>
            <button type='button' aria-label={ariaLabel} className={className} style={style} onClick={() => setIsOpen(true)}>
                {children}
            </button>

            {mounted &&
                isOpen &&
                createPortal(
                    <div
                        className='fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 px-5 py-8 backdrop-blur-md'
                        role='presentation'
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setIsOpen(false);
                            }
                        }}
                    >
                        <div
                            role='dialog'
                            aria-modal='true'
                            aria-labelledby='coming-soon-title'
                            className='relative w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[#414A5D] bg-[#0C0F18] px-6 py-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.75)] sm:px-10 sm:py-12'
                        >
                            <button
                                type='button'
                                aria-label='Close coming soon dialog'
                                onClick={() => setIsOpen(false)}
                                className='absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#414A5D] bg-[#050608] text-xl leading-none text-white/70 transition-colors duration-200 hover:border-[#4333AF] hover:bg-[#4333AF]/15 hover:text-white'
                            >
                                ×
                            </button>

                            <div className='relative z-10'>
                                <div className='mx-auto flex w-fit flex-col items-center'>
                                    <Image
                                        src='/logocolored.png'
                                        alt='Black Snow'
                                        width={92}
                                        height={92}
                                        className='h-[72px] w-[72px] object-contain sm:h-[86px] sm:w-[86px]'
                                        priority
                                    />

                                    <p
                                        className='mt-3 text-[13px] font-medium uppercase tracking-[0.28em] text-white sm:text-[15px]'
                                        style={{
                                            fontFamily: 'var(--font-michroma), sans-serif',
                                        }}
                                    >
                                        Black Snow
                                    </p>
                                </div>

                                <h2
                                    id='coming-soon-title'
                                    className='mt-7 text-[clamp(2rem,9vw,3.25rem)] leading-[1.12] tracking-[-0.025em] text-white'
                                    style={{
                                        fontFamily: 'var(--font-michroma), sans-serif',
                                        fontWeight: 400,
                                    }}
                                >
                                    Coming <span className='text-[#4333AF]'>Soon</span>
                                </h2>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
