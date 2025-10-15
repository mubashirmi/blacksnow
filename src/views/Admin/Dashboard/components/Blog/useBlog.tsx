import { BLOG, FEATURED_BLOG } from '@/constants/apiRoutes';
import useRest from '@/lib/hooks/useRest';
import { Anchor, Box, Button, Image, Text, useMantineTheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
// eslint-disable-next-line camelcase
import { MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { useMemo, useState } from 'react';

type blogPosts = {
    id: number;
    title: string;
    slug: string;
    category: string;
    headerImage: string;
    featured: boolean;
};

const useBlog = (props: any) => {
    const theme = useMantineTheme();
    const { restDelete, restPost } = useRest();
    const { blogPosts } = props;
    const [filteredBlogPosts, setFilteredBlogPosts] = useState(blogPosts);

    const deleteBlog = async (id) => {
        const { status } = await restDelete(`${BLOG}?id=${id}`);
        if (status === 200) {
            setFilteredBlogPosts(filteredBlogPosts.filter((item) => item.id !== id));
        } else {
            notifications.show({ title: 'Blog', color: 'red', message: 'Error occurred, blog not deleted.' });
        }
    };

    const featuredBlog = async (id) => {
        const { status, data } = await restPost(FEATURED_BLOG, { id }, true);
        if (status === 200) {
            if (data.message === 'Already featured') {
                notifications.show({ title: 'Blog', message: 'The selected blog post is already featured.' });
            } else {
                setFilteredBlogPosts(data.data);
            }
        } else {
            notifications.show({ title: 'Blog', color: 'red', message: 'Error occurred, blog not updated to featured.' });
        }
    };

    // eslint-disable-next-line camelcase
    const columns = useMemo<MRT_ColumnDef<blogPosts>[]>(
        () => [
            {
                accessorKey: 'title',
                header: 'Title',
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'slug',
                header: 'Link to Blog',
                // eslint-disable-next-line react/prop-types
                Cell: ({ row }) => (
                    // eslint-disable-next-line react/prop-types
                    <Anchor href={`/blogposts/${row.original.slug}`} underline={'hover'} target={'_blank'}>
                        {/* eslint-disable-next-line react/prop-types */}
                        Blog Link
                    </Anchor>
                ),
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'category',
                header: 'Category',
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'featured',
                header: 'Featured',
                // eslint-disable-next-line react/prop-types
                Cell: ({ row }) => <Text>{row.original.featured ? 'Featured' : ''}</Text>,
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'headerImage',
                header: 'Header Image',
                columnDefType: 'display',
                // eslint-disable-next-line react/prop-types
                Cell: ({ row }) => <Image src={row.original.headerImage} h={50} w={50} alt={'header Image'} />,
                enableEditing: false,
                size: 80,
            },
        ],
        []
    );

    const table = useMantineReactTable({
        columns,
        data: filteredBlogPosts,
        enableRowActions: true,
        renderRowActions: ({ row }) => (
            <Box style={{ display: 'flex', gap: '16px' }}>
                <Button onClick={() => deleteBlog(row.original.id)} bg={'red'}>
                    Delete Blog
                </Button>
                <Button onClick={() => featuredBlog(row.original.id)} bg={theme.colors.customColor[2]}>
                    Set as Featured
                </Button>
            </Box>
        ),
    });

    return {
        table,
    };
};

export default useBlog;
