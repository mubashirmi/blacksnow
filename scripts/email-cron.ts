// scripts/email-cron.ts
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Optional: cache one transporter per admin email
const transporters = new Map<string, nodemailer.Transporter>();

function getTransporter(email: string, appPassword: string) {
    const key = email;
    if (transporters.has(key)) return transporters.get(key)!;
    const t = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        pool: true,
        // tune pooling to your volume limits
        maxConnections: 2,
        maxMessages: 50,
        auth: { user: email, pass: appPassword },
    });
    transporters.set(key, t);
    return t;
}

// NOTE: "*/1 * * * * *" = every second. If second-level isn’t required,
// prefer "* * * * *" (every minute) to avoid rate limits.
const SCHEDULE = '0 * * * * *';

const task = cron.schedule(
    SCHEDULE,
    async () => {
        const now = new Date();
        console.log('[email-cron] tick', now.toISOString());

        // 1) pick due jobs
        const jobs = await prisma.emailJobResult.findMany({
            where: {
                status: 'pending',
                runAt: { lte: now },
            },
            orderBy: { runAt: 'asc' },
            take: 100,
        });

        if (jobs.length === 0) return;

        for (const job of jobs) {
            // 2) lock job to avoid double-send
            const locked = await prisma.emailJobResult.updateMany({
                where: { id: job.id, status: 'pending' },
                data: { status: 'processing' },
            });
            if (locked.count === 0) continue; // someone else took it

            try {
                const admin = await prisma.emailMarketingCredentials.findUnique({
                    where: { authId: job.authId },
                });
                if (!admin) throw new Error('No admin email credentials found');

                const user = await prisma.emailUser.findUnique({
                    where: { id: job.emailUserId },
                });
                if (!user?.email) throw new Error('No user email found');

                const transporter = getTransporter(admin.email, admin.appPassword);

                await transporter.sendMail({
                    from: admin.email,
                    replyTo: user.email ?? undefined,
                    to: user.email,
                    subject: job.subject,
                    text: job.text ?? '',
                });

                // 3) finalize or reschedule
                if (job.repeated && job.timeInterval && job.timeInterval > 0) {
                    const nextRunAt = new Date(now.getTime() + job.timeInterval * 1000);
                    await prisma.emailJobResult.update({
                        where: { id: job.id },
                        data: { status: 'pending', runAt: nextRunAt },
                    });
                } else {
                    await prisma.emailJobResult.update({
                        where: { id: job.id },
                        data: { status: 'sent' },
                    });
                }
            } catch (err) {
                // mark failures (you might want to increment a retry counter)
                await prisma.emailJobResult.update({
                    where: { id: job.id },
                    data: { status: 'pending' },
                });
                console.error('[email-cron] Email job failed', job.id, err);
            }
        }
    },
    {
        timezone: 'Asia/Karachi', // your TZ
    }
);

// start immediately
task.start();

async function shutdown() {
    console.log('[email-cron] shutting down...');
    task.stop();
    for (const t of transporters.values()) {
        try {
            await t.close();
        } catch {}
    }
    await prisma.$disconnect();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
