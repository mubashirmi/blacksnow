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

        auth: { user: email, pass: appPassword },
    });
    transporters.set(key, t);
    return t;
}

const SCHEDULE = '0 * * * * *';

const task = cron.schedule(
    SCHEDULE,
    async () => {
        const now = new Date();
        console.log('[email-cron] tick', now.toISOString());

        // 1) pick due jobs
        const userBillings = await prisma.checkout.findMany({
            where: {
                deleted: false,
                cancelSubscripton: false,
                paid: true,
            },
        });

        if (userBillings.length === 0) return;

        for (const job of userBillings) {
            // 2) lock job to avoid double-send

            const locked = await prisma.emailJobResult.updateMany({
                where: { id: job.id, status: 'pending' },
                data: { status: 'processing' },
            });
            if (locked.count === 0) continue; // someone else took it
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
