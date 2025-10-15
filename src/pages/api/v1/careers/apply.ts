import { baseResponse, errorResponse } from '../../../../lib/baseResponse';
import logger from '../../../../lib/logger';
import prisma from '../../../../lib/prisma';

const api = async (req, res) => {
    logger.defaultMeta.service = 'apply';
    try {
        const { body } = req;
        switch (req.method) {
            case 'POST': {
                try {
                    logger.info(`Saving application`);
                    const application = await prisma.applicants.create({
                        data: body,
                    });
                    logger.info('Created the application');
                    res.status(200).json(baseResponse('application Created', { application }));
                } catch (e) {
                    logger.error('Error creating application');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error creating application'));
                }
                break;
            }

            case 'GET': {
                try {
                    logger.info('Fetching applications');
                    const applications = await prisma.applicants.findMany({
                        where: { deleted: false },
                    });

                    logger.info(`Fetched ${applications.length} applications`);
                    res.status(200).json(baseResponse('Applications fetched successfully', { applications }));
                } catch (e) {
                    logger.error('Error fetching applications');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error fetching applications'));
                }
                break;
            }

            case 'DELETE': {
                // Soft delete: set deleted = true
                try {
                    // Support ?id=... and body.id, and handle string[]
                    const queryId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
                    const rawId = queryId ?? body?.id;

                    if (rawId == null) {
                        return res.status(400).json(errorResponse('Missing "id" for deletion'));
                    }

                    // Ensure numeric ID (your Applicants.id is an Int in Prisma)
                    const idNum = Number(rawId);
                    if (!Number.isFinite(idNum)) {
                        return res.status(400).json(errorResponse('"id" must be a number'));
                    }

                    logger.info(`Soft-deleting application ${idNum}`);

                    const application = await prisma.applicants.delete({
                        where: { id: idNum }, // << narrowed to number, satisfies ApplicantsWhereUniqueInput
                    });

                    logger.info('Application soft-deleted');
                    res.status(200).json(baseResponse('Application deleted', { application }));
                } catch (e: any) {
                    logger.error('Error deleting application');
                    logger.error(e);

                    // Prisma P2025 = record not found
                    if (e?.code === 'P2025') {
                        return res.status(404).json(errorResponse('Application not found'));
                    }

                    res.status(500).json(errorResponse('Error deleting application'));
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
