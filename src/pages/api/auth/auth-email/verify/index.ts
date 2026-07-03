// src/pages/api/auth/auth-email/verify/index.ts

import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed',
            });
        }

        const body = req.body;

        const email = String(body.email || '')
            .trim()
            .toLowerCase();
        const otp = Number(body.otp);

        if (!email || !body.otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address',
            });
        }

        if (!Number.isInteger(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        const user = await prisma.auth.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                email: true,
                otp: true,
                otpExpirationDate: true,
                otpVerified: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.otpVerified) {
            return res.status(200).json({
                success: true,
                message: 'Email is already verified',
            });
        }

        if (!user.otp || !user.otpExpirationDate) {
            return res.status(400).json({
                success: false,
                message: 'OTP not requested',
            });
        }

        if (user.otpExpirationDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired',
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        await prisma.auth.update({
            where: {
                id: user.id,
            },
            data: {
                otp: 0,
                otpExpirationDate: null,
                otpVerified: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
        });
    } catch (error) {
        console.error('Verify OTP error:', error);

        return res.status(500).json({
            success: false,
            message: 'Something went wrong while verifying OTP',
        });
    }
}
