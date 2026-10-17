import { Prisma } from '@prisma/client';
import prisma from './prisma';

export type DigitalBillboardKpiPeriod = 'weekly' | 'monthly' | 'yearly';

type AggregateRow = {
    bucket: Date;
    count: number | bigint;
};

type Bucket = {
    key: string;
    label: string;
};

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (value: number) => String(value).padStart(2, '0');

const dayKey = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
const monthKey = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;

export function isDigitalBillboardKpiPeriod(value: unknown): value is DigitalBillboardKpiPeriod {
    return value === 'weekly' || value === 'monthly' || value === 'yearly';
}

function getBucketKey(period: DigitalBillboardKpiPeriod, date: Date) {
    if (period === 'weekly') return dayKey(date);
    if (period === 'monthly') return monthKey(date);
    return String(date.getUTCFullYear());
}

export function getDigitalBillboardKpiRange(
    period: DigitalBillboardKpiPeriod,
    now: Date
): { start: Date; end: Date; granularity: 'day' | 'month' | 'year'; buckets: Bucket[] } {
    const year = now.getUTCFullYear();

    if (period === 'weekly') {
        const daysSinceMonday = (now.getUTCDay() + 6) % 7;
        const start = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));

        return {
            start,
            end: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000),
            granularity: 'day',
            buckets: WEEK_LABELS.map((label, index) => {
                const date = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);
                return { key: dayKey(date), label };
            }),
        };
    }

    if (period === 'monthly') {
        return {
            start: new Date(Date.UTC(year, 0, 1)),
            end: new Date(Date.UTC(year + 1, 0, 1)),
            granularity: 'month',
            buckets: MONTH_LABELS.map((label, month) => ({ key: `${year}-${pad(month + 1)}`, label })),
        };
    }

    const firstYear = year - 2;
    return {
        start: new Date(Date.UTC(firstYear, 0, 1)),
        end: new Date(Date.UTC(year + 3, 0, 1)),
        granularity: 'year',
        buckets: Array.from({ length: 5 }, (_, index) => {
            const bucketYear = firstYear + index;
            return { key: String(bucketYear), label: String(bucketYear) };
        }),
    };
}

export async function getDigitalBillboardKpi(period: DigitalBillboardKpiPeriod, userId?: number, now = new Date()) {
    const { start, end, granularity, buckets } = getDigitalBillboardKpiRange(period, now);
    const userFilter = userId === undefined ? Prisma.empty : Prisma.sql`AND billboard."authId" = ${userId}`;

    const [clickRows, billboardRows] = await Promise.all([
        prisma.$queryRaw<AggregateRow[]>(Prisma.sql`
            SELECT DATE_TRUNC(${granularity}, click."createdAt") AS "bucket",
                   COUNT(*)::INTEGER AS "count"
            FROM "DigitalBillboardClick" AS click
            INNER JOIN "DigitalBillboard" AS billboard ON billboard."id" = click."billboardId"
            WHERE click."createdAt" >= ${start} AND click."createdAt" < ${end}
            ${userFilter}
            GROUP BY 1
        `),
        prisma.$queryRaw<AggregateRow[]>(Prisma.sql`
            SELECT DATE_TRUNC(${granularity}, billboard."createdAt") AS "bucket",
                   COUNT(*)::INTEGER AS "count"
            FROM "DigitalBillboard" AS billboard
            WHERE billboard."createdAt" >= ${start} AND billboard."createdAt" < ${end}
            ${userFilter}
            GROUP BY 1
        `),
    ]);

    const clicksByBucket = new Map(clickRows.map((row) => [getBucketKey(period, new Date(row.bucket)), Number(row.count)]));
    const billboardsByBucket = new Map(billboardRows.map((row) => [getBucketKey(period, new Date(row.bucket)), Number(row.count)]));

    const data = buckets.map((bucket) => ({
        label: bucket.label,
        clicks: clicksByBucket.get(bucket.key) ?? 0,
        digitalBillboards: billboardsByBucket.get(bucket.key) ?? 0,
    }));

    const totals = data.reduce(
        (total, bucket) => ({
            clicks: total.clicks + bucket.clicks,
            digitalBillboards: total.digitalBillboards + bucket.digitalBillboards,
        }),
        { clicks: 0, digitalBillboards: 0 }
    );

    return { data, totals };
}
