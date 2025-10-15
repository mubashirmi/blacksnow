import { USER } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { ActionIcon, Button, Flex, Menu, Stack, Text, Title, Tooltip, useMantineTheme } from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconEdit, IconTrash, IconUserCircle } from '@tabler/icons-react';
// eslint-disable-next-line camelcase
import { MRT_ColumnDef, MRT_EditActionButtons, MRT_Row, useMantineReactTable } from 'mantine-react-table';
import { useMemo, useState } from 'react';

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
const useUserManagement = (props: any) => {
    const theme = useMantineTheme();
    const { sales: currentUsers } = props;
    const { restPost, restPut, restDelete } = useRest();
    const [users, setUsers] = useState(currentUsers || []);
    const validateRequired = (value: string) => !!value.length;
    const validateEmail = (email: string) =>
        !!email.length &&
        email.toLowerCase().match(
            // eslint-disable-next-line max-len
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );

    function validateUser(user: User) {
        return {
            firstName: !validateRequired(user.firstName) ? 'First Name is Required' : '',
            lastName: !validateRequired(user.lastName) ? 'Last Name is Required' : '',
            roleId: !validateRequired(user.roleId) ? 'Role is Required' : '',
            email: !validateEmail(user.email) ? 'Incorrect Email Format' : '',
        };
    }

    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
    // eslint-disable-next-line camelcase
    const columns = useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'firstName',
                header: 'First Name',
                size: 80,
                mantineEditTextInputProps: {
                    type: 'email',
                    required: true,
                    error: validationErrors?.firstName,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            firstName: undefined,
                        }),
                },
            },
            {
                accessorKey: 'lastName',
                header: 'Last Name',
                size: 80,
                mantineEditTextInputProps: {
                    type: 'email',
                    required: true,
                    error: validationErrors?.lastName,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            lastName: undefined,
                        }),
                },
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 80,
                mantineEditTextInputProps: {
                    type: 'email',
                    required: true,
                    error: validationErrors?.email,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            email: undefined,
                        }),
                },
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [validationErrors]
    );

    const handleCreateUser = async ({ values, exitCreatingMode }) => {
        const newValidationErrors = validateUser(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        const { status, data } = await restPost(USER, values, true);
        if (status === 200) {
            setUsers((prevUsers) => [...prevUsers, data?.data]);
            showNotification({ title: 'User Management', message: 'User has been created.' });
        } else {
            showNotification({ title: 'User Management', message: 'There was an error creating the user, check for duplicate emails.', color: 'red' });
        }
        exitCreatingMode();
    };

    const handleSaveUser = async ({ values, table }) => {
        const newValidationErrors = validateUser(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        const { status } = await restPut(`${USER}/${values.id}`, values, true);
        if (status === 200) {
            showNotification({ title: 'User Management', message: 'User has been updated.' });
        } else {
            showNotification({ title: 'User Management', message: 'There was an error updating the user, check for duplicate emails.', color: 'red' });
        }
        table.setEditingRow(null);
    };

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
                    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== row.original.id));
                    showNotification({ title: 'User Management', message: 'User has been removed.' });
                } else {
                    showNotification({ title: 'User Management', message: 'There was an error removing the user', color: 'red' });
                }
            },
        });

    const table = useMantineReactTable({
        columns,
        data: users,
        enableRowActions: true,
        createDisplayMode: 'modal',
        editDisplayMode: 'modal',
        enableEditing: true,
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
        mantineTableContainerProps: {
            style: {
                minHeight: '500px',
            },
        },
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
        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                onClick={() => {
                    table.setCreatingRow(true);
                }}
                bg={theme.colors.customColor[2]}
            >
                Create New Sales
            </Button>
        ),
        renderRowActionMenuItems: () => (
            <>
                <Menu.Item leftSection={<IconUserCircle />}>Disable</Menu.Item>
            </>
        ),
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateUser,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveUser,
    });

    return {
        table,
    };
};

export default useUserManagement;
