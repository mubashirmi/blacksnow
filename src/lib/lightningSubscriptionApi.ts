import { ApiError, parsePositiveInteger, sendApiError } from '@/lib/apiErrors';
import { getLightningSubscription, type LightningSubscriptionType } from '@/lib/lightningUserReports';
import type { NextApiRequest, NextApiResponse } from 'next';

export function createLightningSubscriptionHandler(subscriptionType: LightningSubscriptionType) {
    return async function handler(req: NextApiRequest, res: NextApiResponse) {
        if (req.method !== 'GET') {
            res.setHeader('Allow', 'GET');
            return res.status(405).json({
                success: false,
                error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
            });
        }

        try {
            const authId = parsePositiveInteger(req.query.authId, 'authId');

            if (authId === undefined) {
                throw new ApiError(400, 'AUTH_ID_REQUIRED', 'authId is required');
            }

            const report = await getLightningSubscription(authId, subscriptionType);

            return res.status(200).json({
                success: true,
                data: report,
            });
        } catch (error) {
            return sendApiError(res, error);
        }
    };
}
