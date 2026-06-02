// pages/api/email-sent-history/stats.ts

import prisma from '@/lib/prisma';
import { EmailStatus } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

type Period = 'weekly' | 'monthly' | 'yearly' | 'all';

const REPORTING_TIME_ZONE = 'Asia/Karachi';

const EMAIL_SELECT = {
    id: true,
    createdAt: true,
    sentAt: true,
    subject: true,
    status: true,
    messageId: true,
    errorMessage: true,
    authId: true,
    emailUserId: true,
    newsletterAuthId: true,
    credentialsId: true,
    jobResultId: true,

    // Keep these disabled for analytics to avoid large payloads.
    // Enable if you really need full email content in the response.
    // text: true,
    // html: true,
};

type Ymd = {
    year: number;
    month: number;
    day: number;
};

function getQueryValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function pad2(value: number): string {
    return String(value).padStart(2, '0');
}

function ymdKey(ymd: Ymd): string {
    return `${ymd.year}-${pad2(ymd.month)}-${pad2(ymd.day)}`;
}

function addDaysToYmd(ymd: Ymd, days: number): Ymd {
    const date = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day + days));

    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
    };
}

function getZonedYmd(date: Date, timeZone: string): Ymd {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);

    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);
    const day = Number(parts.find((part) => part.type === 'day')?.value);

    return { year, month, day };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);

    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);
    const day = Number(parts.find((part) => part.type === 'day')?.value);
    const hour = Number(parts.find((part) => part.type === 'hour')?.value);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value);
    const second = Number(parts.find((part) => part.type === 'second')?.value);

    const utcTime = Date.UTC(year, month - 1, day, hour, minute, second);

    return utcTime - date.getTime();
}

function zonedStartOfDayToUtc(ymd: Ymd, timeZone: string): Date {
    const localMidnightAsUtc = Date.UTC(ymd.year, ymd.month - 1, ymd.day, 0, 0, 0);

    let utcTime = localMidnightAsUtc - getTimeZoneOffsetMs(new Date(localMidnightAsUtc), timeZone);

    // Second pass improves accuracy around timezone offset boundaries.
    utcTime = localMidnightAsUtc - getTimeZoneOffsetMs(new Date(utcTime), timeZone);

    return new Date(utcTime);
}

function getDayName(ymd: Ymd): string {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: 'UTC',
    }).format(new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day)));
}

function getMonthName(month: number): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        timeZone: 'UTC',
    }).format(new Date(Date.UTC(2026, month - 1, 1)));
}

function getLastCompletedWeekRange(now: Date, timeZone: string) {
    const today = getZonedYmd(now, timeZone);

    const localDateForDow = new Date(Date.UTC(today.year, today.month - 1, today.day));

    const dayOfWeek = localDateForDow.getUTCDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;

    const currentWeekMonday = addDaysToYmd(today, -daysSinceMonday);
    const lastWeekMonday = addDaysToYmd(currentWeekMonday, -7);
    const lastWeekSunday = addDaysToYmd(lastWeekMonday, 6);

    return {
        startYmd: lastWeekMonday,
        endYmdExclusive: currentWeekMonday,
        displayEndYmd: lastWeekSunday,
        startUtc: zonedStartOfDayToUtc(lastWeekMonday, timeZone),
        endUtcExclusive: zonedStartOfDayToUtc(currentWeekMonday, timeZone),
    };
}

function getCurrentYearMonthlyRange(now: Date, timeZone: string) {
    const today = getZonedYmd(now, timeZone);

    const startYmd = {
        year: today.year,
        month: 1,
        day: 1,
    };

    const endYmdExclusive = {
        year: today.year + 1,
        month: 1,
        day: 1,
    };

    return {
        year: today.year,
        startYmd,
        endYmdExclusive,
        startUtc: zonedStartOfDayToUtc(startYmd, timeZone),
        endUtcExclusive: zonedStartOfDayToUtc(endYmdExclusive, timeZone),
    };
}

