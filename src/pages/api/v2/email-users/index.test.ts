import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

import handler from './index';

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        emailUser: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));

const emailUser = prisma.emailUser as any;

function response() {
    const res: any = {
        statusCode: 200,
        body: undefined,
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
    return { method, body, query } as unknown as NextApiRequest;
}

describe('role-specific manual email users', () => {
    test.each(['EmailMarketing', 'LightningSilver', 'LightningGold'] as const)('creates a %s recipient', async (role) => {
        emailUser.findFirst.mockResolvedValueOnce(null);
        emailUser.create.mockResolvedValueOnce({ id: 1000, authId: 210, role, email: 'recipient@example.com' });
        const res = response();

        await handler(request('POST', { authId: 210, role, fullName: 'Recipient', email: 'recipient@example.com' }), res);

        expect(res.statusCode).toBe(201);
        expect(emailUser.create).toHaveBeenCalledWith({
            data: { authId: 210, role, fullName: 'Recipient', email: 'recipient@example.com' },
        });
    });

    test('allows the same address in another role', async () => {
        emailUser.findFirst.mockResolvedValueOnce(null);
        emailUser.create.mockResolvedValueOnce({ id: 1001 });
        const res = response();

        await handler(request('POST', { authId: 210, role: 'LightningGold', fullName: 'Recipient', email: 'shared@example.com' }), res);

        expect(emailUser.findFirst).toHaveBeenCalledWith({
            where: { authId: 210, role: 'LightningGold', email: 'shared@example.com' },
        });
        expect(res.statusCode).toBe(201);
    });

    test('lists only recipients from the requested role', async () => {
        emailUser.findMany.mockResolvedValueOnce([]);
        const res = response();
        await handler(request('GET', {}, { authId: '210', role: 'LightningSilver' }), res);
        expect(emailUser.findMany).toHaveBeenCalledWith({
            where: { authId: 210, role: 'LightningSilver' },
            include: { emailUserCSV: true },
        });
    });
});
