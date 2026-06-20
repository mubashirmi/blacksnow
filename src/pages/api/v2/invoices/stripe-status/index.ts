import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripe = require('stripe')(process.env.NEXT_PRIVATE_STRIPE_SECRET || process.env.STRIPE_SECRET_KEY);

function getStringValue(value: unknown): string | undefined {
    if (Array.isArray(value)) {
        const first = value[0];
        return first === undefined || first === null ? undefined : String(first);
    }

    if (value === undefined || value === null) return undefined;

    return String(value);
}

function getPaymentIntentId(paymentIntent: any): string | undefined {
    if (!paymentIntent) return undefined;

    if (typeof paymentIntent === 'string') {
        return paymentIntent;
    }

    return paymentIntent.id;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const invoiceIdParam = getStringValue(req.query.invoiceId);
        const sessionId = getStringValue(req.query.session_id);

        if (!invoiceIdParam && !sessionId) {
            return res.status(400).json({
                message: 'invoiceId or session_id is required',
            });
        }

        /**
         * OPTION 1:
         * Check Stripe Checkout Session directly.
         * This is the strongest check because it verifies payment_status from Stripe.
         */
        if (sessionId) {
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent'],
            });

            const invoiceIdFromStripe = session.metadata?.invoiceId;

            if (!invoiceIdFromStripe) {
                return res.status(400).json({
                    message: 'invoiceId missing from Stripe session metadata',
                    stripePaymentStatus: session.payment_status,
                    stripeSessionId: session.id,
                });
            }

            const invoiceId = Number(invoiceIdFromStripe);

            if (!Number.isFinite(invoiceId)) {
                return res.status(400).json({
                    message: 'Invalid invoiceId in Stripe session metadata',
                });
            }

            const invoice = await prisma.invoice.findUnique({
                where: { id: invoiceId },
            });

            if (!invoice) {
                return res.status(404).json({
                    message: 'Invoice not found',
                });
            }

            const paymentIntentId = getPaymentIntentId(session.payment_intent);

            let updatedInvoice = invoice;

            if (session.payment_status === 'paid' && !invoice.paid) {
                updatedInvoice = await prisma.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        paid: true,
                        transactionId: invoice.transactionId || paymentIntentId || session.id,
                    },
                });
            }

            return res.status(200).json({
                message: 'Stripe invoice payment status retrieved',
                invoiceId,
                paid: updatedInvoice.paid,
                invoice: updatedInvoice,
                stripeSessionId: session.id,
                stripePaymentStatus: session.payment_status,
                stripePaymentIntentId: paymentIntentId,
            });
        }

        /**
         * OPTION 2:
         * Check status from your database by invoiceId.
         * This returns your local invoice paid status.
         */
        const invoiceId = Number(invoiceIdParam);

        if (!Number.isFinite(invoiceId)) {
            return res.status(400).json({
                message: 'Invalid invoiceId',
            });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                auth: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        adminStripeConnectId: true,
                        adminStripeConnectIdStatus: true,
                    },
                },
                Contract: true,
            },
        });

        if (!invoice) {
            return res.status(404).json({
                message: 'Invoice not found',
            });
        }

        return res.status(200).json({
            message: 'Invoice payment status retrieved',
            invoiceId: invoice.id,
            paid: invoice.paid,
            transactionId: invoice.transactionId,
            invoice,
        });
    } catch (error: any) {
        console.error('Error in /api/invoices/stripe-status:', error);

        return res.status(500).json({
            message: 'Internal server error',
            error: error?.message,
        });
    }
}
