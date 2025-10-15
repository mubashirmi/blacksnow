import { FAQ } from '@/views';

const Page = (props: any) => <FAQ {...props} />;

// export async function getServerSideProps() {
//     const faqs = await prisma.frequentQuestions.findMany({ where: { deleted: false }, select: { id: true, text: true, title: true } });
//     return {
//         props: {
//             faqs,
//         },
//     };
// }

export default Page;
