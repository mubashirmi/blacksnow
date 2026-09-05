import { EmailOverageChargeStatus, Prisma } from '@prisma/client';
import Stripe from 'stripe';

import { syncEmailUsageFromHistory } from '@/lib/emailUsage';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

/**
 * IMPORTANT:
 *
 * Don't use BigInt literal syntax such as:
 *
 * 10_000n
 * 0n
 *
 * because the project currently targets an ECMAScript version
 * lower than ES2020.
 *
 * Using BigInt(...) preserves exactly the same behavior.
 */
const ZERO_BIGINT = BigInt(0);
const MICROS_PER_CENT = BigInt(10_000);

// Stripe USD minimum = $0.50
const MINIMUM_STRIPE_CHARGE_CENTS = 50;

// Stripe amount fields have practical upper limits.
// This also prevents accidental gigantic charges.
const MAXIMUM_CHARGE_CENTS = 99_999_999;

type UsageForBilling = {
    id: number;
    count: number;
    includedLimit: number;
    overageRateMicros: number;
    overageBilledMicros: bigint;
};

function getUtcBillingDate(date = new Date()) {
    return date.toISOString().slice(0, 10);
}

function getPendingMicros(usage: UsageForBilling): bigint {
    const overageEmails = Math.max(usage.count - usage.includedLimit, 0);

    const totalOverageMicros = BigInt(overageEmails) * BigInt(usage.overageRateMicros);

    if (totalOverageMicros <= usage.overageBilledMicros) {
        return ZERO_BIGINT;
    }

    return totalOverageMicros - usage.overageBilledMicros;
}

function mapPaymentIntentStatus(status: Stripe.PaymentIntent.Status): EmailOverageChargeStatus {
    switch (status) {
        case 'succeeded':
            return EmailOverageChargeStatus.SUCCEEDED;

        case 'processing':
            return EmailOverageChargeStatus.PROCESSING;

        case 'requires_action':
            return EmailOverageChargeStatus.REQUIRES_ACTION;

        case 'requires_payment_method':
        case 'canceled':
            return EmailOverageChargeStatus.FAILED;

        default:
            return EmailOverageChargeStatus.PENDING;
    }
}

function getExpandableId(value: string | { id: string } | null | undefined): string | null {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        return value;
    }

    return value.id;
}

/**
 * Finds the card/payment method that should be used
 * for automatic off-session overage charges.
 *
 * Priority:
 * 1. Customer.invoice_settings.default_payment_method
 * 2. Active subscription.default_payment_method
 */
export async function getDefaultPaymentMethodId(customerId: string): Promise<string | null> {
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
        return null;
    }

    const customerDefault = getExpandableId(customer.invoice_settings.default_payment_method as string | Stripe.PaymentMethod | null);

    if (customerDefault) {
        return customerDefault;
    }

    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 20,
    });

    const preferredSubscription = subscriptions.data.find((subscription) => {
        return ['active', 'trialing', 'past_due', 'unpaid'].includes(subscription.status) && subscription.default_payment_method;
    });

    const subscriptionPaymentMethod = getExpandableId(preferredSubscription?.default_payment_method as string | Stripe.PaymentMethod | null | undefined);

    if (!subscriptionPaymentMethod) {
        return null;
    }

    // Save it onto Customer so future overage billing
    // doesn't have to search subscriptions again.
    await stripe.customers.update(customerId, {
        invoice_settings: {
            default_payment_method: subscriptionPaymentMethod,
        },
    });

    return subscriptionPaymentMethod;
}

/**
 * Applies the successfully charged dollar amount
 * against EmailUsage rows.
 *
 * Important:
 * This uses monetary micro-units, not email count,
 * because $0.005 is half a cent.
 */
