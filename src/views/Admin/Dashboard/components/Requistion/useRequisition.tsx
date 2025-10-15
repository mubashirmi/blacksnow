import { CAREERS, DELETE_APPLICANT } from '@/constants/apiRoutes';
import { useBoolean } from '@/lib/hooks/useBoolean';
import useRest from '@/lib/hooks/useRest';
import { getUrl, uploadData } from '@aws-amplify/storage';
import { isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

const initialValues = {
    title: '',
    description: '',
    salary: '',
    location: '',
    image: '',
};

const validate = {
    title: isNotEmpty(),
    description: isNotEmpty(),
    salary: isNotEmpty(),
    location: isNotEmpty(),
};

const useRequisition = (props) => {
    const { careers, consultations } = props;
    const { restPost, restDelete } = useRest();
    const [currentCareers, setCurrentCareers] = useState(careers);
    const form = useForm({ initialValues, validate });
    const { getInputProps, onSubmit } = form;
    const [showJobDelete, showJobDeleteHandlers] = useBoolean(false);
    const [showConsultationDelete, showConsultationDeleteHandlers] = useBoolean(false);
    const [accordionOpened, setAccordionOpened] = useState<string | null>(null);
    const [consultationAccordion, setConsultationAccordion] = useState<string | null>(null);

    const handleUploadImage = async (file) => {
        const result = await uploadData({
            path: `public/careers/${file.name}`,
            data: file,
        }).result;
        if (result?.path) {
            form.setValues({
                image: result.path,
            });
        }
    };

    const handleCreateJob = async (values) => {
        const { status, data } = await restPost(CAREERS, values, true);
        if (status === 200) {
            setCurrentCareers((prevCareers) => [...prevCareers, data.data.career]);
            form.setValues({
                title: '',
                description: '',
                salary: '',
                location: '',
                image: '',
            });
        } else {
            notifications.show({ title: 'Error', color: 'red', message: 'There was an error. ' });
        }
    };

    const handleDownloadResume = async (user) => {
        try {
            const getUrlResult = await getUrl({
                path: user.resume,
            });
            const link = document.createElement('a');
            // @ts-ignore
            link.href = getUrlResult.url;
            link.download = user.resume;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            notifications.show({ title: 'Error', color: 'red', message: 'There was an error downloading the resume.' });
        }
    };

    const handleRemoveJob = async (id) => {
        const { status } = await restDelete(`${CAREERS}/${id}`, true);
        if (status === 200) {
            notifications.show({ title: 'Career Deleted', message: 'Career Removed Successfully' });
            setCurrentCareers((prevJobs) => prevJobs.filter((event) => event.id !== id));
        }
    };

    const handleDeleteApplicant = async (id, careerId) => {
        const { status } = await restDelete(`${DELETE_APPLICANT}/${id}`, true);
        if (status === 200) {
            notifications.show({ title: 'Applicant Deleted', message: 'Applicant Removed Successfully' });
            setCurrentCareers((prevCareers) =>
                prevCareers.map((career) => {
                    if (career.id !== careerId) {
                        return career;
                    }
                    return {
                        ...career,
                        Applicants: career.Applicants.filter((applicant) => applicant.id !== id),
                    };
                })
            );
        }
    };

    const handleIconClick = (e) => {
        e.stopPropagation();
        showJobDeleteHandlers.setTrue();
    };

    const handleCancelClick = (e) => {
        e.stopPropagation();
        showJobDeleteHandlers.setFalse();
    };

    const handleRequestIconClick = (e) => {
        e.stopPropagation();
        showConsultationDeleteHandlers.setTrue();
    };

    const handleCancelRequestClick = (e) => {
        e.stopPropagation();
        showConsultationDeleteHandlers.setFalse();
    };

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        handleRemoveJob(id);
    };

    const handleDeleteRequestClick = (e, id) => {
        e.stopPropagation();
        // handleRemoveJob(id);
    };

    const handleAccordionChange = (value: string | null) => {
        setAccordionOpened(value === accordionOpened ? null : value);
        showJobDeleteHandlers.setFalse();
    };

    const handleConsultationAccordionChange = (value: string | null) => {
        setConsultationAccordion(value === consultationAccordion ? null : value);
        showConsultationDeleteHandlers.setFalse();
    };

    return {
        handleUploadImage,
        getInputProps,
        onSubmit,
        handleCreateJob,
        currentCareers,
        handleDownloadResume,
        consultations,
        handleRemoveJob,
        showJobDelete,
        showJobDeleteHandlers,
        accordionOpened,
        setAccordionOpened,
        handleIconClick,
        handleCancelClick,
        handleDeleteClick,
        handleAccordionChange,
        handleDeleteApplicant,
        showConsultationDelete,
        handleRequestIconClick,
        handleCancelRequestClick,
        handleDeleteRequestClick,
        handleConsultationAccordionChange,
        consultationAccordion,
    };
};

export default useRequisition;
