import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const billboardId = Number(id);

    if (isNaN(billboardId)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    try {
        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
