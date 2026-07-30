import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


const ITEMS: MenuItem[] = [
	{ labelKey: 'nikki.drive.menu.overview', link: '/overview' },
	{ labelKey: 'nikki.drive.menu.my-files', link: '/management/my-files' },
	{ labelKey: 'nikki.drive.menu.trash', link: '/management/trash' },
];

export function buildDriveMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'common', items: ITEMS };
}
