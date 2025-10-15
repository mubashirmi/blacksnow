import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import DOMPurify from 'isomorphic-dompurify';
import slugify from 'slugify';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'blog post';
    try {
        const { body, query } = req;
        let { title, postContent, category, headerImageUrl, userId } = body;
        const { id } = query;

        switch (req.method) {
            case 'POST': {
                try {
                    logger.info('Saving blog post');

                    postContent = DOMPurify.sanitize(postContent);

                    let slug = slugify(title, { lower: true, strict: true });
                    let uniqueSlug = slug;
                    let increment = 1;

                    while (await prisma.blogpost.findUnique({ where: { slug: uniqueSlug } })) {
                        uniqueSlug = `${slug}-${increment}`;
                        increment++;
                    }

                    slug = uniqueSlug;

                    const result = await prisma.blogpost.create({
                        data: {
                            title,
                            postContent,
                            category,
                            slug,
                            AuthId: userId,
                            headerImage: headerImageUrl,
                        },
                    });
                    res.status(200).json(baseResponse('', result));
                } catch (e) {
                    logger.error('Error creating form');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error creating form'));
                }
                break;
            }
            case 'GET': {
                try {
                    logger.info('Getting blog posts');
                    if (!id) {
                        const result = await prisma.blogpost.findMany();
                        res.status(200).json(baseResponse('blog ', result));
                    }
                    const result = await prisma.blogpost.findUnique({
                        where: {
                            id: Number(id),
                        },
                    });
                    res.status(200).json(baseResponse('blog posts', result));
                } catch (e) {
                    logger.error(`Error getting blog post: ${e}`);
                    res.status(500).json(errorResponse('Error getting blog'));
                }
                break;
            }
            case 'PUT': {
                try {
                    logger.info('Updating blog post');

                    // Fetch existing post to check if it exists
                    const existingPost = await prisma.blogpost.findUnique({
                        where: {
                            id: Number(id),
                        },
                    });

                    if (!existingPost) {
                        return res.status(404).json(errorResponse('Blog post not found'));
                    }

                    // If title is provided, generate a new slug
                    if (title) {
                        let slug = slugify(title, { lower: true, strict: true });
                        let uniqueSlug = slug;
                        let increment = 1;

                        while (await prisma.blogpost.findUnique({ where: { slug: uniqueSlug } })) {
                            uniqueSlug = `${slug}-${increment}`;
                            increment++;
                        }

                        slug = uniqueSlug;
                    }

                    postContent = DOMPurify.sanitize(postContent);

                    const result = await prisma.blogpost.update({
                        where: {
                            id: Number(id),
                        },
                        data: {
                            title: title || existingPost.title,
                            postContent: postContent || existingPost.postContent,
                            category: category || existingPost.category,
                            AuthId: userId || existingPost.AuthId,
                            // slug: title ? slug : existingPost.slug, // Only update slu   g if title changes
                            headerImage: headerImageUrl || existingPost.headerImage,
                        },
                    });

                    res.status(200).json(baseResponse('blog post updated', result));
                } catch (e) {
                    logger.error('Error updating blog post');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error updating blog post'));
                }
                break;
            }
            case 'DELETE': {
                try {
                    logger.info('Deleting blog post');

                    const result = await prisma.blogpost.delete({
                        where: {
                            id: Number(id),
                        },
                    });
                    res.status(200).json(baseResponse('blog deleted', result));
                } catch (e) {
                    logger.error(`Error deleting blog post: ${e}`);
                    res.status(500).json(errorResponse('Error deleting blog'));
                }
                break;
            }
            default:
                res.status(404).end();
        }
    } catch (e) {
        res.status(500).json({ e });
    }
};

export default api;
