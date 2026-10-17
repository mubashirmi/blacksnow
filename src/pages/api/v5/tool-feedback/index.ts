import { consumeActionVerification, requireActionVerification } from '@/lib/actionVerification';
import { sendApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        /**
         * =========================================================
         * GET APIs
         * =========================================================
         *
         * GET ALL:
         * /api/tool-feedback
         *
         * GET ALL FEEDBACKS OF USER:
         * /api/tool-feedback?authId=1
         *
         * GET SINGLE FEEDBACK:
         * /api/tool-feedback?feedbackId=1
         */

        if (method === 'GET') {
            const { authId, feedbackId } = req.query;

            /**
             * GET SINGLE FEEDBACK BY FEEDBACK ID
             */

            if (feedbackId) {
                const feedback = await prisma.toolFeedback.findUnique({
                    where: {
                        id: Number(feedbackId),
                    },
                    include: {
                        Auth: true,
                    },
                });

                if (!feedback) {
                    return res.status(404).json({
                        message: 'Feedback not found',
                    });
                }

                return res.status(200).json(feedback);
            }

            /**
             * GET ALL FEEDBACKS OF USER
             */

            if (authId) {
                const feedbacks = await prisma.toolFeedback.findMany({
                    where: {
                        authId: Number(authId),
                    },
                    include: {
                        Auth: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });

                return res.status(200).json(feedbacks);
            }

            /**
             * GET ALL FEEDBACKS
             */

            const feedbacks = await prisma.toolFeedback.findMany({
                include: {
                    Auth: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return res.status(200).json(feedbacks);
        }

        /**
         * =========================================================
         * CREATE FEEDBACK
         * POST /api/tool-feedback
         * =========================================================
         */

        if (method === 'POST') {
            const { review, stars, toolName } = req.body;

            if (!review || !stars || !toolName) {
                return res.status(400).json({
                    message: 'Missing required fields',
                });
            }

            /**
             * VALIDATE TOOL NAME
             */

            if (!Object.values(Role).includes(toolName as Role)) {
                return res.status(400).json({
                    message: 'Invalid toolName',
                });
            }

            /**
             * CHECK USER ROLE
             */

            const normalizedToolName = toolName as Role;
            const { authId: id, verificationId } = await requireActionVerification(req, 'feedback', { toolName });

            const isUserHaveRole = await prisma.auth.findFirst({
                where: {
                    id,
                    roles: {
                        has: normalizedToolName,
                    },
                },
            });

            if (!isUserHaveRole) {
                return res.status(403).json({
                    message: 'Forbidden: User does not have the required role',
                });
            }

            /**
             * CREATE FEEDBACK
             */

            const feedback = await prisma.$transaction(async (transaction) => {
                await consumeActionVerification(verificationId, transaction);
                return transaction.toolFeedback.create({
                    data: { authId: id, review, stars, toolName, createdAt: new Date(), updatedAt: new Date() },
                });
            });
            return res.status(201).json({
                message: 'Feedback submitted successfully',
                feedback,
            });
        }

        /**
         * =========================================================
         * UPDATE FEEDBACK
         * PATCH /api/tool-feedback
         * =========================================================
         */

        if (method === 'PATCH') {
            const { feedbackId, review, stars, toolName } = req.body;

            if (!feedbackId) {
                return res.status(400).json({
                    message: 'feedbackId is required',
                });
            }

            const existingFeedback = await prisma.toolFeedback.findUnique({
                where: {
                    id: Number(feedbackId),
                },
            });

            if (!existingFeedback) {
                return res.status(404).json({
                    message: 'Feedback not found',
                });
            }

            const updatedFeedback = await prisma.toolFeedback.update({
                where: {
                    id: Number(feedbackId),
                },
                data: {
                    ...(review && { review }),
                    ...(stars && { stars }),
                    ...(toolName && { toolName }),
                },
            });

            return res.status(200).json({
                message: 'Feedback updated successfully',
                feedback: updatedFeedback,
            });
        }

        /**
         * =========================================================
         * DELETE FEEDBACK
         * DELETE /api/tool-feedback?feedbackId=1
         * =========================================================
         */

        if (method === 'DELETE') {
            const { feedbackId } = req.query;

            if (!feedbackId) {
                return res.status(400).json({
                    message: 'feedbackId is required',
                });
            }

            const existingFeedback = await prisma.toolFeedback.findUnique({
                where: {
                    id: Number(feedbackId),
                },
            });

            if (!existingFeedback) {
                return res.status(404).json({
                    message: 'Feedback not found',
                });
            }

            await prisma.toolFeedback.delete({
                where: {
                    id: Number(feedbackId),
                },
            });

            return res.status(200).json({
                message: 'Feedback deleted successfully',
            });
        }

        /**
         * =========================================================
         * METHOD NOT ALLOWED
         * =========================================================
         */

        return res.status(405).json({
            message: 'Method not allowed',
        });
    } catch (error) {
        return sendApiError(res, error);
    }
}
