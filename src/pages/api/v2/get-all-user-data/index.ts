import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

// Use Next.js API route handler for page routing
export default async function api(req: NextApiRequest, res: NextApiResponse) {
    // Handle POST requests only (sign up requests)
    if (req.method === 'GET') {
        try {
            const findAllUsers = await prisma.auth.findMany();
            // Return success response
            return res.status(201).json(findAllUsers);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        // Handle method not allowed
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