function getLastFiveYearsRange(now: Date, timeZone: string) {
    const today = getZonedYmd(now, timeZone);
    const startYear = today.year - 5;
    const endYear = today.year;

    const startYmd = {
        year: startYear,
        month: 1,
        day: 1,
    };

    const endYmdExclusive = {
        year: endYear + 1,
        month: 1,
        day: 1,
    };

    return {
        startYear,
        endYear,
        startYmd,
        endYmdExclusive,
        startUtc: zonedStartOfDayToUtc(startYmd, timeZone),
        endUtcExclusive: zonedStartOfDayToUtc(endYmdExclusive, timeZone),
    };
}

async function getSentEmailRecords(params: { startDate: Date; endDate: Date; authId?: number }) {
    const { startDate, endDate, authId } = params;

    return prisma.emailSentHistory.findMany({
        where: {
            status: EmailStatus.sent,

            // This API reports by sentAt.
            // If old rows do not have sentAt, change sentAt to createdAt here
            // and in the grouping code below.
            sentAt: {
                gte: startDate,
                lt: endDate,
            },

            ...(authId !== undefined ? { authId } : {}),
        },
        select: EMAIL_SELECT,
        orderBy: {
            sentAt: 'asc',
        },
    });
}

function buildWeeklyResponse(records: Awaited<ReturnType<typeof getSentEmailRecords>>, now: Date, timeZone: string) {
    const range = getLastCompletedWeekRange(now, timeZone);

    const recordsByDay = new Map<string, typeof records>();

    for (const record of records) {
        if (!record.sentAt) continue;

        const key = ymdKey(getZonedYmd(record.sentAt, timeZone));

        if (!recordsByDay.has(key)) {
            recordsByDay.set(key, []);
        }

        recordsByDay.get(key)?.push(record);
    }

    const data = Array.from({ length: 7 }, (_, index) => {
        const currentYmd = addDaysToYmd(range.startYmd, index);
        const key = ymdKey(currentYmd);
        const dayRecords = recordsByDay.get(key) ?? [];

        return {
            date: key,
            day: getDayName(currentYmd),
            count: dayRecords.length,
            records: dayRecords,
        };
    });

    return {
        type: 'weekly',
        timezone: timeZone,
        range: {
            startDate: ymdKey(range.startYmd),
            endDate: ymdKey(range.displayEndYmd),
            startUtc: range.startUtc,
            endUtcExclusive: range.endUtcExclusive,
        },
        total: records.length,
        data,
    };
}

function buildMonthlyResponse(records: Awaited<ReturnType<typeof getSentEmailRecords>>, now: Date, timeZone: string) {
    const range = getCurrentYearMonthlyRange(now, timeZone);

    const recordsByMonth = new Map<number, typeof records>();

    for (const record of records) {
        if (!record.sentAt) continue;

        const zoned = getZonedYmd(record.sentAt, timeZone);
        const month = zoned.month;

        if (!recordsByMonth.has(month)) {
            recordsByMonth.set(month, []);
        }

        recordsByMonth.get(month)?.push(record);
    }

    const data = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const monthRecords = recordsByMonth.get(month) ?? [];

        return {
            month,
            label: getMonthName(month),
            count: monthRecords.length,
            records: monthRecords,
        };
    });

    return {
        type: 'monthly',
        timezone: timeZone,
        year: range.year,
        range: {
            startDate: ymdKey(range.startYmd),
            endDateExclusive: ymdKey(range.endYmdExclusive),
            startUtc: range.startUtc,
            endUtcExclusive: range.endUtcExclusive,
        },
        total: records.length,
        data,
    };
}

