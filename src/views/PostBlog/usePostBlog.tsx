import { BLOG, GENERATE_IMAGE_URL } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link } from '@mantine/tiptap';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import SubScript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const usePostBlog = () => {
    const form = useForm();
    const { getInputProps, onSubmit, setFieldValue } = form;
    const { restPost } = useRest();

    const editor = useEditor({
        extensions: [StarterKit, Underline, Link, Superscript, SubScript, Highlight, Color, TextAlign.configure({ types: ['heading', 'paragraph'] })],
        content: '',
        immediatelyRender: false,
    });

    const handleSubmit = async (values) => {
        if (!editor) {
            notifications.show({
                title: 'no content',
                message: 'enter content to save',
            });
            return;
        }

        const postContent = editor.getHTML();

        let headerImageUrl = '';

        if (values.headerImage) {
            const { name, type } = values.headerImage;
            const objectKey = `public/blogHeaders/${Date.now()}-${name}`;

            const presignedUrlResponse = await restPost(GENERATE_IMAGE_URL, { type, objectKey }, true);

            if (presignedUrlResponse.status !== 200) {
                notifications.show({
                    title: 'Error',
                    message: 'Failed to get upload URL',
                    color: 'red',
                });
                return;
            }

            const { url, key } = await presignedUrlResponse.data;

            const uploadResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': type,
                },
                body: values.headerImage,
            });

            if (uploadResponse.status !== 200) {
                notifications.show({
                    title: 'Error',
                    message: 'Failed to upload image',
                    color: 'red',
                });
                return;
            }

            // Construct the image URL
            headerImageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
        }

        const body = {
            ...values,
            postContent,
            headerImageUrl,
        };

        const { status } = await restPost(BLOG, body, true);
        if (status === 200) {
            notifications.show({
                title: 'Post Saved',
                message: 'Post Saved',
            });
        }
    };

    return {
        getInputProps,
        editor,
        handleSubmit,
        onSubmit,
        setFieldValue,
    };
};

export default usePostBlog;
