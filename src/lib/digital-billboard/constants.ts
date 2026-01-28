import type { BillboardFormValues } from './types';

export const MAX_BILLBOARDS = 4;

export const CLOUDINARY_CLOUD_NAME = 'dpl3j2r3f';
export const CLOUDINARY_UPLOAD_PRESET = 'gptfrontend';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const EMPTY_FORM: BillboardFormValues = {
    fullName: '',
    website: '',
    podcast: '',
    twitter: '',
    youTube: '',
    facebook: '',
    image: '',
    companyName: '',
    description: '',
};
