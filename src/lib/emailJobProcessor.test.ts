import nodemailer from 'nodemailer';

import { closeEmailJobTransports, getNextEmailJobRunAt, processDueEmailJobs } from './emailJobProcessor';
import { recordEmailUsage } from './emailUsage';
import prisma from './prisma';

jest.mock('./emailUsage', () => ({ recordEmailUsage: jest.fn() }));
jest.mock('./prisma', () => ({
    __esModule: true,
    default: {
        emailJobResult: { findMany: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
        emailMarketingCredentials: { findUnique: jest.fn() },
        emailUser: { findFirst: jest.fn() },
        auth: { findUnique: jest.fn() },
        emailSentHistory: { create: jest.fn() },
    },
}));
jest.mock('nodemailer', () => ({
    __esModule: true,
    default: { createTransport: jest.fn() },
}));

const findJobs = prisma.emailJobResult.findMany as jest.Mock;
const lockJob = prisma.emailJobResult.updateMany as jest.Mock;
const updateJob = prisma.emailJobResult.update as jest.Mock;
const findCredentials = prisma.emailMarketingCredentials.findUnique as jest.Mock;
const findRecipient = prisma.emailUser.findFirst as jest.Mock;
const createHistory = prisma.emailSentHistory.create as jest.Mock;
const createTransport = nodemailer.createTransport as jest.Mock;
const usage = recordEmailUsage as jest.Mock;
const sendMail = jest.fn();
const close = jest.fn();

const job = {
    id: 'job-1',
    subject: 'Scheduled test',
    text: 'Hello',
    html: null,
    authId: 210,
    role: 'EmailMarketing' as const,
    emailUserId: 1000,
    newsletterAuthId: null,
    isNewsletter: false,
    runAt: new Date('2026-10-30T11:03:00.000Z'),
    repeated: false,
    timeInterval: null,
    weekdays: [],
    rotationSpanSeconds: null,
};

describe('scheduled email job processor', () => {
    beforeEach(async () => {
        await closeEmailJobTransports();
        findJobs.mockResolvedValue([job]);
        lockJob.mockResolvedValue({ count: 1 });
        updateJob.mockResolvedValue(job);
        findCredentials.mockResolvedValue({ id: 28, email: 'sender@example.com', appPassword: 'app-password' });
        findRecipient.mockResolvedValue({ id: 1000, email: 'recipient@example.com', optType: 'default' });
        createHistory.mockResolvedValue({ id: 'history-1' });
        sendMail.mockResolvedValue({ messageId: 'smtp-message-id' });
        createTransport.mockReturnValue({ sendMail, close });
        usage.mockResolvedValue({});
    });

    test('sends a due one-time job, records history and completes it', async () => {
        const now = new Date('2026-10-30T11:04:00.000Z');
        const result = await processDueEmailJobs(now);

        expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'sender@example.com', to: 'recipient@example.com', subject: 'Scheduled test' }));
        expect(findCredentials).toHaveBeenCalledWith({ where: { authId_role: { authId: 210, role: 'EmailMarketing' } } });
        expect(createHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: 'sent',
                    role: 'EmailMarketing',
                    messageId: 'smtp-message-id',
                    jobResultId: 'job-1',
                    credentialsId: 28,
                }),
            })
        );
        expect(usage).toHaveBeenCalledWith(210, 1);
        expect(updateJob).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'job-1' }, data: expect.objectContaining({ status: 'sent' }) }));
        expect(result).toEqual(expect.objectContaining({ found: 1, processed: 1, sent: 1, completed: 1, rescheduled: 0, failed: 0 }));
    });

    test('returns a failed job to pending without recording usage', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));

        const result = await processDueEmailJobs(new Date('2026-10-30T11:04:00.000Z'));

        expect(updateJob).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'job-1' }, data: expect.objectContaining({ status: 'pending' }) }));
        expect(createHistory).not.toHaveBeenCalled();
        expect(usage).not.toHaveBeenCalled();
        expect(result).toEqual(expect.objectContaining({ failed: 1, sent: 0 }));
        consoleError.mockRestore();
    });

    test('selects credentials independently for a Lightning role', async () => {
        findJobs.mockResolvedValue([{ ...job, id: 'gold-job', role: 'LightningGold' }]);
        findCredentials.mockResolvedValue({ id: 91, email: 'gold@example.com', appPassword: 'gold-app-password' });

        await processDueEmailJobs(new Date('2026-10-30T11:04:00.000Z'));

        expect(findCredentials).toHaveBeenCalledWith({ where: { authId_role: { authId: 210, role: 'LightningGold' } } });
        expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ auth: { user: 'gold@example.com', pass: 'gold-app-password' } }));
        expect(createHistory).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ role: 'LightningGold', credentialsId: 91 }) }));
    });

    test('calculates all existing recurrence modes without changing one-time behavior', () => {
        const now = new Date('2026-10-30T11:04:00.000Z');

        expect(getNextEmailJobRunAt(job, now)).toBeNull();
        expect(getNextEmailJobRunAt({ ...job, rotationSpanSeconds: 3600 }, now)?.toISOString()).toBe('2026-10-30T12:03:00.000Z');
        expect(getNextEmailJobRunAt({ ...job, repeated: true, timeInterval: 7200 }, now)?.toISOString()).toBe('2026-10-30T13:03:00.000Z');
        expect(getNextEmailJobRunAt({ ...job, repeated: true, weekdays: [0] }, now)?.toISOString()).toBe('2026-11-01T11:03:00.000Z');
    });
});
