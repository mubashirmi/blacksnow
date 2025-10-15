// pages/api/send-email.ts
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { adminId, subject, text, html, fromName, ids, runAt, repeated, timeInterval } = req.body ?? {};
        console.log(runAt, 'runat');
        // ---- Validation ----
        if (!adminId) {
            return res.status(400).json({ message: '"adminId" is required' });
        }

        if (!text && !html) {
            return res.status(400).json({ message: 'Provide "text" or "html" content.' });
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: '"ids" must be a non-empty array.' });
        }

        // ---- Fetch credentials & users ----
        const adminMail = await prisma.emailMarketingCredentials.findUnique({
            where: { authId: adminId },
        });
        if (!adminMail) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const users = await prisma.emailUser.findMany({
            where: { id: { in: ids } },
            // select: { id: true, email: true, name: true },
        });
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for provided ids.' });
        }

        // ---- Reuse a pooled transporter (faster, fewer handshakes) ----
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            pool: true, // keep the connection open for multiple emails
            auth: {
                user: adminMail.email,
                pass: adminMail.appPassword,
            },
        });

        // Optional: verify credentials up-front (helps fail fast)
        // await transporter.verify();

        // ---- Send in parallel; reply-to per user ----
        if (runAt === undefined || runAt === '') {
            const results = await Promise.all(
                users.map(async (u) => {
                    try {
                        const info = await transporter.sendMail({
                            // Gmail authentication must match the sender domain; use admin's email here
                            from: fromName ? { name: fromName, address: adminMail.email } : adminMail.email,
                            // Put the per-user email as the reply-to, to preserve your original intent
                            replyTo: u.email ?? undefined,
                            to: u.email,
                            subject,
                            text: text ?? undefined,
                            html: html ?? undefined,
                        });
                        await prisma.emailJobResult.create({
                            data: {
                                text,
                                subject,
                                authId: adminId,
                                emailUserId: u.id,
                                status: 'sent',
                            },
                        });
                        return {
                            userId: u.id,
                            userEmail: u.email,
                            status: 'sent',
                            messageId: info.messageId,
                            accepted: (info.accepted as string[]) ?? [],
                            rejected: (info.rejected as string[]) ?? [],
                        };
                    } catch (e: any) {
                        return {
                            userId: u.id,
                            userEmail: u.email,
                            status: 'failed',
                            error: e?.message ?? 'Unknown error',
                        };
                    }
                })
            );

            transporter.close();

            const anySent = results.some((r) => r.status === 'sent');

            return res.status(anySent ? 200 : 500).json({
                message: anySent ? 'Processed' : 'Failed to send',
                results,
            });
        }
        // ---- Schedule path ----
        const results = await Promise.all(
            users.map(async (u) => {
                try {
                    await prisma.emailJobResult.create({
                        data: {
                            text,
                            subject,
                            authId: adminId,
                            emailUserId: u.id,
                            // if Prisma expects a Date, convert:
                            // runAt: new Date(runAt),
                            runAt,
                            repeated,
                            timeInterval,
                            status: 'pending',
                        },
                    });
                    return {
                        userId: u.id,
                        userEmail: u.email,
                        status: 'Email is scheduled',
                    };
                } catch (e: any) {
                    return {
                        userId: u.id,
                        userEmail: u.email,
                        status: 'failed',
                        error: e?.message ?? 'Unknown error',
                    };
                }
            })
        );

        return res.status(200).json({
            message: 'Scheduled',
            results,
        });
    } catch (error: any) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
