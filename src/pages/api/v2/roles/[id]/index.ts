import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

// Handle GET, PUT, and DELETE requests for a specific role
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid Role ID' });
    }

    // Handle GET request to get a single Role by ID
    if (req.method === 'GET') {
        try {
            const role = await prisma.role.findUnique({
                where: { id: parseInt(id) },
            });

            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }

            return res.status(200).json(role);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Handle PUT request to update the Role
    else if (req.method === 'PUT') {
        try {
            const { name } = req.body;

            // Check if name is provided
            if (!name) {
                return res.status(400).json({ message: 'Role name is required' });
            }

            const role = await prisma.role.update({
                where: { id: parseInt(id) },
                data: { name },
            });

            return res.status(200).json({ message: 'Role updated successfully', role });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Handle DELETE request to delete the Role
    else if (req.method === 'DELETE') {
        try {
            const role = await prisma.role.delete({
                where: { id: parseInt(id) },
            });

            return res.status(200).json({ message: 'Role deleted successfully', role });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
