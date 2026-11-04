'use client';

import lottie from 'lottie-web';
import { useEffect, useRef, type CSSProperties } from 'react';

const PURPLE = [67 / 255, 51 / 255, 175 / 255];

const ORIGINAL_BLUES = [
    [44, 125, 192],
    [48, 132, 195],
    [42, 139, 201],
];

function recolorAnimation(data: unknown): number {
    let changed = 0;

    function isBlue(color: number[]) {
        if (color.length < 3 || !color.slice(0, 3).every(Number.isFinite)) {
            return false;
        }

        const [r, g, b] = color;

        const knownBlue = ORIGINAL_BLUES.some((swatch) => swatch.every((channel, index) => Math.abs(color[index] * 255 - channel) <= 2));

        const otherBlue = r < 0.42 && g > 0.23 && b > 0.52 && b > r * 1.3 && b >= g * 0.95;

        return knownBlue || otherBlue;
    }

    function recolorKeyframes(value: unknown): void {
        if (!Array.isArray(value)) return;

        if (isBlue(value)) {
            value[0] = PURPLE[0];
            value[1] = PURPLE[1];
            value[2] = PURPLE[2];

            changed++;
            return;
        }

        for (const frame of value) {
            if (frame && typeof frame === 'object') {
                const keyframe = frame as {
                    s?: unknown;
                    e?: unknown;
                };

                recolorKeyframes(keyframe.s);
                recolorKeyframes(keyframe.e);
            }
        }
    }

    function walk(value: unknown): void {
        if (!value || typeof value !== 'object') {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }

        const shape = value as Record<string, unknown>;

        if ((shape.ty === 'fl' || shape.ty === 'st') && shape.c && typeof shape.c === 'object') {
            const color = shape.c as {
                k?: unknown;
            };

            recolorKeyframes(color.k);
        }

        Object.values(shape).forEach(walk);
    }

    walk(data);

    return changed;
}

type Props = {
    src: string;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
    style?: CSSProperties;
};

export function PurpleLottieAnimation({ src, loop = true, autoplay = true, className = '', style }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const controller = new AbortController();

        let animation: ReturnType<typeof lottie.loadAnimation> | null = null;

        async function loadAnimation() {
            try {
                const response = await fetch(src, {
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Failed to load Lottie: ${src}`);
                }

                const animationData = await response.json();

                const changed = recolorAnimation(animationData);

                if (controller.signal.aborted) return;

                container!.innerHTML = '';

                animation = lottie.loadAnimation({
                    container: container!,
                    renderer: 'svg',
                    loop,
                    autoplay,
                    animationData,
                });

                console.log(`Purple Lottie: ${src} (${changed} colors changed)`);
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error('Purple Lottie error:', error);
                }
            }
        }
        // eslint-disable-next-line
        void loadAnimation();

        return () => {
            controller.abort();
            animation?.destroy();
        };
    }, [src, loop, autoplay]);

    return <div ref={containerRef} className={className} style={style} />;
}
