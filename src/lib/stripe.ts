import Stripe from 'stripe';

if (!process.env.NEXT_PRIVATE_STRIPE_SECRET) {
    throw new Error('NEXT_PRIVATE_STRIPE_SECRET is not configured');
}

export const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET, {
    apiVersion: '2024-06-20',
});
