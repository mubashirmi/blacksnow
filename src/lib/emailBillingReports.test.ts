import { ApiError, parsePositiveInteger } from './apiErrors';
import { calculateMonthlyDayUsage, getUtcDayRange, getUtcMonthRange, parseDateKey, parsePagination } from './emailBillingValidation';

describe('email billing report validation', () => {
    test('accepts a valid calendar date', () => {
        expect(parseDateKey('2026-02-28', { required: true })).toBe('2026-02-28');
    });

    test('rejects an invalid calendar date', () => {
        expect(() => parseDateKey('2026-02-30', { required: true })).toThrow(ApiError);
    });

    test('creates an exclusive UTC day range', () => {
        const range = getUtcDayRange('2026-02-28');

        expect(range.start.toISOString()).toBe('2026-02-28T00:00:00.000Z');
        expect(range.end.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    });

    test('creates the UTC calendar month range', () => {
        const range = getUtcMonthRange('2026-02-28');

        expect(range.month).toBe('2026-02');
        expect(range.start.toISOString()).toBe('2026-02-01T00:00:00.000Z');
        expect(range.end.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    });

    test('only bills the part of a day that exceeds the remaining monthly allowance', () => {
        expect(calculateMonthlyDayUsage(100000, 99950, 100)).toEqual({
            remainingMonthlyAllowanceAtStartOfDay: 50,
            overageEmailCount: 50,
            emailsSentThisMonth: 100050,
            remainingMonthlyUsage: 0,
            monthlyOverageEmailCount: 50,
        });
    });

    test('bills all emails when the monthly allowance was exhausted before the day started', () => {
        expect(calculateMonthlyDayUsage(100000, 100250, 80).overageEmailCount).toBe(80);
    });

    test('applies pagination defaults and maximum limit validation', () => {
        expect(parsePagination({})).toEqual({ page: 1, limit: 25 });
        expect(() => parsePagination({ limit: '101' })).toThrow(ApiError);
    });

    test('validates optional authId filters', () => {
        expect(parsePositiveInteger(undefined, 'authId')).toBeUndefined();
        expect(parsePositiveInteger('123', 'authId')).toBe(123);
        expect(() => parsePositiveInteger('abc', 'authId')).toThrow(ApiError);
    });
});
