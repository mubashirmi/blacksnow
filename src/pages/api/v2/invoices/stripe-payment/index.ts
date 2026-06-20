import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = require('stripe')(process.env.NEXT_PRIVATE_STRIPE_SECRET);

function getBaseUrl(req: NextApiRequest): string {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

    if (envUrl) {
        return envUrl.replace(/\/$/, '');
    }

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;

    return `${protocol}://${host}`;
}

function getStringValue(value: unknown): string | undefined {
    if (Array.isArray(value)) {
        const first = value[0];
        return first === undefined || first === null ? undefined : String(first);
    }

    if (value === undefined || value === null) return undefined;

    return String(value);
}

function parseInvoicePrice(price: string): number {
    const cleaned = price.replace(/,/g, '').trim();
    const match = cleaned.match(/(\d+(\.\d+)?)/);

    if (!match) {
        throw new Error('Invalid invoice price');
    }

    const amount = Number(match[1]);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Invalid invoice price');
    }

    return amount;
}

const zeroDecimalCurrencies = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);

function toStripeAmount(amount: number, currency: string): number {
    const normalizedCurrency = currency.toLowerCase();

    if (zeroDecimalCurrencies.has(normalizedCurrency)) {
        return Math.round(amount);
    }

    return Math.round(amount * 100);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const invoiceIdRaw = getStringValue(req.body?.invoiceId ?? req.query.invoiceId);
        const currencyRaw = getStringValue(req.body?.currency ?? req.query.currency);

        if (!invoiceIdRaw) {
            return res.status(400).json({
                message: 'invoiceId is required',
            });
        }

        const invoiceId = Number(invoiceIdRaw);

        if (!Number.isFinite(invoiceId)) {
            return res.status(400).json({
                message: 'Invalid invoiceId',
            });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                auth: true,
                Contract: true,
            },
        });

        if (!invoice) {
            return res.status(404).json({
                message: 'Invoice not found',
            });
        }

        if (invoice.paid) {
            return res.status(400).json({
                message: 'Invoice is already paid',
            });
        }

        if (!invoice.authId) {
            return res.status(400).json({
                message: 'Invoice does not have authId',
            });
        }

        const auth =
            invoice.auth ||
            (await prisma.auth.findUnique({
                where: { id: invoice.authId },
            }));

        if (!auth) {
            return res.status(404).json({
                message: 'Auth not found for this invoice authId',
            });
        }

        if (!auth.adminStripeConnectId) {
            return res.status(400).json({
                message: 'Auth does not have a Stripe Connect account',
            });
        }

        if (!auth.adminStripeConnectIdStatus) {
            return res.status(400).json({
                message: 'Stripe Connect account is not active/verified',
            });
        }

        const currency = (currencyRaw || process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

        const amount = parseInvoicePrice(invoice.price);
        const unitAmount = toStripeAmount(amount, currency);

        if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
            return res.status(400).json({
                message: 'Invalid invoice amount',
            });
        }

        const baseUrl = getBaseUrl(req);

        const successUrl = `${baseUrl}/api/invoices/stripe-success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/invoice-payment-cancel?invoiceId=${invoice.id}`;

        const connectedAccountId = auth.adminStripeConnectId;

        const productName = invoice.businessName || invoice.name || invoice.Contract?.contractName || `Invoice #${invoice.id}`;

        const paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData = {
            transfer_data: {
                destination: connectedAccountId,
            },
            metadata: {
                invoiceId: String(invoice.id),
                authId: String(invoice.authId),
                type: 'invoice_payment',
            },
        };

        if (process.env.STRIPE_USE_ON_BEHALF_OF === 'true') {
            paymentIntentData.on_behalf_of = connectedAccountId;
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: invoice.email || undefined,
            line_items: [
                {
                    price_data: {
                        currency,
                        unit_amount: unitAmount,
                        product_data: {
                            name: productName,
                            description: `Invoice #${invoice.id}`,
                        },
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: paymentIntentData,
            metadata: {
                invoiceId: String(invoice.id),
                authId: String(invoice.authId),
                connectedAccountId,
                type: 'invoice_payment',
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return res.status(200).json({
            message: 'Stripe checkout session created',
            sessionId: session.id,
            url: session.url,
            invoiceId: invoice.id,
            amount,
            unitAmount,
            currency,
            connectedAccountId,
        });
    } catch (e: any) {
        console.error('Error in /api/invoices/stripe-payment:', e);

        return res.status(500).json({
            message: 'Internal server error',
            error: e?.message,
        });
    }
}
