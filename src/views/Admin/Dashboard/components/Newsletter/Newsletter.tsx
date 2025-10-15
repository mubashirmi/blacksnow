// import useNewsletter from '@/views/Admin/Dashboard/components/Newsletter/useNewsletter';
// import { Accordion, Button, Container, TextInput, Title, useMantineTheme } from '@mantine/core';
// import { RichTextEditor } from '@mantine/tiptap';
// import { IconColorPicker } from '@tabler/icons-react';
// import DOMPurify from 'isomorphic-dompurify';
// import { MantineReactTable } from 'mantine-react-table';

// type Props = {
//     props: any;
// };

// const Newsletter = ({ props }: Props) => {
//     const theme = useMantineTheme();
//     // eslint-disable-next-line react/prop-types
//     const { newsLetterContent } = props;
//     const { table, newsletter, setTitle, handleCreateNewsletter, editor } = useNewsletter(newsLetterContent);

//     return (
//         <Container fluid>
//             <Title mb={20} ta={'center'}>
//                 Newsletter
//             </Title>
//             <MantineReactTable table={table} />

//             <Accordion mt={20}>
//                 <Accordion.Item value={'editor'}>
//                     <Accordion.Control>Editor</Accordion.Control>
//                     <Accordion.Panel>
//                         <TextInput mb={10} onChange={(e) => setTitle(e.target.value)} label={'Title'} />
//                         <RichTextEditor editor={editor}>
//                             <RichTextEditor.Toolbar sticky stickyOffset={60}>
//                                 <RichTextEditor.ColorPicker
//                                     colors={[
//                                         '#25262b',
//                                         '#868e96',
//                                         '#fa5252',
//                                         '#e64980',
//                                         '#be4bdb',
//                                         '#7950f2',
//                                         '#4c6ef5',
//                                         '#228be6',
//                                         '#15aabf',
//                                         '#12b886',
//                                         '#40c057',
//                                         '#82c91e',
//                                         '#fab005',
//                                         '#fd7e14',
//                                     ]}
//                                 />

//                                 <RichTextEditor.ControlsGroup>
//                                     <RichTextEditor.Control interactive={false}>
//                                         <IconColorPicker size={16} stroke={1.5} />
//                                     </RichTextEditor.Control>
//                                     <RichTextEditor.Color color='#F03E3E' />
//                                     <RichTextEditor.Color color='#7048E8' />
//                                     <RichTextEditor.Color color='#1098AD' />
//                                     <RichTextEditor.Color color='#37B24D' />
//                                     <RichTextEditor.Color color='#F59F00' />
//                                 </RichTextEditor.ControlsGroup>

//                                 <RichTextEditor.UnsetColor />
//                                 <RichTextEditor.ControlsGroup>
//                                     <RichTextEditor.Bold />
//                                     <RichTextEditor.Italic />
//                                     <RichTextEditor.Underline />
//                                     <RichTextEditor.Strikethrough />
//                                     <RichTextEditor.ClearFormatting />
//                                     <RichTextEditor.Highlight />
//                                     <RichTextEditor.Code />
//                                 </RichTextEditor.ControlsGroup>

//                                 <RichTextEditor.ControlsGroup>
//                                     <RichTextEditor.H1 />
//                                     <RichTextEditor.H2 />
//                                     <RichTextEditor.H3 />
//                                     <RichTextEditor.H4 />
//                                 </RichTextEditor.ControlsGroup>

//                                 <RichTextEditor.ControlsGroup>
//                                     <RichTextEditor.Blockquote />
//                                     <RichTextEditor.Hr />
//                                     <RichTextEditor.BulletList />
//                                     <RichTextEditor.OrderedList />
//                                     <RichTextEditor.Subscript />
//                                     <RichTextEditor.Superscript />
//                                 </RichTextEditor.ControlsGroup>

//                                 <RichTextEditor.ControlsGroup>
//                                     <RichTextEditor.Link />
//                                     <RichTextEditor.Unlink />
//                                 </RichTextEditor.ControlsGroup>

//                                 <RichTextEditor.ControlsGroup>
//                                     <RichTextEditor.AlignLeft />
//                                     <RichTextEditor.AlignCenter />
//                                     <RichTextEditor.AlignJustify />
//                                     <RichTextEditor.AlignRight />
//                                 </RichTextEditor.ControlsGroup>

