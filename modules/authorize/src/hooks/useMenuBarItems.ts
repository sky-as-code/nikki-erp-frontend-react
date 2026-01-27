import { RESOURCES } from '@nikkierp/shell/userContext';
import { useHasAnyPermission } from '@nikkierp/shell/userContext';
import { MenuBarItem } from '@nikkierp/ui/appState/layoutSlice';
import { useTranslation } from 'react-i18next';


// eslint-disable-next-line max-lines-per-function
export function useMenuBarItems(): MenuBarItem[] {
	const { t: translate } = useTranslation();
	const hasResourceAccess = useHasAnyPermission(RESOURCES.AUTHZ_RESOURCE);
	const hasActionAccess = useHasAnyPermission(RESOURCES.AUTHZ_ACTION);
	const hasEntitlementAccess = useHasAnyPermission(RESOURCES.AUTHZ_ENTITLEMENT);
	const hasRoleAccess = useHasAnyPermission(RESOURCES.AUTHZ_ROLE);
	const hasRoleSuiteAccess = useHasAnyPermission(RESOURCES.AUTHZ_ROLE_SUITE);
	const hasGrantRequestAccess = useHasAnyPermission(RESOURCES.AUTHZ_GRANT_REQUEST);
	const hasRevokeRequestAccess = useHasAnyPermission(RESOURCES.AUTHZ_REVOKE_REQUEST);

	const items: MenuBarItem[] = [];

	items.push({
		label: translate('nikki.authorize.menu.overview'),
		link: '/overview',
	});

	const resourcesActionsItems: MenuBarItem[] = [];
	if (hasResourceAccess) {
		resourcesActionsItems.push({
			label: translate('nikki.authorize.menu.resources'),
			link: '/resources',
		});
	}
	if (hasActionAccess) {
		resourcesActionsItems.push({
			label: translate('nikki.authorize.menu.actions'),
			link: '/actions',
		});
	}
	if (hasEntitlementAccess) {
		resourcesActionsItems.push({
			label: translate('nikki.authorize.menu.entitlements'),
			link: '/entitlements',
		});
	}
	if (resourcesActionsItems.length > 0) {
		items.push({
			label: translate('nikki.authorize.menu.resources_actions'),
			items: resourcesActionsItems,
		});
	}

	const rolesItems: MenuBarItem[] = [];
	if (hasRoleAccess) {
		rolesItems.push({
			label: translate('nikki.authorize.menu.roles'),
			link: '/roles',
		});
	}
	if (hasRoleSuiteAccess) {
		rolesItems.push({
			label: translate('nikki.authorize.menu.role_suites'),
			link: '/role-suites',
		});
	}
	if (rolesItems.length > 0) {
		items.push({
			label: translate('nikki.authorize.menu.roles'),
			items: rolesItems,
		});
	}

	const requestsItems: MenuBarItem[] = [];
	if (hasGrantRequestAccess) {
		requestsItems.push({
			label: translate('nikki.authorize.menu.grant_requests'),
			link: '/grant-requests',
		});
	}
	if (hasRevokeRequestAccess) {
		requestsItems.push({
			label: translate('nikki.authorize.menu.revoke_requests'),
			link: '/revoke-requests',
		});
	}
	if (requestsItems.length > 0) {
		items.push({
			label: translate('nikki.authorize.menu.requests'),
			items: requestsItems,
		});
	}

	return items;
}