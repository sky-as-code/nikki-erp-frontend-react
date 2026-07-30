import { IAM_MODULE } from './constants';

import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Menu entries carry i18n keys, not labels: the contribution is registered from the
 * bundle's `init`, which runs outside React and possibly before the namespace loads.
 * The Shell resolves them against `translationNs` at render time.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'menu.overview', link: '/overview' },
	{
		labelKey: 'menu.users',
		items: [
			{ labelKey: 'menu.users', link: '/users' },
			{ labelKey: 'menu.groups', link: '/groups' },
		],
	},
	{
		labelKey: 'menu.organizations',
		items: [
			{ labelKey: 'menu.organizations', link: '/organizations' },
			{ labelKey: 'menu.organizationalUnits', link: '/org-units' },
		],
	},
	{
		labelKey: 'menu.authorization',
		items: [
			{ labelKey: 'menu.roles', link: '/roles' },
		],
	},
];

export function buildIdentityMenu(slug: string): MenuContribution {
	return { slug, translationNs: IAM_MODULE, items: ITEMS };
}
