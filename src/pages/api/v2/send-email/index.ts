// pages/api/send-email.ts
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

type BodyItem = {
    id?: number; // EmailUser.id (single) OR Auth.id for newsletter
    recipients?: number[]; // NEW: many EmailUser.id OR Auth.id in one item
    subject?: string;
    text?: string;
    html?: string;
    runAt?: string | Date;
    repeated?: boolean;
    timeInterval?: number; // seconds
    weekdays?: number[]; // 0=Sun..6=Sat (BY_WEEKDAY)

    weeklyRotation?: {
        startAt?: string | Date;
        dayOfWeek: number; // 0..6
        totalSteps: number; // N in rotation (e.g., 3)
        position: number; // 1..N
        hour?: number; // 0..23
        minute?: number; // 0..59
    };

    intervalRotation?: {
        startAt?: string | Date;
        intervalSeconds: number; // cadence
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
            ids, // legacy immediate broadcast
            runAt, // legacy schedule
            repeated, // legacy schedule
            timeInterval, // legacy schedule
            items, // new flexible
            isNewsletter, // NEW: flag to indicate newsletter mode
        } = req.body ?? {};

        // ---- Validation ----
        if (!adminId) return res.status(400).json({ message: '"adminId" is required' });

        // Determine credentials based on mode
        let senderEmail: string;
        let senderPassword: string;
        let credentialsId: number | null = null;

        if (isNewsletter) {
            // Use hardcoded newsletter credentials
            senderEmail = 'malikmubashir.3175709877@gmail.com';
            senderPassword = 'fhwd vueu fbnl agao';
        } else {
            // Use admin's email marketing credentials
            const adminMail = await prisma.emailMarketingCredentials.findUnique({
                where: { authId: Number(adminId) },
            });
            if (!adminMail) return res.status(404).json({ message: 'Admin email credentials not found' });
            senderEmail = adminMail.email;
            senderPassword = adminMail.appPassword;
            credentialsId = adminMail.id;
        }

        // ---------- Helpers ----------
        const toDate = (d?: string | Date) => (d ? new Date(d) : undefined);
        const addSeconds = (d: Date, s: number) => new Date(d.getTime() + s * 1000);

        const nextWeekdayAt = (from: Date, dayOfWeek: number, hour = 9, minute = 0) => {
            const base = new Date(from);
            base.setHours(hour, minute, 0, 0);
            const now = new Date();
            let daysToAdd = (dayOfWeek - base.getDay() + 7) % 7;
            if (daysToAdd === 0 && base <= now) daysToAdd = 7;
            const out = new Date(base);
            out.setDate(base.getDate() + daysToAdd);
            return out;
        };

        const getTargetsFromItem = (it: BodyItem): number[] => {
            const list = Array.isArray(it.recipients) && it.recipients.length > 0 ? it.recipients : typeof it.id === 'number' ? [it.id] : [];
            return [...new Set(list.map(Number))];
        };

        const hasSchedulingHints = (it: BodyItem) =>
            it.runAt !== undefined ||
            it.repeated === true ||
            (typeof it.timeInterval === 'number' && it.timeInterval > 0) ||
            (Array.isArray(it.weekdays) && it.weekdays.length > 0) ||
            !!it.weeklyRotation ||
            !!it.intervalRotation;

        // ---------- IMMEDIATE MANY-TO-MANY via items[] ----------
        if (Array.isArray(items) && items.length > 0 && items.every((it) => !hasSchedulingHints(it))) {
            const allTargetIds = [...new Set(items.flatMap((it: BodyItem) => getTargetsFromItem(it)))];
            if (allTargetIds.length === 0) {
                return res.status(400).json({ message: 'Provide at least one "id" or "recipients" in items.' });
            }

            // Fetch recipients based on mode
            let recipientsMap: Map<number, { id: number; email: string }>;

            if (isNewsletter) {
                const authUsers = await prisma.auth.findMany({
                    where: {
                        id: { in: allTargetIds },
                        roles: { has: 'NewsLetter' },
                    },
                });
                recipientsMap = new Map(authUsers.map((u) => [u.id, { id: u.id, email: u.email }]));
                if (authUsers.length === 0) {
                    return res.status(404).json({ message: 'No newsletter users found for provided recipients.' });
                }
            } else {
                const emailUsers = await prisma.emailUser.findMany({
                    where: { id: { in: allTargetIds } },
                });
                recipientsMap = new Map(emailUsers.map((u) => [u.id, { id: u.id, email: u.email }]));
                if (emailUsers.length === 0) {
                    return res.status(404).json({ message: 'No email users found for provided recipients.' });
                }
            }

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                pool: true,
                auth: { user: senderEmail, pass: senderPassword },
            });

            const results: Array<any> = [];

            for (const it of items as BodyItem[]) {
                const subj = it.subject ?? subject ?? '(no subject)';
                const bodyText = it.text ?? text ?? undefined;
                const bodyHtml = it.html ?? html ?? undefined;

                const targets = getTargetsFromItem(it);
                if (targets.length === 0) {
                    results.push({ item: it, status: 'failed', error: 'No recipients for item' });
                    continue;
                }
                if (!bodyText && !bodyHtml) {
                    for (const rid of targets) {
                        const user = recipientsMap.get(rid);
                        results.push({
                            userId: rid,
                            userEmail: user?.email,
                            status: 'failed',
                            error: 'Provide text or html for item (or top-level fallback).',
                        });
                    }
                    continue;
                }

                for (const rid of targets) {
                    const u = recipientsMap.get(rid);
                    if (!u) {
                        results.push({ userId: rid, status: 'failed', error: 'Recipient not found' });
                        continue;
                    }

                    try {
                        const info = await transporter.sendMail({
                            from: fromName ? { name: fromName, address: senderEmail } : senderEmail,
                            to: u.email,
                            subject: subj,
                            text: bodyText,
                            html: bodyHtml,
                        });

                        // Save to history
                        await prisma.emailSentHistory.create({
                            data: {
                                subject: subj,
                                text: bodyText ?? null,
                                html: bodyHtml ?? null,
                                status: 'sent',
                                messageId: info.messageId ?? null,
                                sentAt: new Date(),
                                authId: Number(adminId),
                                emailUserId: isNewsletter ? null : u.id,
                                newsletterAuthId: isNewsletter ? u.id : null,
                                credentialsId: credentialsId,
                                jobResultId: null,
                            },
                        });

                        // Keep legacy sent log (only for email users)
                        if (!isNewsletter) {
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
                        }

                        results.push({
                            userId: u.id,
                            userEmail: u.email,
                            status: 'sent',
                            messageId: info.messageId,
                            accepted: (info.accepted as string[]) ?? [],
                            rejected: (info.rejected as string[]) ?? [],
                        });
                    } catch (e: any) {
                        await prisma.emailSentHistory.create({
                            data: {
                                subject: subj,
                                text: bodyText ?? null,
                                html: bodyHtml ?? null,
                                status: 'failed',
                                errorMessage: e?.message ?? 'Unknown error',
                                sentAt: null,
                                authId: Number(adminId),
                                emailUserId: isNewsletter ? null : targets[0],
                                newsletterAuthId: isNewsletter ? targets[0] : null,
                                credentialsId: credentialsId,
                                jobResultId: null,
                            },
                        });

                        results.push({
                            userId: u?.id ?? targets[0],
                            userEmail: u?.email,
                            status: 'failed',
                            error: e?.message ?? 'Unknown error',
                        });
                    }
                }
            }

            transporter.close();
            const anySent = results.some((r) => r.status === 'sent');
            return res.status(anySent ? 200 : 500).json({
                message: anySent ? 'Processed' : 'Failed to send',
                results,
            });
        }

        // ---------- IMMEDIATE (legacy broadcast with ids[]) ----------
        if ((runAt === undefined || runAt === '') && !items) {
            if (!text && !html) {
                return res.status(400).json({ message: 'Provide "text" or "html" content.' });
            }
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: '"ids" must be a non-empty array.' });
            }

            let recipients: Array<{ id: number; email: string }>;

            if (isNewsletter) {
                const authUsers = await prisma.auth.findMany({
                    where: {
                        id: { in: ids },
                        roles: { has: 'NewsLetter' },
                    },
                });
                recipients = authUsers.map((u) => ({ id: u.id, email: u.email }));
                if (recipients.length === 0) {
                    return res.status(404).json({ message: 'No newsletter users found for provided ids.' });
                }
            } else {
                const emailUsers = await prisma.emailUser.findMany({ where: { id: { in: ids } } });
                recipients = emailUsers;
                if (recipients.length === 0) {
                    return res.status(404).json({ message: 'No email users found for provided ids.' });
                }
            }

            const transporter = nodemailer.createTransporter({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                pool: true,
                auth: { user: senderEmail, pass: senderPassword },
            });

            const results = await Promise.all(
                recipients.map(async (u) => {
                    try {
                        const info = await transporter.sendMail({
                            from: fromName ? { name: fromName, address: senderEmail } : senderEmail,
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
                                authId: Number(adminId),
                                emailUserId: isNewsletter ? null : u.id,
                                newsletterAuthId: isNewsletter ? u.id : null,
                                credentialsId: credentialsId,
                            },
                        });

                        if (!isNewsletter) {
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
                        }

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

        // ---------- SCHEDULED/AUTOMATION ----------
        const rowsToCreate: Array<any> = [];

        const pushRow = (data: any) => rowsToCreate.push(data);

        const expandTargets = (it: BodyItem): number[] => {
            const ids = getTargetsFromItem(it);
            if (ids.length === 0) throw new Error('Each item must include "id" or "recipients".');
            return ids;
        };

        const allIdsReferenced = Array.isArray(items) && items.length > 0 ? [...new Set(items.flatMap((it: BodyItem) => expandTargets(it)))] : [];

        let recipientsMap = new Map<number, { id: number; email: string }>();
        if (allIdsReferenced.length > 0) {
            if (isNewsletter) {
                const authUsers = await prisma.auth.findMany({
                    where: {
                        id: { in: allIdsReferenced },
                        roles: { has: 'NewsLetter' },
                    },
                });
                recipientsMap = new Map(authUsers.map((u) => [u.id, { id: u.id, email: u.email }]));
                if (authUsers.length === 0) {
                    return res.status(404).json({ message: 'No newsletter users found for provided ids in "items".' });
                }
            } else {
                const emailUsers = await prisma.emailUser.findMany({
                    where: { id: { in: allIdsReferenced } },
                });
                recipientsMap = new Map(emailUsers.map((u) => [u.id, { id: u.id, email: u.email }]));
                if (emailUsers.length === 0) {
                    return res.status(404).json({ message: 'No email users found for provided ids in "items".' });
                }
            }
        }

        if (Array.isArray(items) && items.length > 0) {
            for (const it of items as BodyItem[]) {
                const subj = it.subject ?? subject ?? '(no subject)';
                const bodyText = it.text ?? text ?? null;
                const bodyHtml = it.html ?? html ?? null;

                const targets = expandTargets(it);

                // (i) WEEKLY ROTATION
                if (it.weeklyRotation) {
                    const { dayOfWeek, totalSteps, position, startAt, hour, minute } = it.weeklyRotation;
                    if (!(totalSteps >= 1) || !(position >= 1 && position <= totalSteps)) {
                        return res.status(400).json({
                            message: 'weeklyRotation requires valid totalSteps and position',
                        });
                    }
                    const base = toDate(startAt) ?? toDate(it.runAt) ?? new Date();
                    const first = nextWeekdayAt(base, dayOfWeek, hour ?? 9, minute ?? 0);
                    const runAtCalc = addSeconds(first, (position - 1) * 7 * 24 * 3600);
                    const rotationSpanSeconds = totalSteps * 7 * 24 * 3600;

                    for (const rid of targets) {
                        if (!recipientsMap.get(rid)) continue;
                        pushRow({
                            text: bodyText,
                            html: bodyHtml,
                            subject: subj,
                            authId: Number(adminId),
                            emailUserId: isNewsletter ? null : rid,
                            newsletterAuthId: isNewsletter ? rid : null,
                            runAt: runAtCalc,
                            repeated: true,
                            timeInterval: null,
                            rotationSpanSeconds,
                            status: 'pending',
                            isNewsletter: !!isNewsletter,
                        });
                    }
                    continue;
                }

                // (ii) INTERVAL ROTATION
                if (it.intervalRotation) {
                    const { intervalSeconds, totalSteps, position, startAt } = it.intervalRotation;
                    if (!(intervalSeconds > 0) || !(totalSteps >= 1) || !(position >= 1 && position <= totalSteps)) {
                        return res.status(400).json({
                            message: 'intervalRotation requires intervalSeconds>0 and valid totalSteps/position',
                        });
                    }
                    const base = toDate(startAt) ?? toDate(it.runAt) ?? new Date();
                    const runAtCalc = addSeconds(base, (position - 1) * intervalSeconds);
                    const rotationSpanSeconds = totalSteps * intervalSeconds;

                    for (const rid of targets) {
                        if (!recipientsMap.get(rid)) continue;
                        pushRow({
                            text: bodyText,
                            html: bodyHtml,
                            subject: subj,
                            authId: Number(adminId),
                            emailUserId: isNewsletter ? null : rid,
                            newsletterAuthId: isNewsletter ? rid : null,
                            runAt: runAtCalc,
                            repeated: true,
                            timeInterval: null,
                            rotationSpanSeconds,
                            status: 'pending',
                            isNewsletter: !!isNewsletter,
                        });
                    }
                    continue;
                }

                // (iii) BY_WEEKDAY
                if (Array.isArray(it.weekdays) && it.weekdays.length > 0) {
                    const base = toDate(it.runAt) ?? new Date();
                    const hour = toDate(it.runAt)?.getHours() ?? 9;
                    const minute = toDate(it.runAt)?.getMinutes() ?? 0;
                    const candidates = it.weekdays.map((dow) => nextWeekdayAt(base, dow, hour, minute));
                    candidates.sort((a, b) => a.getTime() - b.getTime());
                    const first = candidates[0];

                    for (const rid of targets) {
                        if (!recipientsMap.get(rid)) continue;
                        pushRow({
                            text: bodyText,
                            html: bodyHtml,
                            subject: subj,
                            authId: Number(adminId),
                            emailUserId: isNewsletter ? null : rid,
                            newsletterAuthId: isNewsletter ? rid : null,
                            runAt: first,
                            repeated: true,
                            timeInterval: null,
                            weekdays: it.weekdays,
                            status: 'pending',
                            isNewsletter: !!isNewsletter,
                        });
                    }
                    continue;
                }

                // (iv) Simple one-time or simple interval repeat
                const runAtFinal = it.runAt ? new Date(it.runAt) : runAt ? new Date(runAt) : null;

                for (const rid of targets) {
                    if (!recipientsMap.get(rid)) continue;
                    pushRow({
                        text: bodyText,
                        html: bodyHtml,
                        subject: subj,
                        authId: Number(adminId),
                        emailUserId: isNewsletter ? null : rid,
                        newsletterAuthId: isNewsletter ? rid : null,
                        runAt: runAtFinal,
                        repeated: it.repeated ?? repeated ?? false,
                        timeInterval: it.timeInterval ?? timeInterval ?? null,
                        status: 'pending',
                        isNewsletter: !!isNewsletter,
                    });
                }
            }
        } else {
            // Legacy scheduled: ids[] same content
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: '"ids" must be a non-empty array or use "items".' });
            }

            for (const uid of ids) {
                rowsToCreate.push({
                    text: text ?? null,
                    html: html ?? null,
                    subject: subject ?? '(no subject)',
                    authId: Number(adminId),
                    emailUserId: isNewsletter ? null : Number(uid),
                    newsletterAuthId: isNewsletter ? Number(uid) : null,
                    runAt: runAt ? new Date(runAt) : null,
                    repeated: !!repeated,
                    timeInterval: timeInterval ?? null,
                    status: 'pending',
                    isNewsletter: !!isNewsletter,
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
