import { ApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { DateTime } from 'luxon';

export const DEFAULT_INVOICE_PLATFORM_FEE_PERCENT = 8;
export const DEFAULT_ADMIN_REVENUE_TIME_ZONE = 'America/New_York';
export const ADMIN_REVENUE_WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const ADMIN_REVENUE_MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
] as const;

type RefundRecord = {
    amount: number;
    status: string | null;
    refundApplicationFee: boolean;
};

type PaymentRecord = {
    createdAt: Date;
    paidAt: Date | null;
    paymentStatus: string | null;
    baseAmount: number;
    refunded: boolean;
    refundedAmount: number;
    refunds: RefundRecord[];
};

type RevenueSourceRecord = {
    createdAt: Date;
    paid: boolean;
    subscriptionStartedAt: Date | null;
    baseAmount: number;
    refunded: boolean;
    refundedAmount: number;
    refunds: RefundRecord[];
    payments: PaymentRecord[];
};

export type SubscriptionRevenueRecord = {
    baseAmount: number;
    paymentDate: Date;
};

type PeriodRange = {
    start: Date;
    endExclusive: Date;
    startDate: string;
    endDate: string;
};

const ZERO_DECIMAL_CURRENCIES = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);
const SUCCESSFUL_PAYMENT_STATUSES = new Set(['paid', 'succeeded', 'success', 'complete', 'completed']);
const FAILED_PAYMENT_STATUSES = new Set(['failed', 'canceled', 'cancelled', 'unpaid', 'void', 'uncollectible', 'requires_payment_method', 'requires_action']);
const SUCCESSFUL_REFUND_STATUSES = new Set(['succeeded', 'success', 'complete', 'completed']);

function buildRange(start: DateTime, endExclusive: DateTime, displayEnd = endExclusive.minus({ days: 1 })): PeriodRange {
    return {
        start: start.toUTC().toJSDate(),
        endExclusive: endExclusive.toUTC().toJSDate(),
        startDate: start.toISODate() as string,
        endDate: displayEnd.toISODate() as string,
    };
}

export function getConfiguredAdminRevenueTimeZone(value = process.env.REPORTING_TIMEZONE): string {
    const timeZone = value?.trim() || DEFAULT_ADMIN_REVENUE_TIME_ZONE;

    if (!DateTime.now().setZone(timeZone).isValid) {
        throw new ApiError(500, 'INVALID_CONFIGURATION', 'REPORTING_TIMEZONE must be a valid IANA timezone');
    }

    return timeZone;
}

export function getAdminRevenueRanges(now = new Date(), timeZone = getConfiguredAdminRevenueTimeZone()) {
    if (Number.isNaN(now.getTime())) {
        throw new ApiError(500, 'INVALID_REPORTING_DATE', 'The reporting date is invalid');
    }

    const zonedNow = DateTime.fromJSDate(now).setZone(timeZone);
    const todayStart = zonedNow.startOf('day');
    const weekStart = zonedNow.startOf('week');
    const monthStart = zonedNow.startOf('month');
    const yearStart = zonedNow.startOf('year');

    return {
        // Add one millisecond because range comparisons use an exclusive end.
        // This includes a payment whose timestamp exactly matches `now` while
        // excluding any future-dated records later today.
        today: buildRange(todayStart, zonedNow.plus({ milliseconds: 1 }), zonedNow),
        weekly: buildRange(weekStart, weekStart.plus({ weeks: 1 })),
        monthly: buildRange(monthStart, monthStart.plus({ months: 1 })),
        weeklyDays: ADMIN_REVENUE_WEEK_DAYS.map((day, index) => {
            const dayStart = weekStart.plus({ days: index });

            return {
                day,
                range: buildRange(dayStart, dayStart.plus({ days: 1 })),
            };
        }),
        monthlyMonths: ADMIN_REVENUE_MONTHS.map((month, index) => {
            const currentMonthStart = yearStart.plus({ months: index });

            return {
                month,
                range: buildRange(currentMonthStart, currentMonthStart.plus({ months: 1 })),
            };
        }),
        yearlyYears: Array.from({ length: 5 }, (_, index) => {
            const currentYearStart = yearStart.plus({ years: index - 3 });

            return {
                year: currentYearStart.year,
                range: buildRange(currentYearStart, currentYearStart.plus({ years: 1 })),
            };
        }),
    };
}

