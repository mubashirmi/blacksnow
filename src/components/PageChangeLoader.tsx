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

    // Keep track of the current route without re-running useEffect.
    const currentPathRef = useRef(router.asPath);

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
        currentPathRef.current = router.asPath;

        const handleRouteChangeStart = (nextUrl: string) => {
            const currentUrl = currentPathRef.current;

            const currentIsDashboard = isDashboardRoute(currentUrl);
            const nextIsDashboard = isDashboardRoute(nextUrl);

            // Skip the loader ONLY when navigating
            // from one dashboard page to another dashboard page.
            //
            // Normal -> Normal      = SHOW
            // Normal -> Dashboard   = SHOW
            // Dashboard -> Normal   = SHOW
            // Dashboard -> Dashboard = SKIP

            const shouldSkipLoader = currentIsDashboard && nextIsDashboard;

            if (shouldSkipLoader) {
                hideLoader();
                return;
            }

            clearLoaderTimeout();

            loaderActiveRef.current = true;
            startedAtRef.current = Date.now();

            // Restart the progress animation.
            setAnimationKey((prev) => prev + 1);
            setVisible(true);

            // Safety fallback:
            // If routeChangeComplete does not fire,
            // the loader will still disappear.
            timeoutRef.current = setTimeout(() => {
                loaderActiveRef.current = false;
                setVisible(false);
            }, duration + 150);
        };

        const handleRouteChangeComplete = (url: string) => {
            // Store the completed route for the next navigation.
            currentPathRef.current = url;

            if (!loaderActiveRef.current) return;

            // Keep the loader visible for the remaining duration.
            hideLoaderAfterRemainingTime();
        };

        const handleRouteChangeError = (error: Error & { cancelled?: boolean }, url: string) => {
            // Avoid allowing an older cancelled navigation
            // to hide the loader for a newer navigation.
            if (error.cancelled) {
                return;
            }

            hideLoader();
        };

        const handleHashChangeComplete = (url: string) => {
            currentPathRef.current = url;
        };

        router.events.on('routeChangeStart', handleRouteChangeStart);
        router.events.on('routeChangeComplete', handleRouteChangeComplete);
        router.events.on('routeChangeError', handleRouteChangeError);
        router.events.on('hashChangeComplete', handleHashChangeComplete);

        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart);
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
            router.events.off('routeChangeError', handleRouteChangeError);
            router.events.off('hashChangeComplete', handleHashChangeComplete);

            clearLoaderTimeout();
        };
        // eslint-disable-next-line
    }, [router.events, duration]);

    if (!visible) return null;

    return (
        <div className='fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-black'>
            <div className='relative z-10 flex w-full max-w-sm flex-col items-center justify-center px-6'>
                {/* Logo */}
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

                {/* Progress Bar */}
                <div className='relative h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-[0_0_30px_rgba(76,199,232,0.18)]'>
                    {/* Actual progress */}
                    <div
                        key={animationKey}
                        className='absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[#6D83B2] to-[#2B358D] shadow-[0_0_22px_rgba(76,199,232,0.75)] will-change-transform'
                        style={{
                            animation: `loadBar ${duration}ms linear forwards`,
                        }}
                    />

                    {/* Moving shine */}
                    <div className='pointer-events-none absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/35 to-transparent will-change-transform' />
                </div>
            </div>

            <style jsx>{`
                @keyframes loadBar {
                    from {
                        transform: scaleX(0);
                    }

                    to {
                        transform: scaleX(1);
                    }
                }

                @keyframes shine {
                    from {
                        transform: translate3d(-120%, 0, 0);
                    }

                    to {
                        transform: translate3d(120%, 0, 0);
                    }
                }

                .animate-shine {
                    animation: shine 1.15s linear infinite;
                }
            `}</style>
        </div>
    );
}
