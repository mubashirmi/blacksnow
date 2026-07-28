// /pages/api/v2/checkout-refund.ts

import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

type StripeRefundReason = 'duplicate' | 'fraudulent' | 'requested_by_customer';

type StripeObjectWithId = {
    id: string;
};

type ChargeWithConnectFields = Stripe.Charge & {
    transfer?: string | StripeObjectWithId | null;
    application_fee?: string | StripeObjectWithId | null;
    application_fee_amount?: number | null;
};

const zeroDecimalCurrencies = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);

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

function getStripeId(value: unknown): string | undefined {
    if (!value) {
        return undefined;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'object' && value !== null) {
        const objectValue = value as {
            id?: unknown;
        };

        if (typeof objectValue.id === 'string') {
            return objectValue.id;
        }
    }

    return undefined;
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

function getErrorStatus(error: unknown): number {
    if (typeof error !== 'object' || error === null) {
        return 500;
    }

    const statusCode = (
        error as {
            statusCode?: unknown;
        }
    ).statusCode;

    if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
        return statusCode;
    }

    return 500;
}

function isStripeResourceMissing(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
        return false;
    }

    return 'code' in error && error.code === 'resource_missing';
}

function parseRefundReason(value: string | undefined): StripeRefundReason | undefined {
    if (!value) {
        return undefined;
    }

    const normalized = value.trim().toLowerCase();

    if (['duplicate', 'fraudulent', 'requested_by_customer'].includes(normalized)) {
        return normalized as StripeRefundReason;
    }

    return undefined;
}

function toStripeAmount(amount: number, currency: string): number {
    const normalizedCurrency = currency.toLowerCase();

    if (zeroDecimalCurrencies.has(normalizedCurrency)) {
        return Math.round(amount);
    }

    return Math.round(amount * 100);
}

function parseRefundAmount(params: { amountRaw?: string; amountInSmallestUnitRaw?: string; currency: string }): number | undefined {
    const { amountRaw, amountInSmallestUnitRaw, currency } = params;

    if (amountInSmallestUnitRaw !== undefined) {
        const parsed = Number(amountInSmallestUnitRaw);

        if (!Number.isInteger(parsed) || parsed <= 0) {
            throw new Error('Invalid amountInSmallestUnit');
        }

        return parsed;
    }

    if (amountRaw !== undefined) {
        const parsed = Number(amountRaw.replace(/,/g, '').trim());

        if (!Number.isFinite(parsed) || parsed <= 0) {
            throw new Error('Invalid refund amount');
        }

        return toStripeAmount(parsed, currency);
    }

    return undefined;
}

function getChargeConnectSupport(charge: Stripe.Charge): {
    transferId?: string;
    applicationFeeId?: string;
    applicationFeeAmount: number;
    chargeHasTransfer: boolean;
    chargeHasApplicationFee: boolean;
} {
    const connectCharge = charge as ChargeWithConnectFields;

    const transferId = getStripeId(connectCharge.transfer);

    const applicationFeeId = getStripeId(connectCharge.application_fee);

    const applicationFeeAmount = typeof connectCharge.application_fee_amount === 'number' ? connectCharge.application_fee_amount : 0;

    return {
        transferId,
        applicationFeeId,
        applicationFeeAmount,
        chargeHasTransfer: Boolean(transferId),
        chargeHasApplicationFee: Boolean(applicationFeeId) || applicationFeeAmount > 0,
    };
}

async function resolvePaymentIntentCharge(
    stripe: Stripe,
    paymentIntentId: string
): Promise<{
    paymentIntentId: string;
    charge: Stripe.Charge;
}> {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['latest_charge'],
    });

    const chargeId = getStripeId(paymentIntent.latest_charge);

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

