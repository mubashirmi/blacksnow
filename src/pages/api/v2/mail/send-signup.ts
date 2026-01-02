// pages/api/mail/send-signup.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const AllowedRoles = new Set(['Affiliate', 'Sales', 'Admin', 'NewsLetter', 'Rsvp', 'DigitalBillboard']);

function normalizeRoles(input: unknown): string[] {
    if (Array.isArray(input)) return input.map(String);
    if (typeof input === 'string' && input.trim()) return [input.trim()];
    return [];
}

function validateRoles(roles: string[]) {
    const invalid = roles.filter((r) => !AllowedRoles.has(r));
    if (invalid.length) {
        throw new Error(`Invalid role(s): ${invalid.join(', ')}. Allowed: ${Array.from(AllowedRoles).join(', ')}`);
    }
}

function escapeHtml(input: string) {
    return input.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

async function sendSignupEmail(params: { to: string; roles: string[]; plainPassword: string }) {
    const { to, roles, plainPassword } = params;

    // EXACT approach you asked for (Gmail service)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'malikmubashir.3175709877@gmail.com',
            pass: 'fhwd vueu fbnl agao', // app password
        },
    });

    const rolesText = roles.length ? roles.join(', ') : '(none)';
    const subject = 'Your account has been created';

    const text = `Your account has been created successfully.

Email: ${to}
Roles: ${rolesText}
Password: ${plainPassword}

If you did not request this, please contact support.`;

    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Your account has been created successfully</h2>
      <p><strong>Email:</strong> ${escapeHtml(to)}</p>
      <p><strong>Roles:</strong> ${escapeHtml(rolesText)}</p>
      <p><strong>Password:</strong> ${escapeHtml(plainPassword)}</p>
      <p style="color:#666; font-size: 12px;">
        If you did not request this, please contact support.
      </p>
    </div>
  `;

    await transporter.sendMail({
        from: 'malikmubashir.3175709877@gmail.com',
        to,
        subject,
        text,
        html,
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        const { email, password, roles } = req.body ?? {};
        const normalizedRoles = normalizeRoles(roles);

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing required fields (email, password, roles).' });
        }

        try {
            validateRoles(normalizedRoles);
        } catch (e: any) {
            return res.status(400).json({ message: e.message });
        }

        await sendSignupEmail({
            to: String(email),
            roles: normalizedRoles,
            plainPassword: String(password),
        });

        return res.status(200).json({ message: 'Email sent successfully' });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ message: err?.message || 'Internal Server Error' });
    }
}
