// pages/api/auth/[...nextauth].ts

import NextAuth, { type Account, type NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import AzureADProvider from 'next-auth/providers/azure-ad';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '../../../lib/prisma';
import type { ProviderId, TokenError } from '../../../types/next-auth';

const GOOGLE_SCOPES = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.send'].join(' ');
const MICROSOFT_SCOPES = ['openid', 'email', 'profile', 'offline_access', 'https://graph.microsoft.com/Mail.Send'].join(' ');

// IMPORTANT: To allow "Any Entra ID tenant + Personal Microsoft accounts", use "common"
const MICROSOFT_TENANT = 'common';

async function upsertAccountTokens(params: { authId: number; account: Account }) {
    const { authId, account } = params;

    await prisma.googleMicrosoftAccountTokens.upsert({
        where: {
            provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
            },
        },
        create: {
            authId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,

            refresh_token: account.refresh_token ?? null,
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
            session_state: (account as any).session_state ?? null,
        },
        update: {
            authId,
            type: account.type,

            refresh_token: account.refresh_token ?? null,
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
            session_state: (account as any).session_state ?? null,
        },
    });
}

async function updateRefreshedTokensInDb(token: JWT, refreshed: { access_token: string; expires_in: number; refresh_token?: string }) {
    const newExpiresAtSec = Math.floor((Date.now() + refreshed.expires_in * 1000) / 1000);
    if (!token.provider || !token.providerAccountId || !token.authId) return;

    await prisma.googleMicrosoftAccountTokens.update({
        where: {
            provider_providerAccountId: {
                provider: token.provider,
                providerAccountId: token.providerAccountId,
            },
        },
        data: {
            access_token: refreshed.access_token,
            expires_at: newExpiresAtSec,
            refresh_token: refreshed.refresh_token ?? token.refreshToken ?? null,
            authId: token.authId,
        },
    });
}

async function refreshGoogleAccessToken(token: JWT): Promise<JWT> {
    if (!token.refreshToken) {
        token.error = 'RefreshAccessTokenError' as TokenError;
        return token;
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
        }),
    });

    const refreshed = await response.json();
    if (!response.ok) throw refreshed;

    await updateRefreshedTokensInDb(token, refreshed);

    token.accessToken = refreshed.access_token;
    token.accessTokenExpires = Date.now() + refreshed.expires_in * 1000;
    token.refreshToken = refreshed.refresh_token ?? token.refreshToken;
    token.error = undefined;
    return token;
}

async function refreshMicrosoftAccessToken(token: JWT): Promise<JWT> {
    if (!token.refreshToken) {
        token.error = 'RefreshAccessTokenError' as TokenError;
        return token;
    }

    const url = `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/token`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.AZURE_AD_CLIENT_ID!,
            client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
            scope: MICROSOFT_SCOPES,
        }),
    });

    const refreshed = await response.json();
    if (!response.ok) throw refreshed;

    await updateRefreshedTokensInDb(token, refreshed);

    token.accessToken = refreshed.access_token;
    token.accessTokenExpires = Date.now() + refreshed.expires_in * 1000;
    token.refreshToken = refreshed.refresh_token ?? token.refreshToken;
    token.error = undefined;
    return token;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        if (token.provider === 'google') return await refreshGoogleAccessToken(token);
        if (token.provider === 'azure-ad') return await refreshMicrosoftAccessToken(token);

        token.error = 'UnknownProvider' as TokenError;
        return token;
    } catch {
        token.error = 'RefreshAccessTokenError' as TokenError;
        return token;
    }
}

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt' },

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                    scope: GOOGLE_SCOPES,
                },
            },
        }),

        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: MICROSOFT_TENANT, // <-- fixes the "Access Denied" for non-tenant users / personal accounts
            authorization: {
                params: {
                    prompt: 'consent',
                    response_type: 'code',
                    scope: MICROSOFT_SCOPES,
                },
            },
        }),
    ],

    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;

            const auth = await prisma.auth.findUnique({ where: { email: user.email } });
            if (!auth) return false;

            user.id = String(auth.id); // NextAuth user.id is string
            return true;
        },

        async jwt({ token, account, user }) {
            // Persist authId on the token
            if (user?.id) token.authId = Number(user.id);

            // On initial sign-in
            if (account) {
                token.provider = account.provider as ProviderId; // 'google' | 'azure-ad'
                token.providerAccountId = account.providerAccountId;
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = (account.expires_at ?? 0) * 1000;
                token.error = undefined;

                if (token.authId) {
                    await upsertAccountTokens({ authId: token.authId, account });
                }

                return token;
            }

            // On subsequent requests: refresh if expired (with small buffer)
            const expires = typeof token.accessTokenExpires === 'number' ? token.accessTokenExpires : 0;
            const shouldRefresh = !expires || Date.now() >= expires - 60_000;

            if (!shouldRefresh) return token;

            return await refreshAccessToken(token);
        },

        async session({ session, token }) {
            // Optional: expose these to the client if you need them
            (session as any).authId = token.authId;
            (session as any).provider = token.provider;
            (session as any).providerAccountId = token.providerAccountId;
            (session as any).accessToken = token.accessToken;
            (session as any).error = token.error;
            return session;
        },
    },
};

export default NextAuth(authOptions);
