import jwt from 'jsonwebtoken';
import type { NextApiRequest } from 'next';

import { requireAdmin } from './adminApiAuth';
import prisma from './prisma';

jest.mock('./prisma', () => ({
    __esModule: true,
    default: {
        auth: {
            findUnique: jest.fn(),
        },
    },
}));

const findUnique = prisma.auth.findUnique as jest.Mock;
const secret = 'admin-api-test-secret';

function requestWithToken(token?: string): NextApiRequest {
    return {
        headers: token ? { authorization: `Bearer ${token}` } : {},
    } as NextApiRequest;
}

describe('admin API authorization', () => {
    beforeEach(() => {
        process.env.NEXT_PRIVATE_JWT_SECRET = secret;
    });

    afterAll(() => {
        delete process.env.NEXT_PRIVATE_JWT_SECRET;
    });

    test('accepts an active user with the Admin role', async () => {
        const token = jwt.sign({ userId: 7 }, secret);
        findUnique.mockResolvedValue({ id: 7, status: 'active', roles: ['Admin'] });

        await expect(requireAdmin(requestWithToken(token))).resolves.toEqual({ id: 7, status: 'active', roles: ['Admin'] });
    });

    test('rejects an authenticated user without the Admin role', async () => {
        const token = jwt.sign({ userId: 8 }, secret);
        findUnique.mockResolvedValue({ id: 8, status: 'active', roles: ['Sales'] });

        await expect(requireAdmin(requestWithToken(token))).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
    });

    test('rejects a missing or invalid token', async () => {
        await expect(requireAdmin(requestWithToken())).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHENTICATED' });
        await expect(requireAdmin(requestWithToken('invalid-token'))).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHENTICATED' });
    });
});
