import { sendApiError } from '@/lib/apiErrors';
import { getEmailCrmUsage } from '@/lib/emailCrmUserReports';
import { parseRequiredAuthId } from '@/lib/emailUsagePeriod';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({
            success: false,
            error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
        });
    }

    try {
        const authId = parseRequiredAuthId(req.query.authId);
        const report = await getEmailCrmUsage(authId);

        return res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
