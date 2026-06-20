import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripeSecretKey = process.env.NEXT_PRIVATE_STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(stripeSecretKey);

function getQueryValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
}

function getOrigin(req: NextApiRequest): string {
    const origin = req.headers.origin;

    if (origin) {
        return origin;
    }

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3000';

    return `${protocol}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!stripeSecretKey) {
            return res.status(500).json({
                message: 'Stripe secret key is missing',
            });
        }

        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({
                message: 'Method not allowed',
            });
        }

        /**
         * Supported:
         * GET /api/stripe-connect/status?id=1
         * GET /api/stripe-connect/status?authId=1
         * GET /api/stripe-connect/status?connectId=acct_xxx
         *
         * Optional:
         * &createOnboardingLink=true
         */
        const idParam = getQueryValue(req.query.id);
        const authIdParam = getQueryValue(req.query.authId);
        const connectIdParam = getQueryValue(req.query.connectId);
        const createOnboardingLinkParam = getQueryValue(req.query.createOnboardingLink);

        const createOnboardingLink = createOnboardingLinkParam === 'true';

        let authId: number | undefined;
        let connectId: string | undefined = connectIdParam;

        if (idParam || authIdParam) {
            const rawId = idParam || authIdParam;
            const parsedId = Number(rawId);

            if (!Number.isFinite(parsedId) || parsedId <= 0) {
                return res.status(400).json({
                    message: 'Invalid id/authId parameter',
                });
            }

            authId = parsedId;
        }

        if (!authId && !connectId) {
            return res.status(400).json({
                message: 'id, authId, or connectId is required',
            });
        }

        const user = authId
            ? await prisma.auth.findUnique({
                  where: { id: authId },
                  select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      adminStripeConnectId: true,
                      adminStripeConnectIdStatus: true,
                  },
              })
            : await prisma.auth.findFirst({
                  where: { adminStripeConnectId: connectId },
                  select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      adminStripeConnectId: true,
                      adminStripeConnectIdStatus: true,
                  },
              });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        if (!connectId) {
            connectId = user.adminStripeConnectId || undefined;
        }

        if (!connectId) {
            await prisma.auth.update({
                where: { id: user.id },
                data: {
                    adminStripeConnectIdStatus: false,
                },
            });

            return res.status(200).json({
                message: 'Stripe Connect account does not exist',
                connected: false,
                ready: false,
                onboardingRequired: true,
                data: {
                    authId: user.id,
                    email: user.email,
                    adminStripeConnectId: null,
                    adminStripeConnectIdStatus: false,
                },
            });
        }

        const account = await stripe.accounts.retrieve(connectId);

        const transfersActive = account.capabilities?.transfers === 'active';
        const cardPaymentsActive = account.capabilities?.card_payments === 'active';

        const currentlyDue = account.requirements?.currently_due || [];
        const eventuallyDue = account.requirements?.eventually_due || [];
        const pastDue = account.requirements?.past_due || [];
        const disabledReason = account.requirements?.disabled_reason || null;

        const ready =
            Boolean(account.details_submitted) &&
            Boolean(account.charges_enabled) &&
            Boolean(account.payouts_enabled) &&
            transfersActive &&
            cardPaymentsActive &&
            !disabledReason &&
            currentlyDue.length === 0 &&
            pastDue.length === 0;

        let onboardingUrl: string | null = null;

        if (!ready && createOnboardingLink) {
            const origin = getOrigin(req);

            const accountLink = await stripe.accountLinks.create({
                account: connectId,
                refresh_url: `${origin}/onboarding/refresh`,
                return_url: `${origin}/onboarding/success?connectId=${connectId}`,
                type: 'account_onboarding',
            });

            onboardingUrl = accountLink.url;
        }

        const updatedUser = await prisma.auth.update({
            where: { id: user.id },
            data: {
                adminStripeConnectId: connectId,
                adminStripeConnectIdStatus: ready,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                adminStripeConnectId: true,
                adminStripeConnectIdStatus: true,
            },
        });

        return res.status(200).json({
            message: ready ? 'Stripe Connect account is ready' : 'Stripe Connect account is not ready',
            connected: true,
            ready,
            onboardingRequired: !ready,
            onboardingUrl,
            data: updatedUser,
            stripeAccount: {
                id: account.id,
                type: account.type,
                country: account.country,
                email: account.email,
                detailsSubmitted: account.details_submitted,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                capabilities: {
                    transfers: account.capabilities?.transfers || null,
                    cardPayments: account.capabilities?.card_payments || null,
                },
                requirements: {
                    currentlyDue,
                    eventuallyDue,
                    pastDue,
                    disabledReason,
                },
            },
        });
    } catch (error: any) {
        console.error('Error in /api/stripe-connect/status:', error);

        return res.status(500).json({
            message: 'Internal server error',
            error: error?.message,
        });
    }
}
