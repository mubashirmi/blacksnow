import crypto from 'crypto';
import nodemailer from 'nodemailer';

import { recordEmailUsage } from './emailUsage';
import prisma from './prisma';

const transporters = new Map<string, nodemailer.Transporter>();
const OPT_HTML_MARKER = '<!-- OPT_LINKS_INSERTED -->';
const OPT_TEXT_HEADING = 'Manage your email preference:';

type RecipientKind = 'emailUser' | 'auth';

type SchedulableJob = {
    runAt: Date | null;
    repeated: boolean | null;
    timeInterval: number | null;
    weekdays: number[];
    rotationSpanSeconds: number | null;
};

export type EmailJobProcessingSummary = {
    checkedAt: string;
    found: number;
    processed: number;
    sent: number;
    completed: number;
    rescheduled: number;
    skipped: number;
    failed: number;
    failures: Array<{ jobId: string; message: string }>;
};

function getTransporter(cacheKey: string, email: string, appPassword: string) {
    const cached = transporters.get(cacheKey);
    if (cached) return cached;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        pool: true,
        maxConnections: 2,
        maxMessages: 50,
        auth: { user: email, pass: appPassword },
    });

    transporters.set(cacheKey, transporter);
    return transporter;
}

function getBaseUrlFromEnv() {
    const value = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
    if (!value) return '';
    return value.startsWith('http') ? value : `https://${value}`;
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function textToHtml(text: string) {
    return `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;font-size:16px;white-space:pre-wrap;">${escapeHtml(text)}</div>`;
}

function injectHtmlFooter(html: string, footer: string) {
    if (html.includes(OPT_HTML_MARKER)) return html;
    const lower = html.toLowerCase();
    const bodyClose = lower.lastIndexOf('</body>');
    if (bodyClose !== -1) return html.slice(0, bodyClose) + footer + html.slice(bodyClose);
    const htmlClose = lower.lastIndexOf('</html>');
    if (htmlClose !== -1) return html.slice(0, htmlClose) + footer + html.slice(htmlClose);
    return html + footer;
}

function signAuthIdIfPossible(authId: number) {
    const secret = process.env.OPT_LINK_SECRET;
    return secret ? crypto.createHmac('sha256', secret).update(String(authId)).digest('hex') : null;
}

function buildAuthOptLinks(authId: number) {
    const baseUrl = getBaseUrlFromEnv();
    const makeUrl = (path: string) => {
        const url = baseUrl ? new URL(path, baseUrl) : null;
        const query = new URLSearchParams({ authId: String(authId) });
        const signature = signAuthIdIfPossible(authId);
        if (signature) query.set('sig', signature);
        if (!url) return `${path}?${query.toString()}`;
        query.forEach((value, key) => url.searchParams.set(key, value));
        return url.toString();
    };

    return {
        optInUrl: makeUrl(process.env.OPT_IN_PATH || '/opt-in'),
        optOutUrl: makeUrl(process.env.OPT_OUT_PATH || '/opt-out'),
    };
}

function buildEmailUserOptLinks(emailUserId: number) {
    const baseUrl = getBaseUrlFromEnv();
    const path = process.env.OPT_CHANGE_PATH || '/change-opt-setting';
    const makeUrl = (action: 'optin' | 'optout') => {
        const now = Math.floor(Date.now() / 1000);
        const payload = { emailUserId, action, iat: now, exp: now + 60 * 60 * 24 * 30 };
        const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
        const secret = process.env.OPT_TOKEN_SECRET || '';
        const token = secret ? `${body}.${crypto.createHmac('sha256', secret).update(body).digest('base64url')}` : body;
        const url = baseUrl ? new URL(path, baseUrl) : null;
        if (!url) return `${path}?token=${encodeURIComponent(token)}`;
        url.searchParams.set('token', token);
        return url.toString();
    };

    return { optInUrl: makeUrl('optin'), optOutUrl: makeUrl('optout') };
}

function withOptLinks(kind: RecipientKind, id: number, optType: string | null, text: string | null, html: string | null) {
    const normalized = (optType || 'default').trim().toLowerCase();
    const showBoth = normalized === 'default';
    const showOnlyOptOut = ['true', 'optin', 'in', '1', 'yes'].includes(normalized);
    const showOptIn = showBoth || (!showOnlyOptOut && !showBoth);
    const showOptOut = showBoth || showOnlyOptOut;
    const links = kind === 'emailUser' ? buildEmailUserOptLinks(id) : buildAuthOptLinks(id);
    const button = (label: string, href: string, margin: boolean) =>
        `<a href="${href}" style="display:inline-block;padding:14px 22px;border-radius:10px;text-decoration:none;border:1px solid #d1d5db;background:#ffffff;color:#2563eb;font-size:16px;font-weight:600;${
            margin ? 'margin-right:18px;' : ''
        }">${label}</a>`;
    const copyLine = (label: string, href: string) =>
        `<div style="margin-top:8px;"><span style="color:#6b7280;font-size:16px;">${label} </span><a href="${href}" style="color:#2563eb;text-decoration:underline;font-size:16px;">${href}</a></div>`;
    const footer = `${OPT_HTML_MARKER}<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-family:Arial,sans-serif;"><div style="margin:0 0 14px;color:#111827;font-size:20px;font-weight:600;">${OPT_TEXT_HEADING}</div><div style="margin-bottom:18px;">${
        showOptIn ? button('Opt In', links.optInUrl, true) : ''
    }${
        showOptOut ? button('Opt Out', links.optOutUrl, false) : ''
    }</div><div style="color:#6b7280;font-size:16px;font-weight:600;margin:0 0 6px;">If the buttons don’t work, copy &amp; paste:</div>${
        showOptIn ? copyLine('Opt In:', links.optInUrl) : ''
    }${showOptOut ? copyLine('Opt Out:', links.optOutUrl) : ''}</div>`;
    const baseHtml = html?.trim() ? html : text?.trim() ? textToHtml(text) : null;
    return { text, html: baseHtml ? injectHtmlFooter(baseHtml, footer) : null };
}

function addSeconds(date: Date, seconds: number) {
    return new Date(date.getTime() + seconds * 1000);
}

function nextFromWeekdays(from: Date, weekdays: number[], hour = from.getHours(), minute = from.getMinutes()) {
    const candidates = weekdays.map((dayOfWeek) => {
        const base = new Date(from);
        base.setHours(hour, minute, 0, 0);

        let daysToAdd = (dayOfWeek - base.getDay() + 7) % 7;
        if (daysToAdd === 0) daysToAdd = 7;

        const candidate = new Date(base);
        candidate.setDate(base.getDate() + daysToAdd);
        return candidate;
    });

    candidates.sort((a, b) => a.getTime() - b.getTime());
    return candidates[0] ?? null;
}

export function getNextEmailJobRunAt(job: SchedulableJob, now: Date): Date | null {
    const base = job.runAt ? new Date(job.runAt) : now;

    if (job.rotationSpanSeconds && job.rotationSpanSeconds > 0) {
        return addSeconds(base, job.rotationSpanSeconds);
    }

    if (job.repeated && job.weekdays.length > 0) {
        return nextFromWeekdays(base, job.weekdays, base.getHours(), base.getMinutes());
    }

    if (job.repeated && job.timeInterval && job.timeInterval > 0) {
        return addSeconds(base, job.timeInterval);
    }

    return null;
}

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error || 'Unknown error');
}

