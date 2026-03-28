import type { AccordionProps } from '@mantine/core';


/** Dùng chung cho các lớp share (owner, viewer, inherited, resolved) để đồng nhất khoảng cách tiêu đề / nội dung với collapse. */
export const shareAccessAccordionStyles: NonNullable<AccordionProps['styles']> = {
	item: {
		border: 'none',
		backgroundColor: 'transparent',
	},
	control: {
		padding: 0,
		minHeight: 'unset',
	},
	label: {
		padding: 0,
	},
	chevron: {
		marginLeft: 'var(--mantine-spacing-xs)',
		width: '1rem',
		height: '1rem',
	},
	panel: {
		padding: 0,
	},
	content: {
		padding: 0,
	},
};
