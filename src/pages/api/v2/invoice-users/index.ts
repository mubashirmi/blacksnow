// pages/api/invoices/index.ts
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            // GET /api/invoices  -> list invoices
            case 'GET': {
                // eslint-disable-next-line
                const allInvoiceUsers = await prisma.auth.findMany({
                    where: {
                        roles: {
                            has: 'InvoiceTool',
                        },
                    },
                });

                return res.status(400).json({ message: 'id or contractId query param is required' });
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (e: any) {
        console.error('Error in /api/invoices:', e);
        return res.status(500).json({ message: 'Internal server error', error: e?.message });
    }
}
