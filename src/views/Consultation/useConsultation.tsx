import { CONSULTATION } from '@/constants/apiRoutes';
import { useBoolean } from '@/lib/hooks/useBoolean';
import useRest from '@/lib/hooks/useRest';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { useState } from 'react';

const initialValues = {
    email: '',
    name: '',
    companyName: '',
    title: '',
    location: '',
    numOfPositions: '',
    dateTime: '',
    phone: '',
    termsAgreed: false,
    privacyAgreed: false,
};

const validate = {
    email: isEmail(),
    name: isNotEmpty(),
    companyName: isNotEmpty(),
    title: isNotEmpty(),
    location: isNotEmpty(),
    numOfPositions: isNotEmpty(),
    dateTime: isNotEmpty(),
    phone: isNotEmpty(),
    termsAgreed: isNotEmpty(),
    privacyAgreed: isNotEmpty(),
};

const useConsultation = () => {
    const { restPost } = useRest();
    const [showConfirmation, handleShowConfirmation] = useBoolean(false);
    const form = useForm({ initialValues, validate });
    const { getInputProps, onSubmit } = form;
    const [dateTime, setDateTime] = useState(new Date());

    const handleAddConsultation = async (values: any) => {
        delete values.termsAgreed;
        delete values.privacyAgreed;
        const { status } = await restPost(CONSULTATION, values, true);
        if (status === 200) {
            handleShowConfirmation.setTrue();
        } else {
            notifications.show({
                title: 'Consultation',
                message: 'There was an error booking the consultation',
                color: 'red',
            });
        }
    };

    const handleDateChange = (date) => {
        setDateTime(date);
        form.setFieldValue('dateTime', date);
    };

    return {
        handleAddConsultation,
        getInputProps,
        onSubmit,
        showConfirmation,
        dateTime,
        handleDateChange,
    };
};

export default useConsultation;
