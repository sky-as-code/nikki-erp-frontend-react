import { MantineProvider } from '@mantine/core';
import { ACTIONS, RESOURCES } from '@nikkierp/shell/userContext';
import { useSetMenuBarItems } from '@nikkierp/ui/appState';
import { PermissionGuard } from '@nikkierp/ui/components';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext, useMicroAppDispatch,
	MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { useMenuBarItems } from './hooks';
import { ActionCreatePage } from './pages/actions/ActionCreatePage';
import { ActionDetailPage } from './pages/actions/ActionDetailPage';
import { ActionListPage } from './pages/actions/ActionListPage';
import { EntitlementCreatePage } from './pages/entitlements/EntitlementCreatePage';
import { EntitlementDetailPage } from './pages/entitlements/EntitlementDetailPage';
import { EntitlementListPage } from './pages/entitlements/EntitlementListPage';
import { GrantRequestCreatePage } from './pages/grantRequests/GrantRequestCreatePage';
import { GrantRequestDetailPage } from './pages/grantRequests/GrantRequestDetailPage';
import { GrantRequestListPage } from './pages/grantRequests/GrantRequestListPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import { ResourceCreatePage } from './pages/resources/ResourceCreatePage';
import { ResourceDetailPage } from './pages/resources/ResourceDetailPage';
import { ResourceListPage } from './pages/resources/ResourceListPage';
import { RevokeRequestCreatePage } from './pages/revokeRequests/RevokeRequestCreatePage';
import { RevokeRequestDetailPage } from './pages/revokeRequests/RevokeRequestDetailPage';
import { RevokeRequestListPage } from './pages/revokeRequests/RevokeRequestListPage';
import { RoleAddEntitlementsPage } from './pages/roles/RoleAddEntitlementsPage';
import { RoleCreatePage } from './pages/roles/RoleCreatePage';
import { RoleDetailPage } from './pages/roles/RoleDetailPage';
import { RoleListPage } from './pages/roles/RoleListPage';
import { RoleRemoveEntitlementsPage } from './pages/roles/RoleRemoveEntitlementsPage';
import { RoleSuiteCreatePage } from './pages/roleSuites/RoleSuiteCreatePage';
import { RoleSuiteDetailPage } from './pages/roleSuites/RoleSuiteDetailPage';
import { RoleSuiteListPage } from './pages/roleSuites/RoleSuiteListPage';


