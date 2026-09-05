import { EmailOverageChargeStatus, EmailStatus, type Role } from '@prisma/client';

import { ApiError } from './apiErrors';
import { calculateMonthlyDayUsage, getUtcDayRange, getUtcMonthRange } from './emailBillingValidation';
import prisma from './prisma';

const MICROS_PER_DOLLAR = 1_000_000;
export const BILLING_TIME_ZONE = 'UTC';

type BillingUser = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: Role[];
    emailUsageLimit: number;
    emailOverageRate: number;
};

type DailyCharge = {
    id: number;
    authId: number;
    amountCents: number;
    status: EmailOverageChargeStatus;
    chargedAt: Date | null;
};

function dollarsToMicros(dollars: number): number {
    return Math.round(dollars * MICROS_PER_DOLLAR);
}

function moneyFromMicros(micros: number) {
    return {
        amount: Number((micros / MICROS_PER_DOLLAR).toFixed(6)),
        currency: 'USD' as const,
    };
}

async function getBillingUsers(requestedUserId?: number): Promise<BillingUser[]> {
    const users = await prisma.auth.findMany({
        where: {
            status: 'active',
            roles: { has: 'EmailMarketing' },
            ...(requestedUserId ? { id: requestedUserId } : {}),
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            roles: true,
            emailUsageLimit: true,
            emailOverageRate: true,
        },
        orderBy: { id: 'asc' },
    });

    if (requestedUserId && users.length === 0) {
        throw new ApiError(404, 'EMAIL_MARKETING_USER_NOT_FOUND', 'An active email marketing user was not found');
    }

    return users;
}

async function buildMonthlyUsage(users: BillingUser[], dateKey: string) {
    const userIds = users.map((user) => user.id);
    const dayRange = getUtcDayRange(dateKey);
    const monthRange = getUtcMonthRange(dateKey);

    const [todayCounts, monthToDateCounts, usageSnapshots] = userIds.length
        ? await Promise.all([
              prisma.emailSentHistory.groupBy({
                  by: ['authId'],
                  where: {
                      authId: { in: userIds },
                      status: EmailStatus.sent,
                      sentAt: { gte: dayRange.start, lt: dayRange.end },
                  },
                  _count: { _all: true },
              }),
              prisma.emailSentHistory.groupBy({
                  by: ['authId'],
                  where: {
                      authId: { in: userIds },
                      status: EmailStatus.sent,
                      sentAt: { gte: monthRange.start, lt: dayRange.end },
                  },
                  _count: { _all: true },
              }),
              prisma.emailUsage.findMany({
                  where: { authId: { in: userIds }, month: monthRange.month },
                  select: { authId: true, includedLimit: true, overageRateMicros: true },
              }),
          ])
        : [[], [], []];

    const todayCountByUserId = new Map(todayCounts.map((item) => [item.authId, item._count._all]));
    const monthToDateCountByUserId = new Map(monthToDateCounts.map((item) => [item.authId, item._count._all]));
    const snapshotByUserId = new Map(usageSnapshots.map((item) => [item.authId, item]));

    return users.map((user) => {
        const emailsSentToday = todayCountByUserId.get(user.id) ?? 0;
        const emailsSentThisMonth = monthToDateCountByUserId.get(user.id) ?? 0;
        const emailsBeforeDay = Math.max(emailsSentThisMonth - emailsSentToday, 0);
        const snapshot = snapshotByUserId.get(user.id);
        const monthlyLimit = snapshot?.includedLimit ?? user.emailUsageLimit;
        const rateMicros = snapshot?.overageRateMicros ?? dollarsToMicros(user.emailOverageRate);
        const calculated = calculateMonthlyDayUsage(monthlyLimit, emailsBeforeDay, emailsSentToday);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            billingMonth: monthRange.month,
            emailsSentToday,
            emailsSentThisMonth: calculated.emailsSentThisMonth,
            monthlyLimit,
            remainingMonthlyUsage: calculated.remainingMonthlyUsage,
            monthlyOverageEmailCount: calculated.monthlyOverageEmailCount,
            remainingMonthlyAllowanceAtStartOfDay: calculated.remainingMonthlyAllowanceAtStartOfDay,
            overageEmailCount: calculated.overageEmailCount,
            rateMicros,
        };
    });
}

