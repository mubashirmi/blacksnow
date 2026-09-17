import type { NextApiRequest, NextApiResponse } from 'next';

import { sendApiError } from '@/lib/apiErrors';
import { getUserDailyOverageTransactions } from '@/lib/emailBillingUserReports';
import { parsePagination } from '@/lib/emailBillingValidation';
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

        const { page, limit } = parsePagination(req.query);

        const report = await getUserDailyOverageTransactions(authId, page, limit);

        return res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
