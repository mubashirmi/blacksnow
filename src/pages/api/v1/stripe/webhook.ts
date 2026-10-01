import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

import { activateCheckoutAccess } from '@/lib/activateCheckoutAccess';
import { applySuccessfulEmailOverageCharge } from '@/lib/emailOverageBilling';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * Stripe requires the EXACT raw request body for webhook
 * signature verification.
 *
 * We intentionally avoid Buffer.concat() here because some
 * combinations of TypeScript/@types/node produce incompatible
 * Buffer<ArrayBufferLike> / Uint8Array<ArrayBuffer> types.
 *
 * This implementation preserves the raw bytes exactly.
 */
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
    const chunks: Uint8Array[] = [];

    for await (const chunk of req) {
        if (typeof chunk === 'string') {
            chunks.push(new Uint8Array(Buffer.from(chunk)));
            continue;
        }

        if (chunk instanceof Uint8Array) {
            chunks.push(new Uint8Array(chunk));
            continue;
        }

        chunks.push(new Uint8Array(Buffer.from(chunk)));
    }

    const totalLength = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);

    const combined = new Uint8Array(totalLength);

    let offset = 0;

    for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.byteLength;
    }

    return Buffer.from(combined);
}

function getId(value: string | { id: string } | null | undefined): string | null {
    if (!value) {
        return null;
    }

    return typeof value === 'string' ? value : value.id;
}

/**
 * Save a reusable default payment method on the Stripe Customer.
 *
 * This payment method will later be used for automatic
 * off-session email overage charges.
 */
async function setCustomerDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    await stripe.customers.update(customerId, {
        invoice_settings: {
            default_payment_method: paymentMethodId,
        },
    });
}

/**
 * After subscription Checkout finishes,
 * find the subscription payment method and save it as:
 *
 * Customer.invoice_settings.default_payment_method
 *
 * This allows us to charge the customer later for
 * email overage while they are not actively on the site.
 */
async function syncPaymentMethodFromSubscription(subscriptionId: string, customerId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['default_payment_method', 'latest_invoice.payment_intent'],
    });

    let paymentMethodId = getId(subscription.default_payment_method as string | Stripe.PaymentMethod | null);

    /**
     * Some subscriptions may not have
     * default_payment_method directly assigned.
     *
     * In that situation, get the payment method from
     * the latest invoice's PaymentIntent.
     */
    if (!paymentMethodId) {
        let invoice: Stripe.Invoice | null = null;

        if (typeof subscription.latest_invoice === 'string') {
            invoice = await stripe.invoices.retrieve(subscription.latest_invoice, {
                expand: ['payment_intent'],
            });
        } else {
            invoice = subscription.latest_invoice as Stripe.Invoice | null;
        }

        if (invoice) {
            const paymentIntentValue = invoice.payment_intent;

            let paymentIntent: Stripe.PaymentIntent | null = null;

            if (typeof paymentIntentValue === 'string') {
                paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentValue);
            } else {
                paymentIntent = paymentIntentValue as Stripe.PaymentIntent | null;
            }

            paymentMethodId = getId(paymentIntent?.payment_method as string | Stripe.PaymentMethod | null);
        }
    }

    /**
     * Save onto Customer so future overage billing
     * can directly retrieve it.
     */
    if (paymentMethodId) {
        await setCustomerDefaultPaymentMethod(customerId, paymentMethodId);
    }
}

/**
 * When a subscription invoice succeeds, sync the payment
 * method again.
 *
 * This is useful if the customer changes their card later.
 */
