import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET as string, {
    apiVersion: '2024-06-20',
});

function getQueryValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function getPaymentIntentDetails(paymentIntent: Stripe.PaymentIntent | string | null) {
    if (!paymentIntent) {
        return {
            id: '',
            paidAt: new Date(),
        };
    }

    if (typeof paymentIntent === 'string') {
        return {
            id: paymentIntent,
            paidAt: new Date(),
        };
    }

    return {
        id: paymentIntent.id,
        paidAt: paymentIntent.created ? new Date(paymentIntent.created * 1000) : new Date(),
    };
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET' && req.method !== 'POST') {
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const sessionId =
            req.method === 'GET' ? getQueryValue(req.query.session_id) || getQueryValue(req.query.sessionId) : req.body?.session_id || req.body?.sessionId;

        if (!sessionId || typeof sessionId !== 'string') {
            return res.status(400).json({
                message: 'session_id is required.',
            });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent'],
        });

        const consultation = await prisma.consultation.findFirst({
            where: {
                stripeCheckoutSessionId: session.id,
                deleted: false,
            },
        });

        if (!consultation) {
            return res.status(404).json({
                message: 'Consultation not found for this Stripe session.',
                stripeSessionId: session.id,
            });
        }

        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                message: 'Payment is not completed yet.',
                paymentStatus: session.payment_status,
                checkoutStatus: session.status,
                consultation,
            });
        }

        const paymentIntentDetails = getPaymentIntentDetails(session.payment_intent as Stripe.PaymentIntent | string | null);

        const updatedConsultation = await prisma.consultation.update({
            where: {
                id: consultation.id,
            },
            data: {
                status: 'paid',
                stripePaymentIntentId: paymentIntentDetails.id,
                paidAt: paymentIntentDetails.paidAt,
                totalAmount: session.amount_total ?? consultation.totalAmount,
                currency: session.currency ?? consultation.currency,
            },
        });

        return res.status(200).json({
            message: 'Consultation payment confirmed successfully.',
            paymentStatus: session.payment_status,
            checkoutStatus: session.status,
            consultation: updatedConsultation,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
