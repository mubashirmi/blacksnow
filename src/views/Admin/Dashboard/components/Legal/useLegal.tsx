import { LEGAL } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { notifications } from '@mantine/notifications';
import { Link } from '@mantine/tiptap';
import { Editor } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import SubScript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

const useLegal = (props) => {
    const { restPut } = useRest();
    const [legalDocs, setLegalDocs] = useState(props.legalDocs || []);
    const [editors, setEditors] = useState<any[]>([]);

    const createEditor = (content: string) => {
        return new Editor({
            extensions: [StarterKit, Underline, Link, Superscript, SubScript, Highlight, Color, TextAlign.configure({ types: ['heading', 'paragraph'] })],
            content: content || '',
        });
    };

    useEffect(() => {
        const newEditors = legalDocs.map((doc) => {
            return createEditor(doc.content);
        });
        setEditors(newEditors);
    }, [legalDocs]);

    const handleSubmit = async (editor, id) => {
        if (!editor) {
            notifications.show({
                title: 'no content',
                message: 'enter content to save',
            });
            return;
        }

        const content = editor.getHTML();

        const body = {
            content,
            id,
        };

        const { status, data } = await restPut(LEGAL, body, true);
        if (status === 200) {
            setLegalDocs(data.data);
            notifications.show({
                title: 'Legal',
                message: 'Document updated',
            });
        }
    };

    return {
        legalDocs,
        handleSubmit,
        editors,
    };
};

export default useLegal;
