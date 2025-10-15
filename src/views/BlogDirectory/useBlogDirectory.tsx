import { useState } from 'react';

type Props = {
    blogPosts: any;
};

const useBlogDirectory = ({ blogPosts }: Props) => {
    const featuredBlog = blogPosts.find((item) => item.featured === true);
    const [filteredBlogPosts, setFilteredBlogPosts] = useState(blogPosts);

    const filterBlogPosts = (category) => {
        const filteredItems = blogPosts.filter((item) => item.category === category);
        setFilteredBlogPosts(filteredItems);
    };

    return {
        filteredBlogPosts,
        filterBlogPosts,
        featuredBlog,
    };
};

export default useBlogDirectory;
