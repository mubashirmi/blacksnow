import { errorResponse } from '@/lib/baseResponse';
import { getEnvVar } from '@/lib/getEnvVar';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from '../../../../lib/logger';

const s3Client = new S3Client({
    region: getEnvVar('NEXT_PUBLIC_AWS_REGION'),
    credentials: {
        accessKeyId: getEnvVar('NEXT_PRIVATE_AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnvVar('NEXT_PRIVATE_AWS_SECRET_ACCESS_KEY'),
    },
});

const api = async (req, res) => {
    logger.defaultMeta.service = 'uploading/generating image url';
    try {
        const { body } = req;
        const { type, objectKey } = body;
        switch (req.method) {
            case 'POST': {
                try {
                    logger.info('generating link for image upload');

                    const bucketName = getEnvVar('NEXT_PUBLIC_AWS_S3_BUCKET_NAME');

                    const params = {
                        Bucket: bucketName,
                        Key: objectKey,
                        ContentType: type,
                    };

                    const command = new PutObjectCommand(params);
                    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

                    res.status(200).json({
                        url: signedUrl,
                        key: objectKey,
                    });
                } catch (e) {
                    logger.error(`Error creating presigned url for upload: ${e}`);
                    res.status(500).json(errorResponse(`Error creating presigned url for upload, ${e}`));
                }
                break;
            }
            default:
                res.status(404).end();
        }
    } catch (e) {
        res.status(500).json({ e });
    }
};

export default api;
