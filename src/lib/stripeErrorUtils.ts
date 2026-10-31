export function isStripeResourceMissing(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const stripeError = error as {
        code?: unknown;
        raw?: {
            code?: unknown;
        };
    };

    return stripeError.code === 'resource_missing' || stripeError.raw?.code === 'resource_missing';
}