export async function applySuccessfulEmailOverageCharge(chargeId: number, stripePaymentIntentId: string) {
    // Serializable transaction prevents two webhook/cron
    // workers from applying the same payment twice.
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await prisma.$transaction(
                async (tx) => {
                    const charge = await tx.emailOverageCharge.findUnique({
                        where: {
                            id: chargeId,
                        },
                    });

                    if (!charge) {
                        throw new Error(`EmailOverageCharge ${chargeId} not found`);
                    }

                    // Already applied.
                    // Webhook/cron can safely call again.
                    if (charge.usageAppliedAt) {
                        return;
                    }

                    let remaining = charge.coveredMicros;

                    const usages = await tx.emailUsage.findMany({
                        where: {
                            authId: charge.authId,
                        },
                        orderBy: [
                            {
                                month: 'asc',
                            },
                            {
                                id: 'asc',
                            },
                        ],
                    });

                    for (const usage of usages) {
                        if (remaining <= ZERO_BIGINT) {
                            break;
                        }

                        const pending = getPendingMicros(usage);

                        if (pending <= ZERO_BIGINT) {
                            continue;
                        }

                        const allocation = pending < remaining ? pending : remaining;

                        await tx.emailUsage.update({
                            where: {
                                id: usage.id,
                            },
                            data: {
                                overageBilledMicros: {
                                    increment: allocation,
                                },
                            },
                        });

                        remaining -= allocation;
                    }

                    if (remaining > ZERO_BIGINT) {
                        throw new Error(`Cannot allocate ${remaining.toString()} micros for overage charge ${charge.id}`);
                    }

                    const now = new Date();

                    await tx.emailOverageCharge.update({
                        where: {
                            id: charge.id,
                        },
                        data: {
                            status: EmailOverageChargeStatus.SUCCEEDED,

                            stripePaymentIntentId,

                            failureCode: null,

                            failureMessage: null,

                            chargedAt: now,

                            usageAppliedAt: now,
                        },
                    });
                },
                {
                    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                }
            );

            return;
        } catch (error) {
            const isRetryableTransactionError = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';

            if (isRetryableTransactionError && attempt < 3) {
                continue;
            }

            throw error;
        }
    }
}

/**
 * Creates today's billing record.
 *
 * Does NOT charge Stripe yet.
 */
async function createDailyCharge(authId: number, billingDate: string) {
    const existing = await prisma.emailOverageCharge.findUnique({
        where: {
            authId_billingDate: {
                authId,
                billingDate,
            },
        },
    });

    if (existing) {
        return existing;
    }

    const usages = await prisma.emailUsage.findMany({
        where: {
            authId,
        },
        select: {
            id: true,
            count: true,
            includedLimit: true,
            overageRateMicros: true,
            overageBilledMicros: true,
        },
    });

    let pendingMicros = ZERO_BIGINT;

    for (const usage of usages) {
        pendingMicros += getPendingMicros(usage);
    }

    /**
     * Stripe can only charge whole cents.
     *
     * Example:
     *
     * $0.505
     *
     * pendingMicros = 505000
     *
     * 505000 / 10000
     * = 50 cents
     *
     * Stripe receives $0.50.
     *
     * The remaining $0.005 stays pending.
     */
    let amountCents = Number(pendingMicros / MICROS_PER_CENT);

    if (amountCents < MINIMUM_STRIPE_CHARGE_CENTS) {
        return null;
    }

    amountCents = Math.min(amountCents, MAXIMUM_CHARGE_CENTS);

    const coveredMicros = BigInt(amountCents) * MICROS_PER_CENT;

    const idempotencyKey = `email-overage:${authId}:${billingDate}`;

    try {
        return await prisma.emailOverageCharge.create({
            data: {
                authId,
                billingDate,
                amountCents,
                coveredMicros,
                idempotencyKey,
                status: EmailOverageChargeStatus.PENDING,
            },
        });
    } catch (error) {
        // Another cron request could have created
        // the exact daily charge simultaneously.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return prisma.emailOverageCharge.findUnique({
                where: {
                    authId_billingDate: {
                        authId,
                        billingDate,
                    },
                },
            });
        }

        throw error;
    }
}

async function saveStripePaymentError(chargeId: number, paymentMethodId: string | null, error: unknown) {
    const stripeError = error as Stripe.errors.StripeError & {
        payment_intent?: Stripe.PaymentIntent;
    };

    const paymentIntent = stripeError.payment_intent;

    if (paymentIntent && paymentIntent.status === 'succeeded') {
        await applySuccessfulEmailOverageCharge(chargeId, paymentIntent.id);

        return {
            status: 'succeeded' as const,
            paymentIntentId: paymentIntent.id,
        };
    }

    const status = paymentIntent ? mapPaymentIntentStatus(paymentIntent.status) : EmailOverageChargeStatus.FAILED;

    await prisma.emailOverageCharge.update({
        where: {
            id: chargeId,
        },
        data: {
            status,

            stripePaymentIntentId: paymentIntent?.id,

            stripePaymentMethodId: paymentMethodId,

            failureCode: stripeError.code || stripeError.type || 'STRIPE_ERROR',

            failureMessage: stripeError.message || 'Stripe payment failed',
        },
    });

    return {
        status: status === EmailOverageChargeStatus.REQUIRES_ACTION ? ('requires_action' as const) : ('failed' as const),

        paymentIntentId: paymentIntent?.id || null,
    };
}