async function syncPaymentMethodFromInvoice(invoiceId: string) {
    const invoice = await stripe.invoices.retrieve(invoiceId, {
        expand: ['payment_intent'],
    });

    const customerId = getId(invoice.customer as string | Stripe.Customer | null);

    if (!customerId) {
        return;
    }

    const paymentIntentValue = invoice.payment_intent;

    let paymentIntent: Stripe.PaymentIntent | null = null;

    if (typeof paymentIntentValue === 'string') {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentValue);
    } else {
        paymentIntent = paymentIntentValue as Stripe.PaymentIntent | null;
    }

    const paymentMethodId = getId(paymentIntent?.payment_method as string | Stripe.PaymentMethod | null);

    if (paymentMethodId) {
        await setCustomerDefaultPaymentMethod(customerId, paymentMethodId);
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    /**
     * Stripe webhook endpoints must only accept POST.
     */
    if (req.method !== 'POST') {
        return res.status(405).json({
            message: 'Method Not Allowed',
        });
    }

    /**
     * Stripe webhook signing secret.
     *
     * Example:
     *
     * STRIPE_WEBHOOK_SECRET=whsec_xxxxx
     */
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');

        return res.status(500).json({
            message: 'STRIPE_WEBHOOK_SECRET is not configured',
        });
    }

    /**
     * Stripe puts its signature here.
     */
    const signature = req.headers['stripe-signature'];

    if (!signature || Array.isArray(signature)) {
        return res.status(400).json({
            message: 'Missing Stripe signature',
        });
    }

    try {
        /**
         * IMPORTANT:
         *
         * Do not JSON.parse() this body.
         *
         * Stripe needs the original raw bytes to
         * verify the webhook signature.
         */
        const rawBody = await getRawBody(req);

        /**
         * Verify that this webhook really came
         * from Stripe.
         */
        const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

        switch (event.type) {
            /**
             * --------------------------------------------------
             * CHECKOUT COMPLETED
             * --------------------------------------------------
             *
             * The user successfully completed subscription
             * Checkout.
             *
             * We:
             *
             * 1. Make sure stripeCustomerId is stored.
             * 2. Find the payment method.
             * 3. Save it as the customer's default.
             */
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                const customerId = getId(session.customer as string | Stripe.Customer | null);

                const subscriptionId = getId(session.subscription as string | Stripe.Subscription | null);

                const authId = Number(session.metadata?.authId);

                /**
                 * Save Stripe Customer ID in Auth.
                 */
                if (customerId && Number.isInteger(authId) && authId > 0) {
                    await prisma.auth.updateMany({
                        where: {
                            id: authId,
                        },
                        data: {
                            stripeCustomerId: customerId,
                        },
                    });
                }

                /**
                 * Persist product access even if the customer closes the
                 * browser before the success page can confirm the payment.
                 */
                if (session.payment_status === 'paid') {
                    await activateCheckoutAccess(session.id);
                }

                /**
                 * Save subscription payment method
                 * onto the Stripe Customer.
                 */
                if (customerId && subscriptionId) {
                    await syncPaymentMethodFromSubscription(subscriptionId, customerId);
                }

                break;
            }

            /**
             * --------------------------------------------------
             * SUBSCRIPTION INVOICE PAYMENT SUCCEEDED
             * --------------------------------------------------
             *
             * Keeps the customer's default payment method
             * synchronized.
             *
             * This is particularly useful when the user
             * changes their card.
             */
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;

                await syncPaymentMethodFromInvoice(invoice.id);

                break;
            }

            /**
             * --------------------------------------------------
             * EMAIL OVERAGE PAYMENT SUCCEEDED
             * --------------------------------------------------
             *
             * Example:
             *
             * User has 100 overage emails.
             *
             * 100 × $0.005
             * = $0.50
             *
             * Cron creates PaymentIntent.
             *
             * Stripe succeeds.
             *
             * This webhook then marks those exact usage
             * dollars as billed.
             */
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                /**
                 * Ignore normal Stripe payments.
                 *
                 * We only want PaymentIntents created
                 * by our email-overage system.
                 */
                if (paymentIntent.metadata?.billingType !== 'email_overage') {
                    break;
                }

                const chargeId = Number(paymentIntent.metadata.emailOverageChargeId);

                if (Number.isInteger(chargeId) && chargeId > 0) {
                    await applySuccessfulEmailOverageCharge(chargeId, paymentIntent.id);
                }

                break;
            }

            /**
             * --------------------------------------------------
             * EMAIL OVERAGE PAYMENT FAILED
             * --------------------------------------------------
             *
             * IMPORTANT:
             *
             * We do NOT mark the customer's email usage
             * as billed here.
             *
             * They still owe the overage.
             */
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                /**
                 * Ignore unrelated PaymentIntents.
                 */
                if (paymentIntent.metadata?.billingType !== 'email_overage') {
                    break;
                }

                const chargeId = Number(paymentIntent.metadata.emailOverageChargeId);

                if (!Number.isInteger(chargeId) || chargeId <= 0) {
                    break;
                }

                /**
                 * updateMany is intentional here.
                 *
                 * If another webhook/cron already applied
                 * the usage, usageAppliedAt will no longer
                 * be null and this update won't overwrite
                 * the successful charge state.
                 */
                await prisma.emailOverageCharge.updateMany({
                    where: {
                        id: chargeId,

                        usageAppliedAt: null,
                    },

                    data: {
                        status: paymentIntent.status === 'requires_action' ? 'REQUIRES_ACTION' : 'FAILED',

                        stripePaymentIntentId: paymentIntent.id,

                        failureCode: paymentIntent.last_payment_error?.code || 'PAYMENT_FAILED',

                        failureMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
                    },
                });

                break;
            }

            /**
             * Ignore Stripe events we aren't interested in.
             */
            default:
                break;
        }

        /**
         * Stripe requires a 2xx response so it knows
         * the event was processed successfully.
         */
        return res.status(200).json({
            received: true,
        });
    } catch (error) {
        console.error('Stripe webhook error:', error);

        return res.status(400).json({
            message: error instanceof Error ? error.message : 'Webhook error',
        });
    }
}
