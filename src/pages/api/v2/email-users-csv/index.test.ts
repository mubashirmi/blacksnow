import type { NextApiRequest, NextApiResponse } from 'next';

import handler from './index';

const mockTx = {
    emailUserCSV: { create: jest.fn(), findUnique: jest.fn() },
    emailUser: { createMany: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        emailUserCSV: {},
        $transaction: jest.fn((callback) => callback(mockTx)),
    },
}));

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

function request(body: any) {
    return { method: 'POST', body, query: {} } as unknown as NextApiRequest;
}

describe('role-specific CSV email users', () => {
    beforeEach(() => {
        mockTx.emailUserCSV.create.mockResolvedValue({ id: 77 });
        mockTx.emailUser.createMany.mockResolvedValue({ count: 2 });
        mockTx.emailUser.findMany.mockResolvedValue([]);
    });

    test.each(['EmailMarketing', 'LightningSilver', 'LightningGold'] as const)('creates a %s list and recipients', async (role) => {
        const res = response();
        await handler(
            request({
                authId: 210,
                role,
                csvName: `${role} contacts`,
                users: [
                    { fullName: 'One', email: 'one@example.com' },
                    { fullName: 'Two', email: 'two@example.com' },
                ],
            }),
            res
        );

        expect(res.statusCode).toBe(201);
        expect(mockTx.emailUserCSV.create).toHaveBeenCalledWith({ data: { name: `${role} contacts`, role } });
        expect(mockTx.emailUser.createMany).toHaveBeenCalledWith({
            data: [
                { authId: 210, role, emailUserCSVId: 77, fullName: 'One', email: 'one@example.com' },
                { authId: 210, role, emailUserCSVId: 77, fullName: 'Two', email: 'two@example.com' },
            ],
            skipDuplicates: true,
        });
    });
});
