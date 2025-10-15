import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
const stripe = require('stripe')(process.env.NEXT_PRIVATE_STRIPE_SECRET);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id } = req.query;
    const authId = Number(id);

    try {
        if (method === 'POST') {
            const { amount } = req.body;
            if (!amount) return res.status(400).json({ message: 'Amount is required' });

            const auth = await prisma.auth.findUnique({ where: { id: authId } });
            if (!auth || !auth.adminStripeConnectId) {
                return res.status(404).json({ message: 'User or Stripe Connect account not found' });
            }

            const revenue = await prisma.adminRevenue.findFirst({ where: { authId } });
            if (!revenue) return res.status(404).json({ message: 'No revenue record found for this user' });

            const currentRevenue = Number(revenue.revenue);
            if (currentRevenue < amount) {
                return res.status(400).json({
                    message: `Insufficient revenue. Available: ${currentRevenue}, Requested: ${amount}`,
                });
            }

            // ✅ Check Stripe account readiness
            // const account = await stripe.accounts.retrieve(auth.adminStripeConnectId);

            // if (!account.payouts_enabled) {
            //     const origin = req.headers.origin || 'http://localhost:3000';
            //     const accountLink = await stripe.accountLinks.create({
            //         account: auth.adminStripeConnectId,
            //         refresh_url: `${origin}/onboarding/refresh`,
            //         return_url: `${origin}/onboarding/success`,
            //         type: 'account_onboarding',
            //     });

            //     return res.status(400).json({
            //         message: 'Stripe payouts are not enabled. Complete onboarding.',
            //         requirements: account.requirements,
            //         onboardingUrl: accountLink.url,
            //     });
            // }

            // ✅ Create payout
            const payout = await stripe.payouts.create({ amount, currency: 'usd' }, { stripeAccount: auth.adminStripeConnectId });

            const [savedPayout, updatedRevenue] = await prisma.$transaction([
                prisma.adminPayouts.create({
                    data: {
                        amount: amount.toString(),
                        adminStripeConnectId: auth.adminStripeConnectId,
                        authId,
                    },
                }),
                prisma.adminRevenue.update({
                    where: { id: revenue.id },
                    data: { revenue: { decrement: amount } },
                }),
            ]);

            return res.status(200).json({
                message: 'Payout created successfully',
                stripePayout: payout,
                dbRecord: savedPayout,
                updatedRevenue,
            });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
