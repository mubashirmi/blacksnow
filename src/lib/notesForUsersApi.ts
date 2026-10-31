import { ApiError, parsePositiveInteger, sendApiError } from '@/lib/apiErrors';
import { BRAND_NAME, getLogoAttachment } from '@/lib/emailBranding';
import { buildNoteNotificationHtml, buildNoteNotificationText } from '@/lib/noteNotificationEmail';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail';
import { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const NOTE_SELECT = {
    id: true,
    createdAt: true,
    updatedAt: true,
    title: true,
    content: true,
    authorName: true,
    email: true,
    authId: true,
} as const;

type NoteWriteData = {
    title?: string;
    content?: string;
    authorName?: string | null;
};

function bodyRecord(body: unknown): Record<string, unknown> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new ApiError(400, 'INVALID_BODY', 'Request body must be a JSON object');
    }

    return body as Record<string, unknown>;
}

function requiredText(value: unknown, field: string, maxLength: number): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new ApiError(400, 'INVALID_BODY', `${field} is required and must be a non-empty string`);
    }

    const normalized = value.trim();

    if (normalized.length > maxLength) {
        throw new ApiError(400, 'INVALID_BODY', `${field} must be ${maxLength} characters or fewer`);
    }

    return normalized;
}

function optionalAuthorName(value: unknown): string | null {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string') {
        throw new ApiError(400, 'INVALID_BODY', 'authorName must be a string or null');
    }

    const normalized = value.trim();
    if (normalized.length > 200) {
        throw new ApiError(400, 'INVALID_BODY', 'authorName must be 200 characters or fewer');
    }

    return normalized || null;
}

function requiredEmail(value: unknown): string {
    if (typeof value !== 'string') {
        throw new ApiError(400, 'INVALID_BODY', 'email is required and must be a valid email address');
    }

    const normalized = value.trim().toLowerCase();

    if (normalized.length === 0 || normalized.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        throw new ApiError(400, 'INVALID_BODY', 'email is required and must be a valid email address');
    }

    return normalized;
}

function createInput(body: unknown) {
    const input = bodyRecord(body);
    const authId = Number(input.authId);

    if (!Number.isInteger(authId) || authId <= 0) {
        throw new ApiError(400, 'INVALID_BODY', 'authId is required and must be a positive integer');
    }

    return {
        authId,
        email: requiredEmail(input.email),
        title: requiredText(input.title, 'title', 200),
        content: requiredText(input.content, 'content', 10_000),
        authorName: optionalAuthorName(input.authorName),
    };
}

function updateInput(body: unknown): NoteWriteData {
    const input = bodyRecord(body);
    const data: NoteWriteData = {};

    if (input.title !== undefined) data.title = requiredText(input.title, 'title', 200);
    if (input.content !== undefined) data.content = requiredText(input.content, 'content', 10_000);
    if (input.authorName !== undefined) data.authorName = optionalAuthorName(input.authorName);

    if (Object.keys(data).length === 0) {
        throw new ApiError(400, 'INVALID_BODY', 'At least one of title, content, or authorName is required');
    }

    return data;
}

function noteId(value: string | string[] | undefined) {
    const id = parsePositiveInteger(value, 'id');
    if (!id) throw new ApiError(400, 'INVALID_ID', 'id is required');
    return id;
}

function methodNotAllowed(res: NextApiResponse, methods: string[]) {
    res.setHeader('Allow', methods);
    return res.status(405).json({
        success: false,
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
    });
}

function handleError(res: NextApiResponse, error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return sendApiError(res, new ApiError(404, 'NOT_FOUND', 'Note not found'));
    }

    return sendApiError(res, error);
}

export async function handleNotesForUsersCollection(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Cache-Control', 'no-store');

    try {
        if (req.method === 'GET') {
            const authId = parsePositiveInteger(req.query.authId, 'authId');
            const notes = await prisma.notesForUsers.findMany({
                ...(authId ? { where: { authId } } : {}),
                select: NOTE_SELECT,
                orderBy: { createdAt: 'desc' },
            });

            return res.status(200).json({ success: true, data: notes });
        }

        if (req.method === 'POST') {
            const input = createInput(req.body);
            const recipient = await prisma.auth.findUnique({
                where: { id: input.authId },
                select: { id: true, firstName: true, lastName: true },
            });

            if (!recipient) {
                throw new ApiError(404, 'RECIPIENT_NOT_FOUND', 'Recipient not found');
            }

            const recipientName = `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim();
            const note = await prisma.$transaction(async (transaction) => {
                const created = await transaction.notesForUsers.create({
                    data: {
                        authId: recipient.id,
                        email: input.email,
                        title: input.title,
                        content: input.content,
                        authorName: input.authorName,
                    },
                    select: NOTE_SELECT,
                });

                try {
                    await sendEmail({
                        to: input.email,
                        subject: `${BRAND_NAME} - New note: ${input.title}`,
                        text: buildNoteNotificationText({ ...input, recipientName }),
                        html: buildNoteNotificationHtml({ ...input, recipientName }),
                        attachments: [getLogoAttachment()],
                    });
                } catch (error) {
                    console.error('Note notification email failed:', error instanceof Error ? error.message : 'Unknown email error');
                    throw new ApiError(502, 'EMAIL_DELIVERY_FAILED', 'The note was not created because its notification email could not be delivered');
                }

                return created;
            });

            return res.status(201).json({
                success: true,
                message: 'Note created and notification email sent successfully',
                data: note,
            });
        }

        return methodNotAllowed(res, ['GET', 'POST']);
    } catch (error) {
        return handleError(res, error);
    }
}

export async function handleNotesForUsersById(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Cache-Control', 'no-store');

    try {
        const id = noteId(req.query.id);

        if (req.method === 'GET') {
            const note = await prisma.notesForUsers.findUnique({ where: { id }, select: NOTE_SELECT });
            if (!note) throw new ApiError(404, 'NOT_FOUND', 'Note not found');

            return res.status(200).json({ success: true, data: note });
        }

        if (req.method === 'PUT' || req.method === 'PATCH') {
            const note = await prisma.notesForUsers.update({
                where: { id },
                data: updateInput(req.body),
                select: NOTE_SELECT,
            });

            return res.status(200).json({ success: true, message: 'Note updated successfully', data: note });
        }

        if (req.method === 'DELETE') {
            const note = await prisma.notesForUsers.delete({ where: { id }, select: NOTE_SELECT });
            return res.status(200).json({ success: true, message: 'Note deleted successfully', data: note });
        }

        return methodNotAllowed(res, ['GET', 'PUT', 'PATCH', 'DELETE']);
    } catch (error) {
        return handleError(res, error);
    }
}
