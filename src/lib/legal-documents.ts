export const legalDocuments = [
    { slug: 'affiliateagreement', title: 'Affiliate Agreement', endpoint: 'affiliate-agreements' },
    { slug: 'riskdisclosure', title: 'Market Data Disclosure', endpoint: 'market-data-disclosures' },
    { slug: 'terms', title: 'Terms & Conditions', endpoint: 'terms-and-conditions' },
    { slug: 'privacy', title: 'Privacy Policy', endpoint: 'privacy-policies' },
    { slug: 'gdpr', title: 'GDPR Compliance', endpoint: 'gdpr' },
    { slug: 'independentcontract', title: 'Independent Contractor Agreement', endpoint: 'independent-contracts' },
    { slug: 'nofinancialadvice', title: 'No Financial Advice', endpoint: 'no-financial-advice' },
    { slug: 'subscriptionpolicy', title: 'Subscription Policy', endpoint: 'subscription-policies' },
    { slug: 'earningsdisclosure', title: 'Earnings Disclosure', endpoint: 'earnings-disclosures' },
    { slug: 'cookiepolicy', title: 'Cookie Policy', endpoint: 'cookie-policies' },
] as const;

export type LegalDefinition = (typeof legalDocuments)[number];
export type LegalRecord = {
    id: number;
    content: string | null;
    summary: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export function legalApiUrl(endpoint: string) {
    // Leave blank when your Next.js app proxies /api to your backend.
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
    return `${base}/api/v6/${endpoint}`;
}

export async function getLegalRecord(endpoint: string, signal?: AbortSignal): Promise<LegalRecord | null> {
    const response = await fetch(legalApiUrl(endpoint), {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        signal,
    });
    if (!response.ok) throw new Error(`Couldn't load document (${response.status})`);
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object') throw new Error('Invalid server response');
    const result = payload as { success?: boolean; data?: unknown };
    if (result.success !== true || !Array.isArray(result.data)) throw new Error('Invalid document response');
    if (result.data.length === 0) return null;
    const record = result.data[0] as Partial<LegalRecord>;
    if (typeof record.id !== 'number' || !Number.isFinite(record.id)) throw new Error('Missing document ID');
    return {
        id: record.id,
        content: typeof record.content === 'string' ? record.content : '',
        summary: typeof record.summary === 'string' ? record.summary : '',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export async function saveLegalRecord(endpoint: string, existingId: number | null, content: string, summary: string) {
    const url = `${legalApiUrl(endpoint)}${existingId !== null ? `/${existingId}` : ''}`;
    const response = await fetch(url, {
        method: existingId !== null ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, summary }),
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok || (payload && typeof payload === 'object' && (payload as { success?: boolean }).success === false)) {
        const message =
            payload && typeof payload === 'object' && typeof (payload as { message?: unknown }).message === 'string'
                ? (payload as { message: string }).message
                : `Failed to save document (${response.status})`;
        throw new Error(message);
    }
    return payload;
}
