import prisma from '@/lib/prisma';
import cron from 'node-cron';

cron.schedule('* * * * * *', async () => {
    // runs every second

    const findPendingMails = await prisma.emailJobResult.findMany({
        where: {
            status: 'pending',
            runAt: String(Date.now()),
        },
    });
    console.log(findPendingMails);
});
