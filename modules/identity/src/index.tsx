import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { ACTIONS, RESOURCES } from '@nikkierp/shell/userContext';
import { useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { PermissionGuard } from '@nikkierp/ui/components';
import { initMicroAppStateContext, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter,
} from '@nikkierp/ui/microApp';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { useMenuBarItems, useOrgScopeRef } from './hooks';
import { GroupCreatePage } from './pages/group/GroupCreatePage';
import { GroupDetailPage } from './pages/group/GroupDetailPage';
import { GroupListPage } from './pages/group/GroupListPage';
import { HierarchyCreatePage } from './pages/hierarchy/HierarchyCreatePage';
import { HierarchyDetailPage } from './pages/hierarchy/HierarchyDetailPage';
import { HierarchyListPage } from './pages/hierarchy/HierarchyListPage';
import { OrganizationCreatePage } from './pages/organization/OrganizationCreatePage';
import { OrganizationDetailPage } from './pages/organization/OrganizationDetailPage';
import { OrganizationListPage } from './pages/organization/OrganizationListPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import { UserCreatePage } from './pages/user/UserCreatePage';
import { UserDetailPage } from './pages/user/UserDetailPage';
import { UserListPage } from './pages/user/UserListPage';


function Main(props: MicroAppProps) {
	const orgScopeRef = useOrgScopeRef();
	const { orgSlug } = useActiveOrgModule();
	const isGlobalContext = orgSlug === GLOBAL_CONTEXT_SLUG;
	const orgContextScope = !isGlobalContext
		? { scopeType: 'org' as const, scopeRef: orgScopeRef ?? '' }
		: undefined;
	const dispatch = useMicroAppDispatch();
	const menuBarItems = useMenuBarItems(orgContextScope);
	useSetMenuBarItems(menuBarItems, dispatch);

	return (
		<MicroAppProvider {...props}>
			<MicroAppRouter
				domType={props.domType}
				basePath={props.routing.basePath}
				widgetName={props.widgetName}
				widgetProps={props.widgetProps}
			>
				<AppRoutes>
					<AppRoute index element={<Navigate to='overview' replace />} />
					<AppRoute path='overview' element={<OverviewPage />} />
					{/* Users routes */}
					<AppRoute path='users' element={<PermissionGuard resource={RESOURCES.IDENTITY_USER} action={ACTIONS.VIEW} contextScope={orgContextScope}><UserListPage /></PermissionGuard>} />
					<AppRoute path='users/create' element={<PermissionGuard resource={RESOURCES.IDENTITY_USER} action={ACTIONS.CREATE} contextScope={orgContextScope}><UserCreatePage /></PermissionGuard>} />
					<AppRoute path='users/:userId' element={<PermissionGuard resource={RESOURCES.IDENTITY_USER} action={ACTIONS.VIEW} contextScope={orgContextScope}><UserDetailPage /></PermissionGuard>} />
					{/* Groups routes */}
					<AppRoute path='groups' element={<PermissionGuard resource={RESOURCES.IDENTITY_GROUP} action={ACTIONS.VIEW} contextScope={orgContextScope}><GroupListPage /></PermissionGuard>} />
					<AppRoute path='groups/create' element={<PermissionGuard resource={RESOURCES.IDENTITY_GROUP} action={ACTIONS.CREATE} contextScope={orgContextScope}><GroupCreatePage /></PermissionGuard>} />
					<AppRoute path='groups/:groupId' element={<PermissionGuard resource={RESOURCES.IDENTITY_GROUP} action={ACTIONS.VIEW} contextScope={orgContextScope}><GroupDetailPage /></PermissionGuard>} />
					{/* Organizations routes (domain-only; deny in org context by forcing org scope) */}
					<AppRoute path='organizations' element={<PermissionGuard resource={RESOURCES.IDENTITY_ORGANIZATION} action={ACTIONS.VIEW} contextScope={orgContextScope}><OrganizationListPage /></PermissionGuard>} />
					<AppRoute path='organizations/:slug' element={<PermissionGuard resource={RESOURCES.IDENTITY_ORGANIZATION} action={ACTIONS.VIEW} contextScope={orgContextScope}><OrganizationDetailPage /></PermissionGuard>} />
					<AppRoute path='organizations/create' element={<PermissionGuard resource={RESOURCES.IDENTITY_ORGANIZATION} action={ACTIONS.CREATE} contextScope={orgContextScope}><OrganizationCreatePage /></PermissionGuard>} />
					{/* Hierarchy levels routes */}
					<AppRoute path='hierarchy-levels' element={<PermissionGuard resource={RESOURCES.IDENTITY_HIERARCHY_LEVEL} action={ACTIONS.VIEW} contextScope={orgContextScope}><HierarchyListPage /></PermissionGuard>} />
					<AppRoute path='hierarchy-levels/create' element={<PermissionGuard resource={RESOURCES.IDENTITY_HIERARCHY_LEVEL} action={ACTIONS.CREATE} contextScope={orgContextScope}><HierarchyCreatePage /></PermissionGuard>} />
					<AppRoute path='hierarchy-levels/:hierarchyId' element={<PermissionGuard resource={RESOURCES.IDENTITY_HIERARCHY_LEVEL} action={ACTIONS.VIEW} contextScope={orgContextScope}><HierarchyDetailPage /></PermissionGuard>} />
				</AppRoutes>
				{/* <WidgetRoutes>
						<WidgetRoute name='org-home' Component={OrgHomePage} />
						<WidgetRoute name='module-management' Component={ModuleManagementPage} />
					</WidgetRoutes> */}
			</MicroAppRouter>
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
