import { getAdminAllUserReports } from './adminAllUserReports';
import { ApiError } from './apiErrors';
import { getBusinessInvoiceUserBilling } from './businessInvoiceUserBilling';
import { getBusinessInvoiceUserEarnings } from './businessInvoiceUserEarnings';
import { getDigitalBillboardSubscription } from './digitalBillboardUserReports';
import { getEmailCrmBilling, getEmailCrmUsage } from './emailCrmUserReports';
import { getLightningReferralEarnings, getLightningSubscription } from './lightningUserReports';
import prisma from './prisma';

jest.mock('./prisma', () => ({
    __esModule: true,
    default: {
        auth: {
            findMany: jest.fn(),
        },
    },
}));
jest.mock('./businessInvoiceUserBilling');
jest.mock('./businessInvoiceUserEarnings');
jest.mock('./digitalBillboardUserReports');
jest.mock('./emailCrmUserReports');
jest.mock('./lightningUserReports');

const findUsers = prisma.auth.findMany as jest.Mock;
const businessBilling = getBusinessInvoiceUserBilling as jest.Mock;
const businessEarnings = getBusinessInvoiceUserEarnings as jest.Mock;
const billboardSubscription = getDigitalBillboardSubscription as jest.Mock;
const emailBilling = getEmailCrmBilling as jest.Mock;
const emailUsage = getEmailCrmUsage as jest.Mock;
const lightningEarnings = getLightningReferralEarnings as jest.Mock;
const lightningSubscription = getLightningSubscription as jest.Mock;

describe('getAdminAllUserReports', () => {
    beforeEach(() => {
        findUsers.mockResolvedValue([
            {
                id: 11,
                email: 'user@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['EmailMarketing'],
                status: 'active',
            },
        ]);
        businessBilling.mockResolvedValue({ source: 'business-billing' });
        businessEarnings.mockResolvedValue({ source: 'business-earnings' });
        billboardSubscription.mockResolvedValue({ source: 'billboard' });
        emailBilling.mockResolvedValue({ source: 'email-billing' });
        emailUsage.mockResolvedValue({ source: 'email-usage' });
        lightningEarnings.mockImplementation((_authId, tier) => Promise.resolve({ source: `${tier}-earnings` }));
        lightningSubscription.mockImplementation((_authId, tier) => Promise.resolve({ source: `${tier}-subscription` }));
    });

    test('combines all nine reports for every user', async () => {
        const result = await getAdminAllUserReports('usd');

        expect(result.totalUsers).toBe(1);
        expect(result.currency).toBe('USD');
        expect(result.users[0].user.id).toBe(11);
        expect(result.users[0].reports.digitalBillboard.subscription).toMatchObject({ success: true });
        expect(result.users[0].reports.lightning.silver.referralEarnings).toMatchObject({ success: true });
        expect(result.users[0].reports.lightning.silver.subscription).toMatchObject({ success: true });
        expect(result.users[0].reports.businessInvoice.earnings).toMatchObject({ success: true });
        expect(result.users[0].reports.businessInvoice.billing).toMatchObject({ success: true });
        expect(result.users[0].reports.emailCrm.usage).toMatchObject({ success: true });
        expect(result.users[0].reports.emailCrm.billing).toMatchObject({ success: true });
        expect(result.users[0].reports.lightning.gold.referralEarnings).toMatchObject({ success: true });
        expect(result.users[0].reports.lightning.gold.subscription).toMatchObject({ success: true });
        expect(emailBilling).toHaveBeenCalledWith(11, 1, 25);
    });

    test('keeps a product-specific failure from failing the combined report', async () => {
        emailUsage.mockRejectedValue(new ApiError(404, 'EMAIL_MARKETING_USER_NOT_FOUND', 'An active email marketing user was not found'));

        const result = await getAdminAllUserReports('usd');

        expect(result.users[0].reports.emailCrm.usage).toEqual({
            success: false,
            error: {
                statusCode: 404,
                code: 'EMAIL_MARKETING_USER_NOT_FOUND',
                message: 'An active email marketing user was not found',
            },
        });
        expect(result.users[0].reports.businessInvoice.billing).toMatchObject({ success: true });
    });
});
