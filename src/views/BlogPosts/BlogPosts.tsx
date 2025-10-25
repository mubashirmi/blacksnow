'use client';

import { Button, Container, Group, Modal, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import DOMPurify from 'isomorphic-dompurify';
import { useState } from 'react';

const BlogPosts = () => {
    const theme = useMantineTheme();
    const [showShareModal, setShowShareModal] = useState(false);

    // Dummy data
    const dummyContent = {
        title: 'Top 5 Stock Market Trends to Watch in 2025',
        postContent: `
      <h2>Introduction</h2>
      <p>The stock market in 2025 is poised for significant shifts. This article explores key trends to watch.</p>
      <h3>1. Rise of AI-Driven Investing</h3>
      <p>Artificial intelligence is transforming how investors analyze markets, with algorithms predicting trends.</p>
      <h3>2. Sustainable Investing</h3>
      <p>ESG (Environmental, Social, Governance) stocks are gaining traction as investors prioritize sustainability.</p>
    `,
        category: 'Finance',
    };
    const dummyBaseUrl = 'https://example.com/blog/stock-trends-2025';

    const copyToClipboard = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(`Hello everyone! Check out this blogpost on stocks: ${dummyBaseUrl}`);
            notifications.show({ title: 'Copy', message: 'Text copied! Paste on your favorite platform to share.' });
        } else {
            notifications.show({ title: 'Copy', message: 'Copy failed, please try again.', color: 'red' });
        }
    };

    return (
        <Container fluid py={100}>
            <Container>
                <Title>{dummyContent.title}</Title>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dummyContent.postContent) }} />
                <Button onClick={() => setShowShareModal(true)} bg={theme.colors.customColor[2]} w={150}>
                    Share
                </Button>
                <Modal opened={showShareModal} onClose={() => setShowShareModal(false)} withCloseButton={false}>
                    <Stack>
                        <Text ta={'center'}>Hello everyone! Check out this blogpost on stocks: {dummyBaseUrl}</Text>
                        <Group justify={'center'}>
                            <Button onClick={copyToClipboard} bg={theme.colors.customColor[2]} w={150}>
                                Copy Text
                            </Button>
                            <Button onClick={() => setShowShareModal(false)} bg={theme.colors.customColor[2]} w={150}>
                                Close
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </Container>
        </Container>
    );
};

export { BlogPosts };
