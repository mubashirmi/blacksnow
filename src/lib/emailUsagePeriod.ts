import { ApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { EmailStatus } from '@prisma/client';

export const EMAIL_USAGE_TIME_ZONE = 'UTC';

export type EmailUsagePeriod = 'weekly' | 'monthly';

type EmailUsageRange = {
    start: Date;
    endExclusive: Date;
    startDate: string;
    endDate: string;
};

function toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function getCurrentWeekRange(now = new Date()): EmailUsageRange {
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const daysSinceMonday = (today.getUTCDay() + 6) % 7;
    const start = new Date(today);
    start.setUTCDate(today.getUTCDate() - daysSinceMonday);

    const endExclusive = new Date(start);
    endExclusive.setUTCDate(start.getUTCDate() + 7);

    const endInclusive = new Date(endExclusive);
    endInclusive.setUTCDate(endExclusive.getUTCDate() - 1);

    return {
        start,
        endExclusive,
        startDate: toDateKey(start),
        endDate: toDateKey(endInclusive),
    };
}

export function getCurrentMonthRange(now = new Date()): EmailUsageRange {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endExclusive = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const endInclusive = new Date(endExclusive);
    endInclusive.setUTCDate(endExclusive.getUTCDate() - 1);

    return {
        start,
        endExclusive,
        startDate: toDateKey(start),
        endDate: toDateKey(endInclusive),
    };
}

export function parseRequiredAuthId(value: string | string[] | undefined): number {
    if (value === undefined) {
        throw new ApiError(400, 'AUTH_ID_REQUIRED', 'authId is required');
    }

    if (Array.isArray(value)) {
        throw new ApiError(400, 'INVALID_QUERY', 'authId must be provided once');
    }

    const authId = Number(value);

    if (!Number.isInteger(authId) || authId <= 0) {
        throw new ApiError(400, 'INVALID_QUERY', 'authId must be a positive integer');
    }

    return authId;
}

export async function getEmailUsageTotal(authId: number, period: EmailUsagePeriod, now = new Date()) {
    const range = period === 'weekly' ? getCurrentWeekRange(now) : getCurrentMonthRange(now);

    const totalEmailsSent = await prisma.emailSentHistory.count({
        where: {
            authId,
            status: EmailStatus.sent,
            sentAt: {
                gte: range.start,
                lt: range.endExclusive,
            },
        },
    });

    return {
        authId,
        period,
        timezone: EMAIL_USAGE_TIME_ZONE,
        range: {
            startDate: range.startDate,
            endDate: range.endDate,
        },
        totalEmailsSent,
    };
}