function buildYearlyResponse(records: Awaited<ReturnType<typeof getSentEmailRecords>>, now: Date, timeZone: string) {
    const range = getLastFiveYearsRange(now, timeZone);

    const recordsByYear = new Map<number, typeof records>();

    for (const record of records) {
        if (!record.sentAt) continue;

        const zoned = getZonedYmd(record.sentAt, timeZone);
        const year = zoned.year;

        if (!recordsByYear.has(year)) {
            recordsByYear.set(year, []);
        }

        recordsByYear.get(year)?.push(record);
    }

    const data = Array.from({ length: range.endYear - range.startYear + 1 }, (_, index) => {
        const year = range.startYear + index;
        const yearRecords = recordsByYear.get(year) ?? [];

        return {
            year,
            count: yearRecords.length,
            records: yearRecords,
        };
    });

    return {
        type: 'yearly',
        timezone: timeZone,
        range: {
            startYear: range.startYear,
            endYear: range.endYear,
            startDate: ymdKey(range.startYmd),
            endDateExclusive: ymdKey(range.endYmdExclusive),
            startUtc: range.startUtc,
            endUtcExclusive: range.endUtcExclusive,
        },
        total: records.length,
        data,
    };
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const periodQuery = getQueryValue(req.query.period);
        const authIdQuery = getQueryValue(req.query.authId);

        // Default behavior:
        // If no period is passed, return all weekly, monthly, and yearly data.
        const period = (periodQuery ?? 'all') as Period;

        if (!['weekly', 'monthly', 'yearly', 'all'].includes(period)) {
            return res.status(400).json({
                message: 'Invalid period. Use weekly, monthly, yearly, all, or omit period to get all.',
            });
        }

        const authId = authIdQuery ? Number(authIdQuery) : undefined;

        if (authIdQuery && Number.isNaN(authId)) {
            return res.status(400).json({
                message: 'Invalid authId. authId must be a number.',
            });
        }

        const now = new Date();

        const weeklyRange = getLastCompletedWeekRange(now, REPORTING_TIME_ZONE);
        const monthlyRange = getCurrentYearMonthlyRange(now, REPORTING_TIME_ZONE);
        const yearlyRange = getLastFiveYearsRange(now, REPORTING_TIME_ZONE);

        if (period === 'weekly') {
            const records = await getSentEmailRecords({
                startDate: weeklyRange.startUtc,
                endDate: weeklyRange.endUtcExclusive,
                authId,
            });

            return res.status(200).json(buildWeeklyResponse(records, now, REPORTING_TIME_ZONE));
        }

        if (period === 'monthly') {
            const records = await getSentEmailRecords({
                startDate: monthlyRange.startUtc,
                endDate: monthlyRange.endUtcExclusive,
                authId,
            });

            return res.status(200).json(buildMonthlyResponse(records, now, REPORTING_TIME_ZONE));
        }

        if (period === 'yearly') {
            const records = await getSentEmailRecords({
                startDate: yearlyRange.startUtc,
                endDate: yearlyRange.endUtcExclusive,
                authId,
            });

            return res.status(200).json(buildYearlyResponse(records, now, REPORTING_TIME_ZONE));
        }

        // Default and period=all response.
        const [weeklyRecords, monthlyRecords, yearlyRecords] = await Promise.all([
            getSentEmailRecords({
                startDate: weeklyRange.startUtc,
                endDate: weeklyRange.endUtcExclusive,
                authId,
            }),
            getSentEmailRecords({
                startDate: monthlyRange.startUtc,
                endDate: monthlyRange.endUtcExclusive,
                authId,
            }),
            getSentEmailRecords({
                startDate: yearlyRange.startUtc,
                endDate: yearlyRange.endUtcExclusive,
                authId,
            }),
        ]);

        return res.status(200).json({
            type: 'all',
            timezone: REPORTING_TIME_ZONE,
            weekly: buildWeeklyResponse(weeklyRecords, now, REPORTING_TIME_ZONE),
            monthly: buildMonthlyResponse(monthlyRecords, now, REPORTING_TIME_ZONE),
            yearly: buildYearlyResponse(yearlyRecords, now, REPORTING_TIME_ZONE),
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
