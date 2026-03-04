import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

function base64UrlEncode(input: string) {
    return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sendWithGmail(accessToken: string, to: string, subject: string, text: string) {
    const rawMessage =
        `To: ${to}\r\n` + `Subject: ${subject}\r\n` + `Content-Type: text/plain; charset="UTF-8"\r\n` + `MIME-Version: 1.0\r\n` + `\r\n` + `${text}`;

    const raw = base64UrlEncode(rawMessage);

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
    });

    const data = await gmailRes.json();
    if (!gmailRes.ok) {
        return { ok: false, status: gmailRes.status, data };
    }
    return { ok: true, status: 200, data };
}

async function sendWithOutlook(accessToken: string, to: string, subject: string, text: string) {
    // Microsoft Graph: POST /me/sendMail :contentReference[oaicite:3]{index=3}
    const graphRes = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: {
                subject,
                body: { contentType: 'Text', content: text },
                toRecipients: [{ emailAddress: { address: to } }],
            },
            saveToSentItems: true,
        }),
    });

    // Graph often returns 202 Accepted with empty body
    const textBody = await graphRes.text();
    const data = textBody ? safeJson(textBody) : null;

    if (!graphRes.ok) {
        return { ok: false, status: graphRes.status, data };
    }

    return { ok: true, status: graphRes.status, data };
}

function safeJson(s: string) {
    try {
        return JSON.parse(s);
    } catch {
        return { raw: s };
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const session = await getServerSession(req, res, authOptions);

    if (!session?.accessToken) return res.status(401).json({ error: 'Not authenticated' });
    if (session.error === 'RefreshAccessTokenError') {
        return res.status(401).json({ error: 'Token refresh failed. Please sign in again.' });
    }

    const { to, subject, text } = req.body as { to: string; subject: string; text: string };
    if (!to || !subject || !text) return res.status(400).json({ error: 'Missing to/subject/text' });

    if (session.provider === 'google') {
        const r = await sendWithGmail(session.accessToken, to, subject, text);
        if (!r.ok) return res.status(r.status).json({ error: 'Gmail send failed', details: r.data });
        return res.status(200).json({ ok: true, provider: 'google', result: r.data });
    }

    if (session.provider === 'azure-ad') {
        const r = await sendWithOutlook(session.accessToken, to, subject, text);
        if (!r.ok) return res.status(r.status).json({ error: 'Outlook send failed', details: r.data });
        return res.status(200).json({ ok: true, provider: 'azure-ad', result: r.data });
    }

    return res.status(400).json({ error: 'Unknown auth provider' });
}
