import { Container, Stack, Text, Title } from '@mantine/core';

type Props = {
    props: any;
};

const Bulk = ({ props }: Props) => {
    return (
        <Container fluid>
            <Title mb={40} ta={'center'}>
                Bulk
            </Title>
            <Stack justify={'center'}>
                <Text>COMING SOON</Text>
            </Stack>
        </Container>
    );
};

export { Bulk };
