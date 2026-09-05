import type { NextApiRequest, NextApiResponse } from 'next';

import { parsePositiveInteger, sendApiError } from '@/lib/apiErrors';
import { BILLING_TIME_ZONE, getDailyUsageReport } from '@/lib/emailBillingReports';
import { parseDateKey } from '@/lib/emailBillingValidation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({
            success: false,
            error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
        });
    }

    try {
        const authId = parsePositiveInteger(req.query.authId, 'authId');
        const date = parseDateKey(req.query.date);
        const users = await getDailyUsageReport(date, authId);

        return res.status(200).json({
            success: true,
            data: {
                date,
                timezone: BILLING_TIME_ZONE,
                userCount: users.length,
                users,
            },
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
