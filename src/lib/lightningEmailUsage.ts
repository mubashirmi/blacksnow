import { getEmailUsageTotal } from '@/lib/emailUsagePeriod';

type LightningEmailRole = 'LightningSilver' | 'LightningGold';

const MICROS_PER_DOLLAR = 1_000_000;
export const LIGHTNING_EMAIL_PRICE_MICROS = 5_000;

function moneyFromMicros(micros: number | bigint) {
    return {
        amount: Number((Number(micros) / MICROS_PER_DOLLAR).toFixed(6)),
        currency: 'USD' as const,
    };
}

export async function getLightningEmailUsage(authId: number, role: LightningEmailRole, now = new Date()) {
    const usage = await getEmailUsageTotal(authId, 'monthly', now, role);
    const billableEmails = usage.totalEmailsSent;
    const chargeMicros = BigInt(billableEmails) * BigInt(LIGHTNING_EMAIL_PRICE_MICROS);

    return {
        billingMonth: usage.range.startDate.slice(0, 7),
        timezone: usage.timezone,
        range: usage.range,
        emailsSentThisMonth: usage.totalEmailsSent,
        includedEmails: 0,
        billableEmails,
        pricePerEmail: moneyFromMicros(LIGHTNING_EMAIL_PRICE_MICROS),
        emailCharges: moneyFromMicros(chargeMicros),
    };
}
