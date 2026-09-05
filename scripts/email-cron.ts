// scripts/email-cron.ts
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import cron from 'node-cron';
import nodemailer from 'nodemailer';

import { recordEmailUsage } from '../src/lib/emailUsage';

const prisma = new PrismaClient();

// Optional: cache one transporter per admin email
const transporters = new Map<string, nodemailer.Transporter>();

function getTransporter(email: string, appPassword: string) {
    const key = email;
    if (transporters.has(key)) return transporters.get(key)!;

    const t = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        pool: true,
        maxConnections: 2,
        maxMessages: 50,
        auth: { user: email, pass: appPassword },
    });

    transporters.set(key, t);
    return t;
}

// =====================
// OPT IN / OPT OUT HELPERS
// =====================
const OPT_HTML_MARKER = '<!-- OPT_LINKS_INSERTED -->';
const OPT_TEXT_HEADING = 'Manage your email preference:';

function getBaseUrlFromEnv(): string {
    const envUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL;

    if (!envUrl) return '';
    return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
}

const normalizeOptType = (v?: string | null) => (v ?? 'default').toString().trim().toLowerCase();
const isDefaultOpt = (v?: string | null) => normalizeOptType(v) === 'default';
const isTrueOpt = (v?: string | null) => {
    const n = normalizeOptType(v);
    return n === 'true' || n === 'optin' || n === 'in' || n === '1' || n === 'yes';
};

function injectHtmlFooter(html: string, footer: string): string {
    if (!html) return html;
    if (html.includes(OPT_HTML_MARKER)) return html;

    const lower = html.toLowerCase();
    const bodyClose = lower.lastIndexOf('</body>');
    if (bodyClose !== -1) return html.slice(0, bodyClose) + footer + html.slice(bodyClose);

    const htmlClose = lower.lastIndexOf('</html>');
    if (htmlClose !== -1) return html.slice(0, htmlClose) + footer + html.slice(htmlClose);

    return html + footer;
}

function injectTextFooter(text: string, footer: string): string {
    if (!text) return text;
    if (text.includes(OPT_TEXT_HEADING)) return text; // dedupe
    return `${text}\n\n${footer}`;
}

// --- NEW: ensure we ALWAYS have HTML so Gmail shows buttons ---
function escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function textToHtml(text: string) {
    // keep line breaks and basic look
    const safe = escapeHtml(text);
    return `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;font-size:16px;white-space:pre-wrap;">${safe}</div>`;
}

// ---------- Newsletter/Auth link builder (keeps your existing behavior) ----------
function signAuthIdIfPossible(authId: number): string | null {
    const secret = process.env.OPT_LINK_SECRET;
    if (!secret) return null;
    return crypto.createHmac('sha256', secret).update(String(authId)).digest('hex');
}

function buildAuthOptLinks(authId: number) {
    const baseUrl = getBaseUrlFromEnv();

    const optInPath = process.env.OPT_IN_PATH || '/opt-in';
    const optOutPath = process.env.OPT_OUT_PATH || '/opt-out';

    const sig = signAuthIdIfPossible(authId);

    const makeUrl = (path: string) => {
        const qs = new URLSearchParams();
        qs.set('authId', String(authId));
        if (sig) qs.set('sig', sig);

        if (!baseUrl) return `${path}?${qs.toString()}`;

        const u = new URL(path, baseUrl);
        qs.forEach((v, k) => u.searchParams.set(k, v));
        return u.toString();
    };

    return {
        optInUrl: makeUrl(optInPath),
        optOutUrl: makeUrl(optOutPath),
    };
}

// ---------- EmailUser token builder ----------
type OptAction = 'optin' | 'optout';

type OptTokenPayload = {
    emailUserId: number;
    action: OptAction;
    iat: number;
    exp: number;
};

const b64urlEncode = (buf: Buffer) => buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

function signOptToken(emailUserId: number, action: OptAction, ttlSeconds = 60 * 60 * 24 * 30) {
    const secret = process.env.OPT_TOKEN_SECRET || '';
    const iat = Math.floor(Date.now() / 1000);
    const payload: OptTokenPayload = { emailUserId, action, iat, exp: iat + ttlSeconds };
    const body = b64urlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));

    if (!secret) return { token: body, insecure: true };

    const sigBytes = crypto.createHmac('sha256', secret).update(body).digest();
    return { token: `${body}.${b64urlEncode(sigBytes)}`, insecure: false };
}

