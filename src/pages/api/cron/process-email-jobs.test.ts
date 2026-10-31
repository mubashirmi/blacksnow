import { processDueEmailJobs } from '@/lib/emailJobProcessor';
import type { NextApiRequest, NextApiResponse } from 'next';

import handler from './process-email-jobs';

jest.mock('@/lib/emailJobProcessor', () => ({ processDueEmailJobs: jest.fn() }));

const processJobs = processDueEmailJobs as jest.Mock;

function request(method = 'GET') {
    return { method, headers: {} } as unknown as NextApiRequest;
}

function response() {
    const res = {
        statusCode: 200,
        body: undefined as any,
        status: jest.fn(function (this: any, statusCode: number) {
            this.statusCode = statusCode;
            return this;
        }),
        json: jest.fn(function (this: any, body: unknown) {
            this.body = body;
            return this;
        }),
        setHeader: jest.fn(),
    };

    return res as unknown as NextApiResponse & { statusCode: number; body: any };
}

describe('scheduled email Vercel cron endpoint', () => {
    beforeEach(() => {
        delete process.env.EMAIL_CRON_BATCH_SIZE;
        processJobs.mockResolvedValue({ found: 1, processed: 1, sent: 1, failed: 0 });
    });

    afterAll(() => {
        delete process.env.EMAIL_CRON_BATCH_SIZE;
    });

    test('processes due jobs without an authorization header', async () => {
        const res = response();
        await handler(request(), res);

        expect(res.statusCode).toBe(200);
        expect(processJobs).toHaveBeenCalledTimes(1);
    });

    test('returns the processing summary', async () => {
        const res = response();
        await handler(request('GET'), res);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expect.objectContaining({ success: true, found: 1, sent: 1 }));
        expect(processJobs).toHaveBeenCalledTimes(1);
    });

    test('rejects unsupported methods', async () => {
        const res = response();
        await handler(request('POST'), res);
        expect(res.statusCode).toBe(405);
    });
});
