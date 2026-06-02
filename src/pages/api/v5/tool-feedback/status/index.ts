import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        /**
         * =========================================================
         * GET USER FEEDBACK STATUS
         * =========================================================
         *
         * GET:
         * /api/tool-feedback/status?authId=69
         */

        if (method !== 'GET') {
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const { authId } = req.query;

        if (!authId) {
            return res.status(400).json({
                message: 'authId is required',
            });
        }

        const id = Number(authId);

        /**
         * GET USER
         */

        const user = await prisma.auth.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                roles: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        /**
         * GET USER FEEDBACKS
         */

        const feedbacks = await prisma.toolFeedback.findMany({
            where: {
                authId: id,
            },
            select: {
                id: true,
                toolName: true,
                stars: true,
                review: true,
                createdAt: true,
            },
        });

        /**
         * TOOLS WITH FEEDBACK
         */

        const toolsGivenFeedback = feedbacks.map((feedback) => feedback.toolName);

        /**
         * TOOLS WITHOUT FEEDBACK
         */

        const toolsWithoutFeedback = user.roles.filter((role) => !toolsGivenFeedback.includes(role));

        return res.status(200).json({
            user,
            totalFeedbacks: feedbacks.length,

            toolsGivenFeedback,

            toolsWithoutFeedback,

            feedbacks,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: (error as Error).message,
        });
    }
}
