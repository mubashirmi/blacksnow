import { NOTES } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { ActionIcon, Button, Flex, Stack, Text, Title, Tooltip, useMantineTheme } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications, showNotification } from '@mantine/notifications';
import { IconEdit, IconTrash } from '@tabler/icons-react';
// eslint-disable-next-line camelcase
import { MRT_ColumnDef, MRT_EditActionButtons, MRT_Row, useMantineReactTable } from 'mantine-react-table';
import { useMemo, useState } from 'react';

type Notes = {
    id: number;
    title: string;
    content: string;
};

const useNotes = (props: any) => {
    const theme = useMantineTheme();
    const { restDelete, restPost, restPut } = useRest();
    const { notes } = props;
    const [filteredNotes, setFilteredNotes] = useState(notes || []);

    // eslint-disable-next-line camelcase
    const columns = useMemo<MRT_ColumnDef<Notes>[]>(
        () => [
            {
                accessorKey: 'title',
                header: 'Title',
                enableEditing: true,
                size: 80,
            },
            {
                accessorKey: 'content',
                header: 'Content',
                enableEditing: true,
                size: 80,
            },
        ],
        []
    );

    const deleteNote = async (id) => {
        const { status } = await restDelete(`${NOTES}?id=${id}`);
        if (status === 200) {
            setFilteredNotes(filteredNotes.filter((item) => item.id !== id));
            showNotification({ title: 'Notes', message: 'Note has been removed.' });
        } else {
            notifications.show({ title: 'Notes', color: 'red', message: 'Error occurred, note not deleted.' });
        }
    };

    // eslint-disable-next-line camelcase
    const openDeleteConfirmModal = (row: MRT_Row<Notes>) =>
        modals.openConfirmModal({
            title: 'Are you sure you want to delete this note?',
            children: <Text>Are you sure you want to delete {row.original.title} note? This action cannot be undone.</Text>,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => deleteNote(row.original.id),
        });

    const handleCreateNote = async ({ values, exitCreatingMode }) => {
        const { status, data } = await restPost(NOTES, values, true);
        if (status === 200) {
            setFilteredNotes((prevFilteredNotes: any) => [...prevFilteredNotes, data?.data]);
            showNotification({ title: 'Notes', message: 'Note has been created.' });
        } else {
            showNotification({ title: 'Notes', message: 'Error creating note.', color: 'red' });
        }
    };

    const handleSaveNote = async ({ values, table }) => {
        const { status, data } = await restPut(NOTES, values, true);
        if (status === 200) {
            setFilteredNotes((prevNotes) => prevNotes.map((note) => (note.id === data?.data.id ? data?.data : note)));
            showNotification({ title: 'Notes', message: 'Note has been updated.' });
        } else {
            showNotification({ title: 'Notes', message: 'Error updating note.', color: 'red' });
        }
        table.setEditingRow(null);
    };

    const table = useMantineReactTable({
        columns,
        data: filteredNotes,
        enableRowActions: true,
        createDisplayMode: 'modal',
        editDisplayMode: 'modal',
        enableEditing: true,
        renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
            <Stack>
                <Title order={3} ta={'center'}>
                    Create New Note
                </Title>
                {internalEditComponents.filter((component: any) => {
                    const editableColumns = ['mrt-row-create_title', 'mrt-row-create_content'];
                    return editableColumns.includes(component.key);
                })}
                <Flex justify='flex-end' mt='xl'>
                    {/* eslint-disable-next-line camelcase */}
                    <MRT_EditActionButtons variant='text' table={table} row={row} />
                </Flex>
            </Stack>
        ),
        renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
            <Stack>
                <Title order={3} ta={'center'}>
                    Edit Note
                </Title>
                {internalEditComponents.filter((component: any) => {
                    const editableColumns = [`${row.id}_title`, `${row.id}_content`];
                    return editableColumns.includes(component.key);
                })}
                <Flex justify='flex-end' mt='xl'>
                    {/* eslint-disable-next-line camelcase */}
                    <MRT_EditActionButtons variant='text' table={table} row={row} />
                </Flex>
            </Stack>
        ),
        renderRowActions: ({ row, table }) => (
            <Flex gap='md'>
                <Tooltip label='Edit'>
                    <ActionIcon onClick={() => table.setEditingRow(row)} bg={theme.colors.customColor[2]}>
                        <IconEdit />
                    </ActionIcon>
                </Tooltip>
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
        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                onClick={() => {
                    table.setCreatingRow(true);
                }}
                bg={theme.colors.customColor[2]}
            >
                Create New Note
            </Button>
        ),
        onCreatingRowSave: handleCreateNote,
        onEditingRowSave: handleSaveNote,
    });

    return {
        table,
    };
};

export default useNotes;
