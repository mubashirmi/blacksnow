// src/pages/api/auth/auth-email/index.ts

import { prisma } from '@/lib/prisma';
import { sendEmail, type SendEmailAttachment } from '@/lib/sendEmail';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

const BRAND_NAME = 'Black Snow Holdings';
const BRAND_BLUE = '#1557FF';
const BRAND_DARK = '#000000';
const BRAND_WHITE = '#FFFFFF';
const LOGO_CONTENT_ID = 'blacksnow-logo';

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function getMimeType(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.svg') return 'image/svg+xml';

    return 'image/png';
}

function getLogoAttachment(): SendEmailAttachment {
    const logoPath = path.join(process.cwd(), 'public', 'email', 'blacksnow-logo.png');

    if (!fs.existsSync(logoPath)) {
        throw new Error(`Logo file not found at: ${logoPath}`);
    }

    const logoBase64 = fs.readFileSync(logoPath).toString('base64');

    return {
        content: logoBase64,
        filename: 'blacksnow-logo.png',
        type: getMimeType(logoPath),
        disposition: 'inline',
        content_id: LOGO_CONTENT_ID,
    };
}

function buildOtpText(fullName: string, otp: number) {
    return `
Hi ${fullName || 'there'},

Your Black Snow Holdings verification code is:

${otp}

This code will expire in 10 minutes.

If you did not request this code, you can safely ignore this email.

Thank you,
Black Snow Holdings
`;
}

function buildOtpHtml(fullName: string, otp: number) {
    const safeName = escapeHtml(fullName || 'there');

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${BRAND_NAME} Email Verification</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6fb; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
      Your Black Snow Holdings verification code is ${otp}. This code expires in 10 minutes.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6fb; padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px; background-color:${BRAND_WHITE}; border-radius:18px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.12);">
            
            <tr>
              <td style="background-color:${BRAND_DARK}; padding:34px 28px; text-align:center;">
                <img 
                  src="cid:${LOGO_CONTENT_ID}" 
                  alt="${BRAND_NAME}" 
                  width="120" 
                  style="display:block; margin:0 auto 18px auto; max-width:120px; height:auto;" 
                />

                <div style="color:${BRAND_WHITE}; font-size:24px; font-weight:700; letter-spacing:0.3px;">
                  ${BRAND_NAME}
                </div>

                <div style="color:#b9c7ff; font-size:14px; margin-top:8px;">
                  Secure Email Verification
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:38px 32px 18px 32px;">
                <h1 style="margin:0 0 14px 0; color:#111827; font-size:26px; line-height:1.3; font-weight:700;">
                  Verify your email address
                </h1>

                <p style="margin:0 0 20px 0; color:#4b5563; font-size:16px; line-height:1.7;">
                  Hi ${safeName},
                </p>

                <p style="margin:0 0 24px 0; color:#4b5563; font-size:16px; line-height:1.7;">
                  Use the verification code below to complete your email verification for 
                  <strong style="color:#111827;">${BRAND_NAME}</strong>.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding:8px 0 28px 0;">
                      <div style="
                        display:inline-block;
                        background-color:#f1f5ff;
                        border:2px solid ${BRAND_BLUE};
                        border-radius:16px;
                        padding:20px 30px;
                        color:${BRAND_BLUE};
                        font-size:36px;
                        line-height:1;
                        font-weight:800;
                        letter-spacing:8px;
                      ">
                        ${otp}
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 16px 0; color:#4b5563; font-size:15px; line-height:1.7;">
                  This code will expire in 
                  <strong style="color:#111827;">10 minutes</strong>.
                </p>

                <p style="margin:0; color:#6b7280; font-size:14px; line-height:1.7;">
                  If you did not request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 32px 34px 32px;">
                <div style="height:1px; background-color:#e5e7eb; margin-bottom:22px;"></div>

                <p style="margin:0; color:#6b7280; font-size:13px; line-height:1.7; text-align:center;">
                  This is an automated security email from 
                  <strong style="color:#111827;">${BRAND_NAME}</strong>.
                </p>

                <p style="margin:10px 0 0 0; color:#9ca3af; font-size:12px; line-height:1.6; text-align:center;">
                  Please do not reply to this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
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

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address',
            });
        }

        const user = await prisma.auth.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });
        console.log(user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        const otp = generateOtp();
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

        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

        const emailResult = await sendEmail({
            to: user.email,
            subject: `${BRAND_NAME} - Your verification code`,
            text: buildOtpText(fullName, otp),
            html: buildOtpHtml(fullName, otp),
            attachments: [getLogoAttachment()],
        });

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            sendgrid: emailResult,
        });
    } catch (error: any) {
        console.error('Send OTP error:', {
            message: error?.message,
            code: error?.code,
        });

        return res.status(500).json({
            success: false,
            message: 'Something went wrong while sending OTP',
        });
    }
}
