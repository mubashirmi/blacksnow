import { EmailOverageChargeStatus } from '@prisma/client';

import { getAutomaticChargeTransactions } from '@/lib/emailBillingReports';
import { getUserMonthlyEmailUsageSummary } from '@/lib/emailBillingUserReports';
import prisma from '@/lib/prisma';

const EMAIL_CRM_PRODUCTS = ['EmailMarketing', 'emailMarketing'];

export async function getEmailCrmBilling(authId: number, page: number, limit: number) {
    const [charges, subscription] = await Promise.all([
        getAutomaticChargeTransactions(authId, page, limit),
        prisma.checkout.findFirst({
            where: {
                AuthId: authId,
                product: { in: EMAIL_CRM_PRODUCTS },
                paid: true,
                deleted: false,
                cancelSubscripton: false,
                pause: false,
            },
            orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
            select: {
                id: true,
                product: true,
                amount: true,
                period: true,
                paid: true,
                pause: true,
                cancelSubscripton: true,
                startDate: true,
                nextBillingDate: true,
                transactionId: true,
            },
        }),
    ]);

    return {
        ...charges,
        nextBillingDate: subscription?.nextBillingDate ?? null,
        subscription,
    };
}

export async function getEmailCrmUsage(authId: number) {
    const [monthlyUsage, successfulCharges] = await Promise.all([
        getUserMonthlyEmailUsageSummary(authId),
        prisma.emailOverageCharge.aggregate({
            where: {
                authId,
                status: EmailOverageChargeStatus.SUCCEEDED,
            },
            _sum: { amountCents: true },
            _count: { _all: true },
        }),
    ]);

    return {
        user: monthlyUsage.user,
        billingMonth: monthlyUsage.billingMonth,
        timezone: monthlyUsage.timezone,
        includedEmailQuota: monthlyUsage.monthlyEmailLimit,
        availableEmailQuota: monthlyUsage.remainingEmails,
        emailsSentWithinQuota: Math.min(monthlyUsage.emailsSentThisMonth, monthlyUsage.monthlyEmailLimit),
        emailsSentAfterQuota: monthlyUsage.emailsSentOverLimit,
        totalEmailsSentThisMonth: monthlyUsage.emailsSentThisMonth,
        totalMoneySpentOnEmailOverages: {
            amount: (successfulCharges._sum.amountCents ?? 0) / 100,
            amountMinor: successfulCharges._sum.amountCents ?? 0,
            currency: 'USD' as const,
        },
        successfulOverageChargeCount: successfulCharges._count._all,
    };
}
