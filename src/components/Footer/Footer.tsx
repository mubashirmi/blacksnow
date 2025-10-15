import { Anchor, Container, Grid, Group, Image, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandLinkedin, IconBrandTwitter } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import classes from './Footer.module.css';

const Footer = () => {
    // TODO: Add copyright either under logo or center on footer with current year
    const theme = useMantineTheme();
    const router = useRouter();
    return (
        <Container bg={theme.colors.customColor[0]} fluid mih={400} pt={'xl'}>
            <Container size='xl' pt={'xl'}>
                <Grid grow gutter={'xl'} columns={20}>
                    <Grid.Col span={5}>
                        <Stack>
                            <Group onClick={() => router.push('/')} gap={'xs'} style={{ cursor: 'pointer' }}>
                                <Stack>
                                    <Image src={'/logo_black.svg'} alt={'Logo'} fit={'contain'} w={200} />
                                </Stack>
                            </Group>
                            <Group mt={20} w={200} grow>
                                <IconBrandFacebook color={'black'} size={40} />
                                <IconBrandInstagram color={'black'} size={40} />
                                <IconBrandTwitter color={'black'} size={40} />
                                <IconBrandLinkedin color={'black'} size={40} />
                            </Group>
                            <Text>Copyright 2025</Text>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={4} offset={1}>
                        <Stack>
                            <Text c='black' fw={'bold'} fz={24}>
                                Company
                            </Text>
                            <Anchor c='black' href='/about' className={classes.link}>
                                Our Story
                            </Anchor>
                            <Anchor c='black' href='/careers' className={classes.link}>
                                Careers
                            </Anchor>
                            <Anchor c='black' href='/blogdirectory' className={classes.link}>
                                Blogs
                            </Anchor>
                            <Anchor c='black' href='/faq' className={classes.link}>
                                FAQ
                            </Anchor>
                            <Anchor c='black' href='/pricing' className={classes.link}>
                                Pricing
                            </Anchor>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={4} offset={1}>
                        <Stack>
                            <Text c={'black'} fw={'bold'} fz={24}>
                                Resources
                            </Text>
                            <Anchor c='black' href='/affiliate' className={classes.link}>
                                Affiliate Program
                            </Anchor>
                            <Anchor c='black' href='/rsvp' className={classes.link}>
                                Webinar RSVP
                            </Anchor>
                            <Anchor c='black' href='/advertising' className={classes.link}>
                                Digital Billboard
                            </Anchor>
                            <Anchor c='black' href='/emailMarketing' className={classes.link}>
                                Email/SMS Marketing
                            </Anchor>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={4} offset={1}>
                        <Stack>
                            <Text c={'black'} fw={'bold'} fz={24}>
                                Legal
                            </Text>
                            <Anchor c='black' href='/affiliateagreement' className={classes.link}>
                                Affiliate Agreement
                            </Anchor>
                            <Anchor c='black' href='/riskdisclosure' className={classes.link}>
                                Investment Risk Disclosure
                            </Anchor>
                            <Anchor c='black' href='/terms' className={classes.link}>
                                Terms & Conditions
                            </Anchor>
                            <Anchor c='black' href='/privacy' className={classes.link}>
                                Privacy Policy
                            </Anchor>
                            <Anchor c='black' href='/gdpr' className={classes.link}>
                                GDPR
                            </Anchor>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>
        </Container>
    );
};

export { Footer };