export function getConfiguredInvoicePlatformFeePercent(value = process.env.INVOICE_PLATFORM_FEE_PERCENT): number {
    const percentage = value === undefined || value.trim() === '' ? DEFAULT_INVOICE_PLATFORM_FEE_PERCENT : Number(value);

    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
        throw new ApiError(500, 'INVALID_CONFIGURATION', 'INVOICE_PLATFORM_FEE_PERCENT must be a number between 0 and 100');
    }

    return percentage;
}

export function calculatePlatformFeeAmount(baseAmount: number, platformFeePercent: number): number {
    if (!Number.isInteger(baseAmount) || baseAmount < 0) {
        throw new ApiError(500, 'INVALID_SUBSCRIPTION_AMOUNT', 'A paid subscription invoice has an invalid base amount');
    }

    return Math.round((baseAmount * platformFeePercent) / 100);
}

export function parseRevenueCurrency(value: string | string[] | undefined): string {
    if (Array.isArray(value)) {
        throw new ApiError(400, 'INVALID_QUERY', 'currency must be provided once');
    }

    const currency = (value ?? 'usd').trim().toLowerCase();

    if (!/^[a-z]{3}$/.test(currency)) {
        throw new ApiError(400, 'INVALID_QUERY', 'currency must be a three-letter currency code');
    }

    return currency;
}

function money(amountMinor: number, currency: string) {
    const divisor = ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;

    return {
        amount: Number((amountMinor / divisor).toFixed(divisor === 1 ? 0 : 2)),
        amountMinor,
        currency: currency.toUpperCase(),
    };
}

function isWithinRange(date: Date, range: PeriodRange): boolean {
    return date >= range.start && date < range.endExclusive;
}

function periodRevenue(records: SubscriptionRevenueRecord[], range: PeriodRange, platformFeePercent: number, currency: string) {
    const applicableRecords = records.filter((record) => isWithinRange(record.paymentDate, range));
    const amountMinor = applicableRecords.reduce((total, record) => total + calculatePlatformFeeAmount(record.baseAmount, platformFeePercent), 0);

    return {
        startDate: range.startDate,
        endDate: range.endDate,
        eligiblePaymentCount: applicableRecords.length,
        revenue: money(amountMinor, currency),
    };
}

export function buildAdminSubscriptionRevenueReport(
    records: SubscriptionRevenueRecord[],
    platformFeePercent: number,
    currency: string,
    now = new Date(),
    timeZone = getConfiguredAdminRevenueTimeZone()
) {
    const ranges = getAdminRevenueRanges(now, timeZone);
    const totalAmountMinor = records.reduce((total, record) => total + calculatePlatformFeeAmount(record.baseAmount, platformFeePercent), 0);

    return {
        timezone: timeZone,
        currency: currency.toUpperCase(),
        platformFeePercent,
        periods: {
            today: periodRevenue(records, ranges.today, platformFeePercent, currency),
            weekly: periodRevenue(records, ranges.weekly, platformFeePercent, currency),
            monthly: periodRevenue(records, ranges.monthly, platformFeePercent, currency),
            total: {
                startDate: null,
                endDate: null,
                eligiblePaymentCount: records.length,
                revenue: money(totalAmountMinor, currency),
            },
        },
    };
}

function revenueAmount(records: SubscriptionRevenueRecord[], platformFeePercent: number, currency: string): number {
    const amountMinor = records.reduce((total, record) => total + calculatePlatformFeeAmount(record.baseAmount, platformFeePercent), 0);

    return money(amountMinor, currency).amount;
}

