// import { Container, Stack, Title } from '@mantine/core';
// import { ModalsProvider } from '@mantine/modals';
// import { MantineReactTable } from 'mantine-react-table';
// import useUserManagement from './useUserManagement';

// type Props = {
//     props: any;
// };

// const UserManagement = ({ props }: Props) => {
//     const { table } = useUserManagement(props);
//     return (
//         <ModalsProvider>
//             <Container fluid>
//                 <Title mb={40} ta={'center'}>
//                     Sales
//                 </Title>
//                 <Stack justify={'center'}>
//                     <MantineReactTable table={table} />
//                 </Stack>
//             </Container>
//         </ModalsProvider>
//     );
// };

// export { UserManagement };
import { Container, Stack, Table, Title } from '@mantine/core';

const UserManagement = () => {
    // Dummy Data for the Table
    const dummyData = [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'Salesperson',
            status: 'Active',
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'Manager',
            status: 'Inactive',
        },
        {
            id: 3,
            firstName: 'Mark',
            lastName: 'Johnson',
            email: 'mark.johnson@example.com',
            role: 'Salesperson',
            status: 'Active',
        },
        {
            id: 4,
            firstName: 'Alice',
            lastName: 'Brown',
            email: 'alice.brown@example.com',
            role: 'Manager',
            status: 'Active',
        },
    ];

    // Columns for the table
    const columns = [
        { header: 'First Name', accessor: 'firstName' },
        { header: 'Last Name', accessor: 'lastName' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role' },
        { header: 'Status', accessor: 'status' },
    ];

    return (
        <Container fluid>
            <Title mb={40} ta={'center'}>
                Sales
            </Title>
            <Stack justify={'center'}>
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dummyData.map((row) => (
                            <tr key={row.id}>
                                {columns.map((col, index) => (
                                    <td key={index}>{row[col.accessor]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Stack>
        </Container>
    );
};

export { UserManagement };
