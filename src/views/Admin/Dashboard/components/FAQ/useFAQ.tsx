import { FAQ } from '@/constants/apiRoutes';
import { useBoolean } from '@/lib/hooks/useBoolean';
import useRest from '@/lib/hooks/useRest';
import { isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

const initialValues = {
    title: '',
    text: '',
};

const validate = {
    title: isNotEmpty(),
    text: isNotEmpty(),
};

const useFAQ = (props) => {
    const { faqs } = props;
    const { restPost, restDelete } = useRest();
    const form = useForm({ initialValues, validate });
    const { getInputProps, onSubmit } = form;
    const [accordionOpened, setAccordionOpened] = useState<string | null>(null);
    const [showFAQDelete, showFAQDeleteHandlers] = useBoolean(false);
    const [displayFAQs, setDisplayFAQs] = useState(faqs);

    const handleDeleteFAQ = async (e, id) => {
        e.stopPropagation();
        const { status } = await restDelete(`${FAQ}/${id}`, true);
        if (status === 200) {
            notifications.show({ title: 'FAQ Deleted', message: 'FAQ Removed Successfully' });
            setDisplayFAQs((prevFAQs) => prevFAQs.filter((faq) => faq.id !== id));
        }
    };

    const handleCreateFAQ = async (values) => {
        const { status, data } = await restPost(FAQ, values, true);
        if (status === 200) {
            setDisplayFAQs((prevFAQs) => [...prevFAQs, data.data.faq]);
            form.setValues({
                title: '',
                text: '',
            });
        } else {
            notifications.show({ title: 'Error', color: 'red', message: 'There was an error. ' });
        }
    };

    const handleIconClick = (e) => {
        e.stopPropagation();
        showFAQDeleteHandlers.setTrue();
    };

    const handleCancelClick = (e) => {
        e.stopPropagation();
        showFAQDeleteHandlers.setFalse();
    };

    const handleAccordionChange = (value: string | null) => {
        setAccordionOpened(value === accordionOpened ? null : value);
        showFAQDeleteHandlers.setFalse();
    };

    return {
        getInputProps,
        faqs,
        handleCreateFAQ,
        onSubmit,
        handleDeleteFAQ,
        handleAccordionChange,
        handleCancelClick,
        handleIconClick,
        showFAQDelete,
        accordionOpened,
        displayFAQs,
    };
};

export default useFAQ;
