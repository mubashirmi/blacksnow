import type { BillboardData, BillboardFormValues, BillboardStatus } from './types';

export function parseRoles(raw: string | null): string[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
        // ignore
    }
    return raw
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
}

export function getStatusPillClasses(status: BillboardStatus) {
    if (status === 'Approved') return 'bg-green-500 text-white';
    if (status === 'NotApproved') return 'bg-blue-500 text-white';
    return 'bg-red-500 text-white';
}

export function toFormValues(bb: BillboardData): BillboardFormValues {
    return {
        fullName: bb.fullName ?? '',
        website: bb.website ?? '',
        podcast: bb.podcast ?? '',
        twitter: bb.twitter ?? '',
        youTube: bb.youTube ?? '',
        facebook: bb.facebook ?? '',
        image: bb.image ?? '',
        companyName: bb.companyName ?? '',
        description: bb.description ?? '',
    };
}
