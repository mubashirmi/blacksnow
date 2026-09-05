import type { NextApiRequest, NextApiResponse } from 'next';

import { parsePositiveInteger, sendApiError } from '@/lib/apiErrors';
import { getAutomaticChargeTransactions } from '@/lib/emailBillingReports';
import { parsePagination } from '@/lib/emailBillingValidation';

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
        const { page, limit } = parsePagination(req.query);
        const report = await getAutomaticChargeTransactions(authId, page, limit);

        return res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
