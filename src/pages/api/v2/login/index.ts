import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_EMAIL = process.env.NEXT_PRIVATE_ADMIN_EMAIL;
const ADMIN_PASS = process.env.NEXT_PRIVATE_ADMIN_PASS;
const JWT_SECRET = process.env.NEXT_PRIVATE_JWT_SECRET;

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // ✅ Check for environment admin login first
            if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
                const token = jwt.sign({ userId: 'env-admin', email: ADMIN_EMAIL, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict' as const,
                    maxAge: 24 * 60 * 60 * 1000,
                    path: '/',
                };

                res.setHeader('Set-Cookie', [
                    serialize('token', token, cookieOptions),
                    serialize('userId', 'env-admin', cookieOptions),
                    serialize('role', 'admin', cookieOptions),
                ]);

                return res.status(200).json({
                    message: 'Admin login successful',
                    token,
                    role: 'admin',
                });
            }

            // 🔁 Else, check against database
            const user = await prisma.auth.findUnique({
                where: { email },
            });

            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

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
                    roles: user.roles,
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'GET') {
        return res.status(200).json({ message: 'This is the login API' });
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
