import { CHECKOUT } from '@/constants/apiRoutes';
import { formatDate } from '@/constants/applicationTypes';
import useRest from '@/lib/hooks/useRest';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';

const useUpcomingEvents = (props) => {
    const { events, calendars } = props;
    const router = useRouter();
    const currentDate = new Date();
    const { restDelete } = useRest();
    const filteredEvents = calendars.filter((event) => new Date(event.date) >= currentDate);
    const eventsWithSignUps = filteredEvents.map((event) => {
        const usersWhoSignUp = events
            .filter((signUp) => signUp.signUp.calendarId === event.id)
            .map((signUp) => ({
                id: signUp.id,
                firstName: signUp.rsvp.firstName,
                lastName: signUp.rsvp.lastName,
                email: signUp.rsvp.email,
                phone: signUp.rsvp.phone,
                salesPersonFirstName: signUp?.signUp?.salesMember?.firstName || '',
                salesPersonLastName: signUp?.signUp?.salesMember?.lastName || '',
            }));

        return {
            eventId: event.id,
            formattedDate: formatDate(event.date, event.time),
            date: event.date,
            time: event.time,
            limit: event.limit,
            usersWhoSignUp,
        };
    });

    // @ts-ignore
    eventsWithSignUps.sort((a, b) => new Date(a.date) - new Date(b.date));

    const handleRemoveUser = async (user) => {
        const { status } = await restDelete(`${CHECKOUT}/${user.id}`, true);
        if (status === 200) {
            notifications.show({ title: 'User Removed', message: 'User has been removed from this date.' });
            router.reload();
        } else {
            notifications.show({ title: 'Error', message: 'There was an error removing the user', color: 'red' });
        }
    };

    const handleSelectAllEmails = async (data) => {
        const { usersWhoSignUp } = data;
        let emails = '';
        if (usersWhoSignUp?.length > 0) {
            for (const user of usersWhoSignUp) {
                emails += `${user.email}; `;
            }
        }
        await window.navigator.clipboard.writeText(emails);
    };

    return { eventsWithSignUps, handleSelectAllEmails, handleRemoveUser };
};

export default useUpcomingEvents;
