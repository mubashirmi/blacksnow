import type { DefaultSession } from 'next-auth';

export type ProviderId = 'google' | 'azure-ad';
export type TokenError = 'RefreshAccessTokenError' | 'UnknownProvider';

declare module 'next-auth' {
    // eslint-disable-next-line no-unused-vars
    interface Session extends DefaultSession {
        authId?: number;
        provider?: ProviderId;
        providerAccountId?: string;
        accessToken?: string;
        error?: TokenError;
    }
}

declare module 'next-auth/jwt' {
    // eslint-disable-next-line no-unused-vars
    interface JWT {
        authId?: number;
        provider?: ProviderId;
        providerAccountId?: string;
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        error?: TokenError;
    }
}
