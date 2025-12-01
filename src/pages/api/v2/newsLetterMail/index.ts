import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer'; // Nodemailer to send emails

// Define the type of the result from sendEmail
interface SendEmailResult {
    success: boolean;
    email: string;
    error?: unknown; // Optional error field
}

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            // Fetch users with 'NewsLetter' role
            const policy = await prisma.auth.findMany({
                where: {
                    roles: {
                        has: 'NewsLetter',
                    },
                },
            });
            return policy
                ? res.status(200).json({ message: 'Newsletter data fetched', policy })
                : res.status(404).json({ message: 'Newsletter data not found' });
        } else if (method === 'POST') {
            const { users } = req.body;

            // Fetch users from the database based on provided IDs
            const newsletterUsers = await Promise.all(
                users.map(async ({ id }: { id: number }) => {
                    return await prisma.auth.findFirst({
                        where: {
                            id,
                            roles: {
                                has: 'NewsLetter',
                            },
                        },
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    });
                })
            );

            const validUsers = newsletterUsers.filter((user) => user !== null);

            if (validUsers.length === 0) {
                return res.status(404).json({ message: 'No valid users found for the provided IDs' });
            }

            // Logging the valid users
            console.log('Valid users to send emails to:', validUsers);

            // Setting up the Nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Using Gmail service instead of specifying host & port
                auth: {
                    user: 'malikmubashir.3175709877@gmail.com', // Replace with your email
                    pass: 'fhwd vueu fbnl agao', // Use an app password if 2FA is enabled on Gmail
                },
            });

            // Function to send email to each user
            const sendEmail = async (user, subject, text, html) => {
                try {
                    const mailOptions = {
                        from: 'malikmubashir.3175709877@gmail.com', // Replace with your email
                        to: user.email,
                        subject: subject,
                        text: text,
                        html: html,
                    };

                    const info = await transporter.sendMail(mailOptions);
                    console.log(`Email sent to ${user.email}. Message ID: ${info.messageId}`);
                    return { success: true, email: user.email };
                } catch (error) {
                    console.error(`Failed to send email to ${user.email}: `, error);
                    return { success: false, email: user.email, error };
                }
            };

            // Declare the array with the correct type
            const emailResults: SendEmailResult[] = [];

            // Sending emails to all valid users with specific content
            for (const { id, subject, text, html } of users) {
                const user = validUsers.find((user) => user.id === id);
                if (user && user.email) {
                    console.log(`Sending email to: ${user.email}`);
                    const result = await sendEmail(user, subject, text, html);
                    emailResults.push(result); // Now TypeScript knows the type
                }
            }

            // Check if all emails were successfully sent
            const failedEmails = emailResults.filter((result) => !result.success);
            if (failedEmails.length > 0) {
                return res.status(500).json({
                    message: 'Some emails failed to send',
                    failedEmails,
                });
            }

            return res.status(200).json({ message: 'Emails sent successfully to all users.' });
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error occurred during processing:', error);
        return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
}
