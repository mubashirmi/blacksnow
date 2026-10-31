import { getLightningEmailUsage } from '@/lib/lightningEmailUsage';
import prisma from '@/lib/prisma';

import { getLightningReferralEarnings, getLightningSubscription } from './lightningUserReports';

jest.mock('./lightningEmailUsage', () => ({ getLightningEmailUsage: jest.fn() }));
jest.mock('./subscriptionPlatformRevenue', () => ({
    getConfiguredAdminRevenueTimeZone: jest.fn(() => 'UTC'),
    getAdminRevenueRanges: jest.fn(() => ({
        monthly: {
            start: new Date('2026-10-01T00:00:00.000Z'),
            endExclusive: new Date('2026-11-01T00:00:00.000Z'),
            startDate: '2026-10-01',
            endDate: '2026-10-31',
        },
    })),
}));
jest.mock('./prisma', () => ({
    __esModule: true,
    default: {
        auth: { findUnique: jest.fn() },
        referralProducts: { aggregate: jest.fn() },
        adminRevenue: { findUnique: jest.fn() },
        adminPayouts: { findMany: jest.fn() },
        checkout: { findMany: jest.fn() },
        $transaction: jest.fn((operations) => Promise.all(operations)),
    },
}));

const findUser = prisma.auth.findUnique as jest.Mock;
const aggregateEarnings = prisma.referralProducts.aggregate as jest.Mock;
const findRevenue = prisma.adminRevenue.findUnique as jest.Mock;
const findPayouts = prisma.adminPayouts.findMany as jest.Mock;
const findCheckouts = prisma.checkout.findMany as jest.Mock;
const lightningEmailUsage = getLightningEmailUsage as jest.Mock;

const emailUsage = {
    billingMonth: '2026-10',
    timezone: 'UTC',
    range: { startDate: '2026-10-01', endDate: '2026-10-31' },
    emailsSentThisMonth: 200,
    includedEmails: 0,
    billableEmails: 200,
    pricePerEmail: { amount: 0.005, currency: 'USD' },
    emailCharges: { amount: 1, currency: 'USD' },
};

describe('Lightning user reports email usage', () => {
    beforeEach(() => {
        findUser.mockResolvedValue({
            id: 27,
            email: 'lightning@example.com',
            firstName: 'Lightning',
            lastName: 'User',
            roles: ['LightningSilver', 'LightningGold'],
            adminStripeConnectId: null,
        });
        aggregateEarnings.mockResolvedValue({ _sum: { comission: 25 } });
        findRevenue.mockResolvedValue({ revenue: 10 });
        findPayouts.mockResolvedValue([]);
        findCheckouts.mockResolvedValue([]);
        lightningEmailUsage.mockResolvedValue(emailUsage);
    });

    test('adds email usage and charges to Silver referral earnings', async () => {
        const now = new Date('2026-10-30T00:00:00.000Z');
        const report = await getLightningReferralEarnings(27, 'LightningSilver', now);

        expect(lightningEmailUsage).toHaveBeenCalledWith(27, 'LightningSilver', now);
        expect(report.emailUsage).toEqual(emailUsage);
        expect(report.totalEarned).toBe(25);
    });

    test('adds email usage and charges to Gold subscription responses without changing existing fields', async () => {
        const now = new Date('2026-10-30T00:00:00.000Z');
        const report = await getLightningSubscription(27, 'LightningGold', now);

        expect(lightningEmailUsage).toHaveBeenCalledWith(27, 'LightningGold', now);
        expect(report).toEqual(
            expect.objectContaining({
                subscription: null,
                transactions: [],
                nextBillingDate: null,
                emailUsage,
            })
        );
    });
});
