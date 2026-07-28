import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

function normalizeToolName(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

function getUniqueProducts(products: Array<string | null>): string[] {
    const uniqueProducts = new Map<string, string>();

    for (const product of products) {
        if (!product) {
            continue;
        }

        const trimmedProduct = product.trim();

        if (!trimmedProduct) {
            continue;
        }

        const normalizedProduct = normalizeToolName(trimmedProduct);

        if (!uniqueProducts.has(normalizedProduct)) {
            uniqueProducts.set(normalizedProduct, trimmedProduct);
        }
    }

    return Array.from(uniqueProducts.values());
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    try {
        /**
         * =========================================================
         * GET USER FEEDBACK STATUS
         * =========================================================
         *
         * GET:
         * /api/tool-feedback/status?authId=69
         */

        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);

            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        const authIdQuery = req.query.authId;

        if (!authIdQuery || Array.isArray(authIdQuery)) {
            return res.status(400).json({
                message: 'A valid authId is required',
            });
        }

        const authId = Number(authIdQuery);

        if (!Number.isInteger(authId) || authId <= 0) {
            return res.status(400).json({
                message: 'A valid authId is required',
            });
        }

        /**
         * GET USER AND CHECKOUT PRODUCTS
         */

        const user = await prisma.auth.findUnique({
            where: {
                id: authId,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,

                Checkouts: {
                    where: {
                        deleted: false,
                        cancelSubscripton: false,
                        product: {
                            not: null,
                        },
                    },
                    select: {
                        product: true,
                        pause: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        /**
         * ACTIVE CHECKOUT PRODUCTS
         *
         * Products where:
         * pause = false
         * cancelSubscripton = false
         * deleted = false
         */

        const activeProducts = getUniqueProducts(user.Checkouts.filter((checkout) => checkout.pause === false).map((checkout) => checkout.product));

        /**
         * PAUSED CHECKOUT PRODUCTS
         *
         * Products where:
         * pause = true
         * cancelSubscripton = false
         * deleted = false
         */

        const pausedRoles = getUniqueProducts(user.Checkouts.filter((checkout) => checkout.pause === true).map((checkout) => checkout.product));

        /**
         * Prevent a product from appearing in both roles and
         * pausedRoles. A paused product takes precedence.
         */

        const normalizedPausedRoles = new Set(pausedRoles.map(normalizeToolName));

        const roles = activeProducts.filter((product) => !normalizedPausedRoles.has(normalizeToolName(product)));

        /**
         * GET USER FEEDBACKS
         */

        const feedbacks = await prisma.toolFeedback.findMany({
            where: {
                authId,
            },
            select: {
                id: true,
                toolName: true,
                stars: true,
                review: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        /**
         * TOOLS WITH FEEDBACK
         */

        const toolsGivenFeedback = getUniqueProducts(feedbacks.map((feedback) => feedback.toolName));

        const normalizedToolsGivenFeedback = new Set(toolsGivenFeedback.map(normalizeToolName));

        /**
         * ACTIVE TOOLS WITHOUT FEEDBACK
         *
         * Paused products are not included because this list
         * is calculated from active roles only.
         */

        const toolsWithoutFeedback = roles.filter((role) => !normalizedToolsGivenFeedback.has(normalizeToolName(role)));

        return res.status(200).json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,

                // Checkout products where pause is false.
                roles,

                // Checkout products where pause is true.
                pausedRoles,
            },

            totalFeedbacks: feedbacks.length,
            toolsGivenFeedback,
            toolsWithoutFeedback,
            feedbacks,
        });
    } catch (error: unknown) {
        console.error('Tool feedback status API error:', error);

        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
    }
}
