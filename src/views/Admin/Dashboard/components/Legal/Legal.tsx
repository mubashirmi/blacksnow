// import { Accordion, Button, Container, Text, Title, useMantineTheme } from '@mantine/core';
// import { RichTextEditor } from '@mantine/tiptap';
// import { IconColorPicker } from '@tabler/icons-react';
// import useLegal from './useLegal';

// type Props = {
//     props: any;
// };

// const Legal = ({ props }: Props) => {
//     const { legalDocs, editors, handleSubmit } = useLegal(props);
//     const theme = useMantineTheme();

//     return (
//         <Container fluid>
//             <Title>Legal</Title>
//             <Accordion variant='separated' radius={10} chevronPosition={'left'} mb={100} chevronSize={'xl'} mt={50}>
//                 {legalDocs && legalDocs.length > 0 ? (
//                     legalDocs.map((doc, index) => (
//                         <Accordion.Item key={doc.id.toString()} value={doc.id.toString()}>
//                             <Accordion.Control>{doc.title}</Accordion.Control>
//                             <Accordion.Panel>
//                                 <RichTextEditor editor={editors[index]}>
//                                     <RichTextEditor.Toolbar sticky stickyOffset={60}>
//                                         <RichTextEditor.ColorPicker
//                                             colors={[
//                                                 '#25262b',
//                                                 '#868e96',
//                                                 '#fa5252',
//                                                 '#e64980',
//                                                 '#be4bdb',
//                                                 '#7950f2',
//                                                 '#4c6ef5',
//                                                 '#228be6',
//                                                 '#15aabf',
//                                                 '#12b886',
//                                                 '#40c057',
//                                                 '#82c91e',
//                                                 '#fab005',
//                                                 '#fd7e14',
//                                             ]}
//                                         />

//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Control interactive={false}>
//                                                 <IconColorPicker size={16} stroke={1.5} />
//                                             </RichTextEditor.Control>
//                                             <RichTextEditor.Color color='#F03E3E' />
//                                             <RichTextEditor.Color color='#7048E8' />
//                                             <RichTextEditor.Color color='#1098AD' />
//                                             <RichTextEditor.Color color='#37B24D' />
//                                             <RichTextEditor.Color color='#F59F00' />
//                                         </RichTextEditor.ControlsGroup>

//                                         <RichTextEditor.UnsetColor />
//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Bold />
//                                             <RichTextEditor.Italic />
//                                             <RichTextEditor.Underline />
//                                             <RichTextEditor.Strikethrough />
//                                             <RichTextEditor.ClearFormatting />
//                                             <RichTextEditor.Highlight />
//                                             <RichTextEditor.Code />
//                                         </RichTextEditor.ControlsGroup>

//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.H1 />
//                                             <RichTextEditor.H2 />
//                                             <RichTextEditor.H3 />
//                                             <RichTextEditor.H4 />
//                                         </RichTextEditor.ControlsGroup>

//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Blockquote />
//                                             <RichTextEditor.Hr />
//                                             <RichTextEditor.BulletList />
//                                             <RichTextEditor.OrderedList />
//                                             <RichTextEditor.Subscript />
//                                             <RichTextEditor.Superscript />
//                                         </RichTextEditor.ControlsGroup>

//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Link />
//                                             <RichTextEditor.Unlink />
//                                         </RichTextEditor.ControlsGroup>

//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.AlignLeft />
//                                             <RichTextEditor.AlignCenter />
//                                             <RichTextEditor.AlignJustify />
//                                             <RichTextEditor.AlignRight />
//                                         </RichTextEditor.ControlsGroup>

//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Undo />
//                                             <RichTextEditor.Redo />
//                                         </RichTextEditor.ControlsGroup>
//                                     </RichTextEditor.Toolbar>

//                                     <RichTextEditor.Content />
//                                 </RichTextEditor>
//                                 <Button w={150} onClick={() => handleSubmit(editors[index], doc.id.toString())} mt={20} bg={theme.colors.customColor[2]}>
//                                     Save
//                                 </Button>
//                             </Accordion.Panel>
//                         </Accordion.Item>
//                     ))
//                 ) : (
//                     <Text>No legal docs</Text>
//                 )}
//             </Accordion>
//         </Container>
//     );
// };

// export { Legal };

