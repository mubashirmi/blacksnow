import { ApiError } from '@/lib/apiErrors';
import { Role } from '@prisma/client';

export const EMAIL_SERVICE_ROLES = [Role.EmailMarketing, Role.LightningSilver, Role.LightningGold] as const;
export type EmailServiceRole = (typeof EMAIL_SERVICE_ROLES)[number];

export function parseEmailServiceRole(value: unknown): EmailServiceRole {
    if (typeof value !== 'string' || !EMAIL_SERVICE_ROLES.includes(value as EmailServiceRole)) {
        throw new ApiError(400, 'INVALID_ROLE', 'role must be one of EmailMarketing, LightningSilver, or LightningGold');
    }

    return value as EmailServiceRole;
}