function buildEmailUserOptLinks(emailUserId: number) {
    const baseUrl = getBaseUrlFromEnv();
    const changePath = process.env.OPT_CHANGE_PATH || '/change-opt-setting';

    const makeUrl = (action: OptAction) => {
        const { token } = signOptToken(emailUserId, action);
        const qs = new URLSearchParams();
        qs.set('token', token);

        if (!baseUrl) return `${changePath}?${qs.toString()}`;

        const u = new URL(changePath, baseUrl);
        qs.forEach((v, k) => u.searchParams.set(k, v));
        return u.toString();
    };

    return {
        optInUrl: makeUrl('optin'),
        optOutUrl: makeUrl('optout'),
    };
}

// ---------- Apply footer depending on optType ----------
type RecipientKind = 'emailUser' | 'auth';

function withOptLinks(
    kind: RecipientKind,
    id: number | null,
    optType: string | null,
    text?: string | null,
    html?: string | null
): { text?: string | null; html?: string | null } {
    if (!id) return { text, html };

    const showBoth = isDefaultOpt(optType);
    const showOnlyOptOut = isTrueOpt(optType);

    const showOptIn = showBoth || (!showOnlyOptOut && !showBoth);
    const showOptOut = showBoth || showOnlyOptOut;

    const links = kind === 'emailUser' ? buildEmailUserOptLinks(id) : buildAuthOptLinks(id);

    // TEXT footer (keep behavior: text version exists)
    const textFooter = `${OPT_TEXT_HEADING}\n${showOptIn ? 'Opt In:' : ''}${showOptIn && showOptOut ? '\n' : ''}${showOptOut ? 'Opt Out:' : ''}`.trim();

    // ✅ HTML footer = exactly like your screenshot (button + copy/paste URLs)
    const btn = (label: string, href: string, addRightMargin = true) => `
      <a href="${href}"
         style="
           display:inline-block;
           padding:14px 22px;
           border-radius:10px;
           text-decoration:none;
           border:1px solid #d1d5db;
           background:#ffffff;
           color:#2563eb;
           font-size:16px;
           font-weight:600;
           ${addRightMargin ? 'margin-right:18px;' : ''}
         ">
        ${label}
      </a>`;

    const copyLine = (label: string, href: string) => `
      <div style="margin-top:8px;">
        <span style="color:#6b7280;font-size:16px;">${label} </span>
        <a href="${href}" style="color:#2563eb;text-decoration:underline;font-size:16px;">
          ${href}
        </a>
      </div>`;

    const htmlFooter = `
      \n${OPT_HTML_MARKER}\n
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-family:Arial,sans-serif;">
        <div style="margin:0 0 14px 0;color:#111827;font-size:20px;font-weight:600;">
          ${OPT_TEXT_HEADING}
        </div>

        <div style="margin-bottom:18px;">
          ${showOptIn ? btn('Opt In', links.optInUrl, true) : ''}
          ${showOptOut ? btn('Opt Out', links.optOutUrl, false) : ''}
        </div>

        <div style="color:#6b7280;font-size:16px;font-weight:600;margin:0 0 6px 0;">
          If the buttons don’t work, copy &amp; paste:
        </div>

        ${showOptIn ? copyLine('Opt In:', links.optInUrl) : ''}
        ${showOptOut ? copyLine('Opt Out:', links.optOutUrl) : ''}
      </div>
    `;

    const outText = text ? injectTextFooter(text, textFooter) : text;

    // ✅ IMPORTANT FIX: Always have HTML (generate from text if missing/empty), then inject footer.
    const baseHtml = html && html.trim().length > 0 ? html : text && text.trim().length > 0 ? textToHtml(text) : null;

    const outHtml = baseHtml ? injectHtmlFooter(baseHtml, htmlFooter) : baseHtml;

    return { text: outText, html: outHtml };
}

// NOTE: "0 * * * * *" = every minute at second 0
const SCHEDULE = '0 * * * * *';

