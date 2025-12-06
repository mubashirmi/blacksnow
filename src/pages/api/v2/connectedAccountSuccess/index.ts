import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            // Extracting connectId from query params
            const { connectId } = req.query;

            // Check if connectId is present
            if (!connectId) {
                return res.status(400).json({ message: 'connectId is required' });
            }

            // Find the user by the Stripe Connect ID
            const user = await prisma.auth.findUnique({
                where: { adminStripeConnectId: String(connectId) },
            });

            if (!user) {
                return res.status(404).json({ message: 'Stripe connect is not connected.' });
            }

            // Update the user's Stripe connect status
            await prisma.auth.update({
                where: { id: user.id },
                data: {
                    adminStripeConnectIdStatus: true,
                },
            });

            // Return success response with 200 OK
            return res.status(200).json({ message: 'Stripe connect is successfully connected.' });
        }

        // If method is not GET, return Method Not Allowed (405)
        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        // Return internal server error if something fails
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
