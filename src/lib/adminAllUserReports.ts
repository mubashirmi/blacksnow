import { ApiError } from '@/lib/apiErrors';
import { getBusinessInvoiceUserBilling } from '@/lib/businessInvoiceUserBilling';
import { getBusinessInvoiceUserEarnings } from '@/lib/businessInvoiceUserEarnings';
import { getDigitalBillboardSubscription } from '@/lib/digitalBillboardUserReports';
import { getEmailCrmBilling, getEmailCrmUsage } from '@/lib/emailCrmUserReports';
import { getLightningReferralEarnings, getLightningSubscription } from '@/lib/lightningUserReports';
import prisma from '@/lib/prisma';

type ReportSuccess<T> = {
    success: true;
    data: T;
};

type ReportFailure = {
    success: false;
    error: {
        statusCode: number;
        code: string;
        message: string;
    };
};

type ReportResult<T> = ReportSuccess<T> | ReportFailure;

const USER_CONCURRENCY = 2;

async function getReport<T>(name: string, authId: number, operation: () => Promise<T>): Promise<ReportResult<T>> {
    try {
        return {
            success: true,
            data: await operation(),
        };
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                success: false,
                error: {
                    statusCode: error.statusCode,
                    code: error.code,
                    message: error.message,
                },
            };
        }

        console.error(`Failed to build admin report ${name} for authId ${authId}:`, error);

        return {
            success: false,
            error: {
                statusCode: 500,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Internal server error',
            },
        };
    }
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
    const results = new Array<R>(items.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < items.length) {
            const index = nextIndex;
            nextIndex += 1;
            results[index] = await mapper(items[index]);
        }
    }

    const workerCount = Math.min(concurrency, items.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    return results;
}

export async function getAdminAllUserReports(currency: string) {
    const users = await prisma.auth.findMany({
        orderBy: { id: 'asc' },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            roles: true,
            status: true,
        },
    });

    const reports = await mapWithConcurrency(users, USER_CONCURRENCY, async (user) => {
        const authId = user.id;
        const [
            digitalBillboardSubscription,
            lightningSilverReferralEarnings,
            lightningSilverSubscription,
            businessInvoiceEarnings,
            businessInvoiceBilling,
            emailCrmUsage,
            emailCrmBilling,
            lightningGoldReferralEarnings,
            lightningGoldSubscription,
        ] = await Promise.all([
            getReport('digitalBillboard.subscription', authId, () => getDigitalBillboardSubscription(authId)),
            getReport('lightning.silver.referralEarnings', authId, () => getLightningReferralEarnings(authId, 'LightningSilver')),
            getReport('lightning.silver.subscription', authId, () => getLightningSubscription(authId, 'LightningSilver')),
            getReport('businessInvoice.earnings', authId, () => getBusinessInvoiceUserEarnings(authId, currency)),
            getReport('businessInvoice.billing', authId, () => getBusinessInvoiceUserBilling(authId)),
            getReport('emailCrm.usage', authId, () => getEmailCrmUsage(authId)),
            getReport('emailCrm.billing', authId, () => getEmailCrmBilling(authId, 1, 25)),
            getReport('lightning.gold.referralEarnings', authId, () => getLightningReferralEarnings(authId, 'LightningGold')),
            getReport('lightning.gold.subscription', authId, () => getLightningSubscription(authId, 'LightningGold')),
        ]);

        return {
            user,
            reports: {
                digitalBillboard: {
                    subscription: digitalBillboardSubscription,
                },
                lightning: {
                    silver: {
                        referralEarnings: lightningSilverReferralEarnings,
                        subscription: lightningSilverSubscription,
                    },
                    gold: {
                        referralEarnings: lightningGoldReferralEarnings,
                        subscription: lightningGoldSubscription,
                    },
                },
                businessInvoice: {
                    earnings: businessInvoiceEarnings,
                    billing: businessInvoiceBilling,
                },
                emailCrm: {
                    usage: emailCrmUsage,
                    billing: emailCrmBilling,
                },
            },
        };
    });

    return {
        generatedAt: new Date(),
        currency: currency.toUpperCase(),
        totalUsers: reports.length,
        users: reports,
    };
}
