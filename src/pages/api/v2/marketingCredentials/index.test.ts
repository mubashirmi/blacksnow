import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

import handler from './index';

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        emailMarketingCredentials: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    },
}));

const credentials = prisma.emailMarketingCredentials as any;

function response() {
    const res: any = {
        statusCode: 200,
        body: undefined,
        setHeader: jest.fn(),
        status: jest.fn((code: number) => {
            res.statusCode = code;
            return res;
        }),
        json: jest.fn((body: unknown) => {
            res.body = body;
            return res;
        }),
    };
    return res as NextApiResponse & { statusCode: number; body: any };
}

function request(method: string, body: any = {}, query: any = {}) {
    return { method, body, query, headers: {} } as unknown as NextApiRequest;
}

describe('role-specific email credentials API', () => {
    test('fetches credentials by user and selected role', async () => {
        credentials.findUnique.mockResolvedValue({ id: 3, authId: 210, role: 'LightningSilver' });
        const res = response();
        await handler(request('GET', {}, { adminId: '210', role: 'LightningSilver' }), res);

        expect(res.statusCode).toBe(200);
        expect(credentials.findUnique).toHaveBeenCalledWith({ where: { authId_role: { authId: 210, role: 'LightningSilver' } } });
    });

    test('creates an independent credential for another purchased role', async () => {
        credentials.findUnique.mockResolvedValue(null);
        credentials.create.mockResolvedValue({ id: 4, authId: 210, role: 'LightningGold' });
        const res = response();
        await handler(request('POST', { id: 210, role: 'LightningGold', email: 'gold@example.com', appPassword: 'abcd efgh ijkl mnop' }), res);

        expect(res.statusCode).toBe(201);
        expect(credentials.create).toHaveBeenCalledWith({
            data: { authId: 210, role: 'LightningGold', email: 'gold@example.com', appPassword: 'abcdefghijklmnop' },
        });
    });

    test('rejects invalid roles', async () => {
        const res = response();
        await handler(request('POST', { id: 210, role: 'Sales', email: 'sender@example.com', appPassword: 'abcdefghijklmnop' }), res);
        expect(res.statusCode).toBe(400);
        expect(res.body.error.code).toBe('INVALID_ROLE');
    });

    test('allows credential access without an authorization header', async () => {
        credentials.findUnique.mockResolvedValueOnce({ id: 1, authId: 210, role: 'EmailMarketing' });
        const res = response();
        await handler(request('GET', {}, { adminId: '210', role: 'EmailMarketing' }), res);
        expect(res.statusCode).toBe(200);
    });
});
