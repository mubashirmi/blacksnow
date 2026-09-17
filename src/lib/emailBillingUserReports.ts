import { EmailStatus } from '@prisma/client';

import { ApiError } from '@/lib/apiErrors';
import { BILLING_TIME_ZONE } from '@/lib/emailBillingReports';
import { getUtcDateKey, getUtcMonthRange } from '@/lib/emailBillingValidation';
import prisma from '@/lib/prisma';

const MICROS_PER_DOLLAR = 1_000_000;
const ZERO_BIGINT = BigInt(0);

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

type BillingUser = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    emailUsageLimit: number;
    emailOverageRate: number;
};

type BillingTerms = {
    monthlyLimit: number;
    rateMicros: number;
};

type DailySentCountRow = {
    date: string;
    count: number;
};

type MonthlySentCountRow = {
    year: number;
    month: number;
    count: number;
};

type UsageSnapshot = {
    month: string;
    includedLimit: number;
    overageRateMicros: number;
};

function dollarsToMicros(dollars: number): number {
    return Math.round(dollars * MICROS_PER_DOLLAR);
}

function moneyFromMicros(micros: number | bigint) {
    const numericMicros = typeof micros === 'bigint' ? Number(micros) : micros;

    return {
        amount: Number((numericMicros / MICROS_PER_DOLLAR).toFixed(6)),
        currency: 'USD' as const,
    };
}

function getUserIdentity(user: BillingUser) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    };
}

function getBillingTerms(user: BillingUser, snapshot?: UsageSnapshot): BillingTerms {
    const monthlyLimit = Math.max(snapshot?.includedLimit ?? user.emailUsageLimit, 0);

    const rateMicros = snapshot?.overageRateMicros ?? dollarsToMicros(user.emailOverageRate);

    if (!Number.isInteger(rateMicros) || rateMicros < 0) {
        throw new ApiError(500, 'INVALID_EMAIL_BILLING_CONFIGURATION', 'The email overage rate is invalid');
    }

    return {
        monthlyLimit,
        rateMicros,
    };
}

function calculatePercentageUsed(emailsSent: number, monthlyLimit: number): number {
    if (monthlyLimit <= 0) {
        return emailsSent > 0 ? 100 : 0;
    }

    return Number(((emailsSent / monthlyLimit) * 100).toFixed(2));
}

function utcStartOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}

function toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function getCurrentUtcWeekRange(now: Date) {
    const today = utcStartOfDay(now);
    const daysSinceMonday = (today.getUTCDay() + 6) % 7;

    const start = addUtcDays(today, -daysSinceMonday);
    const endExclusive = addUtcDays(start, 7);
    const endInclusive = addUtcDays(endExclusive, -1);

    return {
        start,
        endExclusive,
        startDate: toDateKey(start),
        endDate: toDateKey(endInclusive),
    };
}

function getDayName(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: 'UTC',
    }).format(date);
}

async function getEmailMarketingUser(authId: number): Promise<BillingUser> {
    const user = await prisma.auth.findFirst({
        where: {
            id: authId,
            status: 'active',
            roles: {
                has: 'EmailMarketing',
            },
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            emailUsageLimit: true,
            emailOverageRate: true,
        },
    });

    if (!user) {
        throw new ApiError(404, 'EMAIL_MARKETING_USER_NOT_FOUND', 'An active email marketing user was not found');
    }

    return user;
}

async function getCurrentMonthlyContext(authId: number, now = new Date()) {
    const dateKey = getUtcDateKey(now);
    const monthRange = getUtcMonthRange(dateKey);

    const effectiveEnd = now.getTime() < monthRange.end.getTime() ? now : monthRange.end;

    const [user, snapshot, emailsSentThisMonth] = await Promise.all([
        getEmailMarketingUser(authId),

        prisma.emailUsage.findUnique({
            where: {
                authId_month: {
                    authId,
                    month: monthRange.month,
                },
            },
            select: {
                month: true,
                includedLimit: true,
                overageRateMicros: true,
            },
        }),

        prisma.emailSentHistory.count({
            where: {
                authId,
                status: EmailStatus.sent,
                sentAt: {
                    gte: monthRange.start,
                    lt: effectiveEnd,
                },
            },
        }),
    ]);

    const terms = getBillingTerms(user, snapshot ?? undefined);

    const remainingEmails = Math.max(terms.monthlyLimit - emailsSentThisMonth, 0);

    const emailsSentOverLimit = Math.max(emailsSentThisMonth - terms.monthlyLimit, 0);

    const overageMicros = BigInt(emailsSentOverLimit) * BigInt(terms.rateMicros);

    return {
        user,
        billingMonth: monthRange.month,
        emailsSentThisMonth,
        remainingEmails,
        emailsSentOverLimit,
        monthlyLimit: terms.monthlyLimit,
        rateMicros: terms.rateMicros,
        overageMicros,
    };
}

