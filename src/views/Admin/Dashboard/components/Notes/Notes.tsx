// import useNotes from '@/views/Admin/Dashboard/components/Notes/useNotes';
// import { Container, Stack, Title, useMantineTheme } from '@mantine/core';
// import { MantineReactTable } from 'mantine-react-table';

// type Props = {
//     props: any;
// };

// const Notes = ({ props }: Props) => {
//     const theme = useMantineTheme();
//     const { table } = useNotes(props);

//     return (
//         <Container fluid>
//             <Title mb={40} ta={'center'} c={theme.colors.customColor[4]}>
//                 Notes
//             </Title>
//             <Stack justify={'center'}>
//                 <MantineReactTable table={table} />
//             </Stack>
//         </Container>
//     );
// };

// export { Notes };

import { Button, Container, Stack, Table, Title, useMantineTheme } from '@mantine/core';
import { useState } from 'react';

// Dummy data for the table
const dummyNotesData = [
    {
        id: 1,
        title: 'Meeting Notes',
        date: '2023-06-01',
        author: 'John Doe',
        content: 'Discussed the Q2 sales strategy and upcoming product launches.',
    },
    {
        id: 2,
        title: 'Client Feedback',
        date: '2023-06-05',
        author: 'Jane Smith',
        content: 'Client requested changes to the website layout and branding.',
    },
    {
        id: 3,
        title: 'Project Updates',
        date: '2023-06-10',
        author: 'Mark Johnson',
        content: 'The development team made significant progress on the new feature set.',
    },
];

const Notes = () => {
    const theme = useMantineTheme();
    const [tableData] = useState(dummyNotesData);

    return (
        <Container fluid>
            <Title mb={40} ta={'center'} c={theme.colors.customColor[4]}>
                Notes
            </Title>
            <Stack justify={'center'}>
                {/* Custom Table */}
                <Table highlightOnHover>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Date</th>
                            <th>Content</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((note) => (
                            <tr key={note.id}>
                                <td>{note.title}</td>
                                <td>{note.author}</td>
                                <td>{note.date}</td>
                                <td>{note.content}</td>
                                <td>
                                    <Button size='xs' color='red' variant='outline' onClick={() => alert('Delete Note')}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Stack>
        </Container>
    );
};

export { Notes };
