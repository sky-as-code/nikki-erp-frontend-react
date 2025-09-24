import type { TablerIcon } from '@tabler/icons-react';

export type NavItem = {
	label: string;

	/**
	 * Icon only appears for top-level items
	 */
	icon?: TablerIcon;

	/**
	 * Icon only appears for top-level items
	 */
	link?: string;

	/**
	 * Submenu links. If specified, `link` is ignored.
	 */
	items?: NavItem[];

	specialFeture?: '$$recent$$';
	specialFetureOpts?: any;
};