function splitRevenueForPeriod(
    invoiceRecords: SubscriptionRevenueRecord[],
    subscriptionInvRecords: SubscriptionRevenueRecord[],
    platformFeePercent: number,
    currency: string,
    range?: PeriodRange
) {
    const applicableInvoices = range ? invoiceRecords.filter((record) => isWithinRange(record.paymentDate, range)) : invoiceRecords;
    const applicableSubscriptionInvoices = range ? subscriptionInvRecords.filter((record) => isWithinRange(record.paymentDate, range)) : subscriptionInvRecords;
    const invoiceRevenue = revenueAmount(applicableInvoices, platformFeePercent, currency);
    const subscriptionInvRevenue = revenueAmount(applicableSubscriptionInvoices, platformFeePercent, currency);

    return {
        invoiceRevenue,
        subscriptionInvRevenue,
        totalRevenue: Number((invoiceRevenue + subscriptionInvRevenue).toFixed(ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2)),
    };
}

export function buildAdminRevenueReport(
    invoiceRecords: SubscriptionRevenueRecord[],
    subscriptionInvRecords: SubscriptionRevenueRecord[],
    platformFeePercent: number,
    currency: string,
    now = new Date(),
    timeZone = getConfiguredAdminRevenueTimeZone()
) {
    const ranges = getAdminRevenueRanges(now, timeZone);

    return {
        today: splitRevenueForPeriod(invoiceRecords, subscriptionInvRecords, platformFeePercent, currency, ranges.today),
        weekly: ranges.weeklyDays.map(({ day, range }) => ({
            day,
            ...splitRevenueForPeriod(invoiceRecords, subscriptionInvRecords, platformFeePercent, currency, range),
        })),
        monthly: ranges.monthlyMonths.map(({ month, range }) => ({
            month,
            ...splitRevenueForPeriod(invoiceRecords, subscriptionInvRecords, platformFeePercent, currency, range),
        })),
        yearly: ranges.yearlyYears.map(({ year, range }) => ({
            year,
            ...splitRevenueForPeriod(invoiceRecords, subscriptionInvRecords, platformFeePercent, currency, range),
        })),
        total: splitRevenueForPeriod(invoiceRecords, subscriptionInvRecords, platformFeePercent, currency),
    };
}

function normalizedStatus(status: string | null): string {
    return status?.trim().toLowerCase() ?? '';
}

export function paymentStatusIsSuccessful(status: string | null, paidAt: Date | null): boolean {
    const normalized = normalizedStatus(status);

    if (FAILED_PAYMENT_STATUSES.has(normalized)) return false;

    return paidAt !== null || SUCCESSFUL_PAYMENT_STATUSES.has(normalized);
}

export function getNetRevenueBaseAmount(params: {
    baseAmount: number;
    refunds: RefundRecord[];
    legacyRefunded: boolean;
    legacyRefundedAmount: number;
}): number {
    const { baseAmount, refunds, legacyRefunded, legacyRefundedAmount } = params;

    if (!Number.isInteger(baseAmount) || baseAmount < 0) {
        throw new ApiError(500, 'INVALID_SUBSCRIPTION_AMOUNT', 'A paid subscription invoice has an invalid base amount');
    }

    let reversedAmount: number;

    if (refunds.length > 0) {
        reversedAmount = Math.min(
            refunds.reduce((total, refund) => {
                const feeWasReversed = refund.refundApplicationFee && SUCCESSFUL_REFUND_STATUSES.has(normalizedStatus(refund.status));
                return feeWasReversed ? total + Math.max(refund.amount, 0) : total;
            }, 0),
            baseAmount
        );
    } else if (legacyRefunded) {
        reversedAmount = baseAmount;
    } else {
        reversedAmount = Math.min(Math.max(legacyRefundedAmount, 0), baseAmount);
    }

    return Math.max(baseAmount - reversedAmount, 0);
}

