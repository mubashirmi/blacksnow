import { ApiError } from './apiErrors';
import {
    buildAdminRevenueReport,
    buildAdminSubscriptionRevenueReport,
    calculatePlatformFeeAmount,
    collectEligibleRevenueRecords,
    getAdminRevenueRanges,
    getConfiguredAdminRevenueTimeZone,
    getConfiguredInvoicePlatformFeePercent,
    getNetRevenueBaseAmount,
    parseRevenueCurrency,
    paymentStatusIsSuccessful,
} from './subscriptionPlatformRevenue';

describe('admin subscription invoice revenue', () => {
    test('reads and validates the configured reporting timezone', () => {
        expect(getConfiguredAdminRevenueTimeZone('Asia/Karachi')).toBe('Asia/Karachi');
        expect(() => getConfiguredAdminRevenueTimeZone('Not/A_Timezone')).toThrow(ApiError);
    });

    test('reads and validates the configured platform fee percentage', () => {
        expect(getConfiguredInvoicePlatformFeePercent('8')).toBe(8);
        expect(getConfiguredInvoicePlatformFeePercent('7.5')).toBe(7.5);
        expect(() => getConfiguredInvoicePlatformFeePercent('invalid')).toThrow(ApiError);
        expect(() => getConfiguredInvoicePlatformFeePercent('101')).toThrow(ApiError);
    });

    test('rounds each platform fee in minor currency units', () => {
        expect(calculatePlatformFeeAmount(1_001, 8)).toBe(80);
    });

    test('uses UTC calendar boundaries for today, Monday-Sunday, and the month', () => {
        const ranges = getAdminRevenueRanges(new Date('2026-09-05T12:00:00.000Z'), 'UTC');

        expect(ranges.today.startDate).toBe('2026-09-05');
        expect(ranges.today.endDate).toBe('2026-09-05');
        expect(ranges.today.start.toISOString()).toBe('2026-09-05T00:00:00.000Z');
        expect(ranges.today.endExclusive.toISOString()).toBe('2026-09-05T12:00:00.001Z');
        expect(ranges.weekly.startDate).toBe('2026-08-31');
        expect(ranges.weekly.endDate).toBe('2026-09-06');
        expect(ranges.weekly.start.toISOString()).toBe('2026-08-31T00:00:00.000Z');
        expect(ranges.weekly.endExclusive.toISOString()).toBe('2026-09-07T00:00:00.000Z');
        expect(ranges.monthly.startDate).toBe('2026-09-01');
        expect(ranges.monthly.endDate).toBe('2026-09-30');
        expect(ranges.monthly.start.toISOString()).toBe('2026-09-01T00:00:00.000Z');
        expect(ranges.monthly.endExclusive.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    });

    test('calculates boundaries in the configured timezone before converting them to UTC', () => {
        const ranges = getAdminRevenueRanges(new Date('2026-09-06T20:30:00.000Z'), 'Asia/Karachi');

        expect(ranges.today.startDate).toBe('2026-09-07');
        expect(ranges.today.start.toISOString()).toBe('2026-09-06T19:00:00.000Z');
        expect(ranges.weekly.startDate).toBe('2026-09-07');
        expect(ranges.weekly.endDate).toBe('2026-09-13');
    });

    test('returns all four revenue periods in one report', () => {
        const report = buildAdminSubscriptionRevenueReport(
            [
                { baseAmount: 1_000, paymentDate: new Date('2026-09-05T10:00:00.000Z') },
                { baseAmount: 2_000, paymentDate: new Date('2026-09-01T10:00:00.000Z') },
                { baseAmount: 3_000, paymentDate: new Date('2026-08-15T10:00:00.000Z') },
            ],
            8,
            'usd',
            new Date('2026-09-05T12:00:00.000Z'),
            'UTC'
        );

        expect(report.periods.today.revenue.amountMinor).toBe(80);
        expect(report.periods.weekly.revenue.amountMinor).toBe(240);
        expect(report.periods.monthly.revenue.amountMinor).toBe(240);
        expect(report.periods.total.revenue.amountMinor).toBe(480);
    });

    test('separates invoice and subscription invoice platform revenue', () => {
        const report = buildAdminRevenueReport(
            [
                { baseAmount: 1_000, paymentDate: new Date('2026-09-05T10:00:00.000Z') },
                { baseAmount: 3_000, paymentDate: new Date('2026-08-15T10:00:00.000Z') },
            ],
            [{ baseAmount: 2_000, paymentDate: new Date('2026-09-01T10:00:00.000Z') }],
            8,
            'usd',
            new Date('2026-09-05T12:00:00.000Z'),
            'UTC'
        );

        expect(report).toEqual({
            today: { invoiceRevenue: 0.8, subscriptionInvRevenue: 0, totalRevenue: 0.8 },
            weekly: { invoiceRevenue: 0.8, subscriptionInvRevenue: 1.6, totalRevenue: 2.4 },
            monthly: { invoiceRevenue: 0.8, subscriptionInvRevenue: 1.6, totalRevenue: 2.4 },
            total: { invoiceRevenue: 3.2, subscriptionInvRevenue: 1.6, totalRevenue: 4.8 },
        });
    });

    test('does not include future-dated payments in today revenue', () => {
        const report = buildAdminRevenueReport(
            [{ baseAmount: 1_000, paymentDate: new Date('2026-09-05T12:00:00.001Z') }],
            [],
            8,
            'usd',
            new Date('2026-09-05T12:00:00.000Z'),
            'UTC'
        );

        expect(report.today.totalRevenue).toBe(0);
        expect(report.weekly.totalRevenue).toBe(0.8);
    });

    test('accepts successful payments and rejects cancelled or failed payments', () => {
        expect(paymentStatusIsSuccessful('paid', null)).toBe(true);
        expect(paymentStatusIsSuccessful(null, new Date('2026-09-05T10:00:00.000Z'))).toBe(true);
        expect(paymentStatusIsSuccessful('failed', new Date('2026-09-05T10:00:00.000Z'))).toBe(false);
        expect(paymentStatusIsSuccessful('cancelled', null)).toBe(false);
    });

    test('deducts only successful refunds that reversed the application fee', () => {
        expect(
            getNetRevenueBaseAmount({
                baseAmount: 10_000,
                refunds: [
                    { amount: 2_000, status: 'succeeded', refundApplicationFee: true },
                    { amount: 1_000, status: 'failed', refundApplicationFee: true },
                    { amount: 3_000, status: 'succeeded', refundApplicationFee: false },
                ],
                legacyRefunded: false,
                legacyRefundedAmount: 0,
            })
        ).toBe(8_000);
    });

    test('uses paid child transactions and does not double-count their parent invoice', () => {
        const records = collectEligibleRevenueRecords([
            {
                createdAt: new Date('2026-08-01T00:00:00.000Z'),
                paid: true,
                subscriptionStartedAt: new Date('2026-08-02T00:00:00.000Z'),
                baseAmount: 99_999,
                refunded: false,
                refundedAmount: 0,
                refunds: [],
                payments: [
                    {
                        createdAt: new Date('2026-09-05T09:00:00.000Z'),
                        paidAt: new Date('2026-09-05T10:00:00.000Z'),
                        paymentStatus: 'paid',
                        baseAmount: 1_000,
                        refunded: false,
                        refundedAmount: 0,
                        refunds: [],
                    },
                ],
            },
        ]);

        expect(records).toEqual([{ baseAmount: 1_000, paymentDate: new Date('2026-09-05T10:00:00.000Z') }]);
    });

    test('does not fall back to a stale paid parent when normalized payments failed', () => {
        const records = collectEligibleRevenueRecords([
            {
                createdAt: new Date('2026-09-05T08:00:00.000Z'),
                paid: true,
                subscriptionStartedAt: null,
                baseAmount: 1_000,
                refunded: false,
                refundedAmount: 0,
                refunds: [],
                payments: [
                    {
                        createdAt: new Date('2026-09-05T09:00:00.000Z'),
                        paidAt: null,
                        paymentStatus: 'failed',
                        baseAmount: 1_000,
                        refunded: false,
                        refundedAmount: 0,
                        refunds: [],
                    },
                ],
            },
        ]);

        expect(records).toEqual([]);
    });

    test('validates an optional currency filter', () => {
        expect(parseRevenueCurrency(undefined)).toBe('usd');
        expect(parseRevenueCurrency('GBP')).toBe('gbp');
        expect(() => parseRevenueCurrency('dollars')).toThrow(ApiError);
        expect(() => parseRevenueCurrency(['usd', 'gbp'])).toThrow(ApiError);
    });
});
