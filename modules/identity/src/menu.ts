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
			{ labelKey: 'menu.users', link: '/iam_user' },
			{ labelKey: 'menu.groups', link: '/iam_group' },
		],
	},
	{
		labelKey: 'menu.organizations',
		items: [
			{ labelKey: 'menu.organizations', link: '/iam_org' },
			{ labelKey: 'menu.organizationalUnits', link: '/org-units' },
		],
	},
	{
		labelKey: 'menu.authorization',
		items: [
			{ labelKey: 'menu.roles', link: '/iam_role' },
		],
	},
];

export function buildIdentityMenu(slug: string): MenuContribution {
	return { slug, translationNs: IAM_MODULE, items: ITEMS };
}
