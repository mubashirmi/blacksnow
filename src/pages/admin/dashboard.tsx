import { Dashboard } from '@/views';
// jdfjdkfj
const Page = (props: any) => <Dashboard {...props} />;

// export const getServerSideProps = async ({ req, res }: GetServerSidePropsContext) => {
//     // const authenticated = await getUserAttributes(req, res);
//     // if (authenticated?.zoneinfo === 'admin') {
//     //     const roles = await prisma.role.findMany({
//     //         select: {
//     //             name: true,
//     //             id: true,
//     //         },
//     //     });
//     //     const users = await prisma.user.findMany({
//     //         where: {
//     //             deleted: false,
//     //         },
//     //         select: {
//     //             firstName: true,
//     //             lastName: true,
//     //             cognitoId: true,
//     //             id: true,
//     //             email: true,
//     //             phone: true,
//     //             disabled: true,
//     //             roleId: true,
//     //             rsvpCount: true,
//     //             pageHits: true,
//     //             digitalBillboards: true,
//     //             role: {
//     //                 select: {
//     //                     name: true,
//     //                 },
//     //             },
//     //         },
//     //     });
//     //     const calendars = await prisma.calendar.findMany({
//     //         where: {
//     //             deleted: false,
//     //         },
//     //         select: {
//     //             date: true,
//     //             time: true,
//     //             limit: true,
//     //             id: true,
//     //         },
//     //     });
//     //     const checkout = await prisma.checkout.findMany({
//     //         where: {
//     //             deleted: false,
//     //         },
//     //         include: {
//     //             rsvp: true,
//     //             signUp: {
//     //                 include: {
//     //                     calendar: true,
//     //                     salesMember: true,
//     //                 },
//     //             },
//     //         },
//     //     });
//     //     let careers = await prisma.careers.findMany({
//     //         include: {
//     //             Applicants: true,
//     //         },
//     //     });

//     //     let consultations = await prisma.consultation.findMany();

//     //     const events = JSON.parse(JSON.stringify(checkout));
//     //     careers = JSON.parse(JSON.stringify(careers));
//     //     consultations = JSON.parse(JSON.stringify(consultations));
//     //     const calendarsWithFormattedDate = calendars.map((event) => ({
//     //         ...event,
//     //         formattedDate: new Date(event.date).toISOString().split('T')[0],
//     //     }));
//     //     const transformedArray = roles.map((item) => ({
//     //         value: item.id.toString(),
//     //         label: item.name,
//     //     }));
//     //     const blogPosts = await prisma.blogpost.findMany({
//     //         select: {
//     //             id: true,
//     //             title: true,
//     //             slug: true,
//     //             category: true,
//     //             headerImage: true,
//     //             featured: true,
//     //         },
//     //     });
//     //     const notes = await prisma.notes.findMany({
//     //         select: {
//     //             id: true,
//     //             title: true,
//     //             content: true,
//     //         },
//     //     });
//     //     const advertisers = await prisma.advertiser.findMany({
//     //         where: {
//     //             deleted: false,
//     //         },
//     //         select: {
//     //             id: true,
//     //             approved: true,
//     //             website: true,
//     //             podcast: true,
//     //             twitter: true,
//     //             youtube: true,
//     //             facebook: true,
//     //             companyName: true,
//     //             companyBlurb: true,
//     //             businessImage: true,
//     //             User: {
//     //                 select: {
//     //                     id: true,
//     //                     email: true,
//     //                     firstName: true,
//     //                     lastName: true,
//     //                 },
//     //             },
//     //         },
//     //     });

//     //     const affiliates = users.filter((user) => user.role.name === 'Affiliate');
//     //     const sales = users.filter((user) => user.role.name === 'Sales');
//     //     const faqs = await prisma.frequentQuestions.findMany({ where: { deleted: false }, select: { id: true, text: true, title: true } });

//     //     const legalDocs = await prisma.legal.findMany({
//     //         where: {
//     //             deleted: false,
//     //         },
//     //         select: {
//     //             id: true,
//     //             title: true,
//     //             content: true,
//     //         },
//     //     });

//     //     const newsLetterContent = await prisma.newsLetterContent.findMany({
//     //         where: {
//     //             deleted: false,
//     //         },
//     //         select: {
//     //             id: true,
//     //             title: true,
//     //             content: true,
//     //             published: true,
//     //         },
//     //     });

//     //     return {
//     //         props: {
//     //             calendars: calendarsWithFormattedDate,
//     //             users,
//     //             roles: transformedArray,
//     //             events,
//     //             careers,
//     //             consultations,
//     //             blogPosts,
//     //             authenticated,
//     //             notes,
//     //             affiliates,
//     //             advertisers,
//     //             sales,
//     //             faqs,
//     //             legalDocs,
//     //             newsLetterContent,
//     //         },
//     //     };
//     // } else {
//     //     return {
//     //         redirect: {
//     //             permanent: false,
//     //             destination: '/',
//     //         },
//     //     };
//     // }
//     return (
//         <Dashboard/>
//     )
// };

export default Page;
