import { Careers } from '@/views';

const Page = (props: any) => <Careers {...props} />;

// export async function getServerSideProps(req, res) {
//     const careers = await prisma.careers.findMany({
//         select: {
//             id: true,
//             title: true,
//             description: true,
//             image: true,
//             location: true,
//             salary: true,
//         },
//     });
//     return {
//         props: {
//             careers,
//         },
//     };
// }

export default Page;
