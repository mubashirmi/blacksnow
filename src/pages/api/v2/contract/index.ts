// pages/api/contract/index.ts
import prisma from '@/lib/prisma';
import formidable, { Fields, Files } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFileUrl, uploadFileToS3 } from '../../../../../bucket/bucketConfig';

export const config = {
    api: {
        bodyParser: false,
    },
};
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
    const authIdParam = Array.isArray(req.query.authId) ? req.query.authId[0] : req.query.authId;
    try {
        switch (req.method) {
            // GET /api/contract  -> list contract
            case 'GET': {
                // don't allow both at once
                if (idParam && authIdParam) {
                    return res.status(400).json({ message: 'Provide either id or authId, not both' });
                }

                // GET by contract id
                if (idParam) {
                    const id = Number(idParam);
                    if (!Number.isFinite(id)) {
                        return res.status(400).json({ message: 'Invalid id' });
                    }

                    const data = await prisma.contract.findUnique({
                        where: { id },
                    });

                    if (!data) {
                        return res.status(404).json({ message: 'contract not found' });
                    }

                    const pdf = data.pdf ? await getFileUrl(data.pdf) : null;

                    const contract = {
                        ...data,
                        pdf,
                    };

                    return res.status(200).json({ contract });
                }

                // GET by authId (list)
                if (authIdParam) {
                    const authId = Number(authIdParam);
                    if (!Number.isFinite(authId)) {
                        return res.status(400).json({ message: 'Invalid authId' });
                    }

                    const contract = await prisma.contract.findMany({
                        where: { authId },
                        orderBy: { createdAt: 'desc' },
                    });

                    const contracts = await Promise.all(
                        contract.map(async (data) => {
                            const pdf = data.pdf ? await getFileUrl(data.pdf) : null;

                            return {
                                ...data,
                                pdf,
                            };
                        })
                    );

                    return res.status(200).json({ contracts });
                }

                return res.status(400).json({ message: 'id or authId query param is required' });
            }

            // POST /api/contract  -> create contract
            case 'POST': {
                const { fields, files } = await parseForm(req);
                // eslint-disable-next-line
                const pdf = files['pdf'];
                const pdfFile = Array.isArray(pdf) ? pdf[0] : pdf;

                const name = getField(fields, 'name');
                const email = getField(fields, 'email');
                const businessName = getField(fields, 'businessName');
                const contractName = getField(fields, 'contractName');
                const signed = getField(fields, 'signed');
                const authId = getField(fields, 'authId');

                // const formData = await req.formData();

                if (!pdfFile) {
                    return res.status(400).json({ message: 'Invalid pdf' });
                }

                const s3Key = await uploadFileToS3(pdfFile, 'uploads'); // or 'uploads'
                console.log('s3Key', s3Key);
                console.log('pdfFile', pdfFile);

                let authIdNumber: number | null = null;
                if (authId !== undefined && authId !== null) {
                    const parsed = Number(authId);
                    if (!Number.isFinite(parsed)) {
                        return res.status(400).json({ message: 'Invalid authId' });
                    }
                    authIdNumber = parsed;
                }

                const contract = await prisma.contract.create({
                    data: {
                        pdf: s3Key,
                        signed,
                        name,
                        email,
                        businessName,
                        contractName,
                        authId: authIdNumber ?? undefined,
                    },
                });

                return res.status(201).json({ message: 'Created', contract });
            }

            // =========================
            // PUT /api/v2/contract?id=8
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
                const pdf = files['pdf'];
                const pdfFile = Array.isArray(pdf) ? pdf[0] : pdf;
                const name = getField(fields, 'name');
                const email = getField(fields, 'email');
                const businessName = getField(fields, 'businessName');
                const contractName = getField(fields, 'contractName');
                const signed = getField(fields, 'signed');
                const authId = getField(fields, 'authId');
                const data: any = {};

                if (pdfFile) {
                    const s3Key = await uploadFileToS3(pdfFile, 'uploads'); // or 'uploads'
                    console.log('s3Key', s3Key);
                    console.log('pdfFile', pdfFile);
                    data.pdf = s3Key;
                }

                if (signed !== undefined) {
                    if (typeof signed !== 'string') {
                        return res.status(400).json({ message: 'Invalid signed (must be string)' });
                    }
                    data.signed = signed;
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
                if (contractName !== undefined) {
                    if (typeof contractName !== 'string') {
                        return res.status(400).json({ message: 'Invalid contractName  ' });
                    }
                    data.contractName = contractName;
                }

                if (authId !== undefined) {
                    if (authId === null) {
                        data.authId = null;
                    } else {
                        const parsed = Number(authId);
                        if (!Number.isFinite(parsed)) {
                            return res.status(400).json({ message: 'Invalid authId' });
                        }
                        data.authId = parsed;
                    }
                }

                try {
                    const updated = await prisma.contract.update({
                        where: { id },
                        data,
                    });

                    return res.status(200).json({ message: 'Updated', contract: updated });
                } catch (e: any) {
                    if (e.code === 'P2025') {
                        return res.status(404).json({ message: 'contract not found' });
                    }
                    throw e;
                }
            }

            // =========================
            // DELETE /api/v2/contract?id=8
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
                    const deleted = await prisma.contract.delete({
                        where: { id },
                    });

                    return res.status(200).json({ message: 'Deleted', contract: deleted });
                } catch (e: any) {
                    if (e.code === 'P2025') {
                        return res.status(404).json({ message: 'contract not found' });
                    }
                    throw e;
                }
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (e: any) {
        console.error('Error in /api/contract:', e);
        return res.status(500).json({ message: 'Internal server error', error: e?.message });
    }
}
