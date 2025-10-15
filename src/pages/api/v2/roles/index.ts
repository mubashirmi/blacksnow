import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

// Handle GET and POST requests
export default async function api(req: NextApiRequest, res: NextApiResponse) {
    // Handle POST request to create a new Role
    if (req.method === 'POST') {
        try {
            const { name } = req.body;

            // Check if name is provided
            if (!name) {
                return res.status(400).json({ message: 'Role name is required' });
            }

            // Create the new role
            const role = await prisma.role.create({
                data: {
                    name,
                },
            });

            return res.status(201).json({ message: 'Role created successfully', role });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    // Handle GET request to get all Roles
    else if (req.method === 'GET') {
        try {
            const roles = await prisma.role.findMany();
            return res.status(200).json(roles);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
