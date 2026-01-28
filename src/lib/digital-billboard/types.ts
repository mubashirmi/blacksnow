export type BillboardStatus = 'Approved' | 'NotApproved' | 'Rejected';

export interface BillboardData {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    fullName: string;
    website: string;
    podcast: string;
    twitter: string;
    youTube: string;
    facebook: string;
    image: string;
    companyName: string;
    description: string;
    status: BillboardStatus;
    authId: number | null;
}

export interface BillboardFormValues {
    fullName: string;
    website: string;
    podcast: string;
    twitter: string;
    youTube: string;
    facebook: string;
    image: string;
    companyName: string;
    description: string;
}

export type FormErrors = Record<string, string>;

export interface FetchBillboardsResponse {
    message: string;
    data: BillboardData[];
}
