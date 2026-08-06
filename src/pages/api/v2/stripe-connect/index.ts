import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripeSecretKey = process.env.NEXT_PRIVATE_STRIPE_SECRET;

if (!stripeSecretKey) {
    throw new Error('NEXT_PRIVATE_STRIPE_SECRET is not configured');
}

const stripe = require('stripe')(stripeSecretKey);

type UpdateAction = 'update' | 'dashboard' | 'onboarding';

type StripeAccountUpdatePayload = {
    email?: string;
    business_profile?: Record<string, string>;
    metadata?: Record<string, string>;
};

/**
 * Check that an unknown value is a plain object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Parse and validate a positive integer user ID.
 */
function parseUserId(value: unknown): number | null {
    const rawValue = Array.isArray(value) ? value[0] : value;
    const userId = Number(rawValue);

    if (!Number.isInteger(userId) || userId <= 0) {
        return null;
    }

    return userId;
}

/**
 * Return the first value from a Next.js header.
 */
function getHeaderValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

/**
 * Generate the application origin.
 *
 * In production, configure APP_URL, for example:
 * APP_URL=https://example.com
 */
function getApplicationOrigin(req: NextApiRequest): string {
    const configuredOrigin = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;

    if (configuredOrigin) {
        return configuredOrigin.replace(/\/+$/, '');
    }

    const forwardedProtocol = getHeaderValue(req.headers['x-forwarded-proto'])?.split(',')[0]?.trim();

    const forwardedHost = getHeaderValue(req.headers['x-forwarded-host'])?.split(',')[0]?.trim();

    const host = forwardedHost || getHeaderValue(req.headers.host);

    const protocol = forwardedProtocol || (process.env.NODE_ENV === 'production' ? 'https' : 'http');

    if (!host) {
        return 'http://localhost:3000';
    }

    return `${protocol}://${host}`;
}

/**
 * Generate a new single-use Stripe onboarding link.
 */
