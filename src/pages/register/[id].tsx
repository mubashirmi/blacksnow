import { Register } from '../../views';
const Page = (props: any) => <Register {...props} />;

// export async function getServerSideProps(req: any, res: any) {
//     const { id } = req.params;
//     const user = await prisma.user.findFirst({
//         where: {
//             id: parseInt(id),
//         },
//     });

//     const returnVal = JSON.parse(JSON.stringify(user));

//     return {
//         props: {
//             user: returnVal,
//         },
//     };
// }

export default Page;