// import { useState, useEffect } from 'react';
// import { Accordion, Button, Container, Text, Title, useMantineTheme } from '@mantine/core';
// import { RichTextEditor } from '@mantine/tiptap';
// import { IconColorPicker } from '@tabler/icons-react';
// import { Editor, useEditor } from '@tiptap/react';
// import { StarterKit } from '@tiptap/starter-kit';

// // Dummy data for legal docs
// const dummyLegalDocs = [
//     { id: 1, title: 'Terms and Conditions', content: '<p>These are the terms and conditions...</p>' },
//     { id: 2, title: 'Privacy Policy', content: '<p>This is our privacy policy...</p>' },
//     { id: 3, title: 'Refund Policy', content: '<p>Here is the refund policy...</p>' },
// ];

// const Legal = () => {
//     const theme = useMantineTheme();

//     // State to store the legal docs and their editor instances
//     const [legalDocs, setLegalDocs] = useState(dummyLegalDocs);

//     // Initialize editors state with Tiptap editor instances
//     const [editors, setEditors] = useState<Editor[]>([]);

//     useEffect(() => {
//         // Create a Tiptap editor instance for each document on component mount
//         const editorInstances = legalDocs.map(doc =>
//             useEditor({
//                 extensions: [StarterKit], // Add required extensions
//                 content: doc.content, // Set initial content
//             })
//         ).filter(editor => editor !== null); // Filter out null values

//         setEditors(editorInstances as Editor[]); // Type assertion to ensure non-nullable Editor[]
//     }, [legalDocs]);

//     // Dummy handleSubmit function
//     const handleSubmit = (editor: Editor, docId: string) => {
//         console.log('Saving content for docId:', docId, 'with content:', editor.getHTML());
//     };

//     return (
//         <Container fluid>
//             <Title>Legal</Title>
//             <Accordion variant="separated" radius={10} chevronPosition="left" mb={100} chevronSize="xl" mt={50}>
//                 {legalDocs && legalDocs.length > 0 ? (
//                     legalDocs.map((doc, index) => (
//                         <Accordion.Item key={doc.id.toString()} value={doc.id.toString()}>
//                             <Accordion.Control>{doc.title}</Accordion.Control>
//                             <Accordion.Panel>
//                                 <RichTextEditor
//                                     editor={editors[index]}
//                                     onChange={(content: any) => {
//                                         // Update editor content when it changes (optional, for live preview etc.)
//                                     }}
//                                 >
//                                     <RichTextEditor.Toolbar sticky stickyOffset={60}>
//                                         <RichTextEditor.ColorPicker
//                                             colors={[
//                                                 '#25262b', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6',
//                                                 '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14'
//                                             ]}
//                                         />
//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Control interactive={false}>
//                                                 <IconColorPicker size={16} stroke={1.5} />
//                                             </RichTextEditor.Control>
//                                             <RichTextEditor.Color color="#F03E3E" />
//                                             <RichTextEditor.Color color="#7048E8" />
//                                             <RichTextEditor.Color color="#1098AD" />
//                                             <RichTextEditor.Color color="#37B24D" />
//                                             <RichTextEditor.Color color="#F59F00" />
//                                         </RichTextEditor.ControlsGroup>
//                                         <RichTextEditor.UnsetColor />
//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Bold />
//                                             <RichTextEditor.Italic />
//                                             <RichTextEditor.Underline />
//                                             <RichTextEditor.Strikethrough />
//                                             <RichTextEditor.ClearFormatting />
//                                             <RichTextEditor.Highlight />
//                                             <RichTextEditor.Code />
//                                         </RichTextEditor.ControlsGroup>
//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.H1 />
//                                             <RichTextEditor.H2 />
//                                             <RichTextEditor.H3 />
//                                             <RichTextEditor.H4 />
//                                         </RichTextEditor.ControlsGroup>
//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Blockquote />
//                                             <RichTextEditor.Hr />
//                                             <RichTextEditor.BulletList />
//                                             <RichTextEditor.OrderedList />
//                                             <RichTextEditor.Subscript />
//                                             <RichTextEditor.Superscript />
//                                         </RichTextEditor.ControlsGroup>
//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Link />
//                                             <RichTextEditor.Unlink />
//                                         </RichTextEditor.ControlsGroup>
//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.AlignLeft />
//                                             <RichTextEditor.AlignCenter />
//                                             <RichTextEditor.AlignJustify />
//                                             <RichTextEditor.AlignRight />
//                                         </RichTextEditor.ControlsGroup>
//                                         <RichTextEditor.ControlsGroup>
//                                             <RichTextEditor.Undo />
//                                             <RichTextEditor.Redo />
//                                         </RichTextEditor.ControlsGroup>
//                                     </RichTextEditor.Toolbar>
//                                     <RichTextEditor.Content />
//                                 </RichTextEditor>
//                                 <Button
//                                     w={150}
//                                     onClick={() => handleSubmit(editors[index], doc.id.toString())}
//                                     mt={20}
//                                     bg={theme.colors.customColor[2]}
//                                 >
//                                     Save
//                                 </Button>
//                             </Accordion.Panel>
//                         </Accordion.Item>
//                     ))
//                 ) : (
//                     <Text>No legal docs</Text>
//                 )}
//             </Accordion>
//         </Container>
//     );
// };

