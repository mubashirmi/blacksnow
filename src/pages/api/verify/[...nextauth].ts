import NextAuth, { type NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import GoogleProvider from 'next-auth/providers/google';

// OPTIONAL (recommended): persist tokens in DB instead of JWT
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "../../../lib/prisma";

async function refreshGoogleAccessToken(token: any) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
        }),
    });

    const data = await res.json();
    if (!res.ok) throw data;

    return {
        ...token,
        accessToken: data.access_token,
        accessTokenExpires: Date.now() + data.expires_in * 1000,
        // Google may or may not return a new refresh_token
        refreshToken: data.refresh_token ?? token.refreshToken,
    };
}

async function refreshMicrosoftAccessToken(token: any) {
    const tenant = process.env.AZURE_AD_TENANT_ID ?? 'common';
    const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.AZURE_AD_CLIENT_ID!,
            client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
            // Include the same resource scopes you need again:
            scope: ['openid', 'profile', 'email', 'offline_access', 'https://graph.microsoft.com/Mail.Send'].join(' '),
        }),
    });

    const data = await res.json();
    if (!res.ok) throw data;

    return {
        ...token,
        accessToken: data.access_token,
        accessTokenExpires: Date.now() + data.expires_in * 1000,
        refreshToken: data.refresh_token ?? token.refreshToken,
    };
}

export const authOptions: NextAuthOptions = {
    // adapter: PrismaAdapter(prisma), // recommended for production
    session: { strategy: 'jwt' },

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    // include gmail.send
                    scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.send'].join(' '),
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),

        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID ?? 'common',
            authorization: {
                params: {
                    scope: ['openid', 'profile', 'email', 'offline_access', 'https://graph.microsoft.com/Mail.Send'].join(' '),
                },
            },
        }),
    ],

    callbacks: {
        async jwt({ token, account }) {
            // First login for a provider
            if (account) {
                const expiresAtMs = account.expires_at != null ? Number(account.expires_at) * 1000 : Date.now() + Number(account.expires_in ?? 3600) * 1000;

                return {
                    ...token,
                    provider: account.provider,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    accessTokenExpires: expiresAtMs,
                };
            }

            // Still valid
            if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) - 30_000) {
                return token;
            }

            // Refresh
            try {
                if (token.provider === 'google') return await refreshGoogleAccessToken(token);
                if (token.provider === 'azure-ad') return await refreshMicrosoftAccessToken(token);
                return token;
            } catch (e) {
                return { ...token, error: 'RefreshAccessTokenError' };
            }
        },

        async session({ session, token }) {
            // DON'T put accessToken on the client in high-security apps.
            // For a quick start you can expose provider info:
            (session as any).provider = token.provider;
            (session as any).error = token.error;
            return session;
        },
    },
};

export default NextAuth(authOptions);
