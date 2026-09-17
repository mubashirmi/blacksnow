import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

type PaymentType = 'one_time' | 'subscription';
type SubscriptionInterval = 'month';

const DEFAULT_SERVICE_FEE_PERCENT = Number(process.env.INVOICE_SERVICE_FEE_PERCENT || 0);
const DEFAULT_PLATFORM_FEE_PERCENT = Number(process.env.INVOICE_PLATFORM_FEE_PERCENT || 8);

function getStripeClient() {
    const stripeSecret = process.env.NEXT_PRIVATE_STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
        throw new Error('Stripe secret key is missing');
    }

    return new Stripe(stripeSecret);
}

function getHeaderString(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
}

function getBaseUrl(req: NextApiRequest): string {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

    if (envUrl) {
        return envUrl.replace(/\/$/, '');
    }

    const protocol = getHeaderString(req.headers['x-forwarded-proto']) || 'http';
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

function parsePaymentType(value: string | undefined): PaymentType | undefined {
    if (value === undefined) return undefined;

    const normalized = value.trim().toLowerCase();

    if (['one_time', 'one-time', 'onetime', 'single', 'once', 'payment'].includes(normalized)) {
        return 'one_time';
    }

    if (['subscription', 'monthly', 'recurring'].includes(normalized)) {
        return 'subscription';
    }

    return undefined;
}

function parseSubscriptionInterval(value: string | undefined): SubscriptionInterval | undefined {
    if (value === undefined) return undefined;

    const normalized = value.trim().toLowerCase();

    if (normalized === 'month' || normalized === 'monthly') {
        return 'month';
    }

    return undefined;
}

function safePercent(value: unknown, fallback: number): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        return fallback;
    }

    return parsed;
}

function calculateInvoiceFeeAmounts(params: { baseAmount: number; serviceFeePercent: number; platformFeePercent: number }) {
    const serviceFeeAmount = Math.round((params.baseAmount * params.serviceFeePercent) / 100);
    const platformFeeAmount = Math.round((params.baseAmount * params.platformFeePercent) / 100);
    const applicationFeeAmount = serviceFeeAmount + platformFeeAmount;
    const totalAmount = params.baseAmount + applicationFeeAmount;

    return {
        serviceFeeAmount,
        platformFeeAmount,
        applicationFeeAmount,
        totalAmount,
    };
}

