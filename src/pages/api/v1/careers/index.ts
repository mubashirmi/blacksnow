import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'careers';
    try {
        const { body } = req;
        const { id, CareerType } = req.query;
        const { title, description, location, salary, image, type } = req.body;
        switch (req.method) {
            case 'GET': {
                try {
                    logger.info('Fetching careers');

                    // If an 'id' is provided, get a specific career
                    if (id) {
                        const career = await prisma.careers.findUnique({
                            where: { id: Number(id) }, // Ensure 'id' is a number
                            include: {
                                Applicants: true,
                            },
                        });

                        if (!career) {
                            // Handle case where the career is not found
                            return res.status(404).json(errorResponse('Career not found'));
                        }

                        res.status(200).json(baseResponse('Career fetched successfully', { career }));
                    } else {
                        // If no 'id' is provided, fetch all careers
                        const careers = await prisma.careers.findMany({
                            where: {
                                type: CareerType,
                            },
                            include: {
                                _count: {
                                    select: { Applicants: true },
                                },
                            },
                        });
                        res.status(200).json(baseResponse('Careers fetched successfully', { careers }));
                    }
                } catch (e) {
                    logger.error('Error fetching careers');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error fetching careers'));
                }
                break;
            }
            case 'POST': {
                try {
                    logger.info(`Saving new career`);
                    const career = await prisma.careers.create({
                        data: {
                            title,
                            description,
                            location,
                            salary,
                            image,
                            type,
                        },
                    });
                    logger.info('Created the career');
                    // @ts-ignore
                    career.Applicants = [];
                    res.status(200).json(baseResponse('Career created successfully', { career }));
                } catch (e) {
                    logger.error('Error creating career');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error creating career'));
                }
                break;
            }
            case 'PUT': {
                try {
                    if (!id) {
                        return res.status(400).json(errorResponse('Career ID is required'));
                    }

                    const updatedCareer = await prisma.careers.update({
                        where: { id: Number(id) },
                        data: body,
                    });

                    res.status(200).json(baseResponse('Career updated successfully', { updatedCareer }));
                } catch (e) {
                    logger.error('Error updating career');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error updating career'));
                }
                break;
            }
            case 'DELETE': {
                try {
                    if (!id) {
                        return res.status(400).json(errorResponse('Career ID is required'));
                    }

                    const deletedCareer = await prisma.careers.delete({
                        where: { id: Number(id) },
                    });

                    res.status(200).json(baseResponse('Career deleted successfully', { deletedCareer }));
                } catch (e) {
                    logger.error('Error deleting career');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error deleting career'));
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
