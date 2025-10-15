import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
const stripe = require('stripe')(process.env.NEXT_PRIVATE_STRIPE_SECRET);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            const { id } = req.query;
            const userId = Number(id);

            // Validate user ID
            if (!userId || Number.isNaN(userId)) {
                return res.status(400).json({ message: 'Invalid or missing id parameter' });
            }

            // Find user in database
            const user = await prisma.auth.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    password: true,
                    roles: true,
                    adminStripeConnectId: true,
                    referredById: true,
                },
            });

            // User not found
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // User exists but no Stripe Connect ID (not onboarded)
            if (!user.adminStripeConnectId) {
                return res.status(204).send(); // No content - triggers modal on frontend
            }

            // User exists with Stripe Connect ID
            return res.status(200).json({
                message: 'User data retrieved successfully',
                data: user,
            });
        }

        if (method === 'POST') {
            const { id, rsvpLink, newsletterLink, digitalBillboardLink, emailMarketingLink } = req.body;
            const userId = Number(id);

            if (!userId || Number.isNaN(userId)) {
                return res.status(400).json({ message: 'Invalid id in body' });
            }

            const user = await prisma.auth.findUnique({ where: { id: userId } });
            let accountId = user?.adminStripeConnectId;

            // ✅ Create account if missing
            if (!accountId) {
                const account = await stripe.accounts.create({
                    type: 'express',
                    capabilities: { transfers: { requested: true } },
                });

                accountId = account.id;

                await prisma.auth.update({
                    where: { id: userId },
                    data: { adminStripeConnectId: accountId },
                });
            }

            // ✅ Always check status
            const account = await stripe.accounts.retrieve(accountId);

            // ✅ Generate onboarding link if payouts not enabled
            let onboardingUrl = null;
            if (!account.payouts_enabled) {
                const origin = req.headers.origin || 'http://localhost:3000';
                const accountLink = await stripe.accountLinks.create({
                    account: accountId,
                    refresh_url: `${origin}/onboarding/refresh`,
                    return_url: `${origin}/onboarding/success`,
                    type: 'account_onboarding',
                });
                onboardingUrl = accountLink.url;
            }

            // ✅ Create referral products if not exist
            await prisma.referralProducts.createMany({
                data: [
                    { productName: 'rsvp', productLink: rsvpLink, authId: userId },
                    { productName: 'newsLetter', productLink: newsletterLink, authId: userId },
                    { productName: 'digitalBillboard', productLink: digitalBillboardLink, authId: userId },
                    { productName: 'emailMarketing', productLink: emailMarketingLink, authId: userId },
                ],
                skipDuplicates: true,
            });

            return res.status(200).json({
                accountId,
                payoutsEnabled: account.payouts_enabled,
                onboardingUrl,
                requirements: account.requirements,
            });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
