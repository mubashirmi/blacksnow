import { AdvertisingDashboard } from '@/views';

const Page = (props: any) => <AdvertisingDashboard {...props} />;

// export const getServerSideProps = async ({ req, res }: GetServerSidePropsContext) => {
//     const authenticated = await isAuthenticated(req, res);

//     if (authenticated) {
//         const attributes = await getUserAttributes(req, res);
//         const user = await prisma.user.findUnique({
//             where: {
//                 email: attributes.email,
//             },
//             select: {
//                 Advertiser: {
//                     select: {
//                         id: true,
//                         website: true,
//                         podcast: true,
//                         twitter: true,
//                         youtube: true,
//                         facebook: true,
//                         companyName: true,
//                         companyBlurb: true,
//                         businessImage: true,
//                     },
//                 },
//             },
//         });
//         return { props: { advertiser: user?.Advertiser } };
//     } else {
//         return {
//             redirect: {
//                 permanent: false,
//                 destination: '/',
//             },
//         };
//     }
// };

export default Page;
