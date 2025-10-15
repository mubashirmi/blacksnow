import { Button, Grid, List, Paper, Pill, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconCircleCheckFilled } from '@tabler/icons-react';

type Props = {
    price: string;
    name: string;
    details: string[];
    openProductModal?: () => void;
    comingSoon?: boolean;
    priceYear?: string;
};

const Product = ({ price, name, details, openProductModal, comingSoon = false, priceYear }: Props) => {
    const theme = useMantineTheme();

    return (
        <Paper p={40} radius={20} shadow={'md'} styles={{ root: { border: `${theme.colors.customColor[0]} solid 5px` } }}>
            <Pill
                styles={{
                    root: {
                        position: 'absolute',
                        marginTop: '-60px',
                        backgroundColor: 'white',
                        border: `${theme.colors.customColor[0]} solid 5px`,
                        padding: '5px',
                        height: '40px',
                        width: '250px',
                        fontSize: '18px',
                        textAlign: 'center',
                        justifyContent: 'center',
                    },
                }}
            >
                {name}
            </Pill>
            <Grid columns={3}>
                <Grid.Col span={1}>
                    <Stack align={'flex-start'} w={'100%'} gap={33}>
                        {comingSoon ? (
                            <Text>Coming Soon!</Text>
                        ) : (
                            <>
                                <Button bg={theme.colors.customColor[2]} w={150} onClick={openProductModal}>
                                    Purchase
                                </Button>
                                <Text fz={16}>VAT & local taxes may apply</Text>
                            </>
                        )}
                    </Stack>
                </Grid.Col>
                <Grid.Col span={1} style={{ alignSelf: 'center' }}>
                    <Text fz={30} ta={'center'}>
                        {price}
                    </Text>
                    {priceYear && (
                        <Text fz={30} ta={'center'}>
                            {priceYear}
                        </Text>
                    )}
                </Grid.Col>
                <Grid.Col span={1}>
                    <List fz={14} c={theme.colors.customColor[1]} icon={<IconCircleCheckFilled style={{ color: 'black', width: '16px', height: '16px' }} />}>
                        {details.map((detail, index) => (
                            <List.Item key={`${detail}-${index}`}>{detail}</List.Item>
                        ))}
                    </List>
                </Grid.Col>
            </Grid>
        </Paper>
    );
};

export { Product };
