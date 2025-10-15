import { Confirmation } from '@/views';

const Page = (props: any) => <Confirmation {...props} />;

// export async function getServerSideProps(req, res) {
//     let checkout: any[] = [];
//     let returnCheckout;
//     if (req.query.rsvp && req.query.email) {
//         checkout = await prisma.checkout.findMany({
//             where: {
//                 rSVPId: parseInt(req.query.rsvp),
//             },
//             include: {
//                 signUp: {
//                     include: {
//                         affiliate: true,
//                     },
//                 },
//             },
//         });

//         if (checkout?.length > 0) {
//             const singleCheckout = checkout[0];
//             if (singleCheckout?.signUp?.affiliate) {
//                 const {
//                     signUp: { affiliate },
//                 } = singleCheckout;
//                 await prisma.affiliate.update({
//                     where: {
//                         id: affiliate.id,
//                     },
//                     data: {
//                         rsvpCount: affiliate?.rsvpCount ? affiliate.rsvpCount + 1 : 1,
//                     },
//                 });
//             }
//         }

//         if (checkout && checkout.length > 0) {
//             returnCheckout = await prisma.checkout.update({
//                 where: {
//                     id: checkout[0].id,
//                 },
//                 data: {
//                     paid: true,
//                 },
//                 select: {
//                     id: true,
//                     transactionId: true,
//                     rsvp: {
//                         select: {
//                             firstName: true,
//                             lastName: true,
//                         },
//                     },
//                 },
//             });
//         }
//     }

//     return {
//         props: {
//             returnCheckout,
//         },
//     };
// }

export default Page;
