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

export default function PageChangeLoader({ logoSrc = '/logocolored.png', duration = 2700 }: PageChangeLoaderProps) {
    const router = useRouter();

    const [visible, setVisible] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startedAtRef = useRef<number>(0);
    const loaderActiveRef = useRef(false);

    const clearLoaderTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const hideLoader = () => {
        clearLoaderTimeout();
        loaderActiveRef.current = false;
        setVisible(false);
    };

    const hideLoaderAfterRemainingTime = () => {
        clearLoaderTimeout();

        const elapsed = Date.now() - startedAtRef.current;
        const remaining = Math.max(duration - elapsed, 0);

        timeoutRef.current = setTimeout(() => {
            loaderActiveRef.current = false;
            setVisible(false);
        }, remaining);
    };

    useEffect(() => {
        const handleRouteChangeStart = (nextUrl: string) => {
            const currentUrl = router.asPath;

            const shouldSkipLoader = isDashboardRoute(currentUrl) || isDashboardRoute(nextUrl);

            if (shouldSkipLoader) {
                hideLoader();
                return;
            }

            clearLoaderTimeout();

            loaderActiveRef.current = true;
            startedAtRef.current = Date.now();

            setAnimationKey((prev) => prev + 1);
            setVisible(true);

            // Safety fallback: even if routeChangeComplete does not fire properly,
            // loader will still disappear.
            timeoutRef.current = setTimeout(() => {
                loaderActiveRef.current = false;
                setVisible(false);
            }, duration + 150);
        };

        const handleRouteChangeComplete = () => {
            if (!loaderActiveRef.current) return;

            hideLoaderAfterRemainingTime();
        };

        const handleRouteChangeError = () => {
            hideLoader();
        };

        router.events.on('routeChangeStart', handleRouteChangeStart);
        router.events.on('routeChangeComplete', handleRouteChangeComplete);
        router.events.on('routeChangeError', handleRouteChangeError);

        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart);
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
            router.events.off('routeChangeError', handleRouteChangeError);

            clearLoaderTimeout();
        };
        // eslint-disable-next-line
    }, [router.events, router.asPath, duration]);

    if (!visible) return null;

    return (
        <div className='fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-black'>
            <div className='relative z-10 flex w-full max-w-sm flex-col items-center justify-center px-6'>
                <div className='relative mb-8 flex items-center justify-center'>
                    <div className='absolute h-40 w-40 rounded-full bg-[#4cc7e8]/10 blur-3xl' />

                    <Image
                        width={100}
                        height={100}
                        src={logoSrc}
                        alt='Logo'
                        priority
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

                .animate-shine {
                    animation: shine 1.15s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
