// /pages/api/v2/email-users-csv.ts
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

type EmailUserInput = { email: string; fullName: string };
type CsvInput = { name: string } | string;

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    const getNumberFromQuery = (key: string) => {
        const raw = Array.isArray((req.query as any)[key]) ? (req.query as any)[key][0] : (req.query as any)[key];
        const n = Number(raw);
        if (!raw || Number.isNaN(n) || !Number.isInteger(n) || n <= 0) return null;
        return n;
    };

    const coerceCsvName = (csv: CsvInput | undefined): string | null => {
        if (!csv) return null;
        if (typeof csv === 'string') return csv.trim() || null;
        // @ts-ignore
        const name = csv?.name;
        return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
    };

    try {
        // Helpful guard: surfaces a clear error if client wasn’t regenerated
        if (!(prisma as any).emailUserCSV) {
            return res.status(500).json({
                message: 'Prisma client is out of date for this route',
                hint: 'Run `npx prisma generate` and restart the Next.js server.',
            });
        }

        if (method === 'POST') {
            const { authId: rawAuthId, csv, csvName: rawCsvName, csvId: rawCsvId, users, email, fullName } = req.body ?? {};
            const authId = Number(rawAuthId);
            if (!authId || !Number.isInteger(authId) || authId <= 0) {
                return res.status(400).json({ message: 'Valid authId is required' });
            }

            const isBulk = Array.isArray(users);
            const hasSingle = !!email && !!fullName;
            if (!isBulk && !hasSingle) {
                return res.status(400).json({
                    message: 'Provide either "users": [{ email, fullName }, ...] for bulk create, or "email" & "fullName" for single create.',
                });
            }

            const csvId = rawCsvId ? Number(rawCsvId) : null;
            let csvRecordId: number | null = csvId && Number.isInteger(csvId) && csvId > 0 ? csvId : null;

            const derivedCsvName = coerceCsvName(csv ?? rawCsvName);
            if (!csvRecordId && !derivedCsvName) {
                return res.status(400).json({
                    message: 'Provide either an existing "csvId" or a CSV name via "csv" (object) or "csvName" (string).',
                });
            }

            if (isBulk) {
                const list: EmailUserInput[] = users;
                if (!list.length) return res.status(400).json({ message: '"users" must be a non-empty array' });
                const invalid = list.find((u) => !u || typeof u.email !== 'string' || !u.email.trim() || typeof u.fullName !== 'string' || !u.fullName.trim());
                if (invalid) return res.status(400).json({ message: 'Each user requires non-empty "email" and "fullName"' });
            } else {
                if (typeof email !== 'string' || !email.trim() || typeof fullName !== 'string' || !fullName.trim()) {
                    return res.status(400).json({ message: 'Non-empty "email" and "fullName" are required' });
                }
            }

            const result = await prisma.$transaction(async (tx) => {
                if (!csvRecordId) {
                    const createdCsv = await tx.emailUserCSV.create({ data: { name: derivedCsvName! } });
                    csvRecordId = createdCsv.id;
                } else {
                    const exists = await tx.emailUserCSV.findUnique({ where: { id: csvRecordId } });
                    if (!exists) {
                        throw Object.assign(new Error('CSV not found'), { statusCode: 404 });
                    }
                }

                if (isBulk) {
                    const list: EmailUserInput[] = users;
                    const data = list.map((u) => ({
                        email: u.email.trim(),
                        fullName: u.fullName.trim(),
                        authId,
                        emailUserCSVId: csvRecordId!,
                    }));

                    const createManyRes = await tx.emailUser.createMany({ data, skipDuplicates: true });

                    const records = await tx.emailUser.findMany({
                        where: { authId, emailUserCSVId: csvRecordId! },
                        orderBy: { id: 'desc' },
                    });

                    return {
                        csvId: csvRecordId,
                        createdCount: createManyRes.count,
                        requestedCount: data.length,
                        duplicatesSkipped: data.length - createManyRes.count,
                        emailUsers: records,
                    };
                } else {
                    const existing = await tx.emailUser.findFirst({
                        where: { authId, email: email.trim() },
                        select: { id: true },
                    });
                    if (existing) {
                        return {
                            csvId: csvRecordId,
                            createdCount: 0,
                            requestedCount: 1,
                            duplicatesSkipped: 1,
                            emailUsers: await tx.emailUser.findMany({
                                where: { authId, emailUserCSVId: csvRecordId! },
                                orderBy: { id: 'desc' },
                            }),
                            message: 'Email already exists for this authId.',
                        };
                    }

                    const created = await tx.emailUser.create({
                        data: {
                            email: email.trim(),
                            fullName: fullName.trim(),
                            authId,
                            emailUserCSVId: csvRecordId!,
                        },
                    });

                    return {
                        csvId: csvRecordId,
                        createdCount: 1,
                        requestedCount: 1,
                        duplicatesSkipped: 0,
                        emailUser: created,
                    };
                }
            });

            return res.status(201).json({ message: 'Created successfully', ...result });
        }

        if (method === 'GET') {
            const id = getNumberFromQuery('id');
            const authId = getNumberFromQuery('authId');
            const csvId = getNumberFromQuery('csvId');

            if (id) {
                const emailUser = await prisma.emailUser.findUnique({
                    where: { id },
                    include: { emailUserCSV: true, auth: true },
                });
                if (!emailUser) return res.status(404).json({ message: 'Email user not found' });
                return res.status(200).json({ emailUser });
            }

            if (csvId) {
                const emailUsers = await prisma.emailUser.findMany({
                    where: { emailUserCSVId: csvId },
                    orderBy: { id: 'desc' },
                    include: { emailUserCSV: true },
                });
                return res.status(200).json({ emailUsers });
            }

            if (authId) {
                const emailUsers = await prisma.emailUser.findMany({
                    where: {
                        authId,
                        emailUserCSVId: { not: null }, // only rows where CSV id is set
                    },
                    orderBy: [{ emailUserCSVId: 'desc' }, { id: 'desc' }],
                    include: { emailUserCSV: true },
                });
                return res.status(200).json({ emailUsers });
            }

            const emailUsers = await prisma.emailUser.findMany({
                orderBy: { id: 'desc' },
                include: { emailUserCSV: true },
            });
            return res.status(200).json({ emailUsers });
        }

        if (method === 'PUT' || method === 'PATCH') {
            const id = getNumberFromQuery('id');
            if (!id) return res.status(400).json({ message: 'Valid id is required in query (?id=)' });

            const { email, fullName, authId: rawAuthId, csvId: rawCsvId } = req.body ?? {};
            const data: Record<string, any> = {};

            if (email !== undefined) data.email = String(email).trim();
            if (fullName !== undefined) data.fullName = String(fullName).trim();
            if (rawAuthId !== undefined) data.authId = Number(rawAuthId);
            if (rawCsvId !== undefined) data.emailUserCSVId = Number(rawCsvId);

            if (Object.keys(data).length === 0) return res.status(400).json({ message: 'Nothing to update' });

            if (data.email || data.authId) {
                const current = await prisma.emailUser.findUnique({ where: { id }, select: { authId: true, email: true } });
                const checkAuthId = data.authId ?? current?.authId;
                const checkEmail = data.email ?? current?.email;
                if (checkAuthId && checkEmail) {
                    const existing = await prisma.emailUser.findFirst({
                        where: { authId: Number(checkAuthId), email: String(checkEmail), id: { not: id } },
                        select: { id: true },
                    });
                    if (existing) return res.status(409).json({ message: 'Email already exist for this authId.' });
                }
            }

            const updated = await prisma.emailUser.update({
                where: { id },
                data,
                include: { emailUserCSV: true },
            });

            return res.status(200).json({ message: 'Updated successfully', emailUser: updated });
        }

        if (method === 'DELETE') {
            const id = getNumberFromQuery('id');
            const csvId = getNumberFromQuery('csvId');

            if (id) {
                await prisma.emailUser.delete({ where: { id } });
                return res.status(200).json({ message: 'Deleted successfully' });
            }

            if (csvId) {
                const resDel = await prisma.emailUser.deleteMany({ where: { emailUserCSVId: csvId } });
                return res.status(200).json({ message: 'Bulk deleted successfully', count: resDel.count });
            }

            return res.status(400).json({ message: 'Provide ?id= to delete one or ?csvId= to bulk delete by CSV' });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error: any) {
        if (error?.code === 'P2025' || error?.statusCode === 404) {
            return res.status(404).json({ message: 'Email user not found' });
        }
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
