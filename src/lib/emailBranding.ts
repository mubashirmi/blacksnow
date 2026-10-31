import type { SendEmailAttachment } from '@/lib/sendEmail';
import fs from 'fs';
import path from 'path';

export const BRAND_NAME = 'Black Snow Holdings';
export const BRAND_BLUE = '#1557FF';
export const BRAND_DARK = '#000000';
export const BRAND_WHITE = '#FFFFFF';
export const LOGO_CONTENT_ID = 'blacksnow-logo';

export function escapeHtml(value: string) {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function getMimeType(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.svg') return 'image/svg+xml';

    return 'image/png';
}

export function getLogoAttachment(): SendEmailAttachment {
    const logoPath = path.join(process.cwd(), 'public', 'email', 'blacksnow-logo.png');

    if (!fs.existsSync(logoPath)) {
        throw new Error(`Logo file not found at: ${logoPath}`);
    }

    return {
        content: fs.readFileSync(logoPath).toString('base64'),
        filename: 'blacksnow-logo.png',
        type: getMimeType(logoPath),
        disposition: 'inline',
        content_id: LOGO_CONTENT_ID,
    };
}