async function withTransientRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (attempt === attempts) break;

            // RDS/network interruptions are occasionally shorter than a cron tick.
            // A bounded delay lets the same run recover without creating another job.
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
    }

    throw lastError;
}

export async function processDueEmailJobs(now = new Date(), batchSize = 100): Promise<EmailJobProcessingSummary> {
    const safeBatchSize = Number.isInteger(batchSize) && batchSize > 0 ? Math.min(batchSize, 100) : 100;
    const jobs = await withTransientRetry(() =>
        prisma.emailJobResult.findMany({
            where: { status: 'pending', runAt: { lte: now } },
            orderBy: { runAt: 'asc' },
            take: safeBatchSize,
        })
    );

    const summary: EmailJobProcessingSummary = {
        checkedAt: now.toISOString(),
        found: jobs.length,
        processed: 0,
        sent: 0,
        completed: 0,
        rescheduled: 0,
        skipped: 0,
        failed: 0,
        failures: [],
    };

    for (const job of jobs) {
        const locked = await prisma.emailJobResult.updateMany({
            where: { id: job.id, status: 'pending' },
            data: { status: 'processing' },
        });

        if (locked.count === 0) {
            summary.skipped += 1;
            continue;
        }

        summary.processed += 1;

        try {
            const isNewsletter = job.isNewsletter || Boolean(job.newsletterAuthId);
            let senderEmail: string;
            let senderPassword: string;
            let credentialsId: number | null = null;
            let transporterKey: string;

            if (isNewsletter) {
                senderEmail = process.env.NEWSLETTER_SENDER_EMAIL?.trim() || '';
                senderPassword = process.env.NEWSLETTER_SENDER_APP_PASSWORD?.trim() || '';

                if (!senderEmail || !senderPassword) {
                    throw new Error('Newsletter SMTP credentials are not configured');
                }
                transporterKey = `newsletter:${senderEmail}`;
            } else {
                const credentials = await prisma.emailMarketingCredentials.findUnique({
                    where: { authId_role: { authId: job.authId, role: job.role } },
                });
                if (!credentials) throw new Error(`No email credentials found for ${job.role}`);

                senderEmail = credentials.email;
                senderPassword = credentials.appPassword;
                credentialsId = credentials.id;
                transporterKey = `credentials:${credentials.id}`;
            }

            let recipientEmail: string;
            let recipientKind: RecipientKind;
            let recipientId: number;
            let recipientOptType: string | null = null;
            let emailUserId: number | null = null;
            let newsletterAuthId: number | null = null;

            if (isNewsletter) {
                if (!job.newsletterAuthId) throw new Error('Newsletter recipient is missing');

                const recipient = await prisma.auth.findUnique({
                    where: { id: job.newsletterAuthId },
                    select: { id: true, email: true },
                });

                if (!recipient?.email) throw new Error('Newsletter recipient email was not found');
                recipientEmail = recipient.email;
                newsletterAuthId = recipient.id;
                recipientKind = 'auth';
                recipientId = recipient.id;
            } else {
                if (!job.emailUserId) throw new Error('Email CRM recipient is missing');

                const recipient = await prisma.emailUser.findFirst({
                    where: { id: job.emailUserId, role: job.role },
                    select: { id: true, email: true, optType: true },
                });

                if (!recipient?.email) throw new Error('Email CRM recipient email was not found');
                recipientEmail = recipient.email;
                emailUserId = recipient.id;
                recipientKind = 'emailUser';
                recipientId = recipient.id;
                recipientOptType = recipient.optType;
            }

            const transporter = getTransporter(transporterKey, senderEmail, senderPassword);
            const content = withOptLinks(recipientKind, recipientId, recipientOptType, job.text, job.html);
            const delivery = await transporter.sendMail({
                from: senderEmail,
                replyTo: !isNewsletter ? recipientEmail : undefined,
                to: recipientEmail,
                subject: job.subject,
                text: content.text ?? undefined,
                html: content.html ?? undefined,
            });

            await prisma.emailSentHistory.create({
                data: {
                    subject: job.subject,
                    text: content.text,
                    html: content.html,
                    sentAt: new Date(),
                    status: 'sent',
                    messageId: typeof delivery.messageId === 'string' ? delivery.messageId : null,
                    authId: job.authId,
                    role: job.role,
                    emailUserId,
                    newsletterAuthId,
                    credentialsId,
                    jobResultId: job.id,
                },
            });

            try {
                await recordEmailUsage(job.authId, 1);
            } catch (usageError) {
                console.error(`[email-cron] Failed to record usage for job ${job.id}:`, usageError);
            }

            const nextRunAt = getNextEmailJobRunAt(job, now);

            await prisma.emailJobResult.update({
                where: { id: job.id },
                data: nextRunAt ? { status: 'pending', runAt: nextRunAt, updatedAt: new Date() } : { status: 'sent', updatedAt: new Date() },
            });

            summary.sent += 1;
            if (nextRunAt) summary.rescheduled += 1;
            else summary.completed += 1;
        } catch (error) {
            const message = errorMessage(error);

            await prisma.emailJobResult.update({
                where: { id: job.id },
                data: { status: 'pending', updatedAt: new Date() },
            });

            summary.failed += 1;
            summary.failures.push({ jobId: job.id, message });
            console.error(`[email-cron] Email job ${job.id} failed:`, message);
        }
    }

    return summary;
}

export async function closeEmailJobTransports() {
    for (const transporter of transporters.values()) {
        try {
            transporter.close();
        } catch {}
    }

    transporters.clear();
}
