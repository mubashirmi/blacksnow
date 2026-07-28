// /pages/api/invoices/stripe-refund.ts

import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

type StripeRefundReason = 'duplicate' | 'fraudulent' | 'requested_by_customer';

type ChargeWithConnectFields = Stripe.Charge & {
    transfer?: string | { id: string } | null;
    application_fee?: string | { id: string } | null;
    application_fee_amount?: number | null;
};

function getStripeClient(): Stripe {
    const stripeSecret = process.env.NEXT_PRIVATE_STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
        throw new Error('Stripe secret key is missing');
    }

    return new Stripe(stripeSecret);
}

function getStringValue(value: unknown): string | undefined {
    if (Array.isArray(value)) {
        const first = value[0];

        return first === undefined || first === null ? undefined : String(first);
    }

    if (value === undefined || value === null) {
        return undefined;
    }

    return String(value);
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
    if (value === undefined || value === null) {
        return fallback;
    }

    const normalized = String(value).trim().toLowerCase();

    if (['true', '1', 'yes'].includes(normalized)) {
        return true;
    }

    if (['false', '0', 'no'].includes(normalized)) {
        return false;
    }

    return fallback;
}

function getId(value: unknown): string | undefined {
    if (!value) {
        return undefined;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string') {
        return value.id;
    }

    return undefined;
}

function unixToDate(value: unknown): Date | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return undefined;
    }

    return new Date(value * 1000);
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription | null): number | undefined {
    if (!subscription) {
        return undefined;
    }

    const currentPeriodEnd = (
        subscription as Stripe.Subscription & {
            current_period_end?: number;
        }
    ).current_period_end;

    return typeof currentPeriodEnd === 'number' ? currentPeriodEnd : undefined;
}

const zeroDecimalCurrencies = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);

function toStripeAmount(amount: number, currency: string): number {
    const normalizedCurrency = currency.toLowerCase();

    if (zeroDecimalCurrencies.has(normalizedCurrency)) {
        return Math.round(amount);
    }

    return Math.round(amount * 100);
}

function parseReason(value: string | undefined): StripeRefundReason | undefined {
    if (!value) {
        return undefined;
    }

    const normalized = value.trim().toLowerCase();

    if (['duplicate', 'fraudulent', 'requested_by_customer'].includes(normalized)) {
        return normalized as StripeRefundReason;
    }

    return undefined;
}

function parseRefundAmount(params: { amountRaw?: string; amountInSmallestUnitRaw?: string; currency: string }): number | undefined {
    if (params.amountInSmallestUnitRaw !== undefined) {
        const parsed = Number(params.amountInSmallestUnitRaw);

        if (!Number.isInteger(parsed) || parsed <= 0) {
            throw new Error('Invalid amountInSmallestUnit');
        }

        return parsed;
    }

    if (params.amountRaw !== undefined) {
        const parsed = Number(params.amountRaw.replace(/,/g, '').trim());

        if (!Number.isFinite(parsed) || parsed <= 0) {
            throw new Error('Invalid amount');
        }

        return toStripeAmount(parsed, params.currency);
    }

    return undefined;
}

/**
 * Calculates the amount before service and platform fees.
 *
 * Priority:
 * 1. Stored baseAmount
 * 2. totalAmount minus stored fee amounts
 * 3. Calculate from the stored fee percentages
 * 4. Fall back to totalAmount for older records
 */
function getFeeExcludedRefundableTotal(params: {
    baseAmount: number;
    totalAmount: number;
    serviceFeeAmount: number;
    platformFeeAmount: number;
    serviceFeePercent: number;
    platformFeePercent: number;
}): number {
    if (Number.isInteger(params.baseAmount) && params.baseAmount > 0) {
        return params.baseAmount;
    }

    const serviceFeeAmount = Math.max(params.serviceFeeAmount || 0, 0);

    const platformFeeAmount = Math.max(params.platformFeeAmount || 0, 0);

    const storedFees = serviceFeeAmount + platformFeeAmount;

    if (params.totalAmount > 0 && storedFees > 0) {
        return Math.max(params.totalAmount - storedFees, 0);
    }

    const serviceFeePercent = Number.isFinite(params.serviceFeePercent) && params.serviceFeePercent >= 0 ? params.serviceFeePercent : 0;

    const platformFeePercent = Number.isFinite(params.platformFeePercent) && params.platformFeePercent >= 0 ? params.platformFeePercent : 0;

    const totalFeePercent = serviceFeePercent + platformFeePercent;

    if (params.totalAmount > 0 && totalFeePercent > 0) {
        return Math.round(params.totalAmount / (1 + totalFeePercent / 100));
    }

    return Math.max(params.totalAmount || 0, 0);
}

