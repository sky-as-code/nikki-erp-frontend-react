import { IAM_MODULE } from './constants';

import type { RibbonMenuContribution, RibbonTab } from '@nikkierp/ui/menu';


/**
 * Menu entries carry i18n keys, not labels: the contribution is registered from the
 * bundle's `init`, which runs outside React and possibly before the namespace loads.
 * The Shell resolves them against `translationNs` at render time.
 *
 * Organizational units has no entry until it has a page: the old menu linked it to `/org-units`,
 * a route nothing serves.
 */
const TABS: RibbonTab[] = [
	{
		labelKey: 'menu.identity',
		blocks: [
			{
				titleKey: 'menu.users',
				items: [
					{ labelKey: 'menu.users', link: '/iam_user' },
					{ labelKey: 'menu.groups', link: '/iam_group' },
				],
			},
			{
				titleKey: 'menu.organizations',
				items: [
					{ labelKey: 'menu.organizations', link: '/iam_org' },
				],
			},
		],
	},
	{
		labelKey: 'menu.authorization',
		blocks: [
			{
				titleKey: 'menu.roles',
				items: [
					{ labelKey: 'menu.roles', link: '/iam_role' },
				],
			},
		],
	},
];

export function buildIdentityMenu(slug: string): RibbonMenuContribution {
	return { slug, translationNs: IAM_MODULE, type: 'ribbon', tabs: TABS };
}
