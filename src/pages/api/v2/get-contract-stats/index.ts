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
    total: number;
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
async function getCounts(
    countFunction: CountFunction,
    ranges: {
        todayStart: Date;
        todayEnd: Date;

        weekStart: Date;
        weekEnd: Date;

        monthStart: Date;
        monthEnd: Date;

        yearStart: Date;
        yearEnd: Date;
    }
): Promise<CountSummary> {
    const [today, weekly, monthly, yearly, total] = await Promise.all([
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
         * THIS YEAR
         */
        countFunction({
            where: {
                createdAt: {
                    gte: ranges.yearStart,
                    lt: ranges.yearEnd,
                },
            },
        }),

        /**
         * ALL TIME
         */
        countFunction(),
    ]);

    return {
        today,
        weekly,
        monthly,
        yearly,
        total,
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

        /**
         * ---------------------------------------------------------
         * TODAY
         * ---------------------------------------------------------
         *
         * Today 00:00
         * until
         * tomorrow 00:00
         */
        const todayStart = now.startOf('day');

        const todayEnd = todayStart.plus({
            days: 1,
        });

        /**
         * ---------------------------------------------------------
         * CURRENT WEEK
         * ---------------------------------------------------------
         *
         * Luxon uses ISO weeks.
         *
         * Monday -> Sunday
         */
        const weekStart = now.startOf('week');

        const weekEnd = weekStart.plus({
            weeks: 1,
        });

        /**
         * ---------------------------------------------------------
         * CURRENT MONTH
         * ---------------------------------------------------------
         */
        const monthStart = now.startOf('month');

        const monthEnd = monthStart.plus({
            months: 1,
        });

        /**
         * ---------------------------------------------------------
         * CURRENT YEAR
         * ---------------------------------------------------------
         */
        const yearStart = now.startOf('year');

        const yearEnd = yearStart.plus({
            years: 1,
        });

        /**
         * Convert Luxon DateTimes into normal JS Dates
         * for Prisma.
         */
        const ranges = {
            todayStart: todayStart.toJSDate(),
            todayEnd: todayEnd.toJSDate(),

            weekStart: weekStart.toJSDate(),
            weekEnd: weekEnd.toJSDate(),

            monthStart: monthStart.toJSDate(),
            monthEnd: monthEnd.toJSDate(),

            yearStart: yearStart.toJSDate(),
            yearEnd: yearEnd.toJSDate(),
        };

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