async function getLatestSubscriptionPaymentIntentId(stripe: Stripe, subscriptionId: string): Promise<string | undefined> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent'],
    });

    const latestInvoice = typeof subscription.latest_invoice === 'object' && subscription.latest_invoice !== null ? subscription.latest_invoice : null;

    if (!latestInvoice) {
        return undefined;
    }

    const paymentIntent = (
        latestInvoice as Stripe.Invoice & {
            payment_intent?: string | Stripe.PaymentIntent | null;
        }
    ).payment_intent;

    return getId(paymentIntent);
}

async function getPaymentIntentCharge(
    stripe: Stripe,
    paymentIntentId: string
): Promise<{
    paymentIntentId: string;
    charge: Stripe.Charge;
}> {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['latest_charge'],
    });

    const chargeId = getId(paymentIntent.latest_charge);

    if (!chargeId) {
        throw new Error('Stripe PaymentIntent does not have a refundable charge');
    }

    const charge =
        typeof paymentIntent.latest_charge === 'object' && paymentIntent.latest_charge !== null
            ? paymentIntent.latest_charge
            : await stripe.charges.retrieve(chargeId);

    return {
        paymentIntentId: paymentIntent.id,
        charge,
    };
}

function getChargeConnectSupport(charge: Stripe.Charge): {
    chargeHasTransfer: boolean;
    chargeHasApplicationFee: boolean;
} {
    const connectCharge = charge as ChargeWithConnectFields;

    const transferId = getId(connectCharge.transfer);

    const applicationFeeId = getId(connectCharge.application_fee);

    const applicationFeeAmount = typeof connectCharge.application_fee_amount === 'number' ? connectCharge.application_fee_amount : 0;

    return {
        chargeHasTransfer: Boolean(transferId),

        chargeHasApplicationFee: Boolean(applicationFeeId) || applicationFeeAmount > 0,
    };
}

