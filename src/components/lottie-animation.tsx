'use client';

import { useEffect, useRef } from 'react';

interface LottieAnimationProps {
    src: string;
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
}

export function LottieAnimation({ src, className = '', loop = true, autoplay = true }: LottieAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('LottieAnimation useEffect triggered');
        let animationInstance: any = null;

        const loadLottie = async () => {
            try {
                const lottie = (await import('lottie-web')).default;
                if (containerRef.current) {
                    const response = await fetch(src);
                    const animationData = await response.json();
                    animationInstance = lottie.loadAnimation({
                        container: containerRef.current,
                        renderer: 'svg',
                        loop,
                        autoplay,
                        animationData,
                    });
                }
            } catch (error) {
                console.error('Error loading Lottie animation:', error);
            }
        };

        loadLottie();

        return () => {
            console.log('Cleaning up Lottie animation');
            if (animationInstance) {
                animationInstance.destroy();
            }
        };
    }, [src, loop, autoplay]);

    return <div ref={containerRef} className={className} />;
}
