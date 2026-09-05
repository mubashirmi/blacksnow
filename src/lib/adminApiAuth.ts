import { ApiError } from '@/lib/apiErrors';
import prisma from '@/lib/prisma';
import { parse } from 'cookie';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { NextApiRequest } from 'next';

function bearerToken(req: NextApiRequest): string | undefined {
    const authorization = req.headers.authorization;

    if (typeof authorization !== 'string') return undefined;

    const match = authorization.match(/^Bearer\s+(.+)$/i);
    return match?.[1]?.trim() || undefined;
}

function cookieToken(req: NextApiRequest): string | undefined {
    try {
        const cookies = parse(req.headers.cookie ?? '');
        return cookies.admin_token || cookies.token;
    } catch {
        return undefined;
    }
}

export async function requireAdmin(req: NextApiRequest) {
    const token = bearerToken(req) ?? cookieToken(req);

    if (!token) {
        throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication is required');
    }

    const secret = process.env.NEXT_PRIVATE_JWT_SECRET;

    if (!secret) {
        throw new ApiError(500, 'INVALID_CONFIGURATION', 'NEXT_PRIVATE_JWT_SECRET is not configured');
    }

    let payload: JwtPayload;

    try {
        const verified = jwt.verify(token, secret, { algorithms: ['HS256'] });

        if (typeof verified === 'string') throw new Error('Invalid JWT payload');
        payload = verified;
    } catch {
        throw new ApiError(401, 'UNAUTHENTICATED', 'The authentication token is invalid or expired');
    }

    const authId = Number(payload.userId);

    if (!Number.isInteger(authId) || authId <= 0) {
        throw new ApiError(401, 'UNAUTHENTICATED', 'The authentication token is invalid');
    }

    const user = await prisma.auth.findUnique({
        where: { id: authId },
        select: { id: true, status: true, roles: true },
    });

    if (!user || user.status !== 'active') {
        throw new ApiError(401, 'UNAUTHENTICATED', 'The authenticated user is unavailable');
    }

    if (!user.roles.includes('Admin')) {
        throw new ApiError(403, 'FORBIDDEN', 'Admin access is required');
    }

    return user;
}
