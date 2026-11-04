import originalLottie from 'lottie-web';

const PURPLE: [number, number, number] = [67 / 255, 51 / 255, 175 / 255];

const ORIGINAL_BLUES = [
    [44, 125, 192],
    [48, 132, 195],
    [42, 139, 201],
];

function isBlue(color: unknown): color is number[] {
    if (!Array.isArray(color) || color.length < 3 || !color.slice(0, 3).every((n) => typeof n === 'number' && Number.isFinite(n))) {
        return false;
    }

    const [r, g, b] = color;

    const knownBlue = ORIGINAL_BLUES.some((rgb) => rgb.every((channel, i) => Math.abs(color[i] * 255 - channel) <= 2));

    const otherBlue = r < 0.42 && g > 0.23 && b > 0.52 && b > r * 1.3 && b >= g * 0.95;

    return knownBlue || otherBlue;
}

function recolor(data: unknown): number {
    let changed = 0;

    function recolorKeyframes(value: unknown): void {
        if (!Array.isArray(value)) return;

        if (isBlue(value)) {
            value.splice(0, 3, ...PURPLE);
            changed++;
            return;
        }

        for (const entry of value) {
            if (entry && typeof entry === 'object') {
                const frame = entry as {
                    s?: unknown;
                    e?: unknown;
                };

                recolorKeyframes(frame.s);
                recolorKeyframes(frame.e);
            }
        }
    }

    function walk(value: unknown): void {
        if (!value || typeof value !== 'object') return;

        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }

        const node = value as Record<string, unknown>;

        if ((node.ty === 'fl' || node.ty === 'st') && node.c && typeof node.c === 'object') {
            recolorKeyframes((node.c as { k?: unknown }).k);
        }

        Object.values(node).forEach(walk);
    }

    walk(data);

    return changed;
}

function loadAnimation(config: Parameters<typeof originalLottie.loadAnimation>[0]) {
    const path = (config as { path?: string }).path;

    if (!path) {
        return originalLottie.loadAnimation(config);
    }

    const controller = new AbortController();

    let animation: ReturnType<typeof originalLottie.loadAnimation> | null = null;

    let destroyed = false;
    // eslint-disable-next-line
    void (async () => {
        try {
            const response = await fetch(path, {
                cache: 'no-store',
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`Could not load ${path}: HTTP ${response.status}`);
            }

            const animationData = await response.json();

            const changed = recolor(animationData);

            if (destroyed || controller.signal.aborted) {
                return;
            }

            animation = originalLottie.loadAnimation({
                ...config,
                path: undefined,
                animationData,
            } as Parameters<typeof originalLottie.loadAnimation>[0]);

            if (process.env.NODE_ENV !== 'production') {
                console.info(`[Purple Lottie] ${path}: ${changed} blue elements recolored`);
            }
        } catch (error) {
            if (!controller.signal.aborted) {
                console.error('[Purple Lottie]', path, error);
            }
        }
    })();

    return {
        destroy() {
            destroyed = true;
            controller.abort();
            animation?.destroy();
        },
    };
}

const purpleLottie = {
    loadAnimation,
};

export default purpleLottie;
