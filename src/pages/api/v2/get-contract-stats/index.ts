import prisma from '@/lib/prisma';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * You can override this in .env:
 *
 * REPORTING_TIMEZONE="Asia/Karachi"
 */
const REPORTING_TIMEZONE = process.env.REPORTING_TIMEZONE || 'America/New_York';

type CountSummary = {
    today: number;
    weekly: number;
    monthly: number;
    yearly: number;
    yearlyData: Array<{
        year: number;
        count: number;
    }>;
    total: number;
};

type CountRanges = {
    todayStart: Date;
    todayEnd: Date;

    weekStart: Date;
    weekEnd: Date;

    monthStart: Date;
    monthEnd: Date;

    yearlyRanges: Array<{
        year: number;
        start: Date;
        end: Date;
    }>;
};

type SuccessResponse = Array<
    | {
          contract: CountSummary;
      }
    | {
          invoice: CountSummary;
      }
    | {
          subscriptionInv: CountSummary;
      }
>;

type ErrorResponse = {
    message: string;
    error?: string;
};

type CountFunction = (args?: {
    where?: {
        createdAt?: {
            gte?: Date;
            lt?: Date;
        };
    };
}) => Promise<number>;

/**
 * Count records for:
 *
 * - today
 * - current week
 * - current month
 * - current year
 * - all time
 */
export async function getCounts(countFunction: CountFunction, ranges: CountRanges): Promise<CountSummary> {
    const counts = await Promise.all([
        /**
         * TODAY
         */
        countFunction({
            where: {
                createdAt: {
                    gte: ranges.todayStart,
                    lt: ranges.todayEnd,
                },
            },
        }),

        /**
         * THIS WEEK
         */
        countFunction({
            where: {
                createdAt: {
                    gte: ranges.weekStart,
                    lt: ranges.weekEnd,
                },
            },
        }),

        /**
         * THIS MONTH
         */
        countFunction({
            where: {
                createdAt: {
                    gte: ranges.monthStart,
                    lt: ranges.monthEnd,
                },
            },
        }),

        /**
         * PREVIOUS THREE YEARS, CURRENT YEAR, AND NEXT YEAR
         */
        ...ranges.yearlyRanges.map(({ start, end }) =>
            countFunction({
                where: {
                    createdAt: {
                        gte: start,
                        lt: end,
                    },
                },
            })
        ),

        /**
         * ALL TIME
         */
        countFunction(),
    ]);

    const [today, weekly, monthly] = counts;
    const yearlyData = ranges.yearlyRanges.map(({ year }, index) => ({
        year,
        count: counts[index + 3],
    }));
    const yearly = yearlyData[3].count;
    const total = counts[counts.length - 1];

    return {
        today,
        weekly,
        monthly,
        yearly,
        yearlyData,
        total,
    };
}

export function getContractStatsRanges(now: DateTime): CountRanges {
    const todayStart = now.startOf('day');
    const weekStart = now.startOf('week');
    const monthStart = now.startOf('month');
    const yearStart = now.startOf('year');

    return {
        todayStart: todayStart.toJSDate(),
        todayEnd: todayStart.plus({ days: 1 }).toJSDate(),
        weekStart: weekStart.toJSDate(),
        weekEnd: weekStart.plus({ weeks: 1 }).toJSDate(),
        monthStart: monthStart.toJSDate(),
        monthEnd: monthStart.plus({ months: 1 }).toJSDate(),
        yearlyRanges: Array.from({ length: 5 }, (_, index) => {
            const rangeStart = yearStart.plus({ years: index - 3 });

            return {
                year: rangeStart.year,
                start: rangeStart.toJSDate(),
                end: rangeStart.plus({ years: 1 }).toJSDate(),
            };
        }),
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResponse | ErrorResponse>) {
    /**
     * Only allow GET.
     */
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);

        return res.status(405).json({
            message: 'Method not allowed',
        });
    }

    try {
        /**
         * ---------------------------------------------------------
         * CURRENT TIME
         * ---------------------------------------------------------
         *
         * Example:
         *
         * Asia/Karachi
         *
         * Using a timezone here is important because the database
         * normally stores DateTime values as UTC.
         */
        const now = DateTime.now().setZone(REPORTING_TIMEZONE);

        if (!now.isValid) {
            return res.status(500).json({
                message: 'Invalid reporting timezone',
                error: REPORTING_TIMEZONE,
            });
        }

        const ranges = getContractStatsRanges(now);

        /**
         * ---------------------------------------------------------
         * QUERY ALL THREE TABLES
         * ---------------------------------------------------------
         *
         * All queries run concurrently.
         */
        const [contract, invoice, subscriptionInv] = await Promise.all([
            getCounts((args) => prisma.contract.count(args), ranges),

            getCounts((args) => prisma.invoice.count(args), ranges),

            getCounts((args) => prisma.subscriptionInv.count(args), ranges),
        ]);

        /**
         * Your requested response structure.
         *
         * This is a valid JSON version of:
         *
         * [
         *   contract: {...},
         *   invoice: {...},
         *   subscriptionInv: {...}
         * ]
         */
        return res.status(200).json([
            {
                contract,
            },
            {
                invoice,
            },
            {
                subscriptionInv,
            },
        ]);
    } catch (error: unknown) {
        console.error('Error getting created record statistics:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return res.status(500).json({
            message: 'Internal server error',
            error: errorMessage,
        });
    }
}
