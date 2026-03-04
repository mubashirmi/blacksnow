export const getNextBillingDate = (startDate, period) => {
    const p = String(period || '')
        .trim()
        .toLowerCase();

    const d = new Date(startDate);
    if (isNaN(d.getTime())) throw new Error('Invalid startDate');

    // use UTC to avoid DST issues
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth(); // 0-11
    const day = d.getUTCDate();
    const hh = d.getUTCHours();
    const mm = d.getUTCMinutes();
    const ss = d.getUTCSeconds();
    const ms = d.getUTCMilliseconds();

    const daysInMonthUTC = (yy, mm0) => new Date(Date.UTC(yy, mm0 + 1, 0)).getUTCDate();

    // eslint-disable-next-line
    let yy = y,
        mm0 = m;

    if (p === 'monthly' || p === 'montly' || p === 'month') {
        mm0 = m + 1;
        yy = y + Math.floor(mm0 / 12);
        mm0 = mm0 % 12;
    } else if (p === 'yearly' || p === 'annual' || p === 'year') {
        yy = y + 1;
    } else {
        throw new Error("period must be 'monthly' or 'yearly'");
    }

    const last = daysInMonthUTC(yy, mm0);
    const dd = Math.min(day, last);

    return new Date(Date.UTC(yy, mm0, dd, hh, mm, ss, ms));
};
