import { BlogPosts } from '@/views';

const Page = (props: any) => <BlogPosts {...props} />;

// export const getServerSideProps = async (context) => {
//     const { slug } = context.query;
//     const { req } = context;

//     if (slug) {
//         const content = await prisma.blogpost.findUnique({
//             where: {
//                 slug,
//             },
//             select: {
//                 title: true,
//                 postContent: true,
//                 category: true,
//             },
//         });
//         const host = req.headers.host;
//         const baseUrl = `https://${host}/blogposts/${slug}`;

//         return { props: { content, baseUrl } };
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