//                                 <RichTextEditor.ControlsGroup>
//                                     <RichTextEditor.Undo />
//                                     <RichTextEditor.Redo />
//                                 </RichTextEditor.ControlsGroup>
//                             </RichTextEditor.Toolbar>

//                             <RichTextEditor.Content />
//                         </RichTextEditor>
//                         <Button onClick={handleCreateNewsletter} bg={theme.colors.customColor[2]} mt={20}>
//                             Create
//                         </Button>
//                     </Accordion.Panel>
//                 </Accordion.Item>
//                 <Accordion.Item value={'preview'} mt={20}>
//                     <Accordion.Control>Preview</Accordion.Control>
//                     <Accordion.Panel>{newsletter && <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(newsletter.content) }} />}</Accordion.Panel>
//                 </Accordion.Item>
//             </Accordion>
//         </Container>
//     );
// };

// export { Newsletter };
import { Accordion, Button, Container, Table, TextInput, Title, useMantineTheme } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import DOMPurify from 'isomorphic-dompurify';
import { useState } from 'react';

const Newsletter = () => {
    const theme = useMantineTheme();

    // Dummy data for Newsletter content and table
    const dummyNewsLetterContent = {
        content: '<h1>Welcome to our Newsletter!</h1><p>This is a sample newsletter content.</p>',
    };

    const dummyTableData = [
        {
            id: 1,
            title: 'Job Post 1',
            applicants: 5,
        },
        {
            id: 2,
            title: 'Job Post 2',
            applicants: 2,
        },
    ];

    // State for managing editor content and title
    const [newsletter] = useState(dummyNewsLetterContent);
    const [editor] = useState(null); // Assuming this will be initialized properly by the RichTextEditor
    const [title, setTitle] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Sort data function
    const sortData = (data: typeof dummyTableData) => {
        const sortedData = [...data].sort((a, b) => {
            const valA = a.title.toLowerCase();
            const valB = b.title.toLowerCase();

            if (sortDirection === 'asc') {
                return valA < valB ? -1 : valA > valB ? 1 : 0;
            } else {
                return valA > valB ? -1 : valA < valB ? 1 : 0;
            }
        });
        return sortedData;
    };

    // Handle form submission to create newsletter
    const handleCreateNewsletter = () => {
        console.log('Creating newsletter with title:', title, 'and content:', newsletter.content);
    };

    return (
        <Container fluid>
            <Title mb={20} ta={'center'} c={theme.colors.customColor[4]}>
                Newsletter
            </Title>

            {/* Custom Table */}
            <Table>
                <thead>
                    <tr>
                        <th>
                            <Button variant='subtle' onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
                                Title
                            </Button>
                        </th>
                        <th>Applicants</th>
                    </tr>
                </thead>
                <tbody>
                    {sortData(dummyTableData).map((job) => (
                        <tr key={job.id}>
                            <td>{job.title}</td>
                            <td>{job.applicants}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Accordion with Editor and Preview */}
            <Accordion mt={20}>
                <Accordion.Item value={'editor'}>
                    <Accordion.Control>Editor</Accordion.Control>
                    <Accordion.Panel>
                        <TextInput mb={10} onChange={(e) => setTitle(e.target.value)} label={'Title'} value={title} />
                        <RichTextEditor editor={editor}>
                            <RichTextEditor.Toolbar sticky stickyOffset={60}>
                                <RichTextEditor.ColorPicker
                                    colors={[
                                        '#25262b',
                                        '#868e96',
                                        '#fa5252',
                                        '#e64980',
                                        '#be4bdb',
                                        '#7950f2',
                                        '#4c6ef5',
                                        '#228be6',
                                        '#15aabf',
                                        '#12b886',
                                        '#40c057',
                                        '#82c91e',
                                        '#fab005',
                                        '#fd7e14',
                                    ]}
                                />
                                {/* Add other toolbar controls */}
                            </RichTextEditor.Toolbar>
                            <RichTextEditor.Content />
                        </RichTextEditor>
                        <Button onClick={handleCreateNewsletter} bg={theme.colors.customColor[2]} mt={20}>
                            Create
                        </Button>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value={'preview'} mt={20}>
                    <Accordion.Control>Preview</Accordion.Control>
                    <Accordion.Panel>{newsletter && <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(newsletter.content) }} />}</Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
};

export { Newsletter };
