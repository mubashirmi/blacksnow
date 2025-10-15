import { ROLES } from '@/constants/applicationTypes';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const faqs = [
    {
        title: 'Which trading platforms are most insightful and easiest to learn?',
        text:
            'Fidelity, Robinhood, WeBull, Charles Schwab are some of the best trading apps available which allow sales of stocks and options. ' +
            'Every trading app has different features which make it harder or easier for overall utility. ',
    },
    {
        title: 'Which platform allows Paper-Trading?',
        text:
            'Webull Day-trading/Options Trading Simulator allows paper trading which helps you learn how to execute market orders, practice the ' +
            'timing, and submitting market orders. ',
    },
    {
        title: 'What’s the difference between line chart and candlestick chart?',
        text:
            'A Line Chart shows the price action over time by using a line. A candlestick chart is used to identify highs and lows, patterns, ' +
            'and supply and demand momentum within a specific timeframe.  ',
    },
    {
        title: 'How many day trades can I make in a 5 day trading period?',
        text:
            'Trading accounts above 25,000 have unlimited trades in a 5-day period. Accounts below 25,000 are only allowed 3 day trades per ' +
            'week or will be labeled as a pattern day trader. ',
    },
    {
        title: 'What are support and resistance levels?',
        text:
            'Support level is when the price regularly stops falling and bounces back up, while the resistance level is where the price ' +
            'normally stops rising and dips back down. The order book shows overall supply/demand for each price level. ',
    },
    {
        title: 'What is an order book?',
        text: 'A list of limit sell and limit buy orders placed by Investors organized by stock price.',
    },
    {
        title: 'How do I create a watchlist, set alerts and utilize a stock screener?',
        text:
            'A Watch List is a list you compile for stocks which are moving up or down based on the day, week or month criteria and by ' +
            'how much price movement occurred during the chosen timeframe. ',
    },
    {
        title: 'Which is a higher return on investment: stock trading or options trading?',
        text:
            'Stocks Trades can make good profit if you are ahead of the trend upward, and the price movement increases to a certain price ' +
            'level. Stock options allow traders to profit from stocks regardless if they make price movement upward or downward. ' +
            'If in the correct market with the right timing and correct option purchase; an ordinarily 5% stock increase or decrease could mean a ' +
            '100% return in options contract profits once sold.',
    },
    {
        title: 'How can I find the best stock option for buying calls and options?',
        text: 'Stock Screeners, press release sources and market research data. ',
    },
];

const load = async () => {
    try {
        await prisma.frequentQuestions.deleteMany();
        console.log('Deleted records in frequentQuestions table');
        await prisma.frequentQuestions.createMany({
            data: faqs,
        });
        console.log('Added frequentQuestions data');

        await prisma.role.deleteMany();
        console.log('Deleted records in role table');
        await prisma.role.createMany({
            data: ROLES,
        });
        console.log('Added role data');
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

load();
