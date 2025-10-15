import { Anchor, Card, Image } from '@mantine/core';

type Props = {
    image?: any;
    title: string;
    link: string;
};

const BlogCard = ({ image, title, link }: Props) => {
    return (
        <Card>
            <Card.Section>
                <Image src={image} height={200} alt={'blog picture'} />
            </Card.Section>
            <Anchor href={link} c={'black'} mt={20}>
                {title}
            </Anchor>
        </Card>
    );
};

export { BlogCard };
