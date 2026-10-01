import { syncPaidCheckoutRoles } from '@/lib/activateCheckoutAccess';
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

        if (!normalizedProduct) {
            continue;
        }

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
         * ONLY ALLOW GET
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

        /**
         * =========================================================
         * VALIDATE AUTH ID
         * =========================================================
         */

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
         * =========================================================
         * GET USER
         * =========================================================
         *
         * IMPORTANT:
         *
         * Auth.roles is now selected and treated as the actual
         * source of truth for which tools/roles belong to the user.
         */

        // Backfill roles for purchases completed before role activation was
        // handled server-side. The operation is guarded and idempotent.
        await syncPaidCheckoutRoles(authId);

        const user = await prisma.auth.findUnique({
            where: {
                id: authId,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,

                // Actual roles stored against the Auth user.
                roles: true,

                Checkouts: {
                    where: {
                        deleted: false,
                        cancelSubscripton: false,
                        paid: true,
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
         * =========================================================
         * ACTUAL USER ROLES
         * =========================================================
         */

        const authRoles = getUniqueProducts(user.roles.map((role) => String(role)));

        /**
         * Normalized lookup set.
         *
         * Example:
         *
         * [
         *   "InvoiceTool",
         *   "EmailMarketing"
         * ]
         *
         * becomes:
         *
         * Set {
         *   "invoicetool",
         *   "emailmarketing"
         * }
         */

        const normalizedAuthRoles = new Set(authRoles.map((role) => normalizeToolName(role)));

        /**
         * =========================================================
         * ACTIVE CHECKOUT PRODUCTS
         * =========================================================
         *
         * Only checkout products that:
         *
         * pause = false
         * deleted = false
         * cancelSubscripton = false
         *
         * AND
         *
         * product exists inside Auth.roles
         *
         * are considered valid active roles.
         */

        const activeCheckoutProducts = getUniqueProducts(user.Checkouts.filter((checkout) => checkout.pause === false).map((checkout) => checkout.product));

        const activeRoles = activeCheckoutProducts.filter((product) => normalizedAuthRoles.has(normalizeToolName(product)));

        /**
         * =========================================================
         * PAUSED CHECKOUT PRODUCTS
         * =========================================================
         *
         * Only paused products that actually exist in Auth.roles
         * are returned.
         */

        const pausedCheckoutProducts = getUniqueProducts(user.Checkouts.filter((checkout) => checkout.pause === true).map((checkout) => checkout.product));

        const pausedRoles = pausedCheckoutProducts.filter((product) => normalizedAuthRoles.has(normalizeToolName(product)));

        /**
         * =========================================================
         * PREVENT SAME ROLE FROM APPEARING IN ACTIVE + PAUSED
         * =========================================================
         *
         * If there somehow happens to be:
         *
         * InvoiceTool -> active checkout
         * InvoiceTool -> paused checkout
         *
         * paused takes precedence.
         */

        const normalizedPausedRoles = new Set(pausedRoles.map((role) => normalizeToolName(role)));

        const roles = activeRoles.filter((role) => !normalizedPausedRoles.has(normalizeToolName(role)));

        /**
         * =========================================================
         * GET USER FEEDBACKS
         * =========================================================
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
         * =========================================================
         * TOOLS USER HAS ALREADY GIVEN FEEDBACK FOR
         * =========================================================
         */

        const toolsGivenFeedback = getUniqueProducts(feedbacks.map((feedback) => feedback.toolName));

        const normalizedToolsGivenFeedback = new Set(toolsGivenFeedback.map((tool) => normalizeToolName(tool)));

        /**
         * =========================================================
         * ACTIVE TOOLS WITHOUT FEEDBACK
         * =========================================================
         *
         * Only ACTIVE and VALID Auth.roles are checked here.
         *
         * A checkout product that does NOT exist inside Auth.roles
         * will never appear here.
         */

        const toolsWithoutFeedback = roles.filter((role) => !normalizedToolsGivenFeedback.has(normalizeToolName(role)));

        /**
         * =========================================================
         * RESPONSE
         * =========================================================
         */

        return res.status(200).json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,

                /**
                 * Active products that:
                 *
                 * 1. Exist in Auth.roles
                 * 2. Have an active checkout
                 * 3. Are not paused
                 * 4. Are not cancelled
                 * 5. Are not deleted
                 */
                roles,

                /**
                 * Products that:
                 *
                 * 1. Exist in Auth.roles
                 * 2. Have a paused checkout
                 */
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
