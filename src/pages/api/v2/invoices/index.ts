// pages/api/invoices/index.ts
import prisma from '@/lib/prisma';
import formidable, { Fields, Files } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFileUrl, uploadFileToS3 } from '../../../../../bucket/bucketConfig';

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
    const form = formidable({
        multiples: false,
        keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
}

function getField(fields: Fields, key: string): string | undefined {
    const value = fields[key];
    if (Array.isArray(value)) return value[0] as string;
    return value as string | undefined;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const contractId = Array.isArray(req.query.contractId) ? req.query.contractId[0] : req.query.contractId;
    const authId = Array.isArray(req.query.authId) ? req.query.authId[0] : req.query.authId;
    try {
        switch (req.method) {
            // GET /api/invoices  -> list invoices
            case 'GET': {
                // don't allow both at once
                if (idParam && contractId) {
                    return res.status(400).json({ message: 'Provide either id or authId, not both' });
                }

                // GET by invoice id
                if (idParam) {
                    const id = Number(idParam);
                    if (!Number.isFinite(id)) {
                        return res.status(400).json({ message: 'Invalid id' });
                    }

                    const invoice = await prisma.invoice.findUnique({
                        where: { id },
                        include: { Contract: true },
                    });

                    if (!invoice) {
                        return res.status(404).json({ message: 'Invoice not found' });
                    }

                    const signedPdfUrl = invoice.Contract?.pdf ? await getFileUrl(invoice.Contract.pdf) : null;

                    const modified = {
                        ...invoice,
                        Contract: invoice.Contract ? { ...invoice.Contract, pdf: signedPdfUrl } : null,
                    };

                    return res.status(200).json({ invoice: modified });
                }

                // GET by authId (list)
                if (contractId) {
                    const authId = Number(contractId);
                    if (!Number.isFinite(authId)) {
                        return res.status(400).json({ message: 'Invalid authId' });
                    }

                    const invoices = await prisma.invoice.findMany({
                        where: { contractId: Number(contractId) },
                        orderBy: { createdAt: 'desc' },
                        include: {
                            Contract: true,
                        },
                    });

                    const modified = await Promise.all(
                        invoices.map(async (data) => {
                            const signedPdfUrl = data.Contract?.pdf ? await getFileUrl(data.Contract.pdf) : null;
                            const modified = {
                                ...data,
                                Contract: data.Contract ? { ...data.Contract, pdf: signedPdfUrl } : null,
                            };
                            return modified;
                        })
                    );

                    return res.status(200).json({ invoices: modified });
                }
                if (authId) {
                    const AuthId = Number(authId);
                    if (!Number.isFinite(AuthId)) {
                        return res.status(400).json({ message: 'Invalid authId' });
                    }

                    const invoices = await prisma.invoice.findMany({
                        where: { authId: Number(AuthId) },
                        orderBy: { createdAt: 'desc' },
                        include: {
                            Contract: true,
                        },
                    });
                    const modified = await Promise.all(
                        invoices.map(async (data) => {
                            const signedPdfUrl = data.Contract?.pdf ? await getFileUrl(data.Contract.pdf) : null;
                            const modified = {
                                ...data,
                                Contract: data.Contract ? { ...data.Contract, pdf: signedPdfUrl } : null,
                            };
                            return modified;
                        })
                    );

                    return res.status(200).json({ invoices: modified });
                }

                return res.status(400).json({ message: 'id or contractId query param is required' });
            }

            // POST /api/invoices  -> create invoice
            case 'POST': {
                const { fields, files } = await parseForm(req);
                // eslint-disable-next-line
                const image = files['image'];
                const imageFile = Array.isArray(image) ? image[0] : image;

                const contractId = getField(fields, 'contractId');
                const name = getField(fields, 'name');
                const email = getField(fields, 'email');
                const businessName = getField(fields, 'businessName');
                const price = getField(fields, 'price');
                const authId = getField(fields, 'authId');

                // const formData = await req.formData();

                if (!imageFile) {
                    return res.status(400).json({ message: 'Invalid pdf' });
                }

                const s3Key = await uploadFileToS3(image, 'uploads'); // or 'uploads'
                console.log('s3Key', s3Key);
                console.log('pdfFile', image);

                let contractIdNumber: number | null = null;
                if (contractId !== undefined && contractId !== null) {
                    const parsed = Number(contractId);
                    if (!Number.isFinite(parsed)) {
                        return res.status(400).json({ message: 'Invalid authId' });
                    }
                    contractIdNumber = parsed;
                }

                const invoice = await prisma.invoice.create({
                    data: {
                        name,
                        email,
                        businessName,
                        price,
                        authId: Number(authId),
                        image: s3Key,
                        contractId: contractIdNumber ?? undefined,
                    },
                });

                return res.status(201).json({ message: 'Created', invoice });
            }

            // =========================
            // PUT /api/v2/invoices?id=8
            // =========================
            case 'PUT': {
                if (!idParam) {
                    return res.status(400).json({ message: 'id query param is required' });
                }

                const id = Number(idParam);
                if (!Number.isFinite(id)) {
                    return res.status(400).json({ message: 'Invalid id' });
                }

                const { fields, files } = await parseForm(req);
                // eslint-disable-next-line
                const image = files['image'];
                const imageFile = Array.isArray(image) ? image[0] : image;
                if (!imageFile) {
                    return res.status(400).json({ message: 'Invalid pdf' });
                }

                const s3Key = await uploadFileToS3(image, 'uploads'); // or 'uploads'
                console.log('s3Key', s3Key);
                console.log('pdfFile', image);

                const name = getField(fields, 'name');
                const email = getField(fields, 'email');
                const businessName = getField(fields, 'businessName');
                const price = getField(fields, 'price');

                const data: any = {};

                if (imageFile) {
                    const s3Key = await uploadFileToS3(imageFile, 'uploads');
                    console.log('s3Key', s3Key);
                    console.log('pdfFile', imageFile);
                    data.pdf = s3Key;
                }
                if (name !== undefined) {
                    if (typeof name !== 'string') {
                        return res.status(400).json({ message: 'Invalid name  ' });
                    }
                    data.name = name;
                }
                if (email !== undefined) {
                    if (typeof email !== 'string') {
                        return res.status(400).json({ message: 'Invalid email  ' });
                    }
                    data.email = email;
                }
                if (businessName !== undefined) {
                    if (typeof businessName !== 'string') {
                        return res.status(400).json({ message: 'Invalid businessName  ' });
                    }
                    data.businessName = businessName;
                }
                if (price !== undefined) {
                    if (typeof price !== 'string') {
                        return res.status(400).json({ message: 'Invalid price  ' });
                    }
                    data.price = price;
                }

                try {
                    const updated = await prisma.invoice.update({
                        where: { id },
                        data,
                    });

                    return res.status(200).json({ message: 'Updated', invoice: updated });
                } catch (e: any) {
                    if (e.code === 'P2025') {
                        return res.status(404).json({ message: 'Invoice not found' });
                    }
                    throw e;
                }
            }

            // =========================
            // DELETE /api/v2/invoices?id=8
            // =========================
            case 'DELETE': {
                if (!idParam) {
                    return res.status(400).json({ message: 'id query param is required' });
                }

                const id = Number(idParam);
                if (!Number.isFinite(id)) {
                    return res.status(400).json({ message: 'Invalid id' });
                }

                try {
                    const deleted = await prisma.invoice.delete({
                        where: { id },
                    });

                    return res.status(200).json({ message: 'Deleted', invoice: deleted });
                } catch (e: any) {
                    if (e.code === 'P2025') {
                        return res.status(404).json({ message: 'Invoice not found' });
                    }
                    throw e;
                }
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (e: any) {
        console.error('Error in /api/invoices:', e);
        return res.status(500).json({ message: 'Internal server error', error: e?.message });
    }
}
