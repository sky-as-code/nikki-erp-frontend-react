import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys live in the `drive` namespace. The previous hook asked for
 * `nikki.drive.menu.*` in `common`, which does not exist there — every label came
 * from the i18next default-value argument, i.e. hardcoded English.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'menu_overview', link: '/overview' },
	{ labelKey: 'menu_my-files', link: '/management/my-files' },
	{ labelKey: 'menu_trash', link: '/management/trash' },
];

export function buildDriveMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'drive', items: ITEMS };
}