async function resolveSubscriptionCharge(
    stripe: Stripe,
    subscriptionId: string
): Promise<{
    paymentIntentId: string;
    charge: Stripe.Charge;
}> {
    const subscription: any = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent', 'latest_invoice.payment_intent.latest_charge'],
    });

    const latestInvoice = typeof subscription.latest_invoice === 'object' && subscription.latest_invoice !== null ? subscription.latest_invoice : null;

    const paymentIntent = latestInvoice?.payment_intent;

    const paymentIntentId = getStripeId(paymentIntent);

    if (!paymentIntentId) {
        throw new Error('Stripe subscription does not have a refundable latest payment');
    }

    if (typeof paymentIntent === 'object' && paymentIntent !== null) {
        const chargeId = getStripeId(paymentIntent.latest_charge);

        if (!chargeId) {
            throw new Error('Subscription PaymentIntent does not have a refundable charge');
        }

        const charge =
            typeof paymentIntent.latest_charge === 'object' && paymentIntent.latest_charge !== null
                ? paymentIntent.latest_charge
                : await stripe.charges.retrieve(chargeId);

        return {
            paymentIntentId,
            charge,
        };
    }

    return resolvePaymentIntentCharge(stripe, paymentIntentId);
}

async function resolveStripePayment(params: { stripe: Stripe; transactionId?: string | null; paymentIntentId?: string; chargeId?: string }): Promise<{
    paymentIntentId?: string;
    charge: Stripe.Charge;
}> {
    const { stripe, transactionId, paymentIntentId, chargeId } = params;

    if (chargeId) {
        const charge = await stripe.charges.retrieve(chargeId);

        return {
            paymentIntentId: getStripeId(charge.payment_intent),
            charge,
        };
    }

    if (paymentIntentId) {
        return resolvePaymentIntentCharge(stripe, paymentIntentId);
    }

    if (!transactionId) {
        throw new Error('Checkout does not have a Stripe transactionId');
    }

    if (transactionId.startsWith('pi_')) {
        return resolvePaymentIntentCharge(stripe, transactionId);
    }

    if (transactionId.startsWith('ch_')) {
        const charge = await stripe.charges.retrieve(transactionId);

        return {
            paymentIntentId: getStripeId(charge.payment_intent),
            charge,
        };
    }

    if (transactionId.startsWith('sub_')) {
        return resolveSubscriptionCharge(stripe, transactionId);
    }

    if (transactionId.startsWith('cs_')) {
        const session: any = await stripe.checkout.sessions.retrieve(transactionId, {
            expand: ['payment_intent', 'payment_intent.latest_charge', 'subscription'],
        });

        const sessionPaymentIntentId = getStripeId(session.payment_intent);

        if (sessionPaymentIntentId) {
            return resolvePaymentIntentCharge(stripe, sessionPaymentIntentId);
        }

        const subscriptionId = getStripeId(session.subscription);

        if (subscriptionId) {
            return resolveSubscriptionCharge(stripe, subscriptionId);
        }

        throw new Error('Stripe Checkout Session does not have a refundable payment');
    }

    throw new Error('transactionId must be a Stripe PaymentIntent, Charge, Checkout Session, or Subscription ID');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    /*
     * Return stored refund history.
     */
    if (req.method === 'GET') {
        try {
            const checkoutIdRaw = getStringValue(req.query.checkoutId ?? req.query.id);

            if (!checkoutIdRaw) {
                return res.status(400).json({
                    message: 'checkoutId is required',
                });
            }

            const checkoutId = Number(checkoutIdRaw);

            if (!Number.isInteger(checkoutId) || checkoutId <= 0) {
                return res.status(400).json({
                    message: 'Invalid checkoutId',
                });
            }

            const checkout = await prisma.checkout.findUnique({
                where: {
                    id: checkoutId,
                },
                include: {
                    refunds: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
            });

            if (!checkout) {
                return res.status(404).json({
                    message: 'Checkout not found',
                });
            }

            return res.status(200).json({
                message: 'Checkout refund history retrieved',
                checkoutId: checkout.id,
                checkout,
                refunds: checkout.refunds,
            });
        } catch (error: unknown) {
            console.error('Error retrieving checkout refunds:', error);

            return res.status(500).json({
                message: 'Internal server error',
                error: getErrorMessage(error),
            });
        }
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['GET', 'POST']);

        return res.status(405).json({
            message: 'Method not allowed',
        });
    }

    try {
        const stripe = getStripeClient();

        const checkoutIdRaw = getStringValue(req.body?.checkoutId ?? req.query.checkoutId ?? req.body?.id ?? req.query.id);

        const paymentIntentIdRaw = getStringValue(req.body?.paymentIntentId ?? req.query.paymentIntentId);

        const chargeIdRaw = getStringValue(req.body?.chargeId ?? req.query.chargeId);

        const amountRaw = getStringValue(req.body?.amount ?? req.query.amount);

        const amountInSmallestUnitRaw = getStringValue(req.body?.amountInSmallestUnit ?? req.query.amountInSmallestUnit);

        const reasonRaw = getStringValue(req.body?.reason ?? req.query.reason);

        /*
         * These are requested options.
         * They are only applied if the Stripe charge
         * supports them.
         */
        const requestedRefundApplicationFee = parseBoolean(req.body?.refundApplicationFee ?? req.query.refundApplicationFee, true);

        const requestedReverseTransfer = parseBoolean(req.body?.reverseTransfer ?? req.query.reverseTransfer, true);

        if (!checkoutIdRaw) {
            return res.status(400).json({
                message: 'checkoutId is required',
            });
        }

        const checkoutId = Number(checkoutIdRaw);

        if (!Number.isInteger(checkoutId) || checkoutId <= 0) {
            return res.status(400).json({
                message: 'Invalid checkoutId',
            });
        }

        const reason = parseRefundReason(reasonRaw);

        if (reasonRaw !== undefined && reason === undefined) {
            return res.status(400).json({
                message: 'Invalid reason. Use duplicate, fraudulent, or requested_by_customer',
            });
        }

        const checkout = await prisma.checkout.findUnique({
            where: {
                id: checkoutId,
            },
        });

        if (!checkout) {
            return res.status(404).json({
                message: 'Checkout not found',
            });
        }

        if (!checkout.paid) {
            return res.status(400).json({
                message: 'Checkout is not marked as paid',
            });
        }

        let resolvedPayment: {
            paymentIntentId?: string;
            charge: Stripe.Charge;
        };

        try {
            resolvedPayment = await resolveStripePayment({
                stripe,
                transactionId: checkout.transactionId,
                paymentIntentId: paymentIntentIdRaw,
                chargeId: chargeIdRaw,
            });
        } catch (error: unknown) {
            if (isStripeResourceMissing(error)) {
                return res.status(404).json({
                    message: 'Stripe payment resource not found',
                    error: getErrorMessage(error),
                });
            }

            return res.status(400).json({
                message: getErrorMessage(error),
            });
        }

        const charge = resolvedPayment.charge;

        if (!charge.paid) {
            return res.status(400).json({
                message: 'Stripe charge is not paid',
                chargeId: charge.id,
            });
        }

        if (charge.refunded) {
            return res.status(400).json({
                message: 'Stripe charge is already fully refunded',
                chargeId: charge.id,
                chargeAmount: charge.amount,
                amountRefunded: charge.amount_refunded,
            });
        }

        const currency = charge.currency.toLowerCase();

        let amountToRefund: number | undefined;

        try {
            amountToRefund = parseRefundAmount({
                amountRaw,
                amountInSmallestUnitRaw,
                currency,
            });
        } catch (error: unknown) {
            return res.status(400).json({
                message: getErrorMessage(error),
            });
        }

        const remainingRefundable = Math.max(charge.amount - charge.amount_refunded, 0);

        if (remainingRefundable <= 0) {
            return res.status(400).json({
                message: 'No refundable amount remains',
                chargeId: charge.id,
            });
        }

        if (amountToRefund !== undefined && amountToRefund > remainingRefundable) {
            return res.status(400).json({
                message: 'Refund amount exceeds remaining refundable amount',
                amountToRefund,
                remainingRefundable,
                currency,
            });
        }

        const connectSupport = getChargeConnectSupport(charge);

        /*
         * Only apply Connect refund options when
         * the original charge supports them.
         */
        const appliedReverseTransfer = requestedReverseTransfer && connectSupport.chargeHasTransfer;

        const appliedRefundApplicationFee = requestedRefundApplicationFee && connectSupport.chargeHasApplicationFee;

        const refundParams: Stripe.RefundCreateParams = {
            charge: charge.id,
            metadata: {
                checkoutId: String(checkout.id),
                authId: String(checkout.AuthId),
                product: checkout.product || '',
                paymentIntentId: resolvedPayment.paymentIntentId || '',
                type: 'checkout_refund',
            },
        };

        if (amountToRefund !== undefined) {
            refundParams.amount = amountToRefund;
        }

        if (reason) {
            refundParams.reason = reason;
        }

        /*
         * Do not send these properties as false.
         * Only include them when supported and applied.
         */
        if (appliedReverseTransfer) {
            refundParams.reverse_transfer = true;
        }

        if (appliedRefundApplicationFee) {
            refundParams.refund_application_fee = true;
        }

        const refund = await stripe.refunds.create(refundParams);

        const updatedCharge = await stripe.charges.retrieve(charge.id);

        const amountRefundedTotal = updatedCharge.amount_refunded;

        const nextRemainingRefundable = Math.max(updatedCharge.amount - amountRefundedTotal, 0);

        const fullyRefunded = updatedCharge.refunded || amountRefundedTotal >= updatedCharge.amount;

        const failureReason = (
            refund as Stripe.Refund & {
                failure_reason?: string | null;
            }
        ).failure_reason;

        const databaseResult = await prisma.$transaction(async (transaction) => {
            const checkoutRefund = await transaction.checkoutRefund.upsert({
                where: {
                    stripeRefundId: refund.id,
                },
                create: {
                    checkoutId: checkout.id,

                    currency: refund.currency || currency,

                    amount: refund.amount,

                    chargeAmount: updatedCharge.amount,

                    amountRefundedTotal,

                    remainingRefundable: nextRemainingRefundable,

                    fullyRefunded,

                    stripeRefundId: refund.id,

                    stripePaymentIntentId: resolvedPayment.paymentIntentId,

                    stripeChargeId: updatedCharge.id,

                    sourceTransactionId: checkout.transactionId,

                    status: refund.status || 'created',

                    reason: refund.reason || reason || null,

                    failureReason: failureReason || null,

                    /*
                     * Store what was actually
                     * applied to Stripe.
                     */
                    reverseTransfer: appliedReverseTransfer,

                    refundApplicationFee: appliedRefundApplicationFee,
                },
                update: {
                    currency: refund.currency || currency,

                    amount: refund.amount,

                    chargeAmount: updatedCharge.amount,

                    amountRefundedTotal,

                    remainingRefundable: nextRemainingRefundable,

                    fullyRefunded,

                    stripePaymentIntentId: resolvedPayment.paymentIntentId,

                    stripeChargeId: updatedCharge.id,

                    status: refund.status || 'created',

                    reason: refund.reason || reason || null,

                    failureReason: failureReason || null,

                    reverseTransfer: appliedReverseTransfer,

                    refundApplicationFee: appliedRefundApplicationFee,
                },
            });

            const updatedCheckout = await transaction.checkout.update({
                where: {
                    id: checkout.id,
                },
                data: {
                    /*
                     * A partial refund remains paid.
                     * A full refund becomes unpaid.
                     */
                    paid: fullyRefunded ? false : checkout.paid,
                },
            });

            return {
                checkoutRefund,
                updatedCheckout,
            };
        });

        return res.status(200).json({
            message: fullyRefunded ? 'Checkout payment fully refunded' : 'Checkout payment partially refunded',

            checkoutId: checkout.id,

            refundId: databaseResult.checkoutRefund.id,

            stripeRefundId: refund.id,

            connectRefundOptions: {
                requestedReverseTransfer,
                appliedReverseTransfer,
                chargeHasTransfer: connectSupport.chargeHasTransfer,
                transferId: connectSupport.transferId || null,

                requestedRefundApplicationFee,
                appliedRefundApplicationFee,
                chargeHasApplicationFee: connectSupport.chargeHasApplicationFee,
                applicationFeeId: connectSupport.applicationFeeId || null,
                applicationFeeAmount: connectSupport.applicationFeeAmount,
            },

            refund: databaseResult.checkoutRefund,

            checkout: databaseResult.updatedCheckout,
        });
    } catch (error: unknown) {
        console.error('Error in /api/v2/checkout-refund:', error);

        return res.status(getErrorStatus(error)).json({
            message: getErrorStatus(error) === 500 ? 'Internal server error' : 'Stripe refund request failed',
            error: getErrorMessage(error),
        });
    }
}
