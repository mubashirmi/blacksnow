// import { createServerRunner } from '@aws-amplify/adapter-nextjs';
// import { fetchUserAttributes } from 'aws-amplify/auth/server';
// import config from '../aws-exports';

// export const { runWithAmplifyServerContext } = createServerRunner({
//     config,
// });

// export const isAuthenticated = async (req: any, res: any) => {
// return await runWithAmplifyServerContext({
//     nextServerContext: { request: req, response: res },
//     operation: async (contextSpec) => {
//         try {
//             const session = await fetchAuthSession(contextSpec);
//             return session.tokens !== undefined;
//         } catch (error) {
//             return false;
//         }
//     },
// });
// return true;
// };

// export const getUserAttributes = async (req: any, res: any) => {
//     try {
//         const result = await runWithAmplifyServerContext({
//             nextServerContext: { request: req, response: res },
//             operation: (contextSpec) => fetchUserAttributes(contextSpec),
//         });

//         return result || {};
//     } catch (error) {
//         return {};
//     }
// };
