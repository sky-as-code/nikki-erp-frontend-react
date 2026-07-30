import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys are fully qualified against the `common` namespace, as they were when this
 * menu was built with a bare `useTranslation()`.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'nikki.authorize.menu.overview', link: '/overview' },
	{
		labelKey: 'nikki.authorize.menu.resources_actions',
		items: [
			{ labelKey: 'nikki.authorize.menu.resources', link: '/resources' },
			{ labelKey: 'nikki.authorize.menu.actions', link: '/actions' },
			{ labelKey: 'nikki.authorize.menu.entitlements', link: '/entitlements' },
		],
	},
	{
		labelKey: 'nikki.authorize.menu.roles',
		items: [
			{ labelKey: 'nikki.authorize.menu.roles', link: '/roles' },
			{ labelKey: 'nikki.authorize.menu.role_suites', link: '/role-suites' },
		],
	},
	{
		labelKey: 'nikki.authorize.menu.requests',
		items: [
			{ labelKey: 'nikki.authorize.menu.grant_requests', link: '/grant-requests' },
			{ labelKey: 'nikki.authorize.menu.revoke_requests', link: '/revoke-requests' },
		],
	},
];

export function buildAuthorizeMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'common', items: ITEMS };
}
