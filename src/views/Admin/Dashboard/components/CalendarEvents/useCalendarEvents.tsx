import { CALENDAR } from '@/constants/apiRoutes';
import { useBoolean } from '@/lib/hooks/useBoolean';
import useRest from '@/lib/hooks/useRest';
import { DatePickerProps } from '@mantine/dates';
import { isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

const initialValues = {
    date: '',
    time: '',
    limit: 0,
    id: 0,
};

const validate = {
    time: isNotEmpty(),
    limit: isNotEmpty(),
};

const useCalendarEvents = (props) => {
    const { calendars } = props;
    const [currentDisplayDate, setCurrentDisplayDate] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [dates, setDates] = useState([...calendars]);
    const [isCurrentEvent, isCurrentEventHandlers] = useBoolean(false);
    const form = useForm({ initialValues, validate });
    const { getInputProps, onSubmit } = form;
    const { restPost, restDelete } = useRest();

    const handleSelectDate = (value) => {
        const formattedDate = value.toISOString().split('T')[0];
        const selectedEvent = dates.find((event) => event.formattedDate === formattedDate);

        if (selectedEvent) {
            form.setValues({
                ...selectedEvent,
            });
            isCurrentEventHandlers.setTrue();
        } else {
            form.setValues({
                ...initialValues,
            });
            isCurrentEventHandlers.setFalse();
        }

        setCurrentDisplayDate(
            value.toLocaleDateString('en-us', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        );
        setCurrentDate(value);
    };

    const getDayProps: DatePickerProps['getDayProps'] = (date) => {
        const formattedDate = date.toISOString().split('T')[0];

        if (dates && dates.some((event) => event.formattedDate === formattedDate)) {
            return {
                style: {
                    backgroundColor: 'cyan',
                    color: 'var(--mantine-color-white)',
                },
            };
        }

        return {};
    };

    const handleCreateUpdateEvent = async (values) => {
        values.date = currentDate;
        const { data, status } = await restPost(CALENDAR, values, true);
        if (status === 200 && data?.data) {
            notifications.show({ title: 'Calendar Event', message: 'Updated Calendar Event' });
            setDates((prevDates) => {
                const existingIndex = prevDates.findIndex((event) => event.id === data.data.id);
                if (existingIndex !== -1) {
                    const updatedDates = [...prevDates];
                    updatedDates[existingIndex] = {
                        ...data.data,
                    };
                    return updatedDates;
                } else {
                    return [
                        ...prevDates,
                        {
                            ...data.data,
                        },
                    ];
                }
            });

            form.setValues({
                ...initialValues,
            });
        }
    };

    const handleRemoveEvent = async () => {
        const { id } = form.getValues();
        const { status } = await restDelete(`${CALENDAR}/${id}`, true);
        if (status === 200) {
            notifications.show({ title: 'Calendar Event', message: 'Removed Calendar Event' });
            setDates((prevDates) => prevDates.filter((event) => event.id !== id));
            form.setValues({
                ...initialValues,
            });
        }
    };

    return {
        currentDisplayDate,
        getDayProps,
        handleSelectDate,
        handleCreateUpdateEvent,
        getInputProps,
        onSubmit,
        isCurrentEvent,
        handleRemoveEvent,
    };
};

export default useCalendarEvents;