/**
 * Attempts a single EmailOverageCharge.
 */
export async function processEmailOverageCharge(chargeId: number) {
    let charge = await prisma.emailOverageCharge.findUnique({
        where: {
            id: chargeId,
        },
    });

    if (!charge) {
        throw new Error(`Overage charge ${chargeId} not found`);
    }

    if (charge.status === EmailOverageChargeStatus.SUCCEEDED && charge.usageAppliedAt) {
        return {
            status: 'succeeded' as const,
        };
    }

    const auth = await prisma.auth.findUnique({
        where: {
            id: charge.authId,
        },
        select: {
            id: true,
            email: true,
            stripeCustomerId: true,
        },
    });

    if (!auth) {
        throw new Error(`Auth ${charge.authId} not found`);
    }

    if (!auth.stripeCustomerId) {
        await prisma.emailOverageCharge.update({
            where: {
                id: charge.id,
            },
            data: {
                status: EmailOverageChargeStatus.FAILED,

                failureCode: 'NO_STRIPE_CUSTOMER',

                failureMessage: 'User does not have a Stripe customer.',
            },
        });

        return {
            status: 'failed' as const,

            reason: 'no_stripe_customer',
        };
    }

    const paymentMethodId = await getDefaultPaymentMethodId(auth.stripeCustomerId);

    if (!paymentMethodId) {
        await prisma.emailOverageCharge.update({
            where: {
                id: charge.id,
            },
            data: {
                status: EmailOverageChargeStatus.FAILED,

                failureCode: 'NO_DEFAULT_PAYMENT_METHOD',

                failureMessage: 'No reusable default payment method found.',
            },
        });

        return {
            status: 'failed' as const,

            reason: 'no_payment_method',
        };
    }

    /**
     * If we've already created a PaymentIntent,
     * inspect it before creating anything else.
     */
    if (charge.stripePaymentIntentId) {
        try {
            const existingIntent = await stripe.paymentIntents.retrieve(charge.stripePaymentIntentId);

            if (existingIntent.status === 'succeeded') {
                await applySuccessfulEmailOverageCharge(charge.id, existingIntent.id);

                return {
                    status: 'succeeded' as const,
                };
            }

            if (existingIntent.status === 'processing') {
                await prisma.emailOverageCharge.update({
                    where: {
                        id: charge.id,
                    },
                    data: {
                        status: EmailOverageChargeStatus.PROCESSING,
                    },
                });

                return {
                    status: 'processing' as const,
                };
            }

            /**
             * Same card already declined / requires action.
             *
             * Don't hammer the same card every day.
             * Wait until the customer's default payment
             * method changes.
             */
            if (charge.stripePaymentMethodId === paymentMethodId && ['requires_payment_method', 'requires_action'].includes(existingIntent.status)) {
                const status = existingIntent.status === 'requires_action' ? EmailOverageChargeStatus.REQUIRES_ACTION : EmailOverageChargeStatus.FAILED;

                await prisma.emailOverageCharge.update({
                    where: {
                        id: charge.id,
                    },
                    data: {
                        status,
                    },
                });

                return {
                    status: existingIntent.status === 'requires_action' ? ('requires_action' as const) : ('failed' as const),
                };
            }

            /**
             * User replaced their payment method.
             *
             * If the previous intent is waiting for
             * authentication, cancel it before trying
             * the new card.
             */
            if (charge.stripePaymentMethodId !== paymentMethodId && existingIntent.status === 'requires_action') {
                try {
                    await stripe.paymentIntents.cancel(existingIntent.id);
                } catch {
                    // If it was already canceled or
                    // changed, the new attempt below
                    // remains safe.
                }
            }
        } catch (error) {
            console.error('Failed retrieving old PaymentIntent:', error);
        }
    }

    /**
     * Using the payment-method ID in the Stripe
     * idempotency key means:
     *
     * Same card + duplicate cron
     *      => same PaymentIntent
     *
     * New card
     *      => new PaymentIntent
     */
    const paymentAttemptIdempotencyKey = `${charge.idempotencyKey}:${paymentMethodId}`;

    try {
        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount: charge.amountCents,

                currency: 'usd',

                customer: auth.stripeCustomerId,

                payment_method: paymentMethodId,

                payment_method_types: ['card'],

                // Customer isn't present.
                off_session: true,

                // Try payment immediately.
                confirm: true,

                description: `Email overage charge for ${charge.billingDate}`,

                metadata: {
                    billingType: 'email_overage',

                    authId: String(charge.authId),

                    emailOverageChargeId: String(charge.id),

                    billingDate: charge.billingDate,
                },
            },
            {
                idempotencyKey: paymentAttemptIdempotencyKey,
            }
        );

        charge = await prisma.emailOverageCharge.update({
            where: {
                id: charge.id,
            },
            data: {
                stripePaymentIntentId: paymentIntent.id,

                stripePaymentMethodId: paymentMethodId,

                status: mapPaymentIntentStatus(paymentIntent.status),

                failureCode: null,

                failureMessage: null,
            },
        });

        if (paymentIntent.status === 'succeeded') {
            await applySuccessfulEmailOverageCharge(charge.id, paymentIntent.id);

            return {
                status: 'succeeded' as const,

                amountCents: charge.amountCents,

                paymentIntentId: paymentIntent.id,
            };
        }

        if (paymentIntent.status === 'processing') {
            return {
                status: 'processing' as const,

                paymentIntentId: paymentIntent.id,
            };
        }

        if (paymentIntent.status === 'requires_action') {
            return {
                status: 'requires_action' as const,

                paymentIntentId: paymentIntent.id,
            };
        }

        return {
            status: 'failed' as const,

            paymentIntentId: paymentIntent.id,
        };
    } catch (error) {
        return saveStripePaymentError(charge.id, paymentMethodId, error);
    }
}

