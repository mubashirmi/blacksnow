// app/api/auth/verify-phone-otp/route.ts

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { userEmail, otp } = body;

        if (!userEmail || !otp) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User email and OTP are required.',
                },
                { status: 400 }
            );
        }

        const otpNumber = Number(otp);

        if (!Number.isInteger(otpNumber) || otpNumber < 100000 || otpNumber > 999999) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid OTP format.',
                },
                { status: 400 }
            );
        }

        const user = await prisma.auth.findUnique({
            where: {
                email: userEmail,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                { status: 404 }
            );
        }

        if (!user.otpExpirationDate) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No OTP found. Please request a new OTP.',
                },
                { status: 400 }
            );
        }

        const isExpired = new Date() > user.otpExpirationDate;

        if (isExpired) {
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

            return NextResponse.json(
                {
                    success: false,
                    message: 'OTP has expired. Please request a new OTP.',
                },
                { status: 400 }
            );
        }

        if (user.otp !== otpNumber) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid OTP.',
                },
                { status: 400 }
            );
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

        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully.',
        });
    } catch (error: any) {
        console.error('Verify phone OTP error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