export async function getUserMonthlyEmailUsageSummary(authId: number, now = new Date()) {
    const context = await getCurrentMonthlyContext(authId, now);

    return {
        user: getUserIdentity(context.user),
        billingMonth: context.billingMonth,
        timezone: BILLING_TIME_ZONE,

        monthlyEmailLimit: context.monthlyLimit,

        emailsSentThisMonth: context.emailsSentThisMonth,

        remainingEmails: context.remainingEmails,

        emailsSentOverLimit: context.emailsSentOverLimit,

        pricePerEmailAfterLimit: moneyFromMicros(context.rateMicros),

        overageCharges: moneyFromMicros(context.overageMicros),

        percentageOfMonthlyLimitUsed: calculatePercentageUsed(context.emailsSentThisMonth, context.monthlyLimit),
    };
}

export async function getUserMonthlyBillingSummary(authId: number, now = new Date()) {
    const context = await getCurrentMonthlyContext(authId, now);

    return {
        user: getUserIdentity(context.user),
        billingMonth: context.billingMonth,
        timezone: BILLING_TIME_ZONE,

        monthlyEmailLimit: context.monthlyLimit,

        emailsSentOverLimit: context.emailsSentOverLimit,

        totalOverageCharges: moneyFromMicros(context.overageMicros),
    };
}

export async function getUserDailyOverageTransactions(authId: number, page: number, limit: number, now = new Date()) {
    const user = await getEmailMarketingUser(authId);

    const [dailyRows, snapshots] = await Promise.all([
        prisma.$queryRaw<DailySentCountRow[]>`
            SELECT
                TO_CHAR("sentAt", 'YYYY-MM-DD') AS "date",
                COUNT(*)::int AS "count"
            FROM "EmailSentHistory"
            WHERE
                "authId" = ${authId}
                AND "status" = 'sent'
                AND "sentAt" IS NOT NULL
                AND "sentAt" < ${now}
            GROUP BY
                TO_CHAR("sentAt", 'YYYY-MM-DD')
            ORDER BY
                "date" ASC
        `,

        prisma.emailUsage.findMany({
            where: {
                authId,
            },
            select: {
                month: true,
                includedLimit: true,
                overageRateMicros: true,
            },
            orderBy: {
                month: 'asc',
            },
        }),
    ]);

    const snapshotByMonth = new Map(snapshots.map((snapshot) => [snapshot.month, snapshot]));

    const transactions: Array<{
        date: string;
        billingMonth: string;
        emailsSentOverLimit: number;
        overageCharge: {
            amount: number;
            currency: 'USD';
        };
    }> = [];

    let activeMonth = '';
    let cumulativeSentForMonth = 0;

    let totalEmailsSentOverLimit = 0;
    let totalOverageMicros = ZERO_BIGINT;

    for (const row of dailyRows) {
        const billingMonth = row.date.slice(0, 7);

        if (billingMonth !== activeMonth) {
            activeMonth = billingMonth;
            cumulativeSentForMonth = 0;
        }

        const snapshot = snapshotByMonth.get(billingMonth);

        const terms = getBillingTerms(user, snapshot);

        const overageBeforeDay = Math.max(cumulativeSentForMonth - terms.monthlyLimit, 0);

        cumulativeSentForMonth += row.count;

        const overageAfterDay = Math.max(cumulativeSentForMonth - terms.monthlyLimit, 0);

        const dailyOverageEmailCount = overageAfterDay - overageBeforeDay;

        if (dailyOverageEmailCount <= 0) {
            continue;
        }

        const dailyChargeMicros = BigInt(dailyOverageEmailCount) * BigInt(terms.rateMicros);

        totalEmailsSentOverLimit += dailyOverageEmailCount;

        totalOverageMicros += dailyChargeMicros;

        transactions.push({
            date: row.date,
            billingMonth,
            emailsSentOverLimit: dailyOverageEmailCount,
            overageCharge: moneyFromMicros(dailyChargeMicros),
        });
    }

    transactions.reverse();

    const transactionCount = transactions.length;

    const startIndex = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + limit);

    return {
        user: getUserIdentity(user),
        timezone: BILLING_TIME_ZONE,

        transactionCount,

        totals: {
            emailsSentOverLimit: totalEmailsSentOverLimit,

            overageCharges: moneyFromMicros(totalOverageMicros),
        },

        transactions: paginatedTransactions,

        pagination: {
            page,
            limit,
            totalPages: Math.ceil(transactionCount / limit),
        },
    };
}

