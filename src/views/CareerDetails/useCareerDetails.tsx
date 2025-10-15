import { APPLY } from '@/constants/apiRoutes';
import { useBoolean } from '@/lib/hooks/useBoolean';
import useRest from '@/lib/hooks/useRest';
import { uploadData } from '@aws-amplify/storage';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

const initialValues = {
    phone: '',
    email: '',
    firstName: '',
    lastName: '',
    resume: '',
    firstNum: Math.floor(Math.random() * 10),
    secondNum: Math.floor(Math.random() * 10),
    captchaAnswer: '',
    termsAgreed: '',
};

const validate = {
    phone: isNotEmpty('Please enter a phone number'),
    email: isEmail('Please enter a valid email'),
    firstName: isNotEmpty('First name is required'),
    lastName: isNotEmpty('Last name is required'),
    termsAgreed: isNotEmpty(),
    captchaAnswer: (value: string, values: any) => {
        const correctAnswer = values.firstNum + values.secondNum;
        if (!value) {
            return 'Please solve the CAPTCHA';
        }
        if (parseInt(value) !== correctAnswer) {
            return 'Incorrect CAPTCHA answer. Please try again.';
        }
        return null;
    },
};

const useCareerDetails = (props: any) => {
    const { career } = props;
    const { restPost } = useRest();
    const [hasApplied, hasAppliedHandlers] = useBoolean(false);
    const { description, image, location, salary, title, id } = career;
    const form = useForm({ initialValues, validate });
    const { getInputProps, onSubmit, values, setFieldValue } = form;
    const [showApplyModal, showApplyModalHandlers] = useBoolean(false);

    const handleApply = async (values: any) => {
        delete values.confirmEmail;
        values.careersId = id;
        delete values.termsAgreed;
        delete values.firstNum;
        delete values.secondNum;
        delete values.captchaAnswer;
        const { status } = await restPost(APPLY, values, true);
        if (status === 200) {
            hasAppliedHandlers.setTrue();
            showApplyModalHandlers.setFalse();
            notifications.show({ title: 'Success', message: 'Thank you for applying, someone will be in touch with you soon. ' });
        } else {
            notifications.show({ title: 'Error', color: 'red', message: 'There was an error in the application process. ' });
        }
    };

    const handleUploadImage = async (file: any) => {
        const result = await uploadData({
            path: `public/careers/${id}/${file.name}`,
            data: file,
        }).result;
        if (result?.path) {
            setFieldValue('resume', result.path);
        }
    };

    const regenerateCaptcha = () => {
        const newFirstNum = Math.floor(Math.random() * 10);
        const newSecondNum = Math.floor(Math.random() * 10);
        setFieldValue('firstNum', newFirstNum);
        setFieldValue('secondNum', newSecondNum);
        setFieldValue('captchaAnswer', '');
    };

    return {
        handleUploadImage,
        getInputProps,
        onSubmit,
        handleApply,
        description,
        image,
        location,
        salary,
        title,
        values,
        hasApplied,
        showApplyModal,
        showApplyModalHandlers,
        formErrors: form.errors,
        firstNum: form.values.firstNum,
        secondNum: form.values.secondNum,
        regenerateCaptcha,
    };
};

export default useCareerDetails;
