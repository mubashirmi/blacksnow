export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

type WeekDay = (typeof WEEK_DAYS)[number];
type Month = (typeof MONTHS)[number];

export type ProductRevenueTransaction = {
    product: string | null;
    amount: number;
    createdAt: Date;
};

export type ProductRevenueEntry = {
    product: string;
    weekly: Array<{ day: WeekDay; revenue: number }>;
    monthly: Array<{ month: Month; revenue: number }>;
    yearly: Array<{ year: number; revenue: number }>;
};

export type ProductRevenueMap = Record<string, ProductRevenueEntry>;

export function getProductRevenueDateRange(now = new Date()) {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEndExclusive = new Date(now.getFullYear() + 1, 0, 1);
    const yearlyStart = new Date(now.getFullYear() - 3, 0, 1);
    const yearlyEndExclusive = new Date(now.getFullYear() + 2, 0, 1);
    const daysSinceMonday = (now.getDay() + 6) % 7;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
    const weekEndExclusive = new Date(weekStart);
    weekEndExclusive.setDate(weekEndExclusive.getDate() + 7);

    return {
        weekStart,
        weekEndExclusive,
        yearStart,
        yearEndExclusive,
        yearlyStart,
        yearlyEndExclusive,
        yearlyYears: Array.from({ length: 5 }, (_, index) => now.getFullYear() + index - 3),
        queryStart: new Date(Math.min(weekStart.getTime(), yearlyStart.getTime())),
        queryEndExclusive: new Date(Math.max(weekEndExclusive.getTime(), yearlyEndExclusive.getTime())),
    };
}

function emptyProductRevenue(product: string, yearlyYears: number[]): ProductRevenueEntry {
    return {
        product,
        weekly: WEEK_DAYS.map((day) => ({ day, revenue: 0 })),
        monthly: MONTHS.map((month) => ({ month, revenue: 0 })),
        yearly: yearlyYears.map((year) => ({ year, revenue: 0 })),
    };
}

export function buildProductRevenueMap(productNames: string[], transactions: ProductRevenueTransaction[], now = new Date()): ProductRevenueMap {
    const ranges = getProductRevenueDateRange(now);
    const revenueMap: ProductRevenueMap = {};

    for (const productName of productNames) {
        if (!revenueMap[productName]) {
            revenueMap[productName] = emptyProductRevenue(productName, ranges.yearlyYears);
        }
    }

    for (const transaction of transactions) {
        if (!transaction.product || Number.isNaN(transaction.createdAt.getTime())) continue;

        const productRevenue = revenueMap[transaction.product] ?? emptyProductRevenue(transaction.product, ranges.yearlyYears);
        revenueMap[transaction.product] = productRevenue;

        if (transaction.createdAt >= ranges.weekStart && transaction.createdAt < ranges.weekEndExclusive) {
            const dayIndex = (transaction.createdAt.getDay() + 6) % 7;
            productRevenue.weekly[dayIndex].revenue += transaction.amount;
        }

        if (transaction.createdAt >= ranges.yearStart && transaction.createdAt < ranges.yearEndExclusive) {
            productRevenue.monthly[transaction.createdAt.getMonth()].revenue += transaction.amount;
        }

        if (transaction.createdAt >= ranges.yearlyStart && transaction.createdAt < ranges.yearlyEndExclusive) {
            const yearIndex = transaction.createdAt.getFullYear() - ranges.yearlyStart.getFullYear();
            productRevenue.yearly[yearIndex].revenue += transaction.amount;
        }
    }

    return revenueMap;
}