function Main(props: MicroAppProps) {
	const dispatch = useMicroAppDispatch();
	const menuBarItems = useMenuBarItems();
	useSetMenuBarItems(menuBarItems, dispatch);

	return (
		<MicroAppProvider {...props}>
			<MantineProvider>
				<MicroAppRouter
					domType={props.domType}
					basePath={props.routing.basePath}
					widgetName={props.widgetName}
					widgetProps={props.widgetProps}
				>
					<AppRoutes>
						<AppRoute index element={<Navigate to='overview' replace />} />
						<AppRoute path='overview' element={<PermissionGuard resource={RESOURCES.AUTHZ_RESOURCE} action={ACTIONS.VIEW}><OverviewPage /></PermissionGuard>} />
						{/* Resource routes */}
						<AppRoute path='resources' element={<PermissionGuard resource={RESOURCES.AUTHZ_RESOURCE} action={ACTIONS.VIEW}><ResourceListPage /></PermissionGuard>} />
						<AppRoute path='resources/create' element={<PermissionGuard resource={RESOURCES.AUTHZ_RESOURCE} action={ACTIONS.CREATE}><ResourceCreatePage /></PermissionGuard>} />
						<AppRoute path='resources/:resourceName' element={<PermissionGuard resource={RESOURCES.AUTHZ_RESOURCE} action={ACTIONS.VIEW}><ResourceDetailPage /></PermissionGuard>} />
						{/* Action routes */}
						<AppRoute path='actions' element={<PermissionGuard resource={RESOURCES.AUTHZ_ACTION} action={ACTIONS.VIEW}><ActionListPage /></PermissionGuard>} />
						<AppRoute path='actions/create' element={<PermissionGuard resource={RESOURCES.AUTHZ_ACTION} action={ACTIONS.CREATE}><ActionCreatePage /></PermissionGuard>} />
						<AppRoute path='actions/:actionId' element={<PermissionGuard resource={RESOURCES.AUTHZ_ACTION} action={ACTIONS.VIEW}><ActionDetailPage /></PermissionGuard>} />
						{/* Entitlement routes */}
						<AppRoute path='entitlements' element={<PermissionGuard resource={RESOURCES.AUTHZ_ENTITLEMENT} action={ACTIONS.VIEW}><EntitlementListPage /></PermissionGuard>} />
						<AppRoute path='entitlements/create' element={<PermissionGuard resource={RESOURCES.AUTHZ_ENTITLEMENT} action={ACTIONS.CREATE}><EntitlementCreatePage /></PermissionGuard>} />
						<AppRoute path='entitlements/:entitlementId' element={<PermissionGuard resource={RESOURCES.AUTHZ_ENTITLEMENT} action={ACTIONS.VIEW}><EntitlementDetailPage /></PermissionGuard>} />
						{/* Role routes */}
						<AppRoute path='roles' element={<PermissionGuard resource={RESOURCES.AUTHZ_ROLE} action={ACTIONS.VIEW}><RoleListPage /></PermissionGuard>} />
						<AppRoute path='roles/create' element={<PermissionGuard resource={RESOURCES.AUTHZ_ROLE} action={ACTIONS.CREATE}><RoleCreatePage /></PermissionGuard>} />
						<AppRoute path='roles/:roleId' element={<PermissionGuard resource={RESOURCES.AUTHZ_ROLE} action={ACTIONS.VIEW}><RoleDetailPage /></PermissionGuard>} />
						<AppRoute path='roles/:roleId/add-entitlements' element={<PermissionGuard resource={RESOURCES.AUTHZ_ROLE} action={ACTIONS.UPDATE}><RoleAddEntitlementsPage /></PermissionGuard>} />
						<AppRoute path='roles/:roleId/remove-entitlements' element={<PermissionGuard resource={RESOURCES.AUTHZ_ROLE} action={ACTIONS.UPDATE}><RoleRemoveEntitlementsPage /></PermissionGuard>} />
						{/* RoleSuite routes */}
						<AppRoute path='role-suites' element={<PermissionGuard resource={RESOURCES.AUTHZ_ROLE_SUITE} action={ACTIONS.VIEW}><RoleSuiteListPage /></PermissionGuard>} />
						<AppRoute path='role-suites/create' element={<PermissionGuard resource={RESOURCES.AUTHZ_ROLE_SUITE} action={ACTIONS.CREATE}><RoleSuiteCreatePage /></PermissionGuard>} />
						<AppRoute path='role-suites/:roleSuiteId' element={<PermissionGuard resource={RESOURCES.AUTHZ_ROLE_SUITE} action={ACTIONS.VIEW}><RoleSuiteDetailPage /></PermissionGuard>} />
						{/* GrantRequest routes */}
						<AppRoute path='grant-requests' element={<PermissionGuard resource={RESOURCES.AUTHZ_GRANT_REQUEST} action={ACTIONS.VIEW}><GrantRequestListPage /></PermissionGuard>} />
						<AppRoute path='grant-requests/create' element={<PermissionGuard resource={RESOURCES.AUTHZ_GRANT_REQUEST} action={ACTIONS.CREATE}><GrantRequestCreatePage /></PermissionGuard>} />
						<AppRoute path='grant-requests/:grantRequestId' element={<PermissionGuard resource={RESOURCES.AUTHZ_GRANT_REQUEST} action={ACTIONS.VIEW}><GrantRequestDetailPage /></PermissionGuard>} />
						{/* RevokeRequest routes */}
						<AppRoute path='revoke-requests' element={<PermissionGuard resource={RESOURCES.AUTHZ_REVOKE_REQUEST} action={ACTIONS.VIEW}><RevokeRequestListPage /></PermissionGuard>} />
						<AppRoute path='revoke-requests/create' element={<PermissionGuard resource={RESOURCES.AUTHZ_REVOKE_REQUEST} action={ACTIONS.CREATE}><RevokeRequestCreatePage /></PermissionGuard>} />
						<AppRoute path='revoke-requests/:revokeRequestId' element={<PermissionGuard resource={RESOURCES.AUTHZ_REVOKE_REQUEST} action={ACTIONS.VIEW}><RevokeRequestDetailPage /></PermissionGuard>} />
					</AppRoutes>
					<WidgetRoutes>
					</WidgetRoutes>
				</MicroAppRouter>
			</MantineProvider>
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, registerReducer }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);
		return {
			domType,
		};
	},
};

export default bundle;
