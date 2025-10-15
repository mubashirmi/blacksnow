import { Legal } from '@/views';

const Page = (props: any) => <Legal {...props} />;

// export const getServerSideProps = async () => {
//     const legal = await prisma.legal.findUnique({
//         where: {
//             id: 1,
//         },
//         select: {
//             title: true,
//             content: true,
//         },
//     });
//     return { props: { legal } };
// };

export default Page;
