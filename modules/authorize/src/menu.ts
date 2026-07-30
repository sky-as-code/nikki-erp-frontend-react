import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys live in the `iam` namespace, which already carries every one of these.
 * The previous hook asked for `nikki.authorize.menu.*` in `common` with no
 * default value, so the bar rendered raw key names.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'menu.overview', link: '/overview' },
	{
		labelKey: 'menu.resources_actions',
		items: [
			{ labelKey: 'menu.resources', link: '/resources' },
			{ labelKey: 'menu.actions', link: '/actions' },
			{ labelKey: 'menu.entitlements', link: '/entitlements' },
		],
	},
	{
		labelKey: 'menu.roles',
		items: [
			{ labelKey: 'menu.roles', link: '/roles' },
			{ labelKey: 'menu.role_suites', link: '/role-suites' },
		],
	},
	{
		labelKey: 'menu.requests',
		items: [
			{ labelKey: 'menu.grant_requests', link: '/grant-requests' },
			{ labelKey: 'menu.revoke_requests', link: '/revoke-requests' },
		],
	},
];

export function buildAuthorizeMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'iam', items: ITEMS };
}
