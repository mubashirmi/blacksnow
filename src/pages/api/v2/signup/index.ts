// pages/api/auth/[id].ts

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// mirror the Prisma enum to validate incoming payloads
const AllowedRoles = new Set(['Affiliate', 'Sales', 'Admin', 'NewsLetter', 'Rsvp', 'DigitalBillboard']);

function normalizeRoles(input: unknown): string[] {
    // accept: roles: string[], or role: string (back-compat)
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

    // ✅ Gmail service approach (as requested)
    // Put these in env vars to avoid hardcoding secrets.

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'malikmubashir.3175709877@gmail.com',
            pass: 'fhwd vueu fbnl agao',
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
        user: 'malikmubashir.3175709877@gmail.com',
        to,
        subject,
        text,
        html,
    });
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { id, referredBy } = req.query;
    const userId = id ? Number(Array.isArray(id) ? id[0] : id) : undefined;

    try {
        if (req.method === 'POST') {
            const { email, firstName, lastName, password } = req.body;

            // accept both `roles` and legacy `role`
            const rolesInput = 'roles' in req.body ? req.body.roles : req.body.role;
            const roles = normalizeRoles(rolesInput);

            // basic required fields
            if (!email || !firstName || !lastName || !password) {
                return res.status(400).json({
                    message: 'Missing required fields (email, firstName, lastName, password, roles).',
                });
            }

            // validate roles
            try {
                validateRoles(roles);
            } catch (e: any) {
                return res.status(400).json({ message: e.message });
            }

            // check existing
            const existing = await prisma.auth.findUnique({ where: { email: String(email) } });
            if (existing) {
                return res.status(409).json({ message: 'Email already exists.' });
            }

            const plainPassword = String(password);
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            const user = await prisma.auth.create({
                data: {
                    email: String(email),
                    firstName: String(firstName),
                    lastName: String(lastName),
                    password: hashedPassword,
                    roles: roles as any, // Prisma accepts Role[]; strings must match enum
                    ...(referredBy
                        ? {
                              referredById: parseInt(Array.isArray(referredBy) ? referredBy[0] : (referredBy as string), 10),
                          }
                        : {}),
                },
            });

            // send email after successful signup (does NOT affect signup success if mail fails)
            try {
                await sendSignupEmail({
                    to: String(email),
                    roles,
                    plainPassword,
                });
            } catch (mailErr) {
                console.error('Signup email failed:', mailErr);
            }

            return res.status(201).json({ message: 'User created successfully', user });
        }

        if (req.method === 'GET') {
            return res.status(200).json({ message: 'yes this is signup api' });
        }

        if (req.method === 'PUT') {
            if (!userId || Number.isNaN(userId)) {
                return res.status(400).json({ message: 'Invalid or missing user id in URL.' });
            }

            // accept both `roles` and legacy `role`
            const rolesInput = 'roles' in req.body ? req.body.roles : req.body.role;
            const roles = normalizeRoles(rolesInput);

            if (roles.length === 0) {
                return res.status(400).json({ message: 'Provide at least one role to update.' });
            }

            try {
                validateRoles(roles);
            } catch (e: any) {
                return res.status(400).json({ message: e.message });
            }

            const user = await prisma.auth.update({
                where: { id: userId },
                data: { roles: roles as any }, // replace full roles array
            });

            return res.status(200).json({ message: 'Roles updated successfully', user });
        }

        res.setHeader('Allow', ['POST', 'GET', 'PUT']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
