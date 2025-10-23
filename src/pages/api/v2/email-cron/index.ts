import prisma from '@/lib/prisma';
import cron from 'node-cron';
import nodemailer from 'nodemailer';

cron.schedule('* * * * * *', async () => {
    // runs every second

    const findPendingMails = await prisma.emailJobResult.findMany({
        where: {
            status: 'pending',
            runAt: String(Date.now()),
        },
    });

    if (!findPendingMails) {
        return 'No job found';
    }
    findPendingMails.map(async (item) => {
        const adminMail = await prisma.emailMarketingCredentials.findFirst({
            where: { authId: item.authId },
        });

        if (!adminMail) {
            return 'No admin email credentials found';
        }

        const findUserEmailCredentails = await prisma.emailUser.findFirst({
            where: { id: item.emailUserId },
        });
        if (!findUserEmailCredentails) {
            return 'No user email credentials found';
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            pool: true, // keep the connection open for multiple emails
            auth: {
                user: adminMail.email,
                pass: adminMail.appPassword,
            },
        });

        await transporter.sendMail({
            // Gmail authentication must match the sender domain; use admin's email here
            from: adminMail.email,
            // Put the per-user email as the reply-to, to preserve your original intent
            replyTo: findUserEmailCredentails.email ?? undefined,
            to: findUserEmailCredentails.email,
            subject: item.subject,
            text: item.text ?? undefined,
        });

        if (item.repeated === false && item.timeInterval === 0) {
            await prisma.emailJobResult.update({
                where: {
                    id: item.id,
                },
                data: {
                    status: 'sent',
                },
            });
        } else if (item.repeated === true && (item.timeInterval !== 0 || item.timeInterval >= 0)) {
            await prisma.emailJobResult.update({
                where: { id: item.id },
                data: { timeInterval: { increment: Number(item.timeInterval) } },
            });
        }
    });
});
