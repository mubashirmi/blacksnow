// pages/api/send-email.ts
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

type BodyItem = {
    id: number; // EmailUser.id
    subject?: string;
    text?: string;
    html?: string;
    runAt?: string | Date; // ISO or Date
    repeated?: boolean;
    timeInterval?: number; // seconds (kept for compatibility)
    weekdays?: number[]; // 0=Sun..6=Sat (BY_WEEKDAY)
    // Rotation helpers: set either weekly or interval rotation
    weeklyRotation?: {
        startAt?: string | Date; // optional override per item
        dayOfWeek: number; // 0..6
        totalSteps: number; // N in rotation (e.g., 3)
        position: number; // 1..N
        hour?: number; // 0..23 (defaults to startAt hour or 9)
        minute?: number; // 0..59 (defaults to startAt minute or 0)
    };
    intervalRotation?: {
        startAt?: string | Date; // optional override per item
        intervalSeconds: number; // cadence between steps
        totalSteps: number; // N in rotation
        position: number; // 1..N
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const {
            adminId,
            subject,
            text,
            html,
            fromName,
            ids, // legacy shape: number[]
            runAt, // legacy shape
            repeated, // legacy shape
            timeInterval, // legacy shape
            items, // new shape: BodyItem[]
        } = req.body ?? {};

        // ---- Validation ----
        if (!adminId) return res.status(400).json({ message: '"adminId" is required' });

        // Fetch “ReferralProducts” credentials (sender); 1: send FROM ReferralProducts.email TO EmailUser.email
        const adminMail = await prisma.emailMarketingCredentials.findUnique({ where: { authId: Number(adminId) } });
        if (!adminMail) return res.status(404).json({ message: 'Admin not found' });

        // ---------------- IMMEDIATE SEND (items[] many-to-many, per-recipient) ----------------
        // Immediate if EVERY item has no scheduling hints.
        const looksImmediateItem = (it: any) => {
            const hasScheduler =
                it.runAt !== undefined ||
                it.repeated === true ||
                (typeof it.timeInterval === 'number' && it.timeInterval > 0) ||
                Array.isArray(it.weekdays) ||
                !!it.weeklyRotation ||
                !!it.intervalRotation;
            return !hasScheduler;
        };

        if (Array.isArray(items) && items.length > 0 && items.every(looksImmediateItem)) {
            const recipientIds = [...new Set(items.map((i: any) => Number(i.id)))];
            if (recipientIds.length === 0) {
                return res.status(400).json({ message: '"items" must contain at least one item with "id"' });
            }

            const users = await prisma.emailUser.findMany({ where: { id: { in: recipientIds } } });
            const mapUser = new Map(users.map((u) => [u.id, u]));
            if (users.length === 0) return res.status(404).json({ message: 'No users found for provided item ids.' });

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                pool: true,
                auth: { user: adminMail.email, pass: adminMail.appPassword },
            });

            const results = await Promise.all(
                items.map(async (it: BodyItem) => {
                    const u = mapUser.get(Number(it.id));
                    if (!u) {
                        return { userId: it.id, status: 'failed', error: 'Recipient not found' };
                    }

                    const subj = it.subject ?? subject ?? '(no subject)';
                    const bodyText = it.text ?? text ?? undefined;
                    const bodyHtml = it.html ?? html ?? undefined;

                    if (!bodyText && !bodyHtml) {
                        return { userId: u.id, userEmail: u.email, status: 'failed', error: 'Provide text or html for each item (or top-level fallback).' };
                    }

                    try {
                        const info = await transporter.sendMail({
                            from: fromName ? { name: fromName, address: adminMail.email } : adminMail.email,
                            to: u.email,
                            subject: subj,
                            text: bodyText,
                            html: bodyHtml,
                        });

                        // Save immutable history of the actual send
                        await prisma.emailSentHistory.create({
                            data: {
                                subject: subj,
                                text: bodyText ?? null,
                                html: bodyHtml ?? null,
                                status: 'sent',
                                messageId: info.messageId ?? null,
                                sentAt: new Date(),
                                authId: Number(adminId),
                                emailUserId: u.id,
                                credentialsId: adminMail.id,
                                jobResultId: null, // immediate path, not linked to a scheduled job
                            },
                        });

                        // Keep your existing immediate logging in EmailJobResult
                        await prisma.emailJobResult.create({
                            data: {
                                text: bodyText ?? null,
                                html: bodyHtml ?? null,
                                subject: subj,
                                authId: Number(adminId),
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
                        // Persist failed attempt in history too
                        await prisma.emailSentHistory.create({
                            data: {
                                subject: subj,
                                text: bodyText ?? null,
                                html: bodyHtml ?? null,
                                status: 'failed',
                                errorMessage: e?.message ?? 'Unknown error',
                                sentAt: null,
                                authId: Number(adminId),
                                emailUserId: u.id,
                                credentialsId: adminMail.id,
                                jobResultId: null,
                            },
                        });

                        return { userId: u.id, userEmail: u.email, status: 'failed', error: e?.message ?? 'Unknown error' };
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

        // ---------------- IMMEDIATE SEND (legacy broadcast) ----------------
        // Legacy simple broadcast: ids[] + (text|html) now
        if ((runAt === undefined || runAt === '') && !items) {
            if (!text && !html) {
                return res.status(400).json({ message: 'Provide "text" or "html" content.' });
            }
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: '"ids" must be a non-empty array.' });
            }

            const users = await prisma.emailUser.findMany({ where: { id: { in: ids } } });
            if (users.length === 0) return res.status(404).json({ message: 'No users found for provided ids.' });

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                pool: true,
                auth: { user: adminMail.email, pass: adminMail.appPassword },
            });

            const results = await Promise.all(
                users.map(async (u) => {
                    try {
                        const info = await transporter.sendMail({
                            from: fromName ? { name: fromName, address: adminMail.email } : adminMail.email,
                            // 1: send from ReferralProducts.email to EmailUser.email
                            to: u.email,
                            subject: subject ?? '(no subject)',
                            text: text ?? undefined,
                            html: html ?? undefined,
                        });

                        await prisma.emailSentHistory.create({
                            data: {
                                subject,
                                text,
                                html,
                                status: 'sent',
                                messageId: info.messageId,
                                sentAt: new Date(),
                                authId: adminId,
                                emailUserId: u.id,
                                credentialsId: adminMail.id,
                            },
                        });

                        await prisma.emailJobResult.create({
                            data: {
                                text: text ?? null,
                                html: html ?? null,
                                subject: subject ?? '(no subject)',
                                authId: Number(adminId),
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
                        return { userId: u.id, userEmail: u.email, status: 'failed', error: e?.message ?? 'Unknown error' };
                    }
                })
            );

            transporter.close();
            const anySent = results.some((r) => r.status === 'sent');
            return res.status(anySent ? 200 : 500).json({ message: anySent ? 'Processed' : 'Failed to send', results });
        }

        // ---------------- SCHEDULED / AUTOMATION CREATION ----------------
        // New flexible shape (items[] per-recipient) OR legacy shape (ids[] all same content)
        const rowsToCreate: Array<Omit<Parameters<typeof prisma.emailJobResult.create>[0]['data'], 'id' | 'createdAt'>> = [];

        // Helper: next given weekday at hh:mm >= base
        const toDate = (d?: string | Date) => (d ? new Date(d) : undefined);

        const nextWeekdayAt = (from: Date, dayOfWeek: number, hour = 9, minute = 0) => {
            const base = new Date(from);
            // Clamp to today hh:mm or future
            base.setHours(hour, minute, 0, 0);
            const now = new Date();

            let daysToAdd = (dayOfWeek - base.getDay() + 7) % 7;
            if (daysToAdd === 0 && base <= now) daysToAdd = 7;
            const out = new Date(base);
            out.setDate(base.getDate() + daysToAdd);
            return out;
        };

        const addSeconds = (d: Date, s: number) => new Date(d.getTime() + s * 1000);

        // — Case A: items[] (per-recipient content/scheduling, including rotation & weekdays)
        if (Array.isArray(items) && items.length > 0) {
            // prefetch users referenced
            const idsSet = [...new Set(items.map((i: BodyItem) => Number(i.id)))];
            const users = await prisma.emailUser.findMany({ where: { id: { in: idsSet } } });
            const usersMap = new Map(users.map((u) => [u.id, u]));
            if (users.length === 0) return res.status(404).json({ message: 'No users found for provided ids in "items".' });

            for (const it of items as BodyItem[]) {
                const u = usersMap.get(Number(it.id));
                if (!u) continue;

                // Determine content (per-recipient overrides fall back to top-level)
                const subj = it.subject ?? subject ?? '(no subject)';
                const bodyText = it.text ?? text ?? null;
                const bodyHtml = it.html ?? html ?? null;

                // Priority: rotation > weekdays > (runAt + repeated/timeInterval)

                // (i) WEEKLY ROTATION (e.g., 3 steps on consecutive Wednesdays)
                if (it.weeklyRotation) {
                    const { dayOfWeek, totalSteps, position, startAt, hour, minute } = it.weeklyRotation;
                    if (!(totalSteps >= 1) || !(position >= 1 && position <= totalSteps)) {
                        return res.status(400).json({ message: 'weeklyRotation requires valid totalSteps and position' });
                    }
                    const base = toDate(startAt) ?? toDate(it.runAt) ?? new Date();
                    const first = nextWeekdayAt(base, dayOfWeek, hour ?? 9, minute ?? 0);

                    // Place this step at (position-1) * 7d after first
                    const runAt = addSeconds(first, (position - 1) * 7 * 24 * 3600);
                    const rotationSpanSeconds = totalSteps * 7 * 24 * 3600;

                    rowsToCreate.push({
                        text: bodyText,
                        html: bodyHtml,
                        subject: subj,
                        authId: Number(adminId),
                        emailUserId: u.id,
                        runAt,
                        repeated: true,
                        timeInterval: null, // we don't use this for rotation
                        rotationSpanSeconds, // the trick
                        status: 'pending',
                    });
                    continue;
                }

                // (ii) INTERVAL ROTATION (e.g., 3 steps every 2 days)
                if (it.intervalRotation) {
                    const { intervalSeconds, totalSteps, position, startAt } = it.intervalRotation;
                    if (!(intervalSeconds > 0) || !(totalSteps >= 1) || !(position >= 1 && position <= totalSteps)) {
                        return res.status(400).json({ message: 'intervalRotation requires intervalSeconds>0 and valid totalSteps/position' });
                    }
                    const base = toDate(startAt) ?? toDate(it.runAt) ?? new Date();
                    const runAt = addSeconds(base, (position - 1) * intervalSeconds);
                    const rotationSpanSeconds = totalSteps * intervalSeconds;

                    rowsToCreate.push({
                        text: bodyText,
                        html: bodyHtml,
                        subject: subj,
                        authId: Number(adminId),
                        emailUserId: u.id,
                        runAt,
                        repeated: true,
                        timeInterval: null,
                        rotationSpanSeconds,
                        status: 'pending',
                    });
                    continue;
                }

                // (iii) BY_WEEKDAY (e.g., Wed/Fri/Sun forever)
                if (Array.isArray(it.weekdays) && it.weekdays.length > 0) {
                    const base = toDate(it.runAt) ?? new Date();
                    // Compute the very next occurrence among the given weekdays at the time in runAt (or default 09:00)
                    const hour = toDate(it.runAt)?.getHours() ?? 9;
                    const minute = toDate(it.runAt)?.getMinutes() ?? 0;

                    // Find earliest next among provided days
                    const candidates = it.weekdays.map((dow) => nextWeekdayAt(base, dow, hour, minute));
                    candidates.sort((a, b) => a.getTime() - b.getTime());
                    const first = candidates[0];

                    rowsToCreate.push({
                        text: bodyText,
                        html: bodyHtml,
                        subject: subj,
                        authId: Number(adminId),
                        emailUserId: u.id,
                        runAt: first,
                        repeated: true,
                        timeInterval: null,
                        weekdays: it.weekdays,
                        status: 'pending',
                    });
                    continue;
                }

                // (iv) Legacy / simple scheduled entry (one-time or simple interval repeat)
                const runAtFinal = it.runAt ? new Date(it.runAt) : runAt ? new Date(runAt) : null;

                rowsToCreate.push({
                    text: bodyText,
                    html: bodyHtml,
                    subject: subj,
                    authId: Number(adminId),
                    emailUserId: u.id,
                    runAt: runAtFinal, // may be null (but recommended to set)
                    repeated: it.repeated ?? repeated ?? false,
                    timeInterval: it.timeInterval ?? timeInterval ?? null, // seconds
                    status: 'pending',
                });
            }
        }
        // — Case B: legacy ids[] (schedule same content to all)
        else {
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: '"ids" must be a non-empty array or use "items".' });
            }
            const users = await prisma.emailUser.findMany({ where: { id: { in: ids } } });
            if (users.length === 0) return res.status(404).json({ message: 'No users found for provided ids.' });

            for (const u of users) {
                rowsToCreate.push({
                    text: text ?? null,
                    html: html ?? null,
                    subject: subject ?? '(no subject)',
                    authId: Number(adminId),
                    emailUserId: u.id,
                    runAt: runAt ? new Date(runAt) : null,
                    repeated: !!repeated,
                    timeInterval: timeInterval ?? null,
                    status: 'pending',
                });
            }
        }

        if (rowsToCreate.length === 0) {
            return res.status(400).json({ message: 'Nothing to schedule. Provide "items" or "ids".' });
        }

        await prisma.$transaction(async (tx) => {
            for (const row of rowsToCreate) {
                await tx.emailJobResult.create({ data: row as any });
            }
        });

        return res.status(200).json({ message: 'Scheduled', count: rowsToCreate.length });
    } catch (error: any) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
