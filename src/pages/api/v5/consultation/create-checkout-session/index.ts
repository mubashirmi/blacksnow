import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET as string, {
    apiVersion: '2024-06-20',
});

type CreateConsultationCheckoutBody = {
    fullName?: string;
    companyName?: string;
    location?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    numOfPositions?: number | string;
    dateTime?: string;
    successUrl?: string;
    cancelUrl?: string;
};

function getOrigin(req: NextApiRequest) {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
    }

    const protocolHeader = req.headers['x-forwarded-proto'];
    const protocol = Array.isArray(protocolHeader) ? protocolHeader[0] : protocolHeader?.split(',')[0] || 'http';

    const host = req.headers.host;

    if (!host) {
        throw new Error('Unable to determine request host.');
    }

    return `${protocol}://${host}`;
}

function getString(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const priceId = process.env.NEXT_PRIVATE_STRIPE_PRICE_CONSULTATION;

        if (!priceId) {
            return res.status(500).json({
                message: 'NEXT_PRIVATE_STRIPE_PRICE_CONSULTATION is not set in environment variables.',
            });
        }

        const body = req.body as CreateConsultationCheckoutBody;

        const fullName = getString(body.fullName);
        const companyName = getString(body.companyName);
        const location = getString(body.location);
        const jobTitle = getString(body.jobTitle);
        const email = getString(body.email);
        const phone = getString(body.phone);
        const dateTimeValue = getString(body.dateTime);

        const numOfPositions = Number(body.numOfPositions);
        const dateTime = new Date(dateTimeValue);

        if (!fullName) {
            return res.status(400).json({ message: 'fullName is required.' });
        }

        if (!companyName) {
            return res.status(400).json({ message: 'companyName is required.' });
        }

        if (!location) {
            return res.status(400).json({ message: 'location is required.' });
        }

        if (!jobTitle) {
            return res.status(400).json({ message: 'jobTitle is required.' });
        }

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ message: 'Valid email is required.' });
        }

        if (!phone) {
            return res.status(400).json({ message: 'phone is required.' });
        }

        if (!Number.isInteger(numOfPositions) || numOfPositions <= 0) {
            return res.status(400).json({
                message: 'numOfPositions must be a positive number.',
            });
        }

        if (!dateTimeValue || Number.isNaN(dateTime.getTime())) {
            return res.status(400).json({
                message: 'Valid dateTime is required.',
            });
        }

        const origin = getOrigin(req);

        const successUrl = getString(body.successUrl) || `${origin}/consultation/success?session_id={CHECKOUT_SESSION_ID}`;

        const cancelUrl = getString(body.cancelUrl) || `${origin}/consultation/cancel`;

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer_email: email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                type: 'consultation',
                fullName,
                companyName,
                email,
            },
            payment_intent_data: {
                description: `Consultation payment for ${fullName}`,
                metadata: {
                    type: 'consultation',
                    fullName,
                    companyName,
                    email,
                },
            },
        });

        const consultation = await prisma.consultation.create({
            data: {
                fullName,
                companyName,
                location,
                jobTitle,
                email,
                phone,
                numOfPositions,
                dateTime,

                totalAmount: session.amount_total ?? 0,
                currency: session.currency ?? 'usd',

                stripeCheckoutSessionId: session.id,

                // Required by your current Prisma schema.
                // This will be updated after successful payment.
                stripePaymentIntentId: '',

                // Required by your current Prisma schema.
                // This will be updated after successful payment.
                paidAt: new Date(0),

                status: 'pending',
            },
        });

        await stripe.checkout.sessions.update(session.id, {
            metadata: {
                type: 'consultation',
                consultationId: String(consultation.id),
                fullName,
                companyName,
                email,
            },
        });

        return res.status(200).json({
            message: 'Consultation checkout session created successfully.',
            consultation,
            checkout: {
                id: session.id,
                url: session.url,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
