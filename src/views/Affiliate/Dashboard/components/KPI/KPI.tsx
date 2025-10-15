import { Container, Stack, Text, Title } from '@mantine/core';

type Props = {
    props: any;
};

const KPI = ({ props }: Props) => {
    return (
        <Container fluid>
            <Title mb={40} ta={'center'}>
                KPI
            </Title>
            <Stack justify={'center'}>
                <Text>COMING SOON</Text>
            </Stack>
        </Container>
    );
};

export { KPI };
