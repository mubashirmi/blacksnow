import { EmailStatus } from '@prisma/client';
import prisma from './prisma';

const MICROS_PER_DOLLAR = 1_000_000;

// Avoid BigInt literal syntax like 0n because your
// TypeScript target is lower than ES2020.
const ZERO_BIGINT = BigInt(0);

export function getCurrentUtcMonth(date = new Date()): string {
    return date.toISOString().slice(0, 7);
}

function getUtcMonthRange(month: string) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));

    return { start, end };
}

function dollarsToMicros(dollars: number): number {
    return Math.round(dollars * MICROS_PER_DOLLAR);
}

/**
 * Reconciles the counter from immutable sent-history rows before billing.
 * This repairs a missed increment without ever counting failed emails.
 */
export async function syncEmailUsageFromHistory(authId: number, date = new Date()) {
    if (!Number.isInteger(authId) || authId <= 0) {
        throw new Error('Invalid authId');
    }

    const month = getCurrentUtcMonth(date);
    const { start, end } = getUtcMonthRange(month);

    const [auth, successfulEmailCount] = await Promise.all([
        prisma.auth.findUnique({
            where: { id: authId },
            select: { emailUsageLimit: true, emailOverageRate: true },
        }),
        prisma.emailSentHistory.count({
            where: {
                authId,
                status: EmailStatus.sent,
                sentAt: { gte: start, lt: end },
            },
        }),
    ]);

    if (!auth) throw new Error(`Auth ${authId} not found`);

    const overageRateMicros = dollarsToMicros(auth.emailOverageRate);
    if (overageRateMicros <= 0) throw new Error(`Invalid emailOverageRate for Auth ${authId}`);

    return prisma.emailUsage.upsert({
        where: { authId_month: { authId, month } },
        update: { count: successfulEmailCount },
        create: {
            authId,
            month,
            count: successfulEmailCount,
            includedLimit: auth.emailUsageLimit,
            overageRateMicros,
        },
    });
}

export async function recordEmailUsage(authId: number, successfulEmailCount: number) {
    if (!Number.isInteger(authId) || authId <= 0) {
        throw new Error('Invalid authId');
    }

    if (!Number.isInteger(successfulEmailCount) || successfulEmailCount <= 0) {
        throw new Error('successfulEmailCount must be a positive integer');
    }

    const auth = await prisma.auth.findUnique({
        where: {
            id: authId,
        },
        select: {
            id: true,
            emailUsageLimit: true,
            emailOverageRate: true,
        },
    });

    if (!auth) {
        throw new Error(`Auth ${authId} not found`);
    }

    const month = getCurrentUtcMonth();

    const overageRateMicros = dollarsToMicros(auth.emailOverageRate);

    if (overageRateMicros <= 0) {
        throw new Error(`Invalid emailOverageRate for Auth ${authId}`);
    }

    const usage = await prisma.emailUsage.upsert({
        where: {
            authId_month: {
                authId,
                month,
            },
        },

        /*
         * Existing monthly record keeps the
         * includedLimit and overageRateMicros snapshot
         * that it started with.
         */
        update: {
            count: {
                increment: successfulEmailCount,
            },
        },

        create: {
            authId,
            month,
            count: successfulEmailCount,
            includedLimit: auth.emailUsageLimit,
            overageRateMicros,
        },
    });

    const overageEmails = Math.max(usage.count - usage.includedLimit, 0);

    const grossOverageMicros = BigInt(overageEmails) * BigInt(usage.overageRateMicros);

    const pendingMicros = grossOverageMicros > usage.overageBilledMicros ? grossOverageMicros - usage.overageBilledMicros : ZERO_BIGINT;

    return {
        month: usage.month,

        totalSent: usage.count,

        includedLimit: usage.includedLimit,

        remainingIncluded: Math.max(usage.includedLimit - usage.count, 0),

        overageEmails,

        pendingOverageDollars: Number(pendingMicros) / MICROS_PER_DOLLAR,
    };
}

export async function getEmailUsage(authId: number, date = new Date()) {
    if (!Number.isInteger(authId) || authId <= 0) {
        throw new Error('Invalid authId');
    }

    const month = getCurrentUtcMonth(date);

    const usage = await prisma.emailUsage.findUnique({
        where: {
            authId_month: {
                authId,
                month,
            },
        },
    });

    const auth = await prisma.auth.findUnique({
        where: {
            id: authId,
        },
        select: {
            emailUsageLimit: true,
            emailOverageRate: true,
        },
    });

    if (!auth) {
        throw new Error('User not found');
    }

    if (!usage) {
        return {
            month,

            totalSent: 0,

            includedLimit: auth.emailUsageLimit,

            remainingIncluded: auth.emailUsageLimit,

            overageEmails: 0,

            pendingOverageDollars: 0,
        };
    }

    const overageEmails = Math.max(usage.count - usage.includedLimit, 0);

    const grossMicros = BigInt(overageEmails) * BigInt(usage.overageRateMicros);

    const pendingMicros = grossMicros > usage.overageBilledMicros ? grossMicros - usage.overageBilledMicros : ZERO_BIGINT;

    return {
        month,

        totalSent: usage.count,

        includedLimit: usage.includedLimit,

        remainingIncluded: Math.max(usage.includedLimit - usage.count, 0),

        overageEmails,

        pendingOverageDollars: Number(pendingMicros) / MICROS_PER_DOLLAR,
    };
}