export async function getUserEmailUsageAnalytics(authId: number, now = new Date()) {
    const user = await getEmailMarketingUser(authId);

    const today = utcStartOfDay(now);
    const todayKey = toDateKey(today);

    const weekRange = getCurrentUtcWeekRange(now);

    const currentYear = now.getUTCFullYear();

    const yearlyStartYear = currentYear - 3;

    const yearlyEndYear = currentYear + 1;

    const fiveYearStart = new Date(Date.UTC(yearlyStartYear, 0, 1));

    const fiveYearEndExclusive = new Date(Date.UTC(yearlyEndYear + 1, 0, 1));

    const weekEffectiveEnd = now.getTime() < weekRange.endExclusive.getTime() ? now : weekRange.endExclusive;

    const fiveYearEffectiveEnd = now.getTime() < fiveYearEndExclusive.getTime() ? now : fiveYearEndExclusive;

    const [weeklyRows, monthlyRows] = await Promise.all([
        prisma.$queryRaw<DailySentCountRow[]>`
                SELECT
                    TO_CHAR("sentAt", 'YYYY-MM-DD') AS "date",
                    COUNT(*)::int AS "count"
                FROM "EmailSentHistory"
                WHERE
                    "authId" = ${authId}
                    AND "status" = 'sent'
                    AND "sentAt" IS NOT NULL
                    AND "sentAt" >= ${weekRange.start}
                    AND "sentAt" < ${weekEffectiveEnd}
                GROUP BY
                    TO_CHAR("sentAt", 'YYYY-MM-DD')
                ORDER BY
                    "date" ASC
            `,

        prisma.$queryRaw<MonthlySentCountRow[]>`
                SELECT
                    EXTRACT(YEAR FROM "sentAt")::int AS "year",
                    EXTRACT(MONTH FROM "sentAt")::int AS "month",
                    COUNT(*)::int AS "count"
                FROM "EmailSentHistory"
                WHERE
                    "authId" = ${authId}
                    AND "status" = 'sent'
                    AND "sentAt" IS NOT NULL
                    AND "sentAt" >= ${fiveYearStart}
                    AND "sentAt" < ${fiveYearEffectiveEnd}
                GROUP BY
                    EXTRACT(YEAR FROM "sentAt"),
                    EXTRACT(MONTH FROM "sentAt")
                ORDER BY
                    "year" ASC,
                    "month" ASC
            `,
    ]);

    const weeklyCountByDate = new Map(weeklyRows.map((row) => [row.date, row.count]));

    const currentWeek = Array.from({ length: 7 }, (_, index) => {
        const date = addUtcDays(weekRange.start, index);

        const dateKey = toDateKey(date);

        return {
            day: getDayName(date),
            date: dateKey,
            emailsSent: weeklyCountByDate.get(dateKey) ?? 0,
        };
    });

    const monthlyCountMap = new Map<string, number>();

    const yearlyCountMap = new Map<number, number>();

    for (const row of monthlyRows) {
        monthlyCountMap.set(`${row.year}-${row.month}`, row.count);

        yearlyCountMap.set(row.year, (yearlyCountMap.get(row.year) ?? 0) + row.count);
    }

    const currentYearUsage = MONTH_NAMES.map((monthName, index) => {
        const monthNumber = index + 1;

        return {
            month: monthName,
            monthNumber,
            emailsSent: monthlyCountMap.get(`${currentYear}-${monthNumber}`) ?? 0,
        };
    });

    const yearlyUsage = Array.from({ length: 5 }, (_, index) => {
        const year = yearlyStartYear + index;

        return {
            year,
            emailsSent: yearlyCountMap.get(year) ?? 0,
        };
    });

    return {
        user: getUserIdentity(user),
        timezone: BILLING_TIME_ZONE,

        today: {
            date: todayKey,
            emailsSent: weeklyCountByDate.get(todayKey) ?? 0,
        },

        currentWeek: {
            startDate: weekRange.startDate,
            endDate: weekRange.endDate,
            days: currentWeek,
        },

        currentYear: {
            year: currentYear,
            months: currentYearUsage,
        },

        yearlyUsage: {
            startYear: yearlyStartYear,
            endYear: yearlyEndYear,
            years: yearlyUsage,
        },
    };
}