async function cancelStripeSubscription(params: {
    stripe: Stripe;
    subscriptionId: string;
    invoiceId: number;
    cancelAtPeriodEnd: boolean;
}): Promise<Stripe.Subscription> {
    const { stripe, subscriptionId, invoiceId, cancelAtPeriodEnd } = params;

    if (cancelAtPeriodEnd) {
        return stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
            metadata: {
                invoiceId: String(invoiceId),
                type: 'invoice_subscription_cancel_at_period_end',
            },
        });
    }

    return stripe.subscriptions.cancel(subscriptionId);
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);

        return res.status(405).json({
            message: 'Method not allowed',
        });
    }

    try {
        const stripe = getStripeClient();

        const invoiceIdRaw = getStringValue(req.body?.invoiceId ?? req.query.invoiceId);

        const paymentIntentIdRaw = getStringValue(req.body?.paymentIntentId ?? req.query.paymentIntentId);

        const amountRaw = getStringValue(req.body?.amount ?? req.query.amount);

        const amountInSmallestUnitRaw = getStringValue(req.body?.amountInSmallestUnit ?? req.query.amountInSmallestUnit);

        const reasonRaw = getStringValue(req.body?.reason ?? req.query.reason);

        const createdByAuthIdRaw = getStringValue(req.body?.createdByAuthId ?? req.query.createdByAuthId);

        const requestedRefundApplicationFee = parseBoolean(req.body?.refundApplicationFee ?? req.query.refundApplicationFee, true);

        const requestedReverseTransfer = parseBoolean(req.body?.reverseTransfer ?? req.query.reverseTransfer, true);

        const cancelSubscription = parseBoolean(req.body?.cancelSubscription ?? req.query.cancelSubscription, false);

        const cancelAtPeriodEnd = parseBoolean(req.body?.cancelAtPeriodEnd ?? req.query.cancelAtPeriodEnd, false);

        if (!invoiceIdRaw) {
            return res.status(400).json({
                message: 'invoiceId is required',
            });
        }

        const invoiceId = Number(invoiceIdRaw);

        if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
            return res.status(400).json({
                message: 'Invalid invoiceId',
            });
        }

        let createdByAuthId: number | undefined;

        if (createdByAuthIdRaw !== undefined) {
            const parsedCreatedByAuthId = Number(createdByAuthIdRaw);

            if (!Number.isInteger(parsedCreatedByAuthId) || parsedCreatedByAuthId <= 0) {
                return res.status(400).json({
                    message: 'Invalid createdByAuthId',
                });
            }

            createdByAuthId = parsedCreatedByAuthId;
        }

        const reason = parseReason(reasonRaw);

        if (reasonRaw !== undefined && reason === undefined) {
            return res.status(400).json({
                message: 'Invalid reason. Use duplicate, fraudulent, or requested_by_customer',
            });
        }

        const invoice = await prisma.invoice.findUnique({
            where: {
                id: invoiceId,
            },
        });

        if (!invoice) {
            return res.status(404).json({
                message: 'Invoice not found',
            });
        }

        let latestSubscriptionPaymentIntentId: string | undefined;

        if (invoice.stripeSubscriptionId) {
            latestSubscriptionPaymentIntentId = await getLatestSubscriptionPaymentIntentId(stripe, invoice.stripeSubscriptionId);
        }

        const paymentIntentId = paymentIntentIdRaw || latestSubscriptionPaymentIntentId || invoice.stripePaymentIntentId;

        if (!paymentIntentId) {
            return res.status(400).json({
                message: 'No refundable Stripe paymentIntent found for this invoice',
            });
        }

        let paymentState: {
            paymentIntentId: string;
            charge: Stripe.Charge;
        };

        try {
            paymentState = await getPaymentIntentCharge(stripe, paymentIntentId);
        } catch (error: unknown) {
            return res.status(400).json({
                message: getErrorMessage(error),
            });
        }

        const charge = paymentState.charge;

        if (!charge.paid) {
            return res.status(400).json({
                message: 'Stripe charge is not paid',
                paymentIntentId: paymentState.paymentIntentId,
                chargeId: charge.id,
            });
        }

        const currency = (charge.currency || invoice.currency || process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

        /*
         * Maximum refundable customer amount before fees.
         */
        const configuredFeeExcludedTotal = getFeeExcludedRefundableTotal({
            baseAmount: invoice.baseAmount,

            totalAmount: invoice.totalAmount,

            serviceFeeAmount: invoice.serviceFeeAmount,

            platformFeeAmount: invoice.platformFeeAmount,

            serviceFeePercent: invoice.serviceFeePercent,

            platformFeePercent: invoice.platformFeePercent,
        });

        if (configuredFeeExcludedTotal <= 0) {
            return res.status(400).json({
                message: 'No fee-excluded refundable amount is available',
            });
        }

        const feeExcludedRefundableTotal = Math.min(configuredFeeExcludedTotal, charge.amount);

        const alreadyRefundedOnCharge = charge.amount_refunded || 0;

        const remainingFeeExcludedRefundable = Math.max(feeExcludedRefundableTotal - alreadyRefundedOnCharge, 0);

        if (remainingFeeExcludedRefundable <= 0) {
            return res.status(400).json({
                message: 'The fee-excluded invoice amount has already been fully refunded',

                feeExcludedRefundableTotal,
                alreadyRefundedOnCharge,
                remainingFeeExcludedRefundable,

                serviceFeeAmount: invoice.serviceFeeAmount,

                platformFeeAmount: invoice.platformFeeAmount,
            });
        }

        let requestedAmount: number | undefined;

        try {
            requestedAmount = parseRefundAmount({
                amountRaw,
                amountInSmallestUnitRaw,
                currency,
            });
        } catch (error: unknown) {
            return res.status(400).json({
                message: getErrorMessage(error),
            });
        }

        /*
         * No amount means refund the remaining base amount,
         * excluding the service and platform fees.
         */
        const amountToRefund = requestedAmount ?? remainingFeeExcludedRefundable;

        if (amountToRefund > remainingFeeExcludedRefundable) {
            return res.status(400).json({
                message: 'Refund amount exceeds the remaining fee-excluded refundable amount',

                amountToRefund,
                feeExcludedRefundableTotal,
                alreadyRefundedOnCharge,
                remainingFeeExcludedRefundable,

                serviceFeeAmount: invoice.serviceFeeAmount,

                platformFeeAmount: invoice.platformFeeAmount,
            });
        }

        const connectSupport = getChargeConnectSupport(charge);

        const appliedReverseTransfer = (requestedReverseTransfer || requestedRefundApplicationFee) && connectSupport.chargeHasTransfer;

        const appliedRefundApplicationFee = requestedRefundApplicationFee && connectSupport.chargeHasApplicationFee;

        const refundParams: Stripe.RefundCreateParams = {
            payment_intent: paymentState.paymentIntentId,

            /*
             * Explicit amount prevents the service and platform
             * fees from being included in the customer refund.
             */
            amount: amountToRefund,

            metadata: {
                invoiceId: String(invoice.id),

                paymentIntentId: paymentState.paymentIntentId,

                chargeId: charge.id,

                type: 'invoice_refund',

                feeExcludedRefund: 'true',

                refundableBaseAmount: String(feeExcludedRefundableTotal),

                serviceFeePercent: String(invoice.serviceFeePercent),

                platformFeePercent: String(invoice.platformFeePercent),

                serviceFeeAmount: String(invoice.serviceFeeAmount),

                platformFeeAmount: String(invoice.platformFeeAmount),
            },
        };

        if (reason) {
            refundParams.reason = reason;
        }

        /*
         * Only include Connect options if the original
         * charge supports them.
         */
        if (appliedReverseTransfer) {
            refundParams.reverse_transfer = true;
        }

        if (appliedRefundApplicationFee) {
            refundParams.refund_application_fee = true;
        }

        const refund = await stripe.refunds.create(refundParams);

        const updatedCharge = await stripe.charges.retrieve(charge.id);

        const feeExcludedFullyRefunded = updatedCharge.amount_refunded >= feeExcludedRefundableTotal;

        /*
         * Find the InvoicePayment associated with the refunded
         * Stripe PaymentIntent or Stripe Charge.
         */
        const matchingInvoicePayment = await prisma.invoicePayment.findFirst({
            where: {
                invoiceId: invoice.id,
                OR: [
                    {
                        stripePaymentIntentId: paymentState.paymentIntentId,
                    },
                    {
                        stripeChargeId: charge.id,
                    },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
            },
        });

        let subscriptionResult: Stripe.Subscription | null = null;

        let cancellationError: unknown | null = null;

        if (cancelSubscription) {
            if (!invoice.stripeSubscriptionId) {
                cancellationError = new Error('Invoice does not have a Stripe subscription to cancel');
            } else {
                try {
                    subscriptionResult = await cancelStripeSubscription({
                        stripe,

                        subscriptionId: invoice.stripeSubscriptionId,

                        invoiceId: invoice.id,

                        cancelAtPeriodEnd,
                    });
                } catch (error: unknown) {
                    cancellationError = error;
                }
            }
        }

        const refundedAmount = refund.amount || amountToRefund;

        const calculatedRefundedAmount = (invoice.refundedAmount || 0) + refundedAmount;

        const nextRefundedAmount =
            invoice.paymentType === 'one_time' ? Math.min(calculatedRefundedAmount, feeExcludedRefundableTotal) : calculatedRefundedAmount;

        const fullyRefunded = invoice.paymentType === 'one_time' && feeExcludedFullyRefunded;

        const currentPeriodEnd = getCurrentPeriodEnd(subscriptionResult);

        /*
         * Update Invoice and save InvoiceRefund together.
         */
        const databaseResult = await prisma.$transaction(async (transaction) => {
            const invoiceRefund = await transaction.invoiceRefund.upsert({
                where: {
                    stripeRefundId: refund.id,
                },

                create: {
                    invoiceId: invoice.id,

                    invoicePaymentId: matchingInvoicePayment?.id ?? null,

                    currency: refund.currency || currency,

                    amount: refundedAmount,

                    stripeRefundId: refund.id,

                    stripePaymentIntentId: paymentState.paymentIntentId,

                    stripeChargeId: updatedCharge.id,

                    stripeSubscriptionId: subscriptionResult?.id || invoice.stripeSubscriptionId,

                    status: refund.status || 'created',

                    reason: refund.reason || reason || null,

                    reverseTransfer: appliedReverseTransfer,

                    refundApplicationFee: appliedRefundApplicationFee,

                    cancelSubscription,

                    cancelAtPeriodEnd: cancelSubscription && cancelAtPeriodEnd,

                    createdByAuthId: createdByAuthId ?? null,
                },

                update: {
                    currency: refund.currency || currency,

                    amount: refundedAmount,

                    stripePaymentIntentId: paymentState.paymentIntentId,

                    stripeChargeId: updatedCharge.id,

                    stripeSubscriptionId: subscriptionResult?.id || invoice.stripeSubscriptionId,

                    status: refund.status || 'created',

                    reason: refund.reason || reason || null,

                    reverseTransfer: appliedReverseTransfer,

                    refundApplicationFee: appliedRefundApplicationFee,

                    cancelSubscription,

                    cancelAtPeriodEnd: cancelSubscription && cancelAtPeriodEnd,

                    ...(matchingInvoicePayment
                        ? {
                              invoicePaymentId: matchingInvoicePayment.id,
                          }
                        : {}),

                    ...(createdByAuthId !== undefined
                        ? {
                              createdByAuthId,
                          }
                        : {}),
                },
            });

            const updatedInvoice = await transaction.invoice.update({
                where: {
                    id: invoice.id,
                },

                data: {
                    refundedAmount: nextRefundedAmount,

                    refunded: fullyRefunded || invoice.refunded,

                    stripeLatestRefundId: refund.id,

                    stripeRefundStatus: refund.status || 'created',

                    refundedAt: new Date(),

                    paid: fullyRefunded ? false : invoice.paid,

                    stripeSubscriptionStatus: subscriptionResult?.status || invoice.stripeSubscriptionStatus,

                    stripeCurrentPeriodEnd: unixToDate(currentPeriodEnd) || invoice.stripeCurrentPeriodEnd,

                    stripeCancelAtPeriodEnd: subscriptionResult?.cancel_at_period_end ?? invoice.stripeCancelAtPeriodEnd,

                    subscriptionCanceledAt: subscriptionResult?.status === 'canceled' ? new Date() : invoice.subscriptionCanceledAt,
                },
            });

            return {
                invoiceRefund,
                updatedInvoice,
            };
        });

        /*
         * Preserve the behavior where a successfully created
         * refund can still return an error if subscription
         * cancellation could not be completed.
         *
         * The refund is now safely stored before returning.
         */
        if (cancellationError) {
            const missingSubscription = !invoice.stripeSubscriptionId;

            return res.status(missingSubscription ? 400 : 500).json({
                message: missingSubscription ? 'Invoice does not have a Stripe subscription to cancel' : 'Refund created, but subscription cancellation failed',

                cancellationError: getErrorMessage(cancellationError),

                invoiceId: invoice.id,

                refundId: refund.id,

                refundStatus: refund.status,

                refundedAmount,

                invoiceRefund: databaseResult.invoiceRefund,

                invoice: databaseResult.updatedInvoice,
            });
        }

        return res.status(200).json({
            message: 'Refund created successfully',

            invoiceId: invoice.id,

            refundId: refund.id,

            refundStatus: refund.status,

            refundedAmount,

            currency,

            invoicePaymentId: matchingInvoicePayment?.id ?? null,

            invoiceRefund: databaseResult.invoiceRefund,

            feeExclusion: {
                stripeChargeAmount: updatedCharge.amount,

                refundableBaseAmount: feeExcludedRefundableTotal,

                serviceFeePercent: invoice.serviceFeePercent,

                platformFeePercent: invoice.platformFeePercent,

                serviceFeeAmount: invoice.serviceFeeAmount,

                platformFeeAmount: invoice.platformFeeAmount,

                amountRefundedOnCharge: updatedCharge.amount_refunded,

                remainingFeeExcludedRefundable: Math.max(feeExcludedRefundableTotal - updatedCharge.amount_refunded, 0),

                feeExcludedFullyRefunded,
            },

            requestedReverseTransfer,

            reverseTransfer: appliedReverseTransfer,

            requestedRefundApplicationFee,

            refundApplicationFee: appliedRefundApplicationFee,

            canceledSubscription: Boolean(subscriptionResult),

            subscription: subscriptionResult
                ? {
                      id: subscriptionResult.id,

                      status: subscriptionResult.status,

                      cancel_at_period_end: subscriptionResult.cancel_at_period_end,

                      current_period_end: currentPeriodEnd ?? null,
                  }
                : null,

            invoice: databaseResult.updatedInvoice,
        });
    } catch (error: unknown) {
        console.error('Error in /api/invoices/stripe-refund:', error);

        return res.status(500).json({
            message: 'Internal server error',

            error: getErrorMessage(error),
        });
    }
}