async function createOnboardingUrl(req: NextApiRequest, accountId: string): Promise<string> {
    const origin = getApplicationOrigin(req);

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/onboarding/refresh`,
        return_url: `${origin}/onboarding/success?connectId=${encodeURIComponent(accountId)}`,
        type: 'account_onboarding',
    });

    return accountLink.url;
}

/**
 * Synchronize payouts_enabled with the Prisma status field.
 */
async function synchronizeAccountStatus(
    userId: number,
    account: {
        payouts_enabled?: boolean;
    }
): Promise<boolean> {
    const payoutsEnabled = Boolean(account.payouts_enabled);

    await prisma.auth.update({
        where: {
            id: userId,
        },
        data: {
            adminStripeConnectIdStatus: payoutsEnabled,
        },
    });

    return payoutsEnabled;
}

/**
 * Check whether Stripe says that a resource no longer exists.
 */
function isStripeResourceMissing(error: unknown): boolean {
    return isRecord(error) && error.code === 'resource_missing';
}

/**
 * Return a safe error message.
 */
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (isRecord(error) && typeof error.message === 'string') {
        return error.message;
    }

    return 'Unknown error';
}

/**
 * Preserve valid Stripe HTTP errors instead of returning 500 for everything.
 */
function getErrorStatusCode(error: unknown): number {
    if (isRecord(error) && typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
        return error.statusCode;
    }

    return 500;
}

/**
 * GET
 *
 * Returns the currently connected Stripe account information.
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const userId = parseUserId(req.query.id);

    if (!userId) {
        return res.status(400).json({
            message: 'Invalid or missing id parameter',
        });
    }

    const user = await prisma.auth.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            email: true,
            firstName: true,
            lastName: true,
            roles: true,
            adminStripeConnectId: true,
            referredById: true,
            adminStripeConnectIdStatus: true,
        },
    });

    if (!user) {
        return res.status(404).json({
            message: 'User not found',
        });
    }

    if (!user.adminStripeConnectId) {
        // A 204 response must not contain a response body.
        return res.status(204).end();
    }

    try {
        const account = await stripe.accounts.retrieve(user.adminStripeConnectId);

        const payoutsEnabled = await synchronizeAccountStatus(userId, account);

        return res.status(200).json({
            message: 'User data retrieved successfully',
            data: {
                ...user,
                adminStripeConnectIdStatus: payoutsEnabled,
            },
            stripeStatus: {
                accountId: account.id,
                payoutsEnabled,
                chargesEnabled: Boolean(account.charges_enabled),
                detailsSubmitted: Boolean(account.details_submitted),
                requirements: account.requirements,
            },
        });
    } catch (error) {
        /*
         * The Stripe account may have been deleted outside this application.
         * Clear the stale connection in that case.
         */
        if (isStripeResourceMissing(error)) {
            await prisma.auth.update({
                where: {
                    id: userId,
                },
                data: {
                    adminStripeConnectId: null,
                    adminStripeConnectIdStatus: false,
                },
            });

            return res.status(204).end();
        }

        throw error;
    }
}

/**
 * POST
 *
 * Preserves the existing behavior:
 * - Create an Express account when missing.
 * - Retrieve the existing account when already connected.
 * - Generate onboarding when payouts are not enabled.
 * - Create referral products.
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const body = isRecord(req.body) ? req.body : {};

    const userId = parseUserId(body.id);

    if (!userId) {
        return res.status(400).json({
            message: 'Invalid id in body',
        });
    }

    const user = await prisma.auth.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            adminStripeConnectId: true,
        },
    });

    if (!user) {
        return res.status(404).json({
            message: 'User not found',
        });
    }

    let accountId = user.adminStripeConnectId;
    let account;

    /*
     * If Prisma contains an account ID that was deleted directly through
     * Stripe, clear the stale ID and create a new account.
     */
    if (accountId) {
        try {
            account = await stripe.accounts.retrieve(accountId);
        } catch (error) {
            if (!isStripeResourceMissing(error)) {
                throw error;
            }

            await prisma.auth.update({
                where: {
                    id: userId,
                },
                data: {
                    adminStripeConnectId: null,
                    adminStripeConnectIdStatus: false,
                },
            });

            accountId = null;
        }
    }

    /*
     * Create an account only when the user does not already have one.
     */
    if (!accountId) {
        account = await stripe.accounts.create({
            type: 'express',
            email: user.email,
            capabilities: {
                card_payments: {
                    requested: true,
                },
                transfers: {
                    requested: true,
                },
            },
            metadata: {
                authId: String(userId),
            },
        });

        accountId = account.id;

        await prisma.auth.update({
            where: {
                id: userId,
            },
            data: {
                adminStripeConnectId: accountId,
                adminStripeConnectIdStatus: Boolean(account.payouts_enabled),
            },
        });
    }

    /*
     * Retrieve the current account state when it was not already retrieved.
     */
    if (!account) {
        account = await stripe.accounts.retrieve(accountId);
    }

    const payoutsEnabled = await synchronizeAccountStatus(userId, account);

    let onboardingUrl: string | null = null;

    if (!payoutsEnabled) {
        onboardingUrl = await createOnboardingUrl(req, accountId);
    }

    const digitalBillboardLink = typeof body.digitalBillboardLink === 'string' ? body.digitalBillboardLink : '';

    const emailMarketingLink = typeof body.emailMarketingLink === 'string' ? body.emailMarketingLink : '';

    const invoiceToolLink = typeof body.invoiceToolLink === 'string' ? body.invoiceToolLink : '';

    /*
     * This preserves your existing referral-products functionality.
     *
     * skipDuplicates works as intended when ReferralProducts has a unique
     * constraint covering authId and productName.
     */
    await prisma.referralProducts.createMany({
        data: [
            {
                productName: 'digitalBillboard',
                productLink: digitalBillboardLink,
                authId: userId,
            },
            {
                productName: 'emailMarketing',
                productLink: emailMarketingLink,
                authId: userId,
            },
            {
                productName: 'InvoiceTool',
                productLink: invoiceToolLink,
                authId: userId,
            },
        ],
        skipDuplicates: true,
    });

    return res.status(200).json({
        accountId,
        payoutsEnabled,
        onboardingUrl,
        requirements: account.requirements,
    });
}

/**
 * PATCH
 *
 * Supported actions:
 *
 * 1. update
 *    Update permitted account fields through the Stripe API.
 *
 * 2. dashboard
 *    Generate a single-use Express Dashboard login link. This is the
 *    recommended way for Express users to update bank account, payout,
 *    personal, and business information.
 *
 * 3. onboarding
 *    Generate a fresh onboarding link for outstanding requirements.
 */
async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    const body = isRecord(req.body) ? req.body : {};

    const userId = parseUserId(body.id);

    if (!userId) {
        return res.status(400).json({
            message: 'Invalid id in body',
        });
    }

    const action: UpdateAction = typeof body.action === 'string' ? (body.action as UpdateAction) : 'update';

    const supportedActions: UpdateAction[] = ['update', 'dashboard', 'onboarding'];

    if (!supportedActions.includes(action)) {
        return res.status(400).json({
            message: 'Invalid action. Supported actions are update, dashboard, and onboarding.',
        });
    }

    const user = await prisma.auth.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            adminStripeConnectId: true,
        },
    });

    if (!user) {
        return res.status(404).json({
            message: 'User not found',
        });
    }

    if (!user.adminStripeConnectId) {
        return res.status(409).json({
            message: 'Stripe account is not connected',
        });
    }

    const accountId = user.adminStripeConnectId;

    /*
     * Generate an Express Dashboard login link.
     */
    if (action === 'dashboard') {
        const loginLink = await stripe.accounts.createLoginLink(accountId);

        return res.status(200).json({
            message: 'Stripe Express Dashboard link created',
            accountId,
            dashboardUrl: loginLink.url,
        });
    }

    /*
     * Generate a fresh onboarding link.
     */
    if (action === 'onboarding') {
        const account = await stripe.accounts.retrieve(accountId);

        const payoutsEnabled = await synchronizeAccountStatus(userId, account);

        const onboardingUrl = await createOnboardingUrl(req, accountId);

        return res.status(200).json({
            message: 'Stripe onboarding link created',
            accountId,
            payoutsEnabled,
            onboardingUrl,
            requirements: account.requirements,
        });
    }

    /*
     * Whitelisted fields that can be updated through this API.
     *
     * Do not pass req.body directly to Stripe because that would allow
     * clients to update fields that your API did not intend to expose.
     */
    const updatePayload: StripeAccountUpdatePayload = {};

    if (body.email !== undefined) {
        if (typeof body.email !== 'string' || !body.email.trim()) {
            return res.status(400).json({
                message: 'email must be a non-empty string',
            });
        }

        updatePayload.email = body.email.trim();
    }

    if (body.businessProfile !== undefined) {
        if (!isRecord(body.businessProfile)) {
            return res.status(400).json({
                message: 'businessProfile must be an object',
            });
        }

        const profile: Record<string, string> = {};

        /*
         * Both camelCase and Stripe-style snake_case inputs are accepted.
         */
        const profileFieldMap: Record<string, string> = {
            name: 'name',
            url: 'url',
            productDescription: 'product_description',
            product_description: 'product_description',
            supportEmail: 'support_email',
            support_email: 'support_email',
            supportPhone: 'support_phone',
            support_phone: 'support_phone',
            supportUrl: 'support_url',
            support_url: 'support_url',
        };

        for (const [inputKey, stripeKey] of Object.entries(profileFieldMap)) {
            const value = body.businessProfile[inputKey];

            if (value === undefined) {
                continue;
            }

            if (typeof value !== 'string') {
                return res.status(400).json({
                    message: `businessProfile.${inputKey} must be a string`,
                });
            }

            profile[stripeKey] = value;
        }

        if (Object.keys(profile).length > 0) {
            updatePayload.business_profile = profile;
        }
    }

    if (body.metadata !== undefined) {
        if (!isRecord(body.metadata)) {
            return res.status(400).json({
                message: 'metadata must be an object',
            });
        }

        const metadata: Record<string, string> = {};

        for (const [key, value] of Object.entries(body.metadata)) {
            /*
             * Sending null converts to an empty string, which can be used
             * to remove an existing Stripe metadata value.
             */
            if (value === null) {
                metadata[key] = '';
                continue;
            }

            if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
                return res.status(400).json({
                    message: `metadata.${key} must be a string, number, boolean, or null`,
                });
            }

            metadata[key] = String(value);
        }

        updatePayload.metadata = metadata;
    }

    let account;

    if (Object.keys(updatePayload).length > 0) {
        account = await stripe.accounts.update(accountId, updatePayload);
    } else {
        account = await stripe.accounts.retrieve(accountId);
    }

    const payoutsEnabled = await synchronizeAccountStatus(userId, account);

    /*
     * When requirements remain, return a fresh onboarding link along with
     * the updated account status.
     */
    let onboardingUrl: string | null = null;

    if (!payoutsEnabled) {
        onboardingUrl = await createOnboardingUrl(req, accountId);
    }

    return res.status(200).json({
        message: Object.keys(updatePayload).length > 0 ? 'Stripe account updated successfully' : 'Stripe account retrieved successfully',
        accountId,
        payoutsEnabled,
        chargesEnabled: Boolean(account.charges_enabled),
        detailsSubmitted: Boolean(account.details_submitted),
        onboardingUrl,
        requirements: account.requirements,
        businessProfile: account.business_profile,
        metadata: account.metadata,
    });
}

/**
 * DELETE
 *
 * Deletes the Stripe connected account and clears the Prisma fields.
 *
 * If Stripe refuses deletion, for example because the account has a
 * non-zero balance, the Prisma connection is not cleared.
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    const body = isRecord(req.body) ? req.body : {};

    const userId = parseUserId(body.id ?? req.query.id);

    if (!userId) {
        return res.status(400).json({
            message: 'Invalid or missing id',
        });
    }

    const user = await prisma.auth.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            adminStripeConnectId: true,
        },
    });

    if (!user) {
        return res.status(404).json({
            message: 'User not found',
        });
    }

    /*
     * Make DELETE idempotent. Calling it more than once will still succeed.
     */
    if (!user.adminStripeConnectId) {
        return res.status(200).json({
            message: 'Stripe account is already disconnected',
            deleted: false,
            alreadyDisconnected: true,
        });
    }

    const accountId = user.adminStripeConnectId;
    let stripeDeleted = false;

    try {
        const deletedAccount = await stripe.accounts.del(accountId);
        stripeDeleted = Boolean(deletedAccount.deleted);
    } catch (error) {
        /*
         * If Stripe no longer has the account, the local ID is stale and
         * can safely be cleared.
         */
        if (!isStripeResourceMissing(error)) {
            throw error;
        }

        stripeDeleted = true;
    }

    await prisma.auth.update({
        where: {
            id: userId,
        },
        data: {
            adminStripeConnectId: null,
            adminStripeConnectIdStatus: false,
        },
    });

    return res.status(200).json({
        message: 'Stripe connected account deleted successfully',
        accountId,
        deleted: stripeDeleted,
    });
}

/**
 * Main API handler.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET':
                return await handleGet(req, res);

            case 'POST':
                return await handlePost(req, res);

            case 'PATCH':
                return await handlePatch(req, res);

            case 'DELETE':
                return await handleDelete(req, res);

            default:
                res.setHeader('Allow', 'GET, POST, PATCH, DELETE');

                return res.status(405).json({
                    message: 'Method not allowed',
                });
        }
    } catch (error) {
        console.error('Stripe Connect API error:', error);

        const statusCode = getErrorStatusCode(error);

        return res.status(statusCode).json({
            message: statusCode === 500 ? 'Internal server error' : 'Stripe request failed',
            error: getErrorMessage(error),
        });
    }
}
