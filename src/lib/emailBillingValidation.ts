import { ApiError } from './apiErrors';

export function getUtcDateKey(date = new Date()): string {
    return date.toISOString().slice(0, 10);
}

export function parseDateKey(value: string | string[] | undefined, options: { required?: boolean; allowFuture?: boolean } = {}): string {
    if (value === undefined) {
        if (options.required) throw new ApiError(400, 'DATE_REQUIRED', 'date is required in YYYY-MM-DD format');
        return getUtcDateKey();
    }

    if (Array.isArray(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new ApiError(400, 'INVALID_DATE', 'date must use YYYY-MM-DD format');
    }

    const parsed = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(parsed.getTime()) || getUtcDateKey(parsed) !== value) {
        throw new ApiError(400, 'INVALID_DATE', 'date must be a valid calendar date');
    }

    if (!options.allowFuture && value > getUtcDateKey()) {
        throw new ApiError(400, 'INVALID_DATE', 'date cannot be in the future');
    }

    return value;
}

export function getUtcDayRange(dateKey: string) {
    const start = new Date(`${dateKey}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    return { start, end };
}

export function getUtcMonthRange(dateKey: string) {
    const year = Number(dateKey.slice(0, 4));
    const monthIndex = Number(dateKey.slice(5, 7)) - 1;

    return {
        month: dateKey.slice(0, 7),
        start: new Date(Date.UTC(year, monthIndex, 1)),
        end: new Date(Date.UTC(year, monthIndex + 1, 1)),
    };
}

export function calculateMonthlyDayUsage(monthlyLimit: number, emailsBeforeDay: number, emailsSentToday: number) {
    const normalizedLimit = Math.max(monthlyLimit, 0);
    const normalizedBeforeDay = Math.max(emailsBeforeDay, 0);
    const normalizedSentToday = Math.max(emailsSentToday, 0);
    const remainingMonthlyAllowanceAtStartOfDay = Math.max(normalizedLimit - normalizedBeforeDay, 0);
    const emailsSentThisMonth = normalizedBeforeDay + normalizedSentToday;

    return {
        remainingMonthlyAllowanceAtStartOfDay,
        overageEmailCount: Math.max(normalizedSentToday - remainingMonthlyAllowanceAtStartOfDay, 0),
        emailsSentThisMonth,
        remainingMonthlyUsage: Math.max(normalizedLimit - emailsSentThisMonth, 0),
        monthlyOverageEmailCount: Math.max(emailsSentThisMonth - normalizedLimit, 0),
    };
}

export function parsePagination(query: { page?: string | string[]; limit?: string | string[] }) {
    const parse = (value: string | string[] | undefined, fallback: number, field: string) => {
        if (value === undefined) return fallback;
        if (Array.isArray(value)) throw new ApiError(400, 'INVALID_QUERY', `${field} must be provided once`);

        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed <= 0) throw new ApiError(400, 'INVALID_QUERY', `${field} must be a positive integer`);
        return parsed;
    };

    const page = parse(query.page, 1, 'page');
    const limit = parse(query.limit, 25, 'limit');

    if (limit > 100) throw new ApiError(400, 'INVALID_QUERY', 'limit cannot exceed 100');

    return { page, limit };
}
