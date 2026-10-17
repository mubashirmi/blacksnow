import { DigitalBillboardKpiPeriod, getDigitalBillboardKpi, isDigitalBillboardKpiPeriod } from '@/lib/digitalBillboardKpi';
import { NextApiRequest, NextApiResponse } from 'next';

const KPI_PERIODS: DigitalBillboardKpiPeriod[] = ['weekly', 'monthly', 'yearly'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const rawUserId = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId;
    const userId = Number(rawUserId);
    const period = Array.isArray(req.query.period) ? req.query.period[0] : req.query.period;

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ success: false, message: 'A valid userId is required' });
    }

    if (period !== 'all' && !isDigitalBillboardKpiPeriod(period)) {
        return res.status(400).json({ success: false, message: 'Invalid period. Supported values are weekly, monthly, yearly, and all.' });
    }

    try {
        if (period === 'all') {
            const now = new Date();
            const results = await Promise.all(KPI_PERIODS.map(async (kpiPeriod) => [kpiPeriod, await getDigitalBillboardKpi(kpiPeriod, userId, now)] as const));
            const periods = Object.fromEntries(results);

            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json({ success: true, period, periods });
        }

        const kpi = await getDigitalBillboardKpi(period, userId);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ success: true, period, ...kpi });
    } catch (error) {
        console.error('Failed to fetch user digital billboard KPI:', error);
        return res.status(500).json({ success: false, message: 'Unable to fetch digital billboard KPI' });
    }
}
