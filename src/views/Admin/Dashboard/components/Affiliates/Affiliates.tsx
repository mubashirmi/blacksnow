// import { Container, Stack, Title } from '@mantine/core';
// import { ModalsProvider } from '@mantine/modals';
// import { MantineReactTable } from 'mantine-react-table';
// import useAffiliates from './useAffiliates';

// type Props = {
//     props: any;
// };

// const Affiliates = ({ props }: Props) => {
//     const { table } = useAffiliates(props);
//     return (
//         <ModalsProvider>
//             <Container fluid>
//                 <Title mb={40} ta={'center'}>
//                     Affiliates
//                 </Title>
//                 <Stack justify={'center'}>
//                     <MantineReactTable table={table} />
//                 </Stack>
//             </Container>
//         </ModalsProvider>
//     );
// };

// export { Affiliates };

import { Button, Container, Group, Pagination, Stack, Table, Title } from '@mantine/core';
import { useState } from 'react';

const Affiliates = () => {
    // Dummy Data for the Table
    const dummyData = [
        {
            id: 1,
            name: 'Affiliate A',
            email: 'affiliateA@example.com',
            status: 'Active',
            joinDate: '2023-06-01',
        },
        {
            id: 2,
            name: 'Affiliate B',
            email: 'affiliateB@example.com',
            status: 'Inactive',
            joinDate: '2023-03-15',
        },
        {
            id: 3,
            name: 'Affiliate C',
            email: 'affiliateC@example.com',
            status: 'Active',
            joinDate: '2022-12-20',
        },
        {
            id: 4,
            name: 'Affiliate D',
            email: 'affiliateD@example.com',
            status: 'Inactive',
            joinDate: '2023-02-10',
        },
    ];

    // Columns for the table
    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Status', accessor: 'status' },
        { header: 'Join Date', accessor: 'joinDate' },
    ];

    // Sorting state
    const [sortBy, setSortBy] = useState<keyof (typeof dummyData)[0] | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 2; // Number of rows per page

    // Sorting function
    const sortData = (data: typeof dummyData) => {
        if (!sortBy) return data;
        const sortedData = [...data].sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return sortedData;
    };

    // Paginate data
    const paginatedData = sortData(dummyData).slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <Container fluid>
            <Title mb={40} ta={'center'}>
                Affiliates
            </Title>
            <Stack justify={'center'}>
                {/* Table */}
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index}>
                                    <Button
                                        variant='subtle'
                                        onClick={() => {
                                            setSortBy(col.accessor as keyof (typeof dummyData)[0]);
                                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                        }}
                                    >
                                        {col.header}
                                    </Button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row) => (
                            <tr key={row.id}>
                                {columns.map((col) => (
                                    <td key={col.accessor}>{row[col.accessor]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Pagination */}
                <Group mt='md'>
                    <Pagination
                        value={currentPage} // Set the current page using 'value'
                        onChange={setCurrentPage} // Update the current page using 'onChange'
                        total={Math.ceil(dummyData.length / rowsPerPage)} // Total pages based on data and rows per page
                    />
                </Group>
            </Stack>
        </Container>
    );
};

export { Affiliates };