export function collectEligibleRevenueRecords(sources: RevenueSourceRecord[]): SubscriptionRevenueRecord[] {
    const records: SubscriptionRevenueRecord[] = [];

    for (const source of sources) {
        const successfulPayments = source.payments.filter((payment) => paymentStatusIsSuccessful(payment.paymentStatus, payment.paidAt));

        if (source.payments.length > 0) {
            for (const payment of successfulPayments) {
                const netBaseAmount = getNetRevenueBaseAmount({
                    baseAmount: payment.baseAmount,
                    refunds: payment.refunds,
                    legacyRefunded: payment.refunded,
                    legacyRefundedAmount: payment.refundedAmount,
                });

                if (netBaseAmount > 0) {
                    records.push({
                        baseAmount: netBaseAmount,
                        paymentDate: payment.paidAt ?? payment.createdAt,
                    });
                }
            }

            // Parent rows mirror payment state and must never be counted when
            // normalized payment rows are available, even if every payment
            // row failed. Falling back here could count a stale `paid` flag.
            continue;
        }

        // Legacy payments were stored only on the parent invoice record.
        // subscriptionStartedAt remains proof of payment after cancellation.
        if (!source.paid && !source.subscriptionStartedAt) continue;

        const netBaseAmount = getNetRevenueBaseAmount({
            baseAmount: source.baseAmount,
            refunds: source.refunds,
            legacyRefunded: source.refunded,
            legacyRefundedAmount: source.refundedAmount,
        });

        if (netBaseAmount > 0) {
            records.push({
                baseAmount: netBaseAmount,
                paymentDate: source.subscriptionStartedAt ?? source.createdAt,
            });
        }
    }

    return records;
}

async function getRevenueRecordsBySource(currency: string) {
    const refundSelect = {
        amount: true,
        status: true,
        refundApplicationFee: true,
    } as const;
    const paymentSelect = {
        createdAt: true,
        paidAt: true,
        paymentStatus: true,
        baseAmount: true,
        refunded: true,
        refundedAmount: true,
        refunds: { select: refundSelect },
    } as const;
    const parentSelect = {
        createdAt: true,
        paid: true,
        subscriptionStartedAt: true,
        baseAmount: true,
        refunded: true,
        refundedAmount: true,
    } as const;

    const [invoices, subscriptionInvoices] = await Promise.all([
        prisma.invoice.findMany({
            where: { currency },
            select: {
                ...parentSelect,
                invoiceRefunds: { select: refundSelect },
                invoicePayments: { where: { currency }, select: paymentSelect },
            },
        }),
        prisma.subscriptionInv.findMany({
            where: { currency },
            select: {
                ...parentSelect,
                subscriptionInvRefunds: { select: refundSelect },
                subscriptionInvPayments: { where: { currency }, select: paymentSelect },
            },
        }),
    ]);

    const invoiceSources: RevenueSourceRecord[] = invoices.map((invoice) => ({
        ...invoice,
        refunds: invoice.invoiceRefunds,
        payments: invoice.invoicePayments,
    }));
    const subscriptionInvSources: RevenueSourceRecord[] = subscriptionInvoices.map((invoice) => ({
        ...invoice,
        refunds: invoice.subscriptionInvRefunds,
        payments: invoice.subscriptionInvPayments,
    }));

    return {
        invoiceRecords: collectEligibleRevenueRecords(invoiceSources),
        subscriptionInvRecords: collectEligibleRevenueRecords(subscriptionInvSources),
    };
}

export async function getAdminSubscriptionRevenue(currency: string, now = new Date()) {
    const platformFeePercent = getConfiguredInvoicePlatformFeePercent();
    const timeZone = getConfiguredAdminRevenueTimeZone();
    const { invoiceRecords, subscriptionInvRecords } = await getRevenueRecordsBySource(currency);
    const records = [...invoiceRecords, ...subscriptionInvRecords];

    return buildAdminSubscriptionRevenueReport(records, platformFeePercent, currency, now, timeZone);
}

export async function getAdminRevenue(currency: string, now = new Date()) {
    const platformFeePercent = getConfiguredInvoicePlatformFeePercent();
    const timeZone = getConfiguredAdminRevenueTimeZone();
    const { invoiceRecords, subscriptionInvRecords } = await getRevenueRecordsBySource(currency);

    return buildAdminRevenueReport(invoiceRecords, subscriptionInvRecords, platformFeePercent, currency, now, timeZone);
}
