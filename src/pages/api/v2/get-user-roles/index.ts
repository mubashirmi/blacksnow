import prisma from '@/lib/prisma';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.NEXT_PRIVATE_JWT_SECRET;

function normalizeRoleName(value: string): string {
    /*
     * Allows values such as:
     * "LightningGold"
     * "Lightning Gold"
     * "lightning-gold"
     *
     * to be compared consistently.
     */
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { query } = req;
        const { id } = query;

        try {
            /*
             * Retrieve the user and only the cancelled
             * checkout products needed for role filtering.
             */
            const user = await prisma.auth.findUnique({
                where: {
                    id: parseInt(id as string),
                },
                include: {
                    Checkouts: {
                        where: {
                            cancelSubscripton: true,
                        },
                        select: {
                            product: true,
                            cancelSubscripton: true,
                        },
                    },
                },
            });

            if (!user) {
                return res.status(401).json({
                    message: 'User not found',
                });
            }

            /*
             * Build a list of products whose subscriptions
             * have been cancelled.
             */
            const cancelledProducts = new Set(
                user.Checkouts.filter((checkout) => checkout.cancelSubscripton && checkout.product).map((checkout) => normalizeRoleName(checkout.product!))
            );

            /*
             * Remove only roles that match cancelled
             * checkout products.
             */
            const filteredRoles = user.roles.filter((role) => !cancelledProducts.has(normalizeRoleName(String(role))));

            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                },
                JWT_SECRET,
                {
                    expiresIn: '1d',
                }
            );

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict' as const,
                maxAge: 24 * 60 * 60 * 1000,
                path: '/',
            };

            res.setHeader('Set-Cookie', [serialize('token', token, cookieOptions), serialize('userId', user.id.toString(), cookieOptions)]);

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,

                    /*
                     * Cancelled checkout products are
                     * excluded from the returned roles.
                     */
                    roles: filteredRoles,
                },
            });
        } catch (error: unknown) {
            console.error('Login API error:', error);

            return res.status(500).json({
                message: 'Internal Server Error',
            });
        }
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            message: 'This is the login API',
        });
    }

    res.setHeader('Allow', ['POST']);

    return res.status(405).json({
        message: 'Method Not Allowed',
    });
}
