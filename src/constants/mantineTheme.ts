import { Accordion, Card, List, MantineThemeOverride, Modal } from '@mantine/core';

const mantineTheme: MantineThemeOverride = {
    cursorType: 'pointer',
    fontFamily: `Radio Canada Big, sans-serif`,
    headings: {
        fontFamily: `Montserrat, sans-serif`,
    },
    colors: {
        customColor: ['#CDE7FF', '#696969', '#5A7D9A', '#F5F5F5', '#2E2E2E', '#F5F5F5', '#F5F5F5', '#F5F5F5', '#F5F5F5', '#000000'],
        customBlue: ['#ebf0ff', '#d3ddfd', '#a5b7f6', '#748fef', '#4c6cea', '#3257e7', '#244ce7', '#163ecd', '#08fcfc', '#08fcfc'],
        customGray: ['#f4f6fc', '#f4f6fc', '#f4f6fc', '#f4f6fc', '#f4f6fc', '#f4f6fc', '#f4f6fc', '#f4f6fc', '#f4f6fc', '#f4f6fc'],
    },
    components: {
        Accordion: Accordion.extend({
            defaultProps: {
                classNames: {
                    item: 'accordion-item',
                },
            },
            styles: {
                control: {
                    '&:hover': {
                        backgroundColor: '#CDE7FF',
                    },
                },
                item: {
                    backgroundColor: 'white',
                    boxShadow: '0 4px 16px rgba(76, 88, 132, 0.08)',
                },
            },
        }),
        List: List.extend({
            styles: {
                itemIcon: {
                    display: 'flex',
                    alignItems: 'center',
                },
            },
        }),
        Modal: Modal.extend({
            defaultProps: {
                centered: true,
            },
        }),
        Card: Card.extend({
            defaultProps: {
                classNames: {
                    root: 'card-root',
                },
            },
        }),
    },
};
export { mantineTheme };
