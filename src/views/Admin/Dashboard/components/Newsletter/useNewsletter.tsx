import { NEWSLETTER_CONTENT, NEWSLETTER_CONTENT_CREATION } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { ActionIcon, Flex, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Link } from '@mantine/tiptap';
import { IconNews, IconSearch, IconTrash } from '@tabler/icons-react';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import SubScript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// eslint-disable-next-line camelcase
import { MRT_ColumnDef, MRT_Row, useMantineReactTable } from 'mantine-react-table';
import { useMemo, useState } from 'react';

type NewsLetterContent = {
    id: number;
    title: string;
    content: string;
    published: boolean;
};

type NewsLetter = {
    title: string;
    content: string;
};

const useNewsletter = (newsLetterContent: any) => {
    const theme = useMantineTheme();
    const { restDelete, restPost } = useRest();
    const [newsletter, setNewsletter] = useState<NewsLetter>();
    const [title, setTitle] = useState('');

    // eslint-disable-next-line camelcase
    const columns = useMemo<MRT_ColumnDef<NewsLetterContent>[]>(
        () => [
            {
                accessorKey: 'title',
                header: 'Title',
                size: 80,
            },
            {
                accessorKey: 'published',
                header: 'Published',
                size: 80,
                Cell: ({ cell }) => (cell.getValue() ? 'Yes' : 'No'),
            },
        ],
        []
    );

    // eslint-disable-next-line camelcase
    const openDeleteConfirmModal = (row: MRT_Row<NewsLetterContent>) =>
        modals.openConfirmModal({
            title: 'Are you sure you want to delete this newsletter?',
            children: <Text>Are you sure you want to delete {row.original.title}? This action cannot be undone.</Text>,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                const { status } = await restDelete(`${NEWSLETTER_CONTENT}/${row.original.id}`, true);
                if (status === 200) {
                    notifications.show({ title: 'Newsletter Content', message: 'Newsletter Content Deleted.' });
                } else {
                    notifications.show({ title: 'Newsletter Content', message: 'There was an error removing the Newsletter Content', color: 'red' });
                }
            },
        });

    const handleSetNewsletter = (newsletter) => {
        setNewsletter(newsletter);
    };

    const editor = useEditor({
        extensions: [StarterKit, Underline, Link, Superscript, SubScript, Highlight, Color, TextAlign.configure({ types: ['heading', 'paragraph'] })],
        content: '',
        immediatelyRender: false,
    });

    const handleCreateNewsletter = async () => {
        if (!editor) {
            notifications.show({
                title: 'no content',
                message: 'enter content to save',
            });
            return;
        }

        const content = editor.getHTML();

        const body = {
            content,
            title,
        };

        const { status } = await restPost(NEWSLETTER_CONTENT_CREATION, body, true);
        if (status === 200) {
            notifications.show({ title: 'Newsletter', message: 'Newsletter saved.' });
        } else {
            notifications.show({ title: 'Newsletter', message: 'Newsletter creation failed', color: 'red' });
        }
    };

    const table = useMantineReactTable({
        columns,
        data: newsLetterContent,
        enableRowActions: true,
        enableEditing: false,
        // @ts-ignore
        getRowId: (row) => row.id,
        renderRowActions: ({ row, table }) => (
            <Flex gap='md'>
                <Tooltip label='Publish'>
                    <ActionIcon onClick={() => handleSetNewsletter(row.original)} bg={theme.colors.customColor[2]}>
                        <IconNews />
                    </ActionIcon>
                </Tooltip>
                <Tooltip label='Preview'>
                    <ActionIcon onClick={() => handleSetNewsletter(row.original)} bg={theme.colors.customColor[2]}>
                        <IconSearch />
                    </ActionIcon>
                </Tooltip>
                {/* <Tooltip label='Edit'>
                    <ActionIcon onClick={() => handleSetNewsletter(row.original)} bg={theme.colors.customColor[2]}>
                        <IconEdit />
                    </ActionIcon>
                </Tooltip> */}
                <Tooltip label='Delete'>
                    <ActionIcon color='red' onClick={() => openDeleteConfirmModal(row)}>
                        <IconTrash />
                    </ActionIcon>
                </Tooltip>
            </Flex>
        ),
        mantineTableContainerProps: {
            style: {
                minHeight: '500px',
            },
        },
    });

    return {
        table,
        newsletter,
        setTitle,
        handleCreateNewsletter,
        editor,
    };
};

export default useNewsletter;
