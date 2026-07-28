// /pages/api/subscription-invoices/stripe-refund.ts

import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

type StripeRefundReason = 'duplicate' | 'fraudulent' | 'requested_by_customer';

type PaymentIntentRefundState = {
    paymentIntentId: string;
    charge: Stripe.Charge;
};

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
 * Returns the maximum refundable amount after excluding
 * service and platform fees.
 *
 * All values use Stripe's smallest currency unit.
 */
function getFeeExcludedRefundableTotal(params: {
    baseAmount: number;
    totalAmount: number;
    serviceFeeAmount: number;
    platformFeeAmount: number;
    serviceFeePercent: number;
    platformFeePercent: number;
}): number {
    // Preferred value: amount before fees.
    if (Number.isInteger(params.baseAmount) && params.baseAmount > 0) {
        return params.baseAmount;
    }

    // Fallback for records with stored fee amounts.
    const storedFeeAmount = Math.max(params.serviceFeeAmount || 0, 0) + Math.max(params.platformFeeAmount || 0, 0);

    if (params.totalAmount > 0 && storedFeeAmount > 0) {
        return Math.max(params.totalAmount - storedFeeAmount, 0);
    }

    // Fallback for records with percentages only.
    const serviceFeePercent = Number.isFinite(params.serviceFeePercent) && params.serviceFeePercent >= 0 ? params.serviceFeePercent : 0;

    const platformFeePercent = Number.isFinite(params.platformFeePercent) && params.platformFeePercent >= 0 ? params.platformFeePercent : 0;

    const totalFeePercent = serviceFeePercent + platformFeePercent;

    if (params.totalAmount > 0 && totalFeePercent > 0) {
        return Math.round(params.totalAmount / (1 + totalFeePercent / 100));
    }

    // Compatibility for records with no fee information.
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

async function getPaymentIntentRefundState(stripe: Stripe, paymentIntentId: string): Promise<PaymentIntentRefundState> {
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
    subscriptionInvId: number;
    cancelAtPeriodEnd: boolean;
}): Promise<Stripe.Subscription> {
    const { stripe, subscriptionId, subscriptionInvId, cancelAtPeriodEnd } = params;

    if (cancelAtPeriodEnd) {
        return stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
            metadata: {
                subscriptionInvId: String(subscriptionInvId),
                type: 'subscription_inv_cancel_at_period_end',
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

        /*
         * subscriptionInvId is preferred.
         * invoiceId remains accepted for compatibility.
         */
        const subscriptionInvIdRaw = getStringValue(req.body?.subscriptionInvId ?? req.query.subscriptionInvId ?? req.body?.invoiceId ?? req.query.invoiceId);

        const paymentIntentIdRaw = getStringValue(req.body?.paymentIntentId ?? req.query.paymentIntentId);

        const amountRaw = getStringValue(req.body?.amount ?? req.query.amount);

        const amountInSmallestUnitRaw = getStringValue(req.body?.amountInSmallestUnit ?? req.query.amountInSmallestUnit);

        const reasonRaw = getStringValue(req.body?.reason ?? req.query.reason);

        const createdByAuthIdRaw = getStringValue(req.body?.createdByAuthId ?? req.query.createdByAuthId);

        const requestedRefundApplicationFee = parseBoolean(req.body?.refundApplicationFee ?? req.query.refundApplicationFee, true);

        const requestedReverseTransfer = parseBoolean(req.body?.reverseTransfer ?? req.query.reverseTransfer, true);

        const cancelSubscription = parseBoolean(req.body?.cancelSubscription ?? req.query.cancelSubscription, false);

        const cancelAtPeriodEnd = parseBoolean(req.body?.cancelAtPeriodEnd ?? req.query.cancelAtPeriodEnd, false);

        if (!subscriptionInvIdRaw) {
            return res.status(400).json({
                message: 'subscriptionInvId is required',
            });
        }

        const subscriptionInvId = Number(subscriptionInvIdRaw);

        if (!Number.isInteger(subscriptionInvId) || subscriptionInvId <= 0) {
            return res.status(400).json({
                message: 'Invalid subscriptionInvId',
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

        const subscriptionInv = await prisma.subscriptionInv.findUnique({
            where: {
                id: subscriptionInvId,
            },
        });

        if (!subscriptionInv) {
            return res.status(404).json({
                message: 'Subscription invoice not found',
            });
        }

        let latestSubscriptionPaymentIntentId: string | undefined;

        if (subscriptionInv.stripeSubscriptionId) {
            latestSubscriptionPaymentIntentId = await getLatestSubscriptionPaymentIntentId(stripe, subscriptionInv.stripeSubscriptionId);
        }

        const paymentIntentId = paymentIntentIdRaw || latestSubscriptionPaymentIntentId || subscriptionInv.stripePaymentIntentId;

        if (!paymentIntentId) {
            return res.status(400).json({
                message: 'No refundable Stripe paymentIntent found for this subscription invoice',
            });
        }

        let paymentState: PaymentIntentRefundState;

        try {
            paymentState = await getPaymentIntentRefundState(stripe, paymentIntentId);
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

        const currency = (charge.currency || subscriptionInv.currency || process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

        /*
         * Calculate the amount before service and platform fees.
         */
        const configuredFeeExcludedTotal = getFeeExcludedRefundableTotal({
            baseAmount: subscriptionInv.baseAmount,

            totalAmount: subscriptionInv.totalAmount,

            serviceFeeAmount: subscriptionInv.serviceFeeAmount,

            platformFeeAmount: subscriptionInv.platformFeeAmount,

            serviceFeePercent: subscriptionInv.serviceFeePercent,

            platformFeePercent: subscriptionInv.platformFeePercent,
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
                message: 'The fee-excluded amount has already been fully refunded',

                feeExcludedRefundableTotal,
                alreadyRefundedOnCharge,
                remainingFeeExcludedRefundable,

                serviceFeeAmount: subscriptionInv.serviceFeeAmount,

                platformFeeAmount: subscriptionInv.platformFeeAmount,
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
         * When no amount is provided, refund the remaining
         * base amount rather than the full Stripe charge.
         */
        const amountToRefund = requestedAmount ?? remainingFeeExcludedRefundable;

        if (amountToRefund > remainingFeeExcludedRefundable) {
            return res.status(400).json({
                message: 'Refund amount exceeds the remaining fee-excluded refundable amount',

                amountToRefund,
                feeExcludedRefundableTotal,
                alreadyRefundedOnCharge,
                remainingFeeExcludedRefundable,

                serviceFeeAmount: subscriptionInv.serviceFeeAmount,

                platformFeeAmount: subscriptionInv.platformFeeAmount,
            });
        }

        const connectSupport = getChargeConnectSupport(charge);

        const appliedReverseTransfer = (requestedReverseTransfer || requestedRefundApplicationFee) && connectSupport.chargeHasTransfer;

        const appliedRefundApplicationFee = requestedRefundApplicationFee && connectSupport.chargeHasApplicationFee;

        const refundParams: Stripe.RefundCreateParams = {
            payment_intent: paymentState.paymentIntentId,

            // Explicit amount excludes service/platform fees.
            amount: amountToRefund,

            metadata: {
                subscriptionInvId: String(subscriptionInv.id),

                paymentIntentId: paymentState.paymentIntentId,

                chargeId: charge.id,

                type: 'subscription_inv_refund',

                feeExcludedRefund: 'true',

                baseAmount: String(feeExcludedRefundableTotal),

                serviceFeeAmount: String(subscriptionInv.serviceFeeAmount),

                platformFeeAmount: String(subscriptionInv.platformFeeAmount),
            },
        };

        if (reason) {
            refundParams.reason = reason;
        }

        /*
         * Only send Connect refund options when supported
         * by the original Stripe charge.
         */
        if (appliedReverseTransfer) {
            refundParams.reverse_transfer = true;
        }

        if (appliedRefundApplicationFee) {
            refundParams.refund_application_fee = true;
        }

        const refund = await stripe.refunds.create(refundParams);

        /*
         * Retrieve the updated Stripe charge.
         */
        const updatedPaymentState = await getPaymentIntentRefundState(stripe, paymentState.paymentIntentId);

        const updatedCharge = updatedPaymentState.charge;

        const feeExcludedFullyRefunded = updatedCharge.amount_refunded >= feeExcludedRefundableTotal;

        /*
         * Find the SubscriptionInvPayment associated with
         * this PaymentIntent or Charge.
         */
        const matchingSubscriptionInvPayment = await prisma.subscriptionInvPayment.findFirst({
            where: {
                subscriptionInvId: subscriptionInv.id,

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
            if (!subscriptionInv.stripeSubscriptionId) {
                cancellationError = new Error('Subscription invoice does not have a Stripe subscription to cancel');
            } else {
                try {
                    subscriptionResult = await cancelStripeSubscription({
                        stripe,

                        subscriptionId: subscriptionInv.stripeSubscriptionId,

                        subscriptionInvId: subscriptionInv.id,

                        cancelAtPeriodEnd,
                    });
                } catch (error: unknown) {
                    cancellationError = error;
                }
            }
        }

        const refundedAmount = refund.amount || amountToRefund;

        const calculatedRefundedAmount = (subscriptionInv.refundedAmount || 0) + refundedAmount;

        /*
         * One-time payments cannot store more refunded amount
         * than the fee-excluded base amount.
         */
        const nextRefundedAmount =
            subscriptionInv.paymentType === 'one_time' ? Math.min(calculatedRefundedAmount, feeExcludedRefundableTotal) : calculatedRefundedAmount;

        const fullyRefunded = subscriptionInv.paymentType === 'one_time' && feeExcludedFullyRefunded;

        const currentPeriodEnd = getCurrentPeriodEnd(subscriptionResult);

        /*
         * Save SubscriptionInvRefund and update
         * SubscriptionInv in the same database transaction.
         */
        const databaseResult = await prisma.$transaction(async (transaction) => {
            const subscriptionInvRefund = await transaction.subscriptionInvRefund.upsert({
                where: {
                    stripeRefundId: refund.id,
                },

                create: {
                    subscriptionInvId: subscriptionInv.id,

                    subscriptionInvPaymentId: matchingSubscriptionInvPayment?.id ?? null,

                    currency: refund.currency || currency,

                    amount: refundedAmount,

                    stripeRefundId: refund.id,

                    stripePaymentIntentId: paymentState.paymentIntentId,

                    stripeChargeId: updatedCharge.id,

                    stripeSubscriptionId: subscriptionResult?.id || subscriptionInv.stripeSubscriptionId,

                    status: refund.status || 'created',

                    reason: refund.reason || reason || null,

                    /*
                     * Store what was actually sent
                     * and applied to Stripe.
                     */
                    reverseTransfer: appliedReverseTransfer,

                    refundApplicationFee: appliedRefundApplicationFee,

                    cancelSubscription,

                    cancelAtPeriodEnd: cancelSubscription && cancelAtPeriodEnd,

                    createdByAuthId: createdByAuthId ?? null,
                },

                update: {
                    subscriptionInvPaymentId: matchingSubscriptionInvPayment?.id ?? undefined,

                    currency: refund.currency || currency,

                    amount: refundedAmount,

                    stripePaymentIntentId: paymentState.paymentIntentId,

                    stripeChargeId: updatedCharge.id,

                    stripeSubscriptionId: subscriptionResult?.id || subscriptionInv.stripeSubscriptionId,

                    status: refund.status || 'created',

                    reason: refund.reason || reason || null,

                    reverseTransfer: appliedReverseTransfer,

                    refundApplicationFee: appliedRefundApplicationFee,

                    cancelSubscription,

                    cancelAtPeriodEnd: cancelSubscription && cancelAtPeriodEnd,

                    ...(createdByAuthId !== undefined
                        ? {
                              createdByAuthId,
                          }
                        : {}),
                },
            });

            const updatedSubscriptionInv = await transaction.subscriptionInv.update({
                where: {
                    id: subscriptionInv.id,
                },

                data: {
                    refundedAmount: nextRefundedAmount,

                    refunded: fullyRefunded || subscriptionInv.refunded,

                    stripeLatestRefundId: refund.id,

                    stripeRefundStatus: refund.status || 'created',

                    refundedAt: new Date(),

                    /*
                     * One-time invoices become unpaid
                     * when the fee-excluded base amount
                     * has been fully refunded.
                     */
                    paid: fullyRefunded ? false : subscriptionInv.paid,

                    stripeSubscriptionStatus: subscriptionResult?.status || subscriptionInv.stripeSubscriptionStatus,

                    stripeCurrentPeriodEnd: unixToDate(currentPeriodEnd) || subscriptionInv.stripeCurrentPeriodEnd,

                    stripeCancelAtPeriodEnd: subscriptionResult?.cancel_at_period_end ?? subscriptionInv.stripeCancelAtPeriodEnd,

                    subscriptionCanceledAt: subscriptionResult?.status === 'canceled' ? new Date() : subscriptionInv.subscriptionCanceledAt,
                },
            });

            return {
                subscriptionInvRefund,
                updatedSubscriptionInv,
            };
        });

        /*
         * Preserve the existing response behavior when the
         * refund succeeds but cancellation fails.
         *
         * The refund is stored before returning the error.
         */
        if (cancellationError) {
            const missingSubscription = !subscriptionInv.stripeSubscriptionId;

            return res.status(missingSubscription ? 400 : 500).json({
                message: missingSubscription
                    ? 'Subscription invoice does not have a Stripe subscription to cancel'
                    : 'Refund created, but subscription cancellation failed',

                cancellationError: getErrorMessage(cancellationError),

                subscriptionInvId: subscriptionInv.id,

                refundId: refund.id,

                refundStatus: refund.status,

                refundedAmount,

                subscriptionInvPaymentId: matchingSubscriptionInvPayment?.id ?? null,

                subscriptionInvRefund: databaseResult.subscriptionInvRefund,

                subscriptionInv: databaseResult.updatedSubscriptionInv,
            });
        }

        return res.status(200).json({
            message: 'Refund created successfully',

            subscriptionInvId: subscriptionInv.id,

            refundId: refund.id,

            refundStatus: refund.status,

            refundedAmount,

            currency,

            subscriptionInvPaymentId: matchingSubscriptionInvPayment?.id ?? null,

            /*
             * Complete stored refund row.
             */
            subscriptionInvRefund: databaseResult.subscriptionInvRefund,

            feeExclusion: {
                stripeChargeAmount: updatedCharge.amount,

                baseAmount: feeExcludedRefundableTotal,

                serviceFeePercent: subscriptionInv.serviceFeePercent,

                platformFeePercent: subscriptionInv.platformFeePercent,

                serviceFeeAmount: subscriptionInv.serviceFeeAmount,

                platformFeeAmount: subscriptionInv.platformFeeAmount,

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

            subscriptionInv: databaseResult.updatedSubscriptionInv,
        });
    } catch (error: unknown) {
        console.error('Error in /api/subscription-invoices/stripe-refund:', error);

        return res.status(500).json({
            message: 'Internal server error',

            error: getErrorMessage(error),
        });
    }
}
