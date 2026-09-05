import type { NextApiRequest, NextApiResponse } from 'next';

import { billAllEmailOverages } from '@/lib/emailOverageBilling';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Method Not Allowed',
        });
    }

    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error('CRON_SECRET is not configured');

        return res.status(500).json({
            success: false,
            message: 'Cron is not configured',
        });
    }

    const authorization = req.headers.authorization;

    if (authorization !== `Bearer ${cronSecret}`) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }

    try {
        const startedAt = new Date();

        const results = await billAllEmailOverages(startedAt);

        const succeeded = results.filter((item) => item.status === 'succeeded').length;

        const nothingToBill = results.filter((item) => item.status === 'nothing_to_bill').length;

        const failed = results.filter((item) => item.status === 'failed' || item.status === 'error' || item.status === 'requires_action').length;

        return res.status(200).json({
            success: true,

            billingDate: startedAt.toISOString().slice(0, 10),

            processed: results.length,

            succeeded,

            nothingToBill,

            failed,

            results,
        });
    } catch (error) {
        console.error('Daily email overage cron failed:', error);

        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
