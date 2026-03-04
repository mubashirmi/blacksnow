// lib/optToken.ts
import crypto from 'crypto';

export type OptAction = 'optin' | 'optout';

type OptTokenPayload = {
    emailUserId: number;
    action: OptAction;
    iat: number; // issued at (seconds)
    exp: number; // expiry (seconds)
};

const secret = process.env.OPT_TOKEN_SECRET || '';

const b64urlEncode = (buf: Buffer) => buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const b64urlDecode = (str: string) => {
    const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(b64, 'base64');
};

const toUint8 = (b: Buffer) => new Uint8Array(b); // creates a plain Uint8Array copy

export function signOptToken(emailUserId: number, action: OptAction, ttlSeconds = 60 * 60 * 24 * 30) {
    const iat = Math.floor(Date.now() / 1000);
    const payload: OptTokenPayload = { emailUserId, action, iat, exp: iat + ttlSeconds };

    const body = b64urlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));

    // If no secret is configured, return unsigned token (still functional, less secure)
    if (!secret) {
        return { token: body, insecure: true };
    }

    const sigBytes = crypto.createHmac('sha256', secret).update(body).digest(); // Buffer
    const token = `${body}.${b64urlEncode(sigBytes)}`;
    return { token, insecure: false };
}

export function verifyOptToken(token: string): OptTokenPayload | null {
    if (!token) return null;

    const [body, sig] = token.split('.');
    if (!body) return null;

    let payload: OptTokenPayload;
    try {
        payload = JSON.parse(b64urlDecode(body).toString('utf8'));
    } catch {
        return null;
    }

    if (!payload || typeof payload.emailUserId !== 'number' || (payload.action !== 'optin' && payload.action !== 'optout') || typeof payload.exp !== 'number') {
        return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    // If secret exists, enforce signature
    if (secret) {
        if (!sig) return null;

        // Compare raw signature BYTES (not strings) in constant time
        const expectedSigBytes = crypto.createHmac('sha256', secret).update(body).digest();
        const providedSigBytes = b64urlDecode(sig);

        if (expectedSigBytes.length !== providedSigBytes.length) return null;

        // timingSafeEqual expects ArrayBufferView; Uint8Array is safest across TS type setups
        if (!crypto.timingSafeEqual(toUint8(expectedSigBytes), toUint8(providedSigBytes))) {
            return null;
        }
    }

    return payload;
}
