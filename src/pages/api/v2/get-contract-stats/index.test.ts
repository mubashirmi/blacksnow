import { DateTime } from 'luxon';
import { getContractStatsRanges, getCounts } from './index';

describe('contract stats', () => {
    test('builds timezone-aware ranges for the previous three years, current year, and next year', () => {
        const ranges = getContractStatsRanges(DateTime.fromISO('2026-09-08T12:00:00', { zone: 'Asia/Karachi' }));

        expect(ranges.yearlyRanges.map(({ year }) => year)).toEqual([2023, 2024, 2025, 2026, 2027]);
        expect(ranges.yearlyRanges[0].start.toISOString()).toBe('2022-12-31T19:00:00.000Z');
        expect(ranges.yearlyRanges[4].end.toISOString()).toBe('2027-12-31T19:00:00.000Z');
    });

    test('keeps the current-year count and adds the five-year breakdown', async () => {
        const ranges = getContractStatsRanges(DateTime.fromISO('2026-09-08T12:00:00', { zone: 'UTC' }));
        const responses = [1, 2, 3, 20, 21, 22, 23, 24, 100];
        const countFunction = jest.fn(async () => responses.shift() as number);

        await expect(getCounts(countFunction, ranges)).resolves.toEqual({
            today: 1,
            weekly: 2,
            monthly: 3,
            yearly: 23,
            yearlyData: [
                { year: 2023, count: 20 },
                { year: 2024, count: 21 },
                { year: 2025, count: 22 },
                { year: 2026, count: 23 },
                { year: 2027, count: 24 },
            ],
            total: 100,
        });
        expect(countFunction).toHaveBeenCalledTimes(9);
    });
});
