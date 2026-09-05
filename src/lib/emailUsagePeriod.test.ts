import { ApiError } from './apiErrors';
import { getCurrentMonthRange, getCurrentWeekRange, parseRequiredAuthId } from './emailUsagePeriod';

describe('email usage periods', () => {
    test('uses Monday through Sunday for the current week', () => {
        const range = getCurrentWeekRange(new Date('2026-09-05T12:30:00.000Z'));

        expect(range).toEqual({
            start: new Date('2026-08-31T00:00:00.000Z'),
            endExclusive: new Date('2026-09-07T00:00:00.000Z'),
            startDate: '2026-08-31',
            endDate: '2026-09-06',
        });
    });

    test('keeps Monday inside the week beginning that day', () => {
        const range = getCurrentWeekRange(new Date('2026-09-07T23:59:59.999Z'));

        expect(range.startDate).toBe('2026-09-07');
        expect(range.endDate).toBe('2026-09-13');
    });

    test('uses the first and last calendar days of the current month', () => {
        const range = getCurrentMonthRange(new Date('2028-02-17T05:00:00.000Z'));

        expect(range).toEqual({
            start: new Date('2028-02-01T00:00:00.000Z'),
            endExclusive: new Date('2028-03-01T00:00:00.000Z'),
            startDate: '2028-02-01',
            endDate: '2028-02-29',
        });
    });

    test('requires one positive integer authId', () => {
        expect(parseRequiredAuthId('42')).toBe(42);
        expect(() => parseRequiredAuthId(undefined)).toThrow(ApiError);
        expect(() => parseRequiredAuthId(['1', '2'])).toThrow(ApiError);
        expect(() => parseRequiredAuthId('0')).toThrow(ApiError);
    });
});
