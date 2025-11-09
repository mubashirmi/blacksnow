import { Partners } from '@/views';

const Page = (props: any) => <Partners {...props} />;

// export const getServerSideProps = async ({ req, res }: GetServerSidePropsContext) => {
//     const advertisers = await prisma.advertiser.findMany({
//         where: {
//             deleted: false,
//             approved: true,
//         },
//         select: {
//             website: true,
//             companyName: true,
//             businessImage: true,
//             linkedIn: true,
//             instagram: true,
//         },


export default Page;
