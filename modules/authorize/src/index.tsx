import { MantineProvider } from '@mantine/core';
import { PermissionGuard } from '@nikkierp/ui/components';
import { MenuIndexRedirect } from '@nikkierp/ui/menu';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext,
	MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';

import { reducer } from './appState';
import { buildAuthorizeMenu } from './menu';
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
import { authzRequirement } from './permissions';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MantineProvider defaultColorScheme='auto'>
				<MicroAppRouter
					domType={props.domType}
					basePath={props.routing.basePath}
					widgetName={props.widgetName}
					widgetProps={props.widgetProps}
				>
					<AppRoutes>
						<AppRoute index element={<MenuIndexRedirect items={buildAuthorizeMenu(props.slug).items} />} />
						<AppRoute path='overview' element={<OverviewPage />} />
						{/* Resource routes */}
						<AppRoute path='resources' element={<PermissionGuard requires={[authzRequirement('resource', 'view')]}><ResourceListPage /></PermissionGuard>} />
						<AppRoute path='resources/create' element={<PermissionGuard requires={[authzRequirement('resource', 'create')]}><ResourceCreatePage /></PermissionGuard>} />
						<AppRoute path='resources/:resourceName' element={<PermissionGuard requires={[authzRequirement('resource', 'view')]}><ResourceDetailPage /></PermissionGuard>} />
						{/* Action routes */}
						<AppRoute path='actions' element={<PermissionGuard requires={[authzRequirement('action', 'view')]}><ActionListPage /></PermissionGuard>} />
						<AppRoute path='actions/create' element={<PermissionGuard requires={[authzRequirement('action', 'create')]}><ActionCreatePage /></PermissionGuard>} />
						<AppRoute path='actions/:actionId' element={<PermissionGuard requires={[authzRequirement('action', 'view')]}><ActionDetailPage /></PermissionGuard>} />
						{/* Entitlement routes */}
						<AppRoute path='entitlements' element={<PermissionGuard requires={[authzRequirement('entitlement', 'view')]}><EntitlementListPage /></PermissionGuard>} />
						<AppRoute path='entitlements/create' element={<PermissionGuard requires={[authzRequirement('entitlement', 'create')]}><EntitlementCreatePage /></PermissionGuard>} />
						<AppRoute path='entitlements/:entitlementId' element={<PermissionGuard requires={[authzRequirement('entitlement', 'view')]}><EntitlementDetailPage /></PermissionGuard>} />
						{/* Role routes */}
						<AppRoute path='roles' element={<PermissionGuard requires={[authzRequirement('role', 'view')]}><RoleListPage /></PermissionGuard>} />
						<AppRoute path='roles/create' element={<PermissionGuard requires={[authzRequirement('role', 'create')]}><RoleCreatePage /></PermissionGuard>} />
						<AppRoute path='roles/:roleId' element={<PermissionGuard requires={[authzRequirement('role', 'view')]}><RoleDetailPage /></PermissionGuard>} />
						<AppRoute path='roles/:roleId/add-entitlements' element={<PermissionGuard requires={[authzRequirement('role', 'addEntitlement')]}><RoleAddEntitlementsPage /></PermissionGuard>} />
						<AppRoute path='roles/:roleId/remove-entitlements' element={<PermissionGuard requires={[authzRequirement('role', 'removeEntitlement')]}><RoleRemoveEntitlementsPage /></PermissionGuard>} />
						{/* RoleSuite routes */}
						<AppRoute path='role-suites' element={<PermissionGuard requires={[authzRequirement('roleSuite', 'view')]}><RoleSuiteListPage /></PermissionGuard>} />
						<AppRoute path='role-suites/create' element={<PermissionGuard requires={[authzRequirement('roleSuite', 'create')]}><RoleSuiteCreatePage /></PermissionGuard>} />
						<AppRoute path='role-suites/:roleSuiteId' element={<PermissionGuard requires={[authzRequirement('roleSuite', 'view')]}><RoleSuiteDetailPage /></PermissionGuard>} />
						{/* GrantRequest routes */}
						<AppRoute path='grant-requests' element={<PermissionGuard requires={[authzRequirement('grantRequest', 'view')]}><GrantRequestListPage /></PermissionGuard>} />
						<AppRoute path='grant-requests/create' element={<PermissionGuard requires={[authzRequirement('grantRequest', 'create')]}><GrantRequestCreatePage /></PermissionGuard>} />
						<AppRoute path='grant-requests/:grantRequestId' element={<PermissionGuard requires={[authzRequirement('grantRequest', 'view')]}><GrantRequestDetailPage /></PermissionGuard>} />
						{/* RevokeRequest routes */}
						<AppRoute path='revoke-requests' element={<PermissionGuard requires={[authzRequirement('revokeRequest', 'view')]}><RevokeRequestListPage /></PermissionGuard>} />
						<AppRoute path='revoke-requests/create' element={<PermissionGuard requires={[authzRequirement('revokeRequest', 'create')]}><RevokeRequestCreatePage /></PermissionGuard>} />
						<AppRoute path='revoke-requests/:revokeRequestId' element={<PermissionGuard requires={[authzRequirement('revokeRequest', 'view')]}><RevokeRequestDetailPage /></PermissionGuard>} />
					</AppRoutes>
					<WidgetRoutes>
					</WidgetRoutes>
				</MicroAppRouter>
			</MantineProvider>
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, slug, registerReducer, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);
		host.menuRegistry.register(buildAuthorizeMenu(slug));
		return {
			domType,
		};
	},
};

export default bundle;