// export { Legal };
import { Accordion, Button, Container, Text, Title, useMantineTheme } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { IconColorPicker } from '@tabler/icons-react';
import { Editor, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

// Dummy data for legal docs
const dummyLegalDocs = [
    { id: 1, title: 'Terms and Conditions', content: '<p>These are the terms and conditions...</p>' },
    { id: 2, title: 'Privacy Policy', content: '<p>This is our privacy policy...</p>' },
    { id: 3, title: 'Refund Policy', content: '<p>Here is the refund policy...</p>' },
];

// Individual editor component to handle each document
const LegalDocEditor = ({ doc, onSave }: { doc: any; onSave: (editor: Editor, docId: string) => void }) => {
    const theme = useMantineTheme();

    const editor = useEditor({
        extensions: [StarterKit],
        content: doc.content,
    });

    if (!editor) {
        return <div>Loading editor...</div>;
    }

    return (
        <>
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
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Control interactive={false}>
                            <IconColorPicker size={16} stroke={1.5} />
                        </RichTextEditor.Control>
                        <RichTextEditor.Color color='#F03E3E' />
                        <RichTextEditor.Color color='#7048E8' />
                        <RichTextEditor.Color color='#1098AD' />
                        <RichTextEditor.Color color='#37B24D' />
                        <RichTextEditor.Color color='#F59F00' />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.UnsetColor />
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                        <RichTextEditor.ClearFormatting />
                        <RichTextEditor.Highlight />
                        <RichTextEditor.Code />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
                        <RichTextEditor.H2 />
                        <RichTextEditor.H3 />
                        <RichTextEditor.H4 />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Blockquote />
                        <RichTextEditor.Hr />
                        <RichTextEditor.BulletList />
                        <RichTextEditor.OrderedList />
                        <RichTextEditor.Subscript />
                        <RichTextEditor.Superscript />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Link />
                        <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.AlignLeft />
                        <RichTextEditor.AlignCenter />
                        <RichTextEditor.AlignJustify />
                        <RichTextEditor.AlignRight />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Undo />
                        <RichTextEditor.Redo />
                    </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <RichTextEditor.Content />
            </RichTextEditor>
            <Button w={150} onClick={() => onSave(editor, doc.id.toString())} mt={20} bg={theme.colors.customColor[2]}>
                Save
            </Button>
        </>
    );
};

const Legal = () => {
    const [legalDocs] = useState(dummyLegalDocs);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Dummy handleSubmit function
    const handleSubmit = (editor: Editor, docId: string) => {
        console.log('Saving content for docId:', docId, 'with content:', editor.getHTML());
    };

    if (!isClient) {
        return null; // Prevent rendering until client-side hydration is complete
    }

    return (
        <Container fluid>
            <Title>Legal</Title>
            <Accordion variant='separated' radius={10} chevronPosition='left' mb={100} chevronSize='xl' mt={50}>
                {legalDocs && legalDocs.length > 0 ? (
                    legalDocs.map((doc) => (
                        <Accordion.Item key={doc.id.toString()} value={doc.id.toString()}>
                            <Accordion.Control>{doc.title}</Accordion.Control>
                            <Accordion.Panel>
                                <LegalDocEditor doc={doc} onSave={handleSubmit} />
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))
                ) : (
                    <Text>No legal docs</Text>
                )}
            </Accordion>
        </Container>
    );
};

export { Legal };
