import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'featured blog post update';
    try {
        const { body } = req;
        const { id } = body;

        let response = '';

        switch (req.method) {
            case 'POST': {
                try {
                    logger.info('Setting featured blog post');

                    const currentFeatured = await prisma.blogpost.findFirst({
                        where: { featured: true },
                    });

                    if (currentFeatured && currentFeatured.id === id) {
                        response = 'Already featured';
                    } else {
                        await prisma.$transaction(async (tx) => {
                            if (currentFeatured) {
                                await tx.blogpost.update({
                                    where: { id: currentFeatured.id },
                                    data: { featured: false },
                                });
                            }

                            await tx.blogpost.update({
                                where: { id },
                                data: { featured: true },
                            });
                        });
                    }

                    const allBlogPosts = await prisma.blogpost.findMany();

                    res.status(200).json(baseResponse(response, allBlogPosts));
                } catch (e) {
                    logger.error(`Error updating blog post to featured: ${e}`);
                    res.status(500).json(errorResponse('Error updating blogpost'));
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
