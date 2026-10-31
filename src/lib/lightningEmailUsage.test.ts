import { getEmailUsageTotal } from '@/lib/emailUsagePeriod';

import { getLightningEmailUsage, LIGHTNING_EMAIL_PRICE_MICROS } from './lightningEmailUsage';

jest.mock('./emailUsagePeriod', () => ({ getEmailUsageTotal: jest.fn() }));

const emailUsageTotal = getEmailUsageTotal as jest.Mock;

describe('Lightning email usage charges', () => {
    test('charges every successfully sent email at $0.005 with no included allowance', async () => {
        emailUsageTotal.mockResolvedValue({
            authId: 27,
            period: 'monthly',
            timezone: 'UTC',
            range: { startDate: '2026-10-01', endDate: '2026-10-31' },
            totalEmailsSent: 1234,
        });

        const result = await getLightningEmailUsage(27, 'LightningSilver', new Date('2026-10-30T00:00:00.000Z'));

        expect(LIGHTNING_EMAIL_PRICE_MICROS).toBe(5000);
        expect(emailUsageTotal).toHaveBeenCalledWith(27, 'monthly', new Date('2026-10-30T00:00:00.000Z'), 'LightningSilver');
        expect(result).toEqual({
            billingMonth: '2026-10',
            timezone: 'UTC',
            range: { startDate: '2026-10-01', endDate: '2026-10-31' },
            emailsSentThisMonth: 1234,
            includedEmails: 0,
            billableEmails: 1234,
            pricePerEmail: { amount: 0.005, currency: 'USD' },
            emailCharges: { amount: 6.17, currency: 'USD' },
        });
    });

    test('returns zero charges when no email was sent', async () => {
        emailUsageTotal.mockResolvedValue({
            timezone: 'UTC',
            range: { startDate: '2026-10-01', endDate: '2026-10-31' },
            totalEmailsSent: 0,
        });

        await expect(getLightningEmailUsage(27, 'LightningGold')).resolves.toEqual(
            expect.objectContaining({ billableEmails: 0, emailCharges: { amount: 0, currency: 'USD' } })
        );
    });
});
