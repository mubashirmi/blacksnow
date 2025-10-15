import { baseResponse, errorResponse } from '@/lib/baseResponse';
import prisma from '@/lib/prisma';
import logger from '../../../../lib/logger';

const api = async (req, res) => {
    logger.defaultMeta.service = 'calendar'; // Set the default meta data for logging
    try {
        const { body } = req; // Get the request body
        const { id, ...data } = body; // Destructure the ID (for PUT) and other data

        switch (req.method) {
            // Handle GET request to fetch all future events
            case 'GET': {
                try {
                    logger.info('Getting calendar events');

                    const events = await prisma.calendar.findMany({
                        include: {
                            userBroughtProduct: true,
                        },
                    });
                    // keep only events that still have room
                    res.status(200).json(baseResponse('Calendar Events', events));
                } catch (e) {
                    logger.error(`Error getting calendar events: ${e}`);
                    res.status(500).json(errorResponse('Error getting calendar events'));
                }
                break;
            }

            // Handle POST request to create a new calendar event
            case 'POST': {
                try {
                    logger.info('Creating a new calendar event');

                    // If formattedDate exists, delete it as it's not meant to be stored in the database
                    if (data.formattedDate) {
                        delete data.formattedDate;
                    }

                    // Check if the "date" field is in the format "YYYY-MM-DD"
                    if (data.date && !data.date.includes('T')) {
                        // Add the time portion "T00:00:00.000Z" to the date to make it a valid DateTime
                        data.date = `${data.date}T00:00:00.000Z`;
                    }

                    // Create a new event in the database using the provided data
                    const result = await prisma.calendar.create({
                        data, // Create event using the provided data
                        select: {
                            date: true,
                            time: true,
                            limit: true,
                            id: true,
                        },
                    });

                    // Format the newly created event's date for the response (without time)
                    const calendarsWithFormattedDate = {
                        ...result,
                        formattedDate: new Date(result.date).toISOString().split('T')[0], // Format date as YYYY-MM-DD
                    };

                    // Log and send the response
                    logger.info('Created a new calendar event');
                    res.status(201).json(baseResponse('Calendar Created', calendarsWithFormattedDate));
                } catch (e) {
                    logger.error('Error creating calendar event');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error creating calendar event'));
                }
                break;
            }

            // Handle PUT request to update an existing calendar event
            case 'PUT': {
                try {
                    logger.info('Updating calendar event');

                    // Ensure that an ID is provided for updating an existing event
                    if (!id) {
                        return res.status(400).json(errorResponse('ID is required for updating the calendar event'));
                    }

                    // Handle the date format: If the date doesn't include time, add "T00:00:00.000Z"
                    if (data.date && !data.date.includes('T')) {
                        // Append the time portion to the date
                        data.date = `${data.date}T00:00:00.000Z`;
                    }

                    // Remove formattedDate before sending data to the database (it should not be saved in the database)
                    if (data.formattedDate) {
                        delete data.formattedDate;
                    }

                    // Update the calendar event by its ID
                    const result = await prisma.calendar.update({
                        where: { id }, // Use the ID to find the existing event
                        data, // Update event details with the new data
                        select: {
                            date: true,
                            time: true,
                            limit: true,
                            id: true,
                        },
                    });

                    // Format the updated event's date for the response (without time)
                    const calendarsWithFormattedDate = {
                        ...result,
                        formattedDate: new Date(result.date).toISOString().split('T')[0], // Format the date as YYYY-MM-DD
                    };

                    // Log and send the response
                    logger.info('Updated calendar event');
                    res.status(200).json(baseResponse('Calendar Updated', calendarsWithFormattedDate));
                } catch (e) {
                    logger.error('Error updating calendar event');
                    logger.error(e);
                    res.status(500).json(errorResponse('Error updating calendar event'));
                }
                break;
            }

            default:
                res.status(404).end(); // If the method is not recognized, return a 404
        }
    } catch (e) {
        // Handle any unexpected errors
        res.status(500).json({ e });
    }
};

export default api;
