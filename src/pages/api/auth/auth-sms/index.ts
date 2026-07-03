// src/pages/api/auth/auth-sms/index.ts

import prisma from '@/lib/prisma';
import { sendSms } from '@/lib/sendSms';
import { randomInt } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed.',
            });
        }

        const { userEmail, userPhone } = req.body;

        if (!userEmail || !userPhone) {
            return res.status(400).json({
                success: false,
                message: 'User email and phone number are required.',
            });
        }

        const phoneRegex = /^\+[1-9]\d{7,14}$/;

        if (!phoneRegex.test(userPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be in E.164 format, e.g. +923001234567.',
            });
        }

        const user = await prisma.auth.findUnique({
            where: {
                email: userEmail,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        const otp = randomInt(100000, 1000000);

        const otpExpirationDate = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.auth.update({
            where: {
                id: user.id,
            },
            data: {
                otp,
                otpExpirationDate,
                otpVerified: false,
            },
        });

        const smsResult = await sendSms({
            to: userPhone,
            message: `Your BlackSnow verification code is ${otp}. Do not share this code with anyone.`,
        });

        if (!smsResult.success) {
            await prisma.auth.update({
                where: {
                    id: user.id,
                },
                data: {
                    otp: 0,
                    otpExpirationDate: null,
                    otpVerified: false,
                },
            });

            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP SMS.',
                error: smsResult.error,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully.',
            smsSid: smsResult.sid,
        });
    } catch (error: any) {
        console.error('Send phone OTP error:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Something went wrong.',
        });
    }
}
