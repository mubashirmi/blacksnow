export const SECTION_GAP = 150;

export const formatDate = (dateString, timeString) => {
    const date = new Date(dateString);
    const time = timeString.split(':');
    date.setHours(time[0], time[1]);

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).format(date);
};

export const ROLES = [
    {
        name: 'Admin',
    },
    {
        name: 'Sales',
    },
    {
        name: 'Affiliate',
    },
    {
        name: 'Digital Billboard',
    },
];

export const ROLE_DROPDOWN_DATA = ROLES.map((role, index) => ({
    label: role.name,
    value: (index + 1).toString(),
}));

export const getRoleLabel = (value) => {
    const role = ROLE_DROPDOWN_DATA.find((role) => role.value === value);
    return role ? role.label : 'Unknown';
};