const task = cron.schedule(
    SCHEDULE,
    async () => {
        const now = new Date();
        console.log('[email-cron] tick', now.toISOString());

        const jobs = await prisma.emailJobResult.findMany({
            where: { status: 'pending', runAt: { lte: now } },
            orderBy: { runAt: 'asc' },
            take: 100,
        });

        if (jobs.length === 0) return;

        for (const job of jobs) {
            const locked = await prisma.emailJobResult.updateMany({
                where: { id: job.id, status: 'pending' },
                data: { status: 'processing' },
            });
            if (locked.count === 0) continue;

            try {
                const isNewsletter = (job as any).isNewsletter === true || !!(job as any).newsletterAuthId;

                let senderEmail: string;
                let senderPassword: string;

                if (isNewsletter) {
                    senderEmail = process.env.NEWSLETTER_SENDER_EMAIL || '';
                    senderPassword = process.env.NEWSLETTER_SENDER_APP_PASSWORD || '';
                    if (!senderEmail || !senderPassword) {
                        throw new Error('Newsletter credentials missing. Set NEWSLETTER_SENDER_EMAIL and NEWSLETTER_SENDER_APP_PASSWORD.');
                    }
                } else {
                    const admin = await prisma.emailMarketingCredentials.findUnique({
                        where: { authId: job.authId },
                    });
                    if (!admin) throw new Error('No admin email credentials found');
                    senderEmail = admin.email;
                    senderPassword = admin.appPassword;
                }

                let toEmail: string | null = null;
                let recipientKind: RecipientKind;
                let recipientId: number | null = null;
                let recipientOptType: string | null = null;

                if (isNewsletter) {
                    const newsletterAuthId = Number((job as any).newsletterAuthId);
                    if (!newsletterAuthId) throw new Error('No newsletterAuthId found on job');

                    // Auth model doesn't have optType in your schema -> don’t select it.
                    const authUser = await prisma.auth.findUnique({
                        where: { id: newsletterAuthId },
                        select: { id: true, email: true },
                    });

                    if (!authUser?.email) throw new Error('No newsletter recipient email found');

                    toEmail = authUser.email;
                    recipientKind = 'auth';
                    recipientId = authUser.id;
                    recipientOptType = null; // treated as default
                } else {
                    if (!job.emailUserId) {
                        await prisma.emailJobResult.update({
                            where: { id: job.id },
                            data: { status: 'pending' },
                        });
                        continue;
                    }

                    const user = await prisma.emailUser.findUnique({
                        where: { id: job.emailUserId },
                        select: { id: true, email: true, optType: true },
                    });

                    if (!user?.email) throw new Error('No user email found');

                    toEmail = user.email;
                    recipientKind = 'emailUser';
                    recipientId = user.id;
                    recipientOptType = user.optType ?? null;
                }

                const transporter = getTransporter(senderEmail, senderPassword);

                const final = withOptLinks(recipientKind, recipientId, recipientOptType, job.text ?? null, (job as any).html ?? null);

                await transporter.sendMail({
                    from: senderEmail,
                    replyTo: !isNewsletter ? toEmail ?? undefined : undefined,
                    to: toEmail!,
                    subject: job.subject,
                    text: final.text ?? '',
                    // ✅ ensure html is actually sent
                    html: final.html && final.html.trim().length > 0 ? final.html : undefined,
                });

                await prisma.emailSentHistory.create({
                    data: {
                        subject: job.subject,
                        text: final.text,
                        html: final.html,
                        sentAt: new Date(),
                        status: 'sent',
                        messageId: null,
                        authId: job.authId,
                        emailUserId: isNewsletter ? null : job.emailUserId,
                        newsletterAuthId: isNewsletter ? recipientId : null,
                        jobResultId: job.id,
                    },
                });

                try {
                    await recordEmailUsage(job.authId, 1);
                } catch (usageError) {
                    console.error(`[email-cron] Failed to record usage for job ${job.id}:`, usageError);
                }

                if (job.repeated && job.timeInterval && job.timeInterval > 0) {
                    const nextRunAt = new Date(now.getTime() + job.timeInterval * 1000);
                    await prisma.emailJobResult.update({
                        where: { id: job.id },
                        data: { status: 'pending', runAt: nextRunAt },
                    });
                } else {
                    await prisma.emailJobResult.update({
                        where: { id: job.id },
                        data: { status: 'sent' },
                    });
                }
            } catch (err) {
                await prisma.emailJobResult.update({
                    where: { id: job.id },
                    data: { status: 'pending' },
                });
                console.error('[email-cron] Email job failed', job.id, err);
            }
        }
    },
    { timezone: 'Asia/Karachi' }
);

task.start();

async function shutdown() {
    console.log('[email-cron] shutting down...');
    task.stop();
    for (const t of transporters.values()) {
        try {
            // @ts-ignore
            await t.close();
        } catch {}
    }
    await prisma.$disconnect();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
