import { StorageImage } from '@aws-amplify/ui-react-storage';
import { Button, Card, Text, useMantineTheme } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useRouter } from 'next/router';

type Career = {
    image: string;
    id: number;
    title: string;
    description: string;
    salary: number; // Changed to number for salary formatting
    location: string;
};

type CareerProps = {
    career: Career;
};

const CareersCard = ({ career }: CareerProps) => {
    const theme = useMantineTheme();
    const router = useRouter();

    return (
        <Card
            padding='lg'
            radius='md'
            withBorder
            style={{
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -2px rgba(0,0,0,0.5)',
            }}
        >
            <Card.Section>
                {/* Use the correct image path here */}
                <StorageImage alt='career-image' path={career.image} width={'100%'} />
            </Card.Section>
            <Text fw={500} mt='md' mb='xs' c={theme.colors.customColor[1]}>
                {career.title}
            </Text>
            <Text size='sm' c='dimmed'>
                {/* Format salary using Intl.NumberFormat */}
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(career.salary)}
            </Text>
            <Text size='sm' c='dimmed'>
                {career.location}
            </Text>
            <Button
                bg={theme.colors.customColor[2]}
                c='white'
                mt='md'
                radius='md'
                rightSection={<IconArrowRight />}
                onClick={() => router.push(`careers/${career.id}`)}
            >
                Read more
            </Button>
        </Card>
    );
};

export { CareersCard };
