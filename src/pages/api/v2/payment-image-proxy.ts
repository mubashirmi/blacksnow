import type { NextApiRequest, NextApiResponse } from 'next';

type ProxyBody = {
    imageUrl?: unknown;
};

type ErrorResponse = {
    error: string;
};

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

function isAllowedImageUrl(value: string): boolean {
    try {
        const url = new URL(value);

        if (url.protocol !== 'https:') {
            return false;
        }

        // Restrict this proxy to the S3 bucket used by invoice images.
        return url.hostname === 'blacksnowbucket.s3.us-east-1.amazonaws.com' || url.hostname === 'blacksnowbucket.s3.amazonaws.com';
    } catch {
        return false;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Buffer | ErrorResponse>): Promise<void> {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ error: 'Method not allowed.' });
        return;
    }

    const body = (req.body || {}) as ProxyBody;
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';

    if (!imageUrl) {
        res.status(400).json({ error: 'Invoice image URL is required.' });
        return;
    }

    if (!isAllowedImageUrl(imageUrl)) {
        res.status(400).json({ error: 'The invoice image URL is not allowed.' });
        return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
        const upstreamResponse = await fetch(imageUrl, {
            method: 'GET',
            signal: controller.signal,
            redirect: 'error',
        });

        if (!upstreamResponse.ok) {
            res.status(502).json({ error: 'The invoice image could not be downloaded from storage.' });
            return;
        }

        const contentType = upstreamResponse.headers.get('content-type') || 'application/octet-stream';

        if (contentType !== 'application/pdf' && !contentType.startsWith('image/')) {
            res.status(415).json({ error: 'The invoice file has an unsupported file type.' });
            return;
        }

        const contentLength = Number(upstreamResponse.headers.get('content-length') || 0);

        if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE_BYTES) {
            res.status(413).json({ error: 'The invoice file is too large to download.' });
            return;
        }

        const arrayBuffer = await upstreamResponse.arrayBuffer();

        if (arrayBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
            res.status(413).json({ error: 'The invoice file is too large to download.' });
            return;
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', String(arrayBuffer.byteLength));
        res.setHeader('Cache-Control', 'private, no-store');
        res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            res.status(504).json({ error: 'The invoice image download timed out.' });
            return;
        }

        console.error('Payment image proxy failed:', error);
        res.status(502).json({ error: 'The invoice image could not be downloaded.' });
    } finally {
        clearTimeout(timeoutId);
    }
}

export const config = {
    api: {
        responseLimit: false,
    },
};
