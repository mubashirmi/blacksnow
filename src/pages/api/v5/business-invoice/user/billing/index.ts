import type { NextApiRequest, NextApiResponse } from 'next';

import { parsePositiveInteger, sendApiError } from '@/lib/apiErrors';
import { getBusinessInvoiceUserBilling } from '@/lib/businessInvoiceUserBilling';

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
        const authId = parsePositiveInteger(req.query.authId, 'authId');

        if (authId === undefined) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'AUTH_ID_REQUIRED',
                    message: 'authId is required',
                },
            });
        }

        const billing = await getBusinessInvoiceUserBilling(authId);

        return res.status(200).json({
            success: true,
            data: billing,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
