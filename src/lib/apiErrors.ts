import type { NextApiResponse } from 'next';

export class ApiError extends Error {
    statusCode: number;
    code: string;

    constructor(statusCode: number, code: string, message: string) {
        super(message);
        this.name = 'ApiError';
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.code = code;
    }
}

export function parsePositiveInteger(value: string | string[] | undefined, field: string): number | undefined {
    if (value === undefined) return undefined;
    if (Array.isArray(value)) {
        throw new ApiError(400, 'INVALID_QUERY', `${field} must be provided once`);
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new ApiError(400, 'INVALID_QUERY', `${field} must be a positive integer`);
    }

    return parsed;
}

export function sendApiError(res: NextApiResponse, error: unknown) {
    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
        });
    }

    console.error('API request failed:', error);

    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
        },
    });
}
