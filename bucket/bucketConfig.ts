// lib/s3.ts
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { File } from 'formidable';
import fs from 'fs';

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.NEXT_PRIVATE_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PRIVATE_AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.NEXT_PRIVATE_AWS_REGION!,
});

const BUCKET_NAME = process.env.NEXT_PRIVATE_AWS_BUCKET_NAME!;

// ✅ Upload any Formidable file (image/pdf/etc) to S3
export const uploadFileToS3 = async (file: File, folder = 'uploads'): Promise<string> => {
    // Formidable uses `filepath`, `mimetype`, `originalFilename`, `newFilename`
    const fileStream = fs.createReadStream(file.filepath);

    const extension = file.originalFilename?.split('.').pop();
    const safeExt = extension ? `.${extension}` : '';
    const key = `${folder}/${file.newFilename}${safeExt}`; // S3 object key

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: file.mimetype || 'application/octet-stream',
    });

    await s3Client.send(command);

    // You can either:
    // - return the key (recommended, store in DB)
    // - or return a public URL if your bucket is public
    return key;
};

// ✅ Get a signed URL to download/view a file
export const getFileUrl = async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const url = await getSignedUrl(s3Client, command);
    return url;
};

// ✅ Delete a file from S3
export const deleteFileFromS3 = async (key: string): Promise<void> => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
};