/**
 * Bills one user.
 */
export async function billUserEmailOverage(authId: number, date = new Date()) {
    // History is the source of truth. Reconcile first so a transient
    // counter-write failure can never suppress an overage charge.
    await syncEmailUsageFromHistory(authId, date);

    /**
     * Never create a new overage charge while
     * an old unresolved charge still exists.
     *
     * Otherwise:
     *
     * Day 1 charge fails
     * Day 2 could accidentally include
     * Day 1 money again.
     */
    const unresolved = await prisma.emailOverageCharge.findFirst({
        where: {
            authId,

            status: {
                in: [
                    EmailOverageChargeStatus.PENDING,
                    EmailOverageChargeStatus.PROCESSING,
                    EmailOverageChargeStatus.FAILED,
                    EmailOverageChargeStatus.REQUIRES_ACTION,
                ],
            },
        },

        orderBy: {
            createdAt: 'asc',
        },
    });

    if (unresolved) {
        const previousResult = await processEmailOverageCharge(unresolved.id);

        if (previousResult.status !== 'succeeded') {
            return {
                authId,

                existingChargeId: unresolved.id,

                ...previousResult,
            };
        }
    }

    const billingDate = getUtcBillingDate(date);

    const charge = await createDailyCharge(authId, billingDate);

    if (!charge) {
        return {
            authId,
            status: 'nothing_to_bill' as const,
        };
    }

    if (charge.status === EmailOverageChargeStatus.SUCCEEDED && charge.usageAppliedAt) {
        return {
            authId,
            chargeId: charge.id,
            status: 'succeeded' as const,
        };
    }

    const result = await processEmailOverageCharge(charge.id);

    return {
        authId,

        chargeId: charge.id,

        amountCents: charge.amountCents,

        ...result,
    };
}

/**
 * Daily cron entry point.
 */
export async function billAllEmailOverages(date = new Date()) {
    const users = await prisma.auth.findMany({
        where: {
            status: 'active',

            // User has had email usage
            // at some point.
            emailUsages: {
                some: {},
            },
        },

        select: {
            id: true,
        },

        orderBy: {
            id: 'asc',
        },
    });

    const results: Array<{
        authId: number;
        status: string;
        chargeId?: number;
        amountCents?: number;
        error?: string;
    }> = [];

    /**
     * Sequential processing is intentional.
     *
     * It avoids firing hundreds of simultaneous
     * Stripe requests from one cron invocation.
     */
    for (const user of users) {
        try {
            const result = await billUserEmailOverage(user.id, date);

            results.push({
                authId: user.id,

                status: result.status,

                chargeId: 'chargeId' in result ? result.chargeId : undefined,

                amountCents: 'amountCents' in result ? result.amountCents : undefined,
            });
        } catch (error) {
            console.error(`Email overage billing failed for auth ${user.id}:`, error);

            results.push({
                authId: user.id,

                status: 'error',

                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return results;
}
