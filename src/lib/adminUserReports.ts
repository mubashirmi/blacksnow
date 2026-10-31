import { Prisma, Role } from '@prisma/client';

import { getBusinessInvoiceUserBilling } from '@/lib/businessInvoiceUserBilling';
import { getBusinessInvoiceUserEarnings } from '@/lib/businessInvoiceUserEarnings';
import { getDigitalBillboardSubscription } from '@/lib/digitalBillboardUserReports';
import { getEmailCrmBilling, getEmailCrmUsage } from '@/lib/emailCrmUserReports';
import { getLightningReferralEarnings, getLightningSubscription, type LightningSubscriptionType } from '@/lib/lightningUserReports';
import prisma from '@/lib/prisma';

const REPORT_CONCURRENCY = 2;
const DIGITAL_BILLBOARD_PRODUCTS = ['DigitalBillboard', 'digitalBillboard', 'digitalbillboard'];
const LIGHTNING_PRODUCTS: Record<LightningSubscriptionType, string[]> = {
    LightningSilver: ['LightningSilver', 'lightningSilver'],
    LightningGold: ['LightningGold', 'lightningGold'],
};

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
    const results = new Array<R>(items.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < items.length) {
            const index = nextIndex++;
            results[index] = await mapper(items[index]);
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
    return results;
}

async function getReportsForUsers<T>(where: Prisma.AuthWhereInput, getReport: (authId: number) => Promise<T>): Promise<T[]> {
    const users = await prisma.auth.findMany({
        where,
        select: { id: true },
        orderBy: { id: 'asc' },
    });

    return mapWithConcurrency(users, REPORT_CONCURRENCY, (user) => getReport(user.id));
}

const digitalBillboardUsers: Prisma.AuthWhereInput = {
    OR: [{ roles: { has: Role.DigitalBillboard } }, { Checkouts: { some: { product: { in: DIGITAL_BILLBOARD_PRODUCTS } } } }],
};

function lightningUsers(subscriptionType: LightningSubscriptionType): Prisma.AuthWhereInput {
    const role = subscriptionType === 'LightningSilver' ? Role.LightningSilver : Role.LightningGold;

    return {
        OR: [{ roles: { has: role } }, { Checkouts: { some: { product: { in: LIGHTNING_PRODUCTS[subscriptionType] } } } }],
    };
}

const businessInvoiceUsers: Prisma.AuthWhereInput = {
    OR: [
        { roles: { has: Role.InvoiceTool } },
        { Checkouts: { some: { product: 'InvoiceTool' } } },
        { invoices: { some: {} } },
        { subscriptionInvs: { some: {} } },
    ],
};

const emailCrmUsers: Prisma.AuthWhereInput = {
    status: 'active',
    roles: { has: Role.EmailMarketing },
};

export function getAllDigitalBillboardSubscriptions() {
    return getReportsForUsers(digitalBillboardUsers, getDigitalBillboardSubscription);
}

export function getAllLightningReferralEarnings(subscriptionType: LightningSubscriptionType) {
    return getReportsForUsers(lightningUsers(subscriptionType), (authId) => getLightningReferralEarnings(authId, subscriptionType));
}

export function getAllLightningSubscriptions(subscriptionType: LightningSubscriptionType) {
    return getReportsForUsers(lightningUsers(subscriptionType), (authId) => getLightningSubscription(authId, subscriptionType));
}

export function getAllBusinessInvoiceEarnings(currency: string) {
    return getReportsForUsers(businessInvoiceUsers, (authId) => getBusinessInvoiceUserEarnings(authId, currency));
}

export function getAllBusinessInvoiceBilling() {
    return getReportsForUsers(businessInvoiceUsers, getBusinessInvoiceUserBilling);
}

export function getAllEmailCrmUsage() {
    return getReportsForUsers(emailCrmUsers, getEmailCrmUsage);
}

export function getAllEmailCrmBilling(page: number, limit: number) {
    return getReportsForUsers(emailCrmUsers, (authId) => getEmailCrmBilling(authId, page, limit));
}
