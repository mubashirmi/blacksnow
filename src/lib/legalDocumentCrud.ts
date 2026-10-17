import { ApiError, parsePositiveInteger, sendApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

type LegalDocument = {
    id: number;
    content: string;
    summary: string;
    createdAt: Date;
    updatedAt: Date;
};

type LegalDocumentInput = Pick<LegalDocument, 'content' | 'summary'>;

type LegalDocumentDelegate = {
    findMany(args: object): Promise<LegalDocument[]>;
    findUnique(args: object): Promise<LegalDocument | null>;
    create(args: object): Promise<LegalDocument>;
    update(args: object): Promise<LegalDocument>;
    delete(args: object): Promise<LegalDocument>;
};

type LegalDocumentConfig = {
    delegate:
        | 'affiliateAgreement'
        | 'marketDataDisclosure'
        | 'terms'
        | 'privacyPolicy'
        | 'gdpr'
        | 'independentContract'
        | 'noFinancialAdvice'
        | 'subscriptionPolicy'
        | 'earningsDisclosure'
        | 'cookiePolicy';
    legacyField?: 'affiliateAgreement' | 'gdpr' | 'terms' | 'privacyPolicy';
    name: string;
};

const LEGAL_DOCUMENT_SELECT = {
    id: true,
    content: true,
    summary: true,
    createdAt: true,
    updatedAt: true,
} as const;

const LEGAL_DOCUMENT_CONFIGS: Record<string, LegalDocumentConfig> = {
    'affiliate-agreements': { delegate: 'affiliateAgreement', legacyField: 'affiliateAgreement', name: 'Affiliate agreement' },
    'market-data-disclosures': { delegate: 'marketDataDisclosure', name: 'Market data disclosure' },
    'terms-and-conditions': { delegate: 'terms', legacyField: 'terms', name: 'Terms and conditions' },
    'privacy-policies': { delegate: 'privacyPolicy', legacyField: 'privacyPolicy', name: 'Privacy policy' },
    gdpr: { delegate: 'gdpr', legacyField: 'gdpr', name: 'GDPR document' },
    'independent-contracts': { delegate: 'independentContract', name: 'Independent contract' },
    'no-financial-advice': { delegate: 'noFinancialAdvice', name: 'No financial advice document' },
    'subscription-policies': { delegate: 'subscriptionPolicy', name: 'Subscription policy' },
    'earnings-disclosures': { delegate: 'earningsDisclosure', name: 'Earnings disclosure' },
    'cookie-policies': { delegate: 'cookiePolicy', name: 'Cookie policy' },
};

function getConfig(resource: string | string[] | undefined) {
    if (typeof resource !== 'string' || !LEGAL_DOCUMENT_CONFIGS[resource]) {
        throw new ApiError(404, 'RESOURCE_NOT_FOUND', 'Legal document resource not found');
    }

    return LEGAL_DOCUMENT_CONFIGS[resource];
}

function getDelegate(config: LegalDocumentConfig) {
    return prisma[config.delegate] as unknown as LegalDocumentDelegate;
}

function parseDocumentInput(body: unknown): LegalDocumentInput {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new ApiError(400, 'INVALID_BODY', 'Request body must be a JSON object');
    }

    const { content, summary } = body as Record<string, unknown>;

    if (typeof content !== 'string' || content.trim().length === 0) {
        throw new ApiError(400, 'INVALID_BODY', 'content is required and must be a non-empty string');
    }

    if (typeof summary !== 'string' || summary.trim().length === 0) {
        throw new ApiError(400, 'INVALID_BODY', 'summary is required and must be a non-empty string');
    }

    return { content, summary };
}

function getWriteData(config: LegalDocumentConfig, input: LegalDocumentInput) {
    if (!config.legacyField) return input;
    return { ...input, [config.legacyField]: input.content };
}

function parseDocumentId(value: string | string[] | undefined) {
    const id = parsePositiveInteger(value, 'id');

    if (!id) {
        throw new ApiError(400, 'INVALID_ID', 'id is required');
    }

    return id;
}

function sendMethodNotAllowed(res: NextApiResponse, methods: string[]) {
    res.setHeader('Allow', methods);
    return res.status(405).json({
        success: false,
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
    });
}

function sendLegalDocumentError(res: NextApiResponse, error: unknown, name?: string) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return sendApiError(res, new ApiError(404, 'NOT_FOUND', `${name ?? 'Legal document'} not found`));
    }

    return sendApiError(res, error);
}

export async function handleLegalDocumentCollection(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Cache-Control', 'no-store');
    let config: LegalDocumentConfig | undefined;

    try {
        config = getConfig(req.query.resource);
        const delegate = getDelegate(config);

        if (req.method === 'GET') {
            const documents = await delegate.findMany({
                select: LEGAL_DOCUMENT_SELECT,
                orderBy: { createdAt: 'desc' },
            });

            return res.status(200).json({ success: true, data: documents });
        }

        if (req.method === 'POST') {
            const input = parseDocumentInput(req.body);
            const document = await delegate.create({
                data: getWriteData(config, input),
                select: LEGAL_DOCUMENT_SELECT,
            });

            return res.status(201).json({
                success: true,
                message: `${config.name} created successfully`,
                data: document,
            });
        }

        return sendMethodNotAllowed(res, ['GET', 'POST']);
    } catch (error) {
        return sendLegalDocumentError(res, error, config?.name);
    }
}

export async function handleLegalDocumentById(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Cache-Control', 'no-store');
    let config: LegalDocumentConfig | undefined;

    try {
        config = getConfig(req.query.resource);
        const delegate = getDelegate(config);
        const id = parseDocumentId(req.query.id);

        if (req.method === 'GET') {
            const document = await delegate.findUnique({
                where: { id },
                select: LEGAL_DOCUMENT_SELECT,
            });

            if (!document) {
                throw new ApiError(404, 'NOT_FOUND', `${config.name} not found`);
            }

            return res.status(200).json({ success: true, data: document });
        }

        if (req.method === 'PUT') {
            const input = parseDocumentInput(req.body);
            const document = await delegate.update({
                where: { id },
                data: getWriteData(config, input),
                select: LEGAL_DOCUMENT_SELECT,
            });

            return res.status(200).json({
                success: true,
                message: `${config.name} updated successfully`,
                data: document,
            });
        }

        if (req.method === 'DELETE') {
            const document = await delegate.delete({
                where: { id },
                select: LEGAL_DOCUMENT_SELECT,
            });

            return res.status(200).json({
                success: true,
                message: `${config.name} deleted successfully`,
                data: document,
            });
        }

        return sendMethodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
    } catch (error) {
        return sendLegalDocumentError(res, error, config?.name);
    }
}
