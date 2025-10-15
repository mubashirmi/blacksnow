import { MANTINE_COLORS } from '@mantine/styles';

const useAnalytics = (props) => {
    const { users } = props;

    const getRandomColor = () => {
        const randomColorIndex = Math.floor(Math.random() * MANTINE_COLORS.length);
        const randomShade = Math.floor(Math.random() * 10);
        return `${MANTINE_COLORS[randomColorIndex]}.${randomShade}`;
    };
    //
    const transformedUsers = users.map((user) => ({
        name: `${user.firstName} ${user.lastName}`,
        role: `${user.role.name}`,
        color: getRandomColor(),
    }));
    //
    // const uniqueDates = Array.from(new Set(events.map((event) => event.signUp.calendar.date)));
    // const eventCountsByDate = uniqueDates.reduce((acc, date) => {
    //     const formattedDate = formatDate(date, events.find((event) => event.signUp.calendar.date === date).signUp.calendar.time);
    //     // @ts-ignore
    //     acc[formattedDate] = { date: formattedDate };
    //     users.forEach((user) => {
    //         const userName = `${user.firstName} ${user.lastName}`;
    //         // @ts-ignore
    //         acc[formattedDate][userName] = 0;
    //     });
    //     return acc;
    // }, {});
    //
    // events.forEach((event) => {
    //     const date = formatDate(event.signUp.calendar.date, event.signUp.calendar.time);
    //     const userName = `${event.signUp.salesMember.firstName} ${event.signUp.salesMember.lastName}`;
    //     // @ts-ignore
    //     if (eventCountsByDate[date][userName] !== undefined) {
    //         // @ts-ignore
    //         eventCountsByDate[date][userName] += 1;
    //     }
    // });

    // @ts-ignore
    const totalRSVPCount: any[] = [];
    const totalRSVPEarnings = [];

    const totalNewsletter = [];
    const newsLetterEarnings = [];

    const monthlyBillboardCount = [];

    const totalSalesTeamCount = [];
    const totalSalesTeamEarnings = [];

    const totalAffiliateCount = [];
    const totalAffiliateEarnings = [];

    const totalEarnings = [];
    const websiteTraffic = [];

    return {
        totalRSVPCount,
        totalRSVPEarnings,
        totalNewsletter,
        newsLetterEarnings,
        monthlyBillboardCount,
        totalSalesTeamCount,
        totalSalesTeamEarnings,
        totalEarnings,
        websiteTraffic,
        totalAffiliateCount,
        totalAffiliateEarnings,
        transformedUsers,
    };
};

export default useAnalytics;
