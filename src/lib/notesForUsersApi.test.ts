import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail';
import type { NextApiRequest, NextApiResponse } from 'next';

import { handleNotesForUsersById, handleNotesForUsersCollection } from './notesForUsersApi';

jest.mock('./emailBranding', () => ({
    ...jest.requireActual('./emailBranding'),
    getLogoAttachment: jest.fn(() => ({ content: 'logo', filename: 'logo.png', disposition: 'inline', content_id: 'blacksnow-logo' })),
}));
jest.mock('./sendEmail', () => ({ sendEmail: jest.fn() }));
jest.mock('./prisma', () => ({
    __esModule: true,
    default: {
        auth: { findUnique: jest.fn() },
        notesForUsers: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

const findRecipient = prisma.auth.findUnique as jest.Mock;
const findMany = prisma.notesForUsers.findMany as jest.Mock;
const findUnique = prisma.notesForUsers.findUnique as jest.Mock;
const update = prisma.notesForUsers.update as jest.Mock;
const remove = prisma.notesForUsers.delete as jest.Mock;
const transaction = prisma.$transaction as jest.Mock;
const deliverEmail = sendEmail as jest.Mock;
const create = jest.fn();

const note = {
    id: 11,
    createdAt: new Date('2026-10-30T00:00:00.000Z'),
    updatedAt: new Date('2026-10-30T00:00:00.000Z'),
    title: 'Account review',
    content: 'Please review your account.',
    authorName: 'Support Team',
    email: 'recipient@example.com',
    authId: 27,
};

function request(method: string, options: { query?: Record<string, string>; body?: unknown } = {}) {
    return {
        method,
        query: options.query ?? {},
        body: options.body,
        headers: {},
    } as unknown as NextApiRequest;
}

function response() {
    const res = {
        statusCode: 200,
        body: undefined as any,
        headers: {} as Record<string, unknown>,
        status: jest.fn(function (this: any, statusCode: number) {
            this.statusCode = statusCode;
            return this;
        }),
        json: jest.fn(function (this: any, body: unknown) {
            this.body = body;
            return this;
        }),
        setHeader: jest.fn(function (this: any, name: string, value: unknown) {
            this.headers[name] = value;
            return this;
        }),
    };

    return res as unknown as NextApiResponse & { statusCode: number; body: any; headers: Record<string, unknown> };
}

describe('NotesForUsers CRUD API', () => {
    beforeEach(() => {
        findRecipient.mockResolvedValue({ id: 27, email: 'auth-account@example.com', firstName: 'Ada', lastName: 'Lovelace' });
        findMany.mockResolvedValue([note]);
        findUnique.mockResolvedValue(note);
        update.mockResolvedValue({ ...note, title: 'Updated title' });
        remove.mockResolvedValue(note);
        create.mockResolvedValue(note);
        deliverEmail.mockResolvedValue({ statusCode: 202, messageId: 'message-id' });
        transaction.mockImplementation((operation) => operation({ notesForUsers: { create } }));
    });

    test('allows requests without an Authorization header', async () => {
        const res = response();

        await handleNotesForUsersCollection(request('GET'), res);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual([note]);
        expect(findMany).toHaveBeenCalled();
    });

    test('gets all notes and supports filtering by recipient authId', async () => {
        const res = response();

        await handleNotesForUsersCollection(request('GET', { query: { authId: '27' } }), res);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual([note]);
        expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { authId: 27 } }));
    });

    test('gets a single note and returns 404 when it does not exist', async () => {
        const found = response();
        await handleNotesForUsersById(request('GET', { query: { id: '11' } }), found);
        expect(found.statusCode).toBe(200);
        expect(found.body.data).toEqual(note);

        findUnique.mockResolvedValueOnce(null);
        const missing = response();
        await handleNotesForUsersById(request('GET', { query: { id: '999' } }), missing);
        expect(missing.statusCode).toBe(404);
        expect(missing.body.error.code).toBe('NOT_FOUND');
    });

    test('creates a note and emails the address provided in the request', async () => {
        const res = response();

        await handleNotesForUsersCollection(
            request('POST', {
                body: {
                    authId: 27,
                    email: ' Note.Recipient@Example.com ',
                    title: ' Account review ',
                    content: ' Please review your account. ',
                    authorName: 'Support Team',
                },
            }),
            res
        );

        expect(res.statusCode).toBe(201);
        expect(create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ authId: 27, email: 'note.recipient@example.com', title: 'Account review' }),
            })
        );
        expect(deliverEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'note.recipient@example.com',
                subject: 'Black Snow Holdings - New note: Account review',
                html: expect.stringContaining('You have a new note'),
                attachments: [expect.objectContaining({ content_id: 'blacksnow-logo' })],
            })
        );
    });

    test('validates create input and missing recipients', async () => {
        const invalid = response();
        await handleNotesForUsersCollection(request('POST', { body: { authId: 27, email: 'not-an-email', title: 'Title', content: 'Content' } }), invalid);
        expect(invalid.statusCode).toBe(400);
        expect(create).not.toHaveBeenCalled();

        findRecipient.mockResolvedValueOnce(null);
        const missing = response();
        await handleNotesForUsersCollection(
            request('POST', { body: { authId: 999, email: 'recipient@example.com', title: 'Title', content: 'Content' } }),
            missing
        );
        expect(missing.statusCode).toBe(404);
        expect(missing.body.error.code).toBe('RECIPIENT_NOT_FOUND');
    });

    test('returns 502 from the transaction when email delivery fails', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        deliverEmail.mockRejectedValueOnce(new Error('SendGrid unavailable'));
        const res = response();

        await handleNotesForUsersCollection(request('POST', { body: { authId: 27, email: 'recipient@example.com', title: 'Title', content: 'Content' } }), res);

        expect(res.statusCode).toBe(502);
        expect(res.body.error.code).toBe('EMAIL_DELIVERY_FAILED');
        expect(transaction).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith('Note notification email failed:', 'SendGrid unavailable');
        consoleError.mockRestore();
    });

    test('updates only supported note fields', async () => {
        const res = response();
        await handleNotesForUsersById(request('PATCH', { query: { id: '11' }, body: { title: 'Updated title', email: 'attacker@example.com' } }), res);

        expect(res.statusCode).toBe(200);
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 11 }, data: { title: 'Updated title' } }));
    });

    test('rejects empty updates and invalid IDs', async () => {
        const empty = response();
        await handleNotesForUsersById(request('PUT', { query: { id: '11' }, body: {} }), empty);
        expect(empty.statusCode).toBe(400);

        const invalidId = response();
        await handleNotesForUsersById(request('DELETE', { query: { id: 'abc' } }), invalidId);
        expect(invalidId.statusCode).toBe(400);
    });

    test('deletes a note', async () => {
        const res = response();
        await handleNotesForUsersById(request('DELETE', { query: { id: '11' } }), res);

        expect(res.statusCode).toBe(200);
        expect(remove).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 11 } }));
    });
});
