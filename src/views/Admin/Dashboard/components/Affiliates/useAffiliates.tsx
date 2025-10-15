import { ActionIcon, Flex, Stack, Text, Title, Tooltip, useMantineTheme } from '@mantine/core';
// eslint-disable-next-line camelcase
import { USER } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash } from '@tabler/icons-react';
// eslint-disable-next-line camelcase
import { MRT_ColumnDef, MRT_EditActionButtons, MRT_Row, useMantineReactTable } from 'mantine-react-table';
import { useMemo } from 'react';

type User = {
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    phone: string;
    disabled: boolean;
    cognitoId: string;
    id: number;
};
const useAffiliates = (props: any) => {
    const { affiliates } = props;
    const { restDelete } = useRest();
    const theme = useMantineTheme();

    // eslint-disable-next-line camelcase
    const columns = useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'firstName',
                header: 'First Name',
                size: 80,
            },
            {
                accessorKey: 'lastName',
                header: 'Last Name',
                size: 80,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 80,
            },
            {
                accessorKey: 'pageHits',
                header: 'Page Hits',
                enableEditing: false,
                size: 50,
            },
            {
                accessorKey: 'rsvpCount',
                header: 'RSVP',
                enableEditing: false,
                size: 50,
            },
            {
                accessorKey: 'rsvpCount',
                header: 'Newsletter',
                enableEditing: false,
                size: 50,
            },
            {
                accessorKey: 'digitalBillboards',
                header: 'Digital Billboard',
                enableEditing: false,
                size: 50,
            },
            {
                accessorKey: 'digitalBillboards',
                header: 'Email/SMS',
                enableEditing: false,
                size: 50,
            },
        ],
        []
    );

    // eslint-disable-next-line camelcase
    const openDeleteConfirmModal = (row: MRT_Row<User>) =>
        modals.openConfirmModal({
            title: 'Are you sure you want to delete this user?',
            children: (
                <Text>
                    Are you sure you want to delete {row.original.firstName} {row.original.lastName}? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                const { status } = await restDelete(`${USER}/${row.original.id}`, true);
                if (status === 200) {
                    // setUsers((prevUsers) => prevUsers.filter((user) => user.id !== row.original.id));
                    // showNotification({ title: 'User Management', message: 'User has been removed.' });
                } else {
                    // showNotification({ title: 'User Management', message: 'There was an error removing the user', color: 'red' });
                }
            },
        });

    const table = useMantineReactTable({
        columns,
        data: affiliates,
        enableRowActions: true,
        enableEditing: false,
        // @ts-ignore
        getRowId: (row) => row.id,
        renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
            <Stack>
                <Title order={3} ta={'center'}>
                    Create New User
                </Title>
                {internalEditComponents.filter((component: any) => {
                    const editableColumns = ['mrt-row-create_firstName', 'mrt-row-create_lastName', 'mrt-row-create_email', 'mrt-row-create_roleId'];
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
                    Edit User
                </Title>
                {internalEditComponents.filter((component: any) => {
                    const editableColumns = [`${row.id}_firstName`, `${row.id}_lastName`, `${row.id}_email`, `${row.id}_roleId`];
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
    });

    return {
        table,
    };
};

export default useAffiliates;
