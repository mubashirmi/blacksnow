import { CareerDetails } from '../../views';
const Page = (props: any) => <CareerDetails {...props} />;

// export async function getServerSideProps(req: any, res: any) {
//     const { id } = req.params;
//     const career = await prisma.careers.findFirst({
//         where: {
//             id: parseInt(id),
//         },
//     });

//     const returnVal = JSON.parse(JSON.stringify(career));

//     return {
//         props: {
//             career: returnVal,
//         },
//     };
// }

export default Page;
