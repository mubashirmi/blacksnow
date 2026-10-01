import { ApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';

const invoiceReferenceSelect = {
    id: true,
    name: true,
    email: true,
    businessName: true,
    transactionId: true,
    paid: true,
    paymentType: true,
    subscriptionInterval: true,
    currency: true,
    totalAmount: true,
    stripeSubscriptionStatus: true,
    stripeCurrentPeriodEnd: true,
} as const;

function transactionPaymentMethod(payment: { stripeCustomerId: string | null; stripePaymentIntentId: string | null; stripeChargeId: string | null }) {
    if (!payment.stripeCustomerId && !payment.stripePaymentIntentId && !payment.stripeChargeId) return null;

    return {
        provider: 'stripe' as const,
        stripeCustomerId: payment.stripeCustomerId,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        stripeChargeId: payment.stripeChargeId,
    };
}

export async function getBusinessInvoiceUserBilling(authId: number) {
    if (!Number.isInteger(authId) || authId <= 0) {
        throw new ApiError(400, 'INVALID_AUTH_ID', 'A valid authenticated user is required');
    }

    const [user, invoicePayments, subscriptionInvPayments, invoiceRefunds, subscriptionInvRefunds, invoiceToolCheckouts, invoices, subscriptionInvoices] =
        await prisma.$transaction([
            prisma.auth.findUnique({
                where: { id: authId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            }),
            prisma.invoicePayment.findMany({
                where: { invoice: { authId } },
                orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
                include: { invoice: { select: invoiceReferenceSelect } },
            }),
            prisma.subscriptionInvPayment.findMany({
                where: { subscriptionInv: { authId } },
                orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
                include: { subscriptionInv: { select: invoiceReferenceSelect } },
            }),
            prisma.invoiceRefund.findMany({
                where: { invoice: { authId } },
                orderBy: { createdAt: 'desc' },
                include: { invoice: { select: invoiceReferenceSelect } },
            }),
            prisma.subscriptionInvRefund.findMany({
                where: { subscriptionInv: { authId } },
                orderBy: { createdAt: 'desc' },
                include: { subscriptionInv: { select: invoiceReferenceSelect } },
            }),
            prisma.checkout.findMany({
                where: {
                    AuthId: authId,
                    product: 'InvoiceTool',
                },
                orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    deleted: true,
                    product: true,
                    period: true,
                    amount: true,
                    paid: true,
                    pause: true,
                    cancelSubscripton: true,
                    startDate: true,
                    nextBillingDate: true,
                    transactionId: true,
                    refunds: {
                        orderBy: { createdAt: 'desc' },
                    },
                },
            }),
            prisma.invoice.findMany({
                where: { authId },
                select: {
                    ...invoiceReferenceSelect,
                    createdAt: true,
                    updatedAt: true,
                    baseAmount: true,
                    serviceFeeAmount: true,
                    platformFeeAmount: true,
                    applicationFeeAmount: true,
                    stripeCheckoutSessionId: true,
                    stripePaymentIntentId: true,
                    stripeChargeId: true,
                    stripeLatestInvoiceId: true,
                    stripeSubscriptionId: true,
                    stripeCustomerId: true,
                    subscriptionStartedAt: true,
                    refunded: true,
                    refundedAmount: true,
                },
            }),
            prisma.subscriptionInv.findMany({
                where: { authId },
                select: {
                    ...invoiceReferenceSelect,
                    createdAt: true,
                    updatedAt: true,
                    baseAmount: true,
                    serviceFeeAmount: true,
                    platformFeeAmount: true,
                    applicationFeeAmount: true,
                    stripeCheckoutSessionId: true,
                    stripePaymentIntentId: true,
                    stripeChargeId: true,
                    stripeLatestInvoiceId: true,
                    stripeSubscriptionId: true,
                    stripeCustomerId: true,
                    subscriptionStartedAt: true,
                    refunded: true,
                    refundedAmount: true,
                },
            }),
        ]);

    if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const activeSubscription =
        invoiceToolCheckouts.find((checkout) => checkout.paid && !checkout.deleted && !checkout.cancelSubscripton && !checkout.pause) ?? null;
    const invoiceIdsWithPaymentRows = new Set(invoicePayments.map((payment) => payment.invoiceId));
    const subscriptionInvoiceIdsWithPaymentRows = new Set(subscriptionInvPayments.map((payment) => payment.subscriptionInvId));
    const legacyInvoices = invoices.filter(
        (invoice) =>
            !invoiceIdsWithPaymentRows.has(invoice.id) &&
            Boolean(invoice.paid || invoice.transactionId || invoice.stripeCheckoutSessionId || invoice.stripePaymentIntentId || invoice.stripeSubscriptionId)
    );
    const legacySubscriptionInvoices = subscriptionInvoices.filter(
        (invoice) =>
            !subscriptionInvoiceIdsWithPaymentRows.has(invoice.id) &&
            Boolean(invoice.paid || invoice.transactionId || invoice.stripeCheckoutSessionId || invoice.stripePaymentIntentId || invoice.stripeSubscriptionId)
    );

    const transactions = [
        ...invoiceToolCheckouts.map((checkout) => {
            const amountMinor = Math.round(checkout.amount * 100);
            const successfulRefunds = checkout.refunds.filter((refund) => refund.status === 'succeeded');
            const refundedAmount = successfulRefunds.reduce((total, refund) => total + refund.amount, 0);

            return {
                id: `invoice-tool-checkout-${checkout.id}`,
                type: 'toolSubscription' as const,
                amount: amountMinor,
                currency: 'usd',
                status: checkout.paid ? 'paid' : 'pending',
                transactionDate: checkout.startDate ?? checkout.createdAt,
                createdAt: checkout.createdAt,
                updatedAt: checkout.updatedAt,
                paymentType: 'subscription',
                baseAmount: amountMinor,
                serviceFeeAmount: 0,
                platformFeeAmount: 0,
                applicationFeeAmount: 0,
                paymentMethod: null,
                stripeCheckoutSessionId: checkout.transactionId,
                stripeInvoiceId: null,
                stripeSubscriptionId: null,
                refunded: refundedAmount > 0,
                refundedAmount,
                reference: {
                    id: checkout.id,
                    product: checkout.product,
                    period: checkout.period,
                    paid: checkout.paid,
                    paused: checkout.pause,
                    canceled: checkout.cancelSubscripton,
                    deleted: checkout.deleted,
                    nextBillingDate: checkout.nextBillingDate,
                },
            };
        }),
        ...invoicePayments.map((payment) => ({
            id: payment.id,
            type: 'invoice' as const,
            amount: payment.amountPaid,
            currency: payment.currency,
            status: payment.paymentStatus,
            transactionDate: payment.paidAt ?? payment.createdAt,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            paymentType: payment.paymentType,
            baseAmount: payment.baseAmount,
            serviceFeeAmount: payment.serviceFeeAmount,
            platformFeeAmount: payment.platformFeeAmount,
            applicationFeeAmount: payment.applicationFeeAmount,
            paymentMethod: transactionPaymentMethod(payment),
            stripeCheckoutSessionId: payment.stripeCheckoutSessionId,
            stripeInvoiceId: payment.stripeInvoiceId,
            stripeSubscriptionId: payment.stripeSubscriptionId,
            refunded: payment.refunded,
            refundedAmount: payment.refundedAmount,
            reference: payment.invoice,
        })),
        ...legacyInvoices.map((invoice) => ({
            id: `legacy-invoice-${invoice.id}`,
            type: 'invoice' as const,
            amount: invoice.totalAmount || invoice.baseAmount,
            currency: invoice.currency,
            status: invoice.paid ? 'paid' : invoice.stripeSubscriptionStatus ?? 'pending',
            transactionDate: invoice.subscriptionStartedAt ?? invoice.updatedAt,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
            paymentType: invoice.paymentType,
            baseAmount: invoice.baseAmount,
            serviceFeeAmount: invoice.serviceFeeAmount,
            platformFeeAmount: invoice.platformFeeAmount,
            applicationFeeAmount: invoice.applicationFeeAmount,
            paymentMethod: transactionPaymentMethod(invoice),
            stripeCheckoutSessionId: invoice.stripeCheckoutSessionId ?? invoice.transactionId,
            stripeInvoiceId: invoice.stripeLatestInvoiceId,
            stripeSubscriptionId: invoice.stripeSubscriptionId,
            refunded: invoice.refunded,
            refundedAmount: invoice.refundedAmount,
            reference: invoice,
        })),
        ...subscriptionInvPayments.map((payment) => ({
            id: payment.id,
            type: 'subscriptionInvoice' as const,
            amount: payment.amountPaid,
            currency: payment.currency,
            status: payment.paymentStatus,
            transactionDate: payment.paidAt ?? payment.createdAt,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            paymentType: payment.paymentType,
            baseAmount: payment.baseAmount,
            serviceFeeAmount: payment.serviceFeeAmount,
            platformFeeAmount: payment.platformFeeAmount,
            applicationFeeAmount: payment.applicationFeeAmount,
            paymentMethod: transactionPaymentMethod(payment),
            stripeCheckoutSessionId: payment.stripeCheckoutSessionId,
            stripeInvoiceId: payment.stripeInvoiceId,
            stripeSubscriptionId: payment.stripeSubscriptionId,
            refunded: payment.refunded,
            refundedAmount: payment.refundedAmount,
            reference: payment.subscriptionInv,
        })),
        ...legacySubscriptionInvoices.map((invoice) => ({
            id: `legacy-subscription-invoice-${invoice.id}`,
            type: 'subscriptionInvoice' as const,
            amount: invoice.totalAmount || invoice.baseAmount,
            currency: invoice.currency,
            status: invoice.paid ? 'paid' : invoice.stripeSubscriptionStatus ?? 'pending',
            transactionDate: invoice.subscriptionStartedAt ?? invoice.updatedAt,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
            paymentType: invoice.paymentType,
            baseAmount: invoice.baseAmount,
            serviceFeeAmount: invoice.serviceFeeAmount,
            platformFeeAmount: invoice.platformFeeAmount,
            applicationFeeAmount: invoice.applicationFeeAmount,
            paymentMethod: transactionPaymentMethod(invoice),
            stripeCheckoutSessionId: invoice.stripeCheckoutSessionId ?? invoice.transactionId,
            stripeInvoiceId: invoice.stripeLatestInvoiceId,
            stripeSubscriptionId: invoice.stripeSubscriptionId,
            refunded: invoice.refunded,
            refundedAmount: invoice.refundedAmount,
            reference: invoice,
        })),
    ].sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());

    const refunds = [
        ...invoiceToolCheckouts.flatMap((checkout) =>
            checkout.refunds.map((refund) => ({
                id: `invoice-tool-refund-${refund.id}`,
                type: 'toolSubscription' as const,
                amount: refund.amount,
                currency: refund.currency,
                status: refund.status,
                refundDate: refund.createdAt,
                updatedAt: refund.updatedAt,
                reason: refund.reason,
                paymentId: null,
                stripeRefundId: refund.stripeRefundId,
                stripePaymentIntentId: refund.stripePaymentIntentId,
                stripeChargeId: refund.stripeChargeId,
                stripeSubscriptionId: null,
                reference: {
                    id: checkout.id,
                    product: checkout.product,
                    period: checkout.period,
                    transactionId: checkout.transactionId,
                },
            }))
        ),
        ...invoiceRefunds.map((refund) => ({
            id: refund.id,
            type: 'invoice' as const,
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status,
            refundDate: refund.createdAt,
            updatedAt: refund.updatedAt,
            reason: refund.reason,
            paymentId: refund.invoicePaymentId,
            stripeRefundId: refund.stripeRefundId,
            stripePaymentIntentId: refund.stripePaymentIntentId,
            stripeChargeId: refund.stripeChargeId,
            stripeSubscriptionId: refund.stripeSubscriptionId,
            reference: refund.invoice,
        })),
        ...subscriptionInvRefunds.map((refund) => ({
            id: refund.id,
            type: 'subscriptionInvoice' as const,
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status,
            refundDate: refund.createdAt,
            updatedAt: refund.updatedAt,
            reason: refund.reason,
            paymentId: refund.subscriptionInvPaymentId,
            stripeRefundId: refund.stripeRefundId,
            stripePaymentIntentId: refund.stripePaymentIntentId,
            stripeChargeId: refund.stripeChargeId,
            stripeSubscriptionId: refund.stripeSubscriptionId,
            reference: refund.subscriptionInv,
        })),
    ].sort((a, b) => b.refundDate.getTime() - a.refundDate.getTime());

    return {
        user: {
            authId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        transactions,
        refunds,
        nextSubscriptionBillingDate: activeSubscription?.nextBillingDate ?? null,
        activeSubscription: activeSubscription
            ? {
                  id: activeSubscription.id,
                  product: activeSubscription.product,
                  period: activeSubscription.period,
                  amount: activeSubscription.amount,
                  paid: activeSubscription.paid,
                  pause: activeSubscription.pause,
                  cancelSubscripton: activeSubscription.cancelSubscripton,
                  startDate: activeSubscription.startDate,
                  nextBillingDate: activeSubscription.nextBillingDate,
                  transactionId: activeSubscription.transactionId,
              }
            : null,
    };
}
