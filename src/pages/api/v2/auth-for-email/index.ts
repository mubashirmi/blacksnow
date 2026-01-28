import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../verify/[...nextauth]';

// function base64UrlEncode(str: Buffer) {
//     return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: 'Not authenticated' });

    // If you used JWT strategy above, you should fetch token via getToken() from next-auth/jwt
    // For production, prefer DB storage via PrismaAdapter and read account tokens from DB.

    return res.status(501).json({
        error: 'Implement token retrieval (JWT getToken or DB). See notes in code. Then call Gmail API with raw MIME.',
    });
}
