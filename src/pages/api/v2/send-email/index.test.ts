import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

import handler from './index';

jest.mock('@/lib/emailUsage', () => ({ recordEmailUsage: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        emailMarketingCredentials: { findUnique: jest.fn() },
        emailUser: { findMany: jest.fn() },
        auth: { findMany: jest.fn() },
        emailJobResult: { createMany: jest.fn(), create: jest.fn() },
        emailSentHistory: { create: jest.fn() },
    },
}));
jest.mock('@sendgrid/mail', () => ({ setApiKey: jest.fn(), send: jest.fn() }));
jest.mock('nodemailer', () => ({ __esModule: true, default: { createTransport: jest.fn() } }));

const db = prisma as any;
const createTransport = nodemailer.createTransport as jest.Mock;
const sendMail = jest.fn();

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

function request(body: any) {
    return { method: 'POST', body, query: {}, headers: {} } as unknown as NextApiRequest;
}

describe('role-specific send email API', () => {
    beforeEach(() => {
        process.env.SENDGRID_API_KEY = 'sendgrid-key';
        process.env.SENDGRID_FROM_EMAIL = 'verified@example.com';
        db.emailMarketingCredentials.findUnique.mockResolvedValue({ id: 91, email: 'gold@example.com', appPassword: 'gold-password' });
        db.emailUser.findMany.mockResolvedValue([{ id: 1000, email: 'recipient@example.com', fullName: 'Recipient', optType: 'default' }]);
        db.emailJobResult.createMany.mockResolvedValue({ count: 1 });
        db.emailJobResult.create.mockResolvedValue({ id: 'sent-job' });
        db.emailSentHistory.create.mockResolvedValue({ id: 'sent-history' });
        sendMail.mockResolvedValue({ messageId: 'smtp-id', accepted: ['recipient@example.com'], rejected: [] });
        createTransport.mockReturnValue({ sendMail });
    });

    afterAll(() => {
        delete process.env.SENDGRID_API_KEY;
        delete process.env.SENDGRID_FROM_EMAIL;
    });

    test.each(['EmailMarketing', 'LightningSilver', 'LightningGold'] as const)(
        'schedules a %s job with the selected role and matching credentials',
        async (role) => {
            const res = response();
            await handler(
                request({
                    adminId: 210,
                    role,
                    items: [{ recipients: [1000], subject: 'Gold message', text: 'Hello', runAt: '2026-10-30T18:00:00+05:00' }],
                }),
                res
            );

            expect(res.statusCode).toBe(200);
            expect(db.emailMarketingCredentials.findUnique).toHaveBeenCalledWith({
                where: { authId_role: { authId: 210, role } },
            });
            expect(db.emailJobResult.createMany).toHaveBeenCalledWith({
                data: [expect.objectContaining({ authId: 210, role, emailUserId: 1000, status: 'pending' })],
            });
        }
    );

    test('uses the selected Lightning role SMTP credentials for an immediate send', async () => {
        db.emailMarketingCredentials.findUnique.mockResolvedValueOnce({
            id: 92,
            email: 'silver@example.com',
            appPassword: 'silver-password',
        });
        const res = response();
        await handler(
            request({
                adminId: 210,
                role: 'LightningSilver',
                items: [{ recipients: [1000], subject: 'Silver message', text: 'Hello' }],
            }),
            res
        );

        expect(res.statusCode).toBe(200);
        expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ auth: { user: 'silver@example.com', pass: 'silver-password' } }));
        expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'silver@example.com', to: 'recipient@example.com' }));
        expect(db.emailSentHistory.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ role: 'LightningSilver', credentialsId: 92 }) })
        );
    });

    test('rejects a missing or invalid role', async () => {
        const res = response();
        await handler(request({ adminId: 210, role: 'Sales', items: [] }), res);
        expect(res.statusCode).toBe(400);
        expect(res.body.error.code).toBe('INVALID_ROLE');
    });

    test('rejects missing credentials for the selected role', async () => {
        db.emailMarketingCredentials.findUnique.mockResolvedValueOnce(null);
        const res = response();
        await handler(request({ adminId: 210, role: 'LightningSilver', items: [{ recipients: [1000], text: 'Hello' }] }), res);
        expect(res.statusCode).toBe(404);
    });

    test('allows sending without an authorization header', async () => {
        const res = response();
        await handler(
            request({
                adminId: 210,
                role: 'LightningGold',
                items: [{ recipients: [1000], text: 'Hello', runAt: '2026-10-30T18:00:00+05:00' }],
            }),
            res
        );
        expect(res.statusCode).toBe(200);
    });
});
