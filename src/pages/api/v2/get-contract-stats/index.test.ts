import { DateTime } from 'luxon';
import { CONTRACT_STATS_MONTHS, CONTRACT_STATS_WEEK_DAYS, getContractStatsRanges, getCounts } from './index';

describe('contract stats', () => {
    test('builds timezone-aware ranges for the previous three years, current year, and next year', () => {
        const ranges = getContractStatsRanges(DateTime.fromISO('2026-09-08T12:00:00', { zone: 'Asia/Karachi' }));

        expect(ranges.yearlyRanges.map(({ year }) => year)).toEqual([2023, 2024, 2025, 2026, 2027]);
        expect(ranges.yearlyRanges[0].start.toISOString()).toBe('2022-12-31T19:00:00.000Z');
        expect(ranges.yearlyRanges[4].end.toISOString()).toBe('2027-12-31T19:00:00.000Z');
        expect(ranges.weeklyRanges.map(({ day }) => day)).toEqual(CONTRACT_STATS_WEEK_DAYS);
        expect(ranges.weeklyRanges[0].start.toISOString()).toBe('2026-09-06T19:00:00.000Z');
        expect(ranges.weeklyRanges[6].end.toISOString()).toBe('2026-09-13T19:00:00.000Z');
        expect(ranges.monthlyRanges.map(({ month }) => month)).toEqual(CONTRACT_STATS_MONTHS);
        expect(ranges.monthlyRanges[0].start.toISOString()).toBe('2025-12-31T19:00:00.000Z');
        expect(ranges.monthlyRanges[11].end.toISOString()).toBe('2026-12-31T19:00:00.000Z');
    });

    test('keeps summary counts and adds daily, monthly, and yearly breakdowns', async () => {
        const ranges = getContractStatsRanges(DateTime.fromISO('2026-09-08T12:00:00', { zone: 'UTC' }));
        const responses = [
            1,
            2,
            3,
            ...Array.from({ length: 7 }, (_, index) => index + 10),
            ...Array.from({ length: 12 }, (_, index) => index + 20),
            40,
            41,
            42,
            43,
            44,
            100,
        ];
        const countFunction = jest.fn(async () => responses.shift() as number);

        await expect(getCounts(countFunction, ranges)).resolves.toEqual({
            today: 1,
            weekly: 2,
            weeklyData: [
                { day: 'Monday', count: 10 },
                { day: 'Tuesday', count: 11 },
                { day: 'Wednesday', count: 12 },
                { day: 'Thursday', count: 13 },
                { day: 'Friday', count: 14 },
                { day: 'Saturday', count: 15 },
                { day: 'Sunday', count: 16 },
            ],
            monthly: 3,
            monthlyData: CONTRACT_STATS_MONTHS.map((month, index) => ({ month, count: index + 20 })),
            yearly: 43,
            yearlyData: [
                { year: 2023, count: 40 },
                { year: 2024, count: 41 },
                { year: 2025, count: 42 },
                { year: 2026, count: 43 },
                { year: 2027, count: 44 },
            ],
            total: 100,
        });
        expect(countFunction).toHaveBeenCalledTimes(28);
    });
});
