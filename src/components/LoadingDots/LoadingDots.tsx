import { Image } from '@mantine/core';

const LoadingDots = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Image src={'/loadingDots.gif'} w={100} h={100} alt={'loading dots'} />
        </div>
    );
};

export { LoadingDots };
