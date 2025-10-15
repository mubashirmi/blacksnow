import { Container, Stack, Text, Title } from '@mantine/core';

type Props = {
    props: any;
};

const Editor = ({ props }: Props) => {
    return (
        <Container fluid>
            <Title mb={40} ta={'center'}>
                Editor
            </Title>
            <Stack justify={'center'}>
                <Text>COMING SOON</Text>
            </Stack>
        </Container>
    );
};

export { Editor };
