import { CALENDAR, RSVP, RSVP_STRIPE } from '@/constants/apiRoutes';
import { formatDate } from '@/constants/applicationTypes';
import useRest from '@/lib/hooks/useRest';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';

const initialValues = {
    phone: '',
    email: '',
    firstName: '',
    lastName: '',
    date: '',
    termsAgreed: false,
    privacyAgreed: false,
};

const validate = {
    email: isEmail(),
    phone: isNotEmpty(),
    firstName: isNotEmpty(),
    lastName: isNotEmpty(),
    date: isNotEmpty(),
    termsAgreed: isNotEmpty(),
    privacyAgreed: isNotEmpty(),
};

const useRSVPForm = () => {
    const { restGet, restPost } = useRest();
    const [showRSVPForm, setShowRSVPForm] = useState(false);
    const form = useForm({ initialValues, validate });
    const { getInputProps, onSubmit } = form;
    const [calendarDropdownOptions, setCalendarDropdownOptions] = useState<any[]>([]);

    const calendarQuery = async () => {
        const { status, data } = await restGet(CALENDAR, true);
        if (status === 200) {
            setCalendarDropdownOptions(data.data.map((item: any) => ({ value: item.id.toString(), label: formatDate(item.date, item.time) })));
        }
    };

    useEffect(() => {
        calendarQuery();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateEvent = async (values: any) => {
        values.affiliateId = 0;
        const { status, data } = await restPost(RSVP, values, true);
        if (status === 200) {
            const { data: stripeData } = await restPost(RSVP_STRIPE, data.data, true);
            if (stripeData?.data) {
                window.location.href = stripeData.data;
            }
        } else {
            notifications.show({ title: 'Error', color: 'red', message: 'There was an error signing you up for this session. ' });
        }
    };

    const handleShowRSVPForm = () => {
        setShowRSVPForm(true);
    };

    const handleCloseRSVPForm = () => {
        setShowRSVPForm(false);
    };

    return {
        showRSVPForm,
        getInputProps,
        onSubmit,
        calendarDropdownOptions,
        handleCreateEvent,
        handleCloseRSVPForm,
        handleShowRSVPForm,
    };
};

export default useRSVPForm;
