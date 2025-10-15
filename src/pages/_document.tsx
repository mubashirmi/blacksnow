/* eslint-disable */
import { ColorSchemeScript } from '@mantine/core';
import { createGetInitialProps } from '@mantine/next';
import Document, { Head, Html, Main, NextScript } from 'next/document';
const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
    static getInitialProps = getInitialProps;

    render() {
        return (
            <Html lang='en'>
                <Head>
                    <script src='https://js.stripe.com/v3/'></script>
                    <link rel='preconnect' href='https://fonts.googleapis.com' />
                    {/*@ts-ignore*/}
                    <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin />
                    <link href='https://fonts.googleapis.com/css2?family=Radio+Canada+Big:ital,wght@0,400..700;1,400..700&display=swap' rel='stylesheet' />
                    <link
                        href='https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Radio+Canada+Big:ital,wght@0,400..700;1,400..700&display=swap'
                        rel='stylesheet'
                    />
                    <ColorSchemeScript defaultColorScheme='auto' />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
