import { sendApiError } from '@/lib/apiErrors';
import type { NextApiRequest, NextApiResponse } from 'next';

type AdminReportOperation<T> = (req: NextApiRequest) => Promise<T>;

/**
 * Builds a read-only admin report endpoint.
 *
 * Keeping the response envelope here ensures every admin counterpart behaves
 * like its existing user endpoint without accepting a user-scoped authId.
 */
export function createAdminReportHandler<T>(operation: AdminReportOperation<T>) {
    return async function handler(req: NextApiRequest, res: NextApiResponse) {
        if (req.method !== 'GET') {
            res.setHeader('Allow', 'GET');
            return res.status(405).json({
                success: false,
                error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
            });
        }

        try {
            const report = await operation(req);

            return res.status(200).json({
                success: true,
                data: report,
            });
        } catch (error) {
            return sendApiError(res, error);
        }
    };
}
