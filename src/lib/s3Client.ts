import { S3Client } from '@aws-sdk/client-s3';
import { getEnvVar } from './getEnvVar';

const s3Client = new S3Client({
    region: getEnvVar('NEXT_PUBLIC_AWS_REGION'),
    credentials: {
        accessKeyId: getEnvVar('NEXT_PRIVATE_AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnvVar('NEXT_PRIVATE_AWS_SECRET_ACCESS_KEY'),
    },
});

export default s3Client;
