import { buildProductRevenueMap, getProductRevenueDateRange, MONTHS, WEEK_DAYS } from './productRevenueChart';

describe('product revenue chart', () => {
    const now = new Date('2026-09-02T12:00:00.000Z');

    test('uses the current Monday-Sunday week and current calendar year', () => {
        const range = getProductRevenueDateRange(now);

        expect([range.weekStart.getFullYear(), range.weekStart.getMonth(), range.weekStart.getDate()]).toEqual([2026, 7, 31]);
        expect([range.weekEndExclusive.getFullYear(), range.weekEndExclusive.getMonth(), range.weekEndExclusive.getDate()]).toEqual([2026, 8, 7]);
        expect([range.yearStart.getFullYear(), range.yearStart.getMonth(), range.yearStart.getDate()]).toEqual([2026, 0, 1]);
        expect([range.yearEndExclusive.getFullYear(), range.yearEndExclusive.getMonth(), range.yearEndExclusive.getDate()]).toEqual([2027, 0, 1]);
        expect([range.yearlyStart.getFullYear(), range.yearlyStart.getMonth(), range.yearlyStart.getDate()]).toEqual([2023, 0, 1]);
        expect([range.yearlyEndExclusive.getFullYear(), range.yearlyEndExclusive.getMonth(), range.yearlyEndExclusive.getDate()]).toEqual([2028, 0, 1]);
        expect(range.yearlyYears).toEqual([2023, 2024, 2025, 2026, 2027]);
    });

    test('returns every day and month for every product and fills missing buckets with zero', () => {
        const revenue = buildProductRevenueMap(
            ['DigitalBillboard', 'EmailMarketing'],
            [
                { product: 'DigitalBillboard', amount: 10, createdAt: new Date('2026-08-31T10:00:00.000Z') },
                { product: 'DigitalBillboard', amount: 25, createdAt: new Date('2026-09-06T10:00:00.000Z') },
                { product: 'DigitalBillboard', amount: 15, createdAt: new Date('2026-09-06T11:00:00.000Z') },
                { product: 'DigitalBillboard', amount: 50, createdAt: new Date('2026-01-15T10:00:00.000Z') },
                { product: 'DigitalBillboard', amount: 100, createdAt: new Date('2023-04-15T10:00:00.000Z') },
                { product: 'DigitalBillboard', amount: 200, createdAt: new Date('2027-04-15T10:00:00.000Z') },
            ],
            now
        );

        expect(revenue.DigitalBillboard.weekly).toHaveLength(7);
        expect(revenue.DigitalBillboard.weekly.map(({ day }) => day)).toEqual(WEEK_DAYS);
        expect(revenue.DigitalBillboard.weekly[0].revenue).toBe(10);
        expect(revenue.DigitalBillboard.weekly[1].revenue).toBe(0);
        expect(revenue.DigitalBillboard.weekly[6].revenue).toBe(40);

        expect(revenue.DigitalBillboard.monthly).toHaveLength(12);
        expect(revenue.DigitalBillboard.monthly.map(({ month }) => month)).toEqual(MONTHS);
        expect(revenue.DigitalBillboard.monthly[0].revenue).toBe(50);
        expect(revenue.DigitalBillboard.monthly[8].revenue).toBe(40);

        expect(revenue.DigitalBillboard.yearly).toEqual([
            { year: 2023, revenue: 100 },
            { year: 2024, revenue: 0 },
            { year: 2025, revenue: 0 },
            { year: 2026, revenue: 100 },
            { year: 2027, revenue: 200 },
        ]);

        expect(revenue.EmailMarketing.weekly.every(({ revenue: amount }) => amount === 0)).toBe(true);
        expect(revenue.EmailMarketing.monthly.every(({ revenue: amount }) => amount === 0)).toBe(true);
        expect(revenue.EmailMarketing.yearly.every(({ revenue: amount }) => amount === 0)).toBe(true);
    });

    test('does not add older transactions to the active week or current-year months', () => {
        const revenue = buildProductRevenueMap(
            ['DigitalBillboard'],
            [
                { product: 'DigitalBillboard', amount: 100, createdAt: new Date('2026-08-30T12:00:00.000Z') },
                { product: 'DigitalBillboard', amount: 200, createdAt: new Date('2025-12-30T12:00:00.000Z') },
            ],
            now
        );

        expect(revenue.DigitalBillboard.weekly.every(({ revenue: amount }) => amount === 0)).toBe(true);
        expect(revenue.DigitalBillboard.monthly.every(({ revenue: amount }) => amount === 0)).toBe(true);
        expect(revenue.DigitalBillboard.yearly.find(({ year }) => year === 2025)?.revenue).toBe(200);
    });
});