function getSubscriptionApplicationFeePercent(applicationFeeAmount: number, totalAmount: number): number {
    if (totalAmount <= 0) return 0;

    return Number(((applicationFeeAmount / totalAmount) * 100).toFixed(2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const stripe = getStripeClient();

        const invoiceIdRaw = getStringValue(req.body?.invoiceId ?? req.query.invoiceId);
        const currencyRaw = getStringValue(req.body?.currency ?? req.query.currency);

        // This is the user's actual payment choice.
        const paymentTypeRaw = getStringValue(req.body?.paymentType ?? req.query.paymentType);
        const subscriptionIntervalRaw = getStringValue(req.body?.subscriptionInterval ?? req.query.subscriptionInterval);

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

        const parsedPaymentType = parsePaymentType(paymentTypeRaw);

        if (paymentTypeRaw !== undefined && parsedPaymentType === undefined) {
            return res.status(400).json({
                message: 'Invalid paymentType. Use one_time or subscription',
            });
        }

        // Backward compatible:
        // If frontend does not send paymentType, old behavior stays one_time.
        const paymentType: PaymentType = parsedPaymentType || 'one_time';

        if (invoice.paid && paymentType === 'one_time') {
            return res.status(400).json({
                message: 'Invoice is already paid',
            });
        }

        if (
            paymentType === 'subscription' &&
            invoice.stripeSubscriptionId &&
            ['active', 'trialing', 'past_due'].includes(invoice.stripeSubscriptionStatus || '')
        ) {
            return res.status(400).json({
                message: 'Invoice already has a Stripe subscription',
                stripeSubscriptionId: invoice.stripeSubscriptionId,
                stripeSubscriptionStatus: invoice.stripeSubscriptionStatus,
            });
        }

        if (invoice.authId === null || invoice.authId === undefined) {
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

        const parsedSubscriptionInterval = parseSubscriptionInterval(subscriptionIntervalRaw);

        if (subscriptionIntervalRaw !== undefined && parsedSubscriptionInterval === undefined) {
            return res.status(400).json({
                message: 'Invalid subscriptionInterval. For now use month',
            });
        }

        const subscriptionInterval = parsedSubscriptionInterval || 'month';

        const currency = (currencyRaw || invoice.currency || process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

        const amount = parseInvoicePrice(invoice.price);
        const baseAmount = toStripeAmount(amount, currency);

        const serviceFeePercent = safePercent(invoice.serviceFeePercent, DEFAULT_SERVICE_FEE_PERCENT);
        const platformFeePercent = safePercent(invoice.platformFeePercent, DEFAULT_PLATFORM_FEE_PERCENT);

        const { serviceFeeAmount, platformFeeAmount, applicationFeeAmount, totalAmount } = calculateInvoiceFeeAmounts({
            baseAmount,
            serviceFeePercent,
            platformFeePercent,
        });

        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return res.status(400).json({
                message: 'Invalid invoice total amount',
            });
        }

        if (applicationFeeAmount >= totalAmount) {
            return res.status(400).json({
                message: 'Application fee must be less than total amount',
            });
        }

        const baseUrl = getBaseUrl(req);

        const successUrl = `${baseUrl}/invoicepaymentsuccess?session_id={CHECKOUT_SESSION_ID}&invoiceId=${invoice.id}`;
        const cancelUrl = `${baseUrl}/invoice-payment-cancel?invoiceId=${invoice.id}`;

        const connectedAccountId = auth.adminStripeConnectId;
        const productName = invoice.businessName || invoice.name || invoice.Contract?.contractName || `Invoice #${invoice.id}`;

        const metadata = {
            invoiceId: String(invoice.id),
            authId: String(invoice.authId),
            connectedAccountId,
            type: 'invoice_payment',
            paymentType,
            currency,
            baseAmount: String(baseAmount),
            serviceFeePercent: String(serviceFeePercent),
            platformFeePercent: String(platformFeePercent),
            serviceFeeAmount: String(serviceFeeAmount),
            platformFeeAmount: String(platformFeeAmount),
            applicationFeeAmount: String(applicationFeeAmount),
            totalAmount: String(totalAmount),
        };

        const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency,
                unit_amount: totalAmount,
                product_data: {
                    name: productName,
                    description: `Invoice #${invoice.id}`,
                },
                ...(paymentType === 'subscription'
                    ? {
                          recurring: {
                              interval: subscriptionInterval,
                              interval_count: 1,
                          },
                      }
                    : {}),
            },
            quantity: 1,
        };

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: paymentType === 'subscription' ? 'subscription' : 'payment',
            payment_method_types: ['card'],
            customer_email: invoice.email || undefined,
            line_items: [lineItem],
            metadata,
            success_url: successUrl,
            cancel_url: cancelUrl,
        };

        if (paymentType === 'subscription') {
            const subscriptionApplicationFeePercent = getSubscriptionApplicationFeePercent(applicationFeeAmount, totalAmount);

            sessionParams.subscription_data = {
                metadata,
                description: `Invoice #${invoice.id}`,
                application_fee_percent: subscriptionApplicationFeePercent,
                transfer_data: {
                    destination: connectedAccountId,
                },
            };

            if (process.env.STRIPE_USE_ON_BEHALF_OF === 'true') {
                sessionParams.subscription_data.on_behalf_of = connectedAccountId;
            }
        } else {
            sessionParams.payment_intent_data = {
                transfer_data: {
                    destination: connectedAccountId,
                },
                application_fee_amount: applicationFeeAmount,
                metadata,
            };

            if (process.env.STRIPE_USE_ON_BEHALF_OF === 'true') {
                sessionParams.payment_intent_data.on_behalf_of = connectedAccountId;
            }
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                paymentType,
                subscriptionInterval,
                currency,
                baseAmount,
                serviceFeePercent,
                platformFeePercent,
                serviceFeeAmount,
                platformFeeAmount,
                applicationFeeAmount,
                totalAmount,
                stripeCheckoutSessionId: session.id,
            },
        });

        return res.status(200).json({
            message: paymentType === 'subscription' ? 'Stripe subscription checkout session created' : 'Stripe one-time checkout session created',
            sessionId: session.id,
            url: session.url,
            invoiceId: invoice.id,
            paymentType,
            subscriptionInterval: paymentType === 'subscription' ? subscriptionInterval : undefined,
            amount,
            currency,
            baseAmount,
            serviceFeePercent,
            platformFeePercent,
            serviceFeeAmount,
            platformFeeAmount,
            applicationFeeAmount,
            totalAmount,
            connectedAccountId,
            invoice: updatedInvoice,
        });
    } catch (e: any) {
        console.error('Error in /api/invoices/stripe-payment:', e);

        return res.status(500).json({
            message: 'Internal server error',
            error: e?.message,
        });
    }
}
