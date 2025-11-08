// scripts/email-cron.ts (or wherever you run cron)
import prisma from '@/lib/prisma';
import cron from 'node-cron';
import nodemailer from 'nodemailer';

function addSeconds(d: Date, s: number) {
    return new Date(d.getTime() + s * 1000);
}
function nextFromWeekdays(from: Date, weekdays: number[], hour = from.getHours(), minute = from.getMinutes()) {
    const candidates = weekdays.map((dow) => {
        const base = new Date(from);
        base.setHours(hour, minute, 0, 0);
        let daysToAdd = (dow - base.getDay() + 7) % 7;
        if (daysToAdd === 0) daysToAdd = 7; // strictly future
        const out = new Date(base);
        out.setDate(base.getDate() + daysToAdd);
        return out;
    });
    candidates.sort((a, b) => a.getTime() - b.getTime());
    return candidates[0];
}

cron.schedule('* * * * *', async () => {
    // once per minute is plenty; your earlier code was every second
    const now = new Date();

    const jobs = await prisma.emailJobResult.findMany({
        where: { status: 'pending', runAt: { lte: now } },
        orderBy: { runAt: 'asc' },
        take: 100,
    });

    if (jobs.length === 0) return;

    for (const job of jobs) {
        // lock
        const locked = await prisma.emailJobResult.updateMany({
            where: { id: job.id, status: 'pending' },
            data: { status: 'processing' },
        });
        if (locked.count === 0) continue;

        try {
            const admin = await prisma.emailMarketingCredentials.findUnique({ where: { authId: job.authId } });
            if (!admin) throw new Error('No admin email credentials found');

            const user = await prisma.emailUser.findUnique({ where: { id: job.emailUserId } });
            if (!user) throw new Error('No user email found');

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                pool: true,
                auth: { user: admin.email, pass: admin.appPassword },
            });

            await transporter.sendMail({
                from: admin.email, // 1) FROM ReferralProducts.email
                to: user.email, //    TO EmailUser.email
                subject: job.subject,
                text: job.text ?? undefined,
                html: job.html ?? undefined,
            });

            // record history
            await prisma.emailSentHistory.create({
                data: {
                    subject: job.subject,
                    text: job.text,
                    html: job.html,
                    sentAt: new Date(),
                    status: 'sent',
                    messageId: null, // you can capture if nodemailer returns it
                    authId: job.authId,
                    emailUserId: job.emailUserId,
                    credentialsId: admin.id,
                    jobResultId: job.id,
                },
            });

            // Decide next step
            let nextStatus: 'sent' | 'pending' = 'sent';
            let nextRunAt: Date | null = null;

            // Rotation takes precedence
            if (job.rotationSpanSeconds && job.rotationSpanSeconds > 0) {
                nextStatus = 'pending';
                // if job.runAt is null (should not happen for due jobs), use now
                const base = job.runAt ? new Date(job.runAt) : now;
                nextRunAt = addSeconds(base, job.rotationSpanSeconds);
            }
            // Weekly specific days (BY_WEEKDAY)
            else if (Array.isArray(job.weekdays) && job.weekdays.length > 0 && job.repeated) {
                nextStatus = 'pending';
                const base = job.runAt ? new Date(job.runAt) : now;
                const hour = base.getHours();
                const minute = base.getMinutes();
                nextRunAt = nextFromWeekdays(base, job.weekdays, hour, minute);
            }
            // Simple interval repeat
            else if (job.repeated && job.timeInterval && job.timeInterval > 0) {
                nextStatus = 'pending';
                const base = job.runAt ? new Date(job.runAt) : now;
                nextRunAt = addSeconds(base, job.timeInterval);
            }

            await prisma.emailJobResult.update({
                where: { id: job.id },
                data: {
                    status: nextStatus,
                    runAt: nextRunAt ?? undefined,
                    updatedAt: new Date(),
                },
            });
        } catch (err) {
            const admin = await prisma.emailMarketingCredentials.findUnique({ where: { authId: job.authId } });
            if (!admin) throw new Error('No admin email credentials found');
            // put it back to pending to retry later (you can add a retry counter/backoff here)
            await prisma.emailJobResult.update({
                where: { id: job.id },
                data: { status: 'pending', updatedAt: new Date() },
            });
            await prisma.emailSentHistory.create({
                data: {
                    subject: job.subject,
                    text: job.text,
                    html: job.html,
                    status: 'failed',
                    errorMessage: String(err || 'Unknown error'),
                    authId: job.authId,
                    emailUserId: job.emailUserId,
                    credentialsId: admin.id || null,
                    jobResultId: job.id,
                },
            });

            console.error('Email job failed', job.id, err);
        }
    }
});
