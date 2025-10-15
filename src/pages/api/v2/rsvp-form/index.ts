import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'user-brought-products';
    const { method } = req;

    // Robust id parsing (id can be string | string[] | undefined)
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const eventId = idParam ? Number(idParam) : null;

    try {
        switch (method) {
            case 'GET': {
                try {
                    if (!eventId || Number.isNaN(eventId)) {
                        const items = await prisma.userBroughtProducts.findMany({
                            include: {
                                calendar: true,
                            },
                        });
                        return res.status(200).json(baseResponse('UserBroughtProducts Retrieved', items));
                    }
                    const item = await prisma.userBroughtProducts.findUnique({
                        where: { id: eventId },
                        include: {
                            calendar: true,
                        },
                    });
                    return res.status(200).json(baseResponse('UserBroughtProducts Retrieved', item));
                } catch (e) {
                    logger.error('Error fetching UserBroughtProducts', e);
                    return res.status(500).json(errorResponse('Error fetching UserBroughtProducts'));
                }
            }

            case 'POST': {
                try {
                    logger.info('Creating/Updating a UserBroughtProducts record');

                    const raw = req.body ?? {};
                    const normalizedEmail = typeof raw.email === 'string' && raw.email.trim() !== '' ? raw.email.trim().toLowerCase() : null; // important: avoid "" duplicates

                    // coerce/validate calendarId
                    const calendarId = Number(raw.calendarId);
                    if (!Number.isInteger(calendarId)) {
                        return res.status(400).json(errorResponse('"calendarId" (body) must be an integer'));
                    }

                    const data = {
                        email: normalizedEmail,
                        phone: raw.phone?.trim() || null,
                        firstName: raw.firstName?.trim() || null,
                        lastName: raw.lastName?.trim() || null,
                        calendarId,
                    };

                    // If we have an email, upsert by email; otherwise, simple create.
                    const result = normalizedEmail
                        ? await prisma.userBroughtProducts.upsert({
                              where: { email: normalizedEmail }, // requires email to be unique in schema
                              update: { phone: data.phone, firstName: data.firstName, lastName: data.lastName, calendarId: data.calendarId },
                              create: data,
                          })
                        : await prisma.userBroughtProducts.create({ data });

                    return res.status(201).json(baseResponse('UserBroughtProducts Saved', result));
                } catch (e: any) {
                    // Return a clearer 409 on duplicates
                    if (e.code === 'P2002' && e.meta?.target?.includes('email')) {
                        return res.status(409).json(errorResponse('A record with this email already exists'));
                    }
                    logger.error('Error creating/updating UserBroughtProducts record', e);
                    return res.status(500).json(errorResponse('Error creating UserBroughtProducts'));
                }
            }

            case 'DELETE': {
                try {
                    // FIX: your original check `if (!eventId == null)` is wrong
                    if (eventId == null || Number.isNaN(eventId)) {
                        return res.status(400).json(errorResponse('"id" (query) is required and must be a number'));
                    }
                    await prisma.userBroughtProducts.delete({ where: { id: eventId } });
                    return res.status(200).json(baseResponse('UserBroughtProducts Deleted', { id: eventId }));
                } catch (e) {
                    logger.error('Error deleting UserBroughtProducts record', e);
                    return res.status(500).json(errorResponse('Error deleting UserBroughtProducts'));
                }
            }

            default:
                return res.status(404).end();
        }
    } catch (e) {
        logger.error('Unhandled error', e);
        return res.status(500).json(errorResponse('Internal server error'));
    }
};

export default api;
