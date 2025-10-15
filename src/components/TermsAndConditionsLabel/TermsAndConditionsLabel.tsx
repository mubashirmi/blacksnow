import { Anchor, Text } from '@mantine/core';

const TermsAndConditionsLabel = () => {
    return (
        <Text fz={14}>
            I agree to the{' '}
            <Anchor fz={14} target='_blank' rel='noopener noreferrer' href='/terms'>
                Terms
            </Anchor>{' '}
            and the{' '}
            <Anchor fz={14} target='_blank' rel='noopener noreferrer' href='/privacy'>
                Privacy
            </Anchor>{' '}
            policies.
        </Text>
    );
};

export { TermsAndConditionsLabel };
