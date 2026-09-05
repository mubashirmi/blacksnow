import { sendApiError } from '@/lib/apiErrors';
import { getAdminRevenue, parseRevenueCurrency } from '@/lib/subscriptionPlatformRevenue';
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
        const currency = parseRevenueCurrency(req.query.currency);
        const report = await getAdminRevenue(currency);

        return res.status(200).json(report);
    } catch (error) {
        return sendApiError(res, error);
    }
}
