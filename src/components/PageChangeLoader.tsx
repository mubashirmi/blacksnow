import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

type PageChangeLoaderProps = {
    logoSrc?: string;
    duration?: number;
};

const cleanPath = (url: string) => {
    return url.split('?')[0].split('#')[0].toLowerCase();
};

const isDashboardRoute = (url: string) => {
    const path = cleanPath(url);

    return (
        path.includes('dashboard') ||
        path.startsWith('/admin') ||
        path.startsWith('/emailmarketing/dashboard') ||
        path.startsWith('/affiliate/dashboard') ||
        path.startsWith('/superaffiliate/dashboard') ||
        path.startsWith('/sales/dashboard') ||
        path.startsWith('/invoicecontractdashboard')
    );
};

export default function PageChangeLoader({ logoSrc = '/logocolored.png', duration = 2500 }: PageChangeLoaderProps) {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const showLoader = (nextUrl: string) => {
            const currentUrl = router.asPath;

            if (isDashboardRoute(currentUrl) || isDashboardRoute(nextUrl)) return;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setAnimationKey((prev) => prev + 1);
            setVisible(true);

            timeoutRef.current = setTimeout(() => {
                setVisible(false);
            }, duration);
        };

        const hideLoaderOnError = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setVisible(false);
        };

        router.events.on('routeChangeStart', showLoader);
        router.events.on('routeChangeError', hideLoaderOnError);

        return () => {
            router.events.off('routeChangeStart', showLoader);
            router.events.off('routeChangeError', hideLoaderOnError);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [router, duration]);

    if (!visible) return null;

    return (
        <div className='fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-black'>
            {/* <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,199,232,0.16),transparent_38%)]' /> */}

            {/* <div className='absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4cc7e8]/10 blur-3xl' /> */}

            <div className='relative z-10 flex w-full max-w-sm flex-col items-center justify-center px-6'>
                <div className='relative mb-8 flex items-center justify-center'>
                    <div className='absolute h-40 w-40 rounded-full bg-[#4cc7e8]/10 blur-3xl' />

                    <Image
                        width={100}
                        height={100}
                        src={logoSrc}
                        alt='Logo'
                        className='relative h-32 w-32 object-contain drop-shadow-blue-950 sm:h-48 sm:w-48 lg:h-56 lg:w-56'
                    />
                </div>

                <div className='relative h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-[0_0_30px_rgba(76,199,232,0.18)]'>
                    <div
                        key={animationKey}
                        className='h-full rounded-full bg-gradient-to-r from-[#011430] via-[#012b69] to-[#02328b] shadow-[0_0_22px_rgba(76,199,232,0.75)]'
                        style={{
                            animation: `loadBar ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                        }}
                    />

                    <div className='absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/35 to-transparent' />
                </div>

                {/* <div className='mt-3 h-px w-44 bg-gradient-to-r from-transparent via-[#4cc7e8]/70 to-transparent' /> */}
            </div>

            <style jsx>{`
                @keyframes loadBar {
                    0% {
                        width: 0%;
                    }
                    18% {
                        width: 28%;
                    }
                    45% {
                        width: 58%;
                    }
                    72% {
                        width: 84%;
                    }
                    100% {
                        width: 100%;
                    }
                }

                @keyframes shine {
                    0% {
                        transform: translateX(-120%);
                    }
                    100% {
                        transform: translateX(120%);
                    }
                }

                @keyframes logoFloat {
                    0%,
                    100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-8px) scale(1.04);
                    }
                }

                @keyframes dot {
                    0%,
                    100% {
                        opacity: 0.25;
                        transform: translateY(0);
                    }
                    50% {
                        opacity: 1;
                        transform: translateY(-4px);
                    }
                }

                .animate-shine {
                    animation: shine 1.15s ease-in-out infinite;
                }

                .animate-logoFloat {
                    animation: logoFloat 2s ease-in-out infinite;
                }

                .animate-dot {
                    animation: dot 0.9s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