export async function getDailyUsageReport(dateKey: string, requestedUserId?: number) {
    const users = await getBillingUsers(requestedUserId);
    const usage = await buildMonthlyUsage(users, dateKey);

    return usage.map(({ rateMicros: _rateMicros, remainingMonthlyAllowanceAtStartOfDay: _allowance, overageEmailCount: _dailyOverage, ...item }) => item);
}

export async function getDailyOverageReport(dateKey: string, requestedUserId?: number) {
    const users = await getBillingUsers(requestedUserId);
    const ids = users.map((user) => user.id);
    const chargesPromise: Promise<DailyCharge[]> = ids.length
        ? prisma.emailOverageCharge.findMany({
              where: { authId: { in: ids }, billingDate: dateKey },
              select: {
                  id: true,
                  authId: true,
                  amountCents: true,
                  status: true,
                  chargedAt: true,
              },
          })
        : Promise.resolve([]);
    const [usage, charges] = await Promise.all([buildMonthlyUsage(users, dateKey), chargesPromise]);

    const chargeByUserId = new Map(charges.map((charge) => [charge.authId, charge]));

    return usage.map((item) => {
        const totalMicros = item.overageEmailCount * item.rateMicros;
        const charge = chargeByUserId.get(item.user.id);

        return {
            user: item.user,
            billingMonth: item.billingMonth,
            emailsSentToday: item.emailsSentToday,
            emailsSentThisMonth: item.emailsSentThisMonth,
            monthlyLimit: item.monthlyLimit,
            remainingMonthlyAllowanceAtStartOfDay: item.remainingMonthlyAllowanceAtStartOfDay,
            overageEmailCount: item.overageEmailCount,
            ratePerOverageEmail: moneyFromMicros(item.rateMicros),
            totalCharge: moneyFromMicros(totalMicros),
            automaticCharge: charge
                ? {
                      transactionId: charge.id,
                      status: charge.status,
                      amount: {
                          amount: charge.amountCents / 100,
                          currency: 'USD' as const,
                      },
                      chargedAt: charge.chargedAt,
                  }
                : null,
        };
    });
}

export async function getAutomaticChargeTransactions(authId: number | undefined, page: number, limit: number) {
    const where = authId === undefined ? {} : { authId };

    if (authId !== undefined) {
        await getBillingUsers(authId);
    }

    const [transactionCount, successful, transactions] = await prisma.$transaction([
        prisma.emailOverageCharge.count({ where }),
        prisma.emailOverageCharge.aggregate({
            where: { ...where, status: EmailOverageChargeStatus.SUCCEEDED },
            _count: { _all: true },
            _sum: { amountCents: true },
        }),
        prisma.emailOverageCharge.findMany({
            where,
            select: {
                id: true,
                authId: true,
                billingDate: true,
                amountCents: true,
                status: true,
                chargedAt: true,
                createdAt: true,
                stripePaymentIntentId: true,
                failureCode: true,
                failureMessage: true,
                auth: { select: { email: true } },
            },
            orderBy: [{ billingDate: 'desc' }, { id: 'desc' }],
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        transactionCount,
        successfulTransactionCount: successful._count._all,
        totalAmountCharged: {
            amount: (successful._sum.amountCents ?? 0) / 100,
            currency: 'USD' as const,
        },
        transactions: transactions.map((transaction) => ({
            id: transaction.id,
            user: {
                id: transaction.authId,
                email: transaction.auth.email,
            },
            billingDate: transaction.billingDate,
            billingMonth: transaction.billingDate.slice(0, 7),
            amount: {
                amount: transaction.amountCents / 100,
                currency: 'USD' as const,
            },
            status: transaction.status,
            chargedAt: transaction.chargedAt,
            createdAt: transaction.createdAt,
            stripePaymentIntentId: transaction.stripePaymentIntentId,
            failure: transaction.failureCode || transaction.failureMessage ? { code: transaction.failureCode, message: transaction.failureMessage } : null,
        })),
        pagination: {
            page,
            limit,
            totalPages: Math.ceil(transactionCount / limit),
        },
    };
}
