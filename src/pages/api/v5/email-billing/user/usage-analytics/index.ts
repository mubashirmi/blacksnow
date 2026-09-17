import type { NextApiRequest, NextApiResponse } from 'next';

import { sendApiError } from '@/lib/apiErrors';
import { getUserEmailUsageAnalytics } from '@/lib/emailBillingUserReports';
import { parseRequiredAuthId } from '@/lib/emailUsagePeriod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');

        return res.status(405).json({
            success: false,
            error: {
                code: 'METHOD_NOT_ALLOWED',
                message: 'Method not allowed',
            },
        });
    }

    try {
        const authId = parseRequiredAuthId(req.query.authId);

        const analytics = await getUserEmailUsageAnalytics(authId);

        return res.status(200).json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
