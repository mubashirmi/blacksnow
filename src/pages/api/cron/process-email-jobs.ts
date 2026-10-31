import { processDueEmailJobs } from '@/lib/emailJobProcessor';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    maxDuration: 300,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const batchSize = Number(process.env.EMAIL_CRON_BATCH_SIZE || 100);
        const summary = await processDueEmailJobs(new Date(), batchSize);
        return res.status(200).json({ success: true, ...summary });
    } catch (error) {
        console.error('Scheduled email cron failed:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
